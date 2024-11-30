from flask import Flask
from flask_cors import CORS
from routes.repo_routes import repo_routes

app = Flask(__name__)
CORS(app)

app.register_blueprint(repo_routes)

@app.route('/')
def index():
    return "GitHub Project Assessment Tool Backend"

if __name__ == '__main__':
    app.run(port=5000, debug=True)
