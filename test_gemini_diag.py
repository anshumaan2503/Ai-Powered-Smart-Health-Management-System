import os
import google.generativeai as genai
import traceback

os.environ['GEMINI_API_KEY'] = 'AIzaSyBuQveq-9yjwR_n21bVS5bx5b2VOdXMNMo'
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

output_file = "gemini_error.txt"

try:
    print("Attempting to list models...")
    models = list(genai.list_models())
    print(f"Found {len(models)} models")
    with open(output_file, "w") as f:
        f.write(f"Successfully listed {len(models)} models:\n")
        for m in models:
            f.write(f"{m.name}\n")
            
    print("Attempting to generate content...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello")
    with open(output_file, "a") as f:
        f.write("\nSuccessfully generated content:\n")
        f.write(f"{response.text}\n")
        
except Exception as e:
    print(f"Error occurred: {e}")
    with open(output_file, "w") as f:
        f.write(f"ERROR OCCURRED:\n")
        f.write(f"{str(e)}\n\n")
        f.write(traceback.format_exc())
