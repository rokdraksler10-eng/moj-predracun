# Predračuni - Test Report

## Povzetek
- **Status:** ⚠️ PARTIAL
- **Število testov:** 20
- **Uspešnih:** 13
- **Neuspešnih:** 2
- **Opozorila:** 5

---

## Funkcionalni testi

### 1. ✅ Ustvari nov predračun
- **Status:** ✅
- **Opis:** Funkcija `createNewQuote()` resetira formo in pripravi novo stanje
- **Rezultat:** Klic preklopi na edit tab, resetira vse vrednosti, inicializira datume
- **Preverjena polja:** project-name, customer, address, quote-date, valid-until
- **Napake:** Ni napak

### 2. ✅ Seznam predračunov (GET /api/quotes)
- **Status:** ✅
- **Opis:** `loadQuotes()` kliče `/api/quotes` in prikaže rezultate v tabeli
- **Rezultat:** Podatki se naložijo in prikažejo v `quotes-table`
- **Napake:** Ni napak

### 3. ✅ Filtriraj po statusu
- **Status:** ✅
- **Opis:** Dropdown z vrednostmi: draft, sent, accepted, rejected, expired
- **Rezultat:** `handleFilter()` filtrira stanje in osveži prikaz
- **Preverjeni statusi:**
  - `draft` → badge-draft (Osnutek)
  - `sent` → badge-sent (Poslano)
  - `accepted` → badge-accepted (Sprejeto)
  - `rejected` → badge-rejected (Zavrnjeno)
  - `expired` → badge-expired (Poteklo)
- **Napake:** Ni napak

### 4. ✅ Iskanje po predračunih (live search)
- **Status:** ✅
- **Opis:** `handleSearch()` filtrira po projectName, customer, quoteNumber
- **Rezultat:** Iskanje deluje brez gumbov (oninput event)
- **Napake:** Ni napak

### 5. ✅ Odpri obstoječi predračun (GET /api/quotes/:id)
- **Status:** ✅
- **Opis:** `loadQuoteById(id)` naloži predračun po ID-ju
- **Rezultat:** Podatki se napolnijo v formo, vključno z workItems in materials
- **Napake:** Ni napak

### 6. ✅ Dodaj postavke v predračun
- **Status:** ✅
- **Opis:** Modal okno za izbiro postavk iz seznama `/api/work-items`
- **Rezultat:** Postavka se doda v state.selectedWorkItems in prikaže v tabeli
- **Polja:** name, unit, price, quantity
- **Napake:** Ni napak

### 7. ✅ Dodaj materiale v predračun
- **Status:** ✅
- **Opis:** Modal okno za izbiro materialov iz seznama `/api/materials`
- **Rezultat:** Material se doda v state.selectedMaterials in prikaže v tabeli
- **Polja:** name, unit, price, quantity
- **Napake:** Ni napak

### 8. ⚠️ Izračun skupnega zneska (z DDV 22%)
- **Status:** ⚠️
- **Opis:** DDV se izračuna z `VAT_RATE = 0.22`
- **Rezultat:** Matematika je pravilna, ampak ima potencialne napake zaokroževanja
- **Najdene težave:**
  1. **Napaka zaokroževanja:** Sestevanje floating-point številk brez uporabe decimal.js ali podobne knjižnice
  2. Primer: `0.1 + 0.2 !== 0.3` v JavaScript
- **Priporočilo:** Uporabi `Math.round(amount * 100) / 100` za vsak korak

### 9. ✅ Izbriši predračun (DELETE z potrditvijo)
- **Status:** ✅
- **Opis:** `deleteQuote()` prikaže confirm() dialog pred brisanjem
- **Rezultat:** Kliče `DELETE /api/quotes/${id}` in osveži seznam
- **Napake:** Ni napak

### 10. ✅ Generiraj PDF (print-friendly pogled)
- **Status:** ✅
- **Opis:** `generatePDF()` odpre novo okno s print-friendly HTML
- **Rezultat:** Prikazuje vse podatke predračuna v formatu za tiskanje
- **Vključeno:** Podatki o projektu, stranki, postavke, materiali, zneski
- **Napake:** Ni napak

### 11. ✅ Modal okna (nov predračun, dodaj postavke, dodaj materiale)
- **Status:** ✅
- **Opis:** Trije modali: work-item-modal, material-modal
- **Rezultat:** Odpiranje/zapiranje deluje z overlay click
- **Napake:** Ni napak

