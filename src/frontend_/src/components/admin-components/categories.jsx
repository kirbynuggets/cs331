import React, { useState, useContext } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton, TextField, Modal } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { CategoryContext } from '../AdminDashboard.jsx';

const Categories = () => {
  const { categories, setCategories } = useContext(CategoryContext);
  const [openModal, setOpenModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleDelete = (category) => {
    if (window.confirm(`Delete ${category}?`)) {
      setCategories(categories.filter((c) => c !== category));
    }
  };

  const handleAddCategory = () => {
    if (!newCategory || categories.includes(newCategory)) {
      alert('Please enter a unique category name.');
      return;
    }
    setCategories([...categories, newCategory]);
    setNewCategory('');
    setOpenModal(false);
  };

  return (
    <Box sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Add Category
        </Button>
      </Box>
      <List>
        {categories.map((category) => (
          <ListItem
            key={category}
            sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 2, '&:hover': { bgcolor: '#FAFAFA' } }}
            secondaryAction={<IconButton onClick={() => handleDelete(category)} sx={{ color: 'primary.main' }}><Delete /></IconButton>}
          >
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 400, bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <Typography variant="h6" mb={2}>Add New Category</Typography>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setOpenModal(false)} variant="outlined" color="secondary">Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAddCategory}>Add</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Categories;