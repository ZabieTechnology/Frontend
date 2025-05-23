// src/pages/Expenses/AddExpensePage.js (or your preferred path)
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    Tooltip,
    InputAdornment,
} from '@mui/material';
import {
    UploadFile as UploadFileIcon,
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Publish as PublishIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    InfoOutlined as InfoOutlinedIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format as formatDateFns, parse as parseDateFns, isValid as isValidDateFns, startOfDay } from 'date-fns';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const initialExpenseData = {
    _id: null,
    invoiceFile: null,
    invoicePreviewUrl: null,
    billNo: '',
    billDate: null,
    supplierGst: '',
    supplierId: '',
    dueDate: null,
    expenseHeadId: '',
    narration: '',
    currency: 'INR',
    totalAmount: '',
    tdsPercentage: '',
    gstRateId: '',
    gstVatAmount: '',
    netAmount: '',
    paymentMethodPublish: '',
    billSource: '',
    lineItems: [{ description: '', price: '', qty: '', hsnCode: '', subtotal: '' }],
    subTotalFromItems: '',
    discountAmount: '',
    taxFromItems: '',
    grandTotalFromItems: '',
    status: 'Draft',
};


const AddExpensePage = () => {
    const [formData, setFormData] = useState(initialExpenseData);
    const [loading, setLoading] = useState(false);
    const [extractionLoading, setExtractionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    // State for dropdown options
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [expenseHeadOptions, setExpenseHeadOptions] = useState([]);
    const [gstRateOptions, setGstRateOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [paymentMethodPublishOptions, setPaymentMethodPublishOptions] = useState([]);
    const [billSourceOptions, setBillSourceOptions] = useState([]);


    const { expenseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchDropdownData = useCallback(async (type, setter, labelField = 'label', valueField = 'value') => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=${type}`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setter(response.data.data.map(opt => ({ value: opt[valueField], label: opt[labelField] })));
            } else {
                setter([]);
            }
        } catch (err) {
            console.error(`Error fetching ${type} options:`, err);
            setError(prev => `${prev || ''} Failed to load ${type} options. `);
            setter([]);
        }
    }, [API_BASE_URL]);

    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/vendors?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setSupplierOptions(response.data.data.map(vendor => ({ value: vendor._id, label: vendor.displayName || vendor.vendorName })));
            }
        } catch (err) {
            console.error("Error fetching suppliers:", err);
        }
    }, [API_BASE_URL]);

    const fetchExpenseHeads = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts?limit=-1&accountType=Expense`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setExpenseHeadOptions(response.data.data.map(acc => ({ value: acc._id, label: `${acc.name} (${acc.code})` })));
            } else {
                 setExpenseHeadOptions([]);
            }
        } catch (err) {
            console.error("Error fetching expense heads:", err);
             setExpenseHeadOptions([]);
        }
    }, [API_BASE_URL]);

    const fetchGstRates = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gst-rates/derived-tax-accounts?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setGstRateOptions(response.data.data.map(rate => ({ value: rate._id, label: rate.name, rateValue: rate.taxRate })));
            }
        } catch (err) {
            console.error("Error fetching GST/VAT rates:", err);
        }
    }, [API_BASE_URL]);


    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const viewMode = queryParams.get('view') === 'true';
        setIsViewMode(viewMode);

        fetchSuppliers();
        fetchExpenseHeads();
        fetchGstRates();
        fetchDropdownData('currency', setCurrencyOptions);
        fetchDropdownData('Expense_Payment_Publish', setPaymentMethodPublishOptions);
        fetchDropdownData('Expense_Bill_Source', setBillSourceOptions);

        if (expenseId) {
            console.log("Fetching expense data for ID:", expenseId);
            // TODO: Implement actual fetchExpenseById(expenseId).then(data => setFormData(data));
        } else {
            setFormData(initialExpenseData);
            if (viewMode) setIsViewMode(false);
        }
    }, [expenseId, location.search, fetchSuppliers, fetchExpenseHeads, fetchGstRates, fetchDropdownData]);

    useEffect(() => {
        if (!expenseId) {
            let defaultPaymentMethodPublish = '';
            const awaitingPaymentOpt = paymentMethodPublishOptions.find(opt => opt.label === 'Awaiting Payment');
            if (awaitingPaymentOpt) {
                defaultPaymentMethodPublish = awaitingPaymentOpt.value;
            }

            let defaultBillSource = '';
            const directUploadOpt = billSourceOptions.find(opt => opt.label === 'Direct Upload');
            if (directUploadOpt) {
                defaultBillSource = directUploadOpt.value;
            }

            if (defaultPaymentMethodPublish || defaultBillSource) {
                 setFormData(prev => ({
                    ...prev,
                    paymentMethodPublish: defaultPaymentMethodPublish || prev.paymentMethodPublish,
                    billSource: defaultBillSource || prev.billSource,
                }));
            }
        }
    }, [paymentMethodPublishOptions, billSourceOptions, expenseId]);


    const handleChange = (event) => {
        if (isViewMode) return;
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value,
        }));
    };

    const handleDateChange = (name, date) => {
        if (isViewMode) return;
        setFormData(prev => ({ ...prev, [name]: date }));
    };

    const handleFileChange = async (event) => {
        if (isViewMode) return;
        const file = event.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                invoiceFile: file,
                invoicePreviewUrl: URL.createObjectURL(file),
            }));

            setExtractionLoading(true);
            setError(null);
            setSuccess(null);
            const fileUploadData = new FormData();
            fileUploadData.append('invoice', file);

            try {
                const response = await axios.post(`${API_BASE_URL}/api/document-ai/extract-invoice`, fileUploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                });

                if (response.data && response.data.extractedData) {
                    const extracted = response.data.extractedData;
                    const matchedSupplier = supplierOptions.find(s => s.label === extracted.supplier);
                    const matchedExpenseHead = expenseHeadOptions.find(eh => eh.label.startsWith(extracted.expenseHead || ""));

                    setFormData(prev => ({
                        ...prev,
                        billNo: extracted.billNo || prev.billNo,
                        billDate: extracted.billDate ? parseDateFns(extracted.billDate, 'yyyy-MM-dd', new Date()) : prev.billDate,
                        supplierId: matchedSupplier ? matchedSupplier.value : prev.supplierId,
                        supplierGst: extracted.supplierGst || prev.supplierGst,
                        dueDate: extracted.dueDate ? parseDateFns(extracted.dueDate, 'yyyy-MM-dd', new Date()) : prev.dueDate,
                        expenseHeadId: matchedExpenseHead ? matchedExpenseHead.value : prev.expenseHeadId,
                        totalAmount: extracted.totalAmount !== undefined && extracted.totalAmount !== null ? String(extracted.totalAmount) : prev.totalAmount,
                        gstVatAmount: extracted.gstVatAmount !== undefined && extracted.gstVatAmount !== null ? String(extracted.gstVatAmount) : prev.gstVatAmount,
                        lineItems: extracted.lineItems && extracted.lineItems.length > 0
                            ? extracted.lineItems.map(item => ({
                                description: item.description || '',
                                price: item.price !== undefined && item.price !== null ? String(item.price) : '',
                                qty: item.qty !== undefined && item.qty !== null ? String(item.qty) : '',
                                hsnCode: item.productCode || '',
                                subtotal: item.subtotal !== undefined && item.subtotal !== null ? String(item.subtotal) : '',
                            }))
                            : prev.lineItems,
                    }));
                    if (extracted.lineItems && extracted.lineItems.length > 0) {
                        calculateTotals(extracted.lineItems.map(item => ({...item})));
                    }
                    setSuccess("Invoice data extracted. Please review and complete.");
                    setTimeout(() => setSuccess(null), 5000);
                } else {
                    setError(response.data.message || "Failed to extract data from invoice.");
                     setTimeout(() => setError(null), 5000);
                }
            } catch (err) {
                console.error("Error during Azure AI invoice extraction:", err);
                setError(`Invoice extraction failed: ${err.response?.data?.message || err.message}`);
                 setTimeout(() => setError(null), 5000);
            } finally {
                setExtractionLoading(false);
            }
        }
    };

    const handleLineItemChange = (index, event) => {
        if (isViewMode) return;
        const { name, value } = event.target;
        const newLineItems = [...formData.lineItems];
        newLineItems[index][name] = value;

        if (name === 'price' || name === 'qty') {
            const price = parseFloat(newLineItems[index].price) || 0;
            const qty = parseFloat(newLineItems[index].qty) || 0;
            newLineItems[index].subtotal = (price * qty).toFixed(2);
        }
        setFormData(prev => ({ ...prev, lineItems: newLineItems }));
    };

    const addLineItem = () => {
        if (isViewMode) return;
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { description: '', price: '', qty: '', hsnCode: '', subtotal: '' }],
        }));
    };

    const removeLineItem = (index) => {
        if (isViewMode) return;
        if (formData.lineItems.length <= 1) {
            setError("At least one line item is required.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        const newLineItems = formData.lineItems.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, lineItems: newLineItems }));
    };

    const calculateTotals = useCallback((lineItems) => {
        const subTotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
        const discount = parseFloat(formData.discountAmount) || 0;
        const selectedGstRateObject = gstRateOptions.find(opt => opt.value === formData.gstRateId);
        const taxRatePercentage = selectedGstRateObject ? parseFloat(selectedGstRateObject.rateValue) : 0;
        const taxableAmount = subTotal - discount;
        const taxAmount = (taxableAmount * taxRatePercentage) / 100;
        const grandTotal = taxableAmount + taxAmount;

        setFormData(prev => ({
            ...prev,
            subTotalFromItems: subTotal.toFixed(2),
            taxFromItems: taxAmount.toFixed(2),
            grandTotalFromItems: grandTotal.toFixed(2),
            totalAmount: prev.totalAmount || grandTotal.toFixed(2),
            gstVatAmount: prev.gstVatAmount || taxAmount.toFixed(2),
            netAmount: grandTotal.toFixed(2),
        }));
    }, [formData.discountAmount, formData.gstRateId, gstRateOptions, formData.totalAmount, formData.gstVatAmount]);

    useEffect(() => {
        if (formData.lineItems.length > 0) {
            calculateTotals(formData.lineItems);
        }
    }, [formData.lineItems, formData.discountAmount, formData.gstRateId, calculateTotals]);


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isViewMode) return;
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.billDate || !formData.supplierId || !formData.expenseHeadId || !formData.totalAmount) {
            setError("Bill Date, Supplier, Expense Head, and Total Amount are required.");
            setLoading(false);
            setTimeout(() => setError(null), 3000);
            return;
        }

        const submissionPayload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'invoiceFile' || key === 'invoicePreviewUrl' || key === 'lineItems') return;
            if (value instanceof Date) {
                submissionPayload.append(key, formatDateFns(value, 'yyyy-MM-dd'));
            } else if (typeof value === 'boolean') {
                submissionPayload.append(key, value.toString());
            } else if (value !== null && value !== undefined) {
                submissionPayload.append(key, value);
            }
        });
        submissionPayload.append('lineItems', JSON.stringify(formData.lineItems));
        if (formData.invoiceFile instanceof File) {
            submissionPayload.append('invoice', formData.invoiceFile, formData.invoiceFile.name);
        }

        try {
            let response;
            response = await axios.post(`${API_BASE_URL}/api/expenses`, submissionPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setSuccess("Expense created successfully! (Review & Publish next)");
            if (response.data && response.data.data) {
                setFormData(initialExpenseData);
            }
            setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
            console.error("Error saving expense:", err);
            setError(`Failed to save expense: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const title = expenseId ? (isViewMode ? "View Expense" : "Edit Expense") : "Add New Expense / Bill";
    const paperStyle = { p: {xs: 1.5, md: 2.5}, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none', height: '100%'};
    const inputLabelProps = { shrink: true };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: {xs: 1, md: 2}, backgroundColor: '#f8f9fa' }}>
                <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{title}</Typography>
                    <Box>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }} disabled={isViewMode || loading || extractionLoading}>Note</Button>
                        <Button variant="outlined" size="small" sx={{ mr: 1 }} disabled={isViewMode || loading || extractionLoading}>History</Button>
                        <IconButton onClick={() => navigate('/expenses')} aria-label="back to expenses list" disabled={loading || extractionLoading}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Box>
                </Paper>

                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

                <Grid container spacing={2.5}>
                    {/* Left Column: Invoice Upload & Preview */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={paperStyle}>
                            <Typography variant="h6" gutterBottom>Upload Invoice</Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadFileIcon />}
                                fullWidth
                                disabled={isViewMode || loading || extractionLoading}
                            >
                                {formData.invoiceFile ? formData.invoiceFile.name : "Choose Invoice File"}
                                <input type="file" hidden onChange={handleFileChange} accept="image/*,.pdf" />
                            </Button>
                            {extractionLoading && <CircularProgress size={24} sx={{display: 'block', margin: '10px auto'}} />}
                            {formData.invoicePreviewUrl && (
                                <Box mt={2} sx={{ border: '1px dashed grey', p: 1, height: 300, overflow: 'auto' }}>
                                    {formData.invoiceFile?.type.startsWith('image/') ? (
                                        <img src={formData.invoicePreviewUrl} alt="Invoice Preview" style={{ width: '100%', height: 'auto' }} />
                                    ) : (
                                        <iframe src={formData.invoicePreviewUrl} title="Invoice Preview" width="100%" height="100%" />
                                    )}
                                </Box>
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Upload an invoice to auto-fill details using Azure Document AI.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Right Column: Expense Details */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={paperStyle}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField name="billNo" label="Bill No." value={formData.billNo} onChange={handleChange} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} disabled={isViewMode} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DatePicker label="Bill Date *" value={formData.billDate} onChange={(date) => handleDateChange('billDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'outlined', required: true, InputLabelProps:inputLabelProps } }} disabled={isViewMode} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode}>
                                        <InputLabel shrink htmlFor="bill-source-select">Bill Source</InputLabel>
                                        <Select label="Bill Source" name="billSource" value={formData.billSource} onChange={handleChange} inputProps={{id: 'bill-source-select'}}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {billSourceOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField name="supplierGst" label="Supplier GST" value={formData.supplierGst} onChange={handleChange} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} disabled={isViewMode} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                     <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode} required>
                                        <InputLabel shrink htmlFor="supplier-select">Supplier *</InputLabel>
                                        <Select label="Supplier *" name="supplierId" value={formData.supplierId} onChange={handleChange} inputProps={{id: 'supplier-select'}}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {supplierOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <DatePicker label="Due Date" value={formData.dueDate} onChange={(date) => handleDateChange('dueDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small', variant: 'outlined', InputLabelProps:inputLabelProps } }} disabled={isViewMode} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                     <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode} required>
                                        <InputLabel shrink htmlFor="expense-head-select">Expense Head *</InputLabel>
                                        <Select label="Expense Head *" name="expenseHeadId" value={formData.expenseHeadId} onChange={handleChange} inputProps={{id: 'expense-head-select'}}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {expenseHeadOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField name="narration" label="Narration / Description" value={formData.narration} onChange={handleChange} fullWidth size="small" variant="outlined" multiline rows={2} InputLabelProps={inputLabelProps} disabled={isViewMode}/>
                                </Grid>

                                <Grid item xs={12}><Divider sx={{ my: 1.5 }} /></Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'medium'}}>Line Items</Typography>
                                    {formData.lineItems.map((item, index) => (
                                        <Grid container spacing={1} key={index} alignItems="center" sx={{mb: 1}}>
                                            <Grid item xs={12} sm={4} md={3}><TextField name="description" label={`Item ${index + 1} Desc.`} value={item.description} onChange={(e) => handleLineItemChange(index, e)} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} disabled={isViewMode}/></Grid>
                                            <Grid item xs={12} sm={4} md={2.5}><TextField name="hsnCode" label="HSN Code" value={item.hsnCode} onChange={(e) => handleLineItemChange(index, e)} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} disabled={isViewMode}/></Grid>
                                            <Grid item xs={6} sm={2} md={2}><TextField name="price" label="Price" type="number" value={item.price} onChange={(e) => handleLineItemChange(index, e)} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} disabled={isViewMode}/></Grid>
                                            <Grid item xs={6} sm={2} md={1.5}><TextField name="qty" label="Qty" type="number" value={item.qty} onChange={(e) => handleLineItemChange(index, e)} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} disabled={isViewMode}/></Grid>
                                            <Grid item xs={12} sm={3} md={2}><TextField name="subtotal" label="Subtotal" type="number" value={item.subtotal} fullWidth size="small" variant="outlined" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} disabled readOnly/></Grid>
                                            <Grid item xs={12} sm={1} md={1} sx={{textAlign: {md: 'right'}}}>
                                                {formData.lineItems.length > 1 && !isViewMode && (
                                                    <IconButton onClick={() => removeLineItem(index)} color="error" size="small" aria-label="remove item">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </Grid>
                                        </Grid>
                                    ))}
                                    {!isViewMode && <Button size="small" startIcon={<AddIcon />} onClick={addLineItem} sx={{mt:1}} disabled={loading || extractionLoading}>Add Item</Button>}
                                </Grid>

                                <Grid item xs={12}><Divider sx={{ my: 1.5 }} /></Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                     <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode}>
                                        <InputLabel shrink htmlFor="currency-select">Currency</InputLabel>
                                        <Select label="Currency" name="currency" value={formData.currency} onChange={handleChange} inputProps={{id: 'currency-select'}}>
                                            {currencyOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}> <TextField name="totalAmount" label="Total Amount *" value={formData.totalAmount} onChange={handleChange} fullWidth size="small" variant="outlined" type="number" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} required disabled={isViewMode}/> </Grid>
                                <Grid item xs={12} sm={6} md={3}> <TextField name="tdsPercentage" label="TDS %" value={formData.tdsPercentage} onChange={handleChange} fullWidth size="small" variant="outlined" type="number" InputLabelProps={inputLabelProps} InputProps={{endAdornment: <InputAdornment position="end">%</InputAdornment>}} disabled={isViewMode}/> </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                     <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode}>
                                        <InputLabel shrink htmlFor="gst-vat-select">GST/VAT %</InputLabel>
                                        <Select label="GST/VAT %" name="gstRateId" value={formData.gstRateId} onChange={handleChange} inputProps={{id: 'gst-vat-select'}}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {gstRateOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}> <TextField name="gstVatAmount" label="GST/VAT Amount" value={formData.gstVatAmount} onChange={handleChange} fullWidth size="small" variant="outlined" type="number" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} disabled={isViewMode}/> </Grid>
                                <Grid item xs={12} sm={6} md={3}> <TextField name="netAmount" label="Net Amount" value={formData.netAmount} onChange={handleChange} fullWidth size="small" variant="outlined" type="number" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} disabled={isViewMode}/> </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                     <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode}>
                                        <InputLabel shrink htmlFor="payment-method-publish-select">Payment Status</InputLabel>
                                        <Select label="Payment Status" name="paymentMethodPublish" value={formData.paymentMethodPublish} onChange={handleChange} inputProps={{id: 'payment-method-publish-select'}}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {paymentMethodPublishOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                     {!isViewMode && <Button type="submit" variant="contained" color="primary" startIcon={<PublishIcon />} disabled={loading || extractionLoading}> {loading ? <CircularProgress size={20}/> : (formData._id ? 'Update & Publish' : 'Save & Publish')} </Button>}
                     {isViewMode && <Button variant="contained" color="secondary" startIcon={<EditIcon />} onClick={() => navigate(`/expenses/edit/${expenseId}`)}>Edit Expense</Button>}
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default AddExpensePage;
