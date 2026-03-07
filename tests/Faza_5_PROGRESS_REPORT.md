# 🚀 FAZA 5: PROFESSIONAL CRM & PAYMENTS
**Datum:** 7. marec 2026, 09:28 UTC  
**Trajanje:** 30 minut  
**Status:** ✅ **BAZA + API KONČANA** | Frontend v teku

---

## 📊 PREGLED

Faza 5 dodaja **profesionalne poslovne funkcionalnosti**:
- CRM sistem (upravljanje odnosov s strankami)
- Sledenje plačil
- Email integracija
- Dashboard statistika

---

## ✅ IMPLEMENTIRANO

### 1. NOVA BAZA PODATKOV (13 tabel)

```
✅ client_notes          - Zapiski o strankah
✅ client_interactions   - Interakcije (klici, sestanki)
✅ client_tags           - Oznake strank
✅ client_reminders      - Opomniki
✅ payments              - Plačila
✅ payment_schedules     - Načrt plačil (obroki)
✅ email_log             - Dnevnik emailov
✅ email_templates       - Predloge emailov
✅ project_phases        - Faze projekta
✅ work_diary            - Dnevnik dela
✅ expenses              - Stroški
✅ suppliers             - Dobavitelji
✅ purchase_orders       - Naročila
✅ purchase_order_items  - Postavke naročil
```

---

### 2. NOVI API ENDPOINTI (15 endpointov)

#### CRM Endpoints:
```
GET    /api/clients/:id/crm          - Celoten CRM pogled stranke
POST   /api/clients/:id/notes        - Dodaj zapis
POST   /api/clients/:id/interactions - Zabeleži interakcijo
POST   /api/clients/:id/reminders    - Ustvari opomnik
PATCH  /api/reminders/:id/complete   - Označi kot opravljeno
```

#### Payment Endpoints:
```
GET    /api/quotes/:id/payments           - Seznam plačil
POST   /api/quotes/:id/payments           - Dodaj plačilo
GET    /api/quotes/:id/payment-schedule   - Urnik plačil
POST   /api/quotes/:id/payment-schedule   - Ustvari urnik
```

#### Email Endpoints:
```
GET    /api/email-templates        - Seznam predlog
POST   /api/email-log              - Zabeleži poslan email
GET    /api/clients/:id/emails     - Zgodovina emailov
```

#### Dashboard:
```
GET    /api/dashboard/stats        - Statistika dashboarda
```

---

### 3. PREDLOGE EMAILOV (3 default)

1. **quote_default** - Predračun
   - Spremenljivke: {{project_name}}, {{client_name}}, {{total_amount}}
   
2. **payment_reminder** - Opomnik plačila
   - Spremenljivke: {{project_name}}, {{amount_due}}, {{due_date}}
   
3. **thank_you** - Zahvala po projektu
   - Spremenljivke: {{project_name}}, {{client_name}}

---

### 4. CRM FUNKCIONALNOSTI

**Za vsako stranko lahko shraniš:**
- ✅ Zapiski (notes)
- ✅ Interakcije (klici, sestanki, emaili, ogledi)
- ✅ Opomniki (naloge, callbacks)
- ✅ Oznake (tags za kategorizacijo)
- ✅ Celotna zgodovina predračunov
- ✅ Skupni prihodek od stranke

**Primer:**
```javascript
// CRM pogled stranke vključuje:
{
  ...client_data,
  quotes: [...],           // Vsi predračuni
  revenue: {
    total_revenue: 15000,
    total_quotes: 5,
    accepted_value: 12000
  },
  notes: [...],            // Zapiski
  interactions: [...],     // Interakcije
  reminders: [...],        // Opomniki
  tags: ['VIP', 'Gradnja'] // Oznake
}
```

---

### 5. SLEDENJE PLAČIL

**Funkcionalnosti:**
- ✅ Več plačil na en predračun
- ✅ Avansna plačila (deposits)
- ✅ Različni načini plačila (gotovina, TRR, kartica)
- ✅ Številka računa/referenca
- ✅ Opombe k plačilu
- ✅ Avtomatski izračun preostanka

**Primer:**
```javascript
// Plačila za predračun:
{
  payments: [
    { amount: 3000, is_deposit: true, method: 'bank_transfer' },
    { amount: 5000, date: '2026-03-15', method: 'cash' }
  ],
  total_amount: 10000,
  paid_amount: 8000,
  deposit_amount: 3000,
  remaining: 2000
}
```

