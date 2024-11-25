from flask import Blueprint, jsonify, request
from transformers import pipeline

# Create a Blueprint for the API routes
api = Blueprint('api', __name__)

# Load the question generation model
question_generation_model = pipeline("text2text-generation", model="t5-small")

def generate_questions_with_llm(prompt):
    """
    Generate questions dynamically using the LLM with beam search to support multiple sequences.
    :param prompt: The text input to the LLM.
    :return: A list of generated questions.
    """
    result = question_generation_model(
        prompt,
        max_length=50,
        num_return_sequences=3,
        num_beams=3,  # Enables beam search for multiple outputs
    )
    questions = [res['generated_text'] for res in result]
    return questions

@api.route('/generate-question', methods=['POST'])
def generate_question():
    """
    API route for generating questions based on submission type and content.
    """
    data = request.json
    submission_type = data.get('type', 'generic')
    submission_content = data.get('submission', '')

    if not submission_content:
        return jsonify({"error": "Submission content is required"}), 400

    # Generate prompts based on submission type
    if submission_type == 'code':
        prompt = f"Generate viva questions for the following code snippet: {submission_content}"
    elif submission_type == 'report':
        prompt = f"Generate viva questions based on this report content: {submission_content}"
    elif submission_type == 'video':
        prompt = f"Generate viva questions based on this video metadata: {submission_content}"
    else:
        prompt = f"Generate viva questions for this generic submission: {submission_content}"

    try:
        questions = generate_questions_with_llm(prompt)
    except Exception as e:
        return jsonify({"error": f"LLM processing failed: {str(e)}"}), 500

    return jsonify({"questions": questions})
