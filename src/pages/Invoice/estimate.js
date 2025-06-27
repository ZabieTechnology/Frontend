import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Autocomplete, Box, Grid, Paper, Typography, TextField, Button,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, Select, MenuItem, Snackbar
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon,
    PersonAddAlt1 as PersonAddAlt1Icon
} from '@mui/icons-material';
import { format, addDays, isValid } from 'date-fns';
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

const CreateQuotePage = () => {
    const navigate = useNavigate();
    const [quoteData, setQuoteData] = useState({
        customer: null,
        customerState: '',
        issueDate: new Date(),
        expiryDate: addDays(new Date(), 30),
        lineItems: [minimalInitialLineItem],
        notes: '',
        terms: '',
        discountType: 'Percentage',
        discountValue: 0,
        status: 'Draft',
    });
    const [supplierState, setSupplierState] = useState('');
    const [quoteNumber, setQuoteNumber] = useState('');
    const [customerOptions, setCustomerOptions] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState('$');

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'info' });

    // Modal States
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({ displayName: '' });
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItemData, setNewItemData] = useState({ itemName: '', salePrice: 0 });
    const [currentItemIndex, setCurrentItemIndex] = useState(null);

    // --- Data Fetching ---
    const fetchCustomers = useCallback(async () => {
        const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
        setCustomerOptions(response.data?.data || []);
    }, []);

    const fetchItems = useCallback(async () => {
        const response = await axios.get(`${API_BASE_URL}/api/inventory?limit=-1`, { withCredentials: true });
        setInventoryItems(response.data?.data || []);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [settingsRes, companyInfoRes, taxesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/quote-settings/`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/api/company-information`, { withCredentials: true }),
                    axios.get(`${API_BASE_URL}/api/gst-rates`, { withCredentials: true })
                ]);

                await fetchCustomers();
                await fetchItems();

                setSupplierState(companyInfoRes.data?.state || '');
                setCurrencySymbol(companyInfoRes.data?.currency === 'INR' ? '₹' : '$');

                const settings = settingsRes.data;
                const expiry = addDays(new Date(), settings.validityDays || 30);
                setQuoteNumber(`${settings.prefix || 'QUO-'}${settings.nextNumber || '1'}`);
                setQuoteData(prev => ({ ...prev, expiryDate: expiry, notes: settings.defaultNotes || '', terms: settings.defaultTerms || '' }));

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
    }, [fetchCustomers, fetchItems]);

    const calculatedData = useMemo(() => {
        let subTotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;

        const updatedLineItems = quoteData.lineItems.map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const taxableValue = qty * rate;
            const taxRate = parseFloat(item.taxRate) || 0;

            let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
            const supState = supplierState?.trim().toLowerCase();
            const custState = quoteData.customerState?.trim().toLowerCase();

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
        const discountAmount = quoteData.discountType === 'Percentage'
            ? (subTotal * (parseFloat(quoteData.discountValue) || 0)) / 100
            : parseFloat(quoteData.discountValue) || 0;

        const grandTotal = subTotal + totalTax - discountAmount;

        return { ...quoteData, lineItems: updatedLineItems, subTotal, taxTotal: totalTax, totalCgst, totalSgst, totalIgst, discountAmount, grandTotal };
    }, [quoteData, supplierState]);

    // --- Handlers ---
    const handleCustomerChange = (event, newValue) => setQuoteData(prev => ({...prev, customer: newValue, customerState: newValue?.billingAddress?.state || ''}));
    const handleDateChange = (name, dateString) => { if (isValid(new Date(dateString))) setQuoteData(prev => ({...prev, [name]: new Date(dateString)})); };
    const handleLineItemChange = (index, event) => {
        const { name, value } = event.target;
        const updatedItems = [...quoteData.lineItems];
        updatedItems[index][name] = value;
        if (name === "taxId") {
             const selectedTax = taxOptions.find(t => t.id === value);
             updatedItems[index].taxRate = selectedTax ? selectedTax.rate : 0;
        }
        setQuoteData(prev => ({ ...prev, lineItems: updatedItems }));
    };

    const handleItemSelect = (index, selectedItem) => {
        if (!selectedItem) return;
        const updatedItems = [...quoteData.lineItems];
        const matchingTax = taxOptions.find(tax => tax.rate === selectedItem.gstRate);
        updatedItems[index] = { ...updatedItems[index], itemId: selectedItem._id, description: selectedItem.itemName, hsnSac: selectedItem.hsnCode || '', rate: selectedItem.salePrice || 0, taxId: matchingTax ? matchingTax.id : '', taxRate: selectedItem.gstRate || 0 };
        setQuoteData(prev => ({...prev, lineItems: updatedItems}));
    };

    const addLineItem = () => setQuoteData(prev => ({...prev, lineItems: [...prev.lineItems, { ...minimalInitialLineItem, id: Date.now() }]}));
    const removeLineItem = (id) => { if (quoteData.lineItems.length > 1) setQuoteData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) })); };

    const handleSave = async ({ status }) => {
        setIsSaving(true);
        setError(null);
        setFeedback({open: false, message: ''});
        const payload = { ...calculatedData, customer: { _id: calculatedData.customer?._id, name: calculatedData.customer?.displayName, state: calculatedData.customerState }, issueDate: format(new Date(calculatedData.issueDate), 'yyyy-MM-dd'), expiryDate: format(new Date(calculatedData.expiryDate), 'yyyy-MM-dd'), status: status };
        payload.lineItems.forEach(item => delete item.id);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/quotes`, payload, { withCredentials: true });
            const newQuoteNumber = response.data?.data?.quoteNumber;
            // Set the success message and navigate back to the quote list page
            navigate('/sales/estimate', { state: { successMessage: `Successfully created quote ${newQuoteNumber || ''}!` } });
        } catch (err) {
            setFeedback({ open: true, message: err.response?.data?.message || 'Failed to save quote.', severity: 'error' });
            setIsSaving(false);
        }
    };

    // --- Modal Handlers ---
    const handleSaveNewCustomer = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/customers`, { displayName: newCustomerData.displayName }, { withCredentials: true });
            await fetchCustomers();
            handleCustomerChange(null, response.data.data);
            setIsAddCustomerModalOpen(false);
            setNewCustomerData({ displayName: '' });
        } catch (err) { console.error("Failed to save new customer", err); }
    };

    const handleSaveNewItem = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/inventory`, { ...newItemData, itemType: 'product' }, { withCredentials: true });
            await fetchItems();
            if (currentItemIndex !== null) {
                handleItemSelect(currentItemIndex, response.data.data);
            }
            setIsAddItemModalOpen(false);
            setNewItemData({ itemName: '', salePrice: 0 });
        } catch (err) { console.error("Failed to save new item", err); }
    };


    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;

    return (
        <ThemeProvider theme={lightTheme}>
            <Box sx={{ bgcolor: 'background.default', p: {xs: 1, md: 3} }}>
                <Paper sx={{ p: {xs: 2, md: 3} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">New Estimate</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="outlined" component={RouterLink} to="/sales/estimate" startIcon={<ArrowBackIcon />}>Back to List</Button>
                            <Button variant="contained" onClick={() => handleSave({status: 'Draft'})} disabled={isSaving} startIcon={<SaveIcon />}>{isSaving ? 'Saving...' : 'Save as Draft'}</Button>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 3 }} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                             <Autocomplete fullWidth options={customerOptions} getOptionLabel={(option) => option.displayName || option.name || ''} value={quoteData.customer} onChange={handleCustomerChange} renderInput={(params) => <TextField {...params} label="Select Customer" required />} />
                             <Tooltip title="Add New Customer"><IconButton onClick={() => setIsAddCustomerModalOpen(true)}><PersonAddAlt1Icon color="primary"/></IconButton></Tooltip>
                        </Grid>
                        <Grid item xs={12} md={2} />
                        <Grid item xs={12} md={5}><Grid container spacing={2}>
                            <Grid item xs={12}><TextField label="Quote #" value={quoteNumber} fullWidth disabled /></Grid>
                            <Grid item xs={6}><TextField label="Issue Date" type="date" value={format(new Date(quoteData.issueDate), 'yyyy-MM-dd')} onChange={(e) => handleDateChange('issueDate', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={6}><TextField label="Expiry Date" type="date" value={format(new Date(quoteData.expiryDate), 'yyyy-MM-dd')} onChange={(e) => handleDateChange('expiryDate', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                        </Grid></Grid>
                    </Grid>
                    <TableContainer sx={{ mt: 4 }}><Table size="small">
                        <TableHead sx={{ backgroundColor: '#fafafa' }}><TableRow>
                            <TableCell sx={{ minWidth: 250 }}>Item</TableCell><TableCell>HSN/SAC</TableCell><TableCell align="right">Qty</TableCell><TableCell align="right">Rate</TableCell><TableCell>Tax</TableCell><TableCell align="right">CGST</TableCell><TableCell align="right">SGST</TableCell><TableCell align="right">IGST</TableCell><TableCell align="right">Amount</TableCell><TableCell />
                        </TableRow></TableHead>
                        <TableBody>{quoteData.lineItems.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Autocomplete fullWidth freeSolo options={inventoryItems} getOptionLabel={(option) => typeof option === 'string' ? option : option.itemName} value={inventoryItems.find(inv => inv._id === item.itemId) || item.description} onChange={(e, val) => handleItemSelect(index, val)} onInputChange={(e, val) => handleLineItemChange(index, {target: {name: 'description', value: val}})} renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select or Type Item" />} />
                                    <Tooltip title="Add New Item"><IconButton onClick={() => { setCurrentItemIndex(index); setIsAddItemModalOpen(true); }} size="small"><AddIcon color="primary"/></IconButton></Tooltip>
                                </TableCell>
                                <TableCell><TextField name="hsnSac" value={item.hsnSac} onChange={(e) => handleLineItemChange(index, e)} variant="standard" /></TableCell>
                                <TableCell><TextField name="quantity" value={item.quantity} onChange={(e) => handleLineItemChange(index, e)} type="number" variant="standard" sx={{width: 80}} align="right"/></TableCell>
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
                        <Grid item xs={12} md={6}><TextField label="Notes" name="notes" value={quoteData.notes} onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})} fullWidth multiline rows={4} /><TextField label="Terms & Conditions" name="terms" value={quoteData.terms} onChange={(e) => setQuoteData({...quoteData, terms: e.target.value})} fullWidth multiline rows={4} sx={{ mt: 2 }} /></Grid>
                        <Grid item xs={12} md={6} container justifyContent="flex-end" sx={{ pt: {xs: 2, md: 0} }}><Box sx={{ width: '100%', maxWidth: 350 }}><Grid container spacing={1}>
                            <Grid item xs={6}><Typography align="right">Subtotal:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.subTotal, currencySymbol)}</Typography></Grid>
                            <Grid item xs={6}><Typography align="right">CGST:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.totalCgst, currencySymbol)}</Typography></Grid>
                            <Grid item xs={6}><Typography align="right">SGST:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.totalSgst, currencySymbol)}</Typography></Grid>
                            <Grid item xs={6}><Typography align="right">IGST:</Typography></Grid><Grid item xs={6}><Typography align="right">{formatCurrency(calculatedData.totalIgst, currencySymbol)}</Typography></Grid>
                            <Grid item xs={3}><Typography align="right">Discount:</Typography></Grid>
                            <Grid item xs={5}><TextField name="discountValue" value={quoteData.discountValue} onChange={(e) => setQuoteData({...quoteData, discountValue: e.target.value})} type="number" size="small" variant="outlined" InputProps={{startAdornment: <InputAdornment position="start">{quoteData.discountType === 'Percentage' ? '%' : currencySymbol}</InputAdornment>}}/></Grid>
                            <Grid item xs={4}><Select name="discountType" value={quoteData.discountType} onChange={(e) => setQuoteData({...quoteData, discountType: e.target.value})} size="small" variant="outlined"><MenuItem value="Percentage">%</MenuItem><MenuItem value="Fixed">Fixed</MenuItem></Select></Grid>
                            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                            <Grid item xs={6}><Typography variant="h6" align="right">Total:</Typography></Grid><Grid item xs={6}><Typography variant="h6" align="right">{formatCurrency(calculatedData.grandTotal, currencySymbol)}</Typography></Grid>
                        </Grid></Box></Grid>
                    </Grid>
                </Paper>
                <Snackbar open={feedback.open} autoHideDuration={6000} onClose={() => setFeedback({open: false})}>
                    <Alert onClose={() => setFeedback({open: false})} severity={feedback.severity} sx={{ width: '100%' }}>
                        {feedback.message}
                    </Alert>
                </Snackbar>
                <Dialog open={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)}><DialogTitle>Add New Customer</DialogTitle><DialogContent><DialogContentText>Quickly add a new customer.</DialogContentText><TextField autoFocus margin="dense" name="displayName" label="Customer Name" type="text" fullWidth variant="standard" value={newCustomerData.displayName} onChange={(e) => setNewCustomerData({displayName: e.target.value})}/></DialogContent><DialogActions><Button onClick={() => setIsAddCustomerModalOpen(false)}>Cancel</Button><Button onClick={handleSaveNewCustomer}>Save</Button></DialogActions></Dialog>
                <Dialog open={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)}><DialogTitle>Add New Item</DialogTitle><DialogContent><DialogContentText>Quickly add an item to your inventory.</DialogContentText><TextField autoFocus margin="dense" name="itemName" label="Item Name" type="text" fullWidth variant="standard" value={newItemData.itemName} onChange={(e) => setNewItemData({...newItemData, itemName: e.target.value})}/><TextField margin="dense" name="salePrice" label="Sale Price" type="number" fullWidth variant="standard" value={newItemData.salePrice} onChange={(e) => setNewItemData({...newItemData, salePrice: e.target.value})}/></DialogContent><DialogActions><Button onClick={() => setIsAddItemModalOpen(false)}>Cancel</Button><Button onClick={handleSaveNewItem}>Save</Button></DialogActions></Dialog>
            </Box>
        </ThemeProvider>
    );
};

export default CreateQuotePage;
