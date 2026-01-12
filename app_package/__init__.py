from flask import Flask
from flask_cors import CORS
from .config import Config
from .models import db

def create_app(test_config=None):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    CORS(app, supports_credentials=True, origins=[app.config.get('FRONTEND_ORIGIN', 'http://localhost:3000')])

    db.init_app(app)

    # Register blueprints
    try:
        from .routes.api import api_bp
        app.register_blueprint(api_bp, url_prefix='/api')
    except Exception:
        pass

    return app
