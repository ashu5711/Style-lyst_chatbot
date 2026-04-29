# Style-lyst Walkthrough

A guided tour of what the app is, how it's built, and how every piece connects.

---

## What Is This?

Style-lyst is a demo AI-powered personal stylist chatbot embedded on a mock JCPenney product page. The idea: a shopper is looking at a vest, opens a chat widget, and the AI helps them build a complete outfit around it — using real catalog images fetched from a 16k-item visual database.

The anchor product is the **a.n.a Womens Crew Neck Sleeveless Vest** ($14.99 sale). Everything in the app orbits around this one item.

---

## User-Facing Features

There are three distinct AI features, all accessible through the floating chatbot widget:

### 1. Comp-lyst (Complete the Look)
The core feature. The user describes an occasion ("casual brunch", "summer wedding") or uploads a photo of a clothing item they already own. The AI acts as a personal stylist and recommends a complete 4-piece outfit (top, bottom, shoes, accessory) built around the vest. Each recommendation is enriched with a real catalog image pulled from the vector database.

### 2. Ask Me Anything (Product Q&A)
A grounded Q&A mode. The user asks questions about the vest — sizing, fabric, care instructions, return policy, what other customers said. The AI answers using only the product spec sheet and 60 real customer reviews as its knowledge base. It won't make things up.

### 3. StyleSeek (Visual Inspiration Search)
A visual discovery tool available as its own page (`/styleseek`) and as a tile in the chatbot menu. The user uploads any outfit photo — from Instagram, Pinterest, anywhere. The AI detects each clothing item in the photo and places an interactive hotspot on it. Clicking a hotspot searches the 16k visual catalog and returns the most visually similar items from JCPenney's inventory.

---

## Site Structure

```
/                    → MockHome      (fake JCPenney homepage)
/p/:name/:id         → MockPDP       (fake product detail page for the vest)
/styleseek           → StyleSeek     (visual inspiration search, full page)

<Chatbot />          → Globally mounted on every route
```

The app uses React Router. The chatbot widget floats in the bottom-right corner on all pages.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Routing | React Router v7 |
| Animations | Framer Motion (spring-based, glassmorphism chat window) |
| Icons | Lucide React |
| Backend | Python + FastAPI |
| LLM | AWS Bedrock — Claude Sonnet 4.6 (`us.anthropic.claude-sonnet-4-6`) |
| Visual embeddings | CLIP (`clip-ViT-B-32`) via SentenceTransformers |
| Vector database | ChromaDB (persistent, local) |
| Image storage | AWS S3 bucket (`style-alyst-images-as`, us-east-1) |
| Catalog dataset | ~16,170 clothing images, pre-indexed |

---

## How the Data Flows

### Comp-lyst Flow

```
User types "casual brunch outfit" (or uploads a photo)
  │
  ▼
Frontend: POST /api/chat  { text, imageBase64 }
  │
  ▼
server_aws.py → call_bedrock(CHAT_SYSTEM_PROMPT, ...)
  │             Claude Sonnet 4.6 on AWS Bedrock
  │             Returns JSON: { occasion, items: { top, bottom, shoes, accessory } }
  │
  ▼
enrich_with_real_images()
  │   For each item, encode item.name with CLIP
  │   Query ChromaDB → pick from top-3 visual matches
  │   Replace placeholder imageUrl with real S3 URL
  │
  ▼
Frontend receives { outfitRecommendation }
  │
  ▼
Chatbot renders horizontal scrollable carousel with 4 product cards
```

### Ask Me Anything Flow

```
User types "does it run small?"
  │
  ▼
Frontend: POST /api/product-qa  { question }
  │
  ▼
server_aws.py → call_bedrock(PRODUCT_QA_SYSTEM_PROMPT, question)
  │             System prompt contains full product.json + all 60 reviews
  │             Claude answers from grounded context only
  │
  ▼
Frontend renders plain text response bubble
```

### StyleSeek Flow

```
User uploads outfit photo
  │
  ▼
Frontend: POST /api/analyze  { imageBase64 }
  │
  ▼
server_aws.py → call_bedrock(MATCHMAP_SYSTEM_PROMPT, image)
  │             Claude detects garments, returns JSON:
  │             [{ id, name, x_percent, y_percent }, ...]
  │
  ▼
Frontend renders image with clickable hotspot dots at (x%, y%)

User clicks a hotspot (e.g., "maroon long sleeve button up shirt")
  │
  ▼
Frontend: POST /search  { query: item.name, n_results: 8 }
  │
  ▼
server_aws.py → CLIP encodes query text → ChromaDB vector search
  │             Returns 8 visually similar images from S3
  │
  ▼
Frontend renders grid of similar product cards
```

---

## Key Files Reference

### Frontend

| File | What it does |
|---|---|
| `src/App.jsx` | Route definitions, mounts Chatbot globally |
| `src/components/MockHome.jsx` | Fake JCPenney homepage (hero, category grid, recently viewed) |
| `src/components/MockPDP.jsx` | Fake product detail page — color swatches, size picker, image gallery, ratings |
| `src/components/Chatbot/Chatbot.aws.jsx` | The floating chatbot widget — menu, Comp-lyst mode, Product Q&A mode |
| `src/components/StyleSeek/StyleSeek.jsx` | Full-page visual inspiration search |
| `src/services/aiService.aws.js` | Thin HTTP client — `sendToGemini()` → `/api/chat`, `analyzeInspirationImage()` → `/api/analyze` |
| `src/services/mockApi.js` | Fallback mock — returns a hardcoded outfit after 2.5s (used if backend is down) |
| `src/data/pdpData.js` | Static product data: images, colors, sizes, descriptions, ratings |

### Backend

| File | What it does |
|---|---|
| `backend/server_aws.py` | Main server — all 4 endpoints, Bedrock calls, CLIP search, image enrichment |
| `backend/server.py` | Local dev server — CLIP search only, images from local filesystem |
| `backend/index_data.py` | One-time setup — walks dataset, generates CLIP embeddings, populates ChromaDB |
| `backend/upload_to_s3.py` | One-time setup — uploads dataset images to S3 |
| `backend/data/product.json` | Full product attributes for the vest (sizes, colors, materials, pricing) |
| `backend/data/reviews.json` | 60 customer reviews used as RAG context for Product Q&A |

---

## The Vector Database in Detail

The CLIP model (`clip-ViT-B-32`) is the backbone of both Comp-lyst image enrichment and StyleSeek visual search. Its key property: it embeds both images and text into the same vector space. This means:

- `model.encode("black leather pants")` → a vector
- `model.encode(image_of_black_pants)` → a nearby vector

So a text description from the LLM can retrieve visually matching catalog images without any text labels on the images themselves.

**Setup (done once):**
1. `index_data.py` walks the 16k-image dataset, generates CLIP embeddings for each image, and stores them in ChromaDB with metadata: `{ color, type, folder }`.
2. `upload_to_s3.py` uploads all images to S3 so they can be served via public URLs.

**At query time:**
- Encode the query (text or image) with CLIP
- ChromaDB returns the nearest neighbors by cosine similarity
- Pick randomly from the top 3 to add variety

---

## System Prompts

The LLM behavior is defined by three system prompts in `server_aws.py`:

**CHAT_SYSTEM_PROMPT** — Tells Claude it is a high-end boutique stylist, the user is viewing the vest, and it must return a structured JSON outfit when asked for styling advice. Importantly, item `name` fields must be concise visual keywords (e.g., "black leather pants") because that string is fed directly into the CLIP vector search.

**PRODUCT_QA_SYSTEM_PROMPT** — Constructed at server startup by embedding the full `product.json` and all 60 reviews into the prompt. Claude is instructed to answer only from this grounded context and to summarize patterns across reviews for sizing questions.

**MATCHMAP_SYSTEM_PROMPT** — Tells Claude to act as an object detector. Given an image, identify each garment and return its name plus (x, y) coordinates as percentages of the image dimensions.

---

## Local vs AWS Variants

The project maintains parallel files for both development environments:

| Concern | Local | AWS (active) |
|---|---|---|
| LLM | Gemini 2.5 Flash (API key stored in browser localStorage) | Claude Sonnet 4.6 via AWS Bedrock (key on server) |
| Image storage | Local filesystem (hardcoded path) | S3 bucket |
| AI service layer | `aiService.js` (direct browser → Gemini) | `aiService.aws.js` (browser → backend → Bedrock) |
| Server | `server.py` | `server_aws.py` |
| App entry | `App.local.jsx` | `App.jsx` (current) |

`switch_to_aws.sh` is a helper script to toggle between configurations. `App.jsx` currently uses the AWS variants.

---

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt      # or requirements_aws.txt for AWS
python server_aws.py                  # starts on port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                           # starts on port 5173
```

### First-time Setup (if ChromaDB is empty)
```bash
cd backend
python index_data.py                  # indexes the image dataset into ChromaDB
python upload_to_s3.py                # uploads images to S3 (requires AWS credentials)
```

Set `VITE_API_BASE` in a `.env` file in `frontend/` if the backend is not on `localhost:8000`:
```
VITE_API_BASE=http://your-ec2-ip:8000
```

---

## What's Mock vs Real

| Thing | Status |
|---|---|
| JCPenney homepage and PDP | Mock (static UI, no real JCP data) |
| Vest product data | Real JCPenney product data (hardcoded) |
| Customer reviews | Real reviews (60 scraped, in `reviews.json`) |
| Outfit recommendations | Real AI (Claude Sonnet 4.6 via Bedrock) |
| Catalog images | Real clothing images (~16k dataset), served from S3 |
| Prices on product cards | Fake ($24.99 hardcoded) |
| "Add to Cart" / "Shop This Look" | Non-functional buttons |
| Auth, cart, checkout | Not implemented |

---

## Project History

The project was built in two phases across 12 planned parts:

**Phase 1 (Parts 1–10):** Scaffolded the React app, built the mock PDP, created the chatbot widget UI, wired up mock API responses, integrated Gemini for real AI, built the "Complete the Look" agentic logic, and polished the outfit carousel UI.

**Phase 2:** Added the MatchMap/StyleSeek visual inspiration engine — Python/FastAPI backend, ChromaDB vector store, CLIP indexing of the 16k dataset, Gemini Vision for garment detection, and the full hotspot-click-to-search UI.

**AWS Migration:** Moved all LLM calls from the browser (Gemini API key in localStorage) to the backend (AWS Bedrock + Claude). Added the Product Q&A feature using product data and reviews as RAG context.
