from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail

from config import JWT_SECRET_KEY, MAIL_SERVER, MAIL_PORT, MAIL_USE_TLS, MAIL_USERNAME, MAIL_PASSWORD, MAIL_DEFAULT_SENDER

from routes.auth          import auth_bp
from routes.materials     import materials_bp
from routes.requests      import requests_bp
from routes.ranking       import ranking_bp
from routes.gamification  import gamification_bp
from routes.profile       import profile_bp

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"]       = JWT_SECRET_KEY
app.config["MAIL_SERVER"]          = MAIL_SERVER
app.config["MAIL_PORT"]            = MAIL_PORT
app.config["MAIL_USE_TLS"]         = MAIL_USE_TLS
app.config["MAIL_USERNAME"]        = MAIL_USERNAME
app.config["MAIL_PASSWORD"]        = MAIL_PASSWORD
app.config["MAIL_DEFAULT_SENDER"]  = MAIL_DEFAULT_SENDER

jwt  = JWTManager(app)
mail = Mail(app)

app.register_blueprint(auth_bp)
app.register_blueprint(materials_bp)
app.register_blueprint(requests_bp)
app.register_blueprint(ranking_bp)
app.register_blueprint(gamification_bp)
app.register_blueprint(profile_bp)

@app.route("/")
def home():
    return {"message": "EcoCampus API"}

if __name__ == "__main__":
    app.run(debug=True)