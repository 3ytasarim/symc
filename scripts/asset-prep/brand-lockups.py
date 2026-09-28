"""Derives the horizontal header lockups and the sail-mark icons from the
logos written by prepare.py (run after it). Content bands of the stacked
logo: sails y 0-585, SYMC wordmark y 690-902, taglines below."""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = lambda *p: os.path.join(ROOT, *p)

def trim(i):
    return i.crop(i.getbbox())

for name in ["symc-logo", "symc-logo-light"]:
    im = Image.open(P("public", "brand", f"{name}.png"))
    sails = trim(im.crop((0, 0, im.width, 585)))
    word = trim(im.crop((0, 690, im.width, 902)))
    H = 240
    s = sails.resize((round(sails.width * H / sails.height), H), Image.LANCZOS)
    wh = round(H * 0.46)
    wd = word.resize((round(word.width * wh / word.height), wh), Image.LANCZOS)
    gap = 40
    out = Image.new("RGBA", (s.width + gap + wd.width, H), (0, 0, 0, 0))
    out.paste(s, (0, 0), s)
    out.paste(wd, (s.width + gap, H - wh), wd)
    out.save(P("public", "brand", f"{name}-horizontal.png"), optimize=True)
    if name == "symc-logo":
        side = max(sails.size) + 60
        icon = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        icon.paste(sails, ((side - sails.width) // 2, (side - sails.height) // 2), sails)
        icon.resize((512, 512), Image.LANCZOS).save(P("src", "app", "icon.png"))
        bg = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
        m = icon.resize((150, 150), Image.LANCZOS)
        bg.paste(m, (15, 15), m)
        bg.convert("RGB").save(P("src", "app", "apple-icon.png"))
        icon.resize((48, 48), Image.LANCZOS).save(P("src", "app", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
        sails.save(P("public", "brand", "symc-sails.png"), optimize=True)
