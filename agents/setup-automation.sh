#!/bin/bash
# ============================================================================
# NASTAVI AVTOMATSKI SISTEM AGENTOV
# ============================================================================

echo "🤖 Nastavljam avtomatski sistem agentov..."
echo ""

# Preveri ali smo v pravi mapi
if [ ! -f "/root/.openclaw/workspace/construction-quote-app/agents/daily-check.sh" ]; then
    echo "❌ Napaka: Ne najdem skript!"
    echo "   Preveri da si v construction-quote-app mapi"
    exit 1
fi

# Naredi log direktorij
mkdir -p /root/.openclaw/workspace/construction-quote-app/agents/logs
mkdir -p /root/.openclaw/workspace/construction-quote-app/agents/reports
mkdir -p /root/.openclaw/workspace/construction-quote-app/backups

echo "✅ Direktoriji ustvarjeni"

# Nastavi pravice
chmod +x /root/.openclaw/workspace/construction-quote-app/agents/*.sh
echo "✅ Skripte so izvršljive"

# Preveri ali je crontab nameščen
if ! command -v crontab &> /dev/null; then
    echo "⚠️  crontab ni nameščen. Nameščam..."
    apt-get update && apt-get install -y cron
    service cron start
fi

# Ustvari začasno crontab datoteko
cat > /tmp/agent-crontab << 'EOF'
# AGENT EKIPA — Avtomatski sistem
# =================================

# Vsakih 12 ur — Preveri produktivnost agentov
0 */12 * * * /root/.openclaw/workspace/construction-quote-app/agents/track-productivity.sh >> /root/.openclaw/workspace/construction-quote-app/agents/logs/productivity.log 2>&1

# Ob 06:00 — Jutranji pregled
0 6 * * * /root/.openclaw/workspace/construction-quote-app/agents/daily-check.sh >> /root/.openclaw/workspace/construction-quote-app/agents/logs/morning-check.log 2>&1

# Ob 12:00 — Opoldanski pregled
0 12 * * * /root/.openclaw/workspace/construction-quote-app/agents/daily-check.sh >> /root/.openclaw/workspace/construction-quote-app/agents/logs/noon-check.log 2>&1

# Ob 18:00 — Večerni pregled + report
0 18 * * * /root/.openclaw/workspace/construction-quote-app/agents/daily-check.sh >> /root/.openclaw/workspace/construction-quote-app/agents/logs/evening-check.log 2>&1
5 18 * * * /root/.openclaw/workspace/construction-quote-app/agents/generate-daily-report.sh >> /root/.openclaw/workspace/construction-quote-app/agents/logs/report-generation.log 2>&1

# Ob 03:00 — Backup baze
0 3 * * * cp /root/.openclaw/workspace/construction-quote-app/data/quotes.db /root/.openclaw/workspace/construction-quote-app/backups/quotes_$(date +\%Y\%m\%d).db
5 3 * * * find /root/.openclaw/workspace/construction-quote-app/backups -name "quotes_*.db" -mtime +30 -delete

# Ob nedeljo 23:00 — Tedenski report
0 23 * * 0 /root/.openclaw/workspace/construction-quote-app/agents/generate-daily-report.sh >> /root/.openclaw/workspace/construction-quote-app/agents/logs/weekly-report.log 2>&1
EOF

# Namesti crontab
crontab /tmp/agent-crontab
rm /tmp/agent-crontab

echo "✅ Cron job-i nameščeni"
echo ""

# Preveri namestitev
echo "📋 Nameščeni cron job-i:"
crontab -l | grep -v "^#" | grep -v "^$" || echo "Ni aktivnih cron jobov"
echo ""

# Zaženi prvi pregled
echo "🚀 Začenjam prvi pregled..."
/root/.openclaw/workspace/construction-quote-app/agents/daily-check.sh

echo ""
echo "========================================"
echo "✅ AVTOMATSKI SISTEM JE AKTIVEN!"
echo "========================================"
echo ""
echo "📊 Kaj se dogaja avtomatsko:"
echo "   • Vsakih 12 ur: Preverka produktivnosti"
echo "   • Ob 06:00: Jutranji pregled"
echo "   • Ob 12:00: Opoldanski pregled"
echo "   • Ob 18:00: Večerni pregled + poročilo"
echo "   • Ob 03:00: Backup baze"
echo "   • Ob nedeljah: Tedenski report"
echo ""
echo "📁 Lokacije:"
echo "   • Logi: /agents/logs/"
echo "   • Reporti: /agents/reports/"
echo "   • Backupi: /backups/"
echo ""
echo "📖 Navodila:"
echo "   • Preglej reporte v /agents/reports/"
echo "   • Če je kaj narobe, javi takoj"
echo "   • Sistem teče sam, ti samo spremljaj"
echo ""
echo "🎯 Naslednji korak:"
echo "   Počakaj do 18:00 za prvi dnevni report"
echo "   ali ročno zaženi: ./agents/generate-daily-report.sh"
echo ""
echo "Za izklop: crontab -r"
echo "Za pregled: crontab -l"
echo "========================================"
