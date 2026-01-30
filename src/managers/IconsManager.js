const vscode = require('vscode');
const iconsPkg = require('@bookklik/senangstart-icons/icons');

class IconsManager {
  constructor() {
    this.icons = [];
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

  getIcons() {
    return this.icons;
  }

  getIconByName(name) {
    return this.icons.find(i => i.name === name);
  }

  filter(query) {
    if (!query) return this.icons;
    const q = query.toLowerCase();
    return this.icons.filter(i => 
      i.name.toLowerCase().includes(q)
    );
  }
}

module.exports = IconsManager;
