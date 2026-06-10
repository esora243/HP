/* ============================================
   storage.js - localStorage 自動保存
   ============================================ */

const Storage = {
  KEY_PREFIX: 'pdf-editor-v2:',
  INDEX_KEY: 'pdf-editor-v2:index',
  MAX_ENTRIES: 10,
  saveTimer: null,
  currentDocId: null,

  /**
   * PDFファイルからユニークIDを生成 (名前+サイズ+先頭バイトのハッシュ)
   */
  async computeDocId(file, buffer) {
    const head = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 8192)));
    let hash = 0;
    for (let i = 0; i < head.length; i++) {
      hash = ((hash << 5) - hash + head[i]) | 0;
    }
    return `${file.name}_${file.size}_${(hash >>> 0).toString(16)}`;
  },

  /**
   * 現在のドキュメントを設定
   */
  setCurrentDoc(docId) {
    this.currentDocId = docId;
  },

  /**
   * 自動保存 (デバウンス)
   */
  scheduleSave() {
    if (!this.currentDocId) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 1000);
  },

  /**
   * 即時保存
   */
  save() {
    if (!this.currentDocId) return;
    try {
      const data = {
        version: 2,
        savedAt: new Date().toISOString(),
        filename: window._originalFilename || 'untitled.pdf',
        pageOrder: PageManager.pageOrder,
        pageRotations: PdfRenderer.pageRotations,
        annotations: Annotations.perPage,
        comments: Comments.items,
        currentPage: PdfRenderer.currentPage,
        formValues: (typeof Forms !== 'undefined') ? Forms.values : {},
      };
      const key = this.KEY_PREFIX + this.currentDocId;
      localStorage.setItem(key, JSON.stringify(data));
      this.updateIndex(this.currentDocId, data.filename, data.savedAt);
      this.showSaveIndicator();
      this.updateStatus();
    } catch (e) {
      console.error('Storage save failed:', e);
      if (e.name === 'QuotaExceededError') {
        Utils.toast('localStorageの容量制限を超えました。古いデータを削除します。', 'warn');
        this.cleanup();
      }
    }
  },

  /**
   * 読み込み
   */
  load(docId) {
    try {
      const raw = localStorage.getItem(this.KEY_PREFIX + docId);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Storage load failed:', e);
      return null;
    }
  },

  /**
   * 状態を復元
   */
  async restore(data) {
    PageManager.pageOrder = data.pageOrder || [];
    PdfRenderer.pageRotations = data.pageRotations || {};
    Annotations.perPage = data.annotations || {};
    Comments.items = data.comments || {};
    if (typeof Forms !== 'undefined') Forms.values = data.formValues || {};
    await PageManager.renderThumbnails();
    await PdfRenderer.renderPage(data.currentPage || 1);
    Comments.renderList();
    this.updateStatus();
  },

  /**
   * インデックス更新
   */
  updateIndex(docId, filename, savedAt) {
    let index = [];
    try {
      const raw = localStorage.getItem(this.INDEX_KEY);
      if (raw) index = JSON.parse(raw);
    } catch (e) { index = []; }
    index = index.filter(e => e.docId !== docId);
    index.unshift({ docId, filename, savedAt });
    if (index.length > this.MAX_ENTRIES) {
      const removed = index.splice(this.MAX_ENTRIES);
      removed.forEach(e => localStorage.removeItem(this.KEY_PREFIX + e.docId));
    }
    localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
  },

  /**
   * インデックス取得
   */
  getIndex() {
    try {
      return JSON.parse(localStorage.getItem(this.INDEX_KEY) || '[]');
    } catch (e) { return []; }
  },

  /**
   * 古いデータをクリーンアップ
   */
  cleanup() {
    const index = this.getIndex();
    if (index.length > 5) {
      const removed = index.splice(5);
      removed.forEach(e => localStorage.removeItem(this.KEY_PREFIX + e.docId));
      localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    }
  },

  /**
   * 現在のドキュメントデータを削除
   */
  clearCurrent() {
    if (!this.currentDocId) return;
    localStorage.removeItem(this.KEY_PREFIX + this.currentDocId);
    const index = this.getIndex().filter(e => e.docId !== this.currentDocId);
    localStorage.setItem(this.INDEX_KEY, JSON.stringify(index));
    this.updateStatus();
  },

  /**
   * 全データクリア
   */
  clearAll() {
    if (!confirm('すべての自動保存データを削除しますか？')) return;
    const index = this.getIndex();
    index.forEach(e => localStorage.removeItem(this.KEY_PREFIX + e.docId));
    localStorage.removeItem(this.INDEX_KEY);
    Utils.toast('自動保存データを削除しました', 'success');
    this.updateStatus();
  },

  /**
   * 保存インジケータ表示
   */
  showSaveIndicator() {
    const el = document.getElementById('autosave-indicator');
    if (!el) return;
    el.hidden = false;
    clearTimeout(this._indicatorTimer);
    this._indicatorTimer = setTimeout(() => { el.hidden = true; }, 2000);
  },

  /**
   * ステータスバー更新
   */
  updateStatus() {
    const el = document.getElementById('status-storage');
    if (!el) return;
    if (this.currentDocId && localStorage.getItem(this.KEY_PREFIX + this.currentDocId)) {
      el.textContent = '💾 自動保存ON';
    } else {
      el.textContent = '';
    }
  }
};
