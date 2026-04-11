# Yelp Prototype - Lab 1 Assignment

A full-stack Yelp-style restaurant discovery and review platform built with React (frontend) and FastAPI + MySQL (backend), featuring an AI-powered restaurant recommendation chatbot using Groq LLM and Tavily API.

**Due Date:** March 24, 2026, 11:59 PM  
**Points:** 40 points

---

## Project Overview

This application supports two main user personas:

- **User (Reviewer)** - Can search restaurants, write reviews, save favorites, manage preferences, and use the AI assistant
- **Restaurant Owner** - Can list and manage restaurants, claim existing listings, view reviews, and access analytics

### Key Highlights
✅ JWT-based authentication for both user roles  
✅ Bcrypt password hashing for security  
✅ AI-powered chatbot with natural language understanding  
✅ Personalized recommendations based on user preferences  
✅ Full CRUD operations for reviews and restaurants  
✅ Responsive React UI with Modern design  
✅ Comprehensive API with Swagger documentation  

---

## Tech Stack

### Backend
- **Framework:** Python 3.11 + FastAPI 0.135.1
- **Database:** MySQL with SQLAlchemy ORM
- **Authentication:** JWT (HS256) + Bcrypt password hashing
- **AI/LLM:** Groq (llama-3.3-70b-versatile model)
- **Web Search:** Tavily API
- **Server:** Uvicorn

### Frontend
- **Framework:** React 19.2.0 with Vite 7.3.1
- **Routing:** React Router DOM 7.13.1
- **HTTP Client:** Axios 1.13.6
- **UI:** Bootstrap 5.3.8 + TailwindCSS
- **Build Tool:** Vite

---

## Features Implemented

### ✅ User (Reviewer) Features

1. **Authentication (Signup/Login)**
   - Secure signup with password hashing (bcrypt)
   - JWT-based login
   - Session token management with auto-expiration

2. **Profile Management**
   - View and update user details (name, email, phone, city, country, gender, languages)
   - Profile picture upload capability
   - Persistent profile data in database

3. **User Preferences**
   - Cuisine preferences (Italian, Chinese, Mexican, Indian, Japanese, American, Thai, Greek, Korean, Mediterranean)
   - Price range selection ($ to $$$$)
   - Dietary restrictions (Vegetarian, Vegan, Halal, Gluten-free, Kosher, Dairy-free, Nut-free)
   - Ambiance preferences (casual, fine dining, family-friendly, romantic, outdoor, sports bar)
   - Sort preference (rating, distance, popularity, price)
   - Preferences used by AI assistant for personalized recommendations

4. **Restaurant Search & Discovery**
   - Search by restaurant name
   - Filter by cuisine type
   - Filter by city/location
   - Keyword search across descriptions and amenities
   - View all restaurants with average rating and review count
   - Google Maps integration on search page

5. **Restaurant Details View**
   - Complete restaurant information (name, cuisine, address, description, hours, contact)
   - Average rating and total review count
   - List of all reviews with user names and ratings
   - Photos and contact information
   - Ability to add/write review directly from this page
   - Mark as favorite button

6. **Add Restaurant Listing**
   - Create new restaurant entry with name, cuisine, address, city
   - Add description, contact info, hours, pricing tier
   - Add amenities/features
   - Form validation
   - Successfully added restaurants visible to all users

7. **Review System**
   - Write review with 1-5 star rating and comment text
   - Edit own reviews (update rating and comment)
   - Delete own reviews
   - See review creation date and user who wrote it
   - See all reviews for each restaurant
   - Automatic restaurant rating recalculation

8. **Favorites Management**
   - Save restaurants as favorites
   - View all favorites in dedicated tab
   - Remove from favorites
   - Quick access to favorite restaurants

9. **User History**
   - View all past reviews written
   - View all restaurants added by user
   - Separate tabs for reviews and restaurants
   - Easy navigation to reviewed restaurants

