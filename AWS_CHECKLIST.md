# AWS Deployment Checklist -- Sty-Lyst

## Phase 1: AWS Setup -- COMPLETED
- [x] Log into AWS Console
- [x] Enable Claude Sonnet 4.6 in Bedrock Model catalog
- [x] Create S3 bucket: `style-alyst-images-as` (us-east-1)
- [x] Set S3 bucket policy (public read)
- [x] Install AWS CLI on Mac
- [x] Configure `aws configure` with AWS credentials
- [x] Upload 16k images to S3
- [x] Verify S3 upload

## Phase 2: Local Backend Setup -- COMPLETED
- [x] Install Python dependencies (fastapi, uvicorn, chromadb, sentence-transformers, boto3, etc.)
- [x] Run `index_data.py` to build ChromaDB (16,170 images indexed)
- [x] Verify Bedrock connectivity (`us.anthropic.claude-sonnet-4-6`)
- [x] Create product.json and reviews.json (60 reviews) in backend/data/
- [x] Add /api/product-qa endpoint for Ask Me Anything
- [x] Start `server_aws.py` on localhost:8000
- [x] Verify health check: `curl http://localhost:8000/health`

## Phase 3: Frontend Setup -- COMPLETED
- [x] Create shared Header component (SVG logo, promo bar, nav, Sty-Lyst button)
- [x] Create shared Footer component (white background, links, social)
- [x] Create Sty-Lyst landing page (/style-lyst)
- [x] Rename MatchMap to Sty-Seek (/styleseek)
- [x] Redesign chatbot with 4-tile menu (Sty-Seek, Comp-Lyst, Ask Me Anything, Legacy Chat)
- [x] Context-aware tiles: 2 on homepage, 4 on PDP
- [x] Add suggestion capsules in Ask Me Anything mode
- [x] Add camera capture to Sty-Seek and Comp-Lyst
- [x] Replace floating button with sticky "Try Me" bar
- [x] Add reviews section to PDP (60 reviews, rating bars, paginated cards)
- [x] Add ?openChat= query param support for deep linking
- [x] Chatbot header shows active mode name

## Known Issue
- AWS SSO/hackathon credentials expire periodically
- When expired: run `aws configure` with fresh keys, restart `server_aws.py`

## Architecture Summary

```
localhost:5173 (React)
    |
    +-- Chatbot widget (4-tile menu)
    |       +-- Comp-Lyst --> /api/chat --> Bedrock + CLIP/ChromaDB + S3
    |       +-- Ask Me Anything --> /api/product-qa --> Bedrock + product.json + reviews.json
    |       +-- Sty-Seek --> /styleseek page
    |       +-- Legacy Chat --> Coming Soon
    |
    +-- Sty-Seek page --> /api/analyze --> Bedrock
    |                 --> /search --> CLIP/ChromaDB + S3
    |
    +-- localhost:8000 (FastAPI backend)
    |
    +-- S3: style-alyst-images-as (16,170 images)
```

## Files in Use

| File | Role |
|---|---|
| `backend/server_aws.py` | Main server: Bedrock + ChromaDB + S3 + Product QA |
| `backend/index_data.py` | One-time image indexer |
| `backend/chroma_data/` | Vector database (16,170 embeddings) |
| `backend/data/product.json` | Product details for Q&A |
| `backend/data/reviews.json` | 60 customer reviews for Q&A |
| `frontend/src/App.jsx` | Root (4 routes + Chatbot + Footer) |
| `frontend/src/services/aiService.aws.js` | Frontend -> backend API calls |
| `frontend/src/components/Chatbot/Chatbot.aws.jsx` | 4-tile menu + Comp-Lyst + Ask Me Anything |
| `frontend/src/components/StyleSeek/StyleSeek.jsx` | Sty-Seek page (upload/camera + hotspots) |
| `frontend/src/components/StyleLyst/StyleLyst.jsx` | Sty-Lyst landing page |
| `frontend/src/components/Header/Header.jsx` | Shared JCPenney header |
| `frontend/src/components/Footer/Footer.jsx` | Shared footer |
| `frontend/src/components/MockHome.jsx` | Homepage |
| `frontend/src/components/MockPDP.jsx` | Product page with reviews |
| `frontend/src/data/pdpData.js` | Product data |
| `frontend/src/data/reviews.json` | Reviews for PDP UI |
| `frontend/src/services/mockApi.js` | Fallback when backend is down |

## Naming Convention

| Display Name | Code/Route |
|---|---|
| Sty-Lyst | /style-lyst, StyleLyst component |
| Sty-Seek | /styleseek, StyleSeek component |
| Comp-Lyst | complyst mode in Chatbot |
| Ask Me Anything | productqa mode in Chatbot |
