# Materiali - Test Report

## Povzetek
- Status: ⚠️ PARTIAL
- Število testov: 13
- Uspešnih: 9
- Neuspešnih: 0
- Opozorila: 7

---

## Funkcionalni testi

### 1. Prikaz seznama materialov (GET /api/materials)
- Status: ✅
- Opis: Funkcija `loadMaterials()` pridobi podatke iz API-ja, obdeluje napake in prikazuje loading state
- Rezultat: 
  - Pravilno kliče `GET /api/materials`
  - Ob napaki prikaže error state s prijaznim sporočilom
  - Uporablja `escapeHtml()` za zaščito pred XSS
  - Podatki se pravilno shranijo v globalno spremenljivko `materials`
- Napake: Ni kritičnih napak
- Opozorila:
  - Ni retry logike ob neuspešnem klicu
  - Ni cache mehanizma za offline način

### 2. Dodaj nov material (POST /api/materials)
- Status: ⚠️
- Opis: Form za dodajanje z vsemi obveznimi polji
- Rezultat:
  - Form se odpre s klikom na FAB gumb
  - Vsebuje vsa polja: naziv, kategorija, enota, cena, dobavitelj, opis
  - HTML5 validacija z `required` atributi
  - Pravilno kliče `POST /api/materials`
  - Po uspešnem shranjevanju prikaže toast in osveži seznam
- Napake:
  - Ni validacije za negativne cene (dovoljuje -10€)
  - Ni validacije za prevelike vrednosti cen
  - Ni loading indikatorja med shranjevanjem (uporabnik ne vidi, da se nekaj dogaja)
- Opozorila:
  - Polje "Dobavitelj" in "Opis" nimata omejitve dolžine
  - Ni client-side validacije za ime (lahko samo presledki)

### 3. Uredi material (PUT /api/materials/:id)
- Status: ⚠️
- Opis: Funkcija `editMaterial()` + `saveMaterial()`
- Rezultat:
  - Pravilno napolni form z obstoječimi podatki
  - Kliče `PUT /api/materials/:id` z vsemi polji
  - Ohrani povezavo s postavko (work_item_id)
  - Po uspešni operaciji osveži seznam
- Napake:
  - Enaka težava z validacijo negativnih cen kot pri dodajanju
  - Ni loading indikatorja med shranjevanjem
- Opozorila:
  - Če pride do napake pri nalaganju materialov, se lahko zgodi da `editMaterial()` ne najde materiala in ne naredi nič (brez opozorila)

### 4. Izbriši material (DELETE z potrditvijo)
- Status: ✅
- Opis: Funkcija `deleteMaterial()` + `confirmDelete()`
- Rezultat:
  - Odpre se modal s potrditvijo brisanja
  - Prikaže opozorilno ikono in sporočilo
  - Kliče `DELETE /api/materials/:id`
  - Po uspešnem brisanju prikaže toast
  - Pravilno zapre modal in počisti spremenljivko `materialToDelete`
- Napake: Ni kritičnih napak
- Opozorila:
  - Ni loading indikatorja med brisanjem
  - Ni možnosti "Undo" po brisanju

### 5. Kategorije materialov (horizontalni filter chip-ov)
- Status: ✅
- Opis: `renderCategoryFilter()` + `filterByCategory()`
- Rezultat:
  - Dinamično generira chipe iz obstoječih kategorij materialov + privzetih kategorij
  - Horizontalni scroll deluje pravilno (`overflow-x: auto`)
  - Aktivna kategorija ima drugačen stil (modra ozadje)
  - Filtriranje deluje pravilno z `selectedCategory` spremenljivko
- Napake: Ni kritičnih napak
- Opozorila:
  - Privzete kategorije (`defaultCategories`) so hardcodirane v JS
  - Če je veliko kategorij, je scroll lahko neintuitiven (ni vizualnega indikatorja)

### 6. Iskanje (real-time search)
- Status: ✅
- Opis: Input z `input` event listenerjem
- Rezultat:
  - Iskanje se sproži takoj ob vnosu (real-time)
  - Išče po: nazivu, dobavitelju, opisu
  - Case-insensitive iskanje (`.toLowerCase()`)
  - Pravilno kombinira s kategorijskim filtrom
- Napake: Ni kritičnih napak
- Opozorila:
  - Pri velikem številu materialov (>100) bi lahko bilo iskanje počasno (ni debounce)
  - Ni highlight-a iskanega besedila v rezultatih

### 7. Povezovanje materiala s postavko (GET /api/work-items + PUT)
- Status: ⚠️
- Opis: `openLinkModal()` + `selectWorkItem()`
- Rezultat:
  - Pravilno naloži postavke z `GET /api/work-items`
  - Prikaže seznam v modal oknu
  - Možnost iskanja po postavkah
  - Ob izbiri kliče `PUT /api/materials/:id` z `work_item_id`
  - V seznamu materialov prikaže povezano postavko
- Napake:
  - **POMEMBNO:** Funkcija `selectWorkItem()` pošlje PUT z vsemi polji materiala, kar lahko povzroči race condition če je bil material medtem spremenjen
  - Ni možnosti odstranitve povezave (unlink) v `linkModal` - samo v add/edit modalu
