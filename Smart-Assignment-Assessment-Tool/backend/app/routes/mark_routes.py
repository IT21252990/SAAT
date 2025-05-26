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
        # VIVA MARKS
        viva_docs = db.collection('submissions').where('submission_id', '==', submission_id).limit(1).stream()
        viva_doc = next(viva_docs, None)

        if not viva_doc or not viva_doc.exists:
            total_viva_marks = 0
        else:
            viva_data = viva_doc.to_dict()
            viva = viva_data.get('marks', {}).get('viva', {})
            report_id = viva_data.get('report_id', None)
            # Sum all numeric values in the viva dictionary
            total_viva_marks = sum(value for value in viva.values() if isinstance(value, (int, float)))


        #CODE MARKS
        code_docs = db.collection('codes').where('submission_id', '==', submission_id).limit(1).stream()
        code_doc = next(code_docs, None)

        if not code_doc or not code_doc.exists:
            total_code_marks = 0
        else:
            code_data = code_doc.to_dict()
            code = code_data.get('marks', {})

            print(code_docs)

            # Sum all numeric values in the code dictionary
            total_code_marks = sum(value for value in code.values() if isinstance(value, (int, float)))


       #VIDEO MARKS
        video_docs = db.collection('video_marks').where('submissionId', '==', submission_id).limit(1).stream()
        video_doc = next(video_docs, None)

        if not video_doc or not video_doc.exists:
            total_video_marks = 0
        else:
            video_data = video_doc.to_dict()
            video = video_data.get('marks', {})

            print(video_docs)

            # Sum all numeric values in the video dictionary
            total_video_marks = sum(value for value in video.values() if isinstance(value, (int, float)))

       #REPORT MARKS
        print("submission", viva_data)

        report_docs = db.collection('report_submissions').where('report_id', '==', report_id).limit(1).stream()
        report_doc = next(report_docs, None)

        print("report", report_doc)

        if not report_doc or not report_doc.exists:
            total_report_marks = 0
        else:
            report_data = report_doc.to_dict()
            total_report_marks = report_data.get("mark", 0)

        return jsonify({
            'submission_id': submission_id,
            'total_viva_marks': total_viva_marks,
            'total_code_marks': total_code_marks,
            'total_video_marks': total_video_marks,
            'total_report_marks': total_report_marks
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error calculating viva total: {e}")
        return jsonify({'error': str(e)}), 500


@marks_bp.route("/mark-weight/<assignment_id>", methods=["GET"])
def get_mark_weight_by_assignment_id(assignment_id):
    try:
        db = current_app.db
        marking_schemes_ref = db.collection("marking_schemes")
        
        # Query to find the marking scheme with the given assignment_id
        query_docs = marking_schemes_ref.where("assignment_id", "==", assignment_id).stream()
        query = next(query_docs, None)

        marking_scheme_data = query.to_dict()
        viva_weight = marking_scheme_data.get('submission_type_weights', {}).get('viva', 0)
        code_weight = marking_scheme_data.get('submission_type_weights', {}).get('code', 0)
        video_weight = marking_scheme_data.get('submission_type_weights', {}).get('video', 0)
        report_weight = marking_scheme_data.get('submission_type_weights', {}).get('report', 0)

        if not query:
            return jsonify({"error": "No marking scheme found for the given assignment ID"}), 404
    
        return jsonify({
            'viva_weight': viva_weight,
            'code_weight': code_weight,
            'video_weight': video_weight,
            'report_weight': report_weight
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
