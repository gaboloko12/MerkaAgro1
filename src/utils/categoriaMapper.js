// Mapea categorías a emojis
export const CATEGORIAS_MAP = {
  "maquinaria": "Maquinaria 🚜",
  "semillas": "Semillas 🌱",
  "cosechas": "Cosechas 🥕",
  "servicios": "Servicios 🧰",
  "fertilizantes": "Fertilizantes 💧",
  "plagas": "Control de Plagas 🐛",
  "riego": "Sistemas de Riego 💦",
  "alimentos": "Alimentos 🍎",
  "herramientas": "Herramientas 🔧",
  "insumos": "Insumos 📦",
  "transporte": "Transporte 🚚",
  "animales": "Ganado y Animales 🐄",
  "tierras": "Tierras y Terrenos 🌾",
  "refacciones": "Refacciones ⚙️",
  "tecnología": "Tecnología Agrícola 💻",
  "consultoría agrícola": "Consultoría Agrícola 🧑‍🌾",
  "energía solar": "Energía Solar ☀️",
  "productos orgánicos": "Productos Orgánicos 🍃",
  "invernaderos": "Invernaderos 🏭",
  "agroinsumos": "Agroinsumos 🧪",
  "forrajes": "Forrajes y Pastos 🌿",
};

export function getCategoriaConEmoji(categoria) {
  if (!categoria) return "Sin categoría";
  const key = categoria.toLowerCase().trim();
  return CATEGORIAS_MAP[key] || categoria;
}
