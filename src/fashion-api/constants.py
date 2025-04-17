# constants.py

# Grouping similar article types based on the provided dataset
ARTICLE_TYPE_GROUPS = {
    "Shirts": ["Shirts"],
    "Tshirts": ["Tshirts", "Lounge Tshirts"],
    "Tops": ["Tops", "Camisoles", "Tunics"],
    "Sweatshirts": ["Sweatshirts", "Tracksuits"],
    "Sweaters": ["Sweaters"],
    "Kurtas": ["Kurtas", "Kurta Sets"],
    "Kurtis": ["Kurtis"],
    "Jeans": ["Jeans"],
    "Trousers": ["Trousers", "Track Pants", "Capris", "Rain Trousers"],
    "Shorts": ["Shorts", "Lounge Shorts"],
    "Leggings": ["Leggings", "Tights", "Jeggings"],
    "Skirts": ["Skirts"],
    "Dresses": ["Dresses"],
    "Suits": ["Suits", "Nehru Jackets"],
    "Blazers": ["Blazers"],
    "Jackets": ["Jackets", "Rain Jacket"],
    "Formal Shoes": ["Formal Shoes", "Booties"],
    "Casual Shoes": ["Casual Shoes", "Sports Sandals"],
    "Sports Shoes": ["Sports Shoes", "Basketballs", "Footballs"],
    "Heels": ["Heels"],
    "Flats": ["Flats"],
    "Sandals": ["Sandals", "Sports Sandals", "Flip Flops"],
    "Sarees": ["Sarees"],
    "Salwar": ["Salwar", "Churidar", "Patiala", "Salwar and Dupatta"],
    "Belts": ["Belts", "Suspenders"],
    "Ties": ["Ties", "Ties and Cufflinks"],
    "Watches": ["Watches"],
    "Sunglasses": ["Sunglasses"],
    "Bags": ["Handbags", "Clutches", "Backpacks", "Wallets", "Laptop Bag", "Duffel Bag", "Messenger Bag", "Trolley Bag", "Mobile Pouch", "Waist Pouch", "Rucksacks"],
    "Jewellery": ["Jewellery Set", "Necklace and Chains", "Pendant", "Earrings", "Ring", "Bracelet", "Bangle", "Headband"], # Headband is listed under Jewellery group here for simplicity, though sometimes separate
    "Scarves": ["Scarves", "Stoles"],
    "Hats": ["Caps", "Hat"],
    "Socks": ["Socks", "Stockings"],
    "Gloves": ["Gloves"],
    "Mufflers": ["Mufflers"],
    "Innerwear": ["Bra", "Briefs", "Innerwear Vests", "Boxers", "Trunk", "Robe", "Bath Robe"],
    "Loungewear and Nightwear": ["Night suits", "Lounge Pants", "Baby Dolls", "Nightdress", "Lounge Tshirts", "Lounge Shorts"],
    "Swimwear": ["Swimwear"],
    "Shapewear": ["Shapewear"],
    "Accessories": ["Accessory Gift Set", "Travel Accessory", "Beauty Accessory"],
    "Dupatta": ["Dupatta"],
    "Shrug": ["Shrug"],
    "Waistcoat": ["Waistcoat"],
    "Jumpsuits and Rompers": ["Jumpsuit", "Rompers"],
    "Lehenga Choli": ["Lehenga Choli"],
    "Clothing Set": ["Clothing Set"],
    "Blouse": ["Blouse"],
    "Cufflinks": ["Cufflinks"],
    "Shoe Accessories": ["Shoe Accessories", "Shoe Laces"],
    "Wristbands": ["Wristbands"],
    "Free Gifts": ["Free Gifts"],
    "Water Bottle": ["Water Bottle"],
    "Fragrance": ["Deodorant", "Perfume and Body Mist", "Fragrance Gift Set"],
    "Makeup": ["Lipstick", "Lip Gloss", "Lip Care", "Lip Liner", "Foundation and Primer", "Highlighter and Blush", "Compact", "Kajal and Eyeliner", "Eyeshadow", "Mascara", "Concealer", "Makeup Remover"],
    "Nails": ["Nail Polish", "Nail Essentials"],
    "Skincare": ["Face Wash and Cleanser", "Face Moisturisers", "Eye Cream", "Face Scrub and Exfoliator", "Mask and Peel", "Face Serum and Gel", "Toner", "Sunscreen"],
    "Bath and Body": ["Body Lotion", "Body Wash and Scrub"],
    "Haircare": ["Hair Colour", "Hair Accessory"],
    "Mens Grooming": ["Mens Grooming Kit"],
    "Keychain": ["Key chain"],
    "Tech Accessories": ["Ipad", "Tablet Sleeve"],
    "Umbrellas": ["Umbrellas"],
    "Home Decor": ["Cushion Covers"]
}

