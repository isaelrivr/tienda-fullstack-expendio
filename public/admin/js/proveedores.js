document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('formproveedores');
  const tableBody = document.getElementById('tableBody');
  const btnNuevo  = document.getElementById('btnNuevo');
  const btnCancel = document.getElementById('btnCancel');
  const seccion   = document.getElementById('seccionFormulario');
  const idInput   = document.getElementById('id');
  let isEditing   = false;

  const nextId = async () => {
    const res  = await fetch('/api/next-id/proveedores');
    const data = await res.json();
    return data.nextId;
  };

  const initNuevo = async () => {
    form.reset();
    isEditing = false;
    idInput.readOnly = true;
    idInput.value = await nextId();
    document.getElementById('estatus').value     = 'Activo';
    document.getElementById('dias_credito').value = '30';
    document.getElementById('formTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Proveedor';
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('nombre_comercial').focus();
  };

  const fetchData = async () => {
    try {
      const res  = await fetch('/api/proveedores');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error('Error al cargar proveedores:', e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (!data.length) {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Sin registros aún</td></tr>';
      return;
    }
    data.forEach(item => {
      const estadoBadge = item.estatus === 'Activo'
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-danger">Inactivo</span>';
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td>
          <td class="fw-semibold">${item.nombre_comercial ?? '—'}</td>
          <td>${item.contacto_nombre ?? '—'}</td>
          <td>${item.telefono ?? '—'}</td>
          <td>${item.rfc ?? '—'}</td>
          <td>${item.dias_credito ?? '—'} días</td>
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      id:               idInput.value,
      nombre_comercial: document.getElementById('nombre_comercial').value,
      contacto_nombre:  document.getElementById('contacto_nombre').value,
      telefono:         document.getElementById('telefono').value,
      email:            document.getElementById('email').value,
      calle:            document.getElementById('calle').value,
      numero:           document.getElementById('numero').value,
      colonia:          document.getElementById('colonia').value,
      ciudad:           document.getElementById('ciudad').value,
      rfc:              document.getElementById('rfc').value,
      dias_credito:     document.getElementById('dias_credito').value,
      estatus:          document.getElementById('estatus').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url    = isEditing ? `/api/proveedores/${obj.id}` : '/api/proveedores';
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
      showToast(`Proveedor ${isEditing ? 'actualizado' : 'creado'} correctamente`, 'success');
      resetForm();
      fetchData();
    } catch (e) { showToast('Error al guardar proveedor', 'error'); console.error(e); }
  });

  window.editItem = (item) => {
    isEditing = true;
    idInput.readOnly = true;
    document.getElementById('id').value               = item.id               ?? '';
    document.getElementById('nombre_comercial').value = item.nombre_comercial ?? '';
    document.getElementById('contacto_nombre').value  = item.contacto_nombre  ?? '';
    document.getElementById('telefono').value         = item.telefono         ?? '';
    document.getElementById('email').value            = item.email            ?? '';
    document.getElementById('calle').value            = item.calle            ?? '';
    document.getElementById('numero').value           = item.numero           ?? '';
    document.getElementById('colonia').value          = item.colonia          ?? '';
    document.getElementById('ciudad').value           = item.ciudad           ?? '';
    document.getElementById('rfc').value              = item.rfc              ?? '';
    document.getElementById('dias_credito').value     = item.dias_credito     ?? '30';
    document.getElementById('estatus').value          = item.estatus          ?? 'Activo';
    document.getElementById('formTitle').innerHTML    = '<i class="bi bi-pencil-square me-2"></i>Editar Proveedor';
    if (item.calle || item.ciudad) {
      document.getElementById('colapseDireccion').classList.add('show');
    }
    seccion.classList.remove('d-none');
    seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.deleteItem = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try {
      const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        showToast('No se pudo eliminar: ' + (err.message || 'Error del servidor'), 'error');
      } else { 
        showToast('Proveedor eliminado', 'success');
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