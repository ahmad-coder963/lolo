export class LayerManager {
  constructor(faceModel, width, height) {
    this.faceModel = faceModel;
    this.width = width;
    this.height = height;
    this.layers = [];
    this.layerMap = new Map();
    this.activeLayerId = null;
  }

  createLayer({ id, name, zone, zoneLabel, blendMode, opacity, visible = true }) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    const layer = {
      id,
      name,
      zone,
      zoneLabel,
      blendMode,
      opacity,
      visible,
      canvas,
      ctx,
      maskPath: this.faceModel.getZonePath(zone)
    };

    this.layers.push(layer);
    this.layerMap.set(id, layer);

    if (!this.activeLayerId) {
      this.activeLayerId = id;
    }

    return layer;
  }

  setActiveLayer(id) {
    if (this.layerMap.has(id)) {
      this.activeLayerId = id;
    }
  }

  get activeLayer() {
    return this.layerMap.get(this.activeLayerId);
  }

  getLayer(id) {
    return this.layerMap.get(id);
  }

  reorder(id, direction) {
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index < 0) return;

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= this.layers.length) return;

    const [removed] = this.layers.splice(index, 1);
    this.layers.splice(target, 0, removed);
  }

  clearLayer(id) {
    const layer = this.layerMap.get(id);
    if (!layer) return;
    layer.ctx.clearRect(0, 0, this.width, this.height);
  }

  resetAll() {
    this.layers.forEach((layer) => {
      layer.ctx.clearRect(0, 0, this.width, this.height);
    });
  }
}
