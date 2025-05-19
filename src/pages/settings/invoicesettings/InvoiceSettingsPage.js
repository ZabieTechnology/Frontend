// src/pages/invoicesettings/InvoiceSettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Switch,
    FormControlLabel,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Checkbox,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Image as ImageIcon,
    ColorLens as ColorLensIcon,
    ViewQuilt as ViewQuiltIcon,
    ListAlt as ListAltIcon,
    AccountBalance as AccountBalanceIcon,
    Description as DescriptionIcon,
    EditNote as EditNoteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Updated import path for InvoicePreview
import InvoicePreview from './InvoicePreview'; // <<< Assuming it's in the same directory

// --- Initial State Definitions ---
const initialInvoiceSettings = {
    _id: null,
    activeThemeName: "Modern",
    selectedColor: "#4CAF50",
    itemTableColumns: {
        pricePerItem: true,
        quantity: true,
        batchNo: false,
        expDate: false,
        mfgDate: false,
        discountPerItem: false,
        taxPerItem: true,
        hsnSacCode: true,
        serialNo: false,
    },
    customItemColumns: [],
    bankAccountId: '',
    termsAndConditionsId: '',
    signatureImageFile: null,
    signatureImageUrl: '',
    enableReceiverSignature: false,
    notesDefault: "Thank you for your business!",
    companyLogoUrl: "/images/default_logo.png",
};

const themes = [
    { name: "Modern", previewImage: "/images/themes/001-bank.png" },
    { name: "Stylish", previewImage: "/images/themes/002-online banking.png" },
    { name: "Advanced GST (Tally)", previewImage: "/images/themes/004-receptionist.png" },
    { name: "Billbook", previewImage: "/images/themes/017-money.png" },
    { name: "Advanced GST (A)", previewImage: "/images/themes/019-currency.png" },
    { name: "Billbook (A)", previewImage: "/images/themes/023-cut card.png" },
    { name: "Simple", previewImage: "/images/themes/038-tax.png" },
];

const colorPalette = [
    '#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', '#009688', '#795548', '#000000'
];

