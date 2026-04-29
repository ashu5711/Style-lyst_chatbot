# Sty-Lyst: Complete Code Walkthrough

## Table of Contents
1. [Project Structure](#1-project-structure)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Frontend Entry Point & Routing](#3-frontend-entry-point--routing)
4. [Data Layer](#4-data-layer)
5. [Shared Components (Header & Footer)](#5-shared-components-header--footer)
6. [Page Components](#6-page-components)
7. [Chatbot Widget (4-Tile Menu)](#7-chatbot-widget-4-tile-menu)
8. [Comp-Lyst (Complete the Look)](#8-comp-lyst-complete-the-look)
9. [Ask Me Anything (Product Q&A)](#9-ask-me-anything-product-qa)
10. [Sty-Seek (Visual Inspiration Search)](#10-sty-seek-visual-inspiration-search)
11. [Sty-Lyst Landing Page](#11-sty-lyst-landing-page)
12. [Backend Server](#12-backend-server)
13. [Bedrock Integration](#13-bedrock-integration)
14. [Vector Search (CLIP + ChromaDB)](#14-vector-search-clip--chromadb)
15. [S3 Image Storage](#15-s3-image-storage)
16. [End-to-End Flows](#16-end-to-end-flows)
17. [Testing & Configuration](#17-testing--configuration)

---

## 1. Project Structure

```
Style-lyst_chatbot/
|-- backend/
|   |-- server_aws.py          # FastAPI: Bedrock + ChromaDB + S3 + Product QA
|   |-- index_data.py          # One-time: embeds 16k images into ChromaDB via CLIP
|   |-- chroma_data/           # ChromaDB persistent storage (16,170 embeddings)
|   |-- data/
|   |   |-- product.json       # Product details (pricing, sizes, attributes, shipping)
|   |   |-- reviews.json       # 60 hardcoded customer reviews
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Chatbot/
|   |   |   |   |-- Chatbot.aws.jsx   # 4-tile menu + Comp-Lyst + Ask Me Anything
|   |   |   |   |-- Chatbot.css       # Glassmorphism + menu tiles + suggestions
|   |   |   |-- Header/
|   |   |   |   |-- Header.jsx        # Shared JCPenney header (SVG logo, promo bar, nav)
|   |   |   |   |-- Header.css
|   |   |   |-- Footer/
|   |   |   |   |-- Footer.jsx        # Shared footer (links, social, legal)
|   |   |   |   |-- Footer.css
|   |   |   |-- StyleSeek/
|   |   |   |   |-- StyleSeek.jsx     # Sty-Seek page (upload/camera + hotspots + search)
|   |   |   |   |-- StyleSeek.css
|   |   |   |-- StyleLyst/
|   |   |   |   |-- StyleLyst.jsx     # Landing page (hero, features, how-it-works, tech)
|   |   |   |   |-- StyleLyst.css
|   |   |   |-- MockHome.jsx          # JCPenney homepage
|   |   |   |-- MockPDP.jsx           # Product Detail Page with reviews section
|   |   |-- data/
|   |   |   |-- pdpData.js            # Hardcoded vest product data
|   |   |   |-- reviews.js            # Reviews import for PDP UI
|   |   |   |-- reviews.json          # 60 reviews (copy of backend data)
|   |   |-- services/
|   |   |   |-- aiService.aws.js      # Frontend -> Backend API calls
|   |   |   |-- mockApi.js            # Fallback mock responses
|   |   |-- App.jsx                   # Root (routes + Chatbot + Footer)
|   |   |-- main.jsx                  # ReactDOM entry
```

---

## 2. Architecture & Data Flow

```
Browser (localhost:5173)
    |
    |-- Chatbot (4-tile menu)
    |       |
    |       +-- Comp-Lyst mode --> /api/chat --> Bedrock Claude Sonnet 4.6
    |       |                                      |
    |       |                                 enrich_with_real_images()
    |       |                                 (CLIP -> ChromaDB -> S3 URLs)
    |       |
    |       +-- Ask Me Anything mode --> /api/product-qa --> Bedrock Claude Sonnet 4.6
    |       |                                                 + product.json + 60 reviews
    |       |
    |       +-- Sty-Seek tile --> navigates to /styleseek
    |       +-- Legacy Chat tile --> disabled (Coming Soon)
    |
    |-- Sty-Seek page (/styleseek)
    |       |
    |       +-- /api/analyze --> Bedrock (garment detection with coordinates)
    |       +-- /search --> CLIP text encoding -> ChromaDB -> S3 URLs
    |
    |-- Product images from S3:
            https://style-alyst-images-as.s3.us-east-1.amazonaws.com/{folder}/{file}
```

Key design decisions:
- All AI calls happen server-side via boto3 (no AWS credentials in browser)
- Chatbot shows 2 tiles on homepage (Sty-Seek + Legacy Chat), 4 tiles on PDP (adds Comp-Lyst + Ask Me Anything)
- Sticky "Try Me" bar appears after scrolling 300px, hides when chatbot opens
- Chatbot header shows mode name (Sty-Lyst / Comp-Lyst / Ask Me Anything)
- Suggestion capsules appear in Ask Me Anything mode only
- Camera capture supported in both Sty-Seek and Comp-Lyst via `capture="environment"`

---

## 3. Frontend Entry Point & Routing

### App.jsx
Four routes + global Chatbot + Footer:

| Route | Component | Purpose |
|---|---|---|
| `/` | MockHome | JCPenney homepage |
| `/style-lyst` | StyleLyst | Sty-Lyst feature landing page |
| `/styleseek` | StyleSeek | Sty-Seek visual inspiration search |
| `/p/:productName/:productId` | MockPDP | Product Detail Page |

Chatbot renders outside Routes (floats on every page). Footer renders on every page.

Query parameter `?openChat=complyst|productqa|menu` auto-opens the chatbot in the specified mode.

---

## 4. Data Layer

### pdpData.js
Hardcoded product object for the a.n.a Womens Crew Neck Sleeveless Vest: name, id, brand, description, rating (4.75/5), 4 colors, 4 images, 6 sizes (XS-XXL), 11 product attributes, shipping/returns.

### backend/data/product.json
Clean product data: pricing ($14.99 sale/$30 original), all attributes, size guide (Misses + Petites with measurements), colors, shipping, inventory status.

### backend/data/reviews.json + frontend/src/data/reviews.json
60 customer reviews in JCPenney format. Each review: nickname, location, rating (1-5), title, body, age, gender, recommend flag, helpful votes, sub-ratings (value/quality/fit on 1-5 scale where fit 1=runs small, 3=true to size, 5=runs large). Distribution: ~35 positive, ~15 neutral, ~10 negative.

---

## 5. Shared Components (Header & Footer)

### Header.jsx
Full JCPenney header with: black promo bar (dismissible), SVG JCPenney logo, search bar, Find a Store, My Account, Cart (with badge), Sty-Lyst pill button. Category navigation bar (11 items). Sty-Lyst button navigates to `/style-lyst` or opens chatbot via custom event when already on that page.

### Footer.jsx
White background footer with: email signup bar, 4 link columns (My Account, Customer Service, Stores, About Us), social icons (6), app store badges, legal links, copyright. Sty-Lyst AI link in legal section.

---

## 6. Page Components

### MockHome.jsx
Uses shared Header. Hero banner with eyebrow text + two CTAs (Shop Now + View All Deals). Category grid (4 cards). Recently viewed section (vest links to PDP + 2 dummy cards).

### MockPDP.jsx
Uses shared Header. Sale banner strip. Breadcrumbs. Two-column layout: left (image gallery + product details accordion + shipping accordion), right (title, stars, price, color swatches, size buttons, Add to Cart). Reviews section below with rating summary, distribution bars, paginated review cards (5 initially, "Show More" loads 10 more).

---

## 7. Chatbot Widget (4-Tile Menu)

### Chatbot.aws.jsx
Fixed-position widget. Sticky "Try Me" bar at bottom-right appears after scrolling 300px, hides when chatbot opens.

**Menu screen** (activeMode = null):
- Homepage: 2 tiles (Sty-Seek + Legacy Chat)
- PDP: 4 tiles (Sty-Seek + Comp-Lyst + Ask Me Anything + Legacy Chat)
- Each tile: gradient icon + title + description
- Legacy Chat: disabled with "Coming Soon" badge

**Chat modes:**
- Comp-Lyst: outfit recommendation chat with image upload + camera
- Ask Me Anything: product Q&A with suggestion capsules

**State:** isOpen, activeMode (null/complyst/productqa), separate message arrays per mode, showStickyBar.

**Header:** Shows "Sty-Lyst" on menu, "Comp-Lyst" or "Ask Me Anything" in chat modes. Back button returns to menu.

**Auto-open:** Detects `?openChat=complyst|productqa|menu` query parameter.

---

## 8. Comp-Lyst (Complete the Look)

User sends text (e.g. "style this for a summer wedding") and/or uploads/photographs an image. Frontend calls `/api/chat`. Backend sends to Bedrock with CHAT_SYSTEM_PROMPT containing PDP context. Claude returns JSON outfit (top/bottom/shoes/accessory). Backend enriches each item with real S3 image URLs via CLIP vector search. Frontend renders horizontal carousel with product cards, total price, "Shop This Look" button.

Fallback: if backend unreachable, falls back to mockApi.js hardcoded response.

---

## 9. Ask Me Anything (Product Q&A)

User types a question or clicks a suggestion capsule. Frontend calls `/api/product-qa`. Backend sends to Bedrock with PRODUCT_QA_SYSTEM_PROMPT containing full product details + all 60 reviews as context. Claude answers grounded in the data, citing specific reviewers when relevant.

Suggestion capsules (shown only on first message):
- "Does this vest run true to size?"
- "What do reviewers say about fabric quality?"
- "Is this good for work or just casual?"

Clicking a capsule immediately sends the question (no input fill).

---

## 10. Sty-Seek (Visual Inspiration Search)

### StyleSeek.jsx
Full page at `/styleseek`. Two upload options: "Upload Photo" (file picker) + "Take Photo" (camera capture via `capture="environment"`).

After upload: two-pane layout. Left (45%, dark): image with AI-detected hotspot dots. Right (55%, white): product grid from vector search.

Flow: upload image -> POST /api/analyze -> Bedrock detects garments with (x,y) coordinates -> hotspots rendered -> auto-selects first item -> POST /search -> ChromaDB returns S3 URLs -> product grid displays.

---

## 11. Sty-Lyst Landing Page

### StyleLyst.jsx
Marketing page at `/style-lyst`. Sections:
- Hero: badge ("Powered by Claude Sonnet on AWS Bedrock"), title, subtitle, "Try Sty-Lyst" CTA (navigates to homepage + opens chatbot), stats (16k items, 3 features, 60 reviews), chatbot mockup preview
- Features: 3 cards (Sty-Seek, Comp-Lyst, Ask Me Anything) with image, description, 3-step process, CTA button
- How It Works: 3 steps (Open Chatbot, Pick Feature, Get Styled)
- Tech Stack: AWS Bedrock, CLIP, ChromaDB, grounded Q&A
- Bottom CTA: "Try Sty-Lyst Now" (navigates to homepage + opens chatbot)
- Sticky bar: appears after scrolling, "Try Me" button

---

## 12. Backend Server

### server_aws.py
FastAPI with 5 endpoints:

**POST /api/chat** -- Comp-Lyst. Accepts {text, imageBase64}. Calls Bedrock with CHAT_SYSTEM_PROMPT. Parses JSON outfit. Enriches with real S3 images via CLIP search.

**POST /api/analyze** -- Sty-Seek. Accepts {imageBase64}. Calls Bedrock with MATCHMAP_SYSTEM_PROMPT. Returns garment coordinates.

**POST /api/product-qa** -- Ask Me Anything. Accepts {question}. Calls Bedrock with PRODUCT_QA_SYSTEM_PROMPT (product data + 60 reviews injected). Returns plain text answer.

**POST /search** -- Vector search. Accepts {query, n_results}. CLIP-encodes text, searches ChromaDB, returns S3 URLs.

**GET /health** -- Returns {status, collection_count}.

---

## 13. Bedrock Integration

### call_bedrock(system_prompt, user_text, image_base64, image_media_type)
Constructs Anthropic Messages API payload. Calls `bedrock.invoke_model()` with modelId `us.anthropic.claude-sonnet-4-6` (cross-region inference profile). Supports text + optional base64 image input.

### System Prompts
- **CHAT_SYSTEM_PROMPT**: Stylist persona, PDP context, outfit JSON schema, concise visual keywords for vector search
- **MATCHMAP_SYSTEM_PROMPT**: Object detector, returns item coordinates (x_percent, y_percent) + visual keywords
- **PRODUCT_QA_SYSTEM_PROMPT**: Product expert, full product details + 60 reviews injected, cites reviewers, summarizes sizing patterns

---

## 14. Vector Search (CLIP + ChromaDB)

CLIP (clip-ViT-B-32) maps text and images into the same 512-dim embedding space. index_data.py walks 37 folders (16,170 images), encodes each through CLIP, stores in ChromaDB. At query time, text like "black leather pants" is encoded and matched against image embeddings.

enrich_with_real_images() replaces AI-generated placeholder URLs with real S3 URLs by searching ChromaDB for each outfit item name.

---

## 15. S3 Image Storage

Bucket: `style-alyst-images-as` (us-east-1, public read). 16,170 images in 37 `{color}_{type}/` folders. URL format: `https://style-alyst-images-as.s3.us-east-1.amazonaws.com/{folder}/{filename}`

---

## 16. End-to-End Flows

### Flow 1: Comp-Lyst Outfit Recommendation
User opens chatbot on PDP -> selects Comp-Lyst -> types "summer wedding" -> POST /api/chat -> Bedrock returns JSON outfit -> enrich with CLIP/S3 images -> carousel rendered

### Flow 2: Ask Me Anything
User opens chatbot on PDP -> selects Ask Me Anything -> clicks "Does this vest run true to size?" capsule -> POST /api/product-qa -> Bedrock answers from product data + 60 reviews -> text response rendered

### Flow 3: Sty-Seek Visual Search
User navigates to /styleseek -> uploads/photographs outfit -> POST /api/analyze -> Bedrock returns garment coordinates -> hotspots rendered -> click hotspot -> POST /search -> CLIP/ChromaDB returns S3 URLs -> product grid rendered

### Flow 4: Sty-Lyst Landing Page -> Chatbot
User on /style-lyst -> clicks "Try Sty-Lyst" -> navigates to homepage (/?openChat=menu) -> chatbot auto-opens with menu tiles

### Flow 5: Sty-Lyst Landing Page -> Feature
User on /style-lyst -> clicks "Try Comp-Lyst" -> navigates to PDP (?openChat=complyst) -> chatbot auto-opens in Comp-Lyst mode

### Flow 6: Navigation
```
Homepage (/) -> Click vest -> PDP (/p/...)
Any page -> Header "Sty-Lyst" button -> /style-lyst
/style-lyst -> "Try Sty-Lyst" -> / with chatbot open
/style-lyst -> "Try Sty-Seek" -> /styleseek
/style-lyst -> "Try Comp-Lyst" -> PDP with Comp-Lyst chatbot open
/style-lyst -> "Ask a Question" -> PDP with Ask Me Anything chatbot open
Chatbot floats on all pages (sticky "Try Me" bar after scroll)
```

---

## 17. Testing & Configuration

### Configuration
- AWS credentials: `~/.aws/credentials` (set via `aws configure`)
- Bedrock model: `us.anthropic.claude-sonnet-4-6` (env: BEDROCK_MODEL_ID)
- S3 bucket: `style-alyst-images-as` (env: S3_BUCKET)
- Region: `us-east-1` (env: AWS_REGION)
- ChromaDB path: `./chroma_data` (env: CHROMA_DB_DIR)
- Frontend API base: `http://localhost:8000` (env: VITE_API_BASE)

### Start commands
```bash
# Terminal 1: Backend
cd backend && python3 server_aws.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Known issue
AWS SSO/hackathon credentials expire periodically. When expired: run `aws configure` with fresh keys, restart `server_aws.py`.
