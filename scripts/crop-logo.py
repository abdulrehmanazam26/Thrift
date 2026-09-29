"""Crop the supplied logo's empty canvas while preserving the original as source."""
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance

source = Path(r"C:\Users\arehman\Downloads\ChatGPT Image Sep 29, 2026, 11_17_39 PM.png")
target = Path(__file__).resolve().parents[1] / "public" / "images" / "thrift-vault-logo.png"
with Image.open(source).convert("RGBA") as image:
    background = Image.new("RGBA", image.size, image.getpixel((0, 0)))
    difference = ImageChops.difference(image, background).convert("L")
    difference = ImageEnhance.Contrast(difference).enhance(4)
    mask = difference.point(lambda pixel: 255 if pixel > 18 else 0)
    bbox = mask.getbbox()
    if not bbox:
        raise SystemExit("Could not find logo content")
    left, top, right, bottom = bbox
    padding = 26
    crop = image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))
    crop.save(target, optimize=True)
    print(f"Saved {target} at {crop.width}x{crop.height}")
