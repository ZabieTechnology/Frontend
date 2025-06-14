// src/pages/Accounting/CreateCreditNotePage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tooltip, Chip // Added Chip for consistency
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon,
    Palette as PaletteIcon, Payment as PaymentIcon, PersonAddAlt1 as PersonAddAlt1Icon,
    PictureAsPdf as PictureAsPdfIcon, ReceiptLong as ReceiptLongIcon // Icon for original invoice
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format as formatDateFns, isValid as isValidDateFns, startOfDay, addDays } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Constants and Utility Functions ---

const indianStates = [
    { code: "AN", name: "Andaman and Nicobar Islands" }, { code: "AP", name: "Andhra Pradesh" },
    { code: "AR", name: "Arunachal Pradesh" }, { code: "AS", name: "Assam" },
    { code: "BR", name: "Bihar" }, { code: "CH", name: "Chandigarh" },
    { code: "CT", name: "Chhattisgarh" }, { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { code: "DL", name: "Delhi" }, { code: "GA", name: "Goa" },
    { code: "GJ", name: "Gujarat" }, { code: "HR", name: "Haryana" },
    { code: "HP", name: "Himachal Pradesh" }, { code: "JK", name: "Jammu and Kashmir" },
    { code: "JH", name: "Jharkhand" }, { code: "KA", name: "Karnataka" },
    { code: "KL", name: "Kerala" }, { code: "LA", name: "Ladakh" },
    { code: "LD", name: "Lakshadweep" }, { code: "MP", name: "Madhya Pradesh" },
    { code: "MH", name: "Maharashtra" }, { code: "MN", name: "Manipur" },
    { code: "ML", name: "Meghalaya" }, { code: "MZ", name: "Mizoram" },
    { code: "NL", name: "Nagaland" }, { code: "OR", name: "Odisha" },
    { code: "PY", name: "Puducherry" }, { code: "PB", name: "Punjab" },
    { code: "RJ", name: "Rajasthan" }, { code: "SK", name: "Sikkim" },
    { code: "TN", name: "Tamil Nadu" }, { code: "TG", name: "Telangana" },
    { code: "TR", name: "Tripura" }, { code: "UP", name: "Uttar Pradesh" },
    { code: "UT", name: "Uttarakhand" }, { code: "WB", name: "West Bengal" }
];

const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const minimalInitialLineItem = {
    id: null, // Will be set when added
    description: '',
    hsnSac: '',
    quantity: 1,
    rate: 0,
    discountPerItem: 0, // Discount on this item
    taxId: '', // ID of the selected tax rate
    taxRate: 0, // Selected tax rate
    cessAmountPerItem: 0, // CESS per item
};

// Default theme settings, assuming they can be adapted or are generic enough for credit notes
const defaultThemeProfileData = {
    id: 'default_fallback_theme_profile',
    profileName: 'Default Fallback',
    isDefault: true,
    baseThemeName: "Modern",
    selectedColor: "#FF9800", // Adjusted color for credit note visual cue
    itemTableColumns: {
        pricePerItem: true, quantity: true, taxRate: true, taxPerItem: true,
        hsnSacCode: true, batchNo: false, expDate: false, mfgDate: false,
        discountPerItem: false, serialNo: false,
    },
    customItemColumns: [],
    invoiceHeading: "CREDIT NOTE", // Changed from TAX INVOICE
    invoicePrefix: "CN-", // Changed from INV-
    invoiceSuffix: "",
    invoiceDueAfterDays: 0, // Due date might be less relevant or mean 'credit effective date'
    showPoNumber: false, // PO Number might not be relevant for Credit Notes generally
    customHeaderFields: [],
    upiId: "",
    upiQrCodeImageUrl: "",
    bankAccountId: '',
    showSaleAgentOnInvoice: false,
    showBillToSection: true,
    showShipToSection: true, // This still exists in theme data, but UI will be removed
    signatureImageUrl: '',
    enableReceiverSignature: false,
    invoiceFooter: "",
    invoiceFooterImageUrl: "",
    termsAndConditionsId: 'Default T&C', // This still exists in theme data, but UI will be removed
    notesDefault: "Thank you for your business! This is a credit note.",
};

const initialGlobalSettingsData = {
    companyLogoUrl: "/images/default_logo.png",
    nextCreditNoteNumber: 1, // Changed from nextInvoiceNumber
    currency: "INR",
    state: "KL", // Supplier's state, crucial for tax calculation
};

// Base initial credit note data structure
const getBaseInitialCreditNoteData = (defaultTaxInfo = null, globalSettings = initialGlobalSettingsData, themeSettings = defaultThemeProfileData) => {
    return {
        creditNoteNumber: '', // Specific to credit note
        creditNoteDate: new Date(), // Specific to credit note
        referenceDate: new Date(), // Could be original invoice date or credit effective date
        originalInvoiceNumber: '', // New field: To link to the original sales invoice
        reasonForCredit: '',     // New field: Explanation for the credit note
        customerId: '',
        customerName: '',
        customerGstin: '',
        customerAddress: '',
        customerState: '', // Customer's state (Place of Supply)
        shipToAddress: '', // Data field still exists, UI removed
        // poNumber: '', // Typically not for credit notes, controlled by theme if needed
        saleAgentName: '',
        lineItems: [{
            ...minimalInitialLineItem,
            id: Date.now() + 1, // Unique ID for the first item
            taxId: defaultTaxInfo ? defaultTaxInfo.id : '',
            taxRate: defaultTaxInfo ? defaultTaxInfo.rate : 0,
        }],
        discountType: 'Percentage', // 'Percentage' or 'Fixed' overall discount
        discountValue: 0,
        // amountPaid: 0, // Not typically part of a credit note creation form
        notes: themeSettings.notesDefault || "Credit Note related notes.",
        termsAndConditions: themeSettings.termsAndConditionsId || "Default T&C", // Data field still exists, UI removed
        currency: globalSettings.currency || 'INR',
        bankAccountId: themeSettings.bankAccountId || '', // For company bank details if shown
        status: 'Draft',
        selectedThemeProfileId: themeSettings.id || null,
        overallCessAmount: 0, // Overall CESS for the entire credit note
    };
};

const initialNewCustomerData = { displayName: '', paymentTerms: 'Due on Receipt' };

// --- React Component ---
const CreateCreditNotePage = () => {
    // --- State Variables ---
    const [creditNoteData, setCreditNoteData] = useState(getBaseInitialCreditNoteData(null, initialGlobalSettingsData, defaultThemeProfileData));
    const [allThemeProfiles, setAllThemeProfiles] = useState([]);
    const [selectedThemeProfileId, setSelectedThemeProfileId] = useState('');
    const [currentThemeSettings, setCurrentThemeSettings] = useState(null);
    const [globalCompanySettings, setGlobalCompanySettings] = useState(initialGlobalSettingsData);
    const [supplierState, setSupplierState] = useState(''); // Supplier's state from global settings

    const [customerOptions, setCustomerOptions] = useState([]);
    const [taxOptions, setTaxOptions] = useState([]); // GST Rate options

    const [loading, setLoading] = useState(false); // For main form submission
    const [loadingSettings, setLoadingSettings] = useState(true); // For initial settings load
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [savedCreditNoteId, setSavedCreditNoteId] = useState(null); // To enable PDF generation

    // New Customer Modal State
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState(initialNewCustomerData);
    const [newCustomerLoading, setNewCustomerLoading] = useState(false);
    const [newCustomerError, setNewCustomerError] = useState(null);

    // --- Component Configuration ---
    const title = "Create Credit Note";
    const titleStyle = { color: 'warning.dark', fontWeight: 'bold' }; // Differentiate from invoice
    const inputLabelProps = { shrink: true }; // For MUI TextFields
    const currencySymbol = formatCurrency(0, creditNoteData.currency === 'INR' ? '₹' : '$').charAt(0);

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || ''; // Ensure this is configured

    // --- Data Fetching Callbacks ---
    const fetchTaxOptions = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gst-rates`, { withCredentials: true });
            let fetchedTaxes = [];
            if (response.data && Array.isArray(response.data.data)) {
                // Assuming credit notes use 'output' taxes similar to sales invoices
                fetchedTaxes = response.data.data
                    .filter(tax => tax.head && tax.head.toLowerCase().includes('output'))
                    .map(tax => ({
                        id: tax._id,
                        name: tax.taxName || `Tax @ ${parseFloat(tax.taxRate) || 0}%`,
                        rate: parseFloat(tax.taxRate) || 0,
                        isDefaultLineItemTax: tax.isDefaultLineItemTax || tax.isDefault || false
                    }));
            }
            if (fetchedTaxes.length > 0) {
                setTaxOptions(fetchedTaxes);
                return fetchedTaxes;
            } else {
                const fallbackTaxes = [{ id: "default_tax_0_id", name: "No Tax (Fallback)", rate: 0, isDefaultLineItemTax: true }];
                setTaxOptions(fallbackTaxes);
                console.warn("No 'output' tax rates found for credit notes, using fallback.");
                return fallbackTaxes;
            }
        } catch (err) {
            console.error("Error fetching tax options for credit note:", err);
            setError(prev => `${prev || ''}\nFailed to load tax options.`);
            const fallbackTaxes = [{ id: "default_tax_0_id", name: "No Tax (Error Fallback)", rate: 0, isDefaultLineItemTax: true }];
            setTaxOptions(fallbackTaxes);
            return fallbackTaxes;
        }
    }, [API_BASE_URL]);

    const fetchAllSettings = useCallback(async () => { // Renamed for clarity if settings are generic
        try {
            // Assuming the same settings endpoint provides necessary global and theme data
            const response = await axios.get(`${API_BASE_URL}/api/invoice-settings`, { withCredentials: true });
            let defaultThemeToApply = null;
            let currentGlobal = initialGlobalSettingsData;

            if (response.data) {
                const fullSettingsDoc = response.data;
                currentGlobal = { ...initialGlobalSettingsData, ...(fullSettingsDoc.global || {}) };
                // Adapt for credit note numbering if settings are shared with invoices
                if (fullSettingsDoc.global?.nextInvoiceNumber && !fullSettingsDoc.global?.nextCreditNoteNumber) {
                    currentGlobal.nextCreditNoteNumber = fullSettingsDoc.global.nextInvoiceNumber; // Example adaptation
                }
                setGlobalCompanySettings(currentGlobal);
                setSupplierState(currentGlobal.state || '');

                const savedThemes = Array.isArray(fullSettingsDoc.savedThemes) && fullSettingsDoc.savedThemes.length > 0
                    ? fullSettingsDoc.savedThemes
                    : [JSON.parse(JSON.stringify(defaultThemeProfileData))]; // Fallback to default theme
                setAllThemeProfiles(savedThemes);
                defaultThemeToApply = savedThemes.find(t => t.isDefault) || savedThemes[0];
            } else {
                setError(prev => `${prev || ''}\nFailed to load document settings.`);
                setAllThemeProfiles([JSON.parse(JSON.stringify(defaultThemeProfileData))]);
                defaultThemeToApply = JSON.parse(JSON.stringify(defaultThemeProfileData));
                setGlobalCompanySettings(initialGlobalSettingsData);
                setSupplierState(initialGlobalSettingsData.state || '');
            }

            if (defaultThemeToApply) {
                setSelectedThemeProfileId(defaultThemeToApply.id);
                setCurrentThemeSettings(defaultThemeToApply);
            } else {
                setError(prev => `${prev || ''}\nNo themes configured or default theme missing.`);
                setCurrentThemeSettings(JSON.parse(JSON.stringify(defaultThemeProfileData)));
            }
            return { globalSettings: currentGlobal, defaultThemeToApply };
        } catch (err) {
            console.error("Error fetching document settings:", err);
            setError(prev => `${prev || ''}\nFailed to load settings: ${err.response?.data?.message || err.message}`);
            setGlobalCompanySettings(initialGlobalSettingsData);
            setSupplierState(initialGlobalSettingsData.state || '');
            setAllThemeProfiles([JSON.parse(JSON.stringify(defaultThemeProfileData))]);
            return { globalSettings: initialGlobalSettingsData, defaultThemeToApply: JSON.parse(JSON.stringify(defaultThemeProfileData)) };
        }
    }, [API_BASE_URL]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setCustomerOptions(response.data.data.map(cust => ({
                    value: cust._id,
                    label: cust.displayName || cust.companyName || cust.primaryContact?.name || 'Unknown Customer',
                    gstin: cust.gstNo || '',
                    address: cust.billingAddress?.street && cust.billingAddress?.city
                        ? `${cust.billingAddress.street}${cust.billingAddress.street2 ? ', ' + cust.billingAddress.street2 : ''}, ${cust.billingAddress.city}, ${cust.billingAddress.state || ''} ${cust.billingAddress.zipCode || ''}`.trim()
                        : 'N/A',
                    state: cust.billingAddress?.state || ''
                })));
            }
        } catch (err) {
            console.error("Error fetching customers:", err);
            // Optionally set an error state here if critical
        }
    }, [API_BASE_URL]);

    // --- Effects ---
    useEffect(() => {
        // Load all initial data: taxes, settings, customers
        const loadInitialData = async () => {
            setLoadingSettings(true);
            setError(null);
            setSavedCreditNoteId(null); // Reset on load

            const fetchedTaxes = await fetchTaxOptions();
            const { globalSettings: fetchedGlobalSettings, defaultThemeToApply } = await fetchAllSettings();
            await fetchCustomers();

            if (defaultThemeToApply && fetchedGlobalSettings) {
                const defaultTaxForInit = fetchedTaxes.find(t => t.isDefaultLineItemTax) || (fetchedTaxes.length > 0 ? fetchedTaxes[0] : { id: '', rate: 0 });
                setCreditNoteData(getBaseInitialCreditNoteData(defaultTaxForInit, fetchedGlobalSettings, defaultThemeToApply));
            } else {
                // Fallback if settings or theme didn't load properly
                const fallbackTax = fetchedTaxes.find(t => t.isDefaultLineItemTax) || (fetchedTaxes.length > 0 ? fetchedTaxes[0] : { id: '', rate: 0 });
                setCreditNoteData(getBaseInitialCreditNoteData(fallbackTax, initialGlobalSettingsData, defaultThemeProfileData));
                setError(prev => `${prev || ''}\nUsing fallback settings for credit note form.`);
                setCurrentThemeSettings(JSON.parse(JSON.stringify(defaultThemeProfileData)));
            }
            setLoadingSettings(false);
        };
        loadInitialData();
    }, [fetchTaxOptions, fetchAllSettings, fetchCustomers]); // Dependencies for reloading initial data

    useEffect(() => {
        // Fetch bank details when theme changes or settings load
        const fetchBankDetails = async () => {
            const accountIdToFetch = currentThemeSettings?.bankAccountId;
            if (accountIdToFetch) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts/${accountIdToFetch}`, { withCredentials: true });
                    if (response.data) {
                        setCreditNoteData(prev => ({
                            ...prev,
                            bankDetails: {
                                name: response.data.name || "N/A",
                                accountNo: response.data.code || "N/A", // Assuming 'code' is account number
                                ifsc: response.data.ifscCode || "N/A",
                                fullDescription: response.data.description || ""
                            }
                        }));
                    }
                } catch (err) {
                    console.error(`Error fetching bank account details for ID ${accountIdToFetch}:`, err);
                    setCreditNoteData(prev => ({ ...prev, bankDetails: null }));
                }
            } else {
                setCreditNoteData(prev => ({ ...prev, bankDetails: null }));
            }
        };

        if (!loadingSettings && currentThemeSettings) {
            fetchBankDetails();
        }
    }, [currentThemeSettings, loadingSettings, API_BASE_URL]);

    // --- Event Handlers ---
    const handleThemeChange = (event) => {
        const themeId = event.target.value;
        const selectedTheme = allThemeProfiles.find(t => t.id === themeId);
        const currentGlobal = globalCompanySettings || initialGlobalSettingsData;
        const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || (taxOptions.length > 0 ? taxOptions[0] : { id: '', rate: 0 });

        if (selectedTheme) {
            setSelectedThemeProfileId(themeId);
            setCurrentThemeSettings(selectedTheme);
            setSavedCreditNoteId(null); // Reset saved ID when theme changes

            setCreditNoteData(prev => {
                const baseNewData = getBaseInitialCreditNoteData(defaultTax, currentGlobal, selectedTheme);
                // Preserve user-entered data that shouldn't be reset by theme change
                const preservedData = {
                    creditNoteNumber: prev.creditNoteNumber,
                    creditNoteDate: prev.creditNoteDate,
                    originalInvoiceNumber: prev.originalInvoiceNumber, // Preserve new field
                    reasonForCredit: prev.reasonForCredit,         // Preserve new field
                    customerId: prev.customerId,
                    customerName: prev.customerName,
                    customerGstin: prev.customerGstin,
                    customerAddress: prev.customerAddress,
                    customerState: prev.customerState,
                    shipToAddress: prev.shipToAddress,
                    saleAgentName: prev.saleAgentName,
                    lineItems: prev.lineItems.map(li => ({
                        ...li,
                        taxId: defaultTax ? defaultTax.id : li.taxId || '',
                        taxRate: defaultTax ? defaultTax.rate : li.taxRate || 0
                    })),
                    discountType: prev.discountType,
                    discountValue: prev.discountValue,
                    currency: currentGlobal.currency || 'INR',
                };
                // Preserve custom header field values
                const newCustomHeaderValues = (selectedTheme.customHeaderFields || []).reduce((acc, field) => {
                    acc[field.id] = prev[field.id] || '';
                    return acc;
                }, {});
                return { ...baseNewData, ...preservedData, ...newCustomHeaderValues, selectedThemeProfileId: selectedTheme.id };
            });
        }
    };

    // Memoized calculation for all credit note totals
    const calculatedCreditNoteData = useMemo(() => {
        if (!creditNoteData || !creditNoteData.lineItems || loadingSettings) {
            // Return a minimal structure if data isn't ready, to prevent errors
            const base = getBaseInitialCreditNoteData(null, globalCompanySettings, currentThemeSettings || defaultThemeProfileData);
            return {
                ...base,
                lineItems: base.lineItems.map(item => ({
                    ...item, taxableValue: '0.00', cgstAmount: '0.00', sgstAmount: '0.00',
                    igstAmount: '0.00', cessAmount: '0.00', taxAmount: '0.00', amount: '0.00'
                }))
            };
        }

        let newSubTotal = 0;
        let newTotalCgstAmount = 0;
        let newTotalSgstAmount = 0;
        let newTotalIgstAmount = 0;
        let newTotalPerItemCessAmount = 0; // Sum of CESS applied per item

        const updatedLineItems = creditNoteData.lineItems.map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const discount = parseFloat(item.discountPerItem) || 0; // Per-item discount
            const overallTaxRate = parseFloat(item.taxRate) || 0;
            const itemCess = parseFloat(item.cessAmountPerItem) || 0; // Per-item CESS

            const amountBeforeDiscount = qty * rate;
            const itemTaxableValue = amountBeforeDiscount - discount;

            let cgstRate = 0, sgstRate = 0, igstRate = 0;
            let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

            const supState = supplierState?.trim().toLowerCase(); // Supplier's state
            const custState = creditNoteData.customerState?.trim().toLowerCase(); // Customer's state (Place of Supply)

            if (supState && custState) { // Both states must be present for CGST/SGST/IGST logic
                if (supState === custState) { // Intra-state transaction
                    cgstRate = overallTaxRate / 2;
                    sgstRate = overallTaxRate / 2;
                    cgstAmount = (itemTaxableValue * cgstRate) / 100;
                    sgstAmount = (itemTaxableValue * sgstRate) / 100;
                } else { // Inter-state transaction
                    igstRate = overallTaxRate;
                    igstAmount = (itemTaxableValue * igstRate) / 100;
                }
            } else if (overallTaxRate > 0) { // Fallback if states are not defined, apply as IGST
                igstRate = overallTaxRate;
                igstAmount = (itemTaxableValue * igstRate) / 100;
                // console.warn("Supplier or Customer state missing, applying tax as IGST for item:", item.description);
            }

            const totalItemTax = cgstAmount + sgstAmount + igstAmount + itemCess;
            const totalItemAmount = itemTaxableValue + totalItemTax;

            newSubTotal += itemTaxableValue; // Subtotal is sum of taxable values of items
            newTotalCgstAmount += cgstAmount;
            newTotalSgstAmount += sgstAmount;
            newTotalIgstAmount += igstAmount;
            newTotalPerItemCessAmount += itemCess;

            return {
                ...item,
                taxableValue: itemTaxableValue.toFixed(2),
                cgstRate, sgstRate, igstRate,
                cgstAmount: cgstAmount.toFixed(2),
                sgstAmount: sgstAmount.toFixed(2),
                igstAmount: igstAmount.toFixed(2),
                cessAmount: itemCess.toFixed(2), // This is per-item CESS display
                taxAmount: totalItemTax.toFixed(2),
                amount: totalItemAmount.toFixed(2)
            };
        });

        const discountCalcType = creditNoteData.discountType; // Overall discount type
        const discountVal = parseFloat(creditNoteData.discountValue) || 0; // Overall discount value
        let calculatedOverallDiscountAmount = 0;
        if (discountCalcType === 'Percentage') {
            calculatedOverallDiscountAmount = (newSubTotal * discountVal) / 100;
        } else { // Fixed amount discount
            calculatedOverallDiscountAmount = discountVal;
        }

        const finalTaxableAmountAfterOverallDiscount = newSubTotal - calculatedOverallDiscountAmount;

        const overallCreditNoteCess = parseFloat(creditNoteData.overallCessAmount) || 0; // Overall CESS for entire credit note
        const finalTaxTotal = newTotalCgstAmount + newTotalSgstAmount + newTotalIgstAmount + newTotalPerItemCessAmount + overallCreditNoteCess;
        const finalGrandTotal = finalTaxableAmountAfterOverallDiscount + finalTaxTotal;
        // Balance Due and Amount Paid are not typically calculated for a credit note form in this manner

        return {
            ...creditNoteData, // Spread original data
            lineItems: updatedLineItems, // Overwrite with calculated items
            subTotal: newSubTotal.toFixed(2),
            discountAmountCalculated: calculatedOverallDiscountAmount.toFixed(2),
            taxableAmount: finalTaxableAmountAfterOverallDiscount.toFixed(2), // Taxable amount after overall discount
            cgstAmount: newTotalCgstAmount.toFixed(2),
            sgstAmount: newTotalSgstAmount.toFixed(2),
            igstAmount: newTotalIgstAmount.toFixed(2),
            cessAmount: (newTotalPerItemCessAmount + overallCreditNoteCess).toFixed(2), // Sum of item CESS and overall CESS
            taxTotal: finalTaxTotal.toFixed(2),
            grandTotal: finalGrandTotal.toFixed(2),
            // balanceDue: finalBalanceDue.toFixed(2), // Not applicable here
        };
    }, [creditNoteData, supplierState, loadingSettings, globalCompanySettings, currentThemeSettings]);


    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (name === "customerId") {
            const selectedCustomer = customerOptions.find(c => c.value === value);
            setCreditNoteData(prev => ({
                ...prev, customerId: value,
                customerName: selectedCustomer ? selectedCustomer.label : '',
                customerGstin: selectedCustomer ? selectedCustomer.gstin : '',
                customerAddress: selectedCustomer ? selectedCustomer.address : '',
                customerState: selectedCustomer ? selectedCustomer.state : '', // This is Place of Supply
                shipToAddress: prev.shipToAddress || (selectedCustomer ? selectedCustomer.address : ''), // Default shipTo
            }));
        } else if (name.startsWith("customHeader_")) { // For custom fields defined in theme
            setCreditNoteData(prev => ({ ...prev, [name]: value }));
        }
        else {
            setCreditNoteData(prev => ({ ...prev, [name]: type === 'checkbox' || type === 'switch' ? checked : value }));
        }
    };

    const handleDateChange = (name, date) => {
        const newDate = date && isValidDateFns(date) ? startOfDay(date) : null;
        setCreditNoteData(prev => ({ ...prev, [name]: newDate }));
        // For credit note, 'referenceDate' might not have a direct link to 'creditNoteDate' like 'dueDate' did for invoices.
        // Any specific logic for referenceDate based on creditNoteDate can be added here if needed.
    };

    const handleLineItemChange = (index, event) => {
        const { name, value } = event.target;
        const updatedLineItems = creditNoteData.lineItems.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [name]: value };
                if (name === "taxId") { // If tax rate selection changes
                    const selectedTax = taxOptions.find(t => t.id === value);
                    updatedItem.taxRate = selectedTax ? selectedTax.rate : 0;
                }
                // Add other specific parsing if needed, e.g., for quantity/rate to ensure numbers
                if (name === "quantity" || name === "rate" || name === "discountPerItem" || name === "cessAmountPerItem") {
                    // updatedItem[name] = parseFloat(value) || 0; // Ensure numeric values
                }
                return updatedItem;
            }
            return item;
        });
        setCreditNoteData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const addLineItem = () => {
        const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || (taxOptions.length > 0 ? taxOptions[0] : { id: '', rate: 0 });
        const newLineItemBase = {
            ...minimalInitialLineItem,
            id: Date.now(), // Unique ID for the new item
            taxId: defaultTax.id,
            taxRate: defaultTax.rate,
        };
        setCreditNoteData(prev => ({ ...prev, lineItems: [...prev.lineItems, newLineItemBase] }));
    };


    const removeLineItem = (idToRemove) => {
        if (creditNoteData.lineItems.length <= 1) {
            setError("At least one line item is required for the credit note.");
            setTimeout(() => setError(null), 3000); return;
        }
        setCreditNoteData(prev => ({ ...prev, lineItems: prev.lineItems.filter(item => item.id !== idToRemove) }));
    };

    // New Customer Modal Handlers
    const handleOpenAddCustomerModal = () => setIsAddCustomerModalOpen(true);
    const handleCloseAddCustomerModal = () => { setIsAddCustomerModalOpen(false); setNewCustomerData(initialNewCustomerData); setNewCustomerError(null); };
    const handleNewCustomerDataChange = (event) => { const { name, value } = event.target; setNewCustomerData(prev => ({ ...prev, [name]: value })); };

    const handleSaveNewCustomer = async () => {
        if (!newCustomerData.displayName || newCustomerData.displayName.trim() === "") {
            setNewCustomerError("Display Name is required."); return;
        }
        setNewCustomerLoading(true); setNewCustomerError(null);
        try {
            // Basic payload for new customer, adapt as needed for your API
            const customerPayload = {
                displayName: newCustomerData.displayName.trim(),
                paymentTerms: newCustomerData.paymentTerms, // Or a default
                primaryContact: { email: "", mobile: "" }, // Placeholder
                customerType: "Business" // Or a default
            };
            const response = await axios.post(`${API_BASE_URL}/api/customers`, customerPayload, { withCredentials: true });
            if (response.data && response.data.data) {
                const createdCustomer = response.data.data;
                handleCloseAddCustomerModal();
                await fetchCustomers(); // Refresh customer list
                // Auto-select the newly added customer
                setCreditNoteData(prev => ({
                    ...prev,
                    customerId: createdCustomer._id,
                    customerName: createdCustomer.displayName || createdCustomer.companyName || createdCustomer.primaryContact?.name,
                    customerGstin: createdCustomer.gstNo || '',
                    customerAddress: createdCustomer.billingAddress?.street ? `${createdCustomer.billingAddress.street}, ${createdCustomer.billingAddress.city}` : '',
                    customerState: createdCustomer.billingAddress?.state || '',
                    shipToAddress: prev.shipToAddress || (createdCustomer.billingAddress?.street ? `${createdCustomer.billingAddress.street}, ${createdCustomer.billingAddress.city}` : '')
                }));
                setSuccess("New customer added and selected!");
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setNewCustomerError("Customer created, but could not retrieve details. Please select from list.");
                await fetchCustomers(); // Still refresh list
                handleCloseAddCustomerModal();
            }
        } catch (err) {
            console.error("Error saving new customer:", err);
            setNewCustomerError(`Failed to save customer: ${err.response?.data?.message || err.message}`);
        } finally {
            setNewCustomerLoading(false);
        }
    };

    // Form Submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); setError(null); setSuccess(null); setSavedCreditNoteId(null);

        // Prepare payload, ensuring all numeric fields are parsed correctly
        const payload = {
            ...calculatedCreditNoteData, // Start with all calculated values
            creditNoteDate: calculatedCreditNoteData.creditNoteDate ? formatDateFns(new Date(calculatedCreditNoteData.creditNoteDate), 'yyyy-MM-dd') : null,
            referenceDate: calculatedCreditNoteData.referenceDate ? formatDateFns(new Date(calculatedCreditNoteData.referenceDate), 'yyyy-MM-dd') : null,
            lineItems: calculatedCreditNoteData.lineItems.map(item => ({
                ...item, // Spread item to keep all its properties
                quantity: parseFloat(item.quantity) || 0,
                rate: parseFloat(item.rate) || 0,
                discountPerItem: parseFloat(item.discountPerItem) || 0,
                taxRate: parseFloat(item.taxRate) || 0, // Already calculated, but ensure it's number
                cgstRate: parseFloat(item.cgstRate) || 0,
                sgstRate: parseFloat(item.sgstRate) || 0,
                igstRate: parseFloat(item.igstRate) || 0,
                cgstAmount: parseFloat(item.cgstAmount) || 0,
                sgstAmount: parseFloat(item.sgstAmount) || 0,
                igstAmount: parseFloat(item.igstAmount) || 0,
                cessAmount: parseFloat(item.cessAmountPerItem || item.cessAmount) || 0, // Use per-item CESS from input
                taxAmount: parseFloat(item.taxAmount) || 0,
                amount: parseFloat(item.amount) || 0,
                taxableValue: parseFloat(item.taxableValue) || 0,
            })),
            // Ensure top-level numeric fields are numbers
            subTotal: parseFloat(calculatedCreditNoteData.subTotal) || 0,
            discountValue: parseFloat(calculatedCreditNoteData.discountValue) || 0, // This is the input value
            discountAmountCalculated: parseFloat(calculatedCreditNoteData.discountAmountCalculated) || 0,
            taxableAmount: parseFloat(calculatedCreditNoteData.taxableAmount) || 0,
            cgstAmount: parseFloat(calculatedCreditNoteData.cgstAmount) || 0,
            sgstAmount: parseFloat(calculatedCreditNoteData.sgstAmount) || 0,
            igstAmount: parseFloat(calculatedCreditNoteData.igstAmount) || 0,
            cessAmount: parseFloat(calculatedCreditNoteData.cessAmount) || 0, // Total CESS
            taxTotal: parseFloat(calculatedCreditNoteData.taxTotal) || 0,
            grandTotal: parseFloat(calculatedCreditNoteData.grandTotal) || 0,
            // amountPaid is removed for credit note payload as it's not typical
        };

        // Add custom header fields to payload if they are marked for display
        currentThemeSettings?.customHeaderFields?.forEach(field => {
            if (field.displayOnInvoice && creditNoteData[field.id] !== undefined) { // Key "displayOnInvoice" from theme is reused
                payload[field.id] = creditNoteData[field.id];
            }
        });

        try {
            // IMPORTANT: Change API endpoint for saving credit notes
            const response = await axios.post(`${API_BASE_URL}/api/credit-notes`, payload, { withCredentials: true });
            setSuccess("Credit Note created successfully!");
            if (response.data && response.data.data && response.data.data._id) {
                const newCreditNoteId = response.data.data._id;
                setSavedCreditNoteId(newCreditNoteId); // Store ID for PDF generation
                // IMPORTANT: Change PDF endpoint for credit notes
                window.open(`${API_BASE_URL}/api/credit-notes/${newCreditNoteId}/pdf`, '_blank'); // Open PDF in new tab
            }
            // Reset form to initial state after successful save
            const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || (taxOptions.length > 0 ? taxOptions[0] : null);
            const baseNewCreditNoteData = getBaseInitialCreditNoteData(defaultTax, globalCompanySettings, currentThemeSettings || defaultThemeProfileData);
            setCreditNoteData(baseNewCreditNoteData);
        } catch (err) {
            console.error("Error saving credit note:", err);
            setError(`Failed to save credit note: ${err.response?.data?.message || err.message}`);
            setSavedCreditNoteId(null); // Clear saved ID on error
            setTimeout(() => setError(null), 5000); // Auto-hide error message
        } finally {
            setLoading(false);
        }
    };

    const handlePrintPdf = () => {
        if (savedCreditNoteId) {
            // IMPORTANT: Ensure this uses the correct PDF endpoint for credit notes
            window.open(`${API_BASE_URL}/api/credit-notes/${savedCreditNoteId}/pdf`, '_blank');
        } else {
            setError("Please save the credit note first to generate a PDF.");
            setTimeout(() => setError(null), 3000);
        }
    };

    // Memoized function to get visible columns for the items table based on theme settings
    const getVisibleColumnDetails = useCallback(() => {
        const columnDetails = [];
        const activeThemeItemCols = currentThemeSettings?.itemTableColumns || defaultThemeProfileData.itemTableColumns;
        const activeThemeCustomItems = currentThemeSettings?.customItemColumns || [];

        // Standard columns
        columnDetails.push({ key: 'description', label: 'Description', type: 'text', minWidth: '150px', cellSx: { pl: 0 } });
        if (activeThemeItemCols.hsnSacCode) columnDetails.push({ key: 'hsnSac', label: 'HSN/SAC', type: 'text', minWidth: '80px' });
        columnDetails.push({ key: 'quantity', label: 'Qty', type: 'number', props: { InputProps: { inputProps: { min: 0 } } }, minWidth: '60px', align: 'right' });
        columnDetails.push({ key: 'rate', label: 'Rate', type: 'number', props: { InputProps: { inputProps: { min: 0, step: "0.01" } } }, minWidth: '80px', align: 'right' });
        if (activeThemeItemCols.discountPerItem) columnDetails.push({ key: 'discountPerItem', label: 'Item Disc.', type: 'number', props: { InputProps: { inputProps: { min: 0, step: "0.01" } } }, minWidth: '80px', align: 'right' });

        // Tax selection and display columns
        columnDetails.push({ key: 'taxId', label: 'Tax Rate', type: 'select', minWidth: '150px' });
        columnDetails.push({ key: 'cgstAmount', label: 'CGST Amt', type: 'text', readOnly: true, minWidth: '80px', align: 'right' });
        columnDetails.push({ key: 'sgstAmount', label: 'SGST Amt', type: 'text', readOnly: true, minWidth: '80px', align: 'right' });
        columnDetails.push({ key: 'igstAmount', label: 'IGST Amt', type: 'text', readOnly: true, minWidth: '80px', align: 'right' });
        columnDetails.push({ key: 'cessAmountPerItem', label: 'Item CESS', type: 'number', props: { InputProps: { inputProps: { min: 0, step: "0.01" } } }, minWidth: '80px', align: 'right' });
        columnDetails.push({ key: 'taxAmount', label: 'Total Item Tax', type: 'text', readOnly: true, minWidth: '100px', align: 'right' });

        // Custom columns from theme
        (activeThemeCustomItems).forEach(colConfig => {
            if (activeThemeItemCols[colConfig.id]) { // Check if the custom column is enabled in theme
                const key = colConfig.id;
                if (!columnDetails.find(c => c.key === key)) { // Avoid duplicates if already added
                    columnDetails.push({
                        key: key,
                        label: colConfig.name,
                        type: colConfig.type || 'text',
                        minWidth: '100px', // Default, can be configured in theme
                        align: (colConfig.type === 'number') ? 'right' : 'left'
                    });
                }
            }
        });
        columnDetails.push({ key: 'amount', label: 'Item Total', type: 'text', readOnly: true, minWidth: '100px', align: 'right' });

        // Ensure no duplicate columns by key, prioritizing earlier definitions
        const uniqueColumnDetails = columnDetails.reduceRight((acc, current) => {
            if (!acc.find(item => item.key === current.key)) {
                acc.unshift(current);
            }
            return acc;
        }, []);
        return uniqueColumnDetails;
    }, [currentThemeSettings]);

    const visibleTableColumnDetails = getVisibleColumnDetails();

    // --- Render Logic ---
    if (loadingSettings || !currentThemeSettings || !globalCompanySettings) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    const displayData = calculatedCreditNoteData; // Use the memoized calculated data for rendering totals

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, md: 2 } }}>
                {/* Header: Title, Theme Selector, Back Button */}
                <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={titleStyle}>{title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {allThemeProfiles.length > 0 && (
                            <FormControl size="small" sx={{ minWidth: 180, mr: 2 }} variant="outlined">
                                <InputLabel id="theme-select-label">Document Theme</InputLabel>
                                <Select
                                    labelId="theme-select-label"
                                    id="theme-select"
                                    value={selectedThemeProfileId}
                                    label="Document Theme"
                                    onChange={handleThemeChange}
                                    startAdornment={<InputAdornment position="start"><PaletteIcon fontSize="small" /></InputAdornment>}
                                >
                                    {allThemeProfiles.map(theme => (
                                        <MenuItem key={theme.id} value={theme.id}>
                                            {theme.profileName} {theme.isDefault ? "(Default)" : ""}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <IconButton onClick={() => navigate('/credit-notes')} aria-label="back to credit notes list"> {/* Navigate to credit notes list */}
                            <ArrowBackIcon />
                        </IconButton>
                    </Box>
                </Paper>

                {/* Alerts for Error/Success */}
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

                {/* Info Alert for Supplier State (useful for debugging tax calcs) */}
                {!loadingSettings && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Supplier State (for tax calculation): <strong>
                            {supplierState
                                ? (indianStates.find(s => s.code === supplierState)?.name || supplierState)
                                : "Not Set/Empty - Tax calculations might be affected."
                            }
                        </strong>
                    </Alert>
                )}

                {/* Main Credit Note Form Paper */}
                <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Credit Note Details</Typography>
                    <Grid container spacing={2} alignItems="flex-start"> {/* alignItems="flex-start" for multi-line fields */}
                        {/* Customer Selection & Add Button */}
                        <Grid item xs={12} sm={5.5} md={3.5}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel shrink htmlFor="customer-select">Customer *</InputLabel>
                                <Select
                                    label="Customer *"
                                    name="customerId"
                                    value={creditNoteData.customerId}
                                    onChange={handleChange}
                                    inputProps={{ id: 'customer-select' }}
                                >
                                    <MenuItem value=""><em>Select Customer</em></MenuItem>
                                    {customerOptions.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={0.5} md={0.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { sm: '20px' } /* Align with text field's perceived center */ }}>
                            <Tooltip title="Add New Customer">
                                <IconButton onClick={handleOpenAddCustomerModal} color="primary" size="small"><PersonAddAlt1Icon /></IconButton>
                            </Tooltip>
                        </Grid>

                        {/* Place of Supply (Customer State) - Readonly */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Place of Supply (Customer State)"
                                value={indianStates.find(s => s.code === creditNoteData.customerState)?.name || creditNoteData.customerState || 'N/A'}
                                fullWidth size="small" InputLabelProps={inputLabelProps} disabled
                            />
                        </Grid>

                        {/* Credit Note Number */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Credit Note Number"
                                name="creditNoteNumber"
                                value={creditNoteData.creditNoteNumber}
                                onChange={handleChange}
                                fullWidth size="small" InputLabelProps={inputLabelProps}
                                placeholder={globalCompanySettings?.nextCreditNoteNumber
                                    ? `Next: ${currentThemeSettings?.invoicePrefix || 'CN-'}${globalCompanySettings.nextCreditNoteNumber}${currentThemeSettings?.invoiceSuffix || ''}`
                                    : "Auto-generated or Manual"}
                            />
                        </Grid>

                        {/* Credit Note Date */}
                        <Grid item xs={12} sm={6} md={4}>
                            <DatePicker
                                label="Credit Note Date *"
                                value={isValidDateFns(creditNoteData.creditNoteDate) ? new Date(creditNoteData.creditNoteDate) : null}
                                onChange={(date) => handleDateChange('creditNoteDate', date)}
                                slotProps={{ textField: { fullWidth: true, size: 'small', required: true, InputLabelProps: inputLabelProps } }}
                            />
                        </Grid>

                        {/* Reference Date (e.g., Original Invoice Date) */}
                        <Grid item xs={12} sm={6} md={4}>
                            <DatePicker
                                label="Reference Date"
                                value={isValidDateFns(creditNoteData.referenceDate) ? new Date(creditNoteData.referenceDate) : null}
                                onChange={(date) => handleDateChange('referenceDate', date)}
                                slotProps={{ textField: { fullWidth: true, size: 'small', InputLabelProps: inputLabelProps } }}
                            />
                        </Grid>

                        {/* Original Invoice Number - NEW FIELD */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                label="Original Invoice Number"
                                name="originalInvoiceNumber"
                                value={creditNoteData.originalInvoiceNumber}
                                onChange={handleChange}
                                fullWidth size="small" InputLabelProps={inputLabelProps}
                                InputProps={{ startAdornment: <InputAdornment position="start"><ReceiptLongIcon fontSize="small" /></InputAdornment> }}
                                placeholder="e.g., INV-2023-001"
                            />
                        </Grid>

                        {/* Optional PO Number (if theme enables it) */}
                        {currentThemeSettings?.showPoNumber && (
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label="PO Number (If Applicable)" name="poNumber" value={creditNoteData.poNumber || ''} onChange={handleChange} fullWidth size="small" InputLabelProps={inputLabelProps} />
                            </Grid>
                        )}

                        {/* Custom Header Fields from Theme */}
                        {currentThemeSettings?.customHeaderFields?.map(field => field.displayOnInvoice && ( // Reusing 'displayOnInvoice' flag
                            <Grid item xs={12} sm={6} md={4} key={field.id}>
                                <TextField label={field.label} name={field.id} value={creditNoteData[field.id] || ''} onChange={handleChange} fullWidth size="small" InputLabelProps={inputLabelProps} />
                            </Grid>
                        ))}

                        {/* Optional Sale Agent */}
                        {currentThemeSettings?.showSaleAgentOnInvoice && (
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField label="Sale Agent" name="saleAgentName" value={creditNoteData.saleAgentName} onChange={handleChange} fullWidth size="small" InputLabelProps={inputLabelProps} placeholder="Enter sale agent name" />
                            </Grid>
                        )}

                        {/* Reason for Credit - NEW FIELD, larger */}
                        <Grid item xs={12} md={8}> {/* Takes more horizontal space */}
                            <TextField
                                label="Reason for Credit *"
                                name="reasonForCredit"
                                value={creditNoteData.reasonForCredit}
                                onChange={handleChange}
                                fullWidth multiline rows={2} size="small" InputLabelProps={inputLabelProps}
                                placeholder="e.g., Goods returned, price adjustment, service cancellation etc."
                                required
                            />
                        </Grid>
                    </Grid>

                    {/* Bill To / Ship To Sections */}
                    {currentThemeSettings?.showBillToSection && <Divider sx={{ my: 2.5 }} />}
                    <Grid container spacing={2}>
                        {currentThemeSettings?.showBillToSection && (
                            <Grid item xs={12} md={12}> {/* Bill To takes full width if Ship To is removed */}
                                <Typography variant="subtitle1" gutterBottom>Bill To:</Typography>
                                <Typography variant="body2" color="textSecondary">Name: {creditNoteData.customerName || 'N/A'}</Typography>
                                <Typography variant="body2" color="textSecondary">GSTIN: {creditNoteData.customerGstin || 'N/A'}</Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>Address: {creditNoteData.customerAddress || 'N/A'}</Typography>
                                <Typography variant="body2" color="textSecondary">State: {indianStates.find(s => s.code === creditNoteData.customerState)?.name || creditNoteData.customerState || 'N/A'}</Typography>
                            </Grid>
                        )}
                        {/* Ship To Section Removed */}
                    </Grid>

                    {/* Items Table Section */}
                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="h6" gutterBottom>Items Being Credited</Typography>
                    <TableContainer>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
                            <TableHead>
                                <TableRow>
                                    {visibleTableColumnDetails.map(col => (
                                        <TableCell key={col.key} align={col.align || 'left'} sx={{ fontWeight: 'bold', minWidth: col.minWidth, ...(col.cellSx || {}) }}>
                                            {col.label}
                                        </TableCell>
                                    ))}
                                    <TableCell align="right" sx={{ width: '50px' }}></TableCell>{/* For Delete Icon */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {creditNoteData.lineItems.map((item, index) => {
                                    const calculatedItem = displayData.lineItems.find(ci => ci.id === item.id) || {}; // Get calculated values for this item
                                    return (
                                        <TableRow key={item.id}>
                                            {visibleTableColumnDetails.map(col => {
                                                // Tax ID (Dropdown)
                                                if (col.key === 'taxId') {
                                                    return (
                                                        <TableCell key={col.key} sx={{ minWidth: col.minWidth || '120px' }}>
                                                            <FormControl fullWidth size="small" variant="standard">
                                                                <Select name="taxId" value={item.taxId || ''} onChange={(e) => handleLineItemChange(index, e)} displayEmpty>
                                                                    <MenuItem value=""><em>None</em></MenuItem>
                                                                    {taxOptions.map(taxOpt => (<MenuItem key={taxOpt.id} value={taxOpt.id}>{taxOpt.name}</MenuItem>))}
                                                                </Select>
                                                            </FormControl>
                                                        </TableCell>
                                                    );
                                                }
                                                // Read-only calculated currency fields
                                                if (['taxableValue', 'cgstAmount', 'sgstAmount', 'igstAmount', 'taxAmount', 'amount'].includes(col.key)) {
                                                    return (
                                                        <TableCell key={col.key} align="right" sx={{ minWidth: col.minWidth }}>
                                                            {formatCurrency(calculatedItem[col.key] || 0, currencySymbol)}
                                                        </TableCell>
                                                    );
                                                }
                                                // Editable CESS per item
                                                if (col.key === 'cessAmountPerItem') {
                                                    return (
                                                        <TableCell key={col.key} align="right" sx={{ minWidth: col.minWidth }}>
                                                            <TextField
                                                                name={col.key} type="number" value={item[col.key] || ''}
                                                                onChange={(e) => handleLineItemChange(index, e)}
                                                                size="small" fullWidth variant="standard"
                                                                InputProps={{ inputProps: { min: 0, step: "0.01" }, startAdornment: <InputAdornment position='start'>{currencySymbol}</InputAdornment> }}
                                                            />
                                                        </TableCell>
                                                    );
                                                }
                                                // Default editable text/number fields
                                                return (
                                                    <TableCell key={col.key} align={col.align || 'left'} sx={{ minWidth: col.minWidth, ...(col.cellSx || {}) }}>
                                                        <TextField
                                                            name={col.key} type={col.type || 'text'}
                                                            value={item[col.key] === undefined || item[col.key] === null ? '' : item[col.key]}
                                                            onChange={(e) => handleLineItemChange(index, e)}
                                                            size="small" fullWidth variant="standard"
                                                            InputProps={{ ...(col.props?.InputProps || {}) }}
                                                        />
                                                    </TableCell>
                                                );
                                            })}
                                            {/* Delete Item Button */}
                                            <TableCell padding="none" align="right">
                                                {creditNoteData.lineItems.length > 1 && (
                                                    <IconButton onClick={() => removeLineItem(item.id)} size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button startIcon={<AddIcon />} onClick={addLineItem} size="small" sx={{ mt: 1.5 }}>Add Item</Button>

                    {/* Totals Section */}
                    <Divider sx={{ my: 2.5 }} />
                    {/* Subtotal */}
                    <Grid container spacing={1} justifyContent="flex-end">
                        <Grid item xs={8} sm={6} md={3}><Typography variant="body1" align="right">Subtotal:</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="body1" align="right">{formatCurrency(displayData.subTotal, currencySymbol)}</Typography></Grid>
                    </Grid>
                    {/* Overall Discount */}
                    <Grid container spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={4} sm={3} md={1} sx={{ pr: 0 }}>
                            <FormControl size="small" fullWidth>
                                <Select name="discountType" value={creditNoteData.discountType} onChange={handleChange} variant="standard">
                                    <MenuItem value="Percentage">%</MenuItem><MenuItem value="Fixed">Amt</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={3} md={2}>
                            <TextField name="discountValue" label="Discount" type="number" value={creditNoteData.discountValue} onChange={handleChange} size="small" fullWidth InputProps={{ inputProps: { min: 0, step: "0.01" } }} variant="standard" />
                        </Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="body1" align="right">{formatCurrency(displayData.discountAmountCalculated, currencySymbol)}</Typography></Grid>
                    </Grid>
                    {/* Taxable Amount */}
                    <Grid container spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                        <Grid item xs={8} sm={6} md={3}><Typography variant="body1" align="right">Taxable Amount:</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="body1" align="right">{formatCurrency(displayData.taxableAmount, currencySymbol)}</Typography></Grid>
                    </Grid>
                    {/* Tax Components (CGST, SGST, IGST) */}
                    <Grid container spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={8} sm={6} md={3}><Typography variant="body1" align="right">CGST:</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="body1" align="right">{formatCurrency(displayData.cgstAmount, currencySymbol)}</Typography></Grid>
                    </Grid>
                    <Grid container spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={8} sm={6} md={3}><Typography variant="body1" align="right">SGST:</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="body1" align="right">{formatCurrency(displayData.sgstAmount, currencySymbol)}</Typography></Grid>
                    </Grid>
                    <Grid container spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={8} sm={6} md={3}><Typography variant="body1" align="right">IGST:</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="body1" align="right">{formatCurrency(displayData.igstAmount, currencySymbol)}</Typography></Grid>
                    </Grid>
                    {/* Overall CESS */}
                    <Grid container spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
                        <Grid item xs={8} sm={6} md={3}><Typography variant="body1" align="right">Total CESS:</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}>
                            <TextField
                                name="overallCessAmount" label="Overall CESS" type="number"
                                value={creditNoteData.overallCessAmount} onChange={handleChange}
                                size="small" fullWidth InputProps={{ inputProps: { min: 0, step: "0.01" }, startAdornment: <InputAdornment position='start'>{currencySymbol}</InputAdornment> }}
                                variant="standard"
                            />
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 1 }} />
                    {/* Grand Total (Credit Amount) */}
                    <Grid container spacing={1} justifyContent="flex-end" sx={{ mt: 0.5 }}>
                        <Grid item xs={8} sm={6} md={3}><Typography variant="h6" align="right">Credit Amount (Grand Total):</Typography></Grid>
                        <Grid item xs={4} sm={3} md={2}><Typography variant="h6" align="right">{formatCurrency(displayData.grandTotal, currencySymbol)}</Typography></Grid>
                    </Grid>
                    {/* Removed Amount Paid and Balance Due as they are not typical for credit note creation form */}

                    {/* Notes and Terms & Conditions */}
                    <Divider sx={{ my: 2.5 }} />
                    <TextField name="notes" label="Notes" value={creditNoteData.notes} onChange={handleChange} fullWidth multiline rows={2} size="small" InputLabelProps={inputLabelProps} sx={{ mb: 2 }} />
                    {/* Terms & Conditions TextField Removed */}
                </Paper>

                {/* Action Buttons: Cancel, Save, Print/View PDF */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, width: '100%' }}>
                    <Button variant="outlined" color="secondary" onClick={() => navigate('/credit-notes')}>Cancel</Button> {/* Navigate to credit notes list */}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        disabled={loading || loadingSettings}
                    >
                        {loading ? <CircularProgress size={24} /> : "Save Credit Note"}
                    </Button>
                    <Button
                        variant="outlined"
                        color="info"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={handlePrintPdf}
                        disabled={!savedCreditNoteId || loading}
                    >
                        Print/View PDF
                    </Button>
                </Box>
            </Box>

            {/* Add New Customer Modal */}
            <Dialog open={isAddCustomerModalOpen} onClose={handleCloseAddCustomerModal} maxWidth="xs" fullWidth>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>Enter the customer's name. Other details can be added later from the customer management section.</DialogContentText>
                    {newCustomerError && <Alert severity="error" sx={{ mb: 2 }}>{newCustomerError}</Alert>}
                    <TextField
                        autoFocus margin="dense" name="displayName" label="Display Name / Company Name *"
                        type="text" fullWidth variant="outlined" value={newCustomerData.displayName}
                        onChange={handleNewCustomerDataChange}
                        error={!!(newCustomerError && !newCustomerData.displayName)} // Highlight if error and field is empty
                    />
                    {/* Consider adding more fields to this modal if needed, e.g., Payment Terms */}
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={handleCloseAddCustomerModal} color="secondary">Cancel</Button>
                    <Button onClick={handleSaveNewCustomer} variant="contained" disabled={newCustomerLoading}>
                        {newCustomerLoading ? <CircularProgress size={24} /> : "Save Customer"}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default CreateCreditNotePage;
