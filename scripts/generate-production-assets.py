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
        d.rounded_rectangle((885, 620, 1035, 840), radius=35, fill=255)
        # Remove bracelet end-link areas so leather straps meet the lugs cleanly.
        d.rectangle((455, 250, 745, 350), fill=0)
        d.rectangle((455, 1010, 745, 1160), fill=0)
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
        'blue': ((43, 88, 132), (5, 17, 31)),
        'black': ((42, 45, 47), (5, 6, 7)),
        'silver': ((236, 232, 221), (128, 126, 120)),
    }
    inner, outer = palettes[kind]
    radius = 312

    for rr in range(radius, 0, -2):
        centre_weight = 1 - rr / radius
        if kind == 'black':
            centre_weight *= 0.72
        colour = lerp(outer, inner, centre_weight) + (255,)
        d.ellipse((CX - rr, CY - rr, CX + rr, CY + rr), fill=colour)

    # Realistic brushing should read as texture, not visible spokes.
    ray_profiles = {
        'blue': (160, 3, 7, 48),
        'black': (120, 2, 4, 70),
        'silver': (72, 1, 3, 85),
    }
    ray_count, low_alpha, high_alpha, inner_radius = ray_profiles[kind]
    for index in range(ray_count):
        angle = math.radians(index * (360 / ray_count))
        alpha = low_alpha if index % 2 else high_alpha
        x1, y1 = CX + math.cos(angle) * inner_radius, CY + math.sin(angle) * inner_radius
        x2, y2 = CX + math.cos(angle) * 302, CY + math.sin(angle) * 302
        d.line((x1, y1, x2, y2), fill=(255, 255, 255, alpha), width=1)

    circle_mask = Image.new('L', CANVAS, 0)
    md = ImageDraw.Draw(circle_mask)
    md.ellipse((CX - radius, CY - radius, CX + radius, CY + radius), fill=255)

    if kind == 'silver':
        grain = Image.effect_noise(CANVAS, 8).convert('L').filter(ImageFilter.GaussianBlur(.35))
        grain = ImageChops.multiply(grain, circle_mask)
        texture = Image.new('RGBA', CANVAS, (255, 252, 244, 0))
        texture.putalpha(grain.point(lambda value: int(value * .085)))
        image.alpha_composite(texture)

        highlight = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
        hd = ImageDraw.Draw(highlight, 'RGBA')
        hd.ellipse((CX - 315, CY - 290, CX + 120, CY + 195), fill=(255, 252, 245, 28))
        highlight = highlight.filter(ImageFilter.GaussianBlur(85))
        highlight.putalpha(ImageChops.multiply(highlight.getchannel('A'), circle_mask))
        image.alpha_composite(highlight)
    elif kind == 'black':
        highlight = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
        hd = ImageDraw.Draw(highlight, 'RGBA')
        hd.ellipse((CX - 245, CY - 350, CX + 115, CY + 20), fill=(255, 255, 255, 13))
        highlight = highlight.filter(ImageFilter.GaussianBlur(75))
        highlight.putalpha(ImageChops.multiply(highlight.getchannel('A'), circle_mask))
        image.alpha_composite(highlight)
    else:
        highlight = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
        hd = ImageDraw.Draw(highlight, 'RGBA')
        hd.polygon(((365, 455), (515, 390), (845, 770), (700, 845)), fill=(180, 220, 255, 12))
        highlight = highlight.filter(ImageFilter.GaussianBlur(55))
        highlight.putalpha(ImageChops.multiply(highlight.getchannel('A'), circle_mask))
        image.alpha_composite(highlight)

    d = ImageDraw.Draw(image, 'RGBA')
    if kind == 'silver':
        tick = (70, 72, 72, 132)
        marker_fill = (91, 94, 95, 255)
        marker_edge = (176, 177, 174, 255)
        marker_highlight = (231, 230, 225, 215)
    else:
        tick = (225, 230, 233, 180)
        marker_fill = (231, 233, 231, 255)
        marker_edge = (73, 77, 80, 255)
        marker_highlight = (255, 255, 255, 220)

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
        x, y = CX + math.cos(angle) * 244, CY + math.sin(angle) * 244
        marker = Image.new('RGBA', (36, 94), (0, 0, 0, 0))
        marker_draw = ImageDraw.Draw(marker, 'RGBA')
        marker_draw.rounded_rectangle((8, 4, 28, 90), radius=4, fill=marker_edge)
        marker_draw.rounded_rectangle((11, 7, 25, 87), radius=3, fill=marker_fill)
        marker_draw.line((13, 10, 13, 83), fill=marker_highlight, width=2)
        marker = marker.rotate(index * 30, resample=Image.Resampling.BICUBIC, expand=True)
        image.alpha_composite(marker, (int(x - marker.width / 2), int(y - marker.height / 2)))

    d = ImageDraw.Draw(image, 'RGBA')
    d.ellipse((CX - 10, CY - 10, CX + 10, CY + 10), fill=(205, 210, 212, 125))
    return image


