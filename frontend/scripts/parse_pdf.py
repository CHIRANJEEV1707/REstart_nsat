import fitz  # pymupdf
import json
import re
import os

PDF_PATH = "data/nsat-mock.pdf"
OUTPUT_JSON = "data/nsat_parsed.json"
IMAGE_DIR = "public/q-images"

def extract_pdf_data():
    doc = fitz.open(PDF_PATH)
    data = {"title": "NSAT Mock Test from PDF", "questions": []}
    
    current_section = "General"
    current_q = None
    
    # Regex patterns (Simple heuristics, adjustments might be needed based on real PDF)
    # Patters like "Q.1", "1.", "Q1" at start of line
    q_pattern = re.compile(r'^\s*(?:Q\.?|Question)?\s*(\d+)[\.:]\s*(.*)', re.IGNORECASE)
    # Options A) B) C) D) OR (1) (2) (3) (4) OR 1. 2.
    # We will try to capture inline options in text too if possible, 
    # but for now let's match lines starting with these.
    opt_pattern = re.compile(r'^\s*(?:[A-E]|[1-5])[\)\.]\s+(.*)', re.IGNORECASE)
    
    # Inline options pattern (e.g. " (1) Apple (2) Banana ...")
    inline_opt_pattern = re.compile(r'\(([1-5A-E])\)\s*([^(\n]*)')

    # Answer: B or Answer: 2
    ans_pattern = re.compile(r'^\s*(?:Answer|Ans)[\.:-]?\s*([A-E1-5])', re.IGNORECASE)
    # Explanation: ...
    expl_pattern = re.compile(r'^\s*(?:Explanation|Sol)[\.:-]?\s*(.*)', re.IGNORECASE)
    # Section header detection (simple caps or specific keywords if known)
    sec_pattern = re.compile(r'^\s*(PHYSICS|CHEMISTRY|MATHEMATICS|BIOLOGY|LOGICAL REASONING)\s*$', re.IGNORECASE)

    # Global image counter
    img_counter = 0

    for page_num, page in enumerate(doc):
        # 1. Extract Images
        image_list = page.get_images(full=True)
        page_images = []
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            ext = base_image["ext"]
            img_filename = f"img_{page_num+1}_{img_index+1}.{ext}"
            img_path = os.path.join(IMAGE_DIR, img_filename)
            
            with open(img_path, "wb") as f:
                f.write(image_bytes)
            
            # Identify location (rect) of image to associate with text if possible
            # For now, we store valid public URL
            page_images.append({
                "url": f"/q-images/{img_filename}",
                "xref": xref,
                "rect": page.get_image_bbox(img) # Returns rect of image
            })

        # 2. Extract Text Blocks with layout
        blocks = page.get_text("dict")["blocks"]
        # Sort blocks by vertical position to read top-down
        blocks.sort(key=lambda b: b["bbox"][1])

        for b in blocks:
            # Check for image blocks from 'dict' structure if distinct, 
            # layout-preserving text extraction usually handles text blocks.
            # We match images by proximity if needed, but for now let's focus on text flow.
            
            if b["type"] == 0: # Text block
                for line in b["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text: continue
                        
                        # --- Section Detection ---
                        sec_match = sec_pattern.match(text)
                        if sec_match:
                            current_section = sec_match.group(1).title()
                            continue

                        # --- Question Start ---
                        q_match = q_pattern.match(text)
                        if q_match:
                            # Save previous question
                            if current_q:
                                data["questions"].append(current_q)
                            
                            # Start new question
                            current_q = {
                                "id": int(q_match.group(1)),
                                "section": current_section,
                                "text": q_match.group(2).strip(),
                                "options": [],
                                "answer": "",
                                "explanation": "",
                                "images": [],
                                "page": page_num + 1
                            }
                            
                            # Check for inline options in the question text immediately
                            # e.g. "Question text? (1) Opt1 (2) Opt2..."
                            # NOTE: This overrides options if found line by line later, which is fine
                            inline_opts = inline_opt_pattern.findall(current_q["text"])
                            if inline_opts:
                                for oid, otext in inline_opts:
                                    current_q["options"].append({
                                        "id": oid,
                                        "text": otext.strip()
                                    })
                                # Remove options from text for cleaner display? 
                                # Maybe keep them if it breaks context, but usually better to remove.
                                # Let's keep text as is for safety, or minimal cleanup.
                            
                            continue

                        # --- Options (Line-based) ---
                        opt_match = opt_pattern.match(text)
                        if opt_match and current_q:
                            # Avoid capturing "1.2 meters" as option 1
                            # Check if previous line ended with question text or this starts fresh
                            current_q["options"].append({
                                "id": text.split(')')[0].strip().split('.')[0].strip(), # Extract ID rough
                                "text": opt_match.group(1).strip()
                            })
                            continue
                        
                        # --- Answer ---
                        ans_match = ans_pattern.match(text)
                        if ans_match and current_q:
                            current_q["answer"] = ans_match.group(1).upper()
                            continue

                        # --- Explanation ---
                        expl_match = expl_pattern.match(text)
                        if expl_match and current_q:
                            current_q["explanation"] = expl_match.group(1)
                            continue
                            
                        # --- Append to current field context ---
                        if current_q:
                            # Check for inline options in continuation lines too
                            inline_opts = inline_opt_pattern.findall(text)
                            if inline_opts and not current_q["answer"] and not current_q["explanation"]:
                                 for oid, otext in inline_opts:
                                    current_q["options"].append({
                                        "id": oid,
                                        "text": otext.strip()
                                    })
                                 continue # Don't append this line to text if it's purely options?
                                 # Risk: "The set (1) is larger than (2)" -> parsed as options.
                                 # Heuristic: Options usually come AFTER question text.
                            
                            if current_q["answer"]:
                                current_q["explanation"] += " " + text
                            elif len(current_q["options"]) > 0:
                                # Append to last option
                                current_q["options"][-1]["text"] += " " + text
                            else:
                                current_q["text"] += " " + text
        
        # After page processing, associate images based on vertical position
        if page_images and (len(data["questions"]) > 0 or current_q):
             # Simple logic: Assign image to the 'current' question active at page end 
             # OR find quesions on this page.
             # This is tricky. Let's dump images into a debug field for now.
             pass

    # Save last question
    if current_q:
        data["questions"].append(current_q)

    # Write JSON
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    
    print(f"Parsed {len(data['questions'])} questions. Saved to {OUTPUT_JSON}")

if __name__ == "__main__":
    extract_pdf_data()
