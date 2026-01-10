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

// Base de datos de cookies conocidas con descripciones
const cookieDatabase = {
  // Google Analytics
  '_ga': { desc: 'Google Analytics', info: 'Identificador único de usuario para estadísticas' },
  '_gid': { desc: 'Google Analytics', info: 'Identificador de sesión (24h)' },
  '_gat': { desc: 'Google Analytics', info: 'Limita la tasa de solicitudes' },
  '_ga_': { desc: 'Google Analytics 4', info: 'Estado de sesión y métricas', partial: true },
  '__utma': { desc: 'Google Analytics (legacy)', info: 'Identificador de visitante único' },
  '__utmb': { desc: 'Google Analytics (legacy)', info: 'Sesión actual del usuario' },
  '__utmc': { desc: 'Google Analytics (legacy)', info: 'Interoperabilidad con urchin.js' },
  '__utmz': { desc: 'Google Analytics (legacy)', info: 'Fuente de tráfico y navegación' },
  
  // Facebook
  '_fbp': { desc: 'Facebook Pixel', info: 'Seguimiento de conversiones y anuncios' },
  '_fbc': { desc: 'Facebook Click ID', info: 'Atribución de clics en anuncios' },
  'fr': { desc: 'Facebook', info: 'Publicidad y seguimiento entre sitios' },
  
  // Advertising & Tracking
  '_gcl_au': { desc: 'Google Ads', info: 'Conversión de enlaces de anuncios' },
  'IDE': { desc: 'Google DoubleClick', info: 'Publicidad personalizada' },
  'NID': { desc: 'Google', info: 'Preferencias y publicidad' },
  '__gads': { desc: 'Google AdSense', info: 'Medición de interacción con anuncios' },
  '_uetsid': { desc: 'Microsoft Bing Ads', info: 'Seguimiento de sesión' },
  '_uetvid': { desc: 'Microsoft Bing Ads', info: 'Seguimiento entre sesiones' },
  
  // Session & Auth
  'session': { desc: 'Sesión', info: 'Datos de tu sesión actual' },
  'sessionid': { desc: 'Sesión', info: 'Identificador de sesión' },
  'session_id': { desc: 'Sesión', info: 'Identificador de sesión' },
  'PHPSESSID': { desc: 'Sesión PHP', info: 'Identificador de sesión del servidor' },
  'JSESSIONID': { desc: 'Sesión Java', info: 'Identificador de sesión del servidor' },
  'ASP.NET_SessionId': { desc: 'Sesión .NET', info: 'Identificador de sesión del servidor' },
  'connect.sid': { desc: 'Sesión Node.js', info: 'Identificador de sesión Express' },
  'auth': { desc: 'Autenticación', info: 'Estado de inicio de sesión' },
  'auth_token': { desc: 'Autenticación', info: 'Token de acceso' },
  'access_token': { desc: 'Autenticación', info: 'Token de acceso OAuth' },
  'refresh_token': { desc: 'Autenticación', info: 'Token para renovar sesión' },
  'token': { desc: 'Autenticación', info: 'Token de acceso' },
  'jwt': { desc: 'Autenticación JWT', info: 'JSON Web Token' },
  'remember_me': { desc: 'Autenticación', info: 'Mantener sesión iniciada' },
  'logged_in': { desc: 'Autenticación', info: 'Estado de login' },
  
  // Preferences
  'lang': { desc: 'Preferencia', info: 'Idioma seleccionado' },
  'language': { desc: 'Preferencia', info: 'Idioma seleccionado' },
  'locale': { desc: 'Preferencia', info: 'Configuración regional' },
  'theme': { desc: 'Preferencia', info: 'Tema visual (claro/oscuro)' },
  'dark_mode': { desc: 'Preferencia', info: 'Modo oscuro activado' },
  'timezone': { desc: 'Preferencia', info: 'Zona horaria del usuario' },
  'currency': { desc: 'Preferencia', info: 'Moneda seleccionada' },
  
  // Consent & Privacy
  'cookieconsent': { desc: 'Consentimiento', info: 'Aceptación de cookies' },
  'cookie_consent': { desc: 'Consentimiento', info: 'Aceptación de cookies' },
  'gdpr': { desc: 'Consentimiento GDPR', info: 'Preferencias de privacidad' },
  'euconsent': { desc: 'Consentimiento EU', info: 'Preferencias TCF' },
  'OptanonConsent': { desc: 'OneTrust', info: 'Preferencias de cookies' },
  'CookieConsent': { desc: 'Consentimiento', info: 'Preferencias de cookies' },
  
  // E-commerce
  'cart': { desc: 'Carrito', info: 'Productos en tu carrito' },
  'cart_id': { desc: 'Carrito', info: 'Identificador del carrito' },
  'wishlist': { desc: 'Lista de deseos', info: 'Productos guardados' },
  
  // Cloudflare
  '__cf_bm': { desc: 'Cloudflare', info: 'Protección contra bots' },
  'cf_clearance': { desc: 'Cloudflare', info: 'Verificación de seguridad completada' },
  '__cflb': { desc: 'Cloudflare', info: 'Balance de carga' },
  
  // Other common
  'csrf': { desc: 'Seguridad', info: 'Protección contra ataques CSRF' },
  'csrf_token': { desc: 'Seguridad', info: 'Token anti-falsificación' },
  '_csrf': { desc: 'Seguridad', info: 'Token anti-falsificación' },
  'XSRF-TOKEN': { desc: 'Seguridad', info: 'Token anti-falsificación' },
  'ajs_anonymous_id': { desc: 'Segment', info: 'Identificador anónimo de analytics' },
  'ajs_user_id': { desc: 'Segment', info: 'Identificador de usuario' },
  '_hjid': { desc: 'Hotjar', info: 'Identificador único de usuario' },
  '_hjSessionUser': { desc: 'Hotjar', info: 'Datos de sesión', partial: true },
  'intercom-id': { desc: 'Intercom', info: 'Identificador de chat', partial: true },
  'mp_': { desc: 'Mixpanel', info: 'Analytics de producto', partial: true },
  'amplitude_id': { desc: 'Amplitude', info: 'Analytics de producto', partial: true },
  '__stripe': { desc: 'Stripe', info: 'Prevención de fraude en pagos', partial: true },
  'crisp-client': { desc: 'Crisp Chat', info: 'Identificador de chat', partial: true },
  'hubspotutk': { desc: 'HubSpot', info: 'Seguimiento de visitantes' },
  '__hssc': { desc: 'HubSpot', info: 'Seguimiento de sesión' },
  '__hssrc': { desc: 'HubSpot', info: 'Nueva sesión iniciada' },
  '__hstc': { desc: 'HubSpot', info: 'Seguimiento principal' },
};

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

