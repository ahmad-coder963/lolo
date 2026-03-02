import { qs } from "../utils/dom.js";
import { BLEND_LABELS } from "../engine/BlendModes.js";

export class UIController {
  constructor(options) {
    this.options = options;
    this.statusText = qs("#statusText");
    this.toolGroups = qs("#toolGroups");
    this.palette = qs("#palette");
    this.lensPalette = qs("#lensPalette");
    this.brushPresets = qs("#brushPresets");
    this.layersList = qs("#layersList");
    this.historyList = qs("#historyList");
    this.blendSelect = qs("#blendSelect");
    this.layerOpacity = qs("#layerOpacity");
    this.compareSlider = qs("#compareSlider");

    this.bindBaseEvents();
    this.renderBlendModes();
  }

  bindBaseEvents() {
    qs("#btnUndo").addEventListener("click", () => this.options.onUndo());
    qs("#btnRedo").addEventListener("click", () => this.options.onRedo());
    qs("#btnReset").addEventListener("click", () => this.options.onReset());
    qs("#btnEraser").addEventListener("click", () => this.options.onToggleEraser());
    qs("#btnClearLayer").addEventListener("click", () => this.options.onClearLayer());
    qs("#btnApplyLens").addEventListener("click", () => this.options.onApplyLens());
    qs("#btnSave").addEventListener("click", () => this.options.onSave());
    qs("#btnExport").addEventListener("click", () => this.options.onExport());
    qs("#loadInput").addEventListener("change", (event) => this.options.onLoad(event));

    qs("#brushSize").addEventListener("input", (event) =>
      this.options.onBrushChange({ size: Number(event.target.value) })
    );
    qs("#brushOpacity").addEventListener("input", (event) =>
      this.options.onBrushChange({ opacity: Number(event.target.value) })
    );
    qs("#brushFlow").addEventListener("input", (event) =>
      this.options.onBrushChange({ flow: Number(event.target.value) })
    );
    qs("#brushSoftness").addEventListener("input", (event) =>
      this.options.onBrushChange({ softness: Number(event.target.value) })
    );

    this.blendSelect.addEventListener("change", (event) =>
      this.options.onBlendChange(event.target.value)
    );

    this.layerOpacity.addEventListener("input", (event) =>
      this.options.onLayerOpacity(Number(event.target.value))
    );

    this.compareSlider.addEventListener("input", (event) =>
      this.options.onCompare(Number(event.target.value))
    );
  }

  renderBlendModes() {
    this.blendSelect.innerHTML = "";
    BLEND_LABELS.forEach((blend) => {
      const option = document.createElement("option");
      option.value = blend.id;
      option.textContent = blend.label;
      this.blendSelect.appendChild(option);
    });
  }

  renderToolGroups(groups) {
    this.toolGroups.innerHTML = "";
    groups.forEach((group) => {
      const wrapper = document.createElement("div");
      wrapper.className = "tool-group";
      const title = document.createElement("div");
      title.textContent = group.name;
      title.className = "subtitle";
      const buttons = document.createElement("div");
      buttons.className = "tool-buttons";

      group.tools.forEach((tool) => {
        const btn = document.createElement("button");
        btn.textContent = tool.label;
        btn.addEventListener("click", () => this.options.onToolSelect(tool));
        btn.dataset.toolId = tool.id;
        buttons.appendChild(btn);
      });

      wrapper.appendChild(title);
      wrapper.appendChild(buttons);
      this.toolGroups.appendChild(wrapper);
    });
  }

  highlightTool(toolId) {
    const buttons = this.toolGroups.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.toolId === toolId);
    });
  }

  renderPalette(colors) {
    this.palette.innerHTML = "";
    colors.forEach((color) => {
      const btn = document.createElement("button");
      btn.style.background = color;
      btn.addEventListener("click", () => this.options.onColorSelect(color));
      this.palette.appendChild(btn);
    });
  }

  renderLensPalette(colors) {
    this.lensPalette.innerHTML = "";
    colors.forEach((color) => {
      const btn = document.createElement("button");
      btn.style.background = color;
      btn.addEventListener("click", () => this.options.onLensColor(color));
      this.lensPalette.appendChild(btn);
    });
  }

  renderLayers(layers, activeId) {
    this.layersList.innerHTML = "";
    layers
      .slice()
      .reverse()
      .forEach((layer) => {
        const row = document.createElement("div");
        row.className = `layer-item ${layer.id === activeId ? "active" : ""}`;

        const meta = document.createElement("div");
        meta.className = "layer-meta";
        const zoneLabel = layer.zoneLabel || layer.zone;
        meta.innerHTML = `<strong>${layer.name}</strong><span>${zoneLabel}</span>`;

        const controls = document.createElement("div");
        controls.className = "layer-controls";

        const visibility = document.createElement("button");
        visibility.textContent = layer.visible ? "إخفاء" : "إظهار";
        visibility.addEventListener("click", () => this.options.onLayerToggle(layer.id));

        const up = document.createElement("button");
        up.textContent = "أعلى";
        up.addEventListener("click", () => this.options.onLayerMove(layer.id, "up"));

        const down = document.createElement("button");
        down.textContent = "أسفل";
        down.addEventListener("click", () => this.options.onLayerMove(layer.id, "down"));

        const select = document.createElement("button");
        select.textContent = "اختيار";
        select.addEventListener("click", () => this.options.onLayerSelect(layer.id));

        controls.append(visibility, up, down, select);
        row.append(meta, controls);
        this.layersList.appendChild(row);
      });
  }

  setLayerSettings(layer) {
    this.layerOpacity.value = layer.opacity;
    this.blendSelect.value = layer.blendMode;
  }

  renderHistory(log) {
    if (!this.historyList) return;
    this.historyList.innerHTML = "";
    log.forEach((action) => {
      const row = document.createElement("div");
      row.textContent = `${action.label} (${action.timestamp})`;
      this.historyList.appendChild(row);
    });
  }

  renderZoomButtons(zones) {
    const bar = qs("#zoomBar");
    bar.innerHTML = "";
    zones.forEach((zone) => {
      const btn = document.createElement("button");
      btn.textContent = zone.label;
      btn.addEventListener("click", () => this.options.onZoom(zone.id));
      bar.appendChild(btn);
    });
  }

  setStatus(text) {
    this.statusText.textContent = text;
  }

  renderBrushPresets(presets, activeId) {
    if (!this.brushPresets) return;
    this.brushPresets.innerHTML = "";
    presets.forEach((preset) => {
      const btn = document.createElement("button");
      btn.textContent = preset.label;
      btn.className = preset.id === activeId ? "active" : "";
      btn.addEventListener("click", () => this.options.onBrushPreset(preset));
      this.brushPresets.appendChild(btn);
    });
  }
}
