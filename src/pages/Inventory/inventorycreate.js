import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- INLINE SVG ICONS ---
const Edit = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Trash2 = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const Eye = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const CalendarToday = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const Add = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Remove = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const InfoOutlined = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const Download = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const Settings = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H15a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);
const FilterList = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const Search = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);


// --- THEME AND STYLING ---
const theme = createTheme({
  palette: {
    primary: { main: '#007aff' },
    secondary: { main: '#6c757d' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#1c1c1e', secondary: '#6c757d' },
    error: { main: '#d32f2f' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
        fontWeight: 600,
        fontSize: '1rem',
        marginBottom: '1rem',
        color: '#333'
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: '#555',
          '&.Mui-selected': {
            color: '#000',
          },
        },
      },
    },
     MuiOutlinedInput: {
      styleOverrides: {
        root: {
            borderRadius: '8px',
            backgroundColor: 'white',
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                border: '1px solid #e0e0e0'
            }
        }
    }
  },
});


// --- MOCK DATA ---
const transactions = [
    { id: 1, date: '2023-05-12', type: 'Sales', number: '2005', amount: 9200, displayName: 'Innovate Inc.' },
    { id: 2, date: '2023-05-14', type: 'Purchase', number: '1050', amount: 3500, displayName: 'Synergy Corp.' },
    { id: 3, date: '2023-05-13', type: 'Sales', number: '2006', amount: 2500, displayName: 'Apex Solutions' },
    { id: 4, date: '2023-05-15', type: 'Credit Note', number: 'CN-001', amount: 1200, displayName: 'Innovate Inc.' },
    { id: 5, date: '2023-05-16', type: 'Payment', number: 'PAY-345', amount: 9200, displayName: 'Innovate Inc.' },
    { id: 6, date: '2023-05-18', type: 'Quotation', number: 'QT-102', amount: 18000, displayName: 'Future Gadgets' },
    { id: 7, date: '2023-05-20', type: 'PO', number: 'PO-050', amount: 7500, displayName: 'Synergy Corp.' },
    { id: 8, date: '2023-05-21', type: 'Receipt', number: 'REC-987', amount: 3500, displayName: 'Synergy Corp.' },
];

const accountStatementData = [
    { id: 1, date: '12/05/2023', voucher: 'Opening Balance', srNo: '', credit: '-', debit: '-', balance: '0.0', details: { credit: '500.00', debit: '0.00' } },
    { id: 2, date: '12/05/2023', voucher: 'Sales Invoice #123', srNo: '1', credit: '1,500.00', debit: '-', balance: '1,500.00', details: { credit: '1,500.00', debit: '0.00' } },
];

const itemWiseReportData = [
    { id: 1, name: 'Laptop', code: 'LP-001', salesQty: 5, salesAmt: '2,50,000', purchaseQty: 10, purchaseAmt: '4,50,000' },
    { id: 2, name: 'Mouse', code: 'MS-005', salesQty: 25, salesAmt: '12,500', purchaseQty: 50, purchaseAmt: '20,000' },
];


// --- Component Placeholders (will be reassigned later) ---
let ProfileView = () => null;
let AccountStatementRow = () => null;
let AccountStatementView = () => null;
let ItemWiseReportView = () => null;
let InvoicesView = () => <Typography>Invoices View</Typography>;
let CustomersView = () => <Typography>Customers View</Typography>;
let SalesByCategoryView = () => <Typography>Sales By Category View</Typography>;


// --- SORTING & FILTERING UTILS ---
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

const transactionTableHeaders = [
    { id: 'displayName', label: 'Display Name', filterable: true },
    { id: 'date', label: 'Date', filterable: true },
    { id: 'type', label: 'Transaction Type', filterable: true },
    { id: 'number', label: 'Transaction Number', filterable: true },
    { id: 'amount', label: 'Amount', filterable: true },
]

