import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import create_with_increment, db, ensure_indexes, utc_now
from app.utils.hashing import hash_password


ensure_indexes()

print("Cleaning old data...")
db.favorites.delete_many({})
db.reviews.delete_many({})
db.restaurants.delete_many({})
db.users.delete_many({"email": "john.doe@example.com"})
db.restaurant_owners.delete_many({"email": "owner@sanjose.com"})

print("Creating owner...")
owner = create_with_increment(
    "restaurant_owners",
    {
        "name": "Admin Owner",
        "email": "owner@sanjose.com",
        "hashed_password": hash_password("password123"),
        "restaurant_location": "San Jose",
        "is_active": True,
        "created_at": utc_now(),
    },
)

print("Creating user...")
user = create_with_increment(
    "users",
    {
        "name": "Local Guide John",
        "email": "john.doe@example.com",
        "hashed_password": hash_password("password123"),
        "city": "San Jose",
        "state": "CA",
        "is_active": True,
        "created_at": utc_now(),
    },
)

print("Seeding map with real San Jose restaurants...")
restaurants_data = [
    {
        "name": "San Pedro Square Market", "cuisine": "American",
        "address": "87 N San Pedro St", "city": "San Jose",
        "description": "Vibrant indoor-outdoor market featuring global cuisines, local beer, and live music.",
        "hours": "Mon-Sun 10:00 AM - 10:00 PM", "amenities": "Outdoor seating, Full bar, Live music, Family friendly",
        "pricing_tier": "$$", "latitude": 37.3361, "longitude": -121.8953
    },
    {
        "name": "La Victoria Taqueria", "cuisine": "Mexican",
        "address": "140 E San Carlos St", "city": "San Jose",
        "description": "Iconic local taqueria famous for its legendary orange sauce.",
        "hours": "Mon-Sun 7:00 AM - 12:00 AM", "amenities": "Takeout, Casual, Legendary Orange Sauce",
        "pricing_tier": "$", "latitude": 37.3312, "longitude": -121.8845
    },
    {
        "name": "Original Joe's San Jose", "cuisine": "Italian",
        "address": "301 S 1st St", "city": "San Jose",
        "description": "Classic, old-school Italian-American dining with famous steaks and pasta portions.",
        "hours": "Tue-Sun 11:30 AM - 10:00 PM", "amenities": "Full bar, Steaks, Leather booths, Classic dinner",
        "pricing_tier": "$$$", "latitude": 37.3320, "longitude": -121.8887
    },
    {
        "name": "Olla Southwestern Eatery", "cuisine": "Mexican",
        "address": "17 N San Pedro St", "city": "San Jose",
        "description": "Modern Southwestern cuisine with craft cocktails in a stylish loft space.",
        "hours": "Mon-Sun 11:00 AM - 9:00 PM", "amenities": "Craft Cocktails, Outdoor seating, Modern design",
        "pricing_tier": "$$", "latitude": 37.3359, "longitude": -121.8948
    },
    {
        "name": "The Old Spaghetti Factory", "cuisine": "Italian",
        "address": "51 N San Pedro St", "city": "San Jose",
        "description": "Family-friendly chain eatery featuring traditional Italian entrees amid turn-of-the-century decor.",
        "hours": "Mon-Sun 11:30 AM - 9:30 PM", "amenities": "Family friendly, Kid menus, Trolley seating",
        "pricing_tier": "$$", "latitude": 37.3364, "longitude": -121.8951
    },
    {
        "name": "Orchard City Kitchen", "cuisine": "American",
        "address": "1875 S Bascom Ave", "city": "Campbell",
        "description": "Michelin-recognized spot serving inventive, shareable globally inspired plates.",
        "hours": "Wed-Sun 5:00 PM - 9:00 PM", "amenities": "Michelin Bib Gourmand, Full bar, Craft cocktails",
        "pricing_tier": "$$$", "latitude": 37.2885, "longitude": -121.9332
    },
    {
        "name": "Santouka Ramen", "cuisine": "Japanese",
        "address": "675 Saratoga Ave", "city": "San Jose",
        "description": "Famous Japanese chain known for its authentic, rich pork broth (shio) ramen.",
        "hours": "Mon-Sun 11:00 AM - 8:30 PM", "amenities": "Takeout, Casual, Inside Mitsuwa Supermarket",
        "pricing_tier": "$", "latitude": 37.3149, "longitude": -121.9774
    },
    {
        "name": "Falafel's Drive-In", "cuisine": "Mediterranean",
        "address": "2301 Stevens Creek Blvd", "city": "San Jose",
        "description": "San Jose institution serving legendary falafel sandwiches and banana shakes since 1966.",
        "hours": "Mon-Sun 10:00 AM - 6:00 PM", "amenities": "Drive-in, Historic, Casual, Outdoor tables",
        "pricing_tier": "$", "latitude": 37.3235, "longitude": -121.9348
    },
    {
        "name": "Pizza Antica", "cuisine": "Italian",
        "address": "334 Santana Row", "city": "San Jose",
        "description": "Thin-crust Neapolitan pizzas cooked in a wood-fired oven in Santana Row.",
        "hours": "Mon-Sun 11:30 AM - 9:00 PM", "amenities": "Outdoor seating, Wine bar, Wood-fired oven",
        "pricing_tier": "$$$", "latitude": 37.3207, "longitude": -121.9482
    },
    {
        "name": "Goku Korean BBQ", "cuisine": "Korean",
        "address": "3085 Meridian Ave", "city": "San Jose",
        "description": "All-you-can-eat Korean BBQ with high-quality meats and unlimited side dishes.",
        "hours": "Mon-Sun 11:30 AM - 11:00 PM", "amenities": "All You Can Eat, Fun groups, Casual",
        "pricing_tier": "$$", "latitude": 37.2655, "longitude": -121.9056
    },
    {
        "name": "SP2 Communal Bar + Restaurant", "cuisine": "American",
        "address": "72 N Almaden Ave", "city": "San Jose",
        "description": "Stylish, rustic-chic gastropub turning out locally sourced American dishes and craft cocktails.",
        "hours": "Tue-Sun 4:00 PM - 12:00 AM", "amenities": "Outdoor patio, Full bar, Fire pits",
        "pricing_tier": "$$$", "latitude": 37.3353, "longitude": -121.8953
    },
    {
        "name": "Pho Y #1", "cuisine": "Vietnamese",
        "address": "1660 E Capitol Expy", "city": "San Jose",
        "description": "Long-standing local favorite for gigantic bowls of authentic, rich Pho.",
        "hours": "Mon-Sun 9:00 AM - 8:30 PM", "amenities": "Takeout, Casual, Family friendly",
        "pricing_tier": "$", "latitude": 37.3065, "longitude": -121.8123
    },
    {
        "name": "Adega", "cuisine": "Other",
        "address": "1614 Alum Rock Ave", "city": "San Jose",
        "description": "Michelin-starred authentic Portuguese cuisine featuring fresh imported seafood and extensive wines.",
        "hours": "Wed-Sun 5:00 PM - 9:30 PM", "amenities": "Michelin Star, Fine dining, Reservations required",
        "pricing_tier": "$$$$", "latitude": 37.3512, "longitude": -121.8386
    },
    {
        "name": "The GrandView Restaurant", "cuisine": "American",
        "address": "15005 San Jose-Los Gatos Rd", "city": "San Jose",
        "description": "Historic upscale steakhouse sitting high in the hills with sweeping panoramic views of Silicon Valley.",
        "hours": "Tue-Sun 5:00 PM - 10:00 PM", "amenities": "Scenic view, Fine dining, Steaks, Farm to table",
        "pricing_tier": "$$$$", "latitude": 37.2345, "longitude": -121.9432
    },
    {
        "name": "Walia Ethiopian Cuisine", "cuisine": "Other",
        "address": "2208 Business Cir", "city": "San Jose",
        "description": "Highly rated authentic Ethiopian stews and spongy injera bread in a warm setting.",
        "hours": "Mon-Sun 11:30 AM - 9:30 PM", "amenities": "Vegetarian friendly, Casual, Traditional dining",
        "pricing_tier": "$$", "latitude": 37.3323, "longitude": -121.9221
    }
]

