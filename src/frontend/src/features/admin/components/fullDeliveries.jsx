import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box, Divider } from '@mui/material';

const ProductDelivery = () => {
  const deliveries = [
    { id: 1, name: 'Elephant 1802', recipient: 'Jason Bourne', status: 'Delivered', image: 'https://www.snitch.co.in/cdn/shop/files/4MSS2533-03-M10_1800x1800.jpg?v=1703677724' },
    { id: 2, name: 'RiseUP', recipient: 'Marie Durant', status: 'Shipping', image: 'https://s3.commentsold.com/thelemondropshop/products/hHe06OOu0cqFA6BWH4EpUymrsWtiM5SxCKAarwOf.png?optimize=medium&width=1200&format=jpg' },
    { id: 3, name: 'Yellow Stone', recipient: 'Dan Wilson', status: 'Confirmed', image: 'https://m.media-amazon.com/images/I/61d9ALo205L._AC_UY1100_.jpg' },
  ];

  return (
    <Card sx={{ 
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)", 
      borderRadius: "4px", 
      overflow: "hidden" 
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #f5f5f5" }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: "1.1rem", 
              fontWeight: 400, 
              letterSpacing: "0.5px", 
              textTransform: "uppercase",
              color: "#333"
            }}
          >
            Product Delivery
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: "0.85rem", 
              color: "#666", 
              mt: 0.5 
            }}
          >
            1M Products Shipped so far
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {deliveries.map((delivery, index) => (
            <React.Fragment key={delivery.id}>
              <Box sx={{ display: 'flex', py: 1.5 }}>
                <CardMedia 
                  component="img" 
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    objectFit: "cover", 
                    borderRadius: "2px"
                  }} 
                  image={delivery.image} 
                  alt={delivery.name} 
                />
                <Box sx={{ ml: 2, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: "0.95rem", 
                      fontWeight: 500,
                      color: "#333",
                      mb: 0.5
                    }}
                  >
                    {delivery.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: "0.85rem", 
                      color: "#666"
                    }}
                  >
                    To: {delivery.recipient}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: delivery.status === 'Delivered' ? "#6f7d5d" : 
                             delivery.status === 'Shipping' ? "#d8b78e" : "#a1a995",
                      mt: 0.5
                    }}
                  >
                    {delivery.status}
                  </Typography>
                </Box>
              </Box>
              {index < deliveries.length - 1 && <Divider sx={{ my: 0.5 }} />}
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductDelivery;