import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Autocomplete from '@mui/material/Autocomplete';
import Tooltip from '@mui/material/Tooltip';
import { Edit, Delete, Add as AddIcon, Lock, LockOpen } from "@mui/icons-material";

// --- Axios Instance with Auth ---
const getAuthToken = () => localStorage.getItem('token');
const axiosInstance = axios.create({ baseURL: '/api' });
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
// --- End Axios Config ---

const availablePages = ["Home", "About", "Contact", "Products", "Services", "Admin Dashboard", "User Profile"];

function DropdownManagement() {
    const [dropdownValues, setDropdownValues] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentValue, setCurrentValue] = useState(null);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [userRole, setUserRole] = useState('user'); // Default to non-admin

    const isAdmin = useMemo(() => userRole === 'admin', [userRole]);

    const uniqueTypes = useMemo(() => {
        const types = new Set(dropdownValues.map(item => item.type).filter(Boolean));
        return Array.from(types);
    }, [dropdownValues]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch user role and dropdowns at the same time
            const [profileRes, dropdownsRes] = await Promise.all([
                axiosInstance.get('/auth/profile'),
                axiosInstance.get('/global/dropdowns')
            ]);

            setUserRole(profileRes.data.role || 'user');

            const values = (dropdownsRes.data || []).map(item => ({
                ...item,
                _id: String(item._id), // Ensure _id is a string
                pages_used: item.pages_used || [],
            }));
            setDropdownValues(values);

        } catch (err) {
            setError(`Error fetching data: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredValues = useMemo(() => {
        if (!filter) return dropdownValues;
        const lowercasedFilter = filter.toLowerCase();
        return dropdownValues.filter(
            (item) =>
                item.type?.toLowerCase().includes(lowercasedFilter) ||
                item.sub_type?.toLowerCase().includes(lowercasedFilter) ||
                item.value?.toLowerCase().includes(lowercasedFilter) ||
                item.label?.toLowerCase().includes(lowercasedFilter)
        );
    }, [filter, dropdownValues]);

    const handleSave = async () => {
        setError(null);
        setSuccess(null);
        if (!currentValue.type || !currentValue.value || !currentValue.label) {
            setError("Type, Value, and Label are required.");
            return;
        }

        try {
            const endpoint = currentValue._id ? `/global/dropdowns/${currentValue._id}` : '/global/dropdowns';
            const method = currentValue._id ? 'put' : 'post';
            await axiosInstance[method](endpoint, currentValue);
            setSuccess(`Dropdown value ${currentValue._id ? 'updated' : 'added'} successfully.`);
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            setError(`Error saving value: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleToggleLock = async (item) => {
        setError(null);
        setSuccess(null);
        try {
            const payload = { is_locked: !item.is_locked };
            await axiosInstance.put(`/global/dropdowns/${item._id}`, payload);
            setSuccess(`Item ${!item.is_locked ? 'locked' : 'unlocked'} successfully.`);
            fetchData();
        } catch (err) {
            setError(`Error toggling lock status: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id, is_locked) => {
        setError(null);
        setSuccess(null);
        if (is_locked) {
            setError("Cannot delete a locked item.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axiosInstance.delete(`/global/dropdowns/${id}`);
                setSuccess("Dropdown value deleted successfully.");
                fetchData();
            } catch (err) {
                setError(`Error deleting value: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleOpenDialog = (item = null) => {
        setCurrentValue(item ? { ...item } : { type: "", sub_type: "", value: "", label: "", pages_used: [], is_locked: false });
        setError(null);
        setOpenDialog(true);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom>Global Dropdown Settings</Typography>
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{p: 2, mb: 2}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <TextField
                        sx={{ flexGrow: 1, minWidth: '300px' }}
                        label="Filter values..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        variant="outlined"
                        size="small"
                    />
                    {isAdmin && (
                        <Button variant="contained" onClick={() => handleOpenDialog()} startIcon={<AddIcon />}>
                            Add New Value
                        </Button>
                    )}
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.200' }}>
                            <TableCell sx={{fontWeight: 'bold'}}>Type</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Sub Type</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Value</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Label</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Pages Used</TableCell>
                            {isAdmin && <TableCell sx={{fontWeight: 'bold', textAlign: 'center'}}>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredValues.map((item) => (
                            <TableRow key={item._id} hover sx={{ backgroundColor: item.is_locked ? '#fafafa' : 'inherit' }}>
                                <TableCell>{item.type}</TableCell>
                                <TableCell>{item.sub_type}</TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell>{item.label}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {item.pages_used?.map((page) => <Chip key={page} label={page} size="small" />)}
                                    </Box>
                                </TableCell>
                                {isAdmin && (
                                    <TableCell align="center">
                                        <Tooltip title="Edit">
                                            <span>
                                                <IconButton onClick={() => handleOpenDialog(item)} size="small" color="primary" disabled={item.is_locked}><Edit /></IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <span>
                                                <IconButton onClick={() => handleDelete(item._id, item.is_locked)} size="small" color="error" disabled={item.is_locked}><Delete /></IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={item.is_locked ? "Unlock" : "Lock"}>
                                            <IconButton onClick={() => handleToggleLock(item)} size="small" color="default" aria-label="toggle lock">
                                            {item.is_locked ? <LockOpen /> : <Lock />}</IconButton>
                                        </Tooltip>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {currentValue && (
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{currentValue._id ? "Edit Dropdown Value" : "Add New Value"}</DialogTitle>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{mb:2}} onClose={() => setError(null)}>{error}</Alert>}
                        <Autocomplete freeSolo options={uniqueTypes} value={currentValue.type}
                            onChange={(e, val) => setCurrentValue({ ...currentValue, type: val || "" })}
                            onInputChange={(e, val) => { if(e?.type === 'change') setCurrentValue({ ...currentValue, type: val })}}
                            renderInput={(params) => <TextField {...params} autoFocus margin="dense" label="Type *" variant="outlined" />} />
                        <TextField margin="dense" name="sub_type" label="Sub Type" fullWidth value={currentValue.sub_type} onChange={(e) => setCurrentValue({ ...currentValue, sub_type: e.target.value })} />
                        <TextField margin="dense" name="value" label="Value *" fullWidth value={currentValue.value} onChange={(e) => setCurrentValue({ ...currentValue, value: e.target.value })} />
                        <TextField margin="dense" name="label" label="Label *" fullWidth value={currentValue.label} onChange={(e) => setCurrentValue({ ...currentValue, label: e.target.value })} />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Pages Used</InputLabel>
                            <Select multiple value={currentValue.pages_used} onChange={(e) => setCurrentValue({...currentValue, pages_used: e.target.value})}
                                input={<OutlinedInput label="Pages Used" />}
                                renderValue={(selected) => <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((val) => <Chip key={val} label={val} />)}</Box>}>
                                {availablePages.map((page) => <MenuItem key={page} value={page}>{page}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions sx={{p: '16px 24px'}}>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}

export default DropdownManagement;
