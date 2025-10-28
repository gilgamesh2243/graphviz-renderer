import { createClient, type Client as LibsqlClient } from '@libsql/client';
import { Client, GraphDoc, ID } from './models';

let db: LibsqlClient | null = null;

export function initializeDatabase(url?: string, authToken?: string): LibsqlClient | null {
  // Only initialize database if URL is provided (Turso mode)
  // Without URL, we'll use localStorage mode
  if (!url) {
    return null;
  }
  
  db = createClient({
    url,
    authToken
  });
  return db;
}

export async function setupTables() {
  if (!db) throw new Error('Database not initialized');

  // Create clients table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Create graphs table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS graphs (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      positions TEXT,
      viewport TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better query performance
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_graphs_clientId ON graphs(clientId)
  `);
}

// Client operations
export const dbClients = {
  async list(): Promise<Client[]> {
    if (!db) throw new Error('Database not initialized');
    const result = await db.execute('SELECT * FROM clients ORDER BY name');
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string
    }));
  },

  async upsert(c: Client): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute({
      sql: `
        INSERT INTO clients (id, name, slug, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          updatedAt = excluded.updatedAt
      `,
      args: [c.id, c.name, c.slug, c.createdAt, c.updatedAt]
    });
  },

  async remove(cid: ID): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute({
      sql: 'DELETE FROM clients WHERE id = ?',
      args: [cid]
    });
  }
};

// Graph operations
export const dbGraphs = {
  async listByClient(clientId: ID): Promise<GraphDoc[]> {
    if (!db) throw new Error('Database not initialized');
    const result = await db.execute({
      sql: 'SELECT * FROM graphs WHERE clientId = ? ORDER BY updatedAt DESC',
      args: [clientId]
    });
    return result.rows.map(row => ({
      id: row.id as string,
      clientId: row.clientId as string,
      name: row.name as string,
      text: row.text as string,
      positions: row.positions ? JSON.parse(row.positions as string) : {},
      viewport: row.viewport ? JSON.parse(row.viewport as string) : undefined,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string
    }));
  },

  async get(id: ID): Promise<GraphDoc | undefined> {
    if (!db) throw new Error('Database not initialized');
    const result = await db.execute({
      sql: 'SELECT * FROM graphs WHERE id = ?',
      args: [id]
    });
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
    return {
      id: row.id as string,
      clientId: row.clientId as string,
      name: row.name as string,
      text: row.text as string,
      positions: row.positions ? JSON.parse(row.positions as string) : {},
      viewport: row.viewport ? JSON.parse(row.viewport as string) : undefined,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string
    };
  },

  async upsert(g: GraphDoc): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute({
      sql: `
        INSERT INTO graphs (id, clientId, name, text, positions, viewport, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          clientId = excluded.clientId,
          name = excluded.name,
          text = excluded.text,
          positions = excluded.positions,
          viewport = excluded.viewport,
          updatedAt = excluded.updatedAt
      `,
      args: [
        g.id,
        g.clientId,
        g.name,
        g.text,
        JSON.stringify(g.positions || {}),
        g.viewport ? JSON.stringify(g.viewport) : null,
        g.createdAt,
        g.updatedAt
      ]
    });
  },

  async remove(id: ID): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute({
      sql: 'DELETE FROM graphs WHERE id = ?',
      args: [id]
    });
  }
};

export function getDatabase(): LibsqlClient | null {
  return db;
}
