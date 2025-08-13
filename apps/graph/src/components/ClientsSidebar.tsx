import React from 'react';
import { Client } from '../lib/models';

export const ClientsSidebar: React.FC<{
  items: Client[];
  activeId: string | null;
  onSelect: (id:string)=>void;
  onCreate: ()=>void;
  onRename: ()=>void;
  onDelete: ()=>void;
}> = ({ items, activeId, onSelect, onCreate, onRename, onDelete }) => {
  return (
  <div style={{ width: 220, flex:'0 0 220px', borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column', background:'#f9fafb' }}>
      <div style={{ padding:10, display:'flex', gap:8 }}>
        <button onClick={onCreate} style={btn}>+ Client</button>
        <button onClick={onRename} style={btn}>Rename</button>
        <button onClick={onDelete} style={btnDanger}>Del</button>
      </div>
      <div style={{ overflowY:'auto' }}>
        {items.map(c=>(
          <div key={c.id}
               onClick={()=>onSelect(c.id)}
               style={{
                 padding:'10px 12px', cursor:'pointer',
                 background: c.id===activeId ? '#e0f2fe' : 'transparent',
                 borderBottom:'1px solid #eef2f7', fontWeight:600,
                 transition:'background .12s ease'
               }}
               onMouseEnter={(e)=>{ (e.currentTarget as HTMLDivElement).style.background = c.id===activeId ? '#e0f2fe' : '#f3f4f6'; }}
               onMouseLeave={(e)=>{ (e.currentTarget as HTMLDivElement).style.background = c.id===activeId ? '#e0f2fe' : 'transparent'; }}>
            {c.name}
          </div>
        ))}
      </div>
    </div>
  );
};
const btn:React.CSSProperties={ fontSize:12, padding:'6px 10px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', cursor:'pointer', boxShadow:'0 1px 1px rgba(0,0,0,.04)' };
const btnDanger:React.CSSProperties={ ...btn, color:'#ef4444', borderColor:'#fecaca' };
