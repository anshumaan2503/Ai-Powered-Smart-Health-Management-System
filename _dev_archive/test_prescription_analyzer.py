#!/usr/bin/env python3
"""
Test script for Prescription Analyzer
Tests the functionality without requiring actual files
"""

import os
import sys
import json
from datetime import datetime

def test_analyzer_service():
    """Test the prescription analyzer service"""
    try:
        from hospital.services.prescription_analyzer import PrescriptionAnalyzer
        
        print("🧪 Testing PrescriptionAnalyzer service...")
        analyzer = PrescriptionAnalyzer()
        
        # Test availability
        is_available = analyzer.is_available()
        print(f"   Analyzer available: {is_available}")
        print(f"   API key present: {bool(analyzer.api_key)}")
        print(f"   Init error: {analyzer.init_error}")
        
        # Test fallback analysis
        print("\n🔄 Testing fallback analysis...")
        fallback_result = analyzer._fallback_analysis("test_prescription.pdf")
        print(f"   Fallback result: {json.dumps(fallback_result, indent=2)}")
        
        # Test text analysis
        print("\n🔄 Testing text analysis...")
        sample_text = """
        Dr. John Smith, MD
        General Medicine
        
        Patient: Jane Doe
        Date: 2024-01-05
        
        Rx:
        1. Amoxicillin 500mg - Take 1 tablet twice daily for 7 days
        2. Ibuprofen 400mg - Take 1 tablet as needed for pain
        3. Vitamin D3 1000 IU - Take 1 tablet daily
        
        Refills: 0
        """
        
        text_result = analyzer._fallback_text_analysis(sample_text)
        print(f"   Text analysis result: {json.dumps(text_result, indent=2)}")
        
        # Test validation
        print("\n🔄 Testing prescription validation...")
        test_prescription = {
            'medications': [
                {
                    'name': 'Amoxicillin',
                    'dosage': '500mg',
                    'frequency': 'twice daily',
                    'duration': '7 days'
                },
                {
                    'name': 'Not specified',
                    'dosage': 'Not specified',
                    'frequency': 'Not specified',
                    'duration': 'Not specified'
                }
            ]
        }
        
        validation_result = analyzer.validate_prescription(test_prescription)
        print(f"   Validation result: {json.dumps(validation_result, indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Service test failed: {str(e)}")
        return False

def test_database_model():
    """Test the database model"""
    try:
        from hospital import create_app, db
        from hospital.models.prescription_analysis import PrescriptionAnalysis
        import uuid
        
        print("\n🧪 Testing database model...")
        
        app = create_app()
        with app.app_context():
            # Create tables if they don't exist
            db.create_all()
            
            # Test creating a prescription analysis record
            test_analysis = PrescriptionAnalysis(
                id=str(uuid.uuid4()),
                user_id=1,
                patient_id=1,
                filename="test_prescription.pdf",
                file_type="pdf",
                file_size=1024,
                analysis_result={
                    'success': True,
                    'medications': [
                        {
                            'name': 'Test Medicine',
                            'dosage': '100mg',
                            'frequency': 'daily'
                        }
                    ],
                    'safety_alerts': [],
                    'recommendations': ['Test recommendation']
                },
                confidence_score=0.85,
                is_valid=True,
                analyzer_version='test-v1.0'
            )
            
            # Test to_dict method
            analysis_dict = test_analysis.to_dict()
            print(f"   Model to_dict: {json.dumps(analysis_dict, indent=2, default=str)}")
            
            # Test helper methods
            medications = test_analysis.get_medications()
            print(f"   Extracted medications: {medications}")
            
            safety_alerts = test_analysis.get_safety_alerts()
            print(f"   Safety alerts: {safety_alerts}")
            
            recommendations = test_analysis.get_recommendations()
            print(f"   Recommendations: {recommendations}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database model test failed: {str(e)}")
        return False

def test_api_endpoints():
    """Test API endpoints (without actual HTTP requests)"""
    try:
        print("\n🧪 Testing API route imports...")
        
        from hospital.routes.prescription_analyzer import prescription_bp
        print(f"   Blueprint name: {prescription_bp.name}")
        print(f"   Blueprint URL prefix: /api/prescription")
        
        # List available endpoints
        endpoints = []
        for rule in prescription_bp.url_map.iter_rules():
            if rule.endpoint.startswith(prescription_bp.name):
                endpoints.append({
                    'endpoint': rule.endpoint,
                    'methods': list(rule.methods - {'HEAD', 'OPTIONS'}),
                    'rule': rule.rule
                })
        
        print("   Available endpoints:")
        for endpoint in endpoints:
            print(f"     {endpoint['methods']} {endpoint['rule']}")
        
        return True
        
    except Exception as e:
        print(f"❌ API endpoints test failed: {str(e)}")
        return False

def test_dependencies():
    """Test if required dependencies are installed"""
    print("🧪 Testing dependencies...")
    
    dependencies = [
        ('PIL', 'Pillow'),
        ('PyPDF2', 'PyPDF2'),
        ('google.generativeai', 'google-generativeai (optional)')
    ]
    
    all_good = True
    for module, package in dependencies:
        try:
            __import__(module)
            print(f"   ✅ {package} is installed")
        except ImportError:
            if 'optional' in package:
                print(f"   ⚠️  {package} is not installed (optional)")
            else:
                print(f"   ❌ {package} is not installed")
                all_good = False
    
    return all_good

def main():
    """Main test function"""
    print("🏥 Prescription Analyzer Test Suite")
    print("=" * 50)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Analyzer Service", test_analyzer_service),
        ("Database Model", test_database_model),
        ("API Endpoints", test_api_endpoints)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name} test...")
        try:
            if test_func():
                print(f"✅ {test_name} test passed")
                passed += 1
            else:
                print(f"❌ {test_name} test failed")
        except Exception as e:
            print(f"❌ {test_name} test crashed: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Prescription Analyzer is ready to use.")
        print("\n🚀 Quick start:")
        print("1. Set GEMINI_API_KEY in your .env file (optional)")
        print("2. Run: python start.py")
        print("3. Visit: http://localhost:3000/prescription-analyzer")
        print("4. Test API: curl -X GET http://localhost:5000/api/prescription/test-analyzer")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        if passed < total:
            print("\n💡 Common fixes:")
            print("- Install missing dependencies: pip install Pillow PyPDF2")
            print("- Run database migration: python -c 'from hospital import create_app, db; app=create_app(); app.app_context().push(); db.create_all()'")
            print("- Check your Python environment")

if __name__ == "__main__":
    main()