// --- Filter Menu Component ---
const FilterMenu = ({ anchorEl, onClose, options, selected, onApply, columnLabel }) => {
    const [searchText, setSearchText] = React.useState('');
    const [localSelected, setLocalSelected] = React.useState(selected);

    React.useEffect(() => {
        setLocalSelected(selected);
    }, [selected]);

    const handleToggle = (value) => {
        const currentIndex = localSelected.indexOf(value);
        const newChecked = [...localSelected];
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setLocalSelected(newChecked);
    };

    const handleSelectAll = () => {
        setLocalSelected(options);
    }

    const handleClearAll = () => {
        setLocalSelected([]);
    }

    const filteredOptions = options.filter(option => String(option).toLowerCase().includes(searchText.toLowerCase()));

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => onClose(localSelected)}
            PaperProps={{ style: { width: 300 } }}
        >
            <Box p={2}>
                 <Typography variant="subtitle1" gutterBottom>Filter by {columnLabel}</Typography>
                 <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Search values..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                    }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                    <Button onClick={handleSelectAll} color="primary">SELECT ALL</Button>
                    <Button onClick={handleClearAll} color="secondary">CLEAR</Button>
                </Box>
            </Box>
            <Divider />
            <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                {filteredOptions.map(option => (
                     <ListItem key={option} dense button onClick={() => handleToggle(option)}>
                        <Checkbox
                            edge="start"
                            checked={localSelected.indexOf(option) !== -1}
                            tabIndex={-1}
                            disableRipple
                        />
                        <ListItemText primary={option} />
                    </ListItem>
                ))}
            </List>
             <Divider />
             <Box p={2} display="flex" justifyContent="flex-end">
                <Button onClick={() => onClose(selected)}>CANCEL</Button>
                <Button onClick={() => {onApply(localSelected); onClose()}} variant="contained" color="primary" sx={{ml: 1}}>APPLY</Button>
             </Box>
        </Menu>
    )
}

