# 📱 Testni plan - Mobilno testiranje
**Aplikacija:** Moj Predračun  
**Verzija:** v2.0 (Offline Mode)  
**Platforme:** iPhone (Safari) + Android (Chrome)  
**Datum:** 7. marec 2026

---

## 🔗 Deploy URL (pričakovan)

```
https://moj-predracun.onrender.com
```

---

## ✅ CHECKLIST ZA TESTIRANJE

### Pred testiranjem
- [ ] Deploy je končan (status: Live)
- [ ] URL je dostopen iz interneta
- [ ] Naprava ima povezavo z internetom (WiFi ali 4G/5G)

---

## TEST 1: Osnovni dostop (2 minuti)

### iPhone (Safari)
- [ ] Odpri Safari
- [ ] Vpiši URL: `https://moj-predracun.onrender.com`
- [ ] Počakaj da se naloži (prvič ~5-10 sekund)
- [ ] Preveri:
  - [ ] Logo "Moj Predračun" je viden
  - [ ] Navigacija (Predračuni, Postavke, Materiali, Kalkulator)
  - [ ] Seznam postavk se prikaže
  - [ ] Ni rdečih napak

### Android (Chrome)
- [ ] Odpri Chrome
- [ ] Vpiši URL: `https://moj-predracun.onrender.com`
- [ ] Počakaj da se naloži
- [ ] Preveri iste točke kot na iPhone

**Rezultat:** ✅ / ❌  
**Opombe:** _______________

---

## TEST 2: PWA Install (3 minute)

### iPhone - "Add to Home Screen"
- [ ] V Safari klikni **Share** (kvadrat s puščico navzgor)
- [ ] Poišči **"Add to Home Screen"** (Dodaj na začetni zaslon)
- [ ] Klikni **Add**
- [ ] Preveri:
  - [ ] Ikona se pojavi na domačem zaslonu
  - [ ] Ikona ima logo "Moj Predračun"
  - [ ] Odpri aplikacijo z ikone (ne iz Safari!)
  - [ ] Aplikacija odpre brez Safari URL bara

### Android - "Add to Home Screen"
- [ ] V Chrome klikni **Menu** (3 pike)
- [ ] Izberi **"Add to Home Screen"**
- [ ] Klikni **Add**
- [ ] Preveri:
  - [ ] Ikona se pojavi na domačem zaslonu
  - [ ] Odpri aplikacijo z ikone
  - [ ] Aplikacija odpre brez Chrome URL bara

**Rezultat:** ✅ / ❌  
**Opombe:** _______________

---

## TEST 3: Offline način - Airplane Mode (5 minut)

### Priprava
- [ ] Odpri aplikacijo (iz ikone na domačem zaslonu)
- [ ] Počakaj da se vse naloži (predračuni, postavke)
- [ ] Preveri da vidiš podatke

### Airplane Mode Test
- [ ] Vklopi **Airplane Mode** (Letalski način)
- [ ] Počakaj 2-3 sekunde
- [ ] Preveri:
  - [ ] Na vrhu se prikaže rumen banner: "📴 Brez povezave - delam offline"
  - [ ] Toast obvestilo: "📴 Brez povezave - delam offline"
  
### Osvežitev v Offline načinu
- [ ] Na iPhone: Pull down (povleci navzdol) za osvežitev
- [ ] Na Android: Pull down za osvežitev
- [ ] Preveri:
  - [ ] Aplikacija se osveži brez napak
  - [ ] Podatki so še vedno vidni
  - [ ] Ni "No internet connection" napake
  - [ ] Lahko klikneš na postavke in jih vidiš

**Rezultat:** ✅ / ❌  
**Opombe:** _______________

---

## TEST 4: Sinhronizacija (5 minut)

### Ustvari predračun v Offline načinu
- [ ] Vklopi **Airplane Mode**
- [ ] Klikni **"+ Nov predračun"**
- [ ] Izpolni:
  - [ ] Naziv projekta: "Test Offline"
  - [ ] Stranka: "Test Stranka"
  - [ ] Naslov: "Testna ulica 1"
- [ ] Klikni **"Shrani"**
- [ ] Preveri:
  - [ ] Predračun se shrani
  - [ ] Vidiš ga na seznamu predračunov
  - [ ] Na sync gumbu (🔄) se pojavi rdeča pika/badge

