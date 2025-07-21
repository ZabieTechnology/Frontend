import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
    Save as SaveIcon,
    ExpandMore as ExpandMoreIcon,
    AddCircleOutline as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

// --- API Configuration ---
// Make sure your Python backend is running and accessible at this URL
const API_URL = 'http://127.0.0.1:5000/api/business-rules';

// --- API Helper Functions ---
const fetchSettings = async () => {
  console.log('Fetching settings from Python API...');
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const saveSettingsAPI = async (settingsToSave) => {
  console.log('Saving settings to Python API...');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsToSave),
  });
  if (!response.ok) {
    throw new Error('Failed to save settings');
  }
  return response.json();
};
// --- End API Helper Functions ---

/**
 * Renders a settings page to list, edit, and save official business and tax rules.
 */
const BusinessRules = () => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 1. Fetch settings when the component loads
  useEffect(() => {
    fetchSettings()
      .then(data => {
        setSettings(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setSnackbar({ open: true, message: 'Failed to load settings from API.', severity: 'error' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 2. Handle changes to any input field for a specific business type
  const handleInputChange = (businessIndex, fieldKey, value) => {
    const updatedSettings = [...settings];
    updatedSettings[businessIndex][fieldKey] = value;
    setSettings(updatedSettings);
  };

  // 3. Save all settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettingsAPI(settings);
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    } catch (err) {
      console.error("Save error:", err);
      setSnackbar({ open: true, message: 'Failed to save settings.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Add a new, blank business rule to the list
  const handleAddRule = () => {
      const newRule = {
          name: 'New Business Type',
          description: '',
          pan_rules: '',
          gstin_rules: '',
          tan_rules: ''
      };
      setSettings(prevSettings => [...prevSettings, newRule]);
  };

  // 5. Delete a business rule from the list
  const handleDeleteRule = (indexToDelete) => {
      setSettings(prevSettings => prevSettings.filter((_, index) => index !== indexToDelete));
  };


  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Settings...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
            <Typography variant="h4" component="h1">
                Business Rules
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Manage PAN, GSTIN, and TAN rules for different business types.
            </Typography>
        </Box>
        <Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRule}
              sx={{ mr: 2 }}
            >
              Add New Rule
            </Button>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
        </Box>
      </Box>

      {settings.map((business, index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>{business.name}</Typography>
                <Tooltip title="Delete Rule">
                    <IconButton
                        aria-label="delete"
                        onClick={(event) => {
                            event.stopPropagation(); // Prevent accordion from toggling
                            handleDeleteRule(index);
                        }}
                        sx={{ ml: 2 }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField fullWidth label="Business Name" value={business.name} onChange={(e) => handleInputChange(index, 'name', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Business Description" value={business.description} onChange={(e) => handleInputChange(index, 'description', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth multiline rows={5} label="PAN Rules" value={business.pan_rules} onChange={(e) => handleInputChange(index, 'pan_rules', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth multiline rows={5} label="GSTIN Rules" value={business.gstin_rules} onChange={(e) => handleInputChange(index, 'gstin_rules', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth multiline rows={5} label="TAN Rules" value={business.tan_rules} onChange={(e) => handleInputChange(index, 'tan_rules', e.target.value)} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BusinessRules;
