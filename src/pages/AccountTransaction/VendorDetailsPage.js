import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Tooltip,
  RadioGroup,
  Radio,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Add as AddIcon,
    InfoOutlined as InfoOutlinedIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import styled from "@emotion/styled";

// Import axios for making API requests and router hooks for navigation
// Note: The 'axios' import is commented out for this sandboxed preview
// to prevent errors, as the library is not available here.
// API calls are mocked with static data.
// import axios from 'axios';

// Mocking react-router-dom hooks for this isolated environment.
// In a real application, you would use the actual 'react-router-dom' library.
const useParams = () => ({ vendorId: null });
const useLocation = () => ({ search: '' });
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);


// Styled component for the main container paper
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: theme.palette.mode === 'dark' ? '#333' : "#ffffff",
  padding: "24px",
  maxWidth: "1000px",
  margin: "auto",
}));

// Initial state for the form data
const initialFormData = {
  _id: null,
  vendorType: 'B2B',
  companyType: '',
  companyName: '',
  displayName: '',
  pan: '',
  tan: '',
  primaryContact: { name: '', contact: '', email: '' },
  website: '',
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingAddressLine3: "",
  billingState: "",
  billingCountry: "India",
  billingPinCode: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingAddressLine3: "",
  shippingState: "",
  shippingCountry: "",
  shippingPinCode: "",
  sameAsBilling: false,
  tcsEnabled: true,
  tdsEnabled: true,
  note: '',
  financialDetails: {
    openingBalance: '',
    openingBalanceInvoices: [],
    bankAccountName: '',
    accountNo: '',
    ifscCode: '',
    swiftCode: '',
    currency: 'INR',
    paymentTerms: 'Net30',
    creditLimit: '',
  },
  logo: null,
  logoPreview: null,
  logoFilename: '',
  gstRegistered: false,
  gstNumber: "",
  msmeRegistered: false,
  gstTdsEnabled: false,
  gstTcsEnabled: false,
  customFields: [],
};

// Helper to determine the expected 4th character of a PAN based on business rules
const getExpectedPanChar = (vendorType, companyType, businessRules) => {
    if (vendorType === 'B2C') return 'P';
    if (vendorType === 'B2B' && businessRules.panTypeMapping) {
        return businessRules.panTypeMapping[companyType] || 'P';
    }
    return 'P'; // Default
};


// Helper function to generate a dynamic tooltip for the PAN field
const getPanTooltipText = (vendorType, companyType, businessRules) => {
    const panTypeChar = getExpectedPanChar(vendorType, companyType, businessRules);
    const panTypeDesc = {
        'P': 'Individual/Proprietor',
        'C': 'Company',
        'A': 'AOP',
        'H': 'HUF',
        'T': 'Trust',
        'F': 'Firm/LLP',
        'B': 'Body of Individuals',
        'G': 'Government'
    }[panTypeChar];

    return `Format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F). The 4th character must be '${panTypeChar}' for a(n) ${panTypeDesc}.`;
};

