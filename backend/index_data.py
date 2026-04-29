import os
import chromadb
from sentence_transformers import SentenceTransformer
from PIL import Image
from tqdm import tqdm

# Paths
DATASET_DIR = "/Users/sa6/Downloads/style-lyst dataset"
CHROMA_DB_DIR = "./chroma_data"
COLLECTION_NAME = "clothing_items_visual"  # New collection name so we don't mix with text embeddings

def main():
    print("Initializing ChromaDB and CLIP Model (this might take a moment)...")
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
        
    collection = client.create_collection(name=COLLECTION_NAME)
    # Load CLIP model
    model = SentenceTransformer('clip-ViT-B-32')

    # Gather all images first to use tqdm properly
    image_files = []
    print(f"Scanning directory: {DATASET_DIR}")
    for root, dirs, files in os.walk(DATASET_DIR):
        folder_name = os.path.basename(root)
        if folder_name == "archive (2)":
            continue
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                image_files.append((root, folder_name, file))

    print(f"Found {len(image_files)} images. Starting visual embedding process...")

    batch_size = 250 # Smaller batch size because images take more memory
    ids, embeddings, metadatas, documents = [], [], [], []

    for root, folder_name, file in tqdm(image_files, desc="Embedding Images"):
        file_path = os.path.join(root, file)
        rel_path = f"{folder_name}/{file}"
        
        try:
            # Process the actual image pixels!
            image = Image.open(file_path).convert("RGB")
            embedding = model.encode(image).tolist()
            
            parts = folder_name.split('_')
            color = parts[0] if len(parts) > 0 else "unknown"
            item_type = parts[1] if len(parts) > 1 else folder_name

            ids.append(rel_path)
            embeddings.append(embedding)
            metadatas.append({
                "color": color,
                "type": item_type,
                "folder": folder_name
            })
            documents.append(rel_path)

            if len(ids) >= batch_size:
                collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    metadatas=metadatas,
                    documents=documents
                )
                ids, embeddings, metadatas, documents = [], [], [], []

        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    # Add remaining
    if ids:
        collection.add(
            ids=ids,
            embeddings=embeddings,
            metadatas=metadatas,
            documents=documents
        )

    print("\nVisual Indexing complete!")
    print(f"Total items in collection: {collection.count()}")

if __name__ == "__main__":
    main()
