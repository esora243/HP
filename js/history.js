/* ============================================
   history.js - アンドゥ/リドゥ管理
   ============================================ */

const History = {
  stack: [],       // スナップショット配列
  cursor: -1,      // 現在位置 (stack内のindex)
  maxSize: 50,
  isApplying: false,  // 適用中フラグ (再記録防止)
  pending: false,
  debounceTimer: null,

  /**
   * 現在の状態スナップショットを取得
   */
  snapshot() {
    return {
      pageOrder: [...PageManager.pageOrder],
      pageRotations: { ...PdfRenderer.pageRotations },
      annotations: JSON.parse(JSON.stringify(Annotations.perPage)),
      comments: JSON.parse(JSON.stringify(Comments.items)),
      currentPage: PdfRenderer.currentPage,
      formValues: Forms ? { ...Forms.values } : {},
    };
  },

  /**
   * 履歴に記録 (デバウンス)
   */
  record() {
    if (this.isApplying) return;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this._recordNow();
    }, 200);
  },

  _recordNow() {
    if (this.isApplying) return;
    // 現在カーソル以降の履歴を破棄
    if (this.cursor < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.cursor + 1);
    }
    this.stack.push(this.snapshot());
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    } else {
      this.cursor++;
    }
    this.updateUI();
    Storage.scheduleSave();
  },

  /**
   * 即時記録 (デバウンス無し)
   */
  recordImmediate() {
    clearTimeout(this.debounceTimer);
    this._recordNow();
  },

  /**
   * アンドゥ
   */
  async undo() {
    if (!this.canUndo()) return;
    this.cursor--;
    await this.apply(this.stack[this.cursor]);
    Utils.toast('元に戻しました', 'info', 1500);
  },

  /**
   * リドゥ
   */
  async redo() {
    if (!this.canRedo()) return;
    this.cursor++;
    await this.apply(this.stack[this.cursor]);
    Utils.toast('やり直しました', 'info', 1500);
  },

  canUndo() { return this.cursor > 0; },
  canRedo() { return this.cursor < this.stack.length - 1; },

  /**
   * スナップショットを適用
   */
  async apply(snap) {
    this.isApplying = true;
    try {
      PageManager.pageOrder = [...snap.pageOrder];
      PdfRenderer.pageRotations = { ...snap.pageRotations };
      Annotations.perPage = JSON.parse(JSON.stringify(snap.annotations));
      Comments.items = JSON.parse(JSON.stringify(snap.comments));
      if (Forms && snap.formValues) Forms.values = { ...snap.formValues };
      PageManager.selectedIndices = new Set();
      await PageManager.renderThumbnails();
      await PdfRenderer.renderPage(snap.currentPage || 1);
      Comments.renderList();
      if (Forms) Forms.renderListPanel();
      PageManager.updateBulkUI();
      this.updateUI();
    } finally {
      this.isApplying = false;
    }
  },

  /**
   * リセット
   */
  reset() {
    this.stack = [];
    this.cursor = -1;
    this.updateUI();
  },

  updateUI() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = !this.canUndo();
    if (btnRedo) btnRedo.disabled = !this.canRedo();
  }
};
