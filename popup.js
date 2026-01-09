// Elementos del DOM
const domainElement = document.getElementById('current-domain');
const cookieCountElement = document.getElementById('cookie-count');
const clearDomainBtn = document.getElementById('clear-domain');
const clearAllBtn = document.getElementById('clear-all');
const statusMessage = document.getElementById('status-message');

let currentDomain = '';
let currentUrl = '';

// Inicialización
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      showStatus('No se pudo obtener la página actual', 'error');
      return;
    }

    currentUrl = tab.url;
    
    if (!isValidUrl(currentUrl)) {
      domainElement.textContent = 'Página no compatible';
      cookieCountElement.textContent = '—';
      clearDomainBtn.disabled = true;
      showStatus('Las páginas del sistema no tienen cookies accesibles', 'warning');
      return;
    }

    const url = new URL(currentUrl);
    currentDomain = url.hostname;
    domainElement.textContent = currentDomain;

    await updateCookieCount();

  } catch (error) {
    console.error('Error al inicializar:', error);
    showStatus('Error al cargar la información', 'error');
  }
}

function isValidUrl(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}

async function updateCookieCount() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: currentDomain });
    cookieCountElement.textContent = cookies.length;
    cookieCountElement.classList.add('animate');
    setTimeout(() => cookieCountElement.classList.remove('animate'), 300);
  } catch (error) {
    console.error('Error al contar cookies:', error);
    cookieCountElement.textContent = '?';
  }
}

// Limpiar cookies del dominio actual
clearDomainBtn.addEventListener('click', async () => {
  if (!currentDomain) return;

  clearDomainBtn.disabled = true;
  const originalContent = clearDomainBtn.innerHTML;
  clearDomainBtn.innerHTML = `
    <svg class="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    Limpiando...
  `;

  try {
    const cookies = await chrome.cookies.getAll({ domain: currentDomain });
    
    if (cookies.length === 0) {
      showStatus('No hay cookies para eliminar', 'warning');
      clearDomainBtn.innerHTML = originalContent;
      clearDomainBtn.disabled = false;
      return;
    }

    let deletedCount = 0;

    for (const cookie of cookies) {
      const protocol = cookie.secure ? 'https://' : 'http://';
      const cookieUrl = `${protocol}${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
      
      try {
        await chrome.cookies.remove({ url: cookieUrl, name: cookie.name });
        deletedCount++;
      } catch (e) {
        console.warn(`No se pudo eliminar: ${cookie.name}`, e);
      }
    }

    await updateCookieCount();
    showStatus(`${deletedCount} cookie${deletedCount !== 1 ? 's' : ''} eliminada${deletedCount !== 1 ? 's' : ''}`, 'success');

  } catch (error) {
    console.error('Error:', error);
    showStatus('Error al eliminar cookies', 'error');
  }

  clearDomainBtn.innerHTML = originalContent;
  clearDomainBtn.disabled = false;
});

// Limpiar TODAS las cookies
clearAllBtn.addEventListener('click', async () => {
  if (!confirm('¿Eliminar TODAS las cookies de TODOS los sitios?\n\nEsto cerrará tu sesión en todos los sitios web.')) {
    return;
  }

  clearAllBtn.disabled = true;
  const originalContent = clearAllBtn.innerHTML;
  clearAllBtn.innerHTML = `
    <svg class="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    Limpiando...
  `;

  try {
    const allCookies = await chrome.cookies.getAll({});
    
    if (allCookies.length === 0) {
      showStatus('No hay cookies para eliminar', 'warning');
      clearAllBtn.innerHTML = originalContent;
      clearAllBtn.disabled = false;
      return;
    }

    let deletedCount = 0;

    for (const cookie of allCookies) {
      const protocol = cookie.secure ? 'https://' : 'http://';
      const cookieUrl = `${protocol}${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
      
      try {
        await chrome.cookies.remove({ url: cookieUrl, name: cookie.name });
        deletedCount++;
      } catch (e) {
        console.warn(`No se pudo eliminar: ${cookie.name}`, e);
      }
    }

    await updateCookieCount();
    showStatus(`${deletedCount} cookie${deletedCount !== 1 ? 's' : ''} eliminada${deletedCount !== 1 ? 's' : ''} en total`, 'success');

  } catch (error) {
    console.error('Error:', error);
    showStatus('Error al eliminar cookies', 'error');
  }

  clearAllBtn.innerHTML = originalContent;
  clearAllBtn.disabled = false;
});

function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type}`;
  
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3500);
}
