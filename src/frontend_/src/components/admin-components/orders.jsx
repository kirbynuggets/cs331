import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const ProductOrders = () => {
  const orders = [
    { id: '#XGY-346', created: '7 min ago', customer: 'Albert Fox', status: 'Pending' },
    { id: '#YHD-047', created: '52 min ago', customer: 'Jenny Wilson', status: 'Confirmed' },
    { id: '#SRR-678', created: '1 hour ago', customer: 'Robert Fox', status: 'Pending' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Orders Placed</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.created}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: order.status === 'Pending' ? '#fffde7' : order.status === 'Confirmed' ? '#e8f5e9' : '#ffebee',
                      color: order.status === 'Pending' ? '#ff9800' : order.status === 'Confirmed' ? '#4caf50' : '#f44336',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
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