#!/bin/bash
# Usage: ./switch_to_aws.sh <EC2_PUBLIC_IP>
# Example: ./switch_to_aws.sh 54.123.45.67

if [ -z "$1" ]; then
  echo "Usage: ./switch_to_aws.sh <EC2_PUBLIC_IP>"
  echo "Example: ./switch_to_aws.sh 54.123.45.67"
  exit 1
fi

EC2_IP=$1
FRONTEND_DIR="$(dirname "$0")/frontend"

echo "Switching to AWS mode..."

# Backup originals
cp "$FRONTEND_DIR/src/App.jsx" "$FRONTEND_DIR/src/App.local.jsx" 2>/dev/null

# Swap to AWS versions
cp "$FRONTEND_DIR/src/App.aws.jsx" "$FRONTEND_DIR/src/App.jsx"

# Create .env with EC2 IP
echo "VITE_API_BASE=http://$EC2_IP:8000" > "$FRONTEND_DIR/.env"

echo "Done! Frontend now points to http://$EC2_IP:8000"
echo "Run: cd frontend && npm run dev"
