export type ID = string;

export interface Client {
  id: ID;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphDoc {
  id: ID;
  clientId: ID;
  name: string;
  text: string; // DOT or simple
  positions: Record<string, { x:number; y:number }>;
  viewport?: { zoom:number; pan:{ x:number; y:number } }; // persisted view state
  createdAt: string;
  updatedAt: string;
}
