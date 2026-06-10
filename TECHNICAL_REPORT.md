# 📘 技術仕様書 - PDF Editor Pro v2.0

完全クライアントサイドで動作する高機能PDF編集Webアプリの設計・実装ドキュメント

---

## 1. v2.0 変更概要

v1.0からの主な拡張：

| カテゴリ | 内容 |
|---|---|
| 一括編集 | 複数選択（Ctrl/Shift+クリック、Ctrl+A）+ 一括削除・回転・抽出 |
| キーボード操作 | Deleteキーで注釈・ページ削除、Ctrl+Z/Y でアンドゥ/リドゥ |
| 自動保存 | localStorage によるドキュメント別の状態保存・復元 |
| 履歴管理 | コマンド履歴スタック（最大50ステップ） |
| フォーム入力 | pdf-lib の PDFForm API でフィールド検出・入力 |
| OCR | Tesseract.js で画像PDF→テキスト変換（日英中韓対応） |
| 電子署名 | 手書き/タイプ/画像 の3モードで署名作成・配置 |
| 比較ビュー | 別PDFを並列表示 |

---

## 2. アーキテクチャ

### 2.1 モジュール構成

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (HTML/CSS)                   │
├─────────────────────────────────────────────────────────┤
│                  app.js (Controller)                     │
│        イベント振り分け・モジュール協調・初期化           │
├─────────────────────────────────────────────────────────┤
│  Core Modules                                            │
│  ├─ PdfRenderer   PDF.jsで表示                          │
│  ├─ Annotations   Fabric.jsで注釈レイヤー                │
│  ├─ Comments      付箋コメント                          │
│  ├─ PageManager   ページ管理 + 🆕 複数選択・一括操作     │
│  └─ Exporter      pdf-libで書き出し                     │
│                                                          │
│  🆕 Advanced Modules                                     │
│  ├─ History       アンドゥ/リドゥスタック                │
│  ├─ Storage       localStorage自動保存                   │
│  ├─ Forms         PDFフォームフィールド入力              │
│  ├─ OCR           Tesseract.jsテキスト抽出               │
│  ├─ Signature     電子署名 (3モード)                     │
│  └─ Compare       比較ビュー                             │
│                                                          │
│  Utils                                                   │
│  └─ utils.js      汎用ヘルパー                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 データフロー (履歴含む)

```
ユーザー操作
    │
    ▼
app.js (イベントハンドラ)
    │
    ▼
ドメインモジュール (状態更新)
    │
    ├──▶ History.record()    ──▶ スナップショット履歴に追加
    │
    ├──▶ Storage.scheduleSave() ──▶ localStorage へ保存（デバウンス）
    │
    └──▶ UI更新 (キャンバス・サムネ・パネル)
```

---

## 3. 新規モジュール詳細

### 3.1 `History` (history.js) — アンドゥ/リドゥ

**設計**: スナップショット方式（コマンドパターンではなく状態保存）。理由は実装が単純で漏れがなく、複合的な操作も自然に扱える。

**スナップショット内容**:
```js
{
  pageOrder: [...],
  pageRotations: {...},
  annotations: {...},    // Fabric JSON のディープコピー
  comments: {...},
  currentPage: 1,
  formValues: {...},
}
```

**主要API**:
| メソッド | 動作 |
|---|---|
| `record()` | デバウンス付きで現在状態を記録（200ms） |
| `recordImmediate()` | 即時記録（ファイルオープン時など） |
| `undo()` / `redo()` | カーソルを移動して状態を適用 |
| `apply(snap)` | スナップショットを適用（isApplyingフラグで再記録防止） |

**ポイント**:
- 上限50スナップショット、超過時は古いものから捨てる
- `History.isApplying` で適用中の自己ループを防止
- 注釈変更（object:added/modified/removed）でも自動記録

### 3.2 `Storage` (storage.js) — 自動保存

**設計**: PDFごとの内容ハッシュをキーにして `localStorage` に保存。

**ドキュメントID生成**:
```
docId = `${filename}_${size}_${hash(先頭8KB)}`
```

ファイル名+サイズ+ハッシュの組合せで実用上の同一性を判定。完全暗号学的ハッシュではないが、誤判定確率は極めて低い。

**インデックス管理**:
- `pdf-editor-v2:index` キーに最近10件のメタ情報を保存
- 容量超過 (`QuotaExceededError`) 時は古いエントリを自動削除

**保存タイミング**:
- 注釈追加/編集/削除
- ページ操作（並び替え/削除/回転/追加）
- コメント編集
- フォーム値変更

