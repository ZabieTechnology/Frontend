// src/pages/Expenses/AddExpensePage.js
import React, { useState, useEffect, useCallback } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Aliased date-fns imports to avoid naming conflicts and ensure they are defined
import {
    format as formatDateFnsAliased,
    parseISO,
    isValid as isValidDateFnsAliased,
    startOfDay,
    parse as parseDateFnsAliased
} from 'date-fns';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// --- INLINE SVG ICONS ---
const UploadFileIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.2 15.2-12.8 3.8a2 2 0 0 0-2.8 0L3.8 15.2c-.8.8-.8 2 0 2.8.8.8 2 .8 2.8 0L12 12.5l5.4 5.5c.8.8 2 .8 2.8 0 .8-.8.8-2 0-2.8Z"/><path d="M12 2v10.5"/><path d="M5 18h14"/></svg>
);
const ArrowBackIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const PublishIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const AddIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const DeleteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const EditIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const ExpandMoreIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);
const ApplyIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>
);

// --- THEME DEFINITION ---
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
        h5: { fontWeight: 700, },
        h6: { fontWeight: 600, fontSize: '1rem', marginBottom: '1rem', color: '#333' },
        body1: { fontSize: '0.9rem', },
    },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
        MuiPaper: { styleOverrides: { root: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' } } }
    },
});


const initialExpenseData = { // This is defined at the module scope
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
    taxAmount: '',
    netAmount: '',
    paymentMethodPublish: '',
    billSource: '',
    lineItems: [{ description: '', price: '', qty: '', hsnCode: '', subtotal: '' }],
    subTotalFromItems: '',
    discountAmount: '0',
    cgstAmount: '',
    sgstAmount: '',
    igstAmount: '',
    cessAmount: '',
    tdsRate: '',
    tdsAmountCalculated: '',
    calculatedTaxPercentage: '',
    status: 'Draft',
};

// Helper function for parsing dates, using aliased import
const customParseDateString = (dateString, formatString, referenceDate) => {
    if (!dateString) return null;
    // Use the aliased 'parseDateFnsAliased'
    const parsed = parseDateFnsAliased(dateString, formatString, referenceDate);
    return isValidDateFnsAliased(parsed) ? parsed : null;
};


