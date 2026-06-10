/* ============================================
   annotations.js - 注釈レイヤー (Fabric.js)
   ============================================ */

const Annotations = {
  fabricCanvas: null,
  currentTool: 'select',
  color: '#ff3b30',
  strokeWidth: 3,
  perPage: {},
  isDrawingShape: false,
  startX: 0,
  startY: 0,
  tempShape: null,

  init() {
    this.fabricCanvas = new fabric.Canvas('annotation-canvas', {
      selection: true,
      preserveObjectStacking: true,
    });
    this.fabricCanvas.backgroundColor = null;

    this.fabricCanvas.on('mouse:down', (opt) => this.onMouseDown(opt));
    this.fabricCanvas.on('mouse:move', (opt) => this.onMouseMove(opt));
    this.fabricCanvas.on('mouse:up', (opt) => this.onMouseUp(opt));

    this.fabricCanvas.on('object:modified', () => {
      this.persist();
      History.record();
    });
    this.fabricCanvas.on('object:added', () => {
      if (Annotations._loadingFromJson) return;
      this.persist();
      History.record();
    });
    this.fabricCanvas.on('object:removed', () => {
      if (Annotations._loadingFromJson) return;
      this.persist();
      History.record();
    });
  },

  resizeCanvas(width, height) {
    if (!this.fabricCanvas) this.init();
    this.fabricCanvas.setWidth(width);
    this.fabricCanvas.setHeight(height);
    const el = document.getElementById('annotation-canvas');
    el.style.width = width + 'px';
    el.style.height = height + 'px';
  },

  setTool(tool) {
    this.currentTool = tool;
    const canvas = this.fabricCanvas;
    if (!canvas) return;

    if (tool === 'draw') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = this.color;
      canvas.freeDrawingBrush.width = this.strokeWidth;
    } else {
      canvas.isDrawingMode = false;
    }

    if (tool === 'stamp-sig') {
      // 署名スタンプはクリック1回で配置
      canvas.isDrawingMode = false;
    }

    canvas.selection = (tool === 'select');
    canvas.forEachObject(o => {
      o.selectable = (tool === 'select');
      o.evented = (tool === 'select');
    });

    const cursorMap = {
      select: 'default',
      text: 'text',
    };
    canvas.defaultCursor = cursorMap[tool] || 'crosshair';

    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
  },

  setColor(hex) {
    this.color = hex;
    if (this.fabricCanvas?.isDrawingMode) {
      this.fabricCanvas.freeDrawingBrush.color = hex;
    }
    const active = this.fabricCanvas?.getActiveObjects();
    if (active && active.length) {
      active.forEach(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          obj.set('fill', hex);
        } else {
          obj.set('stroke', hex);
        }
      });
      this.fabricCanvas.renderAll();
      this.persist();
    }
  },

  setStrokeWidth(w) {
    this.strokeWidth = w;
    if (this.fabricCanvas?.isDrawingMode) {
      this.fabricCanvas.freeDrawingBrush.width = w;
    }
    const active = this.fabricCanvas?.getActiveObjects();
    if (active && active.length) {
      active.forEach(obj => {
        if (obj.set) obj.set('strokeWidth', w);
      });
      this.fabricCanvas.renderAll();
      this.persist();
    }
  },

  onMouseDown(opt) {
    const tool = this.currentTool;
    if (['select', 'draw'].includes(tool)) return;
    const pointer = this.fabricCanvas.getPointer(opt.e);
    this.startX = pointer.x;
    this.startY = pointer.y;

    if (tool === 'text') {
      const itext = new fabric.IText('テキスト', {
        left: pointer.x,
        top: pointer.y,
        fill: this.color,
        fontSize: 18 + this.strokeWidth,
        fontFamily: 'Hiragino Sans, Meiryo, sans-serif',
      });
      this.fabricCanvas.add(itext);
      this.fabricCanvas.setActiveObject(itext);
      itext.enterEditing();
      itext.selectAll();
      this.setTool('select');
      return;
    }

    if (tool === 'note') {
      Comments.addCommentAt(pointer.x, pointer.y);
      this.setTool('select');
      return;
    }

    if (tool === 'stamp-sig' && Signature.currentImageDataUrl) {
      const url = Signature.currentImageDataUrl;
      fabric.Image.fromURL(url, (img) => {
        const canvasW = this.fabricCanvas.getWidth();
        const maxW = canvasW * 0.25;
        if (img.width > maxW) img.scaleToWidth(maxW);
        img.set({ left: pointer.x, top: pointer.y, annotType: 'signature' });
        this.fabricCanvas.add(img);
        this.fabricCanvas.setActiveObject(img);
        this.fabricCanvas.renderAll();
      });
      this.setTool('select');
      return;
    }

    this.isDrawingShape = true;

    if (tool === 'highlight') {
      this.tempShape = new fabric.Rect({
        left: pointer.x, top: pointer.y, width: 0, height: 0,
        fill: this.color, opacity: 0.35, stroke: null, selectable: false,
      });
    } else if (tool === 'rect') {
      this.tempShape = new fabric.Rect({
        left: pointer.x, top: pointer.y, width: 0, height: 0,
        fill: 'transparent', stroke: this.color, strokeWidth: this.strokeWidth, selectable: false,
      });
    } else if (tool === 'circle') {
      this.tempShape = new fabric.Ellipse({
        left: pointer.x, top: pointer.y, rx: 0, ry: 0,
        fill: 'transparent', stroke: this.color, strokeWidth: this.strokeWidth, selectable: false,
      });
    } else if (tool === 'arrow') {
      this.tempShape = new fabric.Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        { stroke: this.color, strokeWidth: this.strokeWidth, selectable: false }
      );
    }
    if (this.tempShape) this.fabricCanvas.add(this.tempShape);
  },

  onMouseMove(opt) {
    if (!this.isDrawingShape || !this.tempShape) return;
    const pointer = this.fabricCanvas.getPointer(opt.e);
    const tool = this.currentTool;

    if (tool === 'rect' || tool === 'highlight') {
      const w = pointer.x - this.startX;
      const h = pointer.y - this.startY;
      this.tempShape.set({
        width: Math.abs(w), height: Math.abs(h),
        left: w < 0 ? pointer.x : this.startX,
        top: h < 0 ? pointer.y : this.startY,
      });
    } else if (tool === 'circle') {
      const w = Math.abs(pointer.x - this.startX);
      const h = Math.abs(pointer.y - this.startY);
      this.tempShape.set({
        rx: w / 2, ry: h / 2,
        left: Math.min(this.startX, pointer.x),
        top: Math.min(this.startY, pointer.y),
      });
    } else if (tool === 'arrow') {
      this.tempShape.set({ x2: pointer.x, y2: pointer.y });
    }
    this.fabricCanvas.renderAll();
  },

  onMouseUp(opt) {
    if (!this.isDrawingShape) return;
    this.isDrawingShape = false;

    if (this.tempShape) {
      if (this.currentTool === 'arrow') {
        this.convertLineToArrow(this.tempShape);
      } else {
        this.tempShape.set({ selectable: true, evented: true });
      }
      this.tempShape = null;
      this.fabricCanvas.renderAll();
      this.setTool('select');
    }
  },

  convertLineToArrow(line) {
    const x1 = line.x1, y1 = line.y1, x2 = line.x2, y2 = line.y2;
    const dx = x2 - x1, dy = y2 - y1;
    const angle = Math.atan2(dy, dx);
    const headSize = Math.max(10, this.strokeWidth * 3);

    const triangle = new fabric.Triangle({
      left: x2, top: y2,
      originX: 'center', originY: 'center',
      width: headSize, height: headSize,
      fill: this.color,
      angle: (angle * 180 / Math.PI) + 90,
      selectable: false,
    });

    const group = new fabric.Group([
      new fabric.Line([x1, y1, x2, y2], { stroke: this.color, strokeWidth: this.strokeWidth }),
      triangle
    ], { selectable: true, evented: true, annotType: 'arrow' });

    this.fabricCanvas.remove(line);
    this.fabricCanvas.add(group);
  },

  deleteSelected() {
    const active = this.fabricCanvas?.getActiveObjects();
    if (active && active.length) {
      active.forEach(o => this.fabricCanvas.remove(o));
      this.fabricCanvas.discardActiveObject();
      this.fabricCanvas.renderAll();
      Utils.toast(`${active.length}個の注釈を削除`, 'success', 1500);
    }
  },

  selectAll() {
    if (!this.fabricCanvas) return;
    const objs = this.fabricCanvas.getObjects();
    if (objs.length === 0) {
      Utils.toast('注釈がありません', 'info');
      return;
    }
    this.setTool('select');
    const sel = new fabric.ActiveSelection(objs, { canvas: this.fabricCanvas });
    this.fabricCanvas.setActiveObject(sel);
    this.fabricCanvas.renderAll();
    Utils.toast(`${objs.length}個の注釈を選択`, 'info', 1500);
  },

  persist() {
    if (!PdfRenderer.pdfDoc) return;
    const realIdx = PdfRenderer.getCurrentRealPageIndex();
    if (!realIdx) return;
    const json = this.fabricCanvas.toJSON(['annotType']);
    if (!json.objects || json.objects.length === 0) {
      delete this.perPage[realIdx];
    } else {
      this.perPage[realIdx] = {
        json,
        canvasW: this.fabricCanvas.getWidth(),
        canvasH: this.fabricCanvas.getHeight(),
      };
    }
    Storage.scheduleSave();
  },

  _loadingFromJson: false,
  loadForPage(realPageIndex) {
    if (!this.fabricCanvas) this.init();
    this._loadingFromJson = true;
    this.fabricCanvas.clear();
    const saved = this.perPage[realPageIndex];
    if (!saved) {
      this.fabricCanvas.renderAll();
      this._loadingFromJson = false;
      return;
    }
    const targetW = this.fabricCanvas.getWidth();
    const targetH = this.fabricCanvas.getHeight();
    this.fabricCanvas.loadFromJSON(saved.json, () => {
      const sx = targetW / saved.canvasW;
      const sy = targetH / saved.canvasH;
      this.fabricCanvas.forEachObject(o => {
        o.scaleX *= sx;
        o.scaleY *= sy;
        o.left *= sx;
        o.top *= sy;
        o.setCoords();
      });
      this.fabricCanvas.renderAll();
      saved.canvasW = targetW;
      saved.canvasH = targetH;
      this._loadingFromJson = false;
    });
  },

  clearForPage(realPageIndex) {
    delete this.perPage[realPageIndex];
  },

  getAllAnnotations() {
    return this.perPage;
  }
};
