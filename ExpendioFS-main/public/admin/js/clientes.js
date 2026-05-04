document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formclientes');
  const tableBody = document.getElementById('tableBody');
  const btnCancel = document.getElementById('btnCancel');
  const idInput = document.getElementById('id');
  let isEditing = false;

  const fetchData = async () => {
    try {
      const res = await fetch('/api/clientes');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error(e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    data.forEach(item => {
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td><td>${item.nombre}</td><td>${item.apellido_paterno}</td><td>${item.apellido_materno}</td>
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
      nombre: document.getElementById('nombre').value,
      apellido_paterno: document.getElementById('apellido_paterno').value,
      apellido_materno: document.getElementById('apellido_materno').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value,
      calle: document.getElementById('calle').value,
      numero: document.getElementById('numero').value,
      colonia: document.getElementById('colonia').value,
      ciudad: document.getElementById('ciudad').value,
      fecha_registro: document.getElementById('fecha_registro').value,
      puntos: document.getElementById('puntos').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/clientes/${obj.id}` : '/api/clientes';
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
    if(item.nombre !== null && item.nombre !== undefined) {
      document.getElementById('nombre').value = String(item.nombre).split('T')[0];
    }
    if(item.apellido_paterno !== null && item.apellido_paterno !== undefined) {
      document.getElementById('apellido_paterno').value = String(item.apellido_paterno).split('T')[0];
    }
    if(item.apellido_materno !== null && item.apellido_materno !== undefined) {
      document.getElementById('apellido_materno').value = String(item.apellido_materno).split('T')[0];
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
    if(item.fecha_registro !== null && item.fecha_registro !== undefined) {
      document.getElementById('fecha_registro').value = String(item.fecha_registro).split('T')[0];
    }
    if(item.puntos !== null && item.puntos !== undefined) {
      document.getElementById('puntos').value = String(item.puntos).split('T')[0];
    }
    btnCancel.classList.remove('d-none');
    document.getElementById('formTitle').innerText = 'Editar Registro';
  };

  window.deleteItem = async (id) => {
    if(confirm('¿Eliminar?')) {
      try {
        const res = await fetch(`/api/${'clientes'}/${id}`, { method: 'DELETE' });
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