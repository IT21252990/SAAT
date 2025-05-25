from flask import Blueprint, request, jsonify, current_app

marks_bp = Blueprint('marks', __name__)

@marks_bp.route('/save', methods=['POST'])
def save_all_marks():
    try:
        db = current_app.db
        data = request.get_json()

        submission_id = data.get('submissionId')
        marks = data.get('marks')

        if not submission_id or not marks:
            return jsonify({'error': 'Missing submissionId or marks'}), 400

        submission_ref = db.collection("submissions").document(submission_id)

        # Get the existing document
        existing_submission = submission_ref.get()
        if not existing_submission.exists:
            return jsonify({"error": "Submission not found"}), 404

        # Update fields
        submission_ref.update({
            "marks": marks
        })

        return jsonify({"message": "Marks updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@marks_bp.route('/get-viva-marks/<submission_id>', methods=['GET'])
def get_marks(submission_id):
    """ Get existing viva marks for a submission """
    try:
        db = current_app.db
        doc_ref = db.collection("submissions").document(submission_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Submission ID not found"}), 404

        submission_data = doc.to_dict()
        existing_marks = submission_data.get("marks", {})
        viva_marks = existing_marks.get("viva", {})
        if not viva_marks:
            return jsonify({"error": "No viva marks found"}), 404

        return jsonify({
            "viva": viva_marks,
            "submission_id": submission_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
