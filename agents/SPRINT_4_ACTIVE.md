# 🚀 SPRINT 4 — ZAGON
## Datum: Petek, 6. marec 2026, 18:22
## Status: AKTIVEN
## Trajanje: 2 tedna (do 20. marca)

---

## 📋 IZHAJALIŠČE: Francov Test Report #1

**Ključne težave:**
1. 🔴 **Offline mode** — aplikacija ne deluje brez neta
2. 🔴 **Premajhni elementi** — težko zadeneš s prstom  
3. 🔴 **Ni iskalnika** — 45s iskanja predračuna
4. 🟡 **Počasen PDF** — 6 sekund generiranje
5. 🟡 **Zapletene fotografije** — obupal po 2 minutah

**Francova ocena:** ⭐⭐ (2/5) — "Ne bi uporabljal v trenutnem stanju"

---

## 🎯 CILJ SPRINTA 4:

> **"Aplikacija deluje brezhibno za 60-letnega mojstra na terenu"**

### Merljivi cilji:
- [ ] Offline mode deluje (PWA)
- [ ] Vsi elementi min 48px
- [ ] Iskanje predračuna < 10 sekund
- [ ] PDF generiranje < 2 sekundi
- [ ] Francova končna ocena > ⭐⭐⭐⭐ (4/5)

---

## 👥 NALOGE PO AGENTIH

---

## 🗄️ DAVID — Backend Agent (KRITIČNO)

### 🔴 Naloga #1: PWA Offline Mode (PRIORITETA: KRITIČNO)
**Rok: Sreda, 12. marec**

**Opis:**
Aplikacija mora delovati brez interneta. Mojster je na terenu 80% časa.

**Tehnične zahteve:**
```javascript
// Service Worker
- Cache static assets (HTML, CSS, JS)
- Cache API responses (work-items, materials)
- LocalStorage/IndexedDB za predračune
- Background sync ko pride online
```

**Acceptance Criteria:**
- [ ] Aplikacija se odpre brez neta
- [ ] Lahko narediš nov predračun offline
- [ ] Lahko shraniš predračun (lokalno)
- [ ] Sync ko prideš online
- [ ] Testiraj v "Airplane mode"

**Francov test:**
> "V kletni kopalnici ni signala. Če ne dela brez neta, je neuporabna."

---

### 🔴 Naloga #2: Optimizacija PDF (PRIORITETA: VISOKA)
**Rok: Petek, 14. marec**

**Trenutno:** 6 sekund
**Cilj:** < 2 sekund

**Rešitve:**
```javascript
// PDFKit optimizacije
- Zmanjšaj kvaliteto slik (compression)
- Stream PDF namesto buffer
- Cache generirane PDFe
- Lazy load fontov
```

**Acceptance Criteria:**
- [ ] PDF generira v < 2s
- [ ] Loading indikator ("Generiram PDF...")
- [ ] Testiraj na počasnem telefonu

---

### 🟡 Naloga #3: API za iskalnik (PRIORITETA: SREDNJA)
**Rok: Torek, 11. marec**

```javascript
// Novi endpoint
GET /api/quotes/search?q=novak
GET /api/quotes/search?month=januar&year=2026
```

**Acceptance Criteria:**
- [ ] Išče po imenu stranke
- [ ] Išče po nazivu projekta
- [ ] Išče po datumu
- [ ] Response < 200ms

---

## 💻 CVETKA — Frontend Agent (KRITIČNO)

### 🔴 Naloga #1: Povečaj vse elemente (PRIORITETA: KRITIČNO)
**Rok: Torek, 11. marec**

**Francov problem:**
> "Input polja so majhna (14px), težko zadenem s prstom. 3x sem zgrešil."

