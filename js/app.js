/* ============================================
   app.js - メインエントリ・イベントバインド
   ============================================ */

window._originalFilename = null;

document.addEventListener('DOMContentLoaded', () => {
  bindHeaderEvents();
  bindToolbarEvents();
  bindBulkEvents();
  bindTabEvents();
  bindDragDropEvents();
  bindKeyboardEvents();
  bindFeatureEvents();
  Annotations.init();
  Signature.init();
  showRestoreHint();
  Storage.updateStatus();
});

/* ----------- ヘッダー ----------- */
function bindHeaderEvents() {
  document.getElementById('btn-open').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  document.getElementById('file-input').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (f) await openPdfFile(f);
    e.target.value = '';
  });

  document.getElementById('btn-add-blank').addEventListener('click', () => PageManager.addBlankPage());

  document.getElementById('btn-merge').addEventListener('click', () => {
    document.getElementById('file-input-merge').click();
  });
  document.getElementById('file-input-merge').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (f) await PageManager.mergePdf(f);
    e.target.value = '';
  });

  document.getElementById('btn-download').addEventListener('click', () => Exporter.exportPdf());

  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('help-modal').hidden = false;
  });

  document.getElementById('btn-clear-storage').addEventListener('click', () => {
    Storage.clearAll();
  });

  document.getElementById('btn-undo').addEventListener('click', () => History.undo());
  document.getElementById('btn-redo').addEventListener('click', () => History.redo());
}

/* ----------- ツールバー ----------- */
function bindToolbarEvents() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      Annotations.setTool(btn.dataset.tool);
    });
  });

  document.getElementById('color-picker').addEventListener('input', (e) => {
    Annotations.setColor(e.target.value);
  });

  document.getElementById('stroke-width').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    document.getElementById('stroke-value').textContent = v;
    Annotations.setStrokeWidth(v);
  });

  document.getElementById('btn-select-all-annot').addEventListener('click', () => {
    Annotations.selectAll();
  });
  document.getElementById('btn-delete-annot').addEventListener('click', () => {
    Annotations.deleteSelected();
  });

  document.getElementById('btn-rotate-left').addEventListener('click', () => {
    if (PageManager.selectedIndices.size >= 2) {
      PageManager.bulkRotate('left');
    } else {
      PdfRenderer.rotatePage('left');
    }
  });
  document.getElementById('btn-rotate-right').addEventListener('click', () => {
    if (PageManager.selectedIndices.size >= 2) {
      PageManager.bulkRotate('right');
    } else {
      PdfRenderer.rotatePage('right');
    }
  });

  document.getElementById('btn-delete-page').addEventListener('click', () => {
    if (PageManager.selectedIndices.size >= 2) {
      PageManager.bulkDelete();
    } else {
      PageManager.deleteCurrentPage();
    }
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => PdfRenderer.zoomIn());
  document.getElementById('btn-zoom-out').addEventListener('click', () => PdfRenderer.zoomOut());
  document.getElementById('btn-zoom-fit').addEventListener('click', () => PdfRenderer.zoomFit());
}

/* ----------- 一括操作 ----------- */
function bindBulkEvents() {
  document.getElementById('btn-select-all').addEventListener('click', () => PageManager.selectAll());
  document.getElementById('btn-deselect').addEventListener('click', () => PageManager.deselectAll());
  document.getElementById('btn-bulk-rotate-left').addEventListener('click', () => PageManager.bulkRotate('left'));
  document.getElementById('btn-bulk-rotate-right').addEventListener('click', () => PageManager.bulkRotate('right'));
  document.getElementById('btn-bulk-delete').addEventListener('click', () => PageManager.bulkDelete());
  document.getElementById('btn-bulk-export').addEventListener('click', () => PageManager.bulkExport());
}

/* ----------- タブ ----------- */
function bindTabEvents() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(c => {
    c.hidden = c.id !== 'tab-' + tabName;
  });
}

/* ----------- 機能ボタン: フォーム / OCR / 署名 / 比較 ----------- */
function bindFeatureEvents() {
  document.getElementById('btn-forms').addEventListener('click', async () => {
    if (Forms.fields.length === 0) {
      await Forms.detect();
    }
    Forms.toggle();
  });

  document.getElementById('btn-ocr').addEventListener('click', () => {
    switchTab('ocr');
    Utils.toast('OCRタブを開きました', 'info', 1500);
  });
  document.getElementById('btn-ocr-run').addEventListener('click', () => OCR.runCurrent());
  document.getElementById('btn-ocr-all').addEventListener('click', () => OCR.runAll());

  document.getElementById('btn-signature').addEventListener('click', () => Signature.openModal());

  document.getElementById('btn-compare').addEventListener('click', () => Compare.toggle());

  document.getElementById('btn-compare-select').addEventListener('click', () => {
    document.getElementById('file-input-compare').click();
  });
  document.getElementById('file-input-compare').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (f) await Compare.loadCompare(f);
    e.target.value = '';
  });
}

/* ----------- ドラッグ&ドロップ ----------- */
function bindDragDropEvents() {
  const overlay = document.getElementById('drop-overlay');
  let dragCount = 0;

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCount++;
    overlay.hidden = false;
  });
  window.addEventListener('dragover', (e) => { e.preventDefault(); });
  window.addEventListener('dragleave', () => {
    dragCount--;
    if (dragCount <= 0) { overlay.hidden = true; dragCount = 0; }
  });
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    overlay.hidden = true;
    dragCount = 0;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      Utils.toast('PDFファイルのみ対応', 'error');
      return;
    }
    await openPdfFile(file);
  });
}

