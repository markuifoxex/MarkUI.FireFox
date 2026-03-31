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

let borderRadiusTarget = 'all'

const defaultBorderRadius = {
  all:15,
  widgets:15,
  'add-link':15,
  'search-bar':15 
}

let borderRadiusState = JSON.parse(localStorage.getItem('ob_borderradius_map')) || defaultBorderRadius;

// ── ONBOARDING NAV ──
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dots = document.querySelectorAll('.dot');
const slides = document.querySelectorAll('.slide');

function goTo(n) {
  if (state.slide === 3 && n === 4) {
    const hasEngine = Object.values(state.engines).some(v => v === true);
    if (!hasEngine) {
      if (!document.getElementById('engine-warning')) {
        const warn = document.createElement('p');
        warn.id = 'engine-warning';
        warn.textContent = 'choose search engine';
        warn.style.cssText =
          'color:rgba(255,80,80,0.9); font-size:13px; margin-top:12px; letter-spacing:0.05em; font-family:"Oxygen";';
        const engineRow = document.querySelector('.slide.active .engine-row') || document.querySelector('.engine-row');
        if (engineRow) engineRow.after(warn);
      }
      return;
    }
  }

  if (slides[state.slide]) slides[state.slide].classList.remove('active');
  if (dots[state.slide]) dots[state.slide].classList.remove('active');

  state.slide = n;

  if (slides[state.slide]) slides[state.slide].classList.add('active');
  if (dots[state.slide]) dots[state.slide].classList.add('active');

  if (prevBtn) prevBtn.disabled = state.slide === 0;

  const isLast = state.slide === state.total - 1;
  if (nextBtn) {
    nextBtn.style.opacity = isLast ? '0' : '1';
    nextBtn.style.pointerEvents = isLast ? 'none' : 'all';
  }
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (state.slide > 0) goTo(state.slide - 1);
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (state.slide < state.total - 1) goTo(state.slide + 1);
  });
}

// ── COLOUR PICKER ──
document.querySelectorAll('.colour-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    if (!sw.dataset.colour) return;

    document.querySelectorAll('.colour-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');
    state.colour = sw.dataset.colour;
  });
}); 

// ── CITY INPUT ──
const showCityBtn = document.getElementById('show-city-input');
if (showCityBtn) {
  showCityBtn.addEventListener('click', () => {
    const cityInput = document.getElementById('input-city');
    if (!cityInput) return;
    cityInput.style.display = 'inline-block';
    showCityBtn.style.display = 'none';
    cityInput.focus();
  });
}

// ── ENGINE PICKER ──
document.querySelectorAll('.engine-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const engine = btn.dataset.engine;

    if (engine === 'custom') {
      document.querySelectorAll('.engine-btn').forEach(b => {
        b.classList.remove('active');
        if (b.dataset.engine) state.engines[b.dataset.engine] = false;
      });

      const customModal = document.getElementById('custom-modal');
      const customUrlInput = document.getElementById('custom-url');

      if (customModal) customModal.style.setProperty('display', 'flex', 'important');
      if (customUrlInput) customUrlInput.focus();
      return;
    }

    document.querySelectorAll('.engine-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.engine) state.engines[b.dataset.engine] = false;
    });

    btn.classList.add('active');
    state.engines[engine] = true;

    const warn = document.getElementById('engine-warning');
    if (warn) warn.remove();
  });
});

function closeCustomModal() {
  const modal = document.getElementById('custom-modal');
  if (modal) modal.style.display = 'none';
}

document.addEventListener('keydown', (event) => {
  const modal = document.getElementById('custom-modal');
  if (!modal) return;

  if (event.key === 'Escape' && getComputedStyle(modal).display !== 'none') {
    closeCustomModal();
  }
});

