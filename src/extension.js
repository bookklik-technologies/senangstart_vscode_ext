const vscode = require('vscode');
const SenangStartViewProvider = require('./SenangStartViewProvider');
const CssCompletionProvider = require('./completions/CssCompletionProvider');

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['html', 'vue', 'svelte', 'php', 'blade'].map(language => ({ language })),
      new CssCompletionProvider(),
      ' ', '"', "'", ':', '-', '=', '/'
    )
  );
  const provider = new SenangStartViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('senangstart-sections', provider)
  );

  const refreshDisposable = vscode.commands.registerCommand('senangstart.refreshSections', async () => {
    await provider.fetchSections();
    provider.loadIcons();
  });

  context.subscriptions.push(refreshDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
