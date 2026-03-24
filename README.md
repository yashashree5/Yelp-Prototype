# Yelp Prototype

A full-stack restaurant discovery and review platform inspired by Yelp, built with **React**, **FastAPI**, and **MySQL**. Features two distinct user personas — **Reviewers** and **Restaurant Owners** — along with an **AI-powered restaurant assistant** for personalized recommendations.

## Team

- **Yashashree Shinde**
- **Andrew Chau**

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 19, Vite, React Router, Axios, Bootstrap |
| Backend    | FastAPI, SQLAlchemy, Pydantic, Uvicorn         |
| Database   | MySQL 8+                                       |
| Auth       | JWT (python-jose), bcrypt (passlib)            |
| AI Engine  | Groq LLM, LangChain, Tavily Web Search        |

---

## Features

### Reviewer (User) Features

- **Authentication** — Signup and login with form validation and JWT-based session management
- **Restaurant Discovery** — Browse, search, and filter restaurants by name, cuisine, city, or keyword
- **Restaurant Details** — View full restaurant profiles including ratings, reviews, hours, contact, amenities, and photos
- **Write Reviews** — Create, edit, and delete reviews with star ratings, comments, and optional photo uploads
- **Favorites** — Save/unsave restaurants for quick access later
- **Preferences** — Set cuisine, dietary, price, and ambiance preferences to personalize AI recommendations
- **History** — View all past reviews and restaurants added by the user
- **Profile Management** — Update personal info (name, email, phone, city, state, about me, profile picture)
- **AI Chat Assistant** — Floating chat widget powered by Groq LLM for personalized restaurant recommendations with multi-turn conversation support

### Restaurant Owner Features

- **Owner Authentication** — Separate signup/login flow for restaurant owners
- **Owner Dashboard** — Analytics overview with total restaurants, reviews, average rating, public sentiment analysis, and ratings distribution
- **Claim Restaurants** — Browse and claim unclaimed restaurant listings directly from the dashboard
- **Manage Restaurant** — Edit restaurant details (name, cuisine, address, hours, contact, amenities, pricing, photos)
- **Reviews Dashboard** — View all reviews for owned restaurants (read-only) with sorting and filtering by rating/date
- **Owner Profile** — Manage account information (name, email, restaurant location)

### AI Assistant

- Floating chat widget accessible from every page (reviewer accounts only)
- Expandable/collapsible interface with quick action buttons
- Scoring-based restaurant ranking using query context, saved preferences, cuisine, price, ambiance, dietary needs, and ratings
- Strict database-only recommendations — never hallucinated results
- Multi-turn conversation support with contextual follow-ups
- Clickable restaurant cards in chat responses linking to full details

---

## Project Structure

```
Yelp-Prototype/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── database.py             # SQLAlchemy engine & session
│   │   ├── models/                 # ORM models (User, Owner, Restaurant, Review)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── routers/                # API route handlers
│   │   │   ├── auth.py             # User & owner authentication
│   │   │   ├── users.py            # Profile, history, owner dashboard
│   │   │   ├── restaurants.py      # CRUD, search, claim
│   │   │   ├── reviews.py          # CRUD with photo support
│   │   │   ├── favorites.py        # Save/unsave restaurants
│   │   │   ├── preferences.py      # User preference management
│   │   │   └── chatbot.py          # AI assistant endpoint
│   │   └── utils/                  # JWT, dependencies, helpers
│   ├── .env                        # Environment variables (not committed)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Routes & role-based access control
│   │   ├── api/axios.js            # Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── NavBar.jsx          # Navigation with role-aware links
│   │   │   ├── ChatWidget.jsx      # Floating AI assistant
│   │   │   └── RestaurantCard.jsx  # Restaurant list item
│   │   └── pages/
│   │       ├── Home.jsx            # Restaurant discovery & search
│   │       ├── RestaurantDetails.jsx
│   │       ├── Login.jsx / Signup.jsx
│   │       ├── OwnerLogin.jsx / OwnerSignup.jsx
│   │       ├── Profile.jsx / OwnerProfile.jsx
│   │       ├── WriteReview.jsx
│   │       ├── AddRestaurant.jsx
│   │       ├── Favorites.jsx / History.jsx / Preferences.jsx
│   │       ├── OwnerDashboard.jsx
│   │       └── OwnerManageRestaurant.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 20+ (recommended) or 18+
- **MySQL** 8+

---

## Getting Started

### 1. Database Setup

```sql
CREATE DATABASE yelp_db;
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/yelp_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Start the server:

```bash
uvicorn app.main:app --reload
```

Backend runs at **http://127.0.0.1:8000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

---

## API Documentation

FastAPI provides auto-generated interactive API docs:

| Resource         | URL                                      |
|------------------|------------------------------------------|
| Swagger UI       | http://127.0.0.1:8000/docs              |
| ReDoc            | http://127.0.0.1:8000/redoc             |
| OpenAPI JSON     | http://127.0.0.1:8000/openapi.json      |

### Key Endpoints

| Method | Endpoint                        | Description                        | Auth     |
|--------|---------------------------------|------------------------------------|----------|
| POST   | `/auth/user/signup`             | Register reviewer account          | Public   |
| POST   | `/auth/user/login`              | Reviewer login                     | Public   |
| POST   | `/auth/owner/signup`            | Register owner account             | Public   |
| POST   | `/auth/owner/login`             | Owner login                        | Public   |
| GET    | `/users/me`                     | Get reviewer profile               | User     |
| PUT    | `/users/me`                     | Update reviewer profile            | User     |
| GET    | `/users/history`                | Get review & restaurant history    | User     |
| GET    | `/users/owner/me`               | Get owner profile                  | Owner    |
| GET    | `/users/owner/dashboard`        | Owner analytics & restaurants      | Owner    |
| GET    | `/restaurants/`                 | List/search restaurants            | Public   |
| GET    | `/restaurants/unclaimed`        | List unclaimed restaurants         | Public   |
| POST   | `/restaurants/`                 | Add a restaurant                   | Auth     |
| PUT    | `/restaurants/{id}`             | Update restaurant details          | Owner    |
| POST   | `/restaurants/{id}/claim`       | Claim an unclaimed restaurant      | Owner    |
| GET    | `/reviews/restaurant/{id}`      | Get reviews for a restaurant       | Public   |
| POST   | `/reviews/`                     | Create a review (with photo)       | User     |
| PUT    | `/reviews/{id}`                 | Update a review                    | User     |
| DELETE | `/reviews/{id}`                 | Delete a review                    | User     |
| GET    | `/favorites/`                   | List favorited restaurants         | User     |
| POST   | `/favorites/{id}`               | Add to favorites                   | User     |
| DELETE | `/favorites/{id}`               | Remove from favorites              | User     |
| GET    | `/preferences/`                 | Get user preferences               | User     |
| PUT    | `/preferences/`                 | Update preferences                 | User     |
| POST   | `/ai-assistant/chat`            | AI chat for recommendations        | User     |

---

## Screenshots

Screenshots demonstrating all features are included in the project report.

---

## Notes

- **Role-based access**: Reviewer and owner accounts have separate auth flows and distinct permissions. Protected routes redirect unauthenticated users to login.
- **Photo uploads**: Review and restaurant photos are stored as base64 data URLs (suitable for demo; production would use cloud storage).
- **AI recommendations**: The chatbot uses a scoring-based ranking system combining query intent, user preferences, cuisine/price/ambiance matching, and restaurant ratings — all sourced exclusively from the database.
- **Sentiment analysis**: The owner dashboard computes sentiment from review ratings (positive: 4-5 stars, neutral: 3 stars, negative: 1-2 stars).
