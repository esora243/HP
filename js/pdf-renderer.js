/* ============================================
   pdf-renderer.js - PDF表示
   ============================================ */

const PdfRenderer = {
  pdfDoc: null,
  currentPage: 1,
  zoom: 1.0,
  baseScale: 1.5,
  pdfCanvas: null,
  ctx: null,
  pageRotations: {},

  async loadFromArrayBuffer(buffer) {
    const copy = buffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(copy) });
    this.pdfDoc = await loadingTask.promise;
    this.currentPage = 1;
    this.pageRotations = {};
    return this.pdfDoc;
  },

  numPages() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  },

  async renderPage(pageNum) {
    if (!this.pdfDoc) return;
    const totalPages = PageManager.pageOrder.length;
    if (totalPages === 0) return;
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalPages) pageNum = totalPages;

    this.currentPage = pageNum;
    const realPageIndex = PageManager.pageOrder[pageNum - 1];

    const page = await this.pdfDoc.getPage(realPageIndex);
    const userRotation = this.pageRotations[realPageIndex] || 0;
    const baseRotation = page.rotate || 0;
    const totalRotation = (baseRotation + userRotation) % 360;

    const viewport = page.getViewport({
      scale: this.baseScale * this.zoom,
      rotation: totalRotation
    });

    if (!this.pdfCanvas) {
      this.pdfCanvas = document.getElementById('pdf-canvas');
      this.ctx = this.pdfCanvas.getContext('2d');
    }
    this.pdfCanvas.width = viewport.width;
    this.pdfCanvas.height = viewport.height;
    this.pdfCanvas.style.width = viewport.width + 'px';
    this.pdfCanvas.style.height = viewport.height + 'px';

    await page.render({ canvasContext: this.ctx, viewport }).promise;

    Annotations.resizeCanvas(viewport.width, viewport.height);
    Annotations.loadForPage(realPageIndex);
    Comments.renderMarkersForPage(realPageIndex);
    if (typeof Forms !== 'undefined') Forms.renderOverlay();

    document.getElementById('status-page').textContent = `ページ ${pageNum} / ${totalPages}`;
    document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';

    document.querySelectorAll('.thumbnail-item').forEach((el, idx) => {
      el.classList.toggle('active', idx === pageNum - 1);
    });

    // 比較ビュー同期
    if (typeof Compare !== 'undefined' && Compare.active) {
      Compare.syncWithMain();
    }
  },

  async renderThumbnail(realPageIndex, canvas, scale = 0.18) {
    const page = await this.pdfDoc.getPage(realPageIndex);
    const userRotation = this.pageRotations[realPageIndex] || 0;
    const baseRotation = page.rotate || 0;
    const viewport = page.getViewport({
      scale,
      rotation: (baseRotation + userRotation) % 360
    });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
  },

  zoomIn() {
    this.zoom = Math.min(3.0, this.zoom + 0.1);
    this.renderPage(this.currentPage);
  },
  zoomOut() {
    this.zoom = Math.max(0.3, this.zoom - 0.1);
    this.renderPage(this.currentPage);
  },
  zoomFit() {
    const wrapper = document.getElementById('viewer-wrapper');
    if (!this.pdfCanvas) return;
    const availW = wrapper.clientWidth - 40;
    const availH = wrapper.clientHeight - 40;
    const curW = this.pdfCanvas.width / this.zoom;
    const curH = this.pdfCanvas.height / this.zoom;
    this.zoom = Math.min(availW / curW, availH / curH, 2.0);
    this.renderPage(this.currentPage);
  },

  rotatePage(direction = 'right') {
    if (!this.pdfDoc) return;
    const realIdx = PageManager.pageOrder[this.currentPage - 1];
    const cur = this.pageRotations[realIdx] || 0;
    const delta = direction === 'right' ? 90 : -90;
    this.pageRotations[realIdx] = ((cur + delta) % 360 + 360) % 360;
    Annotations.clearForPage(realIdx);
    this.renderPage(this.currentPage);
    PageManager.updateThumbnail(this.currentPage - 1);
    History.record();
  },

  getCurrentRealPageIndex() {
    if (!PageManager.pageOrder.length) return null;
    return PageManager.pageOrder[this.currentPage - 1];
  }
};
