// Función de internacionalización
function i18n(key, substitutions = []) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

// Aplicar traducciones a elementos con data-i18n
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18n(key);
  });
}

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

// Base de datos de cookies conocidas con descripciones (usando claves i18n)
const cookieDatabase = {
  // Google Analytics
  '_ga': { descKey: 'cookieTypeGoogleAnalytics', infoKey: 'cookieInfoGaUser' },
  '_gid': { descKey: 'cookieTypeGoogleAnalytics', infoKey: 'cookieInfoGaSession' },
  '_gat': { descKey: 'cookieTypeGoogleAnalytics', infoKey: 'cookieInfoGaThrottle' },
  '_ga_': { descKey: 'cookieTypeGoogleAnalytics4', infoKey: 'cookieInfoGa4', partial: true },
  '__utma': { descKey: 'cookieTypeGoogleAnalyticsLegacy', infoKey: 'cookieInfoUtma' },
  '__utmb': { descKey: 'cookieTypeGoogleAnalyticsLegacy', infoKey: 'cookieInfoUtmb' },
  '__utmc': { descKey: 'cookieTypeGoogleAnalyticsLegacy', infoKey: 'cookieInfoUtmc' },
  '__utmz': { descKey: 'cookieTypeGoogleAnalyticsLegacy', infoKey: 'cookieInfoUtmz' },
  
  // Facebook
  '_fbp': { descKey: 'cookieTypeFacebookPixel', infoKey: 'cookieInfoFbPixel' },
  '_fbc': { descKey: 'cookieTypeFacebookClickId', infoKey: 'cookieInfoFbClick' },
  'fr': { descKey: 'cookieTypeFacebook', infoKey: 'cookieInfoFbAds' },
  
  // Advertising & Tracking
  '_gcl_au': { descKey: 'cookieTypeGoogleAds', infoKey: 'cookieInfoGclAu' },
  'IDE': { descKey: 'cookieTypeGoogleDoubleClick', infoKey: 'cookieInfoDoubleClick' },
  'NID': { descKey: 'cookieTypeGoogle', infoKey: 'cookieInfoNid' },
  '__gads': { descKey: 'cookieTypeGoogleAdSense', infoKey: 'cookieInfoAdSense' },
  '_uetsid': { descKey: 'cookieTypeBingAds', infoKey: 'cookieInfoBingSession' },
  '_uetvid': { descKey: 'cookieTypeBingAds', infoKey: 'cookieInfoBingVisitor' },
  
  // Session & Auth
  'session': { descKey: 'cookieTypeSession', infoKey: 'cookieInfoSessionData' },
  'sessionid': { descKey: 'cookieTypeSession', infoKey: 'cookieInfoSessionId' },
  'session_id': { descKey: 'cookieTypeSession', infoKey: 'cookieInfoSessionId' },
  'PHPSESSID': { descKey: 'cookieTypeSessionPHP', infoKey: 'cookieInfoSessionServer' },
  'JSESSIONID': { descKey: 'cookieTypeSessionJava', infoKey: 'cookieInfoSessionServer' },
  'ASP.NET_SessionId': { descKey: 'cookieTypeSessionNET', infoKey: 'cookieInfoSessionServer' },
  'connect.sid': { descKey: 'cookieTypeSessionNodeJS', infoKey: 'cookieInfoSessionExpress' },
  'auth': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoAuthStatus' },
  'auth_token': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoAuthToken' },
  'access_token': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoOAuthToken' },
  'refresh_token': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoRefreshToken' },
  'token': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoAuthToken' },
  'jwt': { descKey: 'cookieTypeAuthJWT', infoKey: 'cookieInfoJWT' },
  'remember_me': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoRememberMe' },
  'logged_in': { descKey: 'cookieTypeAuth', infoKey: 'cookieInfoLoginStatus' },
  
  // Preferences
  'lang': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoLanguage' },
  'language': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoLanguage' },
  'locale': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoLocale' },
  'theme': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoTheme' },
  'dark_mode': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoDarkMode' },
  'timezone': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoTimezone' },
  'currency': { descKey: 'cookieTypePreference', infoKey: 'cookieInfoCurrency' },
  
  // Consent & Privacy
  'cookieconsent': { descKey: 'cookieTypeConsent', infoKey: 'cookieInfoCookieConsent' },
  'cookie_consent': { descKey: 'cookieTypeConsent', infoKey: 'cookieInfoCookieConsent' },
  'gdpr': { descKey: 'cookieTypeConsentGDPR', infoKey: 'cookieInfoGdpr' },
  'euconsent': { descKey: 'cookieTypeConsentEU', infoKey: 'cookieInfoTcf' },
  'OptanonConsent': { descKey: 'cookieTypeOneTrust', infoKey: 'cookieInfoOneTrust' },
  'CookieConsent': { descKey: 'cookieTypeConsent', infoKey: 'cookieInfoOneTrust' },
  
  // E-commerce
  'cart': { descKey: 'cookieTypeCart', infoKey: 'cookieInfoCart' },
  'cart_id': { descKey: 'cookieTypeCart', infoKey: 'cookieInfoCartId' },
  'wishlist': { descKey: 'cookieTypeWishlist', infoKey: 'cookieInfoWishlist' },
  
  // Cloudflare
  '__cf_bm': { descKey: 'cookieTypeCloudflare', infoKey: 'cookieInfoCfBot' },
  'cf_clearance': { descKey: 'cookieTypeCloudflare', infoKey: 'cookieInfoCfClearance' },
  '__cflb': { descKey: 'cookieTypeCloudflare', infoKey: 'cookieInfoCfLoadBalance' },
  
  // Other common
  'csrf': { descKey: 'cookieTypeSecurity', infoKey: 'cookieInfoCsrf' },
  'csrf_token': { descKey: 'cookieTypeSecurity', infoKey: 'cookieInfoCsrfToken' },
  '_csrf': { descKey: 'cookieTypeSecurity', infoKey: 'cookieInfoCsrfToken' },
  'XSRF-TOKEN': { descKey: 'cookieTypeSecurity', infoKey: 'cookieInfoCsrfToken' },
  'ajs_anonymous_id': { descKey: 'cookieTypeSegment', infoKey: 'cookieInfoSegmentAnon' },
  'ajs_user_id': { descKey: 'cookieTypeSegment', infoKey: 'cookieInfoSegmentUser' },
  '_hjid': { descKey: 'cookieTypeHotjar', infoKey: 'cookieInfoHotjarUser' },
  '_hjSessionUser': { descKey: 'cookieTypeHotjar', infoKey: 'cookieInfoHotjarSession', partial: true },
  'intercom-id': { descKey: 'cookieTypeIntercom', infoKey: 'cookieInfoIntercom', partial: true },
  'mp_': { descKey: 'cookieTypeMixpanel', infoKey: 'cookieInfoMixpanel', partial: true },
  'amplitude_id': { descKey: 'cookieTypeAmplitude', infoKey: 'cookieInfoMixpanel', partial: true },
  '__stripe': { descKey: 'cookieTypeStripe', infoKey: 'cookieInfoStripe', partial: true },
  'crisp-client': { descKey: 'cookieTypeCrispChat', infoKey: 'cookieInfoIntercom', partial: true },
  'hubspotutk': { descKey: 'cookieTypeHubSpot', infoKey: 'cookieInfoHubspotTracking' },
  '__hssc': { descKey: 'cookieTypeHubSpot', infoKey: 'cookieInfoHubspotSession' },
  '__hssrc': { descKey: 'cookieTypeHubSpot', infoKey: 'cookieInfoHubspotNew' },
  '__hstc': { descKey: 'cookieTypeHubSpot', infoKey: 'cookieInfoHubspotMain' },
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  init();
});

