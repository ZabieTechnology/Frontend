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
    ThemeProvider,
    createTheme,
    CssBaseline,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    Radio,
    Collapse
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


// --- Import actual dependencies in your project ---
// import axios from 'axios';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';

// --- Placeholder functions for demonstration without real dependencies ---
const useParams = () => ({ staffId: null });
const useLocation = () => ({ search: '' });
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

const axios = {
    get: (url) => new Promise((resolve) => setTimeout(() => resolve({
        data: {
             _id: "mock-id-123",
             firstName: "John",
             lastName: "Doe",
             employeeId: "E12345",
             mobile: "123-456-7890",
             email: "john.doe@example.com",
             joiningDate: "2023-01-15",
             designation: "Software Engineer",
             department: "Technology",
             reimbursementClaimEnabled: true,
             isSalesAgent: false,
             notes: "A dedicated team member.",
             customFields: ["Skill: React", "Project: Phoenix"],
             documents: [{name: "resume.pdf", size: 123456}, {name:"offer_letter.pdf", size: 234567}],
        }
    }), 1000)),
    post: (url, data) => {
         console.log(`[AXIOS MOCK] POST: ${url}`, data);
         return new Promise(resolve => setTimeout(() => resolve({ data: { message: "Staff member created successfully!", data: { ...data, _id: `new-mock-id-${Date.now()}` } } }), 1000));
    },
    put: (url, data) => {
         console.log(`[AXIOS MOCK] PUT: ${url}`, data);
         return new Promise(resolve => setTimeout(() => resolve({ data: { message: "Staff member updated successfully!", data: data } }), 1000));
    }
};

