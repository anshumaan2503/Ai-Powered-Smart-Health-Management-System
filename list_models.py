import os
import google.generativeai as genai

# Set the API key directly for the test script
os.environ['GEMINI_API_KEY'] = 'AIzaSyBuQveq-9yjwR_n21bVS5bx5b2VOdXMNMo'
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Name: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
