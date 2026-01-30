const vscode = require('vscode');
const SectionsManager = require('./managers/SectionsManager');
const IconsManager = require('./managers/IconsManager');
const WebviewGenerator = require('./webview/WebviewGenerator');

class SenangStartViewProvider {
  constructor(context) {
    this._view = undefined;
    this.context = context;
    this.activeTab = 'sections'; // 'sections', 'icons', 'libraries'
    
    // Initialize Managers
    this.sectionsManager = new SectionsManager(context);
    this.iconsManager = new IconsManager();
    
    // Initial fetch
    this.sectionsManager.fetchSections();
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      enableForms: true,
      enableCommandUris: true,
      retainContextWhenHidden: true
    };

    webviewView.webview.html = WebviewGenerator.getWebviewContent();
    
    // Add visibility change handler
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.updateWebview();
      }
    });
    
    // Initial update
    this.updateWebview();
    
    // Handle messages
    webviewView.webview.onDidReceiveMessage(async message => {
      switch (message.command) {
        case 'copySection':
          const section = this.sectionsManager.getSectionBySlug(message.slug);
          if (section) {
            await vscode.env.clipboard.writeText(section.code);
            vscode.window.showInformationMessage(`${section.name} code copied!`);
          }
          break;
        case 'copyIcon':
          const icon = this.iconsManager.getIconByName(message.name);
          if (icon) {
            const textToCopy = message.type === 'icon' 
              ? `<ss-icon icon="${icon.name}"></ss-icon>` 
              : icon.svg;
              
            await vscode.env.clipboard.writeText(textToCopy);
            vscode.window.showInformationMessage(`${icon.name} copied!`);
          }
          break;
        case 'search':
          this.filterContent(message.query, message.tab);
          break;
        case 'switchTab':
          this.activeTab = message.tab;
          this.updateWebview();
          break;
      }
    });
  }

  fetchSections() {
    return this.sectionsManager.fetchSections(true).then(() => {
        this.updateWebview();
    });
  }

  loadIcons() {
      // Proxy to manager if needed, but manager loads in constructor mostly.
      // We can trigger a reload if we added that capability.
      this.iconsManager.loadIcons();
      this.updateWebview();
  }

  filterContent(query, tab) {
    let filteredSections = this.sectionsManager.getSections();
    let filteredIcons = this.iconsManager.getIcons();

    if (query) {
      filteredSections = this.sectionsManager.filter(query);
      filteredIcons = this.iconsManager.filter(query);
    }
    
    this.updateWebview(filteredSections, filteredIcons);
  }

  updateWebview(sections = null, icons = null) {
    if (this._view && this._view.visible) {
      this._view.webview.postMessage({
        command: 'updateContent',
        sections: (sections || this.sectionsManager.getSections()).map(s => ({ ...s, icon: s.icon })),
        icons: icons || this.iconsManager.getIcons()
      });
    }
  }
}

module.exports = SenangStartViewProvider;
