// src/components/Login.js
import React, { useState } from "react";
import { TextField, Button, Box, Typography, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom"; // For navigation
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios"; // Import Axios for HTTP requests

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");  // Assuming username is used for username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  // To handle errors (like invalid credentials)
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    try {
      // Send POST request to backend API
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        username: username,  // Assuming you use username as the username
        password: password,
      });

      // On success, save the token and navigate
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      navigate("/home"); // Redirect to home page after successful login
    } catch (err) {
      // Handle login errors (e.g., user not found, wrong password)
      if (err.response) {
        setError(err.response.data.message); // Display error message from the backend
      } else {
        setError("An error occurred. Please try again."); // General error handling
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        bgcolor: "background.paper",
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: 400,
        margin: "0 auto", // Centering the box horizontally
      }}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>

      {/* username Input */}
      <TextField
        label="username"
        variant="outlined"
        type="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircleIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Password Input */}
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Show error message if login fails */}
      {error && (
        <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}

      {/* Login Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        fullWidth
        sx={{ marginTop: 2 }}
      >
        Login
      </Button>

      {/* Register Button */}
      <Button
        variant="text"
        onClick={() => navigate("/register")}  // Navigate to the register page
        fullWidth
        sx={{
          marginTop: 1,
          textAlign: "center",
          color: "text.primary",
        }}
      >
        Don't have an account? Register
      </Button>
    </Box>
  );
};

export default Login;
