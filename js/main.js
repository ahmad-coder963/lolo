import { FaceModel } from "./engine/FaceModel.js";
import { LayerManager } from "./engine/LayerManager.js";
import { HistoryManager } from "./engine/HistoryManager.js";
import { BrushEngine } from "./engine/BrushEngine.js";
import { Renderer } from "./engine/Renderer.js";
import { UIController } from "./ui/UIController.js";
import { PALETTES } from "./data/palettes.js";
import { TOOL_CATEGORIES } from "./data/toolkit.js";
import { BlendModes } from "./engine/BlendModes.js";
import { clamp } from "./utils/math.js";

const BASE_WIDTH = 1400;
const BASE_HEIGHT = 1800;

const faceModel = new FaceModel(BASE_WIDTH, BASE_HEIGHT);
const layerManager = new LayerManager(faceModel, BASE_WIDTH, BASE_HEIGHT);
const historyManager = new HistoryManager(18);

const BRUSH_PRESETS = [
  { id: "soft", label: "ناعم", settings: { size: 52, opacity: 0.6, flow: 0.45, softness: 0.9 } },
  { id: "detail", label: "تفصيلي", settings: { size: 18, opacity: 0.75, flow: 0.6, softness: 0.5 } },
  { id: "blender", label: "موزع", settings: { size: 70, opacity: 0.35, flow: 0.35, softness: 0.95 } },
  { id: "liner", label: "دقيق", settings: { size: 12, opacity: 0.85, flow: 0.7, softness: 0.3 } }
];

const layerConfigs = [
  { id: "foundation", name: "كريم أساس", zone: "skin", zoneLabel: "البشرة", blendMode: "softLight", opacity: 0.65 },
  { id: "concealer", name: "كونسيلر", zone: "skin", zoneLabel: "البشرة", blendMode: "screen", opacity: 0.5 },
  { id: "contour", name: "كونتور", zone: "skin", zoneLabel: "البشرة", blendMode: "multiply", opacity: 0.5 },
  { id: "blush", name: "بلاشر", zone: "cheeks", zoneLabel: "الخدود", blendMode: "softLight", opacity: 0.6 },
  { id: "highlight", name: "هايلايتر", zone: "skin", zoneLabel: "البشرة", blendMode: "screen", opacity: 0.7 },
  { id: "powder", name: "بودرة تثبيت", zone: "skin", zoneLabel: "البشرة", blendMode: "softLight", opacity: 0.4 },
  { id: "eyeshadow", name: "ظلال العيون", zone: "eyes", zoneLabel: "العيون", blendMode: "overlay", opacity: 0.7 },
  { id: "eyeliner", name: "آيلاينر", zone: "eyeliner", zoneLabel: "الآيلاينر", blendMode: "normal", opacity: 0.9 },
  { id: "mascara", name: "ماسكارا", zone: "eyes", zoneLabel: "العيون", blendMode: "normal", opacity: 0.8 },
  { id: "brows", name: "الحواجب", zone: "brows", zoneLabel: "الحواجب", blendMode: "multiply", opacity: 0.7 },
  { id: "lenses", name: "عدسات لاصقة", zone: "irises", zoneLabel: "القزحية", blendMode: "overlay", opacity: 0.8 },
  { id: "lips", name: "أحمر شفاه", zone: "lips", zoneLabel: "الشفاه", blendMode: "overlay", opacity: 0.75 },
  { id: "liner", name: "محدد الشفاه", zone: "lips", zoneLabel: "الشفاه", blendMode: "normal", opacity: 0.7 },
  { id: "gloss", name: "ملمع شفاه", zone: "lips", zoneLabel: "الشفاه", blendMode: "screen", opacity: 0.5 },
  { id: "glitter", name: "جليتر", zone: "face", zoneLabel: "الوجه", blendMode: "screen", opacity: 0.6 },
  { id: "stickers", name: "ملصقات", zone: "face", zoneLabel: "الوجه", blendMode: "screen", opacity: 0.8 },
  { id: "gems", name: "أحجار", zone: "face", zoneLabel: "الوجه", blendMode: "screen", opacity: 0.8 }
];

layerConfigs.forEach((config) => layerManager.createLayer(config));

const renderer = new Renderer({
  beforeCanvas: document.getElementById("beforeCanvas"),
  afterCanvas: document.getElementById("afterCanvas"),
  overlayCanvas: document.getElementById("overlayCanvas"),
  faceModel,
  layerManager
});

