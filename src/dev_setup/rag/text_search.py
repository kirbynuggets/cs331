""" This script queries the database for images that match a text query. """

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


chroma_client = chromadb.PersistentClient(path="database/fashion.db")
image_loader = ImageLoader()
embedding_function = OpenCLIPEmbeddingFunction()

fashion_collection = chroma_client.get_collection(
    "fashion",
    embedding_function=embedding_function,
    data_loader=image_loader,
)


def query_db(query, n_results=3):
    """Query the database for images that match the text query."""
    print(f"Querying the database for: {query}")
    return fashion_collection.query(
        query_texts=[query], n_results=n_results, include=["uris", "distances"]
    )


def print_results(results_dict):
    """Print results."""
    for idx, uri in enumerate(results_dict["uris"][0]):
        print(f"ID: {results_dict['ids'][0][idx]}")
        print(f"Distance: {results_dict['distances'][0][idx]}")
        print(f"Path: {uri}")
        show_image_from_uri(uri)
        print("\n")


QUERY = "black pants"
results = query_db(QUERY)
print_results(results)
