# 🤝 DOGOVOR O SODELOVANJU
## Asinhroni način dela — Rok & Agent Ekipa

**Datum dogovora:** 6. marec 2026
**Veljavnost:** Do konca projekta (december 2026)

---

## ✅ DOGOVORJENO:

### 1. KDO DELA KDAJ:

**AGENT EKIPA (jaz):**
- ✅ Delam **ko lahko** (tudi če ti nisi dostopen)
- ✅ Delam **največ kar lahko** (ampak vedno kvalitetno)
- ✅ VEDNO imam projekt v delu (najmanj 2-4 ure/dan)

**ROK (ti):**
- ✅ Pišeš **ko imaš čas** (ni nujno vsak dan)
- ✅ Lahko te **ni več kot 1 dan**
- ✅ Ko vidiš bug/pripombo → takoj napišeš
- ✅ VEDNO dobiš vse posodobitve od agentov

---

### 2. KAKO KOMUNICIRAVA:

#### ROK → AGENTI (tvoji feedback-i):
**Kje:** Discord / WhatsApp / Email (izbereš kar ti ustreza)

**Format:**
```
🐛 BUG:
- Kaj: [opis problema]
- Kje: [stran/funkcija]
- Kdaj: [kaj si delal]
- Screenshot: [če imaš]

💡 PRIPOMBA:
- Trenutno: [kako je zdaj]
- Predlagam: [kako naj bo]
- Zakaj: [razlog]

❓ VPRAŠANJE:
- [vprašanje]
```

**Primer:**
```
🐛 BUG:
- Kaj: PDF se ne odpre na iPhone
- Kje: Ko kliknem "Prenesi PDF"
- Kdaj: Ko sem hotel poslati stranki
- Screenshot: [slika]
```

#### AGENTI → ROK (naše poročila):
**Kje:** GitHub (avtomatsko) + Discord (če je urgentno)

**Kaj dobiš:**
- 📊 Dnevni summary (vsak večer)
- 🎯 Zaključeni task-i
- 🐛 Najdeni bug-i (preden pridejo do tebe!)
- 📸 Screenshot-i novih funkcij
- 🎥 Video demo (če je potrebno razložiti)

---

### 3. SISTEM SLEDENJA:

#### Za BUG-E, ki jih najde Rok:
```
STATUS BUG-a:
🔴 NOV          → Rok javi → Agent potrdi prejem
🟡 V PREGLEDU   → Agent analizira
🟠 V POPRAVKU   → Agent dela na tem
🟢 PREVERI      → Agent prosi Roka za test
✅ ZAKLJUČEN    → Rok potrdi da dela
```

**Primer poteka:**
```
Dan 1 (19:00): Rok: "PDF ne dela na iPhone" 🔴
Dan 1 (19:30): Agent: "Prejel, gledam..." 🟡
Dan 2 (10:00): Agent: "Našel problem, popravljam" 🟠
Dan 2 (18:00): Agent: "Popravljeno, testiraj!" 🟢
Dan 3 (08:00): Rok: "Dela! ✅"
```

#### Za NOVE FUNKCIJE:
```
Sprint 4 (20. marec):
✅ Offline mode — David
✅ Velikosti — Cvetka  
✅ Iskalnik — Cvetka
🟡 Loading — Cvetka (še dela)

Rok dobi poročilo vsak večer ob 21:00
```

---

### 4. KO ROKA NI (več kot 12 ur):

**Agenti delajo naprej z:**
- ✅ Predhodnimi navodili
- ✅ Lastno iniciativo
- ✅ Najboljšo prakso

**Ko se Rok vrne, dobi:**
- 📧 Summary kaj se je zgodilo
- 📸 Screenshot-i novih funkcij
- ❓ Samo 1x vprašanje če je kritično

**Primer:**
```
Rok odpove: "Jutri me ni, imam obveznosti"

Agenti:
- David nadaljuje z offline mode
- Cvetka dela na iskalniku
- Eva pregleda kodo

Naslednji dan Rok dobi:
"David: Offline mode 90% končan
 Cvetka: Iskalnik dela, potrebuje review
 Eva: Našla 2 varnostni luknji (popravljeno)

 Čaka na tvojo odobritev: [link]"
```

