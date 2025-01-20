// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Info from "./components/Info";
import Protected from "./components/Protected"; // Import Protected

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Update token whenever it's changed in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} /> {/* Wrap Layout in Protected */}
              </Protected>
            }
          >
            {/* Nested Routes */}
            <Route index element={<Home />} />  {/* Home page */}
            {/* <Route path="info" element={<Info />} />  */} {/* Info page */}
          </Route>

          <Route
        path="/info"
        element={
          <Protected token={token}>
           <Layout setToken={setToken} />
          </Protected>
        }
      >
        <Route index element={<Info />} />  {/* Home page */}
      </Route>

          {/* Default route, redirects based on authentication */}
          <Route path="/" element={<Navigate to={token ? "/home" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