### 12. ✅ Toast notifikacije
- **Status:** ✅
- **Opis:** `showToast(message, type)` prikazuje obvestila (success, error, info)
- **Rezultat:** Toast se prikaže na top-right, izgine po 4 sekundah
- **Napake:** Ni napak

### 13. ✅ Loading spinner
- **Status:** ✅
- **Opis:** CSS animacija `.loading` s `@keyframes spin`
- **Rezultat:** Pripravljeno za uporabo (čeprav ni aktivno uporabljeno v async funkcijah)
- **Napake:** Ni napak

### 14. ✅ Empty state
- **Status:** ✅
- **Opis:** Trije empty state-i: quotes-empty, work-items-empty, materials-empty
- **Rezultat:** Prikaže ikono in sporočilo ko ni podatkov
- **Napake:** Ni napak

### 15. ⚠️ Responsive design
- **Status:** ⚠️
- **Opis:** Uporablja flexbox in media queries
- **Rezultat:** Osnovna prilagodljivost prisotna
- **Najdene težave:**
  1. **Manjkajoči viewport meta:** `<meta name="viewport">` je prisoten, ampak tabele niso prilagojene za majhne ekrane
  2. **Tabele na mobilnih:** `table-container` ima `overflow-x: auto`, ampak ni optimalna izkušnja
- **Priporočilo:** Dodaj card-based layout za mobilne naprave

### 16. ⚠️ Shrani predračun
- **Status:** ⚠️
- **Opis:** `saveQuote()` validira in pošlje podatke na API
- **Rezultat:** Deluje, ampak ima logično napako
- **Najdene težave:**
  1. **Napaka:** Pri `saveQuote('sent')` se status posreduje ampak `document.getElementById('quote-status').value` se ne posodobi pred pošiljanjem
  2. **Napaka:** Ni uporabljen `await` pri `saveQuoteToAPI` v try-catch
  3. **Manjkajoča validacija:** Datum veljavnosti ni validiran (mora biti po datumu predračuna)

### 17. ❌ Edit postavke v tabeli
- **Status:** ❌
- **Opis:** Inline urejanje postavk ne deluje pravilno
- **Napaka:** `updateWorkItem()` in `updateMaterial()` se pokličeta ampak ne ohranita fokusa
- **Koda problema:**
  ```javascript
  function updateWorkItem(index, field, value) {
      state.selectedWorkItems[index][field] = value;
      renderWorkItems(); // Ta klic povzroči re-render in izgubo fokusa!
      updateTotals();
  }
  ```
- **Rezultat:** Uporabnik izgubi fokus v input polju po vsaki spremembi

### 18. ⚠️ Validacija obrazca
- **Status:** ⚠️
- **Opis:** Preverja project-name in customer
- **Rezultat:** Osnovna validacija deluje
- **Manjkajoče validacije:**
  1. Email stranke (če bo kdaj dodan)
  2. Datum veljavnosti (mora biti po datumu predračuna)
  3. Cene (naj bodo pozitivne)
  4. Količine (naj bodo pozitivne)

### 19. ✅ Zapiranje modala s klikom na overlay
- **Status:** ✅
- **Opis:** Event listener za klik zunaj modalnega okna
- **Rezultat:** Deluje pravilno
- **Napake:** Ni napak

### 20. ❌ URL struktura za API
- **Status:** ❌
- **Opis:** API klici uporabljajo absolutne poti brez base URL
- **Napaka:** 
  ```javascript
  await apiCall('/api/quotes');
  ```
  To ne bo delovalo če je aplikacija deployana v subdirektorij
- **Rezultat:** Potencialne težave pri deployu

---

## Najdene napake

### Kritične (2):
1. **Inline editing izgubi fokus** - Uporabnik ne more učinkovito urejati postavk
2. **API URL absolutne poti** - Težave pri deployu v subdirektorije

### Srednje (3):
1. **Floating-point zaokroževanje** - Potencialne napake pri izračunu DDV (0.22 × cena)
2. **Status posodabljanje** - Pri "Shrani in pošlji" se status v dropdownu ne posodobi
3. **Manjkajoča validacija datumov** - Veljavno do lahko nastavimo pred datumom predračuna

