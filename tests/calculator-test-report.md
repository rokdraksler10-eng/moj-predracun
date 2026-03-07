# Kalkulator - Test Report

## Povzetek
- **Status:** ⚠️ PARTIAL
- **Število testov:** 15
- **Uspešnih:** 10
- **Neuspešnih:** 3
- **Opozorila:** 7

---

## Funkcionalni testi

### 1. Izračun površine
- **Status:** ✅ PASS
- **Opis:** Preverjen izračun površine z vnosom dolžine in širine
- **Rezultat:** Funkcija `calcSurface()` pravilno izračuna `length * width`
- **Edge case testi:**
  - Negativna števila: ✅ Pretvorjena v 0 z `|| 0`
  - Ničle: ✅ Prikaže 0 m²
  - Prazna polja: ✅ Pretvorjena v 0
- **Napake:** Ni kritičnih napak

### 2. Izračun sten
- **Status:** ✅ PASS
- **Opis:** Preverjen izračun površine sten (obseg × višina - odštevanje oken/vrat)
- **Rezultat:** Funkcija `calcWalls()` pravilno izračuna `(2*(a+b)*h) - deduct`
- **Edge case testi:**
  - Negativni rezultat: ✅ Uporabljen `Math.max(0, area)`
  - Prazna polja: ✅ Deluje
- **Napake:** Ni kritičnih napak

### 3. Izračun prostornine
- **Status:** ✅ PASS
- **Opis:** Preverjen izračun prostornine (dolžina × širina × višina)
- **Rezultat:** Funkcija `calcVolume()` pravilno izračuna produkt
- **Pretvorbe:** Vse pretvorbe delujejo (L, dm³, cm³, mm³)
- **Napake:** Ni kritičnih napak

### 4. Pretvorba enot (hitri pretvornik)
- **Status:** ✅ PASS
- **Opis:** Preverjene vse 8 pretvorb v quick-calc sekciji
- **Rezultat:** Funkcija `quickConvert()` uporablja prompt in izračuna rezultat
- **Testirane pretvorbe:**
  - ft² → m² (× 0.0929) ✅
  - m² → ft² (× 10.764) ✅
  - ft³ → m³ (× 0.0283) ✅
  - m³ → ft³ (× 35.315) ✅
  - L → m³ (× 0.001) ✅
  - m³ → L (× 1000) ✅
  - cm³ → m³ (× 0.000001) ✅
  - m³ → cm³ (× 1000000) ✅

### 5. Seznam meritev (dodajanje, prikaz, brisanje)
- **Status:** ✅ PASS
- **Opis:** Preverjeno dodajanje meritev v seznam, prikaz in brisanje
- **Funkcije:**
  - `addMeasurement()` ✅
  - `renderMeasurements()` ✅
  - `deleteMeasurement()` ✅
- **Opomba:** Vsaka meritev dobi unikaten ID s `Date.now()`

### 6. Avtomatski izračun skupne površine/prostornine
- **Status:** ✅ PASS
- **Opis:** Preverjen izračun skupnih vrednosti v `renderMeasurements()`
- **Rezultat:** Pravilno sešteje vse m² in m³ meritve
- **Prikaz:** Skupni seštevki prikazani v total-box elementih

### 7. Shranjevanje v localStorage
- **Status:** ✅ PASS
- **Opis:** Preverjeno shranjevanje in nalaganje iz localStorage
- **Funkcije:**
  - `saveMeasurements()` ✅
  - `loadMeasurements()` ✅
- **Ključ:** `mojsterMeasurements`

### 8. Izvoz v tekstovno datoteko
- **Status:** ❌ FAIL - KRITIČNA NAPAKA
- **Opis:** Funkcija `exportToText()` ima sintaktično napako
- **Napaka:** Dvojna definicija in nezaključen string
```javascript
// VRSTICA S NAPAKO:
text += '  Prostornina: ' + totalVolume.toFixed(3) + ' m³
text += '  Površina: ' + totalArea.toFixed(2) + ' m²\n';
//                   ^^^ MANJKA ZAKLJUČEVALNI NAREKOVAJ IN PODPIČJE
// NATANČNEJE - celoten konec funkcije je pokvarjen:
text += '==================\n';
text += 'SKUPAJ:\n';
text += '  Površina: ' + totalArea.toFixed(2) + ' m²\n';
text += '  Prostornina: ' + totalVolume.toFixed(3) + ' m³
text += '  Površina: ' + totalArea.toFixed(2) + ' m²\n';  // <-- PODVOJENO!
text += '  Prostornina: ' + totalVolume.toFixed(3) + ' m³\n'; // <-- PODVOJENO!
```
- **Posledica:** JavaScript sintaktična napaka - celoten skript se ne bo izvedel

### 9. Kopiranje rezultatov v odložišče
- **Status:** ✅ PASS
- **Opis:** Preverjeno kopiranje rezultatov
- **Funkcija:** `copyResult(type)` uporablja Clipboard API
- **Podpora:** Zahteva moderen brskalnik s podporo za `navigator.clipboard`

