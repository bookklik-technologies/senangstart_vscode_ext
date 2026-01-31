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
        <div class="button-group" id="sectionTypeToggle" style="display: flex;">
          <button class="toggle-btn active" data-type="SS" title="Copy SenangStart Code">${icons['brush']}</button>
          <button class="toggle-btn" data-type="TW" title="Copy Tailwind Code">
            <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 3C5.63333 3 4.46667 4 4 5.99999C4.7 4.99999 5.51667 4.625 6.45 4.87499C6.98252 5.01763 7.36314 5.43155 7.78443 5.88974C8.47074 6.63613 9.26506 7.49999 11 7.49999C12.8667 7.49999 14.0333 6.49999 14.5 4.5C13.8 5.49999 12.9833 5.87499 12.05 5.62499C11.5175 5.48235 11.1369 5.06844 10.7156 4.61025C10.0293 3.86386 9.23494 3 7.5 3ZM4 7.49999C2.13333 7.49999 0.966667 8.49998 0.5 10.5C1.2 9.49998 2.01667 9.12498 2.95 9.37498C3.48252 9.51762 3.86314 9.93154 4.28443 10.3897C4.97074 11.1361 5.76506 12 7.5 12C9.36667 12 10.5333 11 11 8.99998C10.3 9.99998 9.48333 10.375 8.55 10.125C8.01748 9.98234 7.63686 9.56843 7.21557 9.11023C6.52926 8.36385 5.73494 7.49999 4 7.49999Z" stroke="currentColor" stroke-linejoin="round"></path>
            </svg>
          </button>
        </div>
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
