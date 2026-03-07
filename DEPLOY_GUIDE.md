# 🚀 Deploy na Render.com - Navodila

## Hitri Deploy (2 minuti)

### Korak 1: Odpri Render Dashboard
🔗 **Povezava:** https://dashboard.render.com

### Korak 2: Ustvari nov Web Service
1. Klikni **"New +"** → **"Web Service"**
2. Izberi **"Build and deploy from a Git repository"**
3. Poveži svoj GitHub račun (če še ni)
4. Izberi repozitorij: `rokdraksler10-eng/moj-predracun`

### Korak 3: Konfiguracija (izpolni samodejno iz render.yaml)
| Nastavitev | Vrednost |
|------------|----------|
| **Name** | moj-predracun |
| **Region** | Frankfurt (EU) |
| **Branch** | master |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run init-db` |
| **Start Command** | `npm start` |

### Korak 4: Environment Variables
Dodaj te spremenljivke:
```
NODE_ENV = production
PORT = 10000
```

### Korak 5: Disk (za SQLite bazo)
1. Pod **"Advanced"** → **"Disks"**
2. Klikni **"Add Disk"**
```
Name: data
Mount Path: /data
Size: 1 GB
```

### Korak 6: Deploy!
Klikni **"Create Web Service"**

---

## 📱 Testni URL

Ko je deploy končan, bo aplikacija dostopna na:
```
https://moj-predracun.onrender.com
```

**Ali pa na tvoji custom domeni:**
```
https://mojpredracun.onrender.com
```

---

## ⏱️ Časovna linija

| Faza | Trajanje |
|------|----------|
| Build (npm install) | ~2 minuti |
| Init DB | ~30 sekund |
| Deploy | ~1 minuta |
| **Skupaj** | **~4 minute** |

---

## ✅ Verifikacija po deployu

Ko je aplikacija živa, preveri:

1. **Osnovni dostop:**
   ```
   https://moj-predracun.onrender.com
   ```
   → Mora prikazati aplikacijo

2. **API test:**
   ```
   https://moj-predracun.onrender.com/api/work-items
   ```
   → Mora vrniti JSON s postavkami

3. **Service Worker:**
   ```
   https://moj-predracun.onrender.com/sw.js
   ```
   → Mora vrniti JavaScript kodo

---

## 🧪 Testni plan za mobilno napravo

Ko imaš URL, sledi tem korakom na iPhone/Android:

### Test 1: Osnovni dostop
- [ ] Odpri URL v Safari/Chrome
- [ ] Preveri če se aplikacija naloži
- [ ] Preveri če so podatki vidni (postavke, materiali)

### Test 2: PWA Install
- [ ] Klikni "Share" → "Add to Home Screen"
- [ ] Preveri če se ikona pojavi na domačem zaslonu
- [ ] Odpri aplikacijo z ikone (ne iz brskalnika)

### Test 3: Offline način (Airplane Mode)
- [ ] Naloži aplikacijo (online)
- [ ] Vklopi **Airplane Mode**
- [ ] Osveži aplikacijo (pull down)
- [ ] Preveri če deluje (podatki iz IndexedDB)

### Test 4: Sinhronizacija
- [ ] Ustvari nov predračun v offline načinu
- [ ] Izklopi Airplane Mode
- [ ] Preveri če se podatki sinhronizirajo

### Test 5: Touch UI
- [ ] Preveri velikost gumbov (lahko klikneš s prstom?)
- [ ] Preizkusi vnos podatkov
- [ ] Preveri skrollanje

---

## 🐛 Rješevanje težav

### Težava: "Build failed"
**Rešitev:**
```bash
# Preveri loge v Render Dashboard → Logs
# Pogosta napaka: Manjka better-sqlite3
# Rešitev: Node version mora biti 18.x (že nastavljeno v package.json)
```

### Težava: "Database error"
**Rešitev:**
```bash
# Preveri če je disk pravilno mountan
# Preveri loge: cat /data/quotes.db mora obstajati
```

### Težava: "Service Worker ne dela"
**Rešitev:**
```bash
# Preveri če je HTTPS (SW zahteva HTTPS)
# Render zagotavlja HTTPS avtomatsko
```

---

## 📞 Podpora

Če imaš težave:
1. Preveri loge v Render Dashboard
2. Preveri GitHub repozitorij: https://github.com/rokdraksler10-eng/moj-predracun
3. Kontaktiraj Boris 2 za pomoč

---

**Pripravljen za deploy?** 🚀
Klikni na povezavo in sledi korakom!
