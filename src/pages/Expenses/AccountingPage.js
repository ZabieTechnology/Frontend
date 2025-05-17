import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Box, Typography, Button, Tabs, Tab, TextField, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Checkbox, TablePagination, Link, TableSortLabel,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    InputAdornment, Menu, MenuItem, Popover, Grid, Select, FormControl, Divider, // Removed duplicate FormControl, Select, MenuItem
    CircularProgress, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parse as parseDateFns, isValid as isValidDateFns, startOfDay, endOfDay, format as formatDateFns } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path if needed

// Initial states for dialogs and new/edit data (These are for the inline dialogs, not the separate AddExpensePage)
// We will keep the Add/Edit dialogs for now, but primary navigation will be to AddExpensePage.
const emptyNewExpense = { date: null, supplier: '', head: '', total: '', tax: '', source: '', description: '' };
const emptyEditExpense = { _id: null, date: null, supplier: '', head: '', total: '', tax: '', source: '', description: '' };


const parseRobustDate = (dateStringOrDate) => {
    if (!dateStringOrDate) return null;
    if (dateStringOrDate instanceof Date && isValidDateFns(dateStringOrDate)) {
        return startOfDay(dateStringOrDate);
    }
    if (typeof dateStringOrDate !== 'string') return null;
    const formatsToTry = ['dd/MM/yyyy', 'yyyy-MM-dd'];
    for (const fmt of formatsToTry) {
        const parsedDate = parseDateFns(dateStringOrDate, fmt, new Date());
        if (isValidDateFns(parsedDate)) return startOfDay(parsedDate);
    }
    const genericParsed = new Date(dateStringOrDate);
    if (isValidDateFns(genericParsed)) return startOfDay(genericParsed);
    console.warn("Could not parse date:", dateStringOrDate);
    return null;
};

const formatDisplayDate = (date) => {
    if (!date) return '';
    const parsed = parseRobustDate(date);
    return parsed ? formatDateFns(parsed, 'dd/MM/yyyy') : (typeof date === 'string' ? date : ''); // Fallback to original string if parsing fails
};

function descendingComparator(a, b, orderBy) {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null || !orderBy) return 0;
    let aValue = a[orderBy]; let bValue = b[orderBy];
    if (orderBy === 'date') {
        aValue = parseRobustDate(aValue); bValue = parseRobustDate(bValue);
        if (aValue === null && bValue === null) return 0; if (aValue === null) return 1; if (bValue === null) return -1;
    } else if (orderBy === 'total' || orderBy === 'tax') {
        const parseCurrency = (val) => val ? parseFloat(String(val).replace(/[$,]/g, '')) : NaN;
        aValue = parseCurrency(aValue); bValue = parseCurrency(bValue);
        if (isNaN(aValue) && isNaN(bValue)) return 0; if (isNaN(aValue)) return 1; if (isNaN(bValue)) return -1;
    }
    if (bValue < aValue) return -1; if (bValue > aValue) return 1; return 0;
}
function getComparator(order, orderBy) { return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy); }
function stableSort(array, comparator) {
    if (!Array.isArray(array)) return [];
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => { if (!a || !b || !a[0] || !b[0]) return 0; const order = comparator(a[0], b[0]); if (order !== 0) return order; return a[1] - b[1]; });
    return stabilizedThis.map((el) => el[0]);
}

function TabPanel(props) { const { children, value, index, ...other } = props; return (<div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}> {value === index && (<Box sx={{ pt: 3 }}>{children}</Box>)} </div>); }

