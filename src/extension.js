const vscode = require('vscode');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const iconsPkg = require('@bookklik/senangstart-icons/icons');

class SenangStartViewProvider {
  constructor(context) {
    this._view = undefined;
    this.context = context;
    this.sections = [];
    this.icons = [];
    this.activeTab = 'sections'; // 'sections', 'icons', 'docs'
    this.lastFetchTimestamp = this.context.globalState.get('lastFetchTimestamp', 0);
    
    // Load cached sections
    const cachedSections = this.context.globalState.get('cachedSections', []);
    if (cachedSections.length > 0) {
      this.sections = cachedSections;
    }

    // Load icons
    this.loadIcons();
  }

  loadIcons() {
    try {
      // @bookklik/senangstart-icons/icons exports an object where keys are icon names and values are SVG strings
      this.icons = Object.entries(iconsPkg).map(([name, svg]) => ({
        name: name,
        svg: svg, // The SVG content string
        category: 'icon'
      }));
    } catch (err) {
      console.error('Error loading icons:', err);
      vscode.window.showErrorMessage('Failed to load icons.');
    }
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      enableForms: true,
      enableCommandUris: true,
      retainContextWhenHidden: true
    };

    webviewView.webview.html = this.getWebviewContent();
    
    // Add visibility change handler
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.updateWebview();
      }
    });
    
    // Initial update
    this.updateWebview();
    
    // Refresh sections if needed
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    if (this.sections.length === 0 || Date.now() - this.lastFetchTimestamp > CACHE_DURATION) {
      this.fetchSections();
    }

    // Handle messages
    webviewView.webview.onDidReceiveMessage(async message => {
      switch (message.command) {
        case 'copySection':
          const section = this.sections.find(s => s.slug === message.slug);
          if (section) {
            await vscode.env.clipboard.writeText(section.code);
            vscode.window.showInformationMessage(`${section.name} code copied!`);
          }
          break;
        case 'copyIcon':
          const icon = this.icons.find(i => i.name === message.name);
          if (icon) {
            await vscode.env.clipboard.writeText(icon.svg);
            vscode.window.showInformationMessage(`${icon.name} SVG copied!`);
          }
          break;
        case 'search':
          // Search is handled client-side for better performance with tabs, 
          // or we can implement server-side filter if list is huge.
          // For now, let's keep it simple and just update the view with filtered data if we want backend filtering,
          // BUT, to support tabs, we should probably just send ALL data and let frontend filter, 
          // OR handle filter in backend based on active tab.
          // Let's go with backend filtering for consistency with previous code.
          this.filterContent(message.query, message.tab);
          break;
        case 'switchTab':
          this.activeTab = message.tab;
          this.updateWebview(); // Resend data for the new tab (or just let frontend handle visibility)
          break;
      }
    });
  }

  async fetchSections() {
    try {
      const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
      statusBar.text = "$(sync~spin) Loading SenangStart sections...";
      statusBar.show();

      const sectionsPath = path.join(this.context.extensionPath, 'media', 'sections.json');
      
      try {
        const rawData = await fs.promises.readFile(sectionsPath, 'utf8');
        this.sections = JSON.parse(rawData);
        
        await this.context.globalState.update('cachedSections', this.sections);
        await this.context.globalState.update('lastFetchTimestamp', Date.now());
        this.lastFetchTimestamp = Date.now();
        
        this.updateWebview();
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to load sections: ${err.message}`);
      }

      statusBar.hide();
      statusBar.dispose();
    } catch (error) {
      vscode.window.showErrorMessage('Failed to load SenangStart sections');
    }
  }

  filterContent(query, tab) {
    // We send a 'filter' message to frontend instead of re-rendering everything
    // This is smoother. But the previous implementation re-rendered.
    // Let's stick to the previous pattern of sending data, but optimize.
    // Actually, sending 'updateContent' with filtered lists is fine.
    
    let filteredSections = this.sections;
    let filteredIcons = this.icons;

    if (query) {
      const q = query.toLowerCase();
      filteredSections = this.sections.filter(s => 
        s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
      filteredIcons = this.icons.filter(i => 
        i.name.toLowerCase().includes(q)
      );
    }
    
    this.updateWebview(filteredSections, filteredIcons);
  }

  updateWebview(sections = this.sections, icons = this.icons) {
    if (this._view && this._view.visible) {
      this._view.webview.postMessage({
        command: 'updateContent',
        sections: sections.map(s => ({ ...s, icon: s.icon })),
        icons: icons
      });
    }
  }

  getWebviewContent() {
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          padding: 0;
          margin: 0;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: var(--vscode-font-family);
        }
        
        /* Tabs */
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--vscode-panel-border);
          background: var(--vscode-sideBar-background);
          flex-shrink: 0;
        }
        .tab {
          flex: 1;
          padding: 10px;
          text-align: center;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0.7;
          transition: all 0.2s;
        }
        .tab:hover {
          opacity: 1;
          background: var(--vscode-list-hoverBackground);
        }
        .tab.active {
          border-bottom-color: var(--vscode-panelTitle-activeBorder);
          color: var(--vscode-panelTitle-activeForeground);
          opacity: 1;
        }

        /* Search */
        .search-container {
          padding: 10px;
          flex-shrink: 0;
          border-bottom: 1px solid var(--vscode-widget-border);
        }
        #searchInput {
          width: 100%;
          padding: 6px;
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border);
          box-sizing: border-box;
          outline: none;
        }
        #searchInput:focus {
          border-color: var(--vscode-focusBorder);
        }

        /* Content Area */
        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }

        /* Grids */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }
        .icon-grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        }

        /* Cards */
        .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 6px;
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-widget-border);
          cursor: pointer;
          transition: transform 0.1s;
          overflow: hidden;
        }
        .card:hover {
          background: var(--vscode-list-hoverBackground);
          border-color: var(--vscode-focusBorder);
        }
        .card:active {
          transform: scale(0.98);
        }
        
        /* Section Card Specifics */
        .section-card {
          padding: 6px;
        }
        .section-preview {
          width: 100%;
          aspect-ratio: 322/191;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          pointer-events: none; /* Restore pointer-events: none for consistency if needed, though card has click */
        }
        .section-preview svg {
          width: 100%;
          height: 100%;
        }

        /* Icon Card Specifics */
        .icon-card {
          padding: 10px;
          justify-content: center;
          aspect-ratio: 1;
        }
        .icon-preview {
          width: 32px;
          height: 32px;
          margin-bottom: 6px;
          color: var(--vscode-editor-foreground);
        }
        .icon-preview svg {
          width: 100%;
          height: 100%;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .card-label {
          font-size: 10px;
          text-align: center;
          margin-top: auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          padding: 2px 4px;
        }

        /* Docs */
        .docs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .doc-link {
          padding: 12px;
          background: var(--vscode-textBlockQuote-background);
          border-left: 4px solid var(--vscode-textBlockQuote-border);
          color: var(--vscode-textLink-foreground);
          text-decoration: none;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .doc-link:hover {
          text-decoration: underline;
          background: var(--vscode-list-hoverBackground);
        }
        
        .empty-state {
          padding: 20px;
          text-align: center;
          opacity: 0.6;
        }

        /* Drag Ghost */
        .drag-ghost {
          position: fixed;
          top: -1000px;
          opacity: 0.8;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="tabs">
        <div class="tab active" data-tab="sections">Sections</div>
        <div class="tab" data-tab="icons">Icons</div>
        <div class="tab" data-tab="docs">Docs</div>
      </div>

      <div class="search-container" id="searchContainer">
        <input type="text" id="searchInput" placeholder="Search...">
      </div>

      <div class="content-area">
        <!-- Sections Tab -->
        <div id="sections-content" class="tab-content active">
          <div class="grid-container" id="sectionsGrid"></div>
        </div>

        <!-- Icons Tab -->
        <div id="icons-content" class="tab-content">
          <div class="grid-container icon-grid" id="iconsGrid"></div>
        </div>

        <!-- Docs Tab -->
        <div id="docs-content" class="tab-content">
          <div class="docs-list">
            <a href="https://senangstart.com/" class="doc-link">
              Visit SenangStart Homepage
            </a>
            <!-- Add more doc links here if needed -->
          </div>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        const searchInput = document.getElementById('searchInput');
        let currentTab = 'sections';
        
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
              currentTab === 'docs' ? 'none' : 'block';
              
            // Rerun search for new tab context if there is a query
            if (searchInput.value) {
               triggerSearch();
            }
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
              e.dataTransfer.setData('text/plain', icon.svg);
              e.dataTransfer.effectAllowed = 'copy';
              card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
              card.classList.remove('dragging');
            });
            
            card.addEventListener('click', () => {
              vscode.postMessage({ command: 'copyIcon', name: icon.name });
            });

            card.innerHTML = \`
              <div class="icon-preview">\${icon.svg}</div>
              <div class="card-label">\${icon.name}</div>
            \`;
            grid.appendChild(card);
          });
        }
      </script>
    </body>
    </html>`;
  }
}

function activate(context) {
  const provider = new SenangStartViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('senangstart-sections', provider)
  );

  let refreshDisposable = vscode.commands.registerCommand('senangstart.refreshSections', () => {
    provider.fetchSections();
    provider.loadIcons(); // Also refresh icons
  });

  context.subscriptions.push(refreshDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}