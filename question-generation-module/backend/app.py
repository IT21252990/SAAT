from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai  # Assuming you have the genai library installed
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Error handling for Google Generative AI (genai) library
def handle_genai_error(e):
    return jsonify({"error": f"Error using Google Generative AI: {str(e)}"}), 500

# Configure Google Gemini API
API_KEY = os.getenv("GOOGLE_GENAI_API_KEY")  # Fetch the key from environment variables
if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Failed to configure Google Generative AI: {str(e)}")
        model = None  # Set model to None if configuration fails

# Route to generate questions
@app.route('/generate-question', methods=['POST'])
def generate_question():
    """
    Generate questions based on the type of input (video transcript, code, or report).
    """
    data = request.json
    submission_type = data.get('type', '').lower()  # Type: 'video', 'code', or 'report'
    submission_content = data.get('submission', '')

    if not submission_content:
        return jsonify({"error": "Submission content is required"}), 400

    # Generate a tailored prompt based on the submission type
    if submission_type == 'video':
        prompt = f"Based on this video transcript, generate three questions:\n{submission_content}"
    elif submission_type == 'code':
        prompt = f"Based on this code snippet, generate three questions:\n{submission_content}"
    elif submission_type == 'report':
        prompt = f"Based on this report, generate three questions for review:\n{submission_content}"
    else:
        return jsonify({"error": "Invalid or missing 'type'. Must be 'video', 'code', or 'report'"}), 400

    # Use Google Generative AI to generate questions
    if model:
        try:
            response = model.generate_content(prompt)
            return jsonify({"questions": response.text.split('\n')})  # Return questions as a list
        except Exception as e:
            return handle_genai_error(e)
    else:
        return jsonify({"message": "Google Generative AI not configured or failed to initialize"}), 502

# Main entry point
if __name__ == '__main__':
    app.run(debug=True)
