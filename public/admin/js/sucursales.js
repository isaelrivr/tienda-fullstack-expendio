document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formsucursales');
  const tableBody = document.getElementById('tableBody');
  const btnNuevo  = document.getElementById('btnNuevo');
  const btnCancel = document.getElementById('btnCancel');
  const seccion   = document.getElementById('seccionFormulario');
  const idInput   = document.getElementById('id');
  let isEditing   = false;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const today = () => new Date().toISOString().split('T')[0];

  const nextId = async () => {
    const res = await fetch('/api/next-id/sucursales');
    const data = await res.json();
    return data.nextId;
  };

  // ── Inicializar formulario nuevo ─────────────────────────────────────────
  const initNuevo = async () => {
    form.reset();
    isEditing = false;
    idInput.readOnly = true;
    idInput.value = await nextId();
    document.getElementById('fecha_apertura').value = today();
    document.getElementById('activa').value = '1';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nueva Sucursal';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nombre').focus();
  };

  // ── Cargar y renderizar tabla ────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch('/api/sucursales');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error('Error al cargar sucursales:', e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Sin registros aún</td></tr>';
      return;
    }
    data.forEach(item => {
      const estadoBadge = item.activa == 1
        ? '<span class="badge bg-success">Activa</span>'
        : '<span class="badge bg-danger">Inactiva</span>';
      const fechaStr = item.fecha_apertura ? String(item.fecha_apertura).split('T')[0] : '—';
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td>
          <td class="fw-semibold">${item.nombre ?? '—'}</td>
          <td>${item.ciudad ?? '—'}</td>
          <td>${item.telefono ?? '—'}</td>
          <td>${item.email ?? '—'}</td>
          <td>${fechaStr}</td>
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
      id:             idInput.value,
      nombre:         document.getElementById('nombre').value,
      telefono:       document.getElementById('telefono').value,
      email:          document.getElementById('email').value,
      calle:          document.getElementById('calle').value,
      numero:         document.getElementById('numero').value,
      colonia:        document.getElementById('colonia').value,
      ciudad:         document.getElementById('ciudad').value,
      estado:         document.getElementById('estado').value,
      codigo_postal:  document.getElementById('codigo_postal').value,
      fecha_apertura: document.getElementById('fecha_apertura').value,
      activa:         document.getElementById('activa').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url    = isEditing ? `/api/sucursales/${obj.id}` : '/api/sucursales';
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
      showToast(`Sucursal ${isEditing ? 'actualizada' : 'creada'} correctamente`, 'success');
      resetForm();
      fetchData();
    } catch (e) { showToast('Error al guardar sucursal', 'error'); console.error(e); }
  });

  // ── Editar ────────────────────────────────────────────────────────────────
  window.editItem = (item) => {
    isEditing = true;
    idInput.readOnly = true;
    document.getElementById('id').value             = item.id             ?? '';
    document.getElementById('nombre').value         = item.nombre         ?? '';
    document.getElementById('telefono').value       = item.telefono       ?? '';
    document.getElementById('email').value          = item.email          ?? '';
    document.getElementById('calle').value          = item.calle          ?? '';
    document.getElementById('numero').value         = item.numero         ?? '';
    document.getElementById('colonia').value        = item.colonia        ?? '';
    document.getElementById('ciudad').value         = item.ciudad         ?? '';
    document.getElementById('estado').value         = item.estado         ?? '';
    document.getElementById('codigo_postal').value  = item.codigo_postal  ?? '';
    document.getElementById('fecha_apertura').value = item.fecha_apertura ? String(item.fecha_apertura).split('T')[0] : '';
    document.getElementById('activa').value         = item.activa != null ? String(item.activa) : '1';
    document.getElementById('formTitle').innerHTML  = '<i class="bi bi-pencil-square me-2"></i>Editar Sucursal';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  window.deleteItem = async (id) => {
    if (!confirm('¿Eliminar esta sucursal?')) return;
    try {
      const res = await fetch(`/api/sucursales/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        showToast('No se pudo eliminar: ' + (err.message || 'Error del servidor'), 'error');
      } else { 
        showToast('Sucursal eliminada', 'success');
        fetchData(); 
      }
    } catch (e) { showToast('Error de conexión al eliminar.', 'error'); }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetForm = () => {
    form.reset();
    isEditing = false;
    seccion.classList.add('d-none');
  };

  btnNuevo.addEventListener('click', initNuevo);
  btnCancel.addEventListener('click', resetForm);
  fetchData();
});