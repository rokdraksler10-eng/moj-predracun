#!/bin/bash
# ============================================================================
# AGENT PRODUCTIVITY TRACKER — Sledi produktivnosti agentov
# ============================================================================
# To se izvede vsakih 12 ur in preveri, ali je vsak agent naredil kaj produktivnega

TRACKER_FILE="/root/.openclaw/workspace/construction-quote-app/agents/productivity-tracker.log"
DATE=$(date '+%Y-%m-%d')
TIME=$(date '+%H:%M')

echo "$(date) — Preverjam produktivnost agentov..." >> "$TRACKER_FILE"

# ============================================================================
# ANA — Preveri ali je bil narejen UX pregled
# ============================================================================
ANA_LAST=$(stat -f%m "/root/.openclaw/workspace/construction-quote-app/public/styles.css" 2>/dev/null || stat -c%Y "/root/.openclaw/workspace/construction-quote-app/public/styles.css" 2>/dev/null || echo 0)
CURRENT_TIME=$(date +%s)
TIME_DIFF=$(( (CURRENT_TIME - ANA_LAST) / 3600 ))

if [ "$TIME_DIFF" -lt 24 ]; then
    echo "✅ Ana (UX): Aktivna pred $TIME_DIFF urami" >> "$TRACKER_FILE"
    ANA_STATUS="ACTIVE"
else
    echo "⚠️  Ana (UX): Ni aktivnosti 24+ ur — PREGLEJ CSS DOSTOPNOST!" >> "$TRACKER_FILE"
    ANA_STATUS="INACTIVE"
fi

# ============================================================================
# BOJAN — Preveri ali so bile meritve
# ============================================================================
if [ -f "/root/.openclaw/workspace/construction-quote-app/agents/bojan-time/metrics.json" ]; then
    BOJAN_LAST=$(stat -f%m "/root/.openclaw/workspace/construction-quote-app/agents/bojan-time/metrics.json" 2>/dev/null || stat -c%Y "/root/.openclaw/workspace/construction-quote-app/agents/bojan-time/metrics.json" 2>/dev/null || echo 0)
    TIME_DIFF=$(( (CURRENT_TIME - BOJAN_LAST) / 3600 ))
    
    if [ "$TIME_DIFF" -lt 24 ]; then
        echo "✅ Bojan (Čas): Meritve pred $TIME_DIFF urami" >> "$TRACKER_FILE"
        BOJAN_STATUS="ACTIVE"
    else
        echo "⚠️  Bojan (Čas): Ni meritev 24+ ur — IZMERI HITROSTI!" >> "$TRACKER_FILE"
        BOJAN_STATUS="INACTIVE"
    fi
else
    echo "⚠️  Bojan (Čas): Ni datoteke z meritvami — USTVARI METRIKE!" >> "$TRACKER_FILE"
    BOJAN_STATUS="NO_DATA"
fi

# ============================================================================
# CVETKA — Preveri ali je bil narejen commit
# ============================================================================
CVETKA_COMMITS=$(cd /root/.openclaw/workspace/construction-quote-app && git log --since="12 hours ago" --author="cvetka\|frontend\|Cvetka" --oneline 2>/dev/null | wc -l || echo 0)

if [ "$CVETKA_COMMITS" -gt 0 ]; then
    echo "✅ Cvetka (Frontend): $CVETKA_COMMITS commitov v zadnjih 12 urah" >> "$TRACKER_FILE"
    CVETKA_STATUS="ACTIVE"
else
    # Preveri ali so bile datoteke spremenjene
    HTML_CHANGED=$(stat -f%m "/root/.openclaw/workspace/construction-quote-app/public/index.html" 2>/dev/null || stat -c%Y "/root/.openclaw/workspace/construction-quote-app/public/index.html" 2>/dev/null || echo 0)
    TIME_DIFF=$(( (CURRENT_TIME - HTML_CHANGED) / 3600 ))
    
    if [ "$TIME_DIFF" -lt 24 ]; then
        echo "✅ Cvetka (Frontend): Spremembe pred $TIME_DIFF urami" >> "$TRACKER_FILE"
        CVETKA_STATUS="ACTIVE"
    else
        echo "⚠️  Cvetka (Frontend): Ni sprememb 24+ ur — DELAJ NA UI!" >> "$TRACKER_FILE"
        CVETKA_STATUS="INACTIVE"
    fi
fi

# ============================================================================
# DAVID — Preveri ali server teče in so bili popravki
# ============================================================================
if pgrep -f "node server.js" > /dev/null; then
    # Preveri če je bil kakšen backend commit
    DAVID_COMMITS=$(cd /root/.openclaw/workspace/construction-quote-app && git log --since="24 hours ago" --author="david\|backend\|David" --oneline 2>/dev/null | wc -l || echo 0)
    
    if [ "$DAVID_COMMITS" -gt 0 ]; then
        echo "✅ David (Backend): $DAVID_COMMITS commitov, server teče" >> "$TRACKER_FILE"
        DAVID_STATUS="ACTIVE"
    else
        echo "🟡 David (Backend): Server teče, ni novih commitov (mogoče dela na nekaj večjem)" >> "$TRACKER_FILE"
        DAVID_STATUS="STABLE"
    fi
else
    echo "🔴 David (Backend): SERVER NE TEČE! ZAGNI GA!" >> "$TRACKER_FILE"
    DAVID_STATUS="DOWN"
