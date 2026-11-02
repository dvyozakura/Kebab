# ネギれ！ケバブ

予算¥4,000で5人分のケバブを買って帰る、値切りブラウザゲーム。ビルド不要の静的サイトです。

## 公開手順

1. このフォルダの中身をGitHubリポジトリの `main` ブランチにpushする
2. リポジトリの Settings → Pages → Build and deployment の Source を **GitHub Actions** にする
3. Actionsタブで `Deploy to GitHub Pages` が完了すると公開される（2回目以降はpushのたびに自動）

初回のpushで2を設定していなかった場合は、設定後にActionsタブから再実行してください。

## 手元で動かす

ESモジュールを使うので、`index.html` を直接開くのではなくローカルサーバーを通します。

```
python3 -m http.server 8000
```

## ファイル構成

- `js/data.js` 屋台・札・台詞・称号。バランス調整はここ
- `js/game.js` 値切りの計算
- `js/ui.js` 画面の進行
- `js/art.js` 絵（すべてコード生成のSVG）
- `js/audio.js` 効果音と音楽（すべてWeb Audioで合成）

URLに `?seed=123` を付けると店主の底値や札が固定されます。

## 素材

- 絵と音はこのリポジトリ内で生成したもので、外部素材は使っていません
- フォント: [Dela Gothic One](https://github.com/syakuzen/DelaGothic)、[Yusei Magic](https://github.com/tanukifont/YuseiMagic)（どちらも SIL Open Font License 1.1。全文は `fonts/` にあります）

フォントはゲーム内で使う文字だけに絞っています。台詞に新しい漢字を足すと、その文字だけ端末のフォントで表示されます。
