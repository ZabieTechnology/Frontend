// src/theme.js
import { createTheme } from "@mui/material/styles";
import "@fontsource/poppins";


const theme = createTheme({
  typography: {
    fontFamily: "Poppins, Arial, sans-serif", // Use "Poppins" for a clean modern font
  },
  palette: {
    mode: "light", // Switch to light mode
    primary: {
      main: "#4caf50", // Green for primary
    },
    secondary: {
      main: "#f48fb1", // Pink for secondary
    },
    background: {
      paper: "#ffffff", // Sidebar background
      default: "#f5f5f5", // Main background
    },
    text: {
      primary: "#333333", // Dark text
      secondary: "#555555", // Slightly lighter text
    },
  },
});

export default theme;
