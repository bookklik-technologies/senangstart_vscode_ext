const vscode = require('vscode');
const { getHtmlContext } = require('./htmlContext');
const { attributes, variants, splitVariants, version } = require('./cssData');

class CssCompletionProvider {
  provideCompletionItems(document, position, cancellation) {
    if (cancellation.isCancellationRequested || !vscode.workspace.getConfiguration('senangstart').get('cssAutocomplete.enabled', true)) return undefined;
    const text = document.getText();
    const offset = document.offsetAt(position);
    const context = getHtmlContext(text, offset);
    if (!context || cancellation.isCancellationRequested) return undefined;
    if (context.type === 'attribute') return this.attributeItems(document, text, offset, context);
    if (!Object.hasOwn(attributes, context.attribute)) return undefined;
    return this.valueItems(document, text, offset, context);
  }

  attributeItems(document, text, offset, context) {
    let end = offset;
    while (end < text.length && /[\w:-]/.test(text[end])) end++;
    const hasValue = /^\s*=/.test(text.slice(end));
    const range = new vscode.Range(document.positionAt(context.start), document.positionAt(end));
    return Object.entries(attributes)
      .filter(([name]) => name.startsWith(context.prefix.toLowerCase()) && !context.existing.has(name))
      .map(([name, definition]) => {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Property);
        item.detail = `SenangStart CSS ${version}`;
        item.documentation = definition.description;
        item.range = range;
        item.insertText = hasValue ? name : new vscode.SnippetString(`${name}="$1"`);
        if (!hasValue) item.command = { command: 'editor.action.triggerSuggest', title: 'Suggest SenangStart values' };
        return item;
      });
  }

  valueItems(document, text, offset, context) {
    let tokenStart = 0;
    let bracketDepth = 0;
    for (let cursor = 0; cursor < context.value.length; cursor++) {
      const character = context.value[cursor];
      if (character === '[') bracketDepth++;
      else if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1);
      else if (/\s/.test(character) && bracketDepth === 0) tokenStart = cursor + 1;
    }
    const token = context.value.slice(tokenStart);
    if (token.includes('[') || token.includes('{') || token.includes('<')) return undefined;
    const start = offset - token.length;
    let end = offset;
    while (end < text.length && !/[\s"'<>]/.test(text[end])) end++;
    const range = new vscode.Range(document.positionAt(start), document.positionAt(end));
    const { prefix, remainder } = splitVariants(token);
    const definitions = attributes[context.attribute].tokens.filter(item => item.name.startsWith(remainder.toLowerCase()));
    if (!remainder.includes(':')) {
      variants.forEach(variant => {
        if (variant.startsWith(remainder.toLowerCase())) definitions.push({ name: `${variant}:`, description: 'Prefix a utility with this responsive or state variant.', kind: 'variant' });
      });
    }
    const items = definitions.map(definition => {
      const label = prefix + definition.name;
      const kind = definition.kind === 'color' ? vscode.CompletionItemKind.Color :
        definition.kind === 'arbitrary' ? vscode.CompletionItemKind.Snippet : vscode.CompletionItemKind.Value;
      const item = new vscode.CompletionItem(label, kind);
      item.detail = `SenangStart CSS ${version} · ${context.attribute}`;
      item.documentation = definition.description;
      item.range = range;
      item.filterText = label;
      item.insertText = definition.kind === 'arbitrary' ? new vscode.SnippetString(`${prefix}${definition.property}:[\${1:value}]`) : label;
      if (definition.kind === 'property' || definition.kind === 'variant') {
        item.command = { command: 'editor.action.triggerSuggest', title: 'Suggest SenangStart values' };
      }
      return item;
    });
    return new vscode.CompletionList(items, true);
  }
}

module.exports = CssCompletionProvider;
