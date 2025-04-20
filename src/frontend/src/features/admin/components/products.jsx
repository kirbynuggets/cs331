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
  Tooltip,
  OutlinedInput
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useLocation } from "react-router-dom";

// Same product data as before
const initialProductData = [
  {
    id: 1,
    name: "Casual Cotton T-Shirt",
    category: "Clothing",
    stock: 128,
    price: "$19.99",
    image: "https://shop.mango.com/assets/rcs/pics/static/T6/fotos/S/67010458_50.jpg?imwidth=2048&imdensity=1&ts=1701077599405",
  },
  // ... rest of the products
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
  }
];

// Stock level indicator
const StockLevel = ({ stock }) => {
  let color = stock < 40 ? "#a05252" : stock < 70 ? "#b78a3f" : "#5e7052";
  let label = stock < 40 ? "Low" : stock < 70 ? "Medium" : "Good";

  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      <Box
        sx={{
          height: 8,
          width: 8,
          borderRadius: "50%",
          bgcolor: color,
          mr: 1,
        }}
      />
      <Typography variant="caption" sx={{ color: "#767676" }}>
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
        border: "1px solid #eaeaea",
        mb: 4,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Typography variant="h6" sx={{ 
          fontWeight: 400, 
          letterSpacing: "0.5px",
          fontSize: "1rem"
        }}>
          {isFullPage ? "ALL PRODUCTS" : "PRODUCT INVENTORY"}
        </Typography>

        {/* Category Dropdown & View All Products */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              input={<OutlinedInput sx={{ borderRadius: 0 }} />}
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
              sx={{ color: "#242424", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}
            >
              View All Products
            </Button>
          ) : isFullPage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("add")}
              size="small"
              sx={{ 
                bgcolor: "#242424", 
                "&:hover": { bgcolor: "#000" },
                letterSpacing: "1px", 
                fontSize: "0.75rem",
                textTransform: "uppercase"
              }}
            >
              Add Product
            </Button>
          )}
        </Box>
      </Box>

      {/* Product Grid */}
      <Grid container spacing={0} sx={{ px: 2, py: 3 }}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={isFullPage ? 3 : 3} key={product.id} sx={{ p: 1 }}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                bgcolor: "#ffffff",
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.05)"
                }
              }}
            >
              {isFullPage && (
                <Box sx={{ 
                  position: "absolute", 
                  top: 8, 
                  right: 8, 
                  display: "flex", 
                  gap: 1,
                  opacity: 0.7,
                  "&:hover": { opacity: 1 }
                }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog("edit", product)}
                    sx={{ bgcolor: "rgba(255,255,255,0.8)" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteProduct(product.id)}
                    sx={{ bgcolor: "rgba(255,255,255,0.8)" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <CardMedia
                component="img"
                sx={{
                  height: 220,
                  objectFit: "cover",
                }}
                image={product.image}
                alt={product.name}
              />
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography
                  gutterBottom
                  variant="body1"
                  sx={{ 
                    fontWeight: 400, 
                    letterSpacing: "0.3px",
                    fontSize: "0.95rem",
                    mb: 0.5
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, mb: 1 }}
                >
                  {product.price}
                </Typography>
                <StockLevel stock={product.stock} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Product Dialog for Add/Edit */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: "1px solid #eaeaea", 
          fontWeight: 400,
          letterSpacing: "0.5px"
        }}>
          {dialogMode === "add" ? "ADD NEW PRODUCT" : "EDIT PRODUCT"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                value={currentProduct.name}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                InputProps={{ sx: { borderRadius: 0 } }}
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
                  input={<OutlinedInput sx={{ borderRadius: 0 }} />}
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
                InputProps={{ sx: { borderRadius: 0 } }}
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
                InputProps={{ sx: { borderRadius: 0 } }}
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
                InputProps={{ sx: { borderRadius: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: "#767676", 
              letterSpacing: "1px", 
              fontSize: "0.75rem",
              textTransform: "uppercase"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProduct}
            variant="contained"
            sx={{ 
              bgcolor: "#242424", 
              "&:hover": { bgcolor: "#000" },
              letterSpacing: "1px", 
              fontSize: "0.75rem",
              textTransform: "uppercase"
            }}
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
          sx={{ 
            width: '100%',
            borderRadius: 0,
            bgcolor: snackbar.severity === 'success' ? '#5e7052' : '#a05252'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductInventory;