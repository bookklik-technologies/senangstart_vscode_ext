const styles = require('./styles');
const clientScript = require('./clientScript');
const icons = require('@bookklik/senangstart-icons/icons');

module.exports = {
  getWebviewContent() {
    return `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        ${styles}
      </style>
    </head>
    <body>
      <div class="tabs">
        <div class="tab active" data-tab="sections">Sections</div>
        <div class="tab" data-tab="icons">Icons</div>
        <div class="tab" data-tab="libraries">Libraries</div>
      </div>

      <div class="search-container" id="searchContainer">
        <input type="text" id="searchInput" placeholder="Search...">
        <div class="button-group" id="iconTypeToggle" style="display: none;">
          <button class="toggle-btn active" data-type="icon" title="Copy Icon Tag">${icons['shapes']}</button>
          <button class="toggle-btn" data-type="svg" title="Copy SVG Code">${icons['code']}</button>
        </div>
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

        <!-- Libraries Tab -->
        <div id="libraries-content" class="tab-content">
          <div class="libraries-list">
            <a href="https://senangstart.com/" class="library-link">
              Visit SenangStart Homepage
            </a>
            <!-- Add more library links here if needed -->
            <div class="cards-container library-grid">
              <div class="card library-card">
                <div class="card-label library-label">SenangStart CSS</div>
                <div class="library-description">Fluent CSS Style Utilities for Humans and AI</div>
                <div class="library-actions">
                  <a href="https://bookklik-technologies.github.io/senangstart-css/" class="library-link">
                    Website
                  </a>
                  <a href="https://github.com/bookklik-technologies/senangstart-css" class="library-link">
                    GitHub
                  </a>
                </div>
              </div>
              <div class="card library-card">
                <div class="card-label library-label">SenangStart Icons</div>
                <div class="library-description">Curated, customizable, and easy to use icon library</div>
                <div class="library-actions">
                  <a href="https://bookklik-technologies.github.io/senangstart-icons/" class="library-link">
                    Website
                  </a>
                  <a href="https://github.com/bookklik-technologies/senangstart-icons" class="library-link">
                    GitHub
                  </a>
                </div>
              </div>
              <div class="card library-card">
                <div class="card-label library-label">SenangStart Actions</div>
                <div class="library-description">Minimal JS framework for humans and AI agents</div>
                <div class="library-actions">
                  <a href="https://bookklik-technologies.github.io/senangstart-actions/" class="library-link">
                    Website
                  </a>
                  <a href="https://github.com/bookklik-technologies/senangstart-actions" class="library-link">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        ${clientScript}
      </script>
    </body>
    </html>`;
  }
};
