import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

// Define the base URL for the API as per the requested pattern
const API_BASE_URL = process.env.REACT_APP_API_URL || "";

/**
 * QuotationSettingsPage Component
 *
 * This component provides a UI for managing quotation settings.
 *
 * Key Changes:
 * - Replaced the native `fetch` API with `axios` for all API calls.
 * - Implemented the use of a base URL (`API_BASE_URL`) for API endpoints.
 * - Included `withCredentials: true` in all requests to handle sessions/cookies.
 * - Updated error handling to work with the structure of axios errors.
 */
function QuotationSettingsPage() {
  const [settings, setSettings] = useState({
    defaultTitle: '',
    prefix: '',
    nextNumber: 1,
    validityDays: 30,
    defaultTerms: '',
    defaultNotes: '',
    footerDetails: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // State to manage the feedback snackbar
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });

  // Fetch initial settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Use axios for the GET request
        const response = await axios.get(`${API_BASE_URL}/api/quote-settings/`, {
          withCredentials: true,
        });
        setSettings(response.data);
      } catch (error) {
        console.error("Failed to fetch quotation settings:", error);
        // Extract error message from axios response or provide a default
        const errorMessage = error.response?.data?.message || 'Could not load settings.';
        setFeedback({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const processedValue = (name === 'nextNumber' || name === 'validityDays')
        ? parseInt(value, 10) || 0
        : value;

    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: processedValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback({ open: false, message: '', severity: 'info' });
    try {
      // Use axios for the POST request
      const response = await axios.post(`${API_BASE_URL}/api/quote-settings/`, settings, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data; // axios automatically handles JSON parsing

      setSettings(result.data);
      setFeedback({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    } catch (error) {
      console.error("Error saving settings:", error);
      // Extract specific error message from the axios error response
      const errorMessage = error.response?.data?.message || 'Failed to save settings. An unknown error occurred.';
      setFeedback({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedback({ ...feedback, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quotation Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Form fields remain the same */}
          {/* Document & Numbering */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Document & Numbering</Typography>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Default Title"
                      name="defaultTitle"
                      value={settings.defaultTitle}
                      onChange={handleChange}
                      helperText="The title on the quotation PDF (e.g., 'Quotation')."
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Quotation Prefix"
                      name="prefix"
                      value={settings.prefix}
                      onChange={handleChange}
                      helperText="E.g., QUO-"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Next Number"
                      name="nextNumber"
                      value={settings.nextNumber}
                      onChange={handleChange}
                      helperText="The next quotation number."
                    />
                  </Grid>
                   <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Default Validity"
                        name="validityDays"
                        value={settings.validityDays}
                        onChange={handleChange}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">days</InputAdornment>,
                        }}
                        helperText="Default expiration period for new quotations."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Default Text Content */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Default Content</Typography>
            <Card variant="outlined">
              <CardContent>
                 <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Default Terms & Conditions"
                        name="defaultTerms"
                        value={settings.defaultTerms}
                        onChange={handleChange}
                        />
                    </Grid>
                 </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

          <Grid item xs={12} md={6}>
             <TextField
                fullWidth
                multiline
                rows={4}
                label="Default Notes to Customer"
                name="defaultNotes"
                value={settings.defaultNotes}
                onChange={handleChange}
                helperText="This will appear on every new quotation."
              />
          </Grid>

           <Grid item xs={12} md={6}>
             <TextField
                fullWidth
                multiline
                rows={4}
                label="Footer / Bank Details"
                name="footerDetails"
                value={settings.footerDetails}
                onChange={handleChange}
                helperText="This will appear in the footer of every new quotation."
              />
          </Grid>
        </Grid>
        {/* End of form fields */}

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || loading}
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default QuotationSettingsPage;
