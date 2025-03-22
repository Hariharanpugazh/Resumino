from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .forms import ResumeAnalysisForm
from .utils import parse_pdf_resume, analyze_resume
import logging
from pymongo import MongoClient
from gridfs import GridFS
from bson.objectid import ObjectId
from datetime import datetime  # Import datetime for timestamps

# MongoDB configuration
client = MongoClient("mongodb+srv://kavinkavin8466:kavinbox@ats.1rv8j.mongodb.net/")
db = client.resume_analysis  # MongoDB Database Name
grid_fs = GridFS(db)  # GridFS for file storage
analysis_collection = db.analysis_results  # MongoDB Collection Name

# Set up logging for debugging
logger = logging.getLogger(__name__)

# Fetch API key from settings
api_key = settings.API_KEY

@csrf_exempt
def analyze_resume_view(request):
    """
    Handle the upload and analysis of a resume file, saving results to MongoDB.
    """
    if request.method == 'POST':
        try:
            # Parse form data
            form = ResumeAnalysisForm(request.POST, request.FILES)
            if form.is_valid():
                # Parse the resume file
                resume_file = request.FILES.get('resume_file')
                if not resume_file:
                    logger.error("Resume file not provided.")
                    return JsonResponse({'success': False, 'error': 'Resume file not provided.'}, status=400)

                # Extract resume text for analysis
                try:
                    resume_text = parse_pdf_resume(resume_file)
                except Exception as e:
                    logger.error(f"Error parsing resume file: {e}")
                    return JsonResponse({'success': False, 'error': f'Error parsing resume file: {e}'}, status=400)

                # Perform analysis
                try:
                    analysis_result = analyze_resume(
                        resume_text,
                        form.cleaned_data['job_description'],
                        api_key
                    )
                except Exception as e:
                    logger.error(f"Error during analysis: {e}")
                    return JsonResponse({'success': False, 'error': f'Error during analysis: {e}'}, status=400)

                # Save analysis data to MongoDB
                try:
                    resume_file_id = grid_fs.put(resume_file, filename=resume_file.name)
                    analysis_data = {
                        "resume_file_id": str(resume_file_id),
                        "job_description": form.cleaned_data['job_description'],
                        "analysis_result": analysis_result,
                        "created_at": datetime.utcnow(),  # Use datetime for timestamp
                    }
                    analysis_collection.insert_one(analysis_data)
                except Exception as e:
                    logger.error(f"Error saving analysis to database: {e}")
                    return JsonResponse({'success': False, 'error': f'Error saving analysis to database: {e}'}, status=500)

                logger.info("Resume analysis completed successfully.")
                return JsonResponse({'success': True, 'data': analysis_result}, status=200)
            else:
                logger.warning("Invalid form data.")
                return JsonResponse({'success': False, 'error': 'Invalid form data.'}, status=400)
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON: {str(e)}")
            return JsonResponse({'success': False, 'error': f'Error decoding JSON: {str(e)}'}, status=400)
        except Exception as e:
            logger.error(f"Error during resume analysis: {e}")
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    logger.warning("Invalid request method.")
    return JsonResponse({'success': False, 'error': 'Invalid request method.'}, status=405)
