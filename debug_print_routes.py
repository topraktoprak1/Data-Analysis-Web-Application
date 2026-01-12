import json
from app import app
routes = []
for rule in app.url_map.iter_rules():
    routes.append({'rule': str(rule), 'endpoint': rule.endpoint, 'methods': list(rule.methods)})
print(json.dumps({'routes': routes}, indent=2, ensure_ascii=False))
