from flask import Blueprint, request, jsonify, current_app

marks_bp = Blueprint('marks', __name__)

@marks_bp.route('/save', methods=['POST'])
def save_all_marks():
    db = current_app.firestore_client  # Firestore client set in app context
    data = request.get_json()

    submission_id = data.get('submissionId')
    marks = data.get('marks')

    if not submission_id or not marks:
        return jsonify({'error': 'Missing submissionId or marks'}), 400

    try:
        # Build the update dictionary for Firestore (mark.section: value)
        update_fields = {f"mark.{section}": content for section, content in marks.items()}

        # Reference to the submission document
        submission_ref = db.collection('submissions').document(submission_id)

        # Attempt to update the document
        submission_ref.update(update_fields)

        return jsonify({'message': 'Marks updated successfully'}), 200

    except Exception as e:
        current_app.logger.error(f"Error updating marks: {e}")
        return jsonify({'error': 'Server error occurred while saving marks'}), 500
