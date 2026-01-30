module.exports = `
  body {
    padding: 0;
    margin: 0;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: var(--vscode-font-family);
  }
  
  /* Tabs */
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--vscode-panel-border);
    background: var(--vscode-sideBar-background);
    flex-shrink: 0;
  }
  .tab {
    flex: 1;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 600;
    opacity: 0.7;
    transition: all 0.2s;
  }
  .tab:hover {
    opacity: 1;
    background: var(--vscode-list-hoverBackground);
  }
  .tab.active {
    border-bottom-color: var(--vscode-panelTitle-activeBorder);
    color: var(--vscode-panelTitle-activeForeground);
    opacity: 1;
  }

  /* Search */
  .search-container {
    padding: 10px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--vscode-widget-border);
  }
  #searchInput {
    width: 100%;
    padding: 6px;
    background-color: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    box-sizing: border-box;
    outline: none;
  }
  #searchInput:focus {
    border-color: var(--vscode-focusBorder);
  }

  /* Content Area */
  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }
  .tab-content {
    display: none;
  }
  .tab-content.active {
    display: block;
  }

  /* Grids */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }
  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  /* Cards */
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 6px;
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-widget-border);
    cursor: pointer;
    transition: transform 0.1s;
    overflow: hidden;
  }
  .card:hover {
    background: var(--vscode-list-hoverBackground);
    border-color: var(--vscode-focusBorder);
  }
  .card:active {
    transform: scale(0.98);
  }
  
  /* Section Card Specifics */
  .section-card {
    padding: 6px;
  }
  .section-preview {
    width: 100%;
    aspect-ratio: 322/191;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    pointer-events: none; /* Restore pointer-events: none for consistency if needed, though card has click */
  }
  .section-preview svg {
    width: 100%;
    height: 100%;
  }

  /* Icon Card Specifics */
  .icon-card {
    padding: 10px;
    justify-content: center;
    aspect-ratio: 1;
  }
  .icon-preview {
    width: 32px;
    height: 32px;
    margin-bottom: 6px;
    color: var(--vscode-editor-foreground);
  }
  .icon-preview svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .card-label {
    font-size: 10px;
    text-align: center;
    margin-top: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    padding: 2px 4px;
  }

  /* Docs */
  .docs-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .doc-link {
    padding: 12px;
    background: var(--vscode-textBlockQuote-background);
    border-left: 4px solid var(--vscode-textBlockQuote-border);
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .doc-link:hover {
    text-decoration: underline;
    background: var(--vscode-list-hoverBackground);
  }
  
  .empty-state {
    padding: 20px;
    text-align: center;
    opacity: 0.6;
  }

  /* Drag Ghost */
  .drag-ghost {
    position: fixed;
    top: -1000px;
    opacity: 0.8;
    pointer-events: none;
  }
`;
