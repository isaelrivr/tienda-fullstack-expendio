// =============================================
//   CARRITO.JS — Página de carrito
// =============================================

let carrito = JSON.parse(localStorage.getItem('carrito_expendio')) || [];

document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrito();
});

// --- RENDERIZAR ---
function renderizarCarrito() {
  const lista          = document.getElementById('listaCarrito');
  const vacio          = document.getElementById('carritoVacio');
  const acciones       = document.getElementById('accionesCarrito');
  const btnCheckout    = document.getElementById('btnCheckout');

  if (carrito.length === 0) {
    lista.innerHTML = '';
    vacio.classList.remove('d-none');
    acciones.classList.add('d-none');
    btnCheckout.disabled = true;
    actualizarResumen();
    return;
  }

  vacio.classList.add('d-none');
  acciones.classList.remove('d-none');
  btnCheckout.disabled = false;

  lista.innerHTML = carrito.map(item => `
    <div class="carrito-item" id="item-${item.id}">
      <div class="ci-icon">${getEmoji(item.categoria)}</div>
      <div class="ci-info" style="flex:1;">
        <div class="ci-nombre">${item.nombre}</div>
        <div style="font-size:0.8rem; color:var(--text-mid);">${item.marca || ''} · ${item.categoria || ''}</div>
        <div class="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
          <div class="qty-control">
            <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
            <span style="font-size:0.875rem; font-weight:600; min-width:24px; text-align:center;">${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span style="font-size:0.8rem; color:var(--text-mid);">
              $${item.precio.toFixed(2)} c/u
            </span>
            <span class="ci-precio">$${(item.precio * item.cantidad).toFixed(2)}</span>
            <button onclick="eliminarItem(${item.id})"
              style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1.1rem; padding:0;">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  actualizarResumen();
}

// --- RESUMEN ---
function actualizarResumen() {
  const subtotal = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  document.getElementById('resumenSubtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('resumenTotal').textContent    = '$' + subtotal.toFixed(2);
}

// --- CAMBIAR CANTIDAD ---
function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  renderizarCarrito();
}

// --- ELIMINAR ITEM ---
function eliminarItem(id) {
  carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  renderizarCarrito();
}

// --- VACIAR CARRITO ---
function vaciarCarrito() {
  if (!confirm('¿Seguro que deseas vaciar el carrito?')) return;
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
}

// --- IR A CHECKOUT ---
function irACheckout() {
  if (carrito.length === 0) return;
  window.location.href = '/tienda/checkout.html';  // ← ruta corregida
}

// --- GUARDAR ---
function guardarCarrito() {
  localStorage.setItem('carrito_expendio', JSON.stringify(carrito));
}

// --- EMOJI ---
function getEmoji(categoria) {
  if (!categoria) return '📦';
  const c = categoria.toLowerCase();
  if (c.includes('cerveza'))  return '🍺';
  if (c.includes('vino'))     return '🍷';
  if (c.includes('whisky') || c.includes('whiskey')) return '🥃';
  if (c.includes('vodka'))    return '🍸';
  if (c.includes('ron'))      return '🍹';
  if (c.includes('refresco') || c.includes('soda')) return '🥤';
  if (c.includes('agua'))     return '💧';
  if (c.includes('tequila'))  return '🌵';
  if (c.includes('mezcal'))   return '🌿';
  return '🍶';
}