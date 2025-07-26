import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    FormControl, InputLabel, CircularProgress, Alert, Switch, FormControlLabel, Chip, OutlinedInput, Autocomplete
} from "@mui/material";
import { Edit, Delete, CloudUpload, Add as AddIcon, Lock, LockOpen } from "@mui/icons-material";

// This should ideally come from an API or a config file
const availablePages = ["Home", "About", "Contact", "Products", "Services", "Admin Dashboard", "User Profile"];

function DropdownManagement() {
    const [dropdownValues, setDropdownValues] = useState([]);
    const [filteredValues, setFilteredValues] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentValue, setCurrentValue] = useState({
        _id: "",
        type: "",
        sub_type: "", // Added sub_type
        value: "",
        label: "",
        pages_used: [], // Added for multi-select
        is_locked: false, // Added for lock option
    });
    const [file, setFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || "";

    const uniqueTypes = useMemo(() => {
        const types = new Set(dropdownValues.map(item => item.type).filter(Boolean));
        return Array.from(types);
    }, [dropdownValues]);

    const fetchDropdownValues = useCallback(async (page = 1, limit = 25) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdown`, {
                params: { page, limit },
                withCredentials: true,
            });
            console.log("API Response (fetchDropdownValues):", response.data);

            if (response.data && Array.isArray(response.data.data)) {
                const values = response.data.data.map(item => ({
                    ...item,
                    pages_used: item.pages_used || [], // Ensure pages_used is an array
                }));
                setDropdownValues(values);
                setFilteredValues(values);
                setTotalItems(response.data.total || 0);
            } else {
                console.error("Invalid API response format:", response.data);
                setError("Failed to fetch dropdowns: Invalid response format.");
                setDropdownValues([]);
                setFilteredValues([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error("Error fetching dropdown values:", err);
            setError(`Error fetching dropdown values: ${err.response?.data?.message || err.message}`);
            setDropdownValues([]);
            setFilteredValues([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchDropdownValues(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, fetchDropdownValues]);

    useEffect(() => {
        if (filter) {
            const lowercasedFilter = filter.toLowerCase();
            const filtered = dropdownValues.filter(
                (item) =>
                    item.type?.toLowerCase().includes(lowercasedFilter) ||
                    item.sub_type?.toLowerCase().includes(lowercasedFilter) ||
                    item.value?.toLowerCase().includes(lowercasedFilter) ||
                    item.label?.toLowerCase().includes(lowercasedFilter)
            );
            setFilteredValues(filtered);
        } else {
            setFilteredValues(dropdownValues);
        }
    }, [filter, dropdownValues]);

    const handleSave = async () => {
        setError(null);
        setSuccessMessage(null);
        if (!currentValue.type || !currentValue.value || !currentValue.label) {
            setError("Type, Value, and Label are required.");
            return;
        }

        // Prevent editing if locked
        const originalItem = dropdownValues.find(item => item._id === currentValue._id);
        if (originalItem && originalItem.is_locked) {
            setError("This item is locked and cannot be edited. Please unlock it first.");
            return;
        }

        try {
            const updatedUser = "Admin"; // Replace with actual logged-in user
            const payload = { ...currentValue, updated_user: updatedUser };

            if (currentValue._id) {
                await axios.put(`${API_BASE_URL}/api/dropdown/${currentValue._id}`, payload, { withCredentials: true });
                setSuccessMessage("Dropdown value updated successfully.");
            } else {
                await axios.post(`${API_BASE_URL}/api/dropdown`, payload, { withCredentials: true });
                setSuccessMessage("Dropdown value added successfully.");
            }
            setOpenDialog(false);
            fetchDropdownValues(currentPage, itemsPerPage);
        } catch (err) {
            console.error("Error saving dropdown value:", err);
            setError(`Error saving dropdown value: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleToggleLock = async (item) => {
        setError(null);
        setSuccessMessage(null);
        try {
            const payload = { is_locked: !item.is_locked };
            await axios.put(`${API_BASE_URL}/api/dropdown/${item._id}`, payload, { withCredentials: true });
            setSuccessMessage(`Item ${!item.is_locked ? 'locked' : 'unlocked'} successfully.`);
            fetchDropdownValues(currentPage, itemsPerPage);
        } catch (err) {
            console.error("Error toggling lock status:", err);
            setError(`Error toggling lock status: ${err.response?.data?.message || err.message}`);
        }
    };


    const handleDelete = async (id, is_locked) => {
        setError(null);
        setSuccessMessage(null);
         if (is_locked) {
            setError("Cannot delete a locked item. Please unlock it first.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/dropdown/${id}`, { withCredentials: true });
                setSuccessMessage("Dropdown value deleted successfully.");
                if (filteredValues.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchDropdownValues(currentPage, itemsPerPage);
                }
            } catch (err) {
                console.error("Error deleting dropdown value:", err);
                setError(`Error deleting dropdown value: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }
        setError(null);
        setSuccessMessage(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await axios.post(`${API_BASE_URL}/api/dropdown/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            setSuccessMessage("Dropdown values uploaded successfully.");
            fetchDropdownValues(1, itemsPerPage);
            setCurrentPage(1);
            setFile(null);
            const fileInput = document.getElementById('upload-file');
            if (fileInput) fileInput.value = "";
        } catch (err) {
            console.error("Error uploading file:", err);
            setError(`Error uploading file: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleOpenDialog = (item = null) => {
        if (item) {
             if (item.is_locked) {
                setError("This item is locked. Unlock it to make changes.");
                setCurrentValue({
                    _id: item._id,
                    type: item.type || "",
                    sub_type: item.sub_type || "",
                    value: item.value || "",
                    label: item.label || "",
                    pages_used: Array.isArray(item.pages_used) ? item.pages_used : [],
                    is_locked: item.is_locked || false,
                });
                setOpenDialog(true); // Still open dialog to view details
            } else {
                 setCurrentValue({
                    _id: item._id,
                    type: item.type || "",
                    sub_type: item.sub_type || "",
                    value: item.value || "",
                    label: item.label || "",
                    pages_used: Array.isArray(item.pages_used) ? item.pages_used : [],
                    is_locked: item.is_locked || false,
                });
                setError(null);
                setOpenDialog(true);
            }
        } else {
            setCurrentValue({ _id: "", type: "", sub_type: "", value: "", label: "", pages_used: [], is_locked: false });
            setError(null);
            setOpenDialog(true);
        }
    };

    const handlePageChange = (event) => {
        const value = Array.isArray(event.target.value) ? event.target.value : [];
        setCurrentValue({ ...currentValue, pages_used: value });
    };


    return (
        <Box sx={{ p: 3, fontFamily: 'sans-serif' }}>
            <Typography variant="h4" gutterBottom>Manage Dropdown Values</Typography>

            {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>{successMessage}</Alert>}
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: "none" }}
                    id="upload-file"
                />
                <label htmlFor="upload-file">
                    <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                        Select Excel File
                    </Button>
                </label>
                {file && <Typography variant="caption" sx={{ml:1}}>{file.name}</Typography>}
                <Button variant="contained" onClick={handleFileUpload} disabled={!file} sx={{ml: {xs: 0, sm:1}, mt: {xs:1, sm:0}}}>
                    Upload & Submit
                </Button>
            </Box>

            <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mb: 3 }} startIcon={<AddIcon />}>
                Add New Value
            </Button>

            <TextField
                fullWidth
                label="Filter by Type, Sub-Type, Value, or Label"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 3 }}
                variant="outlined"
                size="small"
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Button onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
                        Previous
                    </Button>
                    <Typography variant="body2" component="span" sx={{px:2}}>
                        Page {currentPage} of {Math.ceil(totalItems / itemsPerPage) || 1}
                    </Typography>
                    <Button onClick={handleNextPage} disabled={currentPage >= Math.ceil(totalItems / itemsPerPage) || loading}>
                        Next
                    </Button>
                </Box>
                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Items per page</InputLabel>
                    <Select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        label="Items per page"
                    >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                        <MenuItem value={-1}>All</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.200' }}>
                            <TableCell sx={{fontWeight: 'bold'}}>Type</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Sub Type</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Value</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Label</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Pages Used</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Status</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center"><CircularProgress /></TableCell>
                            </TableRow>
                        ) : filteredValues && filteredValues.length > 0 ? (
                            filteredValues.map((item) => (
                                <TableRow key={item._id} hover sx={{ backgroundColor: item.is_locked ? '#f5f5f5' : 'inherit' }}>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.sub_type}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell>{item.label}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {item.pages_used?.map((page) => (
                                                <Chip key={page} label={page} size="small" />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {item.is_locked ? <Lock color="action" /> : <LockOpen color="action" />}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(item)} size="small" color="primary" aria-label="edit" disabled={item.is_locked}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(item._id, item.is_locked)} size="small" color="error" aria-label="delete" disabled={item.is_locked}>
                                            <Delete />
                                        </IconButton>
                                        <IconButton onClick={() => handleToggleLock(item)} size="small" color="default" aria-label="toggle lock">
                                            {item.is_locked ? <LockOpen /> : <Lock />}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{currentValue._id ? "Edit Dropdown Value" : "Add Dropdown Value"}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{mb:2}} onClose={() => setError(null)}>{error}</Alert>}
                    <FormControlLabel
                        control={<Switch checked={currentValue.is_locked} onChange={(e) => setCurrentValue({ ...currentValue, is_locked: e.target.checked })} />}
                        label="Lock for Editing"
                        sx={{ mb: 1, display: 'block' }}
                    />
                    <Autocomplete
                        freeSolo
                        options={uniqueTypes}
                        getOptionLabel={(option) => option || ""}
                        value={currentValue.type}
                        onChange={(event, newValue) => {
                            setCurrentValue({ ...currentValue, type: newValue || "" });
                        }}
                        onInputChange={(event, newInputValue) => {
                           if(event?.type === 'change') {
                             setCurrentValue({ ...currentValue, type: newInputValue });
                           }
                        }}
                        disabled={currentValue.is_locked}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                autoFocus
                                margin="dense"
                                label="Type *"
                                variant="outlined"
                            />
                        )}
                    />
                     <TextField
                        margin="dense"
                        name="sub_type"
                        label="Sub Type"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentValue.sub_type}
                        onChange={(e) => setCurrentValue({ ...currentValue, sub_type: e.target.value })}
                        disabled={currentValue.is_locked}
                    />
                    <TextField
                        margin="dense"
                        name="value"
                        label="Value *"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentValue.value}
                        onChange={(e) => setCurrentValue({ ...currentValue, value: e.target.value })}
                        disabled={currentValue.is_locked}
                    />
                    <TextField
                        margin="dense"
                        name="label"
                        label="Label *"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentValue.label}
                        onChange={(e) => setCurrentValue({ ...currentValue, label: e.target.value })}
                        disabled={currentValue.is_locked}
                    />
                    <FormControl fullWidth margin="dense" disabled={currentValue.is_locked}>
                        <InputLabel id="pages-used-label">Pages Used</InputLabel>
                        <Select
                            labelId="pages-used-label"
                            multiple
                            value={currentValue.pages_used}
                            onChange={handlePageChange}
                            input={<OutlinedInput label="Pages Used" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {availablePages.map((page) => (
                                <MenuItem key={page} value={page}>
                                    {page}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{p: '16px 24px'}}>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={currentValue.is_locked}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DropdownManagement;
