// src/components/Login.js
import React, { useState } from "react";
import { TextField, Button, Box, Typography, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom"; // For navigation
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Perform login logic (API call, etc.)
    // For now, we're just simulating successful login with a mock token.
    const mockToken = "mock_jwt_token";
    localStorage.setItem("token", mockToken);
    setToken(mockToken);
    navigate("/home"); // Redirect to home page after successful login
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

      {/* Email Input */}
      <TextField
        label="Email"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
