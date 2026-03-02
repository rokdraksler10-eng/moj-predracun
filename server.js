const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { generateQuotePDF } = require('./pdf-generator');

const app = express();
const PORT = process.env.PORT || 3456;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection (use /data only if disk exists, otherwise ./data)
const dataDir = (process.env.RENDER && fs.existsSync('/data')) ? '/data' : './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'quotes.db'));
db.pragma('journal_mode = WAL');

// ==================== API ROUTES ====================

// Company Settings
app.get('/api/company', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    res.json(company || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/company', (req, res) => {
  try {
    const { name, address, phone, email, tax_id, bank_account, logo_path } = req.body;
    const stmt = db.prepare(`
      INSERT INTO company_settings (name, address, phone, email, tax_id, bank_account, logo_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        address = excluded.address,
        phone = excluded.phone,
        email = excluded.email,
        tax_id = excluded.tax_id,
        bank_account = excluded.bank_account,
        logo_path = excluded.logo_path
    `);
    stmt.run(name, address, phone, email, tax_id, bank_account, logo_path);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Work Items (Postavke del)
app.get('/api/work-items', (req, res) => {
  try {
    const allItems = db.prepare('SELECT * FROM work_items ORDER BY category, name').all();
    
    // Filter duplicates by name (keep first occurrence)
    const seenNames = new Set();
    const uniqueItems = allItems.filter(item => {
      if (seenNames.has(item.name)) return false;
      seenNames.add(item.name);
      return true;
    });
    
    console.log(`API: Returning ${uniqueItems.length} unique items (filtered from ${allItems.length})`);
    res.json(uniqueItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/work-items', (req, res) => {
  try {
    const { name, category, unit, base_price, difficulty_easy_factor, difficulty_medium_factor, difficulty_hard_factor, description } = req.body;
    const stmt = db.prepare(`
      INSERT INTO work_items (name, category, unit, base_price, difficulty_easy_factor, difficulty_medium_factor, difficulty_hard_factor, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, category, unit, base_price, difficulty_easy_factor, difficulty_medium_factor, difficulty_hard_factor, description);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Materials
app.get('/api/materials', (req, res) => {
  try {
    const allMaterials = db.prepare('SELECT * FROM materials ORDER BY category, name').all();
    
    // Filter duplicates by name (keep first occurrence)
    const seenNames = new Set();
    const uniqueMaterials = allMaterials.filter(mat => {
      if (seenNames.has(mat.name)) return false;
      seenNames.add(mat.name);
      return true;
    });
    
    console.log(`API: Returning ${uniqueMaterials.length} unique materials (filtered from ${allMaterials.length})`);
    res.json(uniqueMaterials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/materials', (req, res) => {
  try {
    const { name, category, unit, unit_price, description } = req.body;
    const stmt = db.prepare(`
      INSERT INTO materials (name, category, unit, unit_price, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, category, unit, unit_price, description);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete material
app.delete('/api/materials/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM materials WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Work Item Materials (povezovalna tabela)
app.get('/api/work-items/:id/materials', (req, res) => {
  try {
    const materials = db.prepare(`
      SELECT m.*, wim.quantity_per_unit 
      FROM materials m
      JOIN work_item_materials wim ON m.id = wim.material_id
      WHERE wim.work_item_id = ?
    `).all(req.params.id);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clients
app.get('/api/clients', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const { name, address, phone, email, type } = req.body;
    const stmt = db.prepare(`
      INSERT INTO clients (name, address, phone, email, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, address, phone, email, type);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quotes (Predračuni)
app.get('/api/quotes', (req, res) => {
  try {
    const quotes = db.prepare(`
      SELECT q.*, c.name as client_name 
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      ORDER BY q.created_at DESC
    `).all();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/quotes/:id', (req, res) => {
  try {
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    const items = db.prepare(`
      SELECT qi.*, wi.name as work_item_name, wi.unit as work_item_unit
      FROM quote_items qi
      JOIN work_items wi ON qi.work_item_id = wi.id
      WHERE qi.quote_id = ?
    `).all(req.params.id);
    
    res.json({ ...quote, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quotes', (req, res) => {
  try {
    const { client_id, project_name, project_address, valid_until, items, subtotal, tax_rate, tax_amount, total, labor_total, material_total } = req.body;
    
    // Use provided totals or calculate from items
    let finalSubtotal = subtotal || 0;
    let finalLaborTotal = labor_total || 0;
    let finalMaterialTotal = material_total || 0;
    let finalTaxRate = tax_rate || 22;
    let finalTaxAmount = tax_amount || 0;
    let finalTotal = total || 0;
    
    // If no totals provided, calculate from items
    if (!subtotal && items && items.length > 0) {
      finalSubtotal = 0;
      finalLaborTotal = 0;
      items.forEach(item => {
        const itemSubtotal = (item.quantity || 0) * (item.price_per_unit || 0);
        finalLaborTotal += itemSubtotal;
        finalSubtotal += itemSubtotal;
      });
      finalTaxAmount = finalSubtotal * (finalTaxRate / 100);
      finalTotal = finalSubtotal + finalTaxAmount;
    }
    
    // Insert quote
    const quoteStmt = db.prepare(`
      INSERT INTO quotes (client_id, project_name, project_address, valid_until, subtotal, tax_rate, tax_amount, total, labor_total, material_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const quoteResult = quoteStmt.run(client_id, project_name, project_address, valid_until || new Date().toISOString().split('T')[0], finalSubtotal, finalTaxRate, finalTaxAmount, finalTotal, finalLaborTotal, finalMaterialTotal);
    const quote_id = quoteResult.lastInsertRowid;
    
    // Insert items
    if (items && items.length > 0) {
      const itemStmt = db.prepare(`
        INSERT INTO quote_items (quote_id, work_item_id, quantity, price_per_unit, difficulty, notes, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      items.forEach(item => {
        const itemSubtotal = (item.quantity || 0) * (item.price_per_unit || 0);
        itemStmt.run(quote_id, item.work_item_id, item.quantity || 0, item.price_per_unit || 0, item.difficulty || 'medium', item.notes || '', itemSubtotal);
      });
    }
    
    res.json({ id: quote_id, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGO UPLOAD ====================
const multer = require('multer');

// Configure multer for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(dataDir, 'logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const logoUpload = multer({ 
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Samo slike so dovoljene (jpg, png, gif, svg, webp)'));
  }
});

// Upload logo endpoint
app.post('/api/company/logo', logoUpload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }
    
    // Delete old logo if exists
    const company = db.prepare('SELECT logo_path FROM company_settings LIMIT 1').get();
    if (company?.logo_path) {
      const oldLogoPath = path.join(dataDir, company.logo_path);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    
    // Save new logo path to database
    const relativePath = path.join('logos', req.file.filename);
    const stmt = db.prepare(`
      INSERT INTO company_settings (id, logo_path) VALUES (1, ?)
      ON CONFLICT(id) DO UPDATE SET logo_path = excluded.logo_path
    `);
    stmt.run(relativePath);
    
    res.json({ 
      success: true, 
      logo_path: relativePath,
      logo_url: `/api/company/logo`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logo endpoint
app.get('/api/company/logo', (req, res) => {
  try {
    const company = db.prepare('SELECT logo_path FROM company_settings LIMIT 1').get();
    if (!company?.logo_path) {
      return res.status(404).json({ error: 'No logo found' });
    }
    
    const logoPath = path.join(dataDir, company.logo_path);
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({ error: 'Logo file not found' });
    }
    
    res.sendFile(logoPath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete logo endpoint
app.delete('/api/company/logo', (req, res) => {
  try {
    const company = db.prepare('SELECT logo_path FROM company_settings LIMIT 1').get();
    if (company?.logo_path) {
      const logoPath = path.join(dataDir, company.logo_path);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
      
      const stmt = db.prepare('UPDATE company_settings SET logo_path = NULL WHERE id = 1');
      stmt.run();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PDF GENERATION ====================

app.get('/api/quotes/:id/pdf/:type', async (req, res) => {
  try {
    const { id, type } = req.params;
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(quote.client_id);
    const items = db.prepare(`
      SELECT qi.*, wi.name as work_item_name, wi.unit as work_item_unit
      FROM quote_items qi
      JOIN work_items wi ON qi.work_item_id = wi.id
      WHERE qi.quote_id = ?
    `).all(id);
    
    // Check for logo
    let logoPath = null;
    if (company?.logo_path) {
      const fullLogoPath = path.join(dataDir, company.logo_path);
      if (fs.existsSync(fullLogoPath)) {
        logoPath = fullLogoPath;
      }
    }
    
    // Generate PDF using Puppeteer
    const pdfBuffer = await generateQuotePDF(quote, company, client, items, type, logoPath);
    
    const filename = type === 'internal' ? `navodila-${id}.pdf` : `predracun-${id}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYNC SYSTEM ====================
// Simple sync system using codes (no registration needed)

const SYNC_DIR = path.join(dataDir, 'sync');
if (!fs.existsSync(SYNC_DIR)) {
  fs.mkdirSync(SYNC_DIR, { recursive: true });
}

// Generate random sync code
function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7) code += '-';
  }
  return code;
}

// Clean expired sync files (older than 24 hours)
function cleanExpiredSyncs() {
  try {
    const files = fs.readdirSync(SYNC_DIR);
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(SYNC_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime.getTime();
      if (age > 24 * 60 * 60 * 1000) { // 24 hours
        fs.unlinkSync(filePath);
        console.log(`🗑️ Expired sync deleted: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning expired syncs:', error);
  }
}

// Clean expired syncs every hour
setInterval(cleanExpiredSyncs, 60 * 60 * 1000);

// Create sync code with data
app.post('/api/sync/create', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }
    
    const code = generateSyncCode();
    const syncData = {
      code: code,
      data: data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const filePath = path.join(SYNC_DIR, `${code.replace(/-/g, '')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(syncData, null, 2));
    
    console.log(`✅ Sync code created: ${code}`);
    res.json({ 
      code: code, 
      expiresAt: syncData.expiresAt,
      message: 'Sync code created. Valid for 24 hours.'
    });
  } catch (error) {
    console.error('Error creating sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get data by sync code
app.post('/api/sync/retrieve', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    const cleanCode = code.replace(/-/g, '').toUpperCase();
    const filePath = path.join(SYNC_DIR, `${cleanCode}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Invalid or expired sync code' });
    }
    
    const syncData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check if expired
    const now = new Date();
    const expiresAt = new Date(syncData.expiresAt);
    if (now > expiresAt) {
      fs.unlinkSync(filePath);
      return res.status(404).json({ error: 'Sync code has expired' });
    }
    
    console.log(`✅ Sync data retrieved: ${code}`);
    res.json({
      data: syncData.data,
      createdAt: syncData.createdAt,
      expiresAt: syncData.expiresAt
    });
  } catch (error) {
    console.error('Error retrieving sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check sync status
app.post('/api/sync/status', (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }
    
    const cleanCode = code.replace(/-/g, '').toUpperCase();
    const filePath = path.join(SYNC_DIR, `${cleanCode}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.json({ exists: false, valid: false });
    }
    
    const syncData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const now = new Date();
    const expiresAt = new Date(syncData.expiresAt);
    const isValid = now <= expiresAt;
    
    if (!isValid) {
      fs.unlinkSync(filePath);
    }
    
    res.json({
      exists: true,
      valid: isValid,
      expiresAt: syncData.expiresAt,
      expiresIn: Math.floor((expiresAt - now) / 1000 / 60) // minutes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Gradbeni app teče na:`);
  console.log(`   http://localhost:${PORT} (lokalno)`);
  console.log(`   http://0.0.0.0:${PORT} (omrežje)`);
  console.log(`📁 Podatkovna baza: data/quotes.db`);
});

module.exports = app;