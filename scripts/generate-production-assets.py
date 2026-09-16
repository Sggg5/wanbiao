from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter
import math

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/assets/atelier-watch-placeholder.png'
OUT = ROOT / 'public/assets/parts'
CANVAS = (1200, 1600)
CX, CY = 600, 729

if not SOURCE.exists():
    raise SystemExit(f'Missing source render: {SOURCE}')

source = Image.open(SOURCE).convert('RGBA')
new_w = round(source.width * CANVAS[1] / source.height)
source = source.resize((new_w, CANVAS[1]), Image.Resampling.LANCZOS)
base = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
base.alpha_composite(source, ((CANVAS[0] - new_w) // 2, 0))


def save(layer, relative):
    path = OUT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    layer.save(path, 'WEBP', quality=88, method=6, exact=True)
    print(f'generated {path.relative_to(ROOT)}')


def apply_mask(image, mask):
    out = image.copy()
    out.putalpha(ImageChops.multiply(out.getchannel('A'), mask))
    return out


def masked_source(kind):
    mask = Image.new('L', CANVAS, 0)
    d = ImageDraw.Draw(mask)
    if kind == 'strap-back':
        d.rectangle((345, 0, 855, 430), fill=255)
    elif kind == 'strap-front':
        d.rectangle((335, 1035, 865, 1600), fill=255)
    elif kind == 'case':
        d.ellipse((220, 300, 980, 1160), fill=255)
        d.rectangle((280, 260, 920, 520), fill=255)
        d.rectangle((270, 910, 930, 1140), fill=255)
        d.rounded_rectangle((885, 620, 1035, 840), radius=35, fill=255)
        d.ellipse((CX - 318, CY - 318, CX + 318, CY + 318), fill=0)
        mask = mask.filter(ImageFilter.GaussianBlur(1.0))
    else:
        raise ValueError(kind)
    return apply_mask(base, mask)


def lerp(a, b, t):
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def dial(kind):
    image = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    d = ImageDraw.Draw(image, 'RGBA')
    palettes = {
        'blue': ((47, 83, 118), (6, 23, 41)),
        'black': ((68, 69, 70), (8, 9, 10)),
        'silver': ((224, 220, 211), (119, 117, 112)),
    }
    inner, outer = palettes[kind]
    radius = 312

    # Radial body; the many thin rings read as a restrained sunburst at display size.
    for rr in range(radius, 0, -2):
        centre_weight = 1 - rr / radius
        colour = lerp(outer, inner, centre_weight) + (255,)
        d.ellipse((CX - rr, CY - rr, CX + rr, CY + rr), fill=colour)

    for index in range(120):
        angle = math.radians(index * 3)
        alpha = 10 if index % 2 else 15
        x1, y1 = CX + math.cos(angle) * 30, CY + math.sin(angle) * 30
        x2, y2 = CX + math.cos(angle) * 300, CY + math.sin(angle) * 300
        d.line((x1, y1, x2, y2), fill=(255, 255, 255, alpha), width=1)

    tick = (225, 230, 233, 190) if kind != 'silver' else (52, 52, 50, 160)
    marker_fill = (235, 236, 234, 255) if kind != 'silver' else (78, 80, 80, 255)
    marker_edge = (75, 78, 80, 255)

    for index in range(60):
        angle = math.radians(index * 6 - 90)
        r1 = 270 if index % 5 == 0 else 281
        r2 = 294
        d.line((
            CX + math.cos(angle) * r1, CY + math.sin(angle) * r1,
            CX + math.cos(angle) * r2, CY + math.sin(angle) * r2,
        ), fill=tick, width=2 if index % 5 == 0 else 1)

    for index in range(12):
        angle = math.radians(index * 30 - 90)
        x, y = CX + math.cos(angle) * 245, CY + math.sin(angle) * 245
        marker = Image.new('RGBA', (34, 94), (0, 0, 0, 0))
        md = ImageDraw.Draw(marker)
        md.rounded_rectangle((9, 5, 25, 89), radius=3, fill=marker_edge)
        md.rounded_rectangle((11, 7, 23, 87), radius=2, fill=marker_fill)
        marker = marker.rotate(index * 30, resample=Image.Resampling.BICUBIC, expand=True)
        image.alpha_composite(marker, (int(x - marker.width / 2), int(y - marker.height / 2)))

    d = ImageDraw.Draw(image, 'RGBA')
    d.ellipse((CX - 10, CY - 10, CX + 10, CY + 10), fill=(210, 213, 214, 130))
    return image


def dauphine_hands():
    scale = 4
    high = Image.new('RGBA', (CANVAS[0] * scale, CANVAS[1] * scale), (0, 0, 0, 0))
    d = ImageDraw.Draw(high, 'RGBA')

    def polygon(points, fill, outline):
        points = [(int(x * scale), int(y * scale)) for x, y in points]
        d.polygon(points, fill=fill)
        d.line(points + [points[0]], fill=outline, width=2 * scale, joint='curve')

    def hand(angle_deg, length, width):
        angle = math.radians(angle_deg - 90)
        perpendicular = (-math.sin(angle), math.cos(angle))
        tip = (CX + math.cos(angle) * length, CY + math.sin(angle) * length)
        tail = (CX - math.cos(angle) * 22, CY - math.sin(angle) * 22)
        left = (CX + perpendicular[0] * width / 2, CY + perpendicular[1] * width / 2)
        right = (CX - perpendicular[0] * width / 2, CY - perpendicular[1] * width / 2)
        return [tail, left, tip, right]

    polygon(hand(310, 165, 34), (220, 224, 226, 255), (80, 84, 87, 255))
    polygon(hand(52, 250, 26), (235, 237, 238, 255), (80, 84, 87, 255))

    angle = math.radians(220 - 90)
    d.line((
        int(CX * scale), int(CY * scale),
        int((CX + math.cos(angle) * 285) * scale), int((CY + math.sin(angle) * 285) * scale),
    ), fill=(220, 225, 226, 240), width=3 * scale)
    opposite = angle + math.pi
    d.line((
        int(CX * scale), int(CY * scale),
        int((CX + math.cos(opposite) * 70) * scale), int((CY + math.sin(opposite) * 70) * scale),
    ), fill=(200, 205, 206, 230), width=5 * scale)
    d.ellipse(((CX - 12) * scale, (CY - 12) * scale, (CX + 12) * scale, (CY + 12) * scale),
              fill=(225, 228, 229, 255), outline=(70, 74, 76, 255), width=2 * scale)
    return high.resize(CANVAS, Image.Resampling.LANCZOS)


def crystal_highlight():
    circle = Image.new('L', CANVAS, 0)
    d = ImageDraw.Draw(circle)
    d.ellipse((CX - 305, CY - 305, CX + 305, CY + 305), fill=92)

    sheen = Image.new('L', CANVAS, 0)
    d = ImageDraw.Draw(sheen)
    d.polygon(((315, 520), (460, 410), (855, 825), (710, 930)), fill=190)
    sheen = sheen.filter(ImageFilter.GaussianBlur(35))
    alpha = ImageChops.multiply(circle, sheen)
    image = Image.new('RGBA', CANVAS, (245, 250, 255, 0))
    image.putalpha(alpha)
    return image


save(masked_source('case'), 'cases/classic-39.webp')
save(dial('blue'), 'dials/midnight-blue.webp')
save(dial('black'), 'dials/obsidian-black.webp')
save(dial('silver'), 'dials/silver-grain.webp')
save(dauphine_hands(), 'hands/dauphine.webp')
save(masked_source('strap-back'), 'straps/steel-back.webp')
save(masked_source('strap-front'), 'straps/steel-front.webp')
save(crystal_highlight(), 'common/crystal-highlight.webp')
