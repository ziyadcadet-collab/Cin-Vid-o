/* ============================================================
   BRVM Prototype — Main JS
   Interactions: Tabs, Charts, Ticker, Dropdowns, Mobile
   ============================================================ */

/* ---------- UTILS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- TABS ---------- */
function initTabs() {
  $$('.tabs').forEach(tabGroup => {
    $$('.tab-item', tabGroup).forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        const container = tabGroup.closest('[data-tabs-container]') || tabGroup.parentElement;
        $$('.tab-item', tabGroup).forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $$('.tab-panel', container).forEach(p => p.classList.remove('active'));
        const panel = $(`[data-panel="${target}"]`, container);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

/* ---------- MOBILE DRAWER ---------- */
function initMobileDrawer() {
  const hamburger = $('.hamburger');
  const drawer    = $('.mobile-drawer');
  const overlay   = $('.drawer-overlay');
  if (!hamburger) return;
  const toggle = () => {
    drawer?.classList.toggle('open');
    overlay?.classList.toggle('open');
  };
  hamburger.addEventListener('click', toggle);
  overlay?.addEventListener('click', toggle);
}

/* ---------- TICKER TAPE ---------- */
const TICKER_DATA = [
  { sym: 'SGBCI', price: '14250', chg: '+1.85%', dir: 'up' },
  { sym: 'ONTBF', price: '4900',  chg: '-0.72%', dir: 'down' },
  { sym: 'PALM', price: '6950',  chg: '+3.14%', dir: 'up' },
  { sym: 'SEMC', price: '2100',  chg: '+0.48%', dir: 'up' },
  { sym: 'ETIT', price: '17',    chg: '-1.16%', dir: 'down' },
  { sym: 'BICC', price: '6000',  chg: '+2.33%', dir: 'up' },
  { sym: 'SPHC', price: '750',   chg: '-0.53%', dir: 'down' },
  { sym: 'CFAC', price: '685',   chg: '+0.88%', dir: 'up' },
  { sym: 'SDSC', price: '3900',  chg: '+1.04%', dir: 'up' },
  { sym: 'SIVC', price: '455',   chg: '-2.17%', dir: 'down' },
  { sym: 'BRVMCO', price: '231.45', chg: '+0.62%', dir: 'up' },
  { sym: 'BRVMTR', price: '284.21', chg: '+0.91%', dir: 'up' },
];

function buildTicker() {
  const tape = $('.ticker-inner');
  if (!tape) return;
  const items = [...TICKER_DATA, ...TICKER_DATA]; // double for seamless loop
  tape.innerHTML = items.map(t => `
    <span class="ticker-item">
      <span class="ticker-symbol">${t.sym}</span>
      <span class="ticker-price">${t.price}</span>
      <span class="${t.dir === 'up' ? 'price-up' : 'price-down'}">${t.chg}</span>
    </span>
  `).join('');
}

/* ---------- MINI SPARKLINES (SVG) ---------- */
function buildSparklines() {
  $$('[data-sparkline]').forEach(el => {
    const vals = el.dataset.sparkline.split(',').map(Number);
    const dir  = el.dataset.dir || 'up';
    const color = dir === 'up' ? '#00C853' : '#FF3D57';
    const w = 80, h = 30;
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    const pts = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');
    el.innerHTML = `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
        <polyline points="${pts}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>`;
  });
}

/* ---------- DONUT CHART (Portfolio Allocation) ---------- */
function buildDonutChart(canvasId, segments) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const R = (Math.min(cx, cy) - 10);
  const r = R * 0.55;
  let startAngle = -Math.PI / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  segments.forEach(seg => {
    const angle = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += angle;
  });
  // hole
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  // center text
  ctx.fillStyle = '#0A1F44';
  ctx.font = 'bold 18px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Portefeuille', cx, cy - 10);
  ctx.font = '500 12px Inter';
  ctx.fillStyle = '#718096';
  ctx.fillText('Allocation', cx, cy + 12);
}

/* ---------- LINE CHART (SVG — Cours Action) ---------- */
function buildLineChart(containerId, data, color = '#00A86B') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const W = container.clientWidth || 600;
  const H = 180;
  const padL = 50, padR = 20, padT = 10, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const min = Math.min(...data) * 0.995;
  const max = Math.max(...data) * 1.005;
  const range = max - min;
  const xStep = innerW / (data.length - 1);

  const pts = data.map((v, i) => {
    const x = padL + i * xStep;
    const y = padT + (1 - (v - min) / range) * innerH;
    return { x, y, v };
  });
  const linePts = pts.map(p => `${p.x},${p.y}`).join(' ');
  const areaPts = `${padL},${padT + innerH} ` + linePts + ` ${padL + innerW},${padT + innerH}`;

  // Y axis ticks
  const yTicks = 4;
  let yAxisSVG = '';
  for (let i = 0; i <= yTicks; i++) {
    const v = min + (range * i) / yTicks;
    const y = padT + (1 - i / yTicks) * innerH;
    yAxisSVG += `
      <line x1="${padL}" y1="${y}" x2="${padL + innerW}" y2="${y}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="4,4"/>
      <text x="${padL - 6}" y="${y + 4}" font-size="10" fill="#A0AEC0" text-anchor="end">${Math.round(v)}</text>`;
  }

  container.innerHTML = `
    <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad_${containerId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${yAxisSVG}
      <polygon points="${areaPts}" fill="url(#grad_${containerId})"/>
      <polyline points="${linePts}" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p, i) => i === pts.length - 1 ? `<circle cx="${p.x}" cy="${p.y}" r="5" fill="${color}" stroke="white" stroke-width="2"/>` : '').join('')}
    </svg>`;
}

