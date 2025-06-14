import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    FormControl, InputLabel, CircularProgress, Alert
} from "@mui/material";
import { Edit, Delete, CloudUpload, Add as AddIcon } from "@mui/icons-material";

function DropdownManagement() {
    const [dropdownValues, setDropdownValues] = useState([]);
    const [filteredValues, setFilteredValues] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentValue, setCurrentValue] = useState({
        _id: "",
        type: "",
        value: "",
        label: "",
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

    const fetchDropdownValues = useCallback(async (page = 1, limit = 25) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdown`, {
                params: { page, limit },
                withCredentials: true,
            });
            console.log("API Response (fetchDropdownValues):", response.data); // Crucial for debugging

            if (response.data && Array.isArray(response.data.data)) {
                setDropdownValues(response.data.data);
                setFilteredValues(response.data.data);
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
    }, [API_BASE_URL]); // currentPage and itemsPerPage are passed as args, so not needed in deps here

    useEffect(() => {
        fetchDropdownValues(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, fetchDropdownValues]);

    useEffect(() => {
        if (filter) {
            const lowercasedFilter = filter.toLowerCase();
            const filtered = dropdownValues.filter(
                (item) =>
                    item.type?.toLowerCase().includes(lowercasedFilter) ||
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
        try {
            const updatedUser = "Admin"; // Replace with actual logged-in user
            const payload = {
                type: currentValue.type,
                value: currentValue.value,
                label: currentValue.label,
                updated_user: updatedUser,
            };

            if (currentValue._id) {
                await axios.put(`${API_BASE_URL}/api/dropdown/${currentValue._id}`, payload, { withCredentials: true });
                setSuccessMessage("Dropdown value updated successfully.");
            } else {
                await axios.post(`${API_BASE_URL}/api/dropdown`, payload, { withCredentials: true });
                setSuccessMessage("Dropdown value added successfully.");
            }
            setOpenDialog(false);
            fetchDropdownValues(1, itemsPerPage);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error saving dropdown value:", err);
            setError(`Error saving dropdown value: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        setError(null);
        setSuccessMessage(null);
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`${API_BASE_URL}/api/dropdown/${id}`, { withCredentials: true });
                setSuccessMessage("Dropdown value deleted successfully.");
                // If the deleted item was on the last page and was the only item, adjust current page
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
            setCurrentValue({
                _id: item._id,
                type: item.type || "",
                value: item.value || "",
                label: item.label || "",
            });
        } else {
            setCurrentValue({ _id: "", type: "", value: "", label: "" });
        }
        setError(null);
        setOpenDialog(true);
    };

    return (
        <Box sx={{ p: 3 }}>
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
                label="Filter by Type, Value, or Label"
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
                            <TableCell sx={{fontWeight: 'bold'}}>Value</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Label</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
                            </TableRow>
                        ) : filteredValues && filteredValues.length > 0 ? (
                            filteredValues.map((item) => (
                                <TableRow key={item._id} hover>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.value}</TableCell>
                                    <TableCell>{item.label}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDialog(item)} size="small" color="primary" aria-label="edit">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(item._id)} size="small" color="error" aria-label="delete">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
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
                    <TextField
                        autoFocus
                        margin="dense"
                        name="type"
                        label="Type *"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentValue.type}
                        onChange={(e) => setCurrentValue({ ...currentValue, type: e.target.value })}
                        // error={!!(error && !currentValue.type)} // Error prop on textfield can be complex
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
                        // error={!!(error && !currentValue.value)}
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
                        // error={!!(error && !currentValue.label)}
                    />
                </DialogContent>
                <DialogActions sx={{p: '16px 24px'}}>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DropdownManagement;
