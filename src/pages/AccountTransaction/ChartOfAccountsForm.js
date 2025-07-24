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
    Checkbox,
    FormControlLabel,
    Divider,
    InputAdornment,
    FormGroup,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// This data could be moved to a separate config file or fetched from an API
const accountHierarchy = [
    // Assets
    { nature: 'Assets', mainHead: 'Current Asset', category: 'Cash & Cash Equivalents', enableOptions: ['Cash', 'Bank', 'Credit Card', 'Wallet', 'Cheque-in-transit'] },
    { nature: 'Assets', mainHead: 'Current Asset', category: 'Current Investments'},
    { nature: 'Assets', mainHead: 'Current Asset', category: 'Inventories', enableOptions: ['Raw Material', 'Work-In-Progress', 'Finished Goods'] },
    { nature: 'Assets', mainHead: 'Current Asset', category: 'Other Current assets'},
    { nature: 'Assets', mainHead: 'Current Asset', category: 'Short term loans and advances'},
    { nature: 'Assets', mainHead: 'Current Asset', category: 'Trade receivables'},
    { nature: 'Assets', mainHead: 'Fixed Asset', category: 'Accumulated Depreciation'},
    { nature: 'Assets', mainHead: 'Fixed Asset', category: 'Acquistion Cost'},
    { nature: 'Assets', mainHead: 'Non-Current Asset', category: 'Deferred tax asset (net)'},
    { nature: 'Assets', mainHead: 'Non-Current Asset', category: 'Long term loans and advances'},
    { nature: 'Assets', mainHead: 'Non-Current Asset', category: 'Non-current Investments'},
    { nature: 'Assets', mainHead: 'Non-Current Asset', category: 'Other Non-current Assets'},
    // Expense
    { nature: 'Expense', mainHead: 'Direct Expense', category: null },
    { nature: 'Expense', mainHead: 'Indirect Expense', category: 'Depreciation' },
    { nature: 'Expense', mainHead: 'Indirect Expense', category: 'Amortisation'},
    { nature: 'Expense', mainHead: 'Indirect Expense', category: 'Employee Benefit Expenses'},
    { nature: 'Expense', mainHead: 'Indirect Expense', category: 'Finance Cost'},
    { nature: 'Expense', mainHead: 'Indirect Expense', category: 'Other expenses'},
    { nature: 'Expense', mainHead: 'Indirect Expense', category: 'Tax Expense'},
    { nature: 'Expense', mainHead: 'Purchases', category: 'Purchase of Finished Goods' },
    { nature: 'Expense', mainHead: 'Purchases', category: 'Purchase of Raw Material' },
    { nature: 'Expense', mainHead: 'Purchases', category: 'Purchase of Work-in-progress' },
    // Income
    { nature: 'Income', mainHead: 'Direct Income', category: null },
    { nature: 'Income', mainHead: 'Indirect Income', category: 'Interest Income' },
    { nature: 'Income', mainHead: 'Indirect Income', category: 'Others' },
    // Equity
    { nature: 'Equity', mainHead: 'Reserves & Surplus', category: 'Retained Earnings'},
    { nature: 'Equity', mainHead: 'Reserves & Surplus', category: 'Accumulated Earnings'},
    { nature: 'Equity', mainHead: 'Reserves & Surplus', category: 'Current period earnings'},
    { nature: 'Equity', mainHead: 'Share Capital', category: null },
    // Liability
    { nature: 'Liability', mainHead: 'Current Liability', category: 'Other Current Liability (Duties & Taxes)', enableOptions: ['GST', 'TDS', 'Income Tax', 'ESIC', 'EPF'] },
    { nature: 'Liability', mainHead: 'Current Liability', category: 'Other Current Liability (Others)'},
    { nature: 'Liability', mainHead: 'Current Liability', category: 'Short term Borrowings', enableOptions: ['Loan'] },
    { nature: 'Liability', mainHead: 'Current Liability', category: 'Short term provision'},
    { nature: 'Liability', mainHead: 'Current Liability', category: 'Trade Payables'},
    { nature: 'Liability', mainHead: 'Non-Current Liability', category: 'Deferred tax liability (net)'},
    { nature: 'Liability', mainHead: 'Non-Current Liability', category: 'Long term Borrowings', enableOptions: ['Loan'] },
    { nature: 'Liability', mainHead: 'Non-Current Liability', category: 'Other Long term liability'},
    { nature: 'Liability', mainHead: 'Non-Current Liability', category: 'Other Long term Provision'},
];

const natureOptions = [...new Set(accountHierarchy.map(item => item.nature))];

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
};

// --- Child Components for better structure ---

const SectionHeader = ({ title }) => (
    <Grid item xs={12} sx={{ mt: 2, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: '600', color: 'primary.main' }}>{title}</Typography>
        <Divider />
    </Grid>
);

const AccountHierarchyFields = ({ formData, setFormData, isViewMode, mainHeadOptions, categoryOptions }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // When nature changes, reset mainHead and category
            if (name === 'nature') {
                newState.mainHead = '';
                newState.category = '';
            } else if (name === 'mainHead') {
                // When mainHead changes, reset category
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
     if (!notes && options.length === 0) return null;

     const handleEnabledOptionsChange = (event) => {
        const { name, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            enabledOptions: { ...prev.enabledOptions, [name]: checked }
        }));
    };

    return (
        <Grid item xs={12} sx={{ my: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafafa' }}>
           {notes && <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 1}}>{notes}</Typography>}
           {options.length > 0 && (
                <FormGroup row>
                    {options.map(option => (
                        <FormControlLabel
                            key={option}
                            control={<Checkbox checked={!!formData.enabledOptions[option]} onChange={handleEnabledOptionsChange} name={option} size="small" />}
                            label={option}
                            disabled={isViewMode}
                        />
                    ))}
                </FormGroup>
           )}
        </Grid>
    );
}

// --- Main Form Component ---

const ChartOfAccountsForm = ({ onSaveSuccess }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [parentAccounts, setParentAccounts] = useState([]);
    const [taxRateOptions, setTaxRateOptions] = useState([]);

    const [mainHeadOptions, setMainHeadOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [notes, setNotes] = useState('');
    const [dynamicEnableOptions, setDynamicEnableOptions] = useState([]);

    const { accountId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // --- Data Fetching ---
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

    // Destructure properties from formData to satisfy exhaustive-deps lint rule
    const { nature, mainHead, category } = formData;

    useEffect(() => {
        const heads = nature ? [...new Set(accountHierarchy.filter(item => item.nature === nature).map(item => item.mainHead))] : [];
        setMainHeadOptions(heads);
    }, [nature]);

    useEffect(() => {
        const cats = mainHead ? [...new Set(accountHierarchy.filter(item => item.nature === nature && item.mainHead === mainHead).map(item => item.category))].filter(Boolean) : [];
        setCategoryOptions(cats);
    }, [nature, mainHead]);

    useEffect(() => {
        let entry = accountHierarchy.find(item =>
            item.nature === nature &&
            item.mainHead === mainHead &&
            (category ? item.category === category : !item.category)
        );
        setNotes(entry?.notes || '');
        setDynamicEnableOptions(entry?.enableOptions || []);
    }, [nature, mainHead, category]);

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
                        <FormControlLabel control={<Switch checked={formData.allowPayments} onChange={handleChange} name="allowPayments" disabled={isViewMode} />} label="Enable payments to this account" />
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
