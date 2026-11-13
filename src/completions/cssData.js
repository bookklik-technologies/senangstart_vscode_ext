const metadata = require('../../media/senangstart-css.json');

const variants = new Set(['dark', ...metadata.breakpoints, ...metadata.states]);
metadata.breakpoints.forEach((breakpoint, index) => {
  variants.add(`max-${breakpoint}`);
  metadata.breakpoints.slice(index + 1).forEach(end => variants.add(`${breakpoint}-${end}`));
});

const colors = [
  ...metadata.colors.named,
  ...metadata.colors.families.flatMap(family => metadata.colors.shades.map(shade => `${family}-${shade}`))
];

const attributes = Object.fromEntries(Object.entries(metadata.attributes).map(([name, definition]) => {
  const tokens = new Map();
  definition.keywords.forEach(keyword => tokens.set(keyword.name, { ...keyword, kind: 'value' }));
  definition.properties.forEach(property => {
    tokens.set(`${property.name}:`, { name: `${property.name}:`, description: property.description, kind: 'property' });
    const values = property.values || metadata.scales[property.scale] || [];
    const choices = property.color ? [...values, ...colors] : values;
    choices.forEach(value => {
      const token = `${property.name}:${value}`;
      tokens.set(token, { name: token, description: property.description, kind: property.color ? 'color' : 'value' });
    });
    if (property.arbitrary) {
      const token = `${property.name}:[value]`;
      tokens.set(token, { name: token, description: property.description, kind: 'arbitrary', property: property.name });
    }
  });
  return [name, { description: definition.description, tokens: [...tokens.values()] }];
}));

function splitVariants(token) {
  let prefix = token.startsWith('!') ? '!' : '';
  let remainder = token.slice(prefix.length);
  while (remainder.includes(':')) {
    const separator = remainder.indexOf(':');
    const variant = remainder.slice(0, separator);
    if (!variants.has(variant)) break;
    prefix += `${variant}:`;
    remainder = remainder.slice(separator + 1);
  }
  return { prefix, remainder };
}

module.exports = { attributes, variants, splitVariants, version: metadata.libraryVersion };