/* ---------- PERFORMANCE BAR CHART ---------- */
function buildBarChart(containerId, labels, values, color = '#00A86B') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const W = container.clientWidth || 500;
  const H = 160;
  const pad = 30;
  const innerW = W - pad * 2;
  const innerH = H - pad;
  const max = Math.max(...values.map(Math.abs)) * 1.2;
  const barW = (innerW / values.length) * 0.6;
  const gap  = (innerW / values.length) * 0.4;
  const baseline = pad + (max > 0 ? (max / (max * 2)) * innerH : innerH / 2);

  let bars = '';
  values.forEach((v, i) => {
    const x = pad + i * (barW + gap) + gap / 2;
    const barH = (Math.abs(v) / (max * 2)) * innerH;
    const y = v >= 0 ? baseline - barH : baseline;
    const c = v >= 0 ? '#00A86B' : '#FF3D57';
    bars += `
      <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${c}" rx="3" opacity="0.85"/>
      <text x="${x + barW / 2}" y="${H - 8}" font-size="10" fill="#A0AEC0" text-anchor="middle">${labels[i]}</text>
      <text x="${x + barW / 2}" y="${v >= 0 ? y - 5 : y + barH + 14}" font-size="9" fill="${c}" text-anchor="middle" font-weight="600">${v > 0 ? '+' : ''}${v}%</text>`;
  });

  container.innerHTML = `
    <svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}">
      <line x1="${pad}" y1="${baseline}" x2="${W - pad}" y2="${baseline}" stroke="#E2E8F0" stroke-width="1"/>
      ${bars}
    </svg>`;
}

/* ---------- ANIMATED COUNTERS ---------- */
function animateCounter(el, target, suffix = '', decimals = 0) {
  const duration = 1200;
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = target * ease;
    el.textContent = val.toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimals || '0');
        animateCounter(el, target, suffix, decimals);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => observer.observe(el));
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  $$('[data-reveal]').forEach(el => observer.observe(el));
}

/* ---------- PORTFOLIO CHART DATA ---------- */
const PORTFOLIO_SEGMENTS = [
  { label: 'Actions BRVM', value: 42, color: '#00A86B' },
  { label: 'Obligations',  value: 28, color: '#F5A623' },
  { label: 'SICAV',        value: 18, color: '#0A1F44' },
  { label: 'Liquidités',   value: 12, color: '#CBD5E0' },
];

const PRICE_HISTORY = [14100, 13950, 14200, 14050, 14400, 14350, 14600, 14500, 14750, 14700, 14900, 14850, 15000, 14980, 15100, 15250, 15200, 15400, 15350, 15500, 15450, 15600, 15700, 15650, 15800, 15900, 16050, 15980, 16200, 16150];

