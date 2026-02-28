#!/bin/bash
# Deploy script for Render.com

echo "🏗️  Pripravljam Moj Predračun za deploy..."

# Preveri strukturo
echo "📁 Preverjam datoteke..."
[ -f "server.js" ] || { echo "❌ Napaka: server.js ne obstaja"; exit 1; }
[ -f "package.json" ] || { echo "❌ Napaka: package.json ne obstaja"; exit 1; }
[ -f "render.yaml" ] || { echo "❌ Napaka: render.yaml ne obstaja"; exit 1; }
[ -d "public" ] || { echo "❌ Napaka: public/ ne obstaja"; exit 1; }

echo "✅ Vse datoteke so na mestu"

# Preveri odvisnosti
echo "📦 Preverjam odvisnosti..."
npm list better-sqlite3 >/dev/null 2>&1 || echo "⚠️  better-sqlite3 ni nameščen"
npm list express >/dev/null 2>&1 || echo "⚠️  express ni nameščen"
npm list pdfkit >/dev/null 2>&1 || echo "⚠️  pdfkit ni nameščen"

echo ""
echo "🚀 Pripravljen za deploy na Render!"
echo ""
echo "Koraki:"
echo "1. Pojdi na https://dashboard.render.com"
echo "2. Klikni 'New +' → 'Web Service'"
echo "3. Poveži GitHub repozitorij ali upload ZIP"
echo "4. Render bo samodejno zaznal render.yaml"
echo "5. Klikni 'Deploy'"
echo ""
echo "📋 Alternativa - ročni deploy:"
echo "   - Build Command: npm install && npm run init-db"
echo "   - Start Command: npm start"
echo "   - Node Version: 18"
echo ""
