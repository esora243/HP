/* ============================================
   utils.js - ユーティリティ関数
   ============================================ */

const Utils = {
  /**
   * トースト通知を表示
   */
  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  /**
   * ステータスバー更新
   */
  setStatus(message) {
    document.getElementById('status-message').textContent = message;
  },

  /**
   * ユニークID生成
   */
  uid() {
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
  },

  /**
   * ファイルをArrayBufferとして読み込む
   */
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Blobをダウンロード
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  },

  /**
   * 現在時刻フォーマット
   */
  formatNow() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },

  /**
   * HEX → RGB
   */
  hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? {
      r: parseInt(m[1], 16) / 255,
      g: parseInt(m[2], 16) / 255,
      b: parseInt(m[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  },

  /**
   * デバウンス
   */
  debounce(fn, ms = 200) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  },

  /**
   * 確認ダイアログ
   */
  confirm(message) {
    return window.confirm(message);
  }
};

// pdf.js workerSrc 設定
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
