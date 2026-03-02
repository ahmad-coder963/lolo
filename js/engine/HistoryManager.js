export class HistoryManager {
  constructor(limit = 20) {
    this.limit = limit;
    this.undoStack = [];
    this.redoStack = [];
    this.log = [];
  }

  push(action) {
    this.undoStack.push(action);
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.log.unshift(action);
    if (this.log.length > 12) {
      this.log.pop();
    }
  }

  undo(layerManager) {
    const action = this.undoStack.pop();
    if (!action) return false;
    const layer = layerManager.getLayer(action.layerId);
    if (!layer) return false;
    layer.ctx.putImageData(action.before, 0, 0);
    this.redoStack.push(action);
    return true;
  }

  redo(layerManager) {
    const action = this.redoStack.pop();
    if (!action) return false;
    const layer = layerManager.getLayer(action.layerId);
    if (!layer) return false;
    layer.ctx.putImageData(action.after, 0, 0);
    this.undoStack.push(action);
    return true;
  }
}