fi

# ============================================================================
# EVA — Preveri ali je bil pregled kode
# ============================================================================
EVA_REVIEWS=$(cd /root/.openclaw/workspace/construction-quote-app && git log --since="24 hours ago" --grep="review\|Review\|EVA\|eva" --oneline 2>/dev/null | wc -l || echo 0)

if [ "$EVA_REVIEWS" -gt 0 ]; then
    echo "✅ Eva (Kritik): $EVA_REVIEWS pregledov v zadnjih 24 urah" >> "$TRACKER_FILE"
    EVA_STATUS="ACTIVE"
else
    echo "⚠️  Eva (Kritik): Ni pregledov 24+ ur — PREGLEJ KODO!" >> "$TRACKER_FILE"
    EVA_STATUS="INACTIVE"
fi

# ============================================================================
# FRANC — Preveri ali je bil test
# ============================================================================
if [ -f "/root/.openclaw/workspace/construction-quote-app/agents/franc-master/TEST_REPORT_1.md" ]; then
    FRANC_LAST=$(stat -f%m "/root/.openclaw/workspace/construction-quote-app/agents/franc-master/TEST_REPORT_1.md" 2>/dev/null || stat -c%Y "/root/.openclaw/workspace/construction-quote-app/agents/franc-master/TEST_REPORT_1.md" 2>/dev/null || echo 0)
    DAYS_DIFF=$(( (CURRENT_TIME - FRANC_LAST) / 86400 ))
    
    if [ "$DAYS_DIFF" -lt 7 ]; then
        echo "✅ Franc (Mojster): Test pred $DAYS_DIFF dnevi" >> "$TRACKER_FILE"
        FRANC_STATUS="ACTIVE"
    else
        echo "⚠️  Franc (Mojster): Ni testa 7+ dni — NAREDITE TEST!" >> "$TRACKER_FILE"
        FRANC_STATUS="INACTIVE"
    fi
else
    echo "⚠️  Franc (Mojster): Ni test reporta — NAREDI PRVI TEST!" >> "$TRACKER_FILE"
    FRANC_STATUS="NO_DATA"
fi

# ============================================================================
# SKUPNI PREGLED
# ============================================================================
echo "" >> "$TRACKER_FILE"
echo "=== SKUPNA OCENA ===" >> "$TRACKER_FILE"
echo "Čas: $TIME" >> "$TRACKER_FILE"

ACTIVE_COUNT=0
if [ "$ANA_STATUS" = "ACTIVE" ]; then ACTIVE_COUNT=$((ACTIVE_COUNT + 1)); fi
if [ "$BOJAN_STATUS" = "ACTIVE" ] || [ "$BOJAN_STATUS" = "NO_DATA" ]; then ACTIVE_COUNT=$((ACTIVE_COUNT + 1)); fi
if [ "$CVETKA_STATUS" = "ACTIVE" ]; then ACTIVE_COUNT=$((ACTIVE_COUNT + 1)); fi
if [ "$DAVID_STATUS" = "ACTIVE" ] || [ "$DAVID_STATUS" = "STABLE" ]; then ACTIVE_COUNT=$((ACTIVE_COUNT + 1)); fi
if [ "$EVA_STATUS" = "ACTIVE" ]; then ACTIVE_COUNT=$((ACTIVE_COUNT + 1)); fi
if [ "$FRANC_STATUS" = "ACTIVE" ] || [ "$FRANC_STATUS" = "NO_DATA" ]; then ACTIVE_COUNT=$((ACTIVE_COUNT + 1)); fi

echo "Aktivnih agentov: $ACTIVE_COUNT/6" >> "$TRACKER_FILE"

if [ "$ACTIVE_COUNT" -ge 4 ]; then
    echo "✅ Ekipa je produktivna!" >> "$TRACKER_FILE"
elif [ "$ACTIVE_COUNT" -ge 2 ]; then
    echo "🟡 Nekateri agenti niso aktivni — preveri" >> "$TRACKER_FILE"
else
    echo "🔴 Premajhna aktivnost — PREGLEJ SISTEM!" >> "$TRACKER_FILE"
fi

echo "====================" >> "$TRACKER_FILE"
echo "" >> "$TRACKER_FILE"

# ============================================================================
# AKCIJE — Če je nekaj narobe, predlagaj akcije
# ============================================================================

if [ "$DAVID_STATUS" = "DOWN" ]; then
    echo "🔴 URGENTNO: Zagnati moraš server!" >> "$TRACKER_FILE"
    echo "   Ukaz: cd /root/.openclaw/workspace/construction-quote-app && npm start" >> "$TRACKER_FILE"
fi

if [ "$ANA_STATUS" = "INACTIVE" ]; then
    echo "⚠️  Predlagana akcija za Ano: Preveri CSS velikosti" >> "$TRACKER_FILE"
    echo "   Preveri: public/styles.css (min-height: 48px)" >> "$TRACKER_FILE"
fi

if [ "$CVETKA_STATUS" = "INACTIVE" ]; then
    echo "⚠️  Predlagana akcija za Cvetko: Delaj na iskalniku" >> "$TRACKER_FILE"
    echo "   Datoteka: public/app.js (funkcija searchQuotes)" >> "$TRACKER_FILE"
fi

echo "---" >> "$TRACKER_FILE"

# Izpiši na konzolo za pregled
cat "$TRACKER_FILE" | tail -n 30