// --- Reusable Section Component ---
const Section = ({ title, children, initialOpen = true }) => {
    const [open, setOpen] = useState(initialOpen);

    return (
        <Paper elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Box
                onClick={() => setOpen(!open)}
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                }}
            >
                <Typography variant="h6">{title}</Typography>
                <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </Box>
            <Collapse in={open}>
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            </Collapse>
        </Paper>
    );
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
    documents: [],
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

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const parseCustomFields = (fields) => {
        return (Array.isArray(fields) ? fields : []).map(field => {
            if (typeof field === 'string') {
                const parts = field.split(':');
                const name = parts[0].trim();
                const value = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
                return { name, type: 'Text', value };
            }
            if (field && typeof field.name !== 'undefined' && typeof field.type !== 'undefined') {
                return field;
            }
            return { name: '', type: 'Text', value: '' };
        });
    };

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
                    customFields: parseCustomFields(fetched.customFields),
                    documents: Array.isArray(fetched.documents) ? fetched.documents : [],
                });
            } else {
                setError("Staff member not found.");
                setFormData(initialFormData);
            }
        } catch (err) {
            setError(`Failed to load staff data: ${err.message}`);
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
        setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' || type === 'switch' ? checked : value }));
    };

    const handleCustomFieldChange = (index, fieldName, value) => {
        if (isViewMode) return;
        const updatedCustomFields = [...formData.customFields];
        updatedCustomFields[index][fieldName] = value;
        if (fieldName === 'type') {
            updatedCustomFields[index].value = value === 'Tick box' ? false : '';
        }
        setFormData((prev) => ({ ...prev, customFields: updatedCustomFields }));
    };

    const handleAddCustomField = () => {
        if (isViewMode) return;
        setFormData((prev) => ({ ...prev, customFields: [...prev.customFields, { name: '', type: 'Text', value: '' }] }));
    };

    const handleRemoveCustomField = (index) => {
        if (isViewMode) return;
        setFormData((prev) => ({ ...prev, customFields: prev.customFields.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (event) => {
        if (isViewMode) return;
        setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...Array.from(event.target.files)] }));
        event.target.value = null;
    };

    const handleRemoveFile = (fileIndex) => {
        if (isViewMode) return;
        setFormData((prev) => ({ ...prev, documents: prev.documents.filter((_, index) => index !== fileIndex) }));
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
            return;
        }

        const submissionData = { ...formData, customFields: formData.customFields.filter(field => field.name.trim() !== ''), documents: formData.documents.map(file => ({ name: file.name, size: file.size, type: file.type }))};
        if (!submissionData._id) delete submissionData._id;

        try {
            const response = formData._id
                ? await axios.put(`${API_BASE_URL}/api/staff/${formData._id}`, submissionData)
                : await axios.post(`${API_BASE_URL}/api/staff`, submissionData);

            setSuccess(response.data.message);
            const savedData = response.data.data;
            setFormData({ ...initialFormData, ...savedData, _id: savedData._id, joiningDate: savedData.joiningDate ? new Date(savedData.joiningDate).toISOString().split('T')[0] : '', customFields: parseCustomFields(savedData.customFields), documents: Array.isArray(savedData.documents) ? savedData.documents : [] });
            if (onSaveSuccess) onSaveSuccess(savedData);
            if (!formData._id && savedData._id) navigate(`/account-transaction/staff/edit/${savedData._id}`);
        } catch (err) {
            setError(`Failed to save staff: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const renderCustomFieldInput = (field, index) => {
        const valueProps = { name: `customFieldValue-${index}`, disabled: isViewMode };
        switch (field.type) {
            case 'Number': return <TextField label="Value" type="number" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} {...valueProps} size="small" fullWidth />;
            case 'Date': return <TextField label="Value" type="date" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} InputLabelProps={{ shrink: true }} {...valueProps} size="small" fullWidth />;
            case 'Date (Month/Year)': return <TextField label="Value" type="month" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} InputLabelProps={{ shrink: true }} {...valueProps} size="small" fullWidth />;
            case 'Tick box': return <FormControlLabel control={<Switch checked={!!field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.checked)} {...valueProps} />} label={field.value ? "Yes" : "No"} />;
            case 'Yes/No (Radio)': return (<RadioGroup row value={field.value || ''} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}><FormControlLabel value="Yes" control={<Radio size="small" disabled={isViewMode}/>} label="Yes" /><FormControlLabel value="No" control={<Radio size="small" disabled={isViewMode}/>} label="No" /></RadioGroup>);
            default: return <TextField label="Value" value={field.value} onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)} {...valueProps} size="small" fullWidth />;
        }
    };

    const textFieldProps = (name, label, required = false, otherProps = {}) => ({ name, label: label + (required ? " *" : ""), value: formData[name] || '', onChange: handleChange, variant: "outlined", size: "small", fullWidth: true, disabled: isViewMode, required, ...otherProps });

    const title = staffId ? (isViewMode ? "View Staff Details" : "Edit Staff") : "Add New Staff";

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, sm: 2, md: 3 }, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px', margin: 'auto auto 24px auto', backgroundColor: 'transparent', borderBottom: '1px solid #ddd' }}>
                <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold' }}>{title}</Typography>
                <IconButton onClick={() => navigate('/account-transaction/staff')} aria-label="back to staff list"><ArrowBackIcon /></IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, maxWidth: '900px', mx: 'auto' }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, maxWidth: '900px', mx: 'auto' }}>{success}</Alert>}

            <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
                 {loading && !formData._id && !staffId ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
                ) : (
                <>
                <Section title="Staff Information">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("firstName", "First Name", true)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("lastName", "Last Name", true)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("employeeId", "Employee ID")} /></Grid>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("mobile", "Mobile", false, { type: "tel" })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("email", "E-mail", false, { type: "email" })} /></Grid>
                         <Grid item xs={12} sm={6}><TextField {...textFieldProps("joiningDate", "Joining Date", false, { type: "date", InputLabelProps: { shrink: true } })}/></Grid>
                    </Grid>
                </Section>

                <Section title="Employment Details & Settings">
                     <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("department", "Department")} /></Grid>
                        <Grid item xs={12} sm={6}><TextField {...textFieldProps("designation", "Designation")} /></Grid>
                        <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={!!formData.reimbursementClaimEnabled} onChange={handleChange} name="reimbursementClaimEnabled" disabled={isViewMode} />} label="Reimbursement Claims Enabled" sx={{ color: 'text.secondary' }} /></Grid>
                        <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={!!formData.isSalesAgent} onChange={handleChange} name="isSalesAgent" disabled={isViewMode} />} label="Is a Sales Agent" sx={{ color: 'text.secondary' }} /></Grid>
                     </Grid>
                </Section>

                <Section title="Notes">
                    <TextField {...textFieldProps("notes", "Additional Notes", false, { multiline: true, rows: 4 })} />
                </Section>

                <Section title="Custom Fields">
                    {formData.customFields.map((field, index) => (
                        <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2, bgcolor: index % 2 ? '#fafafa' : 'transparent' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={3}><TextField label="Field Name" value={field.name} onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)} size="small" fullWidth disabled={isViewMode} /></Grid>
                                <Grid item xs={12} md={3}><FormControl fullWidth size="small" disabled={isViewMode}><InputLabel>Type</InputLabel><Select label="Type" value={field.type} onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}><MenuItem value="Text">Text</MenuItem><MenuItem value="Number">Number</MenuItem><MenuItem value="Date">Date</MenuItem><MenuItem value="Date (Month/Year)">Date (Month/Year)</MenuItem><MenuItem value="Tick box">Tick box</MenuItem><MenuItem value="Yes/No (Radio)">Yes/No (Radio)</MenuItem></Select></FormControl></Grid>
                                <Grid item xs={12} md={5}>{renderCustomFieldInput(field, index)}</Grid>
                                <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}><IconButton onClick={() => handleRemoveCustomField(index)} color="error" disabled={isViewMode}><RemoveCircleOutlineIcon /></IconButton></Grid>
                            </Grid>
                        </Box>
                    ))}
                    {!isViewMode && <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddCustomField} sx={{ textTransform: 'none' }}>Add Custom Field</Button>}
                </Section>

                <Section title="Documents" initialOpen={false}>
                    {!isViewMode && <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ mb: 2, textTransform: 'none' }}>Upload Files<input type="file" hidden multiple onChange={handleFileChange} /></Button>}
                    {formData.documents.length > 0 && <List dense>{formData.documents.map((file, index) => (<ListItem key={index} sx={{ border: '1px solid #ddd', borderRadius: 2, mb: 1 }} secondaryAction={!isViewMode && <IconButton edge="end" title="Remove file" onClick={() => handleRemoveFile(index)} color="error"><DeleteIcon /></IconButton>}><ListItemAvatar><Avatar sx={{ bgcolor: 'secondary.light' }}><InsertDriveFileIcon /></Avatar></ListItemAvatar><ListItemText primary={file.name} secondary={file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''} /></ListItem>))}</List>}
                </Section>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {isViewMode ? (
                        <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => { setIsViewMode(false); navigate(location.pathname, { replace: true }); }}>Edit</Button>
                    ) : (
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>{loading ? <CircularProgress size={24} color="inherit" /> : (formData._id ? 'Update Staff' : 'Save Staff')}</Button>
                    )}
                </Box>
                </>
                )}
            </Box>
        </Box>
    );
};

// --- App Component to Render the Form ---
export default function App() {
    const theme = createTheme({
        palette: {
            primary: { main: '#1976d2' },
            secondary: { main: '#dc004e' },
            background: { default: '#f4f6f8' }
        },
        typography: { fontFamily: 'Roboto, sans-serif' },
        components: { MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 'bold' }}}, MuiPaper: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderRadius: 12 }}}}
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <StaffForm onSaveSuccess={(data) => console.log("Save successful:", data)} />
        </ThemeProvider>
    );
}
