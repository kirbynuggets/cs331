import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box } from '@mui/material';

const ProductDelivery = () => {
  const deliveries = [
    { id: 1, name: 'Elephant 1802', recipient: 'Jason Bourne', status: 'Delivered', image: 'https://www.snitch.co.in/cdn/shop/files/4MSS2533-03-M10_1800x1800.jpg?v=1703677724' },
    { id: 2, name: 'RiseUP', recipient: 'Marie Durant', status: 'Shipping', image: 'https://s3.commentsold.com/thelemondropshop/products/hHe06OOu0cqFA6BWH4EpUymrsWtiM5SxCKAarwOf.png?optimize=medium&width=1200&format=jpg' },
    { id: 3, name: 'Yellow Stone', recipient: 'Dan Wilson', status: 'Confirmed', image: 'https://m.media-amazon.com/images/I/61d9ALo205L._AC_UY1100_.jpg' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Product Delivery</Typography>
        <Typography variant="body2">1M Products Shipped so far</Typography>
        {deliveries.map((delivery) => (
          <Card key={delivery.id} sx={{ display: 'flex', mb: 2, p: 1 }}>
            <CardMedia component="img" sx={{ width: 100 }} image={delivery.image} alt={delivery.name} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="body1">{delivery.name}</Typography>
              <Typography variant="body2">To: {delivery.recipient}</Typography>
              <Typography variant="body2" color={delivery.status === 'Delivered' ? 'green' : delivery.status === 'Shipping' ? 'orange' : 'blue'}>
                {delivery.status}
              </Typography>
            </Box>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProductDelivery;