// src/components/Register.js
import React, { useState } from "react";
import { Button, TextField, Box, Typography, Container } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // Added email state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // For error handling
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple password match validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Sending the POST request to the backend
      const response = await axios.post(`${apiUrl}/register`, {
        username,
        password,
        email, // Sending email along with username and password
      });

      // If registration is successful
      if (response.status === 201) {
        setError(""); // Clear any previous errors
        navigate("/login"); // Redirect to login page
      }
    } catch (err) {
      if (err.response) {
        // Handle specific backend error responses
        setError(err.response.data.message); // Display message from backend
      } else {
        setError("Error creating account. Please try again."); // General error handling
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 5 }}>
        <Typography variant="h5">Register</Typography>
        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: 20 }}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Handling email state change
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <Typography color="error">{error}</Typography>} {/* Error message display */}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
