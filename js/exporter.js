/* ============================================
   exporter.js - 編集済みPDFのエクスポート
   ============================================ */

const Exporter = {
  /**
   * 現在の元PDFを純粋にバイト化 (注釈なし)
   */
  async serializeCurrentDoc() {
    return await PdfRenderer.pdfDoc.getData();
  },

  /**
   * 編集済みPDFをエクスポート
   * - ページ順序を pageOrder に従って並べ替え
   * - 削除ページを除外
   * - 回転を適用
   * - 注釈(fabric)を画像として焼き込み
   * - 付箋コメントをPDF注釈として追加
   */
  async exportPdf() {
    if (!PdfRenderer.pdfDoc) return;
    Utils.setStatus('PDFを書き出し中...');
    Utils.toast('PDFを生成中... しばらくお待ちください', 'info', 2000);

    try {
      const srcBytes = await this.serializeCurrentDoc();
      const srcDoc = await PDFLib.PDFDocument.load(srcBytes);

      const newDoc = await PDFLib.PDFDocument.create();
      // 標準フォント (日本語付箋テキスト用には fontkit + カスタムフォント注入が必要だが、
      //  ASCII/簡易UTF-8ベース＋コメントはPDF Annot ストリングへ格納)
      const helv = await newDoc.embedFont(PDFLib.StandardFonts.Helvetica);

      // ページコピー: pageOrder順 (realIdxは1-based, copyPagesは0-based)
      const indicesToCopy = PageManager.pageOrder.map(r => r - 1);
      const copied = await newDoc.copyPages(srcDoc, indicesToCopy);

      for (let i = 0; i < copied.length; i++) {
        const realIdx = PageManager.pageOrder[i]; // 1-based
        const newPage = newDoc.addPage(copied[i]);

        // 回転を反映
        const userRot = PdfRenderer.pageRotations[realIdx] || 0;
        if (userRot) {
          const existing = newPage.getRotation().angle || 0;
          newPage.setRotation(PDFLib.degrees(existing + userRot));
        }

        // 注釈レイヤーを画像として埋め込み
        await this.embedAnnotationLayer(newDoc, newPage, realIdx);

        // 付箋コメントをPDF注釈として追加
        this.embedComments(newDoc, newPage, realIdx, helv);
      }

      const outBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const filename = this.suggestFilename();
      Utils.downloadBlob(blob, filename);
      Utils.toast('ダウンロードを開始しました', 'success');
    } catch (e) {
      console.error(e);
      Utils.toast('エクスポートに失敗しました: ' + e.message, 'error', 5000);
    } finally {
      Utils.setStatus('準備完了');
    }
  },

  /**
   * fabricキャンバスの内容をページに焼き込む
   * すべてのページを順に表示してfabric→PNG→PDF埋め込み
   */
  async embedAnnotationLayer(newDoc, newPage, realPageIndex) {
    const saved = Annotations.perPage[realPageIndex];
    if (!saved || !saved.json.objects || saved.json.objects.length === 0) return;

    // 一時fabricキャンバスを生成してJSONを描画
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

    // 透過PNGとして取得
    const dataUrl = tempFabric.toDataURL({ format: 'png', multiplier: 1 });
    tempFabric.dispose();

    // PDFに埋め込み
    const pngBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
    const pngImage = await newDoc.embedPng(pngBytes);

    // ページサイズ取得 (回転前のmediabox)
    const { width: pw, height: ph } = newPage.getSize();
    const rot = newPage.getRotation().angle % 360;

    // 注釈は表示時の座標(canvasW × canvasH)で記録 → ページサイズへスケール
    // 回転を考慮: 回転後の表示寸法に合わせていたので、ページ実寸へマッピング
    // 注釈レイヤーは "回転後の見た目" でキャプチャされている → PDFのページに描画する際は
    // 回転を「リセット」して、回転後の寸法基準でフルカバー画像として配置する。
    // 簡易方式: 回転を一旦0にしてmediaboxを回転後寸法に合わせ、画像を全面描画、最後に回転を再適用。
    //
    // 実装簡易化: 回転を保持しつつ、ページ寸法を画像と一致させた上で(0,0)に全面描画する。
    let drawW = pw, drawH = ph;
    if (rot === 90 || rot === 270) {
      drawW = ph;
      drawH = pw;
    }

    // 全面に貼り付け（回転を一時的に解除して描画 → 再適用）
    const originalRot = newPage.getRotation().angle;
    newPage.setRotation(PDFLib.degrees(0));
    // mediaboxを画像表示用に
    newPage.setSize(drawW, drawH);
    newPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: drawW,
      height: drawH,
    });
    newPage.setRotation(PDFLib.degrees(originalRot));
  },

  /**
   * 付箋コメントをPDFテキスト注釈として追加
   * (PDFのText Annotation)
   */
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
      const y = pageH - (c.y * pageH); // PDFは下原点

      // 簡易: 黄色い小さな矩形 + 番号テキスト + PDF Text Annotation
      newPage.drawRectangle({
        x: x - 8,
        y: y - 8,
        width: 16,
        height: 16,
        color: PDFLib.rgb(1, 0.85, 0.2),
        borderColor: PDFLib.rgb(0.8, 0.6, 0),
        borderWidth: 1,
      });
      newPage.drawText(String(idx + 1), {
        x: x - 3,
        y: y - 4,
        size: 10,
        font,
        color: PDFLib.rgb(0.1, 0.1, 0.1),
      });

      // テキスト注釈 (PDF spec: Text Annotation)
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

  /**
   * ファイル名サジェスト
   */
  suggestFilename() {
    const base = window._originalFilename
      ? window._originalFilename.replace(/\.pdf$/i, '')
      : 'edited';
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    return `${base}_edited_${stamp}.pdf`;
  }
};