// --- Transactions View Component (Simplified) ---
const TransactionsView = () => {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('date');
    const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);
    const [activeFilter, setActiveFilter] = React.useState({id: null, label: null});
    const [filters, setFilters] = React.useState({
        displayName: [],
        type: [],
        date: [],
        number: [],
        amount: []
    });
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleFilterClick = (event, columnId, columnLabel) => {
        setFilterAnchorEl(event.currentTarget);
        setActiveFilter({id: columnId, label: columnLabel});
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
        setActiveFilter({id: null, label: null});
    };

    const handleApplyFilter = (selectedValues) => {
        setFilters(prev => ({...prev, [activeFilter.id]: selectedValues}));
    }

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
          const newSelecteds = filteredTransactions.map((n) => n.id);
          setSelected(newSelecteds);
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getFilterOptions = (columnId) => {
        return [...new Set(transactions.map(item => item[columnId]))];
    }

    const filteredTransactions = transactions.filter(transaction => {
        return Object.keys(filters).every(key => {
            if(filters[key].length === 0) return true;
            return filters[key].includes(transaction[key]);
        })
    });

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredTransactions.length) : 0;


    return (
        <Paper sx={{ width: '100%', p: {xs: 2, md: 3}, borderRadius: '12px' }} elevation={0}>
            <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                <Table sx={{ minWidth: 750 }} aria-label="transactions table">
                    <TableHead sx={{ backgroundColor: '#fafafa' }}>
                        <TableRow>
                            <TableCell padding="checkbox"><Checkbox indeterminate={selected.length > 0 && selected.length < filteredTransactions.length} checked={filteredTransactions.length > 0 && selected.length === filteredTransactions.length} onChange={handleSelectAllClick}/></TableCell>
                             {transactionTableHeaders.map(headCell => (
                                <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
                                    <Box display="flex" alignItems="center">
                                         <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(headCell.id)}
                                        >
                                            {headCell.label}
                                        </TableSortLabel>
                                        {headCell.filterable && (
                                            <IconButton size="small" onClick={(e) => handleFilterClick(e, headCell.id, headCell.label)}>
                                                <FilterList fontSize="small" color={filters[headCell.id]?.length > 0 ? 'primary' : 'inherit'}/>
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                            ))}
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stableSort(filteredTransactions, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                            const isItemSelected = isSelected(row.id);
                            return (
                            <TableRow key={row.id} hover onClick={(event) => handleClick(event, row.id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                                <TableCell padding="checkbox"><Checkbox checked={isItemSelected}/></TableCell>
                                <TableCell>{row.displayName}</TableCell>
                                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                <TableCell>{row.type}</TableCell>
                                <TableCell>{row.number}</TableCell>
                                <TableCell>{row.amount.toLocaleString()}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="View Details"><IconButton size="small" sx={{color: 'text.secondary'}}><Eye /></IconButton></Tooltip>
                                    <Tooltip title="Edit"><IconButton size="small" sx={{color: 'primary.main'}}><Edit /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton size="small" sx={{color: 'error.main'}}><Trash2 /></IconButton></Tooltip>
                                </TableCell>
                            </TableRow>
                        )})}
                        {emptyRows > 0 && (<TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={7} /></TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
             <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            {activeFilter.id && (
                 <FilterMenu
                    anchorEl={filterAnchorEl}
                    onClose={handleFilterClose}
                    options={getFilterOptions(activeFilter.id)}
                    selected={filters[activeFilter.id]}
                    onApply={handleApplyFilter}
                    columnLabel={activeFilter.label}
                />
            )}
        </Paper>
    )
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTopTab, setActiveTopTab] = React.useState(0);
  const [activeSubTab, setActiveSubTab] = React.useState(0);
  const [reportType, setReportType] = React.useState('');

  const reportNames = [
    'Transactions',
    'Account Statement',
    'Item wise report'
  ];

  const [reportsToInclude, setReportsToInclude] = React.useState(
    reportNames.reduce((acc, name) => ({ ...acc, [name]: false }), {})
  );

  const transactionTypes = ['Sales', 'Purchases', 'Credit Notes', 'Debit Notes', 'Payment', 'Receipts', 'PO', 'Quotation'];
  const topTabs = ['Customer Receivables', 'Invoices', 'Customers', 'Sales by Category'];
  const subTabs = ['Transactions', 'Profile', 'Account Statement', 'Item wise report'];

  const handleTopTabChange = (event, newValue) => {
    setActiveTopTab(newValue);
  };

  const handleSubTabChange = (event, newValue) => {
    setActiveSubTab(newValue);
  };

  const handleIncludeReportChange = (event) => {
    setReportsToInclude({
      ...reportsToInclude,
      [event.target.name]: event.target.checked,
    });
  };


  return (
    <ThemeProvider theme={theme}>
       <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1200 }}>
            {/* Top Level Tabs */}
            <Paper elevation={0} sx={{ width: '100%', mb: 2, backgroundColor: '#f0f0f0', borderRadius: '8px', border: 'none' }}>
                <Tabs
                    value={activeTopTab}
                    onChange={handleTopTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    {topTabs.map((label) => (
                        <Tab key={label} label={label} sx={{ fontWeight: 'bold' }} />
                    ))}
                </Tabs>
            </Paper>

            {/* Conditional Rendering for Main Content */}
            {activeTopTab === 0 && (
                <>
                {/* Sub Navigation Tabs */}
                <Paper elevation={0} sx={{ width: '100%', mb: 3, backgroundColor: '#f0f0f0', borderRadius: '8px', border: 'none' }}>
                    <Tabs
                        value={activeSubTab}
                        onChange={handleSubTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        TabIndicatorProps={{ style: { display: "none" } }}
                    >
                    {subTabs.map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            sx={{
                                backgroundColor: activeSubTab === index ? 'white' : 'transparent',
                                borderRadius: '8px',
                                margin: '4px',
                                color: activeSubTab === index ? 'primary.main' : 'text.secondary',
                                border: activeSubTab === index ? '1px solid #e0e0e0' : 'none',
                                '&.Mui-selected': { color: 'primary.main' }
                            }}
                        />
                    ))}
                    </Tabs>
                </Paper>

                {/* Common Header: Customer Name */}
                <Typography variant="h5" sx={{ mb: 2 }}>Customer Name: XXXXX</Typography>

                {/* Filters and Controls based on Active Sub-Tab */}
                {activeSubTab === 0 && ( /* Transaction Filters */
                    <Grid container spacing={2} sx={{ mb: 3, p:2, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e0e0e0' }} alignItems="center">
                        <Grid item xs={12}><Typography variant="h6" sx={{mb:0}}>Filters & Reports</Typography></Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth size="small" variant="outlined" label="From Date" type="date" InputLabelProps={{ shrink: true }}/>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth size="small" variant="outlined" label="To Date" type="date" InputLabelProps={{ shrink: true }}/>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Transaction type</InputLabel>
                            <Select label="Transaction type" defaultValue="All">
                                <MenuItem value="All">All</MenuItem>
                                {transactionTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Button fullWidth variant="contained" color="primary">Run</Button>
                        </Grid>
                        <Grid item xs={12} sx={{mt:2, pt: 2, borderTop: '1px solid #eee'}}>
                        <Typography variant="body1" sx={{fontWeight: 'bold', mb: 2}}>Generate Report</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="report-type-label">Report Type</InputLabel>
                            <Select
                                labelId="report-type-label"
                                label="Report Type"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <MenuItem value="Customer Statement">Customer Statement</MenuItem>
                                <MenuItem value="Customer statement with AI Summary">Customer statement with AI Summary</MenuItem>
                            </Select>
                        </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8} md={8}>
                            <FormControl component="fieldset" variant="standard">
                                <FormGroup row>
                                    {reportNames.map((name) => (
                                        <FormControlLabel
                                            key={name}
                                            control={
                                            <Checkbox checked={reportsToInclude[name]} onChange={handleIncludeReportChange} name={name} />
                                            }
                                            label={name}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                )}
                {activeSubTab === 2 && ( /* Account Statement Filters */
                    <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }} justifyContent="center">
                        <Grid item><Typography variant="body1" sx={{fontWeight: 'bold'}}>Period</Typography></Grid>
                        <Grid item>
                            <TextField size="small" variant="outlined" placeholder="Select date" InputProps={{startAdornment: (<InputAdornment position="start"><CalendarToday fontSize="small" /></InputAdornment>),}}/>
                        </Grid>
                        <Grid item><Button variant="contained" color="primary" startIcon={<Download />}>Download PDF</Button></Grid>
                    </Grid>
                )}
                {activeSubTab === 3 && ( /* Item Wise Report Filters */
                    <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }} justifyContent="center">
                        <Grid item><Typography variant="body1" sx={{fontWeight: 'bold'}}>Period</Typography></Grid>
                        <Grid item>
                            <TextField size="small" variant="outlined" placeholder="Select date" InputProps={{startAdornment: (<InputAdornment position="start"><CalendarToday fontSize="small" /></InputAdornment>),}}/>
                        </Grid>
                        <Grid item><Typography variant="body1" sx={{fontWeight: 'bold', ml: {xs: 0, md: 2}, mt: {xs: 2, md: 0}}}>Transaction type</Typography></Grid>
                        <Grid item>
                            <TextField size="small" variant="outlined" placeholder="Select date" InputProps={{startAdornment: (<InputAdornment position="start"><CalendarToday fontSize="small" /></InputAdornment>),}} sx={{minWidth: '220px'}}/>
                        </Grid>
                    </Grid>
                )}

                {/* Conditional Content */}
                {activeSubTab === 0 && <TransactionsView />}
                {activeSubTab === 1 && <ProfileView />}
                {activeSubTab === 2 && <AccountStatementView />}
                {activeSubTab === 3 && <ItemWiseReportView />}
                </>
            )}

            {activeTopTab === 1 && <InvoicesView />}
            {activeTopTab === 2 && <CustomersView />}
            {activeTopTab === 3 && <SalesByCategoryView />}

        </Box>
      </Box>
    </ThemeProvider>
  );
}


