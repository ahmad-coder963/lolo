import { clamp, rand } from "../utils/math.js";

export class BrushEngine {
  constructor({ faceModel, layerManager, renderer, historyManager, onHistory }) {
    this.faceModel = faceModel;
    this.layerManager = layerManager;
    this.renderer = renderer;
    this.historyManager = historyManager;
    this.onHistory = onHistory;

    this.size = 36;
    this.opacity = 0.65;
    this.flow = 0.5;
    this.softness = 0.7;
    this.color = "#c35a73";
    this.toolType = "brush";
    this.eraser = false;

    this.isDrawing = false;
    this.lastPoint = null;
    this.strokeBefore = null;
  }

  setBrushSettings(settings) {
    Object.assign(this, settings);
  }

  setColor(color) {
    this.color = color;
  }

  setTool(toolType) {
    this.toolType = toolType;
  }

  setEraser(active) {
    this.eraser = active;
  }

  attach(canvas) {
    canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    window.addEventListener("pointerup", () => this.onPointerUp());
  }

  onPointerDown(event) {
    const layer = this.layerManager.activeLayer;
    if (!layer) return;

    const point = this.renderer.screenToCanvas(event.clientX, event.clientY);
    if (!point) return;

    this.isDrawing = true;
    this.lastPoint = point;
    this.strokeBefore = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);

    if (this.toolType === "sticker" || this.toolType === "gem" || this.toolType === "lens") {
      this.stampSpecial(layer, point);
      this.commitStroke(layer, "ختم");
      this.isDrawing = false;
      return;
    }

    this.drawStroke(layer, point, point);
  }

  onPointerMove(event) {
    if (!this.isDrawing) {
      const point = this.renderer.screenToCanvas(event.clientX, event.clientY);
      this.renderer.renderCursor(point, this.size);
      return;
    }

    const layer = this.layerManager.activeLayer;
    if (!layer) return;

    const point = this.renderer.screenToCanvas(event.clientX, event.clientY);
    if (!point) return;

    this.drawStroke(layer, this.lastPoint, point);
    this.lastPoint = point;
  }

  onPointerUp() {
    if (!this.isDrawing) return;
    const layer = this.layerManager.activeLayer;
    if (!layer) return;

    this.commitStroke(layer, "سحبة فرشاة");
    this.isDrawing = false;
    this.lastPoint = null;
  }

  commitStroke(layer, label) {
    const after = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    this.historyManager.push({
      layerId: layer.id,
      before: this.strokeBefore,
      after,
      label,
      timestamp: new Date().toLocaleTimeString()
    });
    if (this.onHistory) {
      this.onHistory(this.historyManager.log);
    }
    this.renderer.requestRender();
  }

  drawStroke(layer, from, to) {
    const ctx = layer.ctx;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const step = Math.max(4, this.size * 0.35);
    const steps = Math.max(1, Math.floor(distance / step));

    for (let i = 0; i <= steps; i += 1) {
      const t = steps === 0 ? 0 : i / steps;
      const x = from.x + dx * t;
      const y = from.y + dy * t;
      if (this.toolType === "glitter") {
        this.drawGlitter(ctx, layer.maskPath, x, y);
      } else if (this.toolType === "mascara") {
        this.drawMascara(ctx, layer.maskPath, x, y);
      } else if (this.toolType === "liner") {
        this.drawLiner(ctx, layer.maskPath, x, y);
      } else if (this.toolType === "gloss") {
        this.drawGloss(ctx, layer.maskPath, x, y);
      } else {
        this.drawBrush(ctx, layer.maskPath, x, y);
      }
    }
    this.renderer.requestRender();
  }

  drawBrush(ctx, maskPath, x, y) {
    ctx.save();
    ctx.clip(maskPath);
    ctx.globalCompositeOperation = this.eraser ? "destination-out" : "source-over";
    const radius = this.size / 2;
    const inner = radius * clamp(1 - this.softness, 0.1, 0.9);
    const gradient = ctx.createRadialGradient(x, y, inner * 0.1, x, y, radius);
    const color = this.hexToRgba(this.color, this.opacity * this.flow);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, this.hexToRgba(this.color, this.opacity * this.flow * 0.6));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawLiner(ctx, maskPath, x, y) {
    const original = this.size;
    this.size = Math.max(6, this.size * 0.4);
    this.drawBrush(ctx, maskPath, x, y);
    this.size = original;
  }

  drawGloss(ctx, maskPath, x, y) {
    ctx.save();
    ctx.clip(maskPath);
    ctx.globalCompositeOperation = "screen";
    const radius = this.size / 2.5;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.hexToRgba(this.color, this.opacity * 0.6));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMascara(ctx, maskPath, x, y) {
    ctx.save();
    ctx.clip(maskPath);
    ctx.strokeStyle = this.hexToRgba(this.color, this.opacity);
    ctx.lineWidth = Math.max(1, this.size * 0.08);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + rand(-6, 6), y - rand(6, 14));
    ctx.stroke();
    ctx.restore();
  }

  drawGlitter(ctx, maskPath, x, y) {
    ctx.save();
    ctx.clip(maskPath);
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 5; i += 1) {
      const size = rand(1, 4);
      ctx.fillStyle = this.hexToRgba(this.color, this.opacity * rand(0.4, 0.9));
      ctx.beginPath();
      ctx.arc(x + rand(-12, 12), y + rand(-12, 12), size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  stampSpecial(layer, point) {
    if (this.toolType === "lens") {
      layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
      layer.ctx.save();
      layer.ctx.globalCompositeOperation = "source-over";
      layer.ctx.globalAlpha = 1;
      this.faceModel.fillIrises(layer.ctx, this.hexToRgba(this.color, this.opacity));
      layer.ctx.restore();
      this.renderer.requestRender();
      return;
    }

    const ctx = layer.ctx;
    ctx.save();
    ctx.clip(layer.maskPath);
    ctx.globalCompositeOperation = "screen";
    if (this.toolType === "sticker") {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y - 16);
      ctx.lineTo(point.x + 10, point.y + 14);
      ctx.lineTo(point.x - 14, point.y - 2);
      ctx.lineTo(point.x + 14, point.y - 2);
      ctx.lineTo(point.x - 10, point.y + 14);
      ctx.closePath();
      ctx.fill();
    } else if (this.toolType === "gem") {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(point.x, point.y, 10, 14, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.stroke();
    }
    ctx.restore();
    this.renderer.requestRender();
  }

  hexToRgba(hex, alpha) {
    const value = hex.replace("#", "");
    const r = parseInt(value.substring(0, 2), 16);
    const g = parseInt(value.substring(2, 4), 16);
    const b = parseInt(value.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
