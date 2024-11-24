from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate-question', methods=['POST'])
def generate_question():
    data = request.json
    submission_type = data.get('type', 'generic')  # Get the type (code, report, video)
    submission_content = data.get('submission', '')

    # Placeholder logic for question generation
    if submission_type == 'code':
        questions = [
            "What is the main purpose of this code?",
            "Can you explain the algorithm used in the code?",
            "How does the code handle edge cases?"
        ]
    elif submission_type == 'report':
        questions = [
            "What are the key findings of your report?",
            "Can you elaborate on the methodology section?",
            "How do the conclusions relate to the objectives?"
        ]
    elif submission_type == 'video':
        questions = [
            "What is the main topic of the video?",
            "Can you summarize the key points discussed in the video?",
            "What were the challenges highlighted in the video?"
        ]
    else:
        questions = ["What is this submission about?"]

    return jsonify({"questions": questions})

if __name__ == '__main__':
    app.run(debug=True)
