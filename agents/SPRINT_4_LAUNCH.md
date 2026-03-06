# 🚀 SPRINT 4 — URADNO ZAGONJEN
## Potrjeno: 6. marec 2026, 19:05

**Status:** ✅ AKTIVEN  
**Začetek:** 7. marec 2026, 06:00  
**Konec:** 20. marec 2026  
**Cilj:** Hitra in lepa online aplikacija

---

## ✅ POTRJEN OD GOVOR:

**Rok je potrdil:**
- [x] Se strinja s 4 točkami dogovora
- [x] Pripravljen začeti jutri
- [x] Razume da je sreda ODMOR

**Agenti potrjujemo:**
- [x] Pripravljeni za delo
- [x] Razumemo navodila
- [x] Začnemo jutri ob 06:00

---

## 🎯 CILJ SPRINTA 4:

> **"Aplikacija deluje hitro in je prijazna za 60-letnega mojstra"**

### Merljivi cilji:
- [ ] Vsi elementi min 48px
- [ ] Server response < 200ms
- [ ] PDF generira v < 2 sekundah
- [ ] Iskalnik najde predračun v < 10 sekundah
- [ ] Francova ocena > ⭐⭐⭐⭐ (4/5)

---

## 👥 EKIPA IN NALOGE:

### 🎨 UI Agent (Ana + Cvetka)
**Naloga #1:** Velikosti elementov (PRIORITETA: KRITIČNO)  
**Rok:** 11. marec

**Seznam popravkov:**
- [ ] Vsi gumbi min 48px x 48px
- [ ] Input polja min 48px višina
- [ ] Font size min 16px (prepreči iPhone zoom)
- [ ] Razmiki med elementi min 16px
- [ ] Testiraj na Samsung A12 in iPhone SE

```css
/* CILJNE VREDNOSTI */
button, input, select {
  min-height: 48px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 16px;
}
```

---

### 🗄️ Backend Agent (David)
**Naloga #1:** Optimizacija serverja (PRIORITETA: KRITIČNO)  
**Rok:** 11. marec

**Seznam popravkov:**
- [ ] API response time < 200ms
- [ ] PDF generiranje < 2 sekund
- [ ] Database query optimizacija
- [ ] Image compression v PDF
- [ ] Caching strategija

```javascript
// CILJNE VREDNOSTI
responseTime: '< 200ms'
pdfGeneration: '< 2s'
serverUptime: '99.9%'
```

---

### 🔍 QA Agent (Eva + Bojan)
**Naloga #1:** Pregled in testiranje (PRIORITETA: VISOKA)  
**Rok:** 13. marec

**Seznam nalog:**
- [ ] Code review vsakega commita
- [ ] Performance testi
- [ ] Security check
- [ ] Mobile responsive test
- [ ] Priprava metrik za Franca

**Metrike za merjenje:**
- Čas nalaganja strani
- Čas generiranja PDF
- Število klikov do cilja
- Response time API

---

### 👷 Tester (Franc)
**Naloga #1:** Test #2 (PRIORITETA: KRITIČNO)  
**Rok:** 20. marec

**Scenariji:**
1. Nov predračun za kopalnico (< 2 minuti)
2. Iskanje starega predračuna (< 10 sekund)
3. Generiranje PDF (< 2 sekunde)
4. Ocena: ⭐⭐⭐⭐ ali več

---

## 📅 TEDENSKI RAZPORED:

### Teden 1 (7. - 13. marec)

| Dan | UI Agent | Backend | QA | Tester | ODMOR |
|-----|----------|---------|-----|--------|-------|
| **Sob 7.3.** | Začne velikosti | Pregleda server | Priprava | — | — |
| **Ned 8.3.** | Nadaljuje | Optimizacija | — | — | — |
| **Pon 9.3.** | Testira | Testira API | Prvi review | — | — |
| **Tor 10.3.** | Dokonča | Dokonča | Testira | — | — |
| **Sre 11.3.** | **ODMOR** | **ODMOR** | **ODMOR** | **ODMOR** | 🛑 |
| **Čet 12.3.** | Iskalnik | PDF opt. | Pregled | — | — |
| **Pet 13.3.** | Dokonča iskalnik | Dokonča PDF | Final review | — | — |

### Teden 2 (14. - 20. marec)