// --- Opening Balance Invoice Dialog Component ---
// A separate component to handle the entry of multiple opening balance invoices.
function OpeningBalanceDialog({ open, onClose, onSave, initialInvoices, isViewMode }) {
    const [invoices, setInvoices] = useState([]);
    const [total, setTotal] = useState(0);

    // Reset invoices when the dialog is opened with new initial data
    useEffect(() => {
        setInvoices(initialInvoices ? JSON.parse(JSON.stringify(initialInvoices)) : []);
    }, [open, initialInvoices]);

    // Recalculate the total whenever the invoices array changes
    useEffect(() => {
        const newTotal = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
        setTotal(newTotal);
    }, [invoices]);

    const handleAddInvoice = () => {
        setInvoices([...invoices, { id: Date.now(), number: '', date: '', description: '', amount: '' }]);
    };

    const handleRemoveInvoice = (id) => {
        setInvoices(invoices.filter(inv => inv.id !== id));
    };

    const handleInvoiceChange = (id, field, value) => {
        setInvoices(invoices.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
    };

    const handleSave = () => {
        onSave(invoices, total);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Opening Balance Invoices</DialogTitle>
            <DialogContent>
                {invoices.map(invoice => (
                    <Grid container spacing={1} key={invoice.id} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Invoice Number" value={invoice.number} onChange={(e) => handleInvoiceChange(invoice.id, 'number', e.target.value)} fullWidth size="small" disabled={isViewMode} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Invoice Date" type="date" value={invoice.date} onChange={(e) => handleInvoiceChange(invoice.id, 'date', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} disabled={isViewMode} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Description" value={invoice.description} onChange={(e) => handleInvoiceChange(invoice.id, 'description', e.target.value)} fullWidth size="small" disabled={isViewMode} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField label="Amount" type="number" value={invoice.amount} onChange={(e) => handleInvoiceChange(invoice.id, 'amount', e.target.value)} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} disabled={isViewMode} />
                        </Grid>
                        <Grid item xs={12} sm={1}>
                            {!isViewMode && (
                                <IconButton onClick={() => handleRemoveInvoice(invoice.id)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                ))}
                {!isViewMode && <Button onClick={handleAddInvoice} startIcon={<AddIcon />} sx={{ mt: 1 }}>Add Invoice</Button>}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Typography variant="h6">Total Amount: ₹{total.toFixed(2)}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {!isViewMode && <Button onClick={handleSave} variant="contained">Save</Button>}
            </DialogActions>
        </Dialog>
    );
}


// --- Main Vendor Form Component ---
function VendorForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
  const [savedVendorName, setSavedVendorName] = useState('');
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formErrors, setFormErrors] = useState({ gstNumber: '', pan: '', tan: '' });
  const [businessRules, setBusinessRules] = useState({ panTypeMapping: {} });
  const [individualTypeName, setIndividualTypeName] = useState('');

  // State for dropdown options
  const [companyTypes, setCompanyTypes] = useState([]);
  const [filteredCompanyTypes, setFilteredCompanyTypes] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  // Real router hooks
  const { vendorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

   const API_BASE_URL = ''; // In a real app: process.env.REACT_APP_API_URL || '';

  // Style objects for consistent theming
  const titleStyle = { color: '#4CAF50', fontWeight: 'bold', marginBottom: 2 };
  const paperStyle = { padding: '16px', height: '100%', boxShadow: '0px 1px 2px rgba(0,0,0,0.08)', backgroundColor: 'rgba(255, 255, 255, 0.5)' };

  // Fetches data for dropdowns (states, countries, etc.)
  const fetchDropdownData = useCallback(async (type, setter) => {
    try {
        // Mocking API call since no backend is available
        console.log(`Fetching dropdown for ${type}`);
        let data = [];
        if (type === 'state') data = [{value: 'Maharashtra', label: 'Maharashtra', _id: '1'}, {value: 'Karnataka', label: 'Karnataka', _id: '2'}];
        if (type === 'country') data = [{value: 'India', label: 'India', _id: '1'}, {value: 'USA', label: 'USA', _id: '2'}];
        if (type === 'currency') data = [{value: 'INR', label: 'INR', _id: '1'}, {value: 'USD', label: 'USD', _id: '2'}];
        setter(data);
    } catch (err) {
        console.error(`Error fetching dropdown for ${type}:`, err);
        setError(prev => `${prev} Could not load ${type.toLowerCase()} options. `);
    }
  }, []);

  // Fetches business rules for validation (e.g., PAN types)
  const fetchBusinessRules = useCallback(async () => {
      try {
          // Mocking API call
          console.log("Fetching business rules");
          const apiResponseData = [
              { name: 'Proprietorship', pan_rules: "4th character should be 'P'" },
              { name: 'Company', pan_rules: "4th character should be 'C'" },
              { name: 'Firm/LLP', pan_rules: "4th character should be 'F'" },
          ];

          const panTypeMapping = {};
          let individualType = '';
          const companyTypeOptions = apiResponseData.map(rule => {
              const panCharMatch = rule.pan_rules.match(/'([A-Z])'/);
              if (panCharMatch) {
                  panTypeMapping[rule.name] = panCharMatch[1];
                  if (panCharMatch[1] === 'P') {
                      individualType = rule.name;
                  }
              }
              return { value: rule.name, label: rule.name };
          });

          setIndividualTypeName(individualType);
          setBusinessRules({ panTypeMapping });
          setCompanyTypes(companyTypeOptions);

      } catch (err) {
          console.error("Error fetching business rules:", err);
          setError(prev => `${prev} Could not load business rules. `);
      }
  }, []);

  // Fetches existing vendor data if an ID is present
  const fetchVendorData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      // This would be an API call in a real app.
      console.log(`Fetching data for vendor ID: ${id}`);
      setError("Viewing/Editing vendors is disabled in this preview.");
      setFormData(initialFormData); // Reset to initial
    } catch (err) {
      console.error("Error fetching vendor data:", err);
      setError(`Failed to load vendor data: ${err.message}`);
      setFormData(initialFormData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetching on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const viewMode = queryParams.get('view') === 'true';
    setIsViewMode(viewMode);

    setLoading(true);
    setError(''); // Reset error state

    const fetchData = async () => {
        await Promise.all([
            fetchBusinessRules(),
            fetchDropdownData('state', setStateOptions),
            fetchDropdownData('country', setCountryOptions),
            fetchDropdownData('currency', setCurrencyOptions),
        ]);

        if (vendorId) {
            await fetchVendorData(vendorId);
        } else {
            setFormData(initialFormData);
            setLoading(false);
        }
    };

    fetchData();
  }, [vendorId, location.search, fetchBusinessRules, fetchDropdownData, fetchVendorData]);


  // Filters company types based on whether the vendor is B2B or B2C
  useEffect(() => {
    if (formData.vendorType === 'B2B') {
        setFilteredCompanyTypes(companyTypes.filter(type => type.value !== individualTypeName));
    } else {
        setFilteredCompanyTypes(companyTypes);
    }
  }, [formData.vendorType, companyTypes, individualTypeName]);

  // Generic handler for most form input changes
  const handleChange = (event) => {
    if (isViewMode) return;
    const { name, value, type, checked } = event.target;

    // Special handling for vendor type change
    if (name === 'vendorType') {
        const newVendorType = value;
        setFormData((prev) => {
            const newState = { ...prev, vendorType: newVendorType };
            if (newVendorType === 'B2C') {
                newState.companyType = individualTypeName;
            } else if (prev.companyType === individualTypeName) {
                newState.companyType = '';
            }
            return newState;
        });
        return;
    }

    // Special handling for GSTIN to auto-fill PAN
    if (name === 'gstNumber') {
        const gstValue = value.toUpperCase();
        setFormData(prev => {
            const newState = {...prev, gstNumber: gstValue};
            if (gstValue.length === 15) {
                newState.pan = gstValue.substring(2, 12);
            }
            return newState;
        });
        return;
    }

    // Handling for nested state objects like 'primaryContact'
    const [section, field] = name.split('.');
    if (section && field) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  // Handler for switch components
  const handleSwitchChange = (event) => {
    if (isViewMode) return;
    const { name, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
      ...(name === 'gstRegistered' && !checked && { gstNumber: '', pan: '' }), // Clear GST/PAN if unregistered
    }));
  };

  // Handler for the "Same as Billing" switch
  const handleSameAsBillingChange = (event) => {
    if (isViewMode) return;
    const isChecked = event.target.checked;
    setSameAsBilling(isChecked);
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        shippingAddressLine1: prev.billingAddressLine1,
        shippingAddressLine2: prev.billingAddressLine2,
        shippingAddressLine3: prev.billingAddressLine3,
        shippingState: prev.billingState,
        shippingCountry: prev.billingCountry,
        shippingPinCode: prev.billingPinCode,
      }));
    } else {
       setFormData((prev) => ({
        ...prev,
        shippingAddressLine1: '', shippingAddressLine2: '', shippingAddressLine3: '',
        shippingState: '', shippingCountry: '', shippingPinCode: '',
      }));
    }
  };

  // Handlers for adding/removing/updating custom fields
  const handleAddCustomField = () => {
    setFormData(prev => ({
        ...prev,
        customFields: [...prev.customFields, { id: Date.now(), label: '', value: '', dataType: 'text' }]
    }));
  };

  const handleRemoveCustomField = (id) => {
    setFormData(prev => ({
        ...prev,
        customFields: prev.customFields.filter(field => field.id !== id)
    }));
  };

  const handleCustomFieldChange = (id, fieldName, value) => {
    setFormData(prev => ({
        ...prev,
        customFields: prev.customFields.map(field => {
            if (field.id === id) {
                const updatedField = { ...field, [fieldName]: value };
                if (fieldName === 'dataType') { // Reset value if type changes
                    updatedField.value = '';
                }
                return updatedField;
            }
            return field;
        })
    }));
  };

  // Callback from the invoice dialog to save invoices and total balance
  const handleSaveInvoices = (invoices, total) => {
      setFormData(prev => ({
          ...prev,
          financialDetails: {
              ...prev.financialDetails,
              openingBalance: total,
              openingBalanceInvoices: invoices
          }
      }));
  };


  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isViewMode) return;
    setLoading(true);
    setError(null);
    setFormErrors({ gstNumber: '', pan: '', tan: '' }); // Clear previous errors
    let isValid = true;

    // --- VALIDATION LOGIC ---
    if (formData.billingCountry === 'India') {
        // GSTIN Validation
        if (formData.gstRegistered) {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!gstRegex.test(formData.gstNumber)) {
                setFormErrors(prev => ({ ...prev, gstNumber: "Invalid GSTIN format." }));
                isValid = false;
            } else {
                const embeddedPan = formData.gstNumber.substring(2, 12);
                const expectedPanChar = getExpectedPanChar(formData.vendorType, formData.companyType, businessRules);
                if (embeddedPan.charAt(3) !== expectedPanChar) {
                    setFormErrors(prev => ({ ...prev, gstNumber: `Invalid GSTIN. 4th char of embedded PAN must be '${expectedPanChar}'.` }));
                    isValid = false;
                }
            }
        }

        // PAN Validation
        if (formData.pan) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(formData.pan)) {
                setFormErrors(prev => ({ ...prev, pan: "Invalid PAN format." }));
                isValid = false;
            } else {
                const expectedPanChar = getExpectedPanChar(formData.vendorType, formData.companyType, businessRules);
                if (formData.pan.charAt(3) !== expectedPanChar) {
                    setFormErrors(prev => ({ ...prev, pan: `Invalid PAN. 4th char must be '${expectedPanChar}'.` }));
                    isValid = false;
                }
            }
        }

        // TAN Validation
        if (formData.tan) {
            const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
            if (!tanRegex.test(formData.tan.toUpperCase())) {
                setFormErrors(prev => ({ ...prev, tan: "Invalid TAN format." }));
                isValid = false;
            }
        }
    }

    if (!formData.displayName || !formData.financialDetails.paymentTerms) {
        setError("Display Name and Payment Terms are required.");
        isValid = false;
    }

    if (!isValid) {
        setLoading(false);
        return;
    }
    // --- END VALIDATION ---

    // Mocking form submission
    console.log("Form is valid, preparing to submit...");
    console.log("Form Data:", formData);

    setTimeout(() => {
        setLoading(false);
        setSavedVendorName(formData.displayName);
        setSuccessDialogOpen(true);
    }, 1500);
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate('/account-transaction/vendor');
  };

  const currentTitle = vendorId ? (isViewMode ? "View Vendor" : "Vendor Details") : "Add New Vendor";

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, p: 2, backgroundColor: 'background.default' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={titleStyle}>{currentTitle}</Typography>
        <Tooltip title="Back to Vendor List">
            <IconButton onClick={() => navigate('/account-transaction/vendor')} aria-label="back to vendor list">
                <ArrowBackIcon />
            </IconButton>
        </Tooltip>
      </Paper>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

      {!loading && (
        <StyledPaper elevation={3}>
          <Grid container spacing={3}>
            {/* Contact Details Column */}
            <Grid item xs={12} md={4}>
              <Paper sx={paperStyle} elevation={0}>
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1}}>Contact Details</Typography>
                <FormControl component="fieldset" margin="normal" disabled={isViewMode}>
                  <InputLabel shrink sx={{position: 'relative', transform: 'none', mb: -1, fontWeight:'medium'}}>Vendor Type *</InputLabel>
                  <RadioGroup row name="vendorType" value={formData.vendorType} onChange={handleChange}>
                    <FormControlLabel value="B2B" control={<Radio size="small"/>} label="Business" />
                    <FormControlLabel value="B2C" control={<Radio size="small"/>} label="Individual" />
                  </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 1, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <FormControlLabel control={ <Switch checked={formData.gstRegistered} onChange={handleSwitchChange} name="gstRegistered" size="small" disabled={isViewMode}/>} label="GST Registered" />
                    {formData.gstRegistered && (
                        <TextField
                            margin="dense"
                            required
                            fullWidth
                            id="gstNumber"
                            label="GSTIN"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            size="small"
                            disabled={isViewMode}
                            error={!!formErrors.gstNumber}
                            helperText={formErrors.gstNumber}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title="Format: 2-digit state code + 10-digit PAN + 3 other chars. (e.g., 29ABCDE1234F1Z5)" arrow>
                                        <InfoOutlinedIcon color="success" sx={{ fontSize: 18 }} />
                                    </Tooltip>
                                </InputAdornment>
                                ),
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ mt: 2, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <FormControlLabel control={ <Switch checked={formData.msmeRegistered} onChange={handleSwitchChange} name="msmeRegistered" size="small" disabled={isViewMode}/>} label="MSME Registered" />
                </Box>

                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode || formData.vendorType === 'B2C'}>
                  <InputLabel>Type of Business</InputLabel>
                  <Select name="companyType" value={formData.companyType} label="Type of Business" onChange={handleChange}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {filteredCompanyTypes.map((type) => ( <MenuItem key={type.value} value={type.value}> {type.label} </MenuItem> ))}
                  </Select>
                </FormControl>

                <TextField name="companyName" label="Company Name" value={formData.companyName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="displayName" label="Display Name *" value={formData.displayName} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField
                    name="pan"
                    label="PAN"
                    value={formData.pan}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    size="small"
                    disabled={isViewMode}
                    error={!!formErrors.pan}
                    helperText={formErrors.pan}
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title={getPanTooltipText(formData.vendorType, formData.companyType, businessRules)} arrow>
                                <InfoOutlinedIcon color="success" sx={{ fontSize: 18 }} />
                            </Tooltip>
                        </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    name="tan"
                    label="TAN"
                    value={formData.tan}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    size="small"
                    disabled={isViewMode}
                    error={!!formErrors.tan}
                    helperText={formErrors.tan}
                    InputProps={{
                        endAdornment: (
                        <InputAdornment position="end">
                            <Tooltip title="Format: 4 letters, 5 numbers, 1 letter (e.g., ABCD12345E)." arrow>
                                <InfoOutlinedIcon color="success" sx={{ fontSize: 18 }} />
                            </Tooltip>
                        </InputAdornment>
                        ),
                    }}
                />

                <Typography variant="subtitle1" sx={{...titleStyle, color:'text.primary', fontSize: '1rem', fontWeight: 'bold', mt: 2}}>Primary Contact</Typography>
                <TextField name="primaryContact.name" label="Name" value={formData.primaryContact?.name || ''} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="primaryContact.contact" label="Contact No." value={formData.primaryContact?.contact || ''} onChange={handleChange} fullWidth margin="normal" size="small" type="tel" disabled={isViewMode}/>
                <TextField name="primaryContact.email" label="E-mail" value={formData.primaryContact?.email || ''} onChange={handleChange} fullWidth margin="normal" size="small" type="email" disabled={isViewMode}/>
                <TextField name="website" label="Website" value={formData.website} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
              </Paper>
            </Grid>

            {/* Address Column */}
            <Grid item xs={12} md={4}>
              <Paper sx={paperStyle} elevation={0}>

                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:0}}>Address</Typography>

                <Typography variant="subtitle1" sx={{...titleStyle, color:'text.primary', fontSize: '1rem', fontWeight: 'bold'}}>Billing Address</Typography>
                <TextField name="billingAddressLine1" label="Address Line 1 *" value={formData.billingAddressLine1} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="billingAddressLine2" label="Address Line 2" value={formData.billingAddressLine2} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="billingAddressLine3" label="Address Line 3 (City/Town)" value={formData.billingAddressLine3} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                  <InputLabel>Billing State</InputLabel>
                  <Select name="billingState" value={formData.billingState} label="Billing State" onChange={handleChange}>
                    <MenuItem value=""><em>Select State</em></MenuItem>
                    {stateOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                  </Select>
                </FormControl>
                 <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                  <InputLabel>Billing Country</InputLabel>
                  <Select name="billingCountry" value={formData.billingCountry} label="Billing Country" onChange={handleChange}>
                    <MenuItem value=""><em>Select Country</em></MenuItem>
                    {countryOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                  </Select>
                </FormControl>
                <TextField name="billingPinCode" label="PIN/ZIP Code *" value={formData.billingPinCode} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>

                <Typography variant="subtitle1" sx={{...titleStyle, color:'text.primary', fontSize: '1rem', fontWeight: 'bold'}}>Shipping Address</Typography>
                <FormControlLabel control={<Switch checked={sameAsBilling} onChange={handleSameAsBillingChange} size="small" disabled={isViewMode}/>} label="Same as billing address" sx={{color: 'text.secondary'}}/>
                {!sameAsBilling && (
                  <>
                    <TextField name="shippingAddressLine1" label="Address Line 1" value={formData.shippingAddressLine1} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                    <TextField name="shippingAddressLine2" label="Address Line 2" value={formData.shippingAddressLine2} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                    <TextField name="shippingAddressLine3" label="Address Line 3 (City/Town)" value={formData.shippingAddressLine3} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                    <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                        <InputLabel>Shipping State</InputLabel>
                        <Select name="shippingState" value={formData.shippingState} label="Shipping State" onChange={handleChange}>
                            <MenuItem value=""><em>Select State</em></MenuItem>
                            {stateOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                        <InputLabel>Shipping Country</InputLabel>
                        <Select name="shippingCountry" value={formData.shippingCountry} label="Shipping Country" onChange={handleChange}>
                             <MenuItem value=""><em>Select Country</em></MenuItem>
                            {countryOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField name="shippingPinCode" label="PIN/ZIP Code" value={formData.shippingPinCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                  </>
                )}

              </Paper>
            </Grid>

            {/* Financial & Tax Details Column */}
            <Grid item xs={12} md={4}>
              <Paper sx={paperStyle} elevation={0}>
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1}}>Financial Details</Typography>
                <TextField
                    label="Opening Balance"
                    value={formData.financialDetails.openingBalance}
                    fullWidth
                    margin="normal"
                    size="small"
                    InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        readOnly: true,
                    }}
                    onClick={() => !isViewMode && setInvoiceDialogOpen(true)}
                    sx={{ cursor: isViewMode ? 'default' : 'pointer' }}
                />
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode} required> <InputLabel>Payment Terms *</InputLabel> <Select name="financialDetails.paymentTerms" value={formData.financialDetails.paymentTerms} label="Payment Terms *" required onChange={handleChange}> <MenuItem value={'Net15'}>Net 15</MenuItem> <MenuItem value={'Net30'}>Net 30</MenuItem> <MenuItem value={'Net45'}>Net 45</MenuItem> <MenuItem value={'Net60'}>Net 60</MenuItem> <MenuItem value={'DueOnReceipt'}>Due on Receipt</MenuItem> </Select> </FormControl>
                <TextField name="financialDetails.creditLimit" label="Credit limit" value={formData.financialDetails.creditLimit} onChange={handleChange} type="number" fullWidth margin="normal" size="small" InputProps={{startAdornment: <InputAdornment position="start">₹</InputAdornment>}} disabled={isViewMode}/>

                <Typography variant="subtitle1" sx={{...titleStyle, color:'text.primary', fontSize: '1rem', fontWeight: 'bold', mt:2}}>Bank account</Typography>
                <TextField name="financialDetails.bankAccountName" label="Bank account name" value={formData.financialDetails.bankAccountName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.accountNo" label="Account No" value={formData.financialDetails.accountNo} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.ifscCode" label="IFSC Code" value={formData.financialDetails.ifscCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.swiftCode" label="SWIFT Code" value={formData.financialDetails.swiftCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}> <InputLabel>Currency</InputLabel> <Select name="financialDetails.currency" value={formData.financialDetails.currency} label="Currency" onChange={handleChange}>
                 {currencyOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                </Select> </FormControl>

                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Tax Details</Typography>
                <FormControlLabel control={<Switch checked={formData.tcsEnabled} onChange={handleSwitchChange} name="tcsEnabled" size="small" disabled={isViewMode}/>} label="TCS on Payments" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                <FormControlLabel control={<Switch checked={formData.tdsEnabled} onChange={handleSwitchChange} name="tdsEnabled" size="small" disabled={isViewMode}/>} label="TDS on Payments" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                <FormControlLabel control={<Switch checked={formData.gstTdsEnabled} onChange={handleSwitchChange} name="gstTdsEnabled" size="small" disabled={isViewMode}/>} label="GST TDS" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                <FormControlLabel control={<Switch checked={formData.gstTcsEnabled} onChange={handleSwitchChange} name="gstTcsEnabled" size="small" disabled={isViewMode}/>} label="GST TCS" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                 <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Others</Typography>
                <TextField name="note" label="Note" value={formData.note} onChange={handleChange} fullWidth margin="normal" size="small" multiline rows={2} disabled={isViewMode}/>
                {formData.customFields.map((field) => (
                    <Grid container spacing={1} key={field.id} alignItems="center" sx={{mb: 1}}>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Custom Label" value={field.label} onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)} fullWidth margin="dense" size="small" disabled={isViewMode} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                             <FormControl fullWidth margin="dense" size="small">
                                <InputLabel>Type</InputLabel>
                                <Select value={field.dataType} onChange={(e) => handleCustomFieldChange(field.id, 'dataType', e.target.value)} label="Type" disabled={isViewMode}>
                                    <MenuItem value="text">Text</MenuItem>
                                    <MenuItem value="number">Number</MenuItem>
                                    <MenuItem value="date">Date</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Value"
                                value={field.value}
                                type={field.dataType}
                                onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                                fullWidth
                                margin="dense"
                                size="small"
                                disabled={isViewMode}
                                InputLabelProps={field.dataType === 'date' ? { shrink: true } : {}}
                            />
                        </Grid>
                        <Grid item xs={12} sm={1}>
                            <IconButton onClick={() => handleRemoveCustomField(field.id)} size="small" disabled={isViewMode}>
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                {!isViewMode && (
                    <Button onClick={handleAddCustomField} startIcon={<AddIcon />} size="small" sx={{mt: 1}}>
                        Add Custom Field
                    </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            {isViewMode ? (
              <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => navigate(`/vendor/edit/${vendorId}`)} > Edit Vendor </Button>
            ) : (
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={loading} > {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Vendor' : 'Save Vendor')} </Button>
            )}
          </Box>
        </StyledPaper>
      )}
      <OpeningBalanceDialog
        open={isInvoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onSave={handleSaveInvoices}
        initialInvoices={formData.financialDetails.openingBalanceInvoices}
        isViewMode={isViewMode}
      />
      <Dialog open={isSuccessDialogOpen} onClose={handleSuccessDialogClose}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
            <Typography>
                Vendor "{savedVendorName}" has been saved successfully.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleSuccessDialogClose} variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Main App component to wrap the form with a theme.
// In a real app, this is where you would set up your routing.
export default function App() {
    const theme = createTheme({
        palette: {
            mode: 'light',
            background: {
                default: '#f5f5f5'
            },
            primary: {
                main: '#4CAF50',
            },
            secondary: {
                main: '#FFC107',
            },
            success: {
                main: '#4CAF50',
            }
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    }
                }
            }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {/* In a real app with react-router-dom, you would have your routes here:
              <Router>
                <Routes>
                  <Route path="/vendor/new" element={<VendorForm />} />
                  <Route path="/vendor/edit/:vendorId" element={<VendorForm />} />
                  <Route path="/vendor/view/:vendorId" element={<VendorForm />} />
                </Routes>
              </Router>
            */}
            <VendorForm />
        </ThemeProvider>
    );
}