# Defines compatible article types for a given article type based on common fashion rules and dataset items
# Replaced generic terms like "Bags", "Jewellery" with specific article types
COMPATIBLE_TYPES = {
    "Shirts": ["Trousers", "Jeans", "Blazers", "Waistcoat", "Nehru Jackets"],
    "Tshirts": ["Jeans", "Shorts", "Track Pants", "Jackets", "Casual Shoes", "Caps", "Sunglasses", "Backpacks", "Sweatshirts", "Lounge Pants", "Sports Shoes", "Flip Flops", "Skirts", "Waist Pouch", "Rucksacks"],
    "Lounge Tshirts": ["Lounge Pants", "Lounge Shorts", "Flip Flops"],
    "Tops": ["Jeans", "Skirts", "Shorts", "Jackets", "Leggings", "Heels", "Flats", "Sandals", "Handbags", "Clutches", "Backpacks", "Wallets", "Trousers", "Scarves", "Blazers", "Jeggings", "Earrings", "Necklace and Chains", "Bracelet"],
    "Camisoles": ["Jeans", "Skirts", "Shorts", "Blazers"],
    "Tunics": ["Leggings", "Jeans", "Trousers", "Flats", "Sandals", "Jeggings", "Earrings", "Bracelet"],
    "Sweatshirts": ["Jeans", "Track Pants", "Caps", "Sports Shoes", "Casual Shoes", "Shorts", "Lounge Pants", "Backpacks", "Rucksacks"],
    "Tracksuits": ["Sports Shoes", "Caps", "Water Bottle", "Backpacks"],
    "Sweaters": ["Jeans", "Trousers", "Skirts", "Leggings", "Formal Shoes", "Casual Shoes", "Scarves", "Hat", "Booties", "Gloves", "Mufflers"],
    "Kurtas": ["Churidar", "Trousers", "Leggings", "Dupatta", "Sandals", "Flats", "Jewellery Set", "Earrings", "Necklace and Chains", "Bangle", "Ring", "Salwar", "Patiala", "Stoles", "Clutches", "Waistcoat"],
    "Kurta Sets": ["Sandals", "Flats", "Jewellery Set", "Earrings", "Bangle", "Ring", "Dupatta", "Stoles", "Clutches"],
    "Kurtis": ["Churidar", "Leggings", "Jeans", "Dupatta", "Sandals", "Flats", "Jewellery Set", "Earrings", "Necklace and Chains", "Bangle", "Ring", "Salwar", "Patiala", "Skirts", "Stoles", "Handbags"],
    "Jeans": ["Shirts", "Tshirts", "Tops", "Casual Shoes", "Belts", "Jackets", "Sweatshirts", "Heels", "Sandals", "Sweaters", "Booties", "Backpacks", "Caps", "Sunglasses"],
    "Jeggings": ["Tops", "Tshirts", "Shirts", "Kurtis", "Tunics", "Casual Shoes", "Heels", "Flats", "Sweaters", "Booties", "Handbags"],
    "Trousers": ["Shirts", "Tshirts", "Blazers", "Formal Shoes", "Belts", "Ties", "Watches", "Sweaters", "Jackets", "Casual Shoes", "Socks", "Cufflinks", "Suits", "Nehru Jackets", "Messenger Bag", "Laptop Bag", "Suspenders"],
    "Track Pants": ["Tshirts", "Sweatshirts", "Sports Shoes", "Casual Shoes", "Jackets", "Caps", "Backpacks", "Water Bottle", "Waist Pouch"],
    "Capris": ["Tops", "Tshirts", "Casual Shoes", "Sandals", "Flats", "Flip Flops"],
    "Rain Trousers": ["Rain Jacket", "Umbrellas", "Casual Shoes", "Sports Shoes"],
    "Shorts": ["Tshirts", "Shirts", "Casual Shoes", "Sandals", "Sunglasses", "Caps", "Flip Flops", "Sports Shoes", "Backpacks", "Waist Pouch", "Sweatshirts"],
    "Lounge Shorts": ["Lounge Tshirts", "Tshirts", "Flip Flops"],
    "Leggings": ["Tunics", "Kurtis", "Tshirts", "Flats", "Casual Shoes", "Tops", "Dresses", "Sweaters", "Sports Shoes", "Booties", "Handbags"],
    "Tights": ["Dresses", "Skirts", "Tunics", "Heels", "Flats", "Booties"],
    "Skirts": ["Tops", "Shirts", "Flats", "Heels", "Sandals", "Belts", "Handbags", "Clutches", "Backpacks", "Tights", "Blouse", "Jackets", "Sweaters", "Booties", "Earrings", "Necklace and Chains", "Bracelet"],
    "Dresses": ["Heels", "Flats", "Sandals", "Jackets", "Clutches", "Jewellery Set", "Earrings", "Necklace and Chains", "Bracelet", "Ring", "Belts", "Sunglasses", "Scarves", "Hat", "Tights", "Booties", "Shrug", "Handbags"],
    "Suits": ["Formal Shoes", "Shirts", "Ties", "Ties and Cufflinks", "Belts", "Watches", "Cufflinks", "Socks", "Messenger Bag", "Laptop Bag", "Handbags", "Pocket Squares"], # Pocket Squares not in dataset, removed.
    "Nehru Jackets": ["Shirts", "Kurtas", "Trousers", "Formal Shoes"],
    "Blazers": ["Shirts", "Trousers", "Jeans", "Formal Shoes", "Casual Shoes", "Ties", "Belts", "Dresses", "Skirts", "Tshirts", "Cufflinks", "Watches", "Pocket Squares"], # Pocket Squares not in dataset, removed.
    "Jackets": ["Tshirts", "Shirts", "Jeans", "Trousers", "Casual Shoes", "Sweatshirts", "Dresses", "Skirts", "Tops", "Shorts", "Leggings", "Sweaters", "Booties", "Caps", "Hat", "Scarves", "Gloves"],
    "Rain Jacket": ["Rain Trousers", "Umbrellas", "Casual Shoes", "Sports Shoes"],
    "Formal Shoes": ["Trousers", "Shirts", "Suits", "Belts", "Socks", "Dresses", "Skirts", "Blazers", "Waistcoat", "Laptop Bag"],
    "Booties": ["Dresses", "Skirts", "Jeans", "Trousers", "Leggings", "Tights", "Jackets", "Sweaters"],
    "Casual Shoes": ["Jeans", "Tshirts", "Shorts", "Track Pants", "Socks", "Dresses", "Skirts", "Jackets", "Sweatshirts", "Tops", "Caps", "Backpacks"],
    "Sports Sandals": ["Shorts", "Swimwear", "Track Pants", "Tshirts", "Capris"],
    "Sports Shoes": ["Track Pants", "Shorts", "Tshirts", "Socks", "Leggings", "Sweatshirts", "Tracksuits", "Caps", "Wristbands", "Headband", "Water Bottle"],
    "Basketballs": ["Shorts", "Tshirts", "Socks", "Wristbands", "Headband"],
    "Footballs": ["Shorts", "Tshirts", "Socks"],
    "Heels": ["Dresses", "Skirts", "Trousers", "Jeans", "Jumpsuit", "Sarees", "Lehenga Choli", "Blouse", "Suits", "Clutches"],
    "Flats": ["Dresses", "Jeans", "Skirts", "Leggings", "Shorts", "Kurtas", "Kurtis", "Salwar", "Trousers", "Capris", "Jumpsuit", "Rompers"],
    "Sandals": ["Dresses", "Skirts", "Jeans", "Shorts", "Kurtas", "Salwar", "Kurtis", "Lehenga Choli", "Sarees", "Capris", "Jumpsuit", "Rompers", "Swimwear"],
    "Flip Flops": ["Shorts", "Dresses", "Jeans", "Swimwear", "Lounge Pants", "Lounge Shorts", "Night suits", "Nightdress", "Capris"],
    "Sarees": ["Sandals", "Heels", "Jewellery Set", "Earrings", "Necklace and Chains", "Bangle", "Ring", "Clutches", "Blouse", "Stoles"],
    "Salwar": ["Kurtas", "Kurtis", "Dupatta", "Sandals", "Flats", "Jewellery Set", "Earrings", "Bangle", "Ring"],
    "Churidar": ["Kurtas", "Kurtis"],
    "Patiala": ["Kurtas", "Kurtis"],
    "Salwar and Dupatta": ["Kurtas", "Kurtis", "Sandals", "Flats", "Jewellery Set", "Earrings", "Bangle", "Ring"],
    "Belts": ["Trousers", "Jeans", "Dresses", "Skirts", "Shorts", "Suits", "Tunics", "Jumpsuit"],
    "Suspenders": ["Trousers", "Shirts", "Suits"],
    "Ties": ["Shirts", "Suits", "Blazers"],
    "Ties and Cufflinks": ["Shirts", "Suits", "Blazers"],
    "Watches": [], # Compatible with almost everything
    "Sunglasses": [], # Compatible with outdoor/daytime wear
    "Handbags": ["Dresses", "Skirts", "Tops", "Jeans", "Trousers", "Suits", "Sarees", "Kurtis", "Jumpsuit", "Laptop Bag"], # Added work/ethnic context
    "Clutches": ["Dresses", "Sarees", "Lehenga Choli", "Jumpsuit", "Suits", "Kurtas", "Kurtis"],
    "Backpacks": ["Jeans", "Tshirts", "Casual Shoes", "Jackets", "Sweatshirts", "Travel Accessory", "Track Pants", "Shorts", "Laptop Bag", "Tablet Sleeve", "Rucksacks"], # Added context
    "Wallets": [], # Carried inside bags/pockets
    "Laptop Bag": ["Shirts", "Trousers", "Suits", "Blazers", "Formal Shoes", "Handbags", "Backpacks", "Messenger Bag", "Ipad", "Tablet Sleeve"],
    "Duffel Bag": ["Tracksuits", "Sports Shoes", "Travel Accessory", "Casual Shoes", "Jeans", "Tshirts", "Sweatshirts"],
    "Messenger Bag": ["Shirts", "Jeans", "Trousers", "Casual Shoes", "Jackets", "Blazers", "Laptop Bag", "Tablet Sleeve"],
    "Trolley Bag": ["Travel Accessory"],
    "Mobile Pouch": [], # Carried
    "Waist Pouch": ["Shorts", "Track Pants", "Jeans", "Tshirts", "Travel Accessory", "Sports Shoes", "Casual Shoes", "Caps"],
    "Rucksacks": ["Jackets", "Jeans", "Travel Accessory", "Sweatshirts", "Casual Shoes", "Sports Shoes", "Backpacks"],
    "Jewellery Set": ["Sarees", "Lehenga Choli", "Dresses", "Kurtas", "Kurtis", "Salwar", "Suits", "Blouse"],
    "Necklace and Chains": ["Tops", "Dresses", "Sarees", "Kurtas", "Kurtis", "Lehenga Choli", "Blouse", "Shirts", "Sweaters"], # Broad compatibility
    "Pendant": ["Necklace and Chains"], # Usually part of a necklace
    "Earrings": ["Tops", "Dresses", "Sarees", "Kurtas", "Kurtis", "Lehenga Choli", "Blouse", "Shirts", "Sweaters", "Jumpsuit"], # Broad compatibility
    "Ring": [], # Broad compatibility
    "Bracelet": ["Tops", "Dresses", "Sarees", "Kurtas", "Kurtis", "Lehenga Choli", "Blouse", "Shirts", "Sweaters", "Jumpsuit", "Watches"], # Broad compatibility
    "Bangle": ["Sarees", "Lehenga Choli", "Kurtas", "Kurtis", "Salwar"],
    "Headband": ["Tops", "Dresses", "Tshirts", "Sports Shoes", "Track Pants", "Shorts"],
    "Scarves": ["Dresses", "Tops", "Jackets", "Suits", "Blazers", "Sweaters", "Shirts", "Kurtas", "Hat"],
    "Stoles": ["Sarees", "Dresses", "Kurtas", "Kurtis", "Lehenga Choli"],
    "Caps": ["Tshirts", "Jeans", "Shorts", "Dresses", "Sweatshirts", "Jackets", "Sports Shoes", "Tracksuits", "Waist Pouch"],
    "Hat": ["Dresses", "Suits", "Sunglasses", "Shirts", "Jackets", "Sweaters", "Swimwear", "Scarves", "Gloves"],
    "Socks": ["Formal Shoes", "Casual Shoes", "Sports Shoes", "Booties"],
    "Stockings": ["Dresses", "Skirts", "Heels", "Booties"],
    "Gloves": ["Jackets", "Suits", "Sweaters", "Hat", "Scarves", "Mufflers"],
    "Mufflers": ["Suits", "Jackets", "Sweaters", "Gloves", "Hat"],
    "Bra": ["Tops", "Dresses", "Shirts", "Tshirts", "Kurtis", "Blouse", "Sweatshirts", "Jackets", "Jumpsuit"],
    "Briefs": ["Trousers", "Jeans", "Shorts", "Suits", "Track Pants"],
    "Innerwear Vests": ["Shirts", "Tshirts", "Kurtas"],
    "Boxers": ["Lounge Pants", "Shorts", "Night suits"],
    "Trunk": ["Trousers", "Jeans", "Shorts", "Suits", "Track Pants"],
    "Robe": ["Night suits", "Nightdress", "Baby Dolls", "Innerwear"],
    "Bath Robe": [],
    "Night suits": [],
    "Lounge Pants": ["Lounge Tshirts", "Tshirts"],
    "Baby Dolls": [],
    "Nightdress": [],
    "Swimwear": ["Flip Flops", "Sandals", "Sunglasses", "Hat", "Shorts"],
    "Shapewear": ["Dresses", "Skirts", "Trousers", "Sarees", "Lehenga Choli", "Suits"],
    "Accessory Gift Set": [],
    "Travel Accessory": ["Backpacks", "Trolley Bag", "Duffel Bag", "Rucksacks", "Waist Pouch", "Wallets", "Sunglasses", "Hat", "Caps"],
    "Dupatta": ["Kurtas", "Salwar", "Lehenga Choli", "Kurtis"],
    "Shrug": ["Tops", "Dresses", "Jeans", "Tshirts", "Skirts", "Jumpsuit"],
    "Waistcoat": ["Shirts", "Trousers", "Formal Shoes", "Suits", "Kurtas"],
    "Jumpsuit": ["Jackets", "Heels", "Sandals", "Belts", "Handbags", "Clutches", "Jewellery Set", "Earrings", "Necklace and Chains", "Bracelet", "Sunglasses", "Flats", "Shrug"],
    "Rompers": ["Sandals", "Casual Shoes", "Sunglasses", "Flats", "Caps", "Jackets", "Backpacks"],
    "Lehenga Choli": ["Dupatta", "Sandals", "Heels", "Jewellery Set", "Earrings", "Necklace and Chains", "Bangle", "Ring", "Clutches", "Blouse"],
    "Clothing Set": [], # Depends on set contents
    "Blouse": ["Sarees", "Lehenga Choli", "Skirts", "Jeans"],
    "Cufflinks": ["Shirts", "Suits", "Blazers", "Ties and Cufflinks"],
    "Shoe Accessories": ["Formal Shoes", "Casual Shoes", "Sports Shoes", "Booties"],
    "Shoe Laces": ["Formal Shoes", "Casual Shoes", "Sports Shoes", "Booties"],
    "Wristbands": ["Sports Shoes", "Tshirts", "Shorts", "Track Pants", "Caps", "Headband", "Watches"], # Added Watches for sports watches
    "Free Gifts": [],
    "Water Bottle": ["Sports Shoes", "Backpacks", "Duffel Bag", "Travel Accessory", "Track Pants", "Shorts"],
    "Deodorant": [],
    "Perfume and Body Mist": [],
    "Fragrance Gift Set": [],
    "Lipstick": ["Dresses", "Tops", "Sarees", "Kurtis", "Lehenga Choli", "Suits", "Blazers", "Jumpsuit"],
    "Lip Gloss": ["Dresses", "Tops", "Kurtis", "Jumpsuit"],
    "Lip Care": [],
    "Lip Liner": ["Lipstick"],
    "Foundation and Primer": [],
    "Highlighter and Blush": [],
    "Compact": [],
    "Kajal and Eyeliner": [],
    "Eyeshadow": [],
    "Mascara": [],
    "Concealer": [],
    "Makeup Remover": [],
    "Nail Polish": [],
    "Nail Essentials": [],
    "Face Wash and Cleanser": [],
    "Face Moisturisers": [],
    "Eye Cream": [],
    "Face Scrub and Exfoliator": [],
    "Mask and Peel": [],
    "Face Serum and Gel": [],
    "Toner": [],
    "Sunscreen": [],
    "Body Lotion": [],
    "Body Wash and Scrub": [],
    "Hair Colour": [],
    "Hair Accessory": ["Dresses", "Tops", "Sarees", "Kurtis", "Lehenga Choli", "Jumpsuit", "Blouse"],
    "Mens Grooming Kit": [],
    "Key chain": ["Backpacks", "Handbags", "Wallets"], # Where keychains might be attached
    "Ipad": ["Laptop Bag", "Tablet Sleeve", "Backpacks", "Messenger Bag"],
    "Tablet Sleeve": ["Laptop Bag", "Backpacks", "Messenger Bag", "Ipad"],
    "Umbrellas": ["Rain Jacket", "Rain Trousers"],
    "Cushion Covers": []
}


