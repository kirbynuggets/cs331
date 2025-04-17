import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Tooltip
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate, useLocation } from "react-router-dom";

// Expanded product data
const initialProductData = [
  {
    id: 1,
    name: "Casual Cotton T-Shirt",
    category: "Clothing",
    stock: 128,
    price: "$19.99",
    image: "https://shop.mango.com/assets/rcs/pics/static/T6/fotos/S/67010458_50.jpg?imwidth=2048&imdensity=1&ts=1701077599405",
  },
  {
    id: 2,
    name: "Premium Denim Jeans",
    category: "Clothing",
    stock: 89,
    price: "$49.99",
    image: "https://assets.ajio.com/medias/sys_master/root/20230901/jPf9/64f1f6f7afa4cf41f59d54fd/-473Wx593H-469537893-darkindigo-MODEL.jpg",
  },
  {
    id: 3,
    name: "Leather Wallet",
    category: "Accessories",
    stock: 50,
    price: "$29.99",
    image: "https://craftandglory.in/cdn/shop/products/DSC07927_1.jpg?v=1660802328&width=1946",
  },
  {
    id: 4,
    name: "Running Sneakers",
    category: "Footwear",
    stock: 75,
    price: "$79.99",
    image: "https://www.tracerindia.com/cdn/shop/files/1_6c808329-dd9a-4454-9337-57ece421fa0e.jpg?v=1732265882&width=1920",
  },
  {
    id: 5,
    name: "Smart Watch",
    category: "Accessories",
    stock: 40,
    price: "$199.99",
    image: "https://m.media-amazon.com/images/I/61ZjlBOp+rL.jpg",
  },
  {
    id: 6,
    name: "Winter Jacket",
    category: "Clothing",
    stock: 22,
    price: "$99.99",
    image: "https://images-cdn.ubuy.co.in/65387a8e9a174823154cd84d-tacvasen-men-39-s-winter-jacket-with.jpg",
  },
  {
    id: 7,
    name: "Fitness Tracker",
    category: "Accessories",
    stock: 65,
    price: "$89.99",
    image: "https://m.media-amazon.com/images/I/61YwaovfYFL.jpg",
  },
  {
    id: 8,
    name: "Designer Sunglasses",
    category: "Accessories",
    stock: 38,
    price: "$129.99",
    image: "https://assets.sunglasshut.com/is/image/LuxotticaRetail/8056597665698__STD__shad__qt.png",
  },
  {
    id: 9,
    name: "Formal Dress Shirt",
    category: "Clothing",
    stock: 86,
    price: "$45.99",
    image: "https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-1505352_alternate10?$plpDeskRFAlt$",
  },
  {
    id: 10,
    name: "Hiking Boots",
    category: "Footwear",
    stock: 42,
    price: "$119.99",
    image: "https://www.tracerindia.com/cdn/shop/files/4_893ead97-f5d7-42a0-9101-8a4b0b73d99f.jpg?v=1702727721&width=1946",
  },
  {
    id: 11,
    name: "Leather Belt",
    category: "Accessories",
    stock: 55,
    price: "$34.99",
    image: "https://assets.ajio.com/medias/sys_master/root/20231013/2Er2/652933a1ddf7791519397cfd/-1117Wx1400H-469553290-brown-MODEL.jpg",
  },
  {
    id: 12,
    name: "Summer Sandals",
    category: "Footwear",
    stock: 29,
    price: "$39.99",
    image: "https://i5.walmartimages.com/asr/3b4e4cfb-1db1-47af-8028-dfc00a27fcc0.1745d3ce8032f65e417f52053c5642af.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF",
  }
];

// Stock level indicator
const StockLevel = ({ stock }) => {
  let color = stock < 40 ? "#f44336" : stock < 70 ? "#ff9800" : "#4caf50";
  let label = stock < 40 ? "Low" : stock < 70 ? "Medium" : "Good";

  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      <Box
        sx={{
          height: 10,
          width: 10,
          borderRadius: "50%",
          bgcolor: color,
          mr: 1,
        }}
      />
      <Typography variant="caption">
        {label} Stock: {stock} units
      </Typography>
    </Box>
  );
};

