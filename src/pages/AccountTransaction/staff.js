// src/pages/AccountTransaction/StaffListPage.js (or your preferred location)
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
  Switch, // For displaying boolean
  FormControlLabel
} from '@mui/material';
import { Edit, Delete, Visibility, Add } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path

const StaffListPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
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

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: itemsPerPage, search: searchTerm };
      const response = await axios.get(`${API_BASE_URL}/api/staff`, { params, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setStaffMembers(response.data.data);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setStaffMembers([]);
        setTotalItems(0);
        setTotalPages(0);
        setError("Failed to fetch staff: Invalid data format.");
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError(`Error fetching staff: ${err.response?.data?.message || err.message}`);
      setStaffMembers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = () => navigate('/account-transaction/staff/new');
  const handleEditStaff = (staffId) => navigate(`/account-transaction/staff/edit/${staffId}`);
  const handleViewStaff = (staffId) => navigate(`/account-transaction/staff/edit/${staffId}?view=true`);

  const handleDeleteStaff = async (staffId, staffName) => {
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/staff/${staffId}`, { withCredentials: true });
      setSuccess(`Staff member "${staffName}" deleted successfully.`);
      fetchStaff(); // Refresh
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete staff: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDelete = (staffId, staffName) => {
    confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete staff member "${staffName || staffId}"?`,
      onConfirmAction: () => handleDeleteStaff(staffId, staffName),
    });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeItemsPerPage = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
        Staff Management
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 2, bgcolor: '#fff', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Staff List</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField label="Search Staff" variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange}/>
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddStaff}>
              Add New Staff
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Reimbursement Claim</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffMembers.length > 0 ? staffMembers.map((staff) => (
                  <TableRow key={staff._id} hover>
                    <TableCell>
                      <Link component="button" variant="body2" onClick={() => handleViewStaff(staff._id)} sx={{ textAlign: 'left'}}>
                        {staff.firstName} {staff.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{staff.employeeId || 'N/A'}</TableCell>
                    <TableCell>{staff.email || 'N/A'}</TableCell>
                    <TableCell>{staff.mobile || 'N/A'}</TableCell>
                    <TableCell>{staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                        <Switch checked={!!staff.reimbursementClaimEnabled} readOnly size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewStaff(staff._id)}><Visibility fontSize="small"/></IconButton>
                      <IconButton size="small" color="primary" onClick={() => handleEditStaff(staff._id)}><Edit fontSize="small"/></IconButton>
                      <IconButton size="small" color="error" onClick={() => confirmDelete(staff._id, `${staff.firstName} ${staff.lastName}`)}><Delete fontSize="small"/></IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={7} align="center">No staff members found.</TableCell></TableRow>
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
                {[5, 10, 20, 50].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
              </Select>
              <Typography variant="body2">
                Showing {Math.min((page - 1) * itemsPerPage + 1, totalItems)}-{Math.min(page * itemsPerPage, totalItems)} of {totalItems}
              </Typography>
            </Box>
            <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary"/>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StaffListPage;