const InvoiceSettingsPage = () => {
    const [settings, setSettings] = useState(initialInvoiceSettings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [companyDetails, setCompanyDetails] = useState({
        name: "Your Company Name",
        address: "123 Main St, Anytown, USA",
        mobile: "555-1234",
        logoUrl: settings.companyLogoUrl
    });

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchInvoiceSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/invoice-settings`, { withCredentials: true });
            if (response.data && response.data._id) {
                const fetchedSettings = {
                    ...initialInvoiceSettings,
                    ...response.data,
                    itemTableColumns: {
                        ...initialInvoiceSettings.itemTableColumns,
                        ...(response.data.itemTableColumns || {}),
                    },
                    customItemColumns: Array.isArray(response.data.customItemColumns) ? response.data.customItemColumns : [],
                    signatureImageFile: null,
                };
                setSettings(fetchedSettings);
                if (fetchedSettings.signatureImageUrl) {
                    setSignaturePreview(fetchedSettings.signatureImageUrl.startsWith('http') ? fetchedSettings.signatureImageUrl : `${API_BASE_URL}/uploads/signatures/${fetchedSettings.signatureImageUrl}`);
                }
                setCompanyDetails(prev => ({...prev, logoUrl: fetchedSettings.companyLogoUrl || "/images/default_logo.png"}));
            } else {
                setSettings(initialInvoiceSettings);
                setCompanyDetails(prev => ({...prev, logoUrl: initialInvoiceSettings.companyLogoUrl}));
            }
        } catch (err) {
            console.error("Error fetching invoice settings:", err);
            setError(`Failed to load settings: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchInvoiceSettings();
        // TODO: Fetch actual company details if they are stored separately
    }, [fetchInvoiceSettings]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value,
        }));
    };

    const handleItemTableColumnChange = (event) => {
        const { name, checked } = event.target;
        setSettings(prev => ({
            ...prev,
            itemTableColumns: {
                ...prev.itemTableColumns,
                [name]: checked,
            },
        }));
    };

    const handleSignatureUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSettings(prev => ({ ...prev, signatureImageFile: file, signatureImageUrl: '' }));
            setSignaturePreview(URL.createObjectURL(file));
        }
    };

    const handleAddCustomColumn = () => {
        const columnName = prompt("Enter custom column name (e.g., Serial No):");
        if (columnName) {
            setSettings(prev => ({
                ...prev,
                customItemColumns: [
                    ...prev.customItemColumns,
                    { id: `custom_${Date.now()}`, name: columnName, enabled: true }
                ]
            }));
        }
    };

    const handleCustomColumnChange = (index, event) => {
        const { name, value, checked, type } = event.target; // Correctly destructure 'name' from event.target
        const newCustomColumns = [...settings.customItemColumns];
    
        // 'name' from event.target will be the property of the input field that changed,
        // e.g., 'name' for the TextField (column's display name) or 'enabled' for the Checkbox.
        if (name === "enabled") { 
             newCustomColumns[index] = { ...newCustomColumns[index], enabled: checked };
        } else if (name === "name") { // Assuming the TextField for column name has name="name"
             newCustomColumns[index] = { ...newCustomColumns[index], name: value };
        }
        setSettings(prev => ({ ...prev, customItemColumns: newCustomColumns }));
    };
    

     const handleRemoveCustomColumn = (indexToRemove) => {
        setSettings(prev => ({
            ...prev,
            customItemColumns: prev.customItemColumns.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            if (key === 'signatureImageFile' || key === 'itemTableColumns' || key === 'customItemColumns' || key === '_id' || key === 'companyLogoUrl') return;
            if (typeof value === 'boolean') {
                payload.append(key, value.toString());
            } else if (value !== null && value !== undefined) {
                payload.append(key, value);
            }
        });
        payload.append('itemTableColumns', JSON.stringify(settings.itemTableColumns));
        payload.append('customItemColumns', JSON.stringify(settings.customItemColumns));

        if (settings.signatureImageFile instanceof File) {
            payload.append('signatureImage', settings.signatureImageFile, settings.signatureImageFile.name);
        } else if (settings.signatureImageUrl) {
             payload.append('signatureImageUrl', settings.signatureImageUrl);
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/invoice-settings`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            setSuccess("Invoice settings saved successfully!");
            if (response.data && response.data.data) {
                 const savedSettings = response.data.data;
                 setSettings(prev => ({
                    ...prev,
                    ...savedSettings,
                    itemTableColumns: { ...initialInvoiceSettings.itemTableColumns, ...(savedSettings.itemTableColumns || {}) },
                    customItemColumns: Array.isArray(savedSettings.customItemColumns) ? savedSettings.customItemColumns : [],
                    signatureImageFile: null,
                    signatureImageUrl: savedSettings.signatureImageUrl || prev.signatureImageUrl,
                 }));
                 if (savedSettings.signatureImageUrl) {
                    setSignaturePreview(savedSettings.signatureImageUrl.startsWith('http') ? savedSettings.signatureImageUrl : `${API_BASE_URL}/uploads/signatures/${savedSettings.signatureImageUrl}`);
                 }
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving invoice settings:", err);
            setError(`Failed to save settings: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !settings._id) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    Invoice Settings &amp; Customization
                </Typography>
                <IconButton onClick={() => navigate(-1)} aria-label="go back">
                    <ArrowBackIcon />
                </IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Left Column: Settings & Configuration */}
                <Grid item xs={12} md={5} lg={4}>
                    <Paper elevation={2} sx={{ p: 2.5, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom><ViewQuiltIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Themes</Typography>
                        <Grid container spacing={1.5} sx={{mb: 2}}>
                            {themes.map(theme => (
                                <Grid item xs={6} sm={4} key={theme.name}>
                                    <Paper
                                        variant="outlined"
                                        onClick={() => setSettings(s => ({ ...s, activeThemeName: theme.name }))}
                                        sx={{
                                            p: 1, textAlign: 'center', cursor: 'pointer',
                                            border: settings.activeThemeName === theme.name ? `2px solid ${settings.selectedColor || theme.palette.primary.main}` : '1px solid #ddd',
                                            '&:hover': { boxShadow: 3 }
                                        }}
                                    >
                                        <Box component="img" src={process.env.PUBLIC_URL + theme.previewImage} alt={theme.name} sx={{ width: '100%', height: 'auto', maxHeight: 80, objectFit: 'contain', mb: 0.5, bgcolor: '#f0f0f0' }} />
                                        <Typography variant="caption">{theme.name}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom><ColorLensIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Select Color</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {colorPalette.map(color => (
                                <Tooltip title={color} key={color}>
                                    <Box
                                        onClick={() => setSettings(s => ({ ...s, selectedColor: color }))}
                                        sx={{
                                            width: 30, height: 30, borderRadius: '50%', backgroundColor: color, cursor: 'pointer',
                                            border: settings.selectedColor === color ? '3px solid white' : `1px solid ${color}`,
                                            boxShadow: settings.selectedColor === color ? `0 0 0 2px ${color}` : 'none',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': { transform: 'scale(1.1)'}
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                        <TextField
                            label="Custom Color (Hex)"
                            name="selectedColor"
                            value={settings.selectedColor}
                            onChange={handleChange}
                            size="small"
                            fullWidth
                            sx={{mb:2}}
                            InputProps={{startAdornment: <InputAdornment position="start">#</InputAdornment>}}
                        />
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom><ListAltIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Item Table Columns</Typography>
                        <Grid container spacing={0.5}>
                            {Object.entries(settings.itemTableColumns).map(([key, value]) => (
                                <Grid item xs={6} key={key}>
                                    <FormControlLabel
                                        control={<Checkbox checked={!!value} onChange={handleItemTableColumnChange} name={key} size="small"/>}
                                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Typography variant="subtitle2" sx={{mt:1.5, mb:1}}>Custom Columns:</Typography>
                        {settings.customItemColumns.map((col, index) => (
                             <Box key={col.id || index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <TextField
                                    name="name" // This should target the name property of the custom column object
                                    label={`Col. ${index + 1} Name`}
                                    value={col.name}
                                    onChange={(e) => handleCustomColumnChange(index, e)}
                                    size="small"
                                    variant="standard"
                                    sx={{flexGrow:1}}
                                />
                                <FormControlLabel control={<Checkbox name="enabled" checked={!!col.enabled} onChange={(e) => handleCustomColumnChange(index, e)} size="small"/>} label="Show" sx={{fontSize: '0.8rem'}}/>
                                <IconButton size="small" onClick={() => handleRemoveCustomColumn(index)} color="error"><DeleteIcon fontSize="inherit"/></IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<AddIcon />} onClick={handleAddCustomColumn} sx={{mt:1}}>Add Custom Column</Button>
                        <Divider sx={{ my: 2 }} />

                        <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography><DescriptionIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Miscellaneous Details</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Bank Account (for Invoice)</InputLabel>
                                    <Select name="bankAccountId" value={settings.bankAccountId} label="Bank Account (for Invoice)" onChange={handleChange}>
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        <MenuItem value="bank1">Bank ABC - XX1234</MenuItem>
                                        <MenuItem value="bank2">Bank XYZ - XX5678</MenuItem>
                                    </Select>
                                </FormControl>
                                 <TextField
                                    name="termsAndConditionsId"
                                    label="Terms and Conditions"
                                    value={settings.termsAndConditionsId}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    size="small"
                                    placeholder="Enter default terms or select a predefined set"
                                />
                                 <TextField
                                    name="notesDefault"
                                    label="Default Notes (on Invoice)"
                                    value={settings.notesDefault}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    size="small"
                                />
                            </AccordionDetails>
                        </Accordion>
                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom><EditNoteIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Signature</Typography>
                        <Button variant="outlined" component="label" startIcon={<ImageIcon />} size="small" sx={{mb:1}}>
                            Upload Signature
                            <input type="file" hidden onChange={handleSignatureUpload} accept="image/png, image/jpeg" />
                        </Button>
                        {signaturePreview && (
                            <Avatar src={signaturePreview} alt="Signature Preview" variant="rounded" sx={{ width: 150, height: 60, mb: 1, border: '1px solid #ddd', objectFit: 'contain' }}/>
                        )}
                        <FormControlLabel
                            control={<Switch checked={settings.enableReceiverSignature} onChange={handleChange} name="enableReceiverSignature" />}
                            label="Enable receiver's signature field on invoice"
                        />
                    </Paper>
                </Grid>

                {/* Right Column: Live Invoice Preview */}
                <Grid item xs={12} md={7} lg={8}>
                    <Paper elevation={2} sx={{ p: 2.5, height: 'calc(100vh - 120px)', position: 'sticky', top: '20px', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom align="center">Live Invoice Preview</Typography>
                        <Box sx={{ border: '1px solid #ddd', minHeight: 'calc(100% - 40px)', backgroundColor: '#fff' }}>
                           <InvoicePreview settings={settings} companyDetails={companyDetails} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : "Save Invoice Settings"}
                </Button>
            </Box>
        </Box>
    );
};

export default InvoiceSettingsPage;
