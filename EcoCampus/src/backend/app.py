from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import JWT_SECRET_KEY

from routes.auth          import auth_bp
from routes.materials     import materials_bp
from routes.requests      import requests_bp
from routes.ranking       import ranking_bp
from routes.gamification  import gamification_bp

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(materials_bp)
app.register_blueprint(requests_bp)
app.register_blueprint(ranking_bp)
app.register_blueprint(gamification_bp)

@app.route("/")
def home():
    return {"message": "EcoCampus API"}

if __name__ == "__main__":
    app.run(debug=True)