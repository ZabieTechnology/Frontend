import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Autocomplete, Box, Grid, Paper, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Checkbox, CircularProgress, Alert, InputAdornment, Snackbar, Divider,
    FormControl, InputLabel, Select, MenuItem, Container
} from '@mui/material';
import {
    Save as SaveIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Using a theme consistent with your reference file
const modernTheme = createTheme({
  palette: {
    primary: { main: '#007aff' },
    secondary: { main: '#6c757d' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#1c1c1e', secondary: '#6c757d' },
    error: { main: '#d32f2f' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiPaper: { styleOverrides: { root: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' } } }
  },
});

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to reliably get the due amount from an invoice object
const getInvoiceDueAmount = (invoice) => {
    if (!invoice) return 0;

    // Always calculate the due amount from grandTotal and amountPaid for consistency.
    const grandTotal = parseFloat(invoice.grandTotal || 0);
    const amountPaid = parseFloat(invoice.amountPaid || 0);
    const due = grandTotal - amountPaid;

    return isNaN(due) ? 0 : due;
};


const RecordPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoices, setSelectedInvoices] = useState([]);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reference, setReference] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [currencySymbol, setCurrencySymbol] = useState('₹');

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });

    // Fetch initial data like customers and set pre-selected data from location state
    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
                const customerData = response.data?.data || [];
                setCustomers(customerData);

                // Pre-select customer if customerId is passed in state
                if (location.state?.customerId) {
                    const preselected = customerData.find(c => c._id === location.state.customerId);
                    if (preselected) setSelectedCustomer(preselected);
                }

                // Pre-fill reference if it's passed in state
                if (location.state?.reference) {
                    setReference(location.state.reference);
                }

            } catch (err) {
                setError("Failed to load customers.");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [location.state]);

    // Fetch invoices when a customer is selected
    useEffect(() => {
        if (selectedCustomer) {
            const fetchInvoices = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/sales-invoices?customerId=${selectedCustomer._id}&status=Approved,Partially Paid`, { withCredentials: true });
                    const outstandingInvoices = response.data.data || [];
                    setInvoices(outstandingInvoices);

                    // Pre-select invoices if selectedIds are passed in state
                    if (location.state?.selectedIds) {
                        setSelectedInvoices(location.state.selectedIds);
                        // Calculate total amount for pre-selected invoices
                        const preSelectedTotal = outstandingInvoices
                            .filter(inv => location.state.selectedIds.includes(inv._id))
                            .reduce((acc, inv) => acc + getInvoiceDueAmount(inv), 0);
                        setPaymentAmount(preSelectedTotal.toFixed(2));
                    }
                } catch (err) {
                    setError("Failed to load invoices for this customer.");
                } finally {
                    setLoading(false);
                }
            };
            fetchInvoices();
        } else {
            setInvoices([]);
        }
    }, [selectedCustomer, location.state]); // Rerun when customer or location state changes

    const handleSelectInvoice = (invoiceId) => {
        const newSelection = selectedInvoices.includes(invoiceId)
            ? selectedInvoices.filter(id => id !== invoiceId)
            : [...selectedInvoices, invoiceId];
        setSelectedInvoices(newSelection);

        // Recalculate payment amount based on new selection
        const newTotal = invoices
            .filter(inv => newSelection.includes(inv._id))
            .reduce((acc, inv) => acc + getInvoiceDueAmount(inv), 0);
        setPaymentAmount(newTotal.toFixed(2));
    };

    const handleSavePayment = async () => {
        const totalDueForSelected = invoices
            .filter(inv => selectedInvoices.includes(inv._id))
            .reduce((acc, inv) => acc + getInvoiceDueAmount(inv), 0);

        if (parseFloat(paymentAmount) > totalDueForSelected + 0.01) {
            setFeedback({ open: true, message: `Payment amount cannot exceed the total amount due (${formatCurrency(totalDueForSelected, currencySymbol)}).`, severity: 'warning' });
            return;
        }

        if (parseFloat(paymentAmount) <= 0 || selectedInvoices.length === 0) {
            setFeedback({ open: true, message: "Please enter a valid amount and select at least one invoice.", severity: 'warning' });
            return;
        }
        setIsSaving(true);
        const payload = {
            customerId: selectedCustomer._id,
            customerName: selectedCustomer.displayName,
            paymentDate,
            amount: parseFloat(paymentAmount),
            reference,
            invoices: selectedInvoices,
            paymentMethod,
        };
        try {
            const response = await axios.post(`${API_BASE_URL}/api/payments`, payload, { withCredentials: true });
            const paymentId = response.data?.data?.paymentId;
            // Redirect back to the specific invoice page after successful payment
            const originInvoiceId = location.state?.selectedIds?.[0];
            const destination = originInvoiceId ? `/sales/invoice/${originInvoiceId}` : '/sales';
            navigate(destination, { state: { successMessage: `Payment ${paymentId ? `#${paymentId.slice(-6)}` : ''} recorded successfully!` } });
        } catch (err) {
            setFeedback({ open: true, message: err.response?.data?.message || "Failed to record payment.", severity: 'error' });
            setIsSaving(false);
        }
    };

    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ bgcolor: 'background.default', p: {xs: 1, md: 3} }}>
                 <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                      <Typography variant="h4" component="h1" color="text.primary">Receipt Voucher</Typography>
                      <Button component={RouterLink} to="/sales" startIcon={<ArrowBackIcon size={16} />}>Back to Invoices</Button>
                    </Box>

                    <Paper sx={{ p: { xs: 2, md: 4 } }}>
                        <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 3 }}>
                          Record a New Receipt
                        </Typography>
                        <Box sx={{border: '1px solid #e0e0e0', borderRadius: 3, p: 3}}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                    <Autocomplete
                                        options={customers}
                                        getOptionLabel={(option) => option.displayName || ''}
                                        value={selectedCustomer}
                                        onChange={(e, newValue) => setSelectedCustomer(newValue)}
                                        renderInput={(params) => <TextField {...params} label="Received From *" required />}
                                        isOptionEqualToValue={(option, value) => option._id === value._id}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} lg={2}>
                                    <TextField fullWidth label="Receipt Date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} lg={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Receipt Method</InputLabel>
                                        <Select label="Receipt Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                            <MenuItem value="cash">Cash</MenuItem>
                                            <MenuItem value="credit_card">Credit Card</MenuItem>
                                            <MenuItem value="check">Check</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={6} lg={3}>
                                     <TextField fullWidth label="Reference / Description" value={reference} onChange={(e) => setReference(e.target.value)} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={6} lg={2}>
                                    <TextField fullWidth required label="Amount Received" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>Outstanding Invoices</Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{boxShadow: 'none', border: '1px solid #e0e0e0'}}>
                            <Table>
                                <TableHead sx={{backgroundColor: '#f4f6f8'}}>
                                    <TableRow>
                                        <TableCell padding="checkbox"></TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Invoice #</TableCell>
                                        <TableCell align="right">Invoice Amount</TableCell>
                                        <TableCell align="right">Amount Due</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} align="center"><CircularProgress/></TableCell></TableRow>
                                    ) : invoices.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center">{selectedCustomer ? "No outstanding invoices for this customer." : "Please select a customer."}</TableCell></TableRow>
                                    ) : (
                                        invoices.map(invoice => {
                                            const isChecked = selectedInvoices.includes(invoice._id);
                                            const due = getInvoiceDueAmount(invoice);

                                            return (
                                                <TableRow key={invoice._id} hover selected={isChecked} onClick={() => handleSelectInvoice(invoice._id)} sx={{ cursor: 'pointer' }}>
                                                    <TableCell padding="checkbox"><Checkbox checked={isChecked}/></TableCell>
                                                    <TableCell>{isValid(new Date(invoice.invoiceDate)) ? format(new Date(invoice.invoiceDate), 'dd MMM yy') : 'Invalid Date'}</TableCell>
                                                    <TableCell>{invoice.invoiceNumber}</TableCell>
                                                    <TableCell align="right">{formatCurrency(invoice.grandTotal, currencySymbol)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(due, currencySymbol)}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 4}}>
                            <Button variant="contained" size="large" onClick={handleSavePayment} disabled={isSaving} startIcon={<SaveIcon/>}>
                                {isSaving ? "Saving..." : "Save Receipt"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
                <Snackbar open={feedback.open} autoHideDuration={6000} onClose={() => setFeedback({open: false})}>
                    <Alert onClose={() => setFeedback({open: false})} severity={feedback.severity} sx={{ width: '100%' }}>
                        {feedback.message}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default RecordPaymentPage;
