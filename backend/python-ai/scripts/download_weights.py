import os
import urllib.request
from pathlib import Path

# TODO: Replace this URL with your actual shared link (e.g., an AWS S3 URL, GitHub release, etc.)
# If you are using Google Drive, you may want to 'pip install gdown' instead of using urllib.
WEIGHTS_URL = "https://github.com/ultralytics/assets/releases/download/v8.1.0/yolov8n.pt"

# Resolve paths relative to this script (backend/python-ai/scripts/)
BASE_DIR = Path(__file__).resolve().parent.parent
TARGET_DIR = BASE_DIR / "ml_core" / "base_weights"
TARGET_FILE = TARGET_DIR / "yolov8n.pt"

def download_weights():
    print(f"Ensuring target directory exists at {TARGET_DIR}...")
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    if TARGET_FILE.exists():
        print(f"✅ Weights already exist at {TARGET_FILE}. Skipping download.")
        return

    print(f"⏳ Downloading weights from {WEIGHTS_URL}...")
    try:
        # Download the file
        urllib.request.urlretrieve(WEIGHTS_URL, TARGET_FILE)
        print(f"✅ Successfully downloaded weights to {TARGET_FILE}!")
    except Exception as e:
        print(f"❌ Failed to download weights. Error: {e}")
        print("Please manually download the weights and place them in the 'ml_core/base_weights/' directory.")

if __name__ == "__main__":
    download_weights()
