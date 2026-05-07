// =============================================
//  ADMIN-UTILS.JS — Utilidades compartidas para el Admin
// =============================================

/**
 * Muestra un toast de notificación en la esquina inferior derecha.
 * @param {string} mensaje - El texto a mostrar
 * @param {string} tipo - 'success', 'error', 'info', 'warning'
 */
function showToast(mensaje, tipo = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
  }

  const iconos = {
    'success': '<i class="bi bi-check-circle-fill text-success"></i>',
    'error': '<i class="bi bi-exclamation-triangle-fill text-danger"></i>',
    'info': '<i class="bi bi-info-circle-fill text-primary"></i>',
    'warning': '<i class="bi bi-exclamation-circle-fill text-warning"></i>'
  };

  const id = 'toast-' + Date.now();
  const toastHTML = `
    <div id="${id}" class="toast align-items-center bg-white shadow-lg border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2" style="font-weight: 500;">
          ${iconos[tipo] || iconos['info']}
          ${mensaje}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', toastHTML);
  const toastEl = document.getElementById(id);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

/** Formatea una fecha ISO a DD/MM/YYYY */
function formatFechaLocal(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-MX', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/** Formatea una moneda */
function formatDinero(numero) {
  return '$' + Number(numero || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
