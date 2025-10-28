import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { Toolbar } from './components/Toolbar';
import { CollapsibleEditor } from './components/CollapsibleEditor';
import { ClientsSidebar } from './components/ClientsSidebar';
import { GraphsSidebar } from './components/GraphsSidebar';
import { parseInput } from './lib/normalize';
import { decodeShare, encodeShare } from './lib/share';
import { clients, graphs, id, now, ui } from './lib/store';
import { Client, GraphDoc } from './lib/models';
import type { Core } from 'cytoscape';
import { Toast } from './components/Toast';

const DEFAULT_TEXT = `digraph G {
  User -> IPLocation [label="USED"];
  User -> Website [label="VISITED"];
  IPLocation -> Website [label="USED"];
}`;

export default function App() {
  // graph content
  const [text, setText] = useState<string>('');
  const [elements, setElements] = useState<any>({ nodes: [], edges: [] });
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [parseError, setParseError] = useState<string | null>(null);

  // org / graphs
  const [clientList, setClientList] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [graphList, setGraphList] = useState<GraphDoc[]>([]);
  const [graphId, setGraphId] = useState<string | null>(null);

  const cyRef = useRef<Core | null>(null);
  const [saved, setSaved] = useState(false);
  const [autoLayoutOnLoad, setAutoLayoutOnLoad] = useState<boolean>(ui.getAutoLayout());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const skipNextPositionsPersist = useRef(false);
  
  // Keep track of last valid elements to restore on parse error
  const lastValidElements = useRef<any>({ nodes: [], edges: [] });

  // bootstrap (clients + graphs + initial text)
  useEffect(() => {
    let cs = clients.list();
    if (cs.length === 0) {
      const c: Client = { id: id(), name: 'Acme', slug: 'acme', createdAt: now(), updatedAt: now() };
      clients.upsert(c); cs = [c];
      const g: GraphDoc = { id: id(), clientId: c.id, name: 'Getting Started', text: DEFAULT_TEXT, positions: {}, createdAt: now(), updatedAt: now() };
      graphs.upsert(g);
    }
    setClientList(cs);
    const remembered = ui.getActive();
    const activeClientId = remembered.clientId && cs.find(x => x.id === remembered.clientId)
      ? remembered.clientId!
      : cs[0].id;
    setClientId(activeClientId);
    const gs = graphs.listByClient(activeClientId);
    setGraphList(gs);
    const activeGraphId = remembered.graphId && gs.find(x => x.id === remembered.graphId)
      ? remembered.graphId!
      : (gs[0]?.id ?? null);
    setGraphId(activeGraphId);

    const shared = decodeShare();
    const currentGraph = activeGraphId ? graphs.get(activeGraphId) : null;
    // prefer saved graph; fall back to shared; clear hash if only shared used
    const initialText = currentGraph?.text ?? shared?.text ?? DEFAULT_TEXT;
    const initialPos = currentGraph?.positions ?? shared?.positions ?? {};
    setText(initialText);
    setPositions(initialPos);
    const parsed = parseInput(initialText);
    setElements(parsed);
    if (parsed.error) {
      setParseError(parsed.error);
    } else {
      lastValidElements.current = parsed;
    }
    if (shared && !currentGraph?.text) window.location.hash = '';
  }, []);

  // switching client loads its graphs
  const onSelectClient = (idStr: string) => {
    setClientId(idStr);
    ui.setActive(idStr, null);
    const gs = graphs.listByClient(idStr);
    setGraphList(gs);
    setGraphId(gs[0]?.id ?? null);
    if (gs[0]) {
      setText(gs[0].text);
      setPositions(gs[0].positions || {});
      const parsed = parseInput(gs[0].text);
      setElements(parsed);
      if (parsed.error) {
        setParseError(parsed.error);
      } else {
        setParseError(null);
        lastValidElements.current = parsed;
      }
    } else {
      setText(DEFAULT_TEXT);
      setPositions({});
      const parsed = parseInput(DEFAULT_TEXT);
      setElements(parsed);
      setParseError(null);
      lastValidElements.current = parsed;
    }
  };

  // switching graph loads its content
  useEffect(() => {
    if (!graphId) return;
    if (clientId) ui.setActive(clientId, graphId);
    const g = graphs.get(graphId);
    if (!g) return;
  skipNextPositionsPersist.current = true; // avoid writing back immediately with identical data
    setText(g.text);
    setPositions(g.positions || {});
    const parsed = parseInput(g.text);
    setElements(parsed);
    if (parsed.error) {
      setParseError(parsed.error);
    } else {
      setParseError(null);
      lastValidElements.current = parsed;
    }
  }, [graphId]);

  // edit text → reparse, prune positions, persist
  const onChange = useCallback((val: string) => {
    setText(val);
    const parsed = parseInput(val);
    
    // If parsing fails, show error but keep last valid visualization
    if (parsed.error) {
      setParseError(parsed.error);
      // Keep the last valid elements displayed so graph doesn't disappear
      setElements(lastValidElements.current);
    } else {
      setParseError(null);
      setElements(parsed);
      lastValidElements.current = parsed;
      
      // Only update positions and persist if parsing succeeded
      setPositions(prev => {
        const keep = new Set(parsed.nodes.map(n => n.id));
        const next: any = {}; for (const k in prev) if (keep.has(k)) next[k] = prev[k]; return next;
      });
    }
    
    // Always persist text changes (even with errors) so user doesn't lose work
    if (graphId) {
      const g = graphs.get(graphId); if (g) { g.text = val; g.updatedAt = now(); graphs.upsert(g); setGraphList(graphs.listByClient(g.clientId)); }
    }
  }, [graphId]);

  // update stored positions whenever they change
  useEffect(() => {
    if (!graphId) return;
    if (skipNextPositionsPersist.current){
      skipNextPositionsPersist.current = false;
      return;
    }
    const g = graphs.get(graphId); if (!g) return;
    g.positions = positions; g.updatedAt = now();
    graphs.upsert(g);
    setGraphList(graphs.listByClient(g.clientId));
  }, [positions, graphId]);

  // canvas layout & exports (keep existing behavior)
  const onLayout = useCallback(() => {
    const cy = cyRef.current as any; if (!cy) return;
    cy.layout({
      name: 'elk',
      elk: {
        algorithm: 'layered', 'elk.direction': 'RIGHT',
        'elk.spacing.componentComponent': 120,
        'elk.layered.spacing.nodeNodeBetweenLayers': 140,
        'elk.layered.spacing.edgeNodeBetweenLayers': 80,
        'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED'
      }
    }).run();
    const pos: Record<string, { x: number, y: number }> = {};
    cy.nodes().forEach((n: any) => { pos[n.id()] = n.position(); });
    setPositions(pos);
  }, []);

  const onShare = useCallback(async () => {
    const cy = cyRef.current as any; if (!cy) return;
    const pos: Record<string, { x: number, y: number }> = {};
    cy.nodes().forEach((n: any) => { pos[n.id()] = n.position(); });
    encodeShare({ text, positions: pos });
    try { await navigator.clipboard.writeText(window.location.href); } catch { }
  }, [text]);

  const onExportPNG = useCallback(() => {
    const cy = cyRef.current as any; if (!cy) return;
    const png = cy.png({ full: true, bg: '#ffffff' });
    const a = document.createElement('a'); a.download = 'graph.png'; a.href = png; a.click();
  }, []);

  const onExportSVG = useCallback(() => {
    const cy = cyRef.current as any; if (!cy) return;
    const svg = cy.svg({ full: true });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.download = 'graph.svg'; a.href = url; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, []);

  // Reload graph data & positions from persisted store (discarding unsaved editor changes / drag moves)
  const onRefresh = useCallback(() => {
    if(!graphId) return;
    const g = graphs.get(graphId); if(!g) return;
    skipNextPositionsPersist.current = true; // avoid immediate re-persist
    setText(g.text);
    setPositions(g.positions || {});
    const parsed = parseInput(g.text);
    setElements(parsed);
    if (parsed.error) {
      setParseError(parsed.error);
    } else {
      setParseError(null);
      lastValidElements.current = parsed;
    }
    // restore viewport if saved
    const cy = cyRef.current; if(cy && g.viewport){ cy.zoom(g.viewport.zoom); cy.pan(g.viewport.pan); }
  }, [graphId]);

  const saveNow = useCallback(() => {
    if (!graphId) return;
    const g = graphs.get(graphId); if (!g) return;
    const cy = cyRef.current as any;
    const pos: Record<string, { x: number, y: number }> = {};
    if (cy) {
      cy.nodes().forEach((n: any) => { pos[n.id()] = n.position(); });
      g.viewport = { zoom: cy.zoom(), pan: cy.pan() };
    }
    g.text = text;
    // always assign (ensures fresh snapshot even if empty or during race conditions)
    g.positions = pos;
    g.updatedAt = now();
    graphs.upsert(g);
    setGraphList(graphs.listByClient(g.clientId));
    setSaved(true); window.setTimeout(() => setSaved(false), 900);
  }, [graphId, text]);

  // client CRUD
  const newClient = () => {
    const name = prompt('Client name?'); if (!name) return;
    const c: Client = { id: id(), name, slug: name.toLowerCase().replace(/\s+/g, '-'), createdAt: now(), updatedAt: now() };
    clients.upsert(c); setClientList(clients.list()); onSelectClient(c.id);
    const g: GraphDoc = { id: id(), clientId: c.id, name: 'New Graph', text: DEFAULT_TEXT, positions: {}, createdAt: now(), updatedAt: now() };
    graphs.upsert(g); setGraphList(graphs.listByClient(c.id)); setGraphId(g.id);
  };
  const renameClient = () => {
    if (!clientId) return; const c = clients.list().find(x => x.id === clientId); if (!c) return;
    const name = prompt('Rename client', c.name); if (!name) return;
    clients.upsert({ ...c, name, slug: name.toLowerCase().replace(/\s+/g, '-'), updatedAt: now() });
    setClientList(clients.list());
  };
  const deleteClient = () => {
    if (!clientId) return; if (!confirm('Delete client and all graphs?')) return;
    // remove graphs for this client
    graphs.listByClient(clientId).forEach(g => graphs.remove(g.id));
    clients.remove(clientId);
    const cs = clients.list(); setClientList(cs);
    if (cs[0]) onSelectClient(cs[0].id); else { setClientId(null); setGraphList([]); setGraphId(null); }
  };

  // graph CRUD
  const newGraph = () => {
    if (!clientId) return;
    const name = prompt('Graph name?', 'Untitled') || 'Untitled';
    const g: GraphDoc = { id: id(), clientId, name, text: DEFAULT_TEXT, positions: {}, createdAt: now(), updatedAt: now() };
    graphs.upsert(g); setGraphList(graphs.listByClient(clientId)); setGraphId(g.id);
  };
  const renameGraph = () => {
    if (!graphId) return; const g = graphs.get(graphId); if (!g) return;
    const name = prompt('Rename graph', g.name); if (!name) return;
    g.name = name; g.updatedAt = now(); graphs.upsert(g);
    setGraphList(graphs.listByClient(g.clientId));
  };
  const duplicateGraph = () => {
    if (!graphId) return; const g = graphs.get(graphId); if (!g) return;
    const copy: GraphDoc = { ...g, id: id(), name: `${g.name} (copy)`, createdAt: now(), updatedAt: now() };
    graphs.upsert(copy); setGraphList(graphs.listByClient(copy.clientId)); setGraphId(copy.id);
  };
  const deleteGraph = () => {
    if (!graphId) return; if (!confirm('Delete graph?')) return;
    const g = graphs.get(graphId); if (!g) return;
    graphs.remove(graphId);
    const gs = graphs.listByClient(g.clientId); setGraphList(gs); setGraphId(gs[0]?.id ?? null);
  };

  // keyboard shortcuts (keep existing) for layout + SVG
  const onZoom = (delta: number) => { const cy = cyRef.current as any; if (!cy) return; cy.zoom({ level: cy.zoom() * delta, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } }); };
  const onZoomIn = () => onZoom(1.2);
  const onZoomOut = () => onZoom(1 / 1.2);
  const onFit = () => { const cy = cyRef.current as any; if (!cy) return; cy.fit(undefined, 40); };
  const onFullscreen = () => { const el = containerRef.current || document.documentElement; if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.(); };

  // keyboard shortcut zoom in and out with + -
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+') {
          e.preventDefault();
          onZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          onZoomOut();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onZoomIn, onZoomOut]);

  const toggleAutoLayout = (v: boolean) => { setAutoLayoutOnLoad(v); ui.setAutoLayout(v); };

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc', color: '#111827' }}>
      <ClientsSidebar
        items={clientList}
        activeId={clientId}
        onSelect={onSelectClient}
        onCreate={newClient}
        onRename={renameClient}
        onDelete={deleteClient}
      />
      <GraphsSidebar
        items={graphList}
        activeId={graphId}
        onSelect={(id) => setGraphId(id)}
        onCreate={newGraph}
        onRename={renameGraph}
        onDuplicate={duplicateGraph}
        onDelete={deleteGraph}
      />
      <CollapsibleEditor
        value={text}
        onChange={onChange}
  toolbar={<Toolbar onLayout={onLayout} onShare={onShare} onExportPNG={onExportPNG} onExportSVG={onExportSVG} onRefresh={onRefresh} onSave={saveNow} onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFit={onFit} onFullscreen={onFullscreen} autoLayout={autoLayoutOnLoad} onToggleAutoLayout={toggleAutoLayout} />}
      />
      <div style={{ flex: '1 1 0%', minWidth: 0 }}>
        <GraphCanvas elements={elements} positions={positions} viewport={graphId ? graphs.get(graphId)?.viewport : undefined} onPositions={(p) => setPositions(p)} cyRef={cyRef} />
      </div>
      <Toast show={saved} text="Saved" />
      {parseError && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <strong>Parse Error:</strong> {parseError}
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
              Fix the syntax to update the visualization
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
