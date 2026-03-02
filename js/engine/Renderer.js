import { BlendModes } from "./BlendModes.js";

export class Renderer {
  constructor({ beforeCanvas, afterCanvas, overlayCanvas, faceModel, layerManager }) {
    this.beforeCanvas = beforeCanvas;
    this.afterCanvas = afterCanvas;
    this.overlayCanvas = overlayCanvas;
    this.faceModel = faceModel;
    this.layerManager = layerManager;

    this.beforeCtx = beforeCanvas.getContext("2d");
    this.afterCtx = afterCanvas.getContext("2d");
    this.overlayCtx = overlayCanvas.getContext("2d");

    this.baseCanvas = document.createElement("canvas");
    this.baseCanvas.width = faceModel.width;
    this.baseCanvas.height = faceModel.height;
    this.baseCtx = this.baseCanvas.getContext("2d");

    this.displayWidth = 0;
    this.displayHeight = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.view = {
      zoom: 1,
      center: { x: faceModel.width / 2, y: faceModel.height / 2 }
    };
    this.targetView = { ...this.view, center: { ...this.view.center } };
    this.animating = false;

    this.dirty = false;
  }

  resize(width, height) {
    this.displayWidth = width;
    this.displayHeight = height;
    [this.beforeCanvas, this.afterCanvas, this.overlayCanvas].forEach((canvas) => {
      canvas.width = width * this.dpr;
      canvas.height = height * this.dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    });
    this.requestRender();
  }

  renderBase() {
    this.faceModel.drawBase(this.baseCtx);
    this.requestRender();
  }

  setView(zoom, center) {
    this.targetView = { zoom, center: { ...center } };
    this.animating = true;
    this.requestRender();
  }

  getTransform() {
    const fitScale = Math.min(
      this.displayWidth / this.faceModel.width,
      this.displayHeight / this.faceModel.height
    );
    const scale = fitScale * this.view.zoom;
    const offsetX = this.displayWidth / 2 - this.view.center.x * scale;
    const offsetY = this.displayHeight / 2 - this.view.center.y * scale;
    return { scale, offsetX, offsetY };
  }

  screenToCanvas(clientX, clientY) {
    const rect = this.afterCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const xDisplay = clientX - rect.left;
    const yDisplay = clientY - rect.top;
    const { scale, offsetX, offsetY } = this.getTransform();
    const x = (xDisplay - offsetX) / scale;
    const y = (yDisplay - offsetY) / scale;
    if (x < 0 || y < 0 || x > this.faceModel.width || y > this.faceModel.height) return null;
    return { x, y };
  }

  renderCursor(point, size) {
    const ctx = this.overlayCtx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    if (!point) return;
    const { scale, offsetX, offsetY } = this.getTransform();
    const x = point.x * scale + offsetX;
    const y = point.y * scale + offsetY;
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 1;
    ctx.arc(x, y, (size / 2) * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  requestRender() {
    if (this.dirty) return;
    this.dirty = true;
    requestAnimationFrame(() => this.render());
  }

  stepView() {
    if (!this.animating) return;
    const ease = 0.18;
    const dz = this.targetView.zoom - this.view.zoom;
    const dx = this.targetView.center.x - this.view.center.x;
    const dy = this.targetView.center.y - this.view.center.y;

    this.view.zoom += dz * ease;
    this.view.center.x += dx * ease;
    this.view.center.y += dy * ease;

    if (Math.abs(dz) < 0.002 && Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
      this.view.zoom = this.targetView.zoom;
      this.view.center = { ...this.targetView.center };
      this.animating = false;
    }
  }

  render() {
    this.dirty = false;
    this.stepView();
    const { scale, offsetX, offsetY } = this.getTransform();

    this.beforeCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.beforeCtx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    this.beforeCtx.translate(offsetX, offsetY);
    this.beforeCtx.scale(scale, scale);
    this.beforeCtx.drawImage(this.baseCanvas, 0, 0);

    this.afterCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.afterCtx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    this.afterCtx.translate(offsetX, offsetY);
    this.afterCtx.scale(scale, scale);
    this.afterCtx.drawImage(this.baseCanvas, 0, 0);

    this.layerManager.layers.forEach((layer) => {
      if (!layer.visible) return;
      this.afterCtx.save();
      this.afterCtx.globalAlpha = layer.opacity;
      this.afterCtx.globalCompositeOperation = BlendModes[layer.blendMode] || "source-over";
      this.afterCtx.drawImage(layer.canvas, 0, 0);
      this.afterCtx.restore();
    });

    if (this.animating) {
      this.requestRender();
    }
  }
}