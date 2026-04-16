"""
Simple JWT Token Verification Test
"""

from hospital import create_app
from flask_jwt_extended import create_access_token, decode_token
import sys

def test_jwt():
    app = create_app()
    
    with app.app_context():
        try:
            print("Testing JWT token creation and decoding...")
            
            # Create token
            token = create_access_token(identity=1)
            print(f"Token created: {token[:20]}...")
            
            # Decode token
            decoded = decode_token(token)
            print(f"Token decoded: {decoded}")
            
            # Check identity
            if decoded.get('sub') == 1:
                print("SUCCESS: Token identity matches!")
                return True
            else:
                print("ERROR: Token identity mismatch!")
                return False
                
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == '__main__':
    success = test_jwt()
    sys.exit(0 if success else 1)
