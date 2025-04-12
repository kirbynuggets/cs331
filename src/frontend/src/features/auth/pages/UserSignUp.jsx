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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
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

export default function UserSignUp() {
  const navigate = useNavigate(); // Assuming setup with react-router
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const email = data.get('email');
    const password = data.get('password');
    const termsAccepted = data.get('termsAccepted'); // Check if terms checkbox is checked

    if (!username || !password || !email) {
      setErrorMessage("Missing username, email, or password");
      setTimeout(() => setErrorMessage(""), 5000);
      return;
    }
    // Simple check for the checkbox - improve validation as needed
    // if (!termsAccepted) {
    //     setErrorMessage("You must accept the Terms of Service and Privacy Policy.");
    //     setTimeout(() => setErrorMessage(""), 5000);
    //     return;
    // }

    const credentials = {
      username,
      email,
      password
    }
    authService
      .signupUser(credentials)
      .then((user) => {
        alert(`Signup successful! Welcome, ${user.username}`); // Consider a more user-friendly notification (e.g., snackbar)
        navigate("/signin", { replace: true });
        console.log("Signup successful, navigating to signin...");
      })
      .catch((error) => {
        if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else {
          setErrorMessage(
            "Error signing up: Please check your information and try again"
          );
          console.error(error);
        }
        setTimeout(() => setErrorMessage(""), 5000);
      });
  };

  return (
    <CustomThemeProvider>
      <ErrorMessage errorMessage={errorMessage} />
      {/* Use theme background color for the main container */}
      <Grid container component="main" sx={{ height: '100vh', bgcolor: 'background.default' }}>
        {/* Left Grid Item (Image) */}
        <Grid
          item
          xs={false} // Hidden on extra-small screens
          sm={4}     // Takes up space on small screens and up
          md={7}
          sx={{
            background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', sm: 'flex' }, // Ensure it's displayed correctly on sm+
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white', // Text color against dark background image
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
              Join our community of fashion enthusiasts. Get exclusive access to premium collections,
              special offers and personalized recommendations.
            </Typography>
          </Box>
        </Grid>

        {/* Right Grid Item (Form) */}
        <Grid
          item
          xs={12} // Full width on extra-small
          sm={8}  // Takes remaining width on small+
          md={5}
          component={Paper}
          elevation={0} // No shadow
          square // Sharp corners
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Vertical centering
            alignItems: 'center',     // Horizontal centering <<-- ADDED
            flexGrow: 1,              // Fill available space <<-- ADDED
            // bgcolor: '#FFFFFF'     // REMOVED - Use theme's paper background
          }}
        >
          {/* Inner Box containing form */}
          <Box
            sx={{
              px: { xs: 3, sm: 6, md: 8 }, // Padding
              py: { xs: 4, sm: 6 }, // Adjusted vertical padding slightly
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Center content (title, form) inside this Box
              maxWidth: '450px', // Max width for the form area
              // mx: 'auto',      // REMOVED - Parent Grid handles centering
              // width: '100%'    // REMOVED - Let it size naturally
            }}
          >
            {/* Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, color: 'text.primary' }}> {/* Use theme text color */}
              <ShoppingBagOutlinedIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
              <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                Create Account
              </Typography>
            </Box>

            {/* Subtitle */}
            <Typography component="p" variant="body1" sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}> {/* Use theme text color */}
              Sign up to start exploring our premium fashion collections.
            </Typography>

            {/* Form */}
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}> {/* Needs width 100% */}
              {/* Username */}
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
                      <PersonOutlineOutlinedIcon sx={{ color: 'text.secondary' }} /> {/* Theme color */}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} // Adjusted margin
              />
              {/* Email */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'text.secondary' }} /> {/* Theme color */}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} // Adjusted margin
              />
              {/* Password */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password" // Correct autocomplete for signup
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'text.secondary' }} /> {/* Theme color */}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} // Adjusted margin
              />

              {/* Terms Checkbox */}
              {/* <FormControlLabel
                control={<Checkbox name="termsAccepted" value="agree" color="primary" size="small" required />} // Added name
                label={
                  // Label text color adapts automatically
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="#" sx={{ fontWeight: 500, color: 'primary.main' }}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="#" sx={{ fontWeight: 500, color: 'primary.main' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: 2, mt: 1, alignItems: 'flex-start' }} // Align checkbox top with text
              /> */}

              {/* Create Account Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained" // Adapts to theme primary
                sx={{
                  mt: 2, // Adjusted margin
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Optional: consider theme shadows
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)', // Optional: consider theme shadows
                  }
                }}
              >
                Create Account
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3 }}> {/* Divider color adapts */}
                <Typography variant="body2" color="text.secondary">OR</Typography> {/* Text color adapts */}
              </Divider>

              {/* Admin Sign In Button */}
              <Button
                fullWidth
                variant="outlined" // Adapts
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

              {/* Already have an account? */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary"> {/* Adapts */}
                  Already have an account?{' '}
                  <Link
                    href="/" // Should link to User Sign In page
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'primary.main', // Use theme link color
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>

              {/* Copyright */}
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CustomThemeProvider>
  );
}