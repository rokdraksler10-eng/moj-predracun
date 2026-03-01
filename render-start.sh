#!/bin/bash
# Render start script - works without disk

# Create data directory in project folder (not /data)
mkdir -p ./data

# Initialize database
node scripts/init-db.js

# Start server
node server.js
