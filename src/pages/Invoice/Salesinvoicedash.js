import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  TableSortLabel,
  Checkbox,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {
  Download,
  Print,
  Share,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

// --- THEME AND STYLED COMPONENTS ---
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
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTableCell: {
        styleOverrides: {
            head: { color: '#6b778c', fontWeight: '600' },
            body: { color: '#172b4d' }
        }
    }
  }
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.grey[400],
  },
}));

const PrimaryActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  }
}));

// Define the base URL for the API.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";


// --- UTILITY FUNCTIONS ---
const getStatusChipProps = (status) => {
    switch (status?.toLowerCase()) {
        case 'paid': return { label: 'Paid', color: 'success', sx: { backgroundColor: '#e8f5e9', color: '#388e3c' } };
        case 'partially paid': return { label: 'Partially Paid', color: 'warning', sx: { backgroundColor: '#fff8e1', color: '#f57c00' } };
        case 'draft': return { label: 'Draft', color: 'default', sx: { backgroundColor: '#f5f5f5', color: '#616161' } };
        default: return { label: status || 'Unknown', color: 'info' };
    }
};

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

// --- ENHANCED TABLE HEAD COMPONENT ---
const salesInvoiceHeadCells = [
    { id: 'invoiceNumber', numeric: false, label: 'Invoice No.' },
    { id: 'customerName', numeric: false, label: 'Customer Name' },
    { id: 'invoiceDate', numeric: false, label: 'Date' },
    { id: 'dueDate', numeric: false, label: 'Due Date' },
    { id: 'grandTotal', numeric: true, label: 'Invoice Amount' },
    { id: 'status', numeric: false, label: 'Status' },
    { id: 'actions', numeric: false, label: 'Actions', sortable: false },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells } = props;
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: '#fafafa' }}>
        <TableCell padding="checkbox">
          <Checkbox color="primary" indeterminate={numSelected > 0 && numSelected < rowCount} checked={rowCount > 0 && numSelected === rowCount} onChange={onSelectAllClick} />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} sortDirection={orderBy === headCell.id ? order : false}>
             <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={createSortHandler(headCell.id)}>
                {headCell.label}
                {orderBy === headCell.id ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}


