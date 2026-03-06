# 🗄️ DAVID — Naloge Sprint 4
## Backend Agent | Prioriteta: KRITIČNO

---

## 🔴 NALOGA #1: PWA Offline Mode
**Rok: Sreda, 12. marec 2026**
**Status: 🟡 V TEKU**
**Časovna ocena: 16 ur**

### Opis:
Aplikacija mora delovati brez interneta. Franc je na terenu 80% časa.

### Implementacija:

#### 1. Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'moj-predracun-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icons/icon-192x192.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

#### 2. IndexedDB za podatke
```javascript
// Database for offline storage
const db = new Dexie('MojPredracunDB');

db.version(1).stores({
  quotes: '++id, client_name, project_name, created_at, synced',
  workItems: '++id, name, category',
  materials: '++id, name, category',
  photos: '++id, quote_id, data, synced'
});
```

#### 3. Sync mehanizem
```javascript
// When back online
window.addEventListener('online', () => {
  syncOfflineData();
});

async function syncOfflineData() {
  const unsynced = await db.quotes.where('synced').equals(0).toArray();
  for (const quote of unsynced) {
    await fetch('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quote)
    });
    await db.quotes.update(quote.id, { synced: 1 });
  }
}
```

### Acceptance Criteria:
- [ ] Aplikacija se odpre v Airplane mode
- [ ] Lahko ustvariš predračun brez neta
- [ ] Podatki se shranijo lokalno
- [ ] Ob povezavi se sinhronizirajo
- [ ] Toast: "Sinhronizirano" ko prideš online

### Testiraj:
```bash
# 1. Odpri aplikacijo
# 2. Vklopi Airplane mode
# 3. Osveži stran
# 4. Naredi predračun
# 5. Izklopi Airplane mode
# 6. Preveri, ali se je sinhroniziralo
```

---

## 🔴 NALOGA #2: Optimizacija PDF
**Rok: Petek, 14. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 8 ur**

### Trenutno: 6 sekund
### Cilj: < 2 sekund

### Rešitve:

#### 1. Kompresija slik
```javascript
// pdf-generator.js
const imageOptions = {
  compress: true,
  quality: 0.7 // Zmanjšaj kvaliteto
};

doc.image(logoPath, x, y, { 
  width: 100,
  ...imageOptions 
});
```

#### 2. Lazy load fontov
```javascript
// Naloži font samo ko je potreben
const fontRegular = fs.existsSync('./DejaVuSans.ttf') 
  ? './DejaVuSans.ttf' 
  : './fallback-font.ttf';
```

#### 3. Caching PDF
```javascript
// Če se predračun ni spremenil, vrni cache
const cacheKey = `pdf-${quoteId}-${updatedAt}`;
if (pdfCache.has(cacheKey)) {
  return pdfCache.get(cacheKey);
}
```

#### 4. Stream namesto buffer
```javascript
// Namesto celotnega bufferja, streamaj direktno
const doc = new PDFDocument({ 
  bufferPages: false, // Ne bufferiraj vse strani
  size: 'A4'
});
doc.pipe(res); // Direktno v response
```

### Acceptance Criteria:
- [ ] PDF generira v < 2s
- [ ] Loading indikator: "Generiram PDF..."
- [ ] Kvaliteta PDF je še vedno dobra
- [ ] Testiraj na počasnem strežniku

---

## 🟡 NALOGA #3: API za iskalnik
**Rok: Torek, 11. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 4 ure**

### Nove endpointe:

```javascript
// server.js

// Išči predračune
app.get('/api/quotes/search', (req, res) => {
  const { q, month, year } = req.query;
  
  let query = 'SELECT * FROM quotes WHERE 1=1';
  const params = [];
  
  if (q) {
    query += ' AND (project_name LIKE ? OR client_name LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  
  if (month && year) {
    query += ' AND strftime("%m", created_at) = ? AND strftime("%Y", created_at) = ?';
    params.push(month, year);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const results = db.prepare(query).all(...params);
  res.json(results);
});
```

### Acceptance Criteria:
- [ ] Išče po imenu stranke
- [ ] Išče po nazivu projekta
- [ ] Filtrira po mesecu
- [ ] Response < 200ms
- [ ] Max 50 rezultatov (pagination)

---

## 🟡 NALOGA #4: Backup sistem
**Rok: Petek, 10. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 4 ure**

### Implementacija:

```bash
#!/bin/bash
# backup.sh

# Dnevni backup ob 3:00
DATABASE="./data/quotes.db"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Kopiraj bazo
cp $DATABASE "$BACKUP_DIR/quotes_$DATE.db"

# Kompresiraj
gzip "$BACKUP_DIR/quotes_$DATE.db"

# Obdrži samo zadnjih 30 dni
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Logiraj
echo "Backup opravljen: $DATE" >> backup.log
```

### Cron job:
```bash
0 3 * * * /root/.openclaw/workspace/construction-quote-app/backup.sh
```

### Acceptance Criteria:
- [ ] Avtomatski backup vsak dan ob 3:00
- [ ] Hrani zadnjih 30 dni
- [ ] Test restore procedura
- [ ] Obvestilo če backup faila

---

## 📋 Dnevni Report Template:

```markdown
## David — [Datum]

### Včeraj:
- [x] Naredil Service Worker
- [ ] Še delam na IndexedDB

### Danes:
- [ ] Dokončam offline mode
- [ ] Začnem PDF optimizacijo

### Težave:
- IndexedDB ne dela na Safari
  → Rešitev: Uporabim localStorage kot fallback

### Blokiram:
- [ ] Nihče
- [x] Čakam na Cvetkine spremembe (API endpoint)

### Potrebujem od Roka:
- Odločitev: Ali podpiramo Safari za offline?

### Jutri:
- Testiram offline mode
- Začnem PDF optimizacijo
```

---

## 🚨 BLOCK Pravica:

Če najdem:
- Varnostno luknjo
- Izgubo podatkov
- Kritičen bug

**Takoj javi Roku in EVI!**

Deploy se ustavi.

---

**David, začni z Nalogo #1 (Offline Mode)! 🚀**
