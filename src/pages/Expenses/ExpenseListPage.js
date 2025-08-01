import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parse as parseDateFns, isValid as isValidDateFns, startOfDay, endOfDay, format as formatDateFns } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog'; // Adjust path if needed

// --- INLINE SVG ICONS ---
const SearchIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const AddIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const MoreVertIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);
const FilterListIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const VisibilityIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EditIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const DeleteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const SettingsIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H15a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

// --- THEME DEFINITION ---
const modernTheme = createTheme({
    palette: {
        primary: { main: '#007aff' },
        secondary: { main: '#6c757d' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#1c1c1e', secondary: '#6c757d' },
        success: { main: '#4caf50' },
        error: { main: '#d32f2f' },
        info: { main: '#2196f3' },
        warning: { main: '#ff9800' }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h5: { fontWeight: 600, },
        h6: { fontWeight: 600, },
        button: { textTransform: 'none', fontWeight: 600, }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8, padding: '10px 20px', },
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 12, }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 12, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: { color: '#6b778c', fontWeight: '600', padding: '12px 16px', },
                body: { color: '#172b4d', }
            }
        }
    }
});


// --- Helper: Robust Date Parser ---
const parseRobustDate = (dateStringOrDate) => {
    if (!dateStringOrDate) return null;
    if (dateStringOrDate instanceof Date && isValidDateFns(dateStringOrDate)) {
        return startOfDay(dateStringOrDate);
    }
    if (typeof dateStringOrDate !== 'string') return null;
    const formatsToTry = ['dd/MM/yyyy', 'yyyy-MM-dd']; // Add other formats your API might return
    for (const fmt of formatsToTry) {
        const parsedDate = parseDateFns(dateStringOrDate, fmt, new Date());
        if (isValidDateFns(parsedDate)) return startOfDay(parsedDate);
    }
    // Try generic parsing as a fallback if specific formats fail
    const genericParsed = new Date(dateStringOrDate);
    if (isValidDateFns(genericParsed)) return startOfDay(genericParsed);
    console.warn("Could not parse date:", dateStringOrDate);
    return null;
};

const formatDisplayDate = (date) => {
    if (!date) return '';
    const parsed = parseRobustDate(date);
    // Ensure the date is valid before formatting, otherwise return original or empty
    return parsed ? formatDateFns(parsed, 'dd/MM/yyyy') : (typeof date === 'string' ? date : '');
};

// --- Sorting Helper Functions ---
function descendingComparator(a, b, orderBy) {
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null || !orderBy) return 0;
    let aValue = a[orderBy]; let bValue = b[orderBy];

    if (orderBy === 'billDate') { // Assuming 'billDate' is the field for sorting
        aValue = parseRobustDate(aValue); bValue = parseRobustDate(bValue);
        if (aValue === null && bValue === null) return 0; if (aValue === null) return 1; if (bValue === null) return -1;
    } else if (orderBy === 'totalAmount' || orderBy === 'gstVatAmount' || orderBy === 'netAmount') {
        const parseCurrency = (val) => val ? parseFloat(String(val).replace(/[$,A-Za-z]/g, '')) : NaN; // More robust currency parsing
        aValue = parseCurrency(aValue); bValue = parseCurrency(bValue);
        if (isNaN(aValue) && isNaN(bValue)) return 0; if (isNaN(aValue)) return 1; if (isNaN(bValue)) return -1;
    }
    // General comparison for strings or already parsed numbers/dates
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

