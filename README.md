# Yelp Prototype

A full-stack Yelp-style restaurant discovery and review platform built with React (frontend) and FastAPI + MySQL (backend), featuring an AI-powered restaurant recommendation chatbot.

---

## Project Overview

This application supports two user personas:

- User (Reviewer) - Can search restaurants, write reviews, save favorites, and use the AI assistant
- Restaurant Owner - Can list and manage restaurants, claim existing listings, and view reviews

---

## Tech Stack

### Backend
- Python 3.11
- FastAPI
- MySQL
- SQLAlchemy (ORM)
- JWT Authentication
- Passlib + Bcrypt (password hashing)
- LangChain (AI assistant)
- Groq (LLM provider)
- Tavily (web search for AI context)

### Frontend
- React (Vite)
- React Router DOM
- Bootstrap
- Axios
- TailwindCSS

---

## Features

### User Features
- Signup and Login with JWT authentication
- Profile management (name, email, phone, city, country, languages, gender)
- User preferences (cuisine, price range, dietary restrictions, ambiance, sort preference)
- Restaurant search and filtering by name, cuisine, city, keywords
- Restaurant details view with reviews, ratings, and contact info
- Add a new restaurant listing
- Write, edit, and delete reviews with star ratings
- Mark restaurants as favorites
- View history of past reviews and restaurants added
- AI Assistant chatbot for personalized restaurant recommendations

### Restaurant Owner Features
- Owner signup and login
- Restaurant profile management
- Post restaurant listings with details, photos, pricing, and amenities
- Claim and manage existing restaurant listings
- View reviews for owned restaurants
- Owner analytics dashboard

---

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 20+
- MySQL
- npm

### Backend Setup

1. Clone the repository and switch to the frontend branch:
git clone https://github.com/yashashree5/Yelp-Prototype.git
cd Yelp-Prototype
git checkout frontend

2. Create and activate virtual environment:
cd backend
python3 -m venv .venv
source .venv/bin/activate

3. Install dependencies:
pip install -r requirements.txt

4. Create a .env file in the backend directory:
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/yelp_db
SECRET_KEY=supersecretkey123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key

5. Create the MySQL database:
mysql -u root -p
CREATE DATABASE yelp_db;
EXIT;

6. Run the backend server:
uvicorn app.main:app --reload

Backend runs at http://127.0.0.1:8000
Swagger API docs at http://127.0.0.1:8000/docs

### Frontend Setup

1. Navigate to the frontend directory:
cd frontend

2. Install dependencies:
npm install
npm install bootstrap axios

3. Run the development server:
npm run dev

Frontend runs at http://localhost:5173

---

## API Endpoints

### Authentication
- POST /auth/user/signup - User signup
- POST /auth/user/login - User login
- POST /auth/owner/signup - Owner signup
- POST /auth/owner/login - Owner login

### Users
- GET /users/me - Get current user profile
- PUT /users/me - Update user profile
- GET /users/history - Get user history

### Restaurants
- GET /restaurants/ - Get all restaurants
- POST /restaurants/ - Create a new restaurant
- GET /restaurants/{id} - Get restaurant by ID
- PUT /restaurants/{id} - Update restaurant

### Reviews
- POST /reviews/ - Create a review
- GET /reviews/restaurant/{id} - Get reviews for a restaurant
- PUT /reviews/{id} - Update a review
- DELETE /reviews/{id} - Delete a review

### Favorites
- GET /favorites/ - Get user favorites
- POST /favorites/ - Add to favorites
- DELETE /favorites/{id} - Remove from favorites

### Preferences
- GET /preferences/ - Get user preferences
- POST /preferences/ - Save user preferences

### AI Assistant
- POST /ai-assistant/chat - Chat with AI assistant

---

## API Documentation

Full API documentation is available via Swagger UI at http://127.0.0.1:8000/docs

---

## Contributors

- Yashashree Shinde
- Andrew C

---
