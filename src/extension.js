const vscode = require('vscode');
const SenangStartViewProvider = require('./SenangStartViewProvider');

function activate(context) {
  const provider = new SenangStartViewProvider(context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('senangstart-sections', provider)
  );

  let refreshDisposable = vscode.commands.registerCommand('senangstart.refreshSections', () => {
    provider.fetchSections();
    provider.loadIcons(); 
  });

  context.subscriptions.push(refreshDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}