// Define all possible columns for visibility toggle
const allPossibleColumns = [
    { id: 'billNo', label: 'Bill No.', defaultVisible: true, sortable: true },
    { id: 'supplierName', label: 'Supplier Name', defaultVisible: true, sortable: true }, // Expect this from backend
    { id: 'expenseHeadName', label: 'Expense Head', defaultVisible: true, sortable: true }, // Expect this from backend
    { id: 'totalAmount', label: 'Total', defaultVisible: true, sortable: true, numeric: true },
    { id: 'status', label: 'Status', defaultVisible: true, sortable: true },
    { id: 'billDate', label: 'Bill Date', defaultVisible: false, sortable: true },
    { id: 'dueDate', label: 'Due Date', defaultVisible: false, sortable: true },
    { id: 'gstVatAmount', label: 'Tax Amount', defaultVisible: false, sortable: true, numeric: true },
    { id: 'netAmount', label: 'Net Amount', defaultVisible: false, sortable: true, numeric: true },
    { id: 'source', label: 'Source', defaultVisible: false, sortable: true },
    { id: 'narration', label: 'Narration', defaultVisible: false, sortable: false }, // Example non-sortable
    { id: 'actions', label: 'Actions', defaultVisible: true, sortable: false, numeric: true, align: 'right' },
];

function EnhancedExpensesTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCellsToRender } = props;
    const createSortHandler = (property) => (event) => { onRequestSort(event, property); };
    return (<TableHead> <TableRow sx={{ bgcolor: 'grey.200' }}> <TableCell padding="checkbox"> <Checkbox color="primary" indeterminate={numSelected > 0 && numSelected < rowCount} checked={rowCount > 0 && numSelected === rowCount} onChange={onSelectAllClick} inputProps={{ 'aria-label': 'select all expenses' }} /> </TableCell> {headCellsToRender.map((headCell) => (<TableCell key={headCell.id} align={headCell.numeric ? 'right' : (headCell.align || 'left')} padding={headCell.disablePadding ? 'none' : 'normal'} sortDirection={orderBy === headCell.id ? order : false}> {headCell.sortable !== false ? (<TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}> {headCell.label} {orderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>) : null} </TableSortLabel>) : (headCell.label)} </TableCell>))} </TableRow> </TableHead>);
}

// Updated statusTabs
const statusTabs = ["All", "Duplicate", "Published", "Pending"];

