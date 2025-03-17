import google.generativeai as genai
import os

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_questions_gemini(assignment_description, metric_type):
    prompt = f"""
        You are an AI tutor designing viva questions based on the assignment description.
        For the metric "{metric_type}", generate **exactly** one question-answer pair for each difficulty level:

        - **Easy Question**: Basic understanding level
        - **Moderate Question**: Requires some analysis or explanation
        - **Difficult Question**: Involves application or deeper thinking

        Assignment Description:
        {assignment_description}

        Format:
        - Easy Question: <question>
        Answer: <answer>
        - Moderate Question: <question>
        Answer: <answer>
        - Difficult Question: <question>
        Answer: <answer>

        Ensure that the response only includes one question-answer pair for each difficulty level. Do not include additional information.

    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text if response else None
    except Exception as e:
        return str(e)
