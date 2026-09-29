"""Encode a campaign asset and its responsive variants without altering its content."""
from pathlib import Path
from PIL import Image
import sys

source = Path(sys.argv[1])
name = sys.argv[2]
destination = Path(__file__).resolve().parents[1] / "public" / "images"
with Image.open(source) as original:
    image = original.convert("RGB")
    image.save(destination / f"{name}.webp", quality=88, method=6)
    for width in (160, 320, 480, 640, 960, 1400, 1920):
        actual_width = min(width, image.width)
        height = round(image.height * actual_width / image.width)
        image.resize((actual_width, height), Image.Resampling.LANCZOS).save(
            destination / "responsive" / f"{name}-{width}.webp", quality=84, method=6
        )
    print(f"Encoded {name}: {image.width}x{image.height}; 7 responsive variants.")
