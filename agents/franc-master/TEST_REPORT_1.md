# 👷 FRANC — TEST REPORT #1
## Datum: Petek, 6. marec 2026
## Lokacija: Kopalnica na Viču, Ljubljana
## Čas: 14:30-15:15
## Telefon: Samsung Galaxy A12 (4 leta star)
## Pogoji: Sonce, rokavice, stranka čaka

---

## 🎯 SCENARIJ 1: Nov predračun za kopalnico

### Naloga:
Naredi predračun za 6m² kopalnico (keramika, elektrika, sanitarije)

### Koraki in opažanja:

#### 1. Odpiranje aplikacije ⭐⭐⭐
**Čas:** 5 sekund ✅
- [x] Odprl sem Chrome
- [x] Vtipkal moj-predracun.onrender.com
- [x] Stran se je naložila

**Težave:**
- [ ] **SPLASH SCREEN** — modra točka se vrti 8 sekund preden se pokaže vsebina
  - "Mislil sem, da se je zmrznilo"
- [ ] **NAPIS JE PREMAJHEN** — "Moj Predračun" je tako majhen, da sem moral pogledati 2x

**Predlog:**
- Naredi splash screen krajši (max 2 sekundi)
- Večji napis na začetku

---

#### 2. Ustvarjanje novega predračuna ⭐⭐
**Čas:** 45 sekund 🟡

**Kliknil:** "📋 Hitri predračuni" ✅ (jasan gumb, dobro viden)

**Odprlo se je okno s predlogami:**
- [x] Videl sem "🛁 Kopalnica - standard"
- [x] Kliknil nanj

**Težave:**
- [ ] **PREPOČASNO** — Od klikanja do odprtja predračuna je minilo 12 sekund!
  - Stranka je čakala in gledala
  - "Sramota, ko stranka čaka"
  
- [ ] **NE JASNO KAJ SE DOGAJA** — Medtem ko se je nalagalo, ni bilo nobenega "Nalagam..."
  - Nisem vedel, ali je klik uspel

**Predlog:**
- Dodaj loading indicator ("Ustvarjam predračun...")
- Pospeši proces (max 3 sekunde)

---

#### 3. Prilagajanje predloge ⭐⭐⭐
**Čas:** 3 minute 20 sekund 🔴 NAD CILJEM

**Ime projekta:** "Kopalnica Novak" ✅ (jasan input)

**Težave pri KOLIČINAH:**

**Problem #1 — Nisem našel kje spremeniti:**
- [ ] Gledal sem seznam postavk, nisem videl, da lahko kliknem nanje
- [ ] Mislil sem, da je treba vse zbrisati in na novo napisati
- [ ] Po 2 minutah sem slučajno kliknil na "25 m²" in se je odprlo urejanje!

**Problem #2 — Premalejši input polja:**
- [ ] Številke so bile majhne (14px)
- [ ] S prstom sem težko zadel v polje
- [ ] Ko sem hotel spremeniti 25 v 18, sem moral:
  1. Klikniti 3x da se izbere besedilo
  2. Potipati natančno
  3. Včasih sem zgrešil in kliknil ven

**Problem #3 — Ni jasno, da se je shranilo:**
- [ ] Spremenil sem količino iz 25 na 18
- [ ] Kliknil ven
- [ ] Nisem bil prepričan, ali je ostalo 18 ali se je vrnil na 25
  - Šele ko sem videl skupni znesek sem bil prepričan

**Število napak:**
- 3x sem zgrešil input polje
- 1x sem pomotoma kliknil "Izbriši" namesto v polje (srečna naključnost, da sem prebral "Ali res želiš izbrisati?")

**Predlogi:**
- **Naredi celotno vrstiko klikabilno** (ne samo številk)
- **Povečaj input polja** na min 40px višine
- **Dodaj jasno potrdilo** — zeleni checkmark ali "Shranjeno"
- **Dodaj "Uredi" gumb** namesto skritega klika

---

#### 4. Fotografije ⭐
**Čas:** Ni uspelo (obupal po 2 minutah) 🔴 FAIL

**Poskusil:**
1. Kliknil "📸 Fotografije"
2. Odprlo se je okno
3. Kliknil "🏠 Pred" (za sliko pred delom)
4. Kliknil na območje za nalaganje

**Težave:**

**Problem #1 — Ni se odprla kamera:**
- [ ] Odprla se je GALERIJA namesto kamere!
- [ ] Hotel sem slikati stanje, ne izbrati staro sliko
- [ ] Nisem našel opcije "Odpri kamero"

**Problem #2 — Zapleteno:**
- [ ] Preveč možnosti (Pred/Med/Po/Drugo)
- [ ] Nisem vedel, ali moram najprej izbrati tip, potem slikati ali obratno
- [ ] Opis je bil opcijski — nisem vedel, ali je obvezen

**Obupal:**
- "Rekel sem stranki 'Bom slikal kasneje'"
- Zaprl okno in šel naprej

**Predlogi:**
- **PRVI gumb naj bo "📷 Slikaj"** — direktno kamera
- **Drugi gumb: "🖼️ Iz galerije"** — ločeno
- **Avtomatsko označi kot "Pred"** če je prva slika
- **Najprej slikaj, potem vprašaj za opis**

---

#### 5. Shranjevanje in PDF ⭐⭐⭐⭐
**Čas:** 15 sekund ✅

**Kliknil:** "💾 Shrani predračun" ✅
- Takoj feedback: "Predračun shranjen" (zelen banner) ✅

**Kliknil:** "📄 PREDRAČUN ZA STRANKO" ✅
- PDF se je odprl v novem zavihku ✅
- Izgleda profesionalno ✅

