# # from app import create_app

# # app = create_app()

# # if __name__ == "__main__":
# #     app.run(debug=True)

# import os
# import json
# from dotenv import load_dotenv
# from flask import Flask
# from flask_cors import CORS
# from firebase_admin import credentials, firestore, initialize_app

# # Load environment variables from .env file
# load_dotenv()

# # Get Firebase credentials from environment variable
# firebase_json = os.getenv("FIREBASE_CREDENTIALS")
# if not firebase_json:
#     raise ValueError("FIREBASE_CREDENTIALS environment variable is not set!")

# def create_app():
#     app = Flask(__name__)
#     CORS(app)

#     # Load Firebase credentials and initialize Firebase Admin SDK
#     cred_dict = json.loads(firebase_json)
#     cred = credentials.Certificate(cred_dict)
#     initialize_app(cred)

#     # Attach Firestore client to the app context
#     app.db = firestore.client()

#     # === Register Blueprints ===
#     # Auth & User
#     from app.routes.auth_routes import auth_bp
#     from app.routes.user_routes import user_bp

#     # Academic
#     from app.routes.module_routes import module_bp
#     from app.routes.assignment_routes import assignment_bp
#     from app.routes.submission_routes import submission_bp

#     # Code Repository & Analysis
#     from app.routes.code.repo_routes import repo_bp
#     from app.routes.code.repo_analysis_routes import check_naming_bp

#     # Question & Generation
#     from app.routes.question.question_routes import question_bp
#     from app.routes.question.gemini_question_gen_routes import qgenerate_bp

#     # Reports & Marking
#     from app.routes.report_routes import marking_scheme_bp, report_submission_bp
#     from app.routes.mark_routes import marks_bp

#     # Projects & Testing
#     from app.routes.testing_project import project_bp

#     # Register all blueprints with prefixes
#     app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
#     app.register_blueprint(user_bp, url_prefix="/api/v1/user")
#     app.register_blueprint(module_bp, url_prefix="/api/v1/module")
#     app.register_blueprint(assignment_bp, url_prefix="/api/v1/assignment")
#     app.register_blueprint(submission_bp, url_prefix="/api/v1/submission")
#     app.register_blueprint(repo_bp, url_prefix="/api/v1/repo")
#     app.register_blueprint(check_naming_bp, url_prefix="/api/v1/naming")
#     app.register_blueprint(question_bp, url_prefix="/api/v1/question")
#     app.register_blueprint(qgenerate_bp, url_prefix="/api/v1/qgenerate")
#     app.register_blueprint(marking_scheme_bp, url_prefix="/api/v1/marking-scheme")
#     app.register_blueprint(report_submission_bp, url_prefix="/api/v1/report")
#     app.register_blueprint(project_bp, url_prefix="/api/v1/project")
#     app.register_blueprint(marks_bp, url_prefix="/api/v1/marks")

#     return app

# # Run the Flask app
# if __name__ == "__main__":
#     app = create_app()
#     app.run(debug=True)


import os
import json
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app

# Load environment variables from .env file
load_dotenv()

# Get Firebase credentials from environment variable
firebase_json = os.getenv("FIREBASE_CREDENTIALS")
if not firebase_json:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set!")

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Load Firebase credentials and initialize Firebase Admin SDK
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
    initialize_app(cred)

    # Attach Firestore client to the app context
    app.db = firestore.client()

    # === Register Blueprints ===
    # Auth & User
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp

    # Academic
    from app.routes.module_routes import module_bp
    from app.routes.assignment_routes import assignment_bp
    from app.routes.submission_routes import submission_bp

    # Code Repository & Analysis
    from app.routes.code.repo_routes import repo_bp
    from app.routes.code.repo_analysis_routes import check_naming_bp

    # Question & Generation
    from app.routes.question.question_routes import question_bp
    from app.routes.question.gemini_question_gen_routes import qgenerate_bp

    # Reports & Marking
    from app.routes.report_routes import marking_scheme_bp, report_submission_bp
    from app.routes.mark_routes import marks_bp

    # Projects & Testing
    from app.routes.testing_project import project_bp

    # Register all blueprints with prefixes
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(user_bp, url_prefix="/api/v1/user")
    app.register_blueprint(module_bp, url_prefix="/api/v1/module")
    app.register_blueprint(assignment_bp, url_prefix="/api/v1/assignment")
    app.register_blueprint(submission_bp, url_prefix="/api/v1/submission")
    app.register_blueprint(repo_bp, url_prefix="/api/v1/repo")
    app.register_blueprint(check_naming_bp, url_prefix="/api/v1/naming")
    app.register_blueprint(question_bp, url_prefix="/api/v1/question")
    app.register_blueprint(qgenerate_bp, url_prefix="/api/v1/qgenerate")
    app.register_blueprint(marking_scheme_bp, url_prefix="/api/v1/marking-scheme")
    app.register_blueprint(report_submission_bp, url_prefix="/api/v1/report")
    app.register_blueprint(project_bp, url_prefix="/api/v1/project")
    app.register_blueprint(marks_bp, url_prefix="/api/v1/marks")

    return app

# Create app instance for Gunicorn
app = create_app()

# Run the Flask app directly (for local testing only)
if __name__ == "__main__":
    app.run(debug=True)
