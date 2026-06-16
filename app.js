// =============================================
// STEP 1: PASTE YOUR GNEWS API KEY HERE
// Get it free at https://gnews.io
// =============================================
const API_KEY = 'cc5a7088581f8e184239daf0f1bcf70e';

// =============================================
// CONFIG
// =============================================
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
let currentCategory = 'business';
let refreshTimer = null;

// =============================================
// FETCH NEWS (using GNews API — works on live sites)
// =============================================
async function fetchNews(category) {
  showLoading();
  currentCategory = category;

  const categoryKeywords = {
    business: 'india business finance economy',
    general: 'india news today',
    technology: 'india technology startup',
    science: 'science research discovery',
    health: 'india health medical',
    sports: 'india cricket sports',
    entertainment: 'india entertainment bollywood',
  };

  const query = categoryKeywords[category] || 'india news';

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=10&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.errors) {
      showError(data.errors.join(', '));
      return;
    }

    displayNews(data.articles);
    startAutoRefresh();

  } catch (err) {
    showError('Could not load news. Check your internet connection.');
    console.error(err);
  }
}

// =============================================
// DISPLAY NEWS CARDS
// =============================================
function displayNews(articles) {
  const grid = document.getElementById('news-grid');

  if (!articles || articles.length === 0) {
    grid.innerHTML = '<div class="error-box"><h3>No articles found</h3><p>Try a different category.</p></div>';
    return;
  }

  grid.innerHTML = articles.map((article, index) => {
    if (!article.title) return '';

    const isFeatured = index === 0;
    const source = article.source?.name || article.source || 'Unknown Source';
    const time = formatTime(article.publishedAt);
    const tag = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

    const imgHTML = article.image
      ? `<img class="news-img" src="${article.image}" alt="news image" onerror="this.outerHTML='<div class=\'news-img-placeholder\'>📰</div>'" />`
      : `<div class="news-img-placeholder">📰</div>`;

    return `
      <a class="news-card ${isFeatured ? 'featured' : ''}" href="${article.url}" target="_blank" rel="noopener">
        ${isFeatured ? imgHTML : ''}
        <div class="news-card-text">
          <div class="news-tag">${tag}</div>
          <div class="news-title">${article.title}</div>
          ${article.description ? `<div class="news-desc">${article.description}</div>` : ''}
          <div class="news-meta">
            <span>${source}</span>
            <span class="dot"></span>
            <span>${time}</span>
          </div>
        </div>
        ${!isFeatured ? imgHTML : ''}
      </a>
    `;
  }).join('');
}

// =============================================
// SEARCH
// =============================================
async function searchNews(query) {
  showLoading();

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.errors) {
      showError(data.errors.join(', '));
      return;
    }

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    displayNews(data.articles);

  } catch (err) {
    showError('Search failed. Check your internet connection.');
  }
}

// =============================================
// HELPER: FORMAT TIME
// =============================================
function formatTime(isoString) {
  if (!isoString) return 'Unknown time';
  const now = new Date();
  const published = new Date(isoString);
  const diffMinutes = Math.floor((now - published) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hr ago`;
  return `${Math.floor(diffMinutes / 1440)} days ago`;
}

// =============================================
// HELPER: SHOW LOADING
// =============================================
function showLoading() {
  document.getElementById('news-grid').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading latest news...</p>
    </div>
  `;
}

// =============================================
// HELPER: SHOW ERROR
// =============================================
function showError(message) {
  document.getElementById('news-grid').innerHTML = `
    <div class="error-box">
      <h3>⚠️ Could not load news</h3>
      <p>${message}</p>
      <p style="margin-top:8px; font-size:11px;">Make sure your GNews API key is set in app.js</p>
    </div>
  `;
}

// =============================================
// AUTO REFRESH EVERY 15 MINUTES
// =============================================
function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    fetchNews(currentCategory);
  }, REFRESH_INTERVAL);
}

// =============================================
// MARKET DATA (placeholder — updates visually)
// =============================================
const MARKET_DATA = [
  { id: 'sensex', name: 'SENSEX', valEl: 'sensex-val', chgEl: 'sensex-chg' },
  { id: 'nifty',  name: 'NIFTY 50', valEl: 'nifty-val', chgEl: 'nifty-chg' },
  { id: 'usdinr', name: 'USD/INR', valEl: 'usdinr-val', chgEl: 'usdinr-chg' },
  { id: 'gold',   name: 'GOLD', valEl: 'gold-val', chgEl: 'gold-chg' },
];

function loadMarketData() {
  const placeholders = [
    { val: '79,412', chg: '+336 (0.43%)', up: true },
    { val: '24,128', chg: '+91 (0.38%)', up: true },
    { val: '83.61',  chg: '-0.12 (0.14%)', up: false },
    { val: '72,450', chg: '+210 (0.29%)', up: true },
  ];

  MARKET_DATA.forEach((item, i) => {
    const p = placeholders[i];
    document.getElementById(item.valEl).textContent = p.val;
    const chgEl = document.getElementById(item.chgEl);
    chgEl.textContent = p.chg;
    chgEl.className = 'm-chg ' + (p.up ? 'up' : 'dn');
  });

  const tickerItems = placeholders.map((p, i) => {
    const cls = p.up ? 'up' : 'dn';
    return `<span>${MARKET_DATA[i].name}: <span class="${cls}">${p.val} ${p.chg}</span></span>`;
  });
  document.getElementById('ticker-track').innerHTML = tickerItems.join('');
}

// =============================================
// TAB CLICKS
// =============================================
document.getElementById('tabs').addEventListener('click', function(e) {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  fetchNews(tab.dataset.category);
});

// =============================================
// SEARCH EVENTS
// =============================================
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-input').value.trim();
  if (query) searchNews(query);
});

document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (query) searchNews(query);
  }
});

// =============================================
// DARK / LIGHT THEME TOGGLE
// =============================================
const themeBtn = document.getElementById('theme-btn');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeBtn.textContent = '☀️ Light';
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// =============================================
// INIT
// =============================================
loadMarketData();
fetchNews('business');