const AddExpensePage = () => {
    const [formData, setFormData] = useState(initialExpenseData); // Correctly uses initialExpenseData
    const [loading, setLoading] = useState(false);
    const [extractionLoading, setExtractionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [expenseHeadOptions, setExpenseHeadOptions] = useState([]);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [paymentMethodPublishOptions, setPaymentMethodPublishOptions] = useState([]);
    const [billSourceOptions, setBillSourceOptions] = useState([]);

    const [rawExtractedText, setRawExtractedText] = useState('');
    const [extractedFieldsForTable, setExtractedFieldsForTable] = useState([]);
    const [extractedLineItemsForTable, setExtractedLineItemsForTable] = useState([]);
    const [rawExtractedFieldsFromBackend, setRawExtractedFieldsFromBackend] = useState(null);


    const { expenseId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const parseDateForPicker = (dateString) => {
        if (!dateString) return null;
        let parsed = parseISO(dateString);
        if (isValidDateFnsAliased(parsed)) return parsed;

        parsed = customParseDateString(dateString, 'dd/MM/yyyy', new Date());
        if (isValidDateFnsAliased(parsed)) return parsed;

        parsed = customParseDateString(dateString, 'dd-MMM-yyyy', new Date());
         if (isValidDateFnsAliased(parsed)) return parsed;
        console.warn("Could not parse date for picker:", dateString);
        return null;
    };


    const fetchDropdownData = useCallback(async (type, setter, labelField = 'label', valueField = 'value') => { try { const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=${type}`, { withCredentials: true }); if (response.data && Array.isArray(response.data.data)) { setter(response.data.data.map(opt => ({ value: opt[valueField], label: opt[labelField] }))); } else { setter([]); } } catch (err) { console.error(`Error fetching ${type} options:`, err); setter([]); } }, [API_BASE_URL]);
    const fetchSuppliers = useCallback(async () => { try { const response = await axios.get(`${API_BASE_URL}/api/vendors?limit=-1`, { withCredentials: true }); if (response.data && Array.isArray(response.data.data)) { setSupplierOptions(response.data.data.map(vendor => ({ value: vendor._id, label: vendor.displayName || vendor.vendorName }))); } } catch (err) { console.error("Error fetching suppliers:", err); } }, [API_BASE_URL]);
    const fetchExpenseHeads = useCallback(async () => { try { const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts?limit=-1&accountType=Expense`, { withCredentials: true }); if (response.data && Array.isArray(response.data.data)) { setExpenseHeadOptions(response.data.data.map(acc => ({ value: acc._id, label: `${acc.name} (${acc.code})` }))); } else { setExpenseHeadOptions([]); } } catch (err) { console.error("Error fetching expense heads:", err); setExpenseHeadOptions([]); } }, [API_BASE_URL]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const viewMode = queryParams.get('view') === 'true';
        setIsViewMode(viewMode);
        fetchSuppliers(); fetchExpenseHeads();
        fetchDropdownData('currency', setCurrencyOptions);
        fetchDropdownData('Expense_Payment_Publish', setPaymentMethodPublishOptions);
        fetchDropdownData('Expense_Bill_Source', setBillSourceOptions);
        if (expenseId) { /* TODO: Fetch expense data for edit */ }
        else { setFormData(initialExpenseData); if (viewMode) setIsViewMode(false); } // Correctly uses initialExpenseData
    }, [expenseId, location.search, fetchSuppliers, fetchExpenseHeads, fetchDropdownData]);

    useEffect(() => {
        if (!expenseId) {
            const awaitingPaymentOpt = paymentMethodPublishOptions.find(opt => opt.label === 'Awaiting Payment');
            const directUploadOpt = billSourceOptions.find(opt => opt.label === 'Direct Upload');
            if (paymentMethodPublishOptions.length > 0 || billSourceOptions.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    paymentMethodPublish: awaitingPaymentOpt ? awaitingPaymentOpt.value : prev.paymentMethodPublish,
                    billSource: directUploadOpt ? directUploadOpt.value : prev.billSource,
                }));
            }
        }
    }, [paymentMethodPublishOptions, billSourceOptions, expenseId]);

    const handleChange = (event) => { if (isViewMode) return; const { name, value, type, checked } = event.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' || type === 'switch' ? checked : value, })); };
    const handleDateChange = (name, date) => { if (isViewMode) return; setFormData(prev => ({ ...prev, [name]: date ? startOfDay(date) : null })); };

    const handleFileChange = async (event) => {
        if (isViewMode) return;
        const file = event.target.files[0];
        setRawExtractedText('');
        setExtractedFieldsForTable([]);
        setExtractedLineItemsForTable([]);
        setRawExtractedFieldsFromBackend(null);

        if (file) {
            setFormData(prev => ({ ...prev, invoiceFile: file, invoicePreviewUrl: URL.createObjectURL(file) }));
            setExtractionLoading(true); setError(null); setSuccess(null);
            const fileUploadData = new FormData();
            fileUploadData.append('invoice', file);
            try {
                const response = await axios.post(`${API_BASE_URL}/api/document-ai/extract-invoice`, fileUploadData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
                if (response.data) {
                    if (response.data.extractedTableData && Array.isArray(response.data.extractedTableData)) {
                        setExtractedFieldsForTable(response.data.extractedTableData);
                         if (response.data.extractedLineItems && Array.isArray(response.data.extractedLineItems)) {
                            setExtractedLineItemsForTable(response.data.extractedLineItems);
                        }
                        if (response.data.extractedData) {
                            setRawExtractedFieldsFromBackend(response.data.extractedData);
                        }
                        setSuccess(response.data.message || "Invoice data extracted for review.");
                    } else { setError(response.data.message || "Failed to extract structured data from invoice."); }
                    if (response.data.rawText) { setRawExtractedText(response.data.rawText); }
                } else { setError("Unexpected response from extraction server."); }
                setTimeout(() => { setSuccess(null); setError(null); }, 7000);
            } catch (err) {
                console.error("Error during Google AI invoice extraction:", err);
                setError(`Invoice extraction failed: ${err.response?.data?.message || err.message}`);
                setTimeout(() => setError(null), 7000);
            } finally { setExtractionLoading(false); }
        }
    };

    const applyExtractedDataToForm = () => {
        if (!rawExtractedFieldsFromBackend) { setError("No extracted data available to apply."); setTimeout(() => setError(null), 3000); return; }
        const extracted = rawExtractedFieldsFromBackend;
        const newFormValues = { ...initialExpenseData, _id: formData._id, currency: formData.currency }; // Uses initialExpenseData
        newFormValues.billNo = extracted.billNo || '';
        newFormValues.billDate = extracted.billDate ? parseDateForPicker(extracted.billDate) : null;
        const extractedSupplierName = extracted.supplier;
        if (extractedSupplierName) {
            const matchedSupplier = supplierOptions.find(s => s.label && s.label.toLowerCase() === String(extractedSupplierName).toLowerCase());
            newFormValues.supplierId = matchedSupplier ? matchedSupplier.value : '';
            if (!matchedSupplier) { console.warn(`Extracted supplier "${extractedSupplierName}" not found in options.`);}
        } else { newFormValues.supplierId = ''; }
        newFormValues.supplierGst = extracted.supplierGst || '';
        newFormValues.dueDate = extracted.dueDate ? parseDateForPicker(extracted.dueDate) : null;
        const matchedExpenseHead = expenseHeadOptions.find(eh => (extracted.expenseHead && eh.label.toLowerCase().includes(String(extracted.expenseHead).toLowerCase())));
        newFormValues.expenseHeadId = matchedExpenseHead ? matchedExpenseHead.value : '';
        newFormValues.totalAmount = String(extracted.totalAmount || '0');
        newFormValues.netAmount = String(extracted.subTotalFromItems || '0');
        newFormValues.taxAmount = String(extracted.taxAmount || '0');
        newFormValues.cgstAmount = String(extracted.cgstAmount || '');
        newFormValues.sgstAmount = String(extracted.sgstAmount || '');
        newFormValues.igstAmount = String(extracted.igstAmount || '');
        newFormValues.cessAmount = String(extracted.cessAmount || '');
        if (extracted.currency) newFormValues.currency = extracted.currency;
        if (extracted.lineItems && extracted.lineItems.length > 0) {
            newFormValues.lineItems = extracted.lineItems.map(li => ({ description: li.description || '', qty: String(li.qty || ''), price: String(li.price || ''), subtotal: String(li.subtotal || ''), hsnCode: li.hsnCode || '' }));
        } else { newFormValues.lineItems = [{ description: '', price: '', qty: '', hsnCode: '', subtotal: '' }]; }
        setFormData(prev => ({...prev, ...newFormValues}));
        setSuccess("Extracted data applied to form. Please review and save.");
        setExtractedFieldsForTable([]); setExtractedLineItemsForTable([]); setRawExtractedFieldsFromBackend(null);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleLineItemChange = (index, event) => { if (isViewMode) return; const { name, value } = event.target; const newLineItems = [...formData.lineItems]; newLineItems[index][name] = value; if (name === 'price' || name === 'qty') { const price = parseFloat(newLineItems[index].price) || 0; const qty = parseFloat(newLineItems[index].qty) || 0; newLineItems[index].subtotal = (price * qty).toFixed(2); } setFormData(prev => ({ ...prev, lineItems: newLineItems })); };
    const addLineItem = () => { if (isViewMode) return; setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, { description: '', price: '', qty: '', hsnCode: '', subtotal: '' }], })); };
    const removeLineItem = (index) => { if (isViewMode) return; if (formData.lineItems.length <= 1) { setError("At least one line item is required."); setTimeout(() => setError(null), 3000); return; } const newLineItems = formData.lineItems.filter((_, i) => i !== index); setFormData(prev => ({ ...prev, lineItems: newLineItems })); };

    const calculateTotals = useCallback(() => {
        const lineItems = formData.lineItems || [];
        const subTotalFromItems = lineItems.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
        const discountAmount = parseFloat(formData.discountAmount) || 0;
        const taxableAmount = subTotalFromItems - discountAmount;
        const cgst = parseFloat(formData.cgstAmount) || 0;
        const sgst = parseFloat(formData.sgstAmount) || 0;
        const igst = parseFloat(formData.igstAmount) || 0;
        const cess = parseFloat(formData.cessAmount) || 0;
        let currentTotalTaxFromBreakdown = cgst + sgst + igst + cess;
        const finalTaxAmount = (cgst > 0 || sgst > 0 || igst > 0 || cess > 0) ? currentTotalTaxFromBreakdown : (parseFloat(formData.taxAmount) || 0);
        const currentTotalAmount = taxableAmount + finalTaxAmount;
        const currentNetAmount = taxableAmount;
        const currentTdsRate = parseFloat(formData.tdsRate) || 0;
        const calculatedTdsAmount = (taxableAmount * currentTdsRate) / 100;
        let calculatedTaxPercentage = '0.00';
        if (taxableAmount > 0 && finalTaxAmount >= 0) { calculatedTaxPercentage = ((finalTaxAmount / taxableAmount) * 100).toFixed(2); }
        setFormData(prev => ({ ...prev, subTotalFromItems: subTotalFromItems.toFixed(2), taxAmount: finalTaxAmount.toFixed(2), totalAmount: currentTotalAmount.toFixed(2), netAmount: currentNetAmount.toFixed(2), tdsAmountCalculated: calculatedTdsAmount.toFixed(2), calculatedTaxPercentage: calculatedTaxPercentage, }));
    }, [formData.lineItems, formData.discountAmount, formData.cgstAmount, formData.sgstAmount, formData.igstAmount, formData.cessAmount, formData.tdsRate, formData.taxAmount]);

    useEffect(() => {
        calculateTotals();
    }, [formData.lineItems, formData.discountAmount, formData.cgstAmount, formData.sgstAmount, formData.igstAmount, formData.cessAmount, formData.tdsRate, formData.taxAmount, calculateTotals]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isViewMode) return;
        setLoading(true); setError(null); setSuccess(null);
        if (!formData.billDate || !formData.supplierId || !formData.expenseHeadId || !formData.totalAmount) {
            setError("Bill Date, Supplier, Expense Head, and Total Amount are required.");
            setLoading(false); setTimeout(() => setError(null), 3000); return;
        }
        const submissionPayload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'invoiceFile' || key === 'invoicePreviewUrl' || key === 'lineItems' || key === 'calculatedTaxPercentage') return;
            if (value instanceof Date) { submissionPayload.append(key, formatDateFnsAliased(value, 'yyyy-MM-dd')); } // Use aliased import
            else if (typeof value === 'boolean') { submissionPayload.append(key, value.toString()); }
            else if (value !== null && value !== undefined) { submissionPayload.append(key, value); }
        });
        submissionPayload.append('lineItems', JSON.stringify(formData.lineItems));
        if (formData.invoiceFile instanceof File) { submissionPayload.append('invoice', formData.invoiceFile, formData.invoiceFile.name); }
        try {
            let response;
            response = await axios.post(`${API_BASE_URL}/api/expenses`, submissionPayload, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            setSuccess("Expense created successfully! (Review & Publish next)");
            if (response.data && response.data.data) {
                setFormData(initialExpenseData); // Correctly uses initialExpenseData
                setRawExtractedText('');
                setExtractedFieldsForTable([]);
                setExtractedLineItemsForTable([]);
            }
            setTimeout(() => setSuccess(null), 4000);
        } catch (err) { console.error("Error saving expense:", err); setError(`Failed to save expense: ${err.response?.data?.message || err.message}`); setTimeout(() => setError(null), 5000);
        } finally { setLoading(false); }
    };

    const title = expenseId ? (isViewMode ? "View Expense" : "Edit Expense") : "Add New Expense / Bill";
    const paperStyle = { p: {xs: 1.5, md: 2.5}, borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: 'none', height: '100%'};
    const inputLabelProps = { shrink: true };

    return (
        <ThemeProvider theme={modernTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box component="form" onSubmit={handleSubmit} sx={{ p: {xs: 1, md: 2}, backgroundColor: '#f8f9fa' }}>
                    <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{title}</Typography>
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
                        <Grid item xs={12} md={4}>
                            <Paper sx={paperStyle}>
                                <Typography variant="h6" gutterBottom>Upload Invoice</Typography>
                                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} fullWidth disabled={isViewMode || loading || extractionLoading}>
                                    {formData.invoiceFile ? formData.invoiceFile.name : "Choose Invoice File"}
                                    <input type="file" hidden onChange={handleFileChange} accept="image/*,.pdf" />
                                </Button>
                                {extractionLoading && <CircularProgress size={24} sx={{display: 'block', margin: '10px auto'}} />}
                                {formData.invoicePreviewUrl && (
                                    <Box mt={2} sx={{ border: '1px dashed grey', p: 1, height: 200, overflow: 'auto' }}>
                                        {formData.invoiceFile?.type.startsWith('image/') ? (
                                            <img src={formData.invoicePreviewUrl} alt="Invoice Preview" style={{ width: '100%', height: 'auto' }} />
                                        ) : (
                                            <iframe src={formData.invoicePreviewUrl} title="Invoice Preview" width="100%" height="100%" />
                                        )}
                                    </Box>
                                )}
                                <Typography variant="caption" display="block" sx={{ mt: 1, mb:1 }}>
                                    Upload an invoice to auto-fill details using Google Document AI.
                                </Typography>

                                {extractedFieldsForTable.length > 0 && !extractionLoading && (
                                    <Paper variant="outlined" sx={{mt: 2, p:1.5, mb:1}}>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                                            <Typography variant="subtitle2" gutterBottom sx={{fontWeight: 'medium'}}>Extracted Data for Review</Typography>
                                            {!isViewMode &&
                                                <Button onClick={applyExtractedDataToForm} size="small" variant="contained" disabled={loading} color="secondary" startIcon={<ApplyIcon/>}>
                                                    Apply to Form
                                                </Button>
                                            }
                                        </Box>
                                        <TableContainer sx={{ maxHeight: 280 }}>
                                            <Table size="small" stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{fontWeight:'bold', fontSize: '0.8rem'}}>Field from Invoice</TableCell>
                                                        <TableCell sx={{fontWeight:'bold', fontSize: '0.8rem'}}>Extracted Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {extractedFieldsForTable.map((item, index) => (
                                                        <TableRow key={index} hover>
                                                            <TableCell sx={{fontSize: '0.75rem', py:0.5, whiteSpace: 'nowrap'}}>{item.label}</TableCell>
                                                            <TableCell sx={{fontSize: '0.75rem', py:0.5}}>{String(item.value === null || item.value === undefined ? 'N/A' : item.value)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                )}
                                {extractedLineItemsForTable.length > 0 && !extractionLoading && (
                                     <Paper variant="outlined" sx={{mt: 1, p:1.5}}>
                                         <Typography variant="subtitle2" gutterBottom sx={{fontWeight: 'medium'}}>Extracted Line Items</Typography>
                                         <TableContainer sx={{ maxHeight: 200 }}>
                                             <Table size="small" stickyHeader>
                                                 <TableHead><TableRow><TableCell sx={{fontSize: '0.8rem'}}>Desc.</TableCell><TableCell sx={{fontSize: '0.8rem'}}>Qty</TableCell><TableCell sx={{fontSize: '0.8rem'}}>Price</TableCell><TableCell sx={{fontSize: '0.8rem'}}>Amount</TableCell><TableCell sx={{fontSize: '0.8rem'}}>HSN</TableCell></TableRow></TableHead>
                                                 <TableBody>
                                                     {extractedLineItemsForTable.map((li, idx) => (
                                                         <TableRow key={idx} hover>
                                                             <TableCell sx={{fontSize: '0.75rem'}}>{li.description}</TableCell>
                                                             <TableCell sx={{fontSize: '0.75rem'}}>{li.qty}</TableCell>
                                                             <TableCell sx={{fontSize: '0.75rem'}}>{li.price}</TableCell>
                                                             <TableCell sx={{fontSize: '0.75rem'}}>{li.subtotal}</TableCell>
                                                             <TableCell sx={{fontSize: '0.75rem'}}>{li.hsnCode}</TableCell>
                                                         </TableRow>
                                                     ))}
                                                 </TableBody>
                                             </Table>
                                         </TableContainer>
                                     </Paper>
                                )}


                                {rawExtractedText && (
                                    <Accordion sx={{ mt: 2, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.12)' }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="caption" sx={{fontWeight:'medium'}}>View Raw OCR Text</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{maxHeight: 200, overflowY: 'auto'}}>
                                            <TextField
                                                multiline
                                                fullWidth
                                                variant="outlined"
                                                value={rawExtractedText}
                                                InputProps={{ readOnly: true, sx: {fontSize: '0.75rem', fontFamily: 'monospace'} }}
                                                sx={{ '& .MuiInputBase-input': { p: 1 } }}
                                            />
                                        </AccordionDetails>
                                    </Accordion>
                                )}
                            </Paper>
                        </Grid>

                        {/* Right Column: Expense Details Form */}
                        <Grid item xs={12} md={8}>
                            <Paper sx={paperStyle}>
                                <Grid container spacing={2}>
                                    {/* ... other form fields remain the same ... */}
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

                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{p:2, mt:1, mb:1}}>
                                            <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'medium'}}>Tax Breakdown</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6} sm={3}><TextField name="cgstAmount" label="CGST Amount" value={formData.cgstAmount} onChange={handleChange} fullWidth size="small" type="number" InputLabelProps={inputLabelProps} disabled={isViewMode} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} /></Grid>
                                                <Grid item xs={6} sm={3}><TextField name="sgstAmount" label="SGST Amount" value={formData.sgstAmount} onChange={handleChange} fullWidth size="small" type="number" InputLabelProps={inputLabelProps} disabled={isViewMode} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} /></Grid>
                                                <Grid item xs={6} sm={3}><TextField name="igstAmount" label="IGST Amount" value={formData.igstAmount} onChange={handleChange} fullWidth size="small" type="number" InputLabelProps={inputLabelProps} disabled={isViewMode} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} /></Grid>
                                                <Grid item xs={6} sm={3}><TextField name="cessAmount" label="CESS Amount" value={formData.cessAmount} onChange={handleChange} fullWidth size="small" type="number" InputLabelProps={inputLabelProps} disabled={isViewMode} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} /></Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                         <Paper variant="outlined" sx={{p:2, mt:1, mb:1}}>
                                            <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'medium'}}>TDS</Typography>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={6}><TextField name="tdsRate" label="TDS Rate (%)" value={formData.tdsRate} onChange={handleChange} fullWidth size="small" type="number" InputLabelProps={inputLabelProps} disabled={isViewMode} InputProps={{endAdornment: <InputAdornment position="end">%</InputAdornment>}} /></Grid>
                                                <Grid item xs={12} sm={6}><TextField name="tdsAmountCalculated" label="TDS Amount" value={formData.tdsAmountCalculated} fullWidth size="small" type="number" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} disabled readOnly /></Grid>
                                            </Grid>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                         <FormControl fullWidth size="small" variant="outlined" disabled={isViewMode}>
                                            <InputLabel shrink htmlFor="currency-select">Currency</InputLabel>
                                            <Select label="Currency" name="currency" value={formData.currency} onChange={handleChange} inputProps={{id: 'currency-select'}}>
                                                {currencyOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}> <TextField name="netAmount" label="Net Amount (Pre-Tax)" value={formData.netAmount} InputLabelProps={inputLabelProps} InputProps={{readOnly: true, startAdornment: <InputAdornment position="start"></InputAdornment>}} fullWidth size="small" variant="outlined" type="number" disabled/> </Grid>
                                    <Grid item xs={12} sm={6} md={3}> <TextField name="taxAmount" label="Tax Amount" value={formData.taxAmount} onChange={handleChange} fullWidth size="small" variant="outlined" type="number" InputLabelProps={inputLabelProps} InputProps={{startAdornment: <InputAdornment position="start"></InputAdornment>}} disabled={isViewMode}/> </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            name="calculatedTaxPercentage"
                                            label="Calculated Tax %"
                                            value={formData.calculatedTaxPercentage}
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            InputLabelProps={inputLabelProps}
                                            InputProps={{readOnly: true, endAdornment: <InputAdornment position="end">%</InputAdornment>}}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}> <TextField name="totalAmount" label="Total Amount *" value={formData.totalAmount} InputLabelProps={inputLabelProps} InputProps={{readOnly: true, startAdornment: <InputAdornment position="start"></InputAdornment>}} fullWidth size="small" variant="outlined" type="number" required disabled/> </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
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
        </ThemeProvider>
    );
};

export default AddExpensePage;