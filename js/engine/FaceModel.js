import { rand } from "../utils/math.js";

export class FaceModel {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.paths = this.createPaths();
    this.bounds = this.createBounds();
  }

  createPaths() {
    const w = this.width;
    const h = this.height;

    const face = new Path2D();
    face.ellipse(w * 0.5, h * 0.58, w * 0.31, h * 0.4, 0, 0, Math.PI * 2);

    const skin = new Path2D(face);

    const cheeks = new Path2D();
    cheeks.ellipse(w * 0.36, h * 0.62, w * 0.09, h * 0.06, -0.1, 0, Math.PI * 2);
    cheeks.ellipse(w * 0.64, h * 0.62, w * 0.09, h * 0.06, 0.1, 0, Math.PI * 2);

    const lips = new Path2D();
    lips.moveTo(w * 0.42, h * 0.73);
    lips.bezierCurveTo(w * 0.48, h * 0.71, w * 0.52, h * 0.71, w * 0.58, h * 0.73);
    lips.bezierCurveTo(w * 0.52, h * 0.76, w * 0.48, h * 0.76, w * 0.42, h * 0.73);

    const eyes = new Path2D();
    eyes.ellipse(w * 0.38, h * 0.42, w * 0.08, h * 0.045, 0, 0, Math.PI * 2);
    eyes.ellipse(w * 0.62, h * 0.42, w * 0.08, h * 0.045, 0, 0, Math.PI * 2);

    const eyeliner = new Path2D();
    eyeliner.ellipse(w * 0.38, h * 0.42, w * 0.12, h * 0.07, 0, 0, Math.PI * 2);
    eyeliner.ellipse(w * 0.62, h * 0.42, w * 0.12, h * 0.07, 0, 0, Math.PI * 2);
    eyeliner.moveTo(w * 0.3, h * 0.42);
    eyeliner.lineTo(w * 0.22, h * 0.39);
    eyeliner.lineTo(w * 0.3, h * 0.45);
    eyeliner.closePath();
    eyeliner.moveTo(w * 0.7, h * 0.42);
    eyeliner.lineTo(w * 0.78, h * 0.39);
    eyeliner.lineTo(w * 0.7, h * 0.45);
    eyeliner.closePath();

    const irises = new Path2D();
    irises.ellipse(w * 0.38, h * 0.42, w * 0.028, h * 0.028, 0, 0, Math.PI * 2);
    irises.ellipse(w * 0.62, h * 0.42, w * 0.028, h * 0.028, 0, 0, Math.PI * 2);

    const brows = new Path2D();
    brows.ellipse(w * 0.38, h * 0.36, w * 0.075, h * 0.02, -0.08, 0, Math.PI * 2);
    brows.ellipse(w * 0.62, h * 0.36, w * 0.075, h * 0.02, 0.08, 0, Math.PI * 2);

    const nose = new Path2D();
    nose.moveTo(w * 0.5, h * 0.46);
    nose.bezierCurveTo(w * 0.485, h * 0.54, w * 0.485, h * 0.6, w * 0.5, h * 0.64);
    nose.bezierCurveTo(w * 0.515, h * 0.6, w * 0.515, h * 0.54, w * 0.5, h * 0.46);

    const faceMask = new Path2D();
    faceMask.ellipse(w * 0.5, h * 0.58, w * 0.34, h * 0.43, 0, 0, Math.PI * 2);

    return { face, skin, cheeks, lips, eyes, eyeliner, brows, nose, irises, faceMask };
  }

  createBounds() {
    const w = this.width;
    const h = this.height;
    return {
      face: { x: w * 0.16, y: h * 0.12, w: w * 0.68, h: h * 0.86 },
      eyes: { x: w * 0.2, y: h * 0.28, w: w * 0.6, h: h * 0.28 },
      eyeliner: { x: w * 0.18, y: h * 0.26, w: w * 0.64, h: h * 0.32 },
      lips: { x: w * 0.35, y: h * 0.66, w: w * 0.3, h: h * 0.16 },
      cheeks: { x: w * 0.22, y: h * 0.52, w: w * 0.56, h: h * 0.26 },
      brows: { x: w * 0.2, y: h * 0.26, w: w * 0.6, h: h * 0.18 },
      nose: { x: w * 0.43, y: h * 0.4, w: w * 0.14, h: h * 0.28 }
    };
  }

  getZonePath(zone) {
    return this.paths[zone] || this.paths.faceMask;
  }

  getZoneBounds(zone) {
    return this.bounds[zone] || this.bounds.face;
  }

  fillIrises(ctx, color) {
    const w = this.width;
    const h = this.height;
    ctx.save();
    if (color) ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(w * 0.38, h * 0.42, w * 0.028, h * 0.028, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.62, h * 0.42, w * 0.028, h * 0.028, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBase(ctx) {
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);

    const hairBack = new Path2D();
    hairBack.ellipse(w * 0.5, h * 0.47, w * 0.35, h * 0.47, 0, 0, Math.PI * 2);


    const hairGradient = ctx.createLinearGradient(w * 0.5, h * 0.02, w * 0.5, h * 0.98);
    hairGradient.addColorStop(0, "#2a1714");
    hairGradient.addColorStop(0.6, "#3b231d");
    hairGradient.addColorStop(1, "#4a2a22");

    ctx.save();
    ctx.fillStyle = hairGradient;
    ctx.fill(hairBack);
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.52);
    ctx.bezierCurveTo(w * 0.18, h * 0.72, w * 0.2, h * 0.92, w * 0.3, h * 1.02);
    ctx.bezierCurveTo(w * 0.34, h * 0.9, w * 0.38, h * 0.78, w * 0.4, h * 0.64);
    ctx.lineTo(w * 0.24, h * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.76, h * 0.52);
    ctx.bezierCurveTo(w * 0.82, h * 0.72, w * 0.8, h * 0.92, w * 0.7, h * 1.02);
    ctx.bezierCurveTo(w * 0.66, h * 0.9, w * 0.62, h * 0.78, w * 0.6, h * 0.64);
    ctx.lineTo(w * 0.76, h * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const skinGradient = ctx.createLinearGradient(w * 0.3, h * 0.2, w * 0.7, h * 0.8);
    skinGradient.addColorStop(0, "#f3d8c7");
    skinGradient.addColorStop(0.5, "#e6bfa3");
    skinGradient.addColorStop(1, "#cfa382");

    ctx.save();
    ctx.fillStyle = skinGradient;
    ctx.fill(this.paths.face);

    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(170, 120, 90, 0.18)";
    ctx.fill(this.paths.cheeks);

    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#fffaf5";
    ctx.fill(this.paths.eyes);

    this.fillIrises(ctx, "#7b5a4b");

    ctx.fillStyle = "#231916";
    ctx.beginPath();
    ctx.ellipse(w * 0.38, h * 0.42, w * 0.012, h * 0.012, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.62, h * 0.42, w * 0.012, h * 0.012, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.ellipse(w * 0.372, h * 0.412, w * 0.008, h * 0.008, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.612, h * 0.412, w * 0.008, h * 0.008, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#3b2a24";
    ctx.globalAlpha = 0.7;
    ctx.fill(this.paths.brows);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#b75b6b";
    ctx.fill(this.paths.lips);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(120, 80, 70, 0.25)";
    ctx.lineWidth = 1.6;
    ctx.stroke(this.paths.nose);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(120, 80, 70, 0.22)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(w * 0.485, h * 0.64, w * 0.012, Math.PI * 0.1, Math.PI * 0.9);
    ctx.arc(w * 0.515, h * 0.64, w * 0.012, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 80; i += 1) {
      const x = w * 0.3 + rand(0, w * 0.4);
      const y = h * 0.34 + rand(0, h * 0.5);
      ctx.beginPath();
      ctx.ellipse(x, y, rand(0.5, 1.4), rand(0.5, 1.4), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
