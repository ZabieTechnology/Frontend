// src/components/Home.js
import React from "react";
import { Box, Typography } from "@mui/material";

const Home = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Welcome to the Dashboard
      </Typography>
      <Typography>
        Use the navigation menu to explore the application features.
      </Typography>
    </Box>
  );
};

export default Home;
