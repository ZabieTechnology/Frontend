import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Autocomplete,
    Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon,
    Palette as PaletteIcon, Payment as PaymentIcon, PersonAddAlt1 as PersonAddAlt1Icon,
    PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { format as formatDateFns, isValid as isValidDateFns, startOfDay, addDays } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const minimalInitialLineItem = {
    id: null,
    itemId: '',
    description: '',
    hsnSac: '',
    quantity: 1,
    rate: 0,
    discountPerItem: 0,
    taxId: '',
    taxRate: 0,
    cessAmountPerItem: 0,
};

const defaultThemeProfileData = {
    id: 'default_fallback_theme_profile', profileName: 'Default Fallback', isDefault: true, baseThemeName: "Modern", selectedColor: "#4CAF50",
    itemTableColumns: { pricePerItem: true, quantity: true, taxRate: true, taxPerItem: true, hsnSacCode: true, batchNo: false, expDate: false, mfgDate: false, discountPerItem: false, serialNo: false, },
    customItemColumns: [], invoiceHeading: "TAX INVOICE", invoicePrefix: "INV-", invoiceSuffix: "", invoiceDueAfterDays: 30, showPoNumber: true,
    customHeaderFields: [], upiId: "", upiQrCodeImageUrl: "", bankAccountId: '', showSaleAgentOnInvoice: false, showBillToSection: true, showShipToSection: true,
    signatureImageUrl: '', enableReceiverSignature: false, invoiceFooter: "", invoiceFooterImageUrl: "", termsAndConditionsId: 'Default T&C', notesDefault: "Thank you for your business!",
};

const initialGlobalSettingsData = {
    companyLogoUrl: "/images/default_logo.png", nextInvoiceNumber: 1, currency: "INR", state: "KL",
};

const getBaseInitialInvoiceData = (defaultTaxInfo = null, globalSettings = initialGlobalSettingsData, themeSettings = defaultThemeProfileData) => {
    return {
        invoiceNumber: '',
        invoiceDate: new Date(),
        dueDate: addDays(new Date(), themeSettings.invoiceDueAfterDays || 30),
        customerId: '',
        customerName: '',
        customerGstin: '',
        customerAddress: '',
        customerState: '',
        shipToAddress: '',
        poNumber: '',
        saleAgentName: '',
        lineItems: [{ ...minimalInitialLineItem, id: Date.now() + 1, taxId: defaultTaxInfo ? defaultTaxInfo.id : '', taxRate: defaultTaxInfo ? defaultTaxInfo.rate : 0 }],
        discountType: 'Percentage',
        discountValue: 0,
        amountPaid: 0,
        notes: themeSettings.notesDefault || "Thank you for your business!",
        termsAndConditions: themeSettings.termsAndConditionsId || "Default T&C",
        currency: globalSettings.currency || 'INR',
        bankAccountId: themeSettings.bankAccountId || '',
        status: 'Draft',
        selectedThemeProfileId: themeSettings.id || null,
        overallCessAmount: 0,
    };
};

const initialNewCustomerData = { displayName: '', paymentTerms: 'Due on Receipt' };
const initialNewItemData = { itemName: '', salePrice: '', gstRate: 0 };


