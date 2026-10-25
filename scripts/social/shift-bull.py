# One-off image prep (needs Pillow): python3 scripts/social/shift-bull.py <canva-export.png> <out.png> <dx-px>
# Kept so the hero bull can be re-shifted from the original Canva export.
# Splits the towers from the bull, slides only the bull right, recomposes on the same crop.
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops
src, out, dx = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert("RGB")
W, H = im.size
tower_zone = [(1470,40),(1900,40),(1900,650),(1858,650),(1800,606),(1766,592),(1754,558),(1749,503),(1736,468),(1708,449),(1664,441),(1620,439),(1578,417),(1528,391),(1470,372)]
zone = Image.new("L", (W, H), 0); ImageDraw.Draw(zone).polygon(tower_zone, fill=255)
black = Image.new("RGB", (W, H), (2, 2, 2))  # the drawing's own background, so no seam shows
towers = Image.composite(im, black, zone)
bull = Image.composite(black, im, zone)
# Bull silhouette: close the linework, then fill everything not reachable from the outside.
lines = bull.convert("L").point(lambda v: 255 if v > 25 else 0)
closed = lines.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
fill = closed.copy(); ImageDraw.floodfill(fill, (5, 5), 128)
sil = fill.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.MaxFilter(5))
moved = Image.new("RGB", (W, H), (2, 2, 2)); moved.paste(bull, (dx, 0))
mask = Image.new("L", (W, H), 0); mask.paste(sil, (dx, 0))
comp = Image.composite(moved, towers, mask)
comp.save(out)
towers.save(out.replace(".png", "-towers.png")); sil.save(out.replace(".png", "-mask.png"))
