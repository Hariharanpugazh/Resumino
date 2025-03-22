from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.views.decorators.http import require_http_methods
import logging
from pymongo import MongoClient

# MongoDB configuration
client = MongoClient("mongodb+srv://kavinkavin8466:kavinbox@ats.1rv8j.mongodb.net/")
db = client.user_info  # MongoDB Database Name
userinfo_collection = db.userinfo  # MongoDB Collection Name

# Set up logging
logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def save_user_info(request):
    """
    Save user information into MongoDB using pymongo.
    If the user already exists, delete the old data and create a new entry.
    """
    try:
        data = json.loads(request.body)

        # Extract fields from the request
        personal_info = data.get('personalInfo', {})
        email = personal_info.get('email')
        full_name = personal_info.get('name', '')
        phone = personal_info.get('phone', '')
        address = personal_info.get('address', '')
        certifications = data.get('certifications', [])
        achievements = data.get('achievements', [])
        languages = data.get('languages', [])
        education = data.get('education', [])
        projects = data.get('projects', [])
        experience = data.get('experience', [])
        skills = data.get('skills', [])

        # Ensure skills is a list of strings
        skills_str = [skill['label'] for skill in skills if isinstance(skill, dict) and 'label' in skill]

        # Check if the user already exists
        existing_user = userinfo_collection.find_one({"email": email})
        if existing_user:
            # Delete the old user entry
            userinfo_collection.delete_one({"email": email})
            logger.info("Deleted old user entry with email: %s", email)

        # Save the new user info to MongoDB
        user_data = {
            "email": email,
            "full_name": full_name,
            "phone": phone,
            "address": address,
            "professional_summary": data.get('professionalSummary', ''),
            "social_links": data.get("socialLinks", {}),
            "fresher_or_professional": data.get('fresherOrProfessional', ''),
            "education": education,
            "skills": skills_str,
            "projects": projects,
            "experience": experience,
            "certifications": certifications,
            "achievements": achievements,
            "languages": languages,
        }
        userinfo_collection.insert_one(user_data)

        logger.info("User info saved successfully for email: %s", email)
        return JsonResponse({'message': 'User info saved successfully'}, status=201)

    except json.JSONDecodeError:
        logger.error("Invalid JSON format.")
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        logger.exception("An unexpected error occurred: %s", str(e))
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

def my_view(request):
    """
    Example view to demonstrate basic functionality.
    """
    try:
        result = {"status": "success", "message": "This is a successful response."}
        return JsonResponse(result)
    except Exception as e:
        logger.error(f"Error in my_view: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


def sanitize_field(field, default):
    """
    Sanitize and validate JSON fields, providing a fallback default value if needed.
    """
    if isinstance(field, list):
        return field
    try:
        return json.loads(field) if isinstance(field, str) else default
    except Exception:
        logger.warning("Failed to parse field: %s", field)
        return default


@csrf_exempt
def fetch_latest_user_info(request):
    """
    Fetch the latest user information from MongoDB.
    """
    try:
        latest_user = userinfo_collection.find_one(sort=[("_id", -1)])  # Fetch the most recent document

        if not latest_user:
            logger.warning("No user data found.")
            return JsonResponse({"error": "No user data found"}, status=404)

        # Prepare the user data to return
        user_data = {
            "personalInfo": {
                "name": latest_user.get("full_name", ""),
                "email": latest_user.get("email", ""),
                "phone": latest_user.get("phone", ""),
                "address": latest_user.get("address", ""),
            },
            "professionalSummary": latest_user.get("professional_summary", ""),
            "socialLinks": latest_user.get("social_links", {}),
            "education": latest_user.get("education", []),
            "skills": latest_user.get("skills", []),
            "certifications": latest_user.get("certifications", []),
            "achievements": latest_user.get("achievements", []),
            "languages": latest_user.get("languages", []),
            "projects": latest_user.get("projects", []),
            "experience": latest_user.get("experience", []),
        }

        logger.debug("User data being returned: %s", user_data)
        return JsonResponse(user_data, status=200)

    except Exception as e:
        logger.exception("Failed to fetch user info.")
        return JsonResponse({"error": str(e)}, status=500)
