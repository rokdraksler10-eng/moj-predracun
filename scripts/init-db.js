const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists (use ./data for Free plan, /data only if disk is mounted)
const dataDir = (process.env.RENDER && fs.existsSync('/data')) ? '/data' : path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'quotes.db'));
db.pragma('journal_mode = WAL');

console.log('🗄️  Inicializacija baze...');

// Company Settings
db.exec(`
  CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT '',
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    bank_account TEXT,
    logo_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  INSERT OR IGNORE INTO company_settings (id, name) VALUES (1, 'Moje Gradbeno Podjetje');
`);

// Work Items (Postavke del)
db.exec(`
  CREATE TABLE IF NOT EXISTS work_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Splošno',
    unit TEXT NOT NULL DEFAULT 'm²',
    base_price REAL NOT NULL DEFAULT 0,
    difficulty_easy_factor REAL DEFAULT 0.8,
    difficulty_medium_factor REAL DEFAULT 1.0,
    difficulty_hard_factor REAL DEFAULT 1.3,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_work_items_category ON work_items(category);
`);

// Materials
db.exec(`
  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Splošno',
    unit TEXT NOT NULL DEFAULT 'kg',
    unit_price REAL NOT NULL DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
`);

// Work Item Materials (povezovalna tabela - koliko materiala gre na enoto dela)
db.exec(`
  CREATE TABLE IF NOT EXISTS work_item_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_item_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    quantity_per_unit REAL NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    UNIQUE(work_item_id, material_id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_wim_work_item ON work_item_materials(work_item_id);
`);

// Clients
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    type TEXT DEFAULT 'fizicna', -- fizicna ali pravna
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Quotes (Predračuni)
db.exec(`
  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    project_name TEXT,
    project_address TEXT,
    status TEXT DEFAULT 'draft', -- draft, sent, accepted, rejected
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
    -- FOREIGN KEY removed to allow NULL client_id
  );
  
  CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
  CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at);
`);

// Quote Items (Postavke v predračunu)
db.exec(`
  CREATE TABLE IF NOT EXISTS quote_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    work_item_id INTEGER NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    price_per_unit REAL NOT NULL DEFAULT 0,
    difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
    notes TEXT,
    subtotal REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (work_item_id) REFERENCES work_items(id)
  );
  
  CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
`);