すべて1秒のデバウンスでバッチ書き込み → 連続操作時の負荷軽減。

**復元フロー**:
1. PDFオープン時に `docId` を計算
2. `localStorage` に該当データがあれば確認ダイアログ
3. OKなら `restore(data)` で状態を全復元

### 3.3 `PageManager` 拡張 — 複数選択 & 一括操作

**新規状態**:
- `selectedIndices: Set<number>` — 表示インデックスの集合
- `lastClickedIndex: number` — Shift範囲選択の起点

**クリック処理ロジック**:
```js
onThumbClick(e, displayIndex):
  if Shift + lastClickedIndex >= 0:
    range = [min(last, current) .. max(last, current)]
    selectedIndices.addAll(range)
  elif Ctrl/Cmd:
    toggle(displayIndex)
    lastClickedIndex = displayIndex
  else:
    selectedIndices.clear()
    renderPage(displayIndex + 1)
```

**バルクアクション**:
| メソッド | 動作 |
|---|---|
| `selectAll()` | 全ページ選択 |
| `deselectAll()` | 選択解除 |
| `bulkDelete()` | 選択ページを一括削除（降順処理でindexずれ防止） |
| `bulkRotate(dir)` | 選択ページの回転角度を一括加算 |
| `bulkExport()` | 選択ページのみで新PDF出力（Exporterへ委譲） |

### 3.4 `Forms` (forms.js) — PDFフォーム入力

**検出方式**: pdf-libの `PDFDocument.getForm().getFields()` でAcroForm全フィールドを抽出。

**対応フィールド**:
- `PDFTextField` → `<input type="text">`
- `PDFCheckBox` → `<input type="checkbox">`
- `PDFDropdown` / `PDFOptionList` → `<select>`
- `PDFRadioGroup` → `<select>`（簡易対応）

**ページ判定**: Widget annotationの `P()` (parent page ref) を `getPages()` で照合してページindex算出。

**UI**: 2つの表示モード
1. **右パネル一覧**: フィールド名・型・ページ番号・入力欄
2. **ビューア上オーバーレイ**: フィールド位置に絶対配置の入力欄

両者は同じ `values` を共有し相互に同期する。

**エクスポート連携**: `Exporter.exportPdf()` 内で `Forms.applyToDoc(srcDoc)` を呼び、pdf-libの該当フィールドに値を `setText/check/select` する。

### 3.5 `OCR` (ocr.js) — Tesseract.js統合

**フロー**:
1. ページをcanvas に高解像度レンダリング（scale 2.0）
2. Tesseract Workerにcanvasオブジェクトをそのままrecognizeさせる
3. `text` プロパティを取得して `results[realPageIndex]` に保存

**進捗UI**: Tesseractのloggerコールバックでステータスをローカライズ表示
```
loading tesseract core → コア読込中...
recognizing text → 認識中... 73%
```

**結果アクション**:
- 📋 クリップボードへコピー
- ＋ 注釈として該当ページに追加（自動的にハイライト付きテキスト注釈になる）

**多言語**: `jpn+eng / eng / jpn / chi_sim / chi_tra / kor` をプリセット

### 3.6 `Signature` (signature.js) — 電子署名

**3つの作成モード**:

| モード | 実装 |
|---|---|
| 手書き | `<canvas>` に mouse/touch でフリーハンド描画 → toDataURL |
| タイプ | テキスト入力 + フォント選択 → オフスクリーンcanvasに描画 |
| 画像 | PNG/JPGをFileReaderで読み込み |

確定後、署名は `currentImageDataUrl` に保存され「署名スタンプツール」が有効化される。ツール選択中にビューアをクリックすると `fabric.Image.fromURL` でその位置に配置。

### 3.7 `Compare` (compare.js) — 比較ビュー

**実装**: もう1つの `<canvas id="pdf-canvas-2">` を用意し、`pdfjsLib.getDocument` で別ドキュメントをロード。CSSでメインキャンバスの右側に表示する2カラムレイアウトに切替。

**同期**: メインの `renderPage()` 内で `Compare.syncWithMain()` を呼び、同じページ番号を比較側でも描画。

---

## 4. キーボードショートカット実装

`app.js > bindKeyboardEvents` で集中管理。

**衝突回避**:
- 入力欄フォーカス中 (`INPUT`, `TEXTAREA`) はスキップ
- Fabric.js のテキスト編集中 (`isEditing`) もスキップ
- モーダル開放中は `Esc` 以外スキップ

