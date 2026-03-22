"""
JWT Token Verification Test - Fixed Version
"""

from hospital import create_app
from flask_jwt_extended import create_access_token, decode_token
import sys

def test_jwt():
    app = create_app()
    
    with app.app_context():
        try:
            print("\n" + "=" * 60)
            print("JWT TOKEN VERIFICATION TEST")
            print("=" * 60 + "\n")
            
            print("1. Testing token creation with STRING identity...")
            # IMPORTANT: Flask-JWT-Extended requires string identity!
            token = create_access_token(identity="1")
            print(f"   ✓ Token created successfully: {token[:30]}...")
            
            print("\n2. Testing token decoding...")
            decoded = decode_token(token)
            print(f"   ✓ Token decoded successfully!")
            print(f"   Payload: {decoded}")
            
            print("\n3. Verifying identity value...")
            identity = decoded.get('sub')
            print(f"   Identity from token: {repr(identity)}")
            print(f"   Identity type: {type(identity).__name__}")
            
            if identity == "1":
                print("\n" + "=" * 60)
                print("✓ ALL TESTS PASSED!")
                print("=" * 60 + "\n")
                return True
            else:
                print(f"\n   ✗ ERROR: Expected '1', got {repr(identity)}")
                return False
                
        except Exception as e:
            print(f"\n✗ ERROR: {e}")
            import traceback
            traceback.print_exc()
            print("\n" + "=" * 60)
            print("✗ TEST FAILED")
            print("=" * 60 + "\n")
            return False

if __name__ == '__main__':
    success = test_jwt()
    sys.exit(0 if success else 1)
