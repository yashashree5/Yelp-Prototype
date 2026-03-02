# Yelp Prototype

A full-stack Yelp-style restaurant discovery and review platform built with React (frontend) and FastAPI + MySQL (backend), with an AI-powered restaurant recommendation chatbot.

---

## Team

- Yashashree Shinde - Backend (FastAPI, MySQL, AI Assistant)
- Andrew - Frontend (React, TailwindCSS)

---

## Project Overview

This application supports two user personas:

- User (Reviewer) - Can search restaurants, write reviews, save favorites, and use the AI assistant
- Restaurant Owner - Can list and manage restaurants, claim existing listings, and view reviews

---

## Tech Stack

### Backend
- Python 3.12
- FastAPI
- MySQL
- SQLAlchemy (ORM)
- JWT Authentication
- Passlib + Bcrypt (password hashing)
- Langchain (AI assistant)
- Tavily (web search for AI context)

### Frontend
- React
- TailwindCSS
- Axios

---

## Features

### User Features
- Signup and login with JWT authentication
- Profile management with photo upload
- Set dining preferences (cuisine, price range, dietary needs, ambiance)
- Search restaurants by name, cuisine, keywords, location
- View restaurant details, photos, hours, contact info
- Add, edit, and delete own reviews with star ratings
- Mark restaurants as favorites
- View history of reviews and added restaurants
- AI chatbot for personalized restaurant recommendations

### Restaurant Owner Features
- Signup and login
- Create and manage restaurant listings
- Claim existing restaurant listings
- View all reviews for owned restaurants
- Owner analytics dashboard

---

## Project Structure

```
Yelp-Prototype/
├── yelp-backend/                  # Backend (Yashashree)
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── restaurant.py
│   │   │   ├── review.py
│   │   │   ├── favorite.py
│   │   │   ├── preferences.py
│   │   │   └── owner.py
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── .gitignore
│   ├── requirements.txt
│   └── README.md
│
└── yelp-frontend/                 # Frontend (Andrew)
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    ├── package.json
    └── README.md
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| users | Registered reviewers |
| restaurant_owners | Registered owners |
| restaurants | Restaurant listings |
| reviews | User reviews linked to restaurants |
| favorites | User saved restaurants |
| user_preferences | AI assistant preferences per user |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/user/signup | User registration |
| POST | /auth/user/login | User login |
| POST | /auth/owner/signup | Owner registration |
| POST | /auth/owner/login | Owner login |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /restaurants | Search and list restaurants |
| POST | /restaurants | Create new restaurant |
| GET | /restaurants/{id} | Get restaurant details |
| PUT | /restaurants/{id} | Update restaurant |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /restaurants/{id}/reviews | Add review |
| PUT | /reviews/{id} | Edit own review |
| DELETE | /reviews/{id} | Delete own review |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Get profile |
| PUT | /users/me | Update profile |
| GET | /users/me/preferences | Get preferences |
| PUT | /users/me/preferences | Update preferences |
| GET | /favorites | Get favorites |
| POST | /favorites/{id} | Add favorite |
| DELETE | /favorites/{id} | Remove favorite |
| GET | /users/me/history | View history |

### Owner
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /owners/me/dashboard | Owner analytics |
| POST | /owners/claim/{id} | Claim restaurant |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai-assistant/chat | Chat with AI for recommendations |

Full API documentation available at: http://localhost:8000/docs

---

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/yashashree5/Yelp-Prototype.git
cd Yelp-Prototype/yelp-backend
git checkout backend
```

### 2. Create and activate virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create .env file

```
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost/yelp_db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your_openai_key
TAVILY_API_KEY=your_tavily_key
```

### 5. Create MySQL database

```sql
CREATE DATABASE yelp_db;
```

### 6. Run the server

```bash
uvicorn app.main:app --reload
```

Server runs at: http://localhost:8000

---

## Frontend Setup

```bash
cd yelp-frontend
npm install
npm start
```

App runs at: http://localhost:3000

---

## Plan of Action

### Backend (Yashashree)
- [x] Project setup and folder structure
- [x] MySQL database and all models
- [x] JWT authentication for users and owners
- [x] Password hashing with bcrypt
- [ ] get_current_user dependency
- [ ] Restaurant APIs (create, search, details, update)
- [ ] Review APIs (add, edit, delete)
- [ ] User profile and preferences APIs
- [ ] Favorites and history APIs
- [ ] Owner dashboard and claim restaurant
- [ ] AI assistant chatbot (Langchain + Tavily)
- [ ] API documentation (Swagger)
- [ ] requirements.txt and final cleanup

### Frontend (Andrew)
- [ ] Project setup with React and TailwindCSS
- [ ] Signup and login pages (User and Owner)
- [ ] Home/dashboard with search
- [ ] Restaurant search and filter page
- [ ] Restaurant details page
- [ ] Add restaurant form
- [ ] Write review form
- [ ] Profile and preferences page
- [ ] Favorites tab
- [ ] History tab
- [ ] AI chatbot interface
- [ ] Owner dashboard (stretch goal)
- [ ] Responsive design for mobile and tablet

---

## Notes

- Do not commit the .env file
- Do not commit venv or node_modules
- All API requests to protected routes require: Authorization: Bearer token
- Errors are returned in format: { "detail": "error message" }
- Photos are returned as URL strings
