document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formproductos');
  const tableBody = document.getElementById('tableBody');
  const btnCancel = document.getElementById('btnCancel');
  const idInput = document.getElementById('id');
  let isEditing = false;

  const fetchData = async () => {
    try {
      const res = await fetch('/api/productos');
      const data = await res.json();
      renderTable(data);
    } catch (e) { console.error(e); }
  };

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    data.forEach(item => {
      tableBody.innerHTML += `
        <tr>
          <td>${item.id}</td><td>${item.proveedor_id}</td><td>${item.categoria}</td><td>${item.codigo_barras}</td>
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
      proveedor_id: document.getElementById('proveedor_id').value,
      categoria: document.getElementById('categoria').value,
      codigo_barras: document.getElementById('codigo_barras').value,
      nombre: document.getElementById('nombre').value,
      descripcion: document.getElementById('descripcion').value,
      marca: document.getElementById('marca').value,
      unidad_medida: document.getElementById('unidad_medida').value,
      costo: document.getElementById('costo').value,
      precio: document.getElementById('precio').value,
      stock: document.getElementById('stock').value,
      stock_minimo: document.getElementById('stock_minimo').value,
      fecha_caducidad: document.getElementById('fecha_caducidad').value,
      activo: document.getElementById('activo').value
    };
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/productos/${obj.id}` : '/api/productos';
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
    if(item.proveedor_id !== null && item.proveedor_id !== undefined) {
      document.getElementById('proveedor_id').value = String(item.proveedor_id).split('T')[0];
    }
    if(item.categoria !== null && item.categoria !== undefined) {
      document.getElementById('categoria').value = String(item.categoria).split('T')[0];
    }
    if(item.codigo_barras !== null && item.codigo_barras !== undefined) {
      document.getElementById('codigo_barras').value = String(item.codigo_barras).split('T')[0];
    }
    if(item.nombre !== null && item.nombre !== undefined) {
      document.getElementById('nombre').value = String(item.nombre).split('T')[0];
    }
    if(item.descripcion !== null && item.descripcion !== undefined) {
      document.getElementById('descripcion').value = String(item.descripcion).split('T')[0];
    }
    if(item.marca !== null && item.marca !== undefined) {
      document.getElementById('marca').value = String(item.marca).split('T')[0];
    }
    if(item.unidad_medida !== null && item.unidad_medida !== undefined) {
      document.getElementById('unidad_medida').value = String(item.unidad_medida).split('T')[0];
    }
    if(item.costo !== null && item.costo !== undefined) {
      document.getElementById('costo').value = String(item.costo).split('T')[0];
    }
    if(item.precio !== null && item.precio !== undefined) {
      document.getElementById('precio').value = String(item.precio).split('T')[0];
    }
    if(item.stock !== null && item.stock !== undefined) {
      document.getElementById('stock').value = String(item.stock).split('T')[0];
    }
    if(item.stock_minimo !== null && item.stock_minimo !== undefined) {
      document.getElementById('stock_minimo').value = String(item.stock_minimo).split('T')[0];
    }
    if(item.fecha_caducidad !== null && item.fecha_caducidad !== undefined) {
      document.getElementById('fecha_caducidad').value = String(item.fecha_caducidad).split('T')[0];
    }
    if(item.activo !== null && item.activo !== undefined) {
      document.getElementById('activo').value = String(item.activo).split('T')[0];
    }
    btnCancel.classList.remove('d-none');
    document.getElementById('formTitle').innerText = 'Editar Registro';
  };

  window.deleteItem = async (id) => {
    if(confirm('¿Eliminar?')) {
      try {
        const res = await fetch(`/api/${'productos'}/${id}`, { method: 'DELETE' });
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