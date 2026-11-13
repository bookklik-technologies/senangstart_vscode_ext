const { randomBytes } = require('crypto');
const styles = require('./styles');
const clientScript = require('./clientScript');

module.exports = {
  getWebviewContent() {
    const nonce = randomBytes(18).toString('base64');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>SenangStart Libraries</title>
  <style>${styles}</style>
</head>
<body>
  <nav class="tabs" aria-label="SenangStart collections">
    <button class="tab active" data-tab="sections" aria-pressed="true">Sections</button>
    <button class="tab" data-tab="icons" aria-pressed="false">Icons</button>
    <button class="tab" data-tab="shapes" aria-pressed="false">Shapes</button>
    <button class="tab" data-tab="libraries" aria-pressed="false">Libraries</button>
  </nav>
  <div class="search-container" id="searchContainer">
    <input type="search" id="searchInput" aria-label="Search collection" placeholder="Search sections..." maxlength="200">
    <div class="button-group" id="sectionTypeToggle" aria-label="Section format">
      <button class="toggle-btn active" data-type="SS" aria-pressed="true" title="SenangStart code">SS</button>
      <button class="toggle-btn" data-type="TW" aria-pressed="false" title="Tailwind code">TW</button>
    </div>
    <div class="button-group" id="iconTypeToggle" hidden aria-label="Asset format">
      <button class="toggle-btn active" data-type="icon" aria-pressed="true" title="Copy component or pattern class">Tag</button>
      <button class="toggle-btn" data-type="svg" aria-pressed="false" title="Copy SVG source">SVG</button>
    </div>
  </div>
  <div class="asset-options" id="assetOptions" hidden>
    <label for="assetKind">Collection</label>
    <select id="assetKind"><option value="shapes">Shapes and variants</option><option value="patterns">Background patterns</option></select>
  </div>
  <p class="collection-help" id="collectionHelp">Click to copy, or drag into your editor.</p>
  <p id="resultCount" role="status" aria-live="polite"></p>
  <main class="content-area">
    <div id="sections-content" class="tab-content active"><div class="grid-container" id="sectionsGrid"></div></div>
    <div id="icons-content" class="tab-content"><div class="grid-container icon-grid" id="iconsGrid"></div></div>
    <div id="shapes-content" class="tab-content"><div class="grid-container" id="shapesGrid"></div></div>
    <div id="libraries-content" class="tab-content">
      <p class="library-intro">Copy a pinned npm command or browser setup. In HTML, type <code>ss-</code> and select a starter snippet.</p>
      <div class="libraries-list" id="librariesList"></div>
    </div>
  </main>
  <script nonce="${nonce}">${clientScript}</script>
</body>
</html>`;
  }
};
