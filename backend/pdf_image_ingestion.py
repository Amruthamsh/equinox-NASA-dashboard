import os
import fitz  # PyMuPDF
from pathlib import Path
from PIL import Image
import io
import json
import re
import base64
from config.config import groq_client

PDF_FOLDER = "./data/papers"
IMAGE_FOLDER = "./data/paper_images"
OUTPUT_JSON = "./data/paper_images_metadata.json"

os.makedirs(IMAGE_FOLDER, exist_ok=True)


def extract_nearby_caption(page_text, image_index):
    lines = page_text.split("\n")
    for line in lines:
        if re.match(r"(Fig(?:ure)?\s*\d+)", line, re.IGNORECASE):
            return line.strip()
    return ""  # fallback if no caption found

def encode_image(img_path):
    """Convert image to base64 string for Groq LLM."""
    with open(img_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

all_images_metadata = []

pdf_files = [f for f in os.listdir(PDF_FOLDER) if f.lower().endswith(".pdf")]

for pdf_file in pdf_files:
    pdf_path = os.path.join(PDF_FOLDER, pdf_file)
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"⚠️ Failed to open {pdf_file}: {e}")
        continue

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_text = page.get_text()
        images = page.get_images(full=True)

        for img_index, img_info in enumerate(images):
            try:
                xref = img_info[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image.get("image")
                if not image_bytes:
                    continue

                im = Image.open(io.BytesIO(image_bytes))
                if im.width < 200 or im.height < 200:
                    continue  # skip tiny images

                ext = base_image.get("ext", "png").lower()
                if ext not in ["png", "jpg", "jpeg", "tiff"]:
                    continue

                image_name = f"{Path(pdf_file).stem}_p{page_index+1}_{img_index+1}.{ext}"
                image_path = os.path.join(IMAGE_FOLDER, image_name)
                with open(image_path, "wb") as f:
                    f.write(image_bytes)

                # Extract caption
                caption = extract_nearby_caption(page_text, img_index)

                # Encode image and get semantic description from Groq
                base64_image = encode_image(image_path)
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": (
                                        "You are an expert at interpreting scientific figures. "
                                        "Describe this image in a detailed, structured way suitable for semantic search. "
                                        "Include: 1) main objects/components, "
                                        "2) relationships/interactions, "
                                        "3) patterns, trends, or anomalies, "
                                        "4) textual elements like labels or axes."
                                    )
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                                },
                            ],
                        }
                    ],
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                )
                description = chat_completion.choices[0].message.content

                all_images_metadata.append({
                    "image": image_path,
                    "caption": caption,
                    "description": description,
                    "pdf": pdf_file
                })

            except Exception as img_e:
                print(f"⚠️ Error extracting or describing image {img_index+1} on page {page_index+1} of {pdf_file}: {img_e}")

# Save metadata to JSON
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(all_images_metadata, f, indent=2)

print(f"✅ Extraction complete. {len(all_images_metadata)} images saved with descriptions. Metadata in {OUTPUT_JSON}")
