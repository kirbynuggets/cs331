import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';

const ProductOrders = () => {
  const orders = [
    { id: '#XGY-346', created: '7 min ago', customer: 'Albert Fox', status: 'Pending' },
    { id: '#YHD-047', created: '52 min ago', customer: 'Jenny Wilson', status: 'Confirmed' },
    { id: '#SRR-678', created: '1 hour ago', customer: 'Robert Fox', status: 'Pending' },
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
            Orders Placed
          </Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f9f9f7" }}>
              <TableCell sx={{ 
                fontWeight: 500, 
                fontSize: "0.85rem", 
                color: "#666",
                letterSpacing: "0.3px",
                py: 1.5
              }}>
                Order ID
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 500, 
                fontSize: "0.85rem", 
                color: "#666",
                letterSpacing: "0.3px",
                py: 1.5
              }}>
                Created
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 500, 
                fontSize: "0.85rem", 
                color: "#666",
                letterSpacing: "0.3px",
                py: 1.5
              }}>
                Customer
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 500, 
                fontSize: "0.85rem", 
                color: "#666",
                letterSpacing: "0.3px",
                py: 1.5
              }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} sx={{ 
                '&:hover': { bgcolor: "#f9f9f7" },
                borderBottom: "1px solid #f5f5f5",
                '&:last-child': {
                  borderBottom: "none"
                }
              }}>
                <TableCell sx={{ 
                  fontSize: "0.9rem", 
                  color: "#333",
                  py: 1.75
                }}>
                  {order.id}
                </TableCell>
                <TableCell sx={{ 
                  fontSize: "0.9rem", 
                  color: "#666",
                  py: 1.75
                }}>
                  {order.created}
                </TableCell>
                <TableCell sx={{ 
                  fontSize: "0.9rem", 
                  color: "#333",
                  py: 1.75
                }}>
                  {order.customer}
                </TableCell>
                <TableCell sx={{ py: 1.75 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: 
                        order.status === 'Pending' ? '#fbf8e8' : 
                        order.status === 'Confirmed' ? '#f0f5eb' : 
                        '#fbedeb',
                      color: 
                        order.status === 'Pending' ? '#d8b78e' : 
                        order.status === 'Confirmed' ? '#6f7d5d' : 
                        '#c77878',
                      padding: "3px 10px",
                      borderRadius: "2px",
                      display: "inline-block",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      letterSpacing: "0.3px"
                    }}
                  >
                    {order.status}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductOrders;