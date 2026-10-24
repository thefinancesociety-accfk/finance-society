# One-off: builds the web logo files in assets/brand/ from the approved master PNG.
# Run only if the master logo changes:  python3 scripts/brand-assets.py path/to/master.png
# Needs Pillow (pip install pillow). The site itself needs no build step.
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "assets" / "brand"
master = Image.open(sys.argv[1]).convert("RGB")
W, H = master.size
sx, sy = W / 1920, H / 1932  # crop boxes below were measured on a 1920px preview


def box(x0, y0, x1, y1):
    return (int(x0 * sx), int(y0 * sy), int(x1 * sx), int(y1 * sy))


def unblack(img):
    """Light-on-black artwork -> transparent PNG (alpha from brightness)."""
    img = img.convert("RGB")
    out = Image.new("RGBA", img.size)
    px = []
    for r, g, b in img.getdata():
        a = max(r, g, b)
        if a < 14:  # noise floor of the black background
            px.append((0, 0, 0, 0))
            continue
        k = 255 / a
        px.append((min(255, int(r * k)), min(255, int(g * k)), min(255, int(b * k)), a))
    out.putdata(px)
    return out


def save(img, name, width):
    h = round(img.height * width / img.width)
    im = img.resize((width, h), Image.LANCZOS)
    im.save(BRAND / f"{name}.png", optimize=True)
    im.save(BRAND / f"{name}.webp", quality=88, method=6)
    return im


lockup = unblack(master.crop(box(380, 300, 1540, 1530)))
mark = unblack(master.crop(box(560, 300, 1360, 1200)))
save(lockup, "logo-lockup", 960)
save(lockup, "logo-lockup-480", 480)
save(mark, "logo-mark", 256)
save(mark, "logo-mark-128", 128)

# favicons: mark on the site background so it reads in light browser chrome too
bg = (11, 11, 12, 255)
for size, name in [(32, "favicon-32.png"), (180, "apple-touch-icon.png"), (512, "icon-512.png")]:
    tile = Image.new("RGBA", (size, size), bg)
    m = mark.copy()
    m.thumbnail((int(size * 0.86), int(size * 0.86)), Image.LANCZOS)
    tile.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    tile.convert("RGB").save(BRAND / name, optimize=True)

# Open Graph card 1200x630: lockup left, name and line right
og = Image.new("RGBA", (1200, 630), bg)
l = lockup.copy()
l.thumbnail((470, 500), Image.LANCZOS)
og.alpha_composite(l, (70, (630 - l.height) // 2))
d = ImageDraw.Draw(og)
d.line([(600, 175), (600, 455)], fill=(46, 43, 39), width=2)


def font(names, size):
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            pass
    return ImageFont.load_default()


serif = font(["/System/Library/Fonts/Supplemental/Didot.ttc", "/System/Library/Fonts/Supplemental/Times New Roman.ttf"], 64)
small = font(["/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"], 24)
d.text((650, 215), "Finance Society", font=serif, fill=(238, 232, 221))
d.text((650, 310), "AMITY UNIVERSITY KOLKATA", font=small, fill=(201, 169, 110))
d.text((650, 350), "Amity College of Commerce and Finance", font=small, fill=(163, 154, 140))
d.text((650, 400), "Research  ·  Markets  ·  Careers", font=small, fill=(238, 232, 221))
og.convert("RGB").save(BRAND / "og-image.png", optimize=True)
print("brand assets written to", BRAND)
