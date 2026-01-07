#!/usr/bin/env python3
"""
Test the new lab report analyzer
"""

from hospital.services.lab_report_analyzer import LabReportAnalyzer

def test_analyzer():
    print("🧪 Testing New Lab Report Analyzer")
    print("=" * 50)
    
    analyzer = LabReportAnalyzer()
    print(f"Analyzer available: {analyzer.is_available()}")
    print(f"Active provider: {analyzer.active_provider}")
    
    # Test analysis
    result = analyzer.analyze_lab_report('cbc_lab_report.png', 'Please analyze this Complete Blood Count lab report and explain what the results mean')
    
    print(f"Analysis success: {result.get('success')}")
    print(f"Document type: {result.get('document_type')}")
    print(f"Analysis type: {result.get('analysis_type')}")
    print(f"Provider: {result.get('provider')}")
    
    if result.get('analysis'):
        analysis_text = result['analysis']
        print(f"Analysis length: {len(analysis_text)} characters")
        print(f"Analysis preview: {analysis_text[:300]}...")
    
    print("\nKey findings:")
    for finding in result.get('key_findings', []):
        print(f"  - {finding}")
    
    print("\nRecommendations:")
    for rec in result.get('recommendations', []):
        print(f"  - {rec}")

if __name__ == "__main__":
    test_analyzer()