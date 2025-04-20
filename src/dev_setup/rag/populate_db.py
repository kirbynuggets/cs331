"""
This script populates the database with the embeddings of the images in the dataset.
"""

from tqdm import tqdm
import pandas as pd
import chromadb
from chromadb.utils.embedding_functions import OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader


DATASET_PATH = "datasets/images"

chroma_client = chromadb.PersistentClient(path="database/fashion.db")
image_loader = ImageLoader()
embedding_function = OpenCLIPEmbeddingFunction()


fashion_collection = chroma_client.get_or_create_collection(
    "fashion", embedding_function=embedding_function, data_loader=image_loader
)


df = pd.read_csv("datasets/fashion_data.tsv", sep="\t")


ids = []
uris = []
metadatas = []

for i, row in df.iterrows():
    img_id = row["img_id"]
    en_caption = row["en_caption"]
    ids.append(img_id)
    uris.append(f"{DATASET_PATH}/{img_id}.jpeg")
    metadatas.append({"en_caption": en_caption})
    
# Break up into batches to prevent excessive memory usage.
# Batch size 11 limits memory usage to 950 MB, which is pretty neat.
# If all were added at once, the RAM usage grows linearly with time-
# and God knows how long it would've climbed if I hadn't killed it at 10GB.
BATCH_SIZE = 11
for i in tqdm(range(0, len(ids), BATCH_SIZE), desc="Adding images"):    # DEBUG
    fashion_collection.add(ids=ids[i : i + BATCH_SIZE], uris=uris[i : i + BATCH_SIZE], metadatas=metadatas[i : i + BATCH_SIZE])

print(fashion_collection.count())