// --- Placeholder Full Components ---
const FullProfileView = () => {
    const [isEditing, setIsEditing] = React.useState(false);

    // Dummy data for display
    const profile = {
        customerType: 'Business',
        gstRegistered: 'Yes',
        gstNumber: '22AAAAA0000A1Z5',
        businessType: 'Retailer',
        companyName: 'Innovate Inc.',
        displayName: 'Innovate Inc. Display',
        pan: 'ABCDE1234F',
        primaryName: 'John Doe',
        primaryContact: '123-456-7890',
        primaryEmail: 'john.doe@innovate.com',
        primaryWebsite: 'https://innovate.com',
        billingAddress1: '123 Innovation Drive',
        billingAddress2: 'Suite 100',
        billingCity: 'Techville',
        billingState: 'California',
        billingCountry: 'United States',
        billingZip: '90210',
        deliveryAddress1: '123 Innovation Drive',
        deliveryAddress2: 'Suite 100',
        deliveryCity: 'Techville',
        deliveryState: 'California',
        deliveryCountry: 'United States',
        deliveryZip: '90210',
        openingBalance: '₹5,000.00',
        paymentTerms: 'Net 30',
        creditLimit: '₹1,00,000.00',
        bankName: 'Global Tech Bank',
        accountNo: '**** **** **** 1234',
        ifsc: 'GTB0000123',
        swift: 'GTBINBBXXX',
        currency: 'Indian Rupee',
        tcsOnSale: true,
        tdsOnSale: false,
        gstTds: false,
        gstTcs: true,
        enableBills: true,
        note: 'Initial customer setup. Handles all major tech supplies.'
    };

    const DetailItem = ({ label, value }) => (
        <Box sx={{mb: 2}}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{value || '—'}</Typography>
        </Box>
    );

    const SwitchDetailItem = ({ label, checked }) => (
         <FormControlLabel
            disabled
            control={<Switch checked={checked} readOnly />}
            labelPlacement="start"
            label={label}
            sx={{justifyContent: 'space-between', width: '100%', ml: 0, color: 'text.primary'}}
        />
    )

    return (
        <Paper sx={{ p: {xs: 2, md: 4}, borderRadius: '12px' }} elevation={0}>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Profile</Typography>
                 {isEditing ? (
                    <Box>
                        <Button onClick={() => setIsEditing(false)} sx={{mr: 1}}>Cancel</Button>
                        <Button onClick={() => setIsEditing(false)} variant="contained" color="primary">Save</Button>
                    </Box>
                ) : (
                    <Tooltip title="Edit Profile">
                        <IconButton onClick={() => setIsEditing(true)} color="primary">
                            <Edit />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Grid container spacing={4}>
            {isEditing ? (
                // EDIT MODE (Original Form)
                <React.Fragment>
                     <Grid item xs={12} md={4}>
                        <Typography variant="h6">Contact Details</Typography>
                        <RadioGroup row defaultValue={profile.customerType}>
                            <FormControlLabel value="Business" control={<Radio />} label="Business" />
                            <FormControlLabel value="Individual" control={<Radio />} label="Individual" />
                        </RadioGroup>
                        <FormControlLabel control={<Checkbox defaultChecked={profile.gstRegistered === 'Yes'}/>} label="GST Registered" />
                        <TextField fullWidth label="GST Number" defaultValue={profile.gstNumber} variant="outlined" size="small" sx={{mt:1, mb:2}}/>
                        <TextField fullWidth select label="Type of Business" defaultValue={profile.businessType} variant="outlined" size="small" sx={{mb:2}}><MenuItem value="Retailer">Retailer</MenuItem></TextField>
                        <TextField fullWidth label="Company Name" defaultValue={profile.companyName} variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth required label="Display Name" defaultValue={profile.displayName} variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth label="PAN" defaultValue={profile.pan} variant="outlined" size="small" sx={{mb:4}} InputProps={{endAdornment: <InputAdornment position="end"><InfoOutlined fontSize="small" color="action" /></InputAdornment>}}/>
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2}}>Primary Contact</Typography>
                         <TextField fullWidth label="Name" defaultValue={profile.primaryName} variant="outlined" size="small" sx={{mt: 2, mb: 2}}/>
                         <TextField fullWidth label="Contact No." defaultValue={profile.primaryContact} variant="outlined" size="small" sx={{mb: 2}}/>
                         <TextField fullWidth label="E-mail" defaultValue={profile.primaryEmail} variant="outlined" size="small" sx={{mb: 2}}/>
                         <TextField fullWidth label="Website" defaultValue={profile.primaryWebsite} variant="outlined" size="small"/>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6">Address</Typography>
                        <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1, fontSize: '0.9rem'}}>Billing Address</Typography>
                        <TextField required fullWidth label="Address Line 1" defaultValue={profile.billingAddress1} variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth label="Address Line 2" defaultValue={profile.billingAddress2} variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth label="Address Line 3 (City/Town)" defaultValue={profile.billingCity} variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth select label="Billing State" defaultValue="California" variant="outlined" size="small" sx={{mb:2}}><MenuItem value="California">California</MenuItem></TextField>
                        <TextField fullWidth select label="Billing Country" defaultValue="United States" variant="outlined" size="small" sx={{mb:2}}><MenuItem value="United States">United States</MenuItem></TextField>
                        <TextField required fullWidth label="PIN/ZIP Code" defaultValue={profile.billingZip} variant="outlined" size="small" sx={{mb:4}}/>
                        <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1, fontSize: '0.9rem'}}>Delivery Address</Typography>
                        <FormControlLabel control={<Checkbox />} label="Same as billing address" sx={{mb: 1}}/>
                        <TextField fullWidth label="Address Line 1" variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth label="Address Line 2" variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth label="Address Line 3 (City/Town)" variant="outlined" size="small" sx={{mb:2}}/>
                        <TextField fullWidth select label="Delivery State" defaultValue="" variant="outlined" size="small" sx={{mb:2}}><MenuItem value="CA">California</MenuItem></TextField>
                        <TextField fullWidth select label="Delivery Country" defaultValue="" variant="outlined" size="small" sx={{mb:2}}><MenuItem value="USA">United States</MenuItem></TextField>
                        <TextField fullWidth label="PIN/ZIP Code" variant="outlined" size="small" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6">Financial Details</Typography>
                         <TextField fullWidth label="Opening Balance" defaultValue={profile.openingBalance} InputProps={{startAdornment: <InputAdornment position="start">₹</InputAdornment>}} variant="outlined" size="small" sx={{mb:2}}/>
                         <TextField required fullWidth select label="Payment Terms" defaultValue="Net 30" variant="outlined" size="small" sx={{mb:2}}><MenuItem value="Net 30">Net 30</MenuItem></TextField>
                         <TextField fullWidth label="Credit limit" defaultValue={profile.creditLimit} InputProps={{startAdornment: <InputAdornment position="start">₹</InputAdornment>}} variant="outlined" size="small" sx={{mb:4}}/>
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mb: 2}}>Bank account</Typography>
                         <TextField fullWidth label="Bank account name" defaultValue={profile.bankName} variant="outlined" size="small" sx={{mb: 2}}/>
                         <TextField fullWidth label="Account No" defaultValue={profile.accountNo} variant="outlined" size="small" sx={{mb: 2}}/>
                         <TextField fullWidth label="IFSC Code" defaultValue={profile.ifsc} variant="outlined" size="small" sx={{mb: 2}}/>
                         <TextField fullWidth label="SWIFT Code" defaultValue={profile.swift} variant="outlined" size="small" sx={{mb: 2}}/>
                         <TextField fullWidth select label="Currency" defaultValue="INR" variant="outlined" size="small" sx={{mb:4}}><MenuItem value="INR">Indian Rupee</MenuItem></TextField>
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mb: 1}}>Tax Details</Typography>
                        <FormControlLabel control={<Switch defaultChecked={profile.tcsOnSale} />} label="TCS on sale" />
                        <FormControlLabel control={<Switch defaultChecked={profile.tdsOnSale}/>} label="TDS on sale" />
                        <FormControlLabel control={<Switch defaultChecked={profile.gstTds} />} label="GST TDS" />
                        <FormControlLabel control={<Switch defaultChecked={profile.gstTcs} />} label="GST TCS" sx={{mb:2}}/>
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mb: 1}}>Bills & Payments</Typography>
                        <FormControlLabel control={<Switch defaultChecked={profile.enableBills}/>} label="Enable Bills & Payments" sx={{mb:2}}/>
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mb: 1}}>Others</Typography>
                        <TextField fullWidth multiline rows={3} label="Note" defaultValue={profile.note} variant="outlined" size="small"/>
                        <Button startIcon={<Add />} sx={{mt: 2, textTransform: 'none'}}>Add Custom Field</Button>
                    </Grid>
                </React.Fragment>
            ) : (
                // VIEW MODE
                <React.Fragment>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6">Contact Details</Typography>
                        <DetailItem label="Customer Type" value={profile.customerType} />
                        <DetailItem label="GST Registered" value={profile.gstRegistered} />
                        <DetailItem label="GST Number" value={profile.gstNumber} />
                        <DetailItem label="Type of Business" value={profile.businessType} />
                        <DetailItem label="Company Name" value={profile.companyName} />
                        <DetailItem label="Display Name" value={profile.displayName} />
                        <DetailItem label="PAN" value={profile.pan} />
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mt:2}}>Primary Contact</Typography>
                        <DetailItem label="Name" value={profile.primaryName} />
                        <DetailItem label="Contact No." value={profile.primaryContact} />
                        <DetailItem label="E-mail" value={profile.primaryEmail} />
                        <DetailItem label="Website" value={profile.primaryWebsite} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6">Address</Typography>
                        <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1, fontSize: '0.9rem'}}>Billing Address</Typography>
                        <Typography variant="body1">{profile.billingAddress1}</Typography>
                        <Typography variant="body1">{profile.billingAddress2}</Typography>
                        <Typography variant="body1">{`${profile.billingCity}, ${profile.billingState} ${profile.billingZip}`}</Typography>
                        <Typography variant="body1" sx={{mb: 2}}>{profile.billingCountry}</Typography>

                        <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1, fontSize: '0.9rem', mt:2}}>Delivery Address</Typography>
                        <Typography variant="body1">{profile.deliveryAddress1}</Typography>
                        <Typography variant="body1">{profile.deliveryAddress2}</Typography>
                        <Typography variant="body1">{`${profile.deliveryCity}, ${profile.deliveryState} ${profile.deliveryZip}`}</Typography>
                        <Typography variant="body1">{profile.deliveryCountry}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6">Financial Details</Typography>
                        <DetailItem label="Opening Balance" value={profile.openingBalance} />
                        <DetailItem label="Payment Terms" value={profile.paymentTerms} />
                        <DetailItem label="Credit Limit" value={profile.creditLimit} />
                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mt:2}}>Bank Account</Typography>
                        <DetailItem label="Bank Account Name" value={profile.bankName} />
                        <DetailItem label="Account No" value={profile.accountNo} />
                        <DetailItem label="IFSC Code" value={profile.ifsc} />
                        <DetailItem label="SWIFT Code" value={profile.swift} />
                        <DetailItem label="Currency" value={profile.currency} />

                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mt:2}}>Tax Details</Typography>
                        <SwitchDetailItem label="TCS on sale" checked={profile.tcsOnSale} />
                        <SwitchDetailItem label="TDS on sale" checked={profile.tdsOnSale} />
                        <SwitchDetailItem label="GST TDS" checked={profile.gstTds} />
                        <SwitchDetailItem label="GST TCS" checked={profile.gstTcs} />

                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mt:2}}>Bills & Payments</Typography>
                        <SwitchDetailItem label="Enable Bills & Payments" checked={profile.enableBills} />

                        <Typography variant="h6" sx={{borderTop: '1px solid #eee', pt: 2, mt:2}}>Others</Typography>
                        <DetailItem label="Note" value={profile.note} />
                    </Grid>
                </React.Fragment>
            )}
            </Grid>
        </Paper>
    )
};
const FullAccountStatementRow = ({ row }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell><IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>{open ? <Remove /> : <Add />}</IconButton></TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.voucher}</TableCell>
                <TableCell>{row.srNo}</TableCell>
                <TableCell>{row.credit}</TableCell>
                <TableCell>{row.debit}</TableCell>
                <TableCell>{row.balance}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 2, backgroundColor: '#fafafa', borderRadius: '4px' }}>
                            <Typography variant="h6" gutterBottom component="div">Details</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><Typography><strong>Credit:</strong> {row.details.credit}</Typography></Grid>
                                <Grid item xs={6}><Typography><strong>Debit:</strong> {row.details.debit}</Typography></Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};
