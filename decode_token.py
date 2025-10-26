#!/usr/bin/env python3

import base64
import json

def decode_jwt_payload(token):
    # Split the token and get the payload part
    parts = token.split('.')
    if len(parts) != 3:
        print("Invalid JWT token format")
        return
    
    # Decode the payload (add padding if needed)
    payload = parts[1]
    # Add padding if needed
    payload += '=' * (4 - len(payload) % 4)
    
    try:
        decoded = base64.b64decode(payload)
        payload_data = json.loads(decoded)
        print("JWT Payload:")
        print(json.dumps(payload_data, indent=2))
        return payload_data
    except Exception as e:
        print(f"Error decoding token: {e}")

if __name__ == "__main__":
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc2MDc5NjQ2MiwianRpIjoiMDgzZmNmYzYtZTYxMC00NzA2LWExMDAtZDkwNDhjZTVjNTExIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNzYwNzk2NDYyLCJleHAiOjE3NjA4MDAwNjJ9.lTplJtrXGYrO9rpwwZIncgy_tjm-nFfTP7NpIW4mnJ8"
    decode_jwt_payload(token)