# Yelp Prototype - Backend

A REST API backend for a Yelp-style restaurant discovery platform built with FastAPI and MySQL.

---

## Tech Stack

- Python 3.12
- FastAPI
- MySQL
- SQLAlchemy
- JWT Authentication
- Passlib + Bcrypt

---

## Project Structure

```
yelp-backend/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   └── utils/
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yashashree5/Yelp-Prototype.git
cd Yelp-Prototype
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

### 4. Create a .env file in the root directory

```
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost/yelp_db
SECRET_KEY=supersecretkey123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Create the MySQL database

```sql
CREATE DATABASE yelp_db;
```

### 6. Run the server

```bash
uvicorn app.main:app --reload
```

---

## API Documentation

Swagger UI is available at:

```
http://localhost:8000/docs
```

---

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/user/signup | User registration |
| POST | /auth/user/login | User login |
| POST | /auth/owner/signup | Owner registration |
| POST | /auth/owner/login | Owner login |

More endpoints coming soon: restaurants, reviews, profile, favorites, history, owner dashboard.

---

## Notes

- Do not commit the .env file
- Do not commit the venv folder
- All passwords are hashed using bcrypt
- Authentication uses JWT tokens passed as Bearer tokens in the Authorization header