**Deleteキーの優先順位**:
1. Fabric注釈が選択されている → 注釈削除
2. ページが複数選択 → ページ一括削除
3. 単一選択中 → 確認ダイアログ後ページ削除
4. それ以外 → 何もしない（誤削除防止）

**Ctrl+Aの動作切り替え**:
- フォーカスがサイドバー側 → `PageManager.selectAll()`
- それ以外 → `Annotations.selectAll()`

---

## 5. 状態管理一覧 (v2.0)

| 状態 | モジュール | 永続化 | History対象 |
|---|---|---|---|
| PDFドキュメント | PdfRenderer.pdfDoc | × (再ロード) | × |
| ページ順序 | PageManager.pageOrder | localStorage | ✅ |
| ページ回転 | PdfRenderer.pageRotations | localStorage | ✅ |
| 注釈 | Annotations.perPage | localStorage | ✅ |
| 付箋 | Comments.items | localStorage | ✅ |
| フォーム値 | Forms.values | localStorage | ✅ |
| 選択ページ | PageManager.selectedIndices | × | × |
| OCR結果 | OCR.results | × | × |
| 署名 | Signature.currentImageDataUrl | × | × |
| 履歴 | History.stack | × | - |

---

## 6. テストガイド

### 6.1 機能別テストシナリオ

#### 一括編集
1. PDF読込 → サムネで `Ctrl+クリック` で3ページ選択
2. `Shift+クリック` で範囲選択追加
3. `Ctrl+A` で全選択
4. `Delete` キーで一括削除（確認ダイアログ）
5. 「↺」/「↻」で一括回転
6. 「📤 抽出」で選択ページのみエクスポート

#### Undo/Redo
1. 注釈を3つ追加
2. ページを1つ削除
3. `Ctrl+Z` を5回押す → すべての操作が巻き戻る
4. `Ctrl+Y` で再度進める

#### 自動保存
1. PDF読込・注釈追加・コメント追加
2. ブラウザを閉じる
3. 同じPDFを開く → 復元ダイアログ → OK
4. 編集状態が完全復元されることを確認
5. ヘッダー「🗑️」で保存データ削除

#### フォーム入力
1. AcroFormを含むPDFを読込
2. 「📋 フォーム」ボタンクリック → 自動検出
3. 右パネル or ビューア上のオーバーレイで入力
4. ダウンロード → 別ビューアで開いて値が保存されているか確認

#### OCR
1. 画像PDF（スキャンPDFなど）を読込
2. 右パネル「🔍 OCR」タブ → 言語選択
3. 「現ページ実行」 → 結果テキストを確認
4. 「📋 コピー」「＋ 注釈追加」を試す

#### 電子署名
1. ヘッダー「✍️ 署名」 → 3モードを切替
2. 手書きモードで署名 → 確定
3. ビューア右下に自動配置されることを確認
4. 「✍️」ツールでクリックすると別位置に追加配置

#### 比較ビュー
1. PDF Aを読込
2. ヘッダー「⇆ 比較」 → 「比較するPDFを開く」
3. PDF Bを選択 → 並列表示
4. ページ移動するとBも同期

---

## 7. パフォーマンス考慮事項

| 操作 | コスト | 最適化 |
|---|---|---|
| サムネイル描画 | scale 0.18 × ページ数 | 必要な分だけ非同期描画 |
| 注釈シリアライズ | 全注釈オブジェクトJSON化 | デバウンス保存（1秒） |
| 履歴記録 | 全状態ディープコピー | デバウンス（200ms）+ 上限50件 |
| OCR | ページ毎にWorkerで実行 | Web Worker（メインスレッド非ブロック） |
| エクスポート | 全ページ画像化 + PDF再構築 | プログレストースト表示 |

---

## 8. 拡張可能性

将来追加できる機能：

| 機能 | 実装方針 |
|---|---|
| マルチドラッグ（選択中複数を一気に移動） | Sortable.js `multiDrag` プラグイン |
| ページ分割（1PDF→複数PDF） | bulkExport の応用 |
| PDF/A 変換 | pdf-lib メタデータ操作 |
| パスワード保護 | qpdf-wasm or PDFLib のメタ操作 |
| 共同編集 | WebRTC + CRDT（Y.js等） |
| クラウド保存 | IndexedDB + Google Drive API 連携 |
| AI要約 | OCR結果をChatGPT APIへ送信 |

---

## 9. ライセンス

本ソフトウェア: MIT License

依存ライブラリ:
- PDF.js: Apache 2.0
- pdf-lib: MIT
- Fabric.js: MIT
- Sortable.js: MIT
- Tesseract.js: Apache 2.0
