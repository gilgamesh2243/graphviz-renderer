
![App Screenshot](./Screenshot%202025-08-12%20at%2011.11.06%E2%80%AFPM.png)

# Multi-Company Graph Manager

A fast, local-first graph visualization tool for managing multiple clients and their graphs. Built with React, Vite, TypeScript, Cytoscape, and Monaco Editor. Now with Turso database support for cloud persistence!

## Features
- Multi-pane UI: Clients | Graphs | Editor | Canvas
- **Turso Database Integration**: Cloud-based persistence with Turso or local in-memory database
- **Graceful Error Handling**: Parse errors display with helpful messages while preserving your last valid visualization
- Node position and viewport saving
- Auto-layout (ELK), zoom, fit, fullscreen
- Export as PNG/SVG
- Shareable graph links (URL hash)
- Monaco-powered text editor
- Explicit save, refresh, and toast notifications

## Quick Start

### Local Development (In-Memory Database)
```bash
npm install
npm run graph:dev
```
Visit `http://localhost:5173` (or as shown in terminal).

The app will use an in-memory SQLite database by default, which is perfect for local development and testing.

### Production Setup with Turso

To use Turso for cloud persistence:

1. **Install Turso CLI** (if you haven't already):
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. **Create a Turso database**:
   ```bash
   turso db create graphviz-renderer
   ```

3. **Get your database URL**:
   ```bash
   turso db show graphviz-renderer --url
   ```

4. **Create an authentication token**:
   ```bash
   turso db tokens create graphviz-renderer
   ```

5. **Configure environment variables**:
   
   Copy the example environment file:
   ```bash
   cd apps/graph
   cp .env.example .env
   ```
   
   Edit `.env` and add your Turso credentials:
   ```
   VITE_TURSO_DATABASE_URL=libsql://your-database.turso.io
   VITE_TURSO_AUTH_TOKEN=your-auth-token-here
   ```

6. **Build and run**:
   ```bash
   npm run graph:build
   npm run graph:preview
   ```

### Data Migration

If you have existing data in localStorage, it will be automatically migrated to the Turso database on the first run when Turso is configured.

## Folder Structure
```
apps/
  graph/
    src/
      components/   # UI components (Canvas, Editor, Sidebars, Toolbar)
      lib/          # Models, store, parsing, styles, database
        db.ts       # Turso database integration
        store.ts    # Storage abstraction (localStorage or Turso)
    index.html      # Entry point
    package.json    # App dependencies
    .env.example    # Example environment configuration
```

## Usage Notes
- **Save**: Click Save or press ⌘S to persist graph text, positions, and viewport.
- **Refresh**: Click Refresh to reload the current graph from saved state (discarding unsaved edits).
- **Share**: Click Share to copy a URL with the current graph encoded.
- **Export**: PNG/SVG export available from the toolbar.
- **Auto-layout**: Toggle auto-layout preference; run layout manually as needed.
- **Parse Errors**: If your graph syntax has errors, you'll see a helpful error message at the bottom of the screen. The last valid visualization will remain displayed so you don't lose your work. Simply fix the syntax and the visualization will update automatically.

## Database Options

This application supports two storage modes:

1. **In-Memory SQLite** (Default for local development)
   - No configuration needed
   - Data is reset on page refresh
   - Perfect for testing and development

2. **Turso Database** (Recommended for production)
   - Cloud-based persistence
   - Automatic data migration from localStorage
   - Shared access across devices
   - Configure via environment variables

## License
MIT (add your details)
