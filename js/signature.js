/* ============================================
   signature.js - 電子署名
   ============================================ */

const Signature = {
  canvas: null,
  ctx: null,
  isDrawing: false,
  lastX: 0,
  lastY: 0,
  currentImageDataUrl: null,  // 確定済み署名
  activeTab: 'draw',

  init() {
    this.canvas = document.getElementById('signature-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.bindEvents();
    this.bindModalEvents();
  },

  bindEvents() {
    const canvas = this.canvas;
    canvas.addEventListener('mousedown', (e) => this.start(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.end());
    canvas.addEventListener('mouseleave', () => this.end());
    // タッチ
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.start(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.end(); });
  },

  bindModalEvents() {
    document.querySelectorAll('.sig-tab-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.sig-tab-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const tab = b.dataset.sigTab;
        this.activeTab = tab;
        document.querySelectorAll('.sig-tab-content').forEach(c => c.hidden = true);
        document.getElementById('sig-tab-' + tab).hidden = false;
      });
    });

    document.getElementById('btn-sig-clear')?.addEventListener('click', () => this.clear());
    document.getElementById('btn-sig-apply')?.addEventListener('click', () => this.apply());

    document.querySelectorAll('.sig-font-option').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.sig-font-option').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
    });

    document.getElementById('file-input-signature')?.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      const preview = document.getElementById('sig-preview-area');
      preview.innerHTML = `<img id="sig-upload-preview" src="${url}" alt="signature" />`;
      this._uploadedDataUrl = await this.fileToDataUrl(f);
      e.target.value = '';
    });
  },

  fileToDataUrl(file) {
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(file);
    });
  },

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  },

  start(e) {
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
  },

  draw(e) {
    if (!this.isDrawing) return;
    const pos = this.getPos(e);
    const color = document.getElementById('sig-color').value;
    const stroke = parseInt(document.getElementById('sig-stroke').value, 10);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = stroke;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.lastX = pos.x;
    this.lastY = pos.y;
  },

  end() {
    this.isDrawing = false;
  },

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  openModal() {
    document.getElementById('signature-modal').hidden = false;
    this.clear();
    document.getElementById('sig-text-input').value = '';
    document.getElementById('sig-preview-area').innerHTML = '';
    this._uploadedDataUrl = null;
  },

  /**
   * 署名確定 → スタンプモードへ
   */
  async apply() {
    let dataUrl = null;

    if (this.activeTab === 'draw') {
      // 空かチェック
      const blank = document.createElement('canvas');
      blank.width = this.canvas.width;
      blank.height = this.canvas.height;
      if (this.canvas.toDataURL() === blank.toDataURL()) {
        Utils.toast('署名を描いてください', 'warn');
        return;
      }
      dataUrl = this.canvas.toDataURL('image/png');
    } else if (this.activeTab === 'type') {
      const text = document.getElementById('sig-text-input').value.trim();
      if (!text) {
        Utils.toast('名前を入力してください', 'warn');
        return;
      }
      const fontEl = document.querySelector('.sig-font-option.active');
      const font = fontEl ? fontEl.dataset.font : 'cursive';
      dataUrl = this.textToDataUrl(text, font);
    } else if (this.activeTab === 'upload') {
      if (!this._uploadedDataUrl) {
        Utils.toast('画像をアップロードしてください', 'warn');
        return;
      }
      dataUrl = this._uploadedDataUrl;
    }

    if (!dataUrl) return;

    this.currentImageDataUrl = dataUrl;
    document.getElementById('signature-modal').hidden = true;

    // 署名スタンプボタン有効化
    const stampBtn = document.querySelector('[data-tool="stamp-sig"]');
    if (stampBtn) stampBtn.disabled = false;

    Utils.toast('署名を確定しました。スタンプツールで配置できます', 'success', 4000);
    // 自動でスタンプを現在ページに配置
    this.placeOnCurrentPage();
  },

  textToDataUrl(text, font) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `48px ${font}`;
    const w = ctx.measureText(text).width;
    canvas.width = Math.ceil(w) + 40;
    canvas.height = 80;
    const ctx2 = canvas.getContext('2d');
    ctx2.font = `48px ${font}`;
    ctx2.fillStyle = '#0a0a0a';
    ctx2.textBaseline = 'middle';
    ctx2.fillText(text, 20, canvas.height / 2);
    return canvas.toDataURL('image/png');
  },

  async placeOnCurrentPage() {
    if (!this.currentImageDataUrl) return;
    fabric.Image.fromURL(this.currentImageDataUrl, (img) => {
      const canvasW = Annotations.fabricCanvas.getWidth();
      const canvasH = Annotations.fabricCanvas.getHeight();
      // 適切なサイズに
      const maxW = canvasW * 0.3;
      if (img.width > maxW) {
        img.scaleToWidth(maxW);
      }
      img.set({
        left: canvasW - img.getScaledWidth() - 50,
        top: canvasH - img.getScaledHeight() - 50,
        annotType: 'signature',
      });
      Annotations.fabricCanvas.add(img);
      Annotations.fabricCanvas.setActiveObject(img);
      Annotations.fabricCanvas.renderAll();
      History.record();
    });
  }
};
