# AWS Deployment Guide: Style-alyst on Amazon Bedrock + EC2 + S3

## Architecture

```
Browser (React on localhost:5173)
    |
    |--- /api/chat ---------> EC2 (FastAPI :8000) ----> Amazon Bedrock (Claude Sonnet)
    |--- /api/analyze ------> EC2 (FastAPI :8000) ----> Amazon Bedrock (Claude Sonnet)
    |--- /search -----------> EC2 (FastAPI :8000) ----> ChromaDB + CLIP (local on EC2)
    |
    |--- Product images ----> S3 Bucket (public read)
```

### What Changed from Gemini

| Before (Gemini) | After (AWS) |
|---|---|
| Gemini API called from browser | Bedrock Claude called from backend (server-side) |
| API key stored in localStorage | IAM role on EC2 (no keys in browser) |
| Images served from local filesystem | Images served from S3 |
| Settings panel for API key | Removed (not needed) |

## Prerequisites

- AWS account with Bedrock access
- AWS CLI configured locally (`aws configure`)
- Bedrock model access enabled for `anthropic.claude-sonnet-4-20250514` in your region

## Step 1: Enable Bedrock Model Access

1. Go to **Amazon Bedrock** console -> **Model access** (left sidebar)
2. Click **Manage model access**
3. Enable **Anthropic Claude 3.5 Sonnet** (or Claude 3 Sonnet)
4. Wait for status to show "Access granted"

> If Claude Sonnet is not available in your region, use `us-east-1` or `us-west-2`.

## Step 2: Create S3 Bucket for Images

```bash
# Create bucket
aws s3 mb s3://style-alyst-images --region us-east-1

# Set public read policy (for prototype only)
aws s3api put-public-access-block \
  --bucket style-alyst-images \
  --public-access-block-configuration \
  BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

# Apply bucket policy for public read
cat > /tmp/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::style-alyst-images/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket style-alyst-images --policy file:///tmp/bucket-policy.json
```

## Step 3: Upload Dataset to S3

From your local machine (where the clothing dataset lives):

```bash
cd backend/
python upload_to_s3.py \
  --bucket style-alyst-images \
  --dataset-dir "/path/to/your/archive" \
  --region us-east-1
```

This uploads all 16k images. Takes ~10-20 minutes depending on connection.

## Step 4: Launch EC2 Instance

1. Go to **EC2** console -> **Launch Instance**
2. Settings:
   - **Name**: style-alyst-backend
   - **AMI**: Amazon Linux 2023 (or Ubuntu 22.04)
   - **Instance type**: `t3.large` (8GB RAM needed for CLIP model)
   - **Key pair**: Create or select one for SSH
   - **Security group**: Allow inbound:
     - SSH (port 22) from your IP
     - Custom TCP (port 8000) from anywhere (0.0.0.0/0)
   - **Storage**: 30 GB gp3

3. **Attach IAM Role** (critical):
   - Create an IAM role with these policies:
     - `AmazonBedrockFullAccess`
     - `AmazonS3ReadOnlyAccess`
   - Attach it to the EC2 instance (Actions -> Security -> Modify IAM role)

## Step 5: Deploy Backend to EC2

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Install dependencies
sudo yum update -y
sudo yum install -y python3 python3-pip git

# Copy your code (option A: git clone, option B: scp)
# Option A:
git clone <your-repo-url>
cd Style-lyst_chatbot/backend

# Option B (from your local machine):
# scp -i your-key.pem -r backend/ ec2-user@<EC2_PUBLIC_IP>:~/backend/

# Install Python packages
pip3 install -r requirements_aws.txt

# Set environment variables
export AWS_REGION="us-east-1"
export S3_BUCKET="style-alyst-images"
export BEDROCK_MODEL_ID="anthropic.claude-sonnet-4-20250514"
```

## Step 6: Index Data on EC2 (if not already done)

If you haven't copied `chroma_data/` from your local machine:

```bash
# Option A: Copy pre-built chroma_data from local
# scp -i your-key.pem -r chroma_data/ ec2-user@<EC2_PUBLIC_IP>:~/backend/chroma_data/