**Spremembe:**
```css
/* Globalne spremembe */
input, select, button {
  min-height: 48px !important;
  min-width: 48px !important;
  font-size: 16px !important; /* Prepreči zoom na iPhone */
}

/* Gumbi */
.btn-primary, .btn-secondary {
  padding: 12px 24px;
  font-size: 16px;
}

/* Input polja */
.input-full, .input-number {
  height: 48px;
  padding: 12px;
}

/* Razmiki med elementi */
.form-group {
  margin-bottom: 16px;
}

.item-row-editable input {
  height: 40px;
  font-size: 16px;
}
```

**Acceptance Criteria:**
- [ ] Vsi interaktivni elementi min 48px
- [ ] Testiraj na Samsung A12 (Francov telefon)
- [ ] Testiraj na iPhone SE (5" zaslon)
- [ ] Ana potrdi dostopnost

---

### 🔴 Naloga #2: Iskalnik za predračune (PRIORITETA: KRITIČNO)
**Rok: Četrtek, 13. marec**

**Francov problem:**
> "Moral sem skrolati čez 15 predračunov. 45 sekund iskanja."

**Implementacija:**
```html
<!-- Na vrhu seznama predračunov -->
<div class="search-bar">
  <input type="text" 
         placeholder="Išči po stranki ali projektu..."
         x-model="searchQuery"
         @input="searchQuotes()">
  <button @click="clearSearch()">✕</button>
</div>

<!-- Filtri po mesecih -->
<div class="month-filters">
  <button @click="filterMonth('all')">Vsi</button>
  <button @click="filterMonth('2026-01')">Jan</button>
  <button @click="filterMonth('2026-02')">Feb</button>
  <button @click="filterMonth('2026-03')">Mar</button>
</div>
```

**Acceptance Criteria:**
- [ ] Iskalno polje na vrhu
- [ ] Filtriranje v realnem času
- [ ] Filtri po mesecih
- [ ] Najdi predračun v < 10 sekundah

---

### 🟡 Naloga #3: Loading indikatorji (PRIORITETA: VISOKA)
**Rok: Sreda, 12. marec**

**Francov problem:**
> "Od klikanja do odprtja predračuna je minilo 12 sekund! Nisem vedel, ali je klik uspel."

**Implementacija:**
```html
<!-- Globalni loader -->
<div x-show="loading" class="loading-overlay">
  <div class="spinner"></div>
  <p x-text="loadingMessage">Nalagam...</p>
</div>

<!-- Lokalni loaderji -->
<button @click="useTemplate(template)" :disabled="loading">
  <span x-show="!loading">Uporabi predlogo</span>
  <span x-show="loading">Ustvarjam...</span>
</button>
```

**Sporočila:**
- "Ustvarjam predračun..."
- "Generiram PDF..."
- "Shranjujem..."
- "Nalagam..."

**Acceptance Criteria:**
- [ ] Vsaka operacija > 500ms ima indikator
- [ ] Jasno sporočilo kaj se dogaja
- [ ] Blokiraj dvojne klika

---

### 🟡 Naloga #4: Enostavnejše fotografije (PRIORITETA: SREDNJA)
**Rok: Petek, 14. marec**

**Francov problem:**
> "Odprla se je GALERIJA namesto kamere! Obupal po 2 minutah."

**Spremembe:**
```html
<!-- Dva jasna gumba -->
<button @click="openCamera()">📷 Slikaj s kamero</button>
<button @click="openGallery()">🖼️ Izberi iz galerije</button>

<!-- Direktno kamera -->
<input type="file" accept="image/*" capture="environment">

<!-- Avtomatska kategorija za prvo sliko -->
<!-- (če ni še slik → "Pred", če so že → "Med") -->
```

**Acceptance Criteria:**
- [ ] Gumb "📷 Slikaj" direktno odpre kamero
- [ ] Ni potrebe po izbiri kategorije pred slikanjem
- [ ] Po slikanju vprašaj za opis (opcijsko)
- [ ] Slikaj v < 30 sekundah

---

## 🎨 ANA — UX Agent

### 🔴 Naloga #1: Pregled vseh velikosti (PRIORITETA: KRITIČNO)
**Rok: Ponedeljek, 10. marec**

**Naredi:**
- [ ] Preveri vsak gumb (min 48px)
- [ ] Preveri vsako input polje
- [ ] Preveri razmike med elementi
- [ ] Testiraj na 5" telefonu (iPhone SE)
- [ ] Testiraj s prstom (ne z miško!)

**Dostopnost:**
- [ ] Kontrast min 4.5:1
- [ ] Font min 16px za inpute
- [ ] Testiraj na soncu (simuliraj)

**Deliverable:**
- Seznam vseh elementov, ki so premajhni
- Točne vrednosti (px) za popravke

---

### 🟡 Naloga #2: Potrditvena sporočila (PRIORITETA: VISOKA)
**Rok: Torek, 11. marec**

**Francov problem:**
> "Spremenil sem količino iz 25 na 18. Nisem bil prepričan, ali je ostalo 18."

**Dizajn:**
```css
/* Toast notifications */
.toast-success {
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  position: fixed;
  bottom: 20px;
  right: 20px;
}
```

**Sporočila:**
- ✅ "Shranjeno" (po spremembi)
- ✅ "Predračun ustvarjen"
- ✅ "Slika dodana"
- ✅ "Izbrisano"

---

## ⚡ BOJAN — Časovni Agent

### 🟡 Naloga #1: Merjenje po popravkih (PRIORITETA: VISOKA)
**Rok: Petek, 14. in 21. marec**

**Meri pred in po popravkih:**

| Metrika | Pred | Cilj | Po |
|---------|------|------|-----|
| Nov predračun | 6m 15s | < 2m | ? |
| PDF generiranje | 6s | < 2s | ? |
| Iskanje | 45s | < 10s | ? |
| Fotografije | FAIL | < 30s | ? |

**Testiraj na:**
- Samsung A12 (Francov telefon)
- 3G povezava (počasna)
- Offline način

**Deliverable:**
- Report z merjenji
- Potrditev, da so cilji doseženi

---

## 🔍 EVA — Kritik Agent

### 🔴 Naloga #1: Pregled vsakega commita (PRIORITETA: KRITIČNO)
**Rok: Vsak dan**

**Preglej:**
- [ ] Cvetkine spremembe (velikosti, iskalnik)
- [ ] Davidove spremembe (offline, PDF)

**Išči:**
- [ ] Robne primere (prazen input, 0, negativno)
- [ ] Varnostne luknje
- [ ] Performance težave

**Blockerji:**
- ❌ Če najdeš kritičen bug → javi takoj
- ❌ Če ni dostopno → javi Ani
- ❌ Če ni varno → javi Davidu

---

### 🟡 Naloga #2: Finalna odobritev (PRIORITETA: KRITIČNO)
**Rok: Petek, 20. marec**

**Pred deployem preveri:**
- [ ] Vsi testi PASS
- [ ] Varnostni pregled OK
- [ ] GDPR compliant
- [ ] Offline deluje
- [ ] Vsi elementi so dovolj veliki

**VETO pravica:**
Če rečeš "NE", se ne deploya.

---

## 👷 FRANC — Mojster-Tester

### 🟡 Naloga #1: Ponovno testiranje (PRIORITETA: KRITIČNO)
**Rok: Petek, 21. marec**

**Naredi ENAKE teste kot prej:**
1. Nov predračun za kopalnico
2. Iskanje starega predračuna
3. Test brez interneta

**Oceni:**
- ⭐⭐⭐⭐⭐ (5/5) = Odlično, uporabljam vsak dan
- ⭐⭐⭐⭐ (4/5) = Dobro, majhne pripombe
- ⭐⭐⭐ (3/5) = Uporabno, ampak me jezi
- ⭐⭐ (2/5) = Težko uporabljam
- ⭐ (1/5) = Ne deluje / neuporabno

**Final decision:**
- ✅ **DA** → Deploy dovoljen
- ❌ **NE** → Nazaj na risalno desko

---

## 📅 ČASOVNICA SPRINTA

### Teden 1 (6.3. - 13.3.)

| Dan | David | Cvetka | Ana | Eva | Franc |
|-----|-------|--------|-----|-----|-------|
| **Pon 6.3.** | Začne offline mode | Začne velikosti | Pregled UX | Pregled kode | Počiva |
| **Tor 7.3.** | Nadaljuje offline | Velikosti, iskalnik | Testira velikosti | Pregled commitov | — |
| **Sre 8.3.** | Offline test | Loading indikatorji | — | Pregled | — |
| **Čet 9.3.** | PDF optimizacija | Fotografije | — | Pregled | — |
| **Pet 10.3.** | PDF test | Dokonča | Dostopnost check | **VETO pregled** | — |

### Teden 2 (13.3. - 20.3.)

| Dan | David | Cvetka | Ana | Eva | Franc |
|-----|-------|--------|-----|-----|-------|
| **Pon 13.3.** | Backup, monitoring | Popravki | — | Pregled | — |
| **Tor 14.3.** | Performance | Popravki | — | Pregled | — |
| **Sre 15.3.** | Testi | Testi | — | Pregled | — |
| **Čet 16.3.** | Priprava deploya | Priprava | — | **Final review** | — |
| **Pet 17.3.** | — | — | — | — | **TEST #2** |
| **Pet 20.3.** | DEPLOY? | DEPLOY? | DEPLOY? | **ODLOČITEV** | **OCENA** |

---

## 🚨 DAILY STANDUP (vsak dan ob 9:00)

Vsak agent napiše v svoj report:
```
### [Datum]

**Včeraj:**
- Naredil sem to in to

**Danes:**
- Bom delal to

**Blokirajo me:**
- [ ] Nihče
- [ ] Čaka na: [ime agenta] — [razlog]

**Potrebujem pomoč:**
- [ ] Ni me blokiral nihče
- [ ] Potrebujem odločitev Roka o: [vprašanje]
```

---

## ✅ DEFINITION OF DONE

**Task je "done" ko:**
- [ ] Koda je napisana
- [ ] Eva je pregledala (code review)
- [ ] Ana je potrdila UX
- [ ] Bojan je izmeril (če relevantno)
- [ ] Deluje na mobilnem
- [ ] Ni varnostnih lukenj

**Sprint je "done" ko:**
- [ ] Francova ocena > ⭐⭐⭐⭐ (4/5)
- [ ] Eva je dala zeleno luč
- [ ] David je preveril varnost
- [ ] Vsi kritični bug-i so popravljeni

---

## 🎯 KLJUČNI DOGODKI

### 🔴 Kritični (mora biti narejeno):
- **10.3.** Ana potrdi velikosti
- **12.3.** David konča offline mode
- **13.3.** Cvetka konča iskalnik
- **20.3.** Francov test #2

### 🟡 Pomembni:
- **14.3.** PDF < 2 sekundi
- **17.3.** Vsi popravki končani

---

## 🚀 DEPLOY DECISION

**Petek, 20. marec ob 16:00:**

| Agent | Status | Podpis |
|-------|--------|--------|
| Ana | ⬜ Ready | _______ |
| Bojan | ⬜ Metrics OK | _______ |
| Cvetka | ⬜ Code ready | _______ |
| David | ⬜ Secure & fast | _______ |
| Eva | ⬜ Approved | _______ |
| Franc | ⬜ ⭐⭐⭐⭐+ | _______ |

**Rok odloči:** ⬜ DEPLOY / ⬜ EXTEND SPRINT

---

**SPRINT 4 JE AKTIVEN! 🚀**

Agenti, začnite z delom! Prvi daily standup jutri ob 9:00.

**Srečno!**
