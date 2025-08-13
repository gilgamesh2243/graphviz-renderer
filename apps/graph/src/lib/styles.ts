export const COLORS = {
  default: '#1f2937',
  user: '#1f285a',
  website: '#60a5fa',
  ip: '#fca5a5'
};

export function colorForLabel(label:string){
  if(/user/i.test(label)) return COLORS.user;
  if(/website/i.test(label)) return COLORS.website;
  if(/ip.?loc/i.test(label)) return COLORS.ip;
  return COLORS.default;
}

export const cyStyle = [
  { selector: 'node', style: {
    'background-color': 'data(fill)',
    'border-width': 4,
    'border-color': 'data(stroke)',
    'shape': 'round-rectangle',
    'width': 'label',
    'height': 'label',
    'padding': '14px',
    'label': 'data(label)',
    'font-size': 16,
    'font-weight': 700,
    'text-valign': 'center',
    'text-halign': 'center'
  }},
  { selector: 'edge', style: {
    'curve-style': 'bezier',
    'control-point-step-size': 60,
    'target-arrow-shape': 'triangle',
    'arrow-scale': 1.2,
    'width': 2,
  'line-color': 'data(stroke)',
  'target-arrow-color': 'data(stroke)',
    'label': 'data(label)',
    'font-size': 12,
    'text-background-color': '#fff',
    'text-background-opacity': 1,
  'text-background-padding': 2,
  'edge-text-rotation': 'autorotate',
  'text-margin-y': -6
  }},
  { selector: ':selected', style: { 'border-color': '#0ea5e9', 'line-color': '#0ea5e9', 'target-arrow-color': '#0ea5e9' } }
];
