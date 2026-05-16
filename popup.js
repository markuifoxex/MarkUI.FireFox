  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.visibility = 'visible';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.15s ease';
      document.body.style.opacity = '1';
    });
  });

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
  document.querySelectorAll('.colour-swatch, .colour-swatch-f').forEach(sw => {
    sw.addEventListener('click', () => {
      if (!sw.dataset.colour) return;

      document.querySelectorAll('.colour-swatch, .colour-swatch-f').forEach(s => s.classList.remove('selected'));
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

const date = document.getElementById('date');
if (date) date.style.color = colour;

const weatherTemp = document.querySelector('.weather-temp');
    const weatherCity = document.querySelector('.weather-city');
    if (weatherTemp) weatherTemp.style.color = colour;
    if (weatherCity) weatherCity.style.color = colour;

    document.querySelectorAll('.search-form input').forEach(el => {
      el.style.borderColor = colour;
      el.style.color = colour;  
    });

    document.querySelectorAll('#settings-drawer input:not(#colour-input):not(#settings-transparency)').forEach(el => {
    el.style.borderColor = colour;
    el.style.color = colour;
  });

  document.querySelectorAll('#settings-date-format, #settings-date-separator').forEach(el => {
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
    '.settings-label, .settings-label-w, .settings-label-t, .M-S, .f-w, .c-w, .settings-bor-cha, .security-mode, .border-arrow, .widgets-h, .search-bar, .settingg' ).forEach(el => {
    el.style.color = colour;
  });

      document.querySelectorAll('.p-u-w, .p-u-w-g').forEach(el => {
        el.style.color = colour;
      });

    } else {
      // ДЕФОЛТНАЯ ТЕМА (серые)
      document.querySelectorAll('.settings-label, .settings-label-w, .settings-label-t, .f-w, .c-w, .settings-bor-cha, .security-mode, .border-arrow, .widgets-h, .search-bar').forEach(el => {
    el.style.color = 'rgba(255,255,255,0.3)';
  });

      document.querySelectorAll('.M-S').forEach(el => {
        el.style.color = 'rgba(255,255,255,0.655)';
      });

      document.querySelectorAll('.settingg').forEach(el => {
        el.style.color = 'rgb(255, 255, 255)';
      });      

      document.querySelectorAll('.p-u-w, .p-u-w-g').forEach(el => {
        el.style.color = '#4f4f4f';

        const weatherTemp = document.querySelector('.weather-temp');
      const weatherCity = document.querySelector('.weather-city');
      if (weatherTemp) weatherTemp.style.color = '#ffffff';
      if (weatherCity) weatherCity.style.color = '#ffffff';
      
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

  function formatDate(n) {

  const formatInput = document.getElementById('settings-date-format');
  const separatorInput = document.getElementById('settings-date-separator');

  const format =
    formatInput?.value ||
    localStorage.getItem('ob_date_format') ||
    'ddmmyyyy';

  const separator =
    separatorInput?.value ||
    localStorage.getItem('ob_date_separator') ||
    '.';

  const dd = String(n.getDate()).padStart(2,'0');
  const mm = String(n.getMonth()+1).padStart(2,'0');
  const yyyy = n.getFullYear();

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  switch(format){

    case 'ddmmyyyy':
      return `${dd}${separator}${mm}${separator}${yyyy}`;

    case 'mmddyyyy':
      return `${mm}${separator}${dd}${separator}${yyyy}`;

    case 'yyyyddmm':
      return `${yyyy}${separator}${dd}${separator}${mm}`;

    case 'yyyymmdd':
      return `${yyyy}${separator}${mm}${separator}${dd}`;

    case 'day_mon_short':
      return `${days[n.getDay()]} ${dd} ${months[n.getMonth()]}`;

    case 'dd_mon_short':
      return `${dd} ${months[n.getMonth()]}`;

    case 'mon_dd_short':
      return `${months[n.getMonth()]} ${dd}`;
  }
}

function applySavedFont(font) {
  if (!font) return;

  const fontUrl =
    `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;700&display=swap`;

  if (!document.querySelector(`link[data-font="${font}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.dataset.font = font;
    document.head.appendChild(link);
  }

  const family = `'${font}', sans-serif`;

  // часы
  const clock = document.getElementById('clock');
  const date = document.getElementById('date');

  if (clock) clock.style.fontFamily = family;
  if (date) date.style.fontFamily = family;

  // поиск
  document.querySelectorAll('.search-form input').forEach(el => {
    el.style.fontFamily = family;
  });

  // погода
  const weatherWidget = document.getElementById('weather-widget');
  const weatherContent = document.getElementById('weather-content');
  const weatherLock = document.getElementById('weather-lock');

  if (weatherWidget) weatherWidget.style.fontFamily = family;
  if (weatherContent) weatherContent.style.fontFamily = family;
  if (weatherLock) weatherLock.style.fontFamily = family;
}

  // ── INIT APP ──
  function initApp() {
    const clockEl = document.getElementById('clock');
    applyAccentColour(state.colour);

    function tick() {
  const n = new Date();

  // часы
  clockEl.textContent =
    String(n.getHours()).padStart(2,'0') + ':' +
    String(n.getMinutes()).padStart(2,'0');

  // дата
  const dateEl = document.getElementById('date');

  if (dateEl) {
  dateEl.textContent = formatDate(n);
}
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
        inp.setAttribute('data-lpignore', 'true');
        inp.setAttribute('autocomplete', 'new-password');

        form.appendChild(inp);
        bar.appendChild(form);  

        const savedT = localStorage.getItem('ob_transparency');
        if (savedT) applyTransparency(savedT); else applyTransparency(15);
        
        applyAllBorderRadiusSettings();

        const savedClockSize = localStorage.getItem('ob_clock_size');
          if (savedClockSize) {
              applyClockSize(savedClockSize);
          } 
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

    
// В самом конце initApp(), после всего:
  if (localStorage.getItem('ob_date_hidden') === '1') {
    const date = document.getElementById('date');
    if (date) date.style.display = 'none';
  }
  if (localStorage.getItem('ob_clock_hidden') === '1') {
    const clock = document.getElementById('clock');
    if (clock) clock.style.display = 'none';
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

if (savedFont) {
  applySavedFont(savedFont);
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
        const date = document.getElementById('date');

        if (clock) clock.style.fontFamily = `'${font}', sans-serif`;
        if (date) date.style.fontFamily = `'${font}', sans-serif`;

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

  // закрытие при клике вне панели
  if (settingsOverlay && settingsPanel) {
    settingsOverlay.addEventListener('click', () => {
      settingsPanel.classList.remove('open');
    });
  }

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

// ── CUSTOM COLOR PICKER ──
(function() {
  const pickerSwatch = document.querySelector('.colour-picker-swatch');
  if (!pickerSwatch) return;

  // Создаём попап
  const popup = document.createElement('div');
  popup.id = 'custom-color-popup';
  popup.innerHTML = `
    <div id="ccp-gradient">
      <div id="ccp-white"></div>
      <div id="ccp-black"></div>
      <div id="ccp-cursor"></div>
    </div>
    <div id="ccp-hue-wrap">
      <input type="range" id="ccp-hue" min="0" max="360" value="0">
    </div>
    <div id="ccp-bottom">
      <div id="ccp-preview"></div>
      <input type="text" id="ccp-hex" maxlength="7" placeholder="#ffffff">
      <button id="ccp-apply">apply</button>
    </div>
  `;
  popup.style.cssText = `
    display:none;
    position:absolute;
    z-index:9999;
    background:rgba(30,30,30,0.98);
    border:1px solid rgba(255,255,255,0.15);
    border-radius:14px;
    padding:14px;
    width:220px;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);
    left: -120px;
    top: calc(100% + 8px);
  `;

  // Вставляем попап внутрь .custom-colour-box
  const box = document.querySelector('.custom-colour-box');
  if (box) {
    box.style.position = 'relative';
    box.appendChild(popup);
  }

  // Стили для элементов пикера
  const style = document.createElement('style');
  style.textContent = `
    #ccp-gradient {
      position: relative;
      width: 192px;
      height: 140px;
      border-radius: 8px;
      overflow: hidden;
      cursor: crosshair;
    }
    #ccp-white {
      position: absolute; inset: 0;
      background: linear-gradient(to right, #fff, transparent);
    }
    #ccp-black {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent, #000);
    }
    #ccp-cursor {
      position: absolute;
      width: 12px; height: 12px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 3px rgba(0,0,0,0.8);
      transform: translate(-50%, -50%);
      pointer-events: none;
      left: 100%; top: 0%;
    }
    #ccp-hue-wrap {
      margin-top: 10px;
    }
    #ccp-hue {
      -webkit-appearance: none;
      width: 192px;
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(to right,
        hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%),
        hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%),
        hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%),
        hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%),
        hsl(360,100%,50%));
      outline: none;
      border: none;
      cursor: pointer;
    }
    #ccp-hue::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid rgba(0,0,0,0.3);
      cursor: pointer;
    }
    #ccp-hue::-moz-range-thumb {
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid rgba(0,0,0,0.3);
      cursor: pointer;
    }
    #ccp-bottom {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }
    #ccp-preview {
      width: 28px; height: 28px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2);
      flex-shrink: 0;
      background: #fff;
    }
    #ccp-hex {
      flex: 1;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      color: #fff;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      padding: 4px 8px;
      outline: none;
      min-width: 0;
    }
    #ccp-apply {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      color: #fff;
      font-family: 'Jost', sans-serif;
      font-size: 12px;
      padding: 4px 10px;
      cursor: pointer;
      flex-shrink: 0;
    }
    #ccp-apply:hover {
      background: rgba(255,255,255,0.1);
    }
  `;
  document.head.appendChild(style);

  // Состояние пикера
  let hue = 0;
  let saturation = 1;
  let brightness = 1;

  const gradientEl = document.getElementById('ccp-gradient');
  const hueInput = document.getElementById('ccp-hue');
  const cursor = document.getElementById('ccp-cursor');
  const preview = document.getElementById('ccp-preview');
  const hexInput = document.getElementById('ccp-hex');
  const applyBtn = document.getElementById('ccp-apply');

  function hsvToHex(h, s, v) {
    let r, g, b;
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    if (i === 0) { r=v; g=t; b=p; }
    else if (i === 1) { r=q; g=v; b=p; }
    else if (i === 2) { r=p; g=v; b=t; }
    else if (i === 3) { r=p; g=q; b=v; }
    else if (i === 4) { r=t; g=p; b=v; }
    else { r=v; g=p; b=q; }
    return '#' + [r,g,b].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('');
  }

  function hexToHsv(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    const d = max - min;
    let h = 0, s = max === 0 ? 0 : d/max, v = max;
    if (d !== 0) {
      if (max === r) h = ((g-b)/d + (g<b?6:0)) * 60;
      else if (max === g) h = ((b-r)/d + 2) * 60;
      else h = ((r-g)/d + 4) * 60;
    }
    return { h, s, v };
  }

  function updateUI() {
    gradientEl.style.background = `hsl(${hue}, 100%, 50%)`;
    const hex = hsvToHex(hue, saturation, brightness);
    preview.style.background = hex;
    hexInput.value = hex;

    const oldHexInput = document.getElementById('hex-input');
    if (oldHexInput) oldHexInput.value = hex;

    cursor.style.left = (saturation * 192) + 'px';
    cursor.style.top = ((1 - brightness) * 140) + 'px';
  }

  // Drag по градиенту
  let dragging = false;
  gradientEl.addEventListener('mousedown', (e) => {
    dragging = true;
    pickFromGradient(e);
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    pickFromGradient(e);
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  function pickFromGradient(e) {
    const rect = gradientEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, 192));
    const y = Math.max(0, Math.min(e.clientY - rect.top, 140));
    saturation = x / 192;
    brightness = 1 - y / 140;
    updateUI();
  }

  // Hue слайдер
  hueInput.addEventListener('input', () => {
    hue = Number(hueInput.value);
    updateUI();
  });

  // HEX инпут
  hexInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    applyHex();
  });

  hexInput.addEventListener('blur', applyHex);

  function applyHex() {
    let val = hexInput.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (!/^#[0-9A-Fa-f]{6}$/.test(val)) return;

    const { h, s, v } = hexToHsv(val);
    hue = h;
    saturation = s;
    brightness = v;
    hueInput.value = hue;
    updateUI();
  }

  // Apply кнопка
  applyBtn.addEventListener('click', () => {
    const oldHexField = document.getElementById('hex-input');
  if (oldHexField) {
    oldHexField.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      let val = oldHexField.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (!/^#[0-9A-Fa-f]{6}$/.test(val)) return;
      const { h, s, v } = hexToHsv(val);
      hue = h; saturation = s; brightness = v;
      hueInput.value = hue;
      updateUI();
      state.colour = val;
      localStorage.setItem('ob_colour', val);
      applyAccentColour(val, 'theme');
      document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => s.classList.remove('selected'));
    });
  }
    const hex = hsvToHex(hue, saturation, brightness);
    state.colour = hex;
    localStorage.setItem('ob_colour', hex);
    applyAccentColour(hex, 'theme');

    // Снимаем selected со всех свотчей
    document.querySelectorAll('#settings-panel .colour-swatch').forEach(s => s.classList.remove('selected'));

    popup.style.display = 'none';
  });

  // Открытие/закрытие попапа
  pickerSwatch.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = popup.style.display === 'block';
    popup.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      // Синхронизируем с текущим цветом
      const { h, s, v } = hexToHsv(state.colour || '#ffffff');
      hue = h; saturation = s; brightness = v;
      hueInput.value = hue;
      updateUI();
    }
  });

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && e.target !== pickerSwatch) {
      popup.style.display = 'none';
    }
  });

  updateUI();
})();

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

      const wTemp = document.querySelector('.weather-temp');
      const wCity = document.querySelector('.weather-city');
      if (wTemp) wTemp.style.color = '#ffffff';
      if (wCity) wCity.style.color = '#ffffff';

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
        localStorage.removeItem('ob_wallpaper_url'); // сброс стор-обоев
        saveWallpaperToDB(dataUrl);
      };

      reader.readAsDataURL(file);
    });
  }

  // загрузка обоев при старте
  // Сначала проверяем URL из стора, потом IndexedDB (загруженный файл)
  const savedWallpaperUrl = localStorage.getItem('ob_wallpaper_url');
  if (savedWallpaperUrl) {
    const app = document.getElementById('app');
    if (app) app.style.backgroundImage = `url(${savedWallpaperUrl})`;
  } else {
    loadWallpaperFromDB().then(dataUrl => {
      if (dataUrl) {
        const app = document.getElementById('app');
        if (app) app.style.backgroundImage = `url(${dataUrl})`;
      }
    });
  }

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

  // Применение обоев

  document.querySelectorAll(".theme-item-apple .theme-card, .theme-item-window .theme-card, .theme-item-linux .theme-card, .theme-item-quotes .theme-card, .theme-item-Duck .theme-card, .theme-item-pink .theme-card, .theme-item-reddot .theme-card, .theme-item-redq .theme-card, .theme-item-krak .theme-card, .theme-item-wars .theme-card, .theme-item-Japan .theme-card, .theme-item-Fantasy .theme-card, .theme-item-f1 .theme-card, .theme-item-2026 .theme-card, .theme-item-Dog .theme-card, .theme-item-Cat .theme-card, .theme-item-Gorilla .theme-card, .theme-item-Cloud .theme-card, .theme-item-popy .theme-card, .theme-item-jojo .theme-card, .theme-item-tutu .theme-card, .theme-item-nite .theme-card, .theme-item-w11b .theme-card, .theme-item-w11w .theme-card, .theme-item-scifi .theme-card, .theme-item-sci-fi .theme-card, .theme-item-11 .theme-card, .theme-item-mac .theme-card, .theme-item-mono .theme-card, .theme-item-chrome .theme-card, .theme-item-xbox .theme-card, .theme-item-ps .theme-card, .theme-item-anon .theme-card, .theme-item-code .theme-card, .theme-item-l-love .theme-card, .theme-item-d-love .theme-card, .theme-item-boy .theme-card, .theme-item-girl .theme-card, .theme-item-Abstract-1 .theme-card, .theme-item-Abstract-1 .theme-card, .theme-item-k-pop .theme-card, .theme-item-mountains .theme-card, .theme-item-Geometric .theme-card, .theme-item-Geometric-m .theme-card, .theme-item-geo .theme-card, .theme-item-geom .theme-card, .theme-item-gold .theme-card, .theme-item-m-build .theme-card, .theme-item-build .theme-card, .theme-item-anime-1 .theme-card, .theme-item-anime-2 .theme-card, .theme-item-anime-3 .theme-card, .theme-item-anime-4 .theme-card, .theme-item-anime-5 .theme-card, .theme-item-anime-6 .theme-card, .theme-item-anime-7 .theme-card, .theme-item-anime-8 .theme-card, .theme-item-anime-9 .theme-card, .theme-item-anime-10 .theme-card, .theme-item-anime-11 .theme-card, .theme-item-anime-12 .theme-card, .theme-item-anime-13 .theme-card, .theme-item-anime-14 .theme-card, .theme-item-car .theme-card, .theme-item-wave .theme-card, .theme-item-retro .theme-card, .theme-item-mount .theme-card, .theme-item-sun .theme-card, .theme-item-white .theme-card, .theme-item-neon .theme-card, .theme-item-yellow .theme-card, .theme-item-pink-ast .theme-card").forEach(img => {
    img.style.cursor = "pointer";
    img.addEventListener('click', () => {
      const src = img.src;
      const app = document.getElementById('app');
      if (app) {
    app.style.transition = 'opacity 0.4s ease';
    app.style.opacity = '0';
    setTimeout(() => {
      app.style.backgroundImage = `url(${src})`;
      app.style.opacity = '1';
    }, 400);
  }

      // Сохраняем как URL (не IndexedDB — это не загруженный файл)

      localStorage.setItem('ob_wallpaper_url', src);

      //  закрывание окна

      const themeModal = document.getElementById('theme-modal');
      if (themeModal) themeModal.classList.remove('open');
    });
  });

  // Opened Widgets Grid

  const widgetsOpenBtn = document.getElementById('widgets-open-btn');
  const widgetEditor = document.getElementById('widget-editor');
  const widgetEditorClose = document.getElementById('widget-editor-close');
  const widgetGrid = document.getElementById('widget-grid');

  if (widgetsOpenBtn && widgetEditor) {
    widgetsOpenBtn.addEventListener('click', () => {
      widgetEditor.classList.add('open');
    });
  }

  if (widgetEditorClose && widgetEditor) {
    widgetEditorClose.addEventListener('click', () => {
      widgetEditor.classList.remove('open');
    });
  }

  document.querySelectorAll('.widget-item').forEach(item => {
    item.addEventListener('dragstart', e => {
      e.dataTransfer.setData('widget-type', item.dataset.widget);
    });
  });

  let draggingWidget = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  if (widgetGrid) {
    widgetGrid.addEventListener('dragover', e => {
      e.preventDefault();
    });

    widgetGrid.addEventListener('drop', e => {
      e.preventDefault();

      // Если тащим уже существующий виджет — перемещаем
      if (draggingWidget) {
        const rect = widgetGrid.getBoundingClientRect();
        draggingWidget.style.left = (e.clientX - rect.left - dragOffsetX) + 'px';
        draggingWidget.style.top  = (e.clientY - rect.top  - dragOffsetY) + 'px';
        draggingWidget = null;
        return;
      }

      // Иначе создаём новый виджет из панели
      const type = e.dataTransfer.getData('widget-type');
      if (!type) return;

      const rect = widgetGrid.getBoundingClientRect();
      const widget = document.createElement('div');
      widget.className = 'placed-widget';
      widget.innerHTML = `
    <span>${type}</span>
    <span class="widget-delete" style="
      position:absolute; top:-8px; right:-8px;
      width:18px; height:18px; border-radius:50%;
      background:rgba(255,60,60,0.85); color:white;
      font-size:11px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      line-height:1;
    ">✕</span>
  `;
  widget.style.position = 'relative';
      widget.draggable = true;

      widget.style.position = 'absolute';
      widget.style.left = (e.clientX - rect.left) + 'px';
      widget.style.top  = (e.clientY - rect.top)  + 'px';
      widget.style.padding = '12px 18px';
      widget.style.borderRadius = '16px';
      widget.style.border = '1px solid rgba(255,255,255,0.35)';
      widget.style.background = 'rgba(255,255,255,0.1)';
      widget.style.color = 'white';
      widget.style.fontFamily = 'Jost, sans-serif';
      widget.style.cursor = 'grab';
      widget.style.userSelect = 'none';

      // Делаем уже размещённый виджет перетаскиваемым
      widget.addEventListener('dragstart', e => {
        draggingWidget = widget;
        const wRect = widget.getBoundingClientRect();
        dragOffsetX = e.clientX - wRect.left;
        dragOffsetY = e.clientY - wRect.top;
        e.dataTransfer.setData('widget-type', ''); // чтобы не создавался новый
      });

      widgetGrid.appendChild(widget);

      widget.addEventListener('click', e => {
    if (e.target.classList.contains('widget-delete')) return;
    openWidgetSettings(widget, type);
  });

      widget.querySelector('.widget-delete').addEventListener('click', e => {
    e.stopPropagation();
    widget.remove();

        });
    });
  }

  const app = document.getElementById('app');

  if (widgetsOpenBtn && widgetEditor && app) {
    widgetsOpenBtn.addEventListener('click', () => {
      app.classList.add('editing-widgets');
      widgetEditor.classList.add('open');
    });
  }

  if (widgetEditorClose && widgetEditor && app) {
    widgetEditorClose.addEventListener('click', () => {
      app.classList.remove('editing-widgets');
      widgetEditor.classList.remove('open');
    });
  }

  function openWidgetSettings(widget, type) {
    const existing = document.getElementById('widget-settings-modal');
    if (existing) existing.remove();

    const modal = document.getElementById('widget-settings-modal-template').cloneNode(true);
    modal.id = 'widget-settings-modal';
    modal.style.display = 'flex';

    modal.querySelector('.ws-title').textContent = type + ' settings';

    document.body.appendChild(modal);

    modal.querySelector('#ws-color').addEventListener('input', e => {
      widget.style.color = e.target.value;
    });
    modal.querySelector('#ws-size').addEventListener('input', e => {
      widget.style.fontSize = e.target.value + 'px';
    });
    modal.querySelector('#ws-bg').addEventListener('input', e => {
      widget.style.background = e.target.value;
    });
    modal.querySelector('#ws-radius').addEventListener('input', e => {
      widget.style.borderRadius = e.target.value + 'px';
    });
    modal.querySelector('#ws-opacity').addEventListener('input', e => {
    const alpha = e.target.value / 100;
    const currentBg = widget.style.background || 'rgba(255,255,255,0.1)';
    // Парсим цвет и применяем только к фону
    const hex = modal.querySelector('#ws-bg').value;
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    widget.style.background = `rgba(${r},${g},${b},${alpha})`;
  });

    modal.querySelector('#ws-save').addEventListener('click', () => modal.remove());
    modal.querySelector('#ws-cancel').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  // catalog widgets panel 

  const widgetVariants = {
    clock: [
      { label: 'Digital', preview: '12:34', style: 'font-size:32px; padding:20px 28px; letter-spacing:4px;' },
      { label: 'Minimal', preview: '12:34', style: 'font-size:18px; padding:12px 20px; opacity:0.7;' },
      { label: 'Big', preview: '12:34', style: 'font-size:52px; padding:24px 32px; letter-spacing:6px;' },
      { label: 'Box', preview: '12:34', style: 'font-size:28px; padding:20px; border:2px solid white; width:120px; text-align:center;' },
    ],
    weather: [
      { label: 'Simple', preview: '☀️ 22°C', style: 'font-size:18px; padding:16px 24px;' },
      { label: 'Big', preview: '☀️\n22°C', style: 'font-size:28px; padding:24px; text-align:center; white-space:pre;' },
      { label: 'Minimal', preview: '22°', style: 'font-size:42px; padding:12px 20px; opacity:0.8;' },
      { label: 'Card', preview: '☀️ Sunny\n22°C / 18°C', style: 'font-size:14px; padding:16px 20px; line-height:1.8; white-space:pre;' },
    ],
    notes: [
      { label: 'Small', preview: '📝 note...', style: 'font-size:13px; padding:12px 16px; width:140px;' },
      { label: 'Medium', preview: '📝 note...', style: 'font-size:14px; padding:16px 20px; width:200px; min-height:80px;' },
      { label: 'Large', preview: '📝 note...', style: 'font-size:14px; padding:20px; width:280px; min-height:140px;' },
      { label: 'Sticky', preview: '📝 note...', style: 'font-size:13px; padding:16px; width:160px; min-height:160px; background:rgba(255,220,50,0.15); border-color:rgba(255,220,50,0.4);' },
    ],
    quote: [
      { label: 'Simple', preview: '"Quote text"', style: 'font-size:14px; padding:16px 20px; font-style:italic;' },
      { label: 'Big', preview: '"Quote\ntext"', style: 'font-size:20px; padding:24px; font-style:italic; white-space:pre; max-width:280px;' },
      { label: 'Minimal', preview: '" Q "', style: 'font-size:13px; padding:10px 16px; opacity:0.7; font-style:italic;' },
      { label: 'Card', preview: '"Quote text"\n— Author', style: 'font-size:13px; padding:20px; white-space:pre; line-height:1.8; max-width:240px;' },
    ]
  };

  function openWidgetPicker(type) {
    const modal = document.getElementById('widget-picker-modal');
    const title = document.getElementById('widget-picker-title');
    const grid  = document.getElementById('widget-picker-grid');

    title.textContent = type + '';
    grid.innerHTML = '';

    widgetVariants[type].forEach(variant => {
      const card = document.createElement('div');
      card.style.cssText = `
        background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15);
        border-radius:14px; padding:16px; cursor:pointer; text-align:center;
        transition: background 0.2s;
      `;
      card.innerHTML = `
        <div style="font-size:11px; letter-spacing:0.1em; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-bottom:10px;">${variant.label}</div>
        <div style="${variant.style} background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:12px; color:white; font-family:'Jost',sans-serif; display:inline-block;">${variant.preview}</div>
      `;

      card.addEventListener('mouseenter', () => card.style.background = 'rgba(255,255,255,0.12)');
      card.addEventListener('mouseleave', () => card.style.background = 'rgba(255,255,255,0.06)');

      card.addEventListener('click', () => {
        modal.style.display = 'none';
        placeWidget(type, variant);
      });

      grid.appendChild(card);
    });

    modal.style.display = 'flex';
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function placeWidget(type, variant) {
    const widgetGrid = document.getElementById('widget-grid');
    if (!widgetGrid) return;

    const widget = document.createElement('div');
    widget.className = 'placed-widget';
    widget.draggable = true;
    widget.innerHTML = `
      <span>${variant.preview}</span>
      <span class="widget-delete" style="
        position:absolute; top:-8px; right:-8px;
        width:18px; height:18px; border-radius:50%;
        background:rgba(255,60,60,0.85); color:white;
        font-size:11px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
      ">✕</span>
    `;

  widget.style.cssText = `
      position:absolute; left:60px; top:60px;
      ${variant.style}
      border:1px solid rgba(255,255,255,0.35);
      background:rgba(255,255,255,0.1);
      color:white; font-family:'Jost',sans-serif;
      cursor:grab; user-select:none;
      border-radius:16px; white-space:pre;
      display:flex; align-items:center; justify-content:center;
    `;

    widget.addEventListener('dragstart', e => {
      draggingWidget = widget;
      const wRect = widget.getBoundingClientRect();
      dragOffsetX = e.clientX - wRect.left;
      dragOffsetY = e.clientY - wRect.top;
      e.dataTransfer.setData('widget-type', '');
    });

    widget.querySelector('.widget-delete').addEventListener('click', e => {
      e.stopPropagation();
      widget.remove();
    });

    widget.addEventListener('click', e => {
      if (e.target.classList.contains('widget-delete')) return;
      openWidgetSettings(widget, type);
    });

    widgetGrid.appendChild(widget);
  }

  function applyClockSize(size) {
  const clock = document.getElementById('clock');
  if (!clock) return;

  clock.style.fontSize = size + 'px';
}

const clockSizeInput = document.getElementById('settings-clock-size');
const clockSizeText = document.getElementById('settings-clock-size-text');
const clockSizeSave = document.getElementById('settings-clock-size-save');

function showClockSizeError(message) {
  const oldError = document.getElementById('clock-size-error');
  if (oldError) oldError.remove();

  const err = document.createElement('p');
  err.id = 'clock-size-error';
  err.textContent = message;
  err.style.cssText = `
    color: rgba(255,80,80,0.9);
    font-size: 11px;
    margin-top: 6px;
    letter-spacing: 0.04em;
    font-family: Poppins, sans-serif;
    font-weight: 400;
    text-align: center;
  `;

  if (clockSizeText) {
    clockSizeText.after(err);
  }
}

function clearClockSizeError() {
  const oldError = document.getElementById('clock-size-error');
  if (oldError) oldError.remove();
}

if (clockSizeInput && clockSizeText) {
  const saved = localStorage.getItem('ob_clock_size') || '75';

  clockSizeInput.value = saved;
  clockSizeText.value = saved + 'px';
  applyClockSize(saved);

  // slider
  clockSizeInput.addEventListener('input', () => {
    const val = clockSizeInput.value;

    applyClockSize(val);
    clockSizeText.value = val + 'px';
    clearClockSizeError();
  });

  // очищаем ошибку при вводе
  clockSizeText.addEventListener('input', () => {
    clearClockSizeError();
  });

  // ручной ввод
  clockSizeText.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    let val = clockSizeText.value.trim().toLowerCase();
    val = val.replace('px', '').trim();

    const num = Number(val);

    if (!val) {
      showClockSizeError('Enter size');
      return;
    }

    if (Number.isNaN(num)) {
      showClockSizeError('Only numbers, for example 48px');
      return;
    }

    if (num < 1 || num > 220) {
      showClockSizeError('Allowed from 1px to 220px');
      return;
    }

    applyClockSize(num);
    clockSizeInput.value = num;
    clockSizeText.value = num + 'px';
    clearClockSizeError();
  });
}

if (clockSizeSave && clockSizeInput && clockSizeText) {
  clockSizeSave.addEventListener('click', () => {

    let val = clockSizeText.value.trim().toLowerCase();
    val = val.replace('px', '').trim();

    const num = Number(val);

    if (!val) {
      showClockSizeError('Enter size');
      return;
    }

    if (Number.isNaN(num)) {
      showClockSizeError('Only numbers, example 48px');
      return;
    }

    if (num < 1 || num > 220) {
      showClockSizeError('Allowed from 1px to 220px');
      return;
    }

    applyClockSize(num);

    clockSizeInput.value = num;
    clockSizeText.value = num + 'px';

    localStorage.setItem('ob_clock_size', num);

    clearClockSizeError();
  });
}

const dateFormatInput = document.getElementById('settings-date-format');
const dateSeparatorInput = document.getElementById('settings-date-separator');
const dateSaveBtn = document.getElementById('settings-date-save');

function updateDatePreview() {
  const dateEl = document.getElementById('date');
  if (!dateEl) return;

  dateEl.textContent = formatDate(new Date());
}

if (dateFormatInput) {
  dateFormatInput.addEventListener('input', updateDatePreview);
  dateFormatInput.addEventListener('change', updateDatePreview);
}

if (dateSeparatorInput) {
  dateSeparatorInput.addEventListener('input', updateDatePreview);
  dateSeparatorInput.addEventListener('change', updateDatePreview);
}

if (dateFormatInput && dateSeparatorInput) {
  const savedFormat = localStorage.getItem('ob_date_format') || 'ddmmyyyy';
  const savedSeparator = localStorage.getItem('ob_date_separator') || '.';

  dateFormatInput.value = savedFormat;
  dateSeparatorInput.value = savedSeparator;
}

if (dateSaveBtn && dateFormatInput && dateSeparatorInput) {
  dateSaveBtn.addEventListener('click', () => {
    localStorage.setItem('ob_date_format', dateFormatInput.value);
    localStorage.setItem('ob_date_separator', dateSeparatorInput.value);
  });
}

function applyDateSize(size) {
  const date = document.getElementById('date');
  if (!date) return;

  date.style.fontSize = size + 'px';
}

const dateSizeInput = document.getElementById('settings-date-size');
const dateSizeText = document.getElementById('settings-date-size-text');
const dateSizeSave = document.getElementById('settings-date-size-save');

function showDateSizeError(message) {
  const oldError = document.getElementById('date-size-error');
  if (oldError) oldError.remove();

  const err = document.createElement('p');
  err.id = 'date-size-error';
  err.textContent = message;
  err.style.cssText = `
    color: rgba(255,80,80,0.9);
    font-size: 11px;
    margin-top: 6px;
    letter-spacing: 0.04em;
    font-family: Poppins, sans-serif;
    font-weight: 400;
    text-align: center;
  `;

  if (dateSizeText) {
    dateSizeText.after(err);
  }
}

function clearDateSizeError() {
  const oldError = document.getElementById('date-size-error');
  if (oldError) oldError.remove();
}

if (dateSizeInput && dateSizeText) {
  const saved = localStorage.getItem('ob_date_size') || '18';

  dateSizeInput.value = saved;
  dateSizeText.value = saved + 'px';
  applyDateSize(saved);

  // live preview от slider
  dateSizeInput.addEventListener('input', () => {
    const val = dateSizeInput.value;

    applyDateSize(val);
    dateSizeText.value = val + 'px';
    clearDateSizeError();
  });

  // чистим ошибку при вводе
  dateSizeText.addEventListener('input', () => {
    clearDateSizeError();
  });

  // live preview от текста
  dateSizeText.addEventListener('input', () => {
    let val = dateSizeText.value.trim().toLowerCase().replace('px', '').trim();
    const num = Number(val);

    if (!val || Number.isNaN(num) || num < 1 || num > 220) return;

    applyDateSize(num);
    dateSizeInput.value = num;
  });
}

if (dateSizeSave && dateSizeInput && dateSizeText) {
  dateSizeSave.addEventListener('click', () => {
    let val = dateSizeText.value.trim().toLowerCase().replace('px', '').trim();
    const num = Number(val);

    if (!val) {
      showDateSizeError('Enter size');
      return;
    }

    if (Number.isNaN(num)) {
      showDateSizeError('Only numbers, example 18px');
      return;
    }

    if (num < 1 || num > 220) {
      showDateSizeError('Allowed from 1px to 220px');
      return;
    }

    applyDateSize(num);
    dateSizeInput.value = num;
    dateSizeText.value = num + 'px';

    localStorage.setItem('ob_date_size', num);
    clearDateSizeError();
  });
}

const addWeatherWidget = document.getElementById('add-weather-widget');
const weatherModal = document.getElementById('weather-modal');
const weatherInput = document.getElementById('weather-city-input');
const weatherSave = document.getElementById('weather-save');
const weatherCancel = document.getElementById('weather-cancel');

if (addWeatherWidget && weatherModal) {
  addWeatherWidget.addEventListener('click', () => {
    weatherModal.classList.add('open');
    if (weatherInput) weatherInput.focus();
  });
}

if (weatherCancel && weatherModal) {
  weatherCancel.addEventListener('click', () => {
    weatherModal.classList.remove('open');
  });
}

async function loadWeather(city) {
const widget = document.getElementById('weather-widget');
const content = document.getElementById('weather-content');

if (!widget || !content) return;

widget.style.display = 'block';
content.textContent = 'Loading...';

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      widget.textContent = 'City not found';
      return;
    }

    const place = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const temp = Math.round(weatherData.current.temperature_2m);

content.innerHTML = `
  <div class="weather-city">${place.name}</div>
  <div class="weather-temp">${temp}°C</div>
