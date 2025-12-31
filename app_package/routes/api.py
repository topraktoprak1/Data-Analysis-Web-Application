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


# Mock implementation of /api/stats endpoint
@api_bp.route('/stats', methods=['GET'])
def stats():
    # TODO: Replace with real data fetching logic
    apcb_count = 11851
    subcon_count = 8635
    total_count = apcb_count + subcon_count
    return jsonify({
        "apcb": apcb_count,
        "subcon": subcon_count,
        "total": total_count
    })
