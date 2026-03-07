# UX Review za starejše uporabnike (60+)

## Povzetek

Aplikacija ima dobro osnovo, a potrebuje pomembne prilagoditve za uporabnike 60+, ki niso tehnično podkovani. Glavne težave: premajhni elementi, preveč funkcij naenkrat, tehnična terminologija in nejasen workflow.

---

## Ocena trenutnega stanja

### Glavna navigacija (index.html)
- **Velikost gumbov:** ❌ (24px ikone, 11px tekst - premajhno)
- **Razmik med gumbi:** ❌ (premalo prostora za natančen klik)
- **Berljivost:** ⚠️ (siv tekst na belem je dober, a premajhen)
- **Jasnost:** ✅ (ikone so razumljive)
- **Težavnost:** 4/10

**Problem:** Navigacijski gumbi so premajhni za starejše uporabnike z manj natančnim motoričnim nadzorom.

### Kalkulator
- **Velikost gumbov:** ✅ (min-height: 48px)
- **Velikost teksta:** ✅ (16px osnovno)
- **Kontrast:** ✅ (dober kontrast)
- **Berljivost:** ⚠️ (preveč polj naenkrat, zmeda)
- **Težavnost:** 6/10

**Problemi:**
- Trije različni kalkulatorji zavihki so zmedo
- "Pokrivnost materiala", "Sloji" - tehnični izrazi
- Pretvornik enot (ft²→m²) je nepotreben za večino uporabnikov
- Preveč informacij na enem zaslonu

### Postavke Dela (workitems-module.html)
- **Velikost gumbov:** ❌ (gumbi "Uredi", "Izbriši" so premajhni)
- **Velikost teksta:** ❌ (14px v tabeli je premajhno)
- **Kontrast:** ✅ (dober)
- **Berljivost:** ❌ (tabela je pregosta)
- **Težavnost:** 7/10

**Problemi:**
- "Faktorji težavnosti" - povsem nejasno, kaj to pomeni
- Preveč možnosti za razvrščanje (5 različnih načinov)
- Statistika na vrhu zavzema prostor, ni pa ključna
- Tabela je težko berljiva na majhnih zaslonih

### Materiali
- **Velikost gumbov:** ✅ (FAB 60px je dober)
- **Velikost teksta:** ⚠️ (12-14px za podrobnosti je premajhno)
- **Kontrast:** ✅ (dober)
- **Berljivost:** ✅ (kartice so boljše od tabel)
- **Težavnost:** 4/10

**Problemi:**
- "🔗 Poveži" gumb - nejasno, kaj naredi
- Preveč kategorij za izbiro
- Majhen tekst pod karticami

### Predračuni (quotes-module.html)
- **Velikost gumbov:** ⚠️ (nekateri so premajhni)
- **Velikost teksta:** ❌ (12px v tabelah je premajhno)
- **Kontrast:** ✅
- **Berljivost:** ❌ (preveč polj, zavihkov, možnosti)
- **Težavnost:** 8/10

**Problemi:**
- Najbolj kompleksen modul - preveč za uporabnika 60+
- "DDV (22%)", "Osnova za DDV" - finančni izrazi, ki zmedejo
- 7 različnih statusov predračuna - preveč
- Urejanje v tabeli je nepregledno
- Preveč gumbov na dnu (5 gumbov v vrsti)

---

## Predloge izboljšav

### 1. POVEČAJ VSE ELEMENTE

**Trenutno:**
- Navigacija: 24px ikone, 11px tekst
- Tabele: 14px tekst
- Gumbi: 48px (minimalno)

**Predlagano:**
- Navigacija: 32px ikone, 16px tekst (vsaj)
- Tabele: 18px tekst za starejše
- Gumbi: 56px višina za lažji klik
- Razmik med gumbi: min 12px

**CSS spremembe:**
```css
/* Za senior način */
.senior-mode .nav button {
  font-size: 16px;
  padding: 12px 16px;
}
.senior-mode .nav button svg {
  width: 32px;
  height: 32px;
}
.senior-mode .btn {
  min-height: 56px;
  font-size: 18px;
  padding: 16px 24px;
}
.senior-mode table {
  font-size: 18px;
}
.senior-mode input, .senior-mode select {
  font-size: 18px;
  padding: 16px;
  min-height: 56px;
}
```

### 2. POENOSTAVI WORKFLOW

**Kalkulator:**
- **Odstrani:** Pretvornik enot (ft²→m² itd.)
- **Odstrani:** Podrobne nastavitve pokrivnosti barve
- **Poenostavi:** En sam kalkulator na zaslon, ne treh zavihkov
- **Dodaj:** Večji prikaz rezultata (48px font)

**Predračuni:**
- **Odstrani:** Status "Poteklo" in "Zavrnjeno" (dovolj je: V pripravi, Poslano, Potrjeno)
- **Poenostavi:** Skrij DDV izračun v razširjen pogled (prikaži samo končni znesek)
- **Poenostavi:** En gumb "Shrani" namesto treh različnih
- **Dodaj:** Čarovnik za prvi predračun (korak za korakom)

**Postavke in Materiali:**
- **Odstrani:** "Faktorji težavnosti" (nejasno)
- **Odstrani:** Večina možnosti razvrščanja (pusti samo po imenu in ceni)
- **Dodaj:** Večje kartice namesto goste tabele

### 3. BOLJŠE POIMENOVALJE

