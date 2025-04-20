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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 400, 
            fontSize: "1.2rem", 
            letterSpacing: "0.5px", 
            textTransform: "uppercase",
            color: "#333"
          }}
        >
          Categories
        </Typography>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={() => setOpenModal(true)} 
          sx={{ 
            textTransform: 'none', 
            borderColor: '#6f7d5d', 
            color: '#6f7d5d',
            fontSize: '0.85rem',
            borderRadius: '2px',
            '&:hover': {
              borderColor: '#464e3b',
              backgroundColor: 'transparent',
              color: '#464e3b'
            }
          }}
        >
          Add Category
        </Button>
      </Box>
      <List sx={{ bgcolor: '#fff', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
        {categories.map((category) => (
          <ListItem
            key={category}
            sx={{ 
              bgcolor: 'background.paper', 
              borderBottom: '1px solid #f5f5f5',
              '&:last-child': { borderBottom: 'none' },
              '&:hover': { bgcolor: '#f9f9f7' } 
            }}
            secondaryAction={
              <IconButton 
                onClick={() => handleDelete(category)} 
                sx={{ color: '#6f7d5d' }}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            }
          >
            <ListItemText 
              primary={category} 
              primaryTypographyProps={{ 
                sx: { fontSize: '0.95rem', letterSpacing: '0.3px' }
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: 400, 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: '2px', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <Typography 
            variant="h6" 
            mb={2} 
            sx={{ 
              fontWeight: 400, 
              fontSize: '1.1rem', 
              letterSpacing: '0.5px', 
              color: '#333',
              textTransform: 'uppercase'
            }}
          >
            Add New Category
          </Typography>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#6f7d5d',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6f7d5d',
                  borderWidth: '1px',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#6f7d5d',
              },
            }}
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={() => setOpenModal(false)} 
              variant="text" 
              sx={{ 
                color: '#666', 
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#333'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleAddCategory} 
              sx={{ 
                borderColor: '#6f7d5d', 
                color: '#6f7d5d', 
                textTransform: 'none',
                borderRadius: '2px',
                '&:hover': {
                  borderColor: '#464e3b',
                  backgroundColor: 'transparent',
                  color: '#464e3b'
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Categories;