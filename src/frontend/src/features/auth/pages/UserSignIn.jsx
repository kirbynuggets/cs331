
// import { useState } from 'react';
// import Avatar from '@mui/material/Avatar';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import Link from '@mui/material/Link';
// import Paper from '@mui/material/Paper';
// import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import Typography from '@mui/material/Typography';
// import { useNavigate } from 'react-router-dom';
// import authService from '../services/authService';
// import ErrorMessage from '../../../components/common/ErrorMessage';
// import CustomThemeProvider from '../../../components/common/CustomThemeProvider';

// function Copyright(props) {
//   return (
//     <Typography variant="body2" color="text.secondary" align="center" {...props}>
//       {'Copyright © '}
//       <Link color="inherit" href="/">
//         Fashion E-Commerce
//       </Link>{' '}
//       {new Date().getFullYear()}
//       {'.'}
//     </Typography>
//   );
// }

// export default function UserSignIn() {
//   const navigate = useNavigate();
//   const [errorMessage, setErrorMessage] = useState("");
//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const data = new FormData(event.currentTarget);
//     const username = data.get('username');
//     const password = data.get('password');
//     if (!username || !password) {
//       setErrorMessage("Missing username or password");
//       setTimeout(() => {
//         setErrorMessage("");
//       }, 5000);
//       return;
//     }
//     const credentials = {
//       username,
//       password,
//     };
//     authService
//       .loginUser(credentials)
//       .then((user) => {
//         window.localStorage.setItem(
//           "loggedUser",
//           JSON.stringify(user)
//         );
//         setErrorMessage("");
//         navigate("/user/dashboard", { replace: true });
//       })
//       .catch((error) => {
//         if (error.response.data.error) {
//           setErrorMessage(error.response.data.error);
//           setTimeout(() => {
//             setErrorMessage("");
//           }, 5000);
//         } else {
//           setErrorMessage(
//             "Error logging in : Please check the console for more details"
//           );
//           console.error(error);
//           setTimeout(() => {
//             setErrorMessage("");
//           }, 5000);
//         }
//       });
//     console.log("Sign in successful");
//   };

//   return (
//     <CustomThemeProvider>
//       <ErrorMessage errorMessage={errorMessage} />
//       <Grid container component="main" sx={{ height: '100vh' }}>
//         <Grid
//           item
//           xs={false}
//           sm={4}
//           md={7}
//           sx={{
//             backgroundImage: 'url(https://unsplash.it/1920/1080?random)',
//             backgroundRepeat: 'no-repeat',
//             backgroundColor: (t) =>
//               t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//           }}
//         />
//         <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
//           <Box
//             sx={{
//               my: 8,
//               mx: 4,
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//             }}
//           >
//             <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
//               <LockOutlinedIcon />
//             </Avatar>
//             <Typography component="h1" variant="h5">
//               Sign in
//             </Typography>
//             <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 id="username"
//                 label="Username"
//                 name="username"
//                 autoComplete="username"
//                 autoFocus
//               />
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 name="password"
//                 label="Password"
//                 type="password"
//                 id="password"
//                 autoComplete="current-password"
//               />
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 sx={{ mt: 3, mb: 2 }}
//               >
//                 Sign In
//               </Button>
//               <Button
//                 fullWidth
//                 variant="outlined"
//                 sx={{ mt: 3, mb: 2 }}
//                 onClick={() => navigate('/admin/signin')}
//               >
//                 Sign In as Admin
//               </Button>
//               <Grid container>
//                 <Grid item xs>
//                   <Link href="#" variant="body2">
//                     Forgot password?
//                   </Link>
//                 </Grid>
//                 <Grid item>
//                   <Link href="/signup" variant="body2">
//                     {"Don't have an account? Sign Up"}
//                   </Link>
//                 </Grid>
//               </Grid>
//               <Copyright sx={{ mt: 5 }} />
//             </Box>
//           </Box>
//         </Grid>
//       </Grid>
//     </CustomThemeProvider>
//   );
// }

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ErrorMessage from '../../../components/common/ErrorMessage';
import CustomThemeProvider from '../../../components/common/CustomThemeProvider';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="/">
        LUXE
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function UserSignIn() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');
    if (!username || !password) {
      setErrorMessage("Missing username or password");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return;
    }
    const credentials = {
      username,
      password,
    };
    authService
      .loginUser(credentials)
      .then((user) => {
        window.localStorage.setItem(
          "loggedUser",
          JSON.stringify(user)
        );
        setErrorMessage("");
        navigate("/user/dashboard", { replace: true });
      })
      .catch((error) => {
        if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
          setTimeout(() => {
            setErrorMessage("");
          }, 5000);
        } else {
          setErrorMessage(
            "Error logging in: Please check your credentials and try again"
          );
          console.error(error);
          setTimeout(() => {
            setErrorMessage("");
          }, 5000);
        }
      });
  };

  return (
    <CustomThemeProvider>
      <ErrorMessage errorMessage={errorMessage} />
      <Grid container component="main" sx={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: 4
          }}
        >
          <Box
            sx={{ 
              textAlign: 'center',
              maxWidth: '600px'
            }}
          >
            <Typography 
              component="h1" 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                marginBottom: 2,
                letterSpacing: '-0.5px'
              }}
            >
              LUXE
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 300, 
                marginBottom: 4,
                letterSpacing: '3px'
              }}
            >
              PREMIUM FASHION MARKETPLACE
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, marginBottom: 2 }}>
              Discover the latest trends from top designers around the world.
              Our curated collections bring luxury to your doorstep.
            </Typography>
          </Box>
        </Grid>
        <Grid 
          item 
          xs={12} 
          sm={8} 
          md={5} 
          component={Paper} 
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box
            sx={{
              px: { xs: 3, sm: 6, md: 8 },
              py: { xs: 6, sm: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '450px',
              mx: 'auto',
              width: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
              <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                Welcome Back
              </Typography>
            </Box>
            
            <Typography component="p" variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
              Sign in to access your account, view orders, and continue shopping.
            </Typography>
            
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" size="small" />}
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 1, 
                  mb: 3, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  }
                }}
              >
                Sign In
              </Button>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>
              
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  mb: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                onClick={() => navigate('/admin/signin')}
              >
                Sign In as Admin
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
              
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CustomThemeProvider>
  );
}
