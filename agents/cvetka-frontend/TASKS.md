# 💻 CVETKA — Naloge Sprint 4
## Frontend Agent | Prioriteta: KRITIČNO

---

## 🔴 NALOGA #1: Povečaj vse elemente
**Rok: Torek, 11. marec 2026**
**Status: 🟡 V TEKU**
**Časovna ocena: 12 ur**

### Opis:
Franc je 3x zgrešil input polje ker so premajhna (14px).

### Spremembe v styles.css:

```css
/* ============================================
   GLOBALNE SPREMEMBE VELIKOSTI
   ============================================ */

/* Vsi interaktivni elementi min 48px */
button, 
input, 
select, 
textarea,
.btn-primary,
.btn-secondary,
.btn-edit,
.btn-delete,
.btn-duplicate {
  min-height: 48px !important;
  min-width: 48px !important;
}

/* Input polja */
input[type="text"],
input[type="number"],
input[type="email"],
select,
textarea {
  height: 48px;
  padding: 12px 16px;
  font-size: 16px !important; /* Prepreči zoom na iPhone */
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

/* Gumbi */
.btn-primary,
.btn-secondary {
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

/* Razmiki */
.form-group {
  margin-bottom: 20px;
}

.nav-links button {
  padding: 12px 16px;
  min-height: 48px;
}

/* Quote cards */
.quote-card-simple {
  padding: 16px;
  min-height: 80px;
}

/* Item rows v predračunu */
.item-row-editable {
  padding: 16px;
  min-height: 100px;
}

.item-row-editable input,
.item-row-editable select {
  height: 44px;
  font-size: 16px;
  padding: 10px 12px;
}

/* Template cards */
.template-card {
  padding: 20px;
}

.template-card button {
  min-height: 48px;
  padding: 12px 20px;
}

/* Modal buttons */
.modal-footer button {
  min-height: 48px;
  padding: 12px 24px;
  font-size: 16px;
}

/* Photo upload */
.photo-upload-area {
  min-height: 120px;
  padding: 24px;
}

/* Voice recorder */
.btn-record {
  width: 80px;
  height: 80px;
}

/* Toast notifications */
.toast {
  padding: 16px 24px;
  font-size: 16px;
  min-height: 56px;
}

/* Search bar */
.search-bar input {
  height: 52px;
  font-size: 16px;
  padding: 14px 20px;
}
```

