from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.preferences import UserPreferences
from app.utils.dependencies import get_current_user
from app.models.user import User
from tavily import TavilyClient
from groq import Groq
import json
import os

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Message]] = []

class RestaurantRecommendation(BaseModel):
    id: int
    name: str
    cuisine: str
    city: str
    address: str
    average_rating: float
    review_count: int
    description: Optional[str] = None
    pricing_tier: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    recommendations: Optional[List[RestaurantRecommendation]] = []

@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Load user preferences
    prefs = db.query(UserPreferences).filter(UserPreferences.user_id == current_user.id).first()
    prefs_text = ""
    if prefs:
        prefs_text = f"""
User Preferences:
- Favorite cuisines: {prefs.cuisines or 'No preference'}
- Price range: {prefs.price_range or 'No preference'}
- Dietary needs: {prefs.dietary_needs or 'None'}
- Preferred ambiance: {prefs.ambiance or 'No preference'}
- Location: {prefs.location or 'San Jose'}
- Sort by: {prefs.sort_by or 'rating'}
"""

    # 2. Get all restaurants from DB
    restaurants = db.query(Restaurant).all()
    restaurants_text = "Available restaurants:\n"
    for r in restaurants:
        restaurants_text += f"- ID:{r.id} {r.name} ({r.cuisine}, {r.city}) | Rating: {r.average_rating or 0} | Price tier: {r.pricing_tier or 'N/A'} | {r.description or ''}\n"

    # 3. Tavily web search
    tavily_context = ""
    try:
        tavily = TavilyClient(api_key=TAVILY_API_KEY)
        search_result = tavily.search(
            query=f"best restaurants San Jose CA {request.message}",
            max_results=3
        )
        if search_result and search_result.get("results"):
            tavily_context = "\nWeb context:\n"
            for r in search_result["results"][:3]:
                tavily_context += f"- {r.get('title', '')}: {r.get('content', '')[:150]}\n"
    except Exception:
        tavily_context = ""

    # 4. Build messages
    system_prompt = f"""You are a helpful restaurant recommendation assistant for a Yelp-like platform.
Recommend restaurants based on user queries and their preferences.

{prefs_text}
{restaurants_text}
{tavily_context}

Instructions:
- Recommend restaurants from the database that match the user's query
- Be conversational and friendly
- Explain WHY you recommend each restaurant
- At the end of your response add: RECOMMENDATIONS_JSON: [{{"id": 1}}, {{"id": 2}}]
- Support follow-up questions
"""

    messages = [{"role": "system", "content": system_prompt}]
    for msg in request.conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    # 5. Call Groq
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=800
    )
    response_text = response.choices[0].message.content

    # 6. Extract restaurant recommendations
    recommended_restaurants = []
    if "RECOMMENDATIONS_JSON:" in response_text:
        try:
            json_part = response_text.split("RECOMMENDATIONS_JSON:")[1].strip()
            json_str = json_part.split("\n")[0].strip()
            rec_ids = json.loads(json_str)
            id_list = [r["id"] for r in rec_ids]
            db_recs = db.query(Restaurant).filter(Restaurant.id.in_(id_list)).all()
            for r in db_recs:
                recommended_restaurants.append(RestaurantRecommendation(
                    id=r.id,
                    name=r.name,
                    cuisine=r.cuisine or "",
                    city=r.city or "",
                    address=r.address or "",
                    average_rating=r.average_rating or 0,
                    review_count=r.review_count or 0,
                    description=r.description,
                    pricing_tier=r.pricing_tier
                ))
            response_text = response_text.split("RECOMMENDATIONS_JSON:")[0].strip()
        except Exception:
            pass

    return ChatResponse(response=response_text, recommendations=recommended_restaurants)