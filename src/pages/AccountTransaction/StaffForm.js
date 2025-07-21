import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Grid,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    ThemeProvider,
    createTheme,
    CssBaseline
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// --- Import actual dependencies in your project ---
// import axios from 'axios';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';

// --- Placeholder functions for demonstration without real dependencies ---
// In your actual project, you will get these from 'react-router-dom'
const useParams = () => ({ staffId: null }); // Default to null for "Add New"
const useLocation = () => ({ search: '' });
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

// In your actual project, you will use the real axios library
const axios = {
    get: (url) => new Promise((_, reject) => reject(new Error(`Axios GET request to ${url} requires a real implementation.`))),
    post: (url, data) => {
         console.log(`[AXIOS MOCK] POST: ${url}`, data);
         return new Promise(resolve => setTimeout(() => resolve({
             data: {
                 message: "Staff member created successfully!",
                 data: { ...data, _id: `new-mock-id-${Date.now()}` }
             }
         }), 1000));
    },
    put: (url, data) => {
         console.log(`[AXIOS MOCK] PUT: ${url}`, data);
         return new Promise(resolve => setTimeout(() => resolve({
             data: {
                 message: "Staff member updated successfully!",
                 data: data
             }
         }), 1000));
    }
};


// --- Main StaffForm Component ---

const initialFormData = {
    _id: null,
    firstName: '',
    lastName: '',
    employeeId: '',
    mobile: '',
    email: '',
    joiningDate: '',
    designation: '',
    department: '',
    reimbursementClaimEnabled: false,
    isSalesAgent: false,
    notes: '',
    customFields: [],
};

