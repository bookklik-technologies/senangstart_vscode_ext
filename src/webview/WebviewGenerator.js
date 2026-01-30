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
        <div class="tab" data-tab="docs">Docs</div>
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
        ${clientScript}
      </script>
    </body>
    </html>`;
  }
};
