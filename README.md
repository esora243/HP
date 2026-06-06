# 📄 PDF Editor - ブラウザ完結型 PDF 編集 Web アプリ

サーバー不要で動作するクライアントサイドPDF編集ツールです。HTML/CSS/Vanilla JavaScriptのみで構成され、CDN経由でPDF.js、pdf-lib、Fabric.js、Sortable.jsを利用します。

![Tech Stack](https://img.shields.io/badge/Tech-HTML%2FCSS%2FJS-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![No Server](https://img.shields.io/badge/Server-Not%20Required-success)

---

## 🚀 クイックスタート

### 方法1: ファイルを直接開く（最も簡単）

```bash
# index.html をダブルクリックするだけ
```

> ⚠️ 一部ブラウザはセキュリティ制約により `file://` プロトコルで PDF.js Worker が動作しない場合があります。その場合は方法2をご利用ください。

### 方法2: ローカルサーバーで起動（推奨）

```bash
# Python 3 がインストール済みであれば
cd pdf-editor
python3 -m http.server 8000

# ブラウザで http://localhost:8000 を開く
```

または Node.js：

```bash
npx serve .
```

---

## ✨ 主な機能

| 機能 | 説明 |
|---|---|
| 📂 **PDF 読み込み** | ファイル選択 or ドラッグ&ドロップ |
| 🖼️ **ページ表示** | 高解像度レンダリング・ズーム対応 |
| 🗑️ **ページ削除** | 任意ページを削除（注釈・コメントも連動） |
| ➕ **空白ページ追加** | 末尾に空白ページを挿入 |
| 🔗 **複数 PDF 結合** | 別の PDF を末尾にマージ |
| 🔀 **ページ並び替え** | サムネイルをドラッグ&ドロップ |
| 🔄 **ページ回転** | 90度ずつ左右回転 |
| 📝 **注釈** | テキスト・矩形・円・矢印・ハイライト・フリーハンド |
| 📌 **付箋コメント** | クリックで付箋追加、コメント管理パネル |
| 💾 **エクスポート** | 編集済み PDF をダウンロード |
| ⌨️ **キーボードショートカット** | ←/→で前後ページ、Ctrl+S で保存 等 |
| 🔒 **プライバシー** | 全処理ブラウザ内・サーバー送信なし |

---

## 📁 ディレクトリ構成

```
pdf-editor/
├── index.html              # メインHTML
├── css/
│   └── style.css          # スタイル定義
├── js/
│   ├── utils.js           # ユーティリティ
│   ├── pdf-renderer.js    # PDF描画 (PDF.js)
│   ├── annotations.js     # 注釈レイヤー (Fabric.js)
│   ├── comments.js        # 付箋コメント管理
│   ├── page-manager.js    # ページ管理・サムネ・D&D
│   ├── exporter.js        # PDF出力 (pdf-lib)
│   └── app.js             # 起動・イベント
├── README.md              # 本ファイル
├── TECHNICAL_REPORT.md    # 技術仕様書
└── LICENSE                # MITライセンス
```

---

## ⌨️ キーボードショートカット

| キー | 動作 |
|---|---|
| `←` / `PageUp` | 前のページ |
| `→` / `PageDown` | 次のページ |
| `+` / `-` | ズームイン/アウト |
| `Ctrl + S` | PDFをダウンロード |
| `Delete` / `Backspace` | 選択中の注釈を削除 |
| `Esc` | モーダルを閉じる |

---

## 🛠️ 使用ライブラリ（CDN経由）

| ライブラリ | 用途 | バージョン |
|---|---|---|
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF表示・レンダリング | 3.11.174 |
| [pdf-lib](https://pdf-lib.js.org/) | PDF生成・編集・結合 | 1.17.1 |
| [Fabric.js](http://fabricjs.com/) | 注釈レイヤー | 5.3.0 |
| [Sortable.js](https://sortablejs.github.io/Sortable/) | ドラッグ&ドロップ並び替え | 1.15.2 |

---

## 🌐 動作環境

- Google Chrome 90+
- Firefox 88+
- Microsoft Edge 90+
- Safari 14+

> モダンブラウザの ES6+, Canvas, FileReader API を利用しています。

---

## ⚠️ 既知の制約

- **日本語フォント注釈の埋め込み**: 付箋コメントのテキストは PDF の標準 Text Annotation として埋め込まれますが、注釈として焼き込まれる文字（テキストツールで描いた日本語）は Fabric.js キャンバスから PNG ラスタライズして埋め込まれるため、文字の質が画像解像度に依存します。
- **大きなPDF**: 数百ページのPDFはサムネイル生成に時間がかかります。
- **`file://` プロトコル**: ローカルファイルで開くと一部ブラウザで PDF.js Worker が動作しない場合があります → ローカルサーバー利用を推奨。

---

## 📜 ライセンス

MIT License — 詳細は [LICENSE](./LICENSE) を参照。

---

## 🙋 サポート

詳細な技術仕様・アーキテクチャは [TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md) を参照してください。
