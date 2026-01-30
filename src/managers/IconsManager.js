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
        const jsonPath = path.join(__dirname, '..', '..', 'node_modules', '@bookklik', 'senangstart-icons', 'src', 'icons.json');
        if (fs.existsSync(jsonPath)) {
          const iconsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
          
          // Map tags to existing icons
          iconsList.forEach(icon => {
            const meta = iconsData.find(i => i.slug === icon.name);
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
    const q = query.toLowerCase();
    return this.icons.filter(i => {
      // Search in tags
      return i.tags.some(tag => tag.toLowerCase().includes(q));
    });
  }
}

module.exports = IconsManager;
