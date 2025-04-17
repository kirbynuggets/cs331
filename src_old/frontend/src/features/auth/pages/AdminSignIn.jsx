import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../../components/common/ErrorMessage';
import authService from '../services/authService';
import CustomThemeProvider from '../../../components/common/CustomThemeProvider';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
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

export default function AdminSignIn() {
  const navigate = useNavigate(); // Assuming useNavigate is set up with react-router
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // extracting data
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
      .loginAdmin(credentials)
      .then((user) => {
        window.localStorage.setItem(
          "loggedAdmin",
          JSON.stringify(user)
        );
        setErrorMessage("");
        console.log("Admin Login Successful, navigating...");
        navigate("/admin/dashboard", { replace: true });
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
       {/* Use background.default for adaptive background */}
      <Grid container component="main" sx={{ height: '100vh', bgcolor: 'background.default' }}>
        {/* Left Grid Item (Image) - Unchanged */}
        <Grid
          item
          xs={false}
          sm={4} // Adjusted breakpoints compared to UserSignIn
          md={7} // Adjusted breakpoints compared to UserSignIn
          sx={{
            // This logic seems fine - dark overlay on image, white text
            background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            padding: 4,
            // Hide on smaller screens if needed, similar to UserSignIn
            display: { xs: 'none', sm: 'flex' }
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
              ADMIN CONSOLE
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, marginBottom: 2 }}>
              Access the admin dashboard to manage products, orders, customers, and more.
              Maintain your store's inventory and analyze sales data with powerful tools.
            </Typography>
          </Box>
        </Grid>

        {/* Right Grid Item (Form) */}
        <Grid
          item
          xs={12} // Full width on xs screens
          sm={8}  // Takes remaining width on sm screens
          md={5}  // Takes remaining width on md screens
          component={Paper}
          elevation={0} // No shadow
          square // Sharp corners
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Center content vertically
            alignItems: 'center',     // Center content horizontally <<-- ADDED
            flexGrow: 1,              // Ensure it fills space <<-- ADDED
            // bgcolor: '#FFFFFF'     // REMOVED - Paper will use theme color
            // Use theme's background.paper color automatically
          }}
        >
          {/* Inner Box holding form content */}
          <Box
            sx={{
              px: { xs: 3, sm: 6, md: 8 }, // Keep padding
              py: { xs: 6, sm: 8 }, // Keep padding
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Center items inside this box (title, paragraph, form)
              maxWidth: '450px', // Limit form width
              // mx: 'auto',      // REMOVED - Parent Grid handles centering
              // width: '100%'    // REMOVED - Let it size naturally up to maxWidth
            }}
          >
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, color: 'text.primary' }}> {/* Use theme text color */}
              <ShieldOutlinedIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
              <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                Admin Login
              </Typography>
            </Box>

            {/* Subtitle */}
            <Typography component="p" variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}> {/* Use theme text color */}
              Sign in to access the store administration dashboard.
            </Typography>

            {/* Form Container */}
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}> {/* Needs width 100% for fullWidth inputs */}
              {/* Username Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Admin Username"
                name="username"
                autoComplete="username"
                autoFocus
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} /> {/* Use theme text color */}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    // Background will adapt based on theme
                  }
                }}
              />
              {/* Password Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Admin Password"
                type="password"
                id="password"
                autoComplete="current-password"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary' }} /> {/* Use theme text color */}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                     // Background will adapt based on theme
                  }
                }}
              />

              {/* Remember Me / Forgot Password */}
              {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" size="small" />}
                   // Label text color adapts
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </Box> */}

              {/* Sign In Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary" // Use theme's primary color
                sx={{
                  mt: 1,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  // Consider removing explicit bgcolor to rely purely on theme's primary variant="contained" style
                  // bgcolor: '#1c313a', // This overrides theme color
                  // '&:hover': {
                  //   bgcolor: '#0d1b20', // This overrides theme hover
                  // }
                }}
              >
                Sign In as Admin
              </Button>

              {/* Divider */}
               {/* Divider color adapts */}
              <Divider sx={{ my: 3 }}>
                 {/* Text color adapts */}
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>

              {/* Sign In as User Button */}
              <Button
                fullWidth
                variant="outlined" // Outlined adapts well
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
                onClick={() => navigate('/')} // Navigate to user sign-in/home
              >
                Sign In as User
              </Button>

              {/* Copyright */}
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CustomThemeProvider>
  );
}
