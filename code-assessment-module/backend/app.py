from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from routes.repo_routes import repo_routes

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client['projects']

app = Flask(__name__)
CORS(app)

# Pass the database instance to blueprints
app.config['DB'] = db

app.register_blueprint(repo_routes)

@app.route('/')
def index():
    return "GitHub Project Assessment Tool Backend"

if __name__ == '__main__':
    app.run(port=5000, debug=True)
