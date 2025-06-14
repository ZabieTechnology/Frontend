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
  Avatar,
  IconButton,
  InputAdornment, // Ensured InputAdornment is imported
  Tooltip,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
    Upload as UploadIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon
} from "@mui/icons-material";
import styled from "@emotion/styled";
import axios from "axios";
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#f5f5f5",
  padding: "24px",
  maxWidth: "1000px",
  margin: "auto",
}));

const initialFormData = {
  _id: null,
  customerType: 'B2B',
  companyType: '',
  gstNo: '',
  companyName: '',
  displayName: '',
  pan: '',
  tan: '',
  primaryContact: { // Ensure this is always an object
    name: '',
    contact: '',
    email: '',
  },
  website: '',
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingAddressLine3: "",
  billingState: "",
  billingCountry: "",
  billingPinCode: "",
  deliveryAddressLine1: "",
  deliveryAddressLine2: "",
  deliveryAddressLine3: "",
  deliveryState: "",
  deliveryCountry: "",
  deliveryPinCode: "",
  sameAsBilling: false,
  birthday: '',
  tcsEnabled: true,
  tdsEnabled: true,
  note: '',
  financialDetails: { // Ensure this is always an object
    openingBalance: '',
    balanceAsOf: '',
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
  pfEnabled: false,
  pfNumber: "",
  esicEnabled: false,
  esicNumber: "",
  iecRegistered: false,
  iecNumber: "",
  advanceTaxEnabled: false,
};

function CustomerForm({ onSaveSuccess }) {
  const [formData, setFormData] = useState(initialFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [companyTypes, setCompanyTypes] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  // Define style objects
  const titleStyle = { color: '#4CAF50', fontWeight: 'bold', marginBottom: 2 };
  const sectionTitleStyle = { marginTop: 2, marginBottom: 1, fontWeight: 'medium', color: '#333', fontSize:'1rem' };
  const paperStyle = { padding: '16px', height: '100%', boxShadow: '0px 1px 2px rgba(0,0,0,0.08)' };
  const switchLabelStyle = { color: 'text.secondary', marginRight: 0.5, fontSize: '0.9rem' };


  const fetchDropdownData = useCallback(async (type, setter) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=${type}&limit=-1`, { withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setter(response.data.data.map(item => ({ value: item.value, label: item.label, _id: item._id })));
      } else {
        console.error(`Failed to fetch ${type} or invalid format`, response.data);
        setter([]);
      }
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setter([]);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchDropdownData('companyType', setCompanyTypes);
    fetchDropdownData('state', setStateOptions);
    fetchDropdownData('country', setCountryOptions);
  }, [fetchDropdownData]);

  const fetchCustomerData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${id}`, { withCredentials: true });
      if (response.data) {
        const fetched = response.data;
        const newFormData = {
          ...initialFormData, // Ensure all keys from initialFormData are present
          ...fetched, // Spread fetched data, potentially overwriting some initialFormData fields
          _id: fetched._id,
          // Explicitly ensure nested objects are correctly formed by merging with initial parts
          primaryContact: { ...initialFormData.primaryContact, ...(fetched.primaryContact || {}) },
          financialDetails: {
            ...initialFormData.financialDetails,
            ...(fetched.financialDetails || {}),
            balanceAsOf: fetched.financialDetails?.balanceAsOf ? new Date(fetched.financialDetails.balanceAsOf).toISOString().split('T')[0] : '',
          },
          // Map from backend's nested address structure
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

          logo: null, // Always reset file input on fetch
          logoPreview: fetched.logoFilename ? `${API_BASE_URL}${fetched.logoFilename.startsWith('/') ? '' : '/uploads/logos/'}${fetched.logoFilename}` : null,
          birthday: fetched.birthday ? new Date(fetched.birthday).toISOString().split('T')[0] : '',
        };

        // Clean up old flat address fields if they exist in newFormData from fetched data
        delete newFormData.state; delete newFormData.country; delete newFormData.pinCode;
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
      setFormData(initialFormData); // Reset to initial on error
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const viewMode = queryParams.get('view') === 'true';
    setIsViewMode(viewMode);

    if (customerId) {
      fetchCustomerData(customerId);
    } else {
      setFormData(initialFormData);
      if (viewMode) setIsViewMode(false);
    }
  }, [customerId, location.search, fetchCustomerData]);

  const handleChange = (event) => {
    if (isViewMode) return;
    const { name, value, type, checked } = event.target;
    const [section, field] = name.split('.');

    if (section && field) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] || {}), // Ensure section exists before spreading
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'radio' ? value : value),
      }));
    }
  };

  const handleSwitchChange = (event) => {
    if (isViewMode) return;
    const { name, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
      ...(name === 'gstRegistered' && !checked && { gstNumber: '' }),
      ...(name === 'pfEnabled' && !checked && { pfNumber: '' }),
      ...(name === 'esicEnabled' && !checked && { esicNumber: '' }),
      ...(name === 'iecRegistered' && !checked && { iecNumber: '' }),
    }));
  };

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

  const handleLogoChange = (event) => {
    if (isViewMode) return;
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo file size should not exceed 2MB.");
        return;
      }
      setFormData((prevData) => ({
        ...prevData,
        logo: file,
        logoPreview: URL.createObjectURL(file),
        logoFilename: file.name
      }));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isViewMode) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.displayName || !formData.financialDetails.paymentTerms) {
        setError("Display Name and Payment Terms are required.");
        setLoading(false);
        setTimeout(() => setError(null), 5000);
        return;
    }

    const submissionFormData = new FormData();

    const payload = {
        customerType: formData.customerType,
        companyType: formData.companyType,
        gstNo: formData.gstNo,
        companyName: formData.companyName,
        displayName: formData.displayName,
        pan: formData.pan,
        tan: formData.tan,
        primaryContact: formData.primaryContact,
        website: formData.website,
        billingAddress: {
            street: formData.billingAddressLine1,
            street2: formData.billingAddressLine2,
            city: formData.billingAddressLine3,
            state: formData.billingState,
            country: formData.billingCountry,
            zipCode: formData.billingPinCode,
        },
        shippingAddress: {
            street: formData.deliveryAddressLine1,
            street2: formData.deliveryAddressLine2,
            city: formData.deliveryAddressLine3,
            state: formData.deliveryState,
            country: formData.deliveryCountry,
            zipCode: formData.deliveryPinCode,
        },
        birthday: formData.birthday || null,
        tcsEnabled: formData.tcsEnabled,
        tdsEnabled: formData.tdsEnabled,
        note: formData.note,
        financialDetails: {
            ...formData.financialDetails,
            openingBalance: parseFloat(formData.financialDetails.openingBalance) || 0,
            creditLimit: parseFloat(formData.financialDetails.creditLimit) || 0,
            balanceAsOf: formData.financialDetails.balanceAsOf || null,
        },
        gstRegistered: formData.gstRegistered,
        gstNumber: formData.gstRegistered ? formData.gstNumber : "",
        pfEnabled: formData.pfEnabled,
        pfNumber: formData.pfEnabled ? formData.pfNumber : "",
        esicEnabled: formData.esicEnabled,
        esicNumber: formData.esicEnabled ? formData.esicNumber : "",
        iecRegistered: formData.iecRegistered,
        iecNumber: formData.iecRegistered ? formData.iecNumber : "",
        advanceTaxEnabled: formData.advanceTaxEnabled,
    };

    if (formData.logoFilename && !formData.logo) { // If there's an existing logo and no new one uploaded
      payload.logoFilename = formData.logoFilename;
    }

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !(value instanceof File)) {
            submissionFormData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
            submissionFormData.append(key, value.toString());
        } else {
            submissionFormData.append(key, value);
        }
      }
    });

    if (formData.logo instanceof File) {
      submissionFormData.append('logo', formData.logo, formData.logo.name);
    }

    // _id is part of the URL for PUT, not typically in FormData for update
    // if (formData._id) {
    //     submissionFormData.append('_id', formData._id);
    // }

    try {
      const url = formData._id
        ? `${API_BASE_URL}/api/customers/${formData._id}`
        : `${API_BASE_URL}/api/customers`;
      const method = formData._id ? 'put' : 'post';

      const response = await axios({
        method: method, url: url, data: submissionFormData,
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setSuccess(formData._id ? "Customer updated successfully!" : "Customer created successfully!");
      if (response.data && response.data.data) {
        const savedData = response.data.data;
        fetchCustomerData(savedData._id);
        if (onSaveSuccess) onSaveSuccess(savedData);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving customer:", err.response || err);
      setError(`Failed to save customer: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const currentTitle = customerId ? (isViewMode ? "View Customer Details" : "Edit Customer") : "Add New Customer"; // Renamed to avoid conflict

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, p: 2, backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={titleStyle}>{currentTitle}</Typography> {/* Used currentTitle */}
        <IconButton onClick={() => navigate('/account-transaction/customer')} aria-label="back to customer list">
            <ArrowBackIcon />
        </IconButton>
      </Paper>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {loading && (!formData._id && !customerId) && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}

      {(!loading || formData._id || customerId ) && (
        <StyledPaper elevation={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={paperStyle} elevation={2}>
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1}}>Contact Details</Typography>
                <FormControl component="fieldset" margin="normal" disabled={isViewMode}>
                  <InputLabel shrink sx={{position: 'relative', transform: 'none', mb: -1, fontWeight:'medium'}}>Customer Type *</InputLabel>
                  <RadioGroup row name="customerType" value={formData.customerType} onChange={handleChange}>
                    <FormControlLabel value="B2B" control={<Radio size="small"/>} label="Business" />
                    <FormControlLabel value="B2C" control={<Radio size="small"/>} label="Individual" />
                  </RadioGroup>
                </FormControl>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                  <InputLabel>Types of company</InputLabel>
                  <Select name="companyType" value={formData.companyType} label="Types of company" onChange={handleChange}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {companyTypes.map((type) => ( <MenuItem key={type._id || type.value} value={type.value}> {type.label} </MenuItem> ))}
                  </Select>
                </FormControl>
                <TextField name="gstNo" label="GST No." value={formData.gstNo} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="companyName" label="Company Name" value={formData.companyName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="displayName" label="Display Name *" value={formData.displayName} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="pan" label="PAN" value={formData.pan} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="tan" label="TAN" value={formData.tan} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <Typography variant="subtitle1" sx={sectionTitleStyle}>Primary Contact</Typography>
                <TextField name="primaryContact.name" label="Name" value={formData.primaryContact?.name || ''} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="primaryContact.contact" label="Contact No." value={formData.primaryContact?.contact || ''} onChange={handleChange} fullWidth margin="normal" size="small" type="tel" disabled={isViewMode}/>
                <TextField name="primaryContact.email" label="E-mail" value={formData.primaryContact?.email || ''} onChange={handleChange} fullWidth margin="normal" size="small" type="email" disabled={isViewMode}/>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={paperStyle} elevation={2}>
                <TextField name="website" label="Website" value={formData.website} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:1}}>Address</Typography>

                <Typography variant="subtitle1" sx={sectionTitleStyle}>Billing Address</Typography>
                <TextField name="billingAddressLine1" label="Address Line 1 *" value={formData.billingAddressLine1} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="billingAddressLine2" label="Address Line 2" value={formData.billingAddressLine2} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="billingAddressLine3" label="Address Line 3 (City/Town)" value={formData.billingAddressLine3} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                  <InputLabel>Billing State</InputLabel>
                  <Select name="billingState" value={formData.billingState} label="Billing State" onChange={handleChange}>
                    <MenuItem value=""><em>Select State</em></MenuItem>
                    {stateOptions.map((opt) => (<MenuItem key={opt._id || opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                  </Select>
                </FormControl>
                 <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                  <InputLabel>Billing Country</InputLabel>
                  <Select name="billingCountry" value={formData.billingCountry} label="Billing Country" onChange={handleChange}>
                    <MenuItem value=""><em>Select Country</em></MenuItem>
                    {countryOptions.map((opt) => (<MenuItem key={opt._id || opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                  </Select>
                </FormControl>
                <TextField name="billingPinCode" label="PIN/ZIP Code *" value={formData.billingPinCode} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>

                <Typography variant="subtitle1" sx={sectionTitleStyle}>Delivery Address</Typography>
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
                            {stateOptions.map((opt) => (<MenuItem key={opt._id || opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
                        <InputLabel>Delivery Country</InputLabel>
                        <Select name="deliveryCountry" value={formData.deliveryCountry} label="Delivery Country" onChange={handleChange}>
                             <MenuItem value=""><em>Select Country</em></MenuItem>
                            {countryOptions.map((opt) => (<MenuItem key={opt._id || opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField name="deliveryPinCode" label="PIN/ZIP Code" value={formData.deliveryPinCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                  </>
                )}
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Others</Typography>
                <TextField name="birthday" label="Birthday" value={formData.birthday} onChange={handleChange} type="date" fullWidth margin="normal" size="small" InputLabelProps={{ shrink: true }} disabled={isViewMode}/>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={paperStyle} elevation={2}>
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1}}>Financial Details</Typography>
                <TextField name="financialDetails.openingBalance" label="Opening Balance" value={formData.financialDetails.openingBalance} onChange={handleChange} type="number" fullWidth margin="normal" size="small" InputProps={{startAdornment: <InputAdornment position="start">₹</InputAdornment>}} disabled={isViewMode}/>
                <TextField name="financialDetails.balanceAsOf" label="Balance as of" value={formData.financialDetails.balanceAsOf} onChange={handleChange} type="date" fullWidth margin="normal" size="small" InputLabelProps={{ shrink: true }} disabled={isViewMode}/>
                <Typography variant="subtitle1" sx={sectionTitleStyle}>Bank account</Typography>
                <TextField name="financialDetails.bankAccountName" label="Bank account name" value={formData.financialDetails.bankAccountName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.accountNo" label="Account No" value={formData.financialDetails.accountNo} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.ifscCode" label="IFSC Code" value={formData.financialDetails.ifscCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <TextField name="financialDetails.swiftCode" label="SWIFT Code" value={formData.financialDetails.swiftCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}> <InputLabel>Currency</InputLabel> <Select name="financialDetails.currency" value={formData.financialDetails.currency} label="Currency" onChange={handleChange}> <MenuItem value={'INR'}>INR - Indian Rupee</MenuItem> <MenuItem value={'USD'}>USD - US Dollar</MenuItem> </Select> </FormControl>
                <FormControl fullWidth margin="normal" size="small" disabled={isViewMode} required> <InputLabel>Payment Terms *</InputLabel> <Select name="financialDetails.paymentTerms" value={formData.financialDetails.paymentTerms} label="Payment Terms *" required onChange={handleChange}> <MenuItem value={'Net15'}>Net 15</MenuItem> <MenuItem value={'Net30'}>Net 30</MenuItem> <MenuItem value={'Net45'}>Net 45</MenuItem> <MenuItem value={'Net60'}>Net 60</MenuItem> <MenuItem value={'DueOnReceipt'}>Due on Receipt</MenuItem> </Select> </FormControl>
                <TextField name="financialDetails.creditLimit" label="Credit limit" value={formData.financialDetails.creditLimit} onChange={handleChange} type="number" fullWidth margin="normal" size="small" InputProps={{startAdornment: <InputAdornment position="start">₹</InputAdornment>}} disabled={isViewMode}/>
                <Typography variant="h6" sx={{fontSize: '1.1rem', color: '#4CAF50', fontWeight: 'bold', mb:1, mt:2}}>Tax Details</Typography>
                <Box display="flex" alignItems="center" my={1}> <Typography variant="body1" sx={{ minWidth: '50px' }}>TCS</Typography> <Typography variant="body2" sx={switchLabelStyle}>NO</Typography> <Switch name="tcsEnabled" checked={formData.tcsEnabled} onChange={handleSwitchChange} size="small" disabled={isViewMode}/> <Typography variant="body2" sx={{marginLeft: 1}}>Yes</Typography> </Box>
                <Box display="flex" alignItems="center" my={1}> <Typography variant="body1" sx={{ minWidth: '50px' }}>TDS</Typography> <Typography variant="body2" sx={switchLabelStyle}>NO</Typography> <Switch name="tdsEnabled" checked={formData.tdsEnabled} onChange={handleSwitchChange} size="small" disabled={isViewMode}/> <Typography variant="body2" sx={{marginLeft: 1}}>Yes</Typography> </Box>
                 <Box sx={{ mt: 1 }}> <FormControlLabel control={ <Switch checked={formData.gstRegistered} onChange={handleSwitchChange} name="gstRegistered" size="small" disabled={isViewMode}/>} label="GST Registered" /> {formData.gstRegistered && ( <TextField margin="dense" required fullWidth id="gstNumber" label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} size="small" disabled={isViewMode}/> )} </Box>
                 <Box sx={{ mt: 1 }}> <FormControlLabel control={ <Switch checked={formData.pfEnabled} onChange={handleSwitchChange} name="pfEnabled" size="small" disabled={isViewMode}/>} label="PF Enabled" /> {formData.pfEnabled && ( <TextField margin="dense" required fullWidth id="pfNumber" label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} size="small" disabled={isViewMode}/> )} </Box>
                 <Box sx={{ mt: 1 }}> <FormControlLabel control={ <Switch checked={formData.esicEnabled} onChange={handleSwitchChange} name="esicEnabled" size="small" disabled={isViewMode}/>} label="ESIC Enabled" /> {formData.esicEnabled && ( <TextField margin="dense" required fullWidth id="esicNumber" label="ESIC Number" name="esicNumber" value={formData.esicNumber} onChange={handleChange} size="small" disabled={isViewMode}/> )} </Box>
                 <Box sx={{ mt: 1 }}> <FormControlLabel control={ <Switch checked={formData.iecRegistered} onChange={handleSwitchChange} name="iecRegistered" size="small" disabled={isViewMode}/>} label="IEC Registered" /> {formData.iecRegistered && ( <TextField margin="dense" required fullWidth id="iecNumber" label="IEC Number" name="iecNumber" value={formData.iecNumber} onChange={handleChange} size="small" disabled={isViewMode}/> )} </Box>
                 <Box sx={{ mt: 1 }}> <FormControlLabel control={ <Switch checked={formData.advanceTaxEnabled} onChange={handleSwitchChange} name="advanceTaxEnabled" size="small" disabled={isViewMode}/>} label="Advance Tax Enabled" /> </Box>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            {isViewMode ? (
              <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => navigate(`/account-transaction/customer/edit/${customerId}`)} > Edit Customer </Button>
            ) : (
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={loading} > {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Customer' : 'Save Customer')} </Button>
            )}
          </Box>
        </StyledPaper>
      )}
    </Box>
  );
};

export default CustomerForm;