10. **AI Assistant Chatbot** 🤖
    - **Accessible from:** Floating widget on all pages OR dedicated chatbot page
    - **Personalization:** Uses user's saved preferences for recommendations
    - **Natural Language:** Understands queries like "I want romantic Italian dinner"
    - **Smart Recommendations:** Suggests restaurants matching query + preferences
    - **Web Search Integration:** Tavily API for current hours, events, trending info
    - **Multi-turn Conversations:** Supports follow-up questions and refinements
    - **UI Features:**
      - Chat history display
      - Quick action buttons ("Find dinner tonight", "Best rated", "Vegan options", etc.)
      - Restaurant cards with ratings and pricing
      - Clickable recommendations linking to full details
      - Loading indicators with "thinking" states

### ✅ Restaurant Owner Features

1. **Owner Authentication**
   - Separate signup/login from regular users
   - Additional field: restaurant location
   - Role-based token to distinguish from users

2. **Restaurant Profile Management**
   - View and edit restaurant details
   - Update name, cuisine, description, location, contact info
   - Add/edit hours of operation
   - Upload restaurant photos
   - Set pricing tier

3. **Restaurant Posting**
   - Post new restaurant listing with complete details
   - Automatically linked to owner account
   - Visible immediately to all users

4. **Claim Existing Restaurant**
   - Search for existing restaurant listing
   - Claim ownership to manage it
   - Update details after claiming

5. **View Reviews**
   - See all reviews for owned restaurants
   - Read-only access (cannot delete user reviews)
   - View rating, comment, and reviewer information
   - Sort and filter reviews

6. **Owner Dashboard**
   - Analytics overview:
     - Total number of restaurants
     - Total number of reviews
     - Average rating across all restaurants
   - Rating distribution chart
   - Recent reviews list
   - Performance metrics
   - Quick links to manage restaurants

---

## Database Schema

### Tables Created
- **users** - User profiles and authentication
- **restaurant_owners** - Owner accounts and credentials
- **restaurants** - Restaurant listings with details
- **reviews** - User reviews with ratings and comments
- **favorites** - User's saved restaurants
- **user_preferences** - User's cuisine and ambiance preferences

### Relationships
- Users → Reviews (one-to-many)
- Users → Favorites (one-to-many)
- Restaurants → Reviews (one-to-many)
- RestaurantOwners → Restaurants (one-to-many)
- Users → UserPreferences (one-to-one)

---

## API Endpoints (24 Total)

### Authentication (4 endpoints)
```
POST /auth/user/signup          - User registration
POST /auth/user/login           - User login
POST /auth/owner/signup         - Owner registration
POST /auth/owner/login          - Owner login
```

### User Management (3 endpoints)
```
GET  /users/me                  - Get current user profile
PUT  /users/me                  - Update user profile
GET  /users/history             - Get user's review and restaurant history
```

### Restaurants (5 endpoints)
```
GET  /restaurants/              - List all restaurants (with filters)
POST /restaurants/              - Create new restaurant
GET  /restaurants/{id}          - Get restaurant details
PUT  /restaurants/{id}          - Update restaurant
POST /restaurants/{id}/claim    - Claim restaurant as owner
```

### Reviews (4 endpoints)
```
POST /reviews/                  - Create review
GET  /reviews/restaurant/{id}   - Get all reviews for restaurant
PUT  /reviews/{id}              - Update review (own only)
DELETE /reviews/{id}            - Delete review (own only)
```

### Favorites (3 endpoints)
```
POST   /favorites/{restaurant_id}   - Add to favorites
GET    /favorites/                  - Get user's favorites
DELETE /favorites/{restaurant_id}   - Remove from favorites
```

### Preferences (2 endpoints)
```
GET /preferences/               - Get user preferences
PUT /preferences/               - Save/update preferences
```

### AI Assistant (1 endpoint)
```
POST /ai-assistant/chat         - Chat with AI for recommendations
```