const customSaveBtn = document.getElementById('custom-save');
if (customSaveBtn) {
  customSaveBtn.addEventListener('click', () => {
    const customUrlInput = document.getElementById('custom-url');
    if (!customUrlInput) return;

    let url = customUrlInput.value.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const parsed = new URL(url);

      if (!parsed.hostname.includes('.')) {
        throw new Error();
      }

      if (parsed.pathname === '/' || parsed.pathname === '') {
        parsed.pathname = '/search';
      }

      url = parsed.href;
    } catch {
      alert('Enter a valid search URL\nExample:\nhttps://example.com/search');
      return;
    }

    document.querySelectorAll('.engine-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.engine) state.engines[b.dataset.engine] = false;
    });

    engineData.custom.url = url;
    engineData.custom.param = 'q';
    state.engines.custom = true;

    document.querySelectorAll('[data-engine="custom"]').forEach(el => {
      el.classList.add('active');
    });

    closeCustomModal();

    const warn = document.getElementById('engine-warning');
    if (warn) warn.remove();
  });
}

const customCancelBtn = document.getElementById('custom-cancel');
if (customCancelBtn) {
  customCancelBtn.addEventListener('click', () => {
    closeCustomModal();
  });
}

// ── FINISH ONBOARDING ──
const finishBtn = document.getElementById('btn-finish');
if (finishBtn) {
  finishBtn.addEventListener('click', launchApp);
}

function launchApp() {
  const ob = document.getElementById('onboarding');
  const app = document.getElementById('app');
  const nav = document.querySelector('.nav');
  const cityInput = document.getElementById('input-city');

  if (ob) {
    ob.classList.add('hidden');
    setTimeout(() => {
      ob.style.display = 'none';
    }, 700);
  }

  if (app) app.classList.add('visible');
  if (nav) nav.style.display = 'none';

  const city = cityInput ? cityInput.value.trim() : '';

  localStorage.setItem('ob_done', '1');
  localStorage.setItem('ob_colour', state.colour);
  localStorage.setItem('ob_city', city);
  localStorage.setItem('ob_engines', JSON.stringify(state.engines));
  localStorage.setItem('ob_custom_url', engineData.custom.url);

  initApp();
}

// ── ACCENT COLOUR ──
function applyAccentColour(colour, mode = 'theme') {

  document.documentElement.style.setProperty('--accent-colour', colour);

  const clock = document.getElementById('clock');
  if (clock) clock.style.color = colour;

  document.querySelectorAll('.search-form input').forEach(el => {
    el.style.borderColor = colour;
    el.style.color = colour;
  });

  document.querySelectorAll('#settings-drawer input:not(#colour-input):not(#settings-transparency)').forEach(el => {
  el.style.borderColor = colour;
  el.style.color = colour;
});

  document.querySelectorAll('.btn-finish').forEach(el => {
    el.style.borderColor = colour;
    el.style.color = colour;
  });

  document.querySelectorAll('.btn-mode').forEach(el => {
    el.style.borderColor = colour;
    el.style.color = colour;
  });

  document.querySelectorAll('.engine-btn').forEach(el => {
    el.style.borderColor = colour;
  });
  
  document.querySelectorAll('#btn-cancel, #btn-save, #custom-cancel, #custom-save').forEach(el => {
    el.style.borderColor = colour;
  });

  // 👉 ВАЖНО: разное поведение
  if (mode === 'theme') {
    // ВСЁ красится в выбранный цвет
    document.querySelectorAll(
  '.settings-label, .settings-label-w, .settings-label-t, .M-S, .f-w, .c-w, .settings-bor-cha, .security-mode').forEach(el => {
  el.style.color = colour;
});

    document.querySelectorAll('.p-u-w, .p-u-w-g').forEach(el => {
      el.style.color = colour;
    });

  } else {
    // ДЕФОЛТНАЯ ТЕМА (серые)
    document.querySelectorAll('.settings-label, .settings-label-w, .settings-label-t, .f-w, .c-w, .settings-bor-cha, .security-mode').forEach(el => {
  el.style.color = 'rgba(255,255,255,0.3)';
});

    document.querySelectorAll('.M-S').forEach(el => {
      el.style.color = 'rgba(255,255,255,0.655)';
    });

    document.querySelectorAll('.p-u-w, .p-u-w-g').forEach(el => {
      el.style.color = '#4f4f4f';
    });
  }
}