/* ----------- キーボード ----------- */
function bindKeyboardEvents() {
  document.addEventListener('keydown', (e) => {
    const modalOpen = !document.getElementById('help-modal').hidden ||
                      !document.getElementById('note-modal').hidden ||
                      !document.getElementById('signature-modal').hidden ||
                      !document.getElementById('compare-modal').hidden;
    if (modalOpen) {
      if (e.key === 'Escape') {
        document.getElementById('help-modal').hidden = true;
        document.getElementById('signature-modal').hidden = true;
        document.getElementById('compare-modal').hidden = true;
        if (!document.getElementById('note-modal').hidden) Comments.closeModal();
      }
      return;
    }

    if (!PdfRenderer.pdfDoc) return;

    const isInput = document.activeElement &&
      ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    const isEditingFabric = Annotations.fabricCanvas?.getActiveObject()?.isEditing;

    // 入力中はテキスト編集を阻害しない
    if (isInput || isEditingFabric) {
      // ただし Ctrl+Z / Ctrl+Y は入力欄でも動作させる場合は省略
      return;
    }

    // Ctrl/Cmd + キー
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) History.redo();
        else History.undo();
        return;
      }
      if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        History.redo();
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        Exporter.exportPdf();
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        // サムネ領域 or ビューア領域に応じて
        const focusInSidebar = document.activeElement?.closest('.sidebar') ||
          document.activeElement?.classList?.contains('thumbnail-item');
        if (focusInSidebar) {
          PageManager.selectAll();
        } else {
          Annotations.selectAll();
        }
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        PdfRenderer.zoomIn();
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        PdfRenderer.zoomOut();
        return;
      }
    }

    // 通常キー
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      PdfRenderer.renderPage(PdfRenderer.currentPage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      PdfRenderer.renderPage(PdfRenderer.currentPage - 1);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      // 優先順位:
      // 1. 注釈が選択されていれば注釈削除
      // 2. 複数ページ選択中ならページ一括削除
      // 3. それ以外は何もしない (誤削除防止)
      const activeObjs = Annotations.fabricCanvas?.getActiveObjects();
      if (activeObjs && activeObjs.length > 0) {
        Annotations.deleteSelected();
      } else if (PageManager.selectedIndices.size >= 2) {
        PageManager.bulkDelete();
      } else if (PageManager.selectedIndices.size === 1) {
        // 単一選択中はそのページを削除
        const idx = [...PageManager.selectedIndices][0];
        if (Utils.confirm(`ページ ${idx + 1} を削除しますか？`)) {
          PageManager._deletePages([idx]);
        }
      }
    } else if (e.key === 'Escape') {
      // 選択解除
      PageManager.deselectAll();
      Annotations.fabricCanvas?.discardActiveObject();
      Annotations.fabricCanvas?.renderAll();
    } else if (e.key === '+') {
      PdfRenderer.zoomIn();
    } else if (e.key === '-') {
      PdfRenderer.zoomOut();
    }
  });
}

/* ----------- 復元ヒント ----------- */
function showRestoreHint() {
  const idx = Storage.getIndex();
  const hintEl = document.getElementById('restore-hint');
  if (!hintEl) return;
  if (idx.length > 0) {
    hintEl.hidden = false;
    hintEl.textContent = `💾 ${idx.length}件の編集データが保存されています。同じPDFを開くと自動復元されます。`;
  }
}

/* ----------- PDFオープン ----------- */
async function openPdfFile(file) {
  if (file.type !== 'application/pdf') {
    Utils.toast('PDFファイルを選択してください', 'error');
    return;
  }
  Utils.setStatus('PDFを読み込み中...');
  try {
    window._originalFilename = file.name;
    const buf = await Utils.readFileAsArrayBuffer(file);

    // ドキュメントIDを計算
    const docId = await Storage.computeDocId(file, buf);

    await PdfRenderer.loadFromArrayBuffer(buf);

    document.getElementById('viewer-empty').style.display = 'none';
    document.getElementById('viewer-canvas-wrapper').style.display = 'block';

    // 状態リセット
    Annotations.perPage = {};
    Comments.items = {};
    PdfRenderer.pageRotations = {};
    if (typeof Forms !== 'undefined') Forms.reset();
    if (typeof OCR !== 'undefined') OCR.reset();
    History.reset();

    PageManager.init();

    // 保存データを復元
    Storage.setCurrentDoc(docId);
    const saved = Storage.load(docId);
    if (saved) {
      const restore = confirm(
        `このPDFには前回の編集データがあります（${new Date(saved.savedAt).toLocaleString('ja-JP')}）。\n` +
        `復元しますか？\n\n` +
        `[OK] 復元する\n` +
        `[キャンセル] 新規に開く（保存データは削除されません）`
      );
      if (restore) {
        await Storage.restore(saved);
        Utils.toast('前回の編集データを復元しました', 'success', 4000);
      } else {
        await PdfRenderer.renderPage(1);
        Comments.renderList();
      }
    } else {
      await PdfRenderer.renderPage(1);
      Comments.renderList();
    }

    // 初期状態をHistoryに記録
    History.recordImmediate();

    Utils.toast(`${file.name} を読み込みました (${PdfRenderer.numPages()}ページ)`, 'success');
    Storage.updateStatus();
  } catch (e) {
    console.error(e);
    Utils.toast('PDFの読み込みに失敗', 'error');
  } finally {
    Utils.setStatus('準備完了');
  }
}
