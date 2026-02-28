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

// Database connection (render uses /data, local uses ./data)
const dataDir = process.env.RENDER ? '/data' : './data';
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
    const items = db.prepare('SELECT * FROM work_items ORDER BY category, name').all();
    res.json(items);
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
    const materials = db.prepare('SELECT * FROM materials ORDER BY category, name').all();
    res.json(materials);
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
    const { client_id, project_name, project_address, valid_until, items } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    let material_total = 0;
    let labor_total = 0;
    
    items.forEach(item => {
      const laborCost = item.quantity * item.price_per_unit;
      const materialCost = item.materials?.reduce((sum, m) => sum + (m.quantity * m.unit_price), 0) || 0;
      labor_total += laborCost;
      material_total += materialCost;
      subtotal += laborCost + materialCost;
    });
    
    const tax_rate = 22; // DDV
    const tax_amount = subtotal * (tax_rate / 100);
    const total = subtotal + tax_amount;
    
    // Insert quote
    const quoteStmt = db.prepare(`
      INSERT INTO quotes (client_id, project_name, project_address, valid_until, subtotal, tax_rate, tax_amount, total, labor_total, material_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const quoteResult = quoteStmt.run(client_id, project_name, project_address, valid_until, subtotal, tax_rate, tax_amount, total, labor_total, material_total);
    const quote_id = quoteResult.lastInsertRowid;
    
    // Insert items
    const itemStmt = db.prepare(`
      INSERT INTO quote_items (quote_id, work_item_id, quantity, price_per_unit, difficulty, notes, subtotal)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    items.forEach(item => {
      const itemSubtotal = item.quantity * item.price_per_unit;
      itemStmt.run(quote_id, item.work_item_id, item.quantity, item.price_per_unit, item.difficulty, item.notes, itemSubtotal);
    });
    
    res.json({ id: quote_id, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PDF GENERATION ====================

app.get('/api/quotes/:id/pdf/:type', (req, res) => {
  try {
    const { id, type } = req.params;
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    const company = db.prepare('SELECT * FROM company_settings LIMIT 1').get();
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(quote.client_id);
    const items = db.prepare(`
      SELECT qi.*, wi.name as work_item_name, wi.unit as work_item_unit
      FROM quote_items qi
      JOIN work_items wi ON qi.work_item_id = wi.id
      WHERE qi.quote_id = ?
    `).all(id);
    
    const doc = new PDFDocument({ margin: 50 });
    const filename = type === 'internal' ? `izracun-${id}.pdf` : `predracun-${id}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
    
    // Header
    if (company?.logo_path && fs.existsSync(company.logo_path)) {
      doc.image(company.logo_path, 50, 50, { width: 100 });
    }
    
    doc.fontSize(20).text(company?.name || 'Gradbeno podjetje', 150, 50);
    doc.fontSize(10).text(company?.address || '', 150, 75);
    doc.text(`Tel: ${company?.phone || ''} | Email: ${company?.email || ''}`, 150, 90);
    doc.text(`Davčna: ${company?.tax_id || ''}`, 150, 105);
    
    doc.moveDown(3);
    
    // Title
    doc.fontSize(16).text(type === 'internal' ? 'NOTRANJI IZRAČUN' : 'PREDRAČUN', { align: 'center' });
    doc.moveDown();
    
    // Quote info
    doc.fontSize(10);
    doc.text(`Številka: ${quote.id}`, 50);
    doc.text(`Datum: ${new Date(quote.created_at).toLocaleDateString('sl-SI')}`, 50);
    doc.text(`Veljavnost: ${new Date(quote.valid_until).toLocaleDateString('sl-SI')}`, 50);
    doc.moveDown();
    
    // Client info
    doc.fontSize(12).text('Stranka:', 50);
    doc.fontSize(10);
    doc.text(client?.name || '', 50);
    doc.text(client?.address || '', 50);
    doc.moveDown();
    
    // Project info
    doc.fontSize(12).text(`Projekt: ${quote.project_name || ''}`, 50);
    doc.text(`Lokacija: ${quote.project_address || ''}`, 50);
    doc.moveDown(2);
    
    // Table header
    const tableTop = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Postavka', 50, tableTop, { width: 200 });
    doc.text('Kol.', 260, tableTop, { width: 40, align: 'right' });
    doc.text('Enota', 310, tableTop, { width: 50, align: 'center' });
    doc.text('Cena', 370, tableTop, { width: 70, align: 'right' });
    doc.text('Znesek', 450, tableTop, { width: 70, align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();
    doc.font('Helvetica');
    
    // Items
    let y = tableTop + 25;
    items.forEach((item, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      
      doc.fontSize(9);
      doc.text(item.work_item_name, 50, y, { width: 200 });
      doc.text(item.quantity.toString(), 260, y, { width: 40, align: 'right' });
      doc.text(item.work_item_unit, 310, y, { width: 50, align: 'center' });
      doc.text(item.price_per_unit.toFixed(2), 370, y, { width: 70, align: 'right' });
      doc.text(item.subtotal.toFixed(2), 450, y, { width: 70, align: 'right' });
      
      if (item.notes) {
        y += 12;
        doc.fontSize(8).fillColor('gray').text(`Opomba: ${item.notes}`, 60, y, { width: 400 });
        doc.fillColor('black');
      }
      
      y += 20;
    });
    
    // Totals
    doc.moveTo(50, y).lineTo(520, y).stroke();
    y += 15;
    
    if (type === 'internal') {
      // Internal breakdown
      doc.fontSize(10).text('Material:', 350, y);
      doc.text(quote.material_total.toFixed(2), 450, y, { width: 70, align: 'right' });
      y += 15;
      doc.text('Delo:', 350, y);
      doc.text(quote.labor_total.toFixed(2), 450, y, { width: 70, align: 'right' });
      y += 15;
      doc.text('Skupaj brez DDV:', 350, y);
      doc.text(quote.subtotal.toFixed(2), 450, y, { width: 70, align: 'right' });
      y += 15;
      doc.text(`DDV (${quote.tax_rate}%):`, 350, y);
      doc.text(quote.tax_amount.toFixed(2), 450, y, { width: 70, align: 'right' });
      y += 20;
      doc.font('Helvetica-Bold').text('SKUPAJ:', 350, y);
      doc.text(quote.total.toFixed(2), 450, y, { width: 70, align: 'right' });
    } else {
      // Client quote
      doc.fontSize(10).text('Skupaj brez DDV:', 350, y);
      doc.text(quote.subtotal.toFixed(2), 450, y, { width: 70, align: 'right' });
      y += 15;
      doc.text(`DDV (${quote.tax_rate}%):`, 350, y);
      doc.text(quote.tax_amount.toFixed(2), 450, y, { width: 70, align: 'right' });
      y += 20;
      doc.font('Helvetica-Bold').fontSize(12).text('SKUPAJ Z DDV:', 350, y);
      doc.text(quote.total.toFixed(2), 450, y, { width: 70, align: 'right' });
    }
    
    // WORK SUMMARY FOR EMPLOYER (internal document - page 2)
    if (type === 'internal') {
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('POROČILO ZA DELODAJALCA', 50, 50, { align: 'center' });
      doc.moveDown(2);
      
      doc.fontSize(11).font('Helvetica');
      doc.text(`Projekt: ${quote.project_name || 'Brez naziva'}`, 50);
      doc.text(`Lokacija: ${quote.project_address || 'Ni navedena'}`, 50);
      doc.text(`Datum: ${new Date(quote.created_at).toLocaleDateString('sl-SI')}`, 50);
      doc.moveDown(2);
      
      // Work breakdown
      doc.fontSize(14).font('Helvetica-Bold').text('PREGLED DELA', 50);
      doc.moveDown();
      
      doc.fontSize(10).font('Helvetica');
      items.forEach((item, idx) => {
        doc.text(`${idx + 1}. ${item.work_item_name}`, 50);
        doc.text(`   Količina: ${item.quantity} ${item.work_item_unit}`, 70);
        doc.text(`   Težavnost: ${item.difficulty === 'easy' ? 'Lahko' : item.difficulty === 'hard' ? 'Težko' : 'Srednje'}`, 70);
        doc.moveDown(0.5);
      });
      
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text(`Skupna površina/količina dela: ${items.reduce((sum, i) => sum + i.quantity, 0).toFixed(2)} enot`, 50);
      doc.moveDown(2);
      
      // Materials needed
      doc.fontSize(14).font('Helvetica-Bold').text('POTREBEN MATERIAL', 50);
      doc.moveDown();
      
      // Calculate total area
      let totalArea = 0;
      items.forEach(item => {
        if (item.work_item_unit === 'm²' || item.work_item_unit === 'm2') {
          totalArea += item.quantity;
        }
      });
      
      if (totalArea > 0) {
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Material                          Količina      Enota', 50);
        doc.moveDown(0.5);
        doc.font('Helvetica');
        
        // Lepilo za ploščice
        const lepiloKg = totalArea * 5;
        doc.text(`Lepilo za ploščice               ${Math.ceil(lepiloKg).toString().padStart(8)} kg`, 50);
        
        // Fugirna masa  
        const fugaKg = totalArea * 0.5;
        doc.text(`Fugirna masa                     ${Math.ceil(fugaKg).toString().padStart(8)} kg`, 50);
        
        // Knauf plošče
        const knaufPlose = Math.ceil(totalArea / 3);
        doc.text(`Knauf plošče (1.2x2.5m)          ${knaufPlose.toString().padStart(8)} kom`, 50);
        
        // Profili
        const profili = Math.ceil(totalArea / 3) * 2;
        doc.text(`Profili za knauf                 ${profili.toString().padStart(8)} kom`, 50);
        
        // Ploščice
        const ploscice60 = Math.ceil(totalArea * 2.78 * 1.1);
        doc.text(`Ploščice 60x60 cm (+10% rezerva) ${ploscice60.toString().padStart(8)} kom`, 50);
        
        const ploscice30 = Math.ceil(totalArea * 5.56 * 1.1);
        doc.text(`Ploščice 30x60 cm (+10% rezerva) ${ploscice30.toString().padStart(8)} kom`, 50);
        
        // Silikon
        const silikon = Math.ceil(totalArea / 10);
        doc.text(`Silikon sanitarni                ${silikon.toString().padStart(8)} tuba`, 50);
        
        doc.moveDown();
        doc.fontSize(9).fillColor('gray');
        doc.text('OPOMBA: Količine so približne. Priporočamo dodatno rezervo 10%.', 50);
        doc.fillColor('black');
      }
      
      doc.moveDown(2);
      
      // Time estimate section (empty for manual fill)
      doc.fontSize(14).font('Helvetica-Bold').text('ČASOVNA OCENA', 50);
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text('Predvideni dnevi dela: _______________', 50);
      doc.moveDown();
      doc.text('Število delavcev: _______________', 50);
      doc.moveDown();
      doc.text('Skupaj ur: _______________', 50);
    }
    
    // Footer
    doc.fontSize(8).font('Helvetica');
    doc.text(type === 'client' ? 'Hvala za zaupanje!' : 'Interni dokument - za službeno uporabo', 50, 750, { align: 'center' });
    
    doc.end();
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