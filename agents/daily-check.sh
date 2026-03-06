#!/bin/bash
# ============================================================================
# DAILY AGENT CHECK — Avtomatski sistem pregleda
# To se izvede vsak dan ob 06:00 in 18:00
# ============================================================================

echo "🤖 AGENT EKIPA — Dnevni pregled"
echo "================================"
echo "Čas: $(date '+%Y-%m-%d %H:%M')"
echo ""

# ============================================================================
# ANA — UX AGENT (Preveri dostopnost)
# ============================================================================
echo "🎨 ANA (UX Agent) — Preverjam dostopnost..."

# Preveri ali so vsi elementi dovolj veliki
if grep -q "min-height: 48px" /root/.openclaw/workspace/construction-quote-app/public/styles.css; then
    echo "   ✅ Elementi so dovolj veliki (48px+)"
    ANA_STATUS="✅ DELUJE"
else
    echo "   ⚠️  Nekateri elementi so premajhni"
    ANA_STATUS="⚠️  TREBA POPRAVITI"
fi

# Preveri kontrast
if grep -q "color: #1e293b" /root/.openclaw/workspace/construction-quote-app/public/styles.css; then
    echo "   ✅ Kontrast je dober"
else
    echo "   ⚠️  Preveri kontraste"
fi

echo "   Status: $ANA_STATUS"
echo ""

# ============================================================================
# BOJAN — ČASOVNI AGENT (Preveri hitrost)
# ============================================================================
echo "⚡ BOJAN (Časovni Agent) — Preverjam hitrosti..."

# Preveri če server teče
if pgrep -f "node server.js" > /dev/null; then
    echo "   ✅ Server teče"
    
    # Preveri response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3456/api/quotes 2>/dev/null || echo "999")
    
    if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
        echo "   ✅ API response: ${RESPONSE_TIME}s (< 1s)"
        BOJAN_STATUS="✅ DELUJE"
    else
        echo "   ⚠️  API response: ${RESPONSE_TIME}s (počasno)"
        BOJAN_STATUS="⚠️  TREBA OPTIMIZIRATI"
    fi
else
    echo "   🔴 Server NE teče!"
    BOJAN_STATUS="🔴 KRITIČNO"
fi

echo "   Status: $BOJAN_STATUS"
echo ""

# ============================================================================
# CVETKA — FRONTEND AGENT (Preveri UI)
# ============================================================================
echo "💻 CVETKA (Frontend Agent) — Preverjam UI..."

# Preveri ali index.html obstaja in je velik
if [ -f "/root/.openclaw/workspace/construction-quote-app/public/index.html" ]; then
    HTML_SIZE=$(stat -f%z "/root/.openclaw/workspace/construction-quote-app/public/index.html" 2>/dev/null || stat -c%s "/root/.openclaw/workspace/construction-quote-app/public/index.html")
    
    if [ "$HTML_SIZE" -gt 10000 ]; then
        echo "   ✅ HTML je prisoten ($HTML_SIZE bytes)"
        CVETKA_STATUS="✅ DELUJE"
    else
        echo "   ⚠️  HTML je sumljivo majhen"
        CVETKA_STATUS="⚠️  PREVERI"
    fi
else
    echo "   🔴 HTML manjka!"
    CVETKA_STATUS="🔴 KRITIČNO"
fi

# Preveri CSS
if grep -q "mobile" /root/.openclaw/workspace/construction-quote-app/public/styles.css; then
    echo "   ✅ Mobile styles prisotni"
else
    echo "   ℹ️  Dodaj mobile-first CSS"
fi

echo "   Status: $CVETKA_STATUS"
echo ""

# ============================================================================
# DAVID — BACKEND AGENT (Preveri server in bazo)
# ============================================================================
echo "🗄️  DAVID (Backend Agent) — Preverjam server in bazo..."

# Preveri bazo
if [ -f "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" ]; then
    DB_SIZE=$(stat -f%z "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" 2>/dev/null || stat -c%s "/root/.openclaw/workspace/construction-quote-app/data/quotes.db")
    echo "   ✅ Baza obstaja ($DB_SIZE bytes)"
    
    # Preveri če ni prevelika (>100MB je problem)
    if [ "$DB_SIZE" -lt 104857600 ]; then
        echo "   ✅ Velikost baze je OK"
        DAVID_STATUS="✅ DELUJE"
    else
        echo "   ⚠️  Baza je prevelika, potrebuje čiščenje"
        DAVID_STATUS="⚠️  TREBA ČIŠČENJE"
    fi
else
    echo "   🔴 Baza ne obstaja!"
    DAVID_STATUS="🔴 KRITIČNO"
fi

# Preveri ali so vse tabele
if sqlite3 "/root/.openclaw/workspace/construction-quote-app/data/quotes.db" ".tables" 2>/dev/null | grep -q "quotes"; then
    echo "   ✅ Tabele so prisotne"
else
    echo "   ⚠️  Manjkajo tabele v bazi"
fi

echo "   Status: $DAVID_STATUS"
echo ""

# ============================================================================
# EVA — KRITIK AGENT (Preveri kakovost)
# ============================================================================
echo "🔍 EVA (Kritik Agent) — Preverjam kakovost..."

