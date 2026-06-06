/* ============================================
   page-manager.js - ページ管理 (順序・追加・削除・サムネ)
   ============================================ */

const PageManager = {
  // pageOrder: 表示順に並んだエントリ配列
  //   各要素: { src: 'main' | docId, realIndex, key }
  //   - main: 元PDF (PdfRenderer.pdfDoc)
  //   - docId: 結合した別PDFの参照ID (extraDocs[docId])
  //   - 'blank': 空白ページ
  // ただし PdfRenderer は元PDFのページしか描画できないため
  // 「main以外」のページは事前に元PDFに pdf-lib でマージしてから扱う
  //
  // 簡略化のため: 別PDF/空白ページは追加時にすぐ元PDFへマージし
  // 新しいPdfRenderer.pdfDoc をリビルドする方式を採用。
  pageOrder: [],   // [realPageIndex(1-based), ...]
  sortable: null,

  /**
   * 初期化: PDFをロードした直後に呼ぶ
   */
  init() {
    const total = PdfRenderer.numPages();
    this.pageOrder = Array.from({ length: total }, (_, i) => i + 1);
    this.renderThumbnails();
  },

  /**
   * サムネイル全描画
   */
  async renderThumbnails() {
    const listEl = document.getElementById('thumbnail-list');
    listEl.innerHTML = '';

    for (let i = 0; i < this.pageOrder.length; i++) {
      const realIdx = this.pageOrder[i];
      const item = document.createElement('div');
      item.className = 'thumbnail-item';
      item.dataset.pageIndex = i;
      item.dataset.realIndex = realIdx;

      const canvas = document.createElement('canvas');
      const label = document.createElement('div');
      label.className = 'page-num';
      label.textContent = `${i + 1} / ${this.pageOrder.length}`;

      item.appendChild(canvas);
      item.appendChild(label);
      listEl.appendChild(item);

      try {
        await PdfRenderer.renderThumbnail(realIdx, canvas, 0.18);
      } catch (e) {
        console.error('Thumbnail error:', e);
      }

      // コメントバッジ
      const cnt = Comments.countForPage(realIdx);
      if (cnt > 0) {
        const badge = document.createElement('div');
        badge.className = 'badge-comment';
        badge.textContent = '💬' + cnt;
        item.appendChild(badge);
      }

      item.addEventListener('click', (e) => {
        if (e.target.closest('.sortable-drag')) return;
        PdfRenderer.renderPage(i + 1);
      });
    }

    // ソート可能化
    if (this.sortable) this.sortable.destroy();
    this.sortable = Sortable.create(listEl, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: (evt) => this.onReorder(evt),
    });

    // ページカウント更新
    document.getElementById('page-count-info').textContent = `${this.pageOrder.length} ページ`;

    // ボタン有効化
    this.updateUIState();
  },

  /**
   * 単一サムネイル更新 (回転後等)
   */
  async updateThumbnail(displayIndex) {
    const item = document.querySelector(`.thumbnail-item[data-page-index="${displayIndex}"]`);
    if (!item) return;
    const realIdx = this.pageOrder[displayIndex];
    const canvas = item.querySelector('canvas');
    await PdfRenderer.renderThumbnail(realIdx, canvas, 0.18);
  },

  /**
   * 全サムネイル再描画(軽量)
   */
  async refreshAllThumbnails() {
    for (let i = 0; i < this.pageOrder.length; i++) {
      await this.updateThumbnail(i);
    }
    // コメントバッジ更新
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

  /**
   * D&Dで並び替えられた
   */
  onReorder(evt) {
    const newOrder = [];
    document.querySelectorAll('#thumbnail-list .thumbnail-item').forEach(el => {
      newOrder.push(parseInt(el.dataset.realIndex, 10));
    });
    this.pageOrder = newOrder;

    // ラベル番号を更新
    document.querySelectorAll('#thumbnail-list .thumbnail-item').forEach((el, i) => {
      el.dataset.pageIndex = i;
      el.querySelector('.page-num').textContent = `${i + 1} / ${this.pageOrder.length}`;
    });

    // 現在表示中ページの新しい位置を計算
    const realIdx = PdfRenderer.getCurrentRealPageIndex();
    const newDisplayIndex = this.pageOrder.indexOf(realIdx);
    PdfRenderer.currentPage = (newDisplayIndex >= 0) ? (newDisplayIndex + 1) : 1;
    PdfRenderer.renderPage(PdfRenderer.currentPage);
    Comments.renderList();

    Utils.toast('ページを並び替えました', 'success');
  },

  /**
   * 現在表示中のページを削除
   */
  deleteCurrentPage() {
    if (this.pageOrder.length <= 1) {
      Utils.toast('最後のページは削除できません', 'warn');
      return;
    }
    if (!Utils.confirm('このページを削除しますか？(注釈・コメントも削除されます)')) return;

    const idx = PdfRenderer.currentPage - 1;
    const realIdx = this.pageOrder[idx];

    // 注釈・コメント削除
    Annotations.clearForPage(realIdx);
    Object.keys(Comments.items).forEach(k => {
      if (Comments.items[k].pageIndex === realIdx) delete Comments.items[k];
    });

    this.pageOrder.splice(idx, 1);

    // 次に表示するページ
    let next = idx + 1;
    if (next > this.pageOrder.length) next = this.pageOrder.length;

    this.renderThumbnails();
    PdfRenderer.renderPage(next);
    Comments.renderList();
    Utils.toast('ページを削除しました', 'success');
  },

  /**
   * 空白ページを末尾に追加 (pdf-libでドキュメント再構築)
   */
  async addBlankPage() {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('空白ページを追加中...');
    try {
      // 現在のドキュメントをpdf-libで開く
      const pdfBytes = await Exporter.serializeCurrentDoc(); // 元データのみ(注釈無し)
      const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
      pdfDoc.addPage(); // A4ぐらいのデフォルトサイズ
      const newBytes = await pdfDoc.save();
      await this.reloadFromBytes(newBytes, /*appendOrderForNewPage*/ true);
      Utils.toast('空白ページを追加しました', 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('空白ページの追加に失敗しました', 'error');
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  /**
   * 別PDFを結合 (末尾に追加)
   */
  async mergePdf(file) {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('PDFを結合中...');
    try {
      const targetBytes = await Exporter.serializeCurrentDoc();
      const sourceBytes = await Utils.readFileAsArrayBuffer(file);

      const targetDoc = await PDFLib.PDFDocument.load(targetBytes);
      const sourceDoc = await PDFLib.PDFDocument.load(sourceBytes);

      const indices = sourceDoc.getPageIndices();
      const copied = await targetDoc.copyPages(sourceDoc, indices);
      copied.forEach(p => targetDoc.addPage(p));

      const newBytes = await targetDoc.save();
      await this.reloadFromBytes(newBytes, true, indices.length);
      Utils.toast(`${indices.length}ページを結合しました`, 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('PDF結合に失敗しました', 'error');
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  /**
   * 新しいバイト列で再ロード (注釈・コメントを保持)
   * @param appendNewPages 末尾に追加された場合は新ページを順序末尾に
   * @param newPagesCount 追加されたページ数 (デフォルト1)
   */
  async reloadFromBytes(bytes, appendNewPages = false, newPagesCount = 1) {
    // 旧 pageOrder/realIdx は元PDFのページ番号を指していた
    // 新ドキュメントでも頭の N ページは同じ並び+末尾追加 が保証されている
    const oldOrder = [...this.pageOrder];
    const oldAnnotations = { ...Annotations.perPage };
    const oldRotations = { ...PdfRenderer.pageRotations };
    const oldComments = { ...Comments.items };
    const oldTotalReal = PdfRenderer.numPages();

    await PdfRenderer.loadFromArrayBuffer(bytes);

    // 新トータル
    const newTotal = PdfRenderer.numPages();

    // 注釈・回転はrealIdxベース → ページ位置が変わらない前提なのでそのまま戻せる
    Annotations.perPage = oldAnnotations;
    PdfRenderer.pageRotations = oldRotations;
    Comments.items = oldComments;

    // pageOrder 再構築: 元の順序 + 追加分は末尾
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

  /**
   * UI状態更新
   */
  updateUIState() {
    const hasDoc = !!PdfRenderer.pdfDoc;
    document.getElementById('btn-add-blank').disabled = !hasDoc;
    document.getElementById('btn-merge').disabled = !hasDoc;
    document.getElementById('btn-download').disabled = !hasDoc;
    document.getElementById('btn-rotate-left').disabled = !hasDoc;
    document.getElementById('btn-rotate-right').disabled = !hasDoc;
    document.getElementById('btn-delete-page').disabled = !hasDoc;
    document.getElementById('btn-add-comment').disabled = !hasDoc;
  }
};