const FullAccountStatementView = () => {
    // const [viewType, setViewType] = React.useState('default');
    // const toggleView = () => { setViewType(prev => prev === 'default' ? 'detailed' : 'default'); };
    return (
         <Paper sx={{ width: '100%', p: {xs: 2, md: 3}, borderRadius: '12px' }} elevation={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                 <Typography variant="h5">John Doe</Typography>
                <Button variant="outlined" color="secondary" startIcon={<Settings />} /*onClick={toggleView}*/ sx={{backgroundColor: 'white'}}>Settings (Two views)</Button>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                <Table aria-label="account statement table">
                    <TableHead sx={{ backgroundColor: '#fafafa' }}><TableRow><TableCell /><TableCell>Date</TableCell><TableCell>Voucher</TableCell><TableCell>Sr No</TableCell><TableCell>Credit</TableCell><TableCell>Debit</TableCell><TableCell>Balance</TableCell></TableRow></TableHead>
                    <TableBody>{accountStatementData.map((row) => (<AccountStatementRow key={row.id} row={row} />))}</TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};
const FullItemWiseReportView = () => {
    return (
        <Paper sx={{ width: '100%', p: {xs: 2, md: 3}, borderRadius: '12px' }} elevation={0}>
            <TableContainer component={Paper} elevation={0} sx={{border: '1px solid #e0e0e0', borderRadius: '8px'}}>
                <Table aria-label="item wise report table">
                    <TableHead sx={{ backgroundColor: '#fafafa' }}>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Item Code</TableCell>
                            <TableCell>Sales Quantity</TableCell>
                            <TableCell>Sales Amount</TableCell>
                            <TableCell>Purchase Quantity</TableCell>
                            <TableCell>Purchase Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {itemWiseReportData.map((row) => (
                           <TableRow key={row.id} hover>
                               <TableCell>{row.name}</TableCell>
                               <TableCell>{row.code}</TableCell>
                               <TableCell>{row.salesQty}</TableCell>
                               <TableCell>{row.salesAmt}</TableCell>
                               <TableCell>{row.purchaseQty}</TableCell>
                               <TableCell>{row.purchaseAmt}</TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

// Re-assigning the full components to the placeholder variables
ProfileView = FullProfileView;
AccountStatementRow = FullAccountStatementRow;
AccountStatementView = FullAccountStatementView;
ItemWiseReportView = FullItemWiseReportView;
