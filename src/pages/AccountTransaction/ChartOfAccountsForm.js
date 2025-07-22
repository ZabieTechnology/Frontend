// src/pages/AccountTransaction/ChartOfAccountsForm.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    Checkbox, // For isSubAccount
    FormControlLabel,
    Divider,
    InputAdornment,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Not currently used
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const initialFormData = {
    _id: null,
    accountType: '', // To be fetched from dropdown (type: CA_Account_Type)
    code: '',
    name: '',
    description: '',
    defaultGstRateId: '', // Stores the _id of the selected GST rate from gst_rates collection
    isSubAccount: false,
    subAccountOf: null, // Store ID of parent account if it's a sub-account
    allowPayments: false, // New field replacing reconcile
    openingBalance: '',
    balanceAsOf: '', // Store as YYYY-MM-DD
    status: 'Active',
};

const ChartOfAccountsForm = ({ onSaveSuccess }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [parentAccounts, setParentAccounts] = useState([]); // For sub-account dropdown
    const [accountTypeOptions, setAccountTypeOptions] = useState([]); // For Account Type dropdown
    const [taxRateOptions, setTaxRateOptions] = useState([]); // For Tax dropdown (from gst_rates)

    const { accountId } = useParams(); // For edit/view mode
    const location = useLocation();
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // Fetch Account Type options
    const fetchAccountTypeOptions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=CA_Account_Type`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setAccountTypeOptions(response.data.data.map(opt => ({ value: opt.value, label: opt.label })));
            } else {
                setAccountTypeOptions([]);
            }
        } catch (err) {
            console.error("Error fetching Account Type options:", err);
            setAccountTypeOptions([]);
            // setError("Could not load Account Types."); // Optional: show specific error
        }
    }, [API_BASE_URL]);

    // Fetch Tax Rate options (from gst_rates collection)
    const fetchTaxRateOptions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gst-rates?limit=-1`, { withCredentials: true }); // Fetch all GST rates
            if (response.data && Array.isArray(response.data.data)) {
                // Assuming gst_rates have _id and taxName
                setTaxRateOptions(response.data.data.map(rate => ({ value: rate._id, label: rate.taxName })));
            } else {
                setTaxRateOptions([]);
            }
        } catch (err) {
            console.error("Error fetching Tax Rate options:", err);
            setTaxRateOptions([]);
            // setError("Could not load Tax Rates."); // Optional: show specific error
        }
    }, [API_BASE_URL]);

    const fetchAccountData = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts/${id}`, { withCredentials: true });
            if (response.data) {
                const fetched = response.data;
                setFormData({
                    ...initialFormData, // Start with defaults
                    ...fetched,        // Override with fetched data
                    _id: fetched._id,
                    balanceAsOf: fetched.balanceAsOf ? new Date(fetched.balanceAsOf).toISOString().split('T')[0] : '',
                    // Ensure boolean fields are booleans
                    isSubAccount: !!fetched.isSubAccount,
                    allowPayments: !!fetched.allowPayments, // Updated from reconcile
                    // Ensure defaultGstRateId and subAccountOf are empty strings if null/undefined for Select component
                    defaultGstRateId: fetched.defaultGstRateId || '',
                    subAccountOf: fetched.subAccountOf || null,
                });
            } else {
                setError("Account not found.");
                setFormData(initialFormData);
            }
        } catch (err) {
            console.error("Error fetching account data:", err);
            setError(`Failed to load account data: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    const fetchParentAccounts = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                let PAccounts = response.data.data;
                if (accountId) { // If editing, remove current account from list of potential parents
                    PAccounts = PAccounts.filter(acc => acc._id !== accountId);
                }
                setParentAccounts(PAccounts);
            }
        } catch (err) {
            console.error("Error fetching parent accounts:", err);
        }
    }, [API_BASE_URL, accountId]);


    useEffect(() => {
        fetchAccountTypeOptions();
        fetchTaxRateOptions();
        fetchParentAccounts();

        const queryParams = new URLSearchParams(location.search);
        const viewMode = queryParams.get('view') === 'true';
        setIsViewMode(viewMode);

        if (accountId) {
            fetchAccountData(accountId);
        } else {
            setFormData(initialFormData);
            if (viewMode) setIsViewMode(false);
        }
    }, [accountId, location.search, fetchAccountData, fetchParentAccounts, fetchAccountTypeOptions, fetchTaxRateOptions]);

    const handleChange = (event) => {
        if (isViewMode) return;
        const { name, value, type, checked } = event.target;

        setFormData((prev) => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' || type === 'switch' ? checked : value,
            };
            if (name === 'isSubAccount' && !checked) {
                newState.subAccountOf = null; // Clear subAccountOf when isSubAccount is unchecked
            }
            return newState;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isViewMode) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validation based on current form fields
        if (!formData.accountType || !formData.code || !formData.name ) { // Tax (defaultGstRateId) is optional
            setError("Account Type, Code, and Name are required fields.");
            setLoading(false);
            setTimeout(() => setError(null), 5000);
            return;
        }
        if (formData.isSubAccount && !formData.subAccountOf) {
            setError("Please select a parent account for the sub-account.");
            setLoading(false);
            setTimeout(() => setError(null), 5000);
            return;
        }

        const submissionData = { ...formData };
        if (!submissionData._id) {
            delete submissionData._id;
        }
        // Ensure numeric and optional fields are correctly formatted
        submissionData.openingBalance = submissionData.openingBalance ? parseFloat(submissionData.openingBalance) : null;
        submissionData.defaultGstRateId = submissionData.defaultGstRateId || null;
        submissionData.subAccountOf = submissionData.subAccountOf || null;
        submissionData.balanceAsOf = submissionData.balanceAsOf || null;


        try {
            let response;
            if (formData._id) {
                response = await axios.put(`${API_BASE_URL}/api/chart-of-accounts/${formData._id}`, submissionData, { withCredentials: true });
                setSuccess("Account updated successfully!");
            } else {
                response = await axios.post(`${API_BASE_URL}/api/chart-of-accounts`, submissionData, { withCredentials: true });
                setSuccess("Account created successfully!");
            }

            if (response.data && response.data.data) {
                const savedData = response.data.data;
                 setFormData({
                    ...initialFormData,
                    ...savedData,
                    _id: savedData._id,
                    balanceAsOf: savedData.balanceAsOf ? new Date(savedData.balanceAsOf).toISOString().split('T')[0] : '',
                    isSubAccount: !!savedData.isSubAccount,
                    allowPayments: !!savedData.allowPayments,
                    defaultGstRateId: savedData.defaultGstRateId || '',
                    subAccountOf: savedData.subAccountOf || null,
                });
                if (onSaveSuccess) onSaveSuccess(savedData);
                if (!formData._id) { // If it was a new account, optionally navigate
                    // navigate('/account-transaction/chart-of-accounts');
                }
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving account:", err);
            setError(`Failed to save account: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const title = accountId ? (isViewMode ? "View Account Details" : "Edit Account") : "Add New Account";
    const paperStyle = { p: 3, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none', width: '100%', maxWidth: '700px', margin: 'auto' };

    const textFieldProps = (name, label, required = false, otherProps = {}) => ({
        name: name,
        label: label + (required ? " *" : ""),
        value: formData[name] === null || formData[name] === undefined ? '' : formData[name],
        onChange: handleChange,
        variant: "outlined",
        size: "small",
        fullWidth: true,
        sx: { mb: 2.5 },
        disabled: isViewMode,
        required: required,
        ...otherProps,
    });

    if (loading && !formData._id && !accountId) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '700px', margin: 'auto' }}>
                <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{title}</Typography>
                <IconButton onClick={() => navigate('/account-transaction/chart-of-accounts')} aria-label="back to chart of accounts list">
                    <ArrowBackIcon />
                </IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, maxWidth: '700px', margin: 'auto auto 16px auto' }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, maxWidth: '700px', margin: 'auto auto 16px auto' }}>{success}</Alert>}

            <Paper sx={paperStyle}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" sx={{ mb: 2.5 }} disabled={isViewMode} required>
                            <InputLabel>Account Type *</InputLabel>
                            <Select
                                name="accountType"
                                value={formData.accountType}
                                label="Account Type *"
                                onChange={handleChange}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {accountTypeOptions.map(type => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("code", "Code", true)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField {...textFieldProps("name", "Name", true)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField {...textFieldProps("description", "Description", false, { multiline: true, rows: 3 })} />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" sx={{ mb: 2.5 }} disabled={isViewMode}> {/* Tax is now optional */}
                            <InputLabel>Tax</InputLabel>
                            <Select
                                name="defaultGstRateId"
                                value={formData.defaultGstRateId}
                                label="Tax"
                                onChange={handleChange}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {taxRateOptions.map(rate => (
                                    <MenuItem key={rate.value} value={rate.value}>{rate.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                         <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: -1.5 }}>
                            Tax rate can be added from GST Settings or can select the existing rate.
                        </Typography>
                    </Grid>
                    {/* parentCategory field removed from UI */}

                    <Grid item xs={12}> <Divider sx={{ my: 1 }} /> </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.isSubAccount}
                                    onChange={handleChange}
                                    name="isSubAccount"
                                    disabled={isViewMode}
                                    size="small"
                                />
                            }
                            label="Is Sub-Account"
                        />
                    </Grid>
                    {formData.isSubAccount && (
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" sx={{ mb: 2.5 }} disabled={isViewMode || !formData.isSubAccount} required={formData.isSubAccount}>
                                <InputLabel>Sub-account of *</InputLabel>
                                <Select
                                    name="subAccountOf"
                                    value={formData.subAccountOf || ''}
                                    label="Sub-account of *"
                                    onChange={handleChange}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {parentAccounts.map(acc => (
                                        <MenuItem key={acc._id} value={acc._id}>{acc.name} ({acc.code})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={formData.isSubAccount ? 12 : 6}>
                         <TextField {...textFieldProps("openingBalance", "Opening Balance", false, { type: "number", InputProps: { startAdornment: <InputAdornment position="start">$</InputAdornment> } })} />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        {/* Balance as of date field removed from UI */}
                        {/* <TextField {...textFieldProps("balanceAsOf", "Balance as of", false, { type: "date", InputLabelProps: { shrink: true } })} /> */}
                    </Grid>

                    <Grid item xs={12}> <Divider sx={{ my: 1 }} /> </Grid>

                    <Grid item xs={6} sm={4}>
                        <FormControlLabel control={<Switch checked={formData.allowPayments} onChange={handleChange} name="allowPayments" disabled={isViewMode} />} label="Allow Payments" />
                    </Grid>
                    {/* dashboardWatch and isFavorite switches removed from UI */}
                     <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small" disabled={isViewMode}>
                            <InputLabel>Status</InputLabel>
                            <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    {isViewMode ? (
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/account-transaction/chart-of-accounts/edit/${accountId}`)}
                        >
                            Edit Account
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Account' : 'Save Account')}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ChartOfAccountsForm;