renderer.renderBase();

const brushEngine = new BrushEngine({
  faceModel,
  layerManager,
  renderer,
  historyManager
});

brushEngine.attach(document.getElementById("overlayCanvas"));

const ui = new UIController({
  onToolSelect: handleToolSelect,
  onColorSelect: handleColorSelect,
  onLensColor: handleLensColor,
  onBrushChange: handleBrushChange,
  onBrushPreset: handleBrushPreset,
  onLayerSelect: handleLayerSelect,
  onLayerToggle: handleLayerToggle,
  onLayerMove: handleLayerMove,
  onBlendChange: handleBlendChange,
  onLayerOpacity: handleLayerOpacity,
  onUndo: handleUndo,
  onRedo: handleRedo,
  onReset: handleReset,
  onClearLayer: handleClearLayer,
  onToggleEraser: handleToggleEraser,
  onCompare: handleCompare,
  onZoom: handleZoom,
  onSave: handleSave,
  onLoad: handleLoad,
  onExport: handleExport,
  onApplyLens: handleApplyLens
});

brushEngine.onHistory = (log) => ui.renderHistory(log);

ui.renderToolGroups(TOOL_CATEGORIES);
ui.renderPalette(PALETTES.foundation);
ui.renderLensPalette(PALETTES.lenses);
ui.renderLayers(layerManager.layers, layerManager.activeLayerId);
ui.renderZoomButtons([
  { id: "face", label: "الوجه كامل" },
  { id: "eyes", label: "العيون" },
  { id: "cheeks", label: "الخدود" },
  { id: "lips", label: "الشفاه" },
  { id: "brows", label: "الحواجب" },
  { id: "nose", label: "الأنف" }
]);
ui.setLayerSettings(layerManager.activeLayer);

let currentTool = TOOL_CATEGORIES[0].tools[0];
let lensColor = PALETTES.lenses[0];
let activeBrushPreset = BRUSH_PRESETS[0].id;

ui.highlightTool(currentTool.id);
ui.renderBrushPresets(BRUSH_PRESETS, activeBrushPreset);
applyBrushPreset(BRUSH_PRESETS[0]);

function resizeStage() {
  const stage = document.getElementById("stageCanvas");
  const rect = stage.getBoundingClientRect();
  renderer.resize(rect.width, rect.height);
  renderer.requestRender();
}

window.addEventListener("resize", resizeStage);
resizeStage();

function handleToolSelect(tool) {
  currentTool = tool;
  ui.highlightTool(tool.id);
  ui.renderPalette(PALETTES[tool.palette] || PALETTES.foundation);
  layerManager.setActiveLayer(tool.layerId);
  brushEngine.setTool(tool.toolType);
  brushEngine.setColor(PALETTES[tool.palette]?.[0] || "#c35a73");
  ui.setLayerSettings(layerManager.activeLayer);
  ui.renderLayers(layerManager.layers, layerManager.activeLayerId);
  ui.setStatus(`الأداة: ${tool.label}`);
}

function handleColorSelect(color) {
  brushEngine.setColor(color);
  ui.setStatus(`تم اختيار اللون ${color}`);
}

function handleLensColor(color) {
  lensColor = color;
  ui.setStatus("تم تعيين لون العدسات");
}

function handleBrushChange(settings) {
  brushEngine.setBrushSettings(settings);
}

function handleBrushPreset(preset) {
  activeBrushPreset = preset.id;
  applyBrushPreset(preset);
  ui.renderBrushPresets(BRUSH_PRESETS, activeBrushPreset);
  ui.setStatus(`القلم: ${preset.label}`);
}

function applyBrushPreset(preset) {
  brushEngine.setBrushSettings(preset.settings);
  const { size, opacity, flow, softness } = preset.settings;
  const sizeInput = document.getElementById("brushSize");
  const opacityInput = document.getElementById("brushOpacity");
  const flowInput = document.getElementById("brushFlow");
  const softnessInput = document.getElementById("brushSoftness");
  if (sizeInput) sizeInput.value = size;
  if (opacityInput) opacityInput.value = opacity;
  if (flowInput) flowInput.value = flow;
  if (softnessInput) softnessInput.value = softness;
}

function handleLayerSelect(layerId) {
  layerManager.setActiveLayer(layerId);
  ui.setLayerSettings(layerManager.activeLayer);
  ui.renderLayers(layerManager.layers, layerManager.activeLayerId);
  ui.setStatus(`الطبقة: ${layerManager.activeLayer.name}`);
}

