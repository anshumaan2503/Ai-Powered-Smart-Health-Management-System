#!/usr/bin/env python3
"""
Clear Browser Data Script
Help users clear browser storage to fix redirect issues
"""

import webbrowser
import time

def create_clear_page():
    """Create a simple HTML page to clear browser storage"""
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clear Browser Data - Hospital Management System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #45a049;
        }
        .btn-danger {
            background: #f44336;
        }
        .btn-danger:hover {
            background: #da190b;
        }
        .status {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }
        .status.success {
            background: rgba(76, 175, 80, 0.3);
            border: 1px solid #4CAF50;
        }
        .status.info {
            background: rgba(33, 150, 243, 0.3);
            border: 1px solid #2196F3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Hospital Management System</h1>
        <h2>Clear Browser Data</h2>
        
        <p>If you're being automatically redirected to the dashboard instead of seeing the landing page, 
        you need to clear your browser's stored login data.</p>
        
        <div id="status" class="status"></div>
        
        <div>
            <button class="btn btn-danger" onclick="clearAllData()">
                🗑️ Clear All Data & Reload
            </button>
            <button class="btn" onclick="goToLanding()">
                🏠 Go to Landing Page
            </button>
            <button class="btn" onclick="goToDashboard()">
                📊 Go to Dashboard
            </button>
        </div>
        
        <div style="margin-top: 30px; text-align: left;">
            <h3>Manual Steps:</h3>
            <ol>
                <li>Press <strong>F12</strong> to open Developer Tools</li>
                <li>Go to <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)</li>
                <li>Click on <strong>Local Storage</strong> → <strong>http://localhost:3000</strong></li>
                <li>Click <strong>Clear All</strong> or delete individual items</li>
                <li>Refresh the page</li>
            </ol>
        </div>
    </div>

    <script>
        function showStatus(message, type = 'info') {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
        }

        function clearAllData() {
            try {
                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();
                
                // Clear cookies for localhost
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                showStatus('✅ All data cleared! Redirecting to landing page...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'http://localhost:3000?home=true';
                }, 2000);
                
            } catch (error) {
                showStatus('❌ Error clearing data: ' + error.message, 'error');
            }
        }

        function goToLanding() {
            window.location.href = 'http://localhost:3000?home=true';
        }

        function goToDashboard() {
            window.location.href = 'http://localhost:3000/dashboard';
        }

        // Auto-clear on page load if requested
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auto') === 'true') {
            clearAllData();
        }
    </script>
</body>
</html>
    """
    
    with open('clear_browser_data.html', 'w') as f:
        f.write(html_content)
    
    return 'clear_browser_data.html'

def main():
    """Main function"""
    print("🧹 Browser Data Cleaner for Hospital Management System")
    print("=" * 60)
    
    print("Creating browser data clearing page...")
    html_file = create_clear_page()
    
    print(f"✅ Created: {html_file}")
    print("\n🌐 Opening in browser...")
    
    try:
        webbrowser.open(f'file://{html_file}')
        print("✅ Browser opened successfully!")
        
        print("\n💡 Instructions:")
        print("1. Click 'Clear All Data & Reload' to fix redirect issues")
        print("2. Or follow the manual steps shown on the page")
        print("3. After clearing, go to http://localhost:3000 to see the landing page")
        
    except Exception as e:
        print(f"❌ Could not open browser: {e}")
        print(f"💡 Manually open: {html_file}")

if __name__ == "__main__":
    main()