// --- INVOICE DASHBOARD PAGE ---
function SalesInvoiceDashboard() {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('customerName');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [invoiceRows, setInvoiceRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/sales-invoices/`);
            const processedData = response.data.data.map(invoice => ({
                ...invoice,
                invoiceDate: invoice.invoiceDate ? parseISO(invoice.invoiceDate) : null,
                dueDate: invoice.dueDate ? parseISO(invoice.dueDate) : null,
            }));
            setInvoiceRows(processedData);
        } catch (err) {
            console.error("API Error:", err);
            setError("Could not load invoices. Please check the API connection.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

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

    const filteredRows = useMemo(() => {
        if (!invoiceRows) return [];
        return invoiceRows.filter(row =>
            row.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (row.customer && row.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [invoiceRows, searchTerm]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: {xs: 1, md: 2} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6">Invoice List</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}/>
                            <Button component={RouterLink} to="/sales/new" variant="contained" startIcon={<AddIcon />}>New Invoice</Button>
                            <Button variant="contained" color="success" startIcon={<PaymentIcon />} disabled>Record Payment</Button>
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table>
                           <EnhancedTableHead
                                numSelected={selected.length}
                                onSelectAllClick={handleSelectAllClick}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                rowCount={filteredRows.length}
                                headCells={salesInvoiceHeadCells}
                            />
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} align="center"><CircularProgress/></TableCell></TableRow>
                                ) : error ? (
                                    <TableRow><TableCell colSpan={8} align="center"><Alert severity="error">{error}</Alert></TableCell></TableRow>
                                ) : stableSort(filteredRows, getComparator(order, orderBy))
                                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                 .map((row) => {
                                    const isItemSelected = isSelected(row._id);
                                    const statusProps = getStatusChipProps(row.status);
                                    return (
                                        <TableRow hover onClick={(event) => handleClick(event, row._id)} role="checkbox" tabIndex={-1} key={row._id} selected={isItemSelected}>
                                            <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected}/></TableCell>
                                            <TableCell>
                                                <RouterLink to={`/sales/invoice/${row._id}`} style={{ textDecoration: 'none', color: lightTheme.palette.primary.main, fontWeight: '500' }}>
                                                    {row.invoiceNumber}
                                                </RouterLink>
                                            </TableCell>
                                            <TableCell>{row.customer?.name || 'N/A'}</TableCell>
                                            <TableCell>{row.invoiceDate ? format(row.invoiceDate, 'dd MMM yyyy') : 'N/A'}</TableCell>
                                            <TableCell>{row.dueDate ? format(row.dueDate, 'dd MMM yyyy') : 'N/A'}</TableCell>
                                            <TableCell align="right">{`₹${(row.grandTotal || 0).toLocaleString()}`}</TableCell>
                                            <TableCell><Chip size="small" {...statusProps} /></TableCell>
                                            <TableCell><IconButton size="small"><EditIcon/></IconButton></TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!loading && filteredRows.length === 0 && (
                                    <TableRow><TableCell colSpan={8} align="center">No invoices found.</TableCell></TableRow>
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
    )
}


// --- INVOICE DETAIL PAGE ---
function InvoicePage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
        if (!invoiceId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`);
            const data = response.data.data;
            const processedData = {
                ...data,
                invoiceDate: data.invoiceDate ? parseISO(data.invoiceDate) : null,
                dueDate: data.dueDate ? parseISO(data.dueDate) : null,
            };
            setInvoice(processedData);
        } catch (err) {
            console.error("API Error:", err);
            setError("Invoice not found or failed to load.");
        } finally {
            setLoading(false);
        }
    };

    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error || !invoice) {
    return <Box sx={{ p: 4 }}><Alert severity="error">{error || 'Invoice could not be loaded.'} <Button onClick={() => navigate('/sales')}>Go Back</Button></Alert></Box>;
  }

  const statusProps = getStatusChipProps(invoice.status);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/sales')}><ArrowBackIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Sales Invoice #{invoice.invoiceNumber}</Typography>
          <Chip size="small" {...statusProps} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <ActionButton variant="outlined" startIcon={<Download />}>Download PDF</ActionButton>
          <ActionButton variant="outlined" startIcon={<Print />}>Print PDF</ActionButton>
          <ActionButton variant="outlined" startIcon={<Share />}>Share</ActionButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container justifyContent="space-between" spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom>{invoice.company?.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {invoice.company?.address}<br />Mobile: {invoice.company?.mobile}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                 <Typography variant="body1"><strong>Invoice No:</strong> {invoice.invoiceNumber}</Typography>
                 <Typography variant="body1"><strong>Invoice Date:</strong> {invoice.invoiceDate ? format(invoice.invoiceDate, 'dd/MM/yyyy') : 'N/A'}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>BILL TO</Typography>
              <Typography variant="body1">{invoice.customer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">Mobile: {invoice.customer?.mobile}</Typography>
            </Box>
            <TableContainer sx={{ mt: 3, border: '1px solid #eee', borderRadius: '8px' }}>
              <Table>
                <TableHead><TableRow><TableCell>S.NO.</TableCell><TableCell>ITEMS</TableCell><TableCell align="right">QTY.</TableCell><TableCell align="right">RATE</TableCell><TableCell align="right">AMOUNT</TableCell></TableRow></TableHead>
                <TableBody>
                  {invoice.items?.map((item, index) => (
                    <TableRow key={item.sno || index}><TableCell>{item.sno}</TableCell><TableCell>{item.name}</TableCell><TableCell align="right">{item.qty}</TableCell><TableCell align="right">₹{item.rate?.toLocaleString()}</TableCell><TableCell align="right">₹{item.amount?.toLocaleString()}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}><Grid item xs={12} md={6}><Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Subtotal</Typography><Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{invoice.grandTotal?.toLocaleString()}</Typography></Box><Divider /><Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, backgroundColor: '#f0f0f0', borderRadius: '4px', mt:1 }}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Amount</Typography><Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{invoice.grandTotal?.toLocaleString()}</Typography></Box><Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}><Typography variant="body1">Received Amount</Typography><Typography variant="body1">₹{invoice.status === 'Paid' ? invoice.grandTotal?.toLocaleString() : '0'}</Typography></Box><Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Balance</Typography><Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{invoice.status === 'Paid' ? '0' : invoice.grandTotal?.toLocaleString()}</Typography></Box></Grid></Grid>
            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>Total Amount (in words): {invoice.totalInWords}</Typography>
            <Divider sx={{ my: 3 }} />
            <Box><Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>TERMS AND CONDITIONS</Typography><Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{invoice.terms}</Typography></Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             <PrimaryActionButton fullWidth>Generate E-way Bill</PrimaryActionButton>
             <ActionButton fullWidth variant="outlined">Generate e-Invoice</ActionButton>
          </Box>
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Payment History</Typography>
            <List dense><ListItem disableGutters><ListItemText primary="Invoice Amount" /><Typography variant="body2">₹{invoice.grandTotal?.toLocaleString()}</Typography></ListItem><ListItem disableGutters><ListItemText primary="Initial Amount Received" /><Typography variant="body2">₹{invoice.status === 'Paid' ? invoice.grandTotal?.toLocaleString() : '0'}</Typography></ListItem><ListItem disableGutters><ListItemText primary="Total Amount Received" /><Typography variant="body2">₹{invoice.status === 'Paid' ? invoice.grandTotal?.toLocaleString() : '0'}</Typography></ListItem></List>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}><Typography variant="body1" sx={{ fontWeight: 'bold' }}>Balance Amount</Typography><Typography variant="body1" sx={{ fontWeight: 'bold', color: 'green' }}>₹{invoice.status === 'Paid' ? '0' : invoice.grandTotal?.toLocaleString()}</Typography></Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Routes>
        <Route path="/sales" element={<SalesInvoiceDashboard />} />
        <Route path="/sales/invoice/:invoiceId" element={<InvoicePage />} />
        <Route path="/" element={<SalesInvoiceDashboard />} />
      </Routes>
    </ThemeProvider>
  );
}
