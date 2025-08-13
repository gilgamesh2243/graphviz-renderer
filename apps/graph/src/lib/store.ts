import { Client, GraphDoc, ID } from './models';

const K_CLIENTS = 'graphvis.clients.v1';
const K_GRAPHS  = 'graphvis.graphs.v1';
const K_ACTIVE_CLIENT = 'graphvis.activeClient.v1';
const K_ACTIVE_GRAPH  = 'graphvis.activeGraph.v1';
const K_AUTOLAYOUT    = 'graphvis.autoLayout.v1';

export const id = () => (crypto as any).randomUUID?.() || Math.random().toString(36).slice(2);
export const now = () => new Date().toISOString();

const read = <T>(k:string, d:T):T => { try { return JSON.parse(localStorage.getItem(k) || '') as T; } catch { return d; } };
const write = <T>(k:string, v:T) => localStorage.setItem(k, JSON.stringify(v));

export const clients = {
  list(){ return read<Client[]>(K_CLIENTS, []); },
  upsert(c:Client){ const all = clients.list(); const i = all.findIndex(x=>x.id===c.id); i>=0? all.splice(i,1,c):all.push(c); write(K_CLIENTS, all); },
  remove(cid:ID){ write(K_CLIENTS, clients.list().filter(c=>c.id!==cid)); },
};

export const graphs = {
  listByClient(clientId:ID){ return read<GraphDoc[]>(K_GRAPHS, []).filter(g=>g.clientId===clientId).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); },
  get(id:ID){ return read<GraphDoc[]>(K_GRAPHS, []).find(g=>g.id===id); },
  upsert(g:GraphDoc){ const all = read<GraphDoc[]>(K_GRAPHS, []); const i = all.findIndex(x=>x.id===g.id); i>=0? all.splice(i,1,g):all.push(g); write(K_GRAPHS, all); },
  remove(id:ID){ write(K_GRAPHS, read<GraphDoc[]>(K_GRAPHS, []).filter(g=>g.id!==id)); }
};

export const ui = {
  getActive(){ return { clientId: localStorage.getItem(K_ACTIVE_CLIENT), graphId: localStorage.getItem(K_ACTIVE_GRAPH) }; },
  setActive(clientId?:ID|null, graphId?:ID|null){
    if (clientId !== undefined && clientId !== null) localStorage.setItem(K_ACTIVE_CLIENT, clientId);
    if (graphId  !== undefined && graphId  !== null) localStorage.setItem(K_ACTIVE_GRAPH, graphId);
  },
  getAutoLayout(){ return localStorage.getItem(K_AUTOLAYOUT) !== 'false'; }, // default true
  setAutoLayout(v:boolean){ localStorage.setItem(K_AUTOLAYOUT, v ? 'true' : 'false'); }
};
