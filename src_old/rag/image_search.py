""" This script queries the database for images that match a text query. """

import sys
from matplotlib import pyplot as plt
from PIL import Image
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
import numpy as np


def show_image_from_uri(uri):
    """Show image from URI."""
    img = Image.open(uri)
    plt.imshow(img)
    plt.axis("off")
    plt.show()


chroma_client = chromadb.PersistentClient(path="database/fashion.db")
image_loader = ImageLoader()
embedding_function = OpenCLIPEmbeddingFunction()

fashion_collection = chroma_client.get_collection(
    "fashion",
    embedding_function=embedding_function,
    data_loader=image_loader,
)


def image_to_image_search(image_path, n_results=3):
    """Search for similar images to the query image."""
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img = img.resize((224, 224))  # Resize to match CLIP's expected input size
            img_array = np.array(img)

        embedding = embedding_function(
            [img_array]
        )

        if not embedding or len(embedding) == 0:
            raise ValueError("Embedding generation failed")

        results = fashion_collection.query(
            query_embeddings=embedding, n_results=n_results, include=["uris", "distances"]
        )
        return results
    except Exception as e:
        print(f"Error processing the image: {e}")
        return None


def main():
    """Main function."""
    results = image_to_image_search(sys.argv[1], n_results=3)
    if results and results["uris"] and len(results["uris"][0]) > 0:
        for uri in results["uris"][0]:
            show_image_from_uri(uri)
            print(f"Image URI: {uri}")
            print()
    else:
        print("Unable to find similar products or process the image.")


if __name__ == "__main__":
    main()
