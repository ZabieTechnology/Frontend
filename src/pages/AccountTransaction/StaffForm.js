// src/pages/AccountTransaction/StaffForm.js (or your preferred location)
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const initialFormData = {
    _id: null,
    firstName: '',
    lastName: '',
    employeeId: '',
    mobile: '',
    email: '',
    joiningDate: '', // Store as YYYY-MM-DD for date input
    reimbursementClaimEnabled: false,
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

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchStaffData = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/staff/${id}`, { withCredentials: true });
            if (response.data) {
                const fetched = response.data;
                setFormData({
                    ...initialFormData,
                    ...fetched,
                    _id: fetched._id,
                    joiningDate: fetched.joiningDate ? new Date(fetched.joiningDate).toISOString().split('T')[0] : '',
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
            setFormData(initialFormData);
            if (viewMode) setIsViewMode(false);
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

        const submissionData = { ...formData };
        if (!submissionData._id) { // If creating new
            delete submissionData._id;
        }
        // Ensure boolean for switch
        submissionData.reimbursementClaimEnabled = !!submissionData.reimbursementClaimEnabled;


        try {
            let response;
            if (formData._id) { // Edit mode
                response = await axios.put(`${API_BASE_URL}/api/staff/${formData._id}`, submissionData, { withCredentials: true });
                setSuccess("Staff member updated successfully!");
            } else { // Create mode
                response = await axios.post(`${API_BASE_URL}/api/staff`, submissionData, { withCredentials: true });
                setSuccess("Staff member created successfully!");
            }

            if (response.data && response.data.data) {
                const savedData = response.data.data;
                setFormData({
                    ...initialFormData,
                    ...savedData,
                    _id: savedData._id,
                    joiningDate: savedData.joiningDate ? new Date(savedData.joiningDate).toISOString().split('T')[0] : '',
                });
                if (onSaveSuccess) onSaveSuccess(savedData);
                if (!formData._id) {
                    // navigate('/account-transaction/staff'); // Optionally navigate back
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
    const paperStyle = { p: 3, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none', width: '100%', maxWidth: '600px', margin: 'auto' };
    const textFieldProps = (name, label, required = false, otherProps = {}) => ({
        name: name,
        label: label + (required ? " *" : ""),
        value: formData[name],
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
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: 'auto' }}>
                <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{title}</Typography>
                <IconButton onClick={() => navigate('/account-transaction/staff')} aria-label="back to staff list">
                    <ArrowBackIcon />
                </IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, maxWidth: '600px', margin: 'auto auto 16px auto' }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, maxWidth: '600px', margin: 'auto auto 16px auto' }}>{success}</Alert>}

            <Paper sx={paperStyle}>
                <Grid container spacing={2}>
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
                        <TextField {...textFieldProps("joiningDate", "Joining Date", false, { type: "date", InputLabelProps: { shrink: true } })} />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: {xs: 'flex-start', sm: 'center'} , mt: {xs: 1, sm: 0} }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.reimbursementClaimEnabled}
                                    onChange={handleChange}
                                    name="reimbursementClaimEnabled"
                                    disabled={isViewMode}
                                />
                            }
                            label="Reimbursement Claim Enabled"
                            labelPlacement="start"
                            sx={{ color: 'text.secondary' }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    {isViewMode ? (
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/account-transaction/staff/edit/${staffId}`)}
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
                        >
                            {loading ? <CircularProgress size={24} /> : (formData._id ? 'Update Staff' : 'Save Staff')}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default StaffForm;
