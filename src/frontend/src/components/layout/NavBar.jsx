import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  InputBase,
  Container,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  Person,
  Search,
  Menu as MenuIcon,
  Close,
  ShoppingBag,
  ChevronRight,
  Notifications,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCartItems,
  selectCartTotalQuantity,
} from "../../features/cart/cartSlice.js";
import { selectWishlistItems } from "../../features/wishlist/wishlistSlice.js";

// --- Styled Components for Theme Awareness ---
const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.background.default, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.default, 0.2),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

const CategoryButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: "8px 16px",
  marginRight: theme.spacing(1),
  textTransform: "none",
  fontWeight: 500,
  color: selected
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  backgroundColor: selected
    ? theme.palette.primary.main
    : alpha(theme.palette.action.hover, 0.05),
  "&:hover": {
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.9)
      : alpha(theme.palette.action.hover, 0.1),
  },
  transition: "all 0.3s ease",
}));

// Categories based on API 'gender' field
const categories = [
  { id: "Men", name: "Men", icon: "👔" },
  { id: "Women", name: "Women", icon: "👗" },
  // Add other categories if needed, based on API data (e.g., masterCategory)
];

const NavBar = ({ username = "Guest" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartTotalQuantity);
  const wishlistItems = useSelector(selectWishlistItems);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotificationOpen = (event) =>
    setNotificationAnchorEl(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchorEl(null);
  const handleLogout = () => {
    console.log("Logged out");
    navigate("/", { replace: true });
  };
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    setDrawerOpen(false);

    // Navigate to the appropriate category page
    if (category === "all") {
      navigate("/products");
    } else {
      navigate(`/products/${category.toLowerCase()}`);
    }
  };

  return (
    <>
      {/* AppBar */}
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 1px 3px rgba(255,255,255,0.1)"
              : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: { xs: 1, md: 4 },
                cursor: "pointer",
              }}
              onClick={() => navigate("/")}
            >
              <ShoppingBag
                sx={{
                  color: theme.palette.primary.main,
                  mr: 1,
                  fontSize: "2rem",
                }}
              />
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: theme.palette.primary.main,
                }}
              >
                LUXE
              </Typography>
            </Box>
            {/* <SearchBar
              sx={{
                flexGrow: { xs: 1, md: 0 },
                mr: { xs: 0, md: 1 },
                ml: { md: 80 },
              }}
            >
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products…"
                inputProps={{ "aria-label": "search" }}
              />
            </SearchBar> */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* <IconButton
                color="inherit"
                sx={{ ml: 130 }}
                onClick={handleNotificationOpen}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton> */}
              <IconButton
                color="inherit"
                sx={{ ml: { xs: 0.5, sm: 1, md: 138 } }}
                onClick={() => navigate("/user/wishlist")}
              >
                <Badge badgeContent={wishlistItems.length} color="error">
                  <Favorite />
                </Badge>
              </IconButton>
              <IconButton
                color="inherit"
                sx={{ ml: { xs: 0.5, sm: 1 } }}
                onClick={() => navigate("/cart")}
              >
                <Badge
                  badgeContent={cartItemCount || cartItems.length}
                  color="error"
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
              <IconButton
                edge="end"
                aria-label="account"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ ml: { xs: 0.5, sm: 1 } }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: "0.875rem",
                  }}
                >
                  {username ? username.charAt(0).toUpperCase() : "G"}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Menus and Drawer */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationAnchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 320,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            p: 1.5,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <MenuItem
          onClick={handleNotificationClose}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <Box>
            <Typography variant="body2" fontWeight={500}>
              New arrivals from your favorite brands
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 hours ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          onClick={handleNotificationClose}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Your order #5789 has been shipped
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yesterday
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          onClick={handleNotificationClose}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Flash sale: 30% off all summer items
            </Typography>
            <Typography variant="caption" color="text.secondary">
              2 days ago
            </Typography>
          </Box>
        </MenuItem>
        <Divider sx={{ borderColor: theme.palette.divider }} />
        <Box sx={{ p: 1, textAlign: "center" }}>
          <Button size="small" endIcon={<ChevronRight />}>
            View all notifications
          </Button>
        </Box>
      </Menu>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Welcome, {username}!
          </Typography>
        </Box>
        <Divider sx={{ borderColor: theme.palette.divider }} />
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate("/user/profile");
          }}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <Person fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate("/user/orders");
          }}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <ShoppingBag
            fontSize="small"
            sx={{ mr: 1.5, color: "text.secondary" }}
          />
          <Typography variant="body2">My Orders</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate("/user/wishlist");
          }}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <Favorite
            fontSize="small"
            sx={{ mr: 1.5, color: "text.secondary" }}
          />
          <Typography variant="body2">Wishlist</Typography>
        </MenuItem>
        <Divider sx={{ borderColor: theme.palette.divider }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}
        >
          <Typography variant="body2" color="error">
            Logout
          </Typography>
        </MenuItem>
      </Menu>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: "0 16px 16px 0",
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ width: 280 }} role="presentation">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ShoppingBag sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                LUXE
              </Typography>
            </Box>
            <IconButton
              onClick={toggleDrawer(false)}
              sx={{ color: theme.palette.primary.contrastText }}
            >
              <Close />
            </IconButton>
          </Box>
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hello, {username}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <List>
            <Typography
              variant="subtitle2"
              sx={{ px: 2, py: 1, color: "text.secondary", fontWeight: 600 }}
            >
              CATEGORIES
            </Typography>
            <ListItem
              button
              key="all"
              onClick={() => handleCategoryChange("all")}
              selected={categoryFilter === "all"}
              sx={{
                pl: 3,
                borderLeft:
                  categoryFilter === "all"
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",
                bgcolor:
                  categoryFilter === "all"
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                "&:hover": { bgcolor: theme.palette.action.hover },
                mb: 0.5,
              }}
            >
              <ListItemText
                primary="All Products"
                primaryTypographyProps={{
                  fontWeight: categoryFilter === "all" ? 600 : 400,
                }}
              />
            </ListItem>
            {categories.map((category) => (
              <ListItem
                button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                selected={categoryFilter === category.id}
                sx={{
                  pl: 3,
                  borderLeft:
                    categoryFilter === category.id
                      ? `4px solid ${theme.palette.primary.main}`
                      : "4px solid transparent",
                  bgcolor:
                    categoryFilter === category.id
                      ? alpha(theme.palette.primary.main, 0.1)
                      : "transparent",
                  "&:hover": { bgcolor: theme.palette.action.hover },
                  mb: 0.5,
                }}
              >
                <Box sx={{ mr: 2, fontSize: "1.25rem" }}>{category.icon}</Box>
                <ListItemText
                  primary={category.name}
                  primaryTypographyProps={{
                    fontWeight: categoryFilter === category.id ? 600 : 400,
                  }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <List>
            <Typography
              variant="subtitle2"
              sx={{ px: 2, py: 1, color: "text.secondary", fontWeight: 600 }}
            >
              MY ACCOUNT
            </Typography>
            <ListItem
              button
              onClick={() => {
                navigate("/user/profile");
                setDrawerOpen(false);
              }}
              sx={{
                "&:hover": { bgcolor: theme.palette.action.hover },
                mb: 0.5,
              }}
            >
              <ListItemText primary="My Profile" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate("/user/orders");
                setDrawerOpen(false);
              }}
              sx={{
                "&:hover": { bgcolor: theme.palette.action.hover },
                mb: 0.5,
              }}
            >
              <ListItemText primary="My Orders" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate("/user/wishlist");
                setDrawerOpen(false);
              }}
              sx={{
                "&:hover": { bgcolor: theme.palette.action.hover },
                mb: 0.5,
              }}
            >
              <ListItemText primary="Wishlist" />
            </ListItem>
            <ListItem
              button
              onClick={() => {
                navigate("/cart");
                setDrawerOpen(false);
              }}
              sx={{
                "&:hover": { bgcolor: theme.palette.action.hover },
                mb: 0.5,
              }}
            >
              <ListItemText primary="Shopping Cart" />
            </ListItem>
          </List>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                borderRadius: theme.shape.borderRadius * 2,
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;
