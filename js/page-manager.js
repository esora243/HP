/* ============================================
   page-manager.js - ページ管理 + 複数選択 + 一括操作
   ============================================ */

const PageManager = {
  pageOrder: [],
  selectedIndices: new Set(),  // 複数選択 (表示index 0-based)
  lastClickedIndex: -1,        // Shift範囲選択用
  sortable: null,

  init() {
    const total = PdfRenderer.numPages();
    this.pageOrder = Array.from({ length: total }, (_, i) => i + 1);
    this.selectedIndices = new Set();
    this.renderThumbnails();
  },

  async renderThumbnails() {
    const listEl = document.getElementById('thumbnail-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    for (let i = 0; i < this.pageOrder.length; i++) {
      const realIdx = this.pageOrder[i];
      const item = document.createElement('div');
      item.className = 'thumbnail-item';
      item.dataset.pageIndex = i;
      item.dataset.realIndex = realIdx;
      item.tabIndex = 0; // フォーカス可能に

      const checkbox = document.createElement('div');
      checkbox.className = 'select-checkbox';

      const canvas = document.createElement('canvas');
      const label = document.createElement('div');
      label.className = 'page-num';
      label.textContent = `${i + 1} / ${this.pageOrder.length}`;

      item.appendChild(checkbox);
      item.appendChild(canvas);
      item.appendChild(label);
      listEl.appendChild(item);

      try {
        await PdfRenderer.renderThumbnail(realIdx, canvas, 0.18);
      } catch (e) {
        console.error('Thumbnail error:', e);
      }

      const cnt = Comments.countForPage(realIdx);
      if (cnt > 0) {
        const badge = document.createElement('div');
        badge.className = 'badge-comment';
        badge.textContent = '💬' + cnt;
        item.appendChild(badge);
      }

      // 選択状態反映
      if (this.selectedIndices.has(i)) item.classList.add('multi-selected');

      item.addEventListener('click', (e) => this.onThumbClick(e, i));
    }

    if (this.sortable) this.sortable.destroy();
    this.sortable = Sortable.create(listEl, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: (evt) => this.onReorder(evt),
      // 複数選択中はそれらをまとめて移動
      multiDrag: false,
    });

    document.getElementById('page-count-info').textContent = `${this.pageOrder.length} ページ`;
    this.updateUIState();
    this.updateBulkUI();
  },

  /**
   * サムネクリック処理 (Ctrl/Shift対応)
   */
  onThumbClick(e, displayIndex) {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    if (isShift && this.lastClickedIndex >= 0) {
      // 範囲選択
      const from = Math.min(this.lastClickedIndex, displayIndex);
      const to = Math.max(this.lastClickedIndex, displayIndex);
      for (let i = from; i <= to; i++) this.selectedIndices.add(i);
    } else if (isCtrl) {
      // トグル
      if (this.selectedIndices.has(displayIndex)) {
        this.selectedIndices.delete(displayIndex);
      } else {
        this.selectedIndices.add(displayIndex);
      }
      this.lastClickedIndex = displayIndex;
    } else {
      // 通常クリック: 単一表示 + 選択クリア
      this.selectedIndices.clear();
      this.lastClickedIndex = displayIndex;
      PdfRenderer.renderPage(displayIndex + 1);
    }

    this.refreshSelectionUI();
    this.updateBulkUI();

    // 単一表示は通常クリック以外の場合も該当ページへ
    if (!isCtrl && !isShift) {
      PdfRenderer.renderPage(displayIndex + 1);
    }
  },

  refreshSelectionUI() {
    document.querySelectorAll('.thumbnail-item').forEach((el, i) => {
      el.classList.toggle('multi-selected', this.selectedIndices.has(i));
    });
  },

  selectAll() {
    this.selectedIndices = new Set(this.pageOrder.map((_, i) => i));
    this.refreshSelectionUI();
    this.updateBulkUI();
    Utils.toast(`${this.pageOrder.length}ページを選択`, 'info', 1500);
  },

  deselectAll() {
    this.selectedIndices.clear();
    this.lastClickedIndex = -1;
    this.refreshSelectionUI();
    this.updateBulkUI();
  },

  updateBulkUI() {
    const bulkEl = document.getElementById('bulk-actions');
    const countEl = document.getElementById('selected-count');
    if (!bulkEl) return;
    if (this.selectedIndices.size >= 2) {
      bulkEl.hidden = false;
      countEl.textContent = this.selectedIndices.size;
    } else {
      bulkEl.hidden = true;
    }
  },

  async updateThumbnail(displayIndex) {
    const item = document.querySelector(`.thumbnail-item[data-page-index="${displayIndex}"]`);
    if (!item) return;
    const realIdx = this.pageOrder[displayIndex];
    const canvas = item.querySelector('canvas');
    await PdfRenderer.renderThumbnail(realIdx, canvas, 0.18);
  },

  async refreshAllThumbnails() {
    for (let i = 0; i < this.pageOrder.length; i++) {
      await this.updateThumbnail(i);
    }
    document.querySelectorAll('.thumbnail-item').forEach((el, i) => {
      const old = el.querySelector('.badge-comment');
      if (old) old.remove();
      const realIdx = this.pageOrder[i];
      const cnt = Comments.countForPage(realIdx);
      if (cnt > 0) {
        const badge = document.createElement('div');
        badge.className = 'badge-comment';
        badge.textContent = '💬' + cnt;
        el.appendChild(badge);
      }
    });
  },

  onReorder(evt) {
    const newOrder = [];
    document.querySelectorAll('#thumbnail-list .thumbnail-item').forEach(el => {
      newOrder.push(parseInt(el.dataset.realIndex, 10));
    });
    this.pageOrder = newOrder;
    this.selectedIndices = new Set();  // 並び替え後はクリア

    document.querySelectorAll('#thumbnail-list .thumbnail-item').forEach((el, i) => {
      el.dataset.pageIndex = i;
      el.querySelector('.page-num').textContent = `${i + 1} / ${this.pageOrder.length}`;
    });

    const realIdx = PdfRenderer.getCurrentRealPageIndex();
    const newDisplayIndex = this.pageOrder.indexOf(realIdx);
    PdfRenderer.currentPage = (newDisplayIndex >= 0) ? (newDisplayIndex + 1) : 1;
    PdfRenderer.renderPage(PdfRenderer.currentPage);
    Comments.renderList();
    this.refreshSelectionUI();
    this.updateBulkUI();

    Utils.toast('ページを並び替えました', 'success', 1500);
    History.record();
  },

  /**
   * 単一ページ削除 (現在表示)
   */
  deleteCurrentPage() {
    if (this.pageOrder.length <= 1) {
      Utils.toast('最後のページは削除できません', 'warn');
      return;
    }
    if (!Utils.confirm('このページを削除しますか？')) return;
    this._deletePages([PdfRenderer.currentPage - 1]);
  },

  /**
   * 選択ページを一括削除
   */
  bulkDelete() {
    if (this.selectedIndices.size === 0) return;
    if (this.selectedIndices.size >= this.pageOrder.length) {
      Utils.toast('全ページ削除はできません', 'warn');
      return;
    }
    if (!Utils.confirm(`選択中の${this.selectedIndices.size}ページを削除しますか？`)) return;
    this._deletePages([...this.selectedIndices]);
  },

  _deletePages(displayIndices) {
    // 降順で削除して index ずれを防ぐ
    const sorted = [...displayIndices].sort((a, b) => b - a);
    sorted.forEach(idx => {
      const realIdx = this.pageOrder[idx];
      Annotations.clearForPage(realIdx);
      Object.keys(Comments.items).forEach(k => {
        if (Comments.items[k].pageIndex === realIdx) delete Comments.items[k];
      });
      this.pageOrder.splice(idx, 1);
    });

    this.selectedIndices.clear();
    this.lastClickedIndex = -1;

    let next = Math.min(sorted[sorted.length - 1] + 1, this.pageOrder.length);
    if (next < 1) next = 1;

    this.renderThumbnails();
    PdfRenderer.renderPage(next);
    Comments.renderList();
    Utils.toast(`${sorted.length}ページを削除`, 'success');
    History.record();
  },

  /**
   * 一括回転
   */
  bulkRotate(direction = 'right') {
    if (this.selectedIndices.size === 0) {
      Utils.toast('ページを選択してください', 'warn');
      return;
    }
    const delta = direction === 'right' ? 90 : -90;
    this.selectedIndices.forEach(idx => {
      const realIdx = this.pageOrder[idx];
      const cur = PdfRenderer.pageRotations[realIdx] || 0;
      PdfRenderer.pageRotations[realIdx] = ((cur + delta) % 360 + 360) % 360;
      Annotations.clearForPage(realIdx);
    });
    this.refreshAllThumbnails();
    PdfRenderer.renderPage(PdfRenderer.currentPage);
    Utils.toast(`${this.selectedIndices.size}ページを回転`, 'success');
    History.record();
  },

  /**
   * 選択ページのみで新PDFを作成 (抽出エクスポート)
   */
  bulkExport() {
    if (this.selectedIndices.size === 0) {
      Utils.toast('ページを選択してください', 'warn');
      return;
    }
    const sortedDisplayIdx = [...this.selectedIndices].sort((a, b) => a - b);
    Exporter.exportPdf({ pageDisplayIndices: sortedDisplayIdx });
  },

  async addBlankPage() {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('空白ページを追加中...');
    try {
      const pdfBytes = await Exporter.serializeCurrentDoc();
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      pdfDoc.addPage();
      const newBytes = await pdfDoc.save();
      await this.reloadFromBytes(newBytes, true);
      Utils.toast('空白ページを追加しました', 'success');
      History.record();
    } catch (e) {
      console.error(e);
      Utils.toast('空白ページの追加に失敗', 'error');
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  async mergePdf(file) {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('PDFを結合中...');
    try {
      const targetBytes = await Exporter.serializeCurrentDoc();
      const sourceBytes = await Utils.readFileAsArrayBuffer(file);
      const targetDoc = await PDFLib.PDFDocument.load(targetBytes, { ignoreEncryption: true });
      const sourceDoc = await PDFLib.PDFDocument.load(sourceBytes, { ignoreEncryption: true });

      const indices = sourceDoc.getPageIndices();
      const copied = await targetDoc.copyPages(sourceDoc, indices);
      copied.forEach(p => targetDoc.addPage(p));

      const newBytes = await targetDoc.save();
      await this.reloadFromBytes(newBytes, true, indices.length);
      Utils.toast(`${indices.length}ページを結合`, 'success');
      History.record();
    } catch (e) {
      console.error(e);
      Utils.toast('PDF結合に失敗', 'error');
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  async reloadFromBytes(bytes, appendNewPages = false, newPagesCount = 1) {
    const oldOrder = [...this.pageOrder];
    const oldAnnotations = { ...Annotations.perPage };
    const oldRotations = { ...PdfRenderer.pageRotations };
    const oldComments = { ...Comments.items };
    const oldTotalReal = PdfRenderer.numPages();

    await PdfRenderer.loadFromArrayBuffer(bytes);

    Annotations.perPage = oldAnnotations;
    PdfRenderer.pageRotations = oldRotations;
    Comments.items = oldComments;

    const newPageOrder = oldOrder.slice();
    if (appendNewPages) {
      for (let i = 0; i < newPagesCount; i++) {
        newPageOrder.push(oldTotalReal + 1 + i);
      }
    }
    this.pageOrder = newPageOrder;

    await this.renderThumbnails();
    await PdfRenderer.renderPage(PdfRenderer.currentPage || 1);
    Comments.renderList();
  },

  updateUIState() {
    const hasDoc = !!PdfRenderer.pdfDoc;
    ['btn-add-blank','btn-merge','btn-download','btn-rotate-left','btn-rotate-right',
     'btn-delete-page','btn-forms','btn-ocr','btn-signature','btn-compare',
     'btn-ocr-run','btn-ocr-all'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = !hasDoc;
    });
  }
};
