from flask import Blueprint, request, jsonify
import uuid
from app.utils.generate_questions import generate_questions_gemini  # Import utility

qgenerate_bp = Blueprint("qgenerate", __name__)

@qgenerate_bp.route("/generateGeneralQuestions", methods=["POST"])
def generate_general_questions():
    try:
        data = request.get_json()
        
        submission_id = data.get("submission_id")
        assignment_description = data.get("assignment_description")
        metric_types = data.get("metric_types", [])

        if not submission_id or not assignment_description or not metric_types:
            return jsonify({"error": "Missing required fields"}), 400

        question_data = {
            "id": str(uuid.uuid4()),  # Temporary UUID for identification
            "submission_id": submission_id,
            "category": "general",
            "questions": []
        }

        for metric in metric_types:
            generated_text = generate_questions_gemini(assignment_description, metric)

            if not generated_text:
                return jsonify({"error": f"Failed to generate questions for {metric}"}), 500

            questions = {"easy": None, "moderate": None, "difficult": None}

            for line in generated_text.strip().split("\n"):
                if "Easy Question" in line:
                    questions["easy"] = {"question": line.split(": ", 1)[-1]}
                elif "Moderate Question" in line:
                    questions["moderate"] = {"question": line.split(": ", 1)[-1]}
                elif "Difficult Question" in line:
                    questions["difficult"] = {"question": line.split(": ", 1)[-1]}
                elif "Answer" in line:
                    if questions["easy"] and "answer" not in questions["easy"]:
                        questions["easy"]["answer"] = line.split(": ", 1)[-1]
                    elif questions["moderate"] and "answer" not in questions["moderate"]:
                        questions["moderate"]["answer"] = line.split(": ", 1)[-1]
                    elif questions["difficult"] and "answer" not in questions["difficult"]:
                        questions["difficult"]["answer"] = line.split(": ", 1)[-1]

            question_data["questions"].append({
                "metric_type": metric,
                "qna": questions
            })

        return jsonify({"message": "Questions generated successfully", "data": question_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