| Dan | UI Agent | Backend | QA | Tester |
|-----|----------|---------|-----|--------|
| **Sob 14.3.** | Popravki | Popravki | Testira | — |
| **Ned 15.3.** | Testiranje | Testiranje | Poročilo | — |
| **Pon 16.3.** | Dokončanje | Dokončanje | Pregled | — |
| **Tor 17.3.** | Priprava | Priprava | Priprava | — |
| **Sre 18.3.** | **ODMOR** | **ODMOR** | **ODMOR** | **ODMOR** |
| **Čet 19.3.** | Final check | Final check | Final check | — |
| **Pet 20.3.** | — | — | — | **TEST #2** 🎯 |

---

## 🚨 POMENBNE DATUME:

- **11. marec:** Sreda — ODMOR (prvi)
- **13. marec:** Vse kritične naloge morajo biti končane
- **18. marec:** Sreda — ODMOR (drugi)
- **20. marec:** Francov test #2 + odločitev o deployu

---

## 📋 DNEVNI RITMIK:

### Ob 06:00 (vsak dan razen srede):
```
1. Agenti pregledajo naloge
2. Začnejo delo na prioritetah
3. Commitajo spremembe
```

### Ob 18:00 (vsak dan razen srede):
```
1. Generira se dnevni report
2. Agenti zaključijo delo
3. Pripravijo na jutri
```

### Sreda (11. in 18. marec):
```
🛑 ODMOR ZA VSE
🛑 Nobenega dela
🛑 Nobenih commitov
🛑 Regeneracija
```

---

## 📊 METRIKE ZA SLEDENJE:

| Metrika | Trenutno | Cilj | Status |
|---------|----------|------|--------|
| PDF hitrost | 6s | < 2s | 🟡 |
| Server response | ? | < 200ms | 🟡 |
| Elementi 48px | ? | 100% | 🟡 |
| Iskalnik | Ni ga | < 10s | 🔴 |
| Francova ocena | ⭐⭐ | ⭐⭐⭐⭐ | 🔴 |

---

## 🎯 KRITERIJI ZA USPEH:

**Sprint 4 je uspešen če:**
- [ ] Vsi elementi so dovolj veliki (48px+)
- [ ] Server je hiter (< 200ms)
- [ ] PDF je hiter (< 2s)
- [ ] Iskalnik deluje
- [ ] Franc da oceno ⭐⭐⭐⭐ ali več
- [ ] Ni kritičnih bugov

**Deploy dovoljen če:**
- ✅ Vse zgornje točke so izpolnjene
- ✅ QA Agent da zeleno luč
- ✅ Franc reče "uporabljal bi to"

---

## 📞 KOMUNIKACIJA:

### Dnevni report (avtomatsko ob 18:00):
- Lokacija: `agents/reports/daily-report-YYYYMMDD.md`
- GitHub: https://github.com/rokdraksler10-eng/moj-predracun
- Vsebuje: Status vseh agentov, napredek, opozorila

### Rokov feedback:
- Kadarkoli vidiš kaj narobe → napiši takoj
- Format: 🐛 BUG / 💡 IDEJA / ❓ VPRAŠANJE
- Če nič ne rečeš 5 dni → jaz STOPiram

---

## 🚀 NASLEDNJI KORAKI:

### Jutri, 7. marec ob 06:00:
1. ✅ Zaženem avtomatski sistem (cron job-i)
2. ✅ UI Agent začne s popravki velikosti
3. ✅ Backend Agent pregleda in optimizira server
4. ✅ Pripravim prvi dnevni report (ob 18:00)

### Tvoja naloga (Rok):
- [ ] Preglej dnevni report ko ga dobiš (ob 18:00)
- [ ] Daj feedback če je kaj narobe
- [ ] Sreda (11.3.): ODMOR — ne gledaš ničesar

---

## 💪 PRIČAKOVANJA:

**Realno:**
- Nekatere dni bo napredek počasen
- Nekaj bugov se bo pojavilo
- Mogoče bomo morali prilagoditi plan

**Pomembno:**
- Kvaliteta pred kvantiteto
- Redna komunikacija
- Sreda je ODMOR (ne preskočiva!)
- Če jaz (agent) utrujenost → javim takoj

---

## 🎉 ZAKLJUČEK:

**Sprint 4 je URADNO zagnan!**

Začnemo jutri ob 06:00.
Cilj: 20. marec.
Fokus: Hitrost in uporabnost.
Online-first, offline kasneje.

**Srečno nama! 🚀**

---

*"Vsaka velika stvar se začne s prvim korakom."*

**Prvi korak: Jutri ob 06:00. ✅**
