#!/usr/bin/env python3
"""称号ごとの共有ページ share/*.html と、Xカード画像 share/*.png を作る。"""
import asyncio
import html
import json
import subprocess
from pathlib import Path

from playwright.async_api import async_playwright

BASE = 'https://dvyozakura.github.io/Kebab/'  # 公開URL。末尾の / まで書く
VERSION = 1  # カード画像を差し替えたら上げる（Xのキャッシュ対策）
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'share'

node = """
import { RANKS } from './js/data.js';
import { doner } from './js/art.js';
console.log(JSON.stringify({ ranks: RANKS, doner: doner('c') }));
"""
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', node], cwd=ROOT, text=True))

CARDS = [dict(slug=r['slug'], label='称号', title=r['name'], note=r['note']) for r in data['ranks']]
CARDS.append(dict(slug='hungry', label='結果', title='友達が空腹', note='全員に配れなかった。公園の空気が重い。'))
CARDS.append(dict(slug='default', label='値切りブラウザゲーム', title='ケバブ5人分', note='予算¥4,000。定価だと¥5,100。値切るしかない。'))

TEMPLATE = """<!doctype html><meta charset="utf-8"><style>
@font-face {{ font-family: Dela; src: url('{root}/fonts/DelaGothicOne-subset.woff'); }}
@font-face {{ font-family: Dela; src: url('{root}/fonts/NotoSansJP-Black-ke.woff'); unicode-range: U+30B1; }}
@font-face {{ font-family: Yusei; src: url('{root}/fonts/YuseiMagic-subset.woff'); }}
body {{ margin: 0; width: 1200px; height: 630px; overflow: hidden; position: relative; color: #FFF8E7;
  background-color: #074C55; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cpath d='M48 9 L87 48 L48 87 L9 48Z' fill='none' stroke='%230B6E78' stroke-width='4'/%3E%3Ccircle cx='48' cy='48' r='9' fill='%230B6E78'/%3E%3C/svg%3E"); }}
.doner {{ position: absolute; right: -40px; top: -20px; width: 500px; }}
.text {{ position: absolute; left: 64px; top: 54px; right: 300px; }}
.logo {{ font: 54px Dela; color: #FFC21A; -webkit-text-stroke: 9px #1B1B2F; paint-order: stroke fill; text-shadow: 0 5px 0 #C8102E; }}
.label {{ margin-top: 76px; font: 34px Yusei; }}
.title {{ margin-top: 8px; font: {size}px/1.15 Dela; color: #FFF8E7; -webkit-text-stroke: 12px #1B1B2F; paint-order: stroke fill; text-shadow: 0 8px 0 #C8102E; }}
.note {{ position: absolute; left: 64px; bottom: 48px; max-width: 800px; padding: 8px 16px; font: 30px/1.35 Yusei; color: #1B1B2F; background: #FFF8E7; border: 4px solid #1B1B2F; border-radius: 10px; }}
</style><div class="doner"><svg viewBox="-110 -30 220 230" xmlns="http://www.w3.org/2000/svg">{doner}</svg></div>
<div class="text"><div class="logo">ネギれ！ケバブ</div><div class="label">{label}</div><div class="title">{title}</div></div>
<div class="note">{note}</div>"""

PAGE = """<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<title>{full}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{note}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{full}">
<meta property="og:description" content="{note}">
<meta property="og:image" content="{image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{full}">
<meta name="twitter:description" content="{note}">
<meta name="twitter:image" content="{image}">
<meta name="twitter:image:alt" content="{full}">
<script>location.replace('../');</script>
</head><body><a href="../">ネギれ！ケバブを遊ぶ</a></body></html>
"""


async def main():
    OUT.mkdir(exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1200, 'height': 630})
        for c in CARDS:
            size = 118 if len(c['title']) <= 5 else 92 if len(c['title']) <= 7 else 80
            tmp = OUT / '_card.html'
            tmp.write_text(TEMPLATE.format(root=ROOT.as_uri(), doner=data['doner'], size=size, **c), encoding='utf8')
            await page.goto(tmp.as_uri())
            await page.evaluate('document.fonts.ready')
            await page.wait_for_timeout(150)
            await page.screenshot(path=OUT / f"{c['slug']}.png")
            tmp.unlink()
            if c['slug'] == 'default':
                continue  # 通常のトップページ用なので共有ページは不要
            full = f"{c['label']}「{c['title']}」｜ネギれ！ケバブ"
            (OUT / f"{c['slug']}.html").write_text(PAGE.format(
                full=html.escape(full), note=html.escape(c['note']),
                url=f"{BASE}share/{c['slug']}.html", image=f"{BASE}share/{c['slug']}.png?v={VERSION}",
            ), encoding='utf8')
        await browser.close()


asyncio.run(main())
