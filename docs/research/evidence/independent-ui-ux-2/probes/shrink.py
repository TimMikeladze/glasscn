import sys
from PIL import Image
# usage: shrink.py maxwidth file...  (downscale, then 256-colour palette with Floyd-Steinberg dithering to avoid banding)
mw = int(sys.argv[1])
for f in sys.argv[2:]:
    im = Image.open(f).convert("RGB")
    if im.width > mw:
        im = im.resize((mw, round(im.height * mw / im.width)), Image.LANCZOS)
    pal = im.quantize(256, method=Image.Quantize.MEDIANCUT)
    im.quantize(palette=pal, dither=Image.Dither.FLOYDSTEINBERG).save(f, optimize=True)
