const releases = [
  ['css', 'CSS', '0.4.2', 'Natural-language style utilities with layout, space, and visual attributes.', 'senangstart-css.min.js'],
  ['icons', 'Icons', '1.0.17', 'Searchable SVG icons and the ss-icon web component.', 'senangstart-icon.min.js'],
  ['actions', 'Actions', '0.1.7', 'Reactive HTML with declarative ss-* directives.', 'senangstart-actions.min.js'],
  ['shapes', 'Shapes', '0.1.2', 'SVG shapes, style variants, and repeating background patterns.', 'senangstart-shape.min.js'],
  ['xr', 'XR', '2.1.0', 'A-Frame components and primitives for WebXR interfaces.', 'senangstart-xr.min.js']
];

module.exports = releases.map(([id, title, version, description, bundle]) => {
  const packageName = `@bookklik/senangstart-${id}`;
  const script = `<script${id === 'actions' ? ' defer' : ''} src="https://unpkg.com/${packageName}@${version}/dist/${bundle}"></script>`;
  return {
    id,
    name: `SenangStart ${title}`,
    packageName,
    version,
    description,
    docs: `https://bookklik-technologies.github.io/senangstart-${id}/`,
    repository: `https://github.com/bookklik-technologies/senangstart-${id}`,
    install: `npm install ${packageName}@${version}`,
    cdn: id === 'xr' ? `<script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>\n${script}` :
      id === 'shapes' ? `${script}\n<link rel="stylesheet" href="https://unpkg.com/${packageName}@${version}/dist/patterns.css">` : script
  };
});