// Obtener información de la cookie
function getCookieInfo(cookieName) {
  // Buscar coincidencia exacta
  if (cookieDatabase[cookieName]) {
    return cookieDatabase[cookieName];
  }
  
  // Buscar coincidencias parciales (para cookies con prefijos)
  const lowerName = cookieName.toLowerCase();
  for (const [key, value] of Object.entries(cookieDatabase)) {
    if (value.partial && lowerName.startsWith(key.toLowerCase())) {
      return value;
    }
  }
  
  // Inferir tipo basado en patrones comunes
  if (lowerName.includes('session') || lowerName.includes('sess')) {
    return { desc: 'Sesión', info: 'Datos de sesión del sitio' };
  }
  if (lowerName.includes('auth') || lowerName.includes('login') || lowerName.includes('token')) {
    return { desc: 'Autenticación', info: 'Datos de inicio de sesión' };
  }
  if (lowerName.includes('cart') || lowerName.includes('basket')) {
    return { desc: 'Carrito', info: 'Datos de compra' };
  }
  if (lowerName.includes('consent') || lowerName.includes('gdpr') || lowerName.includes('cookie')) {
    return { desc: 'Consentimiento', info: 'Preferencias de privacidad' };
  }
  if (lowerName.includes('lang') || lowerName.includes('locale') || lowerName.includes('i18n')) {
    return { desc: 'Preferencia', info: 'Configuración de idioma' };
  }
  if (lowerName.includes('theme') || lowerName.includes('dark') || lowerName.includes('mode')) {
    return { desc: 'Preferencia', info: 'Configuración visual' };
  }
  if (lowerName.includes('csrf') || lowerName.includes('xsrf')) {
    return { desc: 'Seguridad', info: 'Protección anti-falsificación' };
  }
  if (lowerName.includes('track') || lowerName.includes('analytics') || lowerName.includes('_ga')) {
    return { desc: 'Analytics', info: 'Seguimiento de uso' };
  }
  if (lowerName.includes('ad') || lowerName.includes('promo') || lowerName.includes('campaign')) {
    return { desc: 'Publicidad', info: 'Seguimiento de anuncios' };
  }
  if (lowerName.startsWith('_') || lowerName.startsWith('__')) {
    return { desc: 'Técnica', info: 'Cookie del sistema' };
  }
  
  return null;
}

// Formatear fecha de expiración
function formatExpiry(cookie) {
  if (cookie.session) {
    return 'Sesión';
  }
  if (cookie.expirationDate) {
    const date = new Date(cookie.expirationDate * 1000);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expirada';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `${diffDays} días`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} sem`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} meses`;
    return `${Math.ceil(diffDays / 365)} años`;
  }
  return '—';
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
    
    const cookieInfo = getCookieInfo(cookie.name);
    const expiry = formatExpiry(cookie);
    
    // Tags de la cookie
    const tags = [];
    if (cookie.secure) tags.push('🔒');
    if (cookie.httpOnly) tags.push('HTTP');
    
    cookieItem.innerHTML = `
      <div class="cookie-info">
        <div class="cookie-header">
          <span class="cookie-name" title="${escapeHtml(cookie.name)}">${escapeHtml(cookie.name)}</span>
          ${cookieInfo ? `<span class="cookie-type">${cookieInfo.desc}</span>` : ''}
        </div>
        <span class="cookie-description">${cookieInfo ? cookieInfo.info : 'Cookie del sitio web'}</span>
        <div class="cookie-meta">
          <span class="cookie-expiry" title="Expiración">${expiry}</span>
          ${tags.length > 0 ? `<span class="cookie-tags">${tags.join(' ')}</span>` : ''}
        </div>
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