// Sample Data
db.exec(`
  -- Demo Work Items (Realistic Construction Prices)
  INSERT OR IGNORE INTO work_items (name, category, unit, base_price, difficulty_easy_factor, difficulty_medium_factor, difficulty_hard_factor, description) VALUES
  ('Polaganje keramičnih ploščic', 'Keramika', 'm²', 28, 0.85, 1.0, 1.35, 'Polaganje ploščic na tla ali stene'),
  ('Polaganje velkoformatnih ploščic', 'Keramika', 'm²', 38, 0.85, 1.0, 1.4, 'Polaganje XXL ploščic (nad 60x60cm)'),
  ('Hidroizolacija - tekoča', 'Izolacije', 'm²', 15, 0.9, 1.0, 1.3, 'Nanašanje tekoče hidroizolacije'),
  ('Hidroizolacija - bitumenska', 'Izolacije', 'm²', 18, 0.9, 1.0, 1.3, 'Bitumenska trakova in premazi'),
  ('Montaža sadrokartona - stene', 'Suhomontaža', 'm²', 22, 0.88, 1.0, 1.35, 'Montaža GK sten (dvojna plošča)'),
  ('Montaža sadrokartona - strop', 'Suhomontaža', 'm²', 26, 0.88, 1.0, 1.4, 'Montaža spuščenega stropa'),
  ('Svetilne niše v GK', 'Suhomontaža', 'kos', 45, 0.9, 1.0, 1.3, 'Izkrojene niše za svetila'),
  ('Notranje slikanje - 2x', 'Pleskarija', 'm²', 12, 0.9, 1.0, 1.25, 'Dva sloja barve (temeljno + fasadna)'),
  ('Notranje slikanje - kvalitetno', 'Pleskarija', 'm²', 18, 0.9, 1.0, 1.25, 'Kvalitetno pleskarstvo s kitom'),
  ('Parket - polaganje', 'Talne obloge', 'm²', 32, 0.9, 1.0, 1.35, 'Polaganje masivnega parketa'),
  ('Laminat - polaganje', 'Talne obloge', 'm²', 14, 0.9, 1.0, 1.3, 'Polaganje laminata'),
  ('Vinyl - polaganje', 'Talne obloge', 'm²', 16, 0.9, 1.0, 1.3, 'Polaganje vinilnih talnih oblog'),
  ('Elektro inštalacije - točke', 'Elektro', 'kos', 85, 0.9, 1.0, 1.35, 'Nova elektro točka (doza + vtičnica)'),
  ('Elektro inštalacije - razdelilna omara', 'Elektro', 'kos', 350, 0.95, 1.0, 1.25, 'Montaža razdelilne omarice'),
  ('Vodovod - priklop točke', 'Vodovod', 'kos', 120, 0.9, 1.0, 1.35, 'Priklop pipe (grelnik, pomivalno...)'),
  ('Odtoki - priklop', 'Vodovod', 'kos', 95, 0.9, 1.0, 1.35, 'Priklop odtoka (umivalnik, wc...)'),
  ('Demontaža starih ploščic', 'Demontaža', 'm²', 12, 1.0, 1.0, 1.2, 'Odstranjevanje starih ploščic'),
  ('Odvažanje gradbenega materiala', 'Transport', 't', 85, 1.0, 1.0, 1.0, 'Odvažanje in odlaganje materiala');
  
  -- Sample Materials
  INSERT OR IGNORE INTO materials (name, category, unit, unit_price, description) VALUES
  ('Keramične ploščice - standard', 'Keramika', 'm²', 12, 'Standardne keramične ploščice'),
  ('Keramične ploščice - premium', 'Keramika', 'm²', 25, 'Premium kakovost'),
  ('Lepilo za ploščice', 'Keramika', 'kg', 0.8, 'Flexibilno lepilo'),
  ('Fugirna masa', 'Keramika', 'kg', 1.2, 'Fuga za ploščice'),
  ('Hidroizolacija - tekoča', 'Izolacije', 'kg', 3.5, 'Tečna hidroizolacija'),
  ('Sádrokarton plošča', 'Suhomontaža', 'm²', 4.5, 'Standardna GK plošča'),
  ('Profili za suhomontažo', 'Suhomontaža', 'm', 2.8, 'Kovinski profili'),
  ('Disperzijska barva', 'Pleskarija', 'L', 3.2, 'Notranja bela barva'),
  ('Parket - hrast', 'Talne obloge', 'm²', 45, 'Masivni hrastov parket'),
  ('Laminat - klasa 32', 'Talne obloge', 'm²', 18, 'Laminat za stanovanja'),
  ('Elektro doza', 'Elektro', 'kos', 1.5, 'Podometna doza'),
  ('Elektro vtičnica', 'Elektro', 'kos', 4.5, 'Schuko vtičnica'),
  ('Elektro stikalo', 'Elektro', 'kos', 3.8, 'Stikalo za luč'),
  ('Vodovodni ventil', 'Vodovod', 'kos', 12, 'Krogelni ventil'),
  ('Sifon', 'Vodovod', 'kos', 8, 'Odtok sifon');
  
  -- Sample Work Item Materials (poraba materiala na enoto)
  INSERT OR IGNORE INTO work_item_materials (work_item_id, material_id, quantity_per_unit)
  SELECT 
    (SELECT id FROM work_items WHERE name = 'Polaganje keramičnih ploščic'),
    (SELECT id FROM materials WHERE name = 'Keramične ploščice - standard'),
    1.1  -- 10% odpadka
  UNION ALL
  SELECT 
    (SELECT id FROM work_items WHERE name = 'Polaganje keramičnih ploščic'),
    (SELECT id FROM materials WHERE name = 'Lepilo za ploščice'),
    5    -- 5kg na m²
  UNION ALL
  SELECT 
    (SELECT id FROM work_items WHERE name = 'Polaganje keramičnih ploščic'),
    (SELECT id FROM materials WHERE name = 'Fugirna masa'),
    0.5  -- 0.5kg na m²
  UNION ALL
  SELECT 
    (SELECT id FROM work_items WHERE name = 'Hidroizolacija'),
    (SELECT id FROM materials WHERE name = 'Hidroizolacija - tekoča'),
    1.5; -- 1.5kg na m²
`);