function ExpenseListPage() {
    const [mainTabValue, setMainTabValue] = useState(0); // 0 for Expenses, 1 for Fixed Asset
    const [expenseRows, setExpenseRows] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [expenseError, setExpenseError] = useState(null);
    const [expenseSuccess, setExpenseSuccess] = useState(null);

    const [expenseStatusTabValue, setExpenseStatusTabValue] = useState(statusTabs.indexOf("All"));

    const [expenseOrder, setExpenseOrder] = useState('desc');
    const [expenseOrderBy, setExpenseOrderBy] = useState('billDate'); // Default sort
    const [expensePage, setExpensePage] = useState(0); // MUI TablePagination is 0-based
    const [expenseRowsPerPage, setExpenseRowsPerPage] = useState(10);
    const [expenseSelected, setExpenseSelected] = useState([]);
    const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
    const [totalExpenseItems, setTotalExpenseItems] = useState(0);

    const { confirm, ConfirmationDialog } = useConfirmationDialog();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedExpenseIdForAction, setSelectedExpenseIdForAction] = useState(null);
    const openActionMenu = Boolean(anchorEl);

    const [advancedSearchAnchorEl, setAdvancedSearchAnchorEl] = useState(null);
    const openAdvancedSearchPopover = Boolean(advancedSearchAnchorEl);
    const advancedSearchPopoverId = openAdvancedSearchPopover ? 'advanced-search-popover' : undefined;
    const [advSearchSupplier, setAdvSearchSupplier] = useState('');
    const [advSearchDateFrom, setAdvSearchDateFrom] = useState(null);
    const [advSearchDateTo, setAdvSearchDateTo] = useState(null);
    const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState(null);

    const [visibleColumns, setVisibleColumns] = useState(
        allPossibleColumns.filter(col => col.defaultVisible).map(col => col.id)
    );
    const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState(null);
    const openColumnMenu = Boolean(columnMenuAnchorEl);

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchExpenses = useCallback(async () => {
        setLoadingExpenses(true);
        setExpenseError(null);
        try {
            const currentStatusFilter = statusTabs[expenseStatusTabValue];
            const params = {
                page: expensePage + 1, // API is 1-based
                limit: expenseRowsPerPage,
                search: expenseSearchTerm,
                sortBy: expenseOrderBy,
                sortOrder: expenseOrder,
                status: currentStatusFilter === "All" ? undefined : currentStatusFilter,
                ...(advancedSearchCriteria?.supplier && { supplierName: advancedSearchCriteria.supplier }), // Assuming backend filters by supplierName
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
    }, [API_BASE_URL, expensePage, expenseRowsPerPage, expenseSearchTerm, expenseOrderBy, expenseOrder, advancedSearchCriteria, expenseStatusTabValue]);

    useEffect(() => {
        if (mainTabValue === 0) { fetchExpenses(); }
    }, [fetchExpenses, mainTabValue]);

    const handleMainTabChange = useCallback((event, newValue) => { setMainTabValue(newValue); }, []);
    const handleExpenseRequestSort = useCallback((event, property) => { const isAsc = expenseOrderBy === property && expenseOrder === 'asc'; setExpenseOrder(isAsc ? 'desc' : 'asc'); setExpenseOrderBy(property); setExpensePage(0);}, [expenseOrder, expenseOrderBy]);
    const handleExpenseStatusTabChange = useCallback((event, newValue) => { setExpenseStatusTabValue(newValue); setExpensePage(0); }, []);
    const handleExpenseChangePage = useCallback((event, newPage) => { setExpensePage(newPage); }, []); // MUI TablePagination's newPage is 0-based
    const handleExpenseChangeRowsPerPage = useCallback((event) => { setExpenseRowsPerPage(parseInt(event.target.value, 10)); setExpensePage(0); }, []);
    const handleExpenseClick = useCallback((event, id) => { const selectedIndex = expenseSelected.indexOf(id); let newSelected = []; if (selectedIndex === -1) { newSelected = newSelected.concat(expenseSelected, id); } else if (selectedIndex === 0) { newSelected = newSelected.concat(expenseSelected.slice(1)); } else if (selectedIndex === expenseSelected.length - 1) { newSelected = newSelected.concat(expenseSelected.slice(0, -1)); } else if (selectedIndex > 0) { newSelected = newSelected.concat(expenseSelected.slice(0, selectedIndex), expenseSelected.slice(selectedIndex + 1)); } setExpenseSelected(newSelected); }, [expenseSelected]);
    const isExpenseSelected = useCallback((id) => expenseSelected.indexOf(id) !== -1, [expenseSelected]);
    const handleExpenseSearchChange = useCallback((event) => { setExpenseSearchTerm(event.target.value); setExpensePage(0); }, []);
    const handleOpenAdvancedSearchPopover = useCallback((event) => { setAdvancedSearchAnchorEl(event.currentTarget);}, []);
    const handleCloseAdvancedSearchPopover = useCallback(() => { setAdvancedSearchAnchorEl(null); }, []);
    const handleApplyAdvancedSearch = useCallback(() => { const criteria = { supplier: advSearchSupplier || null, dateFrom: advSearchDateFrom ? startOfDay(advSearchDateFrom) : null, dateTo: advSearchDateTo ? endOfDay(advSearchDateTo) : null, }; const appliedCriteria = Object.entries(criteria).reduce((acc, [key, value]) => { if (value !== null && value !== '') { acc[key] = value; } return acc; }, {}); setAdvancedSearchCriteria(Object.keys(appliedCriteria).length > 0 ? appliedCriteria : null); setExpensePage(0); handleCloseAdvancedSearchPopover(); }, [advSearchSupplier, advSearchDateFrom, advSearchDateTo, handleCloseAdvancedSearchPopover]);
    const handleResetAdvancedSearch = useCallback(() => { setAdvSearchSupplier(''); setAdvSearchDateFrom(null); setAdvSearchDateTo(null); if (advancedSearchCriteria !== null) { setAdvancedSearchCriteria(null); setExpensePage(0); } }, [advancedSearchCriteria]);

    const handleAddNewExpense = useCallback(() => navigate('/expenses/new'), [navigate]);
    const handleEditExpenseAction = useCallback((id) => navigate(`/expenses/edit/${id}`), [navigate]);
    const handleViewExpenseAction = useCallback((id) => navigate(`/expenses/edit/${id}?view=true`), [navigate]);

    const handleDeleteExpenseApi = useCallback(async (id) => {
        setLoadingExpenses(true); setExpenseError(null); setExpenseSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/expenses/${id}`, { withCredentials: true });
            setExpenseSuccess("Expense deleted successfully!");
            fetchExpenses(); setExpenseSelected([]);
        } catch (err) { setExpenseError(`Failed to delete expense: ${err.response?.data?.message || err.message}`);
        } finally { setLoadingExpenses(false); setTimeout(() => setExpenseSuccess(null), 3000); }
    }, [API_BASE_URL, fetchExpenses]);

    const confirmDeleteExpenseAction = useCallback((id) => { const expense = expenseRows.find(exp => exp._id === id); confirm({ title: 'Confirm Deletion', message: `Are you sure you want to delete the expense for "${expense?.supplierName || id}"?`, onConfirmAction: () => handleDeleteExpenseApi(id), }); }, [confirm, handleDeleteExpenseApi, expenseRows]);

    const handleOpenActionMenu = useCallback((event, id) => { setAnchorEl(event.currentTarget); setSelectedExpenseIdForAction(id); }, []);
    const handleCloseActionMenu = useCallback(() => { setAnchorEl(null); setTimeout(() => setSelectedExpenseIdForAction(null), 100); }, []);
    const handleViewAction = useCallback(() => { if (selectedExpenseIdForAction) { handleViewExpenseAction(selectedExpenseIdForAction); } handleCloseActionMenu(); }, [selectedExpenseIdForAction, handleViewExpenseAction, handleCloseActionMenu]);
    const handleEditAction = useCallback(() => { if (selectedExpenseIdForAction) { handleEditExpenseAction(selectedExpenseIdForAction); } handleCloseActionMenu(); }, [selectedExpenseIdForAction, handleEditExpenseAction, handleCloseActionMenu]);
    const handleDeleteAction = useCallback(() => { if (selectedExpenseIdForAction) { confirmDeleteExpenseAction(selectedExpenseIdForAction); } handleCloseActionMenu(); }, [selectedExpenseIdForAction, confirmDeleteExpenseAction, handleCloseActionMenu]);

    const sortedAndFilteredExpenseRows = useMemo(() => stableSort(expenseRows, getComparator(expenseOrder, expenseOrderBy)), [expenseRows, expenseOrder, expenseOrderBy]);

    const handleExpenseSelectAllClick = useCallback((event) => { if (event.target.checked && Array.isArray(sortedAndFilteredExpenseRows)) { const newSelecteds = sortedAndFilteredExpenseRows.map((n) => n._id); setExpenseSelected(newSelecteds); return; } setExpenseSelected([]); }, [sortedAndFilteredExpenseRows]);

    const uniqueSuppliers = useMemo(() => { if (!Array.isArray(expenseRows)) return []; const suppliers = expenseRows.map(row => row?.supplierName).filter(Boolean); return [...new Set(suppliers)].sort(); }, [expenseRows]);

    const handleColumnVisibilityChange = (columnId) => { setVisibleColumns(prev => prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId] ); };
    const handleOpenColumnMenu = (event) => setColumnMenuAnchorEl(event.currentTarget);
    const handleCloseColumnMenu = () => setColumnMenuAnchorEl(null);
    const headCellsToRender = useMemo(() => allPossibleColumns.filter(col => visibleColumns.includes(col.id)), [visibleColumns]);


    return (
        <ThemeProvider theme={modernTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ padding: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
                    <ConfirmationDialog />
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={mainTabValue} onChange={handleMainTabChange} aria-label="main accounting sections tabs">
                             <Tab label="Expenses" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
                             <Tab label="Fixed Assets" id="simple-tab-1" aria-controls="simple-tabpanel-1" /> {/* Changed label */}
                         </Tabs>
                     </Box>

                    <TabPanel value={mainTabValue} index={0}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                             <Typography variant="h5">Expenses</Typography>
                             <Box> <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewExpense}> Add New </Button> </Box>
                        </Box>
                        {expenseError && <Alert severity="error" onClose={() => setExpenseError(null)} sx={{ mb: 2 }}>{expenseError}</Alert>}
                        {expenseSuccess && <Alert severity="success" onClose={() => setExpenseSuccess(null)} sx={{ mb: 2 }}>{expenseSuccess}</Alert>}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                             <Tabs value={expenseStatusTabValue} onChange={handleExpenseStatusTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="expense status tabs">
                                 {statusTabs.map((status, index) => <Tab key={status} label={status} />)}
                            </Tabs>
                             <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                 <TextField size="small" variant="outlined" placeholder="Search Expenses..." value={expenseSearchTerm} onChange={handleExpenseSearchChange} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="Advanced Filters" aria-describedby={advancedSearchPopoverId} onClick={handleOpenAdvancedSearchPopover} edge="end" title="Advanced Filters" color={advancedSearchCriteria ? 'primary' : 'default'} > <FilterListIcon /> </IconButton> </InputAdornment> )}} sx={{ width: { xs: '150px', sm: '200px', md: '300px' }, mr: 1 }}/>
                                 <Tooltip title="Column Options">
                                    <IconButton onClick={handleOpenColumnMenu}><SettingsIcon /></IconButton>
                                 </Tooltip>
                            </Box>
                        </Box>

                        <Popover id={advancedSearchPopoverId} open={openAdvancedSearchPopover} anchorEl={advancedSearchAnchorEl} onClose={handleCloseAdvancedSearchPopover} anchorOrigin={{ vertical: 'bottom', horizontal: 'right', }} transformOrigin={{ vertical: 'top', horizontal: 'right', }} PaperProps={{ sx: { width: { xs: '90%', sm: 350, md: 400 }, p: 2 } }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}> ADVANCED SEARCH </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}> <FormControl fullWidth size="small"> <InputLabel shrink>Supplier</InputLabel> <Select value={advSearchSupplier} onChange={(e) => setAdvSearchSupplier(e.target.value)} displayEmpty label="Supplier"> <MenuItem value=""><em>Any Supplier</em></MenuItem> {uniqueSuppliers.map(supplierName => ( <MenuItem key={supplierName} value={supplierName}>{supplierName}</MenuItem> ))} </Select> </FormControl> </Grid>
                                <Grid item xs={12}> <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 'medium' }}>Date Range</Typography> <Grid container spacing={1} alignItems="center"> <Grid item xs={12} sm={6}> <DatePicker label="From" value={advSearchDateFrom} onChange={(newValue) => setAdvSearchDateFrom(newValue)} slotProps={{ textField: { size: 'small', fullWidth: true } }} format="dd/MM/yyyy" maxDate={advSearchDateTo || undefined}/> </Grid> <Grid item xs={12} sm={6}> <DatePicker label="To" value={advSearchDateTo} onChange={(newValue) => setAdvSearchDateTo(newValue)} slotProps={{ textField: { size: 'small', fullWidth: true } }} format="dd/MM/yyyy" minDate={advSearchDateFrom || undefined}/> </Grid> </Grid> </Grid>
                                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                                <Grid item xs={12}> <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}> <Button size="small" variant="text" onClick={handleResetAdvancedSearch} sx={{ color: 'grey.700' }}>Reset</Button> <Button size="small" variant="contained" onClick={handleApplyAdvancedSearch} >Apply</Button> </Box> </Grid>
                            </Grid>
                        </Popover>

                        <Menu anchorEl={columnMenuAnchorEl} open={openColumnMenu} onClose={handleCloseColumnMenu} >
                            <Typography sx={{px:2, py:1, fontWeight:'bold'}}>Show Columns</Typography>
                            <Divider/>
                            {allPossibleColumns.map(col => (
                                <MenuItem key={col.id} onClick={() => handleColumnVisibilityChange(col.id)}>
                                    <Checkbox checked={visibleColumns.includes(col.id)} size="small" />
                                    <ListItemText primary={col.label} />
                                </MenuItem>
                            ))}
                        </Menu>

                        {loadingExpenses ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
                        ) : (
                            <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                                <TableContainer sx={{ maxHeight: { xs: '60vh', md: 'calc(100vh - 400px)' } }}>
                                    <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size='medium'>
                                        <EnhancedExpensesTableHead numSelected={expenseSelected.length} order={expenseOrder} orderBy={expenseOrderBy} onSelectAllClick={handleExpenseSelectAllClick} onRequestSort={handleExpenseRequestSort} rowCount={sortedAndFilteredExpenseRows.length} headCellsToRender={headCellsToRender} />
                                        <TableBody>
                                            {sortedAndFilteredExpenseRows.length > 0 ? (
                                                sortedAndFilteredExpenseRows.map((row, index) => {
                                                    const isItemSelected = isExpenseSelected(row._id);
                                                    const labelId = `enhanced-table-checkbox-${index}`;
                                                    return (
                                                        <TableRow hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row._id} selected={isItemSelected}>
                                                            <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} onChange={(event) => handleExpenseClick(event, row._id)} inputProps={{ 'aria-labelledby': labelId }} /></TableCell>
                                                            {headCellsToRender.map(headCell => (
                                                                <TableCell key={headCell.id} align={headCell.numeric ? 'right' : (headCell.align ||'left')}>
                                                                    {headCell.id === 'actions' ? (
                                                                        <IconButton aria-label="Actions" id={`actions-button-${row._id}`} onClick={(event) => handleOpenActionMenu(event, row._id)} size="small"> <MoreVertIcon /> </IconButton>
                                                                    ) : headCell.id === 'billDate' || headCell.id === 'dueDate' ? (
                                                                        formatDisplayDate(row[headCell.id])
                                                                    ) : headCell.id === 'supplierName' ? (
                                                                        <Link component="button" variant="body2" onClick={() => handleViewExpenseAction(row._id)} sx={{ textAlign: 'left'}}>
                                                                            {row.supplierName || row.supplierId || 'N/A'}
                                                                        </Link>
                                                                    ): headCell.id === 'expenseHeadName' ? (
                                                                         row.expenseHeadName || row.expenseHeadId || 'N/A'
                                                                    ) : (
                                                                        row[headCell.id] !== undefined && row[headCell.id] !== null ? String(row[headCell.id]) : 'N/A'
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow> <TableCell colSpan={headCellsToRender.length + 1} align="center"> No expenses found matching your criteria. </TableCell> </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={totalExpenseItems} rowsPerPage={expenseRowsPerPage} page={expensePage} onPageChange={handleExpenseChangePage} onRowsPerPageChange={handleExpenseChangeRowsPerPage} />
                            </Paper>
                        )}
                         {selectedExpenseIdForAction && ( <Menu id={`actions-menu-${selectedExpenseIdForAction}`} MenuListProps={{ 'aria-labelledby': `actions-button-${selectedExpenseIdForAction}`, }} anchorEl={anchorEl} open={openActionMenu} onClose={handleCloseActionMenu} > <MenuItem onClick={handleViewAction}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} /> View</MenuItem> <MenuItem onClick={handleEditAction}><EditIcon fontSize="small" sx={{ mr: 1 }}/> Edit</MenuItem> <MenuItem onClick={handleDeleteAction} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" sx={{ mr: 1 }}/> Delete</MenuItem> </Menu> )}
                    </TabPanel>

                    <TabPanel value={mainTabValue} index={1}> <Typography variant="h6">Fixed Assets</Typography> <Typography variant="body1" color="text.secondary"> (Content for Fixed Assets Table and functionality to be implemented here)</Typography> </TabPanel>
                </Box>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default ExpenseListPage;