from typing import List, Optional
import json
import os
import re

from fastapi import APIRouter, Depends, HTTPException
from groq import Groq
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from tavily import TavilyClient

from app.database import db, sanitize_document
from app.utils.dependencies import get_current_reviewer

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

CUISINE_KEYWORDS = [
    "italian", "chinese", "mexican", "indian", "japanese",
    "american", "thai", "french", "korean", "mediterranean",
    "vietnamese", "greek", "spanish", "caribbean", "middle eastern",
]

PRICE_TOKENS = {
    "$$$$": "$$$$", "$$$": "$$$", "$$": "$$", "$": "$",
    "expensive": "$$$", "cheap": "$", "affordable": "$",
    "mid-range": "$$", "moderate": "$$", "budget": "$",
    "upscale": "$$$$", "fine dining": "$$$$", "splurge": "$$$$"
}

AMBIANCE_TOKENS = [
    "romantic", "casual", "family", "cozy", "trendy", "outdoor",
    "lively", "quiet", "sports", "fine dining", "date", "anniversary",
    "birthday", "celebration", "special occasion",
]

DIETARY_TOKENS = [
    "vegan", "vegetarian", "halal", "gluten-free", "kosher",
    "dairy-free", "nut-free", "pescatarian", "organic",
]


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
    pricing_tier: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    recommendations: Optional[List[RestaurantRecommendation]] = []


def _extract_cuisine(text: str) -> Optional[str]:
    lowered = text.lower()
    for cuisine in CUISINE_KEYWORDS:
        if cuisine in lowered:
            return cuisine.title()
    return None


def _extract_price(text: str) -> Optional[str]:
    lowered = text.lower()
    for token, val in PRICE_TOKENS.items():
        if token in lowered:
            return val
    return None


def _extract_ambiance(text: str) -> list[str]:
    lowered = text.lower()
    return [item for item in AMBIANCE_TOKENS if item in lowered]


def _extract_dietary(text: str) -> list[str]:
    lowered = text.lower()
    return [item for item in DIETARY_TOKENS if item in lowered]


def _normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (name or "").lower()).strip()


