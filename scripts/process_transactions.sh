#!/bin/bash

# Dominion Trust Bank - Transaction Processing Cron Script
# This script processes pending transactions automatically

# Set paths
PROJECT_DIR="/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend"
PYTHON_PATH="/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend/venv/bin/python"
LOG_DIR="/Users/chiagoziestanley/Dev-space/DominionTrust_Bank/backend/logs"
LOG_FILE="$LOG_DIR/transaction_processing.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log start time
echo "=== Transaction Processing Started: $(date) ===" >> "$LOG_FILE"

# Change to project directory
cd "$PROJECT_DIR"

# Run the management command
"$PYTHON_PATH" manage.py process_pending_transactions >> "$LOG_FILE" 2>&1

# Check exit status
if [ $? -eq 0 ]; then
    echo "=== Transaction Processing Completed Successfully: $(date) ===" >> "$LOG_FILE"
    exit 0
else
    echo "=== Transaction Processing Failed: $(date) ===" >> "$LOG_FILE"
    exit 1
fi 