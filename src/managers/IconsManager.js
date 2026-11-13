const vscode = require('vscode');
const iconsPkg = require('@bookklik/senangstart-icons/icons');

const fs = require('fs');
const path = require('path');

class IconsManager {
  constructor() {
    this.icons = [];
    this.loadIcons();
  }

  loadIcons() {
    try {
      // Basic load from package (gives us name and svg)
      const iconsList = Object.entries(iconsPkg).map(([name, svg]) => ({
        name: name,
        svg: svg,
        tags: [name], // Default tags to name
        category: 'icon'
      }));

      // Try to enhance with tags from icons.json source if available
      try {
        const jsonPath = path.resolve(path.dirname(require.resolve('@bookklik/senangstart-icons/icons')), '..', 'src', 'icons.json');
        if (fs.existsSync(jsonPath)) {
          const iconsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          
          const metadata = new Map(iconsData.map(icon => [icon.slug, icon]));
          iconsList.forEach(icon => {
            const meta = metadata.get(icon.name);
            if (meta && meta.tags) {
              icon.tags = meta.tags;
            }
          });
        }
      } catch (e) {
        console.warn('Failed to load icons metadata:', e);
      }

      this.icons = iconsList;
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
    const terms = query.toLowerCase().trim().split(/\s+/);
    return this.icons.filter(icon => {
      const text = [icon.name, ...icon.tags].join(' ').toLowerCase();
      return terms.every(term => text.includes(term));
    });
  }
}

module.exports = IconsManager;
