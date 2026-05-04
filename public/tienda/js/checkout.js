// =============================================
//   CHECKOUT.JS — Formulario y confirmación
// =============================================

let carrito = JSON.parse(localStorage.getItem('carrito_expendio')) || [];

document.addEventListener('DOMContentLoaded', () => {
  if (carrito.length === 0) {
    document.getElementById('pantallaVacia').classList.remove('d-none');
    document.getElementById('pantallaFormulario').classList.add('d-none');
    return;
  }
  renderizarResumen();
});

// --- RENDERIZAR RESUMEN LATERAL ---
function renderizarResumen() {
  const contenedor = document.getElementById('ckResumenItems');
  const subtotal   = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  contenedor.innerHTML = carrito.map(item => `
    <div class="cs-row">
      <span style="flex:1;">${item.nombre} <span class="badge bg-secondary ms-1">x${item.cantidad}</span></span>
      <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('ckSubtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('ckTotal').textContent    = '$' + subtotal.toFixed(2);
}

// --- VALIDAR FORMULARIO ---
function validarFormulario() {
  const nombre    = document.getElementById('ckNombre').value.trim();
  const apellido  = document.getElementById('ckApellido').value.trim();
  const telefono  = document.getElementById('ckTelefono').value.trim();
  const direccion = document.getElementById('ckDireccion').value.trim();
  const ciudad    = document.getElementById('ckCiudad').value.trim();

  if (!nombre)    return 'El nombre es obligatorio.';
  if (!apellido)  return 'El apellido es obligatorio.';
  if (!telefono)  return 'El teléfono es obligatorio.';
  if (!direccion) return 'La dirección es obligatoria.';
  if (!ciudad)    return 'La ciudad es obligatoria.';
  return null;
}

// --- CONFIRMAR PEDIDO ---
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

  const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
  const subtotal   = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const folio      = 'EXP-' + Date.now().toString().slice(-6);

  const datosCliente = {
    nombre:    document.getElementById('ckNombre').value.trim(),
    apellido:  document.getElementById('ckApellido').value.trim(),
    telefono:  document.getElementById('ckTelefono').value.trim(),
    email:     document.getElementById('ckEmail').value.trim(),
    direccion: document.getElementById('ckDireccion').value.trim(),
    colonia:   document.getElementById('ckColonia').value.trim(),
    ciudad:    document.getElementById('ckCiudad').value.trim(),
    estado:    document.getElementById('ckEstado').value.trim(),
    cp:        document.getElementById('ckCP').value.trim(),
  };

  try {
    const ventaPayload = {
      folio:        folio,
      metodo_pago:  metodoPago,
      subtotal:     subtotal,
      fecha_venta:  new Date().toISOString().split('T')[0],
      sucursal_id:  1,
      empleado_id:  1,
      cliente_id:   1,
    };

    await fetch('/api/ventas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(ventaPayload)
    });

  } catch (e) {
    console.warn('No se pudo registrar la venta en el servidor:', e.message);
  }

  mostrarConfirmacion(folio, metodoPago, subtotal);

  localStorage.removeItem('carrito_expendio');
  carrito = [];
}

// --- MOSTRAR CONFIRMACIÓN ---
function mostrarConfirmacion(folio, metodoPago, total) {
  document.getElementById('pantallaFormulario').classList.add('d-none');
  document.getElementById('pantallaConfirmacion').classList.remove('d-none');

  document.getElementById('ckFolio').textContent = 'Folio: ' + folio;
  document.getElementById('confirmMetodo').textContent = metodoPago;
  document.getElementById('confirmTotal').textContent  = '$' + total.toFixed(2);

  const contenedor = document.getElementById('confirmResumenItems');
  contenedor.innerHTML = JSON.parse(localStorage.getItem('carrito_expendio') || '[]').length === 0
    ? carrito.map(item => `
        <div class="cs-row">
          <span>${item.nombre} x${item.cantidad}</span>
          <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
        </div>`).join('') || '<p class="text-muted" style="font-size:0.85rem;">Productos adquiridos correctamente.</p>'
    : '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}