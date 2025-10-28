import { graphlib } from 'graphlib';
import { read } from 'graphlib-dot';

export interface ParsedResult {
  nodes: { id: string; label: string; fill?: string; stroke?: string }[];
  edges: { id: string; source: string; target: string; label?: string; stroke?: string }[];
}

// tiny deterministic hash (stable edge IDs)
function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function parseDot(src: string): ParsedResult {
  let g: graphlib.Graph | null = null;
  try { 
    g = read(src); 
  } catch (err) { 
    throw new Error(`Invalid DOT syntax: ${err instanceof Error ? err.message : 'parse error'}`);
  }

  const nodes = g.nodes().map((id: string) => {
    const a: any = g!.node(id) || {};
    return {
      id,
      label: a.label || id,
      fill: a.fillcolor || a.fill || undefined,
      stroke: a.stroke || a.color || undefined,
    };
  });

  const edges = g.edges().map((e: any) => {
    const a: any = g!.edge(e) || {};
    const lbl = a.label || '';
    const id = `e_${hash(`${e.v}|${e.w}|${lbl}|${e.name || ''}`)}`;
    return { id, source: e.v, target: e.w, label: lbl, stroke: a.color || undefined };
  });

  return { nodes, edges };
}
