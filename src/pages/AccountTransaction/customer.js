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
  Link, // For clickable customer name
} from '@mui/material';
import { Edit, Delete, Visibility, GetApp, Add } from '@mui/icons-material'; // Added Add icon
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path as needed

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // For delete success messages

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filterDateRange, setFilterDateRange] = useState('this_month'); // Example filter

  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm, // Add search term to API params
        // dateRange: filterDateRange, // Add other filters if your API supports them
      };
      const response = await axios.get(`${API_BASE_URL}/api/customers`, { params, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setCustomers([]);
        setTotalItems(0);
        setTotalPages(0);
        setError("Failed to fetch customers: Invalid data format from server.");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(`Error fetching customers: ${err.response?.data?.message || err.message}`);
      setCustomers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, page, itemsPerPage, searchTerm /*, filterDateRange*/]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAddCustomer = () => {
    // Updated navigation path
    navigate('/account-transaction/customer/new');
  };

  const handleEditCustomer = (customerId) => {
    // Updated navigation path
    navigate(`/account-transaction/customer/edit/${customerId}`);
  };

  const handleViewCustomer = (customerId) => {
    // Updated navigation path, assuming CustomerForm.js handles the 'view' query param
    navigate(`/account-transaction/customer/edit/${customerId}?view=true`);
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/customers/${customerId}`, { withCredentials: true });
      setSuccess(`Customer "${customerName}" deleted successfully.`);
      fetchCustomers(); // Refresh the list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting customer:", err);
      setError(`Failed to delete customer: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDelete = (customerId, customerName) => {
    confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete customer "${customerName || customerId}"?\nThis action cannot be revoked.`,
      onConfirmAction: () => handleDeleteCustomer(customerId, customerName),
    });
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeItemsPerPage = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when items per page changes
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when search term changes
  };

  // Calculate summary stats (can be enhanced if API provides them)
  const activeCustomers = customers.filter(c => c.status === 'Active').length; // Assuming status field exists
  const pendingCustomers = customers.filter(c => c.status === 'Pending').length; // Assuming status field exists

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
      <ConfirmationDialog /> {/* From the hook */}

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
            <Typography variant="h5">{totalItems}</Typography>
            <Typography variant="subtitle1">Total Customers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
            <Typography variant="h5">{activeCustomers}</Typography>
            <Typography variant="subtitle1">Active Customers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff' }}>
            <Typography variant="h5">{pendingCustomers}</Typography>
            <Typography variant="subtitle1">Pending Approval</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: {xs: 'flex-start', md: 'flex-end'}, alignItems: 'center' }}>
          <Button variant="contained" color="secondary" startIcon={<GetApp />}>
            Import Data
          </Button>
        </Grid>
      </Grid>

      {/* Feedback Alerts */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Customer List</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Search Customers"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {/* <Select value={filterDateRange} onChange={(e) => setFilterDateRange(e.target.value)} size="small">
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="last_month">Last Month</MenuItem>
            </Select> */}
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddCustomer}>
              Add New Customer
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
                  {/* <TableCell>Customer ID</TableCell> */}
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Outstanding Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length > 0 ? customers.map((customer) => (
                  <TableRow key={customer._id} hover> {/* Use _id from MongoDB */}
                    {/* <TableCell>{customer.id || customer._id}</TableCell> */}
                    <TableCell>
                      <Link component="button" variant="body2" onClick={() => handleViewCustomer(customer._id)} sx={{ textAlign: 'left'}}>
                        {customer.displayName || customer.companyName || 'N/A'}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.primaryContact?.email || 'N/A'}</TableCell>
                    <TableCell>{customer.primaryContact?.contact || 'N/A'}</TableCell>
                    <TableCell>
                      {customer.financialDetails?.currency || '$'}
                      {customer.financialDetails?.openingBalance || 0} {/* Example field */}
                    </TableCell>
                    <TableCell>{customer.status || 'N/A'}</TableCell> {/* Assuming a status field */}
                    <TableCell align="right">
                      <IconButton size="small" color="default" onClick={() => handleViewCustomer(customer._id)} aria-label="view">
                        <Visibility fontSize="small"/>
                      </IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditCustomer(customer._id)} aria-label="edit">
                        <Edit fontSize="small"/>
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => confirmDelete(customer._id, customer.displayName || customer.companyName)} aria-label="delete">
                        <Delete fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No customers found.
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

export default CustomerListPage;
