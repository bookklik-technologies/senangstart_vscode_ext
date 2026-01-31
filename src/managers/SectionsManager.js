const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

class SectionsManager {
  constructor(context) {
    this.context = context;
    this.sections = [];
    this.lastFetchTimestamp = this.context.globalState.get('lastFetchTimestamp', 0);
    
    // Load cached sections
    const cachedSections = this.context.globalState.get('cachedSections', []);
    if (cachedSections.length > 0) {
      this.sections = cachedSections;
    }
  }

  async fetchSections(force = false) {
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    
    if (!force && this.sections.length > 0) {
      const sectionsPath = path.join(this.context.extensionPath, 'media', 'sections.json');
      try {
        const stats = fs.statSync(sectionsPath);
        const fileChanged = stats.mtimeMs > this.lastFetchTimestamp;
        
        if (!fileChanged && Date.now() - this.lastFetchTimestamp < CACHE_DURATION) {
          return this.sections;
        }
      } catch (e) {
        // If we can't stat the file, continue to try reading it
        console.warn('Failed to stat sections.json', e);
      }
    }

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
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to load sections: ${err.message}`);
      }

      statusBar.hide();
      statusBar.dispose();
    } catch (error) {
      vscode.window.showErrorMessage('Failed to load SenangStart sections');
    }
    
    return this.sections;
  }

  getSections() {
    return this.sections;
  }

  getSectionBySlug(slug) {
    return this.sections.find(s => s.slug === slug);
  }

  filter(query) {
    if (!query) return this.sections;
    const q = query.toLowerCase();
    return this.sections.filter(s => 
      s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }
}

module.exports = SectionsManager;
