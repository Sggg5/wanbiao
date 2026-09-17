from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter
import math
import random

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
    layer.save(path, 'WEBP', quality=90, method=6, exact=True)
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
        'blue': ((48, 91, 135), (5, 19, 35)),
        'black': ((50, 52, 54), (5, 6, 7)),
        'silver': ((235, 232, 224), (132, 130, 126)),
    }
    inner, outer = palettes[kind]
    radius = 312

    for rr in range(radius, 0, -2):
        centre_weight = (1 - rr / radius) ** 0.78
        colour = lerp(outer, inner, centre_weight) + (255,)
        d.ellipse((CX - rr, CY - rr, CX + rr, CY + rr), fill=colour)

    if kind == 'blue':
        for index in range(180):
            angle = math.radians(index * 2)
            alpha = 8 + (index % 7 == 0) * 8
            x1, y1 = CX + math.cos(angle) * 28, CY + math.sin(angle) * 28
            x2, y2 = CX + math.cos(angle) * 302, CY + math.sin(angle) * 302
            d.line((x1, y1, x2, y2), fill=(210, 232, 248, alpha), width=1)
    elif kind == 'silver':
        for index in range(240):
            angle = math.radians(index * 1.5)
            alpha = 7 if index % 3 else 12
            x1, y1 = CX + math.cos(angle) * 36, CY + math.sin(angle) * 36
            x2, y2 = CX + math.cos(angle) * 304, CY + math.sin(angle) * 304
            d.line((x1, y1, x2, y2), fill=(255, 255, 255, alpha), width=1)
        for rr in range(90, 305, 7):
            d.arc((CX - rr, CY - rr, CX + rr, CY + rr), 188, 345, fill=(255, 255, 255, 10), width=1)
            d.arc((CX - rr, CY - rr, CX + rr, CY + rr), 8, 165, fill=(74, 74, 72, 8), width=1)
    else:
        gloss = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
        gd = ImageDraw.Draw(gloss, 'RGBA')
        gd.ellipse((CX - 285, CY - 285, CX + 285, CY + 285), outline=(210, 214, 216, 14), width=18)
        gd.arc((CX - 250, CY - 250, CX + 250, CY + 250), 205, 330, fill=(255, 255, 255, 18), width=30)
        gloss = gloss.filter(ImageFilter.GaussianBlur(18))
        image.alpha_composite(gloss)

    d = ImageDraw.Draw(image, 'RGBA')
    d.ellipse((CX - 307, CY - 307, CX + 307, CY + 307), outline=(28, 31, 34, 155), width=3)
    d.ellipse((CX - 297, CY - 297, CX + 297, CY + 297), outline=(240, 241, 239, 34), width=1)

    tick = (225, 230, 233, 205) if kind != 'silver' else (74, 76, 77, 175)
    marker_fill = (238, 239, 237, 255) if kind != 'silver' else (188, 191, 190, 255)
    marker_edge = (73, 76, 79, 255) if kind != 'silver' else (83, 85, 86, 255)
    marker_highlight = (255, 255, 255, 150)

    for index in range(60):
        angle = math.radians(index * 6 - 90)
        r1 = 270 if index % 5 == 0 else 282
        r2 = 294
        d.line((
            CX + math.cos(angle) * r1, CY + math.sin(angle) * r1,
            CX + math.cos(angle) * r2, CY + math.sin(angle) * r2,
        ), fill=tick, width=2 if index % 5 == 0 else 1)

    for index in range(12):
        angle = math.radians(index * 30 - 90)
        x, y = CX + math.cos(angle) * 245, CY + math.sin(angle) * 245
        marker = Image.new('RGBA', (34, 94), (0, 0, 0, 0))
        md = ImageDraw.Draw(marker, 'RGBA')
        md.rounded_rectangle((8, 4, 26, 90), radius=3, fill=marker_edge)
        md.rounded_rectangle((11, 7, 23, 87), radius=2, fill=marker_fill)
        md.line((13, 10, 13, 83), fill=marker_highlight, width=2)
        marker = marker.rotate(index * 30, resample=Image.Resampling.BICUBIC, expand=True)
        image.alpha_composite(marker, (int(x - marker.width / 2), int(y - marker.height / 2)))

    d = ImageDraw.Draw(image, 'RGBA')
    d.ellipse((CX - 10, CY - 10, CX + 10, CY + 10), fill=(210, 213, 214, 120))
    return image


def leather_strap(section):
    image = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    mask = Image.new('L', CANVAS, 0)
    md = ImageDraw.Draw(mask)

    if section == 'back':
        y0, y1 = 0, 430
        left0, right0 = 505, 695
        left1, right1 = 486, 714
    else:
        y0, y1 = 1030, 1600
        left0, right0 = 478, 722
        left1, right1 = 510, 690

    md.polygon(((left0, y0), (right0, y0), (right1, y1), (left1, y1)), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))

    leather = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    ld = ImageDraw.Draw(leather, 'RGBA')
    span = max(1, y1 - y0)
    for y in range(y0, y1 + 1):
        t = (y - y0) / span
        shade = int(18 + 7 * math.sin(t * math.pi))
        ld.line((350, y, 850, y), fill=(shade, shade, shade + 2, 255))

    rng = random.Random(9015 if section == 'back' else 9016)
    for _ in range(850):
        y = rng.randint(y0, y1)
        x = rng.randint(455, 745)
        length = rng.randint(2, 9)
        alpha = rng.randint(9, 24)
        ld.line((x, y, x + length, y + rng.choice([-1, 0, 1])), fill=(110, 108, 104, alpha), width=1)

    sheen = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen, 'RGBA')
    sd.rectangle((548, y0, 652, y1), fill=(255, 255, 255, 20))
    sheen = sheen.filter(ImageFilter.GaussianBlur(34))
    leather.alpha_composite(sheen)
    image = apply_mask(leather, mask)

    d = ImageDraw.Draw(image, 'RGBA')

    def edges_at(y):
        t = (y - y0) / span
        left = left0 + (left1 - left0) * t
        right = right0 + (right1 - right0) * t
        return left, right

    edge_points_left = []
    edge_points_right = []
    for y in range(y0, y1 + 1, 8):
        left, right = edges_at(y)
        edge_points_left.append((left + 4, y))
        edge_points_right.append((right - 4, y))
    d.line(edge_points_left, fill=(100, 98, 92, 180), width=3)
    d.line(edge_points_right, fill=(100, 98, 92, 180), width=3)

    for y in range(y0 + 20, y1 - 8, 28):
        left, right = edges_at(y)
        d.line((left + 18, y, left + 18, y + 10), fill=(170, 157, 136, 135), width=2)
        d.line((right - 18, y, right - 18, y + 10), fill=(170, 157, 136, 135), width=2)

    if section == 'front':
        for index in range(5):
            hy = 1390 + index * 38
            d.ellipse((CX - 9, hy - 5, CX + 9, hy + 5), fill=(7, 7, 8, 210), outline=(68, 66, 62, 150))

    attach_y = y1 - 18 if section == 'back' else y0 + 18
    left, right = edges_at(attach_y)
    d.line((left + 12, attach_y, right - 12, attach_y), fill=(120, 114, 104, 110), width=2)
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
save(leather_strap('back'), 'straps/black-leather-back.webp')
save(leather_strap('front'), 'straps/black-leather-front.webp')
save(crystal_highlight(), 'common/crystal-highlight.webp')
