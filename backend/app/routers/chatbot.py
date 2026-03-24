from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.preferences import UserPreferences
from app.utils.dependencies import get_current_reviewer
from app.models.user import User
from tavily import TavilyClient
from groq import Groq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json
import os
import re

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

CUISINE_KEYWORDS = [
    "italian", "chinese", "mexican", "indian", "japanese",
    "american", "thai", "french", "korean", "mediterranean",
    "vietnamese", "greek", "spanish", "caribbean", "middle eastern",
]

PRICE_TOKENS = {"$$$$": "$$$$", "$$$": "$$$", "$$": "$$", "$": "$",
                "expensive": "$$$", "cheap": "$", "affordable": "$",
                "mid-range": "$$", "moderate": "$$", "budget": "$",
                "upscale": "$$$$", "fine dining": "$$$$", "splurge": "$$$$"}

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


# ---------------------------------------------------------------------------
# Extraction helpers — lightweight NLU before LLM call
# ---------------------------------------------------------------------------

def _extract_cuisine(text: str) -> Optional[str]:
    lowered = text.lower()
    for c in CUISINE_KEYWORDS:
        if c in lowered:
            return c.title()
    return None


def _extract_price(text: str) -> Optional[str]:
    for token, val in PRICE_TOKENS.items():
        if token in text.lower():
            return val
    return None


def _extract_ambiance(text: str) -> list[str]:
    lowered = text.lower()
    return [a for a in AMBIANCE_TOKENS if a in lowered]


def _extract_dietary(text: str) -> list[str]:
    lowered = text.lower()
    return [d for d in DIETARY_TOKENS if d in lowered]


def _normalize(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (name or "").lower()).strip()


def _build_rec(r: Restaurant) -> RestaurantRecommendation:
    return RestaurantRecommendation(
        id=r.id,
        name=r.name,
        cuisine=r.cuisine or "",
        city=r.city or "",
        address=r.address or "",
        average_rating=r.average_rating or 0,
        review_count=r.review_count or 0,
        description=r.description,
        pricing_tier=r.pricing_tier,
    )


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_reviewer),
):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")
    groq_client = Groq(api_key=groq_api_key)

    # ------------------------------------------------------------------
    # 1. Load saved user preferences from DB
    # ------------------------------------------------------------------
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    saved_cuisines = (prefs.cuisines or "") if prefs else ""
    saved_price = (prefs.price_range or "") if prefs else ""
    saved_dietary = (prefs.dietary_needs or "") if prefs else ""
    saved_ambiance = (prefs.ambiance or "") if prefs else ""
    saved_location = (prefs.location or "San Jose") if prefs else "San Jose"
    saved_sort = (prefs.sort_by or "rating") if prefs else "rating"

    prefs_block = f"""User's Saved Preferences:
- Cuisines: {saved_cuisines or 'No preference'}
- Price range: {saved_price or 'No preference'}
- Dietary needs: {saved_dietary or 'None'}
- Ambiance: {saved_ambiance or 'No preference'}
- Location: {saved_location}
- Sort by: {saved_sort}"""

    # ------------------------------------------------------------------
    # 2. Extract filters from the current query (query > preferences)
    # ------------------------------------------------------------------
    msg = request.message
    msg_lower = msg.lower()

    q_cuisine = _extract_cuisine(msg)
    q_price = _extract_price(msg)
    q_ambiance = _extract_ambiance(msg)
    q_dietary = _extract_dietary(msg)

    # Use query-extracted filters first; fall back to saved preferences only when
    # the query doesn't mention them (query > preferences).
    target_cuisine = q_cuisine or (saved_cuisines.split(",")[0].strip() if saved_cuisines else None)
    target_price = q_price or (saved_price if saved_price else None)
    target_ambiance = q_ambiance or ([a.strip() for a in saved_ambiance.split(",") if a.strip()] if saved_ambiance else [])
    target_dietary = q_dietary or ([d.strip() for d in saved_dietary.split(",") if d.strip()] if saved_dietary else [])

    # ------------------------------------------------------------------
    # 3. Score-based ranking instead of hard elimination
    #    Every restaurant gets a relevance score; filters add points
    #    rather than removing candidates entirely.
    # ------------------------------------------------------------------
    all_restaurants = db.query(Restaurant).all()
    msg_norm = _normalize(msg)

    scored: list[tuple[float, Restaurant]] = []
    for r in all_restaurants:
        score = 0.0
        text_blob = ((r.amenities or "") + " " + (r.description or "")).lower()

        # Name mentioned in query → strong boost
        if _normalize(r.name) and _normalize(r.name) in msg_norm:
            score += 50

        # Cuisine match
        if target_cuisine and r.cuisine and target_cuisine.lower() in r.cuisine.lower():
            score += 20

        # Price match
        if target_price and (r.pricing_tier or "") == target_price:
            score += 10

        # Ambiance / occasion match
        if target_ambiance:
            amb_hits = sum(1 for tok in target_ambiance if tok in text_blob)
            score += amb_hits * 8

        # Dietary match
        if target_dietary:
            diet_hits = sum(1 for tok in target_dietary if tok in text_blob)
            score += diet_hits * 8

        # Rating baseline (0-5 → 0-5 points)
        score += (r.average_rating or 0)

        # Small boost for review volume
        score += min((r.review_count or 0) / 10, 3)

        scored.append((score, r))

    scored.sort(key=lambda x: x[0], reverse=True)
    candidates = [r for _, r in scored[:15]]

    if not candidates:
        candidates = all_restaurants[:10]

    db_context = "Restaurant Database (recommend ONLY from this list):\n"
    for r in candidates:
        stars = f"{r.average_rating or 0:.1f}★"
        db_context += (
            f"- [ID:{r.id}] {r.name} | {r.cuisine or 'N/A'} | "
            f"{r.city or 'N/A'} | {stars} ({r.review_count or 0} reviews) | "
            f"Price: {r.pricing_tier or 'N/A'} | "
            f"{(r.description or '')[:120]}\n"
        )

    # ------------------------------------------------------------------
    # 5. Tavily web search for additional context
    # ------------------------------------------------------------------
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

    # ------------------------------------------------------------------
    # 6. Build LangChain prompt + call LLM
    # ------------------------------------------------------------------
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
   Example: 1. Pasta Paradise (4.5★, $$) - "Matches your Italian preference and mid-range budget"
