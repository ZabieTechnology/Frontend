// src/pages/AccountTransaction/AccountListPage.js (or your ChartOfAccounts.js)
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  IconButton,
  TableSortLabel,
  Typography,
  TextField,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Link,
  Tooltip
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path if needed

// Moved tabCategories outside the component to prevent re-creation on every render
const tabCategories = [
    "All Accounts", // Index 0
    "Asset",        // Index 1
    "Liability",    // Index 2
    "Equity",       // Index 3
    "Expense",      // Index 4
    "Income",       // Index 5 (Revenue)
    "Tax",          // Index 6 (This will fetch from ca_tax)
    "Inactive"      // Index 7
];

const AccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [currentTab, setCurrentTab] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    let endpoint = `${API_BASE_URL}/api/chart-of-accounts`;
    let params = {
      page,
      limit: itemsPerPage,
      search: searchTerm,
      // Send category only if it's not "All Accounts" or "Tax" (handled differently)
      // Backend needs to know that "All Accounts" means no category filter or a specific value.
      // And "Tax" tab has its own endpoint.
    };

    const currentCategory = tabCategories[currentTab];

    if (currentCategory === "Tax") {
      endpoint = `${API_BASE_URL}/api/gst-rates/derived-tax-accounts`;
      // For the "Tax" tab, only send parameters that its specific endpoint expects.
      // If it doesn't support search, page, limit, remove them or adjust.
      // Keeping them for now, assuming the backend might handle them.
      params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
      };
    } else if (currentCategory !== "All Accounts") {
      // For specific categories like "Asset", "Liability", etc.
      params.category = currentCategory;
    }
    // For "All Accounts", params.category will not be set, so backend should fetch all (excluding inactive if that's the logic)

    try {
      const response = await axios.get(endpoint, { params, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setAccounts(response.data.data);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setAccounts([]);
        setTotalItems(0);
        setTotalPages(0);
        setError(`Failed to fetch data for ${currentCategory}: Invalid data format.`);
      }
    } catch (err) {
      console.error(`Error fetching ${currentCategory}:`, err);
      setError(`Error fetching ${currentCategory}: ${err.response?.data?.message || err.message}`);
      setAccounts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, page, itemsPerPage, searchTerm, currentTab]); // CORRECTED: Removed unnecessary dependencies 'order' and 'orderBy'

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(1);
    setOrderBy('name'); // Reset orderBy when tab changes
    setOrder('asc');
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(1); // Reset to first page when sorting changes
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const orderResult = comparator(a[0], b[0]);
      if (orderResult !== 0) return orderResult;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (sortOrder, sortBy) => {
    return sortOrder === 'desc'
      ? (a, b) => descendingComparator(a, b, sortBy)
      : (a, b) => -descendingComparator(a, b, sortBy);
  };

  const descendingComparator = (a, b, sortBy) => {
    const isTaxTab = tabCategories[currentTab] === "Tax";
    // Use 'taxRate' for sorting if on Tax tab and orderBy is 'gstTaxRate' (which is the ID in coaHeadCells)
    // or if orderBy is directly 'taxRate' (which is the ID in caTaxHeadCells)
    const actualSortByField = isTaxTab && (sortBy === 'gstTaxRate' || sortBy === 'taxRate') ? 'taxRate' : sortBy;

    if (b[actualSortByField] < a[actualSortByField]) return -1;
    if (b[actualSortByField] > a[actualSortByField]) return 1;
    return 0;
  };

  const sortedAccounts = accounts ? stableSort(accounts, getComparator(order, orderBy)) : [];

  const coaHeadCells = [
    { id: 'isFavorite', numeric: false, disablePadding: true, label: '', sortable: true },
    { id: 'code', numeric: false, disablePadding: false, label: 'Code', sortable: true },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
    { id: 'parentCategory', numeric: false, disablePadding: false, label: 'Heads/Category', sortable: true },
    { id: 'gstTaxRate', numeric: false, disablePadding: false, label: 'Default Tax', sortable: true },
    { id: 'description', numeric: false, disablePadding: false, label: 'Description', sortable: true },
    { id: 'status', numeric: false, disablePadding: false, label: 'Status', sortable: true },
    { id: 'actions', numeric: false, disablePadding: false, label: 'Actions', sortable: false },
  ];

  const caTaxHeadCells = [
    { id: 'code', numeric: false, disablePadding: false, label: 'Code', sortable: true },
    { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
    { id: 'taxType', numeric: false, disablePadding: false, label: 'Tax Type', sortable: true },
    { id: 'head', numeric: false, disablePadding: false, label: 'Heads', sortable: true },
    { id: 'taxRate', numeric: false, disablePadding: false, label: 'Tax Rate (%)', sortable: true },
  ];

  const currentHeadCells = tabCategories[currentTab] === "Tax" ? caTaxHeadCells : coaHeadCells;

  const handleAddAccountClick = () => {
    navigate('/account-transaction/chart-of-accounts/new');
  };

  const handleEditAccountClick = (accountId) => {
    navigate(`/account-transaction/chart-of-accounts/edit/${accountId}`);
  };

  const handleViewAccountClick = (accountId) => {
    navigate(`/account-transaction/chart-of-accounts/edit/${accountId}?view=true`);
  };

  const handleDeleteAccount = async (accountId, accountName) => {
    setError(null); setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/chart-of-accounts/${accountId}`, { withCredentials: true });
      setSuccess(`Account "${accountName}" deleted successfully.`);
      fetchAccounts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete account: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDeleteAccount = (accountId, accountName) => {
    confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete account "${accountName || accountId}"? This action cannot be revoked.`,
      onConfirmAction: () => handleDeleteAccount(accountId, accountName),
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

  return (
    <Box sx={{ p: 3 }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
        Chart of Accounts
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <TextField
            label={`Search ${tabCategories[currentTab]}`}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ minWidth: '300px' }}
        />
        {tabCategories[currentTab] !== "Tax" && (
            <Button variant="outlined" sx={{ mr: 1 }} onClick={handleAddAccountClick} startIcon={<AddIcon />}>
                Add Account
            </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleChangeTab} aria-label="account-tabs" variant="scrollable" scrollButtons="auto">
          {tabCategories.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 750 }} aria-label="chart of accounts table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                {currentHeadCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    padding={headCell.disablePadding ? 'none' : 'default'}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAccounts.length > 0 ? sortedAccounts.map((account) => (
                <TableRow key={account._id} hover>
                  {tabCategories[currentTab] !== "Tax" && (
                    <TableCell padding="none">
                      <IconButton size="small" onClick={() => alert('Toggle favorite not implemented yet for COA')}>
                        {account.isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>
                  )}
                  <TableCell>{account.code}</TableCell>
                  <TableCell>
                    {tabCategories[currentTab] !== "Tax" ? (
                      <Link component="button" variant="body2" onClick={() => handleViewAccountClick(account._id)} sx={{ textAlign: 'left' }}>
                        {account.name}
                      </Link>
                    ) : (
                      account.name
                    )}
                  </TableCell>
                  {tabCategories[currentTab] === "Tax" ? (
                    <>
                      <TableCell>{account.taxType}</TableCell>
                      <TableCell>{account.head}</TableCell>
                      <TableCell>{account.taxRate?.toFixed(2)}%</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{account.parentCategory || account.accountType || 'N/A'}</TableCell>
                      <TableCell>{account.gstTaxRate ? `${account.gstTaxRate}%` : 'N/A'}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Tooltip title={account.description || ''}>
                            <span>{account.description || 'N/A'}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{account.status || 'Active'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleViewAccountClick(account._id)}><VisibilityIcon fontSize="small"/></IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleEditAccountClick(account._id)}><EditIcon fontSize="small"/></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => confirmDeleteAccount(account._id, account.name)}><DeleteIcon fontSize="small"/></IconButton>
                        </Tooltip>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={currentHeadCells.length} align="center">
                    No accounts found for the selected criteria.
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
              {[5, 10, 20, 50, 100].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
            </Select>
            <Typography variant="body2">
              Showing {Math.min((page - 1) * itemsPerPage + 1, totalItems)}-{Math.min(page * itemsPerPage, totalItems)} of {totalItems}
            </Typography>
          </Box>
          <Pagination
            count={totalPages}
            page={page} // MUI Pagination is 1-based for 'page' prop when displaying, but 0-based for onChange
            onChange={(event, newPage) => handleChangePage(event, newPage)} // Pass newPage directly
            color="primary"
            variant="outlined"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default AccountListPage;
