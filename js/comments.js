/* ============================================
   comments.js - 付箋コメント管理
   ============================================ */

const Comments = {
  // {id: {id, pageIndex, x, y, author, content, createdAt}}
  // x,y は注釈キャンバスの正規化座標 (0-1)
  items: {},
  editingId: null,
  pendingPos: null,

  /**
   * ポインタ位置にコメントを追加
   */
  addCommentAt(x, y) {
    const realIdx = PdfRenderer.getCurrentRealPageIndex();
    if (!realIdx) return;
    const canvasW = Annotations.fabricCanvas.getWidth();
    const canvasH = Annotations.fabricCanvas.getHeight();
    const id = Utils.uid();
    this.items[id] = {
      id,
      pageIndex: realIdx,
      x: x / canvasW,
      y: y / canvasH,
      author: '',
      content: '',
      createdAt: Utils.formatNow(),
    };
    this.editingId = id;
    this.openModal(id);
  },

  openModal(id) {
    const item = this.items[id];
    if (!item) return;
    this.editingId = id;
    document.getElementById('note-author').value = item.author || '';
    document.getElementById('note-content').value = item.content || '';
    document.getElementById('note-modal').hidden = false;
    setTimeout(() => document.getElementById('note-content').focus(), 100);
  },

  saveCurrent() {
    if (!this.editingId) return;
    const item = this.items[this.editingId];
    if (!item) return;
    item.author = document.getElementById('note-author').value.trim();
    item.content = document.getElementById('note-content').value.trim();
    if (!item.content) {
      // 空ならキャンセル扱いで削除
      this.deleteCurrent();
      return;
    }
    this.closeModal();
    this.renderMarkersForPage(PdfRenderer.getCurrentRealPageIndex());
    this.renderList();
    PageManager.refreshAllThumbnails();
    Utils.toast('コメントを保存しました', 'success');
  },

  deleteCurrent() {
    if (!this.editingId) return;
    delete this.items[this.editingId];
    this.closeModal();
    this.renderMarkersForPage(PdfRenderer.getCurrentRealPageIndex());
    this.renderList();
    PageManager.refreshAllThumbnails();
  },

  closeModal() {
    document.getElementById('note-modal').hidden = true;
    this.editingId = null;
  },

  /**
   * 指定ページの付箋マーカーを再描画
   */
  renderMarkersForPage(realPageIndex) {
    // 既存マーカー削除
    document.querySelectorAll('.note-marker').forEach(el => el.remove());

    const wrapper = document.getElementById('viewer-canvas-wrapper');
    if (!wrapper) return;
    const canvasW = Annotations.fabricCanvas?.getWidth() || 0;
    const canvasH = Annotations.fabricCanvas?.getHeight() || 0;

    let i = 1;
    Object.values(this.items)
      .filter(c => c.pageIndex === realPageIndex)
      .forEach(c => {
        const marker = document.createElement('div');
        marker.className = 'note-marker';
        marker.title = c.content || '(空)';
        marker.innerHTML = `<span>${i++}</span>`;
        marker.style.left = (c.x * canvasW - 14) + 'px';
        marker.style.top = (c.y * canvasH - 28) + 'px';
        marker.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openModal(c.id);
        });
        wrapper.appendChild(marker);
      });
  },

  /**
   * 右パネルのコメント一覧描画
   */
  renderList() {
    const listEl = document.getElementById('comment-list');
    const all = Object.values(this.items);
    if (all.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <p>💬</p>
          <p>コメントはまだありません</p>
          <small>付箋ツール（📌）でページにコメントを追加できます</small>
        </div>`;
      return;
    }

    // ページ番号(表示順)を取得
    const realToDisplay = {};
    PageManager.pageOrder.forEach((realIdx, i) => {
      realToDisplay[realIdx] = i + 1;
    });

    listEl.innerHTML = all
      .sort((a, b) => (realToDisplay[a.pageIndex] || 999) - (realToDisplay[b.pageIndex] || 999))
      .map(c => {
        const dispPage = realToDisplay[c.pageIndex] || '?';
        return `
          <div class="comment-item" data-id="${c.id}">
            <div class="author">
              <span>${escapeHtml(c.author || '匿名')}</span>
              <span class="page-label">P.${dispPage}</span>
            </div>
            <div class="content">${escapeHtml(c.content)}</div>
            <div class="time">${c.createdAt}</div>
          </div>`;
      }).join('');

    listEl.querySelectorAll('.comment-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const c = this.items[id];
        if (!c) return;
        // 対応ページへ移動
        const dispPage = realToDisplay[c.pageIndex];
        if (dispPage) PdfRenderer.renderPage(dispPage);
        setTimeout(() => this.openModal(id), 400);
      });
    });
  },

  /**
   * 指定ページのコメント数を取得 (サムネ表示用)
   */
  countForPage(realPageIndex) {
    return Object.values(this.items).filter(c => c.pageIndex === realPageIndex).length;
  },

  getAll() {
    return this.items;
  }
};

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// グローバル呼び出し用（モーダルから）
function saveCurrentNote() { Comments.saveCurrent(); }
function deleteCurrentNote() { Comments.deleteCurrent(); }
function closeNoteModal() { Comments.closeModal(); }
