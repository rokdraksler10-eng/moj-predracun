# Moj Predračun - Construction Quote App

Aplikacija za hitro izdelavo profesionalnih gradbenih predračunov. Optimizirana za mobilno uporabo na terenu.

## 🚀 Hitri start

```bash
# 1. Namesti odvisnosti
npm install

# 2. Inicializiraj bazo
npm run init-db

# 3. Zaženi strežnik
npm start

# 4. Odpri v brskalniku
open http://localhost:3000
```

## 📁 Struktura projekta

```
construction-quote-app/
├── data/                 # SQLite baza
│   └── quotes.db
├── scripts/
│   └── init-db.js        # Inicializacija baze
├── public/               # Frontend (PWA)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── server.js             # Express backend
├── package.json
└── README.md
```

## ✨ Funkcionalnosti

### Za mojstra (admin):
- **Nastavitve podjetja** — logo, kontakti, davčna
- **Katalog postavk** — cene del po kategorijah (keramika, pleskarija, elektro...)
- **Materiali** — cenik materialov
- **Težavnostni faktorji** — lahko (-20%), srednje (0%), težko (+30%)

### Na terenu:
- **Hitri vnos** — izbira postavke, kvadratura, težavnost
- **Opombe** — dostop, posebne zahteve
- **Avtomatski izračun** — material + delo + DDV
- **PDF izvoz** — profesionalen predračun + notranji izračun

## 📱 Mobilna uporaba

Aplikacija je PWA (Progressive Web App):
- Deluje na telefonu brez instalacije
- Touch-friendly UI (veliki gumbi)
- Offline-first (IndexedDB za lokalno shranjevanje)

## 🗄️ Podatkovna shema

### Tabele:
- `company_settings` — podatki o podjetju
- `work_items` — katalog postavk del
- `materials` — cenik materialov
- `work_item_materials` — povezava materiala s postavko
- `clients` — stranke
- `quotes` — predračuni
- `quote_items` — postavke v predračunu

## 🛠️ Tehnologije

| Komponenta | Tehnologija |
|------------|-------------|
| Backend | Node.js + Express |
| Baza | SQLite (better-sqlite3) |
| PDF | PDFKit |
| Frontend | Alpine.js (15KB) |
| CSS | Vanilla CSS (mobile-first) |

## 📱 Trenutni dostop

**Aktualni link:** `https://beta-hull-near-speaking.trycloudflare.com`

⚠️ Opomba: Strežnik ni stabilen (Cloudflare quick tunnel). Za redno uporabo priporočamo deploy na Render/Railway.

## 📝 TODO / Nadgradnje

- [x] **Dva PDF dokumenta:**
  - Predračun za stranko (s cenami, DDV)
  - Dokument za mojstra (material, delo, brez cen)
- [x] Kalkulator z direktno povezavo na predračun
- [x] Poenostavljen UI za mobilno uporabo
- [ ] Deploy na Render/Railway za stabilnost
- [ ] Upload logotipa
- [ ] E-pošiljanje predračunov
- [ ] Dashboard s statistiko

## 🐛 Debugging

```bash
# Preveri če je baza inicializirana
ls -la data/quotes.db

# Ponovna inicializacija baze
rm data/quotes.db
npm run init-db

# Dev mode z auto-reload
npm run dev
```

## 📄 Licence

MIT © Rok