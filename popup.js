// Elementos del DOM
const domainElement = document.getElementById('current-domain');
const cookieCountElement = document.getElementById('cookie-count');
const clearDomainBtn = document.getElementById('clear-domain');
const clearAllBtn = document.getElementById('clear-all');
const statusMessage = document.getElementById('status-message');
const cookiesToggle = document.getElementById('cookies-toggle');
const cookiesContainer = document.getElementById('cookies-container');
const cookiesList = document.getElementById('cookies-list');
const cookiesEmpty = document.getElementById('cookies-empty');

let currentDomain = '';
let currentUrl = '';
let currentCookies = [];

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
      cookieCountElement.textContent = '0';
      clearDomainBtn.disabled = true;
      showStatus('Las páginas del sistema no tienen cookies accesibles', 'warning');
      return;
    }

    const url = new URL(currentUrl);
    currentDomain = url.hostname;
    domainElement.textContent = currentDomain;

    await loadCookies();

  } catch (error) {
    console.error('Error al inicializar:', error);
    showStatus('Error al cargar la información', 'error');
  }
}

function isValidUrl(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}

// Cargar y mostrar cookies
async function loadCookies() {
  try {
    currentCookies = await chrome.cookies.getAll({ domain: currentDomain });
    cookieCountElement.textContent = currentCookies.length;
    renderCookiesList();
  } catch (error) {
    console.error('Error al cargar cookies:', error);
    cookieCountElement.textContent = '?';
  }
}

// Renderizar lista de cookies
function renderCookiesList() {
  cookiesList.innerHTML = '';
  
  if (currentCookies.length === 0) {
    cookiesEmpty.classList.add('show');
    return;
  }
  
  cookiesEmpty.classList.remove('show');
  
  // Ordenar cookies alfabéticamente por nombre
  const sortedCookies = [...currentCookies].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  
  sortedCookies.forEach((cookie, index) => {
    const cookieItem = document.createElement('div');
    cookieItem.className = 'cookie-item';
    cookieItem.dataset.index = index;
    
    // Truncar valor si es muy largo
    const displayValue = cookie.value.length > 40 
      ? cookie.value.substring(0, 40) + '...' 
      : cookie.value || '(vacío)';
    
    cookieItem.innerHTML = `
      <div class="cookie-info">
        <span class="cookie-name" title="${escapeHtml(cookie.name)}">${escapeHtml(cookie.name)}</span>
        <span class="cookie-value" title="${escapeHtml(cookie.value)}">${escapeHtml(displayValue)}</span>
      </div>
      <button class="cookie-delete" title="Eliminar cookie" data-name="${escapeHtml(cookie.name)}" data-domain="${escapeHtml(cookie.domain)}" data-path="${escapeHtml(cookie.path)}" data-secure="${cookie.secure}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    
    cookiesList.appendChild(cookieItem);
  });
  
  // Añadir event listeners a los botones de eliminar
  cookiesList.querySelectorAll('.cookie-delete').forEach(btn => {
    btn.addEventListener('click', handleDeleteCookie);
  });
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Manejar eliminación individual de cookie
async function handleDeleteCookie(e) {
  const btn = e.currentTarget;
  const cookieItem = btn.closest('.cookie-item');
  const name = btn.dataset.name;
  const domain = btn.dataset.domain;
  const path = btn.dataset.path;
  const secure = btn.dataset.secure === 'true';
  
  // Animación de eliminación
  cookieItem.classList.add('deleting');
  
  try {
    const protocol = secure ? 'https://' : 'http://';
    const cookieUrl = `${protocol}${domain.startsWith('.') ? domain.substring(1) : domain}${path}`;
    
    await chrome.cookies.remove({ url: cookieUrl, name: name });
    
    // Esperar a que termine la animación
    setTimeout(async () => {
      await loadCookies();
      showStatus(`Cookie "${name}" eliminada`, 'success');
    }, 200);
    
  } catch (error) {
    console.error('Error al eliminar cookie:', error);
    cookieItem.classList.remove('deleting');
    showStatus('Error al eliminar la cookie', 'error');
  }
}

// Toggle de la lista de cookies
cookiesToggle.addEventListener('click', () => {
  cookiesToggle.classList.toggle('expanded');
  cookiesContainer.classList.toggle('expanded');
});

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

    await loadCookies();
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

    await loadCookies();
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
