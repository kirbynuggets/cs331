"""Query the Fashion database for images that match a text query."""
from matplotlib import pyplot as plt
from PIL import Image
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader


def show_image_from_uri(uri):
    """Show image from URI."""
    img = Image.open(uri)
    plt.imshow(img)
    plt.axis("off")
    plt.show()


def get_fashion_collection():
    """Gets a connection to the Fashion collection in ChromaDB.  Handles initialization."""
    chroma_client = chromadb.PersistentClient(path="database/production_fashion.db")
    image_loader = ImageLoader()
    embedding_function = OpenCLIPEmbeddingFunction()
    return chroma_client.get_collection(
        "fashion",
        embedding_function=embedding_function,
        data_loader=image_loader,
    )


def query_db(query, results=3):
    """Query the database for images that match the text query."""
    fashion_collection = get_fashion_collection()  # Get the collection
    print(f"Querying the database for: {query}")
    results = fashion_collection.query(
        query_texts=[query], n_results=results, include=["uris", "distances"]
    )
    return results


def print_results(results):
    """Print results."""
    for idx, uri in enumerate(results["uris"][0]):
        print(f"ID: {results['ids'][0][idx]}")
        print(f"Distance: {results['distances'][0][idx]}")
        print(f"Path: {uri}")
        show_image_from_uri(uri)
        print("\n")