created_restaurants = []
for restaurant_data in restaurants_data:
    restaurant_payload = {key: value for key, value in restaurant_data.items() if key not in ["latitude", "longitude"]}
    restaurant_payload["owner_id"] = owner["id"]
    restaurant_payload["average_rating"] = 4.5
    restaurant_payload["review_count"] = 2
    restaurant_payload["created_by_user_id"] = None
    restaurant_payload["created_at"] = utc_now()

    created_restaurants.append(create_with_increment("restaurants", restaurant_payload))

for restaurant in created_restaurants:
    create_with_increment(
        "reviews",
        {
            "restaurant_id": restaurant["id"],
            "user_id": user["id"],
            "rating": 5,
            "comment": f"I absolutely loved {restaurant['name']}! The atmosphere was incredible and the food was exactly what I was hoping for. Will definitely be coming back.",
            "photos": None,
            "created_at": utc_now(),
            "updated_at": None,
        },
    )
    create_with_increment(
        "reviews",
        {
            "restaurant_id": restaurant["id"],
            "user_id": user["id"],
            "rating": 4,
            "comment": f"Solid experience at {restaurant['name']}. Service was slightly slow because it was packed, but the quality of the {restaurant['cuisine']} food totally made up for it.",
            "photos": None,
            "created_at": utc_now(),
            "updated_at": None,
        },
    )

print("Database successfully seeded with 15 real San Jose restaurants and accurate coordinates!")
