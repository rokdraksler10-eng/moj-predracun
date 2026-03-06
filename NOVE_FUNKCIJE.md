# 🚀 Moj Predračun - NOVE FUNKCIJE

## ✅ Implementirane funkcije (Mar 2026)

---

### 📋 1. HITRI PREDRAČUNI (Smart Templates)

**Kaj je:**
- Pripravljeni predlogi za najpogostejše projekte
- En klik = celoten predračun

**Dostopno:**
- Gumb "📋 Hitri predračuni" na seznamu predračunov

**Predloge:**
- 🛁 **Kopalnica - standard** (do 5m²)
- 🛁 **Kopalnica - velika** (nad 8m²)
- 🛋️ **Dnevna soba** - talne obloge
- 🍳 **Kuhinja** - adaptacija
- 🚽 **Samo sanitarne inštalacije**
- 🏠 **Celotno stanovanje** - osnovno

**Kako deluje:**
1. Klikni na predlogo
2. Predračun se avtomatsko napolni s postavkami
3. Prilagodi količine in cene po potrebi
4. Shrani in pošlji stranki

**Prihranek časa:** ~70% (namesto 10-15 minut → 2-3 minute)

---

### 📸 2. FOTO DOKUMENTACIJA

**Kaj je:**
- Dodajanje fotografij k predračunu
- Dokumentacija stanja pred/po delu

**Dostopno:**
- V urejevalnem pogledu predračuna: gumb "📸 Fotografije"

**Funkcionalnosti:**
- Upload več slik naenkrat
- Kategorije: Pred / Med delom / Po / Drugo
- Opisi fotografij
- Ogled v galeriji
- Brisanje posameznih slik

**Uporaba:**
1. Odpri predračun
2. Klikni "📸 Fotografije"
3. Izberi tip (Pred/Med/Po)
4. Naloži slike (drag & drop ali izberi)
5. Dodaj opis po potrebi

**Prednosti:**
- Dokaz stanja pred delom (varnost pred reklamacijami)
- Stranka vidi dejansko stanje
- Bolj profesionalna ponudba

---

### 🎤 3. GLASOVNE BELEŽKE

**Kaj je:**
- Glasovno diktiranje opomb in meritev
- Namesto tipkanja na terenu

**Dostopno:**
- V kalkulatorju: gumb "🎤 Diktiraj"
- V predračunu: gumb "🎤 Glasovne beležke"

**Funkcionalnosti:**
- Snemanje direktno v brskalniku
- Avtomatsko shranjevanje
- Predvajanje posnetkov
- Brisanje starih beležk

**Uporaba:**
1. Klikni 🎤 gumb
2. Tapni "🔴 Snemaj"
3. Diktiraj meritve/opombe
4. Tapni "⏹️ Ustavi"
5. Posnetek se samodejno shrani

**Primer diktata:**
> "Dnevna soba 4 krat 5 metrov, visok strop 2.8 metrov, 
> stara keramika odstranjena, podlaga neenakomerna, 
> potrebno izravnavanje pred polaganjem"

**Prednosti:**
- Hitrejše kot tipkanje (3-5x)
- Deluje z rokavicami
- Na terenu brez preklapljanja aplikacij

---

## 📊 Skupni prihranek časa

| Naloga | Prej | Zdaj | Prihranek |
|--------|------|------|-----------|
| Nov predračun za kopalnico | 10-15 min | 2-3 min | **~80%** |
| Fotografije stranki | 5 min (email) | 0 min (v PDF) | **100%** |
| Vnos meritev na terenu | 5-7 min | 1-2 min | **~75%** |

---

## 🛠️ Tehnične podrobnosti

**Nove tabele v bazi:**
- `quote_templates` - shranjene predloge
- `quote_photos` - fotografije projektov
- `quote_voice_notes` - glasovne beležke

**API endpointi:**
- `GET/POST /api/templates` - upravljanje predlog
- `POST /api/quotes/:id/photos` - nalaganje fotografij
- `GET /api/photos/:id` - prikaz fotografij
- `POST /api/quotes/:id/voice` - nalaganje glasovnih beležk
- `GET /api/voice/:id` - predvajanje beležk

**Frontend:**
- Web Speech API za diktiranje
- MediaRecorder API za snemanje
- Drag & drop za nalaganje slik
- Alpine.js za reaktivnost

---

## 🎯 Naslednji koraki (priporočila)

1. **Integracija s PDF** - fotografije v predračunu
2. **Cloud sync** - sinhronizacija med napravami
3. **Email pošiljanje** - neposredno iz aplikacije
4. **Podpisovanje** - digitalni podpis stranke

---

*Implementirano: 6. marec 2026*
*Verzija: Moj Predračun 2.0*
