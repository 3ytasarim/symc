"""One-off asset preparation (run once, locally) — NOT part of the app runtime.

Copies the verified original symc.com.tr media into prisma/seed-assets with
semantic filenames. PNG screen captures of photographs are stored as JPEG
(quality 88) so the public originals are web-sized; JPEGs are copied
byte-for-byte unless they exceed maxWidth. Brand assets (transparent logo,
light logo, favicon) are derived from the original SYMC logo.
Usage: python3 scripts/asset-prep/prepare.py <dir-with-downloaded-originals>
"""
import json, os, shutil, sys
from PIL import Image

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "prisma", "seed-assets")
manifest = json.load(open(os.path.join(os.path.dirname(__file__), "manifest.json")))

for item in manifest["images"]:
    src = os.path.join(SRC, item["src"])
    dest = os.path.join(OUT, item["dest"])
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im = Image.open(src)
    max_w = item.get("maxWidth")
    if im.format == "JPEG" and (not max_w or im.width <= max_w):
        shutil.copyfile(src, dest)
    else:
        im = im.convert("RGB")
        if max_w and im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        im.save(dest, "JPEG", quality=88 if not max_w else 82, optimize=True, progressive=True)
    print(dest.replace(ROOT + "/", ""), Image.open(dest).size)

# ---- brand assets from the original logo (white background -> alpha) ----
brand = os.path.join(ROOT, "public", "brand")
os.makedirs(brand, exist_ok=True)
logo = Image.open(os.path.join(SRC, "SYMC_Logo_New-1.png")).convert("RGBA")

def knock_out_white(img):
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            m = min(r, g, b)
            if m > 200:  # near white -> transparent, feather edge pixels
                alpha = max(0, int((255 - m) * 255 / 55))
                px[x, y] = (r, g, b, min(a, alpha))
    return img

dark = knock_out_white(logo.copy())
dark = dark.crop(dark.getbbox())
dark.thumbnail((1200, 1200), Image.LANCZOS)
dark.save(os.path.join(brand, "symc-logo.png"), optimize=True)

light = dark.copy()
px = light.load()
for y in range(light.height):
    for x in range(light.width):
        r, g, b, a = px[x, y]
        # charcoal wordmark / tagline -> white; keep red & blue sails
        if a and abs(r - g) < 25 and abs(g - b) < 25 and r < 150:
            px[x, y] = (255, 255, 255, a)
light.save(os.path.join(brand, "symc-logo-light.png"), optimize=True)

# sail mark (upper part of the logo) for favicon / app icon
w, h = dark.size
bbox_rows = [y for y in range(h) if any(dark.getpixel((x, y))[3] > 0 and dark.getpixel((x, y))[0] > 180 and dark.getpixel((x, y))[1] < 120 for x in range(0, w, 3))]
top, bottom = 0, (max(bbox_rows) + 4 if bbox_rows else h // 2)
mark = dark.crop((0, top, w, bottom))
mark = mark.crop(mark.getbbox())
side = max(mark.size) + 40
icon = Image.new("RGBA", (side, side), (255, 255, 255, 0))
icon.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2), mark)
icon.resize((512, 512), Image.LANCZOS).save(os.path.join(ROOT, "src", "app", "icon.png"))
bg = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
m2 = icon.resize((150, 150), Image.LANCZOS)
bg.paste(m2, (15, 15), m2)
bg.convert("RGB").save(os.path.join(ROOT, "src", "app", "apple-icon.png"))
icon.resize((48, 48), Image.LANCZOS).save(os.path.join(ROOT, "src", "app", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print("brand assets written")
