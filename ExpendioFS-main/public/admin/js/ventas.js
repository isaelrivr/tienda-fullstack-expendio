document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formventas');
  const tableBody = document.getElementById('tableBody');
  const btnCancel = document.getElementById('btnCancel');
  const idInput = document.getElementById('id');
  let isEditing = false;

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ventas');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error(e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    data.forEach(item => {
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td><td>${item.sucursal_id}</td><td>${item.empleado_id}</td><td>${item.cliente_id}</td>
          <td>
            <button class="btn btn-sm btn-warning" onclick='editItem(${JSON.stringify(item).replace(/'/g, "\\'")})'>Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">Eliminar</button>
          </td>
        </tr>
      `;
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const obj = {
      id: document.getElementById('id').value,
      sucursal_id: document.getElementById('sucursal_id').value,
      empleado_id: document.getElementById('empleado_id').value,
      cliente_id: document.getElementById('cliente_id').value,
      folio: document.getElementById('folio').value,
      fecha_venta: document.getElementById('fecha_venta').value,
      metodo_pago: document.getElementById('metodo_pago').value,
      subtotal: document.getElementById('subtotal').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/ventas/${obj.id}` : '/api/ventas';
    try {
      await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(obj) });
      resetForm();
      fetchData();
    } catch (e) { console.error(e); }
  });

  window.editItem = (item) => {
    isEditing = true;
    idInput.readOnly = true;
    
    if(item.id !== null && item.id !== undefined) {
      document.getElementById('id').value = String(item.id).split('T')[0];
    }
    if(item.sucursal_id !== null && item.sucursal_id !== undefined) {
      document.getElementById('sucursal_id').value = String(item.sucursal_id).split('T')[0];
    }
    if(item.empleado_id !== null && item.empleado_id !== undefined) {
      document.getElementById('empleado_id').value = String(item.empleado_id).split('T')[0];
    }
    if(item.cliente_id !== null && item.cliente_id !== undefined) {
      document.getElementById('cliente_id').value = String(item.cliente_id).split('T')[0];
    }
    if(item.folio !== null && item.folio !== undefined) {
      document.getElementById('folio').value = String(item.folio).split('T')[0];
    }
    if(item.fecha_venta !== null && item.fecha_venta !== undefined) {
      document.getElementById('fecha_venta').value = String(item.fecha_venta).split('T')[0];
    }
    if(item.metodo_pago !== null && item.metodo_pago !== undefined) {
      document.getElementById('metodo_pago').value = String(item.metodo_pago).split('T')[0];
    }
    if(item.subtotal !== null && item.subtotal !== undefined) {
      document.getElementById('subtotal').value = String(item.subtotal).split('T')[0];
    }
    btnCancel.classList.remove('d-none');
    document.getElementById('formTitle').innerText = 'Editar Registro';
  };

  window.deleteItem = async (id) => {
    if(confirm('¿Eliminar?')) {
      try {
        const res = await fetch(`/api/${'ventas'}/${id}`, { method: 'DELETE' });
        if(!res.ok) {
           const errorData = await res.json();
           alert('No se pudo eliminar: ' + (errorData.message || 'Error del servidor'));
        } else {
           fetchData();
        }
      } catch(e) {
        alert('Error de conexión al eliminar.');
      }
    }
  };

  const resetForm = () => {
    form.reset();
    isEditing = false;
    idInput.readOnly = false;
    btnCancel.classList.add('d-none');
    document.getElementById('formTitle').innerText = 'Agregar Registro';
  };

  btnCancel.addEventListener('click', resetForm);
  fetchData();
});