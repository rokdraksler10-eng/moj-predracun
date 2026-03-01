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
    
    // Professional Header with blue accent
    doc.rect(0, 0, 612, 120).fill('#2563eb');
    doc.fillColor('white');
    
    // Company name in header
    doc.fontSize(24).font('Helvetica-Bold').text(company?.name || 'Gradbeno podjetje', 50, 30);
    doc.fontSize(10).font('Helvetica');
    doc.text(company?.address || '', 50, 60);
    doc.text(`Tel: ${company?.phone || ''} | Email: ${company?.email || ''}`, 50, 75);
    doc.text(`Davčna št.: ${company?.tax_id || ''}`, 50, 90);
    
    // Document type badge
    doc.roundedRect(420, 30, 140, 35, 5, 5).fill('white');
    doc.fillColor('#2563eb').fontSize(14).font('Helvetica-Bold');
    doc.text(type === 'internal' ? 'NOTRANJI IZRAČUN' : 'PREDRAČUN', 430, 40, { width: 120, align: 'center' });
    
    doc.fillColor('black');
    doc.moveDown(5);
    
    // Document info section
    doc.fontSize(10).font('Helvetica');
    const infoTop = 140;
    doc.text(`Številka dokumenta: ${quote.id}`, 50, infoTop);
    doc.text(`Datum izdaje: ${new Date(quote.created_at).toLocaleDateString('sl-SI')}`, 50, infoTop + 15);
    doc.text(`Veljavnost: ${new Date(quote.valid_until).toLocaleDateString('sl-SI')}`, 50, infoTop + 30);
    
    // Client info box
    doc.roundedRect(300, infoTop - 10, 260, 80, 5, 5).stroke('#e2e8f0');
    doc.fontSize(11).font('Helvetica-Bold').text('STRANKA:', 310, infoTop);
    doc.fontSize(10).font('Helvetica');
    doc.text(client?.name || quote.client_name || 'Brez naziva', 310, infoTop + 18);
    doc.text(client?.address || quote.project_address || '', 310, infoTop + 33);
    
    // Project name
    doc.fontSize(12).font('Helvetica-Bold').text(`Projekt: ${quote.project_name || 'Brez naziva'}`, 50, infoTop + 60);
    
    doc.moveDown(4);
    
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
    
    // Professional Table Header
    const tableTop = doc.y;
    const rowHeight = 22;
    
    // Header background
    doc.rect(50, tableTop - 5, 470, rowHeight).fill('#f1f5f9');
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
    doc.text('Postavka', 55, tableTop + 3, { width: 190 });
    doc.text('Kol.', 255, tableTop + 3, { width: 40, align: 'right' });
    doc.text('Enota', 305, tableTop + 3, { width: 50, align: 'center' });
    doc.text('Cena', 370, tableTop + 3, { width: 70, align: 'right' });
    doc.text('Znesek', 445, tableTop + 3, { width: 70, align: 'right' });
    
    doc.strokeColor('#cbd5e1').lineWidth(0.5);
    doc.moveTo(50, tableTop + rowHeight).lineTo(520, tableTop + rowHeight).stroke();
    doc.font('Helvetica').fillColor('black');
    
    // Items with alternating row colors
    let y = tableTop + rowHeight + 5;
    items.forEach((item, index) => {
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
      
      // Alternating background
      if (index % 2 === 0) {
        doc.rect(50, y - 2, 470, 18).fill('#fafafa');
      }
      
      doc.fillColor('black').fontSize(9).font('Helvetica');
      doc.text(item.work_item_name, 55, y, { width: 190 });
      doc.text(item.quantity.toString(), 255, y, { width: 40, align: 'right' });
      doc.text(item.work_item_unit, 305, y, { width: 50, align: 'center' });
      doc.text(item.price_per_unit.toFixed(2), 370, y, { width: 70, align: 'right' });
      doc.text(item.subtotal.toFixed(2), 445, y, { width: 70, align: 'right' });
      
      if (item.notes) {
        y += 12;
        doc.fontSize(8).fillColor('#64748b').text(`Opomba: ${item.notes}`, 60, y, { width: 400 });
        doc.fillColor('black');
        y += 10;
      } else {
        y += 18;
      }
    });
    
    // Professional Totals Box
    const totalsY = y + 10;
    doc.roundedRect(300, totalsY, 220, type === 'internal' ? 120 : 80, 5, 5).stroke('#e2e8f0');
    
    if (type === 'internal') {
      // Internal breakdown
      doc.fontSize(9).font('Helvetica').text('Material:', 310, totalsY + 10);
      doc.text(quote.material_total.toFixed(2) + ' €', 430, totalsY + 10, { width: 80, align: 'right' });
      
      doc.text('Delo:', 310, totalsY + 28);
      doc.text(quote.labor_total.toFixed(2) + ' €', 430, totalsY + 28, { width: 80, align: 'right' });
      
      doc.text('Skupaj brez DDV:', 310, totalsY + 46);
      doc.text(quote.subtotal.toFixed(2) + ' €', 430, totalsY + 46, { width: 80, align: 'right' });
      
      doc.text(`DDV (${quote.tax_rate}%):`, 310, totalsY + 64);
      doc.text(quote.tax_amount.toFixed(2) + ' €', 430, totalsY + 64, { width: 80, align: 'right' });
      
      // Total highlight
      doc.rect(300, totalsY + 82, 220, 35).fill('#2563eb');
      doc.fillColor('white').fontSize(11).font('Helvetica-Bold').text('SKUPAJ:', 310, totalsY + 92);
      doc.text(quote.total.toFixed(2) + ' €', 430, totalsY + 92, { width: 80, align: 'right' });
    } else {
      // Client quote - cleaner look
      doc.fontSize(9).font('Helvetica').text('Skupaj brez DDV:', 310, totalsY + 10);
      doc.text(quote.subtotal.toFixed(2) + ' €', 430, totalsY + 10, { width: 80, align: 'right' });
      
      doc.text(`DDV (${quote.tax_rate}%):`, 310, totalsY + 28);
      doc.text(quote.tax_amount.toFixed(2) + ' €', 430, totalsY + 28, { width: 80, align: 'right' });
      
      // Total highlight
      doc.rect(300, totalsY + 46, 220, 30).fill('#2563eb');
      doc.fillColor('white').fontSize(12).font('Helvetica-Bold').text('SKUPAJ Z DDV:', 310, totalsY + 55);
      doc.text(quote.total.toFixed(2) + ' €', 430, totalsY + 55, { width: 80, align: 'right' });
    }
    
    doc.fillColor('black');
    
    // WORK SUMMARY FOR EMPLOYER (internal document - page 2)
    if (type === 'internal') {
      doc.addPage();
      
      // Header for page 2
      doc.rect(0, 0, 612, 80).fill('#059669');
      doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('POROČILO ZA MOJSTRO', 50, 30);
      doc.fontSize(10).font('Helvetica').text('Notranji dokument - navodila za delo', 50, 55);
      
      doc.fillColor('black');
      let p2y = 100;
      
      // Project info box
      doc.roundedRect(50, p2y, 512, 70, 5, 5).stroke('#e2e8f0');
      doc.fontSize(11).font('Helvetica-Bold').text('PODATKI O PROJEKTU', 60, p2y + 10);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Projekt: ${quote.project_name || 'Brez naziva'}`, 60, p2y + 30);
      doc.text(`Lokacija: ${quote.project_address || 'Ni navedena'}`, 60, p2y + 45);
      doc.text(`Datum: ${new Date(quote.created_at).toLocaleDateString('sl-SI')}`, 60, p2y + 60);
      
      p2y += 90;
      
      // Work breakdown
      doc.fontSize(14).font('Helvetica-Bold').text('SEZNAM DEL', 50, p2y);
      p2y += 25;
      
      // Table header
      doc.rect(50, p2y, 512, 22).fill('#f1f5f9');
      doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
      doc.text('#', 55, p2y + 6, { width: 20 });
      doc.text('Delo / Postavka', 80, p2y + 6, { width: 250 });
      doc.text('Količina', 340, p2y + 6, { width: 70, align: 'right' });
      doc.text('Težavnost', 420, p2y + 6, { width: 80 });
      
      doc.fillColor('black').font('Helvetica');
      p2y += 28;
      
      items.forEach((item, idx) => {
        if (p2y > 700) {
          doc.addPage();
          p2y = 50;
        }
        
        if (idx % 2 === 0) {
          doc.rect(50, p2y - 2, 512, 18).fill('#fafafa');
        }
        
        doc.fillColor('black').fontSize(9);
        doc.text((idx + 1).toString(), 55, p2y + 2);
        doc.text(item.work_item_name, 80, p2y + 2, { width: 250 });
        doc.text(`${item.quantity} ${item.work_item_unit}`, 340, p2y + 2, { width: 70, align: 'right' });
        
        const diffText = item.difficulty === 'easy' ? 'Lahko ⭐' : item.difficulty === 'hard' ? 'Težko ⭐⭐⭐' : 'Srednje ⭐⭐';
        doc.text(diffText, 420, p2y + 2);
        
        p2y += 20;
      });
      
      p2y += 15;
      
      // Total area summary
      const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
      doc.roundedRect(50, p2y, 512, 30, 5, 5).fill('#dbeafe');
      doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold');
      doc.text(`SKUPNA KOLIČINA DELA: ${totalQty.toFixed(2)} enot`, 60, p2y + 9);
      doc.fillColor('black');
      
      p2y += 50;
      
      // Materials needed section
      let totalArea = 0;
      items.forEach(item => {
        if (item.work_item_unit === 'm²' || item.work_item_unit === 'm2') {
          totalArea += item.quantity;
        }
      });
      
      if (totalArea > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('POTREBEN MATERIAL', 50, p2y);
        p2y += 25;
        
        doc.rect(50, p2y, 512, 22).fill('#f1f5f9');
        doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold');
        doc.text('Material', 55, p2y + 6, { width: 300 });
        doc.text('Količina', 360, p2y + 6, { width: 80, align: 'right' });
        doc.text('Enota', 450, p2y + 6, { width: 50 });
        
        doc.fillColor('black').font('Helvetica');
        p2y += 28;
        
        const materials = [
          { name: 'Lepilo za ploščice', calc: totalArea * 5, unit: 'kg', note: '5 kg/m²' },
          { name: 'Fugirna masa', calc: totalArea * 0.5, unit: 'kg', note: '0.5 kg/m²' },
          { name: 'Knauf plošče (1.2x2.5m)', calc: Math.ceil(totalArea / 3), unit: 'kom', note: '3 m²/plošca' },
          { name: 'Profili za knauf (CD+UD)', calc: Math.ceil(totalArea / 3) * 2, unit: 'kom', note: '' },
          { name: 'Ploščice 60x60 cm (+10% rezerva)', calc: Math.ceil(totalArea * 2.78 * 1.1), unit: 'kom', note: '2.78/m²' },
          { name: 'Ploščice 30x60 cm (+10% rezerva)', calc: Math.ceil(totalArea * 5.56 * 1.1), unit: 'kom', note: '5.56/m²' },
          { name: 'Silikon (sanitarni)', calc: Math.ceil(totalArea / 10), unit: 'tuba', note: '1/10 m²' }
        ];
        
        materials.forEach((mat, idx) => {
          if (p2y > 700) {
            doc.addPage();
            p2y = 50;
          }
          
          if (idx % 2 === 0) {
            doc.rect(50, p2y - 2, 512, 18).fill('#fafafa');
          }
          
          doc.fontSize(9);
          doc.text(mat.name, 55, p2y + 2, { width: 300 });
          doc.text(Math.ceil(mat.calc).toString(), 360, p2y + 2, { width: 80, align: 'right' });
          doc.text(mat.unit, 450, p2y + 2);
          
          p2y += 18;
        });
        
        p2y += 15;
        doc.roundedRect(50, p2y, 512, 35, 5, 5).stroke('#f59e0b').fill('#fffbeb');
        doc.fillColor('#92400e').fontSize(9).font('Helvetica');
        doc.text('⚠️  OPOMBA: Količine so približne in izračunane na podlagi površine. Priporočamo dodatno rezervo 10%.', 60, p2y + 8, { width: 490 });
        doc.text('Dejanska poraba materiala se lahko razlikuje glede na specifične pogoje na terenu.', 60, p2y + 22, { width: 490 });
        doc.fillColor('black');
        
        p2y += 55;
      }
      
      // Time estimate section
      if (p2y > 650) {
        doc.addPage();
        p2y = 50;
      }
      
      doc.fontSize(14).font('Helvetica-Bold').text('ČASOVNA OCENA', 50, p2y);
      p2y += 20;
      
      doc.roundedRect(50, p2y, 512, 100, 5, 5).stroke('#e2e8f0');
      doc.fontSize(10).font('Helvetica');
      doc.text('Predvideni dnevi dela: _______________________________', 60, p2y + 15);
      doc.text('Število delavcev: _______________________________', 60, p2y + 40);
      doc.text('Skupaj ur: _______________________________', 60, p2y + 65);
      doc.text('Dejanski zaključek: _______________________________', 60, p2y + 90);
      
      // Footer
      doc.fontSize(8).fillColor('#94a3b8').text('Moj Predračun - Notranji dokument za službeno uporabo', 50, 750);
    }
    
    // Notes section for client
    if (type === 'client') {
      let notesY = doc.y + 20;
      if (notesY < 650) {
        doc.fontSize(9).fillColor('#64748b').font('Helvetica');
        doc.text('_______________________________________________________________', 50, notesY);
        doc.text('Opombe in posebne zahteve:', 50, notesY + 10);
        doc.text(quote.notes || '', 50, notesY + 25, { width: 470 });
        
        // Signature area
        notesY += 70;
        doc.text('_________________________________                    _________________________________', 50, notesY);
        doc.text('Podpis izvajalca', 50, notesY + 15);
        doc.text('Podpis stranke', 350, notesY + 15);
      }
    }
    
    // Footer
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica');
    if (type === 'client') {
      doc.text(`Moj Predračun | ${company?.name || ''} | ${company?.phone || ''} | ${company?.email || ''}`, 50, 760, { align: 'center', width: 512 });
      doc.fillColor('#2563eb').fontSize(9).font('Helvetica-Bold').text('Hvala za zaupanje!', 50, 775, { align: 'center', width: 512 });
    } else {
      doc.text('Moj Predračun - Interni dokument za službeno uporabo', 50, 775, { align: 'center', width: 512 });
    }
    
    doc.end();
  } catch (error) {
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