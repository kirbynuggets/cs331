document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        alert("Product ID not found in URL");
        return;
    }
    
    fetch(`/api/product/${itemId}`)
    .then(response => response.json())
    .then(data => {
        // Display product details
        document.getElementById("product-name").textContent = data.product.productDisplayName;
        document.getElementById("product-image").src = data.product.image_url;  // Set image URL
        document.getElementById("category").textContent = `${data.product.masterCategory} - ${data.product.subCategory}`;
        document.getElementById("color").textContent = data.product.baseColour || "N/A";
        document.getElementById("season").textContent = data.product.season;
        document.getElementById("usage").textContent = data.product.usage;

        // Display recommendations
        displayRecommendations(data.recommendations);
    })
    .catch(error => {
        console.error("Error fetching product details:", error);
    });

});

function displayRecommendations(recommendations) {
    const categories = ["topwear", "bottomwear", "footwear", "accessories"];
    categories.forEach(category => {
        const list = document.getElementById(category);
        list.innerHTML = ""; // Clear previous content
        recommendations[category].forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${item.image_url}" alt="${item.productDisplayName}" style="max-width: 100px;">
                <p>${item.productDisplayName}</p>
            `;
            list.appendChild(li);
        });
    });
}