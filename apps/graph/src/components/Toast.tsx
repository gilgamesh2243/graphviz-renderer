import React from 'react';
export const Toast: React.FC<{ show:boolean; text:string; tone?:'ok'|'info' }> = ({ show, text, tone='ok' }) => {
  const bg = tone==='ok' ? '#065f46' : '#111827';
  return (
    <div style={{
      position:'fixed', right:16, bottom:16, pointerEvents:'none',
      opacity: show ? 1 : 0, transform: `translateY(${show?0:8}px)`,
      transition:'opacity .15s ease, transform .15s ease', zIndex:50
    }}>
      <div style={{ background:bg, color:'#fff', padding:'8px 12px', borderRadius:8, boxShadow:'0 4px 20px rgba(0,0,0,.18)', fontSize:12, fontWeight:600 }}>
        {text}
      </div>
    </div>
  );
};