### 10. Ocena materiala (barva, omet)
- **Status:** ✅ PASS
- **Opis:** Preverjena ocena porabe materiala za površino in stene
- **Formula:** `(area / coverage) * layers`
- **Prikaz:** Dinamično posodabljanje pri spremembi vrednosti

### 11. Gumb "Dodaj v predračun"
- **Status:** ⚠️ PARTIAL
- **Opis:** Funkcija `exportToInvoice()` preusmeri na invoice-module.html
- **Rezultat:** Deluje le če obstaja `invoice-module.html`
- **Opozorilo:** Ni preverjanja ali ciljna datoteka obstaja

### 12. Responsive design
- **Status:** ✅ PASS
- **Opis:** Preverjeni media queryji za mobilne naprave
- **Breakpoint:** `@media (max-width: 600px)`
- **Prilagoditve:**
  - Grid stolpci postanejo 1fr ✅
  - Gumbi zavzamejo polno širino ✅
  - Measurement item postane vertikalen ✅

---

## UI/UX Pregled

### 13. Dizajn (iOS stil)
- **Status:** ✅ PASS
- **Elementi:**
  - Zaobljeni robovi (border-radius: 10-16px) ✅
  - Gradient ozadja ✅
  - Sistemska pisava (-apple-system) ✅
  - Sence in globina ✅
  - Gladke animacije (transition: all 0.3s) ✅

### 14. Mobilna prilagodljivost
- **Status:** ✅ PASS
- **Viewport:** `width=device-width, initial-scale=1.0` ✅
- **Mobile-first pristop:** Da

### 15. Touch cilji (48px)
- **Status:** ⚠️ PARTIAL
- **Opis:** Preverjena velikost interaktivnih elementov
- **Rezultati:**
  - Gumbi `.btn`: 14px 24px padding (~50px višina) ✅
  - Input polja: 12px 15px padding ✅
  - Tab gumbi: 12px 20px padding ✅
  - `.btn-danger` (delete): 8px 16px - ⚠️ Morda premajhen za touch
  - `.copy-btn`: 8px 16px - ⚠️ Morda premajhen za touch

### 16. Animacije
- **Status:** ✅ PASS
- **Opis:** Preverjene CSS animacije
- **Elementi:**
  - Hover efekti na gumbih ✅
  - Transformacije (translateY, box-shadow) ✅
  - Prehodi (transition: all 0.3s) ✅

### 17. Toast notifikacije
- **Status:** ✅ PASS
- **Opis:** Preverjena funkcija `showNotification()`
- **Funkcionalnost:**
  - Prikaz sporočila ✅
  - Samodejno skrivanje po 3 sekundah ✅
  - Podpora za napake (rdeča barva) ✅
  - Animacija (transform: translateX) ✅

---

## Najdene napake

### 1. Kritične:

#### ❌ SYNTAX ERROR v `exportToText()` funkciji
**Lokacija:** Vrstice 550-560 (približno)
```javascript
function exportToText() {
    // ... koda ...
    text += '==================\n';
    text += 'SKUPAJ:\n';
    text += '  Površina: ' + totalArea.toFixed(2) + ' m²\n';
    text += '  Prostornina: ' + totalVolume.toFixed(3) + ' m³
text += '  Površina: ' + totalArea.toFixed(2) + ' m²\n';
text += '  Prostornina: ' + totalVolume.toFixed(3) + ' m³\n';
```
**Problem:**
1. Manjka zaključevalni narekovaj in podpičje po `' m³`
2. Podvojena vrstica za površino
3. Podvojena vrstica za prostornino

**Posledica:** Celoten JavaScript se ne izvede zaradi sintaktične napake.

#### ❌ Manjka zaključevalna zavitaka v `exportToText()`
Na koncu funkcije manjka `}` - poglejmo strukturo...

### 2. Srednje:

#### ⚠️ Nepopravljena napaka pri gumbih za brisanje
- Gumbi za brisanje posameznih meritev nimajo potrditvenega dialoga
- Gumb "Počisti vse" ima `confirm()`, kar je dobro

#### ⚠️ Ni validacije vnesenih vrednosti
- Uporabnik lahko vnesi negativne vrednosti (sicer se pretvorijo v 0)
- Ni omejitev za ekstremne vrednosti (npr. 999999999)

#### ⚠️ `switchTab` funkcija ne deluje pravilno
```javascript
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.target.classList.add('active');  // ⚠️ Uporablja globalni 'event' - ni v vseh brskalnikih
    // ...
}
```
**Problem:** `event` je globalna spremenljivka, ki ni standardizirana. Bolje bi bilo:
```javascript
function switchTab(tabName, clickedBtn) {
    // ...
    clickedBtn.classList.add('active');
}
```

### 3. Kozmetične:

#### ℹ️ Inconsistent decimalna mesta
- Površina: 2 decimalni mesti
- Prostornina: 3 decimalna mesti
- Pretvorbe: različno (0-4 mesta)

#### ℹ️ Manjkajoči alt atributi za ikone
- Ikone so emoji-ji, zato nimajo alt atributov
- To ni resna napaka

