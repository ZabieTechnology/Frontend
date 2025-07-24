// src/pages/AccountTransaction/AccountListPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Popover,
  Menu,
  Checkbox,
  FormControlLabel,
  Toolbar,
  Drawer,
  styled,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'; // Balance Sheet
import EqualizerIcon from '@mui/icons-material/Equalizer'; // Profit & Loss
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path if needed

const allHeadCells = [
    { id: 'nature', label: 'Nature', sortable: true, filterable: true },
    { id: 'mainHead', label: 'Main Head', sortable: true, filterable: true },
    { id: 'parentCategory', label: 'Category', sortable: true, filterable: true },
    { id: 'code', label: 'Account Code', sortable: true, filterable: true },
    { id: 'name', label: 'Account Name', sortable: true, filterable: true },
    { id: 'openingBalance', label: 'Opening Balance', sortable: true, numeric: true },
    { id: 'description', label: 'Description', sortable: false },
    { id: 'subAccount', label: 'Sub Account', sortable: true, filterable: true },
    { id: 'paymentEnabled', label: 'Payment Enabled', sortable: true, filterable: true },
    { id: 'isLocked', label: 'Locked', sortable: true, filterable: true },
    { id: 'actions', label: 'Actions', sortable: false },
];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

// A dedicated component for the filter popover
const FilterPopover = ({ open, anchorEl, onClose, columnName, options, selectedValues, onApplyFilter }) => {
    const [currentSelection, setCurrentSelection] = useState(selectedValues);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setCurrentSelection(selectedValues);
    }, [selectedValues, open]);

    const handleToggle = (value) => {
        const newSelection = new Set(currentSelection);
        if (newSelection.has(value)) {
            newSelection.delete(value);
        } else {
            newSelection.add(value);
        }
        setCurrentSelection(Array.from(newSelection));
    };

    const handleSelectAll = () => {
        if (currentSelection.length === filteredOptions.length) {
            setCurrentSelection([]);
        } else {
            setCurrentSelection(filteredOptions.map(opt => opt.value));
        }
    };

    const handleApply = () => {
        onApplyFilter(currentSelection);
        onClose();
    };

    const filteredOptions = useMemo(() => options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

    return (
        <Popover open={open} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Box sx={{ p: 2, width: 280, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter by {columnName}</Typography>
                <TextField placeholder="Search values..." variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                     <Button onClick={handleSelectAll}>
                        {currentSelection.length === filteredOptions.length ? 'Clear' : 'Select All'}
                    </Button>
                    <Button onClick={() => setCurrentSelection([])}>Clear All</Button>
                </Box>
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {filteredOptions.map(option => (
                        <ListItem key={option.value} dense disablePadding>
                           <FormControlLabel control={<Checkbox checked={currentSelection.includes(option.value)} onChange={() => handleToggle(option.value)} />} label={option.label} sx={{width: '100%'}}/>
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleApply}>Apply</Button>
                </Box>
            </Box>
        </Popover>
    );
};

const AccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState([]);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [previewType, setPreviewType] = useState('');

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);

  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(allHeadCells.reduce((acc, headCell) => ({ ...acc, [headCell.id]: true }), {}));

  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const [allAccountsForPreview, setAllAccountsForPreview] = useState([]);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const endpoint = `${API_BASE_URL}/api/chart-of-accounts`;
    const params = {
      page,
      limit: itemsPerPage,
      search: searchTerm,
      orderBy,
      order,
      ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value.join(',')]).filter(([, value]) => value))
    };

    try {
      const response = await axios.get(endpoint, { params, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setAccounts(response.data.data);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setAccounts([]); setError(`Failed to fetch accounts: Invalid data format.`);
      }
    } catch (err) {
      setError(`Error fetching accounts: ${err.response?.data?.message || err.message}`);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, page, itemsPerPage, searchTerm, orderBy, order, filters]);

  useEffect(() => {
    fetchAccounts();
    setSelected([]);
  }, [fetchAccounts]);

  useEffect(() => {
      const fetchAllForPreview = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/chart-of-accounts`, { params: { limit: 1000 }, withCredentials: true });
            if (data && Array.isArray(data.data)) setAllAccountsForPreview(data.data);
        } catch (error) {
             console.error(`Error fetching all accounts for preview:`, error);
        }
      };
      fetchAllForPreview();
  }, [API_BASE_URL, success]);

  const filterOptions = useMemo(() => {
    const options = {};
    allHeadCells.forEach(headCell => {
        if (headCell.filterable) {
            const uniqueValues = new Set(allAccountsForPreview.map(acc => {
                if(headCell.id === 'paymentEnabled' || headCell.id === 'isLocked') return acc[headCell.id] ? 'Yes' : 'No';
                return acc[headCell.id] || 'N/A';
            }));
            options[headCell.id] = Array.from(uniqueValues).map(val => ({ label: String(val), value: val }));
        }
    });
    return options;
  }, [allAccountsForPreview]);

  const handleRequestSort = (property) => {
    setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => setSelected(event.target.checked ? accounts.map((n) => n._id) : []);

  const handleClick = (event, id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(Array.from(newSelected));
  };

  const isSelected = (id) => selected.includes(id);

  const handleAddAccountClick = () => navigate('/account-transaction/chart-of-accounts/new');
  const handleEditAccountClick = (accountId) => navigate(`/account-transaction/chart-of-accounts/edit/${accountId}`);
  const handleViewAccountClick = (accountId) => navigate(`/account-transaction/chart-of-accounts/edit/${accountId}?view=true`);

  const handleDeleteAccount = async (accountIds) => {
    setError(null); setSuccess(null);
    try {
      await Promise.all(accountIds.map(id => axios.delete(`${API_BASE_URL}/api/chart-of-accounts/${id}`, { withCredentials: true })));
      setSuccess(`Successfully deleted ${accountIds.length} account(s).`);
      fetchAccounts();
      setSelected([]);
    } catch (err) {
      setError(`Failed to delete account(s): ${err.response?.data?.message || err.message}`);
    }
  };

  const confirmDelete = (accountIds) => {
     const message = accountIds.length > 1 ? `Are you sure you want to delete these ${accountIds.length} accounts?` : `Are you sure you want to delete this account?`;
     confirm({ title: 'Confirm Deletion', message, onConfirmAction: () => handleDeleteAccount(accountIds) });
  };

  const handleFilterIconClick = (event, columnId) => {
    setActiveFilterColumn(columnId);
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterApply = (selectedValues) => {
    setFilters(prev => ({...prev, [activeFilterColumn]: selectedValues}));
    setPage(1);
  };

  const handleColumnVisibilityChange = (columnId) => setVisibleColumns((prev) => ({ ...prev, [columnId]: !prev[columnId] }));

  const handlePreviewClick = (type) => { setPreviewType(type); setDrawerOpen(true); };

  const renderAccountList = (list, title) => (
    <List dense subheader={<ListSubheader sx={{bgcolor: 'inherit', fontWeight: 'bold'}}>{title}</ListSubheader>}>
      {list.length > 0 ? list.map(acc => <ListItem key={acc._id} sx={{py: 0, pl: 4}}><ListItemText primary={acc.name} secondary={acc.code} /></ListItem>) : <ListItem sx={{pl: 4}}><ListItemText primaryTypographyProps={{ color: 'text.secondary', fontStyle: 'italic' }}>No accounts yet</ListItemText></ListItem>}
    </List>
  );

  const assetAccounts = allAccountsForPreview.filter(a => a.parentCategory === 'Asset');
  const liabilityAccounts = allAccountsForPreview.filter(a => a.parentCategory === 'Liability');
  const equityAccounts = allAccountsForPreview.filter(a => a.parentCategory === 'Equity');
  const incomeAccounts = allAccountsForPreview.filter(a => a.parentCategory === 'Income');
  const expenseAccounts = allAccountsForPreview.filter(a => a.parentCategory === 'Expense');

  const visibleHeadCells = allHeadCells.filter(headCell => visibleColumns[headCell.id]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9fafb' }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#111827' }}>Chart of Accounts</Typography>

      <Alert severity="info" sx={{mb: 2}}>Note: Filters are based on all accounts in the system, not just the currently displayed page.</Alert>
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ width: '100%', mb: 2, borderRadius: '12px', overflow: 'hidden' }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, ...(selected.length > 0 && { bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity), }), display: 'flex', justifyContent: 'space-between' }}>
            {selected.length > 0 ? (<Typography color="inherit" variant="subtitle1">{selected.length} selected</Typography>) : (<TextField label="Search Accounts" variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ flexGrow: 1, maxWidth: '400px' }} />)}
            {selected.length > 0 ? (<Tooltip title="Delete"><IconButton onClick={() => confirmDelete(selected)}><DeleteIcon /></IconButton></Tooltip>) : (
                <Box>
                  <Tooltip title="Balance Sheet Preview"><IconButton onClick={() => handlePreviewClick('balanceSheet')}><AssessmentOutlinedIcon /></IconButton></Tooltip>
                  <Tooltip title="Profit & Loss Preview"><IconButton onClick={() => handlePreviewClick('profitAndLoss')}><EqualizerIcon /></IconButton></Tooltip>
                  <Button variant="contained" onClick={handleAddAccountClick} startIcon={<AddIcon />} sx={{mx: 1, borderRadius: '8px'}}>Add Account</Button>
                  <IconButton onClick={(e) => setColumnMenuAnchorEl(e.currentTarget)}><MoreVertIcon /></IconButton>
                </Box>
            )}
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox indeterminate={selected.length > 0 && selected.length < accounts.length} checked={accounts.length > 0 && selected.length === accounts.length} onChange={handleSelectAllClick} /></TableCell>
                {visibleHeadCells.map((headCell) => (
                  <TableCell key={headCell.id} align='left' sortDirection={orderBy === headCell.id ? order : false}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                       <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleRequestSort(headCell.id)}>{headCell.label}</TableSortLabel>
                       {headCell.filterable && <IconButton size="small" onClick={(e) => handleFilterIconClick(e, headCell.id)}><FilterListIcon fontSize="small" color={filters[headCell.id]?.length > 0 ? 'primary' : 'inherit'}/></IconButton>}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={visibleHeadCells.length + 2} align="center"><CircularProgress /></TableCell></TableRow> :
              accounts.length > 0 ? accounts.map((account) => {
                const isItemSelected = isSelected(account._id);
                return (
                <StyledTableRow hover onClick={(event) => handleClick(event, account._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={account._id} selected={isItemSelected}>
                  <TableCell padding="checkbox"><Checkbox checked={isItemSelected} /></TableCell>
                  {visibleColumns.nature && <TableCell>{account.nature || 'N/A'}</TableCell>}
                  {visibleColumns.mainHead && <TableCell>{account.mainHead || 'N/A'}</TableCell>}
                  {visibleColumns.parentCategory && <TableCell>{account.parentCategory || 'N/A'}</TableCell>}
                  {visibleColumns.code && <TableCell>{account.code}</TableCell>}
                  {visibleColumns.name && <TableCell><Link component="button" variant="body2" onClick={(e) => { e.stopPropagation(); handleViewAccountClick(account._id); }}>{account.name}</Link></TableCell>}
                  {visibleColumns.openingBalance && <TableCell align="right">{account.openingBalance != null ? account.openingBalance.toLocaleString() : 'N/A'}</TableCell>}
                  {visibleColumns.description && <TableCell><Tooltip title={account.description || ''}><Typography noWrap sx={{maxWidth: 150}}>{account.description || 'N/A'}</Typography></Tooltip></TableCell>}
                  {visibleColumns.subAccount && <TableCell>{account.subAccount || 'N/A'}</TableCell>}
                  {visibleColumns.paymentEnabled && <TableCell align="center">{account.paymentEnabled ? <CheckCircleOutlineIcon color="success" /> : <CancelOutlinedIcon color="error" />}</TableCell>}
                  {visibleColumns.isLocked && <TableCell align="center">{account.isLocked ? <LockIcon color="action" /> : <LockOpenIcon color="action" />}</TableCell>}
                  {visibleColumns.actions && <TableCell align="right">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditAccountClick(account._id); }}><EditIcon fontSize="small"/></IconButton>
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); confirmDelete([account._id]); }}><DeleteIcon fontSize="small"/></IconButton>
                  </TableCell>}
                </StyledTableRow>
              )}) : <TableRow><TableCell colSpan={visibleHeadCells.length + 2} align="center">No accounts found for the current filters.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{mr: 1}}>Rows:</Typography>
                <Select value={itemsPerPage} onChange={(e) => {setItemsPerPage(e.target.value); setPage(1);}} size="small" sx={{ mr: 2 }}>{[10, 20, 50, 100].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}</Select>
                <Typography variant="body2" color="text.secondary">{totalItems > 0 ? `${((page - 1) * itemsPerPage) + 1}-${Math.min(page * itemsPerPage, totalItems)} of ${totalItems}` : '0 items'}</Typography>
            </Box>
            <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>
      </Paper>

       <Drawer anchor="right" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
         <Box sx={{ width: 400, p: 2 }}>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}><Typography variant="h6">{previewType === 'balanceSheet' ? 'Balance Sheet' : 'Profit & Loss'}</Typography><IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton></Box>
           {previewType === 'balanceSheet' && (<Box>{renderAccountList(assetAccounts, 'Assets')}{renderAccountList(liabilityAccounts, 'Liabilities')}{renderAccountList(equityAccounts, 'Equity')}</Box>)}
           {previewType === 'profitAndLoss' && (<Box>{renderAccountList(incomeAccounts, 'Income')}{renderAccountList(expenseAccounts, 'Expenses')}</Box>)}
         </Box>
       </Drawer>

       {activeFilterColumn && <FilterPopover open={Boolean(filterAnchorEl)} anchorEl={filterAnchorEl} onClose={() => setFilterAnchorEl(null)} columnName={allHeadCells.find(h => h.id === activeFilterColumn)?.label} options={filterOptions[activeFilterColumn] || []} selectedValues={filters[activeFilterColumn] || []} onApplyFilter={handleFilterApply} />}

       <Menu anchorEl={columnMenuAnchorEl} open={Boolean(columnMenuAnchorEl)} onClose={() => setColumnMenuAnchorEl(null)}>
            <Typography sx={{px: 2, py: 1}}>Visible Columns</Typography>
            {allHeadCells.filter(hc => hc.id !== 'actions').map((headCell) => (<MenuItem key={headCell.id}><FormControlLabel control={<Checkbox checked={visibleColumns[headCell.id]} onChange={() => handleColumnVisibilityChange(headCell.id)}/>} label={headCell.label} /></MenuItem>))}
       </Menu>
    </Box>
  );
};

export default AccountListPage;
