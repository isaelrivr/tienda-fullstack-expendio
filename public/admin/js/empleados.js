document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formempleados');
  const tableBody = document.getElementById('tableBody');
  const btnNuevo  = document.getElementById('btnNuevo');
  const btnCancel = document.getElementById('btnCancel');
  const seccion   = document.getElementById('seccionFormulario');
  const idInput   = document.getElementById('id');
  let isEditing   = false;
  let sucursalesCache = []; // cache para mostrar nombres en tabla

  const today  = () => new Date().toISOString().split('T')[0];
  const nextId = async () => {
    const res  = await fetch('/api/next-id/empleados');
    const data = await res.json();
    return data.nextId;
  };

  // ── Cargar sucursales en el SELECT ───────────────────────────────────────
  const loadSucursales = async () => {
    try {
      const res  = await fetch('/api/sucursales');
      sucursalesCache = await res.json();
      const sel  = document.getElementById('sucursal_id');
      sel.innerHTML = '<option value="">— Selecciona sucursal —</option>';
      sucursalesCache.forEach(s => {
        sel.innerHTML += `<option value="${s.id}">${s.nombre}</option>`;
      });
    } catch (e) { console.error('Error al cargar sucursales:', e); }
  };

  // ── Inicializar formulario nuevo ─────────────────────────────────────────
  const initNuevo = async () => {
    form.reset();
    isEditing = false;
    idInput.readOnly = true;
    idInput.value = await nextId();
    document.getElementById('fecha_ingreso').value = today();
    document.getElementById('estatus').value = 'Activo';
    document.getElementById('turno').value   = 'Matutino';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Empleado';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nombre').focus();
  };

  // ── Cargar tabla ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch('/api/empleados');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error('Error al cargar empleados:', e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Sin registros aún</td></tr>';
      return;
    }
    data.forEach(item => {
      const nombre  = [item.nombre, item.apellido_paterno].filter(Boolean).join(' ');
      const sucName = sucursalesCache.find(s => s.id == item.sucursal_id)?.nombre ?? `ID ${item.sucursal_id}`;
      const statusColors = { Activo: 'bg-success', Inactivo: 'bg-danger', Vacaciones: 'bg-warning text-dark', Baja: 'bg-secondary' };
      const statusClass = statusColors[item.estatus] || 'bg-secondary';
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td>
          <td class="fw-semibold">${nombre || '—'}</td>
          <td><span class="badge bg-info text-dark">${sucName}</span></td>
          <td>${item.puesto ?? '—'}</td>
          <td>${item.turno ?? '—'}</td>
          <td>${item.telefono ?? '—'}</td>
          <td><span class="badge ${statusClass}">${item.estatus ?? '—'}</span></td>
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
      id:               idInput.value,
      sucursal_id:      document.getElementById('sucursal_id').value,
      nombre:           document.getElementById('nombre').value,
      apellido_paterno: document.getElementById('apellido_paterno').value,
      apellido_materno: document.getElementById('apellido_materno').value,
      puesto:           document.getElementById('puesto').value,
      telefono:         document.getElementById('telefono').value,
      email:            document.getElementById('email').value,
      fecha_ingreso:    document.getElementById('fecha_ingreso').value,
      salario:          document.getElementById('salario').value,
      turno:            document.getElementById('turno').value,
      estatus:          document.getElementById('estatus').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url    = isEditing ? `/api/empleados/${obj.id}` : '/api/empleados';
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
      showToast(`Empleado ${isEditing ? 'actualizado' : 'creado'} correctamente`, 'success');
      resetForm();
      fetchData();
    } catch (e) { showToast('Error al guardar empleado', 'error'); console.error(e); }
  });

  // ── Editar ────────────────────────────────────────────────────────────────
  window.editItem = (item) => {
    isEditing = true;
    idInput.readOnly = true;
    document.getElementById('id').value               = item.id               ?? '';
    document.getElementById('sucursal_id').value      = item.sucursal_id      ?? '';
    document.getElementById('nombre').value           = item.nombre           ?? '';
    document.getElementById('apellido_paterno').value = item.apellido_paterno ?? '';
    document.getElementById('apellido_materno').value = item.apellido_materno ?? '';
    document.getElementById('puesto').value           = item.puesto           ?? '';
    document.getElementById('telefono').value         = item.telefono         ?? '';
    document.getElementById('email').value            = item.email            ?? '';
    document.getElementById('fecha_ingreso').value    = item.fecha_ingreso ? String(item.fecha_ingreso).split('T')[0] : '';
    document.getElementById('salario').value          = item.salario          ?? '';
    document.getElementById('turno').value            = item.turno            ?? 'Matutino';
    document.getElementById('estatus').value          = item.estatus          ?? 'Activo';
    document.getElementById('formTitle').innerHTML    = '<i class="bi bi-pencil-square me-2"></i>Editar Empleado';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  window.deleteItem = async (id) => {
    if (!confirm('¿Eliminar este empleado?')) return;
    try {
      const res = await fetch(`/api/empleados/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        showToast('No se pudo eliminar: ' + (err.message || 'Error del servidor'), 'error');
      } else { 
        showToast('Empleado eliminado', 'success');
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

  // Cargar sucursales primero, luego tabla
  loadSucursales().then(fetchData);
});