`;

const savedWeatherSize = localStorage.getItem('ob_weather_size') || 32;
applyWeatherSize(savedWeatherSize);

const colour = localStorage.getItem('ob_colour') || '#ffffff';
const wTemp = document.querySelector('.weather-temp');
const wCity = document.querySelector('.weather-city');
if (wTemp) wTemp.style.color = colour;
if (wCity) wCity.style.color = colour;

requestAnimationFrame(() => {
  const savedFont = localStorage.getItem('ob_font');
  if (savedFont) applySavedFont(savedFont);
});

setTimeout(() => {
  const savedFont = localStorage.getItem('ob_font');
  if (savedFont) applySavedFont(savedFont);
}, 100);

    localStorage.setItem('ob_weather_city', city);
  } catch {
    widget.textContent = 'Weather error';
  }
}

if (weatherSave && weatherInput && weatherModal) {
  weatherSave.addEventListener('click', () => {
    const city = weatherInput.value.trim();
    if (!city) return;

    loadWeather(city);
    weatherModal.classList.remove('open');
  });
}

const savedWeatherCity = localStorage.getItem('ob_weather_city');
if (savedWeatherCity) {
  loadWeather(savedWeatherCity);
}

const weatherWidget = document.getElementById('weather-widget');
const weatherLock = document.getElementById('weather-lock');

let weatherLocked = localStorage.getItem('ob_weather_locked') === '1';
let isDraggingWeather = false;
let weatherOffsetX = 0;
let weatherOffsetY = 0;

function applyWeatherLock() {
  if (!weatherWidget || !weatherLock) return;

  weatherWidget.classList.toggle('locked', weatherLocked);
  weatherLock.innerHTML = weatherLocked
  ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
  : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
}

function loadWeatherPosition() {
  if (!weatherWidget) return;

  const x = localStorage.getItem('ob_weather_x');
  const y = localStorage.getItem('ob_weather_y');

  if (x && y) {
    weatherWidget.style.left = x + 'px';
    weatherWidget.style.top = y + 'px';
    weatherWidget.style.transform = 'none';
  }
}

if (weatherLock) {
  weatherLock.addEventListener('click', (e) => {
    e.stopPropagation();

    weatherLocked = !weatherLocked;
    localStorage.setItem('ob_weather_locked', weatherLocked ? '1' : '0');

    applyWeatherLock();
  });
}

if (weatherWidget) {
  weatherWidget.addEventListener('mousedown', (e) => {
    if (weatherLocked) return;
    if (e.target === weatherLock) return;

    isDraggingWeather = true;

    const rect = weatherWidget.getBoundingClientRect();
    weatherOffsetX = e.clientX - rect.left;
    weatherOffsetY = e.clientY - rect.top;

    weatherWidget.style.cursor = 'grabbing';
    weatherWidget.style.transform = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDraggingWeather || !weatherWidget) return;

    weatherWidget.style.left = (e.clientX - weatherOffsetX) + 'px';
    weatherWidget.style.top = (e.clientY - weatherOffsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isDraggingWeather || !weatherWidget) return;

    isDraggingWeather = false;
    weatherWidget.style.cursor = weatherLocked ? 'default' : 'grab';

    localStorage.setItem('ob_weather_x', parseInt(weatherWidget.style.left));
    localStorage.setItem('ob_weather_y', parseInt(weatherWidget.style.top));
  });

  loadWeatherPosition();
  applyWeatherLock();
}

// Weather widget size changer

function applyWeatherSize(size) {
  const weatherTemp = document.querySelector('.weather-temp');
  const weatherCity = document.querySelector('.weather-city');

  if (weatherTemp) {
    weatherTemp.style.fontSize = size + 'px';
    weatherTemp.style.fontWeight = '600';
  }

  if (weatherCity) {
    weatherCity.style.fontSize = Math.max(10, size * 0.45) + 'px';
  }
}

const weatherSizeInput = document.getElementById('settings-weather-size');
const weatherSizeText = document.getElementById('settings-weather-size-text');
const weatherSizeSave = document.getElementById('settings-weather-size-save');

const savedWeatherSize = localStorage.getItem('ob_weather_size');

if (savedWeatherSize) {
  applyWeatherSize(savedWeatherSize);

  if (weatherSizeInput) weatherSizeInput.value = savedWeatherSize;
  if (weatherSizeText) weatherSizeText.value = savedWeatherSize + 'px';
}

if (weatherSizeInput && weatherSizeText) {
  weatherSizeInput.addEventListener('input', () => {
    const value = weatherSizeInput.value;

    applyWeatherSize(value);
    weatherSizeText.value = value + 'px';
  });
}

if (weatherSizeText && weatherSizeInput) {
  weatherSizeText.addEventListener('input', () => {
    let value = weatherSizeText.value.trim().toLowerCase().replace('px', '').trim();
    const num = Number(value);

    if (!value || Number.isNaN(num) || num < 1 || num > 220) return;

    applyWeatherSize(num);
    weatherSizeInput.value = num;
  });
}

if (weatherSizeSave && weatherSizeInput && weatherSizeText) {
  weatherSizeSave.addEventListener('click', () => {
    let value = weatherSizeText.value.trim().toLowerCase().replace('px', '').trim();
    const num = Number(value);

    if (!value || Number.isNaN(num) || num < 1 || num > 220) {
      alert('Allowed from 10px to 80px');
      return;
    }

    applyWeatherSize(num);
    weatherSizeInput.value = num;
    weatherSizeText.value = num + 'px';

    localStorage.setItem('ob_weather_size', num);
  });
}

const weatherDeleteBtn = document.getElementById('settings-weather-delete');
if (weatherDeleteBtn) {
  weatherDeleteBtn.addEventListener('click', () => {
    const widget = document.getElementById('weather-widget');
    if (widget) widget.style.display = 'none';

    localStorage .removeItem('ob_weather_city');
    localStorage.removeItem('ob_weather_size');
    localStorage.removeItem('ob_weather_cache');
    localStorage.removeItem('ob_weather_locked');
    localStorage.removeItem('ob_weather_x');
    localStorage.removeItem('ob_weather_y');
  });
}

const addDateWidget = document.getElementById('add-date-widget');
if (addDateWidget) {
  addDateWidget.addEventListener('click', () => {
    const date = document.getElementById('date');
    if (date) {
      date.style.display = 'block';
      localStorage.removeItem('ob_date_hidden');
      const savedSize = localStorage.getItem('ob_date_size') || '18';
      applyDateSize(savedSize);
    }
  });
}

const addClockWidget = document.getElementById('add-clock-widget');
if (addClockWidget) {
  addClockWidget.addEventListener('click', () => {
    const clock = document.getElementById('clock');
    if (clock) {
      clock.style.display = 'block';
      localStorage.removeItem('ob_clock_hidden');
      const savedSize = localStorage.getItem('ob_clock_size') || '75';
      applyClockSize(savedSize);
    }
  });
}

const dateDeleteBtn = document.getElementById('settings-date-delete');
if (dateDeleteBtn) {
  dateDeleteBtn.addEventListener('click', () => {
    const date = document.getElementById('date');
    if (date) date.style.display = 'none';
    localStorage.setItem('ob_date_hidden', '1');
  });
}

const clockDeleteBtn = document.getElementById('settings-clock-delete');
if (clockDeleteBtn) {
  clockDeleteBtn.addEventListener('click', () => {
    const clock = document.getElementById('clock');
    if (clock) clock.style.display = 'none';
    localStorage.setItem('ob_clock_hidden', '1');
  });
}