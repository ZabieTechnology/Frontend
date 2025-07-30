import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import {
    Save as SaveIcon, ExpandMore as ExpandMoreIcon, AddCircleOutline as AddIcon,
    Delete as DeleteIcon, Lock, LockOpen
} from '@mui/icons-material';

import '../../../assets/styles/global.css';
import '../../../assets/styles/settings.css';

// --- API Configuration ---
const API_URL = '/api/document-rules';
const AUTH_API_URL = '/api/auth/profile';

// --- Axios Instance with Auth ---
const getAuthToken = () => localStorage.getItem('token');

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


const DocRules = () => {
  const [businessRules, setBusinessRules] = useState([]);
  const [otherRules, setOtherRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('pan_tan_gstin');
  const [userRole, setUserRole] = useState('user');

  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [profileRes, settingsRes] = await Promise.all([
            axiosInstance.get(AUTH_API_URL),
            axiosInstance.get(API_URL)
        ]);

        setUserRole(profileRes.data.role || 'user');
        setBusinessRules(settingsRes.data.business_rules || []);
        setOtherRules(settingsRes.data.other_rules || []);

    } catch (err) {
        console.error("Fetch error:", err);
        setSnackbar({ open: true, message: 'Failed to load settings.', severity: 'error' });
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBusinessRuleChange = (index, field, value) => {
    const updatedRules = [...businessRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setBusinessRules(updatedRules);
  };

  const handleOtherRuleChange = (index, field, value) => {
    const updatedRules = [...otherRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setOtherRules(updatedRules);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const settingsToSave = {
        business_rules: businessRules,
        other_rules: otherRules
    };
    try {
      await axiosInstance.post(API_URL, settingsToSave);
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
      loadData();
    } catch (err) {
      console.error("Save error:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to save settings.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBusinessRule = () => {
      const newRule = { _id: `new_${Date.now()}`, name: 'New Business Type', description: '', pan_rules: '', gstin_rules: '', tan_rules: '', isLocked: false };
      setBusinessRules(prev => [...prev, newRule]);
  };

  const handleDeleteBusinessRule = (indexToDelete) => {
      setBusinessRules(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleAddOtherRule = () => {
      const newRule = { _id: `new_${Date.now()}`, name: 'New Rule', description: '', isLocked: false };
      setOtherRules(prev => [...prev, newRule]);
  };

  const handleDeleteOtherRule = (indexToDelete) => {
      setOtherRules(prev => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const renderBusinessRulesTab = () => (
    <Paper sx={{ p: 3, background: 'transparent', boxShadow: 'none' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">Rules based on Business Type</Typography>
        {isAdmin && <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddBusinessRule}>Add Business Rule</Button>}
      </Box>
      {businessRules.map((rule, index) => (
        <Accordion key={rule._id} defaultExpanded={rule._id.toString().startsWith('new_')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>{rule.name}</Typography>
              {isAdmin && (
                <>
                  <Tooltip title={rule.isLocked ? "Unlock to Edit" : "Lock Rule"}>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleBusinessRuleChange(index, 'isLocked', !rule.isLocked); }}>
                          {rule.isLocked ? <Lock /> : <LockOpen />}
                      </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Rule">
                    <span>
                      <IconButton disabled={rule.isLocked} onClick={(e) => { e.stopPropagation(); handleDeleteBusinessRule(index); }}>
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}><TextField fullWidth label="Business Type" value={rule.name} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleBusinessRuleChange(index, 'name', e.target.value)} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth multiline rows={4} label="Business Description" value={rule.description} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleBusinessRuleChange(index, 'description', e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth multiline rows={6} label="PAN Rules" value={rule.pan_rules} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleBusinessRuleChange(index, 'pan_rules', e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth multiline rows={6} label="GSTIN Rules" value={rule.gstin_rules} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleBusinessRuleChange(index, 'gstin_rules', e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth multiline rows={6} label="TAN Rules" value={rule.tan_rules} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleBusinessRuleChange(index, 'tan_rules', e.target.value)} /></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );

  const renderOtherRulesTab = () => (
    <Paper sx={{ p: 3, background: 'transparent', boxShadow: 'none' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">Other Document Rules</Typography>
        {isAdmin && <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddOtherRule}>Add Other Rule</Button>}
      </Box>
      <Grid container spacing={3}>
        {otherRules.map((rule, index) => (
          <Grid item xs={12} md={6} lg={4} key={rule._id}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <TextField variant="standard" fullWidth value={rule.name} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleOtherRuleChange(index, 'name', e.target.value)} sx={{ '.MuiInput-underline:before': { borderBottom: 'none' }, '.MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }, input: { fontWeight: 'bold' } }} />
                {isAdmin && (
                    <Box>
                        <Tooltip title={rule.isLocked ? "Unlock to Edit" : "Lock Rule"}>
                            <IconButton onClick={() => handleOtherRuleChange(index, 'isLocked', !rule.isLocked)}>
                                {rule.isLocked ? <Lock /> : <LockOpen />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Rule">
                            <span>
                                <IconButton disabled={rule.isLocked} onClick={() => handleDeleteOtherRule(index)}><DeleteIcon /></IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                )}
              </Box>
              <TextField fullWidth multiline rows={8} label="Rule Description" value={rule.description} disabled={!isAdmin || rule.isLocked} onChange={(e) => handleOtherRuleChange(index, 'description', e.target.value)} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Business Document Rules</Typography>
        {isAdmin && (
            <Button className="btn-save" startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
        )}
      </Box>

      <div className="tabs-container">
          <Button className={`tab-button ${activeTab === 'pan_tan_gstin' ? 'active' : ''}`} onClick={() => setActiveTab('pan_tan_gstin')}>
            PAN, TAN & GSTIN Rules
          </Button>
          <Button className={`tab-button ${activeTab === 'other' ? 'active' : ''}`} onClick={() => setActiveTab('other')}>
            Other Rules
          </Button>
      </div>

      {activeTab === 'pan_tan_gstin' ? renderBusinessRulesTab() : renderOtherRulesTab()}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default DocRules;