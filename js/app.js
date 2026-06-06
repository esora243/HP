/* ============================================
   app.js - メインエントリ・イベントバインド
   ============================================ */

window._originalFilename = null;

document.addEventListener('DOMContentLoaded', () => {
  bindHeaderEvents();
  bindToolbarEvents();
  bindDragDropEvents();
  bindKeyboardEvents();
  Annotations.init();
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

  document.getElementById('btn-add-blank').addEventListener('click', () => {
    PageManager.addBlankPage();
  });

  document.getElementById('btn-merge').addEventListener('click', () => {
    document.getElementById('file-input-merge').click();
  });
  document.getElementById('file-input-merge').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (f) await PageManager.mergePdf(f);
    e.target.value = '';
  });

  document.getElementById('btn-download').addEventListener('click', () => {
    Exporter.exportPdf();
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('help-modal').hidden = false;
  });
}

/* ----------- ツールバー ----------- */
function bindToolbarEvents() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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

  document.getElementById('btn-delete-annot').addEventListener('click', () => {
    Annotations.deleteSelected();
  });

  document.getElementById('btn-rotate-left').addEventListener('click', () => {
    PdfRenderer.rotatePage('left');
  });
  document.getElementById('btn-rotate-right').addEventListener('click', () => {
    PdfRenderer.rotatePage('right');
  });

  document.getElementById('btn-delete-page').addEventListener('click', () => {
    PageManager.deleteCurrentPage();
  });

  document.getElementById('btn-zoom-in').addEventListener('click', () => PdfRenderer.zoomIn());
  document.getElementById('btn-zoom-out').addEventListener('click', () => PdfRenderer.zoomOut());
  document.getElementById('btn-zoom-fit').addEventListener('click', () => PdfRenderer.zoomFit());

  document.getElementById('btn-add-comment').addEventListener('click', () => {
    Annotations.setTool('note');
    Utils.toast('ページ上の任意の位置をクリックして付箋を追加してください', 'info');
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
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  window.addEventListener('dragleave', () => {
    dragCount--;
    if (dragCount <= 0) {
      overlay.hidden = true;
      dragCount = 0;
    }
  });
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    overlay.hidden = true;
    dragCount = 0;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      Utils.toast('PDFファイルのみ対応しています', 'error');
      return;
    }
    await openPdfFile(file);
  });
}

/* ----------- キーボードショートカット ----------- */
function bindKeyboardEvents() {
  document.addEventListener('keydown', (e) => {
    // モーダル開放中はスキップ
    const modalOpen = !document.getElementById('help-modal').hidden ||
                      !document.getElementById('note-modal').hidden;
    if (modalOpen) {
      if (e.key === 'Escape') {
        document.getElementById('help-modal').hidden = true;
        if (!document.getElementById('note-modal').hidden) Comments.closeModal();
      }
      return;
    }

    if (!PdfRenderer.pdfDoc) return;

    // 入力欄にフォーカスがある場合はスキップ
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      PdfRenderer.renderPage(PdfRenderer.currentPage + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      PdfRenderer.renderPage(PdfRenderer.currentPage - 1);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      Annotations.deleteSelected();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      Exporter.exportPdf();
    } else if (e.key === '+' || (e.ctrlKey && e.key === '=')) {
      e.preventDefault();
      PdfRenderer.zoomIn();
    } else if (e.key === '-' || (e.ctrlKey && e.key === '-')) {
      e.preventDefault();
      PdfRenderer.zoomOut();
    }
  });
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
    await PdfRenderer.loadFromArrayBuffer(buf);

    // ビューアの状態切替
    document.getElementById('viewer-empty').style.display = 'none';
    document.getElementById('viewer-canvas-wrapper').style.display = 'block';

    // 注釈・コメントリセット
    Annotations.perPage = {};
    Comments.items = {};
    PdfRenderer.pageRotations = {};

    PageManager.init();
    await PdfRenderer.renderPage(1);
    Comments.renderList();

    Utils.toast(`${file.name} を読み込みました (${PdfRenderer.numPages()}ページ)`, 'success');
  } catch (e) {
    console.error(e);
    Utils.toast('PDFの読み込みに失敗しました', 'error');
  } finally {
    Utils.setStatus('準備完了');
  }
}
