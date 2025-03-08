import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
import os
import base64
from typing import Optional, Dict, List, Any
from fastapi.responses import JSONResponse

class ImageSearchService:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path="database/production_fashion.db")
        self.image_loader = ImageLoader()
        self.embedding_function = OpenCLIPEmbeddingFunction()
        self.fashion_collection = self.get_fashion_collection()

    def get_fashion_collection(self):
        """Gets a connection to the Fashion collection in ChromaDB."""
        return self.chroma_client.get_collection(
            "fashion",
            embedding_function=self.embedding_function,
            data_loader=self.image_loader,
    )
    
    def query_db(self, query: str, results: int = 3) -> Dict:
        """Query ChromaDB for similar images"""
        print(f"Querying ChromaDB: {query}")
        results = self.fashion_collection.query(
            query_texts=[query], n_results=results, include=["uris", "distances"]
        )
        return results

    async def search_images(self, query: Optional[str] = None) -> JSONResponse:
        """Handles search with image encoding."""
        if not query:
            raise ValueError("Query is required")

        results = self.query_db(query, results=5)
        #Correct the URI's
        results["uris"] = [[uri.replace("/kaggle/input/fashion-product-images-dataset/fashion-dataset/", "")
                            for uri in results['uris'][0]]]
        image_data = []

        for i in range(len(results["ids"][0])):
             image_path = os.path.join(
                 "static/images", os.path.basename(results["uris"][0][i])
             )
             try:
                 with open(image_path, "rb") as img_file:
                     encoded_img = base64.b64encode(img_file.read()).decode('utf-8')
                     image_data.append({
                         "id": results["ids"][0][i],
                         "distance": results["distances"][0][i],
                         "image": f"data:image/jpeg;base64,{encoded_img}"
                     })
             except FileNotFoundError:
                 print(f"Image not found: {image_path}")
                 continue  # Skip to the next image if not found

        return JSONResponse(content={"images": image_data})
    
