#!/usr/bin/env python3

from hospital.utils.validators import validate_email, validate_password

def test_validation():
    # Test data that might be causing issues
    test_cases = [
        {
            "email": "test@example.com",
            "password": "TestPass123",
            "description": "Valid data"
        },
        {
            "email": "invalid-email",
            "password": "TestPass123", 
            "description": "Invalid email"
        },
        {
            "email": "test@example.com",
            "password": "weak",
            "description": "Weak password"
        },
        {
            "email": "test@example.com",
            "password": "",
            "description": "Empty password"
        }
    ]
    
    for case in test_cases:
        print(f"\nTesting: {case['description']}")
        print(f"Email: {case['email']} -> Valid: {validate_email(case['email'])}")
        print(f"Password: {case['password']} -> Valid: {validate_password(case['password'])}")

if __name__ == "__main__":
    test_validation()