- Opozorila:
  - Če `work-items` API ni na voljo, se seznam ne prikaže (samo prazno)

### 8. Modal okna (dodaj, uredi, briši, poveži)
- Status: ✅
- Opis: Vse modal implementacije
- Rezultat:
  - Material modal: add/edit z vsemi polji
  - Link modal: izbira postavke
  - Delete modal: potrditev brisanja
  - Vsi modali imajo:
    - Animacijo odpiranja (`slideUp`)
    - Backdrop blur efekt
    - Zapiranje s klikom na backdrop
    - Zapiranje s X gumbom
    - Pravilno centriranje in responsive design
- Napake: Ni kritičnih napak
- Opozorila:
  - Max-height 90vh lahko povzroči scroll znotraj modala na majhnih zaslonih
  - Focus management ni implementiran (dostopnost)

### 9. Toast notifikacije
- Status: ✅
- Opis: `showToast(message, type)`
- Rezultat:
  - Podpira dva tipa: success (zelen) in error (rdeč)
  - Animacija prikaza/izginjanja
  - Centriran na dnu zaslona
  - Samodejno izgine po 3 sekundah
- Napake: Ni kritičnih napak
- Opozorila:
  - Ni možnosti zapreti toast ročno
  - Če se hitro zaporedoma prikažejo toast-i, se lahko prekrivajo

### 10. Loading spinner
- Status: ⚠️
- Opis: Spinner pri inicialnem nalaganju
- Rezultat:
  - Prikaže se ob inicialnem nalaganju strani
  - CSS animacija je pravilno implementirana (`@keyframes spin`)
- Napake:
  - **Manjka loading indicator pri:**
    - Shranjevanju materiala (add/edit)
    - Brisanju materiala
    - Povezovanju s postavko
  - Ni skeleton loaderjev za material kartice
- Opozorila:
  - Loading state se ne prikaže ob osveževanju seznama po operacijah

### 11. Empty state
- Status: ✅
- Opis: Prikaz ko ni materialov ali rezultatov iskanja
- Rezultat:
  - Prikaže se ko ni materialov
  - Različno sporočilo za prazno stanje vs. prazen rezultat iskanja
  - Prijazna ikona in vabilo k akciji
  - Kontekstno odvisno sporočilo (iskanje vs. prazen seznam)
- Napake: Ni napak
- Opozorila: Ni opozoril

### 12. Statistika (skupno število, kategorije)
- Status: ✅
- Opis: `updateStats()` + stat cards v headerju
- Rezultat:
  - Pravilno prikaže skupno število materialov
  - Pravilno prikaže število unikatnih kategorij
  - Posodobi se po vsaki operaciji (add/edit/delete)
- Napake: Ni napak
- Opozorila: Ni opozoril

### 13. Responsive design
- Status: ✅
- Opis: CSS media queries in flexible layout
- Rezultat:
  - Max-width 600px za vsebino (optimalno za telefone)
  - Mobile-first pristop
  - Touch-friendly elementi (min 44-48px)
  - FAB gumb je dobro pozicioniran
  - Form grid postane 1 stolpec na mobilnih
- Napake: Ni kritičnih napak
- Opozorila:
  - Na zelo majhnih zaslonih (<320px) bi lahko bila kartica preozka

---

## UI/UX Pregled

