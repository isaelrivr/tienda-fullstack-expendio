// =============================================
//   TIENDA.JS — Catálogo público de productos
// =============================================

// --- ESTADO GLOBAL ---
let todosLosProductos = [];
let carrito = JSON.parse(localStorage.getItem('carrito_expendio')) || [];

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  renderizarCarrito();
  actualizarBadge();

  // Buscador
  document.getElementById('buscador').addEventListener('input', aplicarFiltros);

  // Filtro precio
  const sliderPrecio = document.getElementById('filtroPrecio');
  sliderPrecio.addEventListener('input', () => {
    document.getElementById('precioMaxLabel').textContent =
      '$' + Number(sliderPrecio.value).toLocaleString();
    aplicarFiltros();
  });

  // Ordenar
  document.getElementById('ordenar').addEventListener('change', aplicarFiltros);

  // Botón carrito navbar
  document.getElementById('btnAbrirCarrito').addEventListener('click', abrirCarrito);
});

// --- CARGAR PRODUCTOS DESDE EL BACKEND ---
async function cargarProductos() {
  try {
    const res = await fetch('/api/productos');
    if (!res.ok) throw new Error('Error al cargar productos');
    todosLosProductos = await res.json();

    // Calcular precio máximo real para el slider
    const maxPrecio = Math.max(...todosLosProductos.map(p => Number(p.precio) || 0));
    const slider = document.getElementById('filtroPrecio');
    slider.max = maxPrecio || 1000;
    slider.value = maxPrecio || 1000;
    document.getElementById('precioMaxLabel').textContent = '$' + (maxPrecio || 1000).toLocaleString();

    generarCategorias();
    aplicarFiltros();
  } catch (e) {
    console.error(e);
    document.getElementById('estadoCarga').innerHTML = `
      <i class="bi bi-exclamation-circle fs-1 text-danger d-block mb-2"></i>
      <p class="text-danger">No se pudieron cargar los productos. Verifica que el servidor esté corriendo.</p>
    `;
  }
}

// --- GENERAR CHECKBOXES DE CATEGORÍAS ---
function generarCategorias() {
  const categorias = [...new Set(
    todosLosProductos.map(p => p.categoria).filter(Boolean)
  )].sort();

  const contenedor = document.getElementById('listaCategorias');
  // Conservar el radio "Todas"
  const todasHtml = `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="categoria" id="cat-todas" value="" checked>
      <label class="form-check-label" for="cat-todas">Todas</label>
    </div>`;

  const cats = categorias.map((cat, i) => `
    <div class="form-check mb-2">
      <input class="form-check-input" type="radio" name="categoria" id="cat-${i}" value="${cat}">
      <label class="form-check-label" for="cat-${i}">${cat}</label>
    </div>`).join('');

  contenedor.innerHTML = todasHtml + cats;

  // Evento a los radios
  contenedor.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', aplicarFiltros);
  });
}

// --- APLICAR FILTROS Y RENDERIZAR ---
function aplicarFiltros() {
  const busqueda   = document.getElementById('buscador').value.toLowerCase().trim();
  const categoria  = document.querySelector('input[name="categoria"]:checked')?.value || '';
  const precioMax  = Number(document.getElementById('filtroPrecio').value);
  const orden      = document.getElementById('ordenar').value;

  let resultado = todosLosProductos.filter(p => {
    const coincideBusqueda =
      (p.nombre  || '').toLowerCase().includes(busqueda) ||
      (p.marca   || '').toLowerCase().includes(busqueda) ||
      (p.categoria || '').toLowerCase().includes(busqueda);

    const coincideCategoria = categoria === '' || p.categoria === categoria;
    const coincidePrecio    = Number(p.precio) <= precioMax;

    return coincideBusqueda && coincideCategoria && coincidePrecio;
  });

  // Ordenar
  resultado.sort((a, b) => {
    if (orden === 'precio_asc')  return Number(a.precio) - Number(b.precio);
    if (orden === 'precio_desc') return Number(b.precio) - Number(a.precio);
    if (orden === 'stock')       return Number(b.stock)  - Number(a.stock);
    return (a.nombre || '').localeCompare(b.nombre || ''); // nombre A-Z
  });

  renderizarProductos(resultado);
}

