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
  Checkbox, // Added Checkbox
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
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';


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
  customerType: 'B2B',
  companyType: '',
  companyName: '',
  displayName: '',
  pan: '',
  primaryContact: { name: '', contact: '', email: '' },
  website: '',
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingAddressLine3: "",
  billingState: "",
  billingCountry: "India",
  billingPinCode: "",
  deliveryAddressLine1: "",
  deliveryAddressLine2: "",
  deliveryAddressLine3: "",
  deliveryState: "",
  deliveryCountry: "",
  deliveryPinCode: "",
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
  billsAndPayments: {
    enabled: false,
    allowBillRaising: false,
    allowPurchaseOrder: false,
  },
  logo: null,
  logoPreview: null,
  logoFilename: '',
  gstRegistered: false,
  gstNumber: "",
  gstTdsEnabled: false,
  gstTcsEnabled: false,
  customFields: [],
};

// Helper to determine the expected 4th character of a PAN based on business rules
const getExpectedPanChar = (customerType, companyType, businessRules) => {
    if (customerType === 'B2C') return 'P';
    if (customerType === 'B2B' && businessRules.panTypeMapping) {
        return businessRules.panTypeMapping[companyType] || 'P';
    }
    return 'P'; // Default
};


// Helper function to generate a dynamic tooltip for the PAN field
const getPanTooltipText = (customerType, companyType, businessRules) => {
    const panTypeChar = getExpectedPanChar(customerType, companyType, businessRules);
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

// --- Opening Balance Invoice Dialog Component (Redesigned) ---
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
            <DialogTitle>Opening Balance Breakdown</DialogTitle>
            <DialogContent>
                {/* Header Row */}
                <Box sx={{ display: { xs: 'none', sm: 'block' }, mb: 1, px: 1 }}>
                    <Grid container spacing={2} sx={{ color: 'text.secondary' }}>
                        <Grid item sm={3}><Typography variant="subtitle2" fontWeight="bold">Invoice Number</Typography></Grid>
                        <Grid item sm={3}><Typography variant="subtitle2" fontWeight="bold">Date</Typography></Grid>
                        <Grid item sm={3}><Typography variant="subtitle2" fontWeight="bold">Description</Typography></Grid>
                        <Grid item sm={2}><Typography variant="subtitle2" fontWeight="bold">Amount</Typography></Grid>
                        <Grid item sm={1}></Grid>
                    </Grid>
                </Box>

                {/* Invoice List */}
                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                    {invoices.length > 0 ? invoices.map((invoice, index) => (
                        <Grid
                            container
                            spacing={2}
                            key={invoice.id}
                            alignItems="center"
                            sx={{
                                p: 1,
                                mb: 1,
                                borderRadius: 2,
                                backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                            }}
                        >
                            <Grid item xs={12} sm={3}>
                                <TextField label="Invoice Number" value={invoice.number} onChange={(e) => handleInvoiceChange(invoice.id, 'number', e.target.value)} fullWidth size="small" disabled={isViewMode} variant="outlined" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField label="Invoice Date" type="date" value={invoice.date} onChange={(e) => handleInvoiceChange(invoice.id, 'date', e.target.value)} fullWidth size="small" InputLabelProps={{ shrink: true }} disabled={isViewMode} variant="outlined" />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField label="Description" value={invoice.description} onChange={(e) => handleInvoiceChange(invoice.id, 'description', e.target.value)} fullWidth size="small" disabled={isViewMode} variant="outlined" />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                                <TextField label="Amount" type="number" value={invoice.amount} onChange={(e) => handleInvoiceChange(invoice.id, 'amount', e.target.value)} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} disabled={isViewMode} variant="outlined" />
                            </Grid>
                            <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                                {!isViewMode && (
                                    <Tooltip title="Remove Invoice">
                                        <IconButton onClick={() => handleRemoveInvoice(invoice.id)} color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Grid>
                        </Grid>
                    )) : (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                           <Typography>No invoices added for opening balance.</Typography>
                        </Box>
                    )}
                </Box>

                {!isViewMode &&
                    <Button onClick={handleAddInvoice} startIcon={<AddIcon />} sx={{ mt: 2 }}>
                        Add Invoice
                    </Button>
                }

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 2 }}>
                    <Grid container justifyContent="flex-end" alignItems="center">
                        <Grid item>
                            <Typography variant="h6">Total Balance:</Typography>
                        </Grid>
                        <Grid item sx={{minWidth: 150, textAlign: 'right'}}>
                            <Typography variant="h6" fontWeight="bold">₹{total.toFixed(2)}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>Cancel</Button>
                {!isViewMode ?
                    <Button onClick={handleSave} variant="contained" color="primary">Save Balance</Button> :
                    <Button onClick={onClose} variant="contained" color="primary">Close</Button>
                }
            </DialogActions>
        </Dialog>
    );
}