# Option B: Re-index on EC2 (requires dataset images locally on EC2 too)
# python3 index_data.py
```

Recommended: Just copy the `chroma_data/` directory from your local machine. It's much faster than re-indexing.

## Step 7: Start the Backend

```bash
# Start server (foreground for testing)
python3 server_aws.py

# Or run in background with nohup
nohup python3 server_aws.py > server.log 2>&1 &

# Verify it's running
curl http://localhost:8000/health
```

## Step 8: Point Frontend to EC2

On your local machine, create a `.env` file in the frontend directory:

```bash
# frontend/.env
VITE_API_BASE=http://<EC2_PUBLIC_IP>:8000
```

Then switch to the AWS versions of the files:

```bash
cd frontend/src

# Swap App entry point
cp App.jsx App.local.jsx          # backup original
cp App.aws.jsx App.jsx            # use AWS version

# Start frontend
cd ..
npm run dev
```

The frontend now calls your EC2 backend, which calls Bedrock for AI and serves images from S3.

## Step 9: Test

1. Open `http://localhost:5173`
2. Navigate to the PDP page
3. Click the Style-alyst chat button
4. Type "complete this look for a summer wedding"
5. You should see an outfit recommendation with images from S3

## Quick Local Test (No EC2)

You can test the Bedrock integration locally before deploying to EC2:

```bash
# Make sure AWS CLI is configured with Bedrock access
aws configure

cd backend/
pip install -r requirements_aws.txt

# Set env vars
export AWS_REGION="us-east-1"
export S3_BUCKET="style-alyst-images"
export BEDROCK_MODEL_ID="anthropic.claude-sonnet-4-20250514"

# Start server locally
python server_aws.py
```

Then in another terminal:
```bash
cd frontend/
# No .env needed - defaults to localhost:8000
cp src/App.aws.jsx src/App.jsx
npm run dev
```

## Cost Estimate (Prototype)

| Service | Cost |
|---|---|
| EC2 t3.large | ~$0.08/hr (~$60/month if always on) |
| S3 (16k images, ~5GB) | ~$0.12/month storage + negligible transfer |
| Bedrock Claude Sonnet | ~$0.003/input 1K tokens, $0.015/output 1K tokens |
| **Total for demo** | **< $5 for a day of testing** |

Tip: Stop the EC2 instance when not demoing to save costs.

## Troubleshooting

**"AccessDeniedException" from Bedrock:**
- Ensure the IAM role attached to EC2 has `AmazonBedrockFullAccess`
- Ensure the model is enabled in Bedrock console -> Model access
- Check the region matches (`AWS_REGION` env var)

**Images not loading from S3:**
- Verify bucket policy allows public read
- Check bucket name matches `S3_BUCKET` env var
- Test: `curl https://style-alyst-images.s3.us-east-1.amazonaws.com/<any_image_path>`

**CLIP model fails to load on EC2:**
- Ensure instance has at least 8GB RAM (t3.large)
- First load downloads ~400MB model weights

**CORS errors in browser:**
- The FastAPI server allows all origins. If still failing, check the EC2 security group allows port 8000.

## Files Reference

| File | Purpose |
|---|---|
| `backend/server_aws.py` | FastAPI server with Bedrock + S3 + ChromaDB |
| `backend/upload_to_s3.py` | One-time script to upload images to S3 |
| `backend/requirements_aws.txt` | Python dependencies including boto3 |
| `backend/ec2_setup.sh` | EC2 bootstrap script |
| `frontend/src/services/aiService.aws.js` | Frontend service calling backend API |
| `frontend/src/components/Chatbot/Chatbot.aws.jsx` | Chatbot without Gemini settings panel |
| `frontend/src/components/MatchMap/MatchMap.aws.jsx` | MatchMap calling backend API |
| `frontend/src/App.aws.jsx` | App entry using AWS components |
