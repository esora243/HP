/* ============================================
   compare.js - 比較ビュー
   ============================================ */

const Compare = {
  active: false,
  pdfDoc2: null,
  currentPage2: 1,

  open() {
    document.getElementById('compare-modal').hidden = false;
  },

  async loadCompare(file) {
    try {
      Utils.setStatus('比較PDFを読み込み中...');
      const buf = await Utils.readFileAsArrayBuffer(file);
      const copy = buf.slice(0);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(copy) });
      this.pdfDoc2 = await loadingTask.promise;
      this.currentPage2 = 1;
      this.active = true;
      document.getElementById('compare-modal').hidden = true;
      document.getElementById('app-main').classList.add('compare-mode');
      document.getElementById('viewer-canvas-wrapper-2').style.display = 'block';
      await this.renderPage2(1);
      // 左右をシンクロさせる
      await this.syncWithMain();
      Utils.toast(`比較PDF読み込み完了 (${this.pdfDoc2.numPages}ページ)`, 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('比較PDFの読み込みに失敗', 'error');
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  async renderPage2(pageNum) {
    if (!this.pdfDoc2) return;
    if (pageNum < 1) pageNum = 1;
    if (pageNum > this.pdfDoc2.numPages) pageNum = this.pdfDoc2.numPages;
    this.currentPage2 = pageNum;
    const page = await this.pdfDoc2.getPage(pageNum);
    const viewport = page.getViewport({
      scale: PdfRenderer.baseScale * PdfRenderer.zoom,
      rotation: page.rotate || 0,
    });
    const canvas = document.getElementById('pdf-canvas-2');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = viewport.height + 'px';
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  },

  /**
   * メインの現在ページと同じ番号を比較側でも表示
   */
  async syncWithMain() {
    if (!this.active) return;
    const p = PdfRenderer.currentPage;
    await this.renderPage2(p);
  },

  exit() {
    this.active = false;
    this.pdfDoc2 = null;
    document.getElementById('app-main').classList.remove('compare-mode');
    document.getElementById('viewer-canvas-wrapper-2').style.display = 'none';
    Utils.toast('比較ビューを終了しました', 'info');
  },

  toggle() {
    if (this.active) {
      this.exit();
    } else {
      this.open();
    }
  }
};
