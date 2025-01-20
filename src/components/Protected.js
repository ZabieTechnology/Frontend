// src/components/Protected.js
import React from "react";
import { Navigate } from "react-router-dom";

// Protected route component
const Protected = ({ children, token }) => {
  // If there's no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists, render the protected children
  return children;
};

export default Protected;
