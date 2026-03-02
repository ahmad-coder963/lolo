export const TOOL_CATEGORIES = [
  {
    id: "face",
    name: "الوجه",
    tools: [
      { id: "foundation", label: "كريم أساس", layerId: "foundation", palette: "foundation", zone: "skin", toolType: "brush" },
      { id: "concealer", label: "كونسيلر", layerId: "concealer", palette: "concealer", zone: "skin", toolType: "brush" },
      { id: "contour", label: "كونتور", layerId: "contour", palette: "contour", zone: "skin", toolType: "brush" },
      { id: "blush", label: "بلاشر", layerId: "blush", palette: "blush", zone: "cheeks", toolType: "brush" },
      { id: "highlight", label: "هايلايتر", layerId: "highlight", palette: "highlight", zone: "skin", toolType: "brush" },
      { id: "powder", label: "بودرة تثبيت", layerId: "powder", palette: "powder", zone: "skin", toolType: "brush" }
    ]
  },
  {
    id: "eyes",
    name: "العيون",
    tools: [
      { id: "eyeshadow", label: "ظلال العيون", layerId: "eyeshadow", palette: "eyeshadow", zone: "eyes", toolType: "brush" },
      { id: "eyeliner", label: "آيلاينر", layerId: "eyeliner", palette: "eyeliner", zone: "eyes", toolType: "liner" },
      { id: "mascara", label: "ماسكارا", layerId: "mascara", palette: "mascara", zone: "eyes", toolType: "mascara" },
      { id: "brows", label: "الحواجب", layerId: "brows", palette: "brows", zone: "brows", toolType: "brush" },
      { id: "lenses", label: "عدسات لاصقة", layerId: "lenses", palette: "lenses", zone: "irises", toolType: "lens" }
    ]
  },
  {
    id: "lips",
    name: "الشفاه",
    tools: [
      { id: "lipstick", label: "أحمر شفاه", layerId: "lips", palette: "lips", zone: "lips", toolType: "brush" },
      { id: "liner", label: "محدد الشفاه", layerId: "liner", palette: "lips", zone: "lips", toolType: "liner" },
      { id: "gloss", label: "ملمع شفاه", layerId: "gloss", palette: "gloss", zone: "lips", toolType: "gloss" }
    ]
  },
  {
    id: "extra",
    name: "إضافات",
    tools: [
      { id: "glitter", label: "جليتر", layerId: "glitter", palette: "glitter", zone: "face", toolType: "glitter" },
      { id: "stickers", label: "ملصقات", layerId: "stickers", palette: "stickers", zone: "face", toolType: "sticker" },
      { id: "gems", label: "أحجار", layerId: "gems", palette: "gems", zone: "face", toolType: "gem" }
    ]
  }
];