const ProductInventory = ({ showViewMore = false }) => {
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();
  const isFullPage = location.pathname === "/admin/dashboard/products";
  
  const [products, setProducts] = useState(initialProductData);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [currentProduct, setCurrentProduct] = useState({
    id: 0,
    name: "",
    category: "Clothing",
    stock: 0,
    price: "",
    image: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const filteredProducts =
    category === "All"
      ? products.slice(0, showViewMore && !isFullPage ? 4 : products.length)
      : products
          .filter((product) => product.category === category)
          .slice(0, showViewMore && !isFullPage ? 4 : products.length);

  const handleOpenDialog = (mode, product = null) => {
    setDialogMode(mode);
    if (product) {
      setCurrentProduct({ ...product });
    } else {
      setCurrentProduct({
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: "",
        category: "Clothing",
        stock: 0,
        price: "",
        image: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: name === "stock" ? parseInt(value) || 0 : value,
    });
  };

  const handleSaveProduct = () => {
    if (dialogMode === "add") {
      setProducts([...products, currentProduct]);
      setSnackbar({
        open: true,
        message: "Product added successfully!",
        severity: "success"
      });
    } else {
      setProducts(
        products.map((p) => (p.id === currentProduct.id ? currentProduct : p))
      );
      setSnackbar({
        open: true,
        message: "Product updated successfully!",
        severity: "success"
      });
    }
    setOpenDialog(false);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    setSnackbar({
      open: true,
      message: "Product deleted successfully!",
      severity: "success"
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        mb: 3,
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {isFullPage ? "All Products" : "Product Inventory"}
        </Typography>

        {/* Category Dropdown & View All Products */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Accessories">Accessories</MenuItem>
              <MenuItem value="Footwear">Footwear</MenuItem>
            </Select>
          </FormControl>

          {showViewMore && !isFullPage ? (
            <Button
              variant="text"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/admin/dashboard/products")}
              size="small"
            >
              View All Products
            </Button>
          ) : isFullPage && (
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => handleOpenDialog("add")}
              size="small"
              color="primary"
            >
              Add Product
            </Button>
          )}
        </Box>
      </Box>

      {/* Product Grid */}
      <Grid container spacing={2} sx={{ p: 2 }}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={isFullPage ? 3 : 3} key={product.id}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                bgcolor: "#ffffff",
                position: "relative",
              }}
            >
              {isFullPage && (
                <Box sx={{ position: "absolute", top: 5, right: 5, display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog("edit", product)}
                      sx={{ bgcolor: "rgba(255,255,255,0.8)" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProduct(product.id)}
                      sx={{ bgcolor: "rgba(255,255,255,0.8)" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              <CardMedia
                component="img"
                sx={{
                  height: 180,
                  objectFit: "contain",
                  padding: "10px",
                  bgcolor: "#ffffff", // Matches the card background
                }}
                image={product.image}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  gutterBottom
                  variant="h6"
                  sx={{ fontSize: "1rem", fontWeight: 600 }}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "#4caf50" }}
                >
                  Price: {product.price}
                </Typography>
                <StockLevel stock={product.stock} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Product Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "add" ? "Add New Product" : "Edit Product"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                value={currentProduct.name}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <Select
                  name="category"
                  value={currentProduct.category}
                  onChange={handleInputChange}
                  displayEmpty
                  variant="outlined"
                >
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                  <MenuItem value="Footwear">Footwear</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="stock"
                label="Stock Quantity"
                type="number"
                fullWidth
                value={currentProduct.stock}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Price"
                fullWidth
                value={currentProduct.price}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                placeholder="$0.00"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="image"
                label="Image URL"
                fullWidth
                value={currentProduct.image}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveProduct}
            variant="contained"
            color="primary"
          >
            {dialogMode === "add" ? "Add Product" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductInventory;