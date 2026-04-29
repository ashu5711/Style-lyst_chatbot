# Sty-Lyst Chatbot & Sty-Seek

A high-end boutique personal stylist agent designed for JCPenney. This MVP includes an intelligent multi-feature chat widget, a visual inspiration engine, and a product Q&A system, powered by Amazon Bedrock (Claude Sonnet 4.6) and a CLIP-based visual vector search.

## Features

1. **Comp-Lyst** (Complete the Look) -- An AI stylist chat that builds coordinated 4-piece outfits (top, bottom, shoes, accessory) around the current product. Supports text prompts, image uploads, and camera capture. Returns structured JSON rendered as horizontal product carousels with real catalog images.

2. **Sty-Seek** (Visual Inspiration Search) -- A dedicated page where users upload or photograph a full outfit. The AI detects individual clothing items (placing interactive hotspots over them). Clicking a hotspot triggers a visual vector search to find similar items from 16,000+ catalog items.

3. **Ask Me Anything** (Product Q&A) -- A chat mode grounded in the product spec sheet and 60 verified customer reviews. Answers questions about sizing, fabric, care, color accuracy, and what real customers are saying.

4. **Legacy Chat** -- Placeholder for future general assistant (coming soon).

5. **Sty-Lyst Landing Page** -- A marketing page at `/style-lyst` showcasing all three AI features with hero section, feature cards, how-it-works steps, and tech stack callout.

## Architecture

```
localhost:5173 (React SPA)
    |
    +-- /api/chat -------> localhost:8000 (FastAPI) --> Amazon Bedrock (Claude Sonnet 4.6)
    |                           |
    +-- /api/analyze ----> localhost:8000 (FastAPI) --> Amazon Bedrock (Claude Sonnet 4.6)
    |                           |
    +-- /api/product-qa -> localhost:8000 (FastAPI) --> Amazon Bedrock (Claude Sonnet 4.6)
    |                           |                       + product.json + reviews.json
    +-- /search ---------> localhost:8000 (FastAPI) --> ChromaDB + CLIP (local)
    |
    +-- Product images --> S3 bucket (style-alyst-images-as)
```

- Frontend: React 18, Vite, Framer Motion, React Router, lucide-react
- Backend: Python 3.9, FastAPI, ChromaDB, SentenceTransformers (CLIP), boto3
- AI: Amazon Bedrock -- Claude Sonnet 4.6 (via cross-region inference profile `us.anthropic.claude-sonnet-4-6`)
- Storage: Amazon S3 (16,170 clothing images across 37 categories, public read)
- Auth: AWS CLI credentials (boto3 picks up from `~/.aws/credentials`)

## AWS Services Used

| Service | Purpose |
|---|---|
| Amazon Bedrock | Vision LLM (Claude Sonnet 4.6) for outfit recommendations, garment detection, and product Q&A |
| Amazon S3 | Stores 16,170 clothing images across 37 categories |
| AWS CLI / boto3 | Authentication and API calls from the backend |

## Getting Started

### Prerequisites
- AWS CLI configured (`aws configure`) with Bedrock and S3 access
- Claude Sonnet 4.6 enabled in Amazon Bedrock Model catalog (us-east-1)
- S3 bucket `style-alyst-images-as` with images uploaded and public read policy
- Python 3.9+, Node.js 18+

### Backend Setup
```bash
cd backend/
pip3 install fastapi uvicorn chromadb sentence-transformers pydantic boto3 Pillow tqdm

# Index images (one-time, ~4 minutes)
python3 index_data.py

# Start server
python3 server_aws.py
# Runs on localhost:8000
```

### Frontend Setup
```bash
cd frontend/
npm install
npm run dev
# Runs on localhost:5173
```

### Verify
- Backend health: `curl http://localhost:8000/health`
- Open http://localhost:5173 in browser
- Navigate to PDP page, click the Sty-Lyst "Try Me" bar
- Try Comp-Lyst: "complete this look for a summer wedding"
- Try Ask Me Anything: "Does this vest run true to size?"
- Try Sty-Seek: upload an outfit photo

## Routes

| Route | Page |
|---|---|
| `/` | JCPenney Homepage |
| `/style-lyst` | Sty-Lyst Landing Page (feature showcase) |
| `/styleseek` | Sty-Seek (visual inspiration search) |
| `/p/:productName/:productId` | Product Detail Page (PDP) |

## Dataset
37 folders of clothing images organized as `{color}_{type}/` (e.g. `black_dress/`, `blue_pants/`, `red_shoes/`). Total: 16,170 images indexed via CLIP into ChromaDB for cross-modal text-to-image search.