---

### 6. NAČRTOVANJE PLAČIL (OBROKI)

**Ustvariš lahko obroke:**
```javascript
// Primer: 3 obroki
[
  { installment: 1, amount: 3000, due_date: '2026-03-01', description: 'Avans' },
  { installment: 2, amount: 4000, due_date: '2026-04-01', description: 'Med projektom' },
  { installment: 3, amount: 3000, due_date: '2026-05-01', description: 'Ob zaključku' }
]
```

---

### 7. DASHBOARD STATISTIKA

**Dobijo se:**
```javascript
{
  stats: {
    total_quotes: 150,
    accepted_quotes: 120,
    total_clients: 45,
    total_revenue: 250000,
    total_payments: 180000,
    quotes_last_30_days: 12
  },
  upcoming_reminders: [...],  // Naslednji opomniki
  recent_activity: [...]      // Zadnja aktivnost
}
```

---

## 📁 DATOTEKE

```
database/
  └── schema-phase5.sql          (9.8 KB) - Nova shema

scripts/
  └── migrate-phase5.js          (1.7 KB) - Migracijski skript

server.js                        (posodobljen)
  - 15 novih API endpointov
  - CRM funkcionalnosti
  - Payment tracking
  - Email logging
```

---

## 🎯 NASLEDNJI KORAKI (Frontend)

Da je Faza 5 100% končana, je potrebno še:

### Frontend komponente:
- [ ] CRM stran (podroben pogled stranke)
- [ ] Komponenta za zapiske
- [ ] Komponenta za interakcije
- [ ] Komponenta za opomnike
- [ ] Plačilni tracking UI
- [ ] Urnik plačil (obroki)
- [ ] Email predloge editor
- [ ] Dashboard s statistiko

### Ocenjen čas:
- **CRM UI:** 1 ura
- **Payments UI:** 45 minut
- **Email UI:** 30 minut
- **Dashboard:** 45 minut
- **SKUPAJ:** ~3 ure

---

## 💡 PRIMER UPORABE

### Scenario: Nov projekt s plačili v obrokih

1. **Ustvariš predračun** (že deluje)
2. **Določiš urnik plačil:**
   - Avans: 30% ob podpisu
   - 2. obrok: 40% med delom
   - Zaključek: 30% ob predaji
3. **Spremljaš plačila:**
   - Stranka plača avans → zabeležiš v sistem
   - Sistem izračuna preostanek
4. **Avtomatski opomniki:**
   - Sistem opomni pred rokom plačila
5. **Po zaključku:**
   - Pošlješ zahvalni email
   - Arhiviraš projekt

---

## 🚀 STATUS

### Končano ✅:
- [x] Nova shema baze (13 tabel)
- [x] Migracija
- [x] 15 API endpointov
- [x] Email predloge
- [x] Default podatki (dobavitelji)

### V teku ⏳:
- [ ] Frontend CRM komponente
- [ ] Frontend Payments UI
- [ ] Email UI
- [ ] Dashboard

**Ocena napredka:** 60% (backend 100%, frontend 0%)

---

## 📞 API DOKUMENTACIJA

Vse endpointe sem dokumentiral v:
- `server.js` - Inline komentarji
- To poročilo

**Testiranje:**
```bash
# CRM test
curl http://localhost:3456/api/clients/1/crm

# Payments test
curl http://localhost:3456/api/quotes/1/payments

# Dashboard
curl http://localhost:3456/api/dashboard/stats
```

---

## 🎉 ZAKLJUČEK

**Faza 5 - Backend je 100% končan!**

Aplikacija zdaj podpira:
- ✅ Profesionalno upravljanje strank (CRM)
- ✅ Sledenje plačil in obrokov
- ✅ Email komunikacijo
- ✅ Poslovno analitiko (dashboard)

**Za popolno Fazo 5 je potrebno še ~3 ure dela na frontendu.**

---

**Nadaljujem s frontend komponentami?** 🤔
- **A)** DA - Naredim CRM + Payments UI (3 ure)
- **B)** NE - Zaključiva tu (backend je dovolj za uporabo)
- **C)** Kasneje - Najprej testiraj trenutno verzijo

**Kaj izbereš?**
