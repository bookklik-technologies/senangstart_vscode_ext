function attributeContext(source, start) {
  const tag = /^<[A-Za-z][\w:-]*/.exec(source);
  if (!tag || source.length === tag[0].length) return null;
  const existing = new Set();
  let cursor = tag[0].length;
  while (cursor < source.length) {
    while (/\s/.test(source[cursor] || '') && cursor < source.length) cursor++;
    if (cursor === source.length) return { type: 'attribute', start: start + cursor, prefix: '', existing };
    if (source[cursor] === '/') return null;
    const nameStart = cursor;
    while (cursor < source.length && !/[\s=/>]/.test(source[cursor])) cursor++;
    if (cursor === nameStart) return null;
    const name = source.slice(nameStart, cursor);
    if (cursor === source.length) return { type: 'attribute', start: start + nameStart, prefix: name, existing };
    existing.add(name.toLowerCase());
    while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
    if (source[cursor] !== '=') continue;
    cursor++;
    while (cursor < source.length && /\s/.test(source[cursor])) cursor++;
    const quote = /["']/.test(source[cursor] || '') ? source[cursor++] : '';
    const valueStart = cursor;
    while (cursor < source.length && (quote ? source[cursor] !== quote : !/\s/.test(source[cursor]))) cursor++;
    if (cursor === source.length) {
      return { type: 'value', attribute: name.toLowerCase(), start: start + valueStart, value: source.slice(valueStart), quote };
    }
    if (quote) cursor++;
  }
  return null;
}

function getHtmlContext(text, offset) {
  let cursor = 0;
  let rawTag = '';
  while (cursor < offset) {
    if (rawTag) {
      const closing = new RegExp('</' + rawTag + '\\b', 'ig');
      closing.lastIndex = cursor;
      const match = closing.exec(text);
      if (!match || match.index >= offset) return null;
      cursor = match.index;
      rawTag = '';
    }
    const start = text.indexOf('<', cursor);
    if (start < 0 || start >= offset) return null;
    if (text.startsWith('<!--', start)) {
      const end = text.indexOf('-->', start + 4);
      if (end < 0 || end + 3 > offset) return null;
      cursor = end + 3;
      continue;
    }
    if (text.startsWith('<?', start)) {
      const end = text.indexOf('?>', start + 2);
      if (end < 0 || end + 2 > offset) return null;
      cursor = end + 2;
      continue;
    }
    const tag = /^<(\/)?([A-Za-z][\w:-]*)/.exec(text.slice(start));
    if (!tag) {
      if (text.startsWith('<!', start)) {
        const end = text.indexOf('>', start + 2);
        if (end < 0 || end >= offset) return null;
        cursor = end + 1;
      } else cursor = start + 1;
      continue;
    }
    cursor = start + tag[0].length;
    let quote = '';
    while (cursor < offset) {
      const character = text[cursor];
      if (quote) {
        if (character === quote) quote = '';
      } else if (character === '"' || character === "'") quote = character;
      else if (character === '>') break;
      cursor++;
    }
    if (cursor >= offset) return tag[1] ? null : attributeContext(text.slice(start, offset), start);
    if (!tag[1] && /^(script|style|textarea|title)$/i.test(tag[2]) && !/\/\s*$/.test(text.slice(start, cursor))) {
      rawTag = tag[2];
    }
    cursor++;
  }
  return null;
}

module.exports = { getHtmlContext };
