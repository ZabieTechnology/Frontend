import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ThemeProvider,
    createTheme,
    Grid,
    Paper,
    TextField,
    CssBaseline,
} from '@mui/material';
import styled from "@emotion/styled";

// Modern theme for the application
const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2c3e50' },
    secondary: { main: '#1abc9c' },
    background: { default: '#ecf0f1', paper: '#ffffff' },
    text: { primary: '#34495e', secondary: '#7f8c8d' }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, color: '#2c3e50' },
    h6: { fontWeight: 600, color: '#34495e' },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16, boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px', padding: '32px' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, padding: '10px 20px' } } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiSelect: { defaultProps: { variant: 'outlined' } }
  }
});

// Styled Paper component for form containers
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': { boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }
}));


function NatureOfBusiness() {
  const [goodsServicesBoth, setGoodsServicesBoth] = useState("");
  const [natureOfBusiness, setNatureOfBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [showCustomNatureOfBusiness, setShowCustomNatureOfBusiness] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [customNatureOfBusiness, setCustomNatureOfBusiness] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");

  const handleNatureOfBusinessChange = (event) => { setNatureOfBusiness(event.target.value); setShowCustomNatureOfBusiness(event.target.value === "Others"); };
  const handleIndustryChange = (event) => { setIndustry(event.target.value); setShowCustomIndustry(event.target.value === "Others"); };
  const handleSave = () => { console.log({ goodsServicesBoth, natureOfBusiness: natureOfBusiness === "Others" ? customNatureOfBusiness : natureOfBusiness, industry: industry === "Others" ? customIndustry : industry, organizationType, organizationCode, }); alert('Nature of Business saved to console!'); };

  // Function to handle navigation to the next page
  const handleNext = () => {
    // You can add validation logic here before navigating
    window.location.href = 'http://localhost:3000/settings/organizationsettings/financialdetails';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Nature of Business</Typography>
      <StyledPaper>
        <Grid container spacing={2}>
            <Grid item xs={12}><FormControl fullWidth margin="normal"><InputLabel>Goods/Services/Both *</InputLabel><Select value={goodsServicesBoth} label="Goods/Services/Both *" onChange={(e) => setGoodsServicesBoth(e.target.value)}><MenuItem value="Goods">Goods</MenuItem><MenuItem value="Services">Services</MenuItem><MenuItem value="Both">Both</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal"><InputLabel>Nature of Business *</InputLabel><Select value={natureOfBusiness} label="Nature of Business *" onChange={handleNatureOfBusinessChange}><MenuItem value="Manufacturing">Manufacturing</MenuItem><MenuItem value="Trading">Trading</MenuItem><MenuItem value="Service">Service</MenuItem><MenuItem value="Others">Others</MenuItem></Select></FormControl>{showCustomNatureOfBusiness && (<TextField fullWidth margin="normal" label="Specify Nature of Business" value={customNatureOfBusiness} onChange={(e) => setCustomNatureOfBusiness(e.target.value)} />)}</Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal"><InputLabel>Industry *</InputLabel><Select value={industry} label="Industry *" onChange={handleIndustryChange}><MenuItem value="Automobile">Automobile</MenuItem><MenuItem value="IT">IT</MenuItem><MenuItem value="Healthcare">Healthcare</MenuItem><MenuItem value="Others">Others</MenuItem></Select></FormControl>{showCustomIndustry && (<TextField fullWidth margin="normal" label="Specify Industry" value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} />)}</Grid>
            <Grid item xs={12}><FormControl fullWidth margin="normal"><InputLabel>Organization Type *</InputLabel><Select value={organizationType} label="Organization Type *" onChange={(e) => setOrganizationType(e.target.value)}><MenuItem value="HUF">HUF</MenuItem><MenuItem value="Partnership">Partnership</MenuItem><MenuItem value="LLP">LLP</MenuItem><MenuItem value="Private Limited">Private Limited</MenuItem><MenuItem value="Public Limited">Public Limited</MenuItem><MenuItem value="Non-Profit Organisation">Non-Profit Organisation</MenuItem><MenuItem value="Trust">Trust</MenuItem></Select></FormControl></Grid>
            <Grid item xs={12}><TextField fullWidth margin="normal" label="Organization Code" value={organizationCode} onChange={(e) => setOrganizationCode(e.target.value)}/></Grid>
        </Grid>
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid #ecf0f1' }}>
            <Button variant="contained" color="secondary" size="large" onClick={handleSave}>Save</Button>
            <Button variant="contained" color="primary" size="large" onClick={handleNext} sx={{ ml: 2 }}>Next</Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}

// Main App component to render the form
export default function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ maxWidth: '1200px', margin: 'auto' }}>
                <NatureOfBusiness />
            </Box>
        </Box>
    </ThemeProvider>
  );
}