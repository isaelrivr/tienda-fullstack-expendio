// =============================================
//   CARRITO.JS — Página completa del carrito
// =============================================

let carrito = leerCarrito(); // desde carrito-utils.js

document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrito();
  actualizarBadgeNav();
});

// ── Renderizar tabla del carrito ──────────────────────────────────────────────
function renderizarCarrito() {
  const lista     = document.getElementById('listaCarrito');
  const vacio     = document.getElementById('carritoVacio');
  const acciones  = document.getElementById('accionesCarrito');
  const btnChk    = document.getElementById('btnCheckout');

  if (carrito.length === 0) {
    lista.innerHTML = '';
    vacio.classList.remove('d-none');
    acciones.classList.add('d-none');
    if (btnChk) btnChk.disabled = true;
    actualizarResumen();
    return;
  }

  vacio.classList.add('d-none');
  acciones.classList.remove('d-none');
  if (btnChk) btnChk.disabled = false;

  lista.innerHTML = carrito.map(item => `
    <div class="carrito-item" id="item-${item.id}">
      <div class="ci-icon">${getEmojiCategoria(item.categoria)}</div>
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
            <span style="font-size:0.8rem; color:var(--text-mid);">${formatPrecio(item.precio)} c/u</span>
            <span class="ci-precio">${formatPrecio(item.precio * item.cantidad)}</span>
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

function actualizarResumen() {
  const subtotal = calcularSubtotal(carrito);
  document.getElementById('resumenSubtotal').textContent = formatPrecio(subtotal);
  document.getElementById('resumenTotal').textContent    = formatPrecio(subtotal);
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  guardarCarritoLS(carrito);
  renderizarCarrito();
}

function eliminarItem(id) {
  carrito = carrito.filter(i => i.id !== id);
  guardarCarritoLS(carrito);
  renderizarCarrito();
}

function vaciarCarrito() {
  if (!confirm('¿Seguro que deseas vaciar el carrito?')) return;
  carrito = [];
  guardarCarritoLS(carrito);
  renderizarCarrito();
}

function irACheckout() {
  if (carrito.length === 0) return;
  window.location.href = 'checkout.html';
}

// Badge del nav en la página carrito
function actualizarBadgeNav() {
  const el = document.getElementById('carritoCount');
  if (el) el.textContent = carrito.reduce((a, i) => a + i.cantidad, 0);
}