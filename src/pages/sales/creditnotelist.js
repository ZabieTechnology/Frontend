import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
  TableSortLabel,
  Checkbox,
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { format } from 'date-fns';

// A light theme for the dashboard
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#673ab7',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#172b4d',
      secondary: '#6b778c',
    },
    success: {
        main: '#4caf50',
    },
    error: {
        main: '#f44336'
    },
    info: {
        main: '#2196f3'
    },
    warning: {
        main: '#ff9800'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    h5: {
      fontWeight: 600,
    },
    h6: {
        fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            }
        }
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                color: '#6b778c',
                fontWeight: '600',
                padding: '12px 16px',
            },
            body: {
                color: '#172b4d',
            }
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
                    <NavButton key={item} component={RouterLink} to={`/sales/${item.toLowerCase().replace(/\s+/g, '-')}`} selected={activeTab === item}>
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
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, filters, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: '#fafafa' }}>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all credit notes' }}
          />
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
                    <IconButton size="small">
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

// --- Credit Notes Page Component ---
const creditNoteHeadCells = [
    { id: 'creditNoteNumber', numeric: false, label: 'CN No.' },
    { id: 'customer.name', numeric: false, label: 'Customer Name' },
    { id: 'issueDate', numeric: false, label: 'Date' },
    { id: 'grandTotal', numeric: true, label: 'Credit Amount' },
    { id: 'referenceInvoiceId', numeric: false, label: 'Reference Invoice' },
    { id: 'status', numeric: false, label: 'Status' },
    { id: 'actions', numeric: false, label: 'Actions', sortable: false, filterable: false },
];

const CreditNotesPage = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('issueDate');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const [creditNoteRows, setCreditNoteRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchCreditNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/credit-notes`, { withCredentials: true });
            setCreditNoteRows(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch credit notes:", err);
            setError(err.response?.data?.message || "Could not load credit notes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCreditNotes();
    }, [fetchCreditNotes]);


    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = creditNoteRows.map((n) => n._id);
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

    const filteredRows = useMemo(() => {
        let rows = [...creditNoteRows];
        if (searchTerm) {
            rows = rows.filter(row =>
                Object.values(row).some(value => {
                    if (typeof value === 'object' && value !== null) {
                        return Object.values(value).some(nestedValue => String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase()));
                    }
                    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }
        rows = rows.filter(row => {
            return Object.keys(filters).every(key => {
                if (!filters[key] || filters[key].length === 0) return true;
                return filters[key].includes(row[key]);
            });
        });
        return rows;
    }, [creditNoteRows, filters, searchTerm]);

    const getStatusChipColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'draft': return 'default';
            case 'open': return 'info';
            case 'closed': return 'success';
            case 'void': return 'error';
            default: return 'warning';
        }
    };

    return (
        <Box>
            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold'}}>124</Typography><Typography color="text.secondary">Total Credit notes</Typography></CardContent></Card></Grid>
                        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold', color: 'success.main'}}>$14,500</Typography><Typography color="text.secondary">Total Credit</Typography></CardContent></Card></Grid>
                        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold'}}>24</Typography><Typography color="text.secondary">Yet to be Used</Typography></CardContent></Card></Grid>
                        <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold', color: 'error.main'}}>$4,500</Typography><Typography color="text.secondary">Unadjusted Credit</Typography></CardContent></Card></Grid>
                    </Grid>
                </Grid>
                {/* Credit Notes Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: {xs: 1, md: 2} }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Typography variant="h6">Credit Notes</Typography>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}/>
                                <Button component={RouterLink} to="/CreditNote/new" variant="contained" startIcon={<AddIcon />}>New Credit Note</Button>
                            </Box>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }} aria-label="credit notes table">
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    onSelectAllClick={handleSelectAllClick}
                                    order={order}
                                    orderBy={orderBy}
                                    onRequestSort={handleRequestSort}
                                    rowCount={filteredRows.length}
                                    filters={filters}
                                    headCells={creditNoteHeadCells}
                                />
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={creditNoteHeadCells.length + 1} align="center" sx={{py: 5}}><CircularProgress/></TableCell></TableRow>
                                    ) : error ? (
                                        <TableRow><TableCell colSpan={creditNoteHeadCells.length + 1} align="center" sx={{py: 5}}><Alert severity="error">{error}</Alert></TableCell></TableRow>
                                    ) : stableSort(filteredRows, getComparator(order, orderBy))
                                     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                     .map((row) => {
                                        const isItemSelected = isSelected(row._id);
                                        return (
                                            <TableRow hover onClick={() => navigate(`/CreditNote/view/${row._id}`)} role="checkbox" tabIndex={-1} key={row._id} selected={isItemSelected} sx={{cursor: 'pointer'}}>
                                                <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} onClick={(e) => { e.stopPropagation(); handleClick(e, row._id); }}/></TableCell>
                                                <TableCell sx={{fontWeight: '500'}}>{row.creditNoteNumber}</TableCell>
                                                <TableCell>{row.customer?.name || 'N/A'}</TableCell>
                                                <TableCell>{format(new Date(row.issueDate), 'dd MMM yy')}</TableCell>
                                                <TableCell align="right">${(row.grandTotal || 0).toLocaleString()}</TableCell>
                                                <TableCell>{row.referenceInvoiceId || 'N/A'}</TableCell>
                                                <TableCell><Chip label={row.status || 'Draft'} size="small" color={getStatusChipColor(row.status)} sx={{fontWeight: 'bold', textTransform: 'capitalize'}} /></TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Box sx={{display: 'flex'}}>
                                                        <Tooltip title="View"><IconButton component={RouterLink} to={`/CreditNote/view/${row._id}`} size="small" color="info"><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                                                        <Tooltip title="Edit"><IconButton component={RouterLink} to={`/CreditNote/edit/${row._id}`} size="small" color="warning"><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {!loading && !error && filteredRows.length === 0 && (
                                       <TableRow><TableCell colSpan={creditNoteHeadCells.length + 1} align="center" sx={{py: 5}}><Typography>No credit notes found.</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
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
            </Grid>
        </Box>
    );
};


// --- Main App Component ---
export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <AppHeader activeTab="Credit Notes" />
        <CreditNotesPage />
      </Box>
    </ThemeProvider>
  );
}