const MONTHLY_PERF = [1.2, -0.8, 2.1, 0.5, 3.4, -1.2, 2.8, 1.9, 0.4, 2.3, -0.6, 3.1];
const MONTHLY_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initMobileDrawer();
  buildTicker();
  buildSparklines();
  initCounters();
  initScrollReveal();

  // Charts (will silently skip if containers absent)
  requestAnimationFrame(() => {
    buildDonutChart('donut-portfolio', PORTFOLIO_SEGMENTS);
    buildLineChart('chart-cours', PRICE_HISTORY);
    buildBarChart('chart-performance', MONTHLY_LABELS, MONTHLY_PERF);
  });

  // Sticky nav shadow
  window.addEventListener('scroll', () => {
    const nav = $('.topbar');
    if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 2px 16px rgba(0,0,0,.25)' : 'none';
  });

  // Active link highlight (simple)
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });
});

/* ---------- QUIZ LOGIC ---------- */
window.checkQuiz = function(btn, correct) {
  const parent = btn.closest('.quiz-options');
  $$('.quiz-btn', parent).forEach(b => b.disabled = true);
  if (correct) {
    btn.style.background = 'var(--success)';
    btn.style.color = 'white';
    parent.nextElementSibling && (parent.nextElementSibling.textContent = '✅ Bonne réponse !');
  } else {
    btn.style.background = 'var(--danger)';
    btn.style.color = 'white';
    parent.nextElementSibling && (parent.nextElementSibling.textContent = '❌ Incorrect. Essayez encore.');
  }
};

/* ---------- SIMULATOR ---------- */
window.runSimulator = function() {
  const montant = parseFloat($('#sim-montant')?.value || 1000000);
  const action  = $('#sim-action')?.value || 'SGBCI';
  const horizon = parseFloat($('#sim-horizon')?.value || 3);
  const taux    = 0.12; // rendement annuel moyen BRVM historique
  const result  = montant * Math.pow(1 + taux, horizon);
  const gain    = result - montant;
  const el      = $('#sim-result');
  if (el) {
    el.innerHTML = `
      <div class="sim-output">
        <div class="sim-line"><span>Montant investi</span><strong>${montant.toLocaleString('fr-FR')} FCFA</strong></div>
        <div class="sim-line"><span>Valeur estimée dans ${horizon} an(s)</span><strong class="text-green">${Math.round(result).toLocaleString('fr-FR')} FCFA</strong></div>
        <div class="sim-line"><span>Gain estimé</span><strong class="text-green">+${Math.round(gain).toLocaleString('fr-FR')} FCFA</strong></div>
        <div class="sim-line"><span>Rendement annualisé moyen</span><strong class="text-green">+12%</strong></div>
        <p class="text-xs text-muted mt-2">⚠️ Simulation indicative basée sur les rendements historiques. Les performances passées ne préjugent pas des résultats futurs.</p>
      </div>`;
  }
};

/* ---------- ALERT MANAGEMENT ---------- */
window.addAlert = function() {
  const action = $('#alert-action')?.value;
  const price  = $('#alert-price')?.value;
  const list   = $('#alert-list');
  if (!action || !price || !list) return;
  const item = document.createElement('div');
  item.className = 'alert-item';
  item.innerHTML = `
    <span class="badge badge-navy">${action}</span>
    <span class="text-sm">Alerte à <strong>${parseFloat(price).toLocaleString('fr-FR')} FCFA</strong></span>
    <button class="btn btn-ghost btn-sm text-danger" onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(item);
};

/* ---------- WATCHLIST ---------- */
window.addToWatchlist = function(sym, price, chg) {
  const list = $('.watchlist-items');
  if (!list) return;
  const exists = $(`[data-sym="${sym}"]`, list);
  if (exists) { exists.classList.add('highlight'); setTimeout(() => exists.classList.remove('highlight'), 1200); return; }
  const item = document.createElement('div');
  item.className = 'watchlist-item';
  item.dataset.sym = sym;
  const dir = parseFloat(chg) >= 0;
  item.innerHTML = `
    <span class="font-bold text-sm">${sym}</span>
    <span class="text-sm">${price} FCFA</span>
    <span class="${dir ? 'price-up' : 'price-down'} text-sm">${chg}</span>
    <button class="btn-ghost btn-sm" onclick="this.parentElement.remove()">✕</button>`;
  list.appendChild(item);
};

/* ---------- SEARCH OVERLAY ---------- */
(function() {
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const overlay = $('#search-overlay');
      if (overlay) { overlay.classList.toggle('open'); overlay.querySelector('input')?.focus(); }
    }
    if (e.key === 'Escape') {
      const overlay = $('#search-overlay');
      overlay?.classList.remove('open');
    }
  });
})();
