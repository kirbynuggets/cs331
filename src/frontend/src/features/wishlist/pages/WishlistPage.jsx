import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Fade,
  useTheme,
  alpha,
  styled,
} from "@mui/material";
import {
  Delete,
  ShoppingCart,
  Favorite,
  ArrowForward,
  ShoppingBag,
  NavigateBefore,
} from "@mui/icons-material";
import {
  fetchWishlist,
  removeFromWishlist,
  selectWishlist,
  selectWishlistItems,
} from "../wishlistSlice";
import { addItemToCart } from "../../cart/cartSlice";

// const BACKEND_URL = 'http://localhost:8000/api/product';

// Styled components
const WishlistEmptyContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(6),
  textAlign: "center",
}));

const WishlistItemCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  transition: "all 0.3s ease",
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[3],
    "& .MuiCardMedia-root": {
      transform: "scale(1.05)",
    },
  },
}));

const WishlistItemImage = styled(CardMedia)(({ theme }) => ({
  height: 260,
  backgroundSize: "cover",
  transition: "transform 0.5s ease",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  borderRadius: theme.shape.borderRadius * 4,
  fontWeight: 500,
}));

const RemoveButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.error.main, 0.2),
    transform: "rotate(10deg)",
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(2),
  },
}));

const WishlistPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const { items, status, error } = useSelector(selectWishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  // If wishlist is empty
  if (items.length === 0 && status !== "loading") {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <WishlistEmptyContainer>
          <Favorite sx={{ fontSize: 70, color: "error.light", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            gutterBottom
            sx={{ maxWidth: 500, mb: 4 }}
          >
            You haven't added any items to your wishlist yet. Browse our
            collection to find items you'll love.
          </Typography>
          <Button
            component={RouterLink}
            to="/all-products"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowForward />}
            sx={{
              borderRadius: theme.shape.borderRadius * 4,
              textTransform: "none",
              px: 4,
            }}
          >
            Start Shopping
          </Button>
        </WishlistEmptyContainer>
      </Container>
    );
  }

  // Show loading state
  if (status === "loading" && items.length === 0) {
    return (
      <Container
        maxWidth="xl"
        sx={{
          py: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Container>
    );
  }

  // Show error state
  if (error && status === "failed" && items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: theme.shape.borderRadius }}>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Fade in={true} timeout={800}>
        <div>
          <PageHeader>
            <Box>
              <Typography variant="h4" gutterBottom>
                My Wishlist
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {items.length} {items.length === 1 ? "item" : "items"}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/products"
              startIcon={<NavigateBefore />}
              sx={{ textTransform: "none" }}
            >
              Continue Shopping
            </Button>
          </PageHeader>
          <Grid container spacing={3}>
            {items.map((item, index) => (
              <Grid item xs={6} sm={4} md={3} key={item.id || index}>
                <Fade in={true} timeout={500 + index * 100}>
                  <WishlistItemCard>
                    <Box sx={{ position: "relative" }}>
                      <RouterLink to={`/product/${item.productId}`}>
                        <WishlistItemImage
                          component="img"
                          image={`http://localhost:8000/static/images/${item.productId}.jpg`}
                          alt={item.productDisplayName}
                        />
                      </RouterLink>
                      <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                        <RemoveButton
                          size="small"
                          onClick={() => {
                            handleRemoveFromWishlist(item.productId);
                            console.log("delete clicked");
                          }}
                          aria-label="remove from wishlist"
                        >
                          <Delete fontSize="small" />
                        </RemoveButton>
                      </Box>
                    </Box>

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        component={RouterLink}
                        to={`/product/${item.id}`}
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          textDecoration: "none",
                          color: "text.primary",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        {item.productDisplayName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {item.subCategory}
                      </Typography>
                    </CardContent>
                  </WishlistItemCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </div>
      </Fade>
    </Container>
  );
};

export default WishlistPage;