// --- RENDERIZAR GRID DE PRODUCTOS ---
function renderizarProductos(productos) {
  const grid       = document.getElementById('gridProductos');
  const carga      = document.getElementById('estadoCarga');
  const vacio      = document.getElementById('estadoVacio');
  const conteo     = document.getElementById('conteoProductos');

  carga.classList.add('d-none');
  conteo.textContent = productos.length;

  if (productos.length === 0) {
    grid.innerHTML = '';
    vacio.classList.remove('d-none');
    return;
  }

  vacio.classList.add('d-none');

  grid.innerHTML = productos.map(p => {
    const precio    = Number(p.precio)  || 0;
    const stock     = Number(p.stock)   || 0;
    const agotado   = stock === 0;
    const emoji     = getEmojiCategoria(p.categoria);

    return `
      <div class="col-sm-6 col-xl-4">
        <div class="product-card">
          <div class="product-img-wrap">${emoji}</div>
          <div class="product-body">
            <span class="product-categoria">${p.categoria || 'Sin categoría'}</span>
            <h6 class="product-nombre">${p.nombre || 'Sin nombre'}</h6>
            <span class="product-marca">${p.marca || ''}</span>
            <div class="d-flex align-items-center justify-content-between mt-1">
              <span class="product-precio">$${precio.toFixed(2)}</span>
              <span class="product-stock ${agotado ? 'agotado' : ''}">
                <i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>
                ${agotado ? 'Agotado' : `Stock: ${stock}`}
              </span>
            </div>
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

// --- EMOJI POR CATEGORÍA ---
function getEmojiCategoria(categoria) {
  if (!categoria) return '📦';
  const c = categoria.toLowerCase();
  if (c.includes('cerveza'))   return '🍺';
  if (c.includes('vino'))      return '🍷';
  if (c.includes('whisky') || c.includes('whiskey')) return '🥃';
  if (c.includes('vodka'))     return '🍸';
  if (c.includes('ron'))       return '🍹';
  if (c.includes('refresco') || c.includes('soda')) return '🥤';
  if (c.includes('agua'))      return '💧';
  if (c.includes('tequila'))   return '🌵';
  if (c.includes('mezcal'))    return '🌿';
  return '🍶';
}

// --- AGREGAR AL CARRITO ---
function agregarAlCarrito(id) {
  const producto = todosLosProductos.find(p => p.id === id);
  if (!producto) return;

  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id:       producto.id,
      nombre:   producto.nombre,
      precio:   Number(producto.precio),
      marca:    producto.marca,
      categoria: producto.categoria,
      cantidad: 1
    });
  }

  guardarCarrito();
  renderizarCarrito();
  actualizarBadge();
  abrirCarrito();
}

// --- RENDERIZAR CARRITO EN EL DRAWER ---
function renderizarCarrito() {
  const body = document.getElementById('carritoBody');

  if (carrito.length === 0) {
    body.innerHTML = `
      <p class="text-center text-muted mt-4">
        <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
        Tu carrito está vacío
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
        <div class="ci-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
        <div class="qty-control mt-1">
          <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
          <span style="font-size:0.875rem; font-weight:600;">${item.cantidad}</span>
          <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
          <button onclick="eliminarDelCarrito(${item.id})"
            style="margin-left:0.5rem; background:none; border:none; color:var(--danger); cursor:pointer; font-size:1rem;">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>`).join('');

  const subtotal = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  document.getElementById('subtotalVal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('totalVal').textContent    = '$' + subtotal.toFixed(2);
}

// --- CAMBIAR CANTIDAD ---
function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.id !== id);
  }
  guardarCarrito();
  renderizarCarrito();
  actualizarBadge();
}

// --- ELIMINAR DEL CARRITO ---
function eliminarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  guardarCarrito();
  renderizarCarrito();
  actualizarBadge();
}

// --- BADGE CONTADOR ---
function actualizarBadge() {
  const total = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  document.getElementById('carritoCount').textContent = total;
}

// --- GUARDAR EN LOCALSTORAGE ---
function guardarCarrito() {
  localStorage.setItem('carrito_expendio', JSON.stringify(carrito));
}

// --- ABRIR / CERRAR DRAWER ---
function abrirCarrito() {
  document.getElementById('carritoDrawer').classList.add('open');
  document.getElementById('carritoOverlay').classList.add('open');
}

function cerrarCarrito() {
  document.getElementById('carritoDrawer').classList.remove('open');
  document.getElementById('carritoOverlay').classList.remove('open');
}

// --- LIMPIAR FILTROS ---
function limpiarFiltros() {
  document.getElementById('buscador').value = '';
  document.querySelector('input[name="categoria"][value=""]').checked = true;
  const slider = document.getElementById('filtroPrecio');
  slider.value = slider.max;
  document.getElementById('precioMaxLabel').textContent = '$' + Number(slider.max).toLocaleString();
  document.getElementById('ordenar').value = 'nombre';
  aplicarFiltros();
}