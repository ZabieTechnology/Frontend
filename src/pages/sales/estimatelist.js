import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Button, Grid, InputAdornment, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, Paper, Chip, IconButton, TableSortLabel,
    Popover, FormGroup, FormControlLabel, Checkbox, Divider, TablePagination,
    CircularProgress, Alert, Tooltip, Snackbar
} from '@mui/material';
import {
    Add as AddIcon, Search as SearchIcon, Edit as EditIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon, Upload as UploadIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { format } from 'date-fns';

// Using a consistent theme from your other files
const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#673ab7' },
      background: { default: '#f4f6f8', paper: '#ffffff' },
      text: { primary: '#172b4d', secondary: '#6b778c' },
      success: { main: '#4caf50' },
      error: { main: '#f44336' },
      info: { main: '#2196f3' },
      warning: { main: '#ff9800' }
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, }
    },
    components: {
      MuiButton: { styleOverrides: { root: { borderRadius: 8, padding: '10px 20px', } } },
      MuiPaper: { styleOverrides: { root: { borderRadius: 12, } } },
      MuiTableCell: {
          styleOverrides: {
              head: { color: '#6b778c', fontWeight: '600', padding: '12px 16px', },
              body: { color: '#172b4d', }
          }
      }
    }
});

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

// Styled components for custom tab-like buttons
const NavButton = styled(Button)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.common.white : 'transparent',
  color: theme.palette.text.primary,
  boxShadow: selected ? '0px 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1, 2),
   '&:hover': {
     backgroundColor: selected ? theme.palette.common.white : theme.palette.action.hover,
   }
}));

// --- Reusable Header Component ---
const AppHeader = ({ activeTab }) => {
    const navItems = ['Overview', 'Sales Invoice', 'Credit Notes', 'Estimate', 'Other Platforms'];
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4
        }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, backgroundColor: '#f4f6f8', p: 0.5, borderRadius: '12px' }}>
                {navItems.map(item => (
                    <NavButton key={item} component={RouterLink} to={`/sales/${item.toLowerCase().replace(' ', '-')}`} selected={activeTab === item}>
                        {item}
                    </NavButton>
                ))}
            </Box>

            {['Sales Invoice', 'Credit Notes', 'Estimate'].includes(activeTab) && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<UploadIcon />}>Import</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
            )}
        </Box>
    );
};

// --- Sorting utility functions ---
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// --- Reusable Enhanced Table Head ---
function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, onFilterClick, filters, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: '#fafafa' }}>
        <TableCell padding="checkbox">
          <Checkbox color="primary" indeterminate={numSelected > 0 && numSelected < rowCount} checked={rowCount > 0 && numSelected === rowCount} onChange={onSelectAllClick} />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} sortDirection={orderBy === headCell.id ? order : false}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {headCell.sortable !== false ? (
                    <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}>
                        {headCell.label}
                        {orderBy === headCell.id ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
                    </TableSortLabel>
                ) : ( headCell.label )}
                {headCell.filterable !== false && (
                    <IconButton size="small" onClick={(e) => onFilterClick(e, headCell.id)}>
                        <FilterListIcon fontSize="small" color={filters && filters[headCell.id]?.length > 0 ? 'primary' : 'inherit'} />
                    </IconButton>
                )}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// --- Estimate Page Component ---
