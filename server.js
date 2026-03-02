const express = require('express');
const Database = require('better-sqlite3');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

// Migration: Add status column if not exists
try {
  db.prepare(`ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'pending'`).run();
  console.log('Migration: Added status column to quotes');
} catch (e) {
  // Column already exists
}

// Load DejaVu fonts
const fontRegular = path.join(__dirname, 'DejaVuSans.ttf');
const fontBold = path.join(__dirname, 'DejaVuSans-Bold.ttf');

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

// Quotes
app.get('/api/quotes', (req, res) => {
  try {
    const quotes = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all();
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
    
    let finalSubtotal = subtotal || 0;
    let finalLaborTotal = labor_total || 0;
    let finalMaterialTotal = material_total || 0;
    let finalTaxRate = tax_rate || 22;
    let finalTaxAmount = tax_amount || 0;
    let finalTotal = total || 0;
    
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
    
    const quoteStmt = db.prepare(`
      INSERT INTO quotes (client_id, project_name, project_address, valid_until, subtotal, tax_rate, tax_amount, total, labor_total, material_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const quoteResult = quoteStmt.run(client_id, project_name, project_address, valid_until || new Date().toISOString().split('T')[0], finalSubtotal, finalTaxRate, finalTaxAmount, finalTotal, finalLaborTotal, finalMaterialTotal);
    const quote_id = quoteResult.lastInsertRowid;
    
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

// Update quote status
app.patch('/api/quotes/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const stmt = db.prepare('UPDATE quotes SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);
    
    if (result.changes > 0) {
      res.json({ success: true, status });
    } else {
      res.status(404).json({ error: 'Predračun ni najden' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quote
app.delete('/api/quotes/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete quote items
    const deleteItems = db.prepare('DELETE FROM quote_items WHERE quote_id = ?');
    deleteItems.run(id);
    
    // Then delete quote
    const deleteQuote = db.prepare('DELETE FROM quotes WHERE id = ?');
    const result = deleteQuote.run(id);
    
    if (result.changes > 0) {
      res.json({ success: true, message: 'Predračun izbrisan' });
    } else {
      res.status(404).json({ error: 'Predračun ni najden' });
    }
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGO UPLOAD ====================
const multer = require('multer');

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
  limits: { fileSize: 2 * 1024 * 1024 },
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

app.post('/api/company/logo', logoUpload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }
    
    const company = db.prepare('SELECT logo_path FROM company_settings LIMIT 1').get();
    if (company?.logo_path) {
      const oldLogoPath = path.join(dataDir, company.logo_path);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    
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

app.get('/api/quotes/:id/pdf/:type', (req, res) => {
  try {
    const { id, type } = req.params;
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    
    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(quote.client_id);
    const items = db.prepare(`
      SELECT qi.*, wi.name as work_item_name, wi.unit as work_item_unit
      FROM quote_items qi
      JOIN work_items wi ON qi.work_item_id = wi.id
      WHERE qi.quote_id = ?
    `).all(id);
    
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = type === 'internal' ? `navodila-${id}.pdf` : `predracun-${id}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    doc.pipe(res);
    
    // Register DejaVu fonts
    doc.registerFont('DejaVu', fontRegular);
    doc.registerFont('DejaVu-Bold', fontBold);
    
    // Check for logo
    let logoPath = null;
    if (company?.logo_path) {
      const fullLogoPath = path.join(dataDir, company.logo_path);
      if (fs.existsSync(fullLogoPath)) {
        logoPath = fullLogoPath;
      }
    }
    
    // Settings
    const pageWidth = 612;
    const margin = 50;
    const isInternal = type === 'internal';
    const primaryColor = isInternal ? '#059669' : '#2563eb';
    
    // Header
    let y = 50;
    
    if (logoPath) {
      try {
        doc.image(logoPath, margin, y, { width: 80, height: 60 });
        doc.font('DejaVu-Bold').fontSize(16).fillColor('#1e293b').text(company?.name || '', margin + 90, y + 10);
      } catch (e) {
        doc.font('DejaVu-Bold').fontSize(20).fillColor('#1e293b').text(company?.name || 'Moje Gradbeno Podjetje', margin, y);
      }
    } else {
      doc.font('DejaVu-Bold').fontSize(20).fillColor('#1e293b').text(company?.name || 'Moje Gradbeno Podjetje', margin, y);
    }
    
    // Company info
    y += 35;
    doc.font('DejaVu').fontSize(9).fillColor('#64748b');
    doc.text(company?.address || '', margin, y);
    doc.text(`Tel: ${company?.phone || '-'} | Email: ${company?.email || '-'}`, margin, y + 12);
    if (company?.tax_id) {
      doc.text(`Davčna številka: ${company.tax_id}`, margin, y + 24);
    }
    
    // Document type box
    const boxY = 50;
    doc.rect(pageWidth - margin - 150, boxY, 150, 60).lineWidth(1.5).stroke(primaryColor);
    doc.font('DejaVu-Bold').fontSize(11).fillColor(primaryColor);
    doc.text(isInternal ? 'NAVODILA ZA DELO' : 'PREDRAČUN', pageWidth - margin - 140, boxY + 12, { width: 130, align: 'center' });
    doc.fontSize(20);
    doc.text(`#${quote.id}`, pageWidth - margin - 140, boxY + 32, { width: 130, align: 'center' });
    
    // Line
    y += 50;
    doc.strokeColor('#e2e8f0').lineWidth(1);
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
    
    // Info section
    y += 20;
    doc.font('DejaVu-Bold').fontSize(10).fillColor('#475569');
    doc.text('Datum izdaje:', margin, y);
    doc.text('Veljavnost:', margin + 140, y);
    doc.text('Projekt:', margin + 280, y);
    
    doc.font('DejaVu').fontSize(10).fillColor('#0f172a');
    doc.text(new Date(quote.created_at).toLocaleDateString('sl-SI'), margin, y + 14);
    doc.text(new Date(quote.valid_until).toLocaleDateString('sl-SI'), margin + 140, y + 14);
    doc.text(quote.project_name || 'Brez naziva', margin + 280, y + 14, { width: 180 });
    
    // Client box
    y += 50;
    doc.rect(margin, y, pageWidth - margin * 2, 45).fill('#f8fafc');
    doc.font('DejaVu-Bold').fontSize(9).fillColor('#475569');
    doc.text('STRANKA', margin + 10, y + 8);
    doc.font('DejaVu-Bold').fontSize(12).fillColor('#0f172a');
    doc.text(client?.name || quote.client_name || 'Brez naziva', margin + 10, y + 22);
    doc.font('DejaVu').fontSize(9).fillColor('#64748b');
    doc.text(client?.address || quote.project_address || '', margin + 10, y + 36);
    
    // Table
    y += 65;
    const tableWidth = pageWidth - margin * 2;
    
    // Table header
    doc.rect(margin, y, tableWidth, 22).fill('#f1f5f9');
    doc.font('DejaVu-Bold').fontSize(9).fillColor('#475569');
    
    if (isInternal) {
      doc.text('#', margin + 8, y + 6, { width: 30 });
      doc.text('Postavka', margin + 40, y + 6, { width: tableWidth * 0.5 });
      doc.text('Količina', margin + tableWidth * 0.55, y + 6, { width: tableWidth * 0.2, align: 'center' });
      doc.text('Težavnost', margin + tableWidth * 0.78, y + 6, { width: tableWidth * 0.15 });
    } else {
      doc.text('Postavka / Opis', margin + 8, y + 6, { width: tableWidth * 0.42 });
      doc.text('Kol.', margin + tableWidth * 0.45, y + 6, { width: tableWidth * 0.1, align: 'center' });
      doc.text('Enota', margin + tableWidth * 0.56, y + 6, { width: tableWidth * 0.1, align: 'center' });
      doc.text('Cena', margin + tableWidth * 0.68, y + 6, { width: tableWidth * 0.14, align: 'right' });
      doc.text('Znesek', margin + tableWidth * 0.83, y + 6, { width: tableWidth * 0.14, align: 'right' });
    }
    
    // Items
    y += 24;
    doc.font('DejaVu').fontSize(9);
    
    items.forEach((item, idx) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
      
      if (idx % 2 === 0) {
        doc.rect(margin, y - 2, tableWidth, 18).fill('#fafafa');
      }
      
      if (isInternal) {
        doc.fillColor('#64748b');
        doc.text((idx + 1).toString(), margin + 8, y + 2, { width: 30 });
        doc.fillColor('#0f172a').font('DejaVu-Bold');
        doc.text(item.work_item_name, margin + 40, y + 2, { width: tableWidth * 0.5 });
        doc.font('DejaVu').fillColor('#475569');
        doc.text(`${item.quantity} ${item.work_item_unit}`, margin + tableWidth * 0.55, y + 2, { width: tableWidth * 0.2, align: 'center' });
        const diffText = item.difficulty === 'easy' ? 'Lahko' : item.difficulty === 'hard' ? 'Težko' : 'Srednje';
        doc.text(diffText, margin + tableWidth * 0.78, y + 2, { width: tableWidth * 0.15 });
      } else {
        doc.fillColor('#0f172a').font('DejaVu-Bold');
        doc.text(item.work_item_name, margin + 8, y + 2, { width: tableWidth * 0.42 });
        doc.font('DejaVu').fillColor('#475569');
        doc.text(item.quantity.toString(), margin + tableWidth * 0.45, y + 2, { width: tableWidth * 0.1, align: 'center' });
        doc.text(item.work_item_unit, margin + tableWidth * 0.56, y + 2, { width: tableWidth * 0.1, align: 'center' });
        doc.text(`${item.price_per_unit.toFixed(2).replace('.', ',')} €`, margin + tableWidth * 0.68, y + 2, { width: tableWidth * 0.14, align: 'right' });
        doc.text(`${item.subtotal.toFixed(2).replace('.', ',')} €`, margin + tableWidth * 0.83, y + 2, { width: tableWidth * 0.14, align: 'right' });
      }
      
      y += 18;
    });
    
    // Calculate totals from items (not from database which includes material)
    const itemsTotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const taxRate = quote.tax_rate || 22;
    const taxAmount = itemsTotal * (taxRate / 100);
    const totalWithTax = itemsTotal + taxAmount;
    
    // Totals (only for client)
    if (!isInternal) {
      y += 15;
      const totalsX = pageWidth - margin - 240;
      
      doc.font('DejaVu').fontSize(9).fillColor('#475569');
      doc.text('Skupaj brez DDV:', totalsX, y);
      doc.text(`${itemsTotal.toFixed(2).replace('.', ',')} €`, totalsX + 140, y, { width: 100, align: 'right' });
      
      y += 16;
      doc.text(`DDV (${taxRate}%):`, totalsX, y);
      doc.text(`${taxAmount.toFixed(2).replace('.', ',')} €`, totalsX + 140, y, { width: 100, align: 'right' });
      
      y += 20;
      doc.rect(totalsX - 10, y, 250, 30).fill(primaryColor);
      doc.font('DejaVu-Bold').fontSize(12).fillColor('white');
      doc.text('SKUPAJ Z DDV:', totalsX, y + 9);
      doc.text(`${totalWithTax.toFixed(2).replace('.', ',')} €`, totalsX + 140, y + 9, { width: 100, align: 'right' });
      
      // Signatures
      y += 60;
      if (y < 700) {
        doc.strokeColor('#94a3b8').lineWidth(0.5);
        doc.moveTo(margin, y).lineTo(margin + 200, y).stroke();
        doc.moveTo(pageWidth - margin - 200, y).lineTo(pageWidth - margin, y).stroke();
        doc.font('DejaVu').fontSize(9).fillColor('#64748b');
        doc.text('Podpis izvajalca', margin, y + 8);
        doc.text('Podpis stranke', pageWidth - margin - 200, y + 8);
      }
    }
    
    // Footer
    doc.font('DejaVu').fontSize(8).fillColor('#94a3b8');
    doc.text(`${company?.name || 'Moj Predračun'} ${company?.phone ? '| ' + company.phone : ''} ${company?.email ? '| ' + company.email : ''}`, margin, 760, { align: 'center', width: tableWidth });
    
    if (!isInternal) {
      doc.fillColor(primaryColor).font('DejaVu-Bold').fontSize(10);
      doc.text('Hvala za zaupanje!', margin, 775, { align: 'center', width: tableWidth });
    }
    
    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Gradbeni app teče na:`);
  console.log(`   http://localhost:${PORT} (lokalno)`);
  console.log(`   http://0.0.0.0:${PORT} (omrežje)`);
  console.log(`📁 Podatkovna baza: ${path.join(dataDir, 'quotes.db')}`);
});

module.exports = app;