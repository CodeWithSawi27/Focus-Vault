import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# 2. Configure the Client
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: No GOOGLE_API_KEY or GEMINI_API_KEY found in .env file.")
    exit(1)

client = genai.Client(api_key=api_key)

def try_imagen():
    """Attempt image generation using Imagen 4.0 (requires paid plan)."""
    print("Attempting to use Imagen 4.0...")
    try:
        model_id = 'imagen-4.0-generate-001'
        prompt = "A minimalist owl mascot logo, clean lines, flat design, modern, suitable for a productivity app called FocusVault, high contrast, circular composition, professional, vector style, white background."
        
        response = client.models.generate_images(
            model=model_id,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                include_rai_reason=True,
                output_mime_type='image/png'
            )
        )
        
        if response.generated_images:
            image_data = response.generated_images[0].image.image_bytes
            return image_data
        return None
    except Exception as e:
        if "paid plans" in str(e):
            print("Imagen 3/4 requires a paid plan. Falling back to Gemini text-to-image request...")
        else:
            print(f"Imagen error: {e}")
        return None

def try_gemini():
    """Attempt to get an image description or base64 from Gemini 2.0 Flash."""
    print("Attempting to use Gemini 2.0 Flash...")
    try:
        model_id = 'gemini-2.0-flash'
        prompt = "Generate a minimalist owl mascot logo for a productivity app named FocusVault. If you can return base64 encoded PNG data, do so. Otherwise, describe the ideal mascot design in detail."
        
        response = client.models.generate_content(
            model=model_id,
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        return None

def save_image(image_bytes, filename="mascot.png"):
    assets_dir = "assets"
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
    
    file_path = os.path.join(assets_dir, filename)
    with open(file_path, "wb") as f:
        f.write(image_bytes)
    print(f"Successfully saved mascot to {file_path}")

def main():
    # 1. Try Imagen (Paid Plan)
    image_data = try_imagen()
    
    if image_data:
        save_image(image_data)
        return

    # 2. Fallback to Gemini (Free Tier/Text)
    result = try_gemini()
    if result:
        print("\nGemini Response:")
        print(result)
        print("\nNote: Gemini free tier usually returns text. If it provided base64, you can decode it manually.")
    else:
        print("Both generation attempts failed. Check your API key, plan, and quota.")

if __name__ == "__main__":
    main()

