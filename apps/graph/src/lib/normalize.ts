import { parseDot } from './parseDot';
import { parseSimple } from './parseSimple';
import { colorForLabel } from './styles';

export interface Node { id:string; label:string; fill?:string; stroke?:string; color?:string }
export interface Edge { id:string; source:string; target:string; label?:string; stroke?:string }

export function parseInput(text:string): { nodes:Node[]; edges:Edge[] } {
  const parsed = /digraph/i.test(text) ? parseDot(text) : parseSimple(text);
  const nodes = parsed.nodes.map((n:any)=>{
    const stroke = n.stroke || colorForLabel(n.label);
    const fill = n.fill || '#ffffff';
    return { ...n, stroke, fill, color: stroke };
  });
  const edges = parsed.edges.map((e:any)=>({ ...e, stroke: e.stroke || '#111827' }));
  return { nodes, edges };
}
