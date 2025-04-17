import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import ErrorMessage from "../../../components/common/ErrorMessage";
import CustomThemeProvider from "../../../components/common/CustomThemeProvider";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        LUXE
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function UserSignIn() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username");
    const password = data.get("password");
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
        window.localStorage.setItem("loggedUser", JSON.stringify(user));
        setErrorMessage("");
        navigate("/user/dashboard");
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
      <Grid
        container
        component="main"
        sx={{
          height: "100vh",
          minWidth: "100vw",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {/* <Grid container component="main" sx={{ height: '100vh', minWidth: '100vw', overflow: 'hidden' }}> */}
        <Grid
          item
          xs={false}
          // sm={4}
          // md={7}
          // xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" }, // 👈 hides on small screens
            background:
              "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            // display: 'flex',
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            padding: 4,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontWeight: 700,
                marginBottom: 2,
                letterSpacing: "-0.5px",
              }}
            >
              LUXE
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 300,
                marginBottom: 4,
                letterSpacing: "3px",
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
          xs={12} // Takes full width on extra-small screens
          md={6} // Takes 50% basis on medium screens
          component={Paper}
          elevation={0}
          square
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1, // <-- ADD THIS LINE
            // bgcolor is handled by Paper/theme
            // Ensure it fills the available horizontal space in the container
          }}
        >
          {/* Inner Box containing the form content - styles should be okay now */}
          <Box
            sx={{
              px: { xs: 3, sm: 6, md: 8 },
              py: { xs: 6, sm: 8 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              maxWidth: { xs: "100%", sm: "450px", md: "500px" },
              // No width: 100% or margin: auto needed here now
            }}
          >
            {/* ... Welcome Back Icon/Text ... */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 5,
                color: "text.primary",
              }}
            >
              <ShoppingBagOutlinedIcon
                sx={{ fontSize: 28, color: "primary.main", mr: 1 }}
              />
              <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                Welcome Back
              </Typography>
            </Box>

            {/* ... Paragraph ... */}
            <Typography
              component="p"
              variant="body1"
              sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}
            >
              Sign in to access your account, view orders, and continue
              shopping.
            </Typography>

            {/* ... Form Box (needs width: 100% to fill its parent Box) ... */}
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              {/* ... TextFields, Buttons, Links, Copyright ... */}
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
                      <PersonOutlineOutlinedIcon
                        sx={{ color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
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
                      <LockOutlinedIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" size="small" />}
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </Box> */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                // ... button sx ...
                sx={{
                  mt: 1,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  },
                }}
              >
                Sign In
              </Button>
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              <Button
                fullWidth
                variant="outlined"
                // ... button sx ...
                sx={{
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
                onClick={() => navigate("/admin/signin")}
              >
                Sign In as Admin
              </Button>
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    variant="body2"
                    // ... link sx ...
                    sx={{
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
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
