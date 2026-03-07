# 🏗️ Moj Predračun - Naloge

## ✅ DONE (Dokončano)
- [x] Osnovna aplikacijska struktura (Node.js + Express + SQLite)
- [x] Upravljanje postavk (del) z kategorijami in priljubljenimi
- [x] Upravljanje materialov s kategorijami
- [x] Kalkulator za meritve (tla, strop, stene)
- [x] Povezava kalkulatorja s predračunom (dodajanje postavk)
- [x] PDF izvoz - DVA dokumenta:
  - [x] Predračun za stranko (s cenami)
  - [x] Dokument za mojstra (material, delo, brez cen)
- [x] Izračun materialov v PDF-ju za mojstra
- [x] Poenostavljena stran za predračune
- [x] Demo podatki ob prvem zagonu

## 🔄 DOING (V delu)
- [x] Testiranje na mobilnih napravah - DELUJE
- [x] Stabilnost strežnika - Pripravljeno za Render deploy
- [x] Dodaj možnost tiskanja predračuna - PDF izvoz deluje
- [x] ✅ **Service Worker (OFFLINE MODE - Faza 1)** - 7.3.2026
  - [x] Cache staticnih datotek (HTML, CSS, JS)
  - [x] Intercept network requestov
  - [x] Fallback na cache, če ni interneta
  - [x] Offline indikator v UI
  - [x] Online/offline event handling
  - [x] ✅ OBSEŽNO TESTIRANO - vsi testi uspešni
- [x] ✅ **IndexedDB (OFFLINE MODE - Faza 2)** - 7.3.2026
  - [x] IndexedDB shema (quotes, clients, workItems, materials)
  - [x] Shrani/Naloži iz IndexedDB
  - [x] Sinhronizacija s strežnikom
  - [x] Sync gumb v navigaciji z indikatorjem
  - [x] Avtomatsko shranjevanje v IndexedDB
- [x] ✅ **TOUCH-FRIENDLY UI (Faza 3)** - 7.3.2026
  - [x] 48px touch targeti za vse gumbe
  - [x] Prevent zoom on iOS (16px font)
  - [x] Bottom navigation za mobilne naprave
  - [x] Pull-to-refresh funkcionalnost
  - [x] Mobile-optimized modali in forme

## ✅ JUTRI (1.3.2026)

### Pred prihodom Roka (NAREJENO čez noč):
- [x] Logo in branding (SVG ikona)
- [x] PWA manifest in service worker
- [x] Font Inter za boljši izgled
- [x] Loading spinner animacija
- [x] Izboljšana navigacija z tagline
- [x] CSS animacije (fade, slide, pulse)
- [x] Enhanced color system

### Ko pride Rok:
- [ ] Deploy na Render.com (stabilna verzija) - 5 min
- [ ] Test celotnega toka: Kalkulator → Predračun → PDF
- [ ] Preveri PDF za stranko (vsebuje cene?)
- [ ] Preveri PDF za mojstra (vsebuje material?)
- [ ] Dokončaj barvno shemo po želji

## 📋 TODO (Načrtovano)
- [ ] Deploy na Render/Railway za stabilnost
- [ ] Dodaj več vrst materialov v izračun
- [ ] Možnost dodajanja slik v predračun
- [ ] Sinhronizacija med napravami
- [ ] Verzija za iOS/Android (PWA optimizacija)

## 🐛 BUGS (Znane napake)
- Strežnik dobi SIGKILL vsakih ~10 minut (sistemska težava)
- Cloudflare tunnel ni stabilen za produkcijo

## 💡 IDEJE (Prihodnje izboljšave)
- Integracija z računovodskim programom
- Avtomatski email predračuna stranki
- Sledenje plačil
- Več predlog za različne vrste del
