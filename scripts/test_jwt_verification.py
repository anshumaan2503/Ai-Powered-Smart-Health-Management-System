"""
JWT Token Verification Test Script

This script tests if JWT tokens can be properly encoded and decoded
using the current application configuration.
"""

from hospital import create_app
from flask_jwt_extended import create_access_token, decode_token
import sys
import os

def test_jwt_token():
    """Test JWT token creation and decoding"""
    
    print("=" * 60)
    print("JWT TOKEN VERIFICATION TEST")
    print("=" * 60)
    
    # Create app instance
    try:
        app = create_app()
    except Exception as e:
        print(f"❌ Failed to create app: {e}")
        return False
    
    with app.app_context():
        try:
            # Check JWT configuration
            print("\n1. Checking JWT Configuration:")
            print(f"   JWT_SECRET_KEY from config: {app.config.get('JWT_SECRET_KEY')[:10]}... (first 10 chars)")
            print(f"   SECRET_KEY from config: {app.config.get('SECRET_KEY')[:10]}... (first 10 chars)")
            
            # Test 1: Create a token
            print("\n2. Creating access token for user_id=1...")
            test_user_id = 1
            access_token = create_access_token(identity=test_user_id)
            print(f"   ✅ Token created: {access_token[:30]}...{access_token[-10:]}")
            
            # Test 2: Decode the token
            print("\n3. Decoding the token...")
            decoded = decode_token(access_token)
            print(f"   ✅ Token decoded successfully!")
            print(f"   Token payload: {decoded}")
            
            # Test 3: Verify identity
            print("\n4. Verifying token identity...")
            token_user_id = decoded.get('sub')
            if token_user_id == test_user_id:
                print(f"   ✅ Identity matches! Expected: {test_user_id}, Got: {token_user_id}")
            else:
                print(f"   ❌ Identity mismatch! Expected: {test_user_id}, Got: {token_user_id}")
                return False
            
            # Test 4: Check environment variables
            print("\n5. Checking environment variables:")
            jwt_secret_env = os.environ.get('JWT_SECRET_KEY')
            if jwt_secret_env:
                print(f"   JWT_SECRET_KEY is set in environment: {jwt_secret_env[:10]}...")
            else:
                print(f"   ⚠️  JWT_SECRET_KEY is NOT set in environment (using fallback)")
            
            print("\n" + "=" * 60)
            print("✅ ALL TESTS PASSED - JWT configuration is working!")
            print("=" * 60)
            return True
            
        except Exception as e:
            print(f"\n❌ Token verification failed: {e}")
            import traceback
            traceback.print_exc()
            print("\n" + "=" * 60)
            print("❌ TEST FAILED - JWT configuration has issues!")
            print("=" * 60)
            print("\nPossible causes:")
            print("1. JWT_SECRET_KEY mismatch between token creation and decoding")
            print("2. Environment variables not loaded properly")
            print("3. Flask-JWT-Extended configuration issue")
            return False

if __name__ == '__main__':
    success = test_jwt_token()
    sys.exit(0 if success else 1)
