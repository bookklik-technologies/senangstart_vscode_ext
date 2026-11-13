# SenangStart VS Code Extension

Browse and copy reusable sections, icons, shapes, and patterns from the SenangStart ecosystem without leaving your editor.

## Features

- **Sections:** Search 86 bundled UI sections. Click to copy or drag into your editor, choosing SenangStart attribute code or Tailwind markup.
- **Icons:** Search icon names and tags from `@bookklik/senangstart-icons`. Copy or drag an `<ss-icon icon="heart"></ss-icon>` component or standalone SVG.
- **Shapes:** Browse 496 SVG assets, including solid, outline, duotone, and tonal variants where supported. Search by name, category, and variant; copy a paired `<ss-shape>` tag or raw SVG.
- **Patterns:** Select **Background patterns** in the Shapes tab to browse 20 repeating backgrounds. Copy a pattern class or its SVG tile. Classes require the Shapes pattern stylesheet.
- **Libraries:** Access documentation, repositories, version-pinned npm commands, and browser setup for all five libraries. Copy actions only write to the clipboard; nothing is installed or executed in your workspace.
- **HTML snippets:** Type `ss-` in HTML, Vue, Svelte, or PHP files and choose a starter. Browser script snippets are intended for plain HTML; in framework projects, register the library through your application's entry point instead.
- **Persistent browsing:** Your selected tab, format, query, and shape collection survive webview recreation. Asset buttons support keyboard activation and visible focus.
- **CSS autocomplete:** Attribute names, utility values, colors, arbitrary-value placeholders, and responsive/state variants in HTML, Vue, Svelte, PHP, and Blade. Uses bundled CSS 0.4.2 editor metadata; no network or CSS runtime is needed.

## Library versions

Published npm versions verified on November 13, 2026:

| Library | Version | Integration |
| --- | --- | --- |
| `@bookklik/senangstart-css` | 0.4.2 | Setup commands and attribute-based snippets |
| `@bookklik/senangstart-icons` | 1.0.17 | Bundled searchable icon collection |
| `@bookklik/senangstart-actions` | 0.1.7 | Setup commands and reactive HTML snippets |
| `@bookklik/senangstart-shapes` | 0.1.2 | Bundled shapes, variants, and patterns |
| `@bookklik/senangstart-xr` | 2.1.0 | Setup commands and A-Frame scene snippets |

The extension bundles Icons and Shapes for offline browsing. CSS, Actions, and XR are integrations for your project, not extension-host dependencies. Pinned versions make copied setup reproducible; the extension does not silently fetch new releases.

## Installation and usage

1. Install **SenangStart** from the VS Code Extensions view, or install a packaged VSIX with **Extensions: Install from VSIX**.
2. Open **SenangStart** in the Activity Bar.
3. Choose **Sections**, **Icons**, **Shapes**, or **Libraries**. Click an asset to copy, or drag it into an editor.
4. Use **Libraries → Copy CDN** for the browser scripts/styles required by component markup. Raw SVG needs no library setup. Shapes setup includes `patterns.css`; XR setup loads A-Frame before the XR bundle.
5. Run **SenangStart: Refresh Sections** to reload bundled sections and icons. This does not check npm for updates.

## CSS autocomplete

Inside an opening HTML tag, type `lay` and press **Ctrl+Space** to complete `layout=""`. Inside a SenangStart attribute, complete keywords and property values:

```html
<div layout="flex col center" space="p:big g:medium" visual="bg:blue-500 rounded:big">
  Hello SenangStart
</div>
```

- `layout="fl"` suggests `flex`.
- `space="p:b"` suggests values such as `p:big`.
- `visual="bg:bl"` suggests named colors and palette shades.
- `space="tab:hover:p:b"` preserves `tab:hover:` while suggesting spacing values.
- Choose a `[value]` completion to enter an arbitrary CSS value, such as `w:[320px]`.

Completions replace only the current token, leaving other tokens and attributes intact. Comments, script/style bodies, and PHP code blocks are excluded. Suggestions apply to literal attributes, not framework bindings such as `:space`.

If your editor disables suggestions in strings, press **Ctrl+Space**, or enable them in your VS Code settings:

```json
"[html]": {
  "editor.quickSuggestions": { "strings": "on" }
}
```

Use the corresponding language override for Vue, Svelte, PHP, or Blade. Disable the provider with `"senangstart.cssAutocomplete.enabled": false`.

## Snippet prefixes

- `ss-css-cdn`, `ss-layout`
- `ss-icons-cdn`, `ss-icon`
- `ss-actions-cdn`, `ss-counter`, `ss-toggle`
- `ss-shapes-cdn`, `ss-shape`, `ss-patterns-cdn`, `ss-pattern`
- `ss-xr-cdn`, `ss-xr-scene`

Include each library's setup once per page. Use paired custom-element tags in HTML. Shape variants must exist for the selected shape; the browser shows only supported combinations. Give meaningful icons/shapes an accessible label, or mark decorative assets `aria-hidden="true"`.

## Development

Run `npm ci`, then press **F5** to launch the Extension Development Host. To package the extension, use `npx @vscode/vsce package`. Unit tests require explicit approval before running.

When updating library releases, verify their published npm versions and exports, update `src/libraries.js` and the corresponding CDN snippets, and refresh the bundled dependency lockfile. Refresh `media/senangstart-css.json` from the published CSS package's `types/senang-data.json`, retaining its source comment and adding `libraryVersion` for completion labels. Keep the version table in sync.

## License

MIT; see [LICENSE.md](LICENSE.md).
