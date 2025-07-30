import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Star as DefaultIcon, StarBorder as NotDefaultIcon, Person as PersonIcon } from '@mui/icons-material';

// --- Axios Instance with Auth ---
const getAuthToken = () => localStorage.getItem('token');

const axiosInstance = axios.create({
    baseURL: '/api'
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
// --- End Axios Instance ---

const API_URL = '/contact-details';
const GLOBAL_COUNTRIES_API_URL = '/global/countries';

const initialContactState = {
    designation: "",
    name: "",
    panNumber: "",
    dinNumber: "",
    aadhaar: "",
    countryCode: "",
    mobile: "",
    email: "",
    isDefault: false,
    photo: null,
    photoPreview: null,
};

function ContactDetails() {
    const [contacts, setContacts] = useState([]);
    const [countryCodes, setCountryCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentContact, setCurrentContact] = useState(initialContactState);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [contactsResponse, countriesResponse] = await Promise.all([
                axiosInstance.get(API_URL),
                axiosInstance.get(GLOBAL_COUNTRIES_API_URL)
            ]);

            if (contactsResponse.data && contactsResponse.data.length > 0) {
                setContacts(contactsResponse.data);
            } else {
                setContacts([]);
            }

            if (countriesResponse.data) {
                const codeOptions = countriesResponse.data.map(c => ({ value: c.countryCode, flag: c.flag }));
                const uniqueCodeOptions = Array.from(new Set(codeOptions.map(c => c.value)))
                  .map(value => codeOptions.find(c => c.value === value)).filter(Boolean);
                setCountryCodes(uniqueCodeOptions);
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch initial data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenDialog = (contact = null) => {
        if (contact) {
            setCurrentContact({ ...contact, photoPreview: contact.photoUrl || null });
            setIsEditing(true);
        } else {
            // Set default country code for new contacts if available
            const defaultCode = countryCodes.find(c => c.flag === '🇮🇳')?.value || (countryCodes.length > 0 ? countryCodes[0].value : '');
            setCurrentContact({...initialContactState, countryCode: defaultCode});
            setIsEditing(false);
        }
        setError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("Photo file size should not exceed 2MB.");
                return;
            }
            setCurrentContact(prev => ({
                ...prev,
                photo: file,
                photoPreview: URL.createObjectURL(file)
            }));
            setError('');
        }
    };

    const handleSaveContact = async () => {
        if (!currentContact.name || !currentContact.mobile) {
            setError("Name and Mobile are required fields.");
            return;
        }

        const formData = new FormData();
        for (const key in currentContact) {
            if (key === 'photo' && currentContact[key]) {
                formData.append('photo', currentContact.photo, currentContact.photo.name);
            } else if (currentContact[key] !== null && key !== 'photoPreview' && key !== 'photoUrl') {
                formData.append(key, currentContact[key]);
            }
        }

        const apiCall = isEditing
            ? axiosInstance.put(`${API_URL}/${currentContact._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
            : axiosInstance.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' }});

        try {
            await apiCall;
            setSuccess(`Contact ${isEditing ? 'updated' : 'added'} successfully!`);
            handleCloseDialog();
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save contact.');
        }
    };

    const handleDeleteContact = async (id) => {
        try {
            await axiosInstance.delete(`${API_URL}/${id}`);
            setSuccess('Contact deleted successfully!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete contact.');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axiosInstance.put(`${API_URL}/set-default/${id}`);
            setSuccess('Default contact updated successfully!');
            fetchData();
        } catch(err) {
            setError(err.response?.data?.message || 'Failed to set default contact.');
        }
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">Company Contact Details</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Add Contact
                    </Button>
                </Box>

                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
                </Snackbar>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Photo</TableCell>
                                    <TableCell>Default</TableCell>
                                    <TableCell>Designation</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Mobile</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {contacts.map((contact) => (
                                    <TableRow key={contact._id || 'new'}>
                                        <TableCell>
                                            <Avatar src={contact.photoUrl || undefined} alt={contact.name}>
                                                {!contact.photoUrl && <PersonIcon />}
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={contact.isDefault ? "Default Contact" : "Set as Default"}>
                                                <IconButton onClick={() => !contact.isDefault && handleSetDefault(contact._id)} color="primary" disabled={contact.isDefault}>
                                                    {contact.isDefault ? <DefaultIcon /> : <NotDefaultIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{contact.designation}</TableCell>
                                        <TableCell>{contact.name}</TableCell>
                                        <TableCell>{`${contact.countryCode || ''} ${contact.mobile || ''}`}</TableCell>
                                        <TableCell>{contact.email}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpenDialog(contact)}><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDeleteContact(contact._id)} disabled={contact.isDefault}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, my: 2 }}>
                        <Avatar src={currentContact.photoPreview || undefined} sx={{ width: 80, height: 80 }}>
                            {!currentContact.photoPreview && <PersonIcon sx={{ fontSize: 40 }} />}
                        </Avatar>
                        <Button variant="outlined" component="label">
                            Upload Photo
                            <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                        </Button>
                    </Box>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Designation" fullWidth value={currentContact.designation} onChange={(e) => setCurrentContact({ ...currentContact, designation: e.target.value })}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Name" required fullWidth value={currentContact.name} onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="PAN Number" fullWidth value={currentContact.panNumber} onChange={(e) => setCurrentContact({ ...currentContact, panNumber: e.target.value })}/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="DIN Number" fullWidth value={currentContact.dinNumber} onChange={(e) => setCurrentContact({ ...currentContact, dinNumber: e.target.value })}/>
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField label="Aadhaar" fullWidth value={currentContact.aadhaar} onChange={(e) => setCurrentContact({ ...currentContact, aadhaar: e.target.value })}/>
                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 2 }}>
                             <FormControl sx={{ minWidth: 120 }}>
                                <InputLabel>Code</InputLabel>
                                <Select
                                    label="Code"
                                    name="countryCode"
                                    value={currentContact.countryCode}
                                    onChange={(e) => setCurrentContact({...currentContact, countryCode: e.target.value})}
                                >
                                    {countryCodes.map((c) => (
                                        <MenuItem key={c.value} value={c.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box component="span" sx={{ mr: 1.5 }}>{c.flag}</Box>
                                                {c.value}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Mobile"
                                required
                                fullWidth
                                value={currentContact.mobile}
                                onChange={(e) => setCurrentContact({ ...currentContact, mobile: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="E-mail" type="email" fullWidth value={currentContact.email} onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}/>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!currentContact.isDefault}
                                        onChange={(e) => setCurrentContact({ ...currentContact, isDefault: e.target.checked })}
                                        name="isDefault"
                                        color="primary"
                                    />
                                }
                                label="Set as default contact"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveContact} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ContactDetails;