/* ============================================
   forms.js - PDFフォームフィールド入力
   ============================================ */

const Forms = {
  fields: [],          // [{name, type, page, rect, value, options?}]
  values: {},          // {fieldName: value}
  active: false,
  pdfLibDoc: null,

  /**
   * 現在のPDFからフォームフィールドを抽出
   */
  async detect() {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('フォームを検出中...');
    try {
      const bytes = await PdfRenderer.pdfDoc.getData();
      this.pdfLibDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = this.pdfLibDoc.getForm();
      const flds = form.getFields();

      this.fields = [];

      for (const f of flds) {
        const name = f.getName();
        const type = f.constructor.name;  // PDFTextField, PDFCheckBox, etc.
        const widgets = f.acroField.getWidgets();

        widgets.forEach((widget, wi) => {
          const rect = widget.getRectangle();
          const pageRef = widget.P();
          let pageIndex = 0;
          if (pageRef) {
            // ページ番号を特定
            const pages = this.pdfLibDoc.getPages();
            pageIndex = pages.findIndex(p => p.ref === pageRef);
          }
          let value = '';
          let options;
          try {
            if (type === 'PDFTextField') value = f.getText() || '';
            else if (type === 'PDFCheckBox') value = f.isChecked();
            else if (type === 'PDFDropdown' || type === 'PDFOptionList') {
              value = f.getSelected();
              options = f.getOptions();
            } else if (type === 'PDFRadioGroup') {
              value = f.getSelected();
              options = f.getOptions();
            }
          } catch (e) { /* ignore */ }

          // 保存済み値があれば優先
          if (this.values[name] !== undefined) value = this.values[name];

          this.fields.push({
            name: `${name}__${wi}`,
            origName: name,
            type,
            pageIndex: pageIndex + 1, // 1-based real page index
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            value,
            options,
          });
        });
      }

      this.renderListPanel();
      this.renderOverlay();
      Utils.setStatus('準備完了');

      if (this.fields.length === 0) {
        Utils.toast('このPDFにはフォームフィールドがありません', 'info');
      } else {
        Utils.toast(`${this.fields.length}個のフォームフィールドを検出`, 'success');
        // 右パネルをフォームタブへ
        switchTab('forms');
      }
    } catch (e) {
      console.error(e);
      Utils.toast('フォーム検出に失敗: ' + e.message, 'error');
      Utils.setStatus('準備完了');
    }
  },

  /**
   * 右パネルにフィールド一覧を表示
   */
  renderListPanel() {
    const panel = document.getElementById('forms-panel');
    if (!panel) return;
    if (this.fields.length === 0) {
      panel.innerHTML = `
        <div class="empty-state">
          <p>📋</p>
          <p>フォームフィールドなし</p>
          <small>ヘッダー「フォーム」で再検出</small>
        </div>`;
      return;
    }

    // 表示用のページ番号マップ
    const realToDisplay = {};
    PageManager.pageOrder.forEach((realIdx, i) => {
      realToDisplay[realIdx] = i + 1;
    });

    panel.innerHTML = this.fields.map((fld, i) => {
      const dispPage = realToDisplay[fld.pageIndex] || '?';
      let inputHtml = '';
      if (fld.type === 'PDFTextField') {
        inputHtml = `<input type="text" data-fld="${i}" value="${escapeAttr(fld.value)}" placeholder="入力..." />`;
      } else if (fld.type === 'PDFCheckBox') {
        inputHtml = `<label><input type="checkbox" data-fld="${i}" ${fld.value ? 'checked' : ''} /> チェック</label>`;
      } else if (fld.type === 'PDFDropdown' || fld.type === 'PDFOptionList' || fld.type === 'PDFRadioGroup') {
        const opts = (fld.options || []).map(o => {
          const sel = (Array.isArray(fld.value) ? fld.value.includes(o) : fld.value === o);
          return `<option ${sel ? 'selected' : ''}>${escapeHtml(o)}</option>`;
        }).join('');
        inputHtml = `<select data-fld="${i}"><option value="">-- 選択 --</option>${opts}</select>`;
      } else {
        inputHtml = `<small>未対応のフィールド型: ${fld.type}</small>`;
      }
      return `
        <div class="form-field-item">
          <div class="field-name">
            ${escapeHtml(fld.origName)}
            <span class="field-type">${fld.type.replace('PDF','')}</span>
            <span class="field-type">P.${dispPage}</span>
          </div>
          ${inputHtml}
        </div>
      `;
    }).join('');

    panel.querySelectorAll('[data-fld]').forEach(el => {
      el.addEventListener('change', (e) => this.onChange(e));
      el.addEventListener('input', (e) => this.onChange(e));
    });
  },

  /**
   * オーバーレイ描画 (ビューア上にフィールド入力欄を表示)
   */
  renderOverlay() {
    const overlay = document.getElementById('form-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';
    if (!this.active || this.fields.length === 0) {
      overlay.classList.remove('active');
      return;
    }
    overlay.classList.add('active');

    const realPage = PdfRenderer.getCurrentRealPageIndex();
    if (!realPage) return;

    const canvas = document.getElementById('pdf-canvas');
    overlay.style.width = canvas.width + 'px';
    overlay.style.height = canvas.height + 'px';

    // ページの実寸 (rotate 考慮)
    const page = this.pdfLibDoc?.getPage(realPage - 1);
    if (!page) return;
    const { width: pw, height: ph } = page.getSize();
    const scaleX = canvas.width / pw;
    const scaleY = canvas.height / ph;

    this.fields.filter(f => f.pageIndex === realPage).forEach((fld, i) => {
      const idxInAll = this.fields.indexOf(fld);
      const x = fld.rect.x * scaleX;
      const y = canvas.height - (fld.rect.y + fld.rect.height) * scaleY;
      const w = fld.rect.width * scaleX;
      const h = fld.rect.height * scaleY;

      let el;
      if (fld.type === 'PDFTextField') {
        el = document.createElement('input');
        el.type = 'text';
        el.value = fld.value || '';
        el.className = 'form-field-input';
      } else if (fld.type === 'PDFCheckBox') {
        el = document.createElement('input');
        el.type = 'checkbox';
        el.className = 'form-field-checkbox';
        el.checked = !!fld.value;
      } else {
        el = document.createElement('input');
        el.type = 'text';
        el.value = Array.isArray(fld.value) ? fld.value.join(',') : (fld.value || '');
        el.className = 'form-field-input';
      }

      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.dataset.fld = idxInAll;
      el.addEventListener('change', (e) => this.onChange(e));
      el.addEventListener('input', (e) => this.onChange(e));
      overlay.appendChild(el);
    });
  },

  onChange(e) {
    const idx = parseInt(e.target.dataset.fld, 10);
    const fld = this.fields[idx];
    if (!fld) return;
    let val;
    if (e.target.type === 'checkbox') val = e.target.checked;
    else val = e.target.value;
    fld.value = val;
    this.values[fld.origName] = val;
    History.record();
    Storage.scheduleSave();
    // 反対側UIも更新
    document.querySelectorAll(`[data-fld="${idx}"]`).forEach(el => {
      if (el === e.target) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = val || '';
    });
  },

  /**
   * フォームモード切り替え
   */
  toggle() {
    this.active = !this.active;
    document.getElementById('btn-forms')?.classList.toggle('active', this.active);
    this.renderOverlay();
    if (this.active) Utils.toast('フォーム入力モードON', 'info', 1500);
  },

  /**
   * エクスポート時にフォーム値を反映
   */
  async applyToDoc(pdfDoc) {
    if (Object.keys(this.values).length === 0) return;
    try {
      const form = pdfDoc.getForm();
      Object.entries(this.values).forEach(([name, value]) => {
        try {
          const field = form.getField(name);
          if (!field) return;
          const typeName = field.constructor.name;
          if (typeName === 'PDFTextField') {
            field.setText(String(value || ''));
          } else if (typeName === 'PDFCheckBox') {
            if (value) field.check(); else field.uncheck();
          } else if (typeName === 'PDFDropdown') {
            if (value) field.select(value);
          } else if (typeName === 'PDFRadioGroup') {
            if (value) field.select(value);
          } else if (typeName === 'PDFOptionList') {
            if (value) field.select(Array.isArray(value) ? value : [value]);
          }
        } catch (e) {
          console.warn('Failed to set field', name, e);
        }
      });
    } catch (e) {
      console.warn('Form apply failed:', e);
    }
  },

  reset() {
    this.fields = [];
    this.values = {};
    this.active = false;
    this.pdfLibDoc = null;
    this.renderListPanel();
    this.renderOverlay();
  }
};

function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
