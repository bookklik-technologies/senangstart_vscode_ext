const { shapes, catalog } = require('@bookklik/senangstart-shapes/shapes');
const { patterns, catalog: patternCatalog } = require('@bookklik/senangstart-shapes/patterns');

class ShapesManager {
  constructor() {
    this.shapes = catalog.shapes.flatMap(shape => shape.variants.map(variant => ({
      name: `${shape.name} (${variant})`,
      slug: shape.slug,
      variant,
      category: shape.category,
      id: shape.assets[variant],
      svg: shapes[shape.assets[variant]],
      code: `<ss-shape shape="${shape.slug}" variant="${variant}"></ss-shape>`
    })));
    this.patterns = patternCatalog.map(pattern => ({
      ...pattern,
      id: pattern.slug,
      svg: patterns[pattern.slug],
      code: `<div class="ss-pattern-${pattern.slug}" style="min-height: 240px"></div>`
    }));
  }

  getItems(kind = 'shapes', query = '') {
    const items = kind === 'patterns' ? this.patterns : this.shapes;
    const terms = query.toLowerCase().trim().split(/\s+/);
    return items.filter(item => {
      const text = `${item.name} ${item.slug} ${item.category} ${item.variant || ''} ${item.description || ''} ${item.nameMs || ''}`.toLowerCase();
      return terms.every(term => text.includes(term));
    });
  }

  getItem(id, kind) {
    return this.getItems(kind).find(item => item.id === id);
  }
}

module.exports = ShapesManager;