4. Provide 1-5 recommendations depending on how many match.
5. Always explain WHY each restaurant is recommended (matching cuisine, price, ambiance, dietary needs, etc.).
6. Do NOT show internal IDs in your response text. IDs are only for the JSON block.
7. At the very end of your message, on its own line, output exactly:
   RECOMMENDATIONS_JSON: [{{"id": 1}}, {{"id": 2}}]
   using the real restaurant IDs from the database list.
8. Be conversational and warm, not robotic. Keep responses concise and helpful.
9. Support follow-up questions — if the user refines their request, adjust recommendations accordingly.
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
    except Exception as e:
        err = str(e).lower()
        if "invalid_api_key" in err or "authentication" in err:
            raise HTTPException(status_code=502, detail="Groq authentication failed. Check GROQ_API_KEY.")
        raise HTTPException(status_code=502, detail="AI service unavailable. Please try again.")

    response_text = completion.choices[0].message.content or ""

    # ------------------------------------------------------------------
    # 7. Parse RECOMMENDATIONS_JSON and build structured response
    # ------------------------------------------------------------------
    recommended: list[RestaurantRecommendation] = []
    allowed_ids = {r.id for r in candidates}

    if "RECOMMENDATIONS_JSON:" in response_text:
        try:
            json_part = response_text.split("RECOMMENDATIONS_JSON:")[1].strip()
            json_str = json_part.split("\n")[0].strip()
            rec_ids = json.loads(json_str)
            id_list = [r["id"] for r in rec_ids if isinstance(r, dict) and "id" in r]
            id_list = [rid for rid in id_list if rid in allowed_ids]
            db_recs = db.query(Restaurant).filter(Restaurant.id.in_(id_list)).all()
            for r in db_recs:
                recommended.append(_build_rec(r))
            response_text = response_text.split("RECOMMENDATIONS_JSON:")[0].strip()
        except Exception:
            pass

    # Strip any leaked IDs from prose
    response_text = re.sub(r"\[?\bID\s*:\s*\d+\]?\s*", "", response_text, flags=re.IGNORECASE)
    response_text = re.sub(r"\s{2,}", " ", response_text).strip()

    # Fallback: always return at least one DB-backed recommendation
    if not recommended and candidates:
        top = candidates[:3]
        fallback_lines = []
        for i, r in enumerate(top, 1):
            stars = f"{r.average_rating or 0:.1f}★"
            fallback_lines.append(
                f"{i}. {r.name} ({stars}, {r.pricing_tier or '$$'}) - "
                f"\"{r.cuisine or 'Great'} option in {r.city or 'your area'}\""
            )
            recommended.append(_build_rec(r))
        response_text += "\n\nHere are the best matches from our database:\n" + "\n".join(fallback_lines)

    return ChatResponse(response=response_text, recommendations=recommended)
