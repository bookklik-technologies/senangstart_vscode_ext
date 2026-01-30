# SenangStart VS Code Extension - Agent Guide

This document provides context, standards, and workflows for agents working on the SenangStart VS Code Extension.

## 1. Project Overview
**SenangStart** is a VS Code extension that enables developers to browse and drag-and-drop pre-built UI components directly into their editors.
- **Publisher**: `bookklik-technologies`
- **ID**: `senangstart`
- **Entry Point**: `extension.js`

## 2. Tech Stack
- **Runtime**: Node.js (VS Code Extension Host)
- **Module System**: CommonJS (`require`/`module.exports`)
- **UI**: Webview API (HTML/CSS/JS)
- **Dependencies**: `axios`

## 3. Project Structure
- `extension.js`: Main extension logic (Activity Bar, Webview Provider, Command Registration).
- `package.json`: Extension manifest (commands, views, configuration).
- `media/`:
  - `sections.json`: Local database of components (fallback/initial).
  - `icon.svg` / `icon.png`: Extension icons.
- `eslint.config.mjs`: Linting configuration.

## 4. Development Workflow
- **Run/Debug**: Press `F5` in VS Code to launch the Extension Development Host.
- **Refresh**: Use the command `SenangStart: Refresh Components` within the extension host to reload data.
- **Linting**: Run `npx eslint .` to check for style issues.
- **Packaging**: Run `npx vsce package` to create a `.vsix` file for distribution.

## 5. Coding Standards
- **Indentation**: 2 spaces.
- **Async/Await**: Prefer `async/await` over raw Promises/callbacks.
- **Error Handling**: Wrap external calls (fs, network) in `try/catch` and show user-friendly errors via `vscode.window.showErrorMessage`.
- **Webview Security**:
  - Always use `escape` logic or sanitized inputs when passing data to Webviews.
  - Use `vscode.postMessage` for bidirectional communication.

## 6. Common Tasks
### Adding a new Command
1. Register it in `package.json` under `contributes.commands`.
2. Implement the handler in `extension.js`.
3. Push the subscription to `context.subscriptions`.

### Updating the Webview
1. Modification of `getWebviewContent` in `extension.js` controls the HTML/CSS/JS injected into the webview.
2. Ensure strict content security policy (CSP) if external resources are added.

## 7. Knowledge Base
- **Components Cache**: Components are cached in `globalState` to reduce network calls.
- **Icons**: SVG icons are processed and rendered directly in the Webview.
