import google.generativeai as genai
import PyPDF2
import json
import re
from typing import Dict

def configure_genai(api_key: str) -> None:
    genai.configure(api_key=api_key)

def parse_pdf_resume(pdf_file) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error parsing PDF: {str(e)}")

def create_analysis_prompt(resume_text: str, job_description: str) -> str:
    return f"""
You are an ATS (Applicant Tracking System) and resume evaluator. Analyze the following resume against the provided job description and evaluate its various aspects based on the following criteria. Provide a detailed assessment and scores for each category. If the resume passes a category, explain why it is good; if it does not pass, explain why it is lacking. Ensure the response is structured strictly in JSON format as shown below.

---

#### Job Description:
{job_description}

#### Resume:
{resume_text}

---

Respond ONLY with a JSON object in the following format, without any additional text or explanation:

{{
    "ats_parse_rate": {{
        "score": <number between 0-100>,
        "reason": "<detailed explanation of why the ATS parse rate is good or not good>"
        "recommendations": "<any recommendations to improve the ats score in one line>",
        "pass": "<give me why it has passed and what need to be improved>" {{
            "passed": ["whypassed1", "whypassed2"],
            "improve": ["improvement1", "improvement2"]
        }},
    }},
    "contact_information": {{
        "score": <number between 0-100>,
        "reason": "<detailed explanation of whether LinkedIn, professional email, and phone number are provided and why the score is given>"
        "contact_links": "<find all the associated proffesional links and suggest what links can be added give only name of the social link app and in the recommended section like below format only suggest profeesional site like stack overflow hacker rank github leetcode linkedin>" {{
            "social_links": ["link1", "link2"],
            "recommended": ["link1", "link2"],
            "score": <number between 0-100>
        }},
    }},
    "skills_analysis": {{
        "hard_skills": {{
            "matched": ["skill1", "skill2"],
            "not_suited": ["skill1", "skill2"],
            "score": <number between 0-100>
        }},
        "soft_skills": {{
            "matched": ["skill1", "skill2"],
            "not_suited": ["skill1", "skill2"],
            "score": <number between 0-100>
        }},
        "reason": "<detailed explanation of why the skills are or are not suited for the job description>"
        "recommendations": "<any recommendations to improve which skills can be added for the job description"
    }},
    "description_quality": {{
        "score": <number between 0-100>,
        "reason": "<detailed explanation of whether the description is clear, concise, and well-structured>"
        "feedback": {{
            "strength": ["strength1", "strength2"],
            "suggestions": ["suggestion1", "suggestion2"]
        }},
    }},
    "experience_analysis": {{
        "years_of_experience": <number>,
        "score": <number between 0-100>,
        "reason": "<detailed explanation of whether the experience is sufficient for the job and why>",
        "details": {{
            "experience: ["experience1", "experience2"],
            "improve: ["whatcanbeadded"]
        }}
    }},
    "education_analysis": {{
        "score": <number between 0-100>,
        "reason": "<detailed explanation of whether the qualifications meet the job's requirements>"
        "details": "<find the education background and suggest some course to to study for the job description>" {{
            "background": ["background1", "background2"],
            "suggest": ["course1", "course2"]
        }}
    }},
    "projects_analysis": {{
        "score": <number between 0-100>,
        "reason": "<detailed explanation of how well the projects align with the job description>",
        "projects": "<find completed projects and suggest project based on job description>" {{
            "completed": ["project1", "project2"],
            "suggested": ["suggest1", "suggest2"]
        }}
    }},
    "overall_summary": {{
        "total_score": <number between 0-100>,
        "summary": "<high-level summary of the resume's strengths and weaknesses>",
        "over": "<Give overall summary and suggestion to imrpove resume based on job description>"{{
            "summary": ["summary1", "summary2"],
            "improve": ["improvement1", "improvement2"]
        }}
    }}
}}
"""
def extract_json_from_response(text: str) -> Dict:
    """
    Extracts JSON from the response text, falling back to defaults on errors.
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error decoding JSON: {str(e)}")
    
# def extract_json_from_response(text: str) -> Dict:
#     try:
#         return json.loads(text)
#     except:
#         try:
#             json_match = re.search(r'({[\s\S]*})', text)
#             if json_match:
#                 return json.loads(json_match.group(1))
#         except:
#             pass
    
#     return {
#         "ats_parse_rate": {"score": 0, "reason": "Error analyzing ATS parse rate.", "recommendations": "Error analyzing recommendations",
#                            "pass":{"passed": [], "improve": []}},
#         "contact_information": {"score": 0, "reason": "Error analyzing contact information.", 
#                                 "contact_links":{"social_links": [], "recommended": [], "score": 0},},
#         "skills_analysis": {
#             "hard_skills": {"matched": [], "not_suited": [], "score": 0},
#             "soft_skills": {"matched": [], "not_suited": [], "score": 0},
#             "reason": "Error analyzing skills.",
#             "recommendations": "Error analyzing recommendations"
#         },
#         "description_quality": {"score": 0, "reason": "Error analyzing description quality.",
#                                  "feedback":{"strength": [], "suggestions": []}},
#         "experience_analysis": {"years_of_experience": 0, "score": 0, "reason": "Error analyzing experience.",
#                                 "details":{"experience": [], "improve": []}},
#         "education_analysis": {"score": 0, "reason": "Error analyzing education."},
#         "projects_analysis": {"score": 0, "reason": "Error analyzing projects.",
#                               "projects":{"completed": [], "suggested": []}},
#         "overall_summary": {"total_score": 0, "summary": "Error generating overall summary.",
#                             "over":{"summary": [], "improve": []}}
#     }

def clean_response_text(response_text: str) -> str:
    # Remove the ```json and ``` markers if they exist
    if response_text.startswith("```json") and response_text.endswith("```"):
        return response_text[7:-3].strip()  # Remove the markers and any extra whitespace
    elif response_text.startswith("```") and response_text.endswith("```"):
        return response_text[3:-3].strip()  # Generic handling for ``` markers
    return response_text.strip()


def analyze_resume(resume_text: str, job_description: str, api_key: str) -> Dict:
    """
    Analyzes the resume by generating a prompt, cleaning the response,
    extracting JSON, and returning the analysis.
    """
    try:
        configure_genai(api_key)
        model = genai.GenerativeModel('models/gemini-1.5-pro-latest')  # Most stable version   
        # Step 1: Generate Prompt
        prompt = create_analysis_prompt(resume_text, job_description)
        response = model.generate_content(prompt)

        # Step 2: Clean the Response
        cleaned_text = clean_response_text(response.text)
        
        # Step 3: Extract JSON
        analysis_result = extract_json_from_response(cleaned_text)
        
        # Validate Required Fields
        required_fields = [
            "ats_parse_rate",
            "contact_information",
            "skills_analysis",
            "description_quality",
            "experience_analysis",
            "education_analysis",
            "projects_analysis",
            "overall_summary"
        ]
        
        for field in required_fields:
            if field not in analysis_result:
                raise ValueError(f"Missing required field: {field}")
        
        # Step 4: Return Analysis
        return analysis_result

    except Exception as e:
        raise Exception(f"Error during analysis: {str(e)}")


