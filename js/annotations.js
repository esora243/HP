/* ============================================
   annotations.js - 注釈レイヤー (Fabric.js)
   ============================================ */

const Annotations = {
  fabricCanvas: null,
  currentTool: 'select',
  color: '#ff3b30',
  strokeWidth: 3,
  perPage: {},   // {realPageIndex: serializedFabricJSON}
  isDrawingShape: false,
  startX: 0,
  startY: 0,
  tempShape: null,

  init() {
    this.fabricCanvas = new fabric.Canvas('annotation-canvas', {
      selection: true,
      preserveObjectStacking: true,
    });
    // 透過背景
    this.fabricCanvas.backgroundColor = null;

    this.fabricCanvas.on('mouse:down', (opt) => this.onMouseDown(opt));
    this.fabricCanvas.on('mouse:move', (opt) => this.onMouseMove(opt));
    this.fabricCanvas.on('mouse:up', (opt) => this.onMouseUp(opt));
    this.fabricCanvas.on('object:modified', () => this.persist());
    this.fabricCanvas.on('object:added', () => this.persist());
    this.fabricCanvas.on('object:removed', () => this.persist());
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

    // フリーハンド
    if (tool === 'draw') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = this.color;
      canvas.freeDrawingBrush.width = this.strokeWidth;
    } else {
      canvas.isDrawingMode = false;
    }

    // 選択モードON/OFF
    canvas.selection = (tool === 'select');
    canvas.forEachObject(o => {
      o.selectable = (tool === 'select');
      o.evented = (tool === 'select');
    });

    // カーソル
    const cursorMap = {
      select: 'default',
      text: 'text',
      highlight: 'crosshair',
      rect: 'crosshair',
      circle: 'crosshair',
      arrow: 'crosshair',
      draw: 'crosshair',
      note: 'crosshair',
    };
    canvas.defaultCursor = cursorMap[tool] || 'default';
    document.getElementById('annotation-canvas').style.pointerEvents =
      (tool === 'select') ? 'auto' : 'auto';

    // ツールバーUI
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
  },

  setColor(hex) {
    this.color = hex;
    if (this.fabricCanvas?.isDrawingMode) {
      this.fabricCanvas.freeDrawingBrush.color = hex;
    }
    // 選択中オブジェクトに反映
    const active = this.fabricCanvas?.getActiveObject();
    if (active) {
      if (active.type === 'i-text' || active.type === 'text') {
        active.set('fill', hex);
      } else {
        active.set('stroke', hex);
        if (active.type === 'rect' && active.fill !== 'transparent' && active.opacity < 1) {
          active.set('fill', hex);
        }
      }
      this.fabricCanvas.renderAll();
      this.persist();
    }
  },

  setStrokeWidth(w) {
    this.strokeWidth = w;
    if (this.fabricCanvas?.isDrawingMode) {
      this.fabricCanvas.freeDrawingBrush.width = w;
    }
    const active = this.fabricCanvas?.getActiveObject();
    if (active && active.set) {
      active.set('strokeWidth', w);
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

    this.isDrawingShape = true;

    if (tool === 'highlight') {
      this.tempShape = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: this.color,
        opacity: 0.35,
        stroke: null,
        selectable: false,
      });
    } else if (tool === 'rect') {
      this.tempShape = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: 'transparent',
        stroke: this.color,
        strokeWidth: this.strokeWidth,
        selectable: false,
      });
    } else if (tool === 'circle') {
      this.tempShape = new fabric.Ellipse({
        left: pointer.x,
        top: pointer.y,
        rx: 0,
        ry: 0,
        fill: 'transparent',
        stroke: this.color,
        strokeWidth: this.strokeWidth,
        selectable: false,
      });
    } else if (tool === 'arrow') {
      this.tempShape = new fabric.Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        {
          stroke: this.color,
          strokeWidth: this.strokeWidth,
          selectable: false,
        }
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
        width: Math.abs(w),
        height: Math.abs(h),
        left: w < 0 ? pointer.x : this.startX,
        top: h < 0 ? pointer.y : this.startY,
      });
    } else if (tool === 'circle') {
      const w = Math.abs(pointer.x - this.startX);
      const h = Math.abs(pointer.y - this.startY);
      this.tempShape.set({
        rx: w / 2,
        ry: h / 2,
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
      // 矢印は2要素(線+三角)に変換
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
      left: x2,
      top: y2,
      originX: 'center',
      originY: 'center',
      width: headSize,
      height: headSize,
      fill: this.color,
      angle: (angle * 180 / Math.PI) + 90,
      selectable: false,
    });

    const group = new fabric.Group([
      new fabric.Line([x1, y1, x2, y2], {
        stroke: this.color,
        strokeWidth: this.strokeWidth,
      }),
      triangle
    ], {
      selectable: true,
      evented: true,
      annotType: 'arrow',
    });

    this.fabricCanvas.remove(line);
    this.fabricCanvas.add(group);
  },

  deleteSelected() {
    const active = this.fabricCanvas?.getActiveObjects();
    if (active && active.length) {
      active.forEach(o => this.fabricCanvas.remove(o));
      this.fabricCanvas.discardActiveObject();
      this.fabricCanvas.renderAll();
    }
  },

  /**
   * 現在ページの注釈を保存
   */
  persist() {
    if (!PdfRenderer.pdfDoc) return;
    const realIdx = PdfRenderer.getCurrentRealPageIndex();
    if (!realIdx) return;
    const json = this.fabricCanvas.toJSON();
    // 注釈が無ければエントリ削除
    if (!json.objects || json.objects.length === 0) {
      delete this.perPage[realIdx];
    } else {
      this.perPage[realIdx] = {
        json,
        canvasW: this.fabricCanvas.getWidth(),
        canvasH: this.fabricCanvas.getHeight(),
      };
    }
  },

  /**
   * 指定ページの注釈をロード
   */
  loadForPage(realPageIndex) {
    if (!this.fabricCanvas) this.init();
    this.fabricCanvas.clear();
    const saved = this.perPage[realPageIndex];
    if (!saved) {
      this.fabricCanvas.renderAll();
      return;
    }
    const targetW = this.fabricCanvas.getWidth();
    const targetH = this.fabricCanvas.getHeight();
    this.fabricCanvas.loadFromJSON(saved.json, () => {
      // ズーム等で表示サイズが変わった場合のスケール補正
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
      // 保存サイズを更新
      saved.canvasW = targetW;
      saved.canvasH = targetH;
    });
  },

  clearForPage(realPageIndex) {
    delete this.perPage[realPageIndex];
  },

  /**
   * 全注釈データ取得 (エクスポート用)
   * 各注釈の絶対座標を canvas基準サイズで返す
   */
  getAllAnnotations() {
    return this.perPage;
  }
};