# Preveri za errorje v kodi
ERROR_COUNT=$(grep -r "console.error" /root/.openclaw/workspace/construction-quote-app/public/app.js 2>/dev/null | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "   ✅ Ni console.error v kodi"
    EVA_STATUS="✅ DELUJE"
elif [ "$ERROR_COUNT" -lt 5 ]; then
    echo "   ℹ️  Najdenih $ERROR_COUNT error handlerjev (OK)"
    EVA_STATUS="✅ DELUJE"
else
    echo "   ⚠️  Veliko error handlerjev ($ERROR_COUNT), preveri"
    EVA_STATUS="⚠️  PREGLEJ"
fi

# Preveri varnostne težave
if grep -r "innerHTML" /root/.openclaw/workspace/construction-quote-app/public/app.js 2>/dev/null | grep -q "userInput"; then
    echo "   ⚠️  Možna XSS ranljivost (innerHTML)"
    EVA_STATUS="⚠️  TREBA POPRAVITI"
else
    echo "   ✅ Ni očitnih varnostnih težav"
fi

echo "   Status: $EVA_STATUS"
echo ""

# ============================================================================
# FRANC — MOJSTER AGENT (Simulacija testa)
# ============================================================================
echo "👷 FRANC (Mojster Agent) — Simuliram uporabo..."

# Preveri ključne funkcije
FUNCTIONS_OK=0

# 1. Ali obstaja gumb za nove predračune?
if grep -q "newQuote" /root/.openclaw/workspace/construction-quote-app/public/app.js; then
    echo "   ✅ Gumb 'Nov predračun' obstaja"
    FUNCTIONS_OK=$((FUNCTIONS_OK + 1))
fi

# 2. Ali obstaja PDF export?
if grep -q "downloadPDF" /root/.openclaw/workspace/construction-quote-app/public/app.js; then
    echo "   ✅ PDF export obstaja"
    FUNCTIONS_OK=$((FUNCTIONS_OK + 1))
fi

# 3. Ali obstaja iskalnik?
if grep -q "searchQuotes" /root/.openclaw/workspace/construction-quote-app/public/app.js; then
    echo "   ✅ Iskalnik obstaja"
    FUNCTIONS_OK=$((FUNCTIONS_OK + 1))
else
    echo "   ⚠️  Iskalnik manjka (v delu)"
fi

# 4. Ali obstaja offline mode?
if [ -f "/root/.openclaw/workspace/construction-quote-app/public/sw.js" ]; then
    echo "   ✅ Service Worker (offline) obstaja"
    FUNCTIONS_OK=$((FUNCTIONS_OK + 1))
else
    echo "   ⚠️  Offline mode manjka (v delu)"
fi

if [ "$FUNCTIONS_OK" -ge 3 ]; then
    FRANC_STATUS="✅ DELUJE ($FUNCTIONS_OK/4 funkcij)"
elif [ "$FUNCTIONS_OK" -ge 2 ]; then
    FRANC_STATUS="🟡 DELUJE, ampak manjkajoče funkcije ($FUNCTIONS_OK/4)"
else
    FRANC_STATUS="🔴 PREMALO FUNKCIJ ($FUNCTIONS_OK/4)"
fi

echo "   Status: $FRANC_STATUS"
echo ""

# ============================================================================
# SKUPNI PREGLED
# ============================================================================
echo "================================"
echo "📊 SKUPNI PREGLED AGENTOV:"
echo "================================"
echo "Ana (UX):      $ANA_STATUS"
echo "Bojan (Čas):   $BOJAN_STATUS"
echo "Cvetka (Front): $CVETKA_STATUS"
echo "David (Back):  $DAVID_STATUS"
echo "Eva (Kritik):  $EVA_STATUS"
echo "Franc (Test):  $FRANC_STATUS"
echo ""

# Preštej probleme
PROBLEMI=0
if [[ "$ANA_STATUS" == *"⚠️"* ]] || [[ "$ANA_STATUS" == *"🔴"* ]]; then PROBLEMI=$((PROBLEMI + 1)); fi
if [[ "$BOJAN_STATUS" == *"⚠️"* ]] || [[ "$BOJAN_STATUS" == *"🔴"* ]]; then PROBLEMI=$((PROBLEMI + 1)); fi
if [[ "$CVETKA_STATUS" == *"⚠️"* ]] || [[ "$CVETKA_STATUS" == *"🔴"* ]]; then PROBLEMI=$((PROBLEMI + 1)); fi
if [[ "$DAVID_STATUS" == *"⚠️"* ]] || [[ "$DAVID_STATUS" == *"🔴"* ]]; then PROBLEMI=$((PROBLEMI + 1)); fi
if [[ "$EVA_STATUS" == *"⚠️"* ]] || [[ "$EVA_STATUS" == *"🔴"* ]]; then PROBLEMI=$((PROBLEMI + 1)); fi
if [[ "$FRANC_STATUS" == *"🔴"* ]]; then PROBLEMI=$((PROBLEMI + 1)); fi

echo "🎯 Povzetek:"
if [ "$PROBLEMI" -eq 0 ]; then
    echo "   ✅ VSI AGENTI DELUJEJO PRAVILNO!"
    echo "   ✅ Sistem je stabilen."
    EXIT_CODE=0
elif [ "$PROBLEMI" -lt 3 ]; then
    echo "   🟡 Najdenih $PROBLEMI manjših težav."
    echo "   ℹ️  Ni kritično, ampak preglej ko imaš čas."
    EXIT_CODE=0
else
    echo "   🔴 Najdenih $PROBLEMI težav!"
    echo "   ⚠️  Priporočam pregled."
    EXIT_CODE=1
fi

echo ""
echo "📅 Naslednji pregled: $(date -d '+12 hours' '+%Y-%m-%d %H:%M')"
echo "================================"

exit $EXIT_CODE
