""" A simple Flask application to serve as a front-end for the search engine. """
import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from query_db import query_db

app = Flask(__name__)

DATASETS_DIR = os.path.abspath("datasets")


@app.route("/datasets/images/<filename>")
def get_image(filename):
    """Serve images from the datasets directory."""
    return send_from_directory(DATASETS_DIR, "images/" + filename)


@app.route("/")
def index():
    """Renders the main search page."""
    return render_template("index.html")


@app.route("/search", methods=["POST"])
def search():
    """Handles search requests from the frontend."""
    query = request.form.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        results = query_db(query, results=5)

        image_data = []
        for i in range(len(results["ids"][0])):
            relative_uri = os.path.join(
                "datasets/images", os.path.basename(results["uris"][0][i])
            )
            image_data.append(
                {
                    "id": results["ids"][0][i],
                    "distance": results["distances"][0][i],
                    "uri": relative_uri,
                }
            )
        return jsonify({"images": image_data})

    except Exception as e:
        print(f"Error during search: {e}")
        return jsonify({"error": "An error occurred during search"}), 500


if __name__ == "__main__":
    app.run(debug=True)
