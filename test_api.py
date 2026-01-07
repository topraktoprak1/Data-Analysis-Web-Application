from app import app
import traceback

try:
    client = app.test_client()
    resp = client.get('/api/kar-zarar-trends?dimension=projects&year=2025&metric=karZarar')
    print('Status:', resp.status_code)
    if resp.status_code != 200:
        print('Response:', resp.data[:1000].decode('utf-8'))
    else:
        print('Success - got data')
except Exception as e:
    print('Error:', str(e))
    traceback.print_exc()
