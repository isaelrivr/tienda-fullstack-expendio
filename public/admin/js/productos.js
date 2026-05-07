document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formproductos');
  const tableBody = document.getElementById('tableBody');
  const btnNuevo  = document.getElementById('btnNuevo');
  const btnCancel = document.getElementById('btnCancel');
  const seccion   = document.getElementById('seccionFormulario');
  const idInput   = document.getElementById('id');
  let isEditing        = false;
  let proveedoresCache = [];

  const nextId = async () => {
    const res  = await fetch('/api/next-id/productos');
    const data = await res.json();
    return data.nextId;
  };

  // ── Cargar proveedores en SELECT ─────────────────────────────────────────
  const loadProveedores = async () => {
    try {
      const res  = await fetch('/api/proveedores');
      proveedoresCache = await res.json();
      const sel  = document.getElementById('proveedor_id');
      sel.innerHTML = '<option value="">— Sin proveedor —</option>';
      proveedoresCache.forEach(p => {
        sel.innerHTML += `<option value="${p.id}">${p.nombre_comercial}</option>`;
      });
    } catch (e) { console.error('Error al cargar proveedores:', e); }
  };

  // ── Inicializar formulario nuevo ─────────────────────────────────────────
  const initNuevo = async () => {
    form.reset();
    isEditing = false;
    idInput.readOnly = true;
    idInput.value = await nextId();
    document.getElementById('activo').value      = '1';
    document.getElementById('stock').value       = '0';
    document.getElementById('stock_minimo').value = '5';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Producto';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nombre').focus();
  };

  // ── Cargar tabla ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch('/api/productos');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error('Error al cargar productos:', e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Sin registros aún</td></tr>';
      return;
    }
    data.forEach(item => {
      const estadoBadge = item.activo == 1
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
      const stockClass = item.stock <= (item.stock_minimo || 5)
        ? 'badge bg-danger'
        : 'badge bg-success';
      const precio = item.precio != null ? `$${Number(item.precio).toFixed(2)}` : '—';
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td>
          <td class="fw-semibold">${item.nombre ?? '—'}</td>
          <td><span class="badge bg-info text-dark">${item.categoria ?? '—'}</span></td>
          <td>${item.marca ?? '—'}</td>
          <td class="fw-bold text-success">${precio}</td>
          <td><span class="${stockClass}">${item.stock ?? 0}</span></td>
          <td>${estadoBadge}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick='editItem(${JSON.stringify(item).replace(/'/g, "\\'")})'>
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      id:              idInput.value,
      proveedor_id:    document.getElementById('proveedor_id').value || null,
      categoria:       document.getElementById('categoria').value,
      codigo_barras:   document.getElementById('codigo_barras').value,
      nombre:          document.getElementById('nombre').value,
      descripcion:     document.getElementById('descripcion').value,
      marca:           document.getElementById('marca').value,
      unidad_medida:   document.getElementById('unidad_medida').value,
      costo:           document.getElementById('costo').value,
      precio:          document.getElementById('precio').value,
      stock:           document.getElementById('stock').value,
      stock_minimo:    document.getElementById('stock_minimo').value,
      fecha_caducidad: document.getElementById('fecha_caducidad').value || null,
      activo:          document.getElementById('activo').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url    = isEditing ? `/api/productos/${obj.id}` : '/api/productos';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
      });
      if (!res.ok) {
        const err = await res.json();
        showToast('Error: ' + (err.message || 'Error del servidor'), 'error');
        return;
      }
      showToast(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`, 'success');
      resetForm();
      fetchData();
    } catch (e) { showToast('Error al guardar producto', 'error'); console.error(e); }
  });

  // ── Editar ────────────────────────────────────────────────────────────────
  window.editItem = (item) => {
    isEditing = true;
    idInput.readOnly = true;
    document.getElementById('id').value              = item.id              ?? '';
    document.getElementById('proveedor_id').value    = item.proveedor_id    ?? '';
    document.getElementById('categoria').value       = item.categoria       ?? '';
    document.getElementById('codigo_barras').value   = item.codigo_barras   ?? '';
    document.getElementById('nombre').value          = item.nombre          ?? '';
    document.getElementById('descripcion').value     = item.descripcion     ?? '';
    document.getElementById('marca').value           = item.marca           ?? '';
    document.getElementById('unidad_medida').value   = item.unidad_medida   ?? 'Pieza';
    document.getElementById('costo').value           = item.costo           ?? '';
    document.getElementById('precio').value          = item.precio          ?? '';
    document.getElementById('stock').value           = item.stock           ?? '0';
    document.getElementById('stock_minimo').value    = item.stock_minimo    ?? '5';
    document.getElementById('fecha_caducidad').value = item.fecha_caducidad ? String(item.fecha_caducidad).split('T')[0] : '';
    document.getElementById('activo').value          = item.activo != null ? String(item.activo) : '1';
    document.getElementById('formTitle').innerHTML   = '<i class="bi bi-pencil-square me-2"></i>Editar Producto';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  window.deleteItem = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        showToast('No se pudo eliminar: ' + (err.message || 'Error del servidor'), 'error');
      } else { 
        showToast('Producto eliminado', 'success');
        fetchData(); 
      }
    } catch (e) { showToast('Error de conexión al eliminar.', 'error'); }
  };

  const resetForm = () => {
    form.reset();
    isEditing = false;
    seccion.classList.add('d-none');
  };

  btnNuevo.addEventListener('click', initNuevo);
  btnCancel.addEventListener('click', resetForm);
  loadProveedores().then(fetchData);
});