document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formventas');
  const tableBody = document.getElementById('tableBody');
  const btnNuevo  = document.getElementById('btnNuevo');
  const btnCancel = document.getElementById('btnCancel');
  const seccion   = document.getElementById('seccionFormulario');
  let isEditing        = false;
  let sucursalesCache  = [];
  let empleadosCache   = [];
  let clientesCache    = [];

  const today  = () => new Date().toISOString().split('T')[0];
  const nextId = async () => {
    const res  = await fetch('/api/next-id/ventas');
    const data = await res.json();
    return data.nextId;
  };
  const genFolio = (id) => {
    const d = new Date();
    const yyyymmdd = d.toISOString().split('T')[0].replace(/-/g, '');
    return `VTA-${yyyymmdd}-${String(id).padStart(4,'0')}`;
  };

  // ── Cargar selects relacionales ──────────────────────────────────────────
  const loadSelects = async () => {
    try {
      const [resSuc, resEmp, resCli] = await Promise.all([
        fetch('/api/sucursales'),
        fetch('/api/empleados'),
        fetch('/api/clientes')
      ]);
      sucursalesCache = await resSuc.json();
      empleadosCache  = await resEmp.json();
      clientesCache   = await resCli.json();

      // Sucursales
      const selSuc = document.getElementById('sucursal_id');
      selSuc.innerHTML = '<option value="">— Selecciona sucursal —</option>';
      sucursalesCache.forEach(s => {
        selSuc.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
      });

      // Clientes
      const selCli = document.getElementById('cliente_id');
      selCli.innerHTML = '<option value="">— Cliente general —</option>';
      clientesCache.forEach(c => {
        const nombre = [c.nombre, c.apellido_paterno].filter(Boolean).join(' ');
        selCli.innerHTML += `<option value="${c.id}">${nombre}</option>`;
      });
    } catch (e) { console.error('Error al cargar datos relacionales:', e); }
  };

  // ── Filtrar empleados según sucursal seleccionada ────────────────────────
  document.getElementById('sucursal_id').addEventListener('change', function () {
    const sucId = parseInt(this.value);
    const selEmp = document.getElementById('empleado_id');
    selEmp.innerHTML = '<option value="">— Selecciona empleado —</option>';
    const filtrados = sucId
      ? empleadosCache.filter(e => e.sucursal_id == sucId && e.estatus === 'Activo')
      : empleadosCache;
    filtrados.forEach(e => {
      const nombre = [e.nombre, e.apellido_paterno].filter(Boolean).join(' ');
      selEmp.innerHTML += `<option value="${e.id}">${nombre} (${e.puesto ?? ''})</option>`;
    });
  });

  // ── Inicializar formulario nuevo ─────────────────────────────────────────
  const initNuevo = async () => {
    form.reset();
    isEditing = false;
    document.getElementById('id').value = '';
    const newId = await nextId();
    document.getElementById('id').value          = newId;
    document.getElementById('folio').value        = genFolio(newId);
    document.getElementById('fecha_venta').value  = today();
    document.getElementById('metodo_pago').value  = 'Efectivo';
    // Repoblar selects
    const selSuc = document.getElementById('sucursal_id');
    selSuc.innerHTML = '<option value="">— Selecciona sucursal —</option>';
    sucursalesCache.forEach(s => { selSuc.innerHTML += `<option value="${s.id}">${s.nombre}</option>`; });
    const selCli = document.getElementById('cliente_id');
    selCli.innerHTML = '<option value="">— Cliente general —</option>';
    clientesCache.forEach(c => {
      const nombre = [c.nombre, c.apellido_paterno].filter(Boolean).join(' ');
      selCli.innerHTML += `<option value="${c.id}">${nombre}</option>`;
    });
    document.getElementById('empleado_id').innerHTML = '<option value="">— Primero selecciona sucursal —</option>';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nueva Venta';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('sucursal_id').focus();
  };

  // ── Cargar tabla ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch('/api/ventas');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error('Error al cargar ventas:', e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Sin ventas registradas aún</td></tr>';
      return;
    }
    data.forEach(item => {
      const sucName = sucursalesCache.find(s => s.id == item.sucursal_id)?.nombre ?? `#${item.sucursal_id}`;
      const empItem = empleadosCache.find(e => e.id == item.empleado_id);
      const empName = empItem ? [empItem.nombre, empItem.apellido_paterno].filter(Boolean).join(' ') : `#${item.empleado_id}`;
      const cliItem = clientesCache.find(c => c.id == item.cliente_id);
      const cliName = cliItem ? [cliItem.nombre, cliItem.apellido_paterno].filter(Boolean).join(' ') : (item.cliente_id ? `#${item.cliente_id}` : 'General');
      const fechaStr = item.fecha_venta ? String(item.fecha_venta).split('T')[0] : '—';
      const subtotal = item.subtotal != null ? `$${Number(item.subtotal).toFixed(2)}` : '—';
      const metodoBadge = { Efectivo: 'bg-success', Tarjeta: 'bg-primary', Transferencia: 'bg-info text-dark' };
      const badgeClass = metodoBadge[item.metodo_pago] || 'bg-secondary';
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td>
          <td class="fw-semibold">${item.folio ?? '—'}</td>
          <td>${fechaStr}</td>
          <td><span class="badge bg-secondary">${sucName}</span></td>
          <td>${empName}</td>
          <td>${cliName}</td>
          <td><span class="badge ${badgeClass}">${item.metodo_pago ?? '—'}</span></td>
          <td class="fw-bold text-success">${subtotal}</td>
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
      id:          document.getElementById('id').value,
      sucursal_id: document.getElementById('sucursal_id').value || null,
      empleado_id: document.getElementById('empleado_id').value || null,
      cliente_id:  document.getElementById('cliente_id').value  || null,
      folio:       document.getElementById('folio').value,
      fecha_venta: document.getElementById('fecha_venta').value,
      metodo_pago: document.getElementById('metodo_pago').value,
      subtotal:    document.getElementById('subtotal').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url    = isEditing ? `/api/ventas/${obj.id}` : '/api/ventas';
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
      showToast(`Venta ${isEditing ? 'actualizada' : 'creada'} correctamente`, 'success');
      resetForm();
      fetchData();
    } catch (e) { showToast('Error al guardar venta', 'error'); console.error(e); }
  });

  // ── Editar ────────────────────────────────────────────────────────────────
  window.editItem = (item) => {
    isEditing = true;
    document.getElementById('id').value          = item.id          ?? '';
    document.getElementById('folio').value       = item.folio       ?? '';
    document.getElementById('fecha_venta').value = item.fecha_venta ? String(item.fecha_venta).split('T')[0] : '';
    document.getElementById('metodo_pago').value = item.metodo_pago ?? 'Efectivo';
    document.getElementById('subtotal').value    = item.subtotal    ?? '';
    document.getElementById('sucursal_id').value = item.sucursal_id ?? '';
    document.getElementById('cliente_id').value  = item.cliente_id  ?? '';
    // Poblar empleados de esa sucursal y seleccionar
    const selEmp = document.getElementById('empleado_id');
    selEmp.innerHTML = '<option value="">— Selecciona empleado —</option>';
    const filtrados = item.sucursal_id
      ? empleadosCache.filter(e => e.sucursal_id == item.sucursal_id)
      : empleadosCache;
    filtrados.forEach(e => {
      const nombre = [e.nombre, e.apellido_paterno].filter(Boolean).join(' ');
      selEmp.innerHTML += `<option value="${e.id}">${nombre}</option>`;
    });
    selEmp.value = item.empleado_id ?? '';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar Venta';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  window.deleteItem = async (id) => {
    if (!confirm('¿Eliminar esta venta?')) return;
    try {
      const res = await fetch(`/api/ventas/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        showToast('No se pudo eliminar: ' + (err.message || 'Error del servidor'), 'error');
      } else { 
        showToast('Venta eliminada', 'success');
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
  loadSelects().then(fetchData);
});