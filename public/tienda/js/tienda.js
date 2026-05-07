// =============================================
//   TIENDA.JS — Catálogo público de productos
// =============================================

let todosLosProductos = [];
let carrito = leerCarrito(); // desde carrito-utils.js

document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  renderizarCarritoDrawer();
  actualizarBadge();

  document.getElementById('buscador').addEventListener('input', aplicarFiltros);

  document.getElementById('filtroPrecio').addEventListener('input', function () {
    document.getElementById('precioMaxLabel').textContent = formatPrecio(this.value);
    aplicarFiltros();
  });

  document.getElementById('ordenar').addEventListener('change', aplicarFiltros);
  document.getElementById('btnAbrirCarrito').addEventListener('click', abrirCarrito);
});

// ── Cargar productos ─────────────────────────────────────────────────────────
async function cargarProductos() {
  try {
    const res = await fetch('/api/productos');
    if (!res.ok) throw new Error('Error ' + res.status);
    todosLosProductos = (await res.json()).filter(p => p.activo != 0);

    const maxPrecio = Math.max(...todosLosProductos.map(p => Number(p.precio) || 0), 0);
    const slider = document.getElementById('filtroPrecio');
    slider.max   = maxPrecio || 1000;
    slider.value = maxPrecio || 1000;
    document.getElementById('precioMaxLabel').textContent = formatPrecio(maxPrecio || 1000);

    generarCategorias();
    aplicarFiltros();
  } catch (e) {
    console.error(e);
    document.getElementById('estadoCarga').innerHTML = `
      <i class="bi bi-exclamation-circle fs-1 text-danger d-block mb-2"></i>
      <p class="text-danger">No se pudieron cargar los productos.<br>Verifica que el servidor esté corriendo.</p>
    `;
  }
}

// ── Categorías dinámicas ──────────────────────────────────────────────────────
function generarCategorias() {
  const categorias = [...new Set(todosLosProductos.map(p => p.categoria).filter(Boolean))].sort();
  const contenedor = document.getElementById('listaCategorias');
  contenedor.innerHTML = `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="categoria" id="cat-todas" value="" checked>
      <label class="form-check-label" for="cat-todas">Todas</label>
    </div>
    ${categorias.map((cat, i) => `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="categoria" id="cat-${i}" value="${cat}">
      <label class="form-check-label" for="cat-${i}">${getEmojiCategoria(cat)} ${cat}</label>
    </div>`).join('')}
  `;
  contenedor.querySelectorAll('input[type=radio]').forEach(r => r.addEventListener('change', aplicarFiltros));
}

// ── Filtros ───────────────────────────────────────────────────────────────────
function aplicarFiltros() {
  const busqueda  = document.getElementById('buscador').value.toLowerCase().trim();
  const categoria = document.querySelector('input[name="categoria"]:checked')?.value || '';
  const precioMax = Number(document.getElementById('filtroPrecio').value);
  const orden     = document.getElementById('ordenar').value;

  let resultado = todosLosProductos.filter(p =>
    (!busqueda || [p.nombre, p.marca, p.categoria].some(v => (v||'').toLowerCase().includes(busqueda))) &&
    (!categoria  || p.categoria === categoria) &&
    (Number(p.precio) <= precioMax)
  );

  resultado.sort((a, b) => {
    if (orden === 'precio_asc')  return Number(a.precio) - Number(b.precio);
    if (orden === 'precio_desc') return Number(b.precio) - Number(a.precio);
    if (orden === 'stock')       return Number(b.stock)  - Number(a.stock);
    return (a.nombre || '').localeCompare(b.nombre || '');
  });

  renderizarProductos(resultado);
}

