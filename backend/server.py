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
