import os
import random
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer

app = FastAPI()

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static images directory
DATASET_DIR = "/Users/ashutoshshankar/Downloads/archive (2)"
app.mount("/images", StaticFiles(directory=DATASET_DIR), name="images")

# Initialize ChromaDB and Model
CHROMA_DB_DIR = "./chroma_data"
COLLECTION_NAME = "clothing_items_visual"

CHAT_SYSTEM_PROMPT = """You are Sty-Lyst, a high-end boutique personal stylist.
Your goal is to analyze user queries (and optionally images) and provide a Complete the Look outfit recommendation.
The user is currently viewing this item on JCPenney:
Brand: A.N.A
Product: a.n.a Womens Crew Neck Sleeveless Vest
Price: $14.99 (Sale)
Description: Buy a.n.a Womens Crew Neck Sleeveless Vest at JCPenney.com today and Get Your Penney's Worth. Free shipping available

CRITICAL INSTRUCTION:
- If the user is just saying hello, greeting you, or asking a general question (e.g., "Hi", "How are you?"), reply with a friendly, conversational plain text message. Do NOT generate JSON.
- If the user asks for styling advice, uploads an image, or asks to "complete the look", you MUST return your response as a valid JSON object wrapped in markdown ```json ... ``` tags.

OUTFIT COORDINATION RULES:
1. The goal is to build a cohesive, complete look. Think flexibly about layers: tops, bottoms (pants, skirts), outerwear (hoodies, jackets), shoes, and accessories.
2. Identify what the user already has: You MUST consider the PDP item (Vest/Top) as already owned. If the user uploads an image (e.g., Shoes or Pants), you MUST identify it and consider it already owned.
3. You must ONLY recommend the *missing* pieces required to complete the outfit. For example, if they have the vest (top) and shoes, you should recommend a bottom (like a pant or skirt) and potentially a layering piece (like a hoodie or cardigan). DO NOT recommend items the user already has.
4. For the `name` field of each missing item, use CONCISE, highly descriptive visual keywords (e.g., "black leather pants", "grey zip hoodie", "white canvas sneakers"). Do NOT use long conversational names, because we use this `name` string to search our visual Vector Database!

The JSON must adhere exactly to this schema:
{
  "outfitId": "string (generate a random id)",
  "occasion": "string (e.g. Summer Wedding, Casual Friday)",
  "stylistReasoning": "string (a friendly, stylish explanation of why the missing pieces you are recommending perfectly match the items the user already has. Be sure to mention the items they already have!)",
  "totalPriceEstimate": number,
  "items": {
    // ONLY INCLUDE THE MISSING SLOTS. Do not include slots for items the user already has.
    // The keys should describe the type of item (e.g., "pants", "skirt", "hoodie", "jacket", "accessory").
    // Example: if they have a top and shoes, you might return "pants" and "hoodie".
    "pants": { "productId": "str", "name": "str", "brand": "str", "price": num, "imageUrl": "str" },
    "hoodie": { "productId": "str", "name": "str", "brand": "str", "price": num, "imageUrl": "str" }
  }
}
Use realistic JCPenney-style placeholder image URLs if you don't know real ones."""

client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
try:
    collection = client.get_collection(name=COLLECTION_NAME)
except Exception:
    print("WARNING: Collection not found. Did you run index_data.py?")
    collection = None

print("Loading CLIP model for visual search...")
model = SentenceTransformer('clip-ViT-B-32')

class SearchRequest(BaseModel):
    query: str
    n_results: int = 10

@app.post("/search")
def search_items(request: SearchRequest):
    if not collection:
        return {"status": "error", "message": "Database not initialized."}

    # Embed the search query text using CLIP (maps to the same visual space as the images!)
    query_embedding = model.encode(request.query).tolist()
    
    # Search ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=request.n_results
    )
    
    # Format results
    matched_items = []
    if results['documents'] and len(results['documents']) > 0:
        docs = results['documents'][0]
        metas = results['metadatas'][0]
        
        for i in range(len(docs)):
            item_path = docs[i]
            meta = metas[i]
            
            matched_items.append({
                "imageUrl": f"http://localhost:8000/images/{item_path}",
                "color": meta.get("color"),
                "type": meta.get("type"),
                "folder": meta.get("folder")
            })
            
    # Return a random item from the top matches to provide variety
    if matched_items:
        best_match = random.choice(matched_items[:3]) # Pick from top 3 closest visual matches
        return {"status": "success", "match": best_match, "results": matched_items}
        
    return {"status": "error", "message": "No matches found"}

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
