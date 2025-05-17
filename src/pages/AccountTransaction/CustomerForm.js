import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Checkbox,
  Switch,
  Box,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const initialFormData = {
  _id: null,
  customerType: 'B2B',
  companyType: '', // This will be populated from dropdown
  gstNo: '',
  companyName: '',
  displayName: '',
  pan: '',
  tan: '',
  primaryContact: {
    name: '',
    contact: '',
    email: '',
  },
  website: '',
  billingAddress: '',
  deliveryAddress: '',
  sameAsBilling: false,
  birthday: '',
  tcsEnabled: true,
  tdsEnabled: true,
  note: '',
  financialDetails: {
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
};

const CustomerForm = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [companyTypes, setCompanyTypes] = useState([]); // State for company types

  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  // Fetch Company Types from dropdown collection
  const fetchCompanyTypes = useCallback(async () => {
    try {
      // Assuming your API endpoint is /api/dropdown and it accepts a 'type' query param
      const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=companyType`, { withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setCompanyTypes(response.data.data);
      } else {
        console.error("Failed to fetch company types or invalid format", response.data);
        setCompanyTypes([]); // Set to empty if fetch fails or format is wrong
      }
    } catch (err) {
      console.error("Error fetching company types:", err);
      setError("Could not load company types.");
      setCompanyTypes([]);
    }
  }, [API_BASE_URL]); // API_BASE_URL as dependency

  const fetchCustomerData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/customers/${id}`, { withCredentials: true });
      if (response.data) {
        const fetched = response.data;
        setFormData({
          ...initialFormData,
          ...fetched,
          _id: fetched._id,
          primaryContact: { ...initialFormData.primaryContact, ...fetched.primaryContact },
          financialDetails: { ...initialFormData.financialDetails, ...fetched.financialDetails },
          birthday: fetched.birthday ? new Date(fetched.birthday).toISOString().split('T')[0] : '',
          financialDetails: { // Ensure this nested object is also spread correctly
            ...initialFormData.financialDetails,
            ...fetched.financialDetails,
            balanceAsOf: fetched.financialDetails?.balanceAsOf ? new Date(fetched.financialDetails.balanceAsOf).toISOString().split('T')[0] : '',
          },
          sameAsBilling: fetched.billingAddress === fetched.deliveryAddress && fetched.billingAddress !== '',
        });
      } else {
        setError("Customer not found.");
        setFormData(initialFormData);
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError(`Failed to load customer data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchCompanyTypes(); // Fetch company types on component mount

    const queryParams = new URLSearchParams(location.search);
    const viewMode = queryParams.get('view') === 'true';
    setIsViewMode(viewMode);

    if (customerId) {
      fetchCustomerData(customerId);
    } else {
      setFormData(initialFormData);
      if (viewMode) setIsViewMode(false);
    }
  }, [customerId, location.search, fetchCustomerData, fetchCompanyTypes]); // Added fetchCompanyTypes

  const handleChange = (event) => {
    if (isViewMode) return;
    const { name, value, type, checked } = event.target;
    const [section, field] = name.split('.');

    if (section && field) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
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

  const handleSameAsBillingChange = (event) => {
    if (isViewMode) return;
    const isChecked = event.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsBilling: isChecked,
      deliveryAddress: isChecked ? prev.billingAddress : '',
    }));
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

    const submissionData = { ...formData };
    if (!submissionData._id) {
      delete submissionData._id;
    }
    if (submissionData.financialDetails.openingBalance) {
        submissionData.financialDetails.openingBalance = parseFloat(submissionData.financialDetails.openingBalance) || 0;
    }
    if (submissionData.financialDetails.creditLimit) {
        submissionData.financialDetails.creditLimit = parseFloat(submissionData.financialDetails.creditLimit) || 0;
    }
    submissionData.tcsEnabled = !!submissionData.tcsEnabled;
    submissionData.tdsEnabled = !!submissionData.tdsEnabled;
    submissionData.sameAsBilling = !!submissionData.sameAsBilling;

    try {
      let response;
      if (formData._id) {
        response = await axios.put(`${API_BASE_URL}/api/customers/${formData._id}`, submissionData, { withCredentials: true });
        setSuccess("Customer updated successfully!");
      } else {
        response = await axios.post(`${API_BASE_URL}/api/customers`, submissionData, { withCredentials: true });
        setSuccess("Customer created successfully!");
      }

      if (response.data && response.data.data) {
        const savedData = response.data.data;
        setFormData({
            ...initialFormData,
            ...savedData,
            _id: savedData._id,
            primaryContact: { ...initialFormData.primaryContact, ...savedData.primaryContact },
            financialDetails: { ...initialFormData.financialDetails, ...savedData.financialDetails },
            birthday: savedData.birthday ? new Date(savedData.birthday).toISOString().split('T')[0] : '',
            financialDetails: { // Ensure this nested object is also spread correctly
                ...initialFormData.financialDetails,
                ...savedData.financialDetails,
                balanceAsOf: savedData.financialDetails?.balanceAsOf ? new Date(savedData.financialDetails.balanceAsOf).toISOString().split('T')[0] : '',
            },
            sameAsBilling: savedData.billingAddress === savedData.deliveryAddress && savedData.billingAddress !== '',
        });
        if (onSaveSuccess) onSaveSuccess(savedData);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving customer:", err);
      setError(`Failed to save customer: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const title = customerId ? (isViewMode ? "View Customer Details" : "Edit Customer") : "Add New Customer";
  const titleStyle = { color: '#4CAF50', fontWeight: 'bold', marginBottom: 2 };
  const sectionTitleStyle = { marginTop: 3, marginBottom: 1, fontWeight: 'medium' };
  const paperStyle = { padding: 3, height: '100%' };
  const switchLabelStyle = { color: 'text.secondary', marginRight: 1 };

  if (loading && !formData._id && !customerId) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
              <CircularProgress />
          </Box>
      );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, p: 2, backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={titleStyle}>{title}</Typography>
        <IconButton onClick={() => navigate('/account-transaction/customer')} aria-label="back to customer list">
            <ArrowBackIcon />
        </IconButton>
      </Paper>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* --- Column 1: Contact Details --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={paperStyle} elevation={2}>
            <Typography variant="h6" sx={{...titleStyle, fontSize: '1.1rem'}}>Contact Details</Typography>
            <FormControl component="fieldset" margin="normal" disabled={isViewMode}>
              <InputLabel shrink sx={{position: 'relative', transform: 'none', mb: -1}}>Customer Type *</InputLabel>
              <RadioGroup row name="customerType" value={formData.customerType} onChange={handleChange}>
                <FormControlLabel value="B2B" control={<Radio size="small"/>} label="B2B" />
                <FormControlLabel value="B2C" control={<Radio size="small"/>} label="B2C" />
              </RadioGroup>
            </FormControl>
            {/* Updated Company Type Select */}
            <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
              <InputLabel>Types of company</InputLabel>
              <Select name="companyType" value={formData.companyType} label="Types of company" onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {companyTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField name="gstNo" label="GST No." value={formData.gstNo} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="companyName" label="Company Name" value={formData.companyName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="displayName" label="Display Name *" value={formData.displayName} onChange={handleChange} required fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="pan" label="PAN" value={formData.pan} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="tan" label="TAN" value={formData.tan} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>

            <Typography variant="subtitle1" sx={sectionTitleStyle}>Primary Contact</Typography>
            <TextField name="primaryContact.name" label="Name" value={formData.primaryContact.name} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="primaryContact.contact" label="Contact No." value={formData.primaryContact.contact} onChange={handleChange} fullWidth margin="normal" size="small" type="tel" disabled={isViewMode}/>
            <TextField name="primaryContact.email" label="E-mail" value={formData.primaryContact.email} onChange={handleChange} fullWidth margin="normal" size="small" type="email" disabled={isViewMode}/>
          </Paper>
        </Grid>

        {/* --- Column 2: Website, Address, Others, Tax --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={paperStyle} elevation={2}>
            <TextField name="website" label="Website" value={formData.website} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <Typography variant="h6" sx={{...titleStyle, fontSize: '1.1rem'}}>Address</Typography>
            <TextField name="billingAddress" label="Billing address *" value={formData.billingAddress} onChange={handleChange} required multiline rows={3} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <FormControlLabel control={<Checkbox name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleSameAsBillingChange} size="small" disabled={isViewMode}/>} label="Delivery address same as billing" sx={{color: 'text.secondary'}}/>
            {!formData.sameAsBilling && (
              <TextField name="deliveryAddress" label="Delivery address *" value={formData.deliveryAddress} onChange={handleChange} required={!formData.sameAsBilling} multiline rows={3} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            )}
            <Typography variant="h6" sx={{...titleStyle, fontSize: '1.1rem', marginTop: '16px'}}>Others</Typography>
            <TextField name="birthday" label="Birthday" value={formData.birthday} onChange={handleChange} type="date" fullWidth margin="normal" size="small" InputLabelProps={{ shrink: true }} disabled={isViewMode}/>
            <Typography variant="h6" sx={{...titleStyle, fontSize: '1.1rem', marginTop: '16px'}}>Tax Details</Typography>
            <Box display="flex" alignItems="center" my={1}>
              <Typography variant="body1" sx={{ minWidth: '50px' }}>TCS</Typography>
              <Typography variant="body2" sx={switchLabelStyle}>NO</Typography>
              <Switch name="tcsEnabled" checked={formData.tcsEnabled} onChange={handleChange} size="small" disabled={isViewMode}/>
              <Typography variant="body2" sx={{marginLeft: 1}}>Yes</Typography>
            </Box>
            <Box display="flex" alignItems="center" my={1}>
              <Typography variant="body1" sx={{ minWidth: '50px' }}>TDS</Typography>
              <Typography variant="body2" sx={switchLabelStyle}>NO</Typography>
              <Switch name="tdsEnabled" checked={formData.tdsEnabled} onChange={handleChange} size="small" disabled={isViewMode}/>
              <Typography variant="body2" sx={{marginLeft: 1}}>Yes</Typography>
            </Box>
            <TextField name="note" label="Note" value={formData.note} onChange={handleChange} multiline rows={2} fullWidth margin="normal" size="small" disabled={isViewMode}/>
          </Paper>
        </Grid>

        {/* --- Column 3: Financial Details --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={paperStyle} elevation={2}>
            <Typography variant="h6" sx={{...titleStyle, fontSize: '1.1rem'}}>Financial Details</Typography>
            <TextField name="financialDetails.openingBalance" label="Opening Balance" value={formData.financialDetails.openingBalance} onChange={handleChange} type="number" fullWidth margin="normal" size="small" InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}} disabled={isViewMode}/>
            <TextField name="financialDetails.balanceAsOf" label="Balance as of" value={formData.financialDetails.balanceAsOf} onChange={handleChange} type="date" fullWidth margin="normal" size="small" InputLabelProps={{ shrink: true }} disabled={isViewMode}/>
            <Typography variant="subtitle1" sx={sectionTitleStyle}>Bank account</Typography>
            <TextField name="financialDetails.bankAccountName" label="Bank account name" value={formData.financialDetails.bankAccountName} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="financialDetails.accountNo" label="Account No" value={formData.financialDetails.accountNo} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="financialDetails.ifscCode" label="IFSC Code" value={formData.financialDetails.ifscCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <TextField name="financialDetails.swiftCode" label="SWIFT Code" value={formData.financialDetails.swiftCode} onChange={handleChange} fullWidth margin="normal" size="small" disabled={isViewMode}/>
            <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
              <InputLabel>Currency</InputLabel>
              <Select name="financialDetails.currency" value={formData.financialDetails.currency} label="Currency" onChange={handleChange}>
                <MenuItem value={'INR'}>INR - Indian Rupee</MenuItem>
                <MenuItem value={'USD'}>USD - US Dollar</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" size="small" disabled={isViewMode}>
              <InputLabel>Payment Terms *</InputLabel>
              <Select name="financialDetails.paymentTerms" value={formData.financialDetails.paymentTerms} label="Payment Terms *" required onChange={handleChange}>
                <MenuItem value={'Net15'}>Net 15</MenuItem>
                <MenuItem value={'Net30'}>Net 30</MenuItem>
                <MenuItem value={'Net45'}>Net 45</MenuItem>
                <MenuItem value={'Net60'}>Net 60</MenuItem>
                <MenuItem value={'DueOnReceipt'}>Due on Receipt</MenuItem>
              </Select>
            </FormControl>
            <TextField name="financialDetails.creditLimit" label="Credit limit" value={formData.financialDetails.creditLimit} onChange={handleChange} type="number" fullWidth margin="normal" size="small" InputProps={{startAdornment: <InputAdornment position="start">$</InputAdornment>}} disabled={isViewMode}/>
          </Paper>
        </Grid>
      </Grid>

      {/* Save/Update/Edit Button Area */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        {isViewMode ? (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/account-transaction/customer/edit/${customerId}`)}
          >
            Edit Customer
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Customer' : 'Save Customer')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CustomerForm;
