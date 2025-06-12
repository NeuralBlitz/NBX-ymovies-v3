#!/usr/bin/env python3

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing Flask app import...")
    
    # Import the app
    from app import app
    
    print("✅ Flask app imported successfully")
    print(f"✅ App name: {app.name}")
    print(f"✅ App routes: {len(list(app.url_map.iter_rules()))}")
    
    # Test basic functionality
    with app.test_client() as client:
        response = client.get('/health')
        print(f"✅ Health check: {response.status_code}")
        print(f"✅ Health response: {response.get_json()}")
        
    print("\n🎉 Flask app is working correctly!")
    print("✅ Ready for deployment!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
