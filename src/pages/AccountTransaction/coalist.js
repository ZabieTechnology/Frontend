// src/pages/AccountTransaction/AccountListPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import { styled, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog';

// --- Constants ---
const ALL_HEAD_CELLS = [
    { id: 'nature', label: 'Nature', sortable: true, filterable: true },
    { id: 'mainHead', label: 'Main Head', sortable: true, filterable: true },
    { id: 'category', label: 'Category', sortable: true, filterable: true },
    { id: 'code', label: 'Account Code', sortable: true, filterable: true },
    { id: 'name', label: 'Account Name', sortable: true, filterable: true },
    { id: 'openingBalance', label: 'Opening Balance', sortable: true, numeric: true },
    { id: 'description', label: 'Description', sortable: false },
    { id: 'subAccount', label: 'Sub Account', sortable: true, filterable: true },
    { id: 'paymentEnabled', label: 'Payment Enabled', sortable: true, filterable: true },
    { id: 'actions', label: 'Actions', sortable: false },
];

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const LEFT_ALIGNED_COLUMNS = ['nature', 'mainHead', 'category', 'name', 'description', 'subAccount'];

// --- Styled Components ---
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
   '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
  },
}));

const PageWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    }
}));


// --- Child Components ---
const FilterPopover = React.memo(({ open, anchorEl, onClose, columnName, options, selectedValues, onApplyFilter }) => {
    const [currentSelection, setCurrentSelection] = useState(selectedValues);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setCurrentSelection(selectedValues);
    }, [selectedValues, open]);

    const handleToggle = (value) => {
        const newSelection = new Set(currentSelection);
        newSelection.has(value) ? newSelection.delete(value) : newSelection.add(value);
        setCurrentSelection(Array.from(newSelection));
    };

    const filteredOptions = useMemo(() => options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

    const handleSelectAll = () => {
        setCurrentSelection(currentSelection.length === filteredOptions.length ? [] : filteredOptions.map(opt => opt.value));
    };

    const handleApply = () => {
        onApplyFilter(currentSelection);
        onClose();
    };


    return (
        <Popover open={open} anchorEl={anchorEl} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Box sx={{ p: 2, width: 280, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Filter by {columnName}</Typography>
                <TextField placeholder="Search values..." variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                     <FormControlLabel
                        control={<Checkbox
                            checked={filteredOptions.length > 0 && currentSelection.length === filteredOptions.length}
                            indeterminate={currentSelection.length > 0 && currentSelection.length < filteredOptions.length}
                            onChange={handleSelectAll}
                        />}
                        label="Select All"
                    />
                    <Button onClick={() => setCurrentSelection([])} size="small">Clear</Button>
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
});


const AccountListPage = () => {
  // --- State Management ---
  const [accounts, setAccounts] = useState([]);
  const [allAccountsForPreview, setAllAccountsForPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Selection State
  const [selected, setSelected] = useState([]);

  // Drawer and Preview State
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [previewType, setPreviewType] = useState('');

  // Sorting and Pagination State
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [totalItems, setTotalItems] = useState(0);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);

  // Column Visibility State
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(ALL_HEAD_CELLS.reduce((acc, headCell) => ({ ...acc, [headCell.id]: true }), {}));

  // --- Hooks ---
  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  // --- Data Fetching ---
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
  }, [fetchAccounts]);

  useEffect(() => {
      const fetchAllForPreview = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/chart-of-accounts`, { params: { limit: -1 }, withCredentials: true });
            if (data && Array.isArray(data.data)) setAllAccountsForPreview(data.data);
        } catch (error) {
             console.error(`Error fetching all accounts for preview:`, error);
        }
      };
      fetchAllForPreview();
  }, [API_BASE_URL, success]);


  // --- Memoized Values ---
  const filterOptions = useMemo(() => {
    const options = {};
    ALL_HEAD_CELLS.forEach(headCell => {
        if (headCell.filterable) {
            const uniqueValues = new Set(allAccountsForPreview.map(acc => {
                if(headCell.id === 'paymentEnabled') return acc[headCell.id] ? 'Yes' : 'No';
                return acc[headCell.id] || 'N/A';
            }));
            options[headCell.id] = Array.from(uniqueValues).map(val => ({ label: String(val), value: val }));
        }
    });
    return options;
  }, [allAccountsForPreview]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const visibleHeadCells = ALL_HEAD_CELLS.filter(headCell => visibleColumns[headCell.id]);

  // --- Event Handlers ---
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => setSelected(event.target.checked ? accounts.map((n) => n._id) : []);
  const handleClick = (id) => {
    const newSelected = new Set(selected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelected(Array.from(newSelected));
  };

  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleItemsPerPageChange = (event) => {
      setItemsPerPage(parseInt(event.target.value, 10));
      setPage(1);
  };

  const handleArchiveAccount = async (accountIds) => {
    setError(null); setSuccess(null);
    try {
      await Promise.all(accountIds.map(id => axios.put(`${API_BASE_URL}/api/chart-of-accounts/${id}`, { status: 'Inactive' }, { withCredentials: true })));
      setSuccess(`Successfully archived ${accountIds.length} account(s).`);
      fetchAccounts();
      setSelected([]);
    } catch (err) {
      setError(`Failed to archive account(s): ${err.response?.data?.message || err.message}`);
    }
  };

  const confirmArchive = (accountIds) => {
     const message = accountIds.length > 1 ? `Are you sure you want to archive these ${accountIds.length} accounts?` : `Are you sure you want to archive this account?`;
     confirm({ title: 'Confirm Archival', message, onConfirmAction: () => handleArchiveAccount(accountIds) });
  };

  const handleFilterIconClick = (event, columnId) => {
    setActiveFilterColumn(columnId);
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterApply = useCallback((selectedValues) => {
    setFilters(prev => ({...prev, [activeFilterColumn]: selectedValues}));
    setPage(1);
  },[activeFilterColumn]);

  const handleColumnVisibilityChange = (columnId) => setVisibleColumns((prev) => ({ ...prev, [columnId]: !prev[columnId] }));
  const handlePreviewClick = (type) => { setPreviewType(type); setDrawerOpen(true); };

  // --- Render Functions ---
  const renderAccountList = (list, title) => (
    <List dense subheader={<ListSubheader sx={{bgcolor: 'inherit', fontWeight: 'bold'}}>{title}</ListSubheader>}>
      {list.length > 0 ? list.map(acc => <ListItem key={acc._id} sx={{py: 0, pl: 4}}><ListItemText primary={acc.name} secondary={acc.code} /></ListItem>) : <ListItem sx={{pl: 4}}><ListItemText primaryTypographyProps={{ color: 'text.secondary', fontStyle: 'italic' }}>No accounts found.</ListItemText></ListItem>}
    </List>
  );

  const assetAccounts = useMemo(() => allAccountsForPreview.filter(a => a.nature === 'Assets'), [allAccountsForPreview]);
  const liabilityAccounts = useMemo(() => allAccountsForPreview.filter(a => a.nature === 'Liability'), [allAccountsForPreview]);
  const equityAccounts = useMemo(() => allAccountsForPreview.filter(a => a.nature === 'Equity'), [allAccountsForPreview]);
  const incomeAccounts = useMemo(() => allAccountsForPreview.filter(a => a.nature === 'Income'), [allAccountsForPreview]);
  const expenseAccounts = useMemo(() => allAccountsForPreview.filter(a => a.nature === 'Expense'), [allAccountsForPreview]);

  return (
    <PageWrapper>
      <CssBaseline />
      <ConfirmationDialog />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Chart of Accounts
        </Typography>
        <Button variant="contained" onClick={() => navigate('/account-transaction/chart-of-accounts/new')} startIcon={<AddIcon />} sx={{ borderRadius: '8px' }}>
            Add Account
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
      <Alert severity="info" sx={{mb: 2, display: 'flex', alignItems: 'center'}}>
        Note: Filters are based on all accounts in the system, not just the currently displayed page.
      </Alert>

      <Paper sx={{ width: '100%', mb: 2, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Toolbar sx={{ p: { sm: 2 }, ...(selected.length > 0 && { bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity) })}}>
            {selected.length > 0 ? (
                 <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="inherit" variant="subtitle1">{selected.length} selected</Typography>
                    <Tooltip title="Archive">
                        <IconButton onClick={() => confirmArchive(selected)}><ArchiveIcon /></IconButton>
                    </Tooltip>
                 </Box>
            ) : (
                <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <TextField
                        label="Search Accounts"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                        sx={{ flexGrow: 1, maxWidth: '400px' }}
                    />
                    <Box>
                        <Tooltip title="Balance Sheet Preview"><IconButton onClick={() => handlePreviewClick('balanceSheet')}><AssessmentOutlinedIcon /></IconButton></Tooltip>
                        <Tooltip title="Profit & Loss Preview"><IconButton onClick={() => handlePreviewClick('profitAndLoss')}><EqualizerIcon /></IconButton></Tooltip>
                        <Tooltip title="Customize Columns"><IconButton onClick={(e) => setColumnMenuAnchorEl(e.currentTarget)}><MoreVertIcon /></IconButton></Tooltip>
                    </Box>
                </Box>
            )}
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox indeterminate={selected.length > 0 && selected.length < accounts.length} checked={accounts.length > 0 && selected.length === accounts.length} onChange={handleSelectAllClick} /></TableCell>
                {visibleHeadCells.map((headCell) => (
                  <TableCell key={headCell.id} align={LEFT_ALIGNED_COLUMNS.includes(headCell.id) ? 'left' : 'center'} sortDirection={orderBy === headCell.id ? order : false}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: LEFT_ALIGNED_COLUMNS.includes(headCell.id) ? 'flex-start' : 'center', gap: 0.5}}>
                       <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleRequestSort(headCell.id)}>
                        {headCell.label}
                       </TableSortLabel>
                       {headCell.filterable && <FilterListIcon fontSize="small" color={filters[headCell.id]?.length > 0 ? 'primary' : 'inherit'} onClick={(e) => handleFilterIconClick(e, headCell.id)} sx={{cursor: 'pointer'}}/>}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={visibleHeadCells.length + 2} align="center" sx={{py: 4}}><CircularProgress /></TableCell></TableRow>
              ) : accounts.length > 0 ? accounts.map((account) => {
                const isItemSelected = selected.includes(account._id);
                return (
                <StyledTableRow hover onClick={() => handleClick(account._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={account._id} selected={isItemSelected}>
                  <TableCell padding="checkbox"><Checkbox checked={isItemSelected} color="primary" /></TableCell>
                  {visibleColumns.nature && <TableCell align="left">{account.nature || '—'}</TableCell>}
                  {visibleColumns.mainHead && <TableCell align="left">{account.mainHead || '—'}</TableCell>}
                  {visibleColumns.category && <TableCell align="left">{account.category || '—'}</TableCell>}
                  {visibleColumns.code && <TableCell align="center">{account.code}</TableCell>}
                  {visibleColumns.name && (
                    <TableCell align="left">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
                        <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {account.isLocked && <LockIcon fontSize="small" color="action" />}
                        </Box>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/account-transaction/chart-of-accounts/view/${account._id}`);
                          }}
                        >
                          {account.name}
                        </Link>
                      </Box>
                    </TableCell>
                  )}
                  {visibleColumns.openingBalance && <TableCell align="center">{account.openingBalance != null ? account.openingBalance.toLocaleString() : '—'}</TableCell>}
                  {visibleColumns.description && <TableCell align="left"><Tooltip title={account.description || ''}><Typography noWrap sx={{maxWidth: 150}}>{account.description || '—'}</Typography></Tooltip></TableCell>}
                  {visibleColumns.subAccount && <TableCell align="left">{account.subAccountOf_name || '—'}</TableCell>}
                  {visibleColumns.paymentEnabled && <TableCell align="center">{account.allowPayments ? <CheckCircleOutlineIcon color="success" /> : <CancelOutlinedIcon color="error" />}</TableCell>}
                  {visibleColumns.actions && <TableCell align="center">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/account-transaction/chart-of-accounts/edit/${account._id}`); }}><EditIcon fontSize="small"/></IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); confirmArchive([account._id]); }}><ArchiveIcon fontSize="small"/></IconButton>
                  </TableCell>}
                </StyledTableRow>
              )}) : (
                <TableRow><TableCell colSpan={visibleHeadCells.length + 2} align="center" sx={{py: 4}}>
                    <Typography variant="body1" color="text.secondary">No accounts found.</Typography>
                    <Typography variant="body2" color="text.secondary">Try adjusting your search or filters.</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{mr: 1}}>Rows per page:</Typography>
                <Select value={itemsPerPage} onChange={handleItemsPerPageChange} size="small" sx={{ mr: 2 }}>{ROWS_PER_PAGE_OPTIONS.map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}</Select>
                <Typography variant="body2" color="text.secondary">{totalItems > 0 ? `${((page - 1) * itemsPerPage) + 1}–${Math.min(page * itemsPerPage, totalItems)} of ${totalItems}` : '0 items'}</Typography>
            </Box>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      </Paper>

       <Drawer anchor="right" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
         <Box sx={{ width: {xs: '90vw', sm: 400}, p: 2 }}>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{previewType === 'balanceSheet' ? 'Balance Sheet Preview' : 'Profit & Loss Preview'}</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
           </Box>
           {previewType === 'balanceSheet' && (<Box>{renderAccountList(assetAccounts, 'Assets')}{renderAccountList(liabilityAccounts, 'Liabilities')}{renderAccountList(equityAccounts, 'Equity')}</Box>)}
           {previewType === 'profitAndLoss' && (<Box>{renderAccountList(incomeAccounts, 'Income')}{renderAccountList(expenseAccounts, 'Expenses')}</Box>)}
         </Box>
       </Drawer>

       {activeFilterColumn && <FilterPopover open={Boolean(filterAnchorEl)} anchorEl={filterAnchorEl} onClose={() => setFilterAnchorEl(null)} columnName={ALL_HEAD_CELLS.find(h => h.id === activeFilterColumn)?.label} options={filterOptions[activeFilterColumn] || []} selectedValues={filters[activeFilterColumn] || []} onApplyFilter={handleFilterApply} />}

       <Menu anchorEl={columnMenuAnchorEl} open={Boolean(columnMenuAnchorEl)} onClose={() => setColumnMenuAnchorEl(null)}>
            <ListSubheader>Visible Columns</ListSubheader>
            {ALL_HEAD_CELLS.filter(hc => hc.id !== 'actions').map((headCell) => (<MenuItem key={headCell.id}><FormControlLabel control={<Checkbox checked={visibleColumns[headCell.id]} onChange={() => handleColumnVisibilityChange(headCell.id)}/>} label={headCell.label} sx={{width: '100%'}} /></MenuItem>))}
       </Menu>
    </PageWrapper>
  );
};

export default AccountListPage;