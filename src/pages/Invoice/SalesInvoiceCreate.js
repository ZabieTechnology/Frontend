import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Autocomplete,
    Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Switch, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tooltip, Menu, Link
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon,
    PersonAddAlt1 as PersonAddAlt1Icon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { format as formatDateFns, isValid as isValidDateFns, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

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
    discountPerItem: '0', // Can be '5%' or '100'
    taxId: '',
    taxRate: 0,
    cessRate: 0, // Ad valorem percentage
    cessAmount: 0, // Specific fixed amount per unit
    stockInHand: null,
    itemType: 'product',
};

const defaultThemeProfileData = {
    id: 'default_fallback_theme_profile', profileName: 'Default Fallback', isDefault: true, baseThemeName: "Modern", selectedColor: "#4CAF50",
    itemTableColumns: { pricePerItem: true, quantity: true, hsnSacCode: true, batchNo: false, expDate: false, mfgDate: false, discountPerItem: false, serialNo: false, showCess: false },
    taxDisplayMode: 'breakdown',
    customItemColumns: [], invoiceHeading: "TAX INVOICE", invoicePrefix: "INV-", invoiceSuffix: "", showPoNumber: true,
    customHeaderFields: [], upiId: "", upiQrCodeImageUrl: "", bankAccountId: '', showSaleAgentOnInvoice: false, showBillToSection: true, showShipToSection: true,
    signatureImageUrl: '', enableReceiverSignature: false, invoiceFooter: "", invoiceFooterImageUrl: "", termsAndConditionsId: 'Default T&C', notesDefault: "Thank you for your business!",
};

const initialGlobalSettingsData = {
    companyLogoUrl: "/images/default_logo.png", nextInvoiceNumber: 1, currency: "INR", state: "KL",
};