### Testiraj na:
- [ ] Samsung Galaxy A12 (Francov telefon)
- [ ] iPhone SE (5" zaslon)
- [ ] Chrome DevTools (device toolbar)

### Acceptance Criteria:
- [ ] Vsi interaktivni elementi min 48px
- [ ] Font size min 16px (prepreči iPhone zoom)
- [ ] Razmiki med elementi min 16px
- [ ] Dostikljivo s prstom (ne samo z miško)
- [ ] Ana potrdi dostopnost

---

## 🔴 NALOGA #2: Iskalnik za predračune
**Rok: Četrtek, 13. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 8 ur**

### Francov problem:
> "Moral sem skrolati čez 15 predračunov. 45 sekund iskanja."

### Implementacija:

#### 1. HTML v index.html
```html
<!-- Na vrhu strani s predračuni -->
<div class="search-section" style="margin-bottom: 20px;">
  
  <!-- Iskalno polje -->
  <div class="search-bar-large" style="margin-bottom: 16px;">
    <i data-feather="search" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%);"></i>
    <input 
      type="text" 
      x-model="searchQuery" 
      @input="searchQuotes()"
      placeholder="Išči po stranki ali projektu..."
      style="width: 100%; padding-left: 48px; height: 52px; font-size: 16px;"
    >
    <button 
      x-show="searchQuery" 
      @click="searchQuery = ''; searchQuotes()"
      style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer;"
    >
      ✕
    </button>
  </div>

  <!-- Filtri po mesecih -->
  <div class="month-filters" style="display: flex; gap: 8px; flex-wrap: wrap;">
    <button 
      @click="monthFilter = ''" 
      :class="{ active: monthFilter === '' }"
      style="padding: 10px 16px; border-radius: 20px; border: 2px solid #e2e8f0; background: white; cursor: pointer;"
    >
      Vsi
    </button>
    <button 
      @click="monthFilter = '2026-01'" 
      :class="{ active: monthFilter === '2026-01' }"
      style="padding: 10px 16px; border-radius: 20px; border: 2px solid #e2e8f0; background: white; cursor: pointer;"
    >
      Jan 2026
    </button>
    <button 
      @click="monthFilter = '2026-02'" 
      :class="{ active: monthFilter === '2026-02' }"
      style="padding: 10px 16px; border-radius: 20px; border: 2px solid #e2e8f0; background: white; cursor: pointer;"
    >
      Feb 2026
    </button>
    <button 
      @click="monthFilter = '2026-03'" 
      :class="{ active: monthFilter === '2026-03' }"
      style="padding: 10px 16px; border-radius: 20px; border: 2px solid #e2e8f0; background: white; cursor: pointer;"
    >
      Mar 2026
    </button>
  </div>

  <!-- Rezultati -->
  <p x-show="searchQuery" style="margin-top: 12px; color: #64748b;">
    Najdeno: <span x-text="filteredQuotes.length"></span> predračunov
  </p>
</div>
```

#### 2. JavaScript v app.js
```javascript
// State
searchQuery: '',
monthFilter: '',

// Search function
async searchQuotes() {
  if (!this.searchQuery && !this.monthFilter) {
    this.filteredQuotes = this.quotes;
    return;
  }
  
  try {
    const params = new URLSearchParams();
    if (this.searchQuery) params.append('q', this.searchQuery);
    if (this.monthFilter) {
      const [year, month] = this.monthFilter.split('-');
      params.append('year', year);
      params.append('month', month);
    }
    
    const res = await fetch(`/api/quotes/search?${params}`);
    this.filteredQuotes = await res.json();
  } catch (error) {
    // Fallback: client-side search
    this.filteredQuotes = this.quotes.filter(q => {
      const matchQuery = !this.searchQuery || 
        (q.project_name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (q.client_name || '').toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchMonth = !this.monthFilter || 
        q.created_at.startsWith(this.monthFilter);
      
      return matchQuery && matchMonth;
    });
  }
}
```

### Acceptance Criteria:
- [ ] Iskalno polje na vrhu seznama
- [ ] Išče v realnem času
- [ ] Filtri po mesecih (gumbi)
- [ ] Rezultati se prikažejo takoj
- [ ] Najdi predračun v < 10 sekundah
- [ ] Deluje tudi če backend ni dostopen

---

## 🟡 NALOGA #3: Loading indikatorji
**Rok: Sreda, 12. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 4 ure**

### Francov problem:
> "Od klikanja do odprtja predračuna je minilo 12 sekund! Nisem vedel, ali je klik uspel."

### Implementacija:

```html
<!-- Globalni loading overlay -->
<div x-show="loading" class="loading-overlay" style="
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
">
  <div class="spinner" style="
    width: 60px;
    height: 60px;
    border: 4px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  "></div>
  <p x-text="loadingMessage" style="
    margin-top: 20px;
    font-size: 18px;
    color: #1e293b;
    font-weight: 500;
  "></p>
</div>

<style>
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

```javascript
// State
loading: false,
loadingMessage: '',

// Helper functions
showLoading(message = 'Nalagam...') {
  this.loading = true;
  this.loadingMessage = message;
},

hideLoading() {
  this.loading = false;
  this.loadingMessage = '';
},

// Uporabi pri:
async useTemplate(template) {
  this.showLoading('Ustvarjam predračun...');
  // ... koda ...
  this.hideLoading();
},

async saveQuote() {
  this.showLoading('Shranjujem...');
  // ... koda ...
  this.hideLoading();
},

previewPDF(type) {
  this.showLoading('Generiram PDF...');
  setTimeout(() => {
    this.hideLoading();
  }, 1000); // Skrij po 1s, PDF se odpre v novi tabi
}
```

### Sporočila:
- "Ustvarjam predračun..."
- "Shranjujem..."
- "Generiram PDF..."
- "Nalagam..."
- "Sinhroniziram..."

### Acceptance Criteria:
- [ ] Vsaka operacija > 500ms ima indikator
- [ ] Jasno sporočilo kaj se dogaja
- [ ] Blokiraj dvojne klika med loadingom
- [ ] Loading se skrije po koncu ali napaki

---

## 🟡 NALOGA #4: Enostavnejše fotografije
**Rok: Petek, 14. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 6 ur**

### Francov problem:
> "Odprla se je GALERIJA namesto kamere! Obupal po 2 minutah."

### Spremembe:

```html
<!-- Enostavnejši upload -->
<div class="photo-simple-upload">
  
  <!-- Dva jasna gumba -->
  <div style="display: flex; gap: 16px; margin-bottom: 20px;">
    <button 
      @click="$refs.cameraInput.click()"
      style="
        flex: 1;
        padding: 20px;
        background: #dbeafe;
        border: 2px solid #2563eb;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 600;
        color: #2563eb;
        cursor: pointer;
      "
    >
      📷 Slikaj s kamero
    </button>
    
    <button 
      @click="$refs.galleryInput.click()"
      style="
        flex: 1;
        padding: 20px;
        background: #f1f5f9;
        border: 2px solid #94a3b8;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 600;
        color: #64748b;
        cursor: pointer;
      "
    >
      🖼️ Izberi iz galerije
    </button>
  </div>
  
  <!-- Skriti inputi -->
  <input 
    type="file" 
    x-ref="cameraInput"
    accept="image/*" 
    capture="environment"
    @change="handlePhotoSelect($event, 'auto')"
    style="display: none;"
  >
  
  <input 
    type="file" 
    x-ref="galleryInput"
    accept="image/*"
    @change="handlePhotoSelect($event, 'auto')"
    style="display: none;"
  >
  
  <!-- Avtomatska kategorija -->
  <p style="color: #64748b; font-size: 14px; text-align: center;">
    Prva slika bo označena kot "Pred", naslednje kot "Med delom"
  </p>
</div>
```

```javascript
// Avtomatsko določi kategorijo
handlePhotoSelect(event, type) {
  const files = event.target.files;
  if (!files.length) return;
  
  // Avtomatsko določi tip
  let photoType = 'other';
  if (this.quotePhotos.length === 0) {
    photoType = 'before'; // Prva slika = Pred
  } else if (this.quotePhotos.some(p => p.photo_type === 'before')) {
    photoType = 'during'; // Druga slika = Med delom
  }
  
  for (const file of files) {
    this.uploadPhoto(file, photoType);
  }
}
```

### Acceptance Criteria:
- [ ] Gumb "📷 Slikaj" direktno odpre kamero
- [ ] Gumb "🖼️ Iz galerije" odpre galerijo
- [ ] Ni potrebe po izbiri kategorije pred slikanjem
- [ ] Avtomatsko označi prvo sliko kot "Pred"
- [ ] Slikaj v < 30 sekundah
- [ ] Po slikanju vprašaj za opis (opcijsko)

---

## 🟡 NALOGA #5: Potrditvena sporočila (Toast)
**Rok: Torek, 11. marec 2026**
**Status: ⚪ ŠE NI ZAČETO**
**Časovna ocena: 3 ure**

### Francov problem:
> "Spremenil sem količino iz 25 na 18. Nisem bil prepričan, ali je ostalo 18."

### Implementacija:

```javascript
// Toast notification system
showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === 'success') {
    toast.style.background = '#10b981';
    toast.style.color = 'white';
  } else if (type === 'error') {
    toast.style.background = '#ef4444';
    toast.style.color = 'white';
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Uporabi povsod:
showToast('✅ Shranjeno');
showToast('✅ Predračun ustvarjen');
showToast('✅ Slika dodana');
showToast('🗑️ Izbrisano');
showToast('❌ Napaka pri shranjevanju', 'error');
```

### Acceptance Criteria:
- [ ] Jasna potrditev po vsaki akciji
- [ ] Samodejno izgine po 3 sekundah
- [ ] Zelena za uspeh, rdeča za napako
- [ ] Dovolj veliko da se vidi (min 16px)

---

## 📋 Dnevni Report:

```markdown
## Cvetka — [Datum]

### Včeraj:
- [x] Povečala input polja na 48px
- [ ] Še delam na gumbih

### Danes:
- [ ] Dokončam velikosti
- [ ] Začnem iskalnik

### Težave:
- Na iPhone SE se navbar prelomi v 2 vrstici
  → Rešitev: Zmanjšaj padding na manjših zaslonih

### Blokira me:
- [ ] Nihče
- [x] Potrebujem Davidov /api/quotes/search endpoint

### Potrebujem od Roka:
- Odločitev: Ali naj iskalnik deluje tudi offline (client-side)?

### Jutri:
- Dokončam iskalnik
- Začnem loading indikatorje
```

---

**Cvetka, začni z Nalogo #1 (Velikosti)! 🚀**
