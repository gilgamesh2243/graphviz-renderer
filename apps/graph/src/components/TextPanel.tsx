import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

export const TextPanel: React.FC<{ value:string; onChange:(v:string)=>void; debounceMs?:number }> = ({ value, onChange, debounceMs=300 }) => {
  const containerRef = useRef<HTMLDivElement|null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor|null>(null);
  const lastValueRef = useRef(value);
  const timerRef = useRef<number|undefined>();

  useEffect(()=>{
    if(!containerRef.current) return;
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language: 'plaintext',
      automaticLayout: true,
      minimap: { enabled:false },
      fontSize: 14,
      theme: 'vs',
    });
    const sub = editorRef.current.onDidChangeModelContent(()=>{
      const v = editorRef.current!.getValue();
      if(timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(()=>{
        if(v !== lastValueRef.current){
          lastValueRef.current = v;
          onChange(v);
        }
      }, debounceMs);
    });
    return ()=>{ sub.dispose(); editorRef.current?.dispose(); };
  },[]);

  useEffect(()=>{
    if(value !== lastValueRef.current){
      lastValueRef.current = value;
      if(editorRef.current && editorRef.current.getValue() !== value){
        editorRef.current.setValue(value);
      }
    }
  },[value]);

  return <div ref={containerRef} style={{flex:1, width:'100%', height:'100%', fontFamily:'monospace'}}/>;
};
