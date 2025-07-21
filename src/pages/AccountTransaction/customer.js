import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CircularProgress,
  Alert,
  Modal,
  Fade,
  Backdrop,
  InputAdornment,
  IconButton,
  Tooltip,
  Menu,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Switch,
  Chip,
  Divider,
  FormGroup,
  TableSortLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
    Edit,
    Delete,
    Visibility,
    GetApp,
    Add,
    Search,
    Settings,
    ArrowBack,
    PeopleAlt,
    CheckCircle,
    Warning,
    FilterList,
    UploadFile,
    ArrowUpward,
    ArrowDownward
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// --- Helper Components ---

const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const useConfirmationDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirmAction: () => {} });
  const confirm = ({ title, message, onConfirmAction }) => { setDialogConfig({ title, message, onConfirmAction }); setDialogOpen(true); };
  const handleClose = () => setDialogOpen(false);
  const handleConfirm = () => { dialogConfig.onConfirmAction(); handleClose(); };
  const ConfirmationDialog = () => (
    <Modal open={dialogOpen} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
      <Fade in={dialogOpen}><Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '1px solid #000', boxShadow: 24, p: 4, borderRadius: 2 }}>
          <Typography variant="h6" component="h2">{dialogConfig.title}</Typography><Typography sx={{ mt: 2 }}>{dialogConfig.message}</Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button variant="outlined" onClick={handleClose}>Cancel</Button><Button variant="contained" color="error" onClick={handleConfirm}>Confirm</Button></Box>
      </Box></Fade>
    </Modal>
  );
  return { confirm, ConfirmationDialog };
};

const SectionTitle = ({ children }) => <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#495057', mt: 2, mb: 2, borderBottom: '1px solid #dee2e6', pb: 1 }}>{children}</Typography>;
const DetailItem = ({ label, value }) => (
    <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography variant="body1">{value || '-'}</Typography>
    </Box>
);


// --- Customer Detail View Component ---

const CustomerDetailView = ({ customer, onBack, onEdit }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const handleTabChange = (_, newValue) => setTabIndex(newValue);
    if (!customer) return null;

    return (
        <Box>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
                 <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>Back to Customer List</Button>
                 <Typography variant="h4" gutterBottom>{customer.displayName}</Typography>
                <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Profile" />
                    <Tab label="Transactions" />
                </Tabs>
                <Box sx={{ pt: 3 }}>
                    {tabIndex === 0 && (
                        <Box>
                            <Paper variant="outlined" sx={{ p: 3, position: 'relative', borderRadius: 3 }}>
                                <Button variant="contained" startIcon={<Edit />} onClick={onEdit} sx={{ position: 'absolute', top: 16, right: 16, borderRadius: 2 }}>Edit Profile</Button>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <SectionTitle>Contact Details</SectionTitle>
                                        <DetailItem label="Company Name" value={customer.companyName} />
                                        <DetailItem label="Email" value={customer.primaryContact?.email} />
                                        <DetailItem label="Phone" value={customer.primaryContact?.contact} />
                                        <DetailItem label="Website" value={customer.primaryContact?.website} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <SectionTitle>Financial Details</SectionTitle>
                                        <DetailItem label="Outstanding Balance" value={`₹ ${customer.outstandingBalance?.toFixed(2) || '0.00'}`} />
                                        <DetailItem label="Payment Terms" value={customer.financialDetails?.paymentTerms} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    )}
                    {tabIndex === 1 && (
                        <Typography>Transaction details would be displayed here.</Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};


// --- Main Customer List Page Component ---

const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API base URL

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: itemsPerPage, search: searchTerm };
      // Replace with your actual API endpoint
      const response = await axios.get(`${API_BASE_URL}/api/customers`, { params, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setCustomers([]); setTotalItems(0); setTotalPages(0);
        setError("Failed to fetch customers: Invalid data format.");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(`Error fetching customers: ${err.response?.data?.message || 'An unexpected error occurred.'}`);
      setCustomers([]); setTotalItems(0); setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, searchTerm, API_BASE_URL]);

  useEffect(() => {
      if (view === 'list') {
          fetchCustomers();
      }
  }, [view, fetchCustomers]);

  const handleAddCustomer = () => {
    navigate('/account-transaction/customer/new');
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setView('detail');
  };

  const handleEditNavigation = (customerId) => {
    navigate(`/account-transaction/customer/edit/${customerId}`);
  };

  const handleDeleteCustomer = async (customerId, customerName) => {
    try {
      // Replace with your actual API endpoint
      await axios.delete(`${API_BASE_URL}/api/customers/${customerId}`, { withCredentials: true });
      setSuccess(`Customer "${customerName}" deleted successfully.`);
      fetchCustomers(); // Refresh the list
    } catch (err) {
      setError(`Failed to delete customer: ${err.response?.data?.message || 'An unexpected error occurred.'}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDelete = (customerId, customerName) => {
    confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete customer "${customerName || customerId}"? This action cannot be revoked.`,
      onConfirmAction: () => handleDeleteCustomer(customerId, customerName),
    });
  };

  const getStatus = (customer) => {
      if (customer.outstandingBalance > 0) {
          return { label: 'Overdue', color: 'warning', icon: <Warning /> };
      }
      return { label: 'Active', color: 'success', icon: <CheckCircle /> };
  };

  if (view === 'detail') {
      return <CustomerDetailView customer={selectedCustomer} onBack={() => setView('list')} onEdit={() => handleEditNavigation(selectedCustomer._id)} />
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc' }}>
      <ConfirmationDialog />
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>Customer List</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <TextField variant="outlined" size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment>, sx: {borderRadius: 2} }}/>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddCustomer} sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: 2 }}>Add New Customer</Button>
          </Box>
        </Box>
        {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><CircularProgress /></Box> : (
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell align="right">Outstanding Balance</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => {
                            const currentStatus = getStatus(customer);
                            return (
                                <TableRow key={customer._id} hover>
                                   <TableCell>{customer.displayName}</TableCell>
                                   <TableCell>{customer.primaryContact?.email}</TableCell>
                                   <TableCell>{customer.primaryContact?.contact}</TableCell>
                                   <TableCell align="right">{formatCurrency(customer.outstandingBalance)}</TableCell>
                                   <TableCell>
                                       <Chip icon={currentStatus.icon} label={currentStatus.label} color={currentStatus.color} size="small" />
                                   </TableCell>
                                   <TableCell align="center">
                                        <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewCustomer(customer)}><Visibility fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleEditNavigation(customer._id)}><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => confirmDelete(customer._id, customer.displayName)}><Delete fontSize="small" /></IconButton></Tooltip>
                                   </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </Paper>
      {!loading && totalItems > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">Showing {Math.min((page - 1) * itemsPerPage + 1, totalItems)}-{Math.min(page * itemsPerPage, totalItems)} of {totalItems} customers</Typography>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}/>
        </Box>
      )}
    </Box>
  );
};

export default function App() {
  return <CustomerListPage />;
}
