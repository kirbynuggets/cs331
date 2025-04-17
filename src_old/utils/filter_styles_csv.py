""" Filter styles_fixed.csv to keep only rows with matching images """
import os
import pandas as pd

df = pd.read_csv("../../datasets/styles_fixed.csv")

IMAGES_DIR = "../fashion-api/static/high_res_images/"

image_files = {os.path.splitext(f)[0] for f in os.listdir(IMAGES_DIR) if f.endswith('.jpg')}

# Filter dataframe to keep only rows with matching images
df = df[df['id'].astype(str).isin(image_files)]

# Save filtered dataframe
df.to_csv("../../datasets/styles_filtered.csv", index=False)