const expenseHeadCells = [ { id: 'date', numeric: false, disablePadding: false, label: 'Date', sortable: true }, { id: 'supplier', numeric: false, disablePadding: false, label: 'Supplier', sortable: true }, { id: 'head', numeric: false, disablePadding: false, label: 'Expense Head', sortable: true }, { id: 'total', numeric: false, disablePadding: false, label: 'Total', sortable: true }, { id: 'tax', numeric: false, disablePadding: false, label: 'Tax', sortable: true }, { id: 'source', numeric: false, disablePadding: false, label: 'Source', sortable: true }, { id: 'actions', numeric: false, disablePadding: false, label: 'Actions', sortable: false }, ];
function EnhancedExpensesTableHead(props) { const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props; const createSortHandler = (property) => (event) => { onRequestSort(event, property); }; return (<TableHead> <TableRow> <TableCell padding="checkbox"> <Checkbox color="primary" indeterminate={numSelected > 0 && numSelected < rowCount} checked={rowCount > 0 && numSelected === rowCount} onChange={onSelectAllClick} inputProps={{ 'aria-label': 'select all expenses' }} /> </TableCell> {expenseHeadCells.map((headCell) => (<TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} padding={headCell.disablePadding ? 'none' : 'normal'} sortDirection={orderBy === headCell.id ? order : false}> {headCell.sortable !== false ? (<TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}> {headCell.label} {orderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>) : null} </TableSortLabel>) : (headCell.label)} </TableCell>))} </TableRow> </TableHead>); }