async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      showStatus(i18n('errorLoadingPage'), 'error');
      return;
    }

    currentUrl = tab.url;
    
    if (!isValidUrl(currentUrl)) {
      domainElement.textContent = i18n('pageNotCompatible');
      cookieCountElement.textContent = '0';
      clearDomainBtn.disabled = true;
      showStatus(i18n('systemPagesNoAccess'), 'warning');
      return;
    }

    const url = new URL(currentUrl);
    currentDomain = url.hostname;
    domainElement.textContent = currentDomain;

    await loadCookies();

  } catch (error) {
    console.error('Error al inicializar:', error);
    showStatus(i18n('errorLoadingInfo'), 'error');
  }
}

function isValidUrl(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}

// Obtener información de la cookie
function getCookieInfo(cookieName) {
  // Buscar coincidencia exacta
  if (cookieDatabase[cookieName]) {
    const entry = cookieDatabase[cookieName];
    return {
      desc: i18n(entry.descKey),
      info: i18n(entry.infoKey)
    };
  }
  
  // Buscar coincidencias parciales (para cookies con prefijos)
  const lowerName = cookieName.toLowerCase();
  for (const [key, value] of Object.entries(cookieDatabase)) {
    if (value.partial && lowerName.startsWith(key.toLowerCase())) {
      return {
        desc: i18n(value.descKey),
        info: i18n(value.infoKey)
      };
    }
  }
  
  // Inferir tipo basado en patrones comunes
  if (lowerName.includes('session') || lowerName.includes('sess')) {
    return { desc: i18n('cookieTypeSession'), info: i18n('cookieInfoSessionSite') };
  }
  if (lowerName.includes('auth') || lowerName.includes('login') || lowerName.includes('token')) {
    return { desc: i18n('cookieTypeAuth'), info: i18n('cookieInfoAuthData') };
  }
  if (lowerName.includes('cart') || lowerName.includes('basket')) {
    return { desc: i18n('cookieTypeCart'), info: i18n('cookieInfoCartData') };
  }
  if (lowerName.includes('consent') || lowerName.includes('gdpr') || lowerName.includes('cookie')) {
    return { desc: i18n('cookieTypeConsent'), info: i18n('cookieInfoPrivacyPrefs') };
  }
  if (lowerName.includes('lang') || lowerName.includes('locale') || lowerName.includes('i18n')) {
    return { desc: i18n('cookieTypePreference'), info: i18n('cookieInfoLangConfig') };
  }
  if (lowerName.includes('theme') || lowerName.includes('dark') || lowerName.includes('mode')) {
    return { desc: i18n('cookieTypePreference'), info: i18n('cookieInfoVisualConfig') };
  }
  if (lowerName.includes('csrf') || lowerName.includes('xsrf')) {
    return { desc: i18n('cookieTypeSecurity'), info: i18n('cookieInfoAntiForge') };
  }
  if (lowerName.includes('track') || lowerName.includes('analytics') || lowerName.includes('_ga')) {
    return { desc: i18n('cookieTypeAnalytics'), info: i18n('cookieInfoUsageTracking') };
  }
  if (lowerName.includes('ad') || lowerName.includes('promo') || lowerName.includes('campaign')) {
    return { desc: i18n('cookieTypeAdvertising'), info: i18n('cookieInfoAdTracking') };
  }
  if (lowerName.startsWith('_') || lowerName.startsWith('__')) {
    return { desc: i18n('cookieTypeTechnical'), info: i18n('cookieInfoSystemCookie') };
  }
  
  return null;
}

