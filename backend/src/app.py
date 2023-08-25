from flask import Flask, session, request, g
import sqlalchemy.engine.url as url
from flask_login import LoginManager
from .models import db
from .auth_utils import load_user
from pathlib import Path
from flask_cors import CORS
import os
from flask_seasurf import SeaSurf

DB_URL = url.make_url(f"sqlite:///{Path(__file__).parents[1]}/elf.db")
login_manager = LoginManager()
csrf = SeaSurf()


def create_app():
    from .auth import bp as auth_bp
    from .api import bp as api_bp

    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]

    app.config["SQLALCHEMY_DATABASE_URI"] = DB_URL
    db.init_app(app)

    login_manager.user_loader(load_user)
    login_manager.init_app(app)
    cors = CORS(
        app,
        resources=["/auth/*", "/api/*"],
        origins=["http://localhost:3000", "http://dannypinghero.me"],
        supports_credentials=True,
        expose_headers="*",
    )

    app.config["CSRF_COOKIE_HTTPONLY"] = False
    csrf.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