function AccountingPage() {
    const [mainTabValue, setMainTabValue] = useState(0);
    const [expenseRows, setExpenseRows] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenseError, setExpenseError] = useState(null);
    const [expenseSuccess, setExpenseSuccess] = useState(null);

    const [expenseStatusTabValue, setExpenseStatusTabValue] = useState(5);
    const [expenseOrder, setExpenseOrder] = useState('desc');
    const [expenseOrderBy, setExpenseOrderBy] = useState('date');
    const [expensePage, setExpensePage] = useState(0);
    const [expenseRowsPerPage, setExpenseRowsPerPage] = useState(10);
    const [expenseSelected, setExpenseSelected] = useState([]);
    const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
    const [totalExpenseItems, setTotalExpenseItems] = useState(0);

    const [assetRows, setAssetRows] = useState([ { id: 'ast1', name: 'Table', type: 'Office Equipment', date: '31/03/2024', cost: '$2,500', value: '', depreciation: '' }, { id: 'ast2', name: 'Chair', type: 'Mobile', date: '31/03/2024', cost: '$2,500', value: '', depreciation: '' }, ]);
    const [assetPage, setAssetPage] = useState(0);
    const [assetRowsPerPage, setAssetRowsPerPage] = useState(10);
    
    const { confirm, ConfirmationDialog } = useConfirmationDialog();
    const navigate = useNavigate(); // Initialize useNavigate

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedExpenseIdForAction, setSelectedExpenseIdForAction] = useState(null);
    const openActionMenu = Boolean(anchorEl);

    const [advancedSearchAnchorEl, setAdvancedSearchAnchorEl] = useState(null);
    const openAdvancedSearchPopover = Boolean(advancedSearchAnchorEl);
    const advancedSearchPopoverId = openAdvancedSearchPopover ? 'advanced-search-popover' : undefined;
    const [advSearchSupplier, setAdvSearchSupplier] = useState('');
    const [advSearchAmountFrom, setAdvSearchAmountFrom] = useState('');
    const [advSearchAmountTo, setAdvSearchAmountTo] = useState('');
    const [advSearchDateFrom, setAdvSearchDateFrom] = useState(null);
    const [advSearchDateTo, setAdvSearchDateTo] = useState(null);
    const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchExpenses = useCallback(async () => {
        setLoadingExpenses(true);
        setExpenseError(null);
        try {
            const params = {
                page: expensePage + 1,
                limit: expenseRowsPerPage,
                search: expenseSearchTerm,
                sortBy: expenseOrderBy,
                sortOrder: expenseOrder,
                ...(advancedSearchCriteria?.supplier && { supplier: advancedSearchCriteria.supplier }),
                ...(advancedSearchCriteria?.dateFrom && { dateFrom: formatDateFns(advancedSearchCriteria.dateFrom, 'yyyy-MM-dd') }),
                ...(advancedSearchCriteria?.dateTo && { dateTo: formatDateFns(advancedSearchCriteria.dateTo, 'yyyy-MM-dd') }),
            };
            const response = await axios.get(`${API_BASE_URL}/api/expenses`, { params, withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setExpenseRows(response.data.data);
                setTotalExpenseItems(response.data.total || 0);
            } else {
                setExpenseRows([]); setTotalExpenseItems(0);
                setExpenseError("Invalid data format from server for expenses.");
            }
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setExpenseError(`Error fetching expenses: ${err.response?.data?.message || err.message}`);
            setExpenseRows([]); setTotalExpenseItems(0);
        } finally {
            setLoadingExpenses(false);
        }
    }, [API_BASE_URL, expensePage, expenseRowsPerPage, expenseSearchTerm, expenseOrderBy, expenseOrder, advancedSearchCriteria]);

    useEffect(() => {
        if (mainTabValue === 0) { fetchExpenses(); }
    }, [fetchExpenses, mainTabValue]);

    const handleMainTabChange = useCallback((event, newValue) => { setMainTabValue(newValue); }, []);
    const handleExpenseRequestSort = useCallback((event, property) => { const isAsc = expenseOrderBy === property && expenseOrder === 'asc'; setExpenseOrder(isAsc ? 'desc' : 'asc'); setExpenseOrderBy(property); setExpensePage(0);}, [expenseOrder, expenseOrderBy]);
    const handleExpenseStatusTabChange = useCallback((event, newValue) => { setExpenseStatusTabValue(newValue); setExpensePage(0); }, []);
    const handleExpenseChangePage = useCallback((event, newPage) => { setExpensePage(newPage); }, []);
    const handleExpenseChangeRowsPerPage = useCallback((event) => { setExpenseRowsPerPage(parseInt(event.target.value, 10)); setExpensePage(0); }, []);
    const handleExpenseClick = useCallback((event, id) => { const selectedIndex = expenseSelected.indexOf(id); let newSelected = []; if (selectedIndex === -1) { newSelected = newSelected.concat(expenseSelected, id); } else if (selectedIndex === 0) { newSelected = newSelected.concat(expenseSelected.slice(1)); } else if (selectedIndex === expenseSelected.length - 1) { newSelected = newSelected.concat(expenseSelected.slice(0, -1)); } else if (selectedIndex > 0) { newSelected = newSelected.concat(expenseSelected.slice(0, selectedIndex), expenseSelected.slice(selectedIndex + 1)); } setExpenseSelected(newSelected); }, [expenseSelected]);
    const isExpenseSelected = useCallback((id) => expenseSelected.indexOf(id) !== -1, [expenseSelected]);
    const handleExpenseSearchChange = useCallback((event) => { setExpenseSearchTerm(event.target.value); setExpensePage(0); }, []);
    const handleOpenAdvancedSearchPopover = useCallback((event) => { setAdvancedSearchAnchorEl(event.currentTarget);}, []);
    const handleCloseAdvancedSearchPopover = useCallback(() => { setAdvancedSearchAnchorEl(null); }, []);
    const handleApplyAdvancedSearch = useCallback(() => { const criteria = { supplier: advSearchSupplier || null, amountFrom: advSearchAmountFrom || null, amountTo: advSearchAmountTo || null, dateFrom: advSearchDateFrom ? startOfDay(advSearchDateFrom) : null, dateTo: advSearchDateTo ? endOfDay(advSearchDateTo) : null, }; const appliedCriteria = Object.entries(criteria).reduce((acc, [key, value]) => { if (value !== null && value !== '') { acc[key] = value; } return acc; }, {}); setAdvancedSearchCriteria(Object.keys(appliedCriteria).length > 0 ? appliedCriteria : null); setExpensePage(0); handleCloseAdvancedSearchPopover(); }, [advSearchSupplier, advSearchAmountFrom, advSearchAmountTo, advSearchDateFrom, advSearchDateTo, handleCloseAdvancedSearchPopover]);
    const handleResetAdvancedSearch = useCallback(() => { setAdvSearchSupplier(''); setAdvSearchAmountFrom(''); setAdvSearchAmountTo(''); setAdvSearchDateFrom(null); setAdvSearchDateTo(null); if (advancedSearchCriteria !== null) { setAdvancedSearchCriteria(null); setExpensePage(0); } }, [advancedSearchCriteria]);

    // --- Navigation Handlers ---
    const handleAddNewExpense = () => {
        navigate('/expenses/new'); // Navigate to AddExpensePage
    };
    const handleEditExpenseAction = (id) => {
        navigate(`/expenses/edit/${id}`); // Navigate to AddExpensePage in edit mode
    };
    const handleViewExpenseAction = (id) => {
        navigate(`/expenses/edit/${id}?view=true`); // Navigate to AddExpensePage in view mode
    };
    // --- End Navigation Handlers ---


    const handleDeleteExpenseApi = useCallback(async (id) => { // Renamed to avoid conflict
        setLoadingExpenses(true); setExpenseError(null); setExpenseSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/expenses/${id}`, { withCredentials: true });
            setExpenseSuccess("Expense deleted successfully!");
            fetchExpenses();
            setExpenseSelected([]);
        } catch (err) {
            setExpenseError(`Failed to delete expense: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoadingExpenses(false); setTimeout(() => setExpenseSuccess(null), 3000);
        }
    }, [API_BASE_URL, fetchExpenses]);

    const confirmDeleteExpenseAction = useCallback((id) => { // Renamed
        const expense = expenseRows.find(exp => exp._id === id);
        confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the expense for "${expense?.supplier || id}" on ${expense?.date || 'this date'}? This action cannot be undone.`,
            onConfirmAction: () => handleDeleteExpenseApi(id),
        });
    }, [confirm, handleDeleteExpenseApi, expenseRows]);


    const handleOpenActionMenu = useCallback((event, id) => { setAnchorEl(event.currentTarget); setSelectedExpenseIdForAction(id); }, []);
    const handleCloseActionMenu = useCallback(() => { setAnchorEl(null); setTimeout(() => setSelectedExpenseIdForAction(null), 100); }, []);
    
    // Updated Action Menu handlers to use navigation
    const handleViewAction = useCallback(() => { if (selectedExpenseIdForAction) { handleViewExpenseAction(selectedExpenseIdForAction); } handleCloseActionMenu(); }, [selectedExpenseIdForAction, handleViewExpenseAction, handleCloseActionMenu]);
    const handleEditAction = useCallback(() => { if (selectedExpenseIdForAction) { handleEditExpenseAction(selectedExpenseIdForAction); } handleCloseActionMenu(); }, [selectedExpenseIdForAction, handleEditExpenseAction, handleCloseActionMenu]);
    const handleDeleteAction = useCallback(() => { if (selectedExpenseIdForAction) { confirmDeleteExpenseAction(selectedExpenseIdForAction); } handleCloseActionMenu(); }, [selectedExpenseIdForAction, confirmDeleteExpenseAction, handleCloseActionMenu]);

    const sortedAndFilteredExpenseRows = useMemo(() => stableSort(expenseRows, getComparator(expenseOrder, expenseOrderBy)), [expenseRows, expenseOrder, expenseOrderBy]);
    
    const handleExpenseSelectAllClick = useCallback((event) => {
        if (event.target.checked && Array.isArray(sortedAndFilteredExpenseRows)) {
            const newSelecteds = sortedAndFilteredExpenseRows.map((n) => n._id);
            setExpenseSelected(newSelecteds);
            return;
        }
        setExpenseSelected([]);
    }, [sortedAndFilteredExpenseRows]);

    const uniqueSuppliers = useMemo(() => {
        if (!Array.isArray(expenseRows)) return [];
        const suppliers = expenseRows.map(row => row?.supplier).filter(Boolean);
        return [...new Set(suppliers)].sort();
    }, [expenseRows]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ padding: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
                <ConfirmationDialog /> {/* For delete confirmation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={mainTabValue} onChange={handleMainTabChange} aria-label="main accounting sections tabs">
                         <Tab label="Expenses" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                         <Tab label="Fixed asset" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
                     </Tabs>
                 </Box>

                <TabPanel value={mainTabValue} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                         <Typography variant="h5">Expenses</Typography>
                         <Box> <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewExpense}> Add New </Button> </Box> {/* Updated onClick */}
                    </Box>
                    {expenseError && <Alert severity="error" onClose={() => setExpenseError(null)} sx={{ mb: 2 }}>{expenseError}</Alert>}
                    {expenseSuccess && <Alert severity="success" onClose={() => setExpenseSuccess(null)} sx={{ mb: 2 }}>{expenseSuccess}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                         <Tabs value={expenseStatusTabValue} onChange={handleExpenseStatusTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="expense status tabs">
                             <Tab label="Pending" /> <Tab label="Processing" /> <Tab label="Published" /> <Tab label="Duplicate" /> <Tab label="Review" /> <Tab label="All" />
                        </Tabs>
                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <TextField size="small" variant="outlined" placeholder="Search Expenses..." value={expenseSearchTerm} onChange={handleExpenseSearchChange} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="Advanced Filters" aria-describedby={advancedSearchPopoverId} onClick={handleOpenAdvancedSearchPopover} edge="end" title="Advanced Filters" color={advancedSearchCriteria ? 'primary' : 'default'} > <FilterListIcon /> </IconButton> </InputAdornment> )}} sx={{ width: { xs: '150px', sm: '200px', md: '300px' } }}/>
                        </Box>
                    </Box>

                    <Popover id={advancedSearchPopoverId} open={openAdvancedSearchPopover} anchorEl={advancedSearchAnchorEl} onClose={handleCloseAdvancedSearchPopover} anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }} transformOrigin={{ vertical: 'top', horizontal: 'right', }} PaperProps={{ sx: { width: { xs: '90%', sm: 350, md: 400 }, maxHeight: '70vh', overflowY: 'auto', p: 2 } }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}> ADVANCED SEARCH </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth size="small"> <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium' }}>Supplier</Typography> <Select value={advSearchSupplier} onChange={(e) => setAdvSearchSupplier(e.target.value)} displayEmpty> <MenuItem value=""><em>Any Supplier</em></MenuItem> {uniqueSuppliers.map(supplierName => ( <MenuItem key={supplierName} value={supplierName}>{supplierName}</MenuItem> ))} </Select> </FormControl>
                            </Grid>
                            <Grid item xs={12}> <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium' }}>Amount</Typography> <Grid container spacing={1} alignItems="center"> <Grid item xs={5}> <TextField placeholder="From" size="small" fullWidth type="number" value={advSearchAmountFrom} onChange={(e) => setAdvSearchAmountFrom(e.target.value)} InputProps={{ inputProps: { min: 0, step: "0.01" } }}/> </Grid> <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography variant="body2">to</Typography></Grid> <Grid item xs={5}> <TextField placeholder="To" size="small" fullWidth type="number" value={advSearchAmountTo} onChange={(e) => setAdvSearchAmountTo(e.target.value)} InputProps={{ inputProps: { min: 0, step: "0.01" } }}/> </Grid> </Grid> </Grid>
                            <Grid item xs={12}> <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium' }}>Date</Typography> <Grid container spacing={1} alignItems="center"> <Grid item xs={5}> <DatePicker value={advSearchDateFrom} onChange={(newValue) => setAdvSearchDateFrom(newValue)} slotProps={{ textField: { size: 'small', fullWidth: true, placeholder: 'dd/mm/yy' } }} format="dd/MM/yyyy" maxDate={advSearchDateTo || undefined}/> </Grid> <Grid item xs={2} sx={{ textAlign: 'center' }}><Typography variant="body2">to</Typography></Grid> <Grid item xs={5}> <DatePicker value={advSearchDateTo} onChange={(newValue) => setAdvSearchDateTo(newValue)} slotProps={{ textField: { size: 'small', fullWidth: true, placeholder: 'dd/mm/yy' } }} format="dd/MM/yyyy" minDate={advSearchDateFrom || undefined}/> </Grid> </Grid> </Grid>
                            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                            <Grid item xs={12}> <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}> <Button size="small" variant="text" onClick={handleResetAdvancedSearch} sx={{ color: 'grey.700' }}>Reset</Button> <Button size="small" variant="contained" onClick={handleApplyAdvancedSearch} >Apply</Button> </Box> </Grid>
                        </Grid>
                    </Popover>

                    {loadingExpenses ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
                    ) : (
                        <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                            <TableContainer sx={{ maxHeight: { xs: '60vh', md: 'calc(100vh - 400px)' } }}>
                                <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size='medium'>
                                    <EnhancedExpensesTableHead numSelected={expenseSelected.length} order={expenseOrder} orderBy={expenseOrderBy} onSelectAllClick={handleExpenseSelectAllClick} onRequestSort={handleExpenseRequestSort} rowCount={sortedAndFilteredExpenseRows.length} />
                                    <TableBody>
                                        {sortedAndFilteredExpenseRows.length > 0 ? (
                                            sortedAndFilteredExpenseRows.map((row, index) => {
                                                const isItemSelected = isExpenseSelected(row._id); 
                                                const labelId = `enhanced-table-checkbox-${index}`;
                                                return (
                                                    <TableRow hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row._id} selected={isItemSelected}>
                                                        <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} onChange={(event) => handleExpenseClick(event, row._id)} inputProps={{ 'aria-labelledby': labelId }} /></TableCell>
                                                        <TableCell>{formatDisplayDate(row.date)}</TableCell>
                                                        <TableCell>
                                                            <Link component="button" variant="body2" onClick={() => handleViewExpenseAction(row._id)} sx={{ textAlign: 'left'}}>
                                                                {row.supplier}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>{row.head}</TableCell>
                                                        <TableCell>{row.total}</TableCell>
                                                        <TableCell>{row.tax}</TableCell>
                                                        <TableCell>{row.source}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton aria-label="Actions" id={`actions-button-${row._id}`} onClick={(event) => handleOpenActionMenu(event, row._id)} size="small"> <MoreVertIcon /> </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow> <TableCell colSpan={expenseHeadCells.length + 1} align="center"> No expenses found matching your criteria. </TableCell> </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={totalExpenseItems} rowsPerPage={expenseRowsPerPage} page={expensePage} onPageChange={handleExpenseChangePage} onRowsPerPageChange={handleExpenseChangeRowsPerPage} />
                        </Paper>
                    )}
                     {selectedExpenseIdForAction && ( <Menu id={`actions-menu-${selectedExpenseIdForAction}`} MenuListProps={{ 'aria-labelledby': `actions-button-${selectedExpenseIdForAction}`, }} anchorEl={anchorEl} open={openActionMenu} onClose={handleCloseActionMenu} > <MenuItem onClick={handleViewAction}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View</MenuItem> <MenuItem onClick={handleEditAction}><EditIcon fontSize="small" sx={{ mr: 1 }}/> Edit</MenuItem> <MenuItem onClick={handleDeleteAction} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" sx={{ mr: 1 }}/> Delete</MenuItem> </Menu> )}
                </TabPanel>

                <TabPanel value={mainTabValue} index={1}> <Typography variant="h6">Fixed Asset Register</Typography> <Typography variant="body1" color="text.secondary"> (Content for Fixed Assets Table and functionality to be implemented here)</Typography> </TabPanel>

                {/* Removed inline Add/Edit/View/Delete Dialogs as navigation is to AddExpensePage now */}
            </Box>
        </LocalizationProvider>
    );
}

export default AccountingPage;
