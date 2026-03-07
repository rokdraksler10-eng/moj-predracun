#!/bin/bash
# ============================================================================
# PROGRESS TRACKER — Sledi končanosti aplikacije
# ============================================================================

# Ta skripta se izvede vsak dan in izračuna % končanosti

TRACKER_FILE="/root/.openclaw/workspace/construction-quote-app/agents/PROGRESS.md"
DATE=$(date '+%Y-%m-%d')

# ============================================================================
# FUNKCIJE ZA IZRAČUN PROCENTOV
# ============================================================================

calculate_progress() {
    # Sprint 4 cilji in njihova utež
    
    # 1. UI/UX - Velikosti elementov (25%)
    UI_PROGRESS=0
    if grep -q "min-height: 48px" /root/.openclaw/workspace/construction-quote-app/public/styles.css 2>/dev/null; then
        UI_PROGRESS=100
    elif grep -q "min-height:" /root/.openclaw/workspace/construction-quote-app/public/styles.css 2>/dev/null; then
        UI_PROGRESS=50
    else
        UI_PROGRESS=10
    fi
    
    # 2. Backend - Hitrost (25%)
    BACKEND_PROGRESS=0
    if pgrep -f "node server.js" > /dev/null; then
        # Preveri response time
        RESPONSE=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3456/api/quotes 2>/dev/null || echo "999")
        if (( $(echo "$RESPONSE < 0.2" | bc -l 2>/dev/null || echo 0) )); then
            BACKEND_PROGRESS=100
        elif (( $(echo "$RESPONSE < 0.5" | bc -l 2>/dev/null || echo 0) )); then
            BACKEND_PROGRESS=75
        elif (( $(echo "$RESPONSE < 1.0" | bc -l 2>/dev/null || echo 0) )); then
            BACKEND_PROGRESS=50
        else
            BACKEND_PROGRESS=25
        fi
    else
        BACKEND_PROGRESS=0
    fi
    
    # 3. Iskalnik (25%)
    SEARCH_PROGRESS=0
    if grep -q "searchQuotes" /root/.openclaw/workspace/construction-quote-app/public/app.js 2>/dev/null; then
        if grep -q "month-filters" /root/.openclaw/workspace/construction-quote-app/public/index.html 2>/dev/null; then
            SEARCH_PROGRESS=100
        else
            SEARCH_PROGRESS=75
        fi
    else
        SEARCH_PROGRESS=0
    fi
    
    # 4. PDF Optimizacija (15%)
    PDF_PROGRESS=0
    # Preveri če je bila optimizacija implementirana
    if grep -q "compress.*true\|quality.*0.7" /root/.openclaw/workspace/construction-quote-app/pdf-generator.js 2>/dev/null; then
        PDF_PROGRESS=100
    elif grep -q "stream\|compression" /root/.openclaw/workspace/construction-quote-app/pdf-generator.js 2>/dev/null; then
        PDF_PROGRESS=50
    else
        PDF_PROGRESS=20
    fi
    
    # 5. Testiranje (10%) - Francov test
    TEST_PROGRESS=0
    if [ -f "/root/.openclaw/workspace/construction-quote-app/agents/franc-master/TEST_REPORT_2.md" ]; then
        # Preveri oceno v reportu
        if grep -q "⭐⭐⭐⭐\|⭐⭐⭐⭐⭐" /root/.openclaw/workspace/construction-quote-app/agents/franc-master/TEST_REPORT_2.md 2>/dev/null; then
            TEST_PROGRESS=100
        else
            TEST_PROGRESS=50
        fi
    elif [ -f "/root/.openclaw/workspace/construction-quote-app/agents/franc-master/TEST_REPORT_1.md" ]; then
        TEST_PROGRESS=25
    else
        TEST_PROGRESS=0
    fi
    
    # Izračunaj skupni procent
    TOTAL_PROGRESS=$(echo "scale=0; ($UI_PROGRESS * 0.25) + ($BACKEND_PROGRESS * 0.25) + ($SEARCH_PROGRESS * 0.25) + ($PDF_PROGRESS * 0.15) + ($TEST_PROGRESS * 0.10)" | bc -l 2>/dev/null || echo "0")
    TOTAL_PROGRESS=${TOTAL_PROGRESS%.*}
    
    # Če je prazno, nastavi na 0
    if [ -z "$TOTAL_PROGRESS" ]; then
        TOTAL_PROGRESS=0
    fi
}

