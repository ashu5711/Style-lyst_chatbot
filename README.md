# Style-alyst Chatbot & MatchMap

A high-end boutique personal stylist agent designed for JCPenney. This MVP includes an intelligent chat widget and a standalone visual inspiration engine.

## Features

1. Agentic Chatbot
An intelligent React-based chat widget that floats over the product page. It uses the Gemini Vision API to understand the user's intent, visual uploads, and the current page context to generate "Complete the Look" recommendations formatted as structured JSON. It automatically maps the JSON into visually appealing horizontal product carousels.

2. MatchMap (Inspiration Engine)
A dedicated page that acts as an inspiration search tool. Users upload a picture of a full outfit, and the AI automatically detects individual clothing items (placing interactive hotspots over them). Clicking a hotspot triggers a visual vector search to find similar items in the catalog.

3. Visual Vector Search Backend
A Python/FastAPI backend running ChromaDB and OpenAI's CLIP model (clip-ViT-B-32). It cross-references text descriptions against the actual pixel patterns of a 16,000+ item clothing dataset, allowing the AI recommendations and MatchMap to return real, visually accurate product matches instead of static placeholder data.

## Architecture
- Frontend: React 18, Vite, Framer Motion, React Router.
- Backend: Python 3.9, FastAPI, ChromaDB, SentenceTransformers (CLIP).
- AI Integrations: Google Gemini 2.5 Flash Vision.

## Getting Started

1. Frontend Setup:
   - Navigate to `frontend/`
   - Run `npm install`
   - Run `npm run dev` to start the client application on localhost:5173.

2. Backend Setup:
   - Navigate to `backend/`
   - Activate the virtual environment: `source venv/bin/activate`
   - Start the vector search server: `python server.py` (Runs on localhost:8000).

*Note: You must configure a Gemini API key within the frontend chat interface to enable LLM processing.*