**Full API documentation available at:** `API_DOCUMENTATION.md`

---

## Frontend Routes

### Public Pages
- `/` - Home/Explore page (restaurant search and discovery)
- `/login` - User login form
- `/signup` - User registration form
- `/owner/login` - Owner login form
- `/owner/signup` - Owner registration form
- `/restaurant/:id` - Restaurant details page

### Protected User Pages
- `/profile` - User profile and settings management
- `/preferences` - Set AI assistant preferences
- `/favorites` - View saved restaurants
- `/history` - View user activity (reviews and restaurants added)
- `/add-restaurant` - Add new restaurant form
- `/write-review/:id` - Write/edit review form
- `/chatbot` - Full-page AI assistant interface

### Protected Owner Pages
- `/owner/dashboard` - Analytics and metrics
- `/owner/restaurant/:id` - Manage restaurant details

---

## Setup Instructions

### Prerequisites
- Python 3.11+ 
- Node.js 20+
- MySQL 8.0+
- npm 10+

### Backend Setup

#### 1. Clone and Navigate
```bash
git clone https://github.com/yashashree5/Yelp-Prototype.git
cd Yelp-Prototype/backend
```

#### 2. Create Virtual Environment
```bash
python3 -m venv .venv

# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Create MySQL Database
```bash
mysql -u root -p

# In MySQL:
CREATE DATABASE yelp_db;
EXIT;
```

#### 5. Configure Environment Variables
Create `.env` file in `backend/` directory:
```
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/yelp_db
SECRET_KEY=supersecretkey123456789
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

**Get Free API Keys:**
- Groq: https://console.groq.com/
- Tavily: https://www.tavily.com/

#### 6. Run Backend Server
```bash
uvicorn app.main:app --reload
```

✅ Backend runs at: `http://127.0.0.1:8000`  
✅ Swagger Docs at: `http://127.0.0.1:8000/docs`

---

### Frontend Setup

#### 1. Navigate to Frontend
```bash
cd ../frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Run Development Server
```bash
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

---

## How to Use

### As a Regular User

1. **Sign Up** - Go to `/signup`, create account with name, email, password
2. **Set Preferences** - Go to `/preferences`, select cuisines, price range, dietary needs
3. **Explore Restaurants** - On home page, search by name/cuisine/city or use general search
4. **View Details** - Click restaurant card to see full details, reviews, ratings
5. **Write Review** - Click "Write Review" button, rate 1-5 stars and add comment
6. **Save Favorites** - Click heart icon to save favorite restaurants
7. **Use AI Assistant** - Click floating 🤖 button, ask questions like:
   - "Find me romantic Italian dinner"
   - "Best vegan options nearby"
   - "Family friendly restaurants"
8. **Check History** - View all your reviews and restaurants added

### As a Restaurant Owner

1. **Sign Up** - Go to `/owner/signup`, enter restaurant location
2. **Add Restaurant** - Go to profile, add new restaurant listing with details
3. **View Dashboard** - On `/owner/dashboard`, see analytics, review count, avg rating
4. **Manage Restaurant** - Click on restaurant to edit details, hours, pricing
5. **View Reviews** - See all reviews left by customers on dashboard
6. **Claim Existing** - If someone else added your restaurant, claim ownership

---

## Key Implementation Details

### Security
- ✅ Passwords hashed with bcrypt (never stored in plain text)
- ✅ JWT tokens with expiration (default 30 minutes)
- ✅ Role-based access control (user vs owner)
- ✅ CORS configured for frontend origin
- ✅ Users can only modify their own data

### AI Assistant Functionality
1. Loads user preferences from database
2. Fetches all restaurants from database
3. Searches web for current info (Tavily API)
4. Sends to Groq LLM with natural language prompt
5. Extracts restaurant IDs from AI response
6. Fetches full restaurant details
7. Returns formatted recommendations with reasoning

