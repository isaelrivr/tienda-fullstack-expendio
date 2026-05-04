document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formempleados');
  const tableBody = document.getElementById('tableBody');
  const btnCancel = document.getElementById('btnCancel');
  const idInput = document.getElementById('id');
  let isEditing = false;

  const fetchData = async () => {
    try {
      const res = await fetch('/api/empleados');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error(e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    data.forEach(item => {
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td><td>${item.sucursal_id}</td><td>${item.nombre}</td><td>${item.apellido_paterno}</td>
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
      nombre: document.getElementById('nombre').value,
      apellido_paterno: document.getElementById('apellido_paterno').value,
      apellido_materno: document.getElementById('apellido_materno').value,
      puesto: document.getElementById('puesto').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value,
      fecha_ingreso: document.getElementById('fecha_ingreso').value,
      salario: document.getElementById('salario').value,
      turno: document.getElementById('turno').value,
      estatus: document.getElementById('estatus').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/empleados/${obj.id}` : '/api/empleados';
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
    if(item.nombre !== null && item.nombre !== undefined) {
      document.getElementById('nombre').value = String(item.nombre).split('T')[0];
    }
    if(item.apellido_paterno !== null && item.apellido_paterno !== undefined) {
      document.getElementById('apellido_paterno').value = String(item.apellido_paterno).split('T')[0];
    }
    if(item.apellido_materno !== null && item.apellido_materno !== undefined) {
      document.getElementById('apellido_materno').value = String(item.apellido_materno).split('T')[0];
    }
    if(item.puesto !== null && item.puesto !== undefined) {
      document.getElementById('puesto').value = String(item.puesto).split('T')[0];
    }
    if(item.telefono !== null && item.telefono !== undefined) {
      document.getElementById('telefono').value = String(item.telefono).split('T')[0];
    }
    if(item.email !== null && item.email !== undefined) {
      document.getElementById('email').value = String(item.email).split('T')[0];
    }
    if(item.fecha_ingreso !== null && item.fecha_ingreso !== undefined) {
      document.getElementById('fecha_ingreso').value = String(item.fecha_ingreso).split('T')[0];
    }
    if(item.salario !== null && item.salario !== undefined) {
      document.getElementById('salario').value = String(item.salario).split('T')[0];
    }
    if(item.turno !== null && item.turno !== undefined) {
      document.getElementById('turno').value = String(item.turno).split('T')[0];
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
        const res = await fetch(`/api/${'empleados'}/${id}`, { method: 'DELETE' });
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