// Transparency changer 

function applyTransparency(alphaPercent) {
  const alpha = Math.max(0, Math.min(100, Number(alphaPercent))) / 100;
  const bgValue = `rgba(20, 20, 20, ${alpha})`;
  document.querySelectorAll('.search-bar input').forEach(el => {
    el.style.background = bgValue;
  });

  const settingsDrawer = document.getElementById('settings-drawer');
  if (settingsDrawer) {
    settingsDrawer.style.background = bgValue;
  }
}

function applyBorderRadiusByTarget(target, value) {
  const r = value + 'px';

  if (target === 'all' || target === 'search-bar') {
    document.querySelectorAll('.search-form input').forEach(el => {
      el.style.borderRadius = r;
    });
  }

  if (target === 'all' || target === 'add-link') {
    const addBtn = document.getElementById('add-btn');
    if (addBtn) addBtn.style.borderRadius = r;
  }

  if (target === 'all' || target === 'widgets') {
    document.querySelectorAll('.site-icon').forEach(el => {
      el.style.borderRadius = r;
    });
  }
}

function applyAllBorderRadiusSettings() {
  applyBorderRadiusByTarget('widgets', borderRadiusState.widgets);
  applyBorderRadiusByTarget('add-link', borderRadiusState['add-link']);
  applyBorderRadiusByTarget('search-bar', borderRadiusState['search-bar']);
}

const borderSave = document.getElementById('settings-border-save');
if (borderSave) {
  borderSave.addEventListener('click', () => {
    const input = document.getElementById('settings-borderradius');
    if (!input) return;

    const value = input.value;

    if (borderRadiusTarget === 'all') {
      borderRadiusState.all = value;
      borderRadiusState.widgets = value;
      borderRadiusState['add-link'] = value;
      borderRadiusState['search-bar'] = value;
      applyBorderRadiusByTarget('all', value);
    } else {
      borderRadiusState[borderRadiusTarget] = value;
      applyBorderRadiusByTarget(borderRadiusTarget, value);
    }

    localStorage.setItem('ob_borderradius_map', JSON.stringify(borderRadiusState));
  });

  const borderInput = document.getElementById('settings-borderradius');
  if (borderInput) {
    borderInput.addEventListener('input', () => {
      const value = borderInput.value;

      if (borderRadiusTarget === 'all') {
        applyBorderRadiusByTarget('all', value);
      } else {
        applyBorderRadiusByTarget(borderRadiusTarget, value);
      }
    });
  }
}

// ── INIT APP ──
function initApp() {
  const clockEl = document.getElementById('clock');
  applyAccentColour(state.colour);

  function tick() {
    if (!clockEl) return;
    const n = new Date();
    clockEl.textContent =
      String(n.getHours()).padStart(2, '0') + ':' +
      String(n.getMinutes()).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);

  const bar = document.getElementById('search-bar');
  if (bar) {
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
      
      inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('data-bwignore', 'true');
      inp.setAttribute('spellcheck', 'false');

      form.appendChild(inp);
      bar.appendChild(form);  

      const savedT = localStorage.getItem('ob_transparency');
      if (savedT) applyTransparency(savedT); else applyTransparency(15);
      
      applyAllBorderRadiusSettings();
    });
  }

  loadSites();

  const addBtn = document.getElementById('add-btn');
  const modal = document.getElementById('modal');
  const inputName = document.getElementById('input-name');
  const btnCancel = document.getElementById('btn-cancel');
  const btnSave = document.getElementById('btn-save');
  const inputUrl = document.getElementById('input-url');

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => {
      modal.classList.add('open');
      if (inputName) inputName.focus();
    });
  }

  if (btnCancel && modal) {
    btnCancel.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', saveSite);
  }

  if (inputUrl) {
    inputUrl.addEventListener('keydown', e => {
      if (e.key === 'Enter') saveSite();
    });
  }

  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
      if (typeof applySecurityMode === 'function') applySecurityMode();
    });
  }
}

