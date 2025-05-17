// src/components/Register.js
import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Grid, // <<< Added Grid import here
} from "@mui/material";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // For success message
  const [loading, setLoading] = useState(false); // For loading state
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || ''; // Ensure a default

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages
    setLoading(true); // Start loading

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) { // Example: Minimum password length
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }

    try {
      // Sending the POST request to the correct backend endpoint
      const response = await axios.post(`${apiUrl}/api/auth/register`, { // Corrected endpoint
        username,
        password,
        email,
      });

      if (response.status === 201) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login"); // Redirect to login page after a short delay
        }, 2000); // 2-second delay
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Registration failed. Please check your details.");
      } else if (err.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("Error setting up registration. Please try again.");
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false); // Stop loading
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
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Softer shadow
          bgcolor: "background.paper",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>
          Create Account
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={password !== confirmPassword && confirmPassword !== ""} // Highlight if passwords don't match
            helperText={password !== confirmPassword && confirmPassword !== "" ? "Passwords do not match" : ""}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5 }} // Added padding
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button component={RouterLink} to="/login" variant="text" size="small" disabled={loading}>
                Already have an account? Sign in
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
