from flask import Blueprint, jsonify, request, current_app

api_bp = Blueprint('api', __name__)


@api_bp.route('/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask API"})


@api_bp.route('/status', methods=['GET'])
def status():
    return jsonify({"status": "ok"})


@api_bp.route('/echo', methods=['POST'])
def echo():
    data = request.get_json(silent=True) or {}
    return jsonify({"received": data})
