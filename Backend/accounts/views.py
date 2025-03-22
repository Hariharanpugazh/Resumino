from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from pymongo import MongoClient

# MongoDB connection settings
MONGO_URI = "mongodb+srv://kavinkavin8466:kavinbox@ats.1rv8j.mongodb.net/"
DATABASE_NAME = "users_db"
COLLECTION_NAME = "accounts_user"  # Replace with your collection name

# Utility function for connecting to MongoDB
def get_user_collection():
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    return db[COLLECTION_NAME]

def authenticate_plain_text(email=None, password=None):
    """
    Authenticates a user with plain text passwords.

    Args:
        email (str): The email of the user.
        password (str): The plain text password to validate.

    Returns:
        User object if authentication is successful, None otherwise.
    """
    try:
        user_collection = get_user_collection()
        user = user_collection.find_one({"email": email})  # Fetch user by email
        if user and user["password"] == password:  # Compare plain text passwords
            return user
    except Exception as e:
        print(f"Error during authentication: {e}")
    return None

@csrf_exempt
def signup(request):
    """
    Handles user signup by saving the user's information in MongoDB.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        JsonResponse: The response indicating success or failure.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')

            user_collection = get_user_collection()

            # Check if email already exists
            if user_collection.find_one({"email": email}):
                return JsonResponse({'error': 'Email already exists'}, status=400)

            # Insert new user into the collection
            user_collection.insert_one({
                "name": name,
                "email": email,
                "password": password,  # Store plain text password (consider hashing)
            })

            return JsonResponse({'message': 'Signup successful!'}, status=201)
        except Exception as e:
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login(request):
    """
    Handles user login by authenticating credentials against MongoDB.

    Args:
        request (HttpRequest): The incoming HTTP request.

    Returns:
        JsonResponse: The response indicating success or failure.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            user = authenticate_plain_text(email=email, password=password)
            if user:
                return JsonResponse({'message': 'Login successful!'}, status=200)
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
