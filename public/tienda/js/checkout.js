// =============================================
//   CHECKOUT.JS — Formulario y confirmación
// =============================================

let carrito = leerCarrito(); // desde carrito-utils.js
let carritoSnapshot = []; // copia antes de limpiar para mostrar en confirmación

document.addEventListener('DOMContentLoaded', () => {
  // Badge nav
  const badge = document.getElementById('carritoCount');
  if (badge) badge.textContent = carrito.reduce((a, i) => a + i.cantidad, 0);

  if (carrito.length === 0) {
    document.getElementById('pantallaVacia').classList.remove('d-none');
    document.getElementById('pantallaFormulario').classList.add('d-none');
    return;
  }
  renderizarResumen();
});

// ── Resumen lateral ───────────────────────────────────────────────────────────
function renderizarResumen() {
  const contenedor = document.getElementById('ckResumenItems');
  const subtotal   = calcularSubtotal(carrito);

  contenedor.innerHTML = carrito.map(item => `
    <div class="cs-row">
      <span style="flex:1;">${item.nombre} <span class="badge bg-secondary ms-1">x${item.cantidad}</span></span>
      <span>${formatPrecio(item.precio * item.cantidad)}</span>
    </div>
  `).join('');

  document.getElementById('ckSubtotal').textContent = formatPrecio(subtotal);
  document.getElementById('ckTotal').textContent    = formatPrecio(subtotal);
}

// ── Validación ────────────────────────────────────────────────────────────────
function validarFormulario() {
  const campos = [
    { id: 'ckNombre',    label: 'El nombre es obligatorio.' },
    { id: 'ckApellido',  label: 'El apellido es obligatorio.' },
    { id: 'ckTelefono',  label: 'El teléfono es obligatorio.' },
    { id: 'ckDireccion', label: 'La dirección es obligatoria.' },
    { id: 'ckCiudad',    label: 'La ciudad es obligatoria.' },
  ];
  for (const { id, label } of campos) {
    if (!document.getElementById(id).value.trim()) return label;
  }
  return null;
}

// ── Confirmar pedido ──────────────────────────────────────────────────────────
async function confirmarPedido() {
  const error    = validarFormulario();
  const errorDiv = document.getElementById('errorCheckout');
  const errorMsg = document.getElementById('errorMsg');

  if (error) {
    errorMsg.textContent = error;
    errorDiv.classList.remove('d-none');
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  errorDiv.classList.add('d-none');

  const btn = document.querySelector('button[onclick="confirmarPedido()"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...'; }

  const nombre   = document.getElementById('ckNombre').value.trim();
  const apellido = document.getElementById('ckApellido').value.trim();
  const telefono = document.getElementById('ckTelefono').value.trim();
  const email    = document.getElementById('ckEmail').value.trim();
  const colonia  = document.getElementById('ckColonia').value.trim();
  const ciudad   = document.getElementById('ckCiudad').value.trim();
  const estado   = document.getElementById('ckEstado').value.trim();
  const cp       = document.getElementById('ckCP').value.trim();
  const calle    = document.getElementById('ckDireccion').value.trim();

  const metodo   = document.querySelector('input[name="metodoPago"]:checked').value;
  const subtotal = calcularSubtotal(carrito);
  const folio    = 'EXP-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const hoy      = new Date().toISOString().split('T')[0];

  try {
    // 1. Buscar o crear el cliente
    let clienteId = null;
    try {
      const resBuscar = await fetch('/api/clientes');
      if (resBuscar.ok) {
        const clientes = await resBuscar.json();
        const existente = clientes.find(c =>
          (c.telefono && c.telefono === telefono) ||
          (email && c.email && c.email === email)
        );
        if (existente) {
          clienteId = existente.id;
        } else {
          // Crear cliente nuevo
          const resCrear = await fetch('/api/clientes', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre, apellido_paterno: apellido,
              telefono, email, calle, colonia, ciudad, estado,
              fecha_registro: hoy, puntos: 0
            })
          });
          if (resCrear.ok) {
            const data = await resCrear.json();
            clienteId = data.id;
          }
        }
      }
    } catch (e) { console.warn('No se pudo resolver cliente:', e.message); }

    // 2. Obtener primera sucursal y primer empleado activos
    let sucursalId = null;
    let empleadoId = null;
    try {
      const [resSuc, resEmp] = await Promise.all([
        fetch('/api/sucursales'),
        fetch('/api/empleados')
      ]);
      if (resSuc.ok) {
        const suc = await resSuc.json();
        sucursalId = suc[0]?.id ?? null;
      }
      if (resEmp.ok) {
        const emp = await resEmp.json();
        const activo = emp.find(e => e.estatus === 'Activo' && (!sucursalId || e.sucursal_id == sucursalId));
        empleadoId = activo?.id ?? emp[0]?.id ?? null;
      }
    } catch (e) { console.warn('No se pudo obtener sucursal/empleado:', e.message); }

    // 3. Registrar la venta
    const resVenta = await fetch('/api/ventas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folio, metodo_pago: metodo, subtotal,
        fecha_venta: hoy,
        sucursal_id: sucursalId,
        empleado_id: empleadoId,
        cliente_id:  clienteId,
        items: carrito
      })
    });

    if (!resVenta.ok) {
      const errVenta = await resVenta.json();
      throw new Error(errVenta.message || 'Error al registrar la venta en el servidor');
    }

  } catch (e) {
    console.warn('Error al registrar venta:', e.message);
    const errorDiv = document.getElementById('errorCheckout');
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = 'No se pudo procesar tu pedido: ' + e.message + '. Verifica que el sistema esté configurado (ej. sucursales activas).';
    errorDiv.classList.remove('d-none');
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const btn = document.querySelector('button[onclick="confirmarPedido()"]');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar Pedido';
    }
    return; // Evita limpiar el carrito y mostrar confirmación
  }

  // 4. Guardar snapshot y limpiar carrito
  carritoSnapshot = [...carrito];
  localStorage.removeItem(STORAGE_KEY);
  carrito = [];

  mostrarConfirmacion(folio, metodo, subtotal);
}

// ── Pantalla de confirmación ──────────────────────────────────────────────────
function mostrarConfirmacion(folio, metodo, total) {
  document.getElementById('pantallaFormulario').classList.add('d-none');
  document.getElementById('pantallaConfirmacion').classList.remove('d-none');

  document.getElementById('ckFolio').textContent       = 'Folio: ' + folio;
  document.getElementById('confirmMetodo').textContent = metodo;
  document.getElementById('confirmTotal').textContent  = formatPrecio(total);

  // Usar snapshot para mostrar los productos comprados
  document.getElementById('confirmResumenItems').innerHTML =
    carritoSnapshot.map(item => `
      <div class="cs-row">
        <span>${getEmojiCategoria(item.categoria)} ${item.nombre} <span class="badge bg-secondary ms-1">x${item.cantidad}</span></span>
        <span>${formatPrecio(item.precio * item.cantidad)}</span>
      </div>`).join('') ||
    '<p class="text-muted" style="font-size:0.85rem;">Productos adquiridos correctamente.</p>';

  // Badge del nav a 0
  const badge = document.getElementById('carritoCount');
  if (badge) badge.textContent = '0';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}