**Težave:**
- [ ] **PDF se nalaga 6 sekund** (prepočasi!)
  - Stranka čaka
  - "Zdi se mi, da se je zmrznilo"

**Predlog:**
- Hitrejše generiranje PDF (cilj: < 2 sekundi)
- Dodaj "Generiram PDF..." obvestilo

---

### 📊 SKUPAJ ZA SCENARIJ 1:

| Metrika | Cilj | Dejansko | Status |
|---------|------|----------|--------|
| Čas | < 2 min | 6 min 15s | 🔴 FAIL |
| Klikov | < 10 | 23 | 🔴 FAIL |
| Napak | 0 | 4 | 🔴 FAIL |
| Uspešnost | 100% | 70% | 🟡 OK |

**Francova ocena:** ⭐⭐ (2/5)
"Deluje, ampak me jezijo majhni gumbi in počasnost"

---

## 🎯 SCENARIJ 2: Iskanje starega predračuna

### Naloga:
Najdi predračun od januarja za "Gospo Novak"

### Koraki:

#### 1. Seznam predračunov ⭐⭐⭐
**Kliknil:** "Predračuni" v meniju ✅

**Dobro:**
- [x] Videl sem seznam
- [x] Statusi so barvni (zelena, oranžna)
- [x] Cene so vidne

**Težave:**

**Problem #1 — Ni iskalnika:**
- [ ] moral sem skrolati DOL (15 predračunov)
- [ ] Nisem našel "Novak" takoj
- [ ] Prebral sem vsakega posebej

**Problem #2 — Ni datuma:**
- [ ] Namesto "6. januar 2026" piše "6. jan"
- [ ] Nisem bil prepričan, ali je to januar ali junij

**Našel po:** 45 sekundah iskanja 🟡

**Predlogi:**
- **Dodaj iskalno polje** na vrhu (najpomembnejše!)
- **Prikaži poln datum** (6. 1. 2026)
- **Filtriraj po mesecih** (gumbi: Jan | Feb | Mar...)

---

### 📊 SKUPAJ ZA SCENARIJ 2:

| Metrika | Cilj | Dejansko | Status |
|---------|------|----------|--------|
| Čas | < 30s | 45s | 🔴 FAIL |
| Napori | Enostavno | Skrolanje | 🔴 FAIL |

**Francova ocena:** ⭐⭐⭐ (3/5)
"Našel sem, ampak je trajalo predolgo"

---

## 🎯 SCENARIJ 3: Brez interneta (Offline)

### Naloga:
Naredi predračun brez signala

### Rezultat: ⭐ FAIL ❌

**Test:**
1. Izklopil sem WiFi in mobilne podatke
2. Osvežil stran
3. **Aplikacija ni delovala!** 🔴

**Napaka:**
- Bela stran
- "No internet connection"

**Francova reakcija:**
> "To je velik problem. Jaz sem na terenu 80% časa. 
> V kletnih kopalnicah ni signala. Če aplikacija ne dela brez neta, 
> jo ne morem uporabljati."

**Predlog:**
- **PWA offline mode** — nujno potrebno!
- Shranjevanje v lokalno bazo
- Sync ko prideš nazaj online

---

## 📋 SKUPNA OCENA

### Kaj je DOBRO: ✅
1. Koncept je odličen (hitri predračuni)
2. PDF izgleda profesionalno
3. Cene se avtomatsko računajo
4. Barvni statusi so jasni

### Kaj je SLABO: ❌
1. **Prepočasno** — stranka čaka
2. **Majhni elementi** — težko zadeneš s prstom
3. **Ni offline** — ne deluje na terenu
4. **Ni iskalnika** — težko najdeš stare predračune
5. **Fotografije so zapletene** — ne delujejo intuitivno

### Kritične napake (MORAJO BITI POPRAVLJENE):
🔴 **#1: Offline mode** — brez tega je aplikacija neuporabna na terenu
🔴 **#2: Velikost elementov** — 60-letnik ne more natančno klikniti
🔴 **#3: Iskalnik** — brez tega je iskanje predolgo

### POMEMBNO (popravi če je čas):
🟡 **#4: Hitrost PDF** — 6 sekund je predolgo
🟡 **#5: Loading indikatorji** — nikoli ne veš, ali se nekaj dogaja
🟡 **#6: Enostavnejše fotografije** — direktno kamera

---

## 🗣️ FRANCOV KONČNI KOMENTAR:

> "Aplikacija je super ideja in ko enkrat narediš predračun, 
> je zelo lep PDF. Ampak je pretežko za uporabo na terenu. 
> Mojster nima časa čakat 10 sekund da se nekaj naloži. 
> 
> **Moja priporočila:**
> 1. Naredi vse BOLJ VELIKO
> 2. Naredi hitrejše
> 3. Daj delati brez interneta
> 4. Dodaj iskalnik
> 
> Če popravite to, bom z veseljem uporabljal vsak dan."

---

## ✅ ALI BI UPORABLJAL?

**Trenutno:** ❌ **NE** (pretežko, prepočasno)

**Če popravijo:** ✅ **DA** (super orodje)

---

## 📅 NASLEDNJI TEST

**Predlagam:** Po popravkih Sprinta 4
**Lokacija:** Druga kopalnica (drugi pogoji)
**Trajanje:** Ponovno 30 minut

**Pričakovanja za naslednjič:**
- [ ] Vse dela brez interneta
- [ ] Vsi elementi so dovolj veliki
- [ ] Najdem predračun v < 10 sekundah
- [ ] Slikam v < 30 sekundah

---

**Podpis:** Franc K., gradbenik, 62 let
**Test opravljen:** 6. 3. 2026
**Čas testiranja:** 45 minut
**Število narejenih predračunov:** 1 (uspešno, ampak počasi)