# Defines accessory types suitable for different usage occasions based on dataset items
# Replaced generic "Jewellery" with specific types
# Note: Some clothing items are included for contextual relevance (e.g., work outfit includes shirts/trousers)
ACCESSORY_COMBINATIONS = {
    "Formal": ["Belts", "Ties", "Ties and Cufflinks", "Watches", "Cufflinks", "Formal Shoes", "Messenger Bag", "Socks", "Suspenders", "Laptop Bag", "Shirts", "Trousers", "Suits", "Blazers", "Waistcoat"], # Added clothing context
    "Casual": ["Sunglasses", "Caps", "Backpacks", "Casual Shoes", "Belts", "Watches", "Hat", "Scarves", "Earrings", "Necklace and Chains", "Bracelet", "Ring", "Key chain", "Wallets", "Mobile Pouch", "Waist Pouch", "Sandals", "Jeans", "Jackets"], # Added clothing context
    "Sports": ["Caps", "Sports Shoes", "Socks", "Wristbands", "Headband", "Duffel Bag", "Water Bottle", "Sunglasses", "Track Pants", "Shorts", "Tshirts", "Sweatshirts", "Tracksuits", "Sports Sandals"], # Added clothing context
    "Party": ["Jewellery Set", "Earrings", "Necklace and Chains", "Bracelet", "Ring", "Bangle", "Clutches", "Heels", "Scarves", "Belts", "Watches", "Hair Accessory", "Dresses", "Jumpsuit", "Suits", "Blazers"], # Added clothing context
    "Ethnic": ["Jewellery Set", "Bangle", "Earrings", "Necklace and Chains", "Ring", "Pendant", "Sandals", "Flats", "Heels", "Dupatta", "Stoles", "Clutches", "Kurtas", "Kurtis", "Sarees", "Lehenga Choli", "Salwar", "Kurta Sets"], # Added clothing context
    "Travel": ["Backpacks", "Duffel Bag", "Sunglasses", "Hat", "Scarves", "Sandals", "Wallets", "Trolley Bag", "Waist Pouch", "Rucksacks", "Travel Accessory", "Mobile Pouch", "Water Bottle", "Caps", "Umbrellas", "Casual Shoes", "Flip Flops", "Jackets", "Sweatshirts", "Jeans", "Shorts"], # Added clothing context
    "Work": ["Formal Shoes", "Belts", "Ties", "Ties and Cufflinks", "Watches", "Laptop Bag", "Messenger Bag", "Handbags", "Cufflinks", "Suspenders", "Socks", "Shirts", "Trousers", "Blazers", "Suits", "Formal Shoes", "Booties"], # Added clothing context
    "Home": ["Bath Robe", "Robe", "Cushion Covers", "Night suits", "Nightdress", "Lounge Pants", "Lounge Tshirts", "Lounge Shorts", "Baby Dolls", "Flip Flops", "Socks"], # Added Socks
    "Smart Casual": ["Watches", "Belts", "Casual Shoes", "Blazers", "Shirts", "Trousers", "Jeans", "Sunglasses", "Messenger Bag", "Scarves", "Sweaters", "Jackets", "Flats", "Booties"] # Added more clothing context
}