// ============================================
// NOVE TABELE ZA NAPREDNE FUNKCIJE
// ============================================

// Templates (Predloge predračunov) - Smart ponudnik
// Templates (Predloge predračunov) - Smart ponudnik
db.exec(`
  CREATE TABLE IF NOT EXISTS quote_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Splošno',
    icon TEXT DEFAULT '📋',
    items_json TEXT NOT NULL, -- JSON array of template items
    is_default INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_templates_category ON quote_templates(category);
`);

// Quote Photos (Fotografije k projektom)
db.exec(`
  CREATE TABLE IF NOT EXISTS quote_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    caption TEXT,
    photo_type TEXT DEFAULT 'other', -- 'before', 'during', 'after', 'other'
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
  );
  
  CREATE INDEX IF NOT EXISTS idx_photos_quote ON quote_photos(quote_id);
`);

// Voice Notes (Glasovne beležke)
db.exec(`
  CREATE TABLE IF NOT EXISTS quote_voice_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER,
    calculator_note INTEGER DEFAULT 0, -- 1 if this is calculator voice note
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    duration INTEGER, -- duration in seconds
    transcript TEXT, -- AI/prepoznani tekst
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
  );
  
  CREATE INDEX IF NOT EXISTS idx_voice_notes_quote ON quote_voice_notes(quote_id);
`);

