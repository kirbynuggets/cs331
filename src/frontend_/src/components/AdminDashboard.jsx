// // import React from 'react';
// // import ResponsiveAppBar from './ResponsiveAppBar';

// // const AdminDashboard = () => {
// //     return (
// //         <div>
// //             <ResponsiveAppBar />
// //             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
// //                 <h1>Admin Dashboard</h1>
// //             </div>
// //         </div>
// //     )
// // };

// // export default AdminDashboard;

// import React, { createContext, useState } from "react";
// import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Dashboard from "./admin-components/dashboard.jsx";
// import Products from "./admin-components/products.jsx";
// import Orders from "./admin-components/orders.jsx";
// import Categories from "./admin-components/categories.jsx";
// import Sidebar from "./admin-components/sidebar.jsx";
// import AnalyticsOverview from "./admin-components/analytics.jsx";
// import ProductInventory from "./admin-components/products.jsx";
// import Settings from "./admin-components/settings.jsx";

// export const CategoryContext = createContext();

// const theme = createTheme({
//   palette: {
//     primary: { main: "#26A69A" },
//     secondary: { main: "#90A4AE" },
//     background: { default: "#F5E1C8", paper: "#FFFFFF" }, // Beige/Tan background
//     text: { primary: "#3E2723", secondary: "#5D4037" }, // Warm brown text for contrast
//     success: { main: "#4CAF50" },
//     error: { main: "#F44336" },
//   },
//   typography: {
//     fontFamily: "'Montserrat', 'Poppins', sans-serif", // Stylish & modern
//     h5: { fontWeight: 600 },
//     h6: { fontWeight: 500 },
//     body1: { fontSize: "0.95rem" },
//     button: { textTransform: "none", fontWeight: 500 },
//   },
// });

// function App() {
//   const [categories, setCategories] = useState([
//     "Men’s Clothing",
//     "Women’s Clothing",
//     "Accessories",
//     "Footwear",
//   ]);

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <CategoryContext.Provider value={{ categories, setCategories }}>
//         <Router>
//           <Box sx={{ display: "flex", bgcolor: "background.default" }}> {/* Apply beige background */}
//             <Sidebar />
//             <Box component="main" sx={{ flexGrow: 1, ml: "240px", p: 3 }}>
//               <Routes>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route
//                   path="/products"
//                   element={<ProductInventory showViewMore={false} />}
//                 />
//                 <Route
//                   path="/analytics"
//                   element={<AnalyticsOverview showViewMore={false} />}
//                 />
//                 <Route path="/settings" element={<Settings />} />
//               </Routes>
//             </Box>
//           </Box>
//         </Router>
//       </CategoryContext.Provider>
//     </ThemeProvider>
//   );
// }

// export default App;


import React, { createContext, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./admin-components/dashboard.jsx";
import Products from "./admin-components/products.jsx";
import Categories from "./admin-components/categories.jsx";
import Sidebar from "./admin-components/sidebar.jsx";
import AnalyticsOverview from "./admin-components/analytics.jsx";
import ProductInventory from "./admin-components/products.jsx";
import Settings from "./admin-components/settings.jsx";

export const CategoryContext = createContext();

const theme = createTheme({
  palette: {
    primary: { main: "#26A69A" },
    secondary: { main: "#90A4AE" },
    background: { default: "#F5E1C8", paper: "#FFFFFF" }, // Beige/Tan background
    text: { primary: "#3E2723", secondary: "#5D4037" }, // Warm brown text for contrast
    success: { main: "#4CAF50" },
    error: { main: "#F44336" },
  },
  typography: {
    fontFamily: "'Montserrat', 'Poppins', sans-serif", // Stylish & modern
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
    body1: { fontSize: "0.95rem" },
    button: { textTransform: "none", fontWeight: 500 },
  },
});

// function App() {
//   const [categories, setCategories] = useState([
//     "Men's Clothing",
//     "Women's Clothing",
//     "Accessories",
//     "Footwear",
//   ]);

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <CategoryContext.Provider value={{ categories, setCategories }}>
//         <Box sx={{ display: "flex", bgcolor: "background.default" }}> {/* Apply beige background */}
//           <Sidebar />
//           <Box component="main" sx={{ flexGrow: 1, ml: "240px", p: 3 }}>
//             <Routes>
//               <Route path="/" element={<Dashboard />} />
//               <Route
//                 path="admin/products"
//                 element={<ProductInventory showViewMore={false} />}
//               />
//               <Route
//                 path="admin/analytics"
//                 element={<AnalyticsOverview showViewMore={false} />}
//               />
//               <Route path="admin/settings" element={<Settings />} />
//             </Routes>
//           </Box>
//         </Box>
//       </CategoryContext.Provider>
//     </ThemeProvider>
//   );
// }

function App() {
  const [categories, setCategories] = useState([
    "Men's Clothing",
    "Women's Clothing",
    "Accessories",
    "Footwear",
  ]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CategoryContext.Provider value={{ categories, setCategories }}>
        <Box sx={{ display: "flex", bgcolor: "background.default" }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, ml: "240px", p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/products"
                element={<ProductInventory showViewMore={false} />}
              />
              <Route
                path="/analytics"
                element={<AnalyticsOverview showViewMore={false} />}
              />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </CategoryContext.Provider>
    </ThemeProvider>
  );
}

export default App;