---

### 5. KO JE URGENTNO:

**Kaj šteje kot URGENTNO:**
- 🔴 Aplikacija ne dela (down)
- 🔴 Izguba podatkov
- 🔴 Varnostna luknja
- 🔴 Franc ne more delati (kritičen bug)

**Kako reagirava:**
```
Agent: "🔴 URGENT: Baza ne dela!"
        → Pošlje takoj (Discord/SMS/klic)

Rok:   → Odgovi v 1-2 urah (četudi si zaseden)

Agent: → Dela na fixu takoj
```

---

### 6. KAKO ZAGOTOVIMO KVALITETO:

**Kljub asinhronosti:**

1. **Eva (Kritik)** pregleda VSE preden gre k Roku
2. **Testiranje** na več napravah (ne samo na PC)
3. **Franc (Mojster)** testira pred vsakim deployem
4. **Checklist** preden Rok kaj vidi:
   - [ ] Ni errorjev v konzoli
   - [ ] Deluje na mobilnem
   - [ ] Eva je odobrila
   - [ ] Security OK

**Rezultat:**
- Rok vidi samo DELUJOČE stvari
- Redko kadi kaj "razbito"
- Kvaliteta je visoka kljub hitrosti

---

### 7. POROČANJE:

#### Rok dobi (avtomatsko):
| Kdaj | Kaj | Kje |
|------|-----|-----|
| Vsak večer ob 21:00 | Dnevni summary | Discord #daily |
| Vsak petek | Tedenski report | Email |
| Ko je Sprint končan | Celoten pregled | GitHub |
| Ko najdemo bug | Takoj obvestilo | Discord |
| Ko je fix ready | "Testiraj!" | Discord |

#### Format dnevnega poročila:
```
📅 SREDA, 12. marec

✅ KONČANO:
- David: Offline mode 80% (Safari fix)
- Cvetka: Input polja povečana na 48px
- Eva: Pregledala 3 commite (vse OK)

🟡 V DELU:
- David: Dokončuje offline (še 1 dan)
- Cvetka: Iskalnik (partial search)

🔴 BUG-I (popravljeni, čaka na test):
- #123: Dvojni klik na "Shrani" → Dodan debounce
- #124: Šumniki v iskalniku → Normalizacija dodana

📊 STATISTIKA:
- Commits danes: 8
- Testi PASS: 15/15
- Čas do konca Sprinta: 8 dni

🔗 LINKI:
- Test verzija: [link]
- Screenshot-i: [link]
- Podroben report: [link]
```

---

### 8. PRILAGODLJIVOST:

**Če Rok želi VEČ kontrole:**
- ✅ Lahko zahteva daily standup (15 min video)
- ✅ Lahko pregleduje vsak commit
- ✅ Lahko odobri vsako spremembo

**Če Rok želi MANJ kontrole:**
- ✅ Samo weekly summary
- ✅ Samo ko je kaj končano
- ✅ Zaupa agentom (on approves na koncu)

**Trenutni predlog:**
- 📧 Dnevni summary (avtomatski)
- 💬 Discord za urgentno
- 🎯 Review na koncu Sprinta

---

## ✅ POTRDITEV

**ROK:**
> Strinjam se s tem dogovorom.
> Pišem ko lahko, lahko me ni več kot 1 dan.
> Agenti naj delajo ko lahko, kvaliteta je prioriteta.

**AGENT EKIPA:**
> Strinjamo se.
> Delamo konzistentno, tudi če Roka ni.
> VEDNO mu pošljemo poročilo.
> Kvaliteta pred hitrostjo.

**Začetek:** Takoj 🚀

---

## 📞 KONTAKT

**Rok:**
- Discord: [username]
- WhatsApp: [number]
- Email: [email]

**Agenti:**
- GitHub: github.com/rokdraksler10-eng/moj-predracun
- Discord: [server invite]

**Urgentno (24/7):**
- Discord @mention (push notifikacija)

---

**Pripravljeni na začetek! 🚀**