# Defines accessories suitable for different seasons based on dataset items
# Note: Includes clothing items relevant to the season for broader outfit context
SEASONAL_ACCESSORIES = {
    "Winter": ["Scarves", "Gloves", "Mufflers", "Hat", "Socks", "Body Lotion", "Sweaters", "Jackets", "Sweatshirts", "Stockings", "Booties", "Leggings", "Blazers", "Trousers", "Jeans", "Formal Shoes", "Casual Shoes"],
    "Summer": ["Sunglasses", "Flip Flops", "Hat", "Sandals", "Caps", "Sunscreen", "Shorts", "Tshirts", "Dresses", "Skirts", "Swimwear", "Casual Shoes", "Tops", "Socks", "Water Bottle", "Capris"],
    "Spring": ["Scarves", "Flats", "Jackets", "Sandals", "Sunglasses", "Dresses", "Tops", "Shrug", "Shirts", "Casual Shoes", "Sweaters", "Caps", "Belts", "Jeans", "Trousers", "Skirts", "Light Jackets"], # Added Light Jackets (use Jackets?)
    "Fall": ["Jackets", "Booties", "Scarves", "Sweaters", "Hat", "Gloves", "Mufflers", "Sweatshirts", "Trousers", "Jeans", "Socks", "Stockings", "Blazers", "Flats", "Casual Shoes", "Belts", "Shirts", "Leggings"]
}

