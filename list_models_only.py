import os
import google.generativeai as genai

os.environ['GEMINI_API_KEY'] = 'AIzaSyBuQveq-9yjwR_n21bVS5bx5b2VOdXMNMo'
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

output_file = "gemini_models.txt"

print("Listing models...")
try:
    models = list(genai.list_models())
    with open(output_file, "w") as f:
        f.write(f"Found {len(models)} models:\n")
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"NAME: {m.name}\n")
    print("Done")
except Exception as e:
    print(f"Error: {e}")
