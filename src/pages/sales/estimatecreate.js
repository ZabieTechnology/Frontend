import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Autocomplete,
    Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Switch, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Menu, Link, Tooltip
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon,
    PersonAddAlt1 as PersonAddAlt1Icon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { format as formatDateFns, isValid as isValidDateFns, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Helper function to format currency amounts.
const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Defines the minimal structure for a new line item.
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

// Fallback theme data in case API calls fail.
const defaultThemeProfileData = {
    id: 'default_fallback_theme_profile', profileName: 'Default Fallback', isDefault: true, baseThemeName: "Modern", selectedColor: "#4CAF50",
    itemTableColumns: { pricePerItem: true, quantity: true, hsnSacCode: true, batchNo: false, expDate: false, mfgDate: false, discountPerItem: false, serialNo: false, showCess: false },
    taxDisplayMode: 'breakdown',
    customItemColumns: [], quotationHeading: "QUOTATION", quotationPrefix: "QUO-", quotationSuffix: "", showPoNumber: true,
    customHeaderFields: [], upiId: "", upiQrCodeImageUrl: "", bankAccountId: '', showSaleAgentOnQuotation: false, showBillToSection: true, showShipToSection: true,
    signatureImageUrl: '', enableReceiverSignature: false, quotationFooter: "", quotationFooterImageUrl: "", termsAndConditionsId: 'Default T&C', notesDefault: "Thank you for your inquiry!",
};

// Initial global settings for the company.
const initialGlobalSettingsData = {
    companyLogoUrl: "/images/default_logo.png", nextQuotationNumber: 1, currency: "INR", state: "KL",
};

// Generates the base structure for a new quotation.
const getBaseInitialQuotationData = (defaultTaxInfo = null, globalSettings = initialGlobalSettingsData, themeSettings = defaultThemeProfileData) => {
    const quotationNumber = `${themeSettings.quotationPrefix || ''}${globalSettings.nextQuotationNumber || ''}${themeSettings.quotationSuffix || ''}`;
    return {
        quotationNumber: quotationNumber,
        quotationDate: new Date(),
        expiryDate: addDays(new Date(), 15), // Quotations typically have an expiry date
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
        notes: themeSettings.notesDefault || "Thank you for your inquiry!",
        termsAndConditions: themeSettings.termsAndConditionsId || "Default T&C",
        currency: globalSettings.currency || 'INR',
        bankAccountId: themeSettings.bankAccountId || '',
        status: 'Draft',
        selectedThemeProfileId: themeSettings.id || null,
        overallCessAmount: 0,
    };
};

// Initial state for the "Add New Customer" modal.
const initialNewCustomerData = { displayName: '', paymentTerms: 'Due on Receipt' };
// Initial state for the "Add New Item" modal.
const initialNewItemData = { itemName: '', salePrice: '', gstRate: 0, itemType: 'product' };


export default function QuotationCreate() {
    const { quotationId } = useParams(); // Get quotationId from URL for edit mode
    const location = useLocation(); // Get location to access state for copy/edit mode
    const isEditMode = !!quotationId;
    const isCopyMode = !!location.state?.copiedQuotationData;

    // State management for quotation data and UI controls
    const [quotationData, setQuotationData] = useState(getBaseInitialQuotationData(null, initialGlobalSettingsData, defaultThemeProfileData));
    const [allThemeProfiles, setAllThemeProfiles] = useState([]);
    const [selectedThemeProfileId, setSelectedThemeProfileId] = useState('');
    const [currentThemeSettings, setCurrentThemeSettings] = useState(defaultThemeProfileData);
    const [globalCompanySettings, setGlobalCompanySettings] = useState(initialGlobalSettingsData);
    const [supplierState, setSupplierState] = useState('');
    const [customerOptions, setCustomerOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // State for "Add Customer" modal
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState(initialNewCustomerData);
    const [newCustomerLoading, setNewCustomerLoading] = useState(false);
    const [newCustomerError, setNewCustomerError] = useState(null);

    // State for "Add Item" modal
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [newItemData, setNewItemData] = useState(initialNewItemData);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [newItemError, setNewItemError] = useState(null);
    const [currentItemIndex, setCurrentItemIndex] = useState(null);

    // State for UI elements like menus and warnings
    const [anchorEl, setAnchorEl] = useState(null);
    const [isThemeLocked, setIsThemeLocked] = useState(false);
    const open = Boolean(anchorEl);

    // Dynamic title and styling based on mode (create, edit, copy)
    const title = isEditMode ? "Edit Quotation" : (isCopyMode ? "Copy Quotation" : "Create Quotation");
    const titleStyle = { color: 'primary.main', fontWeight: 'bold' };
    const inputLabelProps = { shrink: true };
    const currencySymbol = formatCurrency(0, quotationData.currency === 'INR' ? '₹' : '$').charAt(0);

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    // Fetches available tax rates from the API.
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

    // Fetches all quotation-related settings, including global settings and theme profiles.
    const fetchAllQuotationSettings = useCallback(async () => {
        try {
            // Assuming settings endpoint is generic or can be adapted
            const response = await axios.get(`${API_BASE_URL}/api/quotation-settings`, { withCredentials: true });
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
            // Fallback for quotation settings
            setCurrentThemeSettings(defaultThemeProfileData); setAllThemeProfiles([defaultThemeProfileData]);
            return { globalSettings: initialGlobalSettingsData, defaultThemeToApply: defaultThemeProfileData, allThemes: [defaultThemeProfileData] };
        }
    }, [API_BASE_URL]);

    // Fetches the list of customers for the autocomplete dropdown.
    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setCustomerOptions(response.data.data.map(cust => ({ ...cust, id: cust._id, label: cust.displayName || cust.companyName, state: cust.billingAddress?.state || '', paymentTerms: cust.paymentTerms })));
            }
        } catch (err) { console.error("Error fetching customers:", err); }
    }, [API_BASE_URL]);

    // Fetches the list of inventory items for the autocomplete dropdown.
    const fetchInventoryItems = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setInventoryItems(response.data.data);
            }
        } catch (err) { console.error("Error fetching inventory items:", err); }
    }, [API_BASE_URL]);

    // Main useEffect hook to load all necessary data on component mount or when mode changes.
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingSettings(true);
            setError(null);
            const taxes = await fetchTaxOptions();
            await fetchCustomers();
            await fetchInventoryItems();
            const { globalSettings, defaultThemeToApply, allThemes } = await fetchAllQuotationSettings();

            const copiedQuotation = location.state?.copiedQuotationData;

            if (isEditMode) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/quotations/${quotationId}`);
                    const fetchedQuotation = response.data.data;
                    setQuotationData({
                        ...fetchedQuotation,
                        customerId: fetchedQuotation.customer?._id || '',
                        quotationDate: fetchedQuotation.quotationDate ? parseISO(fetchedQuotation.quotationDate) : new Date(),
                        expiryDate: fetchedQuotation.expiryDate ? parseISO(fetchedQuotation.expiryDate) : new Date(),
                    });
                     const themeForQuotation = allThemes.find(t => t.id === fetchedQuotation.selectedThemeProfileId) || defaultThemeToApply;
                     setSelectedThemeProfileId(themeForQuotation.id);
                     setCurrentThemeSettings(themeForQuotation);
                } catch (err) {
                    setError("Failed to fetch quotation data for editing.");
                }
            } else if (copiedQuotation) {
                // Logic to handle a copied quotation
                const themeForQuotation = allThemes.find(t => t.id === copiedQuotation.selectedThemeProfileId) || defaultThemeToApply;
                const nextNumber = themeForQuotation.nextQuotationNumber || globalSettings.nextQuotationNumber;
                const newQuotationNumber = `${themeForQuotation.quotationPrefix || ''}${nextNumber || ''}${themeForQuotation.quotationSuffix || ''}`;

                setQuotationData({
                    ...copiedQuotation,
                    quotationNumber: newQuotationNumber,
                    quotationDate: new Date(),
                    expiryDate: addDays(new Date(), 15),
                    status: 'Draft',
                    _id: undefined,
                    id: undefined,
                    lineItems: copiedQuotation.lineItems.map(item => ({
                        ...item,
                        id: Date.now() + Math.random(),
                        _id: undefined
                    })),
                    customerId: copiedQuotation.customer?._id || copiedQuotation.customerId,
                    selectedThemeProfileId: themeForQuotation.id,
                });
                 setSelectedThemeProfileId(themeForQuotation.id);
                 setCurrentThemeSettings(themeForQuotation);
            } else {
                // Logic for a brand new, blank quotation
                const defaultTax = taxes.find(t => t.isDefaultLineItemTax) || taxes[0] || {id: '', rate: 0};
                setQuotationData(getBaseInitialQuotationData(defaultTax, globalSettings, defaultThemeToApply));
            }
            setLoadingSettings(false);
        };
        loadInitialData();
    }, [isEditMode, quotationId, location.state, API_BASE_URL, fetchTaxOptions, fetchAllQuotationSettings, fetchCustomers, fetchInventoryItems]);


    // Effect to lock the theme selector once an item has been added.
    useEffect(() => {
        const isAnyItemEntered = quotationData.lineItems.some(
            item => item.itemId || (item.description && item.description.trim() !== '')
        );
        setIsThemeLocked(isAnyItemEntered);
    }, [quotationData.lineItems]);

    // useMemo hook to perform all quotation calculations (subtotal, taxes, total, etc.).
    const calculatedQuotationData = useMemo(() => {
        const taxMode = currentThemeSettings?.taxDisplayMode || 'breakdown';

        let subTotal = 0;
        let totalLineItemDiscount = 0;
        const itemsWithInitialCalcs = quotationData.lineItems.map(item => {
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

        const overallDiscountValueStr = String(quotationData.discountValue || '0');
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
                const custState = quotationData.customerState?.trim().toLowerCase();

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
        const totalDiscountAmount = totalLineItemDiscount + overallDiscountAmount;

        return {
            ...quotationData,
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
        };
    }, [quotationData, supplierState, currentThemeSettings]);

    // Handles changing the quotation theme.
    const handleThemeChange = (event) => {
        const themeId = event.target.value;
        const newTheme = allThemeProfiles.find(t => t.id === themeId);
        if (newTheme) {
            setSelectedThemeProfileId(themeId);
            setCurrentThemeSettings(newTheme);
            setQuotationData(prev => ({
                ...prev,
                quotationNumber: isEditMode ? prev.quotationNumber : `${newTheme.quotationPrefix || ''}${globalCompanySettings.nextQuotationNumber || ''}${newTheme.quotationSuffix || ''}`,
                notes: newTheme.notesDefault || "",
                termsAndConditions: newTheme.termsAndConditionsId || "",
                bankAccountId: newTheme.bankAccountId || '',
                selectedThemeProfileId: newTheme.id,
            }));
        }
    };

    // Generic change handler for most form inputs.
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setQuotationData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Handles selecting a customer from the autocomplete dropdown.
    const handleCustomerChange = (event, value) => {
        if (value) {
            setQuotationData(prev => ({
                ...prev,
                customerId: value._id,
                customerName: value.label,
                customerGstin: value.gstNo || '',
                customerAddress: value.billingAddress?.street || '',
                customerState: value.billingAddress?.state || '',
                shipToAddress: value.shippingAddress?.street || value.billingAddress?.street || '',
            }));
        } else {
            setQuotationData(prev => ({
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

    // Handles date changes from date input fields.
    const handleDateChange = (name, dateString) => {
        if (!dateString) {
            setQuotationData(prev => ({ ...prev, [name]: null }));
            return;
        }
        const [year, month, day] = dateString.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);

        if (isValidDateFns(newDate)) {
            setQuotationData(prev => ({ ...prev, [name]: newDate }));
        }
    };

    // Handles selecting an item from the inventory autocomplete.
    const handleItemSelect = (index, selectedItem) => {
        if (!selectedItem) return;
        const updatedLineItems = quotationData.lineItems.map((item, i) => {
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
        setQuotationData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    // Handles changes to individual fields within a line item.
    const handleLineItemChange = (index, event) => {
        const { name, value } = event.target;

        const updatedLineItems = quotationData.lineItems.map((item, i) => {
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
        setQuotationData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    // Clears a line item, resetting it to its initial state.
    const handleItemClear = (index) => {
        const updatedLineItems = quotationData.lineItems.map((item, i) => {
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
        setQuotationData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    // Adds a new, empty line item to the quotation.
    const addLineItem = () => {
        const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || taxOptions[0] || {id: '', rate: 0};
        setQuotationData(prev => ({ ...prev, lineItems: [...prev.lineItems, { ...minimalInitialLineItem, id: Date.now(), taxId: defaultTax.id, taxRate: defaultTax.rate }] }));
    };

    // Removes a line item from the quotation.
    const removeLineItem = (id) => {
        const lineIndex = quotationData.lineItems.findIndex(item => item.id === id);
        if (lineIndex === -1) return;

        if (quotationData.lineItems.length <= 1) {
            handleItemClear(lineIndex);
        } else {
            setQuotationData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== id) }));
        }
    };

    // Handlers for the "Add New Customer" modal.
    const handleOpenAddCustomerModal = () => setIsAddCustomerModalOpen(true);
    const handleCloseAddCustomerModal = () => { setIsAddCustomerModalOpen(false); setNewCustomerData(initialNewCustomerData); setNewCustomerError(null); };
    const handleNewCustomerDataChange = (event) => { const { name, value } = event.target; setNewCustomerData(prev => ({ ...prev, [name]: value })); };

    // Saves the new customer to the database.
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

    // Handlers for the "Add New Item" modal.
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

    // Saves the new item to the inventory.
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

    // Core save logic that sends the quotation data to the API.
    const handleSave = async (args) => {
        const { status, openPdf } = args;

        setLoading(true);
        setError(null);
        const payload = { ...calculatedQuotationData, status };

        try {
            let response;
            if (isEditMode) {
                response = await axios.patch(`${API_BASE_URL}/api/quotations/${quotationId}`, payload, { withCredentials: true });
            } else {
                response = await axios.post(`${API_BASE_URL}/api/quotations`, payload, { withCredentials: true });
            }

            if (response.data && (response.data.data || response.status === 200)) {
                const savedQuotation = response.data.data || { ...payload, _id: quotationId };
                setSuccessMessage(`Quotation ${savedQuotation.quotationNumber} ${isEditMode ? 'updated' : 'saved'} successfully as ${status}.`);
                if (openPdf) window.open(`${API_BASE_URL}/api/quotations/${savedQuotation._id}/pdf`, '_blank');
            }
        } catch (err) {
            setError(`Failed to save quotation: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Closes the success dialog and navigates back to the quotations list.
    const handleCloseSuccessDialog = () => {
        setSuccessMessage('');
        navigate('/quotations', { replace: true });
    };

    // Handlers for the "Save" dropdown menu.
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

    // Renders table headers dynamically based on the selected theme's settings.
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

    // Renders table rows dynamically based on theme settings and quotation data.
    const renderDynamicTableRows = () => {
        if (!currentThemeSettings) return null;
        const { itemTableColumns, customItemColumns, taxDisplayMode } = currentThemeSettings;

        return quotationData.lineItems.map((item, index) => {
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
                            <TableCell align="right">{calculatedQuotationData.lineItems[index]?.taxRate || 0}%</TableCell>
                            <TableCell align="right">{formatCurrency(calculatedQuotationData.lineItems[index]?.cgstAmount || 0, currencySymbol)}</TableCell>
                            <TableCell align="right">{formatCurrency(calculatedQuotationData.lineItems[index]?.sgstAmount || 0, currencySymbol)}</TableCell>
                            <TableCell align="right">{formatCurrency(calculatedQuotationData.lineItems[index]?.igstAmount || 0, currencySymbol)}</TableCell>
                        </>
                    )}
                    {itemTableColumns?.showCess && (
                        <>
                            <TableCell align="right">{item.cessRate || 0}%</TableCell>
                            <TableCell align="right">{formatCurrency(item.cessAmount || 0, currencySymbol)}</TableCell>
                            <TableCell align="right">
                                {formatCurrency(calculatedQuotationData.lineItems[index]?.cessAmountCalculated || 0, currencySymbol)}
                            </TableCell>
                        </>
                    )}
                    <TableCell align="right">{formatCurrency(calculatedQuotationData.lineItems[index]?.amount || 0, currencySymbol)}</TableCell>
                    <TableCell align="center"><IconButton onClick={() => removeLineItem(item.id)} size="small"><DeleteIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
            )
        });
    };

    // Display a loading spinner while initial data is being fetched.
    if (loadingSettings) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    // Use the calculated data for display purposes.
    const displayData = calculatedQuotationData;

    // Main JSX for the component layout.
    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={titleStyle}>{title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={isThemeLocked}>
                        <InputLabel id="theme-select-label">Quotation Theme</InputLabel>
                        <Select
                            labelId="theme-select-label"
                            value={selectedThemeProfileId}
                            label="Quotation Theme"
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
                        disabled={loading}
                    >
                        {loading ? <CircularProgress color="inherit" size={24} /> : 'Save'}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => handleSaveOptionClick('Draft')}>Save as Draft</MenuItem>
                        <MenuItem onClick={() => handleSaveOptionClick('Sent')}>Save and Send</MenuItem>
                        <MenuItem onClick={() => handleSaveOptionClick('Approved')}>Save and Approve</MenuItem>
                    </Menu>
                    <IconButton onClick={() => navigate('/quotations')}><ArrowBackIcon /></IconButton>
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

            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Quotation Details</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={11} sm={5} md={4}>
                        <Autocomplete
                            options={customerOptions}
                            getOptionLabel={(option) => option.label || ""}
                            value={customerOptions.find(c => c._id === quotationData.customerId) || null}
                            onChange={handleCustomerChange}
                            renderInput={(params) => <TextField {...params} label="Customer" size="small" required />}
                        />
                    </Grid>
                     <Grid item xs={1} sm={1}>
                        <Tooltip title="Add New Customer"><IconButton onClick={handleOpenAddCustomerModal} color="primary"><PersonAddAlt1Icon /></IconButton></Tooltip>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Quotation Number" fullWidth size="small" value={quotationData.quotationNumber} onChange={handleChange} name="quotationNumber" disabled={isEditMode} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Quotation Date" type="date" value={isValidDateFns(quotationData.quotationDate) ? formatDateFns(new Date(quotationData.quotationDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('quotationDate', e.target.value)} fullWidth size="small" InputLabelProps={inputLabelProps} /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Expiry Date" type="date" value={isValidDateFns(quotationData.expiryDate) ? formatDateFns(new Date(quotationData.expiryDate), 'yyyy-MM-dd') : ''} onChange={(e) => handleDateChange('expiryDate', e.target.value)} fullWidth size="small" InputLabelProps={inputLabelProps} /></Grid>
                    {currentThemeSettings?.showPoNumber && <Grid item xs={12} sm={6} md={4}><TextField label="Reference Number" name="poNumber" value={quotationData.poNumber} onChange={handleChange} fullWidth size="small" /></Grid>}
                    {currentThemeSettings?.customHeaderFields?.map(field => (
                        <Grid item xs={12} sm={6} md={4} key={field.id}>
                            <TextField
                                name={field.id}
                                label={field.label}
                                type={field.type || 'text'}
                                value={quotationData[field.id] || ''}
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
                                {quotationData.customerAddress || 'Select a customer to see the billing address.'}
                            </Typography>
                        </Grid>
                    )}
                    {currentThemeSettings?.showShipToSection && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="shipToAddress"
                                label="Shipping Address"
                                value={quotationData.shipToAddress}
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
                       <TextField name="notes" label="Notes" value={quotationData.notes} onChange={handleChange} fullWidth multiline rows={2} size="small" InputLabelProps={inputLabelProps} sx={{mb:2}}/>
                       <TextField name="termsAndConditions" label="Terms & Conditions" value={quotationData.termsAndConditions} onChange={handleChange} fullWidth multiline rows={3} size="small" InputLabelProps={inputLabelProps}/>
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
                                        value={quotationData.discountValue}
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
}