applyAccentColour(state.colour);

// ── SAVE SITE ──
function saveSite() {
  const inputName = document.getElementById('input-name');
  const inputUrl = document.getElementById('input-url');
  const modal = document.getElementById('modal');

  let name = inputName ? inputName.value.trim() : '';
  let url = inputUrl ? inputUrl.value.trim() : '';

  if (!url) return;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

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

  if (inputName) inputName.value = '';
  if (inputUrl) inputUrl.value = '';
  if (modal) modal.classList.remove('open');

  loadSites();
}

// ── LOAD SITES ──
function loadSites() {
  const grid = document.getElementById('sites-grid');
  if (!grid) return;

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
      const i = parseInt(btn.dataset.index, 10);
      const sites = JSON.parse(localStorage.getItem('sites') || '[]');
      sites.splice(i, 1);
      localStorage.setItem('sites', JSON.stringify(sites));
      loadSites();
    });
  });
}

// ── SKIP ONBOARDING if already done ──
if (localStorage.getItem('ob_done') === '1') {
  const onboarding = document.getElementById('onboarding');
  const app = document.getElementById('app');
  const nav = document.querySelector('.nav');

  if (onboarding) onboarding.style.display = 'none';
  if (app) app.classList.add('visible');
  if (nav) nav.style.display = 'none';

  state.colour = localStorage.getItem('ob_colour') || '#ffffff';

  const savedEngines = JSON.parse(localStorage.getItem('ob_engines') || '{}');
  state.engines = { ...state.engines, ...savedEngines };

  const customUrl = localStorage.getItem('ob_custom_url');
  if (customUrl) engineData.custom.url = customUrl;

  const savedFont = localStorage.getItem('ob_font');
  const clock = document.getElementById('clock');

  if (savedFont) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${savedFont.replace(/ /g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);

    if (clock) {
      clock.style.fontFamily = `'${savedFont}', sans-serif`;
    }
  }

  document.querySelectorAll('search-form input').forEach(el => {
    el.style.fontFamily = `'${savedFont}', sans-serif`;
  });

  initApp();
  applyAccentColour(state.colour);
}

// ── FONT SAVE ──
const settingsFontSave = document.getElementById('settings-font-save');
if (settingsFontSave) {
  settingsFontSave.addEventListener('click', async () => {
    const fontInput = document.getElementById('settings-city-fonts');
    if (!fontInput) return;

    const font = fontInput.value.trim();
    if (!font) return;

    const testUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}`;

    try {
      const res = await fetch(testUrl);
      if (!res.ok) throw new Error();

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${testUrl}:wght@400;700&display=swap`;
      document.head.appendChild(link);

      const clock = document.getElementById('clock');
      if (clock) clock.style.fontFamily = `'${font}', sans-serif`;

      document.querySelectorAll('.search-form input').forEach(el => {
      el.style.fontFamily = `'${font}', sans-serif`;
      });

      localStorage.setItem('ob_font', font);

      const err = document.getElementById('font-error');
      if (err) err.remove();
    } catch {
      if (!document.getElementById('font-error')) {
        const err = document.createElement('p');
        err.id = 'font-error';
        err.textContent = 'font not found';
        err.style.cssText =
          'color:rgba(255,80,80,0.9); font-size:13px; margin-top:6px; letter-spacing:0.05em; font-family:"Jost"; text-align:center;';
        settingsFontSave.after(err);
      }
    }
  });
}

// ── SETTINGS PANEL ──
const settingsPanel = document.getElementById('settings-panel');
const btnEdit = document.getElementById('btn-edit');
const settingsOverlay = document.getElementById('settings-overlay');