function handleLayerToggle(layerId) {
  const layer = layerManager.getLayer(layerId);
  if (!layer) return;
  layer.visible = !layer.visible;
  ui.renderLayers(layerManager.layers, layerManager.activeLayerId);
  renderer.requestRender();
}

function handleLayerMove(layerId, direction) {
  layerManager.reorder(layerId, direction);
  ui.renderLayers(layerManager.layers, layerManager.activeLayerId);
  renderer.requestRender();
}

function handleBlendChange(blendMode) {
  const layer = layerManager.activeLayer;
  if (!layer) return;
  layer.blendMode = blendMode;
  renderer.requestRender();
}

function handleLayerOpacity(value) {
  const layer = layerManager.activeLayer;
  if (!layer) return;
  layer.opacity = value;
  renderer.requestRender();
}

function handleUndo() {
  if (historyManager.undo(layerManager)) {
    renderer.requestRender();
    ui.renderHistory(historyManager.log);
  }
}

function handleRedo() {
  if (historyManager.redo(layerManager)) {
    renderer.requestRender();
    ui.renderHistory(historyManager.log);
  }
}

function handleReset() {
  layerManager.resetAll();
  renderer.requestRender();
  ui.renderHistory([]);
  ui.setStatus("تم مسح كل الطبقات");
}

function handleClearLayer() {
  const layer = layerManager.activeLayer;
  if (!layer) return;
  layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  renderer.requestRender();
  ui.setStatus(`تم مسح ${layer.name}`);
}

function handleToggleEraser() {
  brushEngine.setEraser(!brushEngine.eraser);
  ui.setStatus(brushEngine.eraser ? "تم تفعيل الممحاة" : "تم إيقاف الممحاة");
}

function handleCompare(value) {
  const clip = document.getElementById("afterClip");
  clip.style.width = `${value}%`;
}

function handleZoom(zoneId) {
  if (zoneId === "face") {
    renderer.setView(1, { x: BASE_WIDTH / 2, y: BASE_HEIGHT / 2 });
    return;
  }
  const bounds = faceModel.getZoneBounds(zoneId);
  const center = { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
  const zoom = clamp(1.8, 1.2, 2.6);
  renderer.setView(zoom, center);
}

function handleSave() {
  const payload = {
    layers: layerManager.layers.map((layer) => ({
      id: layer.id,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      visible: layer.visible,
      data: layer.canvas.toDataURL("image/png")
    }))
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "lujain-design.json";
  link.click();
  URL.revokeObjectURL(link.href);
  ui.setStatus("تم حفظ التصميم");
}

function handleLoad(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    data.layers.forEach((saved) => {
      const layer = layerManager.getLayer(saved.id);
      if (!layer) return;
      layer.opacity = saved.opacity;
      layer.blendMode = saved.blendMode;
      layer.visible = saved.visible;
      const img = new Image();
      img.onload = () => {
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        layer.ctx.drawImage(img, 0, 0);
        renderer.requestRender();
      };
      img.src = saved.data;
    });
    ui.renderLayers(layerManager.layers, layerManager.activeLayerId);
    ui.setStatus("تم تحميل التصميم");
  };
  reader.readAsText(file);
}

function handleExport() {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = BASE_WIDTH;
  exportCanvas.height = BASE_HEIGHT;
  const ctx = exportCanvas.getContext("2d");
  ctx.drawImage(renderer.baseCanvas, 0, 0);
  layerManager.layers.forEach((layer) => {
    if (!layer.visible) return;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.globalCompositeOperation = BlendModes[layer.blendMode] || "source-over";
    ctx.drawImage(layer.canvas, 0, 0);
    ctx.restore();
  });
  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = "lujain-export.png";
  link.click();
  ui.setStatus("تم تصدير PNG");
}

function handleApplyLens() {
  const layer = layerManager.getLayer("lenses");
  if (!layer) return;
  layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
  layer.ctx.save();
  layer.ctx.globalCompositeOperation = "source-over";
  layer.ctx.globalAlpha = 1;
  faceModel.fillIrises(layer.ctx, lensColor);
  layer.ctx.restore();
  renderer.requestRender();
  ui.setStatus("تم تطبيق العدسات");
}

ui.renderHistory(historyManager.log);
