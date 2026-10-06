from math import cos, sin, pi
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SCALE = 4
BG = (11, 11, 12)
AMBER = (237, 183, 128)
CREAM = (245, 242, 236)
MUTED = (178, 175, 169)


def point(x, y):
    return (round(x * SCALE), round(y * SCALE))


def mark(draw, ox, oy, size):
    s = size / 256
    def p(x, y): return (round((ox + x * s) * SCALE), round((oy + y * s) * SCALE))
    # A nearly complete ring, with a small open end and a warm terminal dot.
    arc = []
    for i in range(241):
        angle = (-43 + i * (316 / 240)) * pi / 180
        arc.append(p(128 + 105 * cos(angle), 128 + 105 * sin(angle)))
    draw.line(arc, fill=AMBER, width=round(9 * s * SCALE), joint="curve")
    draw.ellipse((p(190 - 7, 66 - 7), p(190 + 7, 66 + 7)), fill=AMBER)
    curve = []
    for i in range(37):
        t = i / 36
        u = 1 - t
        x = u**3 * 134 + 3 * u**2 * t * 202 + 3 * u * t**2 * 202 + t**3 * 134
        y = u**3 * 65 + 3 * u**2 * t * 65 + 3 * u * t**2 * 151 + t**3 * 151
        curve.append(p(x, y))
    p_stroke = [p(91, 191), p(91, 65), *curve, p(91, 151)]
    draw.line(p_stroke, fill=CREAM, width=round(15 * s * SCALE), joint="curve")


def finish(image, target):
    image.resize(target, Image.Resampling.LANCZOS).save(ROOT / "assets" / target_name, optimize=True)


icon = Image.new("RGB", (1024 * SCALE, 1024 * SCALE), BG)
mark(ImageDraw.Draw(icon), 62, 62, 900)
target_name = "icon.png"
finish(icon, (1024, 1024))

adaptive = Image.new("RGBA", (1024 * SCALE, 1024 * SCALE), (0, 0, 0, 0))
mark(ImageDraw.Draw(adaptive), 62, 62, 900)
target_name = "adaptive-icon.png"
finish(adaptive, (1024, 1024))

lockup = Image.new("RGBA", (900 * SCALE, 300 * SCALE), (0, 0, 0, 0))
draw = ImageDraw.Draw(lockup)
mark(draw, 34, 22, 256)
aleo = ImageFont.truetype(r"C:\Windows\Fonts\georgia.ttf", 72 * SCALE)
sans = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 25 * SCALE)
draw.text(point(300, 56), "Paycebo", font=aleo, fill=CREAM, stroke_width=0)
draw.text(point(304, 168), "Pay your future self.", font=sans, fill=MUTED, stroke_width=0)
target_name = "splash.png"
finish(lockup, (900, 300))