const CreateSalesInvoicePage = () => {
    const [invoiceData, setInvoiceData] = useState(getBaseInitialInvoiceData(null, initialGlobalSettingsData, defaultThemeProfileData));
    const [allThemeProfiles, setAllThemeProfiles] = useState([]);
    const [selectedThemeProfileId, setSelectedThemeProfileId] = useState('');
    const [currentThemeSettings, setCurrentThemeSettings] = useState(null);
    const [globalCompanySettings, setGlobalCompanySettings] = useState(initialGlobalSettingsData);
    const [supplierState, setSupplierState] = useState('');
    const [customerOptions, setCustomerOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [savedInvoiceId, setSavedInvoiceId] = useState(null);

    // Add Customer Modal State
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState(initialNewCustomerData);
    const [newCustomerLoading, setNewCustomerLoading] = useState(false);
    const [newCustomerError, setNewCustomerError] = useState(null);

    // Add Item Modal State
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItemData, setNewItemData] = useState(initialNewItemData);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [newItemError, setNewItemError] = useState(null);
    const [currentItemIndex, setCurrentItemIndex] = useState(null);

    const title = "Create Sales Invoice";
    const titleStyle = { color: 'primary.main', fontWeight: 'bold' };
    const inputLabelProps = { shrink: true };
    const currencySymbol = formatCurrency(0, invoiceData.currency === 'INR' ? '₹' : '$').charAt(0);

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchTaxOptions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gst-rates`, { withCredentials: true });
            let fetchedTaxes = response.data && Array.isArray(response.data.data) ? response.data.data.filter(tax => tax.head && tax.head.toLowerCase().includes('output')).map(tax => ({ id: tax._id, name: tax.taxName || `Tax @ ${parseFloat(tax.taxRate) || 0}%`, rate: parseFloat(tax.taxRate) || 0, isDefaultLineItemTax: tax.isDefaultLineItemTax || tax.isDefault || false })) : [];
            if (fetchedTaxes.length > 0) { setTaxOptions(fetchedTaxes); return fetchedTaxes; }
            else { const fallback = [{ id: "default_tax_0_id", name: "No Tax (Fallback)", rate: 0, isDefaultLineItemTax: true }]; setTaxOptions(fallback); return fallback; }
        } catch (err) {
            const fallback = [{ id: "error_fallback_tax", name: "No Tax (Error)", rate: 0, isDefaultLineItemTax: true }]; setTaxOptions(fallback); return fallback;
        }
    }, [API_BASE_URL]);

    const fetchAllInvoiceSettings = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/invoice-settings`, { withCredentials: true });
            let defaultTheme = defaultThemeProfileData, currentGlobal = initialGlobalSettingsData;
            if (response.data) {
                currentGlobal = { ...initialGlobalSettingsData, ...(response.data.global || {}) };
                const savedThemes = Array.isArray(response.data.savedThemes) && response.data.savedThemes.length > 0 ? response.data.savedThemes : [defaultTheme];
                setAllThemeProfiles(savedThemes);
                defaultTheme = savedThemes.find(t => t.isDefault) || savedThemes[0];
            }
            setGlobalCompanySettings(currentGlobal); setSupplierState(currentGlobal.state || '');
            setSelectedThemeProfileId(defaultTheme.id); setCurrentThemeSettings(defaultTheme);
            return { globalSettings: currentGlobal, defaultThemeToApply: defaultTheme };
        } catch (err) {
            setCurrentThemeSettings(defaultThemeProfileData); setAllThemeProfiles([defaultThemeProfileData]);
            return { globalSettings: initialGlobalSettingsData, defaultThemeToApply: defaultThemeProfileData };
        }
    }, [API_BASE_URL]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setCustomerOptions(response.data.data.map(cust => ({ value: cust._id, label: cust.displayName || cust.companyName, gstin: cust.gstNo || '', address: cust.billingAddress?.street ? `${cust.billingAddress.street}, ${cust.billingAddress.city}` : 'N/A', state: cust.billingAddress?.state || '' })));
            }
        } catch (err) { console.error("Error fetching customers:", err); }
    }, [API_BASE_URL]);

    const fetchInventoryItems = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setInventoryItems(response.data.data);
            }
        } catch (err) { console.error("Error fetching inventory items:", err); }
    }, [API_BASE_URL]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingSettings(true); setError(null);
            const taxes = await fetchTaxOptions();
            await fetchCustomers();
            await fetchInventoryItems();
            const { globalSettings, defaultThemeToApply } = await fetchAllInvoiceSettings();
            const defaultTax = taxes.find(t => t.isDefaultLineItemTax) || taxes[0] || {id: '', rate: 0};
            setInvoiceData(getBaseInitialInvoiceData(defaultTax, globalSettings, defaultThemeToApply));
            setLoadingSettings(false);
        };
        loadInitialData();
    }, [fetchTaxOptions, fetchAllInvoiceSettings, fetchCustomers, fetchInventoryItems]);

    const calculatedInvoiceData = useMemo(() => {
        let subTotal = 0, totalTax = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0;
        const updatedLineItems = invoiceData.lineItems.map(item => {
            const qty = parseFloat(item.quantity) || 0, rate = parseFloat(item.rate) || 0, discount = parseFloat(item.discountPerItem) || 0;
            const taxableValue = (qty * rate) - discount;
            const taxRate = parseFloat(item.taxRate) || 0;
            let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

            const supState = supplierState?.trim().toLowerCase();
            const custState = invoiceData.customerState?.trim().toLowerCase();

            if (supState && custState && supState === custState) {
                cgstAmount = (taxableValue * (taxRate / 2)) / 100;
                sgstAmount = (taxableValue * (taxRate / 2)) / 100;
            } else {
                igstAmount = (taxableValue * taxRate) / 100;
            }

            const itemTaxAmount = cgstAmount + sgstAmount + igstAmount;
            const itemTotal = taxableValue + itemTaxAmount;

            subTotal += taxableValue;
            totalTax += itemTaxAmount;
            totalCgst += cgstAmount;
            totalSgst += sgstAmount;
            totalIgst += igstAmount;

            return { ...item, taxableValue: taxableValue.toFixed(2), taxAmount: itemTaxAmount.toFixed(2), amount: itemTotal.toFixed(2), cgstAmount: cgstAmount.toFixed(2), sgstAmount: sgstAmount.toFixed(2), igstAmount: igstAmount.toFixed(2) };
        });
        const discountAmount = invoiceData.discountType === 'Percentage' ? (subTotal * (parseFloat(invoiceData.discountValue) || 0)) / 100 : parseFloat(invoiceData.discountValue) || 0;
        const grandTotal = subTotal - discountAmount + totalTax;
        const balanceDue = grandTotal - (parseFloat(invoiceData.amountPaid) || 0);
        return { ...invoiceData, lineItems: updatedLineItems, subTotal: subTotal.toFixed(2), taxTotal: totalTax.toFixed(2), cgstAmount: totalCgst.toFixed(2), sgstAmount: totalSgst.toFixed(2), igstAmount: totalIgst.toFixed(2), discountAmountCalculated: discountAmount.toFixed(2), grandTotal: grandTotal.toFixed(2), balanceDue: balanceDue.toFixed(2) };
    }, [invoiceData, supplierState]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (name === "customerId") {
            const selectedCustomer = customerOptions.find(c => c.value === value);
            setInvoiceData(prev => ({
                ...prev,
                customerId: value,
                customerName: selectedCustomer ? selectedCustomer.label : '',
                customerGstin: selectedCustomer ? selectedCustomer.gstin : '',
                customerAddress: selectedCustomer ? selectedCustomer.address : '',
                customerState: selectedCustomer ? selectedCustomer.state : '',
                shipToAddress: prev.shipToAddress || (selectedCustomer ? selectedCustomer.address : ''),
            }));
        } else {
            setInvoiceData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleDateChange = (name, dateString) => {
        if (!dateString) { setInvoiceData(prev => ({ ...prev, [name]: null })); return; }
        const [year, month, day] = dateString.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        setInvoiceData(prev => ({ ...prev, [name]: newDate }));
        if (name === 'invoiceDate' && currentThemeSettings?.invoiceDueAfterDays) {
            setInvoiceData(prev => ({ ...prev, dueDate: addDays(newDate, currentThemeSettings.invoiceDueAfterDays) }));
        }
    };

    const handleItemSelect = (index, selectedItemId, currentInventory = inventoryItems) => {
        const selectedItem = currentInventory.find(item => item._id === selectedItemId);
        if (!selectedItem) return;
        const updatedLineItems = invoiceData.lineItems.map((item, i) => {
            if (i === index) {
                const matchingTax = taxOptions.find(tax => tax.rate === selectedItem.gstRate);
                return { ...item, itemId: selectedItem._id, description: selectedItem.itemName, hsnSac: selectedItem.hsnCode || '', rate: selectedItem.salePrice || 0, taxId: matchingTax ? matchingTax.id : '', taxRate: selectedItem.gstRate || 0 };
            }
            return item;
        });
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const handleLineItemChange = (index, event) => {
        const { name, value } = event.target;
        const updatedLineItems = invoiceData.lineItems.map((item, i) => {
            if (i === index) {
                let updatedItem = { ...item, [name]: value };
                if (name === "taxId") { const selectedTax = taxOptions.find(t => t.id === value); updatedItem.taxRate = selectedTax ? selectedTax.rate : 0; }
                if (name === 'description') { updatedItem.itemId = ''; }
                return updatedItem;
            }
            return item;
        });
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const addLineItem = () => {
        const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || taxOptions[0] || {id: '', rate: 0};
        setInvoiceData(prev => ({ ...prev, lineItems: [...prev.lineItems, { ...minimalInitialLineItem, id: Date.now(), taxId: defaultTax.id, taxRate: defaultTax.rate }] }));
    };

    const removeLineItem = (id) => {
        if (invoiceData.lineItems.length <= 1) return;
        setInvoiceData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) }));
    };

    const handleOpenAddCustomerModal = () => setIsAddCustomerModalOpen(true);
    const handleCloseAddCustomerModal = () => { setIsAddCustomerModalOpen(false); setNewCustomerData(initialNewCustomerData); setNewCustomerError(null); };
    const handleNewCustomerDataChange = (event) => { const { name, value } = event.target; setNewCustomerData(prev => ({ ...prev, [name]: value })); };

    const handleSaveNewCustomer = async () => {
        if (!newCustomerData.displayName || newCustomerData.displayName.trim() === "") { setNewCustomerError("Display Name is required."); return; }
        setNewCustomerLoading(true); setNewCustomerError(null);
        try {
            const customerPayload = { displayName: newCustomerData.displayName.trim(), paymentTerms: newCustomerData.paymentTerms, primaryContact: { email: "", mobile: "" }, customerType: "Business" };
            const response = await axios.post(`${API_BASE_URL}/api/customers`, customerPayload, { withCredentials: true });
            if (response.data && response.data.data) {
                const createdCustomer = response.data.data;
                handleCloseAddCustomerModal(); await fetchCustomers();
                setInvoiceData(prev => ({ ...prev, customerId: createdCustomer._id, customerName: createdCustomer.displayName, customerGstin: createdCustomer.gstNo || '', customerAddress: createdCustomer.billingAddress?.street ? `${createdCustomer.billingAddress.street}, ${createdCustomer.billingAddress.city}` : '', customerState: createdCustomer.billingAddress?.state || '', shipToAddress: prev.shipToAddress || (createdCustomer.billingAddress?.street ? `${createdCustomer.billingAddress.street}, ${createdCustomer.billingAddress.city}` : '') }));
                setSuccess("New customer added and selected!"); setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setNewCustomerError(`Failed to save customer: ${err.response?.data?.message || err.message}`);
        } finally {
            setNewCustomerLoading(false);
        }
    };

    const handleOpenAddItemModal = (index) => {
        setCurrentItemIndex(index);
        setIsAddItemModalOpen(true);
    };

    const handleCloseAddItemModal = () => {
        setIsAddItemModalOpen(false);
        setNewItemData(initialNewItemData);
        setNewItemError(null);
        setCurrentItemIndex(null);
    };

    const handleNewItemChange = (event) => {
        const { name, value } = event.target;
        setNewItemData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNewItem = async () => {
        if (!newItemData.itemName || !newItemData.salePrice) {
            setNewItemError("Item Name and Sale Price are required.");
            return;
        }
        setNewItemLoading(true); setNewItemError(null);
        try {
            const payload = {
                itemName: newItemData.itemName,
                salePrice: parseFloat(newItemData.salePrice),
                gstRate: parseFloat(newItemData.gstRate),
                itemType: 'product',
            };
            const response = await axios.post(`${API_BASE_URL}/api/inventory`, payload, { withCredentials: true });
            if (response.data && response.data.data) {
                const createdItem = response.data.data;
                handleCloseAddItemModal();
                const updatedInventory = [...inventoryItems, createdItem];
                setInventoryItems(updatedInventory);
                if (currentItemIndex !== null) {
                    handleItemSelect(currentItemIndex, createdItem._id, updatedInventory);
                }
                setSuccess("New item added successfully!");
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setNewItemError(`Failed to save item: ${err.response?.data?.message || err.message}`);
        } finally {
            setNewItemLoading(false);
        }
    };

    const handleSave = async ({ status, openPdf = false }) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = {
            ...calculatedInvoiceData,
            status: status,
            invoiceDate: calculatedInvoiceData.invoiceDate ? formatDateFns(new Date(calculatedInvoiceData.invoiceDate), 'yyyy-MM-dd') : null,
            dueDate: calculatedInvoiceData.dueDate ? formatDateFns(new Date(calculatedInvoiceData.dueDate), 'yyyy-MM-dd') : null,
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/api/sales-invoices`, payload, { withCredentials: true });

            if (response.data && response.data.data && response.data.data._id) {
                const newInvoiceId = response.data.data._id;
                setSavedInvoiceId(newInvoiceId);
                setSuccess(`Invoice saved successfully as ${status}.`);

                if (openPdf) {
                    window.open(`${API_BASE_URL}/api/sales-invoices/${newInvoiceId}/pdf`, '_blank');
                }

                // Reset form
                const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || (taxOptions.length > 0 ? taxOptions[0] : null);
                const baseNewInvoiceData = getBaseInitialInvoiceData(defaultTax, globalCompanySettings, currentThemeSettings || defaultThemeProfileData);
                setInvoiceData(baseNewInvoiceData);

            } else {
                setError("Failed to save invoice: Unexpected server response.");
            }
        } catch (err) {
            setError(`Failed to save invoice: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingSettings) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    const displayData = calculatedInvoiceData;

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={titleStyle}>{title}</Typography>
                <IconButton onClick={() => navigate('/sales')}><ArrowBackIcon /></IconButton>
            </Paper>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Invoice Details</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={11} sm={5}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Customer</InputLabel>
                            <Select name="customerId" value={invoiceData.customerId} label="Customer" onChange={handleChange}>
                                <MenuItem value=""><em>Select Customer</em></MenuItem>
                                {customerOptions.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                     <Grid item xs={1} sm={1}>
                        <Tooltip title="Add New Customer">
                            <IconButton onClick={handleOpenAddCustomerModal} color="primary"><PersonAddAlt1Icon /></IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12} sm={6}><TextField label="Invoice Number" fullWidth size="small" value={invoiceData.invoiceNumber} onChange={handleChange} name="invoiceNumber" /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Invoice Date" type="date" value={isValidDateFns(invoiceData.invoiceDate) ? formatDateFns(new Date(invoiceData.invoiceDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('invoiceDate', e.target.value)} fullWidth size="small" InputLabelProps={inputLabelProps} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Due Date" type="date" value={isValidDateFns(invoiceData.dueDate) ? formatDateFns(new Date(invoiceData.dueDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('dueDate', e.target.value)} fullWidth size="small" InputLabelProps={inputLabelProps} /></Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" gutterBottom>Items</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Item/Description</TableCell>
                                <TableCell>HSN/SAC</TableCell>
                                <TableCell align="right">Qty</TableCell>
                                <TableCell align="right">Rate</TableCell>
                                <TableCell>Tax</TableCell>
                                <TableCell align="right">CGST</TableCell>
                                <TableCell align="right">SGST</TableCell>
                                <TableCell align="right">IGST</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoiceData.lineItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ minWidth: 250, display: 'flex', alignItems: 'center' }}>
                                        <Autocomplete
                                            freeSolo fullWidth
                                            options={inventoryItems}
                                            getOptionLabel={(option) => typeof option === 'string' ? option : option.itemName}
                                            value={inventoryItems.find(inv => inv._id === item.itemId) || item.description}
                                            onChange={(event, newValue) => {
                                                if (typeof newValue === 'string') handleLineItemChange(index, { target: { name: 'description', value: newValue } });
                                                else handleItemSelect(index, newValue ? newValue._id : '');
                                            }}
                                            renderInput={(params) => ( <TextField {...params} variant="standard" placeholder="Select or Type Item" /> )}
                                        />
                                        <Tooltip title="Add New Item">
                                            <IconButton onClick={() => handleOpenAddItemModal(index)} size="small" color="primary" sx={{ml: 1}}>
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell><TextField name="hsnSac" value={item.hsnSac} onChange={(e) => handleLineItemChange(index, e)} size="small" variant="standard" /></TableCell>
                                    <TableCell><TextField name="quantity" value={item.quantity} onChange={(e) => handleLineItemChange(index, e)} size="small" type="number" variant="standard" align="right" /></TableCell>
                                    <TableCell><TextField name="rate" value={item.rate} onChange={(e) => handleLineItemChange(index, e)} size="small" type="number" variant="standard" InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></TableCell>
                                    <TableCell sx={{ minWidth: 150 }}><FormControl fullWidth size="small" variant="standard"><Select name="taxId" value={item.taxId} onChange={(e) => handleLineItemChange(index, e)}><MenuItem value=""><em>None</em></MenuItem>{taxOptions.map(tax => (<MenuItem key={tax.id} value={tax.id}>{tax.name}</MenuItem>))}</Select></FormControl></TableCell>
                                    <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.cgstAmount || 0)}</TableCell>
                                    <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.sgstAmount || 0)}</TableCell>
                                    <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.igstAmount || 0)}</TableCell>
                                    <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.amount || 0)}</TableCell>
                                    <TableCell><IconButton onClick={() => removeLineItem(item.id)} size="small"><DeleteIcon fontSize="small" /></IconButton></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button startIcon={<AddIcon />} onClick={addLineItem} sx={{ mt: 1 }}>Add Item</Button>

                <Divider sx={{ my: 2.5 }} />
                <Grid container>
                    <Grid item xs={12} md={6}>
                       <TextField name="notes" label="Notes" value={invoiceData.notes} onChange={handleChange} fullWidth multiline rows={2} size="small" InputLabelProps={inputLabelProps} sx={{mb:2}}/>
                       <TextField name="termsAndConditions" label="Terms & Conditions" value={invoiceData.termsAndConditions} onChange={handleChange} fullWidth multiline rows={3} size="small" InputLabelProps={inputLabelProps}/>
                    </Grid>
                    <Grid item xs={12} md={6} container justifyContent="flex-end">
                        <Box sx={{width: '100%', maxWidth: '350px'}}>
                            <Grid container spacing={1}>
                                <Grid item xs={6}><Typography align="right">Subtotal:</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.subTotal)}</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">CGST:</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.cgstAmount)}</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">SGST:</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.sgstAmount)}</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">IGST:</Typography></Grid>
                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.igstAmount)}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="h6" align="right">Total:</Typography></Grid>
                                <Grid item xs={6}><Typography variant="h6" align="right">{formatCurrency(displayData.grandTotal)}</Typography></Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                 <Button variant="outlined" color="secondary" onClick={() => handleSave({ status: 'Draft' })} disabled={loading}>Save as Draft</Button>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={() => handleSave({ status: 'Saved', openPdf: true })} disabled={loading}>{loading ? <CircularProgress size={24}/> : "Save & Open PDF"}</Button>
            </Box>

            {/* Add Customer Modal */}
            <Dialog open={isAddCustomerModalOpen} onClose={handleCloseAddCustomerModal}>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <DialogContentText>Quickly add a customer to your records.</DialogContentText>
                    {newCustomerError && <Alert severity="error" sx={{mt: 1}}>{newCustomerError}</Alert>}
                    <TextField autoFocus margin="dense" name="displayName" label="Customer Name *" type="text" fullWidth variant="outlined" value={newCustomerData.displayName} onChange={handleNewCustomerDataChange}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddCustomerModal}>Cancel</Button>
                    <Button onClick={handleSaveNewCustomer} variant="contained" disabled={newCustomerLoading}>{newCustomerLoading ? <CircularProgress size={24}/> : "Save"}</Button>
                </DialogActions>
            </Dialog>

            {/* Add Item Modal */}
            <Dialog open={isAddItemModalOpen} onClose={handleCloseAddItemModal}>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>Quickly add an item to your inventory. More details can be added later.</DialogContentText>
                    {newItemError && <Alert severity="error" sx={{mt: 1}}>{newItemError}</Alert>}
                    <TextField autoFocus margin="dense" name="itemName" label="Item Name *" type="text" fullWidth variant="outlined" value={newItemData.itemName} onChange={handleNewItemChange}/>
                    <TextField margin="dense" name="salePrice" label="Sale Price *" type="number" fullWidth variant="outlined" value={newItemData.salePrice} onChange={handleNewItemChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}/>
                    <FormControl fullWidth margin="dense" size="small">
                        <InputLabel>GST Rate</InputLabel>
                        <Select name="gstRate" value={newItemData.gstRate} label="GST Rate" onChange={handleNewItemChange}>
                            <MenuItem value={0}><em>None</em></MenuItem>
                            {taxOptions.map(tax => (<MenuItem key={tax.id} value={tax.rate}>{tax.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddItemModal}>Cancel</Button>
                    <Button onClick={handleSaveNewItem} variant="contained" disabled={newItemLoading}>{newItemLoading ? <CircularProgress size={24}/> : "Save"}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CreateSalesInvoicePage;
