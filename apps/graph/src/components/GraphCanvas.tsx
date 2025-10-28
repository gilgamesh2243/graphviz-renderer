import React, { useEffect, useRef } from 'react';
import cytoscape, { Core } from 'cytoscape';
import elk from 'cytoscape-elk';
import 'cytoscape-svg';
import { cyStyle } from '../lib/styles';

cytoscape.use(elk);

interface GraphCanvasProps {
  elements: { nodes: any[]; edges: any[] };
  positions: Record<string, { x: number; y: number }>;
  viewport?: { zoom:number; pan:{ x:number; y:number } };
  onPositions: (p: Record<string, { x: number; y: number }>) => void;
  cyRef: React.MutableRefObject<Core | null>;
  autoLayoutOnLoad?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ elements, positions, viewport, onPositions, cyRef, autoLayoutOnLoad = true }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialLayoutDoneRef = useRef(false);
  // Track whether we've already applied the persisted viewport for the current element set
  const viewportAppliedRef = useRef(false);

  // Init Cytoscape once
  useEffect(() => {
    if(!containerRef.current) return;
  const cy = cytoscape({ container: containerRef.current, elements: [], style: cyStyle as any, wheelSensitivity:0.2 });
  // Ensure user interactions are enabled
  cy.userZoomingEnabled(true);
  cy.userPanningEnabled(true);
  cy.boxSelectionEnabled(false);
    cyRef.current = cy;
    cy.on('dragfree', 'node', () => {
      const pos: Record<string,{x:number;y:number}> = {};
      cy.nodes().forEach(n=>{ pos[n.id()] = n.position(); });
      onPositions(pos);
    });
    return ()=>{ cy.destroy(); };
  }, []);

  // Rebuild on any elements change (simpler & reliable)
  useEffect(()=>{
    const cy = cyRef.current; if(!cy) return;
    cy.batch(()=>{
      cy.elements().remove();
      const positionsComplete = elements.nodes.length>0 && elements.nodes.every(n=>positions[n.id]);
      const nodes = elements.nodes.map(n=>({
        data:{ id:n.id, label:n.label, color:n.color, fill:(n as any).fill, stroke:(n as any).stroke },
        position: positionsComplete ? positions[n.id] : undefined
      }));
      const edges = elements.edges.map(e=>({ data:{ id:e.id, source:e.source, target:e.target, label:e.label, stroke:(e as any).stroke }}));
      cy.add([...nodes, ...edges]);
      cy.nodes().unlock();

      const positionsCompleteAfterAdd = elements.nodes.length>0 && elements.nodes.every(n=>positions[n.id]);
      if(positionsCompleteAfterAdd){
        // We'll apply the stored viewport in a dedicated effect after this rebuild; mark as not yet applied.
        viewportAppliedRef.current = false;
      } else if(autoLayoutOnLoad) {
        // need layout (no saved positions yet) - only auto-layout if enabled
        cy.layout({
          name:'elk',
          elk:{ algorithm:'layered','elk.direction':'RIGHT',
            'elk.spacing.componentComponent':120,
            'elk.layered.spacing.nodeNodeBetweenLayers':140,
            'elk.layered.spacing.edgeNodeBetweenLayers':80,
            'elk.layered.nodePlacement.bk.fixedAlignment':'BALANCED' }
        } as any).run();
        initialLayoutDoneRef.current = true;
        cy.fit(undefined, 40);
        // capture positions from layout
        const pos: Record<string,{x:number;y:number}> = {};
        cy.nodes().forEach(n=>{ pos[n.id()] = n.position(); });
        onPositions(pos);
        viewportAppliedRef.current = true; // fit already applied as initial viewport
      }
      if(elements.nodes.length===0) initialLayoutDoneRef.current = false;
    });
  }, [elements, autoLayoutOnLoad]);

  // Apply external position updates (drag/save) without rebuild
  useEffect(()=>{
    const cy = cyRef.current; if(!cy) return;
    if(!positions) return;
    cy.batch(()=>{
      Object.entries(positions).forEach(([id,p])=>{
        const node = cy.$id(id);
        if(node && node.nonempty()) node.position(p);
      });
    });
  }, [positions]);

  // Apply persisted viewport exactly once per element set (prevents zoom jumping on drag-end)
  useEffect(()=>{
    const cy = cyRef.current; if(!cy) return;
    if(!viewport) return;
    if(viewportAppliedRef.current) return;
    const positionsComplete = elements.nodes.length>0 && elements.nodes.every(n=>positions[n.id]);
    if(!positionsComplete) return;
    // Only apply if current zoom/pan differ meaningfully (avoid needless reflow)
    const eps = 0.0001;
    const pan = cy.pan();
    const zoom = cy.zoom();
    const panDiff = Math.abs(pan.x - viewport.pan.x) > 0.5 || Math.abs(pan.y - viewport.pan.y) > 0.5;
    const zoomDiff = Math.abs(zoom - viewport.zoom) > eps;
    if(panDiff || zoomDiff){
      cy.batch(()=>{ cy.zoom(viewport.zoom); cy.pan(viewport.pan); });
    }
    viewportAppliedRef.current = true;
  }, [viewport, elements]);

  return <div ref={containerRef} style={{ width:'100%', height:'100%' }} />;
};
