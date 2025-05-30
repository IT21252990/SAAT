import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app

load_dotenv()  # Load environment variables from .env

# Get Firebase credentials path from environment
firebase_json  = os.getenv("FIREBASE_CREDENTIALS")

if not firebase_json :
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set!")

def create_app():
    app = Flask(__name__)
    CORS(app)

    cred_dict = json.loads(firebase_json)
    # Initialize Firebase Admin SDK (Only Once)
    cred = credentials.Certificate(cred_dict)
    initialize_app(cred)

    app.db = firestore.client()  # Store Firestore client in app context

    # Import and register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.module_routes import module_bp
    from app.routes.assignment_routes import assignment_bp
    from app.routes.submission_routes import submission_bp
    from app.routes.code.repo_routes import repo_bp
    from app.routes.code.repo_analysis_routes import check_naming_bp

    from app.routes.report_routes import marking_scheme_bp
    from app.routes.report_routes import report_submission_bp

    from app.routes.question.question_routes import question_bp
    from app.routes.question.gemini_question_gen_routes import qgenerate_bp

    from app.routes.testing_project import project_bp
    from app.routes.mark_routes import marks_bp

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
