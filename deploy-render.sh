#!/bin/bash
# Deploy script for Moj Predracun to Render.com

echo "🚀 Deploying Moj Predracun to Render.com..."
echo ""

# Check if render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Installing Render CLI..."
    npm install -g @render/cli
fi

# Check if logged in
render whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "Please login to Render first:"
    echo "  render login"
    exit 1
fi

# Deploy
echo "Starting deployment..."
render deploy --service moj-predracun

echo ""
echo "✅ Deploy initiated!"
echo "Check status at: https://dashboard.render.com"
