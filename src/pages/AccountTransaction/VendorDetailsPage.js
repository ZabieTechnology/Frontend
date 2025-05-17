import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Paper,
    TextField,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment, // <<< Added InputAdornment
    MenuItem,       // <<< Added MenuItem
    // Add any other MUI components you might need, like Select
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// Define initial empty state for the form
const initialFormData = {
    _id: null, // For edit mode
    gstNo: '',
    vendorName: '', // Changed from companyName to be more specific
    displayName: '',
    primaryContact: {
        name: '',
        contact: '', // Mobile number
        email: '',
    },
    website: '',
    pan: '',
    creditLimit: '', // Note: This was a TextField, ensure it's handled as a number if needed
    billingAddress: '',
    deliveryAddress: '',
    sameAsBilling: false, // UI helper
    birthday: '', // Consider using a date picker
    note: '',
    financialDetails: { // Assuming similar structure to customer
        bankAccountName: '',
        accountNo: '',
        ifscCode: '',
        swiftCode: '',
        currency: 'INR', // Default currency
    },
    // Add any other fields specific to vendors
};

const VendorDetailsPage = ({ onSaveSuccess }) => { // Prop for callback after save
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const { vendorId } = useParams(); // Get vendorId from URL if present
    const location = useLocation();
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // --- Fetch vendor data if in edit/view mode ---
    const fetchVendorData = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/vendors/${id}`, { withCredentials: true });
            if (response.data) {
                const fetched = response.data;
                setFormData({
                    ...initialFormData, // Start with defaults
                    ...fetched,
                    _id: fetched._id,
                    primaryContact: { ...initialFormData.primaryContact, ...fetched.primaryContact },
                    financialDetails: { ...initialFormData.financialDetails, ...fetched.financialDetails },
                    birthday: fetched.birthday ? new Date(fetched.birthday).toISOString().split('T')[0] : '',
                    sameAsBilling: fetched.billingAddress === fetched.deliveryAddress && fetched.billingAddress !== '',
                });
            } else {
                setError("Vendor not found.");
                setFormData(initialFormData);
            }
        } catch (err) {
            console.error("Error fetching vendor data:", err);
            setError(`Failed to load vendor data: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const viewMode = queryParams.get('view') === 'true';
        setIsViewMode(viewMode);

        if (vendorId) {
            fetchVendorData(vendorId);
        } else {
            setFormData(initialFormData);
            if (viewMode) setIsViewMode(false);
        }
    }, [vendorId, location.search, fetchVendorData]);


    // --- Handlers ---
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
                [name]: type === 'checkbox' ? checked : value,
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

    // --- Form Submission ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isViewMode) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.displayName) { // Example basic validation
            setError("Display Name is required.");
            setLoading(false);
            setTimeout(() => setError(null), 5000);
            return;
        }

        const submissionData = { ...formData };
        if (!submissionData._id) {
            delete submissionData._id;
        }
        if (submissionData.creditLimit) { // Ensure numeric
            submissionData.creditLimit = parseFloat(submissionData.creditLimit) || 0;
        }


        try {
            let response;
            if (formData._id) { // Edit mode
                response = await axios.put(`${API_BASE_URL}/api/vendors/${formData._id}`, submissionData, { withCredentials: true });
                setSuccess("Vendor updated successfully!");
            } else { // Create mode
                response = await axios.post(`${API_BASE_URL}/api/vendors`, submissionData, { withCredentials: true });
                setSuccess("Vendor created successfully!");
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
                    sameAsBilling: savedData.billingAddress === savedData.deliveryAddress && savedData.billingAddress !== '',
                });
                if (onSaveSuccess) onSaveSuccess(savedData);
                if (!formData._id) {
                    // Optionally navigate back to vendor list or clear form further
                    // navigate('/account-transaction/vendor');
                }
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving vendor:", err);
            setError(`Failed to save vendor: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const title = vendorId ? (isViewMode ? "View Vendor Details" : "Edit Vendor") : "Add New Vendor";

    // Common styling for section Paper
    const sectionPaperStyle = {
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        boxShadow: 'none'
    };

    // Common styling for TextFields
    const textFieldProps = (name, label, required = false, otherProps = {}) => ({
        name: name,
        label: label + (required ? " *" : ""),
        value: name.includes('.') ? formData[name.split('.')[0]][name.split('.')[1]] : formData[name],
        onChange: handleChange,
        variant: "outlined",
        size: "small",
        fullWidth: true,
        sx: { mb: 1.5 },
        disabled: isViewMode,
        required: required,
        ...otherProps, // Spread other props like type, InputProps, select, children
    });

    const sectionTitleStyle = { fontWeight: 'bold', mb: 2.5, color: 'text.secondary' };
    const labelStyle = { mb: 0.5, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' };
    // const buttonStyle = { textTransform: 'none', fontWeight: 'bold', mt: 1 }; // Not used directly anymore
    const contentWrapperStyle = { flexGrow: 1, display: 'flex', flexDirection: 'column' };

    if (loading && !formData._id && !vendorId) { // Show loading indicator only for initial fetch in edit/view
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{title}</Typography>
                <IconButton onClick={() => navigate('/account-transaction/vendor')} aria-label="back to vendor list">
                    <ArrowBackIcon />
                </IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {/* Column 1: Vendor Details */}
                <Grid item xs={12} md={4}>
                    <Paper sx={sectionPaperStyle}>
                        <Box sx={contentWrapperStyle}>
                            <Typography variant="h6" sx={sectionTitleStyle}>Vendor Details</Typography>
                            <Typography sx={labelStyle}>GST No.</Typography>
                            <TextField {...textFieldProps("gstNo", "GST No.")} />
                            <Typography sx={labelStyle}>Vendor Name</Typography>
                            <TextField {...textFieldProps("vendorName", "Vendor Name")} />
                            <Typography sx={labelStyle}>Display Name *</Typography>
                            <TextField {...textFieldProps("displayName", "Display Name", true)} />

                            <Typography sx={{ ...labelStyle, mt: 2, fontWeight: 'bold' }}>Primary Contact</Typography>
                            <Typography sx={labelStyle}>Name</Typography>
                            <TextField {...textFieldProps("primaryContact.name", "Name")} />
                            <Typography sx={labelStyle}>Contact</Typography>
                            <TextField {...textFieldProps("primaryContact.contact", "Contact", false, { type: "tel" })} />
                            <Typography sx={labelStyle}>E-mail</Typography>
                            <TextField {...textFieldProps("primaryContact.email", "E-mail", false, { type: "email" })} />
                            <Box sx={{ flexGrow: 1 }} />
                            <Typography sx={labelStyle}>Website</Typography>
                            <TextField {...textFieldProps("website", "Website")} />
                            <Typography sx={labelStyle}>PAN</Typography>
                            <TextField {...textFieldProps("pan", "PAN")} />
                            <Typography sx={labelStyle}>Credit Limit</Typography>
                            <TextField {...textFieldProps("creditLimit", "Credit Limit", false, { type: "number", InputProps: { startAdornment: <InputAdornment position="start">$</InputAdornment> } })}/>
                        </Box>
                    </Paper>
                </Grid>

                {/* Column 2: Address & Others */}
                <Grid item xs={12} md={4}>
                   <Paper sx={sectionPaperStyle}>
                        <Box sx={contentWrapperStyle}>
                            <Typography variant="h6" sx={sectionTitleStyle}>Address</Typography>
                            <Typography sx={labelStyle}>Billing address</Typography>
                            <TextField {...textFieldProps("billingAddress", "Billing Address", false, { multiline: true, rows: 3 })} />
                            <Typography sx={labelStyle}>Delivery address</Typography>
                            <FormControlLabel
                                control={<Checkbox name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleSameAsBillingChange} size="small" sx={{p:0, mr: 0.5}} disabled={isViewMode}/>}
                                label="Same as billing address"
                                sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                            />
                            {!formData.sameAsBilling && (
                                <TextField {...textFieldProps("deliveryAddress", "Delivery Address", !formData.sameAsBilling, { multiline: true, rows: 3 })} />
                            )}
                            <Divider sx={{my: 2.5}}/>
                            <Typography variant="h6" sx={{ ...sectionTitleStyle, mb: 1.5 }}>Others</Typography>
                            <Typography sx={labelStyle}>Birthday</Typography>
                            <TextField {...textFieldProps("birthday", "Birthday", false, { type: "date", InputLabelProps: { shrink: true } })} />
                             <Box sx={{ flexGrow: 1 }} />
                            <Typography sx={{...labelStyle, mt: 2}}>Note</Typography>
                            <TextField {...textFieldProps("note", "Note", false, { multiline: true, rows: 4, placeholder: "Add notes here..." })} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Column 3: Financial Details */}
                <Grid item xs={12} md={4}>
                   <Paper sx={sectionPaperStyle}>
                        <Box sx={contentWrapperStyle}>
                            <Typography variant="h6" sx={sectionTitleStyle}>Financial Details</Typography>
                            <Typography sx={labelStyle}>Bank account name</Typography>
                            <TextField {...textFieldProps("financialDetails.bankAccountName", "Bank Account Name")} />
                            <Typography sx={labelStyle}>Account No</Typography>
                            <TextField {...textFieldProps("financialDetails.accountNo", "Account No")} />
                            <Typography sx={labelStyle}>IFSC Code</Typography>
                            <TextField {...textFieldProps("financialDetails.ifscCode", "IFSC Code")} />
                            <Typography sx={labelStyle}>SWIFT Code</Typography>
                            <TextField {...textFieldProps("financialDetails.swiftCode", "SWIFT Code")} />
                            <Typography sx={labelStyle}>Currency</Typography>
                            <TextField 
                                {...textFieldProps("financialDetails.currency", "Currency", false, { select: true, defaultValue: "INR" })}
                            >
                                <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                                <MenuItem value="USD">USD - US Dollar</MenuItem>
                                {/* Add other currencies as needed */}
                            </TextField>
                        </Box>
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
                    onClick={() => navigate(`/account-transaction/vendor/edit/${vendorId}`)} // Navigate to edit mode
                >
                    Edit Vendor
                </Button>
                ) : (
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Vendor' : 'Save Vendor')}
                </Button>
                )}
            </Box>
        </Box>
    );
};

export default VendorDetailsPage;