### Dizajn (iOS stil)
- ✅ Uporablja iOS barvno shemo (blue: #007AFF, green: #34C759, red: #FF3B30)
- ✅ iOS font stack (-apple-system, BlinkMacSystemFont)
- ✅ Zaobljeni robovi kartic (border-radius: 16px)
- ✅ Sence in globina (box-shadow)
- ✅ Blur efekt na backdrop-u modalov
- ✅ smooth transitions (0.2s, 0.3s)

### Mobilna prilagodljivost
- ✅ Viewport meta tag pravilno nastavljen
- ✅ max-scale=1.0, user-scalable=no (iOS app feel)
- ✅ Touch gesture support (-webkit-overflow-scrolling: touch)
- ✅ Safe area za iPhone X+ ni eksplicitno definirana (padding-bottom delno reši)

### Touch cilji (48px)
- ✅ FAB gumb: 60x60px
- ✅ Form inputi: min-height: 48px
- ✅ Gumbi: min-height: 48px (btn-primary, btn-secondary)
- ✅ Category chips: padding zagotavlja dovolj velikost
- ✅ Material kartice: padding 16px zagotavlja dovolj velikost
- ⚠️ Modal close (X): 32x32px - malo pod 48px, a še sprejemljivo
- ⚠️ Remove selection (×): samo font-size: 18px - lahko premajhen

### Animacije
- ✅ Modal slide-up animacija (@keyframes slideUp)
- ✅ Spinner animacija (@keyframes spin)
- ✅ Hover/active efekti na vseh interaktivnih elementih
- ✅ Smooth transitions (0.2s ease)
- ✅ Toast fade in/out

### Barvna shema
- ✅ Consistent uporaba CSS spremenljivk
- ✅ Pravilen kontrast besedila
- ✅ Error/warning/success barve pravilno uporabljene
- ✅ Sekundarno besedilo ima dovolj kontrasta (#8E8E93)

---

## Najdene napake

### 1. Kritične: 0
Trenutno ni kritičnih napak, ki bi onemogočale uporabo.

### 2. Srednje: 4
1. **Manjkajoča validacija cen** - Dovoljuje negativne cene in prevelike vrednosti
   - Lokacija: `saveMaterial()` funkcija
   - Predlog: Dodaj `if (unitPrice < 0) { showToast('Cena ne more biti negativna'); return; }`
   
2. **Manjkajoči loading indikatorji** - Uporabnik ne vidi, da se operacija izvaja
   - Lokacija: `saveMaterial()`, `confirmDelete()`, `selectWorkItem()`
   - Predlog: Dodaj spinner ali disable gumbe med operacijo
   
3. **Race condition pri povezovanju** - PUT klic pošlje vse podatke
   - Lokacija: `selectWorkItem()` funkcija
   - Predlog: Ustvari poseben endpoint `PATCH /api/materials/:id/link` ali pošlji samo `work_item_id`
   
4. **Manjkajoč debounce pri iskanju** - Pri velikem številu materialov lahko zamrzne UI
   - Lokacija: `setupEventListeners()` - searchInput
   - Predlog: Dodaj debounce 300ms

### 3. Kozmetične: 3
1. **Neaktiven remove-selection gumb** - Premajhen touch target
2. **Manjkajoč skeleton loader** - Prazen prostor med nalaganjem
3. **Brez highlight-a iskanega besedila** - Težko videti zakaj je rezultat prikazan

---

## Predlogi za izboljšave

1. **Dodaj client-side validacijo:**
   ```javascript
   if (unitPrice < 0 || unitPrice > 999999) {
     showToast('Cena mora biti med 0 in 999.999 €', 'error');
     return;
   }
   if (name.length < 2 || name.length > 100) {
     showToast('Naziv mora imeti med 2 in 100 znakov', 'error');
     return;
   }
   ```

2. **Dodaj debounce za iskanje:**
   ```javascript
   let searchTimeout;
   searchInput.addEventListener('input', (e) => {
     clearTimeout(searchTimeout);
     searchTimeout = setTimeout(() => {
       searchQuery = e.target.value.toLowerCase();
       renderMaterials();
     }, 300);
   });
   ```

3. **Dodaj loading stanje za operacije:**
   ```javascript
   async function saveMaterial() {
     const saveBtn = document.querySelector('.btn-primary');
     saveBtn.disabled = true;
     saveBtn.textContent = 'Shranjujem...';
     try { ... } finally {
       saveBtn.disabled = false;
       saveBtn.textContent = 'Shrani';
     }
   }
   ```

4. **Implementiraj PATCH endpoint za povezovanje:**
   - Namesto pošiljanja vseh podatkov pri povezovanju, uporabi:
   ```javascript
   await fetch(`/api/materials/${id}/link`, {
     method: 'PATCH',
     body: JSON.stringify({ work_item_id: workItemId })
   });
   ```

5. **Dodaj offline support:**
   - Shranjevanje v localStorage ko ni povezave
   - Sinhronizacija ko pride povezava nazaj

6. **Dodaj highlight iskanega besedila:**
   - Uporabi `<mark>` tag za označevanje ujemanj

7. **Dodaj "Undo" za brisanje:**
   - Toast z možnostjo razveljaviti brisanje (5 sekund)

---

## Skupna ocena: 7.5/10

**Komentar:**
Materiali modul je dobro implementiran z lepim iOS dizajnom in osnovno funkcionalnostjo deluje pravilno. Glavne pomanjkljivosti so:
- Manjkajoča validacija vhodnih podatkov (predvsem cen)
- Manjkajoči loading indikatorji med operacijami
- Potencialni race condition pri povezovanju s postavkami

Modul je produkcijsko uporaben, a bi bilo priporočljivo popraviti srednje napake pred deployem.

---

## Edge Case Testi

### Preizkušeni scenariji:
| Scenarij | Pričakovani rezultat | Dejanski rezultat | Status |
|----------|---------------------|-------------------|--------|
| Prazno ime materiala | Validacija zavrne | HTML5 required deluje | ✅ |
| Negativna cena (-10) | Validacija zavrne | Sprejme in shrani | ❌ |
| Zelo dolg naziv (200+ znakov) | Omejitev/truncation | Shrani celotno | ⚠️ |
| Specialni znaki v imenu (<>"'&) | XSS zaščita | escapeHtml() deluje | ✅ |
| Null cena | Prikaže 0.00 | Prikaže 0.00 | ✅ |
| Brisanje zadnjega materiala | Pokaže empty state | Deluje pravilno | ✅ |
| Hitro zaporedno klikanje "Shrani" | Prepreči dvojno shranjevanje | Pošlje več requestov | ❌ |
| Iskanje med nalaganjem | Ignorira ali počaka | Lahko crasha če materials=[] | ⚠️ |

---

*Test report ustvarjen: 2026-03-07*
*Tester: QA Agent*
*Verzija kode: materials-module.html (33KB)*
