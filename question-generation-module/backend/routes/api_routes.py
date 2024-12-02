from flask import Blueprint, jsonify, request
from transformers import pipeline

# Create a Blueprint for the API routes
api = Blueprint('api', __name__)

# Load the question generation model
# question_generation_model = pipeline("text2text-generation", model="t5-small")
question_generation_model = pipeline("text2text-generation", model="valhalla/t5-small-qg-prepend")

def generate_questions(content):
    """
    Generate questions from the provided content using the model.
    :param content: Text input for the model.
    :return: A list of questions.
    """
    try:
        # Pass the content directly to the model
        result = question_generation_model(
            content,
            max_length=128,
            num_return_sequences=3,  # Generate three questions in one go
            num_beams=3
        )
        # Extract the questions from the model output
        questions = [res["generated_text"] for res in result]
        return questions
    except Exception as e:
        raise Exception(f"Error generating questions: {str(e)}")


@api.route('/generate-question', methods=['POST'])
def generate_question():
    """
    API route to generate viva questions.
    """
    data = request.json
    submission_type = data.get('type', 'generic')
    submission_content = data.get('submission', '')

    if not submission_content:
        return jsonify({"error": "Submission content is required"}), 400

    # Directly pass the submission content to the model
    try:
        questions = generate_questions(submission_content)
        return jsonify({"questions": questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
