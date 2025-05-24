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



#Code repo
def generate_questions_from_github_url(repo_url, metric_type):
    """
    Generate viva questions directly from a GitHub repository URL.
    """
    prompt = f"""
        You are an AI tutor analyzing a GitHub repository.
        Based on the repository's content at {repo_url}, generate **exactly** one question-answer pair for each difficulty level:

        - **Easy Question**: Basic understanding level
        - **Moderate Question**: Requires some analysis or explanation
        - **Difficult Question**: Involves application or deeper thinking

        Metric: {metric_type}

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



# Code repo
def generate_questions_from_report(summary, metric_type):
    """
    Generate viva questions from a report summary.
    """
    prompt = f"""
        You are an AI tutor analyzing a student's report summary.
        Based on the given report summary, generate **exactly** one question-answer pair for each difficulty level:

        Report Summary:
        {summary}

        - **Easy Question**: Basic understanding level
        - **Moderate Question**: Requires some analysis or explanation
        - **Difficult Question**: Involves application or deeper thinking

        Metric: {metric_type}

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

#Code repo
def generate_questions_from_video(combined_text, metric_type):
    """
    Generate viva questions from a video.
    """
    prompt = f"""
        You are an AI tutor analyzing a video.
        Based on the summarized content from the video's segments: {combined_text}, generate **exactly** one question-answer pair for each difficulty level:

        - **Easy Question**: Basic understanding level
        - **Moderate Question**: Requires some analysis or explanation
        - **Difficult Question**: Involves application or deeper thinking

        Metric: {metric_type}

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
    

#generate some general questions from assignment
import google.generativeai as genai

def generate_questions_from_assignment(description):
    """
    Generate 3 general viva questions from an assignment description using Gemini.
    """

    prompt = f"""
    You are an AI tutor preparing for a viva exam.
    Based on the following assignment description, generate exactly 3 general viva questions 
    that a teacher might ask to assess a student's overall understanding of the assignment.

    Assignment Description:
    {description}

    Format:
    - Question 1: <question>
    - Question 2: <question>
    - Question 3: <question>

    Only include the questions in the specified format. Do not include answers or extra commentary.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        if not response or not response.text:
            print("[ERROR] No response received from Gemini.")
            return []

        print("[INFO] Raw Gemini response:")
        print(response.text)

        # Simplified extraction of question text
        questions = []
        for line in response.text.strip().splitlines():
            line = line.strip().lstrip("-").strip()  # Remove leading dash and whitespace
            if line.lower().startswith("question") and ":" in line:
                question = line.split(":", 1)[1].strip()
                questions.append(question)

        print("[INFO] Parsed Questions:")
        for i, q in enumerate(questions, 1):
            print(f"Q{i}: {q}")

        return questions[:3]  # Return only the first 3 questions
    except Exception as e:
        print("[ERROR] Failed to generate questions:", str(e))
        return []