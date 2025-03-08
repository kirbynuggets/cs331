document.getElementById('search-button').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});


function performSearch() {
    const query = document.getElementById('search-input').value;
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = ''; // Clear previous results

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'query=' + encodeURIComponent(query)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else if (data.images && data.images.length > 0) {
            data.images.forEach(image => {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-wrapper';

                const imgElement = document.createElement('img');
                imgElement.src = image.image; // Using the base64 image data
                imgElement.alt = `Image ID: ${image.id}`;
                
                const distance = document.createElement('div');
                distance.className = 'distance';
                distance.textContent = `Similarity: ${(1 - image.distance).toFixed(2)}`;
                
                imgWrapper.appendChild(imgElement);
                imgWrapper.appendChild(distance);
                imageContainer.appendChild(imgWrapper);
            });
        } else {
            imageContainer.textContent = 'No results found.';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching results.');
    });
}
