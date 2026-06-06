# 📘 技術仕様書 - PDF Editor

> 完全クライアントサイドで動作するPDF編集Webアプリの設計・実装ドキュメント

---

## 1. アーキテクチャ概要

### 1.1 設計原則

1. **サーバーレス**: すべての処理をブラウザ内で完結。プライバシー安全。
2. **ビルドツール不要**: HTML/CSS/Vanilla JS のみ。`npm install` 不要。
3. **モジュール分割**: 関心事ごとにJSファイルを分割し、グローバル名前空間オブジェクトで連携。
4. **CDN依存**: 重量級ライブラリ（PDF.js / pdf-lib / Fabric.js / Sortable.js）はCDN経由でロード。

### 1.2 レイヤー構成

```
┌──────────────────────────────────────────────┐
│  UI Layer (index.html / style.css)           │
├──────────────────────────────────────────────┤
│  Controller (app.js)                          │
│  ↓ イベント振り分け                            │
├──────────────────────────────────────────────┤
│  Domain Modules                               │
│  ├─ PdfRenderer    (PDF.js 表示)              │
│  ├─ Annotations    (Fabric.js 注釈)           │
│  ├─ Comments       (付箋管理)                  │
│  ├─ PageManager    (ページ順序・サムネ・D&D)  │
│  └─ Exporter       (pdf-lib 書き出し)         │
├──────────────────────────────────────────────┤
│  Utils (utils.js)  - 汎用ヘルパー              │
└──────────────────────────────────────────────┘
```

### 1.3 データフロー

```
ユーザー操作
    │
    ▼
app.js (イベントハンドラ)
    │
    ▼
ドメインモジュール (状態更新)
    │
    ├─→ PdfRenderer.renderPage()  ←── キャンバス再描画
    ├─→ Annotations.fabricCanvas   ←── 注釈レイヤー更新
    ├─→ Comments.renderMarkers     ←── 付箋マーカー
    └─→ PageManager.renderThumbnails ←── サムネ更新
```

---

## 2. モジュール詳細

### 2.1 `PdfRenderer` (pdf-renderer.js)

**責務**: PDF.jsを用いたPDFの読み込みとキャンバス描画。

**主要API**:

| メソッド | 説明 |
|---|---|
| `loadFromArrayBuffer(buf)` | バイト列からPDF読み込み |
| `renderPage(pageNum)` | 指定表示ページを描画 |
| `renderThumbnail(realIdx, canvas)` | サムネイル描画 |
| `zoomIn()/zoomOut()/zoomFit()` | ズーム操作 |
| `rotatePage(direction)` | 90度回転 |

**重要な状態**:
- `pdfDoc`: PDF.jsドキュメントオブジェクト
- `pageRotations`: 実ページindex → 追加回転角度（90/180/270）のマップ

**ポイント**:
- PDF.js は `Uint8Array` を内部でdetachするため、`buffer.slice(0)` でコピーしてから渡しています。
- 「表示順 (displayIndex)」と「元PDFの物理ページ番号 (realPageIndex)」を明確に区別。

---

### 2.2 `Annotations` (annotations.js)

**責務**: Fabric.jsを用いた注釈オーバーレイレイヤー。

**サポートツール**:

| ツール | 実装 |
|---|---|
| 選択 (`select`) | Fabric標準の選択モード |
| テキスト (`text`) | `fabric.IText` クリックで入力 |
| ハイライト (`highlight`) | 半透明矩形 (opacity 0.35) |
| 矩形 (`rect`) | `fabric.Rect` ボーダーのみ |
| 円 (`circle`) | `fabric.Ellipse` |
| 矢印 (`arrow`) | 線 + 三角形を `fabric.Group` 化 |
| フリーハンド (`draw`) | Fabric `isDrawingMode` |
| 付箋 (`note`) | Comments モジュールへ委譲 |

**ページ別保存**:
- `perPage[realPageIndex] = { json, canvasW, canvasH }`
- ページ切替時に `fabricCanvas.loadFromJSON()` で復元。
- キャンバスサイズが変わっていればスケール補正を適用。

---

### 2.3 `Comments` (comments.js)

**責務**: 付箋型コメントの管理（CRUD + UI同期）。

**データ構造**:

```js
items = {
  "id-xxx-yyy": {
    id: "id-xxx-yyy",
    pageIndex: 3,           // 実ページindex
    x: 0.42, y: 0.18,       // 正規化座標 (0-1)
    author: "田中",
    content: "ここを修正",
    createdAt: "2025/01/15 14:30"
  }
}
```

**正規化座標を使う理由**: ズーム・回転で表示寸法が変わってもマーカー位置を保てるため。

**マーカー描画**: `canvas-wrapper` 内に絶対配置 `<div>` を追加し、クリックでモーダル開く。

---

### 2.4 `PageManager` (page-manager.js)

**責務**: ページ順序・サムネイル・D&D・追加/削除。

**`pageOrder` 配列**:
- 表示順に並んだ「元PDFのページ番号 (1-based)」の配列
- 削除 → 配列から除去
- 並び替え → 配列を組み替え
- 追加（空白/結合） → 末尾に追加 + pdf-lib で再ビルド

**D&D**: Sortable.js の `onEnd` コールバックで `pageOrder` を更新し、現在表示中ページの新しい位置を計算して再描画。

**空白ページ追加 / 別PDF結合**:
1. 現在のPDFバイト列を取得 (`pdfDoc.getData()`)
2. pdf-lib で開き、ページを `addPage()` / `copyPages()`
3. 新バイト列でPdfRendererを再ロード（注釈・コメント・回転は保持）

---

