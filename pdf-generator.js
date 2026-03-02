const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Generate PDF using Puppeteer (supports UTF-8/Slovenian characters)
async function generateQuotePDF(quote, company, client, items, type, logoPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Format date
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('sl-SI');
    };
    
    // Format number
    const formatNum = (num) => {
      return (num || 0).toFixed(2).replace('.', ',');
    };
    
    // Colors based on type
    const isInternal = type === 'internal';
    const primaryColor = isInternal ? '#059669' : '#2563eb';
    const docTitle = isInternal ? 'NAVODILA ZA DELO' : 'PREDRAČUN';
    
    // Build items HTML
    const itemsHTML = items.map((item, idx) => {
      const diffText = item.difficulty === 'easy' ? 'Lahko' : 
                      item.difficulty === 'hard' ? 'Težko' : 'Srednje';
      
      if (isInternal) {
        // Internal - no prices
        return `
          <tr style="background: ${idx % 2 === 0 ? '#fafafa' : 'white'};">
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${idx + 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${item.work_item_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity} ${item.work_item_unit}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${diffText}</td>
          </tr>
        `;
      } else {
        // Client - with prices
        return `
          <tr style="background: ${idx % 2 === 0 ? '#fafafa' : 'white'};">
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${item.work_item_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.work_item_unit}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatNum(item.price_per_unit)} €</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 500;">${formatNum(item.subtotal)} €</td>
          </tr>
        `;
      }
    }).join('');
    
    // Logo HTML
    let logoHTML = '';
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        const ext = path.extname(logoPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 
                        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                        ext === '.gif' ? 'image/gif' : 'image/png';
        logoHTML = `<img src="data:${mimeType};base64,${logoBase64}" style="max-height: 60px; max-width: 150px;" />`;
      } catch (e) {
        console.error('Logo error:', e);
      }
    }
    
    // Build totals HTML (only for client)
    let totalsHTML = '';
    if (!isInternal) {
      totalsHTML = `
        <div style="margin-top: 30px; text-align: right;">
          <div style="display: inline-block; min-width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #475569;">Skupaj brez DDV:</span>
              <span style="font-weight: 500;">${formatNum(quote.subtotal)} €</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="color: #475569;">DDV (${quote.tax_rate || 22}%):</span>
              <span style="font-weight: 500;">${formatNum(quote.tax_amount)} €</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 8px; background: ${primaryColor}; color: white; border-radius: 8px; padding: 12px 16px;">
              <span style="font-weight: 600;">SKUPAJ Z DDV:</span>
              <span style="font-weight: 700; font-size: 16px;">${formatNum(quote.total)} €</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // Build materials HTML (only for internal)
    let materialsHTML = '';
    if (isInternal) {
      let totalArea = 0;
      items.forEach(item => {
        if (item.work_item_unit === 'm²' || item.work_item_unit === 'm2') {
          totalArea += item.quantity;
        }
      });
      
      if (totalArea > 0) {
        const materials = [
          { name: 'Lepilo za ploščice', qty: Math.ceil(totalArea * 5), unit: 'kg' },
          { name: 'Fugirna masa', qty: Math.ceil(totalArea * 0.5), unit: 'kg' },
          { name: 'Knauf plošče (1.2×2.5m)', qty: Math.ceil(totalArea / 3), unit: 'kom' },
          { name: 'Profili za knauf', qty: Math.ceil(totalArea / 3) * 2, unit: 'kom' },
          { name: 'Ploščice 60×60 cm (+10%)', qty: Math.ceil(totalArea * 2.78 * 1.1), unit: 'kom' },
          { name: 'Silikon sanitarni', qty: Math.ceil(totalArea / 10), unit: 'tuba' }
        ];
        
        materialsHTML = `
          <div style="margin-top: 30px;">
            <h3 style="color: #475569; font-size: 14px; margin-bottom: 15px;">POTREBEN MATERIAL (približno)</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 10px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Material</th>
                  <th style="padding: 10px; text-align: center; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0;">Količina</th>
                </tr>
              </thead>
              <tbody>
                ${materials.map((mat, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#fafafa' : 'white'};">
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mat.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 500;">${mat.qty} ${mat.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="color: #92400e; font-size: 11px; margin-top: 15px; padding: 10px; background: #fffbeb; border-radius: 6px;">
              Opomba: Količine so približne. Priporočamo dodatno rezervo 10%.
            </p>
          </div>
        `;
      }
    }
    
    // Signature section (only for client)
    let signatureHTML = '';
    if (!isInternal) {
      signatureHTML = `
        <div style="margin-top: 40px;">
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #94a3b8; padding-top: 8px; color: #64748b; font-size: 12px;">Podpis izvajalca</div>
            </div>
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #94a3b8; padding-top: 8px; color: #64748b; font-size: 12px;">Podpis stranke</div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Complete HTML
    const html = `
<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} #${quote.id}</title>
  <style>
    @page { margin: 40px; }
    body { 
      font-family: 'DejaVu Sans', 'Arial', sans-serif; 
      font-size: 12px; 
      line-height: 1.4; 
      color: #1e293b;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
    .company-info { flex: 1; }
    .doc-type { 
      border: 2px solid ${primaryColor}; 
      padding: 15px 25px; 
      text-align: center; 
      border-radius: 8px;
    }
    .doc-type-title { color: ${primaryColor}; font-weight: 700; font-size: 11px; letter-spacing: 1px; }
    .doc-type-number { color: ${primaryColor}; font-weight: 700; font-size: 24px; margin-top: 5px; }
    .info-row { display: flex; gap: 40px; margin: 20px 0; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
    .info-col { flex: 1; }
    .info-label { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { color: #1e293b; font-weight: 600; }
    .client-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .client-label { color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 5px; }
    .client-name { font-size: 14px; font-weight: 700; color: #1e293b; }
    .client-address { color: #64748b; font-size: 11px; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="company-info">
      ${logoHTML}
      <div style="font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 10px;">${company?.name || 'Moje Gradbeno Podjetje'}</div>
      <div style="color: #64748b; margin-top: 5px; font-size: 11px;">${company?.address || ''}</div>
      <div style="color: #64748b; font-size: 11px;">Tel: ${company?.phone || '-'} | Email: ${company?.email || '-'}</div>
      ${company?.tax_id ? `<div style="color: #64748b; font-size: 11px;">Davčna št.: ${company.tax_id}</div>` : ''}
    </div>
    <div class="doc-type">
      <div class="doc-type-title">${docTitle}</div>
      <div class="doc-type-number">#${quote.id}</div>
    </div>
  </div>
  
  <!-- Info Row -->
  <div class="info-row">
    <div class="info-col">
      <div class="info-label">Datum izdaje</div>
      <div class="info-value">${formatDate(quote.created_at)}</div>
    </div>
    <div class="info-col">
      <div class="info-label">Veljavnost</div>
      <div class="info-value">${formatDate(quote.valid_until)}</div>
    </div>
    <div class="info-col">
      <div class="info-label">Projekt</div>
      <div class="info-value">${quote.project_name || 'Brez naziva'}</div>
    </div>
  </div>
  
  <!-- Client -->
  <div class="client-box">
    <div class="client-label">Stranka</div>
    <div class="client-name">${client?.name || quote.client_name || 'Brez naziva'}</div>
    <div class="client-address">${client?.address || quote.project_address || ''}</div>
  </div>
  
  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        ${isInternal ? `
          <th style="width: 40px;">#</th>
          <th>Postavka</th>
          <th style="text-align: center;">Količina</th>
          <th style="text-align: center;">Težavnost</th>
        ` : `
          <th>Postavka / Opis</th>
          <th style="text-align: center; width: 80px;">Kol.</th>
          <th style="text-align: center; width: 80px;">Enota</th>
          <th style="text-align: right; width: 100px;">Cena</th>
          <th style="text-align: right; width: 100px;">Znesek</th>
        `}
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>
  
  ${totalsHTML}
  ${materialsHTML}
  ${signatureHTML}
  
  <!-- Footer -->
  <div class="footer">
    ${company?.name || 'Moj Predračun'} ${company?.phone ? '| ' + company.phone : ''} ${company?.email ? '| ' + company.email : ''}
    ${!isInternal ? '<br><strong style="color: ' + primaryColor + ';">Hvala za zaupanje!</strong>' : ''}
  </div>
</body>
</html>`;
    
    // Set content and generate PDF
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    return pdfBuffer;
    
  } finally {
    await browser.close();
  }
}

module.exports = { generateQuotePDF };