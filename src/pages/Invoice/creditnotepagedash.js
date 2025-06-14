import React from 'react';
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
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  TablePagination,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TableFooter
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Cancel as CancelIcon,
    FilterList as FilterListIcon,
    Payment as PaymentIcon,
    Download as DownloadIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

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
        containedPrimary: {
            backgroundColor: '#2962ff',
            '&:hover': {
                backgroundColor: '#0039cb',
            }
        },
        containedSecondary: {
            backgroundColor: '#7e57c2',
            '&:hover': {
                backgroundColor: '#4d2c91',
            }
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            }
        }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
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
                    <NavButton key={item} selected={activeTab === item}>
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
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
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
    if (order !== 0) {
      return order;
    }
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
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all credit notes',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {headCell.sortable !== false ? (
                    <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                    >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                ) : (
                    headCell.label
                )}
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

// --- Utility function to get status chip styles ---
const getStatusChipStyles = (status) => {
    const colors = {
        'Published': { bgColor: '#e8f5e9', textColor: 'success.dark' },
        'Awaiting payment': { bgColor: '#e3f2fd', textColor: 'info.dark' },
        'Awaiting Approval': { bgColor: '#fff3e0', textColor: 'warning.dark' },
        'Draft': { bgColor: '#f5f5f5', textColor: 'text.secondary' },
        'Settled': { bgColor: '#e8f5e9', textColor: 'success.dark' },
        'Refund Due': { bgColor: '#d1c4e9', textColor: '#311b92' },
    };
    const style = colors[status] || colors['Draft'];
    return { backgroundColor: style.bgColor, color: style.textColor, fontWeight: 'bold' };
};


// --- Mock Data (needed for dialogs and page) ---
const allInvoices = [
    { id: 'Inv-003', type: 'Invoice', customer: 'John Doe', date: '11 Sep 2024', dueDate: '11 Sep 2024', amount: 1200, amountPaid: 0, amountAllocated: 0, source: 'Whatsapp', eInvoiceStatus: 'Raised', status: 'Awaiting payment' },
    { id: 'Inv-004', type: 'Invoice', customer: 'Jane Smith', date: '11 Sep 2024', dueDate: '11 Sep 2024', amount: 2500, amountPaid: 0, amountAllocated: 0, source: 'Chatbot', eInvoiceStatus: 'Not Raised', status: 'Awaiting Approval' },
];

const allCreditNotes = [
    { id: 'CRN-001', type: 'Credit Note', customer: 'John Doe', date: '11 Sep 2024', amount: 1200, amountAllocated: 1200, amountRefunded: 0, ref_invoice: 'Inv-002', paymentStatus: 'Refunded', eInvoiceStatus: 'Raised', status: 'Settled' },
    { id: 'CRN-002', type: 'Credit Note', customer: 'Jane Smith', date: '11 Sep 2024', amount: 2500, amountAllocated: 0, amountRefunded: 0, ref_invoice: 'Inv-004', paymentStatus: 'Open', eInvoiceStatus: 'Not Raised', status: 'Awaiting Approval' },
    { id: 'CRN-003', type: 'Credit Note', customer: 'Adam Johnson', date: '11 Sep 2024', amount: 2500, amountAllocated: 2500, amountRefunded: 0, ref_invoice: 'Inv-005', paymentStatus: 'Adjusted', eInvoiceStatus: 'Raised', status: 'Settled' },
    { id: 'CRN-004', type: 'Credit Note', customer: 'Chris Lee', date: '11 Sep 2024', amount: 2500, amountAllocated: 0, amountRefunded: 0, ref_invoice: 'Inv-006', paymentStatus: 'Open', eInvoiceStatus: 'Raised', status: 'Draft' },
    { id: 'CRN-005', type: 'Credit Note', customer: 'Ben Davis', date: '11 Sep 2024', amount: 2500, amountAllocated: 2500, ref_invoice: 'Inv-007', paymentStatus: 'Adjusted', eInvoiceStatus: 'Not Raised', status: 'Settled' },
    { id: 'CRN-006', type: 'Credit Note', customer: 'Emily White', date: '12 Sep 2024', amount: 800, amountAllocated: 0, amountRefunded: 0, ref_invoice: 'Inv-008', paymentStatus: 'Open', eInvoiceStatus: 'Not Raised', status: 'Refund Due' },
    { id: 'CRN-007', type: 'Credit Note', customer: 'Michael Brown', date: '12 Sep 2024', amount: 1500, amountAllocated: 500, amountRefunded: 0, ref_invoice: 'Inv-009', paymentStatus: 'Open', eInvoiceStatus: 'Raised', status: 'Refund Due' },
    { id: 'CRN-008', type: 'Credit Note', customer: 'Sarah Green', date: '13 Sep 2024', amount: 300, amountAllocated: 300, amountRefunded: 0, ref_invoice: 'Inv-010', paymentStatus: 'Adjusted', eInvoiceStatus: 'Not Raised', status: 'Settled' },
    { id: 'CRN-009', type: 'Credit Note', customer: 'David Black', date: '14 Sep 2024', amount: 500, amountAllocated: 0, amountRefunded: 0, ref_invoice: 'Inv-011', paymentStatus: 'Open', eInvoiceStatus: 'Raised', status: 'Refund Due' },
    { id: 'CRN-010', type: 'Credit Note', customer: 'Laura Wilson', date: '15 Sep 2024', amount: 2000, amountAllocated: 800, amountRefunded: 500, ref_invoice: 'Inv-012', paymentStatus: 'Open', eInvoiceStatus: 'Raised', status: 'Settled' },
];

