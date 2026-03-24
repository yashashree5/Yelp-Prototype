# Yelp Prototype (FastAPI + React)

Yelp-style restaurant discovery and review platform with two personas:
- Reviewer (user)
- Restaurant owner

Includes JWT auth, profile/preferences, restaurant listing/search/details, reviews, favorites, history, owner dashboard, and AI assistant chat.

## Tech Stack

- Frontend: React + Vite + Axios
- Backend: FastAPI + SQLAlchemy
- Database: MySQL
- AI: Groq LLM + Tavily + LangChain prompt pipeline

## Project Structure

- `backend/` FastAPI server
- `frontend/` React app

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8+

## Backend Setup

1. Create DB in MySQL (example: `yelp_prototype`).
2. Create `.env` in `backend/`:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/yelp_prototype
SECRET_KEY=replace_with_secure_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
```

3. Install deps and run:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

## Frontend Setup

The current UI does not use Google Maps (no map panel on explore or detail pages). You can skip `frontend/.env`, or keep a key only if you re-enable `RestaurantMap.jsx` later.

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Docs

- Swagger UI: `http://127.0.0.1:8000/docs`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

## Core Endpoints (high level)

- Auth: `/auth/user/signup`, `/auth/user/login`, `/auth/owner/signup`, `/auth/owner/login`
- User profile/history/preferences: `/users/me`, `/users/history`, `/preferences/`
- Owner profile/dashboard: `/users/owner/me`, `/users/owner/dashboard`
- Restaurants: `/restaurants/`, `/restaurants/{id}`, `/restaurants/{id}/claim`
- Reviews: `/reviews/`, `/reviews/restaurant/{id}`, `/reviews/{id}`
- Favorites: `/favorites/`
- AI assistant: `/ai-assistant/chat`

## Notes

- Reviewer-only actions: profile/preferences/favorites/history/review create-edit-delete.
- Owner-only actions: claim and manage owned restaurants, owner dashboard.
- State in reviewer profile uses 2-letter abbreviation (for example: `CA`).
