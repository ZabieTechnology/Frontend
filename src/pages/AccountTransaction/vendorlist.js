import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { Edit, Delete, Visibility, GetApp, Add } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path if needed

const VendorListPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
      };
      const response = await axios.get(`${API_BASE_URL}/api/vendors`, { params, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setVendors(response.data.data);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setVendors([]);
        setTotalItems(0);
        setTotalPages(0);
        setError("Failed to fetch vendors: Invalid data format from server.");
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setError(`Error fetching vendors: ${err.response?.data?.message || err.message}`);
      setVendors([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleAddVendor = () => {
    navigate('/account-transaction/vendor/new'); // Navigate to vendor form for new vendor
  };

  const handleEditVendor = (vendorId) => {
    navigate(`/account-transaction/vendor/edit/${vendorId}`);
  };

  const handleViewVendor = (vendorId) => {
    navigate(`/account-transaction/vendor/edit/${vendorId}?view=true`);
  };

  const handleDeleteVendor = async (vendorId, vendorName) => {
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/vendors/${vendorId}`, { withCredentials: true });
      setSuccess(`Vendor "${vendorName}" deleted successfully.`);
      fetchVendors(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting vendor:", err);
      setError(`Failed to delete vendor: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDelete = (vendorId, vendorName) => {
    confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete vendor "${vendorName || vendorId}"?\nThis action cannot be revoked.`,
      onConfirmAction: () => handleDeleteVendor(vendorId, vendorName),
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeItemsPerPage = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Example summary stats (replace with actual logic if needed)
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const pendingVendors = vendors.filter(v => v.status === 'Pending').length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
      <ConfirmationDialog />

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
            <Typography variant="h5">{totalItems}</Typography>
            <Typography variant="subtitle1">Total Vendors</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
            <Typography variant="h5">{activeVendors}</Typography>
            <Typography variant="subtitle1">Active Vendors</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
            <Typography variant="h5">{pendingVendors}</Typography>
            <Typography variant="subtitle1">Pending Approval</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: {xs: 'flex-start', md: 'flex-end'}, alignItems: 'center' }}>
          <Button variant="contained" color="secondary" startIcon={<GetApp />}>
            Import Data
          </Button>
        </Grid>
      </Grid>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Vendor List</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search Vendors"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddVendor}>
              Add New Vendor
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                  <TableCell>Vendor Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>GST No.</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendors.length > 0 ? vendors.map((vendor) => (
                  <TableRow key={vendor._id} hover>
                    <TableCell>
                      <Link component="button" variant="body2" onClick={() => handleViewVendor(vendor._id)} sx={{ textAlign: 'left'}}>
                        {vendor.displayName || vendor.vendorName || 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>{vendor.primaryContact?.email || 'N/A'}</TableCell>
                    <TableCell>{vendor.primaryContact?.contact || 'N/A'}</TableCell>
                    <TableCell>{vendor.gstNo || 'N/A'}</TableCell>
                    <TableCell>{vendor.status || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="default" onClick={() => handleViewVendor(vendor._id)} aria-label="view">
                        <Visibility fontSize="small"/>
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditVendor(vendor._id)} aria-label="edit">
                        <Edit fontSize="small"/>
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => confirmDelete(vendor._id, vendor.displayName || vendor.vendorName)} aria-label="delete">
                        <Delete fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && totalItems > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">Items per page:</Typography>
              <Select value={itemsPerPage} onChange={handleChangeItemsPerPage} size="small" sx={{ ml: 1, mr: 2 }}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
              <Typography variant="body2">
                Showing {Math.min((page - 1) * itemsPerPage + 1, totalItems)}-{Math.min(page * itemsPerPage, totalItems)} of {totalItems}
              </Typography>
            </Box>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              variant="outlined"
              shape="rounded"
              color="primary"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VendorListPage;