def _build_rec(restaurant: dict) -> RestaurantRecommendation:
    return RestaurantRecommendation(
        id=restaurant["id"],
        name=restaurant.get("name", ""),
        cuisine=restaurant.get("cuisine") or "",
        city=restaurant.get("city") or "",
        address=restaurant.get("address") or "",
        average_rating=restaurant.get("average_rating") or 0,
        review_count=restaurant.get("review_count") or 0,
        description=restaurant.get("description"),
        pricing_tier=restaurant.get("pricing_tier"),
    )


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_reviewer),
):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")
    groq_client = Groq(api_key=groq_api_key)

    prefs = sanitize_document(db.user_preferences.find_one({"user_id": current_user["id"]}))

    saved_cuisines = (prefs.get("cuisines") or "") if prefs else ""
    saved_price = (prefs.get("price_range") or "") if prefs else ""
    saved_dietary = (prefs.get("dietary_needs") or "") if prefs else ""
    saved_ambiance = (prefs.get("ambiance") or "") if prefs else ""
    saved_location = (prefs.get("location") or "San Jose") if prefs else "San Jose"
    saved_sort = (prefs.get("sort_by") or "rating") if prefs else "rating"

    prefs_block = f"""User's Saved Preferences:
- Cuisines: {saved_cuisines or 'No preference'}
- Price range: {saved_price or 'No preference'}
- Dietary needs: {saved_dietary or 'None'}
- Ambiance: {saved_ambiance or 'No preference'}
- Location: {saved_location}
- Sort by: {saved_sort}"""

    msg = request.message
    msg_norm = _normalize(msg)

    q_cuisine = _extract_cuisine(msg)
    q_price = _extract_price(msg)
    q_ambiance = _extract_ambiance(msg)
    q_dietary = _extract_dietary(msg)

    target_cuisine = q_cuisine or (saved_cuisines.split(",")[0].strip() if saved_cuisines else None)
    target_price = q_price or (saved_price if saved_price else None)
    target_ambiance = q_ambiance or ([a.strip() for a in saved_ambiance.split(",") if a.strip()] if saved_ambiance else [])
    target_dietary = q_dietary or ([d.strip() for d in saved_dietary.split(",") if d.strip()] if saved_dietary else [])

    all_restaurants = [sanitize_document(r) for r in db.restaurants.find({})]

    scored: list[tuple[float, dict]] = []
    for restaurant in all_restaurants:
        score = 0.0
        text_blob = ((restaurant.get("amenities") or "") + " " + (restaurant.get("description") or "")).lower()

        normalized_name = _normalize(restaurant.get("name", ""))
        if normalized_name and normalized_name in msg_norm:
            score += 50

        cuisine = restaurant.get("cuisine") or ""
        if target_cuisine and target_cuisine.lower() in cuisine.lower():
            score += 20

        if target_price and (restaurant.get("pricing_tier") or "") == target_price:
            score += 10

        if target_ambiance:
            amb_hits = sum(1 for token in target_ambiance if token in text_blob)
            score += amb_hits * 8

        if target_dietary:
            diet_hits = sum(1 for token in target_dietary if token in text_blob)
            score += diet_hits * 8

        score += (restaurant.get("average_rating") or 0)
        score += min((restaurant.get("review_count") or 0) / 10, 3)

        scored.append((score, restaurant))

    scored.sort(key=lambda item: item[0], reverse=True)
    candidates = [restaurant for _, restaurant in scored[:15]]
    if not candidates:
        candidates = all_restaurants[:10]

    db_context = "Restaurant Database (recommend ONLY from this list):\n"
    for restaurant in candidates:
        stars = f"{restaurant.get('average_rating', 0):.1f}★"
        db_context += (
            f"- [ID:{restaurant['id']}] {restaurant.get('name', '')} | {restaurant.get('cuisine', 'N/A')} | "
            f"{restaurant.get('city', 'N/A')} | {stars} ({restaurant.get('review_count', 0)} reviews) | "
            f"Price: {restaurant.get('pricing_tier', 'N/A')} | "
            f"{(restaurant.get('description', '') or '')[:120]}\n"
        )

    tavily_context = ""
    try:
        if TAVILY_API_KEY:
            tavily = TavilyClient(api_key=TAVILY_API_KEY)
            search_result = tavily.search(
                query=f"restaurants {saved_location} {msg}",
                max_results=3,
            )
            if search_result and search_result.get("results"):
                tavily_context = "\nAdditional web context (use only as supporting info, do NOT recommend restaurants not in the database list above):\n"
                for item in search_result["results"][:3]:
                    tavily_context += f"- {item.get('title', '')}: {item.get('content', '')[:120]}\n"
    except Exception:
        tavily_context = ""

    prompt = ChatPromptTemplate.from_template(
        """You are a friendly, helpful restaurant recommendation assistant for a Yelp-style platform.

{prefs_block}

{db_context}
{tavily_context}

RULES (follow strictly):
1. ONLY recommend restaurants from the "Restaurant Database" list above. NEVER invent or mention restaurants not in that list.
2. The user's current query is the PRIMARY intent. Use saved preferences as fallback context only when the query is vague.
3. Format each recommendation as a numbered list item:
   Name (Rating★, Price) - "Brief reason why this matches"
4. Provide 1-5 recommendations depending on how many match.
5. Always explain WHY each restaurant is recommended.
6. Do NOT show internal IDs in your response text. IDs are only for the JSON block.
7. At the very end of your message, on its own line, output exactly:
   RECOMMENDATIONS_JSON: [{{"id": 1}}, {{"id": 2}}]
8. Be conversational and warm, not robotic. Keep responses concise and helpful.
9. Support follow-up questions.
10. If NO restaurants match, say so honestly and suggest broadening criteria.
"""
    )

    system_prompt = StrOutputParser().invoke(
        prompt.format(
            prefs_block=prefs_block,
            db_context=db_context,
            tavily_context=tavily_context,
        )
    )

    messages = [{"role": "system", "content": system_prompt}]
    for prev in request.conversation_history:
        messages.append({"role": prev.role, "content": prev.content})
    messages.append({"role": "user", "content": msg})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=800,
        )
    except Exception as exc:
        err = str(exc).lower()
        if "invalid_api_key" in err or "authentication" in err:
            raise HTTPException(status_code=502, detail="Groq authentication failed. Check GROQ_API_KEY.")
        raise HTTPException(status_code=502, detail="AI service unavailable. Please try again.")

    response_text = completion.choices[0].message.content or ""

    recommended: list[RestaurantRecommendation] = []
    allowed_ids = {restaurant["id"] for restaurant in candidates}

    if "RECOMMENDATIONS_JSON:" in response_text:
        try:
            json_part = response_text.split("RECOMMENDATIONS_JSON:")[1].strip()
            json_str = json_part.split("\n")[0].strip()
            rec_ids = json.loads(json_str)
            id_list = [item["id"] for item in rec_ids if isinstance(item, dict) and "id" in item]
            id_list = [rec_id for rec_id in id_list if rec_id in allowed_ids]
            db_recs = [
                sanitize_document(doc)
                for doc in db.restaurants.find({"id": {"$in": id_list}})
            ]
            db_recs.sort(key=lambda item: id_list.index(item["id"]))
            for restaurant in db_recs:
                recommended.append(_build_rec(restaurant))
            response_text = response_text.split("RECOMMENDATIONS_JSON:")[0].strip()
        except Exception:
            pass

    response_text = re.sub(r"\[?\bID\s*:\s*\d+\]?\s*", "", response_text, flags=re.IGNORECASE)
    response_text = re.sub(r"\s{2,}", " ", response_text).strip()

    if not recommended and candidates:
        top = candidates[:3]
        fallback_lines = []
        for idx, restaurant in enumerate(top, 1):
            stars = f"{restaurant.get('average_rating', 0):.1f}★"
            fallback_lines.append(
                f"{idx}. {restaurant.get('name', '')} ({stars}, {restaurant.get('pricing_tier') or '$$'}) - "
                f"\"{restaurant.get('cuisine') or 'Great'} option in {restaurant.get('city') or 'your area'}\""
            )
            recommended.append(_build_rec(restaurant))
        response_text += "\n\nHere are the best matches from our database:\n" + "\n".join(fallback_lines)

    return ChatResponse(response=response_text, recommendations=recommended)
