document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formclientes');
  const tableBody = document.getElementById('tableBody');
  const btnNuevo  = document.getElementById('btnNuevo');
  const btnCancel = document.getElementById('btnCancel');
  const seccion   = document.getElementById('seccionFormulario');
  const idInput   = document.getElementById('id');
  let isEditing   = false;

  const today  = () => new Date().toISOString().split('T')[0];
  const nextId = async () => {
    const res  = await fetch('/api/next-id/clientes');
    const data = await res.json();
    return data.nextId;
  };

  // ── Inicializar formulario nuevo ─────────────────────────────────────────
  const initNuevo = async () => {
    form.reset();
    isEditing = false;
    idInput.readOnly = true;
    idInput.value = await nextId();
    document.getElementById('fecha_registro').value = today();
    document.getElementById('puntos').value = '0';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Cliente';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nombre').focus();
  };

  // ── Cargar tabla ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const res  = await fetch('/api/clientes');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error('Error al cargar clientes:', e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Sin registros aún</td></tr>';
      return;
    }
    data.forEach(item => {
      const nombre   = [item.nombre, item.apellido_paterno, item.apellido_materno].filter(Boolean).join(' ');
      const fechaStr = item.fecha_registro ? String(item.fecha_registro).split('T')[0] : '—';
      const puntosBadge = item.puntos > 0
        ? `<span class="badge bg-warning text-dark">⭐ ${item.puntos}</span>`
        : `<span class="badge bg-secondary">0</span>`;
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td>
          <td class="fw-semibold">${nombre || '—'}</td>
          <td>${item.telefono ?? '—'}</td>
          <td>${item.email ?? '—'}</td>
          <td>${item.ciudad ?? '—'}</td>
          <td>${puntosBadge}</td>
          <td>${fechaStr}</td>
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
      nombre:           document.getElementById('nombre').value,
      apellido_paterno: document.getElementById('apellido_paterno').value,
      apellido_materno: document.getElementById('apellido_materno').value,
      telefono:         document.getElementById('telefono').value,
      email:            document.getElementById('email').value,
      calle:            document.getElementById('calle').value,
      numero:           document.getElementById('numero').value,
      colonia:          document.getElementById('colonia').value,
      ciudad:           document.getElementById('ciudad').value,
      fecha_registro:   document.getElementById('fecha_registro').value,
      puntos:           document.getElementById('puntos').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url    = isEditing ? `/api/clientes/${obj.id}` : '/api/clientes';
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
      showToast(`Cliente ${isEditing ? 'actualizado' : 'creado'} correctamente`, 'success');
      resetForm();
      fetchData();
    } catch (e) { showToast('Error al guardar cliente', 'error'); console.error(e); }
  });

  // ── Editar ────────────────────────────────────────────────────────────────
  window.editItem = (item) => {
    isEditing = true;
    idInput.readOnly = true;
    document.getElementById('id').value               = item.id               ?? '';
    document.getElementById('nombre').value           = item.nombre           ?? '';
    document.getElementById('apellido_paterno').value = item.apellido_paterno ?? '';
    document.getElementById('apellido_materno').value = item.apellido_materno ?? '';
    document.getElementById('telefono').value         = item.telefono         ?? '';
    document.getElementById('email').value            = item.email            ?? '';
    document.getElementById('calle').value            = item.calle            ?? '';
    document.getElementById('numero').value           = item.numero           ?? '';
    document.getElementById('colonia').value          = item.colonia          ?? '';
    document.getElementById('ciudad').value           = item.ciudad           ?? '';
    document.getElementById('fecha_registro').value   = item.fecha_registro   ? String(item.fecha_registro).split('T')[0] : '';
    document.getElementById('puntos').value           = item.puntos           ?? '0';
    document.getElementById('formTitle').innerHTML    = '<i class="bi bi-pencil-square me-2"></i>Editar Cliente';
    // Abrir sección dirección si tiene datos
    if (item.calle || item.ciudad) {
      document.getElementById('colapseDireccion').classList.add('show');
    }
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  window.deleteItem = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        showToast('No se pudo eliminar: ' + (err.message || 'Error del servidor'), 'error');
      } else { 
        showToast('Cliente eliminado', 'success');
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
  fetchData();
});