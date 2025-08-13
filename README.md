
![App Screenshot](./Screenshot%202025-08-12%20at%2011.11.06%E2%80%AFPM.png)

# Multi-Company Graph Manager

A fast, local-first graph visualization tool for managing multiple clients and their graphs. Built with React, Vite, TypeScript, Cytoscape, and Monaco Editor.

## Features
- Multi-pane UI: Clients | Graphs | Editor | Canvas
- LocalStorage persistence (no server required)
- Node position and viewport saving
- Auto-layout (ELK), zoom, fit, fullscreen
- Export as PNG/SVG
- Shareable graph links (URL hash)
- Monaco-powered text editor
- Explicit save, refresh, and toast notifications

## Quick Start
```bash
npm install
npm run dev
```
Visit `http://localhost:5173` (or as shown in terminal).

## Folder Structure
```
apps/
  graph/
    src/
      components/   # UI components (Canvas, Editor, Sidebars, Toolbar)
      lib/          # Models, store, parsing, styles
    index.html      # Entry point
    package.json    # App dependencies
```

## Usage Notes
- **Save**: Click Save or press ⌘S to persist graph text, positions, and viewport.
- **Refresh**: Click Refresh to reload the current graph from saved state (discarding unsaved edits).
- **Share**: Click Share to copy a URL with the current graph encoded.
- **Export**: PNG/SVG export available from the toolbar.
- **Auto-layout**: Toggle auto-layout preference; run layout manually as needed.

## License
MIT (add your details)
