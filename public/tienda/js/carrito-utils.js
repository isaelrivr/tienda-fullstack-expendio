// =============================================
//  CARRITO-UTILS.JS — Utilidades compartidas
//  Incluir ANTES que tienda.js / carrito.js / checkout.js
// =============================================

const STORAGE_KEY = 'carrito_expendio';

/** Emoji por categoría de bebida */
function getEmojiCategoria(categoria) {
  if (!categoria) return '📦';
  const c = categoria.toLowerCase();
  if (c.includes('cerveza'))                        return '🍺';
  if (c.includes('vino'))                           return '🍷';
  if (c.includes('whisky') || c.includes('whiskey')) return '🥃';
  if (c.includes('vodka'))                          return '🍸';
  if (c.includes('ron'))                            return '🍹';
  if (c.includes('tequila'))                        return '🌵';
  if (c.includes('mezcal'))                         return '🌿';
  if (c.includes('brandy'))                         return '🥂';
  if (c.includes('refresco') || c.includes('soda')) return '🥤';
  if (c.includes('agua'))                           return '💧';
  if (c.includes('botana'))                         return '🍿';
  return '🍶';
}

/** Leer carrito del localStorage */
function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

/** Guardar carrito en localStorage */
function guardarCarritoLS(carrito) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

/** Calcular subtotal */
function calcularSubtotal(carrito) {
  return carrito.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0);
}

/** Formatear precio con $ */
function formatPrecio(num) {
  return '$' + Number(num).toFixed(2);
}
