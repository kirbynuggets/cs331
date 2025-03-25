import kagglehub

# Download latest version
# path = kagglehub.dataset_download("paramaggarwal/fashion-product-images-dataset")
path = kagglehub.competition_download("h-and-m-personalized-fashion-recommendations")

print("Path to dataset files:", path)
