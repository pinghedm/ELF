from flask import Flask
import sqlalchemy.engine.url as url
from flask_login import LoginManager
from .models import db
from .auth_utils import load_user
from pathlib import Path
from flask_cors import CORS
import os
from flask_wtf import CSRFProtect
from flask_wtf.csrf import generate_csrf

DB_URL = url.make_url(f"sqlite:///{Path(__file__).parents[1]}/elf.db")
login_manager = LoginManager()
csrf = CSRFProtect()


def create_app():
    from .auth import bp as auth_bp

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL
    app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]
    app.config["SESSION_COOKIE_DOMAIN"] = "http://localhost:3000"
    db.init_app(app)
    login_manager.user_loader(load_user)
    login_manager.init_app(app)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    cors = CORS(
        app,
        resources=["/auth/*", "/api/*"],
        origins=["http://localhost:3000", "http://dannypinghero.me"],
        supports_credentials=True,
        expose_headers="*",
    )
    csrf.init_app(app)

    @app.after_request
    def inject_csrf_token(response):
        response.set_cookie("csrf_token", generate_csrf())
        return response

    return app
