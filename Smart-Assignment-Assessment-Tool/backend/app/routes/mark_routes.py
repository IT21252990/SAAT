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


@marks_bp.route('/get-all-marks/<submission_id>', methods=['GET'])
def get_all_marks(submission_id):
    db = current_app.db

    if not submission_id:
        return jsonify({'error': 'Missing submission_id parameter'}), 400

    try:
        # Query Firestore for the document by submission_id
        docs = db.collection('submissions').where('submission_id', '==', submission_id).limit(1).stream()
        doc = next(docs, None)

        if not doc or not doc.exists:
            return jsonify({'error': 'Submission not found'}), 404

        submission_data = doc.to_dict()
        viva = submission_data.get('marks', {}).get('viva', {})

        # Sum all numeric values in the viva dictionary
        total = sum(value for value in viva.values() if isinstance(value, (int, float)))

        return jsonify({
            'submission_id': submission_id,
            'total_viva_marks': total
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error calculating viva total: {e}")
        return jsonify({'error': 'Server error occurred while retrieving viva marks'}), 500

