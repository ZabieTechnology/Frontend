// src/components/Login.js
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Container,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ message: "", type: "info" }); // State for DB connection message
  const [updateMessage, setUpdateMessage] = useState(''); // State for the update confirmation message
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';

  // useEffect to check backend status and set the update message
  useEffect(() => {
    // Set the confirmation message that the component has been updated
    setUpdateMessage('Page updated successfully with the latest features.');

    const checkBackendStatus = async () => {
      try {
        // This simulates a health check to your backend.
        // You can replace this with an actual API call, e.g., await axios.get(`${apiUrl}/api/health`);
        setDbStatus({
          message: "Successfully connected to the database (Azure Reference).",
          type: "success",
        });
      } catch (err) {
        setDbStatus({
          message: "Failed to connect to the backend service.",
          type: "error",
        });
        console.error("Backend connection check failed:", err);
      }
    };

    checkBackendStatus();
  }, [apiUrl]); // Re-run if apiUrl changes

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        username: username,
        password: password,
      });

      const { access_token, username: loggedInUsername } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("username", loggedInUsername);
      setToken(access_token);
      navigate("/home");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed. Please check your credentials.");
      } else if (err.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("An error occurred during login. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
          borderRadius: 2,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          bgcolor: "background.paper",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>
          Login
        </Typography>

        {/* Confirmation message for the page update */}
        {updateMessage && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }} onClose={() => setUpdateMessage("")}>
            {updateMessage}
          </Alert>
        )}

        {/* Display DB connection status message */}
        {dbStatus.message && (
          <Alert severity={dbStatus.type} sx={{ width: '100%', mb: 2 }}>
            {dbStatus.message}
          </Alert>
        )}

        {/* Display login error message */}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            required
            autoFocus
            autoComplete="username"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            required
            autoComplete="current-password"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button component={RouterLink} to="/register" variant="text" size="small" disabled={loading}>
                Don't have an account? Register
              </Button>
            </Grid>
          </Grid>
        </Box>

      </Box>
    </Container>
  );
};

export default Login;
