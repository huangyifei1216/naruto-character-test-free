from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "marketing" / "harry-potter-cover-base.png"
OUTPUT = ROOT / "assets" / "marketing" / "harry-potter-personality-test-cover-3x4.png"
FONT = "/System/Library/AssetsV2/com_apple_MobileAsset_Font8/86ba2c91f017a3749571a82f2c6d890ac7ffb2fb.asset/AssetData/PingFang.ttc"


def font(size, index=5):
    return ImageFont.truetype(FONT, size, index=index)


def center_text(draw, xy, text, fill, text_font, anchor="mm"):
    draw.text(xy, text, font=text_font, fill=fill, anchor=anchor)


def rounded_label(draw, box, text, fill, text_fill, text_font):
    draw.rounded_rectangle(box, radius=22, fill=fill)
    center_text(draw, ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2), text, text_fill, text_font)


def main():
    image = Image.open(SOURCE).convert("RGBA")
    draw = ImageDraw.Draw(image)
    ink = "#251715"
    burgundy = "#6e1731"
    gold = "#b98332"
    cream = "#f9f0df"

    # Top information hierarchy: a credibility pill, crisp product promise, then one high-contrast question.
    draw.rounded_rectangle((171, 68, 915, 117), radius=24, fill=(255, 251, 241, 225), outline=(190, 146, 74, 185), width=2)
    center_text(draw, (543, 92), "24道真实情境题 · 8维人格雷达", gold, font(24, 6))
    center_text(draw, (543, 163), "不是选学院，是测你的魔法人格", burgundy, font(28, 6))
    center_text(draw, (543, 252), "你是哈利波特里的", ink, font(67, 8))
    center_text(draw, (543, 347), "哪个角色？", burgundy, font(86, 8))
    center_text(draw, (543, 424), "测出你在魔法世界最像谁", ink, font(31, 5))
    center_text(draw, (543, 468), "勇气 · 理性 · 忠诚 · 野心 · 亲密关系", "#725d50", font(21, 5))

    # The generated card already contains a radar framework; typography turns it into a credible result preview.
    draw.rounded_rectangle((355, 873, 731, 984), radius=22, fill=(250, 243, 226, 222))
    center_text(draw, (543, 902), "你的魔法人格", gold, font(19, 6))
    center_text(draw, (543, 944), "赫敏·格兰杰", ink, font(39, 8))
    rounded_label(draw, (372, 1221, 501, 1262), "聪慧", (250, 240, 215, 238), burgundy, font(20, 6))
    rounded_label(draw, (520, 1221, 649, 1262), "勇敢", (250, 240, 215, 238), burgundy, font(20, 6))
    rounded_label(draw, (668, 1221, 797, 1262), "有主见", (250, 240, 215, 238), burgundy, font(20, 6))

    # CTA bar is intentionally short and decisive for the first product-gallery frame.
    center_text(draw, (543, 1350), "立即开启测试  →", cream, font(47, 8))

    image.convert("RGB").save(OUTPUT, quality=95, subsampling=0)
    print(OUTPUT)


if __name__ == "__main__":
    main()