if (btnEdit && settingsPanel) {
  btnEdit.addEventListener('click', () => {
    settingsPanel.classList.add('open');

    document.querySelectorAll('#settings-panel .colour-swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.colour === state.colour);
    });

    document.querySelectorAll('.s-engine-btn').forEach(b => {
      b.classList.toggle('active', state.engines[b.dataset.engine] === true);
    });

    const settingsCity = document.getElementById('settings-city');
    if (settingsCity) {
      settingsCity.value = localStorage.getItem('ob_city') || '';
    }
  });
}

const borderPickerToggle = document.getElementById('border-picker-toggle');
const borderTargetWrap = document.getElementById('border-target-wrap');

if (borderPickerToggle && borderTargetWrap) {
  borderPickerToggle.addEventListener('click', () => {
    borderPickerToggle.classList.toggle('open');
    borderTargetWrap.classList.toggle('open');
  });
}

document.querySelectorAll('.border-target-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.border-target-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    borderRadiusTarget = btn.dataset.target;

    const borderInput = document.getElementById('settings-borderradius');
    if (borderInput && borderRadiusState[borderRadiusTarget] !== undefined) {
      borderInput.value = borderRadiusState[borderRadiusTarget];
    }
  });
});

// цвет в настройках
document.querySelectorAll('#settings-panel .colour-swatch').forEach(sw => {
  
  sw.addEventListener('click', () => {
    if (!sw.dataset.colour) return;

    document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => s.classList.remove('selected'));
    sw.classList.add('selected');

    state.colour = sw.dataset.colour;
    localStorage.setItem('ob_colour', state.colour);
    applyAccentColour(state.colour);
  });
});

const colourInput = document.getElementById('colour-input');

if (colourInput) {
  colourInput.addEventListener('change', (e) => {
    const picked = e.target.value;

    state.colour = picked;
    localStorage.setItem('ob_colour', picked);

    applyAccentColour(picked, 'theme');

    document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => {
      s.classList.remove('selected');
    });

    const pickerSwatch = document.querySelector('.colour-picker-swatch');
    if (pickerSwatch) pickerSwatch.classList.add('selected');
  });
}

// движок в настройках
document.querySelectorAll('.s-engine-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const engine = btn.dataset.engine;

    document.querySelectorAll('.s-engine-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.engine) state.engines[b.dataset.engine] = false;
    });

    btn.classList.add('active');
    state.engines[engine] = true;
    localStorage.setItem('ob_engines', JSON.stringify(state.engines));

    const bar = document.getElementById('search-bar');
    if (!bar) return;

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
      const savedT = localStorage.getItem('ob_transparency');
      if (savedT) applyTransparency(savedT);

      const savedBR = localStorage.getItem('ob_borderradius')
      if (savedBR) applyBorderRadius(savedBR)
    });
  });
});

// сохранить город
const settingsCitySave = document.getElementById('settings-city-save');
if (settingsCitySave) {
  settingsCitySave.addEventListener('click', () => {
    const settingsCity = document.getElementById('settings-city');
    if (!settingsCity) return;

    const city = settingsCity.value.trim();
    if (city) localStorage.setItem('ob_city', city);
  });
}

const colourReset = document.getElementById('colour-reset');
if (colourReset) {
  colourReset.addEventListener('click', () => {
    const defaultColour = '#ffffff';

    state.colour = defaultColour;
    localStorage.setItem('ob_colour', defaultColour);

    // 👇 ВАЖНО
    applyAccentColour(defaultColour, 'default');

    const colourInput = document.getElementById('colour-input');
    if (colourInput) colourInput.value = defaultColour;

    document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => {
      s.classList.remove('selected');
    });

    const defaultSwatch = document.querySelector('#settings-panel [data-colour="#ffffff"]');
    if (defaultSwatch) defaultSwatch.classList.add('selected');
  });
}

