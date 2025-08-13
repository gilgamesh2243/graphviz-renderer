import React from 'react';

interface ToolbarProps {
  onLayout: ()=>void;
  onExportPNG: ()=>void;
  onExportSVG: ()=>void;
  onShare: ()=>void;
  onRefresh: ()=>void;
  onSave: ()=>void;
  onZoomIn: ()=>void;
  onZoomOut: ()=>void;
  onFit: ()=>void;
  onFullscreen: ()=>void;
  autoLayout: boolean;
  onToggleAutoLayout: (v:boolean)=>void;
}

export const Toolbar: React.FC<ToolbarProps> = (p) => {
  const btn: React.CSSProperties = { cursor:'pointer', padding:'4px 10px', fontSize:12, border:'1px solid #cbd5e1', background:'#fff', borderRadius:6, boxShadow:'0 1px 1px rgba(0,0,0,.04)' };
  return (
    <div style={{display:'flex', gap:8, padding:8, borderBottom:'1px solid #e5e7eb', flexWrap:'wrap', alignItems:'center'}}>
      <button style={btn} onClick={p.onSave}>Save (⌘S)</button>
      <button style={btn} onClick={p.onLayout}>Auto‑layout (⌘⏎)</button>
      <label style={{display:'flex', alignItems:'center', gap:6}}>
        <input type="checkbox" checked={p.autoLayout} onChange={e=>p.onToggleAutoLayout(e.target.checked)} />
        Auto‑layout on Load
      </label>
      <span style={{marginLeft:8}} />
      <button style={btn} onClick={p.onZoomOut}>−</button>
      <button style={btn} onClick={p.onZoomIn}>+</button>
      <button style={btn} onClick={p.onFit}>Fit</button>
      <button style={btn} onClick={p.onFullscreen}>Full Screen</button>
      <span style={{marginLeft:8}} />
      <button style={btn} onClick={p.onExportPNG}>PNG</button>
      <button style={btn} onClick={p.onExportSVG}>SVG (⇧⌘S)</button>
  <button style={btn} onClick={p.onShare}>Share</button>
  <button style={btn} onClick={p.onRefresh} title="Reload from saved state (discard unsaved edits)">Refresh</button>
    </div>
  );
};
