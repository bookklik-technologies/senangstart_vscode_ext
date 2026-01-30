module.exports = `
  const vscode = acquireVsCodeApi();
  const searchInput = document.getElementById('searchInput');
  let currentTab = 'sections';
  let currentIconType = 'icon';
  
  // Tab Switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update UI
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      document.getElementById(currentTab + '-content').classList.add('active');
      
      // Toggle Search Visibility (hide for docs)
      document.getElementById('searchContainer').style.display = 
        currentTab === 'docs' ? 'none' : 'flex';
      
      const iconTypeToggle = document.getElementById('iconTypeToggle');
      if (iconTypeToggle) {
        iconTypeToggle.style.display = currentTab === 'icons' ? 'flex' : 'none';
      }
        
      // Rerun search for new tab context if there is a query
      if (searchInput.value) {
          triggerSearch();
      }
    });
  });
  
  // Icon Type Toggles
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentIconType = btn.dataset.type;
    });
  });

  // Search
  searchInput.addEventListener('input', triggerSearch);

  function triggerSearch() {
      vscode.postMessage({
      command: 'search',
      query: searchInput.value,
      tab: currentTab
    });
  }

  // Messaging
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      case 'updateContent':
        renderSections(message.sections);
        renderIcons(message.icons);
        break;
    }
  });

  function renderSections(sections) {
    const grid = document.getElementById('sectionsGrid');
    grid.innerHTML = '';
    
    if (!sections || sections.length === 0) {
      grid.innerHTML = '<div class="empty-state">No sections found</div>';
      return;
    }

    sections.forEach(section => {
      const card = document.createElement('div');
      card.className = 'card section-card';
      card.draggable = true;
      
      // Drag support
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', section.code);
        e.dataTransfer.effectAllowed = 'copy';
      });
      
      card.addEventListener('click', () => {
        vscode.postMessage({ command: 'copySection', slug: section.slug });
      });

      // Create preview container
      const preview = document.createElement('div');
      preview.className = 'section-preview';
      
      // Create SVG element safely using DOMParser (restored logic)
      try {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(section.icon, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        
        if (svgElement) {
          svgElement.setAttribute('width', '100%');
          svgElement.setAttribute('height', '100%');
          svgElement.setAttribute('viewBox', '0 0 322 191');
          preview.appendChild(svgElement);
        }
      } catch (e) {
        console.error('Error parsing SVG for section', section.name, e);
      }

      // Label
      const label = document.createElement('div');
      label.className = 'card-label';
      label.textContent = section.name;

      card.appendChild(preview);
      card.appendChild(label);
      grid.appendChild(card);
    });
  }

  function renderIcons(icons) {
    const grid = document.getElementById('iconsGrid');
    grid.innerHTML = '';

    if (!icons || icons.length === 0) {
      grid.innerHTML = '<div class="empty-state">No icons found</div>';
      return;
    }

    icons.forEach(icon => {
      const card = document.createElement('div');
      card.className = 'card icon-card';
      card.draggable = true;

      // Drag support
      card.addEventListener('dragstart', (e) => {
        const textToDrag = currentIconType === 'icon' 
            ? \`<ss-icon icon="\${icon.name}"></ss-icon>\` 
            : icon.svg;

        e.dataTransfer.setData('text/plain', textToDrag);
        e.dataTransfer.effectAllowed = 'copy';
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
      
      card.addEventListener('click', () => {
        vscode.postMessage({ command: 'copyIcon', name: icon.name, type: currentIconType });
      });

      card.innerHTML = \`
        <div class="icon-preview">\${icon.svg}</div>
        <div class="card-label">\${icon.name}</div>
      \`;
      grid.appendChild(card);
    });
  }
`;
