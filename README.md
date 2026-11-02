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

## Xのカード

`share/` に称号ごとの共有ページとカード画像が入っています。結果を投稿すると、その称号のカードが表示されます。
称号の名前や説明、公開URLを変えたら次のコマンドで作り直してください（Python版Playwrightが必要です）。

```
python3 tools/make-share.py
```

Xはカードを約7日キャッシュします。画像を変えても古いカードが出るときは、`BASE` の下の `VERSION` を上げて作り直してください。

## 素材

- 絵と音はこのリポジトリ内で生成したもので、外部素材は使っていません
- フォント: [Dela Gothic One](https://github.com/syakuzen/DelaGothic)、[Yusei Magic](https://github.com/tanukifont/YuseiMagic)、[Noto Sans CJK JP](https://github.com/notofonts/noto-cjk)（「ケ」の1文字のみ）。いずれも SIL Open Font License 1.1 で、全文は `fonts/` にあります

フォントはゲーム内で使う文字だけに絞っています。台詞に新しい漢字を足すと、その文字だけ端末のフォントで表示されます。
