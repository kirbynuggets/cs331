import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const StockReport = () => {
  const stockItems = [
    { item: 'Macbook Air M1', productId: '#XGY-356', dateAdded: '02 Apr 2025', price: '$1,230', status: 'In Stock', qty: 58 },
    { item: 'Surface Laptop 4', productId: '#YHD-047', dateAdded: '16 Jan 2025', price: '$1,060', status: 'Out of Stock', qty: 0 },
    { item: 'Logitech MX 250', productId: '#SRR-678', dateAdded: '24 Mar 2025', price: '$64', status: 'In Stock', qty: 290 },
    { item: 'iPhone 17 Pro', productId: '#KLP-112', dateAdded: '15 Feb 2025', price: '$1,299', status: 'Low Stock', qty: 5 },
    { item: 'Samsung S26 Ultra', productId: '#MNB-459', dateAdded: '05 Mar 2025', price: '$1,199', status: 'In Stock', qty: 23 },
    { item: 'Dell XPS 15', productId: '#QWE-789', dateAdded: '12 Jan 2025', price: '$1,799', status: 'In Stock', qty: 12 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Out of Stock':
        return { bg: '#FFF1F0', text: '#CF1322' };
      case 'Low Stock':
        return { bg: '#FFFBE6', text: '#D48806' };
      case 'In Stock':
        return { bg: '#F6FFED', text: '#52C41A' };
      default:
        return { bg: '#E6F7FF', text: '#1890FF' };
    }
  };

  return (
    <Paper sx={{ 
      borderRadius: 2, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#333' }}>Stock Report</Typography>
          <Typography variant="body2" color="text.secondary">Total 2,356 items in the Stock</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search items..."
            size="small"
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select defaultValue="all" displayEmpty>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="in">In Stock</MenuItem>
              <MenuItem value="low">Low Stock</MenuItem>
              <MenuItem value="out">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 500, color: '#333' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333' }}>Product ID</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333' }}>Date Added</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#333' }}>Qty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockItems.map((item) => {
              const statusColor = getStatusColor(item.status);
              
              return (
                <TableRow key={item.productId} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{item.item}</TableCell>
                  <TableCell>{item.productId}</TableCell>
                  <TableCell>{item.dateAdded}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.qty} PCS</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default StockReport;