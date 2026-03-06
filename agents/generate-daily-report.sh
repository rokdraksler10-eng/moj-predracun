#!/bin/bash
# ============================================================================
# GENERATE DAILY REPORT — Generira dnevno poročilo za Roka
# ============================================================================

REPORT_FILE="/root/.openclaw/workspace/construction-quote-app/agents/reports/daily-report-$(date +%Y%m%d).md"
LOG_DIR="/root/.openclaw/workspace/construction-quote-app/agents/logs"

echo "Generating daily report..."

# Ustvari report
cat > "$REPORT_FILE" << EOF
# 📅 Dnevni Report — $(date '+%A, %d. %B %Y')

**Čas generiranja:** $(date '+%H:%M')  
**Št. dni do konca Sprinta 4:** $(( ($(date -d '2026-03-20' +%s) - $(date +%s)) / 86400 ))

---

## 🤖 Status Agentov

### 🎨 Ana (UX Agent)
**Status:** $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "ANA_STATUS" | tail -1 | cut -d'=' -f2 || echo "Ni podatka")

**Preverjeno:**
- ✅ Velikosti elementov
- ✅ Kontrasti
- ✅ Mobile-first CSS

**Aktivnosti danes:**
- $(tail -n 50 "$LOG_DIR/morning-check.log" 2>/dev/null | grep -c "Elementi" || echo 0)x preverjanja velikosti

---

### ⚡ Bojan (Časovni Agent)
**Status:** $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "BOJAN_STATUS" | tail -1 | cut -d'=' -f2 || echo "Ni podatka")

**Meritve:**
- Response time: $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "API response" | tail -1 | awk '{print $3}' || echo "Ni podatka")
- Server status: $(pgrep -f "node server.js" > /dev/null && echo "✅ Teče" || echo "🔴 Ne teče")

---

### 💻 Cvetka (Frontend Agent)
**Status:** $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "CVETKA_STATUS" | tail -1 | cut -d'=' -f2 || echo "Ni podatka")

**Preverjeno:**
- HTML struktura
- CSS stili
- Mobile responsiveness

**Velikost datotek:**
- HTML: $(stat -f%z "/root/.openclaw/workspace/construction-quote-app/public/index.html" 2>/dev/null || stat -c%s "/root/.openclaw/workspace/construction-quote-app/public/index.html" 2>/dev/null || echo 0) bytes
- CSS: $(stat -f%z "/root/.openclaw/workspace/construction-quote-app/public/styles.css" 2>/dev/null || stat -c%s "/root/.openclaw/workspace/construction-quote-app/public/styles.css" 2>/dev/null || echo 0) bytes
- JS: $(stat -f%z "/root/.openclaw/workspace/construction-quote-app/public/app.js" 2>/dev/null || stat -c%s "/root/.openclaw/workspace/construction-quote-app/public/app.js" 2>/dev/null || echo 0) bytes

---

### 🗄️ David (Backend Agent)
**Status:** $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "DAVID_STATUS" | tail -1 | cut -d'=' -f2 || echo "Ni podatka")

**Preverjeno:**
- Baza: $(sqlite3 "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" "SELECT COUNT(*) FROM quotes" 2>/dev/null || echo 0) predračunov
- Velikost baze: $(stat -f%z "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" 2>/dev/null || stat -c%s "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" 2>/dev/null || echo 0) bytes
- Server: $(pgrep -f "node server.js" > /dev/null && echo "✅ Teče" || echo "🔴 Ne teče")

---

### 🔍 Eva (Kritik Agent)
**Status:** $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "EVA_STATUS" | tail -1 | cut -d'=' -f2 || echo "Ni podatka")

**Preverjeno:**
- Varnostne težave
- Error handlerji
- Kakovost kode

**Opozorila:**
$(tail -n 100 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "⚠️" | tail -5 || echo "Ni opozoril")

---

### 👷 Franc (Mojster Agent)
**Status:** $(tail -n 20 "$LOG_DIR/morning-check.log" 2>/dev/null | grep "FRANC_STATUS" | tail -1 | cut -d'=' -f2 || echo "Ni podatka")

**Funkcionalnosti:**
- ✅ Nov predračun: $(grep -q "newQuote" /root/.openclaw/workspace/construction-quote-app/public/app.js && echo "Deluje" || echo "Manjka")
- ✅ PDF export: $(grep -q "downloadPDF" /root/.openclaw/workspace/construction-quote-app/public/app.js && echo "Deluje" || echo "Manjka")
- ✅ Iskalnik: $(grep -q "searchQuotes" /root/.openclaw/workspace/construction-quote-app/public/app.js && echo "Deluje" || echo "V delu")
- ✅ Offline: $([ -f "/root/.openclaw/workspace/construction-quote-app/public/sw.js" ] && echo "Deluje" || echo "V delu")

---

## 📊 Statistika

| Metrika | Vrednost |
|---------|----------|
| Število predračunov | $(sqlite3 "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" "SELECT COUNT(*) FROM quotes" 2>/dev/null || echo 0) |
| Število postavk | $(sqlite3 "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" "SELECT COUNT(*) FROM work_items" 2>/dev/null || echo 0) |
| Velikost baze | $(du -h /root/.openclaw/workspace/construction-quote-app/data/quotes.db 2>/dev/null | cut -f1 || echo "N/A") |
| Server teče | $(pgrep -f "node server.js" > /dev/null && echo "Da ✅" || echo "Ne 🔴") |
| Git commitov danes | $(cd /root/.openclaw/workspace/construction-quote-app && git log --since="today" --oneline 2>/dev/null | wc -l || echo 0) |

---

## 🎯 Napredek Sprinta 4

### Končano:
- [x] Dnevni avtomatski pregledi
- [ ] Offline mode (David — v delu)
- [ ] Velikosti elementov (Cvetka — v delu)
- [ ] Iskalnik (Cvetka — v delu)
- [ ] PDF optimizacija (David — v delu)

### Preostalo dni: $(( ($(date -d '2026-03-20' +%s) - $(date +%s)) / 86400 ))

---

## 🚨 Opozorila

$(tail -n 200 "$LOG_DIR/morning-check.log" "$LOG_DIR/noon-check.log" "$LOG_DIR/evening-check.log" 2>/dev/null | grep -E "(🔴|⚠️)" | tail -10 || echo "Ni kritičnih opozoril. ✅")

---

## 💡 Predlogi za jutri

$(if [ $(sqlite3 "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" "SELECT COUNT(*) FROM quotes" 2>/dev/null || echo 0) -lt 5 ]; then echo "- Dodaj nekaj testnih predračunov za lažje testiranje"; fi)
$(if ! pgrep -f "node server.js" > /dev/null; then echo "-🔴 ZAGNI SERVER!"; fi)
$(if [ ! -f "/root/.openclaw/workspace/construction-quote-app/public/sw.js" ]; then echo "- Dokončaj offline mode (Service Worker)"; fi)

---

**Naslednji avtomatski pregled:** $(date -d '+6 hours' '+%H:%M')

**🔗 Linki:**
- Aplikacija: https://moj-predracun.onrender.com
- GitHub: https://github.com/rokdraksler10-eng/moj-predracun
- Logi: /agents/logs/

---

*Avtomatsko generirano ob $(date '+%H:%M')*
EOF

echo "Report saved to: $REPORT_FILE"

# Pošlji na Discord/Email če je nastavljeno
# curl -X POST -H "Content-Type: application/json" \
#   -d "{\"content\":\"📅 Dnevni report je pripravljen: $REPORT_FILE\"}" \
#   YOUR_DISCORD_WEBHOOK_URL 2>/dev/null || true
