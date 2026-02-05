import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'ekhata.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  // Create customers table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      total_pending REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Create transactions table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      customer_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('purchase', 'payment')),
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );
  `);

  // Create products table (line items for purchases)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      transaction_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity TEXT,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
    );
  `);

  // Create index for faster queries
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_customer_id ON transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transaction_id ON products(transaction_id);
  `);

  // Migration: Add quantity column to existing products table if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE products ADD COLUMN quantity TEXT;
    `);
  } catch (error) {
    // Column already exists, ignore error
  }

  dbInstance = db;
  return db;
};

export const getDatabase = async () => {
  if (!dbInstance) {
    return await initDatabase();
  }
  return dbInstance;
};
