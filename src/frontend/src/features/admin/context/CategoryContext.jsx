// src/features/admin/context/CategoryContext.jsx
import React, { createContext, useContext, useState } from 'react';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([
    "Men's Clothing",
    "Women's Clothing",
    "Accessories",
    "Footwear",
  ]);

  return (
    <CategoryContext.Provider value={{ categories, setCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);