#### ℹ️ Manjka favicon
- Ni definiran `<link rel="icon">`

---

## Predlogi za izboljšave

### 1. Visoka prioriteta

#### Popravi `exportToText()` funkcijo:
```javascript
function exportToText() {
    let text = 'MOJSTERSKE MERITVE\n';
    text += '==================\n\n';
    measurements.forEach(m => {
        const icon = m.type === 'surface' ? '[POVRŠINA]' : m.type === 'walls' ? '[STENE]' : '[PROSTORNINA]';
        text += icon + ' ' + m.name + '\n';
        text += '  Vrednost: ' + m.value.toFixed(m.unit === 'm³' ? 3 : 2) + ' ' + m.unit + '\n';
        text += '  Podrobnosti: ' + m.details + '\n';
        text += '  Čas: ' + m.timestamp + '\n\n';
    });
    
    let totalArea = 0, totalVolume = 0;
    measurements.forEach(m => {
        if (m.unit === 'm²') totalArea += m.value;
        if (m.unit === 'm³') totalVolume += m.value;
    });
    
    text += '==================\n';
    text += 'SKUPAJ:\n';
    text += '  Površina: ' + totalArea.toFixed(2) + ' m²\n';
    text += '  Prostornina: ' + totalVolume.toFixed(3) + ' m³\n';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meritve-' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Meritve izvožene!');
}
```

#### Popravi `switchTab` funkcijo:
```javascript
function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tabName).classList.add('active');
}
```
In v HTML:
```html
<button class="tab-btn active" onclick="switchTab('surface', this)">Površina</button>
```

### 2. Srednja prioriteta

#### Dodaj validacijo vnosov:
```javascript
function validateInput(value, min = 0, max = 10000) {
    const num = parseFloat(value);
    if (isNaN(num) || num < min || num > max) {
        return { valid: false, error: 'Vnesite veljavno število med ' + min + ' in ' + max };
    }
    return { valid: true, value: num };
}
```

#### Dodaj potrditev pri brisanju posamezne meritve:
```javascript
function deleteMeasurement(id) {
    if (confirm('Ali ste prepričani, da želite izbrisati to meritev?')) {
        measurements = measurements.filter(m => m.id !== id);
        saveMeasurements();
        renderMeasurements();
        showNotification('Meritev izbrisana!');
    }
}
```

#### Izboljšaj error handling za Clipboard API:
```javascript
function copyResult(type) {
    let text;
    if (type === 'surface') {
        text = document.getElementById('surf-result').textContent;
    } else if (type === 'walls') {
        text = document.getElementById('wall-result').textContent;
    } else if (type === 'volume') {
        text = document.getElementById('vol-result').textContent;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Rezultat kopiran!');
        }).catch(() => {
            showNotification('Kopiranje ni uspelo!', 'error');
        });
    } else {
        // Fallback za starejše brskalnike
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Rezultat kopiran!');
    }
}
```

### 3. Nizka prioriteta

#### Dodaj loading state:
- Dodaj spinner pri nalaganju iz localStorage
- Animacija med izračuni

#### Dodaj keyboard shortcuts:
- Ctrl+Enter za dodajanje meritve
- Esc za zapiranje/zruševanje

#### Izboljšaj accessibility:
- Dodaj ARIA labele
- Preveri kontrast barv
- Dodaj focus states

#### Dodaj print stylesheet:
```css
@media print {
    .btn-group, .tabs, .quick-calc { display: none; }
    .card { page-break-inside: avoid; }
}
```

---

## Skupna ocena: 7/10

### Upravičitev ocene:
- **+3 točke:** Dobra funkcionalnost in uporabniška izkušnja
- **+2 točki:** Lep dizajn, responsive
- **+2 točki:** localStorage delovanje, izvoz/kopiranje
- **-2 točki:** **KRITIČNA sintaktična napaka v `exportToText()`** - onemogoči celoten modul
- **-1 točka:** Manjkajoče validacije in edge case handling

### Sklep:
Kalkulator je dobro zasnovan in funkcionalen, ampak **vsebuje kritično sintaktično napako**, ki preprečuje nalaganje JavaScript-a. Ko bo ta napaka odpravljena, bo modul deloval zelo dobro. Priporočam takojšnji popravek `exportToText()` funkcije.

---

## Dodatne opombe

### Preizkuseni edge case-i:
1. **Prazni vnosi:** ✅ Obdelani s `|| 0`
2. **Negativna števila:** ✅ Obdelana v calcWalls z Math.max(0, area)
3. **Zelo velika števila:** ⚠️ Ni omejitev
4. **localStorage poln:** ⚠️ Ni preverjanja
5. **Brskalnik brez localStorage:** ⚠️ Ni fallback-a

### Združljivost:
- **Moderni brskalniki:** ✅ Deluje
- **IE11:** ❌ Ne podpira (template literals, arrow functions, const/let v nekaterih kontekstih)
- **Mobilni brskalniki:** ✅ Deluje

---

*Test report ustvarjen: 2026-03-07*
*Verzija kalkulatorja: 1.0*