const transparencySave = document.getElementById('settings-transparency-save');

if (transparencySave) {
  transparencySave.addEventListener('click', () => {
    const transparencyInput = document.getElementById('settings-transparency');

if (transparencyInput) {
  transparencyInput.addEventListener('input', () => {
    const value = transparencyInput.value;
    applyTransparency(value);
    localStorage.setItem('ob_transparency', value);
  });
}

    const value = transparencyInput.value;
    localStorage.setItem('ob_transparency', value);
    applyTransparency(value);
  });
}

// ── INDEXEDDB для обоев ──
function openWallpaperDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('wallpaperDB', 1);

    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('wallpapers');
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e);
  });
}

function saveWallpaperToDB(dataUrl) {
  return openWallpaperDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('wallpapers', 'readwrite');
      tx.objectStore('wallpapers').put(dataUrl, 'current');
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  });
}

function loadWallpaperFromDB() {
  return openWallpaperDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('wallpapers', 'readonly');
      const req = tx.objectStore('wallpapers').get('current');
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = reject;
    });
  });
}

// обои
const wallpaperInput = document.getElementById('wallpaper-input');
if (wallpaperInput) {
  wallpaperInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const app = document.getElementById('app');
      if (app) app.style.backgroundImage = `url(${dataUrl})`;
      saveWallpaperToDB(dataUrl);
    };

    reader.readAsDataURL(file);
  });
}

// загрузка обоев при старте
loadWallpaperFromDB().then(dataUrl => {
  if (dataUrl) {
    const app = document.getElementById('app');
    if (app) app.style.backgroundImage = `url(${dataUrl})`;
  }
});

const savedTransparency = localStorage.getItem('ob_transparency');

if (savedTransparency) {
  applyTransparency(savedTransparency);
} else {
  applyTransparency(15);
}

applyAllBorderRadiusSettings();

let securityMode = localStorage.getItem('ob_security') === '1';

function applySecurityMode() {
  document.querySelectorAll('.search-form input').forEach(el => {
    el.type = securityMode ? 'password' : 'text';
  });

  const stars = document.querySelectorAll('.btn-mode .star');
  stars.forEach((star, i) => {
    star.style.display = securityMode ? 'inline' : 'none';
  });

  const btnMode = document.querySelector('.btn-mode');
  if (btnMode) {
    btnMode.style.background = securityMode ? 'rgba(255,255,255,0.15)' : '';
  }

  // показываем цифры если режим выключен
  let nums = document.querySelector('.btn-mode-nums');
  if (!securityMode) {
    if (!nums) {
      nums = document.createElement('span');
      nums.className = 'btn-mode-nums';
      nums.textContent = '1 2 3 4 5 6';
      nums.style.cssText = 'font-size:12px; font-family: Jost; font-weight: 600; text-align:center; align-items:center; letter-spacing:2px; color:rgb(255, 255, 255);';
      document.querySelector('.btn-mode').appendChild(nums);
    }
    nums.style.display = 'inline';
  } else {
    if (nums) nums.style.display = 'none';
  }
}

const btnMode = document.querySelector('.btn-mode');
if (btnMode) {
  applySecurityMode();

  btnMode.addEventListener('click', () => {
    securityMode = !securityMode;
    localStorage.setItem('ob_security', securityMode ? '1' : '0');
    applySecurityMode();
  });
}

const themeBox = document.querySelector('.theme-store-box');
const themeModal = document.getElementById('theme-modal');

if (themeBox && themeModal) {
  themeBox.addEventListener('click', () => {
    themeModal.classList.add('open');
  });
}

themeModal.addEventListener('click', (e) => {
  if (e.target === themeModal) {
    themeModal.classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    themeModal.classList.remove('open');
  }
});

const themeClose = document.querySelector('.theme-x');

if (themeClose && themeModal) {
  themeClose.addEventListener('click', () => {
    themeModal.classList.remove('open');
  });
}