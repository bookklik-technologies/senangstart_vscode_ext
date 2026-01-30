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
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .button-group {
    display: flex;
    border: 1px solid var(--vscode-input-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .toggle-btn {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: none;
    padding: 0;
    width: 34px;
    height: 28px;
    cursor: pointer;
    font-size: 11px;
    font-family: inherit;
    border-right: 1px solid var(--vscode-input-border);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .toggle-btn svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
  .toggle-btn:last-child {
    border-right: none;
  }
  .toggle-btn:hover {
     background: var(--vscode-button-secondaryHoverBackground);
  }
  .toggle-btn.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
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

  /* Libraries */
  /* Libraries */
  .libraries-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .library-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .library-card {
    padding: 12px;
    align-items: flex-start;
    gap: 12px;
    cursor: default; /* Override pointer cursor from .card */
  }

  .library-label {
    font-size: 13px;
    font-weight: 600;
    margin: 0;
    padding: 0;
    text-align: left;
    margin-bottom: 4px;
    border-bottom: 1px solid var(--vscode-widget-border);
    width: 100%;
    padding-bottom: 8px;
  }

  .library-description {
    font-size: 11px;
    opacity: 0.8;
    line-height: 1.4;
    margin-bottom: 8px;
    width: 100%;
  }

  .library-actions {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .library-link {
    flex: 1;
    padding: 6px 12px;
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    text-decoration: none;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    transition: background 0.1s;
    text-align: center;
  }

  .library-link:hover {
    text-decoration: none;
    background: var(--vscode-button-secondaryHoverBackground);
  }
  
  /* Retain style for the single top link if needed, or update it to match */
  .libraries-list > .library-link {
      background: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textBlockQuote-border);
      color: var(--vscode-textLink-foreground);
      justify-content: flex-start;
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
