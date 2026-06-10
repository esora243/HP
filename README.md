# 📄 PDF Editor Pro v2.0

完全クライアントサイドで動作する高機能PDF編集Webアプリ。サーバー不要・インストール不要。

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![No Server](https://img.shields.io/badge/Server-Not%20Required-success)

---

## 🚀 クイックスタート

```bash
# 方法1: 同梱スクリプト
./start.sh         # Mac/Linux
start.bat          # Windows

# 方法2: 任意のHTTPサーバー
python3 -m http.server 8000
# → http://localhost:8000
```

> 注: 一部の機能（PDF.js Worker、OCR）は `file://` プロトコルでは動作しません。**必ずローカルサーバーで起動**してください。

---

## ✨ v2.0 新機能

| カテゴリ | 機能 |
|---|---|
| 🗂️ **ページ一括編集** | Ctrl/⌘+クリック で複数選択、Shift+クリック で範囲選択、Ctrl+A で全選択 |
| 🗑️ **一括削除** | 選択ページを Delete キー or ボタンでまとめて削除 |
| 🔄 **一括回転** | 選択ページを一括で左/右回転 |
| 📤 **ページ抽出** | 選択ページのみで新PDF生成 |
| ⌨️ **Deleteキー対応** | ページ・注釈どちらにも Delete キーが効く |
| 💾 **localStorage 自動保存** | 編集状態を自動保存。同じPDFを開くと復元プロンプト |
| ↶↷ **アンドゥ/リドゥ** | Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z (最大50ステップ) |
| 📋 **PDFフォーム入力** | 既存PDFフォームの自動検出と入力（テキスト/チェック/ドロップダウン/ラジオ） |
| 🔍 **OCRテキスト抽出** | Tesseract.js による画像PDF→テキスト変換（日/英/中/韓対応） |
| ✍️ **電子署名** | 手書き / タイプ入力 / 画像アップロードで署名作成、スタンプ配置 |
| ⇆ **比較ビュー** | 別PDFを並べて表示 |

---

## ✅ 全機能一覧

### v1.0からの基本機能
- 📂 PDFアップロード・表示（ドラッグ&ドロップ対応）
- ➕ 空白ページ追加 / 🔗 複数PDF結合
- 🗑️ ページ削除 / 🔀 ドラッグ&ドロップ並び替え / 🔄 回転
- 📝 注釈（テキスト・矩形・円・矢印・ハイライト・フリーハンド）
- 📌 付箋コメント（右パネルで一覧管理）
- 💾 編集済みPDFダウンロード
- 🔒 完全クライアントサイド処理（プライバシー安全）

### v2.0 追加機能
- 🗂️ ページ複数選択（Ctrl/Shift+クリック、全選択）
- 🗑️ 一括削除（Deleteキー対応）
- 🔄 一括回転 / 📤 ページ抽出エクスポート
- 💾 localStorage 自動保存・復元
- ↶↷ アンドゥ/リドゥ（最大50ステップ）
- 📋 PDFフォーム入力
- 🔍 OCR（多言語対応）
- ✍️ 電子署名（3モード: 手書き/タイプ/画像）
- ⇆ 比較ビュー（並列表示）

---

## ⌨️ キーボードショートカット

### 基本
| キー | 動作 |
|---|---|
| `←` / `PageUp` | 前のページ |
| `→` / `PageDown` | 次のページ |
| `Ctrl + S` | PDFをダウンロード |
| `Ctrl + Z` | 元に戻す |
| `Ctrl + Y` / `Ctrl + Shift + Z` | やり直し |
| `+` / `Ctrl + +` | ズームイン |
| `-` / `Ctrl + -` | ズームアウト |
| `Esc` | 選択解除 / モーダル閉じる |

### 選択・削除
| キー | 動作 |
|---|---|
| `Ctrl + クリック` | ページを追加選択 |
| `Shift + クリック` | ページを範囲選択 |
| `Ctrl + A` | 全選択（フォーカス位置で対象が変わる） |
| `Delete` / `Backspace` | 選択中の注釈 or 複数選択中のページを削除 |

---

## 📁 ディレクトリ構成

```
pdf-editor-pro/
├── index.html              # メインHTML
├── css/style.css           # スタイル定義
├── js/
│   ├── utils.js            # 汎用ヘルパー
│   ├── history.js          # 🆕 アンドゥ/リドゥ
│   ├── storage.js          # 🆕 localStorage自動保存
│   ├── pdf-renderer.js     # PDF表示 (PDF.js)
│   ├── annotations.js      # 注釈 (Fabric.js)
│   ├── comments.js         # 付箋コメント
│   ├── page-manager.js     # ページ管理 + 複数選択 + 一括操作
│   ├── forms.js            # 🆕 PDFフォーム入力
│   ├── ocr.js              # 🆕 OCR (Tesseract.js)
│   ├── signature.js        # 🆕 電子署名
│   ├── compare.js          # 🆕 比較ビュー
│   ├── exporter.js         # PDF出力 (pdf-lib)
│   └── app.js              # イベントバインド・統合
├── README.md
├── TECHNICAL_REPORT.md     # 詳細な技術ドキュメント
├── LICENSE
└── start.sh / start.bat
```

---

## 🛠️ 使用ライブラリ（CDN経由・インストール不要）

| ライブラリ | 用途 | バージョン |
|---|---|---|
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF表示 | 3.11.174 |
| [pdf-lib](https://pdf-lib.js.org/) | PDF生成・編集 | 1.17.1 |
| [Fabric.js](http://fabricjs.com/) | 注釈レイヤー | 5.3.0 |
| [Sortable.js](https://sortablejs.github.io/Sortable/) | D&D並び替え | 1.15.2 |
| [Tesseract.js](https://tesseract.projectnaptha.com/) | 🆕 OCR | 5.0.4 |

---

## ⚠️ 既知の制約

- **OCR初回**: 言語データのダウンロードに数十MBの通信と数十秒かかります（以降ブラウザキャッシュ利用）
- **大規模PDF**: 数百ページのPDFは初期表示・OCR・エクスポートに時間がかかります
- **localStorage容量**: 大量の注釈/コメントを含む大きなPDFは保存できない場合があります（5-10MB制限）
- **`file://`プロトコル**: PDF.js Worker と OCR Worker が動作しないため、必ずHTTPサーバー経由で起動してください

---

## 📜 ライセンス

MIT License — [LICENSE](./LICENSE) を参照

詳細な技術仕様・アーキテクチャは [TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md) を参照してください。
