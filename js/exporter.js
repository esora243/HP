/* ============================================
   exporter.js - PDF書き出し
   ============================================ */

const Exporter = {
  async serializeCurrentDoc() {
    return await PdfRenderer.pdfDoc.getData();
  },

  /**
   * PDFエクスポート
   * @param {Object} opts
   * @param {number[]} opts.pageDisplayIndices  - 指定があればそのページのみ
   * @param {boolean} opts.suffix  - ファイル名サフィックス
   */
  async exportPdf(opts = {}) {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('PDFを書き出し中...');
    Utils.toast('PDFを生成中...', 'info', 2000);

    try {
      const srcBytes = await this.serializeCurrentDoc();
      const srcDoc = await PDFLib.PDFDocument.load(srcBytes, { ignoreEncryption: true });

      // フォーム値を反映 (元ドキュメントに直接)
      if (typeof Forms !== 'undefined' && Forms.values && Object.keys(Forms.values).length > 0) {
        await Forms.applyToDoc(srcDoc);
      }

      const newDoc = await PDFLib.PDFDocument.create();
      const helv = await newDoc.embedFont(PDFLib.StandardFonts.Helvetica);

      // 対象表示インデックス
      const targetDisplayIndices = opts.pageDisplayIndices
        ? opts.pageDisplayIndices
        : PageManager.pageOrder.map((_, i) => i);

      const indicesToCopy = targetDisplayIndices.map(di => PageManager.pageOrder[di] - 1);
      const copied = await newDoc.copyPages(srcDoc, indicesToCopy);

      for (let i = 0; i < copied.length; i++) {
        const di = targetDisplayIndices[i];
        const realIdx = PageManager.pageOrder[di];
        const newPage = newDoc.addPage(copied[i]);

        const userRot = PdfRenderer.pageRotations[realIdx] || 0;
        if (userRot) {
          const existing = newPage.getRotation().angle || 0;
          newPage.setRotation(PDFLib.degrees(existing + userRot));
        }

        await this.embedAnnotationLayer(newDoc, newPage, realIdx);
        this.embedComments(newDoc, newPage, realIdx, helv);
      }

      const outBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const suffix = opts.pageDisplayIndices ? '_extracted' : '_edited';
      const filename = this.suggestFilename(suffix);
      Utils.downloadBlob(blob, filename);
      Utils.toast(`ダウンロード開始: ${filename}`, 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('エクスポート失敗: ' + e.message, 'error', 5000);
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  async embedAnnotationLayer(newDoc, newPage, realPageIndex) {
    const saved = Annotations.perPage[realPageIndex];
    if (!saved || !saved.json.objects || saved.json.objects.length === 0) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = saved.canvasW;
    tempCanvas.height = saved.canvasH;
    const tempFabric = new fabric.Canvas(tempCanvas, {
      width: saved.canvasW,
      height: saved.canvasH,
      backgroundColor: null,
    });

    await new Promise((resolve) => {
      tempFabric.loadFromJSON(saved.json, () => {
        tempFabric.renderAll();
        resolve();
      });
    });

    const dataUrl = tempFabric.toDataURL({ format: 'png', multiplier: 1 });
    tempFabric.dispose();

    const pngBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
    const pngImage = await newDoc.embedPng(pngBytes);

    const { width: pw, height: ph } = newPage.getSize();
    const rot = newPage.getRotation().angle % 360;

    let drawW = pw, drawH = ph;
    if (rot === 90 || rot === 270) {
      drawW = ph;
      drawH = pw;
    }

    const originalRot = newPage.getRotation().angle;
    newPage.setRotation(PDFLib.degrees(0));
    newPage.setSize(drawW, drawH);
    newPage.drawImage(pngImage, { x: 0, y: 0, width: drawW, height: drawH });
    newPage.setRotation(PDFLib.degrees(originalRot));
  },

  embedComments(newDoc, newPage, realPageIndex, font) {
    const items = Object.values(Comments.items).filter(c => c.pageIndex === realPageIndex);
    if (items.length === 0) return;

    const { width: pw, height: ph } = newPage.getSize();
    const rot = newPage.getRotation().angle % 360;
    let pageW = pw, pageH = ph;
    if (rot === 90 || rot === 270) {
      pageW = ph;
      pageH = pw;
    }

    items.forEach((c, idx) => {
      const x = c.x * pageW;
      const y = pageH - (c.y * pageH);

      newPage.drawRectangle({
        x: x - 8, y: y - 8, width: 16, height: 16,
        color: PDFLib.rgb(1, 0.85, 0.2),
        borderColor: PDFLib.rgb(0.8, 0.6, 0),
        borderWidth: 1,
      });
      newPage.drawText(String(idx + 1), {
        x: x - 3, y: y - 4, size: 10, font,
        color: PDFLib.rgb(0.1, 0.1, 0.1),
      });

      try {
        const annotDict = newDoc.context.obj({
          Type: 'Annot',
          Subtype: 'Text',
          Rect: [x - 10, y - 10, x + 10, y + 10],
          Contents: PDFLib.PDFString.of(c.content || ''),
          T: PDFLib.PDFString.of(c.author || 'User'),
          M: PDFLib.PDFString.of(`D:${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`),
          Open: false,
          Name: 'Comment',
          C: [1, 0.85, 0.2],
        });
        const annotRef = newDoc.context.register(annotDict);
        const pageAnnots = newPage.node.lookup(PDFLib.PDFName.of('Annots'));
        if (pageAnnots) {
          pageAnnots.push(annotRef);
        } else {
          newPage.node.set(PDFLib.PDFName.of('Annots'), newDoc.context.obj([annotRef]));
        }
      } catch (e) {
        console.warn('Failed to embed text annotation', e);
      }
    });
  },

  suggestFilename(suffix = '_edited') {
    const base = window._originalFilename
      ? window._originalFilename.replace(/\.pdf$/i, '')
      : 'document';
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    return `${base}${suffix}_${stamp}.pdf`;
  }
};
