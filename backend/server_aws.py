import os
import json
import random
import base64
import re
import boto3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import chromadb
from sentence_transformers import SentenceTransformer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
S3_BUCKET = os.environ.get("S3_BUCKET", "style-alyst-images-as")
# Claude Sonnet 4.6 via cross-region inference profile
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-6")
CHROMA_DB_DIR = os.environ.get("CHROMA_DB_DIR", "./chroma_data")
COLLECTION_NAME = "clothing_items_visual"

# --- AWS Clients ---
bedrock = boto3.client("bedrock-runtime", region_name=AWS_REGION)
s3 = boto3.client("s3", region_name=AWS_REGION)

# --- ChromaDB + CLIP ---
client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
try:
    collection = client.get_collection(name=COLLECTION_NAME)
except Exception:
    print("WARNING: Collection not found. Run index_data.py first.")
    collection = None

print("Loading CLIP model for visual search...")
model = SentenceTransformer('clip-ViT-B-32')

# --- Load Product & Review Data for Product QA ---
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
with open(os.path.join(DATA_DIR, "product.json"), "r") as f:
    PRODUCT_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "reviews.json"), "r") as f:
    REVIEWS_DATA = json.load(f)

# Build review summary for the system prompt
def _build_review_context():
    lines = []
    for r in REVIEWS_DATA:
        fit_label = {1: "runs small", 2: "slightly small", 3: "true to size", 4: "slightly large", 5: "runs large"}.get(r["fit"], "unknown")
        lines.append(f'[{r["rating"]}/5] "{r["title"]}" by {r["nickname"]} ({r["age"]}, {r["location"]}) - Fit: {fit_label}, Value: {r["value"]}/5, Quality: {r["quality"]}/5 | {r["body"]}')
    return "\n".join(lines)

PRODUCT_QA_SYSTEM_PROMPT = f"""You are a helpful JCPenney product expert assistant.
Answer customer questions about this product using ONLY the product details and customer reviews provided below. Do not make up information.

PRODUCT DETAILS:
Name: {PRODUCT_DATA['name']}
Brand: {PRODUCT_DATA['brand']}
Price: ${PRODUCT_DATA['pricing']['salePrice']} (was ${PRODUCT_DATA['pricing']['originalPrice']}, {PRODUCT_DATA['pricing']['discount']})
Promo: {PRODUCT_DATA['pricing']['promoCode']}
Description: {PRODUCT_DATA['description']}
Fit: {PRODUCT_DATA['attributes']['fit']}
Material: {PRODUCT_DATA['attributes']['fiberContent']} ({PRODUCT_DATA['attributes']['fabricDescription']})
Care: {PRODUCT_DATA['attributes']['care']}
Closure: {PRODUCT_DATA['attributes']['closureType']}
Neckline: {PRODUCT_DATA['attributes']['neckline']}
Length: {PRODUCT_DATA['attributes']['apparelLength']}
Colors: {', '.join(c['name'] + ' (' + c['family'] + ')' for c in PRODUCT_DATA['colors'])}
Sizes (Misses): {', '.join(s['size'] + ' = ' + s['numericSize'] for s in PRODUCT_DATA['sizeRanges']['misses']['sizes'])}
Sizes (Petites): {', '.join(s['size'] + ' = ' + s.get('numericSize','') for s in PRODUCT_DATA['sizeRanges']['petites']['sizes'])}
Rating: {PRODUCT_DATA['rating']}/5 ({PRODUCT_DATA['reviewCount']} reviews)
Shipping: Free shipping, same-day pickup available, ship to store available
Returns: {PRODUCT_DATA['returns']}

CUSTOMER REVIEWS ({len(REVIEWS_DATA)} total):
{_build_review_context()}

RULES:
- Answer concisely and naturally, like a knowledgeable store associate.
- For sizing questions, summarize the pattern across multiple reviews (e.g., "Most reviewers say it runs small - consider sizing up one size").
- Cite specific reviewers when relevant (e.g., "One reviewer from Dallas mentioned...").
- For questions about colors, reference reviewers who commented on color accuracy.
- If a question cannot be answered from the product data or reviews, say so honestly.
- Keep answers to 2-4 sentences unless the question requires more detail."""

# --- System Prompts ---
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

MATCHMAP_SYSTEM_PROMPT = """You are an AI Object Detector for Sty-Seek, a fashion inspiration engine.
Your task is to analyze the uploaded inspiration image and identify the distinct clothing items and accessories in it (e.g., Shirt, Pants, Shoes, Watch, Sunglasses).
For each item you identify, you must provide its approximate center (x, y) coordinates as a percentage (from 0 to 100) from the top-left of the image.
You must also provide a CONCISE, highly descriptive visual keyword for the item to be used in a vector search.

You MUST return your response as a valid JSON object wrapped in markdown ```json ... ``` tags.
The JSON must adhere exactly to this schema:
{
  "items": [
    {
      "id": "string (unique random identifier)",
      "name": "string (concise descriptive visual keywords)",
      "x_percent": number (0-100),
      "y_percent": number (0-100)
    }
  ]
}"""


def generate_s3_url(item_path):
    """Generate a presigned S3 URL or public URL for an image."""
    return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{item_path}"


