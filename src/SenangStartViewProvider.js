const vscode = require('vscode');
const SectionsManager = require('./managers/SectionsManager');
const IconsManager = require('./managers/IconsManager');
const ShapesManager = require('./managers/ShapesManager');
const libraries = require('./libraries');
const WebviewGenerator = require('./webview/WebviewGenerator');

class SenangStartViewProvider {
  constructor(context) {
    this.context = context;
    this.activeTab = 'sections';
    this.query = '';
    this.assetKind = 'shapes';
    this.sectionsManager = new SectionsManager(context);
    this.iconsManager = new IconsManager();
    this.shapesManager = new ShapesManager();
    this.sectionsManager.fetchSections().then(() => this.updateWebview());
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [] };
    this.context.subscriptions.push(
      webviewView.onDidChangeVisibility(() => this.updateWebview()),
      webviewView.webview.onDidReceiveMessage(message => this.handleMessage(message)),
      webviewView.onDidDispose(() => { this._view = undefined; })
    );
    webviewView.webview.html = WebviewGenerator.getWebviewContent();
  }

  async handleMessage(message) {
    if (!message || typeof message.command !== 'string') return;
    try {
      switch (message.command) {
        case 'ready':
        case 'search':
        case 'switchTab':
          if (['sections', 'icons', 'shapes', 'libraries'].includes(message.tab)) this.activeTab = message.tab;
          if (typeof message.query === 'string') this.query = message.query.slice(0, 200);
          if (['shapes', 'patterns'].includes(message.kind)) this.assetKind = message.kind;
          this.updateWebview();
          break;
        case 'copySection': {
          const section = this.sectionsManager.getSectionBySlug(message.slug);
          if (section) await this.copy(message.type === 'SS' && section.ss_code ? section.ss_code : section.code, section.name);
          break;
        }
        case 'copyIcon': {
          const icon = this.iconsManager.getIconByName(message.name);
          if (icon) await this.copy(message.type === 'svg' ? icon.svg : `<ss-icon icon="${icon.name}"></ss-icon>`, icon.name);
          break;
        }
        case 'copyShape': {
          const item = this.shapesManager.getItem(message.id, message.kind);
          if (item) await this.copy(message.type === 'svg' ? item.svg : item.code, item.name);
          break;
        }
        case 'copyLibrary': {
          const library = libraries.find(item => item.id === message.id);
          if (library && ['install', 'cdn'].includes(message.type)) {
            await this.copy(library[message.type], `${library.name} ${message.type === 'install' ? 'install command' : 'CDN setup'}`);
          }
          break;
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`SenangStart: ${error.message}`);
    }
  }

  async copy(text, label) {
    if (typeof text !== 'string') return;
    await vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage(`${label} copied!`);
  }

  async fetchSections() {
    await this.sectionsManager.fetchSections(true);
    this.updateWebview();
  }

  loadIcons() {
    this.iconsManager.loadIcons();
    this.updateWebview();
  }

  updateWebview() {
    if (!this._view || !this._view.visible) return;
    const message = { command: 'updateContent', tab: this.activeTab };
    switch (this.activeTab) {
      case 'sections': message.sections = this.sectionsManager.filter(this.query); break;
      case 'icons': message.icons = this.iconsManager.filter(this.query); break;
      case 'shapes': message.shapes = this.shapesManager.getItems(this.assetKind, this.query); break;
      case 'libraries': message.libraries = libraries; break;
    }
    this._view.webview.postMessage(message);
  }
}

module.exports = SenangStartViewProvider;
