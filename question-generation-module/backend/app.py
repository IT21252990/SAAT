from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate-question', methods=['POST'])
def generate_question():
    data = request.json
    # Placeholder for question generation logic
    response = {
        "questions": ["What are the key components?", "Explain the logic behind your solution."]
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
