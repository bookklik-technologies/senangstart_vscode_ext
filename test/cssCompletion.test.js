const assert = require('assert');
const vscode = require('vscode');
const CssCompletionProvider = require('../src/completions/CssCompletionProvider');
const { getHtmlContext } = require('../src/completions/htmlContext');
const { attributes, splitVariants } = require('../src/completions/cssData');

function contextAtCursor(source) {
  const offset = source.indexOf('|');
  return getHtmlContext(source.replace('|', ''), offset);
}

async function completionAtCursor(source) {
  const offset = source.indexOf('|');
  const document = await vscode.workspace.openTextDocument({ language: 'html', content: source.replace('|', '') });
  const provider = new CssCompletionProvider();
  const result = provider.provideCompletionItems(document, document.positionAt(offset), { isCancellationRequested: false });
  return { document, result, items: result ? (Array.isArray(result) ? result : result.items) : [] };
}

suite('SenangStart CSS HTML context', () => {
  test('finds a partial attribute name in a multiline tag', () => {
    const context = contextAtCursor('<div\n  title="a > b"\n  lay|>');
    assert.strictEqual(context.type, 'attribute');
    assert.strictEqual(context.prefix, 'lay');
  });

  test('finds single-quoted utility values', () => {
    const context = contextAtCursor("<div space='g:medium p:b|'></div>");
    assert.strictEqual(context.type, 'value');
    assert.strictEqual(context.attribute, 'space');
    assert.strictEqual(context.value, 'g:medium p:b');
  });

  test('does not treat text, comments, code, or closing tags as attributes', () => {
    [
      'hello lay|',
      '<!-- <div space="p:b|"> -->',
      '<script>const html = \'<div space="p:b|">\';</script>',
      '<style>/* <div space="p:b|"> */</style>',
      '<textarea><div space="p:b|"></textarea>',
      '<?php $html = \'<div space="p:b|">\'; ?>',
      '<div></di|v>',
      '<div layout="flex"|>'
    ].forEach(source => assert.strictEqual(contextAtCursor(source), null, source));
  });

  test('resumes after comments, PHP blocks, and raw text elements', () => {
    [
      '<!-- ignored -->',
      '<?php echo "hello"; ?>',
      '<script>const value = 1;</script>',
      '<style>body { color: red; }</style>'
    ].forEach(prefix => {
      assert.strictEqual(contextAtCursor(prefix + '<div space="p:b|">').attribute, 'space');
    });
  });

  test('splits stacked variants without treating utility names as variants', () => {
    assert.deepStrictEqual(splitVariants('!tab:hover:p:b'), { prefix: '!tab:hover:', remainder: 'p:b' });
    assert.deepStrictEqual(splitVariants('bg:blue'), { prefix: '', remainder: 'bg:blue' });
  });

  test('loads real spacing scales and palette colors from bundled metadata', () => {
    assert.ok(attributes.space.tokens.some(token => token.name === 'p:big'));
    assert.ok(attributes.visual.tokens.some(token => token.name === 'bg:blue-500'));
  });
});

suite('SenangStart CSS completion provider', () => {
  test('inserts attribute snippets and requests value suggestions', async () => {
    const { items } = await completionAtCursor('<div lay|>');
    const item = items.find(candidate => candidate.label === 'layout');
    assert.ok(item);
    assert.strictEqual(item.insertText.value, 'layout="$1"');
    assert.strictEqual(item.command.command, 'editor.action.triggerSuggest');
  });

  test('does not duplicate attributes already on the tag', async () => {
    const { items } = await completionAtCursor('<div layout="flex" |>');
    assert.ok(items.some(item => item.label === 'space'));
    assert.ok(!items.some(item => item.label === 'layout'));
  });

  test('preserves existing attribute assignment when editing its name', async () => {
    const { document, items } = await completionAtCursor('<div la|yout="flex">');
    const item = items.find(candidate => candidate.label === 'layout');
    assert.strictEqual(item.insertText, 'layout');
    assert.strictEqual(document.getText(item.range), 'layout');
  });

  test('suggests real utility values and colors', async () => {
    const spacing = await completionAtCursor('<div space="p:b|">');
    assert.ok(spacing.items.some(item => item.label === 'p:big'));
    const color = await completionAtCursor('<div visual="bg:bl|">');
    assert.ok(color.items.some(item => item.label === 'bg:blue-500'));
  });

  test('preserves responsive and state variants', async () => {
    const { items } = await completionAtCursor('<div space="tab:hover:p:b|">');
    assert.ok(items.some(item => item.label === 'tab:hover:p:big' && item.insertText === 'tab:hover:p:big'));
  });

  test('replaces the complete current token, not neighboring utilities', async () => {
    const { document, items } = await completionAtCursor('<div space="g:medium p:b|ig-2x m:small">');
    const item = items.find(candidate => candidate.label === 'p:big');
    assert.strictEqual(document.getText(item.range), 'p:big-2x');
    assert.strictEqual(document.getText().slice(0, document.offsetAt(item.range.start)), '<div space="g:medium ');
    assert.strictEqual(document.getText().slice(document.offsetAt(item.range.end)), ' m:small">');
  });

  test('offers arbitrary value placeholders', async () => {
    const { items } = await completionAtCursor('<div space="w:|">');
    const item = items.find(candidate => candidate.label === 'w:[value]');
    assert.ok(item);
    assert.strictEqual(item.insertText.value, 'w:[${1:value}]');
  });

  test('does not complete dynamic bindings or overwrite custom values', async () => {
    for (const source of ['<div :space="p:b|">', '<div space="w:[32|0px]">', '<div space="w:[calc(100% - |20px)]">', '<div class="p:b|">']) {
      const { items } = await completionAtCursor(source);
      assert.strictEqual(items.length, 0, source);
    }
  });
});