const quoteHeadCells = [
    { id: 'quoteNumber', label: 'Quote #' },
    { id: 'customer.name', label: 'Customer Name' },
    { id: 'issueDate', label: 'Date' },
    { id: 'grandTotal', numeric: true, label: 'Amount' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions', sortable: false, filterable: false }
];

const EstimatePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('issueDate');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const [filters, setFilters] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentFilterKey, setCurrentFilterKey] = useState(null);
    const [tempFilterValues, setTempFilterValues] = useState([]);
    const [filterSearch, setFilterSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });

    const fetchEstimates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/quotes`, { withCredentials: true });
            setRows(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch estimates:", err);
            setError(err.response?.data?.message || "Could not load estimates.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEstimates();
    }, [fetchEstimates]);

    useEffect(() => {
        if (location.state?.successMessage) {
            setFeedback({ open: true, message: location.state.successMessage, severity: 'success' });
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);


    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = filteredRows.map((n) => n._id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
        else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
        else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
        else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));

        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handleFilterClick = (event, key) => {
        setAnchorEl(event.currentTarget);
        setCurrentFilterKey(key);
        setFilterSearch('');
        setTempFilterValues(filters[key] || []);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
        setCurrentFilterKey(null);
        setTempFilterValues([]);
    };

    const handleFilterChange = (event) => {
        const { value, checked } = event.target;
        setTempFilterValues(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
    };

    const handleApplyFilter = () => {
        setFilters(prev => ({ ...prev, [currentFilterKey]: tempFilterValues }));
        handleFilterClose();
    };

    const filteredRows = React.useMemo(() => {
        let processedRows = [...rows];
        if (searchTerm) {
            processedRows = processedRows.filter(row =>
                Object.values(row).some(value => {
                    if (typeof value === 'object' && value !== null) {
                        return Object.values(value).some(nestedValue => String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase()));
                    }
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }
        processedRows = processedRows.filter(row => {
            return Object.keys(filters).every(key => {
                if (!filters[key] || filters[key].length === 0) return true;
                return filters[key].includes(row[key]);
            });
        });
        return processedRows;
    }, [rows, filters, searchTerm]);

    const uniqueColumnValues = currentFilterKey ? [...new Set(rows.map(item => item[currentFilterKey]))] : [];

    const getStatusChipColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'draft': return 'default';
            case 'sent': return 'info';
            case 'accepted': return 'success';
            case 'invoiced': return 'success';
            case 'declined': return 'error';
            case 'cancelled': return 'error';
            default: return 'warning';
        }
    };

    return (
        <ThemeProvider theme={lightTheme}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: {xs: 1, md: 2} }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Typography variant="h6">Estimates</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                 <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}/>
                                <Button component={RouterLink} to="/quote/new" variant="contained" startIcon={<AddIcon />}>New Estimate</Button>
                            </Box>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 750 }} aria-label="estimate table">
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    onSelectAllClick={handleSelectAllClick}
                                    order={order}
                                    orderBy={orderBy}
                                    onRequestSort={handleRequestSort}
                                    rowCount={filteredRows.length}
                                    onFilterClick={handleFilterClick}
                                    filters={filters}
                                    headCells={quoteHeadCells}
                                />
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={quoteHeadCells.length + 1} align="center" sx={{ py: 5 }}><CircularProgress /><Typography sx={{ mt: 1 }}>Loading Estimates...</Typography></TableCell></TableRow>
                                    ) : error ? (
                                        <TableRow><TableCell colSpan={quoteHeadCells.length + 1} align="center" sx={{ py: 5 }}><Alert severity="error" sx={{justifyContent: 'center'}}>{error}</Alert></TableCell></TableRow>
                                    ) : stableSort(filteredRows, getComparator(order, orderBy))
                                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                     .map((row) => {
                                        const isItemSelected = isSelected(row._id);
                                        return (
                                            <TableRow hover onClick={() => navigate(`/quote/view/${row._id}`)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row._id} selected={isItemSelected} sx={{cursor: 'pointer'}}>
                                                <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} onClick={(event) => {event.stopPropagation(); handleClick(event, row._id)}} /></TableCell>
                                                <TableCell sx={{fontWeight: '500'}}>{row.quoteNumber}</TableCell>
                                                <TableCell>{row.customer?.name || 'N/A'}</TableCell>
                                                <TableCell>{format(new Date(row.issueDate), 'dd MMM yyyy')}</TableCell>
                                                <TableCell align="right">${(row.grandTotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                                                <TableCell><Chip label={row.status || 'Draft'} size="small" color={getStatusChipColor(row.status)} sx={{fontWeight: 'bold', textTransform: 'capitalize'}} /></TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Box sx={{display: 'flex'}}>
                                                        <Tooltip title="Edit"><IconButton component={RouterLink} to={`/quote/edit/${row._id}`} size="small" color="warning"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                        <Tooltip title="Download PDF"><IconButton size="small" color="primary"><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {!loading && !error && filteredRows.length === 0 && (
                                       <TableRow><TableCell colSpan={quoteHeadCells.length + 1} align="center" sx={{ py: 5 }}><Typography>No estimates found.</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                         <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleFilterClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                            <Box sx={{ p: 2, pt: 1, width: 280 }}>
                                 <TextField fullWidth size="small" variant="outlined" placeholder="Search values..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>)}} sx={{mb: 1}}/>
                                <Divider/>
                                <FormGroup sx={{maxHeight: 200, overflow: 'auto', mt:1}}>
                                    {uniqueColumnValues.filter(val => String(val).toLowerCase().includes(filterSearch.toLowerCase())).map(value => (
                                        <FormControlLabel key={value} control={<Checkbox checked={tempFilterValues.includes(String(value))} onChange={handleFilterChange} value={String(value)} size="small"/>} label={String(value)} />
                                    ))}
                                </FormGroup>
                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                                    <Button onClick={handleApplyFilter} variant="contained" size="small">Apply</Button>
                                </Box>
                            </Box>
                        </Popover>
                        <TablePagination
                            rowsPerPageOptions={[8, 15, 25]}
                            component="div"
                            count={filteredRows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </Paper>
                </Grid>
                <Snackbar open={feedback.open} autoHideDuration={6000} onClose={() => setFeedback({ ...feedback, open: false })}>
                    <Alert onClose={() => setFeedback({ ...feedback, open: false })} severity={feedback.severity} sx={{ width: '100%' }}>
                        {feedback.message}
                    </Alert>
                </Snackbar>
            </Grid>
        </ThemeProvider>
    );
}

// --- Main App Component ---
// This is for demonstration. You would integrate this page into your main app's router.
export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <AppHeader activeTab="Estimate" />
        <EstimatePage />
      </Box>
    </ThemeProvider>
  );
}
