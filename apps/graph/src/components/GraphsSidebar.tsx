import React from 'react';
import { GraphDoc } from '../lib/models';

export const GraphsSidebar: React.FC<{
  items: GraphDoc[];
  activeId: string | null;
  onSelect:(id:string)=>void;
  onCreate: ()=>void;
  onRename: ()=>void;
  onDuplicate: ()=>void;
  onDelete: ()=>void;
}> = ({ items, activeId, onSelect, onCreate, onRename, onDuplicate, onDelete }) => {
  return (
  <div style={{ width: 260, flex:'0 0 260px', borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column', background:'#fbfbfd' }}>
      <div style={{ padding:10, display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={onCreate} style={btn}>+ Graph</button>
        <button onClick={onRename} style={btn}>Rename</button>
        <button onClick={onDuplicate} style={btn}>Duplicate</button>
        <button onClick={onDelete} style={btnDanger}>Del</button>
      </div>
      <div style={{ overflowY:'auto' }}>
        {items.map(g=>(
          <div key={g.id}
               onClick={()=>onSelect(g.id)}
               style={{
                 padding:'10px 12px', cursor:'pointer',
                 background: g.id===activeId ? '#ecfeff' : 'transparent',
                 borderBottom:'1px solid #eef2f7',
                 transition:'background .12s ease'
               }}
               onMouseEnter={(e)=>{ (e.currentTarget as HTMLDivElement).style.background = g.id===activeId ? '#ecfeff' : '#f3f4f6'; }}
               onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.background = g.id===activeId ? '#ecfeff' : 'transparent'; }}>
            <div style={{ fontWeight:600 }}>{g.name}</div>
            <div style={{ fontSize:12, color:'#64748b' }}>{new Date(g.updatedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
const btn:React.CSSProperties={ fontSize:12, padding:'6px 10px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', boxShadow:'0 1px 1px rgba(0,0,0,.04)' };
const btnDanger:React.CSSProperties={ ...btn, color:'#ef4444', borderColor:'#fecaca' };
