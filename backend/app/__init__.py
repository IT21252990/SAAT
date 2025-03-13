from flask import Flask
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Initialize Firebase Admin SDK (Only Once)
    cred = credentials.Certificate("firebase-adminsdk.json")
    initialize_app(cred)
    app.db = firestore.client()  # Store Firestore client in app context

    # Import and register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.module_routes import module_bp
    from app.routes.assignment_routes import assignment_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(user_bp, url_prefix="/user")
    app.register_blueprint(module_bp, url_prefix="/module")
    app.register_blueprint(assignment_bp, url_prefix="/assignment")

    return app
