import cv2,re
import numpy as np
import pytesseract
from PIL import Image


def preprocess_image(pil_image: Image.Image):
    """
    Convert image to OCR-friendly format
    """
    # Convert PIL → OpenCV
    img = np.array(pil_image)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Resize (VERY IMPORTANT for OCR)
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)

    # Apply threshold
    _, thresh = cv2.threshold(
        gray, 150, 255, cv2.THRESH_BINARY
    )

    return thresh


def ocr_image(pil_image: Image.Image) -> str:
    processed = preprocess_image(pil_image)

    text = pytesseract.image_to_string(
        processed,
        config="--psm 6"  # Assume uniform text blocks
    )

    return text

IGNORE_KEYWORDS = ["date", "total", "day"]

def parse_assets(text: str):
    results = []

    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue

        match = re.search(r"([A-Za-z][A-Za-z ]+)\s*[:\-]?\s*(\d+)", line)
        if match:
            name = match.group(1).strip()

            if any(k in name.lower() for k in IGNORE_KEYWORDS):
                continue

            results.append({
                "asset_name": name,
                "quantity": int(match.group(2)),
                "confidence": 0.9,
            })

    return results
