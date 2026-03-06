# 📅 PRIMER: POVPREČEN DAN (Part-time)
## Sreda, 12. marec 2026 — David dela na Offline Mode

---

## 🌅 JUTRO (06:00 - 07:00)

### 06:00 - Budilka zvoni
Rok vstane, skuha kavo, odpre prenosnik.

### 06:15 - Pregled stanja (15 min)
**Prebere GitHub notifikacije:**
```
🔔 Cvetka je pushala: "Povečala input polja na 48px"
🔔 Eva je komentirala: "Našla 2 buga v iskalniku"
🔔 David ni še nič pushal (offline mode)
```

**Prebere agentove reporte:**
- Ana: "Preverila velikosti, 3 elementi še premajhni"
- David: "Še delam na Service Workerju, težave s Safari"
- Eva: "Našla varnostno luknjo v file upload"

### 06:30 - Planiranje dneva (30 min)

**Rok napiše v Discord #general:**
```
@everyone Dnevni plan — Sreda 12.3.

@david — Dokončaj offline mode (ROK: Danes!)
  - Safari fix je prioriteta
  - Javi če rabiš pomoč

@cvetka — Nadaljuj z iskalnikom
  - Popravi buga, ki ju je našla Eva
  - Testiraj na iPhone SE

@eva — Preglej Davidove commite
  - Varnostni audit offline mode

@ana — Dokončaj pregled velikosti
  - Seznam premajhnih elementov

@bojan — Začni meritve po popravkih

@franc — Počivaj, testiraš v petek 🎯

Jutri ob 9:00 standup!
```

### 07:00 - Služba
Rok gre v službo (ali dela druge stvari).

---

## 🌞 POPOLDNE (17:00 - 19:00)

### 17:00 - Prihod domov
Rok se preobleče, pogleda pošto.

### 17:05 - Quick check (5 min)
**Pregleda, če je kaj urgentnega:**
- Discord: 3 nova sporočila
- GitHub: 1 nov commit od Cvetke
- Email: Ni urgentnega

### 17:15 - Standup meeting (15 min)
**Video klic z Cvetko in Davidom:**

**David:**
> "Offline mode dela na Chrome, ampak Safari noče shraniti v IndexedDB. 
> Raziskujem alternative. Potrebujem še 1 dan."

**Cvetka:**
> "Iskalnik dela, ampak Eva je našla da išče samo po celotnih besedah, 
> ne po delih. Popravljam to."

**Rok odloči:**
> "David: Uporabi localStorage za Safari (fallback). 
> Cvetka: DODAJ partial search (LIKE %query%).
> Oba: Commitajta do 21:00, Eva pregleda zvečer."

### 17:30 - Razvoj (1 ura)

**Rok dela NAJTEŽJO nalogo dneva:**

Danes popravlja **PDF optimizacijo** (ker David ne more, dela na Safari fixu).

```javascript
// pdf-generator.js — pred optimizacijo
doc.image(logo, 50, 50); // 6 sekund

// pdf-generator.js — PO optimizaciji
doc.image(logo, 50, 50, { 
  width: 100,
  compression: 'jpeg',
  quality: 0.7 
}); // 1.5 sekunde
```

**Testira:**
```bash
npm start
# Odpre browser
# Generira PDF
# Meri čas: 1.4 sekunde ✅
```

### 18:30 - Code review (30 min)

**Pregleda Cvetkin commit:**
```bash
git diff HEAD~1
```

**Najde:**
- ✅ Input polja so res 48px
- ✅ Font size 16px
- ⚠️ Ima napako: Iskalnik ne dela s šumniki

**Komentira na GitHub:**
```
@cvetka Skoraj OK! 
Ampak iskalnik ne najde "kopalnica" če vpišem "kopališče" (ž vs š).

Dodaj: .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")

Fixaj pa approvam! 👍
```

---

## 🌙 VEČER (21:00 - 22:00)

### 21:00 - Testiranje (30 min)

**Rok testira na telefonu (Samsung A12):**

1. **Odpre aplikacijo:** ✅ Dela
2. **Klikne "Nov predračun":** ✅ Dela
3. **Doda postavko:** ✅ Dela, ampak počasi (4s)
   - Zapiše v notes: "Dodaj loading indikator"
4. **Generira PDF:** ✅ Hitro! (1.4s) — Davidova optimizacija dela
5. **Preveri velikosti:** ✅ Vsi elementi so dovolj veliki

**Najde 1 nov bug:**
- Če hitro dvakrat klikneš "Shrani", naredi 2 predračuna
- Zapiše v GitHub Issues

### 21:30 - Dokumentacija (30 min)

**Posodobi Sprint board:**
```markdown
## SPRINT 4 — Napredek

### ✅ Končano danes:
- [x] PDF optimizacija (1.4s, cilj dosežen!)
- [x] Review Cvetkinega iskalnika
- [x] Daily standup

### 🟡 V delu:
- [ ] David: Safari offline fix (80%)
- [ ] Cvetka: Iskalnik partial search (60%)

### 🔴 Blokirano:
- [ ] Ni blokirano nič

### 📊 Metrike:
- PDF hitrost: 6s → 1.4s (🎯 cilj < 2s ✅)
- Elementi: 80% preverjenih
- Bugi najdeni: 3 (vsi popravljivi)
```

**Načrt za jutri:**
- 06:00: Pregled Cvetkinih popravkov
- 17:00: Final review pred Eva-jevim pregledom
- 21:00: Testiranje iskalnika

### 22:00 - Konec delavnika

Rok zapre prenosnik, gleda TV z družino.

---

## 📊 Povzetek dneva:

| Aktivnost | Čas | Vrednost |
|-----------|-----|----------|
| Pregled & planiranje | 45 min | 🟡 Organizacija |
| Standup meeting | 15 min | 🟡 Sinhronizacija |
| Razvoj (PDF) | 1 ura | 🟢 KLJUČNO |
| Code review | 30 min | 🟢 Kakovost |
| Testiranje | 30 min | 🟢 Validacija |
| Dokumentacija | 30 min | 🟡 Administracija |
| **SKUPAJ** | **3.5 ure** | ** Produktivno** |

---

## 🎯 Kaj je bilo doseženo?

✅ **PDF je zdaj HITER** (6s → 1.4s)
✅ **Cvetka ve kaj popraviti**
✅ **David dobil rešitev za Safari**
✅ **3 novi bug-i najdeni (preden pridejo do Franca)**

---

## ❌ Kaj ni bilo idealno?

⚠️ David ni dokončal offline mode (potrebuje še 1 dan)
⚠️ Cvetka mora še popraviti iskalnik
⚠️ Rok je našel še en bug (dvojni klik)

---

## 💡 Nauki za jutri:

1. **Dvojni klik problem** — dodaj "disabled" state na gumbe
2. **David potrebuje več časa** — premakni rok za 1 dan
3. **Testiranje na telefonu je ključno** — večkrat preverjaj

---

## 🚀 Jutrišnji cilj:

**Sprint 4 je 80% končan!**
- David dokonča offline mode
- Cvetka fixa iskalnik
- Eva pregleda vse
- Priprava za petkovo testiranje z Francem

---

**To je realističen dan.** 

Ni pretirano napet, ni preveč stresen, ampak je **konzistenten napredek**.

**Takih dni potrebujemo ~60 do production ready.** 🎯