const allOverpayments = [
    { id: 'OP-001', type: 'Overpayment', customer: 'John Doe', date: '10 Sep 2024', amount: 500, ref_invoice: 'Inv-001' },
];

// --- Payment Dialog Component (Required by CreditNotesPage) ---
const PaymentDialog = ({ open, onClose, initialSelected, dialogTitle }) => {
    const allTransactions = [...allInvoices, ...allCreditNotes, ...allOverpayments].filter(t => t.status !== 'Draft' && t.status !== 'Awaiting Approval' && t.paymentStatus !== 'Paid' && t.paymentStatus !== 'Refunded' && t.paymentStatus !== 'Adjusted');
    const [selected, setSelected] = React.useState(initialSelected || []);

   React.useEffect(() => {
        if (open) {
            setSelected(initialSelected || []);
        }
    }, [open, initialSelected]);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = allTransactions.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const selectedTransactionDetails = allTransactions.filter(t => selected.includes(t.id));

    const subtotal = selectedTransactionDetails.reduce((acc, curr) => {
        const amount = curr.amount || 0;
        const value = curr.type === 'Invoice' ? amount : -amount;
        return acc + value;
    }, 0);

    const dialogTableHeadCells = [
        { id: 'type', label: 'Type' },
        { id: 'customer', label: 'Head' },
        { id: 'id', label: 'Transaction No.' },
        { id: 'date', label: 'Date' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'amount', numeric: true, label: 'Amount Due' },
        { id: 'credit', numeric: true, label: 'Credit' },
    ];

    const renderActionButton = () => {
        if (subtotal > 0) {
            return <Button variant="contained" color="success">Deposit</Button>;
        }
        if (subtotal < 0) {
            return <Button variant="contained" color="primary">Process Refund</Button>;
        }
        return <Button variant="contained" color="secondary">Allocate</Button>;
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>{dialogTitle || 'Make a Payment'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField label="Select Payment date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField label="Reference" fullWidth />
                    </Grid>
                    {subtotal !== 0 && (
                        <Grid item xs={12} sm={4}>
                            <TextField label="Select account" fullWidth />
                        </Grid>
                    )}
                </Grid>

                <Typography variant="h6" gutterBottom>Find and Select Transactions</Typography>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={5}>
                        <TextField label="Search by name or reference" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                    </Grid>
                     <Grid item xs={12} sm={5}>
                        <TextField label="Search by amount" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <FormControlLabel control={<Checkbox />} label="Show INR Items Only" />
                    </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{maxHeight: 300, mb: 2}}>
                    <Table stickyHeader>
                        <EnhancedTableHead
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                            rowCount={allTransactions.length}
                            headCells={dialogTableHeadCells}
                            onRequestSort={()=>{}}
                            order="asc"
                            orderBy="id"
                        />
                        <TableBody>
                            {allTransactions.map(row => {
                                const isItemSelected = isSelected(row.id);
                                return (
                                <TableRow key={row.id} hover onClick={(e) => handleClick(e, row.id)} role="checkbox" tabIndex={-1} selected={isItemSelected}>
                                    <TableCell padding="checkbox">
                                        <Checkbox color="primary" checked={isItemSelected} />
                                    </TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.customer}</TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.dueDate || 'N/A'}</TableCell>
                                    <TableCell align="right">{row.type === 'Invoice' ? `$${row.amount.toLocaleString()}`: ''}</TableCell>
                                    <TableCell align="right">{row.type !== 'Invoice' ? `$${row.amount.toLocaleString()}`: ''}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="h6" sx={{mt: 4}}>Selected Transactions</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                {dialogTableHeadCells.map(cell => <TableCell key={cell.id} align={cell.numeric ? 'right' : 'left'}>{cell.label}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedTransactionDetails.map(row => (
                                <TableRow key={row.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox color="primary" checked={isSelected(row.id)} onChange={(e) => handleClick(e, row.id)} />
                                    </TableCell>
                                    <TableCell>{row.type}</TableCell>
                                    <TableCell>{row.customer}</TableCell>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.dueDate || 'N/A'}</TableCell>
                                    <TableCell align="right">{row.type === 'Invoice' ? `$${row.amount.toLocaleString()}`: ''}</TableCell>
                                    <TableCell align="right">{row.type !== 'Invoice' ? `$${row.amount.toLocaleString()}`: ''}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={6} align="right"><Typography variant="h6">Subtotal</Typography></TableCell>
                                <TableCell align="right"><Typography variant="h6">${subtotal.toLocaleString()}</Typography></TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>

            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Cancel</Button>
                {renderActionButton()}
            </DialogActions>
        </Dialog>
    );
}

// --- Credit Notes Page Component ---
const creditNoteHeadCells = [
    { id: 'id', numeric: false, label: 'CN No.' },
    { id: 'customer', numeric: false, label: 'Customer Name' },
    { id: 'date', numeric: false, label: 'Date' },
    { id: 'amount', numeric: true, label: 'Credit Amount' },
    { id: 'ref_invoice', numeric: false, label: 'Reference Invoice' },
    { id: 'paymentStatus', numeric: false, label: 'Payment Status' },
    { id: 'eInvoiceStatus', numeric: false, label: 'E-Invoice Status' },
    { id: 'status', numeric: false, label: 'Status' },
    { id: 'actions', numeric: false, label: 'Actions', sortable: false, filterable: false },
];

const CreditNotesPage = () => {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('customer');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [filters, setFilters] = React.useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [currentFilterKey, setCurrentFilterKey] = React.useState(null);
    const [tempFilterValues, setTempFilterValues] = React.useState([]);
    const [filterSearch, setFilterSearch] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
    const [sortBy, setSortBy] = React.useState('This Month');
    const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
    const sortOptions = ['This Month', 'Last Month', 'This Year', 'All Time'];
    const creditNoteRows = allCreditNotes;

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = creditNoteRows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
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
        setTempFilterValues(prev =>
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    const handleSelectAllFilter = (event) => {
        if (event.target.checked) {
            setTempFilterValues(filteredUniqueColumnValues);
        } else {
            setTempFilterValues([]);
        }
    };

    const handleApplyFilter = () => {
        setFilters(prev => ({ ...prev, [currentFilterKey]: tempFilterValues }));
        handleFilterClose();
    };

    const handleClearFilter = () => {
        setFilters(prev => ({...prev, [currentFilterKey]: []}));
        handleFilterClose();
    }

    const handleSortMenuClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = () => {
        setSortAnchorEl(null);
    };

    const handleSortMenuItemClick = (option) => {
        setSortBy(option);
        handleSortMenuClose();
    };

    const filteredRows = React.useMemo(() => {
        let rows = creditNoteRows.map(row => {
            let paymentStatus = row.paymentStatus;
            let status = row.status;
            let eInvoiceStatus = row.eInvoiceStatus;

            if (status === 'Draft' || status === 'Awaiting Approval') {
                eInvoiceStatus = 'Not Raised';
            } else if (paymentStatus === 'Adjusted' || paymentStatus === 'Refunded') {
                status = 'Settled';
            } else if (paymentStatus === 'Open') {
                const allocated = row.amountAllocated || 0;
                const refunded = row.amountRefunded || 0;
                const totalUsed = allocated + refunded;

                 if (totalUsed >= row.amount) {
                    status = 'Settled';
                    paymentStatus = 'Adjusted';
                } else if (allocated > 0 && refunded > 0) {
                    paymentStatus = 'Partially Refunded & Allocated';
                    status = 'Settled';
                } else if (totalUsed > 0) {
                    paymentStatus = 'Partially Used';
                    status = 'Refund Due';
                } else {
                    status = 'Refund Due';
                }
            }
            return {...row, paymentStatus, status, eInvoiceStatus};
        })
        .filter(row => {
            return Object.keys(filters).every(key => {
                if (!filters[key] || filters[key].length === 0) return true;
                return filters[key].includes(row[key]);
            });
        });

        if (searchTerm) {
            rows = rows.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        return rows;
    }, [creditNoteRows, filters, searchTerm]);

    const isPaymentDisabled = selected.length === 0 || selected.some(id => {
        const row = creditNoteRows.find(r => r.id === id);
        return row && (row.status === 'Draft' || row.status === 'Awaiting Approval');
    });

    const uniqueColumnValues = currentFilterKey ? [...new Set(creditNoteRows.map(item => item[currentFilterKey]))] : [];

    const filteredUniqueColumnValues = uniqueColumnValues.filter(val => String(val).toLowerCase().includes(filterSearch.toLowerCase()));

    const isAllSelected = filteredUniqueColumnValues.length > 0 && tempFilterValues.length === filteredUniqueColumnValues.length;
    const isIndeterminate = tempFilterValues.length > 0 && tempFilterValues.length < filteredUniqueColumnValues.length;

    const getPaymentStatusChip = (row) => {
        let status = row.paymentStatus;
        if (status === 'Open' && row.amountAllocated > 0 && row.amountAllocated < row.amount) {
            status = 'Partially Used';
        }
         if (status === 'Open' && (row.amountAllocated || 0) > 0 && (row.amountRefunded || 0) > 0) {
            status = 'Partially Refunded & Allocated';
        }

        const style = {
            'Refunded': { color: 'success', bgColor: '#e8f5e9', textColor: 'success.dark' },
            'Adjusted': { color: 'info', bgColor: '#e3f2fd', textColor: 'info.dark' },
            'Open': { color: 'error', bgColor: '#ffebee', textColor: 'error.dark' },
            'Partially Used': { color: 'warning', bgColor: '#fff3e0', textColor: 'warning.dark' },
            'Partially Refunded & Allocated': { color: 'secondary', bgColor: '#e8eaf6', textColor: '#3f51b5' },

        }[status] || { color: 'default', bgColor: '#f5f5f5', textColor: 'text.secondary' };

        return <Chip label={status} color={style.color} size="small" sx={{ backgroundColor: style.bgColor, color: style.textColor, fontWeight: 'bold'}}/>;
    }

    return (
        <>
       <PaymentDialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} initialSelected={selected} dialogTitle="Allocate credits/Refund" />
        <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold'}}>124</Typography><Typography color="text.secondary">Total Credit notes raised</Typography></CardContent></Card></Grid>
                    <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold', color: 'success.main'}}>$14,500</Typography><Typography color="text.secondary">Total Credit Note</Typography></CardContent></Card></Grid>
                    <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold'}}>24</Typography><Typography color="text.secondary">Yet to Publish</Typography></CardContent></Card></Grid>
                    <Grid item xs={6} sm={3}><Card><CardContent><Typography variant="h5" sx={{fontWeight: 'bold', color: 'error.main'}}>$4,500</Typography><Typography color="text.secondary">Unadjusted Credit Note</Typography></CardContent></Card></Grid>
                </Grid>
            </Grid>
            {/* Credit Notes Table */}
            <Grid item xs={12}>
                <Paper sx={{ p: {xs: 1, md: 2} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Typography variant="h6">Credit Notes</Typography>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}/>
                            <Button variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={handleSortMenuClick}>Sort by: {sortBy}</Button>
                            <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={handleSortMenuClose}>
                                {sortOptions.map(option => <MenuItem key={option} onClick={() => handleSortMenuItemClick(option)}>{option}</MenuItem>)}
                            </Menu>
                            <Button variant="contained" startIcon={<AddIcon />}>New Credit Note</Button>
                            <Button variant="contained" color="success" startIcon={<PaymentIcon />} disabled={isPaymentDisabled} onClick={() => setPaymentDialogOpen(true)}>Allocate credits/Refund</Button>
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
                                rowCount={creditNoteRows.length}
                                onFilterClick={handleFilterClick}
                                filters={filters}
                                headCells={creditNoteHeadCells}
                            />
                            <TableBody>
                                {stableSort(filteredRows, getComparator(order, orderBy))
                                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                 .map((row, index) => {
                                    const isItemSelected = isSelected(row.id);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => handleClick(event, row.id)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.id}
                                            selected={isItemSelected}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                                         >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                    'aria-labelledby': labelId,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{fontWeight: '500'}}>{row.id}</TableCell>
                                            <TableCell sx={{fontWeight: '500'}}>{row.customer}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell align="right">{`$${row.amount.toLocaleString()}`}</TableCell>
                                            <TableCell>{row.ref_invoice}</TableCell>
                                            <TableCell>
                                                {getPaymentStatusChip(row)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.eInvoiceStatus} color={row.eInvoiceStatus === 'Raised' ? 'info' : 'default'} size="small" sx={{ backgroundColor: row.eInvoiceStatus === 'Raised' ? '#e3f2fd' : '#f5f5f5', color: row.eInvoiceStatus === 'Raised' ? 'info.dark' : 'text.secondary', fontWeight: 'bold'}}/>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.status} size="small" sx={getStatusChipStyles(row.status)} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex'}}>
                                                    {row.status === 'Refund Due' && (
                                                        <IconButton
                                                            size="small"
                                                            aria-label="pay"
                                                            color="success"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelected([row.id]);
                                                                setPaymentDialogOpen(true);
                                                            }}
                                                        >
                                                            <PaymentIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    <IconButton size="small" aria-label="view" color="info"><VisibilityIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="edit" color="warning"><EditIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="cancel" color="error"><CancelIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <Box sx={{ p: 2, pt: 1, width: 280 }}>
                             <TextField fullWidth size="small" variant="outlined" placeholder="Search..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>)}} sx={{mb: 1}}/>
                            <FormControlLabel
                                label="Select All"
                                 control={
                                    <Checkbox
                                        size="small"
                                        checked={isAllSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAllFilter}
                                    />
                                }
                            />
                            <Divider/>
                            <FormGroup sx={{maxHeight: 200, overflow: 'auto', mt:1}}>
                                {filteredUniqueColumnValues.map(value => (
                                    <FormControlLabel
                                        key={value}
                                        control={<Checkbox checked={tempFilterValues.includes(String(value))} onChange={handleFilterChange} value={String(value)} size="small"/>}
                                        label={String(value)}
                                    />
                                ))}
                            </FormGroup>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                                <Button onClick={handleClearFilter} size="small">Clear</Button>
                                <Button onClick={handleApplyFilter} variant="contained" size="small">Apply</Button>
                            </Box>
                        </Box>
                    </Popover>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
        </>
    )
}


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
