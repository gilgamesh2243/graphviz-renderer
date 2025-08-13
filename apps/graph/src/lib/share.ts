import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

interface SharePayload { text:string; positions: Record<string,{x:number,y:number}> }

export function encodeShare(data: Partial<SharePayload>){
  try {
    const json = JSON.stringify(data);
    const c = compressToEncodedURIComponent(json);
    window.location.hash = c;
  } catch(e){ /* ignore */ }
}

export function decodeShare(): Partial<SharePayload> | null {
  if(typeof window === 'undefined') return null;
  const h = window.location.hash.slice(1);
  if(!h) return null;
  try {
    const d = decompressFromEncodedURIComponent(h);
    if(!d) return null;
    return JSON.parse(d);
  } catch(e){ return null; }
}
