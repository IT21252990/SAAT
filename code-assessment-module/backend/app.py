from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from routes.repo_routes import repo_routes
from routes.file_upload_routes import file_upload_routes

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client['saat']

app = Flask(__name__)
CORS(app)

# Pass the database instance to blueprints
app.config['DB'] = db

app.register_blueprint(repo_routes)
app.register_blueprint(file_upload_routes)

@app.route('/')
def index():
    return "GitHub Project Assessment Tool Backend"

if __name__ == '__main__':
    app.run(port=5000, debug=True)
