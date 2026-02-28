// Fix database - remove foreign key constraint
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'quotes.db');
const db = new Database(dbPath);

try {
  console.log('🔧 Popravljam bazo podatkov...');
  
  // Disable foreign keys temporarily
  db.pragma('foreign_keys = OFF');
  
  // Create new quotes table without foreign key
  db.exec(`
    CREATE TABLE quotes_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      project_name TEXT,
      project_address TEXT,
      status TEXT DEFAULT 'draft',
      valid_until DATE,
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 22,
      tax_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      labor_total REAL DEFAULT 0,
      material_total REAL DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Copy data from old table
  db.exec(`INSERT INTO quotes_new SELECT * FROM quotes;`);
  
  // Drop old table
  db.exec(`DROP TABLE quotes;`);
  
  // Rename new table
  db.exec(`ALTER TABLE quotes_new RENAME TO quotes;`);
  
  // Recreate indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at);`);
  
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
  
  console.log('✅ Baza popravljena! FOREIGN KEY constraint odstranjen.');
  console.log('📊 Zdaj lahko shranjuješ predračune brez stranke (client_id = NULL)');
  
} catch (error) {
  console.error('❌ Napaka:', error.message);
} finally {
  db.close();
}
