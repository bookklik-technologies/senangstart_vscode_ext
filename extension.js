const vscode = require('vscode');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

class ComponentGridViewProvider {
  constructor(context) {
    this._view = undefined;
    this.context = context;
    this.components = [];
    this.lastFetchTimestamp = this.context.globalState.get('lastFetchTimestamp', 0);
    
    // Try to load cached components immediately
    const cachedComponents = this.context.globalState.get('cachedComponents', []);
    if (cachedComponents.length > 0) {
      this.components = cachedComponents;
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
        // Re-render components when view becomes visible
        this.updateWebview();
      }
    });
    
    // If we have cached components, show them immediately
    if (this.components.length > 0) {
      this.updateWebview();
    }
    
    // Then check if we need to refresh
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - this.lastFetchTimestamp > CACHE_DURATION) {
      this.fetchComponents();
    }

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async message => {
      switch (message.command) {
        case 'copyComponent':
          const component = this.components.find(c => c.slug === message.slug);
          if (component) {
            await vscode.env.clipboard.writeText(component.code);
            vscode.window.showInformationMessage(`${component.name} code copied to clipboard!`);
          }
          break;
        case 'search':
          this.filterComponents(message.query);
          break;
      }
    });
  }

  async fetchComponents() {
    try {
      // Show loading indicator in status bar
      const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
      statusBar.text = "$(sync~spin) Loading SenangStart components...";
      statusBar.show();

      // Read from local JSON file
      const sectionsPath = path.join(this.context.extensionPath, 'media', 'sections.json');
      
      try {
        const rawData = await fs.promises.readFile(sectionsPath, 'utf8');
        this.components = JSON.parse(rawData);
        
        // Save components to cache
        await this.context.globalState.update('cachedComponents', this.components);
        await this.context.globalState.update('lastFetchTimestamp', Date.now());
        this.lastFetchTimestamp = Date.now();
        
        // Save icons for all components
        for (const component of this.components) {
          await this.saveIcon(component);
        }
        
        this.updateWebview();
      } catch (err) {
        vscode.window.showErrorMessage('Failed to load components: sections.json not found in media folder');
        console.error('Error reading sections.json:', err);
      }

      statusBar.hide();
      statusBar.dispose();
    } catch (error) {
      vscode.window.showErrorMessage('Failed to load SenangStart components');
    }
  }

  filterComponents(query) {
    const filteredComponents = this.components.filter(comp => 
      comp.name.toLowerCase().includes(query.toLowerCase()) ||
      comp.category.toLowerCase().includes(query.toLowerCase())
    );
    this.updateWebview(filteredComponents);
  }

  updateWebview(components = this.components) {
    if (this._view && this._view.visible) {
      // Add a small delay to ensure the webview is ready
      setTimeout(() => {
        this._view.webview.postMessage({
          command: 'updateComponents',
          components: components.map(comp => ({
            ...comp,
            icon: comp.icon
          }))
        });
      }, 100);
    }
  }

  getWebviewContent() {
    return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          padding: 10px;
          background-color: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }
        .search-container {
          margin-bottom: 8px;
        }
        #searchInput {
          width: 100%;
          padding: 5px;
          background-color: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border);
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
          padding: 8px 0;
        }
        .component-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: grab;
          padding: 8px;
          border-radius: 8px;
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-widget-border);
          user-select: none;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .component-card:hover {
          background: var(--vscode-list-hoverBackground);
        }
        .component-card:active {
          cursor: grabbing;
          transform: scale(0.98);
        }
        .component-card.dragging {
          opacity: 0.5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .component-icon {
          aspect-ratio: 322/191;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          pointer-events: none;
        }
        .component-icon svg {
          width: 100%;
          height: 100%;
        }
        .component-name {
          text-align: center;
          font-size: 12px;
          color: var(--vscode-editor-foreground);
          pointer-events: none;
        }
        .drag-ghost {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
          opacity: 0.8;
          transform: translate(-50%, -50%);
        }
      </style>
    </head>
    <body>
      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search components...">
      </div>
      <div class="grid-container" id="componentsGrid"></div>

      <script>
        const vscode = acquireVsCodeApi();
        const searchInput = document.getElementById('searchInput');
        const componentsGrid = document.getElementById('componentsGrid');

        searchInput.addEventListener('input', (e) => {
          vscode.postMessage({
            command: 'search',
            query: e.target.value
          });
        });

        window.addEventListener('message', event => {
          const message = event.data;
          switch (message.command) {
            case 'updateComponents':
              updateComponentsGrid(message.components);
              break;
          }
        });

        function updateComponentsGrid(components) {
          // Clear existing components
          componentsGrid.innerHTML = '';
          
          components.forEach(component => {
            // Create card element
            const card = document.createElement('div');
            card.className = 'component-card';
            card.setAttribute('draggable', 'true');
            
            // Add drag event listeners
            card.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', component.code);
              e.dataTransfer.effectAllowed = 'copy';
              
              // Add dragging class for visual feedback
              card.classList.add('dragging');
              
              // Create custom drag image
              const dragImage = card.cloneNode(true);
              dragImage.classList.add('drag-ghost');
              document.body.appendChild(dragImage);
              e.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2);
              
              // Remove the drag image after dragend
              requestAnimationFrame(() => {
                dragImage.remove();
              });
            });
            
            card.addEventListener('dragend', () => {
              card.classList.remove('dragging');
            });
            
            // Keep click to copy functionality
            card.addEventListener('click', () => copyComponent(component.slug));
            
            // Create icon container
            const iconContainer = document.createElement('div');
            iconContainer.className = 'component-icon';
            
            // Create SVG element safely
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(component.icon, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.setAttribute('viewBox', '0 0 322 191');
            
            // Create name element
            const name = document.createElement('div');
            name.className = 'component-name';
            name.textContent = component.name;
            
            // Assemble the card
            iconContainer.appendChild(svgElement);
            card.appendChild(iconContainer);
            card.appendChild(name);
            componentsGrid.appendChild(card);
          });
        }

        function copyComponent(slug) {
          vscode.postMessage({
            command: 'copyComponent',
            slug: slug
          });
        }
      </script>
    </body>
    </html>`;
  }
}

function activate(context) {
  const provider = new ComponentGridViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('senangstart-components', provider)
  );

  let refreshDisposable = vscode.commands.registerCommand('senangstart.refreshComponents', () => {
    provider.fetchComponents();
  });

  context.subscriptions.push(refreshDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}