### Sinhronizacija
- [ ] Izklopi **Airplane Mode**
- [ ] Počakaj 5-10 sekund
- [ ] Preveri:
  - [ ] Toast: "🌐 Povezava vzpostavljena"
  - [ ] Toast: "🔄 Sinhroniziram podatke..."
  - [ ] Toast: "✅ Sinhronizacija zaključena"
  - [ ] Rdeča pika na sync gumbu izgine

### Verifikacija na strežniku
- [ ] Odpri URL v brskalniku na računalniku
- [ ] Preveri če je predračun "Test Offline" na seznamu

**Rezultat:** ✅ / ❌  
**Opombe:** _______________

---

## TEST 5: Touch UI & Responsiveness (3 minute)

### Velikost elementov
- [ ] Gumbi so dovolj veliki za prst (lahko klikneš brez napake)
- [ ] Input polja so dovolj velika
- [ ] Tekst je berljiv (ni premajhen)

### Navigacija
- [ ] Klikni na vse zavihke (Predračuni, Postavke, Materiali, Kalkulator)
- [ ] Preveri smooth prehode
- [ ] Preveri back button (vrni se nazaj)

### Skrollanje
- [ ] Odpri seznam postavk
- [ ] Skrolaj navzdol (mora biti smooth)
- [ ] Skrolaj navzgor (mora biti smooth)

### Vnos podatkov
- [ ] Odpri kalkulator
- [ ] Vnesi številke v input polja
- [ ] Preveri če se tipkovnica pravilno odpre
- [ ] Preveri če so številke vidne

**Rezultat:** ✅ / ❌  
**Opombe:** _______________

---

## TEST 6: Performance (2 minuti)

### Čas nalaganja
- [ ] Zapri aplikacijo (kill app)
- [ ] Odpri aplikacijo z ikone
- [ ] Izmeri čas:
  - [ ] Do prikaza loga: __ sekund
  - [ ] Do prikaza podatkov: __ sekund
  - [ ] Celotno nalaganje: __ sekund

### Hitrost delovanja
- [ ] Klikni na postavko (odziv mora biti takojšen)
- [ ] Odpri kalkulator (brez zamika)
- [ ] Generiraj PDF (preveri čas)

**Rezultat:** ✅ / ❌  
**Opombe:** _______________

---

## 🐛 NAVADNE NAPAKE

### Če aplikacija ne dela v Offline načinu:
1. Preveri da si jo prvič naložil ONLINE (da se cache napolni)
2. Preveri v Chrome DevTools (na računalniku): Application → Cache Storage
3. Osveži stran 2x v online načinu, potem preizkusi offline

### Če se predračun ne sinhronizira:
1. Preveri da imaš povezavo (WiFi/4G)
2. Klikni ročno na sync gumb (🔄)
3. Počakaj 10-15 sekund
4. Preveri na računalniku če je predračun tam

### Če je UI premajhen:
1. iPhone: Settings → Display & Brightness → Text Size (nastavi na večje)
2. Android: Settings → Display → Font Size

---

## 📊 SKUPNI REZULTAT

| Test | Status | Opombe |
|------|--------|--------|
| 1. Osnovni dostop | ⬜ | |
| 2. PWA Install | ⬜ | |
| 3. Offline način | ⬜ | |
| 4. Sinhronizacija | ⬜ | |
| 5. Touch UI | ⬜ | |
| 6. Performance | ⬜ | |

**SKUPNA OCENA:** ___ / 6 testov uspešnih

---

## 📝 POROČILO

**Naprava:** iPhone ___ / Android ___  
**Model:** _______________  
**iOS/Android verzija:** _______________  
**Brskalnik:** Safari / Chrome  
**Datum testiranja:** _______________  

**Glavne ugotovitve:**
_________________________________
_________________________________

**Najdene napake:**
_________________________________
_________________________________

**Predlogi za izboljšave:**
_________________________________
_________________________________

---

## 📤 POŠLJI REZULTATE

Ko zaključiš testiranje, pošlji:
1. Skupno oceno (št. uspešnih testov)
2. Screenshot-e morebitnih napak
3. Kratko poročilo

**Kontakt:** Boris 2 (AI asistent) 🤖

---

**Srečno testiranje!** 🚀
