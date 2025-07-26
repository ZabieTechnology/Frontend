import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Autocomplete, Box, Grid, Paper, Typography, TextField, Button,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, Snackbar
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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

const minimalInitialLineItem = {
    id: Date.now(), // Temporary unique ID for React key prop
    itemId: '',
    description: '',
    hsnSac: '',
    quantity: 1,
    rate: 0,
    taxId: '',
    taxRate: 0,
};

const formatCurrency = (amount, currencySymbol = '$') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const creditReasons = [
    'Incorrect Invoicing',
    'Returned or Damaged Goods',
    'Services Not Rendered or Unsatisfactory',
    'Post-Sale Discount or Price Adjustment',
    'Cancellation of an Order',
    'Other'
];

const Creditnotecreate = () => {
    const navigate = useNavigate();
    const [creditNoteData, setCreditNoteData] = useState({
        customer: null,
        customerState: '',
        issueDate: new Date(),
        referenceInvoice: null,
        reason: '',
        lineItems: [minimalInitialLineItem],
        notes: '',
        terms: '',
        status: 'Draft',
    });
    const [supplierState, setSupplierState] = useState('');
    const [creditNoteNumber] = useState('');
    const [customerOptions, setCustomerOptions] = useState([]);
    const [invoiceOptions, setInvoiceOptions] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('$');

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });

    // ** NEW **: Determine if the credit is for returned items
    const isItemCredit = creditNoteData.reason === 'Returned or Damaged Goods';

    // --- Data Fetching ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Assuming an endpoint for credit note settings exists
                const [customersRes, itemsRes, taxesRes, companyInfoRes, invoicesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/api/inventory?limit=-1`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/api/gst-rates`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/api/company-information`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/api/sales-invoices`, { withCredentials: true }) // Fetch invoices to reference
                ]);

                setSupplierState(companyInfoRes.data?.state || '');
                setCurrencySymbol(companyInfoRes.data?.currency === 'INR' ? '₹' : '$');
                setCustomerOptions(customersRes.data?.data || []);
                setInventoryItems(itemsRes.data?.data || []);
                setInvoiceOptions(invoicesRes.data?.data || []);

                const fetchedTaxes = taxesRes.data?.data?.map(tax => ({ id: tax._id, name: tax.taxName, rate: tax.taxRate })) || [];
                setTaxOptions(fetchedTaxes);

            } catch (err) {
                console.error("Failed to fetch initial data:", err);
                setError(err.response?.data?.message || "Could not load required data.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const calculatedData = useMemo(() => {
        let subTotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;

        const updatedLineItems = creditNoteData.lineItems.map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const taxableValue = qty * rate;
            const taxRate = parseFloat(item.taxRate) || 0;

            let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
            const supState = supplierState?.trim().toLowerCase();
            const custState = creditNoteData.customerState?.trim().toLowerCase();

            if (supState && custState && supState === custState) {
                cgstAmount = (taxableValue * taxRate) / 200;
                sgstAmount = (taxableValue * taxRate) / 200;
            } else {
                igstAmount = (taxableValue * taxRate) / 100;
            }

            const itemTaxAmount = cgstAmount + sgstAmount + igstAmount;
            const itemTotal = taxableValue + itemTaxAmount;

            subTotal += taxableValue;
            totalCgst += cgstAmount;
            totalSgst += sgstAmount;
            totalIgst += igstAmount;

            return { ...item, amount: itemTotal, cgst: cgstAmount, sgst: sgstAmount, igst: igstAmount };
        });

        const totalTax = totalCgst + totalSgst + totalIgst;
        const grandTotal = subTotal + totalTax;

        return { ...creditNoteData, lineItems: updatedLineItems, subTotal, taxTotal: totalTax, totalCgst, totalSgst, totalIgst, grandTotal };
    }, [creditNoteData, supplierState]);

    // --- Handlers ---
    const handleReasonChange = (event) => {
        const newReason = event.target.value;
        setCreditNoteData(prev => ({
            ...prev,
            reason: newReason,
            lineItems: [{...minimalInitialLineItem, id: Date.now()}] // Reset items on reason change
        }));
    };

    const handleCustomerChange = (event, newValue) => {
        setCreditNoteData(prev => ({...prev, customer: newValue, customerState: newValue?.billingAddress?.state || ''}));
    };

    const handleDateChange = (name, dateString) => { if (isValid(new Date(dateString))) setCreditNoteData(prev => ({...prev, [name]: new Date(dateString)})); };

    const handleLineItemChange = (index, event) => {
        const { name, value } = event.target;
        const updatedItems = [...creditNoteData.lineItems];
        updatedItems[index][name] = value;
        if (name === "taxId") {
             const selectedTax = taxOptions.find(t => t.id === value);
             updatedItems[index].taxRate = selectedTax ? selectedTax.rate : 0;
        }
        setCreditNoteData(prev => ({ ...prev, lineItems: updatedItems }));
    };

    const handleItemSelect = (index, selectedItem) => {
        if (!selectedItem) return;
        const updatedItems = [...creditNoteData.lineItems];
        const matchingTax = taxOptions.find(tax => tax.rate === selectedItem.gstRate);
        updatedItems[index] = { ...updatedItems[index], itemId: selectedItem._id, description: selectedItem.itemName, hsnSac: selectedItem.hsnCode || '', rate: selectedItem.salePrice || 0, taxId: matchingTax ? matchingTax.id : '', taxRate: selectedItem.gstRate || 0 };
        setCreditNoteData(prev => ({...prev, lineItems: updatedItems}));
    };

    const addLineItem = () => setCreditNoteData(prev => ({...prev, lineItems: [...prev.lineItems, { ...minimalInitialLineItem, id: Date.now() }]}));
    const removeLineItem = (id) => { if (creditNoteData.lineItems.length > 1) setCreditNoteData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) })); };

    const handleSave = async ({ status }) => {
        setIsSaving(true);
        setError(null);
        setFeedback({open: false, message: ''});

        const payload = {
            ...calculatedData,
            customer: { _id: calculatedData.customer?._id, name: calculatedData.customer?.displayName },
            referenceInvoiceId: calculatedData.referenceInvoice?._id,
            issueDate: format(new Date(calculatedData.issueDate), 'yyyy-MM-dd'),
            status: status
        };
        payload.lineItems.forEach(item => delete item.id);
        delete payload.referenceInvoice;

        try {
            const response = await axios.post(`${API_BASE_URL}/api/credit-notes`, payload, { withCredentials: true });
            const newNoteNumber = response.data?.data?.creditNoteNumber;
            navigate('/CreditNote', { state: { successMessage: `Successfully created Credit Note ${newNoteNumber || ''}!` } });
        } catch (err) {
            setFeedback({ open: true, message: err.response?.data?.message || 'Failed to save credit note.', severity: 'error' });
            setIsSaving(false);
        }
    };


    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

    return (
        <ThemeProvider theme={lightTheme}>
            <Box sx={{ bgcolor: 'background.default', p: {xs: 1, md: 3} }}>
                <Paper sx={{ p: {xs: 2, md: 3} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">New Credit Note</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" component={RouterLink} to="/CreditNote" startIcon={<ArrowBackIcon />}>Back to List</Button>
                            <Button variant="contained" onClick={() => handleSave({status: 'Draft'})} disabled={isSaving} startIcon={<SaveIcon />}>{isSaving ? 'Saving...' : 'Save as Draft'}</Button>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                             <Autocomplete options={customerOptions} getOptionLabel={(option) => option.displayName || ''} value={creditNoteData.customer} onChange={handleCustomerChange} renderInput={(params) => <TextField {...params} label="Select Customer" required />} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                             <Autocomplete options={invoiceOptions} getOptionLabel={(option) => option.invoiceNumber || ''} value={creditNoteData.referenceInvoice} onChange={(e, val) => setCreditNoteData(prev => ({...prev, referenceInvoice: val}))} renderInput={(params) => <TextField {...params} label="Reference Invoice #" />} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Reason for Credit</InputLabel>
                                <Select name="reason" value={creditNoteData.reason} label="Reason for Credit" onChange={handleReasonChange}>
                                    {creditReasons.map(reason => <MenuItem key={reason} value={reason}>{reason}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8} />
                        <Grid item xs={12} md={4}><Grid container spacing={2}>
                            <Grid item xs={12}><TextField label="Credit Note #" value={creditNoteNumber} fullWidth disabled /></Grid>
                            <Grid item xs={12}><TextField label="Issue Date" type="date" value={format(new Date(creditNoteData.issueDate), 'yyyy-MM-dd')} onChange={(e) => handleDateChange('issueDate', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        </Grid></Grid>
                    </Grid>

                    <TableContainer sx={{ mt: 4 }}><Table size="small">
                        <TableHead sx={{ backgroundColor: '#fafafa' }}><TableRow>
                            <TableCell sx={{ minWidth: 250 }}>{isItemCredit ? 'Item' : 'Description'}</TableCell>
                            {isItemCredit && <TableCell>HSN/SAC</TableCell>}
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell>Tax</TableCell>
                            <TableCell align="right">CGST</TableCell>
                            <TableCell align="right">SGST</TableCell>
                            <TableCell align="right">IGST</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell />
                        </TableRow></TableHead>
                        <TableBody>{creditNoteData.lineItems.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {isItemCredit ? (
                                        <Autocomplete fullWidth freeSolo options={inventoryItems} getOptionLabel={(option) => typeof option === 'string' ? option : option.itemName} value={inventoryItems.find(inv => inv._id === item.itemId) || item.description} onChange={(e, val) => handleItemSelect(index, val)} onInputChange={(e, val) => handleLineItemChange(index, {target: {name: 'description', value: val}})} renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select or Type Item" />} />
                                    ) : (
                                        <TextField fullWidth name="description" value={item.description} onChange={(e) => handleLineItemChange(index, e)} variant="standard" placeholder="e.g., Price adjustment for Invoice #123" />
                                    )}
                                </TableCell>
                                {isItemCredit && <TableCell><TextField name="hsnSac" value={item.hsnSac} onChange={(e) => handleLineItemChange(index, e)} variant="standard" /></TableCell>}
                                <TableCell><TextField name="quantity" value={item.quantity} onChange={(e) => handleLineItemChange(index, e)} type="number" variant="standard" sx={{width: 80}} align="right" disabled={!isItemCredit}/></TableCell>
                                <TableCell><TextField name="rate" value={item.rate} onChange={(e) => handleLineItemChange(index, e)} type="number" variant="standard" InputProps={{startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>}}/></TableCell>
                                <TableCell sx={{ minWidth: 150 }}><FormControl fullWidth variant="standard"><Select name="taxId" value={item.taxId} onChange={(e) => handleLineItemChange(index, e)}><MenuItem value=""><em>None</em></MenuItem>{taxOptions.map(tax => <MenuItem key={tax.id} value={tax.id}>{tax.name}</MenuItem>)}</Select></FormControl></TableCell>
                                <TableCell align="right">{formatCurrency(calculatedData.lineItems[index]?.cgst || 0, currencySymbol)}</TableCell>
                                <TableCell align="right">{formatCurrency(calculatedData.lineItems[index]?.sgst || 0, currencySymbol)}</TableCell>
                                <TableCell align="right">{formatCurrency(calculatedData.lineItems[index]?.igst || 0, currencySymbol)}</TableCell>
                                <TableCell align="right">{formatCurrency(calculatedData.lineItems[index]?.amount || 0, currencySymbol)}</TableCell>
                                <TableCell><IconButton onClick={() => removeLineItem(item.id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton></TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table></TableContainer>
                    <Button startIcon={<AddIcon />} onClick={addLineItem} sx={{ mt: 2 }}>Add another line</Button>
                    <Grid container sx={{ mt: 3 }}>
                        <Grid item xs={12} md={6}><TextField label="Notes" name="notes" value={creditNoteData.notes} onChange={(e) => setCreditNoteData({...creditNoteData, notes: e.target.value})} fullWidth multiline rows={4} /></Grid>
                        <Grid item xs={12} md={6} container justifyContent="flex-end" sx={{ pt: {xs: 2, md: 0} }}><Box sx={{ width: '100%', maxWidth: 350 }}><Grid container spacing={1}>
                            <Grid item xs={6}><Typography align="right">Subtotal:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.subTotal, currencySymbol)}</Typography></Grid>
                            <Grid item xs={6}><Typography align="right">CGST:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.totalCgst, currencySymbol)}</Typography></Grid>
                            <Grid item xs={6}><Typography align="right">SGST:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.totalSgst, currencySymbol)}</Typography></Grid>
                            <Grid item xs={6}><Typography align="right">IGST:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.totalIgst, currencySymbol)}</Typography></Grid>
                            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                            <Grid item xs={6}><Typography variant="h6" align="right">Total Credit:</Typography></Grid><Grid item xs={6}><Typography variant="h6" align="right">{formatCurrency(calculatedData.grandTotal, currencySymbol)}</Typography></Grid>
                        </Grid></Box></Grid>
                    </Grid>
                </Paper>
                <Snackbar open={feedback.open} autoHideDuration={6000} onClose={() => setFeedback({open: false})}><Alert onClose={() => setFeedback({open: false})} severity={feedback.severity} sx={{ width: '100%' }}>{feedback.message}</Alert></Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default Creditnotecreate;
