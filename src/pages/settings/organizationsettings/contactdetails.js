import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    ThemeProvider,
    createTheme,
    Grid,
    Paper,
    TextField,
    CircularProgress,
    Alert,
    CssBaseline,
    IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

// Note: To run this code, you'll need to install axios.
// You can do this by running: npm install axios
// For now, API calls are mocked.
// import axios from "axios";

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
  }
});

const initialContactState = { designation: "", name: "", panNumber: "", dinNumber: "", aadhaar: "", mobile: "", email: "" };

// --- FIX ---
// Moved mockApi and axios outside the component to prevent re-creation on every render.
// This stops the infinite re-render loop.
const mockApi = {
    get: async (url) => { console.log(`Mock GET: ${url}`); await new Promise(r => setTimeout(r, 500)); return { data: [] }; },
    put: async (url, data) => { console.log(`Mock PUT: ${url}`, data); await new Promise(r => setTimeout(r, 1000)); return { data: { message: "Saved!", data: data } }; }
};
const axios = mockApi;
const API_BASE_URL = '';


function ContactDetails() {
  const [contacts, setContacts] = useState([initialContactState]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/contacts`);
      if (response.data?.length > 0) setContacts(response.data);
      else setContacts([initialContactState]);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(`Failed to load contacts: ${err.message || 'Unknown'}`);
      setContacts([initialContactState]);
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies removed as axios is now stable

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = () => setContacts([...contacts, { ...initialContactState }]);
  const handleRemoveContact = (index) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    } else {
      setError("At least one contact is required.");
      setTimeout(() => setError(null), 3000);
    }
  };
  const handleChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSaveContacts = async () => {
    setLoading(true); setError(null); setSuccess(null);
    const isValid = contacts.every(c => c.designation && c.name && c.panNumber && c.mobile && c.email);
    if (!isValid) {
      setError("Please fill all required (*) fields for every contact.");
      setLoading(false);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/contacts`, contacts);
      setSuccess("Contact details saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err)      {
      console.error("Save Error:", err);
      setError(`Failed to save contacts: ${err.message || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
      // Navigate to the next page
      window.location.href = 'http://localhost:3000/settings/organizationsettings/natureofbusiness';
  };


  return (
    <Box>
      <Typography variant="h4" gutterBottom>Primary Contact Details</Typography>
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress /></Box>
      ) : (
        <>
          {contacts.map((contact, index) => (
            <Paper key={index} elevation={0} sx={{ mb: 3, p: 3, position: 'relative', border: '1px solid #ecf0f1', borderRadius: '16px' }}>
               {contacts.length > 1 && (
                 <IconButton color="error" onClick={() => handleRemoveContact(index)} sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <DeleteIcon />
                 </IconButton>
               )}
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Contact {index + 1}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth required label="Designation" value={contact.designation} onChange={(e) => handleChange(index, "designation", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth required label="Name" value={contact.name} onChange={(e) => handleChange(index, "name", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth required label="PAN Number" value={contact.panNumber} onChange={(e) => handleChange(index, "panNumber", e.target.value)} inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="DIN Number" value={contact.dinNumber} onChange={(e) => handleChange(index, "dinNumber", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Aadhaar" value={contact.aadhaar} onChange={(e) => handleChange(index, "aadhaar", e.target.value)} inputProps={{ maxLength: 12 }} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth required label="Mobile" value={contact.mobile} onChange={(e) => handleChange(index, "mobile", e.target.value)} type="tel" /></Grid>
                <Grid item xs={12}><TextField fullWidth required label="E-mail id" value={contact.email} onChange={(e) => handleChange(index, "email", e.target.value)} type="email" /></Grid>
              </Grid>
            </Paper>
          ))}
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid #ecf0f1' }}>
         <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={handleAddContact} disabled={loading}>Add Contact</Button>
         <Box sx={{ display: 'flex', gap: 2 }}>
             <Button variant="contained" color="secondary" size="large" onClick={handleSaveContacts} disabled={loading || contacts.length === 0}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Save Contacts"}
             </Button>
             <Button variant="contained" color="primary" size="large" onClick={handleNext} disabled={loading} endIcon={<ArrowForwardIcon />}>
                Next
             </Button>
         </Box>
      </Box>
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
                <ContactDetails />
            </Box>
        </Box>
    </ThemeProvider>
  );
}
