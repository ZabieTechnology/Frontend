// src/pages/AccountTransaction/ChartOfAccountsForm.js
import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';


const initialFormData = {
    _id: null,
    nature: '',
    mainHead: '',
    category: '',
    code: '',
    name: '',
    description: '',
    defaultGstRateId: '',
    isSubAccount: false,
    subAccountOf: null,
    allowPayments: false,
    openingBalance: '',
    balanceAsOf: '',
    status: 'Active',
    enabledOptions: {},
    isLocked: false,
    // Bank details fields
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    swiftCode: '',
    currency: '',
};

// --- Child Components for better structure ---

const SectionHeader = ({ title }) => (
    <Grid item xs={12} sx={{ mt: 2, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: '600', color: 'primary.main' }}>{title}</Typography>
        <Divider />
    </Grid>
);

const AccountHierarchyFields = ({ formData, setFormData, isViewMode, natureOptions, mainHeadOptions, categoryOptions }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'nature') {
                newState.mainHead = '';
                newState.category = '';
            } else if (name === 'mainHead') {
                newState.category = '';
            }
            return newState;
        });
    };

    return (
        <>
            <SectionHeader title="Account Classification" />
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={isViewMode} required>
                    <InputLabel>Nature *</InputLabel>
                    <Select name="nature" value={formData.nature} label="Nature *" onChange={handleChange}>
                        {natureOptions.map(nature => (<MenuItem key={nature} value={nature}>{nature}</MenuItem>))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={isViewMode || !formData.nature} required>
                    <InputLabel>Main Head *</InputLabel>
                    <Select name="mainHead" value={formData.mainHead} label="Main Head *" onChange={handleChange}>
                        {mainHeadOptions.map(head => (<MenuItem key={head} value={head}>{head}</MenuItem>))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" disabled={isViewMode || !formData.mainHead || categoryOptions.length === 0} required={categoryOptions.length > 0}>
                    <InputLabel>Category {categoryOptions.length > 0 ? "*" : ""}</InputLabel>
                    <Select name="category" value={formData.category} label={`Category ${categoryOptions.length > 0 ? "*" : ""}`} onChange={handleChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {categoryOptions.map(cat => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
                    </Select>
                </FormControl>
            </Grid>
        </>
    );
};

const DynamicOptions = ({ notes, options, formData, setFormData, isViewMode }) => {
    if ((!notes && options.length === 0) || !options) return null;

    const handleChange = (event) => {
        const { value } = event.target;
        setFormData(prev => ({
            ...prev,
            enabledOptions: { [value]: true }
        }));
    };

    const selectedValue = Object.keys(formData.enabledOptions).find(key => formData.enabledOptions[key] === true) || "";

    return (
        <Grid item xs={12} sx={{ my: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
           {notes && <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 1}}>{notes}</Typography>}
            <FormControl component="fieldset" disabled={isViewMode}>
                <RadioGroup row name="enabledOptions" value={selectedValue} onChange={handleChange}>
                    {options.map(option => (
                        <FormControlLabel key={option} value={option} control={<Radio size="small" />} label={option}/>
                    ))}
                </RadioGroup>
            </FormControl>
        </Grid>
    );
};


const BankAccountDetails = ({ formData, handleChange, isViewMode }) => (
    <>
        <SectionHeader title="Bank Account Details" />
        <Grid item xs={12} sm={6}>
            <TextField name="bankName" label="Bank Name" value={formData.bankName} onChange={handleChange} fullWidth size="small" disabled={isViewMode} />
        </Grid>
        <Grid item xs={12} sm={6}>
             <TextField name="accountNumber" label="Account Number" value={formData.accountNumber} onChange={handleChange} fullWidth size="small" disabled={isViewMode} />
        </Grid>
        <Grid item xs={12} sm={6}>
             <TextField name="ifscCode" label="IFSC Code" value={formData.ifscCode} onChange={handleChange} fullWidth size="small" disabled={isViewMode} />
        </Grid>
        <Grid item xs={12} sm={6}>
             <TextField name="swiftCode" label="SWIFT Code" value={formData.swiftCode} onChange={handleChange} fullWidth size="small" disabled={isViewMode} />
        </Grid>
        <Grid item xs={12} sm={6}>
             <TextField name="currency" label="Currency" value={formData.currency} onChange={handleChange} fullWidth size="small" disabled={isViewMode} />
        </Grid>
    </>
);


// --- Main Form Component ---

const ChartOfAccountsForm = ({ onSaveSuccess }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [parentAccounts, setParentAccounts] = useState([]);
    const [taxRateOptions, setTaxRateOptions] = useState([]);
    const [accountHierarchy, setAccountHierarchy] = useState([]);

    const [natureOptions, setNatureOptions] = useState([]);
    const [mainHeadOptions, setMainHeadOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [notes, setNotes] = useState('');
    const [dynamicEnableOptions, setDynamicEnableOptions] = useState([]);

    const { accountId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // --- Data Fetching ---
    const fetchClassifications = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/account-classifications`, { withCredentials: true });
            setAccountHierarchy(response.data || []);
        } catch (err) {
            console.error("Error fetching account classifications:", err);
            setError("Failed to load account classifications. Please try again.");
        }
    }, [API_BASE_URL]);


    const fetchTaxRateOptions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gst-rates?limit=-1`, { withCredentials: true });
            setTaxRateOptions(response.data?.data.map(rate => ({ value: rate._id, label: rate.taxName })) || []);
        } catch (err) {
            console.error("Error fetching Tax Rate options:", err);
        }
    }, [API_BASE_URL]);

    const fetchAccountData = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts/${id}`, { withCredentials: true });
            const fetched = response.data;
            if (fetched) {
                setFormData({
                    ...initialFormData,
                    ...fetched,
                    balanceAsOf: fetched.balanceAsOf ? new Date(fetched.balanceAsOf).toISOString().split('T')[0] : '',
                });
            } else {
                setError("Account not found.");
            }
        } catch (err) {
            setError(`Failed to load account data: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    const fetchParentAccounts = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts?limit=-1`, { withCredentials: true });
            let pAccounts = response.data?.data || [];
            if (accountId) {
                pAccounts = pAccounts.filter(acc => acc._id !== accountId);
            }
            setParentAccounts(pAccounts);
        } catch (err) {
            console.error("Error fetching parent accounts:", err);
        }
    }, [API_BASE_URL, accountId]);

    // --- Effects ---

    const { nature, mainHead, category } = formData;

    useEffect(() => {
        fetchClassifications();
    }, [fetchClassifications]);

    useEffect(() => {
        const natures = [...new Set(accountHierarchy.map(item => item.nature))];
        setNatureOptions(natures);
    }, [accountHierarchy]);

    useEffect(() => {
        const heads = nature ? [...new Set(accountHierarchy.filter(item => item.nature === nature).map(item => item.mainHead))].filter(Boolean) : [];
        setMainHeadOptions(heads);
    }, [nature, accountHierarchy]);

    useEffect(() => {
        const cats = mainHead ? [...new Set(accountHierarchy.filter(item => item.nature === nature && item.mainHead === mainHead).map(item => item.category))].filter(Boolean) : [];
        setCategoryOptions(cats);
    }, [nature, mainHead, accountHierarchy]);

    useEffect(() => {
        let entry = accountHierarchy.find(item =>
            item.nature === nature &&
            item.mainHead === mainHead &&
            (category ? item.category === category : !item.category)
        );
        setNotes(entry?.notes || '');
        setDynamicEnableOptions(entry?.enableOptions || []);
    }, [nature, mainHead, category, accountHierarchy]);

    useEffect(() => {
        if (category === 'Cash & Cash Equivalents') {
            if (!formData.allowPayments) {
                setFormData(prev => ({ ...prev, allowPayments: true }));
            }
        }
    }, [category, formData.allowPayments]);

    useEffect(() => {
        fetchTaxRateOptions();
        fetchParentAccounts();
        const viewMode = new URLSearchParams(location.search).get('view') === 'true';
        setIsViewMode(viewMode);

        if (accountId) {
            fetchAccountData(accountId);
        } else {
            setFormData(initialFormData);
        }
    }, [accountId, location.search, fetchAccountData, fetchParentAccounts, fetchTaxRateOptions]);

    // --- Handlers ---
    const handleChange = (event) => {
        if (isViewMode) return;
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isViewMode) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const hasCategories = categoryOptions.length > 0;
        if (!formData.nature || !formData.mainHead || (hasCategories && !formData.category) || !formData.code || !formData.name) {
            setError("Please fill all required fields marked with *.");
            setLoading(false);
            return;
        }

        const submissionData = { ...formData };
        if (!submissionData._id) delete submissionData._id;

        try {
            let response;
            if (formData._id) {
                response = await axios.put(`${API_BASE_URL}/api/chart-of-accounts/${formData._id}`, submissionData, { withCredentials: true });
                setSuccess("Account updated successfully!");
            } else {
                response = await axios.post(`${API_BASE_URL}/api/chart-of-accounts`, submissionData, { withCredentials: true });
                setSuccess("Account created successfully!");
                if (onSaveSuccess) onSaveSuccess(response.data.data);
                setFormData(initialFormData); // Reset form
            }
        } catch (err) {
            setError(`Failed to save account: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => { setSuccess(null); setError(null); }, 4000);
        }
    };

    const title = accountId ? (isViewMode ? "View Account" : "Edit Account") : "Add New Account";
    const paperStyle = { p: {xs: 2, sm: 3}, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none', width: '100%', maxWidth: '800px', margin: 'auto' };

    const textFieldProps = (name, label, required = false, otherProps = {}) => ({
        name,
        label: label + (required ? " *" : ""),
        value: formData[name] ?? '',
        onChange: handleChange,
        variant: "outlined",
        size: "small",
        fullWidth: true,
        disabled: isViewMode,
        required,
        ...otherProps,
    });

    const showBankDetails = formData.category === 'Cash & Cash Equivalents' && (formData.enabledOptions['Bank'] || formData.enabledOptions['Credit Card'] || formData.enabledOptions['Wallet']);
    const isCashEquivalent = formData.category === 'Cash & Cash Equivalents';


    if (loading && !accountId) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: {xs: 1, sm: 2, md: 3}, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: 'auto', background: 'transparent', boxShadow: 'none' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                <IconButton onClick={() => navigate('/account-transaction/chart-of-accounts')} aria-label="Back">
                    <ArrowBackIcon />
                </IconButton>
            </Paper>

            <Box sx={{ maxWidth: '800px', margin: 'auto' }}>
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
            </Box>

            <Paper sx={paperStyle}>
                <Grid container spacing={2.5}>
                    <AccountHierarchyFields
                        formData={formData}
                        setFormData={setFormData}
                        isViewMode={isViewMode}
                        natureOptions={natureOptions}
                        mainHeadOptions={mainHeadOptions}
                        categoryOptions={categoryOptions}
                    />

                    <DynamicOptions
                        notes={notes}
                        options={dynamicEnableOptions}
                        formData={formData}
                        setFormData={setFormData}
                        isViewMode={isViewMode}
                    />

                    <SectionHeader title="Account Details" />
                    <Grid item xs={12} sm={4}>
                        <TextField {...textFieldProps("code", "Account Code", true)} />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField {...textFieldProps("name", "Account Name", true)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField {...textFieldProps("description", "Description", false, { multiline: true, rows: 3 })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                       <FormControlLabel control={<Checkbox checked={formData.isSubAccount} onChange={handleChange} name="isSubAccount" disabled={isViewMode} />} label="This is a Sub-Account" />
                    </Grid>
                     {formData.isSubAccount && (
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" disabled={isViewMode} required={formData.isSubAccount}>
                                <InputLabel>Parent Account *</InputLabel>
                                <Select name="subAccountOf" value={formData.subAccountOf || ''} label="Parent Account *" onChange={handleChange}>
                                    {parentAccounts.map(acc => (<MenuItem key={acc._id} value={acc._id}>{`${acc.name} (${acc.code})`}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    {showBankDetails && (
                        <BankAccountDetails
                           formData={formData}
                           handleChange={handleChange}
                           isViewMode={isViewMode}
                        />
                    )}


                    <SectionHeader title="Financial Information" />
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" disabled={isViewMode}>
                            <InputLabel>Default Tax Rate</InputLabel>
                            <Select name="defaultGstRateId" value={formData.defaultGstRateId || ''} label="Default Tax Rate" onChange={handleChange}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {taxRateOptions.map(rate => (<MenuItem key={rate.value} value={rate.value}>{rate.label}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <TextField {...textFieldProps("openingBalance", "Opening Balance", false, { type: "number", InputProps: { startAdornment: <InputAdornment position="start">$</InputAdornment> } })} />
                    </Grid>

                    <SectionHeader title="Settings" />
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allowPayments}
                                    onChange={handleChange}
                                    name="allowPayments"
                                    disabled={isViewMode || isCashEquivalent}
                                />
                            }
                            label="Enable payments to this account"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel control={<Switch icon={<LockOpenIcon />} checkedIcon={<LockIcon />} checked={formData.isLocked} onChange={handleChange} name="isLocked" disabled={isViewMode} />} label="Lock this ledger" />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {isViewMode ? (
                        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => navigate(`/account-transaction/chart-of-accounts/edit/${accountId}`)}>
                            Edit
                        </Button>
                    ) : (
                        <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : (formData._id ? 'Update Account' : 'Save Account')}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ChartOfAccountsForm;