const StaffForm = ({ onSaveSuccess }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const { staffId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Set your actual API base URL here
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchStaffData = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/staff/${id}`);
            if (response.data) {
                const fetched = response.data;
                setFormData({
                    ...initialFormData,
                    ...fetched,
                    _id: fetched._id,
                    joiningDate: fetched.joiningDate ? new Date(fetched.joiningDate).toISOString().split('T')[0] : '',
                    designation: fetched.designation || '',
                    department: fetched.department || '',
                    reimbursementClaimEnabled: !!fetched.reimbursementClaimEnabled,
                    isSalesAgent: !!fetched.isSalesAgent,
                    notes: fetched.notes || '',
                    customFields: Array.isArray(fetched.customFields) ? fetched.customFields : [],
                });
            } else {
                setError("Staff member not found.");
                setFormData(initialFormData);
            }
        } catch (err) {
            console.error("Error fetching staff data:", err);
            setError(`Failed to load staff data: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const viewMode = queryParams.get('view') === 'true';
        setIsViewMode(viewMode);

        if (staffId) {
            fetchStaffData(staffId);
        } else {
            // Ensure form is reset for 'Add New' mode
            setFormData(initialFormData);
            if (viewMode) {
                // Cannot be in view mode when creating a new staff member
                setIsViewMode(false);
            }
        }
    }, [staffId, location.search, fetchStaffData]);

    const handleChange = (event) => {
        if (isViewMode) return;
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value,
        }));
    };

    const handleCustomFieldChange = (index, event) => {
        if (isViewMode) return;
        const { value } = event.target;
        const updatedCustomFields = formData.customFields.map((fieldValue, i) =>
            i === index ? value : fieldValue
        );
        setFormData((prev) => ({ ...prev, customFields: updatedCustomFields }));
    };

    const handleAddCustomField = () => {
        if (isViewMode) return;
        setFormData((prev) => ({
            ...prev,
            customFields: [...prev.customFields, ''],
        }));
    };

    const handleRemoveCustomField = (index) => {
        if (isViewMode) return;
        const updatedCustomFields = formData.customFields.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, customFields: updatedCustomFields }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isViewMode) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.firstName || !formData.lastName) {
            setError("First Name and Last Name are required.");
            setLoading(false);
            setTimeout(() => setError(null), 5000);
            return;
        }

        const submissionData = {
            ...formData,
            reimbursementClaimEnabled: !!formData.reimbursementClaimEnabled,
            isSalesAgent: !!formData.isSalesAgent,
            customFields: formData.customFields.filter(field => typeof field === 'string' && field.trim() !== ''),
        };

        if (!submissionData._id) {
            delete submissionData._id;
        }

        try {
            let response;
            if (formData._id) {
                response = await axios.put(`${API_BASE_URL}/api/staff/${formData._id}`, submissionData);
                setSuccess("Staff member updated successfully!");
            } else {
                response = await axios.post(`${API_BASE_URL}/api/staff`, submissionData);
                setSuccess("Staff member created successfully!");
            }

            if (response.data && response.data.data) {
                const savedData = response.data.data;
                setFormData({
                    ...initialFormData,
                    ...savedData,
                    _id: savedData._id,
                    joiningDate: savedData.joiningDate ? new Date(savedData.joiningDate).toISOString().split('T')[0] : '',
                    designation: savedData.designation || '',
                    department: savedData.department || '',
                    reimbursementClaimEnabled: !!savedData.reimbursementClaimEnabled,
                    isSalesAgent: !!savedData.isSalesAgent,
                    notes: savedData.notes || '',
                    customFields: Array.isArray(savedData.customFields) ? savedData.customFields : [],
                });
                if (onSaveSuccess) onSaveSuccess(savedData);
                // On successful creation, you might want to navigate to the edit page
                if (!formData._id && savedData._id) {
                    navigate(`/account-transaction/staff/edit/${savedData._id}`);
                }
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving staff member:", err);
            setError(`Failed to save staff: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const title = staffId ? (isViewMode ? "View Staff Details" : "Edit Staff Member") : "Add New Staff Member";

    const formPaperStyle = {
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        width: '100%',
        maxWidth: '700px',
        margin: 'auto',
    };

    const textFieldProps = (name, label, required = false, otherProps = {}) => ({
        name: name,
        label: label + (required ? " *" : ""),
        value: formData[name] || '',
        onChange: handleChange,
        variant: "outlined",
        size: "small",
        fullWidth: true,
        sx: { mb: 2 },
        disabled: isViewMode,
        required: required,
        ...otherProps,
    });

    if (loading && !formData._id && !staffId) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '700px',
                    margin: 'auto auto 24px auto',
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid #ddd',
                }}
            >
                <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold' }}>{title}</Typography>
                <IconButton onClick={() => navigate('/account-transaction/staff')} aria-label="back to staff list" title="Back to staff list">
                    <ArrowBackIcon />
                </IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, maxWidth: '700px', margin: 'auto auto 16px auto' }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, maxWidth: '700px', margin: 'auto auto 16px auto' }}>{success}</Alert>}

            <Paper sx={formPaperStyle} elevation={3}>
                {loading && staffId && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress />
                    </Box>
                )}
                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("firstName", "First Name", true)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("lastName", "Last Name", true)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("employeeId", "Employee ID")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("mobile", "Mobile", false, { type: "tel" })} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField {...textFieldProps("email", "E-mail", false, { type: "email" })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("department", "Department")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField {...textFieldProps("designation", "Designation")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            {...textFieldProps("joiningDate", "Joining Date", false, {
                                type: "date",
                                InputLabelProps: { shrink: true }
                            })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!formData.reimbursementClaimEnabled}
                                    onChange={handleChange}
                                    name="reimbursementClaimEnabled"
                                    disabled={isViewMode}
                                    color="primary"
                                />
                            }
                            label="Reimbursement Claims"
                            labelPlacement="start"
                            sx={{
                                color: 'text.secondary',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingRight: '8px',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!formData.isSalesAgent}
                                    onChange={handleChange}
                                    name="isSalesAgent"
                                    disabled={isViewMode}
                                    color="primary"
                                />
                            }
                            label="Sales Agent"
                            labelPlacement="start"
                            sx={{
                                color: 'text.secondary',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingRight: '8px',
                            }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Grid item xs={12}>
                    <TextField
                        {...textFieldProps("notes", "Notes", false, {
                            multiline: true,
                            rows: 4,
                        })}
                    />
                </Grid>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="overline">Custom Fields</Typography>
                </Divider>

                {formData.customFields.map((fieldValue, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                        <Grid item xs={12} sm={10}>
                            <TextField
                                label={`Custom Field ${index + 1}`}
                                value={fieldValue}
                                onChange={(e) => handleCustomFieldChange(index, e)}
                                variant="outlined"
                                size="small"
                                fullWidth
                                disabled={isViewMode}
                                placeholder="Enter custom information"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ textAlign: {xs: 'right', sm: 'center'} }}>
                            {!isViewMode && (
                                <IconButton onClick={() => handleRemoveCustomField(index)} color="error" aria-label="remove custom field">
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                ))}

                {!isViewMode && (
                    <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddCustomField}
                        sx={{ mt: 1, mb: 2, textTransform: 'none' }}
                    >
                        Add Custom Field
                    </Button>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    {isViewMode ? (
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<EditIcon />}
                            onClick={() => {
                                setIsViewMode(false);
                                const newPath = staffId ? `/account-transaction/staff/edit/${staffId}` : location.pathname;
                                navigate(newPath, { replace: true });
                            }}
                            sx={{textTransform: 'none', fontWeight: 'bold'}}
                        >
                            Edit Staff
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                            sx={{textTransform: 'none', fontWeight: 'bold'}}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (formData._id ? 'Update Staff' : 'Save Staff')}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};


// --- App Component to Render the Form ---
export default function App() {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
            background: {
                default: '#f8f9fa'
            }
        },
        typography: {
            fontFamily: 'Roboto, sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                    }
                }
            }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <StaffForm onSaveSuccess={(data) => console.log("Save successful:", data)} />
        </ThemeProvider>
    );
}
