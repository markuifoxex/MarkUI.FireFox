// ── STATE ──
const state = {
  slide: 0,
  total: 5,
  colour: '#ffffff',
  engines: { google: false, ddg: false, brave: false, bing: false, custom: false }
};

const engineData = {
  google: { url: 'https://www.google.com/search',  param: 'q', label: 'Search' },
  ddg:    { url: 'https://duckduckgo.com',          param: 'q', label: 'Search' },
  brave:  { url: 'https://search.brave.com/search', param: 'q', label: 'Search' },
  bing:   { url: 'https://www.bing.com/search',     param: 'q', label: 'Search' },
  custom: { url: '',                                param: 'q', label: 'Search' }
};

// ── ONBOARDING NAV ──
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dots    = document.querySelectorAll('.dot');
const slides  = document.querySelectorAll('.slide');

function goTo(n) {
  if (state.slide === 3 && n === 4) {  // ← только с 3 на 4
    const hasEngine = Object.values(state.engines).some(v => v === true);
    if (!hasEngine) {
      if (!document.getElementById('engine-warning')) {
        const warn = document.createElement('p');
        warn.id = 'engine-warning';
        warn.textContent = 'choose search engine';
        warn.style.cssText = 'color:rgba(255,80,80,0.9); font-size:13px; margin-top:12px; letter-spacing:0.05em; font-family:"Oxygen";';
        document.querySelector('.engine-row').after(warn);
      }
      return;
    }
  }

  slides[state.slide].classList.remove('active');
  dots[state.slide].classList.remove('active');
  state.slide = n;
  slides[state.slide].classList.add('active');
  dots[state.slide].classList.add('active');
  prevBtn.disabled = state.slide === 0;
  const isLast = state.slide === state.total - 1;
  nextBtn.style.opacity       = isLast ? '0' : '1';
  nextBtn.style.pointerEvents = isLast ? 'none' : 'all';
}

prevBtn.addEventListener('click', () => { if (state.slide > 0) goTo(state.slide - 1); });
nextBtn.addEventListener('click', () => { if (state.slide < state.total - 1) goTo(state.slide + 1); });

// ── COLOUR PICKER ──
document.querySelectorAll('.colour-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('.colour-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
    state.colour = sw.dataset.colour;
  });
});

// ── CITY INPUT ──
const showCityBtn = document.getElementById('show-city-input');
if (showCityBtn) {
  showCityBtn.addEventListener('click', () => {
    document.getElementById('input-city').style.display = 'inline-block';
    showCityBtn.style.display = 'none';
    document.getElementById('input-city').focus();
  });
}


// ── ENGINE PICKER (только одна) ──
document.querySelectorAll('.engine-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.engine === 'custom') {
      document.querySelectorAll('.engine-btn').forEach(b => {
        b.classList.remove('active');
        state.engines[b.dataset.engine] = false;
      });
      document.getElementById('custom-modal').style.setProperty('display', 'flex', 'important');
      document.getElementById('custom-url').focus();
      return;
    }

    document.querySelectorAll('.engine-btn').forEach(b => {
      b.classList.remove('active');
      state.engines[b.dataset.engine] = false;
    });
    btn.classList.add('active');
    state.engines[btn.dataset.engine] = true;

    const warn = document.getElementById('engine-warning');
    if (warn) warn.remove();
  });
});

// Функция закрытия (чтобы не дублировать код)
function closeCustomModal() {
  document.getElementById('custom-modal').style.display = 'none';
}

// Слушатель Esc
document.addEventListener('keydown', (event) => {
  const modal = document.getElementById('custom-modal');
  if (event.key === 'Escape' && getComputedStyle(modal).display !== 'none'){
    closeCustomModal();
  }
});

document.getElementById('custom-save').addEventListener('click', () => {
  let url = document.getElementById('custom-url').value.trim();
  if (!url) return;
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);

if (!parsed.hostname.includes('.')) {
  throw new Error();
}

// если путь пустой или только "/"
if (parsed.pathname === '/' || parsed.pathname === '') {
  parsed.pathname = '/search';
}

url = parsed.href;

  } catch {
    alert('Enter a valid search URL\nExample:\nhttps://example.com/search');
    return;
  }
  engineData.custom.url = url;
  engineData.custom.param = 'q';
  document.querySelector('[data-engine="custom"]').classList.add('active');
  state.engines.custom = true;
  closeCustomModal(); // Используем функцию
  const warn = document.getElementById('engine-warning');
  if (warn) warn.remove();
});

document.getElementById('custom-cancel').addEventListener('click', () => {
  closeCustomModal(); // Используем функцию
});

// ── FINISH ONBOARDING ──
document.getElementById('btn-finish').addEventListener('click', launchApp);

function launchApp() {
  const ob = document.getElementById('onboarding');
  ob.classList.add('hidden');
  setTimeout(() => { ob.style.display = 'none'; }, 700);
  document.getElementById('app').classList.add('visible');

  document.querySelector('.nav').style.display = 'none';

  const city = document.getElementById('input-city').value.trim() || 'London';  // ← добавь

  localStorage.setItem('ob_done',    '1');
  localStorage.setItem('ob_colour',  state.colour);
  localStorage.setItem('ob_city',    city);           // ← добавь
  localStorage.setItem('ob_engines', JSON.stringify(state.engines));
  localStorage.setItem('ob_custom_url', engineData.custom.url);

  initApp();
}

