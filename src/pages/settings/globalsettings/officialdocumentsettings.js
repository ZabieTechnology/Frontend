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
  Paper,
} from '@mui/material';
import {
    Save as SaveIcon,
    ExpandMore as ExpandMoreIcon,
    AddCircleOutline as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

// --- API Configuration ---
// This should point to your backend endpoint that handles the new data structure.
const API_URL = 'http://127.0.0.1:5000/api/document-rules';

// --- Default Business Rules ---
// This list provides the default set of business types as per your request.
const defaultBusinessRules = [
    {
        name: 'Private Company',
        description: 'Registered under Companies Act',
        pan_rules: `Requirement: ✅ Required
Pattern: AAAAA9999A
Format: 5 letters + 4 digits + 1 letter
4th char: C = Company
Ex: ABCPD1234C`,
        tan_rules: `Requirement: ✅ If deducting TDS
Pattern: AAAA99999A
Format: 4 letters (state/series) + 5 digits + 1 letter
Ex: MUMR12345B`,
        gstin_rules: `Requirement: ✅ Required if turnover > ₹40L or inter-state
Pattern: NNAAAAA9999A1ZN
Format: 2-digit state code + 10-digit PAN + 1 entity code + Z + 1 check digit
Ex: 29ABCPD1234C1Z5`
    },
    {
        name: 'Public Company',
        description: 'Listed/unlisted company',
        pan_rules: `Requirement: ✅ Required
4th char: C
Ex: XYXPL5678C`,
        tan_rules: `Requirement: ✅ Required
Ex: DELH56789P`,
        gstin_rules: `Requirement: ✅ Required
Ex: 07XYXPL5678C1Z2`
    },
    {
        name: 'One Person Company',
        description: 'Company with one shareholder',
        pan_rules: `Requirement: ✅ Required
4th char: C
Ex: PQROS2345C`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: CHEN34567T`,
        gstin_rules: `Requirement: ✅ If turnover > limit
Ex: 33PQROS2345C1Z7`
    },
    {
        name: 'Foreign Company',
        description: 'Incorporated abroad, doing business in India',
        pan_rules: `Requirement: ✅ If earning income in India
4th char: C
Ex: INTFR6789C`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: INTL34567K`,
        gstin_rules: `Requirement: ✅ If supplying goods/services
Ex: 27INTFR6789C1Z1`
    },
    {
        name: 'Partnership Firm',
        description: 'Business with two or more partners',
        pan_rules: `Requirement: ✅ Required
4th char: F
Ex: ABCFM9876F`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: PUNM12345X`,
        gstin_rules: `Requirement: ✅ If turnover > limit
Ex: 27ABCFM9876F1Z3`
    },
    {
        name: 'Limited Liability Partnerships (LLP)',
        description: 'Corporate structure under LLP Act',
        pan_rules: `Requirement: ✅ Required
4th char: L
Ex: XYLLP5678L`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: MUMK34567R`,
        gstin_rules: `Requirement: ✅ If applicable
Ex: 27XYLLP5678L1Z4`
    },
    {
        name: 'Association of Persons',
        description: 'Unincorporated group with joint purpose',
        pan_rules: `Requirement: ✅ Required
4th char: A
Ex: AOPGP1234A`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: HYDA98765Z`,
        gstin_rules: `Requirement: ✅ If doing taxable supply
Ex: 36AOPGP1234A1Z8`
    },
    {
        name: 'Body of Individuals',
        description: 'Group without legal personality',
        pan_rules: `Requirement: ✅ Required
4th char: B
Ex: BOIKL5432B`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: BNGA65432L`,
        gstin_rules: `Requirement: ✅ If turnover > threshold
Ex: 29BOIKL5432B1Z6`
    },
    {
        name: 'Hindu Undivided Family (HUF)',
        description: 'Hindu Undivided Family managed by Karta',
        pan_rules: `Requirement: ✅ Required
4th char: H
Ex: HUFMK3456H`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: KERD12345H`,
        gstin_rules: `Requirement: ✅ If business exists
Ex: 32HUFMK3456H1Z1`
    },
    {
        name: 'Trust',
        description: 'Asset-holding body for charity, religion, private causes',
        pan_rules: `Requirement: ✅ Required
4th char: T
Ex: TRUST7689T`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: DEHR23456B`,
        gstin_rules: `Requirement: ✅ If supplying taxable services
Ex: 06TRUST7689T1Z2`
    },
    {
        name: 'Government',
        description: 'Central/State departments and bodies',
        pan_rules: `Requirement: ✅ Required
4th char: G
Ex: GOVIN4321G`,
        tan_rules: `Requirement: ✅ Always required
Ex: DELD78901F`,
        gstin_rules: `Requirement: ✅ Assigned if collecting GST
Ex: 07GOVIN4321G1Z9`
    },
    {
        name: 'Sole Proprietorship',
        description: 'Business owned by individual (PAN = owner’s)',
        pan_rules: `Requirement: ✅ Required
4th char: P
Ex: RAKUL1234P`,
        tan_rules: `Requirement: ✅ If deducting TDS
Ex: MUMR67890Q`,
        gstin_rules: `Requirement: ✅ If turnover > ₹40L or inter-state
Ex: 27RAKUL1234P1Z4`
    }
];

// --- Default Other Rules ---
const defaultOtherRules = {
    aadhar_rules: `Format: 12-digit numeric
Example: 1234 5678 9012
Rule: Only digits
Issued By: UIDAI
Purpose: Individual identity`,
    din_rules: `Format: 8-digit numeric
Example: 01234567
Rule: Only digits
Issued By: MCA
Purpose: Director ID`,
    cin_rules: `Format: 21-digit alphanumeric
Example: U74899DL2021PTC123456
Rule: Starts with L/U + industry code + state + year + ownership + registration no.
Issued By: ROC
Purpose: Corporate Identity Number`,
    iec_rules: `Format: 10-char alphanumeric
Example: ABCDE1234F
Rule: Same as PAN
Issued By: DGFT
Purpose: Import/Export code`,
    pf_uan_rules: `Format: 12-digit numeric
Example: 123456789012
Rule: Only digits
Issued By: EPFO
Purpose: Provident Fund number`,
    esic_rules: `Format: 17-digit numeric
Example: 12345678901234567
Rule: Only digits
Issued By: ESIC
Purpose: Employee insurance`,
    msme_rules: `Format: UDYAM-XX-00-0000000
Example: UDYAM-MH-12-0001234
Rule:
- Starts with "UDYAM"
- Followed by 2-letter state code
- Then 2-digit district code
- Ends with 7-digit unique number
Issued By: Ministry of MSME
Purpose: Recognition for Micro, Small, and Medium Enterprises`,
    mobile_rules: `Format: 10-digit numeric
Example: 9876543210
Rule: Must be a valid 10-digit Indian mobile number. Can have +91 prefix.
Purpose: Contact Information`,
    email_rules: `Format: Standard email format
Example: contact@example.com
Rule: Must be a valid email address (e.g., user@domain.com)
Purpose: Electronic Communication`,
    website_rules: `Format: Standard URL
Example: https://www.example.com
Rule: Must be a valid URL.
Purpose: Online Presence`,
};


// --- API Helper Functions ---
const fetchSettings = async () => {
  console.log('Fetching settings from Python API...');
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  // Expecting a response format: { business_rules: [...], other_rules: { ... } }
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
 * Renders a settings page to manage document rules, separated into tabs
 * for business-specific rules and other independent rules.
 */
const App = () => {
  const [businessRules, setBusinessRules] = useState(defaultBusinessRules);
  const [otherRules, setOtherRules] = useState(defaultOtherRules);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('pan_tan_gstin');

  // 1. Fetch all settings when the component loads
  useEffect(() => {
    fetchSettings()
      .then(data => {
        // If the API returns business rules, use them. Otherwise, the default state is used.
        if (data.business_rules && data.business_rules.length > 0) {
            setBusinessRules(data.business_rules);
        }
        // If the API returns other rules, use them. Otherwise, use the defaults.
        if (data.other_rules && Object.keys(data.other_rules).length > 0) {
            setOtherRules(data.other_rules);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setSnackbar({ open: true, message: 'Failed to load settings from API. Using default rules.', severity: 'warning' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 2. Handle input changes for business-specific rules
  const handleBusinessRuleChange = (businessIndex, fieldKey, value) => {
    const updatedRules = [...businessRules];
    updatedRules[businessIndex][fieldKey] = value;
    setBusinessRules(updatedRules);
  };

  // 3. Handle input changes for Aadhar/DIN/etc rules
  const handleOtherRuleChange = (fieldKey, value) => {
    setOtherRules(prevRules => ({
        ...prevRules,
        [fieldKey]: value
    }));
  };

  // 4. Save all changes (both business and other rules)
  const handleSave = async () => {
    setIsSaving(true);
    const settingsToSave = {
        business_rules: businessRules,
        other_rules: otherRules
    };
    try {
      await saveSettingsAPI(settingsToSave);
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    } catch (err) {
      console.error("Save error:", err);
      setSnackbar({ open: true, message: 'Failed to save settings.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Add a new, blank business rule to the list
  const handleAddBusinessRule = () => {
      const newRule = {
          name: 'New Business Type',
          description: '',
          pan_rules: '',
          gstin_rules: '',
          tan_rules: '',
      };
      setBusinessRules(prevRules => [...prevRules, newRule]);
  };

  // 6. Delete a business rule from the list
  const handleDeleteBusinessRule = (indexToDelete) => {
      setBusinessRules(prevRules => prevRules.filter((_, index) => index !== indexToDelete));
  };


  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Document Rules...</Typography>
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
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>

      {/* Tab Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="text"
            onClick={() => setActiveTab('pan_tan_gstin')}
            sx={{
                pb: 1,
                borderBottom: activeTab === 'pan_tan_gstin' ? 2 : 0,
                borderColor: 'primary.main',
                color: activeTab === 'pan_tan_gstin' ? 'primary.main' : 'text.secondary',
                borderRadius: 0
            }}
          >
            PAN, TAN & GSTIN Rules
          </Button>
          <Button
            variant="text"
            onClick={() => setActiveTab('other')}
            sx={{
                pb: 1,
                borderBottom: activeTab === 'other' ? 2 : 0,
                borderColor: 'primary.main',
                color: activeTab === 'other' ? 'primary.main' : 'text.secondary',
                borderRadius: 0
            }}
          >
            Other Rules
          </Button>
      </Box>

      {/* Content based on active tab */}
      {activeTab === 'pan_tan_gstin' && (
        <Paper sx={{ p: 3, background: 'transparent', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                    Rules based on Business Type
                </Typography>
                <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddBusinessRule}
                >
                Add Business Rule
                </Button>
            </Box>
            {businessRules.map((business, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography sx={{ flexGrow: 1 }}>{business.name}</Typography>
                        <Tooltip title="Delete Rule">
                            <IconButton
                                aria-label="delete"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteBusinessRule(index);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Business Type" value={business.name} onChange={(e) => handleBusinessRuleChange(index, 'name', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth multiline rows={4} label="Business Description" value={business.description} onChange={(e) => handleBusinessRuleChange(index, 'description', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth multiline rows={6} label="PAN Rules" value={business.pan_rules} onChange={(e) => handleBusinessRuleChange(index, 'pan_rules', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth multiline rows={6} label="GSTIN Rules" value={business.gstin_rules} onChange={(e) => handleBusinessRuleChange(index, 'gstin_rules', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth multiline rows={6} label="TAN Rules" value={business.tan_rules} onChange={(e) => handleBusinessRuleChange(index, 'tan_rules', e.target.value)} />
                    </Grid>
                    </Grid>
                </AccordionDetails>
                </Accordion>
            ))}
            {businessRules.length === 0 && (
                <Typography color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>
                    No business rules added. Click "Add Business Rule" to start.
                </Typography>
            )}
        </Paper>
      )}

      {activeTab === 'other' && (
        <Paper sx={{ p: 3, background: 'transparent', boxShadow: 'none' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Other Document Rules
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Aadhaar Rules"
                        value={otherRules.aadhar_rules}
                        onChange={(e) => handleOtherRuleChange('aadhar_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="DIN Rules"
                        value={otherRules.din_rules}
                        onChange={(e) => handleOtherRuleChange('din_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="CIN Rules"
                        value={otherRules.cin_rules}
                        onChange={(e) => handleOtherRuleChange('cin_rules', e.target.value)}
                    />
                </Grid>
                 <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="IEC Rules"
                        value={otherRules.iec_rules}
                        onChange={(e) => handleOtherRuleChange('iec_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="PF (UAN) Rules"
                        value={otherRules.pf_uan_rules}
                        onChange={(e) => handleOtherRuleChange('pf_uan_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="ESIC Rules"
                        value={otherRules.esic_rules}
                        onChange={(e) => handleOtherRuleChange('esic_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Mobile Number Rules"
                        value={otherRules.mobile_rules}
                        onChange={(e) => handleOtherRuleChange('mobile_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Email Rules"
                        value={otherRules.email_rules}
                        onChange={(e) => handleOtherRuleChange('email_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Website Rules"
                        value={otherRules.website_rules}
                        onChange={(e) => handleOtherRuleChange('website_rules', e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        label="MSME (Udyam) Rules"
                        value={otherRules.msme_rules}
                        onChange={(e) => handleOtherRuleChange('msme_rules', e.target.value)}
                    />
                </Grid>
            </Grid>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
