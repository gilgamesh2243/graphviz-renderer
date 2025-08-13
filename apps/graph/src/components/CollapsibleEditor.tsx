import React, { useState } from 'react';
import { TextPanel } from './TextPanel';

export const CollapsibleEditor: React.FC<{ value:string; onChange:(v:string)=>void; toolbar: React.ReactNode }> = ({ value, onChange, toolbar }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ width: open ? 480 : 40, minWidth:40, borderRight:'1px solid #e5e7eb', display:'flex', flexDirection:'column', transition:'width .18s ease-out', flexShrink:0, background:'#ffffff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:8, borderBottom:'1px solid #e5e7eb' }}>
        <button onClick={()=>setOpen(!open)} title={open ? 'Collapse' : 'Expand'} style={toggleBtn}>{open ? '⟨' : '⟩'}</button>
        {open && <div style={{ flex:1, overflow:'hidden' }}>{toolbar}</div>}
      </div>
      <div style={{ display: open ? 'flex' : 'none', flex:1, minHeight:0 }}>
        <TextPanel value={value} onChange={onChange} />
      </div>
    </div>
  );
};
const toggleBtn:React.CSSProperties={ width:28, height:28, borderRadius:8, border:'1px solid #cbd5e1', background:'#fff', cursor:'pointer', boxShadow:'0 1px 2px rgba(0,0,0,.06)' };
