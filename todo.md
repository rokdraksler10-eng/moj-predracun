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
- [ ] Testiranje na mobilnih napravah
- [ ] Stabilnost strežnika (Cloudflare tunnel pade vsakih 10 min)
- [ ] Dodaj možnost tiskanja predračuna

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
