// src/pages/settings/taxcompliancedetails/GSTManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import useConfirmationDialog from '../../../hooks/useConfirmationDialog';

const initialNewTaxState = {
  taxName: "",
  taxRate: "",
  head: "",
};

const headOptions = ["Outward", "Inward", "TCS", "TDS", "RCM", "GST Output", "GST Input", "GST on TCS", "GST on TDS", "Compensation Cess", "Other Cess", "General"];


function GSTManagement() {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newTaxData, setNewTaxData] = useState(initialNewTaxState);
  const [currentEditTax, setCurrentEditTax] = useState(null);
  const [gstHeadOptions, setGstHeadOptions] = useState([]);

  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchTaxRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gst-rates`, { params: { limit: -1 }, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setTaxRates(response.data.data);
      } else {
        setTaxRates([]);
        setError("Failed to fetch GST rates: Invalid data format.");
      }
    } catch (err) {
      console.error("Error fetching GST rates:", err);
      setError(`Error fetching GST rates: ${err.response?.data?.message || err.message}`);
      setTaxRates([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchGstHeadOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=GST_Head`, { withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        // Combine with predefined headOptions and remove duplicates if necessary
        const fetchedHeads = response.data.data.map(opt => opt.label);
        const combinedHeads = Array.from(new Set([...headOptions, ...fetchedHeads]));
        setGstHeadOptions(combinedHeads.map(head => ({value: head, label: head})));
      } else {
        console.warn("Failed to fetch GST Head options or invalid format:", response.data);
        setGstHeadOptions(headOptions.map(head => ({value: head, label: head}))); // Fallback to predefined
      }
    } catch (err) {
      console.error("Error fetching GST Head options:", err);
      setGstHeadOptions(headOptions.map(head => ({value: head, label: head}))); // Fallback
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTaxRates();
    fetchGstHeadOptions();
  }, [fetchTaxRates, fetchGstHeadOptions]);

  const handleOpenAddDialog = () => {
    setNewTaxData(initialNewTaxState);
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => setOpenAddDialog(false);
  const handleNewTaxChange = (event) => {
    const { name, value } = event.target;
    setNewTaxData(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveNewTax = async () => {
    if (!newTaxData.taxName || newTaxData.taxRate === '' || !newTaxData.head) {
      setError("Tax Name, Tax Rate, and Head are required.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setLoading(true); setError(null); setSuccess(null);
    try {
      await axios.post(`${API_BASE_URL}/api/gst-rates`, newTaxData, { withCredentials: true });
      setSuccess("New GST % added successfully.");
      fetchTaxRates();
      handleCloseAddDialog();
    } catch (err) {
      setError(`Failed to add GST rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false); setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleOpenEditDialog = (tax) => {
    setCurrentEditTax({
        _id: tax._id,
        taxName: tax.taxName,
        taxRate: tax.taxRate !== undefined ? tax.taxRate.toString() : '', // Handle undefined taxRate
        head: tax.head,
    });
    setOpenEditDialog(true);
  };
  const handleCloseEditDialog = () => { setOpenEditDialog(false); setCurrentEditTax(null); };
  const handleEditTaxChange = (event) => {
    const { name, value } = event.target;
    setCurrentEditTax(prev => ({ ...prev, [name]: value }));
  };
  const handleSaveEditTax = async () => {
    if (!currentEditTax || !currentEditTax.taxName || currentEditTax.taxRate === '' || !currentEditTax.head) {
      setError("Tax Name, Tax Rate, and Head are required for update.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setLoading(true); setError(null); setSuccess(null);
    try {
      await axios.put(`${API_BASE_URL}/api/gst-rates/${currentEditTax._id}`, currentEditTax, { withCredentials: true });
      setSuccess("GST rate updated successfully.");
      fetchTaxRates();
      handleCloseEditDialog();
    } catch (err) {
      setError(`Failed to update GST rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false); setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteTax = async (taxId) => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/gst-rates/${taxId}`, { withCredentials: true });
      setSuccess("GST rate deleted successfully.");
      fetchTaxRates();
    } catch (err) {
      setError(`Failed to delete GST rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false); setTimeout(() => setSuccess(null), 3000);
    }
  };

  const confirmDelete = (taxId, taxName) => {
    confirm({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete tax "${taxName || taxId}"? This action cannot be revoked.`,
      onConfirmAction: () => handleDeleteTax(taxId),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        GST Settings
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<AddIcon />} sx={{ mb: 3 }}>
        Add New GST %
      </Button>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my:3 }}><CircularProgress /></Box>}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tax Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Head</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tax Rate</TableCell> {/* Added Tax Rate Column */}
                <TableCell sx={{ fontWeight: 'bold' }}>SGST</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>CGST</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>IGST</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxRates.map((row, index) => (
                <TableRow key={row._id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.taxName}</TableCell>
                  <TableCell>{row.head}</TableCell>
                  <TableCell>{row.taxRate?.toFixed(2)}%</TableCell> {/* Display main Tax Rate */}
                  <TableCell>{row.sgstRate?.toFixed(2)}%</TableCell>
                  <TableCell>{row.cgstRate?.toFixed(2)}%</TableCell>
                  <TableCell>{row.igstRate?.toFixed(2)}%</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEditDialog(row)} aria-label="edit tax rate">
                      <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => confirmDelete(row._id, row.taxName)} aria-label="delete tax rate">
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {taxRates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No GST rates configured yet.</TableCell> {/* Adjusted colSpan */}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add New GST % Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Add New GST Rate</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="taxName" label="Tax Name" placeholder="e.g., GST 18% or Compensation Cess 12%" fullWidth value={newTaxData.taxName} onChange={handleNewTaxChange} required/>
          <TextField margin="dense" name="taxRate" label="Tax Rate (%)" placeholder="e.g., 18 or 12 for Cess" type="number" fullWidth value={newTaxData.taxRate} onChange={handleNewTaxChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }}/>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Head</InputLabel>
            <Select name="head" value={newTaxData.head} label="Head" onChange={handleNewTaxChange}>
              <MenuItem value=""><em>Select Head</em></MenuItem>
              {gstHeadOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleSaveNewTax} variant="contained" disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit GST % Dialog */}
      {currentEditTax && (
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Edit GST Rate</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" name="taxName" label="Tax Name" fullWidth value={currentEditTax.taxName} onChange={handleEditTaxChange} required/>
            <TextField margin="dense" name="taxRate" label="Tax Rate (%)" type="number" fullWidth value={currentEditTax.taxRate} onChange={handleEditTaxChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }}/>
            <FormControl fullWidth margin="dense" required>
                <InputLabel>Head</InputLabel>
                <Select name="head" value={currentEditTax.head} label="Head" onChange={handleEditTaxChange}>
                <MenuItem value=""><em>Select Head</em></MenuItem>
                {gstHeadOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button onClick={handleSaveEditTax} variant="contained" disabled={loading}>Update</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default GSTManagement;
