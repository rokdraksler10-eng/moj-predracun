#!/usr/bin/env node
// Database migration script for Phase 5

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dataDir = process.env.RENDER && fs.existsSync('/data') ? '/data' : './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'quotes.db'));

console.log('🔄 Faza 5: Migracija baze podatkov...\n');

try {
  // Read and execute schema
  const schema = fs.readFileSync('./database/schema-phase5.sql', 'utf8');
  
  // Split by semicolon and execute each statement
  const statements = schema.split(';').filter(s => s.trim());
  
  statements.forEach((stmt, idx) => {
    try {
      if (stmt.trim()) {
        db.exec(stmt);
        process.stdout.write('.');
      }
    } catch (err) {
      // Ignore "already exists" errors
      if (!err.message.includes('already exists')) {
        console.error(`\n⚠️  Napaka v stavku ${idx + 1}:`, err.message);
      }
    }
  });
  
  console.log('\n\n✅ Migracija končana!');
  console.log('📊 Nove tabele:');
  console.log('  - client_notes');
  console.log('  - client_interactions');
  console.log('  - client_tags');
  console.log('  - client_reminders');
  console.log('  - payments');
  console.log('  - payment_schedules');
  console.log('  - email_log');
  console.log('  - email_templates');
  console.log('  - project_phases');
  console.log('  - work_diary');
  console.log('  - expenses');
  console.log('  - suppliers');
  console.log('  - purchase_orders');
  console.log('  - purchase_order_items');
  
} catch (error) {
  console.error('❌ Napaka pri migraciji:', error.message);
  process.exit(1);
}

db.close();
console.log('\n🎉 Faza 5 je pripravljena!');