// ── Renderizar grid ───────────────────────────────────────────────────────────
function renderizarProductos(productos) {
  const grid  = document.getElementById('gridProductos');
  const carga = document.getElementById('estadoCarga');
  const vacio = document.getElementById('estadoVacio');

  carga.classList.add('d-none');
  document.getElementById('conteoProductos').textContent = productos.length;

  if (productos.length === 0) {
    grid.innerHTML = '';
    vacio.classList.remove('d-none');
    return;
  }
  vacio.classList.add('d-none');

  grid.innerHTML = productos.map(p => {
    const precio  = Number(p.precio) || 0;
    const stock   = Number(p.stock)  || 0;
    const agotado = stock === 0;
    const emoji   = getEmojiCategoria(p.categoria);
    const enCarrito = carrito.find(i => i.id === p.id)?.cantidad || 0;

    return `
      <div class="col-sm-6 col-xl-4">
        <div class="product-card">
          <div class="product-img-wrap">${emoji}</div>
          <div class="product-body">
            <span class="product-categoria">${p.categoria || 'Sin categoría'}</span>
            <h6 class="product-nombre">${p.nombre || 'Sin nombre'}</h6>
            <span class="product-marca">${p.marca || ''}</span>
            <div class="d-flex align-items-center justify-content-between mt-1">
              <span class="product-precio">${formatPrecio(precio)}</span>
              <span class="product-stock ${agotado ? 'agotado' : ''}">
                <i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>
                ${agotado ? 'Agotado' : `Stock: ${stock}`}
              </span>
            </div>
            ${enCarrito > 0 ? `<div class="text-success" style="font-size:0.78rem; margin-top:4px;"><i class="bi bi-check-circle me-1"></i>En carrito: ${enCarrito}</div>` : ''}
            <button
              class="btn-agregar"
              onclick="agregarAlCarrito(${p.id})"
              ${agotado ? 'disabled' : ''}>
              <i class="bi bi-cart-plus me-1"></i>
              ${agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Carrito: operaciones ──────────────────────────────────────────────────────
function agregarAlCarrito(id) {
  const producto = todosLosProductos.find(p => p.id === id);
  if (!producto) return;

  const existente = carrito.find(i => i.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id:        producto.id,
      nombre:    producto.nombre,
      precio:    Number(producto.precio),
      marca:     producto.marca,
      categoria: producto.categoria,
      cantidad:  1
    });
  }

  guardarCarritoLS(carrito);
  renderizarCarritoDrawer();
  actualizarBadge();
  // Re-renderizar para mostrar "En carrito: N"
  aplicarFiltros();
  abrirCarrito();
}

function renderizarCarritoDrawer() {
  const body = document.getElementById('carritoBody');
  if (carrito.length === 0) {
    body.innerHTML = `
      <p class="text-center text-muted mt-4">
        <i class="bi bi-cart-x fs-1 d-block mb-2"></i>Tu carrito está vacío
      </p>`;
    document.getElementById('subtotalVal').textContent = '$0.00';
    document.getElementById('totalVal').textContent    = '$0.00';
    return;
  }

  body.innerHTML = carrito.map(item => `
    <div class="carrito-item">
      <div class="ci-icon">${getEmojiCategoria(item.categoria)}</div>
      <div class="ci-info">
        <div class="ci-nombre">${item.nombre}</div>
        <div class="ci-precio">${formatPrecio(item.precio * item.cantidad)}</div>
        <div class="qty-control mt-1">
          <button onclick="cambiarCantidadDrawer(${item.id}, -1)">−</button>
          <span style="font-size:0.875rem; font-weight:600;">${item.cantidad}</span>
          <button onclick="cambiarCantidadDrawer(${item.id}, 1)">+</button>
          <button onclick="eliminarDrawer(${item.id})"
            style="margin-left:0.5rem; background:none; border:none; color:var(--danger); cursor:pointer; font-size:1rem;">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>`).join('');

  const subtotal = calcularSubtotal(carrito);
  document.getElementById('subtotalVal').textContent = formatPrecio(subtotal);
  document.getElementById('totalVal').textContent    = formatPrecio(subtotal);
}

function cambiarCantidadDrawer(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  guardarCarritoLS(carrito);
  renderizarCarritoDrawer();
  actualizarBadge();
  aplicarFiltros();
}

function eliminarDrawer(id) {
  carrito = carrito.filter(i => i.id !== id);
  guardarCarritoLS(carrito);
  renderizarCarritoDrawer();
  actualizarBadge();
  aplicarFiltros();
}

function actualizarBadge() {
  const total = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  document.getElementById('carritoCount').textContent = total;
}

function abrirCarrito() {
  document.getElementById('carritoDrawer').classList.add('open');
  document.getElementById('carritoOverlay').classList.add('open');
}

function cerrarCarrito() {
  document.getElementById('carritoDrawer').classList.remove('open');
  document.getElementById('carritoOverlay').classList.remove('open');
}

function limpiarFiltros() {
  document.getElementById('buscador').value = '';
  const radio = document.querySelector('input[name="categoria"][value=""]');
  if (radio) radio.checked = true;
  const slider = document.getElementById('filtroPrecio');
  slider.value = slider.max;
  document.getElementById('precioMaxLabel').textContent = formatPrecio(slider.max);
  document.getElementById('ordenar').value = 'nombre';
  aplicarFiltros();
}