// ── INIT APP ──
function initApp() {
  // Clock
  const clockEl = document.getElementById('clock');
  clockEl.style.color = state.colour;

  function tick() {
    const n = new Date();
    clockEl.textContent =
      String(n.getHours()).padStart(2, '0') + ':' +
      String(n.getMinutes()).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);

  // Search bar
  const bar = document.getElementById('search-bar');
  bar.innerHTML = '';
  Object.entries(engineData).forEach(([key, eng]) => {
    if (!state.engines[key]) return;
    const form = document.createElement('form');
    form.action = eng.url;
    form.method = 'get';
    form.target = '_blank';
    form.className = 'search-form';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.name = eng.param;
    inp.placeholder = eng.label;

    form.appendChild(inp);
    bar.appendChild(form);
  });

  loadSites();

  // Add button
  document.getElementById('add-btn').addEventListener('click', () => {
    document.getElementById('modal').classList.add('open');
    document.getElementById('input-name').focus();
  });

  document.getElementById('btn-cancel').addEventListener('click', () => {
    document.getElementById('modal').classList.remove('open');
  });

  document.getElementById('btn-save').addEventListener('click', saveSite);

  document.getElementById('input-url').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveSite();
  });

  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal'))
      document.getElementById('modal').classList.remove('open');
  });
}

// ── SAVE SITE ──
function saveSite() {
  let name = document.getElementById('input-name').value.trim();
  let url  = document.getElementById('input-url').value.trim();
  if (!url) return;

  // Автоматически добавляем https:// если нет протокола
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Проверяем что URL валидный
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('.')) throw new Error();
    url = parsed.href;
  } catch {
    alert('Enter a valid URL\nExample:\nhttps://example.com');
    return;
  }

  if (!name) name = url;

  const sites = JSON.parse(localStorage.getItem('sites') || '[]');
  sites.push({ name, url });
  localStorage.setItem('sites', JSON.stringify(sites));

  document.getElementById('input-name').value = '';
  document.getElementById('input-url').value  = '';
  document.getElementById('modal').classList.remove('open');
  loadSites();
}

// ── LOAD SITES ──
function loadSites() {
  const grid  = document.getElementById('sites-grid');
  const sites = JSON.parse(localStorage.getItem('sites') || '[]');
  grid.innerHTML = '';

  sites.forEach((site, index) => {
    const card = document.createElement('div');
    card.className = 'site-card';

    const domain = new URL(site.url).hostname;

card.innerHTML = `
  <a class="site-icon" href="${site.url}" target="_blank">
    <img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}">
  </a>
  <span class="site-label">${site.name}</span>
  <button class="delete-btn" data-index="${index}">✕</button>
`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const i = parseInt(btn.dataset.index);
      const sites = JSON.parse(localStorage.getItem('sites') || '[]');
      sites.splice(i, 1);
      localStorage.setItem('sites', JSON.stringify(sites));
      loadSites();
    });
  });
}

// ── SKIP ONBOARDING if already done ──
if (localStorage.getItem('ob_done') === '1') {

  // скрываем onboarding
  document.getElementById('onboarding').style.display = 'none';

  // показываем приложение
  document.getElementById('app').classList.add('visible');
  document.querySelector('.nav').style.display = "none";

  // загружаем сохранённые настройки
  state.colour = localStorage.getItem('ob_colour') || '#ffffff';

  const savedEngines = JSON.parse(localStorage.getItem('ob_engines') || '{}');
  state.engines = { ...state.engines, ...savedEngines };

  const customUrl = localStorage.getItem('ob_custom_url');
  if (customUrl) engineData.custom.url = customUrl;

  initApp();
}

// ── SETTINGS PANEL ──
const settingsPanel = document.getElementById('settings-panel');

document.getElementById('btn-edit').addEventListener('click', () => {
  settingsPanel.classList.add('open');
  // подсветить текущий цвет
  document.querySelectorAll('#settings-panel .colour-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.colour === state.colour);
  });
  // подсветить текущий движок
  document.querySelectorAll('.s-engine-btn').forEach(b => {
    b.classList.toggle('active', state.engines[b.dataset.engine] === true);
  });
  // город
  document.getElementById('settings-city').value = localStorage.getItem('ob_city') || '';
});

document.getElementById('settings-overlay').addEventListener('click', () => {
  settingsPanel.classList.remove('open');
});

// цвет в настройках
document.querySelectorAll('#settings-panel .colour-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
    state.colour = sw.dataset.colour;
    localStorage.setItem('ob_colour', state.colour);
    document.getElementById('clock').style.color = state.colour;
  });
});

document.getElementById('colour-input').addEventListener('input', (e) => {
  const picked = e.target.value;
  state.colour = picked;
  localStorage.setItem('ob_colour', picked);
  document.getElementById('clock').style.color = picked;
  document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => s.classList.remove('selected'));
  document.querySelector('.colour-picker-swatch').classList.add('selected');
});

// движок в настройках
document.querySelectorAll('.s-engine-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.s-engine-btn').forEach(b => {
      b.classList.remove('active');
      state.engines[b.dataset.engine] = false;
    });
    btn.classList.add('active');
    state.engines[btn.dataset.engine] = true;
    localStorage.setItem('ob_engines', JSON.stringify(state.engines));
    // обновить search bar сразу
    const bar = document.getElementById('search-bar');
    bar.innerHTML = '';
    Object.entries(engineData).forEach(([key, eng]) => {
      if (!state.engines[key]) return;
      const form = document.createElement('form');
      form.action = eng.url; form.method = 'get';
      form.target = '_blank'; form.className = 'search-form';
      const inp = document.createElement('input');
      inp.type = 'text'; inp.name = eng.param; inp.placeholder = eng.label;
      form.appendChild(inp); bar.appendChild(form);
    });
  });
});

// сохранить город
document.getElementById('settings-city-save').addEventListener('click', () => {
  const city = document.getElementById('settings-city').value.trim();
  if (city) localStorage.setItem('ob_city');
}); 