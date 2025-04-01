import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const StockReport = () => {
  const stockItems = [
    { item: 'Macbook Air M1', productId: '#XGY-356', dateAdded: '02 Apr 2025', price: '$1,230', status: 'In Stock', qty: 58 },
    { item: 'Surface Laptop 4', productId: '#YHD-047', dateAdded: '16 Jan 2025', price: '$1,060', status: 'Out of Stock', qty: 0 },
    { item: 'Logitech MX 250', productId: '#SRR-678', dateAdded: '24 Mar 2025', price: '$64', status: 'In Stock', qty: 290 },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Stock Report</Typography>
        <Typography variant="body2">Total 2,356 items in the Stock</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Product ID</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Qty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockItems.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.productId}</TableCell>
                <TableCell>{item.dateAdded}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: item.status === 'Out of Stock' ? '#ffebee' : item.status === 'Low Stock' ? '#fffde7' : '#e8f5e9',
                      color: item.status === 'Out of Stock' ? '#f44336' : item.status === 'Low Stock' ? '#ff9800' : '#4caf50',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}
                  >
                    {item.status}
                  </Typography>
                </TableCell>
                <TableCell>{item.qty} PCS</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StockReport;