# Defines compatible color pairings (subjective, based on common fashion rules)
# Corrected to ensure all listed compatible colors are present in the dataset's baseColour list
COLOR_COMPATIBILITY = {
    "Navy Blue": ["White", "Grey", "Beige", "Brown", "Red", "Pink", "Mustard", "Olive", "Tan", "Yellow", "Cream", "Gold", "Silver", "Orange"],
    "Blue": ["White", "Grey", "Beige", "Yellow", "Orange", "Pink", "Green", "Red", "Black", "Gold", "Silver", "Brown"],
    "Silver": ["Black", "White", "Grey", "Blue", "Purple", "Pink", "Red", "Navy Blue", "Charcoal"],
    "Black": ["White", "Grey", "Red", "Pink", "Blue", "Gold", "Silver", "Yellow", "Green", "Purple", "Orange", "Beige", "Maroon", "Mustard"],
    "Grey": ["White", "Black", "Blue", "Pink", "Red", "Purple", "Green", "Yellow", "Navy Blue", "Charcoal", "Maroon"],
    "Green": ["White", "Beige", "Brown", "Navy Blue", "Grey", "Yellow", "Black", "Gold", "Cream", "Tan", "Orange"],
    "Purple": ["White", "Grey", "Silver", "Gold", "Pink", "Black", "Lavender", "Mauve", "Yellow"],
    "White": ["Black", "Grey", "Blue", "Red", "Green", "Purple", "Pink", "Beige", "Brown", "Navy Blue", "Yellow", "Orange", "Tan", "Khaki", "Maroon", "Olive", "Mustard"], # Removed "Any"
    "Beige": ["Brown", "Blue", "Navy Blue", "White", "Green", "Red", "Black", "Olive", "Tan", "Cream", "Maroon", "Mustard"],
    "Brown": ["Beige", "White", "Green", "Navy Blue", "Tan", "Gold", "Cream", "Yellow", "Orange", "Mustard", "Olive", "Khaki"],
    "Bronze": ["Black", "Brown", "Cream", "Teal", "Burgundy", "White", "Olive", "Gold"],
    "Teal": ["White", "Beige", "Brown", "Gold", "Navy Blue", "Grey", "Silver", "Yellow"], # Removed "Coral"
    "Copper": ["Black", "White", "Teal", "Green", "Navy Blue", "Brown", "Cream", "Olive", "Burgundy"],
    "Pink": ["White", "Grey", "Blue", "Black", "Green", "Purple", "Navy Blue", "Silver", "Gold", "Brown", "Beige"],
    "Off White": ["Brown", "Blue", "Black", "Red", "Green", "Beige", "Navy Blue", "Maroon", "Olive", "Tan"],
    "Maroon": ["White", "Beige", "Grey", "Gold", "Black", "Navy Blue", "Tan", "Olive", "Mustard"],
    "Red": ["White", "Black", "Grey", "Blue", "Navy Blue", "Gold", "Beige", "Tan", "Khaki"],
    "Khaki": ["White", "Navy Blue", "Brown", "Black", "Burgundy", "Olive", "Red", "Green", "Beige"],
    "Orange": ["Blue", "White", "Black", "Brown", "Navy Blue", "Grey", "Green", "Beige", "Gold"],
    "Coffee Brown": ["Beige", "Cream", "Tan", "Gold", "Teal", "White", "Olive", "Mustard", "Maroon"],
    "Yellow": ["Blue", "White", "Grey", "Green", "Purple", "Black", "Navy Blue", "Brown", "Beige"],
    "Charcoal": ["White", "Grey", "Pink", "Red", "Blue", "Black", "Silver", "Mustard", "Burgundy"],
    "Gold": ["Black", "White", "Red", "Burgundy", "Navy Blue", "Green", "Purple", "Brown", "Cream", "Maroon", "Teal"],
    "Steel": ["Black", "White", "Grey", "Blue", "Navy Blue", "Red", "Charcoal"],
    "Tan": ["Brown", "White", "Blue", "Navy Blue", "Green", "Beige", "Olive", "Khaki", "Red", "Maroon"],
    "Multi": [],
    "Magenta": ["White", "Black", "Grey", "Yellow", "Silver", "Gold", "Blue", "Purple"],
    "Lavender": ["White", "Grey", "Silver", "Pink", "Blue", "Purple", "Green", "Beige"],
    "Sea Green": ["White", "Beige", "Navy Blue", "Tan", "Gold", "Grey", "Yellow", "Pink"], # Removed "Coral"
    "Cream": ["Brown", "Beige", "Gold", "Navy Blue", "Maroon", "Olive", "Tan", "White", "Black"],
    "Peach": ["White", "Grey", "Navy Blue", "Green", "Cream", "Beige", "Gold"], # Removed "Coral", "Mint Green"
    "Olive": ["White", "Black", "Beige", "Brown", "Tan", "Khaki", "Navy Blue", "Grey", "Gold", "Mustard", "Burgundy"],
    "Skin": ["White", "Black", "Brown", "Beige", "Cream", "Olive", "Tan", "Pink", "Maroon"],
    "Burgundy": ["White", "Black", "Gold", "Navy Blue", "Grey", "Beige", "Tan", "Olive", "Cream", "Pink"],
    "Grey Melange": ["White", "Black", "Blue", "Red", "Pink", "Navy Blue", "Green"], # Removed "Denim"
    "Rust": ["White", "Beige", "Navy Blue", "Green", "Black", "Brown", "Cream", "Gold", "Olive"],
    "Rose": ["White", "Grey", "Black", "Gold", "Silver", "Pink", "Beige", "Navy Blue", "Green"],
    "Lime Green": ["White", "Black", "Grey", "Blue", "Navy Blue", "Yellow", "Pink", "Beige"],
    "Mauve": ["White", "Grey", "Silver", "Pink", "Blue", "Purple", "Lavender", "Beige", "Black"],
    "Turquoise Blue": ["White", "Beige", "Navy Blue", "Tan", "Gold", "Silver", "Yellow", "Brown", "Black"], # Removed "Coral"
    "Metallic": ["Black", "White", "Grey", "Blue", "Purple", "Red", "Gold", "Silver"],
    "Mustard": ["Navy Blue", "White", "Grey", "Black", "Brown", "Olive", "Burgundy", "Beige", "Green"], # Removed "Denim"
    "Taupe": ["White", "Black", "Beige", "Brown", "Navy Blue", "Cream", "Grey", "Olive", "Pink"],
    "Nude": ["White", "Black", "Brown", "Beige", "Cream", "Olive", "Tan", "Pink", "Maroon", "Gold", "Silver"],
    "Mushroom Brown": ["White", "Beige", "Brown", "Green", "Cream", "Grey", "Olive", "Tan", "Black"],
    "Fluorescent Green": ["Black", "White", "Grey", "Navy Blue", "Pink", "Purple"]
}

# constants.py

# Add this dictionary
USAGE_COMPATIBILITY = {
    # Target Usage: [Allowed Recommendation Usages]
    "Casual": ["Casual", "Smart Casual", "Sports", "Travel", "Home", "Ethnic"], # Casual can be paired widely
    "Ethnic": ["Ethnic", "Casual", "Party"], # Ethnic often pairs with itself or casual/party elements
    "Formal": ["Formal", "Smart Casual", "Party"], # Formal pairs with formal, smart casual, or party accessories
    "Sports": ["Sports", "Casual", "Travel"], # Sports pairs with sports or casual
    "Smart Casual": ["Smart Casual", "Casual", "Formal", "Party", "Travel"], # Versatile
    "Travel": ["Travel", "Casual", "Sports", "Smart Casual"],
    "Party": ["Party", "Formal", "Smart Casual", "Casual", "Ethnic"], # Party is flexible
    "Home": ["Home", "Casual"], # Home pairs with home or basic casual
    # Add default if usage is missing or unknown
    "Unknown": ["Casual", "Smart Casual", "Sports", "Travel", "Home", "Ethnic", "Formal", "Party"] # Allow anything if unknown
}

# (Keep other constants like ARTICLE_TYPE_GROUPS, COMPATIBLE_TYPES, etc.)
# ... (rest of constants.py)
