"""
Performance Testing Script
Tests API response times for hospital dashboard endpoints

Usage:
    python scripts/test_performance.py
"""

import requests
import time
import json
from statistics import mean, median

# Configuration
BASE_URL = "http://localhost:5000"
TEST_ITERATIONS = 10

# Test credentials (update with your test account)
TEST_EMAIL = "admin@hospital.com"
TEST_PASSWORD = "admin123"

def get_auth_token():
    """Login and get JWT token"""
    print("🔐 Authenticating...")
    response = requests.post(
        f"{BASE_URL}/api/hospital-auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if response.status_code == 200:
        token = response.json().get('access_token')
        print("✅ Authentication successful")
        return token
    else:
        print(f"❌ Authentication failed: {response.status_code}")
        print(response.text)
        return None

def test_endpoint(url, headers, name):
    """Test endpoint performance"""
    times = []
    
    print(f"\n📊 Testing: {name}")
    print(f"   URL: {url}")
    
    for i in range(TEST_ITERATIONS):
        start = time.time()
        response = requests.get(url, headers=headers)
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        if response.status_code == 200:
            times.append(elapsed)
            print(f"   Iteration {i+1}: {elapsed:.2f}ms")
        else:
            print(f"   Iteration {i+1}: FAILED ({response.status_code})")
    
    if times:
        avg_time = mean(times)
        med_time = median(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"\n   Results:")
        print(f"   ├─ Average: {avg_time:.2f}ms")
        print(f"   ├─ Median:  {med_time:.2f}ms")
        print(f"   ├─ Min:     {min_time:.2f}ms")
        print(f"   └─ Max:     {max_time:.2f}ms")
        
        # Performance rating
        if avg_time < 100:
            rating = "🚀 EXCELLENT"
        elif avg_time < 200:
            rating = "✅ GOOD"
        elif avg_time < 500:
            rating = "⚠️  ACCEPTABLE"
        else:
            rating = "❌ NEEDS OPTIMIZATION"
        
        print(f"   Rating: {rating}")
        
        return {
            'name': name,
            'avg': avg_time,
            'median': med_time,
            'min': min_time,
            'max': max_time,
            'rating': rating
        }
    
    return None

def main():
    """Run performance tests"""
    print("=" * 70)
    print("Hospital Dashboard Performance Test")
    print("=" * 70)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Define test endpoints
    endpoints = [
        {
            'url': f"{BASE_URL}/api/hospital/staff?per_page=50",
            'name': "Staff List (50 items)"
        },
        {
            'url': f"{BASE_URL}/api/hospital/patients?per_page=50",
            'name': "Patients List (50 items)"
        },
        {
            'url': f"{BASE_URL}/api/hospital/pharmacy/medicines?per_page=50",
            'name': "Medicines List (50 items)"
        },
        {
            'url': f"{BASE_URL}/api/hospital/pharmacy/dashboard-stats",
            'name': "Pharmacy Dashboard Stats"
        },
        {
            'url': f"{BASE_URL}/api/hospital/analytics/dashboard",
            'name': "Analytics Dashboard"
        }
    ]
    
    # Run tests
    results = []
    for endpoint in endpoints:
        result = test_endpoint(endpoint['url'], headers, endpoint['name'])
        if result:
            results.append(result)
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print("\n" + "=" * 70)
    print("Performance Summary")
    print("=" * 70)
    
    print(f"\n{'Endpoint':<35} {'Avg Time':<12} {'Rating'}")
    print("-" * 70)
    
    for result in results:
        print(f"{result['name']:<35} {result['avg']:>8.2f}ms   {result['rating']}")
    
    # Overall assessment
    avg_all = mean([r['avg'] for r in results])
    print("\n" + "=" * 70)
    print(f"Overall Average Response Time: {avg_all:.2f}ms")
    
    if avg_all < 150:
        print("🎉 EXCELLENT! All endpoints are highly optimized!")
    elif avg_all < 200:
        print("✅ GOOD! Target sub-200ms achieved!")
    elif avg_all < 300:
        print("⚠️  ACCEPTABLE but could be improved")
    else:
        print("❌ NEEDS OPTIMIZATION - Review indexes and queries")
    
    print("=" * 70)
    
    # Save results to file
    with open('performance_results.json', 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'base_url': BASE_URL,
            'iterations': TEST_ITERATIONS,
            'results': results,
            'overall_avg': avg_all
        }, f, indent=2)
    
    print("\n📄 Results saved to: performance_results.json")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