// Default Templates (Pripravljeni predlogi za slovenski trg)
db.exec(`
  INSERT OR IGNORE INTO quote_templates (name, description, category, icon, items_json, is_default) VALUES
  ('🛁 Kopalnica - standard', 'Kompletna prenova kopalnice do 5m²', 'Kopalnica', '🛁', '[
    {"work_item_id": "hidroizolacija", "name": "Hidroizolacija - tekoča", "quantity": 25, "difficulty": "medium", "base_price": 15},
    {"work_item_id": "keramika", "name": "Polaganje keramičnih ploščic", "quantity": 25, "difficulty": "medium", "base_price": 28},
    {"work_item_id": "mozaik", "name": "Polaganje mozaika", "quantity": 8, "difficulty": "hard", "base_price": 38},
    {"work_item_id": "silikon", "name": "Silikoniranje fug", "quantity": 33, "difficulty": "easy", "base_price": 8.8},
    {"work_item_id": "vticnice", "name": "Elektro inštalacije - točke", "quantity": 4, "difficulty": "medium", "base_price": 85},
    {"work_item_id": "priklop_vode", "name": "Vodovod - priklop točke", "quantity": 3, "difficulty": "medium", "base_price": 120},
    {"work_item_id": "odtok", "name": "Odtoki - priklop", "quantity": 2, "difficulty": "medium", "base_price": 95}
  ]', 1),
  
  ('🛁 Kopalnica - velika', 'Kompletna prenova kopalnice nad 8m²', 'Kopalnica', '🛁', '[
    {"work_item_id": "hidroizolacija", "name": "Hidroizolacija - tekoča", "quantity": 40, "difficulty": "medium", "base_price": 15},
    {"work_item_id": "keramika", "name": "Polaganje keramičnih ploščic", "quantity": 40, "difficulty": "medium", "base_price": 28},
    {"work_item_id": "vticnice", "name": "Elektro inštalacije - točke", "quantity": 6, "difficulty": "medium", "base_price": 85},
    {"work_item_id": "priklop_vode", "name": "Vodovod - priklop točke", "quantity": 4, "difficulty": "medium", "base_price": 120},
    {"work_item_id": "odtok", "name": "Odtoki - priklop", "quantity": 3, "difficulty": "medium", "base_price": 95}
  ]', 1),
  
  ('🛋️ Dnevna soba - talne obloge', 'Menjava talnih oblog v dnevni sobi', 'Soba', '🛋️', '[
    {"work_item_id": "demontaza", "name": "Demontaža starih ploščic", "quantity": 20, "difficulty": "easy", "base_price": 12},
    {"work_item_id": "laminat", "name": "Laminat - polaganje", "quantity": 20, "difficulty": "medium", "base_price": 14},
    {"work_item_id": "barvanje", "name": "Notranje slikanje - 2x", "quantity": 50, "difficulty": "medium", "base_price": 12}
  ]', 1),
  
  ('🍳 Kuhinja - adaptacija', 'Prenova kuhinje', 'Kuhinja', '🍳', '[
    {"work_item_id": "keramika", "name": "Polaganje keramičnih ploščic", "quantity": 15, "difficulty": "medium", "base_price": 28},
    {"work_item_id": "vticnice", "name": "Elektro inštalacije - točke", "quantity": 5, "difficulty": "medium", "base_price": 85},
    {"work_item_id": "priklop_vode", "name": "Vodovod - priklop točke", "quantity": 2, "difficulty": "medium", "base_price": 120},
    {"work_item_id": "barvanje", "name": "Notranje slikanje - 2x", "quantity": 25, "difficulty": "medium", "base_price": 12}
  ]', 1),
  
  ('🚽 Samo sanitarne inštalacije', 'Samo zamenjava WC, umivalnika, tuša', 'Kopalnica', '🚽', '[
    {"work_item_id": "priklop_vode", "name": "Vodovod - priklop točke", "quantity": 3, "difficulty": "medium", "base_price": 120},
    {"work_item_id": "odtok", "name": "Odtoki - priklop", "quantity": 3, "difficulty": "medium", "base_price": 95},
    {"work_item_id": "silikon", "name": "Silikoniranje fug", "quantity": 5, "difficulty": "easy", "base_price": 8.8}
  ]', 1),
  
  ('🏠 Celotno stanovanje - osnovno', 'Osnovna prenova celotnega stanovanja', 'Stanovanje', '🏠', '[
    {"work_item_id": "demontaza", "name": "Demontaža starih ploščic", "quantity": 30, "difficulty": "easy", "base_price": 12},
    {"work_item_id": "hidroizolacija", "name": "Hidroizolacija - tekoča", "quantity": 25, "difficulty": "medium", "base_price": 15},
    {"work_item_id": "keramika", "name": "Polaganje keramičnih ploščic", "quantity": 25, "difficulty": "medium", "base_price": 28},
    {"work_item_id": "laminat", "name": "Laminat - polaganje", "quantity": 35, "difficulty": "medium", "base_price": 14},
    {"work_item_id": "gk_stene", "name": "Montaža sadrokartona - stene", "quantity": 20, "difficulty": "medium", "base_price": 22},
    {"work_item_id": "barvanje", "name": "Notranje slikanje - 2x", "quantity": 120, "difficulty": "medium", "base_price": 12},
    {"work_item_id": "vticnice", "name": "Elektro inštalacije - točke", "quantity": 8, "difficulty": "medium", "base_price": 85}
  ]', 1)
`);

console.log('✅ Baza inicializirana!');
console.log('📊 Tabele: company_settings, work_items, materials, work_item_materials, clients, quotes, quote_items');
console.log('🆕 NOVE TABELE: quote_templates, quote_photos, quote_voice_notes');
console.log('📝 Vzorčni podatki vstavljeni');
console.log('📋 Pripravljenih 6 predlog za hitre ponudbe');

db.close();