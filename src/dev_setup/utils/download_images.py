"""
Download images from the Fashion-12K dataset.
"""

from typing import List
import os
import threading
from concurrent.futures import ThreadPoolExecutor
import requests


thread_local = threading.local()


def download_image(image_url: str) -> None:
    """Download image from the given image URL."""
    img_file_name = image_url.replace("https://tlk.s3.yandex.net/Fashion-200K/", "")
    if os.path.exists(f"datasets/images/{img_file_name}"):
        return
    session = get_session_for_thread()
    response = session.get(image_url)
    with open(
        f"datasets/images/{img_file_name}",
        "wb",
    ) as ifp:
        ifp.write(response.content)


def get_session_for_thread() -> requests.Session:
    """Get a session object for the current thread."""
    if not hasattr(thread_local, "session"):
        thread_local.session = requests.Session()

    return thread_local.session


if __name__ == "__main__":
    with open("datasets/fashion_12k_en_de.tsv", "r", encoding="utf-8") as fp:
        lines = fp.readlines()[1:]

        img_urls: List[str] = []
        for line in lines:
            img_urls.append(line.split("\t")[0])

    with ThreadPoolExecutor(max_workers=50) as executor:
        executor.map(download_image, img_urls)