// Formatear fecha de expiración
function formatExpiry(cookie) {
  if (cookie.session) {
    return i18n('expirySession');
  }
  if (cookie.expirationDate) {
    const date = new Date(cookie.expirationDate * 1000);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return i18n('expiryExpired');
    if (diffDays === 0) return i18n('expiryToday');
    if (diffDays === 1) return i18n('expiryTomorrow');
    if (diffDays < 7) return i18n('expiryDays', [diffDays.toString()]);
    if (diffDays < 30) return i18n('expiryWeeks', [Math.ceil(diffDays / 7).toString()]);
    if (diffDays < 365) return i18n('expiryMonths', [Math.ceil(diffDays / 30).toString()]);
    return i18n('expiryYears', [Math.ceil(diffDays / 365).toString()]);
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
        <span class="cookie-description">${cookieInfo ? cookieInfo.info : i18n('websiteCookie')}</span>
        <div class="cookie-meta">
          <span class="cookie-expiry" title="${i18n('expiration')}">${expiry}</span>
          ${tags.length > 0 ? `<span class="cookie-tags">${tags.join(' ')}</span>` : ''}
        </div>
      </div>
      <button class="cookie-delete" title="${i18n('deleteCookie')}" data-name="${escapeHtml(cookie.name)}" data-domain="${escapeHtml(cookie.domain)}" data-path="${escapeHtml(cookie.path)}" data-secure="${cookie.secure}">
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
      showStatus(i18n('cookieDeleted', [name]), 'success');
    }, 200);
    
  } catch (error) {
    console.error('Error al eliminar cookie:', error);
    cookieItem.classList.remove('deleting');
    showStatus(i18n('errorDeletingCookie'), 'error');
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
    ${i18n('cleaning')}
  `;

  try {
    const cookies = await chrome.cookies.getAll({ domain: currentDomain });
    
    if (cookies.length === 0) {
      showStatus(i18n('noCookiesToDelete'), 'warning');
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
    const plural = deletedCount !== 1 ? 's' : '';
    showStatus(i18n('cookiesDeleted', [deletedCount.toString(), plural]), 'success');

  } catch (error) {
    console.error('Error:', error);
    showStatus(i18n('errorDeletingCookies'), 'error');
  }

  clearDomainBtn.innerHTML = originalContent;
  clearDomainBtn.disabled = false;
});

// Limpiar TODAS las cookies
clearAllBtn.addEventListener('click', async () => {
  if (!confirm(i18n('confirmDeleteAll'))) {
    return;
  }

  clearAllBtn.disabled = true;
  const originalContent = clearAllBtn.innerHTML;
  clearAllBtn.innerHTML = `
    <svg class="loading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    ${i18n('cleaning')}
  `;

  try {
    const allCookies = await chrome.cookies.getAll({});
    
    if (allCookies.length === 0) {
      showStatus(i18n('noCookiesToDelete'), 'warning');
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
    const plural = deletedCount !== 1 ? 's' : '';
    showStatus(i18n('cookiesDeletedTotal', [deletedCount.toString(), plural]), 'success');

  } catch (error) {
    console.error('Error:', error);
    showStatus(i18n('errorDeletingCookies'), 'error');
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