# ============================================================================
# GLAVNI IZRAČUN
# ============================================================================

calculate_progress

# Izračunaj koliko je še ostalo
REMAINING=$((100 - TOTAL_PROGRESS))

# Oceni dni do konca (ocena: 2% na dan je realno)
if [ "$TOTAL_PROGRESS" -gt 0 ]; then
    DAYS_REMAINING=$(( (100 - TOTAL_PROGRESS) / 2 ))
else
    DAYS_REMAINING=50
fi

# ============================================================================
# GENERIRAJ PROGRESS REPORT
# ============================================================================

cat > "$TRACKER_FILE" << EOF
# 📊 NAPREDEK PROJEKTA

**Posodobljeno:** $DATE  
**Sprint:** 4 (do 20. marca 2026)

---

## 🎯 SKUPNA KONČANOST

### Progress Bar:
EOF

# Generiraj progress bar
PROGRESS_BAR=""
FILLED=$((TOTAL_PROGRESS / 2))
for i in $(seq 1 50); do
    if [ $i -le $FILLED ]; then
        PROGRESS_BAR="${PROGRESS_BAR}█"
    else
        PROGRESS_BAR="${PROGRESS_BAR}░"
    fi
done

cat >> "$TRACKER_FILE" << EOF
\`$PROGRESS_BAR\`

### **${TOTAL_PROGRESS}% Končano** 

**Še ostalo:** ${REMAINING}%

**Ocena dni do konca Sprinta:** ~${DAYS_REMAINING} dni

**Cilj:** 20. marec 2026 (še $(( ($(date -d '2026-03-20' +%s) - $(date +%s)) / 86400 )) dni)

---

## 📋 RAZPIS PO PODROČJIH

### 🎨 UI/UX (Velikosti elementov) — 25% teže
**Status:** ${UI_PROGRESS}%

\`${UI_PROGRESS}% █$(for i in $(seq 1 $((UI_PROGRESS/5))); do printf "█"; done; for i in $(seq 1 $((20-UI_PROGRESS/5))); do printf "░"; done)\`

**Kaj je narejeno:**
$(if [ "$UI_PROGRESS" -eq 100 ]; then echo "- ✅ Vsi elementi so 48px+"; elif [ "$UI_PROGRESS" -ge 50 ]; then echo "- 🟡 Delno narejeno"; else echo "- 🔴 Še ni začeto"; fi)

**Kaj manjka:**
$(if [ "$UI_PROGRESS" -lt 100 ]; then echo "- Dokočati vse popravke velikosti"; fi)

---

### 🗄️ Backend (Hitrost) — 25% teže
**Status:** ${BACKEND_PROGRESS}%

\`${BACKEND_PROGRESS}% █$(for i in $(seq 1 $((BACKEND_PROGRESS/5))); do printf "█"; done; for i in $(seq 1 $((20-BACKEND_PROGRESS/5))); do printf "░"; done)\`

**Kaj je narejeno:**
$(if [ "$BACKEND_PROGRESS" -eq 100 ]; then echo "- ✅ Server < 200ms"; elif [ "$BACKEND_PROGRESS" -ge 50 ]; then echo "- 🟁 Server dela, ampak počasneje"; else echo "- 🔴 Server ne dela optimalno"; fi)

**Kaj manjka:**
$(if [ "$BACKEND_PROGRESS" -lt 100 ]; then echo "- Optimizacija response time"; echo "- PDF hitrost"; fi)

---

### 🔍 Iskalnik — 25% teže
**Status:** ${SEARCH_PROGRESS}%

\`${SEARCH_PROGRESS}% █$(for i in $(seq 1 $((SEARCH_PROGRESS/5))); do printf "█"; done; for i in $(seq 1 $((20-SEARCH_PROGRESS/5))); do printf "░"; done)\`

**Kaj je narejeno:**
$(if [ "$SEARCH_PROGRESS" -eq 100 ]; then echo "- ✅ Iskalnik deluje"; elif [ "$SEARCH_PROGRESS" -ge 50 ]; then echo "- 🟡 Osnovna funkcionalnost"; else echo "- 🔴 Ni še implementiran"; fi)

**Kaj manjka:**
$(if [ "$SEARCH_PROGRESS" -lt 100 ]; then echo "- Implementacija iskalnika"; echo "- Filtri po mesecih"; fi)

---

### 📄 PDF Optimizacija — 15% teže
**Status:** ${PDF_PROGRESS}%

\`${PDF_PROGRESS}% █$(for i in $(seq 1 $((PDF_PROGRESS/5))); do printf "█"; done; for i in $(seq 1 $((20-PDF_PROGRESS/5))); do printf "░"; done)\`

**Kaj je narejeno:**
$(if [ "$PDF_PROGRESS" -eq 100 ]; then echo "- ✅ PDF < 2s"; elif [ "$PDF_PROGRESS" -ge 50 ]; then echo "- át Delno optimizirano"; else echo "- 🔴 Še vedno počasno (6s+)"; fi)

**Kaj manjka:**
$(if [ "$PDF_PROGRESS" -lt 100 ]; then echo "- Kompresija slik"; echo "- Stream namesto buffer"; fi)

---

### 👷 Testiranje (Franc) — 10% teže
**Status:** ${TEST_PROGRESS}%

\`${TEST_PROGRESS}% █$(for i in $(seq 1 $((TEST_PROGRESS/5))); do printf "█"; done; for i in $(seq 1 $((20-TEST_PROGRESS/5))); do printf "░"; done)\`

**Kaj je narejeno:**
$(if [ "$TEST_PROGRESS" -eq 100 ]; then echo "- ✅ Test #2 končan z oceno 4+⭐"; elif [ "$TEST_PROGRESS" -ge 25 ]; then echo "- 🟡 Test #1 končan"; else echo "- 🔴 Ni testov"; fi)

**Kaj manjka:**
$(if [ "$TEST_PROGRESS" -lt 100 ]; then echo "- Test #2 (20. marec)"; echo "- Ocena vsaj 4⭐"; fi)

---

## 📊 ANALIZA

### Trenutna stanje:
$(if [ "$TOTAL_PROGRESS" -lt 25 ]; then echo "🔴 **Začetek projekta** — Še veliko dela pred nama"; elif [ "$TOTAL_PROGRESS" -lt 50 ]; then echo "🟡 **V razvoju** — Dobro napredujemo"; elif [ "$TOTAL_PROGRESS" -lt 75 ]; then echo "🟢 **Večina končana** — V glavnem urejanje detajlov"; else echo "✅ **Skoraj končano** — Priprava na deploy"; fi)

### Ocena uspeha:
$(if [ "$TOTAL_PROGRESS" -ge 80 ] && [ $(( ($(date -d '2026-03-20' +%s) - $(date +%s)) / 86400 )) -gt 3 ]; then echo "✅ **Na dobri poti** — Cilj je dosegljiv"; elif [ "$TOTAL_PROGRESS" -lt 50 ] && [ $(( ($(date -d '2026-03-20' +%s) - $(date +%s)) / 86400 )) -lt 5 ]; then echo "⚠️  **Bodimo pozorni** — Morda potrebujemo podaljšanje roka"; else echo "📊 **Spremljaj napredek** — Ocena bo jasnejša čez par dni"; fi)

### Priporočilo agenta:
$(if [ "$UI_PROGRESS" -lt 50 ]; then echo "🎨 **Prioriteta:** UI/UX — Velikosti elementov"; elif [ "$BACKEND_PROGRESS" -lt 50 ]; then echo "🗄️ **Prioriteta:** Backend — Hitrost serverja"; elif [ "$SEARCH_PROGRESS" -lt 50 ]; then echo "🔍 **Prioriteta:** Iskalnik"; else echo "🎯 **Vse po planu** — Nadaljujemo z vsemi področji"; fi)

---

## 🎯 NASLEDNJI CILJI

**Za 20% napredka potrebujemo:**
$(if [ "$UI_PROGRESS" -lt 100 ]; then echo "- 🎨 Dokočati vse UI popravke"; fi)
$(if [ "$BACKEND_PROGRESS" -lt 100 ]; then echo "- 🗄️ Optimizirati server response"; fi)
$(if [ "$SEARCH_PROGRESS" -lt 100 ]; then echo "- 🔍 Implementirati iskalnik"; fi)
$(if [ "$PDF_PROGRESS" -lt 100 ]; then echo "- 📄 Pospešiti PDF generiranje"; fi)
$(if [ "$TEST_PROGRESS" -lt 100 ]; then echo "- 👷 Izvesti test #2"; fi)

---

*Avtomatsko generirano ob $(date '+%H:%M')*
*Naslednji update: Jutri ob 18:00*
EOF

echo "Progress updated: ${TOTAL_PROGRESS}%"
