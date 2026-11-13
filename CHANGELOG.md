# Changelog

All notable changes to the SenangStart VS Code extension are documented in this file.

## [Unreleased]

## [0.2.0] - 2026-11-14

### Added

- Offline SenangStart CSS autocomplete in HTML, Vue, Svelte, PHP, and Blade, powered by bundled CSS 0.4.2 editor metadata.
- Attribute-name and utility-value suggestions, palette colors, arbitrary-value placeholders, and stacked responsive/state prefixes such as `tab:hover:`.
- The `senangstart.cssAutocomplete.enabled` setting to enable or disable CSS completions.
- A Shapes browser with 496 SVG assets and 20 background patterns, searchable by name, category, and supported variant.
- Copy and drag support for shape components, pattern classes, and standalone SVG assets.
- Library documentation, repositories, and version-pinned npm/CDN setup for SenangStart CSS, Icons, Actions, Shapes, and XR.
- Thirteen starter snippets for HTML, Vue, Svelte, and PHP, including CSS layouts, reactive Actions controls, shapes, patterns, and XR scenes.
- Persistent browsing state for the selected tab, search query, copy format, and shape collection.
- Keyboard-accessible asset buttons, visible focus indicators, and result counts.

### Changed

- Updated bundled SenangStart Icons from 1.0.14 to 1.0.17 and added SenangStart Shapes 0.1.2.
- Updated library setup references to CSS 0.4.2, Icons 1.0.17, Actions 0.1.7, Shapes 0.1.2, and XR 2.1.0.
- Improved icon search to match multiple terms across names and tags.
- Limited webview updates to the active collection and debounced search input.
- Excluded existing VSIX packages and the agent guide from extension packages.

### Fixed

- Initial webview content loading by waiting for the client-ready message before sending collection data.
- Search and selected copy formats being lost when the webview is recreated.
- Icon metadata lookup when resolving the installed icon package.
- Refresh command completion now waits for sections to reload.

### Security

- Added a nonce-based Content Security Policy for webview scripts.
- Sanitized SVG previews and rendered asset labels as text.
- Removed command-URI access and restricted local resource loading in the webview.

### Removed

- The unused `axios` runtime dependency.