### Rating Calculation
- Automatic recalculation after each review create/update/delete
- Average of all review ratings
- Displayed as decimal (e.g., 4.5)

---

## API Testing

### Using Swagger UI
1. Go to `http://127.0.0.1:8000/docs`
2. Click "Authorize" button
3. Paste your JWT token from login response
4. Test any endpoint interactively

### Using cURL
```bash
# Signup
curl -X POST "http://127.0.0.1:8000/auth/user/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login and get token
TOKEN=$(curl -X POST "http://127.0.0.1:8000/auth/user/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Get user profile
curl -X GET "http://127.0.0.1:8000/users/me" \
  -H "Authorization: Bearer $TOKEN"

# Search restaurants
curl -X GET "http://127.0.0.1:8000/restaurants/?search=italian&city=San%20Jose"

# Chat with AI
curl -X POST "http://127.0.0.1:8000/ai-assistant/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"I want romantic Italian dinner","conversation_history":[]}'
```

---

## Project Documentation

- **Comprehensive API Docs:** `API_DOCUMENTATION.md` - Full endpoint documentation with request/response examples
- **Project Structure:** `PROJECT_STRUCTURE.md` - Detailed folder organization and architecture
- **This File:** `README.md` - Quick start and feature overview

---

## Git Workflow

### Commit History
```bash
git log --oneline  # View commits
```

### Key Commits
- ✅ Initial project setup with FastAPI + React
- ✅ Database models and relationships created
- ✅ Authentication routes implemented (signup/login)
- ✅ User profile CRUD operations
- ✅ Restaurant search and filtering
- ✅ Review system (create, edit, delete)
- ✅ AI chatbot integration with Groq + Tavily
- ✅ Favorites and preferences system
- ✅ Owner dashboard and analytics
- ✅ Responsive frontend UI
- ✅ API documentation

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] MySQL database created and accessible
- [ ] Groq and Tavily API keys obtained
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] All routes tested
- [ ] JWT tokens working correctly
- [ ] AI assistant generating recommendations
- [ ] API documentation accessible

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Or run on different port
uvicorn app.main:app --reload --port 8001
```

### Database Connection Error
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Check DATABASE_URL in .env is correct
# Format: mysql+pymysql://user:password@localhost:3306/dbname
```

### Frontend Not Connecting to Backend
```bash
# Check CORS is enabled in backend
# Check frontend axios.js has correct BASE_URL
# Ensure both services are running
```

### No API Keys Errors
```bash
# Verify .env file has GROQ_API_KEY and TAVILY_API_KEY
# Get free keys from:
# - Groq: https://console.groq.com/
# - Tavily: https://www.tavily.com/
```

---

## Performance Metrics

- ✅ Fast restaurant search with database filtering
- ✅ Efficient JWT token validation
- ✅ AI response generation in <5 seconds
- ✅ Responsive React UI with smooth interactions
- ✅ Vite optimized builds

---

## Team

- **Yashashree Shinde** - Full-stack development
- **Andrew C** - Contributions

---

## References

- **FastAPI:** https://fastapi.tiangolo.com/
- **React:** https://react.dev/
- **SQLAlchemy:** https://www.sqlalchemy.org/
- **Groq:** https://wow.groq.com/
- **Tavily:** https://www.tavily.com/
- **Yelp Reference:** https://www.yelp.com/

---

## Assignment Submission

**Submit by:** March 24, 2026, 11:59 PM  
**Files to Include:**
- ✅ Complete codebase (frontend + backend)
- ✅ requirements.txt and package.json  
- ✅ .env template (without secrets)
- ✅ API_DOCUMENTATION.md
- ✅ PROJECT_STRUCTURE.md
- ✅ README.md
- ✅ Detailed commit history

**Report to Submit:**  
- Lab1_Report.doc including:
  - System design and architecture
  - AI chatbot implementation details
  - Screenshots of key features
  - API testing results
  - Setup and deployment instructions

