document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formproveedores');
  const tableBody = document.getElementById('tableBody');
  const btnCancel = document.getElementById('btnCancel');
  const idInput = document.getElementById('id');
  let isEditing = false;

  const fetchData = async () => {
    try {
      const res = await fetch('/api/proveedores');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error(e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    data.forEach(item => {
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td><td>${item.nombre_comercial}</td><td>${item.contacto_nombre}</td><td>${item.telefono}</td>
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
      nombre_comercial: document.getElementById('nombre_comercial').value,
      contacto_nombre: document.getElementById('contacto_nombre').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value,
      calle: document.getElementById('calle').value,
      numero: document.getElementById('numero').value,
      colonia: document.getElementById('colonia').value,
      ciudad: document.getElementById('ciudad').value,
      rfc: document.getElementById('rfc').value,
      dias_credito: document.getElementById('dias_credito').value,
      estatus: document.getElementById('estatus').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/proveedores/${obj.id}` : '/api/proveedores';
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
    if(item.nombre_comercial !== null && item.nombre_comercial !== undefined) {
      document.getElementById('nombre_comercial').value = String(item.nombre_comercial).split('T')[0];
    }
    if(item.contacto_nombre !== null && item.contacto_nombre !== undefined) {
      document.getElementById('contacto_nombre').value = String(item.contacto_nombre).split('T')[0];
    }
    if(item.telefono !== null && item.telefono !== undefined) {
      document.getElementById('telefono').value = String(item.telefono).split('T')[0];
    }
    if(item.email !== null && item.email !== undefined) {
      document.getElementById('email').value = String(item.email).split('T')[0];
    }
    if(item.calle !== null && item.calle !== undefined) {
      document.getElementById('calle').value = String(item.calle).split('T')[0];
    }
    if(item.numero !== null && item.numero !== undefined) {
      document.getElementById('numero').value = String(item.numero).split('T')[0];
    }
    if(item.colonia !== null && item.colonia !== undefined) {
      document.getElementById('colonia').value = String(item.colonia).split('T')[0];
    }
    if(item.ciudad !== null && item.ciudad !== undefined) {
      document.getElementById('ciudad').value = String(item.ciudad).split('T')[0];
    }
    if(item.rfc !== null && item.rfc !== undefined) {
      document.getElementById('rfc').value = String(item.rfc).split('T')[0];
    }
    if(item.dias_credito !== null && item.dias_credito !== undefined) {
      document.getElementById('dias_credito').value = String(item.dias_credito).split('T')[0];
    }
    if(item.estatus !== null && item.estatus !== undefined) {
      document.getElementById('estatus').value = String(item.estatus).split('T')[0];
    }
    btnCancel.classList.remove('d-none');
    document.getElementById('formTitle').innerText = 'Editar Registro';
  };

  window.deleteItem = async (id) => {
    if(confirm('¿Eliminar?')) {
      try {
        const res = await fetch(`/api/${'proveedores'}/${id}`, { method: 'DELETE' });
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