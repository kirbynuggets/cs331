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
                const imgElement = document.createElement('img');
                imgElement.src = image.uri;
                imgElement.alt = `Image ID: ${image.id}`;
                imageContainer.appendChild(imgElement);
                console.log(image.uri);
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