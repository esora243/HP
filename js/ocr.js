/* ============================================
   ocr.js - Tesseract.js OCR
   ============================================ */

const OCR = {
  results: {},  // {realPageIndex: text}
  running: false,
  worker: null,

  async getWorker(lang) {
    if (this.worker) {
      try { await this.worker.terminate(); } catch (e) {}
      this.worker = null;
    }
    this.worker = await Tesseract.createWorker(lang, 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          this.updateProgress(m.progress, m.status);
        } else if (m.status) {
          this.updateProgress(m.progress || 0, m.status);
        }
      }
    });
    return this.worker;
  },

  updateProgress(progress, status) {
    const fill = document.getElementById('ocr-progress-fill');
    const text = document.getElementById('ocr-progress-text');
    if (fill) fill.style.width = Math.round(progress * 100) + '%';
    if (text) {
      const statusJa = {
        'loading tesseract core': 'コア読込中...',
        'initializing tesseract': '初期化中...',
        'loading language traineddata': '言語データ読込中...',
        'initializing api': 'API初期化中...',
        'recognizing text': '認識中...',
      }[status] || status;
      text.textContent = `${statusJa} ${Math.round(progress * 100)}%`;
    }
  },

  /**
   * 現在ページOCR
   */
  async runCurrent() {
    if (this.running) {
      Utils.toast('OCR実行中です', 'warn');
      return;
    }
    if (!PdfRenderer.pdfDoc) return;
    const realIdx = PdfRenderer.getCurrentRealPageIndex();
    if (!realIdx) return;
    const lang = document.getElementById('ocr-lang').value;

    this.running = true;
    document.getElementById('ocr-progress').hidden = false;
    document.getElementById('btn-ocr-run').disabled = true;
    document.getElementById('btn-ocr-all').disabled = true;
    Utils.toast('OCR開始 (初回は言語データDLで時間がかかります)', 'info', 3000);

    try {
      const worker = await this.getWorker(lang);
      const text = await this._recognizePage(worker, realIdx);
      this.results[realIdx] = text;
      this.renderResults();
      Utils.toast('OCR完了', 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('OCR失敗: ' + e.message, 'error');
    } finally {
      this.running = false;
      document.getElementById('ocr-progress').hidden = true;
      document.getElementById('btn-ocr-run').disabled = false;
      document.getElementById('btn-ocr-all').disabled = false;
    }
  },

  /**
   * 全ページOCR
   */
  async runAll() {
    if (this.running) return;
    if (!PdfRenderer.pdfDoc) return;
    if (!confirm(`全${PageManager.pageOrder.length}ページに対してOCRを実行します。よろしいですか？\n(時間がかかります)`)) return;

    const lang = document.getElementById('ocr-lang').value;
    this.running = true;
    document.getElementById('ocr-progress').hidden = false;
    document.getElementById('btn-ocr-run').disabled = true;
    document.getElementById('btn-ocr-all').disabled = true;

    try {
      const worker = await this.getWorker(lang);
      const total = PageManager.pageOrder.length;
      for (let i = 0; i < total; i++) {
        const realIdx = PageManager.pageOrder[i];
        this.updateProgress(i / total, `Page ${i+1}/${total}`);
        const text = await this._recognizePage(worker, realIdx);
        this.results[realIdx] = text;
        this.renderResults();
      }
      Utils.toast(`${total}ページ OCR完了`, 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('OCR失敗: ' + e.message, 'error');
    } finally {
      this.running = false;
      document.getElementById('ocr-progress').hidden = true;
      document.getElementById('btn-ocr-run').disabled = false;
      document.getElementById('btn-ocr-all').disabled = false;
    }
  },

  async _recognizePage(worker, realPageIndex) {
    // ページを高解像度でレンダリング
    const page = await PdfRenderer.pdfDoc.getPage(realPageIndex);
    const viewport = page.getViewport({ scale: 2.0 });
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = viewport.width;
    tempCanvas.height = viewport.height;
    await page.render({ canvasContext: tempCanvas.getContext('2d'), viewport }).promise;
    const result = await worker.recognize(tempCanvas);
    return result.data.text || '';
  },

  renderResults() {
    const el = document.getElementById('ocr-result');
    if (!el) return;
    const keys = Object.keys(this.results);
    if (keys.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>🔍</p><p>OCR未実行</p></div>`;
      return;
    }
    const realToDisplay = {};
    PageManager.pageOrder.forEach((realIdx, i) => { realToDisplay[realIdx] = i + 1; });

    const sorted = keys.sort((a, b) => (realToDisplay[a] || 999) - (realToDisplay[b] || 999));
    el.innerHTML = sorted.map(k => {
      const disp = realToDisplay[k] || '?';
      const txt = this.results[k] || '(空)';
      return `
        <div class="ocr-page-result">
          <h4>ページ ${disp}
            <button class="copy-btn" data-page="${k}">📋 コピー</button>
            <button class="copy-btn" data-page-add="${k}">＋ 注釈追加</button>
          </h4>
          <div>${escapeHtmlBasic(txt)}</div>
        </div>`;
    }).join('');

    el.querySelectorAll('.copy-btn[data-page]').forEach(b => {
      b.addEventListener('click', () => {
        navigator.clipboard.writeText(this.results[b.dataset.page]);
        Utils.toast('クリップボードにコピー', 'success');
      });
    });
    el.querySelectorAll('.copy-btn[data-page-add]').forEach(b => {
      b.addEventListener('click', () => {
        const realPage = parseInt(b.dataset.pageAdd, 10);
        // 該当ページへ移動
        const disp = realToDisplay[realPage];
        if (disp) PdfRenderer.renderPage(disp);
        setTimeout(() => {
          // 左上にテキスト追加
          const itext = new fabric.IText(this.results[realPage].substring(0, 200) + '...', {
            left: 30, top: 30,
            fill: '#1f2937',
            fontSize: 14,
            fontFamily: 'Hiragino Sans, Meiryo, sans-serif',
            backgroundColor: 'rgba(254, 243, 199, 0.7)',
          });
          Annotations.fabricCanvas.add(itext);
          Annotations.fabricCanvas.renderAll();
          Utils.toast('OCR結果を注釈として追加', 'success');
        }, 400);
      });
    });
  },

  reset() {
    this.results = {};
    this.renderResults();
    if (this.worker) {
      try { this.worker.terminate(); } catch (e) {}
      this.worker = null;
    }
  }
};

function escapeHtmlBasic(s) {
  return (s || '').replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
}
