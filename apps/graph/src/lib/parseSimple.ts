import { ParsedResult } from './parseDot';

const LINE_RE = /^"?(.*?)"?\s+-([^-]+)->\s+"?(.*?)"?$/;
const NODE_RE = /^"?(.*?)"?\s*\[\s*(.*?)\s*\]$/;

function parseKV(s: string){
  const out: Record<string,string> = {};
  s.split(',').forEach(p=>{
    const [k,v] = p.split('=').map(x=>x.trim());
    if(!k || !v) return;
    out[k.toLowerCase()] = v.replace(/^['"]|['"]$/g,'');
  });
  return out;
}

export function parseSimple(src: string): ParsedResult {
  const nodes = new Map<string, { id:string; label:string; fill?:string; stroke?:string }>();
  const edges: ParsedResult['edges'] = [];

  src.split(/\r?\n/).forEach(line=>{
    const t = line.trim(); if(!t) return;

    // Node style line
    const n = t.match(NODE_RE);
    if(n){
      const id = n[1];
      const kv = parseKV(n[2]);
      const cur = nodes.get(id) || { id, label: id };
      if(kv.fill) cur.fill = kv.fill;
      if(kv.stroke) cur.stroke = kv.stroke;
      nodes.set(id, cur);
      return;
    }

    // Edge line
    const m = t.match(LINE_RE);
    if(m){
      const [, from, label, to] = m;
      if(!nodes.has(from)) nodes.set(from, { id: from, label: from });
      if(!nodes.has(to)) nodes.set(to, { id: to, label: to });
      edges.push({ id: `${from}__${to}__${label}__${edges.length}`, source: from, target: to, label: label.trim() });
    }
  });

  return { nodes: [...nodes.values()], edges };
}
