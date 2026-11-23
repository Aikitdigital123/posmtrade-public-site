"""Prepare a photo or render for the site: crop transparent/empty edges, fit into 640×800 (4:5), save as WebP.

    python3 build/image.py <source image> public/projects/<name>.webp [--fit 640x800]

Used by the Sajtik agent when a colleague sends a new photo; keeps every image on the site light (≈10–60 kB).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("target")
    parser.add_argument("--fit", default="640x800", help="max width x height (default 640x800)")
    args = parser.parse_args()
    target = Path(args.target)
    if target.suffix.lower() != ".webp" or "public" not in target.parts:
        print("target must be a .webp file inside public/", file=sys.stderr)
        return 2
    width, height = (int(v) for v in args.fit.lower().split("x"))
    image = ImageOps.exif_transpose(Image.open(args.source)).convert("RGBA")
    box = image.getchannel("A").getbbox()
    if box and box != (0, 0, *image.size):  # transparent render: drop the empty margins
        image = image.crop(box)
    image.thumbnail((width, height))
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "WEBP", quality=82, method=6)
    print(f"{target} {image.size[0]}x{image.size[1]} {target.stat().st_size // 1024} kB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