const getBaseInitialInvoiceData = (defaultTaxInfo = null, globalSettings = initialGlobalSettingsData, themeSettings = defaultThemeProfileData) => {
    const invoiceNumber = `${themeSettings.invoicePrefix || ''}${globalSettings.nextInvoiceNumber || ''}${themeSettings.invoiceSuffix || ''}`;
    return {
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date(),
        dueDate: new Date(),
        customerId: '',
        customerName: '',
        customerGstin: '',
        customerAddress: '',
        customerState: '',
        shipToAddress: '',
        poNumber: '',
        saleAgentName: '',
        lineItems: [{ ...minimalInitialLineItem, id: Date.now() + 1, quantity: 1, taxId: '', taxRate: 0 }],
        discountValue: '0',
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
const initialNewItemData = { itemName: '', salePrice: '', gstRate: 0, itemType: 'product' };


export default function SalesInvoiceCreate() {
    const { invoiceId } = useParams(); // Get invoiceId from URL for edit mode
    const location = useLocation(); // Get location to access state for copy/edit mode
    const isEditMode = !!invoiceId;
    const isCopyMode = !!location.state?.copiedInvoiceData;

    const [invoiceData, setInvoiceData] = useState(getBaseInitialInvoiceData(null, initialGlobalSettingsData, defaultThemeProfileData));
    const [allThemeProfiles, setAllThemeProfiles] = useState([]);
    const [selectedThemeProfileId, setSelectedThemeProfileId] = useState('');
    const [currentThemeSettings, setCurrentThemeSettings] = useState(defaultThemeProfileData);
    const [globalCompanySettings, setGlobalCompanySettings] = useState(initialGlobalSettingsData);
    const [supplierState, setSupplierState] = useState('');
    const [customerOptions, setCustomerOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedCustomerPaymentTerms, setSelectedCustomerPaymentTerms] = useState('');

    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState(initialNewCustomerData);
    const [newCustomerLoading, setNewCustomerLoading] = useState(false);
    const [newCustomerError, setNewCustomerError] = useState(null);

    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItemData, setNewItemData] = useState(initialNewItemData);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [newItemError, setNewItemError] = useState(null);
    const [currentItemIndex, setCurrentItemIndex] = useState(null);

    const [anchorEl, setAnchorEl] = useState(null);
    const [isThemeLocked, setIsThemeLocked] = useState(false);
    const open = Boolean(anchorEl);

    const [isStockWarningModalOpen, setIsStockWarningModalOpen] = useState(false);
    const [stockWarning, setStockWarning] = useState('');
    const [saveArgs, setSaveArgs] = useState(null);


    const title = isEditMode ? "Edit Sales Invoice" : (isCopyMode ? "Copy Sales Invoice" : "Create Sales Invoice");
    const titleStyle = { color: 'primary.main', fontWeight: 'bold' };
    const inputLabelProps = { shrink: true };
    const currencySymbol = formatCurrency(0, invoiceData.currency === 'INR' ? '₹' : '$').charAt(0);

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const calculateDueDate = useCallback((invoiceDate, paymentTerms) => {
        if (!invoiceDate || !isValidDateFns(new Date(invoiceDate))) {
            return new Date();
        }
        if (!paymentTerms || typeof paymentTerms !== 'string') {
            return new Date(invoiceDate);
        }
        const match = paymentTerms.match(/\d+/);
        if (match) {
            const days = parseInt(match[0], 10);
            return addDays(new Date(invoiceDate), days);
        }
        return new Date(invoiceDate);
    }, []);

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
            let allThemes = [defaultThemeProfileData];
            if (response.data) {
                currentGlobal = { ...initialGlobalSettingsData, ...(response.data.global || {}) };
                const savedThemes = Array.isArray(response.data.savedThemes) && response.data.savedThemes.length > 0 ? response.data.savedThemes : [defaultTheme];
                allThemes = savedThemes;
                setAllThemeProfiles(savedThemes);
                defaultTheme = savedThemes.find(t => t.isDefault) || savedThemes[0];
            }
            setGlobalCompanySettings(currentGlobal); setSupplierState(currentGlobal.state || '');
            setSelectedThemeProfileId(defaultTheme.id); setCurrentThemeSettings(defaultTheme);
            return { globalSettings: currentGlobal, defaultThemeToApply: defaultTheme, allThemes };
        } catch (err) {
            setCurrentThemeSettings(defaultThemeProfileData); setAllThemeProfiles([defaultThemeProfileData]);
            return { globalSettings: initialGlobalSettingsData, defaultThemeToApply: defaultThemeProfileData, allThemes: [defaultThemeProfileData] };
        }
    }, [API_BASE_URL]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setCustomerOptions(response.data.data.map(cust => ({ ...cust, id: cust._id, label: cust.displayName || cust.companyName, state: cust.billingAddress?.state || '', paymentTerms: cust.paymentTerms })));
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
            setLoadingSettings(true);
            setError(null);
            const taxes = await fetchTaxOptions();
            await fetchCustomers();
            await fetchInventoryItems();
            const { globalSettings, defaultThemeToApply, allThemes } = await fetchAllInvoiceSettings();

            const copiedInvoice = location.state?.copiedInvoiceData;

            if (isEditMode) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`);
                    const fetchedInvoice = response.data.data;
                    setInvoiceData({
                        ...fetchedInvoice,
                        customerId: fetchedInvoice.customer?._id || '',
                        invoiceDate: fetchedInvoice.invoiceDate ? parseISO(fetchedInvoice.invoiceDate) : new Date(),
                        dueDate: fetchedInvoice.dueDate ? parseISO(fetchedInvoice.dueDate) : new Date(),
                    });
                     const themeForInvoice = allThemes.find(t => t.id === fetchedInvoice.selectedThemeProfileId) || defaultThemeToApply;
                     setSelectedThemeProfileId(themeForInvoice.id);
                     setCurrentThemeSettings(themeForInvoice);
                } catch (err) {
                    setError("Failed to fetch invoice data for editing.");
                }
            } else if (copiedInvoice) {
                // Logic to handle a copied invoice
                // 1. Find the theme of the invoice being copied FIRST.
                const themeForInvoice = allThemes.find(t => t.id === copiedInvoice.selectedThemeProfileId) || defaultThemeToApply;

                // 2. Generate the new invoice number based on THAT theme's settings.
                // It will use the theme's own nextInvoiceNumber if it exists, otherwise fall back to the global one.
                const nextNumber = themeForInvoice.nextInvoiceNumber || globalSettings.nextInvoiceNumber;
                const newInvoiceNumber = `${themeForInvoice.invoicePrefix || ''}${nextNumber || ''}${themeForInvoice.invoiceSuffix || ''}`;

                // 3. Pre-populate with copied data but reset critical fields
                setInvoiceData({
                    ...copiedInvoice,
                    invoiceNumber: newInvoiceNumber,             // Use the correctly generated new invoice number
                    invoiceDate: new Date(),                     // Use today's date
                    dueDate: new Date(),                         // Use today's date (will be recalculated)
                    status: 'Draft',                             // Always start as a Draft
                    amountPaid: 0,                               // It's a new, unpaid invoice
                    _id: undefined,                              // IMPORTANT: Remove the old ID
                    id: undefined,                               // IMPORTANT: Remove the old ID
                    // Ensure line items also get new unique keys for React rendering and no old DB IDs
                    lineItems: copiedInvoice.lineItems.map(item => ({
                        ...item,
                        id: Date.now() + Math.random(), // New unique key for React
                        _id: undefined                  // Remove DB ID from line item
                    })),
                    // Ensure customerId is correctly mapped if customer object exists
                    customerId: copiedInvoice.customer?._id || copiedInvoice.customerId,
                    // Ensure the theme is correctly set on the new invoice data object
                    selectedThemeProfileId: themeForInvoice.id,
                });

                 // 4. Set the active theme for the UI
                 setSelectedThemeProfileId(themeForInvoice.id);
                 setCurrentThemeSettings(themeForInvoice);
            } else {
                // Logic for a brand new, blank invoice
                const defaultTax = taxes.find(t => t.isDefaultLineItemTax) || taxes[0] || {id: '', rate: 0};
                setInvoiceData(getBaseInitialInvoiceData(defaultTax, globalSettings, defaultThemeToApply));
            }
            setLoadingSettings(false);
        };
        loadInitialData();
    }, [isEditMode, invoiceId, location.state, API_BASE_URL, fetchTaxOptions, fetchAllInvoiceSettings, fetchCustomers, fetchInventoryItems]);


    useEffect(() => {
        const selectedCustomer = customerOptions.find(c => c._id === invoiceData.customerId);
        const paymentTerms = selectedCustomer ? selectedCustomer.paymentTerms : null;

        setSelectedCustomerPaymentTerms(paymentTerms || '');

        const newDueDate = calculateDueDate(invoiceData.invoiceDate, paymentTerms);

        if (invoiceData.dueDate?.getTime() !== newDueDate.getTime()) {
            setInvoiceData(prev => ({ ...prev, dueDate: newDueDate }));
        }
    }, [invoiceData.customerId, invoiceData.invoiceDate, invoiceData.dueDate, customerOptions, calculateDueDate]);

    useEffect(() => {
        const isAnyItemEntered = invoiceData.lineItems.some(
            item => item.itemId || (item.description && item.description.trim() !== '')
        );
        setIsThemeLocked(isAnyItemEntered);
    }, [invoiceData.lineItems]);


    const calculatedInvoiceData = useMemo(() => {
        const taxMode = currentThemeSettings?.taxDisplayMode || 'breakdown';

        let subTotal = 0;
        let totalLineItemDiscount = 0;
        const itemsWithInitialCalcs = invoiceData.lineItems.map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const itemSubTotal = qty * rate;
            subTotal += itemSubTotal;

            let itemDiscountAmount = 0;
            const discountStr = String(item.discountPerItem || '0');
            if (discountStr.includes('%')) {
                const percentage = parseFloat(discountStr.replace('%', '')) || 0;
                itemDiscountAmount = (itemSubTotal * percentage) / 100;
            } else {
                itemDiscountAmount = parseFloat(discountStr) || 0;
            }
            totalLineItemDiscount += itemDiscountAmount;

            const itemTaxableValue = itemSubTotal - itemDiscountAmount;

            return { ...item, itemTaxableValue, qty };
        });

        const subTotalAfterLineItemDiscounts = subTotal - totalLineItemDiscount;

        const overallDiscountValueStr = String(invoiceData.discountValue || '0');
        let overallDiscountAmount = 0;
        if (overallDiscountValueStr.includes('%')) {
            const percentage = parseFloat(overallDiscountValueStr.replace('%', '')) || 0;
            overallDiscountAmount = (subTotalAfterLineItemDiscounts * percentage) / 100;
        } else {
            overallDiscountAmount = parseFloat(overallDiscountValueStr) || 0;
        }

        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        let totalCess = 0;

        const finalLineItems = itemsWithInitialCalcs.map(item => {
            const proratedOverallDiscount = subTotalAfterLineItemDiscounts > 0
                ? (item.itemTaxableValue / subTotalAfterLineItemDiscounts) * overallDiscountAmount
                : 0;

            const finalItemTaxableValue = item.itemTaxableValue - proratedOverallDiscount;

            const taxRate = taxMode === 'no_tax' ? 0 : (parseFloat(item.taxRate) || 0);

            let cgstAmount = 0;
            let sgstAmount = 0;
            let igstAmount = 0;

            if (taxRate > 0) {
                const supState = supplierState?.trim().toLowerCase();
                const custState = invoiceData.customerState?.trim().toLowerCase();

                if (!custState || (supState && custState === supState)) {
                    cgstAmount = (finalItemTaxableValue * (taxRate / 2)) / 100;
                    sgstAmount = (finalItemTaxableValue * (taxRate / 2)) / 100;
                } else {
                    igstAmount = (finalItemTaxableValue * taxRate) / 100;
                }
            }

            const adValoremCess = (finalItemTaxableValue * (parseFloat(item.cessRate) || 0)) / 100;
            const specificCess = (parseFloat(item.cessAmount) || 0) * item.qty;
            const totalItemCess = adValoremCess + specificCess;

            totalCgst += cgstAmount;
            totalSgst += sgstAmount;
            totalIgst += igstAmount;
            totalCess += totalItemCess;

            const itemTaxAmount = cgstAmount + sgstAmount + igstAmount;
            const itemTotal = finalItemTaxableValue + itemTaxAmount + totalItemCess;

            return {
                ...item,
                taxableValue: finalItemTaxableValue.toFixed(2),
                taxAmount: itemTaxAmount.toFixed(2),
                amount: itemTotal.toFixed(2),
                cgstAmount: cgstAmount.toFixed(2),
                sgstAmount: sgstAmount.toFixed(2),
                igstAmount: igstAmount.toFixed(2),
                cessAmountCalculated: totalItemCess.toFixed(2),
            };
        });

        const totalTax = totalCgst + totalSgst + totalIgst;
        const finalTaxableAmount = subTotalAfterLineItemDiscounts - overallDiscountAmount;
        const grandTotal = finalTaxableAmount + totalTax + totalCess;
        const balanceDue = grandTotal - (parseFloat(invoiceData.amountPaid) || 0);
        const totalDiscountAmount = totalLineItemDiscount + overallDiscountAmount;

        return {
            ...invoiceData,
            lineItems: finalLineItems,
            subTotal: subTotal.toFixed(2),
            taxableAmount: finalTaxableAmount.toFixed(2),
            taxTotal: totalTax.toFixed(2),
            cgstAmount: totalCgst.toFixed(2),
            sgstAmount: totalSgst.toFixed(2),
            igstAmount: totalIgst.toFixed(2),
            overallCessAmount: totalCess.toFixed(2),
            discountAmountCalculated: totalDiscountAmount.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            balanceDue: balanceDue.toFixed(2)
        };
    }, [invoiceData, supplierState, currentThemeSettings]);

    const handleThemeChange = (event) => {
        const themeId = event.target.value;
        const newTheme = allThemeProfiles.find(t => t.id === themeId);
        if (newTheme) {
            setSelectedThemeProfileId(themeId);
            setCurrentThemeSettings(newTheme);
            setInvoiceData(prev => ({
                ...prev,
                invoiceNumber: isEditMode ? prev.invoiceNumber : `${newTheme.invoicePrefix || ''}${globalCompanySettings.nextInvoiceNumber || ''}${newTheme.invoiceSuffix || ''}`,
                notes: newTheme.notesDefault || "",
                termsAndConditions: newTheme.termsAndConditionsId || "",
                bankAccountId: newTheme.bankAccountId || '',
                selectedThemeProfileId: newTheme.id,
            }));
        }
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setInvoiceData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCustomerChange = (event, value) => {
        if (value) {
            setInvoiceData(prev => ({
                ...prev,
                customerId: value._id,
                customerName: value.label,
                customerGstin: value.gstNo || '',
                customerAddress: value.billingAddress?.street || '',
                customerState: value.billingAddress?.state || '',
                shipToAddress: value.shippingAddress?.street || value.billingAddress?.street || '',
            }));
        } else {
            setInvoiceData(prev => ({
                ...prev,
                customerId: '',
                customerName: '',
                customerGstin: '',
                customerAddress: '',
                customerState: '',
                shipToAddress: '',
            }));
        }
    };

    const handleDateChange = (name, dateString) => {
        if (!dateString) {
            setInvoiceData(prev => ({ ...prev, [name]: null }));
            return;
        }
        const [year, month, day] = dateString.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);

        if (isValidDateFns(newDate)) {
            setInvoiceData(prev => ({ ...prev, [name]: newDate }));
        }
    };

    const handleItemSelect = (index, selectedItem) => {
        if (!selectedItem) return;
        const updatedLineItems = invoiceData.lineItems.map((item, i) => {
            if (i === index) {
                const matchingTax = taxOptions.find(tax => tax.rate === selectedItem.gstRate);
                const newQuantity = (parseFloat(item.quantity) || 0) > 0 ? item.quantity : 1;
                return {
                    ...item,
                    itemId: selectedItem._id,
                    description: selectedItem.itemName,
                    hsnSac: selectedItem.hsnCode || '',
                    rate: selectedItem.salePrice || 0,
                    taxId: matchingTax ? matchingTax.id : '',
                    taxRate: selectedItem.gstRate || 0,
                    stockInHand: selectedItem.stockInHand,
                    quantity: newQuantity,
                    cessRate: selectedItem.cessRate || 0,
                    cessAmount: selectedItem.cessAmount || 0,
                    itemType: selectedItem.itemType,
                };
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
                if (name === 'description') {
                    updatedItem.itemId = '';
                    updatedItem.stockInHand = null;
                    updatedItem.itemType = 'service';
                }
                return updatedItem;
            }
            return item;
        });
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const handleItemClear = (index) => {
        const updatedLineItems = invoiceData.lineItems.map((item, i) => {
            if (i === index) {
                return {
                    ...minimalInitialLineItem,
                    id: item.id,
                    itemId: '',
                    description: '',
                    hsnSac: '',
                    quantity: '',
                    rate: 0,
                    discountPerItem: '0',
                    taxId: '',
                    taxRate: 0,
                    cessRate: 0,
                    cessAmount: 0,
                    stockInHand: null,
                    itemType: 'product',
                };
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
        const lineIndex = invoiceData.lineItems.findIndex(item => item.id === id);
        if (lineIndex === -1) return;

        if (invoiceData.lineItems.length <= 1) {
            handleItemClear(lineIndex);
        } else {
            setInvoiceData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) }));
        }
    };

    const handleOpenAddCustomerModal = () => setIsAddCustomerModalOpen(true);
    const handleCloseAddCustomerModal = () => { setIsAddCustomerModalOpen(false); setNewCustomerData(initialNewCustomerData); setNewCustomerError(null); };
    const handleNewCustomerDataChange = (event) => { const { name, value } = event.target; setNewCustomerData(prev => ({ ...prev, [name]: value })); };

    const handleSaveNewCustomer = async () => {
        if (!newCustomerData.displayName || newCustomerData.displayName.trim() === "") {
            setNewCustomerError("Display Name is required.");
            return;
        }
        setNewCustomerLoading(true);
        setNewCustomerError(null);
        try {
            const customerPayload = {
                displayName: newCustomerData.displayName.trim(),
                paymentTerms: newCustomerData.paymentTerms,
            };

            const response = await axios.post(`${API_BASE_URL}/api/customers`, customerPayload, {
                withCredentials: true
            });

            if (response.data && response.data.data) {
                await fetchCustomers();
                const newCust = response.data.data;
                handleCustomerChange(null, { ...newCust, label: newCust.displayName, id: newCust._id });
                handleCloseAddCustomerModal();
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

    const handleItemTypeSwitchChange = (event) => {
        setNewItemData(prev => ({
            ...prev,
            itemType: event.target.checked ? 'service' : 'product'
        }));
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
                itemType: newItemData.itemType,
            };
            const response = await axios.post(`${API_BASE_URL}/api/inventory`, payload, { withCredentials: true });
            if (response.data && response.data.data) {
                const createdItem = response.data.data;
                handleCloseAddItemModal();
                await fetchInventoryItems();
                if (currentItemIndex !== null) {
                    handleItemSelect(currentItemIndex, createdItem);
                }
            }
        } catch (err) {
            setNewItemError(`Failed to save item: ${err.response?.data?.message || err.message}`);
        } finally {
            setNewItemLoading(false);
        }
    };

    const proceedWithSave = async (args, ignoreStockWarning = false) => {
        if (!args) return;
        const { status, openPdf } = args;

        setSaveInProgress(true);
        setError(null);
        const payload = { ...calculatedInvoiceData, status };

        if (ignoreStockWarning) {
            payload.ignoreStockWarning = true;
        }

        try {
            let response;
            if (isEditMode) {
                // UPDATE request - Changed from PUT to PATCH
                response = await axios.patch(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`, payload, { withCredentials: true });
            } else {
                // CREATE request (for new and copied invoices)
                response = await axios.post(`${API_BASE_URL}/api/sales-invoices`, payload, { withCredentials: true });
            }

            if (response.data && (response.data.data || response.status === 200)) {
                const savedInvoice = response.data.data || { ...payload, _id: invoiceId };
                setSuccessMessage(`Invoice ${savedInvoice.invoiceNumber} ${isEditMode ? 'updated' : 'saved'} successfully as ${status}.`);
                if (openPdf) window.open(`${API_BASE_URL}/api/sales-invoices/${savedInvoice._id}/pdf`, '_blank');
            }
        } catch (err) {
            setError(`Failed to save invoice: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaveInProgress(false);
            setIsStockWarningModalOpen(false);
        }
    };

    const handleSave = (args) => {
        const itemsWithInsufficientStock = [];
        calculatedInvoiceData.lineItems.forEach(lineItem => {
            const itemDetails = inventoryItems.find(inv => inv._id === lineItem.itemId);
            if (lineItem.itemType === 'product' && itemDetails) {
                const stockInHand = parseFloat(itemDetails.stockInHand) || 0;
                const quantityToSell = parseFloat(lineItem.quantity) || 0;
                if (quantityToSell > stockInHand) {
                    itemsWithInsufficientStock.push({
                        name: itemDetails.itemName,
                        requested: quantityToSell,
                        available: stockInHand
                    });
                }
            }
        });

        if (itemsWithInsufficientStock.length > 0 && !isEditMode) { // Stock check only for new/copied invoices
            const warningMessage = itemsWithInsufficientStock.map(item =>
                `${item.name} (Requested: ${item.requested}, Available: ${item.available})`
            ).join(', ');
            setStockWarning(`Warning: Insufficient stock for the following items: ${warningMessage}. Do you want to proceed anyway?`);
            setSaveArgs(args);
            setIsStockWarningModalOpen(true);
        } else {
            proceedWithSave(args, false);
        }
    };


    const handleCloseSuccessDialog = () => {
        setSuccessMessage('');
        // Clear the location state to prevent re-triggering copy mode on refresh
        navigate('/sales', { replace: true });
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSaveOptionClick = (status) => {
        handleMenuClose();
        handleSave({ status });
    };

    const renderDynamicTableHeaders = () => {
        if (!currentThemeSettings) return null;
        const { itemTableColumns, customItemColumns, taxDisplayMode } = currentThemeSettings;
        const headers = [];
        headers.push(<TableCell align="left" key="item" sx={{ width: '25%', minWidth: 200 }}>Item/Description</TableCell>);
        if (itemTableColumns?.hsnSacCode) headers.push(<TableCell align="left" key="hsn" sx={{ width: '8%' }}>HSN/SAC</TableCell>);

        customItemColumns?.forEach(col => {
            if (itemTableColumns?.[col.id]) {
                headers.push(<TableCell align="left" key={col.id} sx={{ width: '8%' }}>{col.name}</TableCell>);
            }
        });

        headers.push(<TableCell align="left" key="qty" sx={{ width: '5%' }}>Qty</TableCell>);
        headers.push(<TableCell align="left" key="rate" sx={{ width: '8%' }}>Rate</TableCell>);
        if (itemTableColumns?.discountPerItem) headers.push(<TableCell align="left" key="discount" sx={{ width: '8%' }}>Discount</TableCell>);

        if (taxDisplayMode !== 'no_tax') {
            headers.push(<TableCell align="left" key="tax" sx={{ width: '10%', minWidth: 120 }}>Tax</TableCell>);
        }

        if (taxDisplayMode === 'breakdown') {
            headers.push(<TableCell align="right" key="taxRate" sx={{ width: '5%' }}>Tax %</TableCell>);
            headers.push(<TableCell align="right" key="cgst" sx={{ width: '7%' }}>CGST</TableCell>);
            headers.push(<TableCell align="right" key="sgst" sx={{ width: '7%' }}>SGST</TableCell>);
            headers.push(<TableCell align="right" key="igst" sx={{ width: '7%' }}>IGST</TableCell>);
        }

        if (itemTableColumns?.showCess) {
            headers.push(<TableCell align="right" key="cessRate" sx={{ width: '7%' }}>Cess Rate</TableCell>);
            headers.push(<TableCell align="right" key="cessAmount" sx={{ width: '7%' }}>Cess Amt</TableCell>);
            headers.push(<TableCell align="right" key="cess" sx={{ width: '7%' }}>Cess</TableCell>);
        }

        headers.push(<TableCell align="right" key="total" sx={{ width: '10%' }}>Amount</TableCell>);
        headers.push(<TableCell align="center" key="actions" sx={{ width: '5%' }}></TableCell>);

        return <TableRow>{headers}</TableRow>;
    };

    const renderDynamicTableRows = () => {
        if (!currentThemeSettings) return null;
        const { itemTableColumns, customItemColumns, taxDisplayMode } = currentThemeSettings;

        return invoiceData.lineItems.map((item, index) => {
            const remainingStock = item.stockInHand !== null ? item.stockInHand - (parseFloat(item.quantity) || 0) : null;
            let stockColor = 'success.main';
            if (remainingStock !== null) {
                if (remainingStock < 0) {
                    stockColor = 'error.main';
                } else if (remainingStock <= 10) {
                    stockColor = 'warning.main';
                }
            }

            return (
                <TableRow key={item.id}>
                    <TableCell align="left">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Autocomplete
                                fullWidth
                                freeSolo
                                options={inventoryItems}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.itemName}
                                value={inventoryItems.find(inv => inv._id === item.itemId) || item.description}
                                onChange={(event, newValue) => {
                                    if (typeof newValue === 'string') {
                                        handleLineItemChange(index, { target: { name: 'description', value: newValue } });
                                    } else if (newValue) {
                                        handleItemSelect(index, newValue);
                                    } else {
                                        handleItemClear(index);
                                    }
                                }}
                                renderInput={(params) => (<TextField {...params} variant="standard" placeholder="Select or Type Item" />)}
                            />
                            <Tooltip title="Add New Item"><IconButton onClick={() => handleOpenAddItemModal(index)} size="small" color="primary" sx={{ml: 1}}><AddIcon /></IconButton></Tooltip>
                        </Box>
                    </TableCell>
                    {itemTableColumns?.hsnSacCode && <TableCell align="left"><TextField name="hsnSac" value={item.hsnSac || ''} onChange={(e) => handleLineItemChange(index, e)} size="small" variant="standard" sx={{width: '100%'}} /></TableCell>}
                    {customItemColumns?.map(col => itemTableColumns?.[col.id] && <TableCell align="left" key={col.id}><TextField name={col.id} value={item[col.id] || ''} onChange={(e) => handleLineItemChange(index, e)} size="small" variant="standard" sx={{width: '100%'}} /></TableCell>)}
                    <TableCell align="left">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <TextField name="quantity" value={item.quantity} onChange={(e) => handleLineItemChange(index, e)} size="small" type="number" variant="standard" inputProps={{ min: 0 }} sx={{width: '100%'}} />
                            {item.stockInHand !== null && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'white',
                                        backgroundColor: stockColor,
                                        borderRadius: '16px',
                                        padding: '2px 8px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        mt: 0.5,
                                        display: 'inline-block',
                                        textAlign: 'center',
                                    }}
                                >
                                    Stock: {item.stockInHand}
                                </Typography>
                            )}
                        </Box>
                    </TableCell>
                    <TableCell align="left"><TextField name="rate" value={item.rate} onChange={(e) => handleLineItemChange(index, e)} size="small" type="number" variant="standard" InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} sx={{width: '100%'}} /></TableCell>

                    {itemTableColumns?.discountPerItem && (
                        <TableCell align="left">
                            <TextField
                                name="discountPerItem"
                                value={item.discountPerItem}
                                onChange={(e) => handleLineItemChange(index, e)}
                                size="small"
                                variant="standard"
                                placeholder="e.g. 5% or 10"
                                sx={{ width: '100%' }}
                            />
                        </TableCell>
                    )}

                    {taxDisplayMode !== 'no_tax' && (
                        <TableCell align="left">
                            <FormControl fullWidth size="small" variant="standard">
                                <Select name="taxId" value={item.taxId} onChange={(e) => handleLineItemChange(index, e)}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {taxOptions.map(tax => (<MenuItem key={tax.id} value={tax.id}>{tax.name}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </TableCell>
                    )}

                    {taxDisplayMode === 'breakdown' && (
                        <>
                            <TableCell align="right">{calculatedInvoiceData.lineItems[index]?.taxRate || 0}%</TableCell>
                            <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.cgstAmount || 0, currencySymbol)}</TableCell>
                            <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.sgstAmount || 0, currencySymbol)}</TableCell>
                            <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.igstAmount || 0, currencySymbol)}</TableCell>
                        </>
                    )}
                    {itemTableColumns?.showCess && (
                        <>
                            <TableCell align="right">{item.cessRate || 0}%</TableCell>
                            <TableCell align="right">{formatCurrency(item.cessAmount || 0, currencySymbol)}</TableCell>
                            <TableCell align="right">
                                {formatCurrency(calculatedInvoiceData.lineItems[index]?.cessAmountCalculated || 0, currencySymbol)}
                            </TableCell>
                        </>
                    )}
                    <TableCell align="right">{formatCurrency(calculatedInvoiceData.lineItems[index]?.amount || 0, currencySymbol)}</TableCell>
                    <TableCell align="center"><IconButton onClick={() => removeLineItem(item.id)} size="small"><DeleteIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
            )
        });
    };

    if (loadingSettings) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    const displayData = calculatedInvoiceData;

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={titleStyle}>{title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={isThemeLocked}>
                        <InputLabel id="theme-select-label">Invoice Theme</InputLabel>
                        <Select
                            labelId="theme-select-label"
                            value={selectedThemeProfileId}
                            label="Invoice Theme"
                            onChange={handleThemeChange}
                        >
                            {allThemeProfiles.map(theme => (
                                <MenuItem key={theme.id} value={theme.id}>
                                    {theme.profileName}{theme.isDefault ? " (Default)" : ""}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        onClick={handleMenuClick}
                        endIcon={<ArrowDropDownIcon />}
                    >
                        Save
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => handleSaveOptionClick('Draft')}>Save as Draft</MenuItem>
                        <MenuItem onClick={() => handleSaveOptionClick('Review')}>Send for Approval</MenuItem>
                        <MenuItem onClick={() => handleSaveOptionClick('Approved')}>Save and Approve</MenuItem>
                    </Menu>
                    <IconButton onClick={() => navigate('/sales')}><ArrowBackIcon /></IconButton>
                </Box>
            </Paper>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Dialog open={!!successMessage} onClose={handleCloseSuccessDialog}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <DialogContentText>{successMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSuccessDialog} autoFocus>OK</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isStockWarningModalOpen} onClose={() => setIsStockWarningModalOpen(false)}>
                <DialogTitle>Stock Warning</DialogTitle>
                <DialogContent>
                    <DialogContentText>{stockWarning}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsStockWarningModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => proceedWithSave(saveArgs, true)} color="primary" variant="contained">
                        Proceed Anyway
                    </Button>
                </DialogActions>
            </Dialog>


            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Invoice Details</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={11} sm={5} md={4}>
                        <Autocomplete
                            options={customerOptions}
                            getOptionLabel={(option) => option.label || ""}
                            value={customerOptions.find(c => c._id === invoiceData.customerId) || null}
                            onChange={handleCustomerChange}
                            renderInput={(params) => <TextField {...params} label="Customer" size="small" required />}
                        />
                    </Grid>
                     <Grid item xs={1} sm={1}>
                        <Tooltip title="Add New Customer"><IconButton onClick={handleOpenAddCustomerModal} color="primary"><PersonAddAlt1Icon /></IconButton></Tooltip>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Invoice Number" fullWidth size="small" value={invoiceData.invoiceNumber} onChange={handleChange} name="invoiceNumber" disabled={isEditMode} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Invoice Date" type="date" value={isValidDateFns(invoiceData.invoiceDate) ? formatDateFns(new Date(invoiceData.invoiceDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('invoiceDate', e.target.value)} fullWidth size="small" InputLabelProps={inputLabelProps} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Due Date" type="date" value={isValidDateFns(invoiceData.dueDate) ? formatDateFns(new Date(invoiceData.dueDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('dueDate', e.target.value)} fullWidth size="small" InputLabelProps={inputLabelProps} /></Grid>
                    {selectedCustomerPaymentTerms && (
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="caption" display="block" color="textSecondary">
                                Payment Terms: {selectedCustomerPaymentTerms}
                            </Typography>
                        </Grid>
                    )}
                    {currentThemeSettings?.showPoNumber && <Grid item xs={12} sm={6} md={4}><TextField label="PO Number" name="poNumber" value={invoiceData.poNumber} onChange={handleChange} fullWidth size="small" /></Grid>}
                    {currentThemeSettings?.customHeaderFields?.map(field => (
                        <Grid item xs={12} sm={6} md={4} key={field.id}>
                            <TextField
                                name={field.id}
                                label={field.label}
                                type={field.type || 'text'}
                                value={invoiceData[field.id] || ''}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                            />
                        </Grid>
                    ))}
                    {currentThemeSettings?.showBillToSection && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" gutterBottom>Billing Address</Typography>
                            <Typography variant="body2" sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1, minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                                {invoiceData.customerAddress || 'Select a customer to see the billing address.'}
                            </Typography>
                        </Grid>
                    )}
                    {currentThemeSettings?.showShipToSection && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="shipToAddress"
                                label="Shipping Address"
                                value={invoiceData.shipToAddress}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                InputLabelProps={inputLabelProps}
                            />
                        </Grid>
                    )}
                </Grid>

                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" gutterBottom>Items</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead><>{renderDynamicTableHeaders()}</></TableHead>
                        <TableBody><>{renderDynamicTableRows()}</></TableBody>
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
                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.subTotal, currencySymbol)}</Typography></Grid>
                                <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <TextField
                                        name="discountValue"
                                        label="Discount"
                                        variant="standard"
                                        value={invoiceData.discountValue}
                                        onChange={handleChange}
                                        placeholder="e.g., 5% or 100"
                                        sx={{ width: '150px' }}
                                    />
                                </Grid>
                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.discountAmountCalculated, currencySymbol)}</Typography></Grid>
                                {currentThemeSettings?.taxDisplayMode !== 'no_tax' && (
                                    <>
                                        <Grid item xs={6}><Typography align="right" sx={{ fontWeight: 'bold' }}>Taxable Amount:</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(displayData.taxableAmount, currencySymbol)}</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">CGST:</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.cgstAmount, currencySymbol)}</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">SGST:</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.sgstAmount, currencySymbol)}</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">IGST:</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.igstAmount, currencySymbol)}</Typography></Grid>
                                        {currentThemeSettings?.itemTableColumns?.showCess && (
                                            <>
                                                <Grid item xs={6}><Typography align="right">Cess:</Typography></Grid>
                                                <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.overallCessAmount, currencySymbol)}</Typography></Grid>
                                            </>
                                        )}
                                    </>
                                )}
                                <Grid item xs={6}><Typography variant="h6" align="right">Total:</Typography></Grid>
                                <Grid item xs={6}><Typography variant="h6" align="right">{formatCurrency(displayData.grandTotal, currencySymbol)}</Typography></Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={isAddCustomerModalOpen} onClose={handleCloseAddCustomerModal}>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Quickly add a customer to your records.
                    </DialogContentText>
                    {newCustomerError && <Alert severity="error" sx={{ my: 1 }}>{newCustomerError}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        name="displayName"
                        label="Customer Name *"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newCustomerData.displayName}
                        onChange={handleNewCustomerDataChange}
                    />
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => window.open('/account-transaction/customer/new', '_blank', 'noopener,noreferrer')}
                            sx={{ textAlign: 'center' }}
                        >
                            + Add new customer
                        </Link>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddCustomerModal}>Cancel</Button>
                    <Button onClick={handleSaveNewCustomer} variant="contained" disabled={newCustomerLoading}>
                        {newCustomerLoading ? <CircularProgress size={24} /> : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddItemModalOpen} onClose={handleCloseAddItemModal}>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>Quickly add an item to your inventory. More details can be added later.</DialogContentText>
                    {newItemError && <Alert severity="error" sx={{mt: 1}}>{newItemError}</Alert>}

                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                        <Typography
                            onClick={() => setNewItemData(prev => ({ ...prev, itemType: 'product' }))}
                            sx={{ cursor: 'pointer', color: newItemData.itemType === 'product' ? 'primary.main' : 'text.secondary', fontWeight: newItemData.itemType === 'product' ? 'bold' : 'regular' }}
                        >
                            Product
                        </Typography>
                        <Switch
                            checked={newItemData.itemType === 'service'}
                            onChange={handleItemTypeSwitchChange}
                        />
                        <Typography
                            onClick={() => setNewItemData(prev => ({ ...prev, itemType: 'service' }))}
                            sx={{ cursor: 'pointer', color: newItemData.itemType === 'service' ? 'primary.main' : 'text.secondary', fontWeight: newItemData.itemType === 'service' ? 'bold' : 'regular' }}
                        >
                            Service
                        </Typography>
                    </Box>

                    <TextField autoFocus margin="dense" name="itemName" label="Item Name *" type="text" fullWidth variant="outlined" value={newItemData.itemName} onChange={handleNewItemChange}/>
                    <TextField margin="dense" name="salePrice" label="Sale Price *" type="number" fullWidth variant="outlined" value={newItemData.salePrice} onChange={handleNewItemChange} InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}/>

                    <FormControl fullWidth margin="dense" size="small">
                        <InputLabel>GST Rate</InputLabel>
                        <Select name="gstRate" value={newItemData.gstRate} label="GST Rate" onChange={handleNewItemChange}>
                            <MenuItem value={0}><em>None</em></MenuItem>
                            {taxOptions.map(tax => (<MenuItem key={tax.id} value={tax.rate}>{tax.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => window.open('/Inventory?action=new', '_blank', 'noopener,noreferrer')}
                            sx={{ textAlign: 'center' }}
                        >
                            + Add detailed item
                        </Link>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddItemModal}>Cancel</Button>
                    <Button onClick={handleSaveNewItem} variant="contained" disabled={newItemLoading}>{newItemLoading ? <CircularProgress size={24}/> : "Save"}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
