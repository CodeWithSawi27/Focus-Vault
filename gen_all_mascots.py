import os
import base64
import re
import time
from google import genai
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# 2. Configure the Client
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: No GOOGLE_API_KEY or GEMINI_API_KEY found in .env file.")
    exit(1)

client = genai.Client(api_key=api_key)

def generate_and_save(prompt_text, filename):
    assets_dir = os.path.join("assets", "mascots")
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
    
    file_path = os.path.join(assets_dir, filename)
    
    if os.path.exists(file_path):
        print(f"Skipping {filename}, already exists.")
        return True

    print(f"Generating {filename}...")
    
    full_prompt = (
        f"{prompt_text}\n\n"
        "IMPORTANT: Provide the image data as a SINGLE Base64 encoded string. "
        "Do not include any other text, markdown formatting (like ```), or labels. "
        "Just the raw base64 string for the PNG image."
    )
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt
        )
        
        raw_text = response.text.strip()
        
        if "```" in raw_text:
            match = re.search(r"```(?:base64)?\s*(.*?)\s*```", raw_text, re.DOTALL)
            if match:
                raw_text = match.group(1).strip()
            else:
                raw_text = raw_text.split("```")[1].strip()

        clean_b64 = re.sub(r'[^A-Za-z0-9+/=]', '', raw_text)
        
        if len(clean_b64) < 100:
            print(f"Skipping {filename}: Response too short or likely text-only.")
            return False

        image_bytes = base64.b64decode(clean_b64)
        
        with open(file_path, "wb") as f:
            f.write(image_bytes)
        print(f"Successfully saved {filename}")
        return True
        
    except Exception as e:
        if "429" in str(e):
            print(f"Rate limit hit for {filename}. Waiting 30s...")
            time.sleep(30) 
        else:
            print(f"Error generating {filename}: {e}")
        return False

def main():
    prompts_file = "mascot_prompts.txt"
    if not os.path.exists(prompts_file):
        print(f"Error: {prompts_file} not found.")
        return

    with open(prompts_file, "r") as f:
        content = f.read()

    blocks = re.split(r'\d+\.\s+', content)[1:]
    
    for block in blocks:
        match = re.search(r"\((.*?\.png)\):", block)
        if match:
            filename = match.group(1)
            prompt_body = block.split("):")[1].strip()
            
            # Retry logic with backoff
            max_retries = 2
            for attempt in range(max_retries):
                success = generate_and_save(prompt_body, filename)
                if success:
                    break
                print(f"Retrying {filename} (Attempt {attempt + 2}/{max_retries})...")
                time.sleep(35) 
            
            time.sleep(15)

if __name__ == "__main__":
    main()