// --- Main Customer Form Component ---
function CustomerForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
  const [savedCustomerName, setSavedCustomerName] = useState('');
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formErrors, setFormErrors] = useState({ gstNumber: '', pan: '' });
  const [businessRules, setBusinessRules] = useState({ panTypeMapping: {} });
  const [individualTypeName, setIndividualTypeName] = useState('');

  // State for dropdown options
  const [companyTypes, setCompanyTypes] = useState([]);
  const [filteredCompanyTypes, setFilteredCompanyTypes] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  // Real router hooks
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

   const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  // Style objects for consistent theming
  const titleStyle = { color: '#4CAF50', fontWeight: 'bold', marginBottom: 2 };
  const paperStyle = { padding: '16px', height: '100%', boxShadow: '0px 1px 2px rgba(0,0,0,0.08)', backgroundColor: 'rgba(255, 255, 255, 0.5)' };

  // Fetches data for dropdowns (states, countries, etc.)
  const fetchDropdownData = useCallback(async (type, setter) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=${type}`);
        if (response.data && Array.isArray(response.data.data)) {
            setter(response.data.data.map(item => ({ value: item.value, label: item.label, _id: item._id })));
        }
    } catch (err) {
        console.error(`Error fetching dropdown for ${type}:`, err);
        setError(prev => `${prev} Could not load ${type.toLowerCase()} options. `);
    }
  }, [API_BASE_URL]);

  // Fetches business rules for validation (e.g., PAN types)
  const fetchBusinessRules = useCallback(async () => {
      try {
          const response = await axios.get(`${API_BASE_URL}/api/business-rules`);
          const apiResponseData = response.data;

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
  }, [API_BASE_URL]);

  // Fetches existing customer data if an ID is present
  const fetchCustomerData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${id}`);
      if (response.data) {
        const fetched = response.data;
        // Map fetched data to the form state structure
        const newFormData = {
          ...initialFormData,
          ...fetched,
          customFields: Array.isArray(fetched.customFields) ? fetched.customFields.map(cf => ({...cf, id: cf.id || Date.now(), show: cf.show !== false })) : [],
          _id: fetched._id,
          primaryContact: { ...initialFormData.primaryContact, ...(fetched.primaryContact || {}) },
          financialDetails: {
            ...initialFormData.financialDetails,
            ...(fetched.financialDetails || {}),
          },
          billsAndPayments: {
            ...initialFormData.billsAndPayments,
            ...(fetched.billsAndPayments || {}),
          },
          billingAddressLine1: fetched.billingAddress?.street || '',
          billingAddressLine2: fetched.billingAddress?.street2 || '',
          billingAddressLine3: fetched.billingAddress?.city || '',
          billingState: fetched.billingAddress?.state || '',
          billingCountry: fetched.billingAddress?.country || '',
          billingPinCode: fetched.billingAddress?.zipCode || '',
          deliveryAddressLine1: fetched.shippingAddress?.street || '',
          deliveryAddressLine2: fetched.shippingAddress?.street2 || '',
          deliveryAddressLine3: fetched.shippingAddress?.city || '',
          deliveryState: fetched.shippingAddress?.state || '',
          deliveryCountry: fetched.shippingAddress?.country || '',
          deliveryPinCode: fetched.shippingAddress?.zipCode || '',
          logo: null,
          logoPreview: fetched.logoFilename ? `${API_BASE_URL}${fetched.logoFilename}` : null,
        };

        delete newFormData.billingAddress; delete newFormData.deliveryAddress;

        setFormData(newFormData);
        const billingIsNotEmpty = newFormData.billingAddressLine1 || newFormData.billingAddressLine2 || newFormData.billingAddressLine3 || newFormData.billingState || newFormData.billingCountry || newFormData.billingPinCode;
        setSameAsBilling(
            !!billingIsNotEmpty &&
            newFormData.billingAddressLine1 === newFormData.deliveryAddressLine1 &&
            newFormData.billingAddressLine2 === newFormData.deliveryAddressLine2 &&
            newFormData.billingAddressLine3 === newFormData.deliveryAddressLine3 &&
            newFormData.billingState === newFormData.deliveryState &&
            newFormData.billingCountry === newFormData.deliveryCountry &&
            newFormData.billingPinCode === newFormData.deliveryPinCode
        );
      } else {
        setError("Customer not found.");
        setFormData(initialFormData);
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError(`Failed to load customer data: ${err.response?.data?.message || err.message}`);
      setFormData(initialFormData);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

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

        if (customerId) {
            await fetchCustomerData(customerId);
        } else {
            setFormData(initialFormData);
            setLoading(false);
        }
    };

    fetchData();
  }, [customerId, location.search, fetchBusinessRules, fetchDropdownData, fetchCustomerData]);


  // Filters company types based on whether the customer is B2B or B2C
  useEffect(() => {
    if (formData.customerType === 'B2B') {
        setFilteredCompanyTypes(companyTypes.filter(type => type.value !== individualTypeName));
    } else {
        setFilteredCompanyTypes(companyTypes);
    }
  }, [formData.customerType, companyTypes, individualTypeName]);

  // Generic handler for most form input changes (including text, select, radio, switch)
  const handleChange = (event) => {
    if (isViewMode) return;
    const { name, value, type, checked } = event.target;
    const val = type === 'checkbox' ? checked : value;

    // Special handling for customer type change
    if (name === 'customerType') {
        const newCustomerType = val;
        setFormData((prev) => {
            const newState = { ...prev, customerType: newCustomerType };
            if (newCustomerType === 'B2C') {
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
        const gstValue = val.toUpperCase();
        setFormData(prev => {
            const newState = {...prev, gstNumber: gstValue};
            if (gstValue.length === 15) {
                newState.pan = gstValue.substring(2, 12);
            }
            return newState;
        });
        return;
    }

    // Handling for nested state objects
    const keys = name.split('.');
    if (keys.length > 1) {
        const [section, field] = keys;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [field]: val,
            },
        }));
    } else {
      // Handling for top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: val,
        // Special logic from original handleSwitchChange
        ...(name === 'gstRegistered' && !val && { gstNumber: '', pan: '' }),
      }));
    }
  };

  // Handler for the "Same as Billing" switch
  const handleSameAsBillingChange = (event) => {
    if (isViewMode) return;
    const isChecked = event.target.checked;
    setSameAsBilling(isChecked);
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        deliveryAddressLine1: prev.billingAddressLine1,
        deliveryAddressLine2: prev.billingAddressLine2,
        deliveryAddressLine3: prev.billingAddressLine3,
        deliveryState: prev.billingState,
        deliveryCountry: prev.billingCountry,
        deliveryPinCode: prev.billingPinCode,
      }));
    } else {
       setFormData((prev) => ({
        ...prev,
        deliveryAddressLine1: '', deliveryAddressLine2: '', deliveryAddressLine3: '',
        deliveryState: '', deliveryCountry: '', deliveryPinCode: '',
      }));
    }
  };

  // Handlers for adding/removing/updating custom fields
  const handleAddCustomField = () => {
    setFormData(prev => ({
        ...prev,
        customFields: [...prev.customFields, { id: Date.now(), label: '', value: '', dataType: 'text', show: true }]
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
                // When data type changes, reset the value to prevent data mismatch
                if (fieldName === 'dataType') {
                    switch(updatedField.dataType) {
                        case 'tick-box':
                            updatedField.value = false; // Default for checkbox
                            break;
                        default:
                            updatedField.value = ''; // Default for other types
                            break;
                    }
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
    setFormErrors({ gstNumber: '', pan: '' }); // Clear previous errors
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
                const expectedPanChar = getExpectedPanChar(formData.customerType, formData.companyType, businessRules);
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
                const expectedPanChar = getExpectedPanChar(formData.customerType, formData.companyType, businessRules);
                if (formData.pan.charAt(3) !== expectedPanChar) {
                    setFormErrors(prev => ({ ...prev, pan: `Invalid PAN. 4th char must be '${expectedPanChar}'.` }));
                    isValid = false;
                }
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

    const submissionFormData = new FormData();
    const cleanedCustomFields = formData.customFields.filter(f => f.label.trim() !== '' && f.value.toString().trim() !== '');

    // Prepare payload for API submission
    const payload = {
        customerType: formData.customerType,
        companyType: formData.companyType,
        companyName: formData.companyName,
        displayName: formData.displayName,
        pan: formData.pan,
        primaryContact: formData.primaryContact,
        website: formData.website,
        billingAddress: { street: formData.billingAddressLine1, street2: formData.billingAddressLine2, city: formData.billingAddressLine3, state: formData.billingState, country: formData.billingCountry, zipCode: formData.billingPinCode },
        shippingAddress: { street: formData.deliveryAddressLine1, street2: formData.deliveryAddressLine2, city: formData.deliveryAddressLine3, state: formData.deliveryState, country: formData.deliveryCountry, zipCode: formData.deliveryPinCode },
        tcsEnabled: formData.tcsEnabled,
        tdsEnabled: formData.tdsEnabled,
        note: formData.note,
        financialDetails: formData.financialDetails,
        billsAndPayments: formData.billsAndPayments,
        gstRegistered: formData.gstRegistered,
        gstNumber: formData.gstRegistered ? formData.gstNumber : "",
        gstTdsEnabled: formData.gstTdsEnabled,
        gstTcsEnabled: formData.gstTcsEnabled,
        customFields: cleanedCustomFields,
    };

    if (formData.logoFilename && !formData.logo) {
      payload.logoFilename = formData.logoFilename;
    }

    // Append data to FormData for multipart submission
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !(value instanceof File)) {
            submissionFormData.append(key, JSON.stringify(value));
        } else {
            submissionFormData.append(key, value);
        }
      }
    });

    try {
      const url = formData._id
        ? `${API_BASE_URL}/api/customers/${formData._id}`
        : `${API_BASE_URL}/api/customers`;
      const method = formData._id ? 'put' : 'post';

      await axios({ method, url, data: submissionFormData, headers: { 'Content-Type': 'multipart/form-data' } });

      setSavedCustomerName(payload.displayName);
      setSuccessDialogOpen(true);

    } catch (err) {
      console.error("Error saving customer:", err.response || err);
      setError(`Failed to save customer: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate('/account-transaction/customer');
  };

  const currentTitle = customerId ? (isViewMode ? "View Customer" : "Customer Details") : "Add New Customer";

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, p: 2, backgroundColor: 'background.default' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={titleStyle}>{currentTitle}</Typography>
        <Tooltip title="Back to Customer List">
            <IconButton onClick={() => navigate('/account-transaction/customer')} aria-label="back to customer list">
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
                  <InputLabel shrink sx={{position: 'relative', transform: 'none', mb: -1, fontWeight:'medium'}}>Customer Type *</InputLabel>
                  <RadioGroup row name="customerType" value={formData.customerType} onChange={handleChange}>
                    <FormControlLabel value="B2B" control={<Radio size="small"/>} label="Business" />
                    <FormControlLabel value="B2C" control={<Radio size="small"/>} label="Individual" />
                  </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 1, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <FormControlLabel control={ <Switch checked={formData.gstRegistered} onChange={handleChange} name="gstRegistered" size="small" disabled={isViewMode}/>} label="GST Registered" />
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

                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode || formData.customerType === 'B2C'}>
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
                            <Tooltip title={getPanTooltipText(formData.customerType, formData.companyType, businessRules)} arrow>
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

                <Typography variant="subtitle1" sx={{...titleStyle, color:'text.primary', fontSize: '1rem', fontWeight: 'bold'}}>Delivery Address</Typography>
                <FormControlLabel control={<Switch checked={sameAsBilling} onChange={handleSameAsBillingChange} size="small" disabled={isViewMode}/>} label="Same as billing address" sx={{color: 'text.secondary'}}/>
                {!sameAsBilling && (
                  <>
                    <TextField name="deliveryAddressLine1" label="Address Line 1" value={formData.deliveryAddressLine1} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                    <TextField name="deliveryAddressLine2" label="Address Line 2" value={formData.deliveryAddressLine2} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                    <TextField name="deliveryAddressLine3" label="Address Line 3 (City/Town)" value={formData.deliveryAddressLine3} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                    <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                        <InputLabel>Delivery State</InputLabel>
                        <Select name="deliveryState" value={formData.deliveryState} label="Delivery State" onChange={handleChange}>
                            <MenuItem value=""><em>Select State</em></MenuItem>
                            {stateOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                        <InputLabel>Delivery Country</InputLabel>
                        <Select name="deliveryCountry" value={formData.deliveryCountry} label="Delivery Country" onChange={handleChange}>
                             <MenuItem value=""><em>Select Country</em></MenuItem>
                            {countryOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField name="deliveryPinCode" label="PIN/ZIP Code" value={formData.deliveryPinCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
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

                <Typography variant="subtitle1" sx={{...titleStyle, color:'text.primary', fontSize: '1rem', fontWeight: 'bold'}}>Bank account</Typography>
                <TextField name="financialDetails.bankAccountName" label="Bank account name" value={formData.financialDetails.bankAccountName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.accountNo" label="Account No" value={formData.financialDetails.accountNo} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.ifscCode" label="IFSC Code" value={formData.financialDetails.ifscCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.swiftCode" label="SWIFT Code" value={formData.financialDetails.swiftCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}> <InputLabel>Currency</InputLabel> <Select name="financialDetails.currency" value={formData.financialDetails.currency} label="Currency" onChange={handleChange}>
                 {currencyOptions.map((opt) => (<MenuItem key={opt._id} value={opt.value}>{opt.label}</MenuItem>))}
                </Select> </FormControl>

                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Tax Details</Typography>
                <FormControlLabel control={<Switch checked={formData.tcsEnabled} onChange={handleChange} name="tcsEnabled" size="small" disabled={isViewMode}/>} label="TCS on sale" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                <FormControlLabel control={<Switch checked={formData.tdsEnabled} onChange={handleChange} name="tdsEnabled" size="small" disabled={isViewMode}/>} label="TDS on sale" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                <FormControlLabel control={<Switch checked={formData.gstTdsEnabled} onChange={handleChange} name="gstTdsEnabled" size="small" disabled={isViewMode}/>} label="GST TDS" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                <FormControlLabel control={<Switch checked={formData.gstTcsEnabled} onChange={handleChange} name="gstTcsEnabled" size="small" disabled={isViewMode}/>} label="GST TCS" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />

                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Bills & Payments</Typography>
                <FormControlLabel control={<Switch checked={formData.billsAndPayments?.enabled || false} onChange={handleChange} name="billsAndPayments.enabled" size="small" disabled={isViewMode}/>} label="Enable Bills & Payments" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                {formData.billsAndPayments?.enabled && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #e0e0e0', ml: 1, mt: 1, pt: 1, pb: 1 }}>
                        <FormControlLabel control={<Switch checked={formData.billsAndPayments?.allowBillRaising || false} onChange={handleChange} name="billsAndPayments.allowBillRaising" size="small" disabled={isViewMode}/>} label="Enable Bill Raising" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                        <FormControlLabel control={<Switch checked={formData.billsAndPayments?.allowPurchaseOrder || false} onChange={handleChange} name="billsAndPayments.allowPurchaseOrder" size="small" disabled={isViewMode}/>} label="Enable Purchase Order" labelPlacement="start" sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }} />
                    </Box>
                )}

                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Others</Typography>
                <TextField name="note" label="Note" value={formData.note} onChange={handleChange} fullWidth margin="normal" size="small" multiline rows={2} disabled={isViewMode}/>

                {/* --- UPDATED CUSTOM FIELDS SECTION --- */}
                {formData.customFields.map((field) => (
                    <Grid container spacing={1} key={field.id} alignItems="center" sx={{mb: 1}}>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Field Label"
                                value={field.label}
                                onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                                fullWidth
                                margin="dense"
                                size="small"
                                disabled={isViewMode}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                             <FormControl fullWidth margin="dense" size="small" disabled={isViewMode}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={field.dataType}
                                    onChange={(e) => handleCustomFieldChange(field.id, 'dataType', e.target.value)}
                                    label="Type"
                                >
                                    <MenuItem value="text">Text</MenuItem>
                                    <MenuItem value="number">Number</MenuItem>
                                    <MenuItem value="date">Date</MenuItem>
                                    <MenuItem value="date-month-year">Date (Month/Year)</MenuItem>
                                    <MenuItem value="tick-box">Tick box</MenuItem>
                                    <MenuItem value="yes-no">Yes/No (Radio)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            {(() => {
                                switch (field.dataType) {
                                    case 'tick-box':
                                        return (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.checked)}
                                                        disabled={isViewMode}
                                                    />
                                                }
                                                label="Checked"
                                            />
                                        );
                                    case 'yes-no':
                                        return (
                                            <RadioGroup
                                                row
                                                value={field.value}
                                                onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                                            >
                                                <FormControlLabel value="yes" control={<Radio size="small"/>} label="Yes" disabled={isViewMode} />
                                                <FormControlLabel value="no" control={<Radio size="small"/>} label="No" disabled={isViewMode} />
                                            </RadioGroup>
                                        );
                                    default:
                                        return (
                                            <TextField
                                                label="Value"
                                                value={field.value}
                                                type={
                                                    field.dataType === 'date' ? 'date' :
                                                    field.dataType === 'number' ? 'number' :
                                                    field.dataType === 'date-month-year' ? 'month' : 'text'
                                                }
                                                onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                                                fullWidth
                                                margin="dense"
                                                size="small"
                                                disabled={isViewMode}
                                                InputLabelProps={['date', 'date-month-year'].includes(field.dataType) ? { shrink: true } : {}}
                                            />
                                        );
                                }
                            })()}
                        </Grid>
                        <Grid item xs={9} sm={2}>
                             <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={field.show}
                                        onChange={(e) => handleCustomFieldChange(field.id, 'show', e.target.checked)}
                                        disabled={isViewMode}
                                    />
                                }
                                label="Show"
                             />
                        </Grid>
                        <Grid item xs={3} sm={1}>
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
              <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => navigate(`/customer/edit/${customerId}`)} > Edit Customer </Button>
            ) : (
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={loading} > {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Customer' : 'Save Customer')} </Button>
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
                Customer "{savedCustomerName}" has been saved successfully.
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
                  <Route path="/customer/new" element={<CustomerForm />} />
                  <Route path="/customer/edit/:customerId" element={<CustomerForm />} />
                  <Route path="/customer/view/:customerId" element={<CustomerForm />} />
                </Routes>
              </Router>
            */}
            <CustomerForm />
        </ThemeProvider>
    );
}
