module.exports = String.raw`
  const vscode = acquireVsCodeApi();
  const searchInput = document.getElementById('searchInput');
  const saved = vscode.getState() || {};
  let currentTab = ['sections', 'icons', 'shapes', 'libraries'].includes(saved.tab) ? saved.tab : 'sections';
  let currentIconType = saved.iconType === 'svg' ? 'svg' : 'icon';
  let currentSectionType = saved.sectionType === 'TW' ? 'TW' : 'SS';
  let searchTimer;
  searchInput.value = typeof saved.query === 'string' ? saved.query : '';
  document.getElementById('assetKind').value = saved.kind === 'patterns' ? 'patterns' : 'shapes';

  function sendState(command = 'search') {
    clearTimeout(searchTimer);
    const state = {
      tab: currentTab, query: searchInput.value,
      kind: document.getElementById('assetKind').value,
      iconType: currentIconType, sectionType: currentSectionType
    };
    vscode.setState(state);
    vscode.postMessage({ command, ...state });
  }

  function updateControls() {
    document.querySelectorAll('.tab').forEach(tab => {
      const active = tab.dataset.tab === currentTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === currentTab + '-content');
    });
    document.getElementById('searchContainer').hidden = currentTab === 'libraries';
    document.getElementById('sectionTypeToggle').hidden = currentTab !== 'sections';
    document.getElementById('iconTypeToggle').hidden = !['icons', 'shapes'].includes(currentTab);
    document.getElementById('assetOptions').hidden = currentTab !== 'shapes';
    document.getElementById('collectionHelp').textContent = currentTab === 'libraries' ?
      'Browser setup is for your project, not the extension webview.' :
      currentTab === 'shapes' && document.getElementById('assetKind').value === 'patterns' ?
      'Pattern classes require @bookklik/senangstart-shapes/patterns.css. Click or drag to copy.' :
      'Click to copy, or drag into your editor. Components require their library browser setup.';
    searchInput.placeholder = 'Search ' + currentTab + '...';
    document.querySelectorAll('.toggle-btn').forEach(button => {
      const selected = button.closest('.button-group').id === 'sectionTypeToggle' ? currentSectionType : currentIconType;
      button.classList.toggle('active', button.dataset.type === selected);
      button.setAttribute('aria-pressed', String(button.dataset.type === selected));
    });
    document.getElementById('resultCount').textContent = '';
  }

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    currentTab = tab.dataset.tab;
    updateControls();
    sendState('switchTab');
  }));
  document.querySelectorAll('.toggle-btn').forEach(button => button.addEventListener('click', () => {
    if (button.closest('.button-group').id === 'sectionTypeToggle') currentSectionType = button.dataset.type;
    else currentIconType = button.dataset.type;
    updateControls();
    sendState();
  }));
  document.getElementById('assetKind').addEventListener('change', () => { updateControls(); sendState(); });
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => sendState(), 150);
  });

  function svgPreview(source) {
    const documentSvg = new DOMParser().parseFromString(source || '', 'image/svg+xml');
    const root = documentSvg.documentElement;
    if (root.localName !== 'svg' || documentSvg.querySelector('parsererror')) return document.createTextNode('Preview unavailable');
    const allowed = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'pattern', 'use', 'title', 'desc']);
    [root, ...root.querySelectorAll('*')].forEach(element => {
      if (!allowed.has(element.localName) || element.namespaceURI !== 'http://www.w3.org/2000/svg') { element.remove(); return; }
      [...element.attributes].forEach(attribute => {
        if (/^on/i.test(attribute.name) || /^(style|src)$/i.test(attribute.name) ||
          (/href$/i.test(attribute.name) && !attribute.value.startsWith('#')) ||
          (/url\s*\(/i.test(attribute.value) && !/^url\(#[\w-]+\)$/.test(attribute.value))) {
          element.removeAttribute(attribute.name);
        }
      });
    });
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('focusable', 'false');
    if (!root.hasAttribute('viewBox')) {
      const width = parseFloat(root.getAttribute('width')) || 322;
      const height = parseFloat(root.getAttribute('height')) || 191;
      root.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    }
    return document.importNode(root, true);
  }

  function renderItems(items, kind) {
    const grid = document.getElementById(kind + 'Grid');
    grid.replaceChildren();
    document.getElementById('resultCount').textContent = items.length + ' results';
    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No matches. Try another name, category, or keyword.';
      grid.appendChild(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const card = document.createElement('button');
      card.className = 'card ' + (kind === 'icons' ? 'icon-card' : 'section-card');
      card.type = 'button';
      card.draggable = true;
      card.title = 'Copy ' + item.name;
      const preview = document.createElement('div');
      preview.className = kind === 'icons' ? 'icon-preview' : 'section-preview';
      preview.appendChild(svgPreview(kind === 'sections' ? item.icon : item.svg));
      const label = document.createElement('span');
      label.className = 'card-label';
      label.textContent = item.name;
      card.append(preview, label);
      card.addEventListener('click', () => {
        if (kind === 'sections') vscode.postMessage({ command: 'copySection', slug: item.slug, type: currentSectionType });
        else if (kind === 'icons') vscode.postMessage({ command: 'copyIcon', name: item.name, type: currentIconType });
        else vscode.postMessage({ command: 'copyShape', id: item.id, kind: document.getElementById('assetKind').value, type: currentIconType });
      });
      card.addEventListener('dragstart', event => {
        const text = kind === 'sections' ? (currentSectionType === 'SS' && item.ss_code ? item.ss_code : item.code) :
          currentIconType === 'svg' ? item.svg : kind === 'icons' ? '<ss-icon icon="' + item.name + '"></ss-icon>' : item.code;
        event.dataTransfer.setData('text/plain', text);
        event.dataTransfer.effectAllowed = 'copy';
      });
      fragment.appendChild(card);
    });
    grid.appendChild(fragment);
  }

  function renderLibraries(libraries) {
    const list = document.getElementById('librariesList');
    list.replaceChildren();
    libraries.forEach(library => {
      const entry = document.createElement('section');
      entry.className = 'library-entry';
      const title = document.createElement('h2');
      title.textContent = library.name + ' ' + library.version;
      const description = document.createElement('p');
      description.textContent = library.description;
      const packageName = document.createElement('code');
      packageName.textContent = library.packageName;
      const actions = document.createElement('div');
      actions.className = 'library-actions';
      [['install', 'Copy npm'], ['cdn', 'Copy CDN']].forEach(([type, text]) => {
        const button = document.createElement('button');
        button.className = 'library-link';
        button.textContent = text;
        button.addEventListener('click', () => vscode.postMessage({ command: 'copyLibrary', id: library.id, type }));
        actions.appendChild(button);
      });
      [['docs', 'Docs'], ['repository', 'GitHub']].forEach(([key, text]) => {
        const link = document.createElement('a');
        link.href = library[key];
        link.className = 'library-link';
        link.textContent = text;
        actions.appendChild(link);
      });
      entry.append(title, description, packageName, actions);
      list.appendChild(entry);
    });
  }

  window.addEventListener('message', event => {
    const message = event.data;
    if (message.command !== 'updateContent' || message.tab !== currentTab) return;
    if (message.sections) renderItems(message.sections, 'sections');
    if (message.icons) renderItems(message.icons, 'icons');
    if (message.shapes) renderItems(message.shapes, 'shapes');
    if (message.libraries) renderLibraries(message.libraries);
  });
  updateControls();
  sendState('ready');
`;