### Kozmetične (5):
1. **Tabele na mobilnih** - Slaba uporabniška izkušnja na majhnih zaslonih
2. **Loading spinner ni uporabljen** - Ni vizualne povratne informacije med API klici
3. **Manjkajoča animacija prehoda** - Prehod med list in edit je nenaden
4. **Escape tipka ne zapira modalov** - Ni keyboard navigacije
5. **Naziv stranke ni poševan v PDF** - V PDF layout je stranka na desni brez jasne hierarhije

---

## Predlogi za izboljšave

### 1. **Popravi inline editing (Visoka prioriteta)**
```javascript
// Namesto re-renderanja cele tabele, uporabi event delegation
// ali pa posodobi samo znesek vrstice brez re-renderanja
```

### 2. **Dodaj debounce za live search**
```javascript
// Trenutno se iskanje izvede ob vsaki tipki
// Dodaj debounce 300ms za boljšo performanco
```

### 3. **Konfigurabilen DDV**
```javascript
// DDV naj bo nastavljiv v settings ali pa dinamičen glede na vrsto storitve
const VAT_RATES = {
  'standard': 0.22,
  'reduced': 0.095,
  'zero': 0
};
```

### 4. **Offline support**
```javascript
// Uporabi localStorage za shranjevanje lokalnih sprememb
// preden pride do povezave s strežnikom
```

### 5. **Keyboard shortcuts**
```javascript
// Ctrl+S za shranjevanje
// Escape za zapiranje modala
// Tab navigacija skozi postavke
```

### 6. **Draggable sortiranje postavk**
- Uporabnikom omogoči urejanje vrstnega reda postavk z drag & drop

### 7. **Duplicate predračun**
- Gumb za kopiranje obstoječega predračuna kot predlogo

### 8. **Avtomatsko generiranje številke**
```javascript
// Samodejno generiraj Q-YYYY-XXXX format
const generateQuoteNumber = () => {
  const year = new Date().getFullYear();
  const seq = getNextSequence(); // from API
  return `Q-${year}-${String(seq).padStart(4, '0')}`;
};
```

### 9. **Bulk actions na seznamu**
- Izberi več predračunov in jih izbriši/posodobi hkrati

### 10. **Eksport v Excel/CSV**
```javascript
// Poleg PDF dodaj še Excel eksport
// Uporabna funkcija za računovodstvo
```

---

## Podroben pregled kode

### ✅ Dobra praksa najdena:
1. **Escape HTML** - Uporablja `escapeHtml()` za preprečevanje XSS
2. **State management** - Centralizirano stanje v `state` objektu
3. **Error handling** - Try-catch z fallback na demo podatke
4. **Intl.NumberFormat** - Pravilno formatiranje valut za sl-SI
5. **Event delegation** - Pravilno uporabljeni event listenerji

### ⚠️ Tehnični dolg:
1. **Global state** - State je globalen, kar otežkuje testiranje
2. **Callback hell** - Nekatere funkcije bi lahko bile bolj modularne
3. **Mix of concerns** - UI rendering in API klici so pomešani
4. **No JSDoc** - Manjkajo dokumentacijski komentarji

---

## Testirani edge cases:

| Scenarij | Rezultat |
|----------|----------|
| Prazna polja (naziv, stranka) | ✅ Validacija prestreže |
| Zelo dolgi naziv projekta (>100 znakov) | ✅ Prikaže se celoten naziv v tabeli |
| Cena = 0 | ✅ Dovoli se, ampak izračun je 0 |
| Negativna količina | ✅ Lahko vneseš (NAPAKA!) |
| Posebni znaki v nazivu | ✅ EscapeHtml prepreči XSS |
| Datum veljavnosti v preteklosti | ⚠️ Dovoli se (NAPAKA!) |
| 1000+ postavk v predračunu | ⚠️ Performančne težave pri renderingu |

---

## Skupna ocena: 7/10

**Upravičilo:**
- ✅ Vse osnovne funkcije delujejo
- ✅ Uporabnik lahko ustvari, ureja in briše predračune
- ✅ PDF generiranje deluje
- ⚠️ Težave z UX pri urejanju postavk
- ⚠️ Manjkajoče napredne funkcije (sortiranje, bulk actions)

**Priporočilo:** Pred produkcijo popravi kritični bug z izgubo fokusa pri urejanju postavk in dodaj validacijo datumov.
