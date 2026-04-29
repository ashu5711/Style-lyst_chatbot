#!/bin/bash
# EC2 Setup Script for Style-alyst Backend
# Run this on a fresh Amazon Linux 2023 / Ubuntu EC2 instance
# Instance recommendation: t3.large (2 vCPU, 8GB RAM) - CLIP model needs ~4GB RAM

set -e

echo "=== Style-alyst EC2 Setup ==="

# 1. System dependencies
sudo yum update -y 2>/dev/null || sudo apt-get update -y
sudo yum install -y python3 python3-pip git 2>/dev/null || sudo apt-get install -y python3 python3-pip git

# 2. Clone or copy your code (adjust as needed)
# git clone <your-repo-url> /home/ec2-user/style-alyst
# cd /home/ec2-user/style-alyst/backend

# 3. Install Python dependencies
pip3 install -r requirements_aws.txt

# 4. Set environment variables (edit these)
export AWS_REGION="us-east-1"
export S3_BUCKET="style-alyst-images"
export BEDROCK_MODEL_ID="anthropic.claude-sonnet-4-20250514"
export CHROMA_DB_DIR="./chroma_data"

# 5. Run the indexer if chroma_data doesn't exist yet
# python3 index_data.py

# 6. Start the server
echo "Starting server on port 8000..."
python3 server_aws.py