def call_bedrock(system_prompt, user_text, image_base64=None, image_media_type="image/jpeg"):
    """Call Amazon Bedrock Claude with text and optional image."""
    content = []

    if image_base64:
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": image_media_type,
                "data": image_base64
            }
        })

    content.append({
        "type": "text",
        "text": user_text or "Please build an outfit around this image."
    })

    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [
            {"role": "user", "content": content}
        ]
    })

    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=body
    )

    result = json.loads(response["body"].read())
    return result["content"][0]["text"]


def parse_json_from_llm(raw_text):
    """Extract JSON from markdown code blocks or raw JSON."""
    json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', raw_text)
    if json_match:
        return json.loads(json_match.group(1))

    stripped = raw_text.strip()
    if stripped.startswith('{') and stripped.endswith('}'):
        return json.loads(stripped)

    return None


def enrich_with_real_images(outfit):
    """Replace placeholder imageUrls with real ones from vector search."""
    if not outfit or not outfit.get("items") or not collection:
        return outfit

    for key in outfit["items"]:
        item = outfit["items"][key]
        try:
            query_embedding = model.encode(item["name"]).tolist()
            results = collection.query(query_embeddings=[query_embedding], n_results=10)

            if results["documents"] and results["documents"][0]:
                docs = results["documents"][0]
                pick = random.choice(docs[:3])
                item["imageUrl"] = generate_s3_url(pick)
        except Exception as e:
            print(f"Image enrichment failed for {item.get('name')}: {e}")

    return outfit


# --- Request Models ---
class ChatRequest(BaseModel):
    text: Optional[str] = None
    imageBase64: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    n_results: int = 10

class AnalyzeRequest(BaseModel):
    imageBase64: str

class ProductQARequest(BaseModel):
    question: str


# --- Endpoints ---

@app.post("/api/chat")
def chat(request: ChatRequest):
    """Chatbot endpoint: replaces frontend Gemini calls."""
    try:
        image_data = None
        media_type = "image/jpeg"

        if request.imageBase64:
            if "," in request.imageBase64:
                header, image_data = request.imageBase64.split(",", 1)
                if "png" in header:
                    media_type = "image/png"
                elif "webp" in header:
                    media_type = "image/webp"
            else:
                image_data = request.imageBase64

        raw_text = call_bedrock(CHAT_SYSTEM_PROMPT, request.text, image_data, media_type)

        outfit = parse_json_from_llm(raw_text)

        if outfit:
            outfit = enrich_with_real_images(outfit)
            return {
                "id": str(random.randint(100000, 999999)),
                "role": "bot",
                "text": None,
                "outfitRecommendation": outfit
            }
        else:
            return {
                "id": str(random.randint(100000, 999999)),
                "role": "bot",
                "text": raw_text,
                "outfitRecommendation": None
            }

    except Exception as e:
        print(f"Chat error: {e}")
        return {
            "id": str(random.randint(100000, 999999)),
            "role": "bot",
            "text": f"Sorry, I encountered an error: {str(e)}",
            "outfitRecommendation": None
        }


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    """MatchMap endpoint: replaces frontend Gemini analyzeInspirationImage calls."""
    try:
        image_data = request.imageBase64
        media_type = "image/jpeg"

        if "," in image_data:
            header, image_data = request.imageBase64.split(",", 1)
            if "png" in header:
                media_type = "image/png"
            elif "webp" in header:
                media_type = "image/webp"

        raw_text = call_bedrock(MATCHMAP_SYSTEM_PROMPT, "Analyze this image.", image_data, media_type)
        result = parse_json_from_llm(raw_text)

        if result:
            return result
        else:
            return {"items": [], "error": "Failed to parse AI response"}

    except Exception as e:
        print(f"Analyze error: {e}")
        return {"items": [], "error": str(e)}


@app.post("/search")
def search_items(request: SearchRequest):
    """Vector search endpoint (unchanged logic, S3 URLs instead of localhost)."""
    if not collection:
        return {"status": "error", "message": "Database not initialized."}

    query_embedding = model.encode(request.query).tolist()
    results = collection.query(query_embeddings=[query_embedding], n_results=request.n_results)

    matched_items = []
    if results['documents'] and results['documents'][0]:
        docs = results['documents'][0]
        metas = results['metadatas'][0]

        for i in range(len(docs)):
            matched_items.append({
                "imageUrl": generate_s3_url(docs[i]),
                "color": metas[i].get("color"),
                "type": metas[i].get("type"),
                "folder": metas[i].get("folder")
            })

    if matched_items:
        best_match = random.choice(matched_items[:3])
        return {"status": "success", "match": best_match, "results": matched_items}

    return {"status": "error", "message": "No matches found"}


@app.post("/api/product-qa")
def product_qa(request: ProductQARequest):
    """Answer product questions using product details + 60 customer reviews."""
    try:
        answer = call_bedrock(PRODUCT_QA_SYSTEM_PROMPT, request.question)
        return {
            "id": str(random.randint(100000, 999999)),
            "role": "bot",
            "text": answer,
            "source": "product-qa"
        }
    except Exception as e:
        print(f"Product QA error: {e}")
        return {
            "id": str(random.randint(100000, 999999)),
            "role": "bot",
            "text": f"Sorry, I encountered an error: {str(e)}",
            "source": "product-qa"
        }


@app.get("/health")
def health():
    return {"status": "ok", "collection_count": collection.count() if collection else 0}


if __name__ == "__main__":
    import uvicorn
    print("Starting Sty-Lyst Backend (AWS Bedrock + S3 + ChromaDB)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