**Zamenjaj tehnične izraze:**
| Trenutno | Predlagano |
|----------|------------|
| Pokrivnost | Poraba materiala |
| Faktorji težavnosti | Težavnost dela |
| DDV (22%) | Davek |
| Osnova za DDV | Znesek brez davka |
| Postavke | Vrste del |
| Enota | Merska enota |
| Skupaj površina | Skupaj kvadrati |

### 4. DODAJ NAMIGE IN POJASNILA

**Tooltipi (pojavni okvirji):**
```html
<!-- Primer -->
<div class="form-group">
  <label>
    Cena na enoto
    <span class="help-icon" title="Koliko stane ena enota (npr. 1 ura dela ali 1 kos materiala)">❓</span>
  </label>
</div>
```

**Preprosti opisi:**
- Pod vsakim poljem za vnos dodaj manjši opis v sivi barvi
- Primer: "Vnesite dolžino prostora v metrih (npr. 5.2)"

### 5. ONBOARDING ZA PRVO UPORABO

**Uvodni zaslon (prikazan samo prvič):**
```html
<div class="welcome-modal">
  <h1>Dobrodošli v Moj Predračun! 👋</h1>
  <p>Ta aplikacija vam pomaga pripraviti predračune za vaše stranke.</p>
  
  <div class="tutorial-steps">
    <div class="step">
      <div class="step-number">1</div>
      <p>Najprej vnesite postavke dela in cene</p>
    </div>
    <div class="step">
      <div class="step-number">2</div>
      <p>Dodajte materiale, ki jih uporabljate</p>
    </div>
    <div class="step">
      <div class="step-number">3</div>
      <p>Ustvarite predračun in ga pošljite stranki</p>
    </div>
  </div>
  
  <button class="btn btn-primary btn-large">Začnimo</button>
  <button class="btn btn-secondary">Preskoči</button>
</div>
```

**Namigi ob prvi uporabi:**
- Prikazuj "?" ikone za pomoč pri prvi uporabi
- Ponudi video vodič (2 minuti)

### 6. NAČIN ZA STAREJŠE Uporabnike (Senior Mode)

**Gumb za preklop:**
```html
<button onclick="toggleSeniorMode()" class="senior-mode-toggle">
  👴 Večji zaslon
</button>
```

**Funkcije Senior Mode:**
- Vsi elementi 25% večji
- Samo osnovne funkcije prikazane
- Večji kontrast (črno-belo)
- Daljši čas za potrditev (prepreči nenamerna klikanja)
- Glasovno branje (opcijsko)

---

## Prioritete

### 1. Visoka (naredi takoj)
1. **Povečaj gumbe v navigaciji** - 32px ikone, 16px tekst
2. **Povečaj tekst v tabelah** - minimalno 18px
3. **Poenostavi kalkulator** - odstrani pretvornike, pusti samo osnovni
4. **Zamenjaj nejasne izraze** - "Faktorji težavnosti" → "Težavnost"
5. **Dodaj uvodni zaslon** za prvo uporabo

### 2. Srednja (naredi v naslednjem tednu)
1. **Senior Mode** - preklop za večje elemente
2. **Poenostavi predračune** - manj statusov, skrij DDV
3. **Povečaj vnosna polja** - 56px višina
4. **Dodaj pomoč (tooltips)** za tehnične izraze
5. **Kartice namesto tabel** za postavke

### 3. Nizka (ko bo čas)
1. **Video vodiči** - kratki filmčki za vsako funkcijo
2. **Glasovno branje** - za uporabnike s slabšim vidom
3. **Offline način** - delaj brez povezave
4. **Sinhronizacija** med napravami

---

## Konkretni CSS popravki

### Za takojšnjo izvedbo:

```css
/* 1. NAVIGACIJA - takoj */
.nav button {
  font-size: 16px !important;  /* bilo 11px */
  padding: 12px 16px !important;  /* bilo 8px 12px */
}
.nav button svg {
  width: 32px !important;  /* bilo 24px */
  height: 32px !important;
  margin-bottom: 6px;
}

/* 2. GUMBI - takoj */
.btn {
  min-height: 56px !important;  /* bilo 48px */
  font-size: 18px !important;  /* bilo 16px */
  padding: 16px 24px !important;  /* bilo 12px 20px */
}

/* 3. TEKST - takoj */
body, input, select, textarea {
  font-size: 18px !important;  /* bilo 16px */
}

/* 4. TABELE - takoj */
table {
  font-size: 18px !important;  /* bilo 14px */
}
th, td {
  padding: 16px !important;  /* bilo 12px */
}

/* 5. VNOSNA POLJA - takoj */
input, select {
  min-height: 56px !important;  /* bilo 48px */
  font-size: 18px !important;
  padding: 16px !important;  /* bilo 12px */
}
```

---

## Sklep

Aplikacija je funkcionalno dobra, a za starejše uporabnike (60+) potrebuje:
1. **Večje elemente** (najpomembneje!)
2. **Manj funkcij naenkrat** (poenostavitev)
3. **Boljša poimenovanja** (brez tehničnih izrazov)
4. **Uvoden vodič** (za prvo uporabo)

**Ocena trenutne primernosti za 60+:** 4/10
**Ocena po izvedbi predlog:** 8/10

Najpomembnejša sprememba je **povečanje vseh elementov za 25-30%** - to takoj naredi aplikacijo veliko bolj uporabno za starejše.
