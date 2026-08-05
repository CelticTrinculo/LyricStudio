const THEME_STORAGE_KEY = 'lyric-studio-theme-preference';
const THEME_ICON_CLASS_BY_THEME = {
  light: 'fa-sun',
  dark: 'fa-moon',
};

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function normalizeThemePreference(preference) {
  return preference === 'light' || preference === 'dark'
    ? preference
    : getSystemTheme();
}

function getSavedThemePreference() {
  try {
    return normalizeThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return getSystemTheme();
  }
}

function persistThemePreference(preference) {
  const normalizedPreference = normalizeThemePreference(preference);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizedPreference);
  } catch {
    // Ignore storage failures and continue with in-memory behavior.
  }
}

function applyThemePreference(preference, themeToggleButton = null) {
  const resolvedTheme = normalizeThemePreference(preference);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;

  if (!themeToggleButton) {
    return;
  }

  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const themeIcon = themeToggleButton.querySelector('[data-theme-icon]');

  themeToggleButton.dataset.theme = resolvedTheme;
  themeToggleButton.setAttribute('aria-pressed', String(resolvedTheme === 'dark'));
  themeToggleButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  themeToggleButton.setAttribute('title', `Switch to ${nextTheme} theme`);

  if (themeIcon) {
    themeIcon.classList.remove(...Object.values(THEME_ICON_CLASS_BY_THEME));
    themeIcon.classList.add(THEME_ICON_CLASS_BY_THEME[resolvedTheme]);
  }
}

export function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderTokenList(items = [], { emptyText = 'Nothing here yet.', soft = false } = {}) {
  if (!items.length) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <div class="token-list">
      ${items.map((item) => `<span class="token${soft ? ' soft' : ''}">${escapeHtml(item)}</span>`).join('')}
    </div>
  `;
}

export function renderResultList(items = [], { emptyText = 'Nothing here yet.' } = {}) {
  if (!items.length) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ol class="result-list">
      ${items.map((item) => `<li class="result-item">${escapeHtml(item)}</li>`).join('')}
    </ol>
  `;
}

export function renderMetricList(items = [], { emptyText = 'Nothing here yet.' } = {}) {
  if (!items.length) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return `
    <ul class="metric-list">
      ${items.map((item) => `
        <li class="metric-item">
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </li>
      `).join('')}
    </ul>
  `;
}

export function setBusy(button, busy, idleLabel = button.dataset.idleLabel || button.textContent) {
  if (!button.dataset.idleLabel) {
    button.dataset.idleLabel = idleLabel;
  }

  button.classList.toggle('is-busy', busy);
  button.textContent = busy ? 'Working…' : button.dataset.idleLabel;
}

export function setupChrome({
  workspace,
  studioRail,
  toolPanel,
  statusPanel,
  studioRailToggle,
  toolToggle,
  statusToggle,
  helpPanel = null,
  helpToggle = null,
  themeToggleButton = null,
  aiStatus,
  selectionChip,
  lineChip,
}) {
  let themePreference = getSavedThemePreference();

  const updateTheme = (nextPreference, { persist = true } = {}) => {
    themePreference = nextPreference;

    if (persist) {
      persistThemePreference(nextPreference);
    }

    applyThemePreference(nextPreference, themeToggleButton);
  };

  const scrim = document.querySelector('#drawer-scrim');

  const drawers = [
    { toggle: studioRailToggle, panel: studioRail },
    { toggle: toolToggle, panel: toolPanel },
    { toggle: statusToggle, panel: statusPanel },
    { toggle: helpToggle, panel: helpPanel },
  ];

  const setDrawerOpen = (target, open) => {
    const anyOpen = drawers.some(({ panel }) => panel === target?.panel && open);

    drawers.forEach(({ toggle, panel }) => {
      const isOpen = panel === target?.panel && open;
      panel.classList.toggle('is-open', isOpen);
      toggle.classList.toggle('is-active', isOpen);
      toggle.setAttribute('aria-pressed', String(isOpen));
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    if (scrim) {
      scrim.classList.toggle('is-visible', anyOpen);
    }

    workspace.classList.toggle('has-drawer-open', anyOpen);
    document.body.classList.toggle('has-open-drawer', anyOpen);
  };

  drawers.forEach(({ toggle, panel }) => {
    toggle.addEventListener('click', () => {
      setDrawerOpen({ panel }, !panel.classList.contains('is-open'));
    });
  });

  scrim?.addEventListener('click', () => {
    setDrawerOpen(null, false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || document.body.classList.contains('has-open-modal')) {
      return;
    }

    setDrawerOpen(null, false);
  });

  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      updateTheme(themePreference === 'dark' ? 'light' : 'dark');
    });
  }

  updateTheme(themePreference, { persist: false });

  // Start from a clean room: every drawer closed, editor front and center.
  setDrawerOpen(null, false);

  return {
    setAiStatus({ aiAvailable, model }) {
      aiStatus.classList.toggle('is-ready', aiAvailable);
      aiStatus.classList.toggle('is-unavailable', !aiAvailable);
      aiStatus.textContent = aiAvailable
        ? `AI tools ready · ${model}`
        : 'AI tools unavailable · add OPENAI_API_KEY';
    },
    setSelectionChip(label) {
      selectionChip.textContent = label;
    },
    setLineChip(label) {
      lineChip.textContent = label;
    },
  };
}