def leather_strap(section):
    image = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    mask = Image.new('L', CANVAS, 0)
    d = ImageDraw.Draw(mask)

    if section == 'back':
        shape = [(505, 0), (695, 0), (714, 330), (695, 430), (505, 430), (486, 330)]
        y0, y1 = 0, 430
    elif section == 'front':
        shape = [(503, 1020), (697, 1020), (722, 1600), (478, 1600)]
        y0, y1 = 1020, 1600
    else:
        raise ValueError(section)

    d.polygon(shape, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(.65))

    leather = Image.new('RGBA', CANVAS, (20, 18, 17, 255))
    ld = ImageDraw.Draw(leather, 'RGBA')
    for y in range(y0, y1 + 1, 3):
        t = (y - y0) / max(1, (y1 - y0))
        shade = int(19 + 7 * math.sin(t * math.pi))
        ld.line((430, y, 770, y), fill=(shade, shade - 1, shade - 2, 255), width=3)

    grain = Image.effect_noise(CANVAS, 13).convert('L').filter(ImageFilter.GaussianBlur(.25))
    grain_layer = Image.new('RGBA', CANVAS, (210, 205, 196, 0))
    grain_layer.putalpha(ImageChops.multiply(grain.point(lambda value: int(value * .09)), mask))
    leather.alpha_composite(grain_layer)
    leather.putalpha(mask)
    image.alpha_composite(leather)

    d = ImageDraw.Draw(image, 'RGBA')
    if section == 'back':
        left = lambda y: 505 - int((430 - y) * .044) if y > 330 else 486 + int(y * .058)
        right = lambda y: 695 + int((430 - y) * .044) if y > 330 else 714 - int(y * .058)
        stitch_start, stitch_end = 22, 405
    else:
        left = lambda y: int(503 - (y - 1020) * .043)
        right = lambda y: int(697 + (y - 1020) * .043)
        stitch_start, stitch_end = 1045, 1575

    for y in range(stitch_start, stitch_end, 23):
        lx, rx = left(y) + 17, right(y) - 17
        d.line((lx, y, lx, y + 10), fill=(166, 153, 132, 155), width=3)
        d.line((rx, y, rx, y + 10), fill=(166, 153, 132, 155), width=3)

    if section == 'back':
        d.line(shape + [shape[0]], fill=(3, 3, 3, 230), width=5, joint='curve')
        d.line(((510, 10), (501, 325), (516, 414)), fill=(92, 86, 79, 82), width=2)
        d.line(((690, 10), (699, 325), (684, 414)), fill=(92, 86, 79, 65), width=2)
        d.line((520, 388, 680, 388), fill=(8, 8, 8, 115), width=5)
    else:
        d.line(shape + [shape[0]], fill=(3, 3, 3, 230), width=5, joint='curve')
        d.line(((510, 1038), (492, 1570)), fill=(92, 86, 79, 82), width=2)
        d.line(((690, 1038), (708, 1570)), fill=(92, 86, 79, 65), width=2)
        d.line((516, 1064, 684, 1064), fill=(8, 8, 8, 120), width=5)

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
