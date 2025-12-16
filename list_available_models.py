import os
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print("="*60)
print("AVAILABLE GEMINI MODELS")
print("="*60)
print()

try:
    models = genai.list_models()
    
    generate_models = []
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            generate_models.append(model)
            print(f"✅ {model.name}")
            print(f"   Display Name: {model.display_name}")
            print(f"   Methods: {', '.join(model.supported_generation_methods)}")
            print()
    
    if generate_models:
        print("="*60)
        print(f"Found {len(generate_models)} models that support generateContent")
        print("="*60)
        print()
        print("Recommended models to try:")
        for model in generate_models[:3]:
            model_id = model.name.replace('models/', '')
            print(f"  - {model_id}")
    else:
        print("❌ No models found that support generateContent!")
        
except Exception as e:
    print(f"❌ Error listing models: {e}")