### 2.5 `Exporter` (exporter.js)

**責務**: 編集をすべて反映したPDFを生成・ダウンロード。

**処理フロー**:

```
1. pdf-lib で srcDoc をロード
2. newDoc = createPDF()
3. pageOrder順で copyPages() → newDoc に追加
4. 各ページごとに：
   ├─ pageRotations を適用
   ├─ Fabric注釈をPNG化 → newPage.drawImage() で焼き込み
   └─ 付箋を PDF Text Annotation として追加
5. newDoc.save() → Blob → ダウンロード
```

**注釈の埋め込み戦略**:
- Fabric.jsの注釈は描画レイヤーであり、PDF固有の注釈型に1対1マッピングするのは複雑（特に複合図形やフリーハンド）。
- そのため**画像ラスタライズして全面オーバーレイ**として埋め込む簡潔な方式を採用。
- 透過PNG (`format: 'png'`) なので元PDFのコンテンツは透過し見える。

**付箋の埋め込み戦略**:
- 視覚マーカー（黄色矩形 + 番号）を `drawRectangle` で描画
- 加えて PDF 標準の `Text Annotation` を `newPage.node` に注入（多くのPDFビューワで吹き出し表示される）

---

## 3. 主要な技術的判断

### 3.1 なぜ Fabric.js?

| 候補 | 評価 |
|---|---|
| 生Canvas + 自前ドローイング | 選択・移動・リサイズ・JSONシリアライズを自前実装するのは膨大な工数 |
| Konva.js | 似た機能だが付箋・テキスト入力の標準サポートがFabricの方が手厚い |
| **Fabric.js** ✅ | テキスト編集・選択・JSON保存・フリーハンド全てが標準サポート |

### 3.2 なぜページ追加でPDFを再ロードする?

- PDF.jsは「動的なページ追加」をサポートしていません（読み取り専用ライブラリ）。
- pdf-lib で新バイト列を生成 → PDF.js で再オープン、というラウンドトリップが最もシンプルで堅牢。
- 注釈・コメント・回転は外部状態として保持しているため、ドキュメント再ロードで失われない。

### 3.3 座標系の扱い

- **Canvas座標**: ピクセル単位（ズーム依存）
- **正規化座標** (コメント): 0-1の比率 → ズーム・回転に頑健
- **PDF座標** (エクスポート): 左下原点 → 上下反転して変換

### 3.4 日本語の扱い

- **Fabric注釈テキスト**: 表示時はブラウザフォントで日本語OK。エクスポート時はPNG化されるため日本語フォントが正しく焼き込まれる。
- **PDF Annotation Contents**: `PDFString.of()` でUTF-8として埋め込み。多くのビューワで日本語表示OK。
- **pdf-lib の埋め込みフォント**: 標準Helveticaのみ使用。マーカー番号など英数字のみに限定し、日本語埋め込み問題を回避。

---

## 4. 状態管理サマリ

| 状態 | 保持場所 | 永続化 |
|---|---|---|
| PDFドキュメント | `PdfRenderer.pdfDoc` | エクスポート時のみ |
| ページ順序 | `PageManager.pageOrder` | エクスポートに反映 |
| ページ回転 | `PdfRenderer.pageRotations` | エクスポートに反映 |
| 注釈 | `Annotations.perPage` | エクスポートに反映(画像化) |
| 付箋 | `Comments.items` | エクスポートに反映(PDF注釈) |

> **注**: ブラウザを閉じると状態は失われます（localStorage保存は未実装）。

---

## 5. 拡張ロードマップ

| 優先度 | 機能 | 実装ヒント |
|---|---|---|
| 高 | localStorage で編集状態の自動保存 | `Annotations.perPage` + `Comments.items` + `pageOrder` をJSON化 |
| 中 | アンドゥ/リドゥ | コマンドパターン or 状態スナップショット |
| 中 | フォーム入力 (PDF Form Fields) | pdf-lib の `PDFForm` API |
| 中 | OCR (画像PDFのテキスト化) | Tesseract.js |
| 低 | 電子署名 | pdf-lib + Crypto API |
| 低 | 比較ビュー (2画面) | 既存ビューアを複製 |
| 低 | ページ分割 (1ページ→複数PDFへ) | `copyPages` を逆方向に応用 |

---

## 6. テストガイド

### 6.1 動作確認シナリオ

1. **基本表示**: 任意のPDFをドラッグ&ドロップ → ページ表示・サムネ表示
2. **ページ操作**: サムネを並び替え → 削除 → 回転 → 空白ページ追加
3. **注釈**: テキスト・矩形・円・矢印・ハイライト・フリーハンドを順に追加
4. **付箋**: 任意位置に付箋追加 → 作成者・内容入力 → 右パネルから参照
5. **結合**: 別PDFを結合 → サムネに追加ページが現れる
6. **エクスポート**: ダウンロード → ダウンロードPDFを別ビューア(Adobe Reader等)で開いて注釈・付箋が見えるか確認

### 6.2 トラブルシュート

| 症状 | 対処 |
|---|---|
| `file://` で PDF.js Worker エラー | ローカルサーバーで起動 (`python3 -m http.server`) |
| CDN障害でライブラリ未ロード | 各ライブラリをローカル `vendor/` に配置し相対パス参照に変更 |
| 大きなPDFで遅い | サムネのスケールを下げる (`PdfRenderer.renderThumbnail` の引数を 0.18 → 0.10) |

---

## 7. ライセンス

本ソフトウェアは MIT License で配布されます。利用ライブラリのライセンス:

- PDF.js: Apache 2.0
- pdf-lib: MIT
- Fabric.js: MIT
- Sortable.js: MIT
