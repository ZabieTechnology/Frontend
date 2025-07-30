import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import Checkbox from '@mui/material/Checkbox';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import TableFooter from '@mui/material/TableFooter';
import {
    Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon,
    PersonAddAlt1 as PersonAddAlt1Icon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { format as formatDateFns, isValid as isValidDateFns, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// --- HELPER FUNCTIONS ---

// Helper to format currency, aligned with InvoicePreview
const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    const formatted = `${currencySymbol}${Math.abs(parseFloat(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return amount < 0 ? `-${formatted}` : formatted;
};

// Helper to render custom fields, aligned with InvoicePreview
const renderCustomFieldInput = (field, value, handleChange, isDisabled) => {
    const commonProps = {
        name: field.id,
        label: field.label,
        fullWidth: true,
        size: 'small',
        value: value,
        onChange: handleChange,
        disabled: isDisabled,
    };

    switch (field.type) {
        case 'number':
            return <TextField {...commonProps} type="number" />;
        case 'date':
            return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;
        case 'date_month_year':
            return <TextField {...commonProps} type="text" placeholder="MM/YYYY" helperText="Format: MM/YYYY" />;
        case 'tick_box':
            return <FormControlLabel control={<Checkbox checked={!!value} onChange={handleChange} name={field.id} disabled={isDisabled} />} label={field.label} />;
        case 'yes_no_radio':
            return (
                <FormControl component="fieldset" fullWidth>
                    <Typography component="legend" variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>{field.label}</Typography>
                    <RadioGroup row {...commonProps} value={value || 'no'}>
                        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                    </RadioGroup>
                </FormControl>
            );
        case 'text':
        default:
            return <TextField {...commonProps} type="text" />;
    }
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
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    cessRate: 0, // Ad valorem percentage
    cessAmount: 0, // Specific fixed amount per unit
    vatRate: 0, // VAT rate percentage
    stockInHand: null,
    itemType: 'product',
};

// This default now reflects the comprehensive structure from InvoiceSettingsPage.js
const defaultThemeProfileData = {
    id: 'default_fallback_theme_profile',
    profileName: 'Default Fallback',
    isDefault: true,
    baseThemeName: "Modern",
    selectedColor: "#4CAF50",
    textColor: "#212121",
    itemTableColumns: {
        pricePerItem: true,
        quantity: true,
        hsnSacCode: true,
        discountPerItem: false,
        showCess: false,
        showVat: false,
        showGrossValue: true,
    },
    taxDisplayMode: 'breakdown',
    customItemColumns: [],
    invoiceHeading: "TAX INVOICE",
    invoicePrefix: "INV-",
    invoiceSuffix: "",
    showPoNumber: true,
    customHeaderFields: [],
    upiId: "",
    upiQrCodeImageUrl: "",
    bankAccountId: '',
    showSaleAgentOnInvoice: false,
    showBillToSection: true,
    showShipToSection: true,
    showAmountReceived: true,
    showCreditNoteIssued: true,
    showExpensesAdjusted: true,
    signatureImageUrl: '',
    authorisedSignatory: 'For (Your Company Name)',
    invoiceFooter: "",
    invoiceFooterImageUrl: "",
    termsAndConditionsId: 'Default T&C',
    notesDefault: "Thank you for your business!",
    enableRounding: false,
    roundingMethod: 'auto',
    invoiceTotalCalculation: 'auto',
    roundOffAccountId: '',
    additionalCharges: [{
        id: 'mandatory_discount',
        label: 'Discount',
        valueType: 'percentage',
        value: 0,
        accountId: '',
        isMandatory: true,
        showInPreview: true,
    }],
};

const initialGlobalSettingsData = {
    companyLogoUrl: "/images/default_logo.png",
    nextInvoiceNumber: 1,
    currency: "INR",
    state: "KL",
};

const getBaseInitialInvoiceData = (defaultTaxInfo = null, globalSettings = initialGlobalSettingsData, themeSettings = defaultThemeProfileData) => {
    const invoiceNumber = `${themeSettings.invoicePrefix || ''}${globalSettings.nextInvoiceNumber || ''}${themeSettings.invoiceSuffix || ''}`;
    const defaultTax = defaultTaxInfo || { id: '', rate: 0, cgst: 0, sgst: 0, igst: 0 };

    // Initialize custom fields based on theme settings
    const customFieldDefaults = {};
    (themeSettings.customHeaderFields || []).forEach(field => {
        customFieldDefaults[field.id] = field.defaultValue;
    });

    return {
        ...customFieldDefaults,
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date(),
        dueDate: new Date(),
        customerId: '',
        customerName: '',
        customerGstin: '',
        customerVat: '', // New field for customer VAT
        customerAddress: '',
        customerState: '',
        shipToAddress: '',
        poNumber: '',
        saleAgentName: '',
        lineItems: [{
            ...minimalInitialLineItem,
            id: Date.now() + 1,
            quantity: 1,
            taxId: defaultTax.id,
            taxRate: defaultTax.rate,
            cgstRate: defaultTax.cgst,
            sgstRate: defaultTax.sgst,
            igstRate: defaultTax.igst,
        }],
        amountPaid: 0,
        creditsApplied: 0,
        expensesAdjusted: 0,
        notes: themeSettings.notesDefault || "Thank you for your business!",
        termsAndConditions: themeSettings.termsAndConditionsId || "Default T&C",
        currency: globalSettings.currency || 'INR',
        bankAccountId: themeSettings.bankAccountId || '',
        status: 'Draft',
        selectedThemeProfileId: themeSettings.id || null,
        additionalCharges: (themeSettings.additionalCharges || []).map(charge => ({ ...charge, userInput: charge.value })),
        manualTotal: null, // NEW: For manual total entry
    };
};

const initialNewCustomerData = { displayName: '', paymentTerms: 'Due on Receipt' };
const initialNewItemData = { itemName: '', salePrice: '', gstRate: 0, itemType: 'product' };


export default function SalesInvoiceCreate() {
    const { invoiceId } = useParams();
    const location = useLocation();
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
    const [isLockedForEditing, setIsLockedForEditing] = useState(false);


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
        if (!invoiceDate || !isValidDateFns(new Date(invoiceDate))) return new Date();
        if (!paymentTerms || typeof paymentTerms !== 'string') return new Date(invoiceDate);
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
            const fetchedTaxes = (response.data?.data || [])
                .filter(tax => tax.head?.toLowerCase().includes('output'))
                .map(tax => ({
                    id: tax._id,
                    name: tax.taxName || `Tax @ ${parseFloat(tax.taxRate) || 0}%`,
                    rate: parseFloat(tax.taxRate) || 0,
                    cgst: parseFloat(tax.cgstRate) || 0,
                    sgst: parseFloat(tax.sgstRate) || 0,
                    igst: parseFloat(tax.igstRate) || 0,
                    isDefaultLineItemTax: !!tax.isDefaultLineItemTax,
                }));

            if (fetchedTaxes.length > 0) {
                setTaxOptions(fetchedTaxes);
                return fetchedTaxes;
            }
            const fallback = [{ id: "default_tax_0_id", name: "No Tax (Fallback)", rate: 0, cgst: 0, sgst: 0, igst: 0, isDefaultLineItemTax: true }];
            setTaxOptions(fallback);
            return fallback;
        } catch (err) {
            console.error("Error fetching tax options:", err);
            const fallback = [{ id: "error_fallback_tax", name: "No Tax (Error)", rate: 0, cgst: 0, sgst: 0, igst: 0, isDefaultLineItemTax: true }];
            setTaxOptions(fallback);
            return fallback;
        }
    }, [API_BASE_URL]);


    const fetchAllInvoiceSettings = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/invoice-settings`, { withCredentials: true });
            let defaultTheme = { ...defaultThemeProfileData };
            let currentGlobal = { ...initialGlobalSettingsData };
            let allThemes = [defaultTheme];

            if (response.data) {
                currentGlobal = { ...initialGlobalSettingsData, ...(response.data.global || {}) };
                const savedThemes = (response.data.savedThemes && response.data.savedThemes.length > 0) ? response.data.savedThemes : [defaultTheme];
                allThemes = savedThemes.map(theme => ({ ...defaultThemeProfileData, ...theme }));
                defaultTheme = allThemes.find(t => t.isDefault) || allThemes[0];
            }

            setAllThemeProfiles(allThemes);
            setGlobalCompanySettings(currentGlobal);
            setSupplierState(currentGlobal.state || '');
            setSelectedThemeProfileId(defaultTheme.id);
            setCurrentThemeSettings(defaultTheme);
            return { globalSettings: currentGlobal, defaultThemeToApply: defaultTheme, allThemes };
        } catch (err) {
            console.error("Error fetching invoice settings:", err);
            setCurrentThemeSettings(defaultThemeProfileData);
            setAllThemeProfiles([defaultThemeProfileData]);
            return { globalSettings: initialGlobalSettingsData, defaultThemeToApply: defaultThemeProfileData, allThemes: [defaultThemeProfileData] };
        }
    }, [API_BASE_URL]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/customers?limit=-1`, { withCredentials: true });
            if (response.data?.data) {
                setCustomerOptions(response.data.data.map(cust => ({
                    ...cust,
                    id: cust._id,
                    label: cust.displayName || cust.companyName,
                    state: cust.billingAddress?.state || '',
                    vatNumber: cust.vatNumber || '', // Ensure vatNumber is mapped
                    paymentTerms: cust.paymentTerms
                })));
            }
        } catch (err) { console.error("Error fetching customers:", err); }
    }, [API_BASE_URL]);

    const fetchInventoryItems = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory?limit=-1`, { withCredentials: true });
            if (response.data?.data) {
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

            const initializeInvoice = (baseInvoiceData) => {
                const themeForInvoice = allThemes.find(t => t.id === baseInvoiceData.selectedThemeProfileId) || defaultThemeToApply;
                const customFieldDefaults = {};
                (themeForInvoice.customHeaderFields || []).forEach(field => {
                    if (baseInvoiceData[field.id] === undefined) {
                         customFieldDefaults[field.id] = field.defaultValue;
                    }
                });

                return {
                    ...baseInvoiceData,
                    ...customFieldDefaults,
                    additionalCharges: (baseInvoiceData.additionalCharges || themeForInvoice.additionalCharges || []).map(charge => ({
                        ...charge,
                        userInput: charge.userInput ?? charge.value
                    })),
                };
            };

            if (isEditMode) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`);
                    const fetchedInvoice = response.data.data;
                    const themeForInvoice = allThemes.find(t => t.id === fetchedInvoice.selectedThemeProfileId) || defaultThemeToApply;
                    const baseData = getBaseInitialInvoiceData(null, globalSettings, themeForInvoice);

                    const initialData = initializeInvoice({
                        ...baseData,
                        ...fetchedInvoice,
                        customerId: fetchedInvoice.customer?._id || '',
                        invoiceDate: fetchedInvoice.invoiceDate ? parseISO(fetchedInvoice.invoiceDate) : new Date(),
                        dueDate: fetchedInvoice.dueDate ? parseISO(fetchedInvoice.dueDate) : new Date(),
                    });

                    if(themeForInvoice.invoiceTotalCalculation === 'manual') {
                        initialData.manualTotal = fetchedInvoice.finalAmount;
                    }

                    const paymentApplied = (fetchedInvoice.amountPaid || 0) > 0 ||
                                         (fetchedInvoice.creditsApplied || 0) > 0 ||
                                         (fetchedInvoice.expensesAdjusted || 0) > 0;
                    setIsLockedForEditing(paymentApplied);


                    setInvoiceData(initialData);
                    setSelectedThemeProfileId(themeForInvoice.id);
                    setCurrentThemeSettings(themeForInvoice);
                } catch (err) {
                    setError("Failed to fetch invoice data for editing.");
                }
            } else if (copiedInvoice) {
                const themeForInvoice = allThemes.find(t => t.id === copiedInvoice.selectedThemeProfileId) || defaultThemeToApply;
                const nextNumber = globalSettings.nextInvoiceNumber;
                const newInvoiceNumber = `${themeForInvoice.invoicePrefix || ''}${nextNumber || ''}${themeForInvoice.invoiceSuffix || ''}`;

                const initialData = initializeInvoice({
                    ...getBaseInitialInvoiceData(null, globalSettings, themeForInvoice),
                    ...copiedInvoice,
                    invoiceNumber: newInvoiceNumber,
                    invoiceDate: new Date(),
                    dueDate: new Date(),
                    status: 'Draft',
                    amountPaid: 0, creditsApplied: 0, expensesAdjusted: 0,
                    _id: undefined, id: undefined,
                    lineItems: copiedInvoice.lineItems.map(item => ({ ...item, id: Date.now() + Math.random(), _id: undefined })),
                    customerId: copiedInvoice.customer?._id || copiedInvoice.customerId,
                    selectedThemeProfileId: themeForInvoice.id,
                });

                if(themeForInvoice.invoiceTotalCalculation === 'manual') {
                    initialData.manualTotal = copiedInvoice.finalAmount;
                }

                setInvoiceData(initialData);
                setSelectedThemeProfileId(themeForInvoice.id);
                setCurrentThemeSettings(themeForInvoice);
            } else {
                const defaultTax = taxes.find(t => t.isDefaultLineItemTax) || taxes[0];
                const initialData = initializeInvoice(getBaseInitialInvoiceData(defaultTax, globalSettings, defaultThemeToApply));
                setInvoiceData(initialData);
                setSelectedThemeProfileId(defaultThemeToApply.id);
                setCurrentThemeSettings(defaultThemeToApply);
            }
            setLoadingSettings(false);
        };
        loadInitialData();
    }, [isEditMode, invoiceId, location.state, API_BASE_URL, fetchTaxOptions, fetchAllInvoiceSettings, fetchCustomers, fetchInventoryItems]);


    useEffect(() => {
        const selectedCustomer = customerOptions.find(c => c._id === invoiceData.customerId);
        const paymentTerms = selectedCustomer?.paymentTerms;
        setSelectedCustomerPaymentTerms(paymentTerms || '');
        const newDueDate = calculateDueDate(invoiceData.invoiceDate, paymentTerms);
        if (invoiceData.dueDate?.getTime() !== newDueDate.getTime()) {
            setInvoiceData(prev => ({ ...prev, dueDate: newDueDate }));
        }
    }, [invoiceData.customerId, invoiceData.invoiceDate, invoiceData.dueDate, customerOptions, calculateDueDate]);

    const formattedPaymentTerms = useMemo(() => {
        if (!selectedCustomerPaymentTerms) return 'N/A';
        return selectedCustomerPaymentTerms.replace(/([a-zA-Z])(\d+)/g, '$1 $2');
    }, [selectedCustomerPaymentTerms]);

    useEffect(() => {
        const isAnyItemEntered = invoiceData.lineItems.some(item => item.itemId || item.description?.trim());
        setIsThemeLocked(isAnyItemEntered);
    }, [invoiceData.lineItems]);

    const handleAdditionalChargeChange = (id, event) => {
        const { value } = event.target;
        setInvoiceData(prev => ({
            ...prev,
            additionalCharges: prev.additionalCharges.map(charge =>
                charge.id === id ? { ...charge, userInput: value } : charge
            )
        }));
    };

    const calculatedInvoiceData = useMemo(() => {
        const taxMode = currentThemeSettings?.taxDisplayMode || 'breakdown';

        let totalGrossValueOnItems = 0, totalDiscountOnItems = 0, totalCgstOnItems = 0, totalSgstOnItems = 0;
        let totalIgstOnItems = 0, totalVatOnItems = 0, totalCessOnItems = 0;

        const itemsWithCalcs = invoiceData.lineItems.map(item => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const grossValue = qty * rate;
            totalGrossValueOnItems += grossValue;

            let itemDiscountAmount = 0;
            const discountStr = String(item.discountPerItem || '0');
            if (discountStr.includes('%')) {
                itemDiscountAmount = (grossValue * (parseFloat(discountStr.replace('%', '')) || 0)) / 100;
            } else {
                itemDiscountAmount = parseFloat(discountStr) || 0;
            }
            totalDiscountOnItems += itemDiscountAmount;

            const itemTaxableValue = grossValue - itemDiscountAmount;
            let cgst = 0, sgst = 0, igst = 0, vat = 0;
            if (taxMode === 'breakdown') {
                const supState = supplierState?.trim().toLowerCase();
                const custState = invoiceData.customerState?.trim().toLowerCase();
                if (!custState || supState === custState) {
                    cgst = itemTaxableValue * ((item.cgstRate || 0) / 100);
                    sgst = itemTaxableValue * ((item.sgstRate || 0) / 100);
                } else {
                    igst = itemTaxableValue * ((item.igstRate || 0) / 100);
                }
                vat = itemTaxableValue * ((item.vatRate || 0) / 100);
            }
            const itemCess = (itemTaxableValue * ((item.cessRate || 0) / 100)) + ((parseFloat(item.cessAmount) || 0) * qty);

            totalCgstOnItems += cgst; totalSgstOnItems += sgst; totalIgstOnItems += igst;
            totalVatOnItems += vat; totalCessOnItems += itemCess;

            const itemTotal = itemTaxableValue + cgst + sgst + igst + vat + itemCess;
            return { ...item, grossValue, itemDiscountAmount, itemTaxableValue, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst, vatAmount: vat, cessAmountCalculated: itemCess, amount: itemTotal, qty };
        });

        const subTotalA = itemsWithCalcs.reduce((sum, item) => sum + item.amount, 0);
        const totalItemsTaxableValue = itemsWithCalcs.reduce((sum, item) => sum + item.itemTaxableValue, 0);

        let totalChargesValue = 0, totalCgstOnCharges = 0, totalSgstOnCharges = 0, totalIgstOnCharges = 0;
        let totalVatOnCharges = 0, totalCessOnCharges = 0;

        const appliedCharges = (invoiceData.additionalCharges || []).map(charge => {
            let chargeAmount = (charge.valueType === 'percentage')
                ? (totalItemsTaxableValue * (parseFloat(charge.userInput) || 0)) / 100
                : (parseFloat(charge.userInput) || 0);

            const isDeduction = charge.id === 'mandatory_discount';
            const sign = isDeduction ? -1 : 1;

            let chargeCgst = 0, chargeSgst = 0, chargeIgst = 0, chargeVat = 0, chargeCess = 0;
            if (taxMode === 'breakdown' && totalItemsTaxableValue > 0) {
                itemsWithCalcs.forEach(item => {
                    const proportion = item.itemTaxableValue / totalItemsTaxableValue;
                    const chargePortion = chargeAmount * proportion;
                    const supState = supplierState?.trim().toLowerCase();
                    const custState = invoiceData.customerState?.trim().toLowerCase();
                    if (!custState || supState === custState) {
                        chargeCgst += chargePortion * ((item.cgstRate || 0) / 100);
                        chargeSgst += chargePortion * ((item.sgstRate || 0) / 100);
                    } else {
                        chargeIgst += chargePortion * ((item.igstRate || 0) / 100);
                    }
                    chargeVat += chargePortion * ((item.vatRate || 0) / 100);
                    chargeCess += chargePortion * ((item.cessRate || 0) / 100);
                });
            }

            totalChargesValue += chargeAmount * sign;
            totalCgstOnCharges += chargeCgst * sign;
            totalSgstOnCharges += chargeSgst * sign;
            totalIgstOnCharges += chargeIgst * sign;
            totalVatOnCharges += chargeVat * sign;
            totalCessOnCharges += chargeCess * sign;

            return { ...charge, calculatedAmount: chargeAmount, cgst: chargeCgst, sgst: chargeSgst, igst: chargeIgst, vat: chargeVat, cess: chargeCess };
        });

        const subTotalB = totalChargesValue + totalCgstOnCharges + totalSgstOnCharges + totalIgstOnCharges + totalVatOnCharges + totalCessOnCharges;
        const grandTotal = subTotalA + subTotalB;

        let roundOffAmount = 0;
        let finalAmount = grandTotal;

        const isManualMode = currentThemeSettings.invoiceTotalCalculation === 'manual';
        const isRoundingEnabled = currentThemeSettings.enableRounding;

        if (isManualMode && invoiceData.manualTotal !== null) {
            finalAmount = parseFloat(invoiceData.manualTotal) || 0;
            roundOffAmount = finalAmount - grandTotal;
        } else if (isRoundingEnabled) {
            finalAmount = Math.round(grandTotal);
            roundOffAmount = finalAmount - grandTotal;
        }

        const totalPaid = (parseFloat(invoiceData.amountPaid) || 0) + (parseFloat(invoiceData.creditsApplied) || 0) + (parseFloat(invoiceData.expensesAdjusted) || 0);
        const balanceDue = finalAmount - totalPaid;

        return {
            ...invoiceData, lineItems: itemsWithCalcs, subTotalA, totalGrossValueOnItems, totalDiscountOnItems,
            totalCgstOnItems, totalSgstOnItems, totalIgstOnItems, totalVatOnItems, totalCessOnItems,
            subTotalB, totalChargesValue, totalCgstOnCharges, totalSgstOnCharges, totalIgstOnCharges,
            totalVatOnCharges, totalCessOnCharges, appliedCharges, grandTotal,
            cgstAmount: totalCgstOnItems + totalCgstOnCharges, sgstAmount: totalSgstOnItems + totalSgstOnCharges,
            igstAmount: totalIgstOnItems + totalIgstOnCharges, vatAmount: totalVatOnItems + totalVatOnCharges,
            overallCessAmount: totalCessOnItems + totalCessOnCharges,
            roundOffAmount, finalAmount, balanceDue,
        };
    }, [invoiceData, supplierState, currentThemeSettings]);

    const handleThemeChange = (event) => {
        const themeId = event.target.value;
        const newTheme = allThemeProfiles.find(t => t.id === themeId);
        if (newTheme) {
            setSelectedThemeProfileId(themeId);
            setCurrentThemeSettings(newTheme);
            const customFieldDefaults = {};
            (newTheme.customHeaderFields || []).forEach(field => {
                customFieldDefaults[field.id] = field.defaultValue;
            });

            setInvoiceData(prev => ({
                ...prev,
                ...customFieldDefaults,
                invoiceNumber: isEditMode ? prev.invoiceNumber : `${newTheme.invoicePrefix || ''}${globalCompanySettings.nextInvoiceNumber || ''}${newTheme.invoiceSuffix || ''}`,
                notes: newTheme.notesDefault || "",
                termsAndConditions: newTheme.termsAndConditionsId || "",
                bankAccountId: newTheme.bankAccountId || '',
                selectedThemeProfileId: newTheme.id,
                additionalCharges: (newTheme.additionalCharges || []).map(charge => ({ ...charge, userInput: charge.value })),
                manualTotal: null, // Reset manual total when theme changes
            }));
        }
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const val = type === 'checkbox' ? checked : value;

        if (name === 'manualTotal') {
            setInvoiceData(prev => ({ ...prev, manualTotal: val }));
        } else {
            setInvoiceData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleCustomerChange = (event, value) => {
        if (value) {
            setInvoiceData(prev => ({
                ...prev,
                customerId: value._id,
                customerName: value.label,
                customerGstin: value.gstNo || '',
                customerVat: value.vatNumber || '',
                customerAddress: value.billingAddress?.street || '',
                customerState: value.billingAddress?.state || '',
                shipToAddress: value.shippingAddress?.street || value.billingAddress?.street || '',
            }));
        } else {
            setInvoiceData(prev => ({
                ...prev,
                customerId: '', customerName: '', customerGstin: '', customerVat: '',
                customerAddress: '', customerState: '', shipToAddress: '',
            }));
        }
    };

    const handleDateChange = (name, dateString) => {
        if (!dateString) {
            setInvoiceData(prev => ({ ...prev, [name]: null }));
            return;
        }
        const newDate = new Date(dateString);
        if (isValidDateFns(newDate)) {
            setInvoiceData(prev => ({ ...prev, [name]: newDate }));
        }
    };

    const handleItemSelect = (index, selectedItem) => {
        if (!selectedItem) return;
        const updatedLineItems = invoiceData.lineItems.map((item, i) => {
            if (i === index) {
                const matchingTax = taxOptions.find(tax => tax.rate === selectedItem.gstRate);
                return {
                    ...item,
                    itemId: selectedItem._id,
                    description: selectedItem.itemName,
                    hsnSac: selectedItem.hsnCode || '',
                    rate: selectedItem.salePrice || 0,
                    taxId: matchingTax ? matchingTax.id : '',
                    taxRate: selectedItem.gstRate || 0,
                    cgstRate: matchingTax?.cgst || 0,
                    sgstRate: matchingTax?.sgst || 0,
                    igstRate: matchingTax?.igst || 0,
                    vatRate: selectedItem.vatRate || 0,
                    cessRate: selectedItem.cessRate || 0,
                    cessAmount: selectedItem.cessAmount || 0,
                    stockInHand: selectedItem.stockInHand,
                    itemType: selectedItem.itemType,
                    quantity: (parseFloat(item.quantity) || 0) > 0 ? item.quantity : 1,
                };
            }
            return item;
        });
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems, manualTotal: null }));
    };

    const handleLineItemChange = (index, event) => {
        const { name, value } = event.target;
        const updatedLineItems = invoiceData.lineItems.map((item, i) => {
            if (i === index) {
                let updatedItem = { ...item, [name]: value };
                if (name === "taxId") {
                    const selectedTax = taxOptions.find(t => t.id === value);
                    updatedItem.taxRate = selectedTax?.rate || 0;
                    updatedItem.cgstRate = selectedTax?.cgst || 0;
                    updatedItem.sgstRate = selectedTax?.sgst || 0;
                    updatedItem.igstRate = selectedTax?.igst || 0;
                }
                if (name === 'description') {
                    updatedItem.itemId = '';
                    updatedItem.stockInHand = null;
                    updatedItem.itemType = 'service';
                }
                return updatedItem;
            }
            return item;
        });
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems, manualTotal: null }));
    };

    const handleItemClear = (index) => {
        const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || taxOptions[0] || { id: '', rate: 0, cgst: 0, sgst: 0, igst: 0 };
        const updatedLineItems = invoiceData.lineItems.map((item, i) =>
            i === index ? { ...minimalInitialLineItem, id: item.id, taxId: defaultTax.id, taxRate: defaultTax.rate, cgstRate: defaultTax.cgst, sgstRate: defaultTax.sgst, igstRate: defaultTax.igst } : item
        );
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems, manualTotal: null }));
    };

    const addLineItem = () => {
        const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || taxOptions[0] || { id: '', rate: 0, cgst: 0, sgst: 0, igst: 0 };
        setInvoiceData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { ...minimalInitialLineItem, id: Date.now(), taxId: defaultTax.id, taxRate: defaultTax.rate, cgstRate: defaultTax.cgst, sgstRate: defaultTax.sgst, igstRate: defaultTax.igst }],
            manualTotal: null
        }));
    };

    const removeLineItem = (id) => {
        let updatedLineItems;
        if (invoiceData.lineItems.length <= 1) {
             const defaultTax = taxOptions.find(t => t.isDefaultLineItemTax) || taxOptions[0] || { id: '', rate: 0, cgst: 0, sgst: 0, igst: 0 };
             updatedLineItems = [{ ...minimalInitialLineItem, id: Date.now(), taxId: defaultTax.id, taxRate: defaultTax.rate, cgstRate: defaultTax.cgst, sgstRate: defaultTax.sgst, igstRate: defaultTax.igst }];
        } else {
             updatedLineItems = invoiceData.lineItems.filter(item => item.id !== id);
        }
        setInvoiceData(prev => ({ ...prev, lineItems: updatedLineItems, manualTotal: null }));
    };

    const handleOpenAddCustomerModal = () => setIsAddCustomerModalOpen(true);
    const handleCloseAddCustomerModal = () => { setIsAddCustomerModalOpen(false); setNewCustomerData(initialNewCustomerData); setNewCustomerError(null); };
    const handleNewCustomerDataChange = (event) => { const { name, value } = event.target; setNewCustomerData(prev => ({ ...prev, [name]: value })); };

    const handleSaveNewCustomer = async () => {
        if (!newCustomerData.displayName?.trim()) {
            setNewCustomerError("Display Name is required.");
            return;
        }
        setNewCustomerLoading(true);
        setNewCustomerError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/customers`, newCustomerData, { withCredentials: true });
            if (response.data?.data) {
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

    const handleOpenAddItemModal = (index) => { setCurrentItemIndex(index); setIsAddItemModalOpen(true); };
    const handleCloseAddItemModal = () => { setIsAddItemModalOpen(false); setNewItemData(initialNewItemData); setNewItemError(null); setCurrentItemIndex(null); };
    const handleNewItemChange = (event) => { const { name, value } = event.target; setNewItemData(prev => ({ ...prev, [name]: value })); };
    const handleItemTypeSwitchChange = (event) => { setNewItemData(prev => ({ ...prev, itemType: event.target.checked ? 'service' : 'product' })); };

    const handleSaveNewItem = async () => {
        if (!newItemData.itemName || !newItemData.salePrice) {
            setNewItemError("Item Name and Sale Price are required.");
            return;
        }
        setNewItemLoading(true); setNewItemError(null);
        try {
            const payload = { ...newItemData, salePrice: parseFloat(newItemData.salePrice), gstRate: parseFloat(newItemData.gstRate) };
            const response = await axios.post(`${API_BASE_URL}/api/inventory`, payload, { withCredentials: true });
            if (response.data?.data) {
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

        const { manualTotal, ...payload } = { ...calculatedInvoiceData, status, ignoreStockWarning };

        try {
            let response;
            if (isEditMode) {
                response = await axios.patch(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`, payload, { withCredentials: true });
            } else {
                response = await axios.post(`${API_BASE_URL}/api/sales-invoices`, payload, { withCredentials: true });
            }

            if (response.data) {
                const savedInvoice = response.data.data || { ...payload, _id: invoiceId };
                setSuccessMessage(`Invoice ${savedInvoice.invoiceNumber} ${isEditMode ? 'updated' : 'saved'} as ${status}.`);
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
        const itemsWithInsufficientStock = calculatedInvoiceData.lineItems
            .filter(lineItem => lineItem.itemType === 'product' && lineItem.itemId && (parseFloat(lineItem.quantity) || 0) > (parseFloat(lineItem.stockInHand) || 0))
            .map(lineItem => ({ name: lineItem.description, requested: lineItem.quantity, available: lineItem.stockInHand }));

        if (itemsWithInsufficientStock.length > 0 && !isEditMode) {
            const warningMessage = itemsWithInsufficientStock.map(item => `${item.name} (Req: ${item.requested}, Avail: ${item.available})`).join(', ');
            setStockWarning(`Insufficient stock: ${warningMessage}. Proceed anyway?`);
            setSaveArgs(args);
            setIsStockWarningModalOpen(true);
        } else {
            proceedWithSave(args, false);
        }
    };


    const handleCloseSuccessDialog = () => { setSuccessMessage(''); navigate('/sales', { replace: true }); };
    const handleMenuClick = (event) => { setAnchorEl(event.currentTarget); };
    const handleMenuClose = () => { setAnchorEl(null); };
    const handleSaveOptionClick = (status) => { handleMenuClose(); handleSave({ status }); };

    const renderDynamicTableHeaders = () => {
        if (!currentThemeSettings) return null;
        const { itemTableColumns, customItemColumns, taxDisplayMode } = currentThemeSettings;
        const headers = [];
        const headerCellStyle = { textAlign: 'center', whiteSpace: 'nowrap' };
        headers.push(<TableCell key="item" sx={{ width: '20%', minWidth: 180 }}>Item/Desc</TableCell>);
        if (itemTableColumns?.hsnSacCode) headers.push(<TableCell key="hsn" sx={{ ...headerCellStyle }}>HSN/SAC</TableCell>);
        customItemColumns?.forEach(col => { if (itemTableColumns?.[col.id]) headers.push(<TableCell key={col.id} sx={{ ...headerCellStyle }}>{col.name}</TableCell>); });
        headers.push(<TableCell align="center" key="qty" sx={{ width: '5%', ...headerCellStyle }}>Qty</TableCell>);
        headers.push(<TableCell align="center" key="rate" sx={{ width: '8%', ...headerCellStyle }}>Rate</TableCell>);
        if (itemTableColumns?.showGrossValue) headers.push(<TableCell align="center" key="gross" sx={{ width: '8%', ...headerCellStyle }}>Gross Value</TableCell>);
        if (itemTableColumns?.discountPerItem) headers.push(<TableCell align="center" key="discount" sx={{ width: '8%', ...headerCellStyle }}>Discount</TableCell>);
        if (taxDisplayMode !== 'no_tax') headers.push(<TableCell key="tax" sx={{ width: '12%', minWidth: 140, ...headerCellStyle }}>Tax</TableCell>);

        if (taxDisplayMode === 'breakdown') {
            headers.push(<TableCell align="center" key="taxRate" sx={{ width: '5%', ...headerCellStyle }}>Tax%</TableCell>);
            headers.push(<TableCell align="center" key="cgst" sx={{ width: '7%', ...headerCellStyle }}>CGST</TableCell>);
            headers.push(<TableCell align="center" key="sgst" sx={{ width: '7%', ...headerCellStyle }}>SGST</TableCell>);
            headers.push(<TableCell align="center" key="igst" sx={{ width: '7%', ...headerCellStyle }}>IGST</TableCell>);
            if (itemTableColumns?.showVat) headers.push(<TableCell align="center" key="vat" sx={{ width: '7%', ...headerCellStyle }}>VAT</TableCell>);
            if (itemTableColumns?.showCess) {
                headers.push(<TableCell align="center" key="cess" sx={{ width: '7%', ...headerCellStyle }}>Cess</TableCell>);
            }
        }

        headers.push(<TableCell align="center" key="total" sx={{ width: '10%', ...headerCellStyle }}>Amount</TableCell>);
        headers.push(<TableCell align="center" key="actions" sx={{ width: '5%', ...headerCellStyle }}></TableCell>);

        return <TableRow>{headers}</TableRow>;
    };

    const renderDynamicTableRows = () => {
        if (!currentThemeSettings) return null;
        const { itemTableColumns, customItemColumns, taxDisplayMode } = currentThemeSettings;
        const calculatedItems = calculatedInvoiceData.lineItems;

        return invoiceData.lineItems.map((item, index) => {
            const calculatedItem = calculatedItems[index] || {};
            const stockColor = (item.stockInHand !== null && (parseFloat(item.quantity) || 0) > item.stockInHand) ? 'error.main' : 'text.secondary';

            return (
                <TableRow key={item.id}>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Autocomplete fullWidth freeSolo options={inventoryItems} getOptionLabel={(option) => typeof option === 'string' ? option : option.itemName} value={inventoryItems.find(inv => inv._id === item.itemId) || item.description} onChange={(e, val) => typeof val === 'string' ? handleLineItemChange(index, { target: { name: 'description', value: val } }) : (val ? handleItemSelect(index, val) : handleItemClear(index))} renderInput={(params) => (<TextField {...params} variant="standard" placeholder="Select or Type Item" />)}  disabled={isLockedForEditing}/>
                            <Tooltip title="Add New Item"><IconButton onClick={() => handleOpenAddItemModal(index)} size="small" color="primary" sx={{ ml: 1 }} disabled={isLockedForEditing}><AddIcon /></IconButton></Tooltip>
                        </Box>
                    </TableCell>
                    {itemTableColumns?.hsnSacCode && <TableCell><TextField name="hsnSac" value={item.hsnSac || ''} onChange={(e) => handleLineItemChange(index, e)} size="small" variant="standard" fullWidth inputProps={{ style: { textAlign: 'center' } }}  disabled={isLockedForEditing}/></TableCell>}
                    {customItemColumns?.map(col => itemTableColumns?.[col.id] && <TableCell key={col.id}><TextField name={col.id} value={item[col.id] || ''} onChange={(e) => handleLineItemChange(index, e)} size="small" variant="standard" fullWidth inputProps={{ style: { textAlign: 'center' } }}  disabled={isLockedForEditing}/></TableCell>)}
                    <TableCell align="center">
                        <TextField name="quantity" value={item.quantity} onChange={(e) => handleLineItemChange(index, e)} size="small" type="number" variant="standard" inputProps={{ style: { textAlign: 'center' }, min: 0 }} fullWidth  disabled={isLockedForEditing}/>
                        {item.stockInHand !== null && <Typography variant="caption" sx={{ color: stockColor, textAlign: 'center', display: 'block' }}>Stock: {item.stockInHand}</Typography>}
                    </TableCell>
                    <TableCell align="center"><TextField name="rate" value={item.rate} onChange={(e) => handleLineItemChange(index, e)} size="small" type="number" variant="standard" InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} inputProps={{ style: { textAlign: 'center' } }} fullWidth  disabled={isLockedForEditing}/></TableCell>
                    {itemTableColumns?.showGrossValue && <TableCell align="center">{formatCurrency(calculatedItem.grossValue, currencySymbol)}</TableCell>}
                    {itemTableColumns?.discountPerItem && <TableCell align="center"><TextField name="discountPerItem" value={item.discountPerItem} onChange={(e) => handleLineItemChange(index, e)} size="small" variant="standard" placeholder="5% or 10" inputProps={{ style: { textAlign: 'center' } }} fullWidth disabled={isLockedForEditing} /></TableCell>}
                    {taxDisplayMode !== 'no_tax' && <TableCell align="center"><FormControl fullWidth size="small" variant="standard"><Select name="taxId" value={item.taxId} onChange={(e) => handleLineItemChange(index, e)} disabled={isLockedForEditing}><MenuItem value=""><em>None</em></MenuItem>{taxOptions.map(tax => (<MenuItem key={tax.id} value={tax.id}>{tax.name}</MenuItem>))}</Select></FormControl></TableCell>}
                    {taxDisplayMode === 'breakdown' && (
                        <>
                            <TableCell align="center">{item.taxRate || 0}%</TableCell>
                            <TableCell align="center">{formatCurrency(calculatedItem.cgstAmount, currencySymbol)}</TableCell>
                            <TableCell align="center">{formatCurrency(calculatedItem.sgstAmount, currencySymbol)}</TableCell>
                            <TableCell align="center">{formatCurrency(calculatedItem.igstAmount, currencySymbol)}</TableCell>
                            {itemTableColumns?.showVat && <TableCell align="center">{formatCurrency(calculatedItem.vatAmount, currencySymbol)}</TableCell>}
                             {itemTableColumns?.showCess && (
                                <TableCell align="center">{formatCurrency(calculatedItem.cessAmountCalculated, currencySymbol)}</TableCell>
                             )}
                        </>
                    )}
                    <TableCell align="center">{formatCurrency(calculatedItem.amount, currencySymbol)}</TableCell>
                    <TableCell align="center"><IconButton onClick={() => removeLineItem(item.id)} size="small" disabled={isLockedForEditing}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
            );
        });
    };

    if (loadingSettings) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    const displayData = calculatedInvoiceData;
    const numCols = renderDynamicTableHeaders().props.children.length;
    const { itemTableColumns } = currentThemeSettings;

    let initialCols = 1; // Item/Desc
    if (itemTableColumns?.hsnSacCode) initialCols++;
    if (itemTableColumns?.customItemColumns) initialCols += (itemTableColumns.customItemColumns.filter(c => itemTableColumns[c.id])?.length || 0);

    const firstSectionColSpan = initialCols + 2; // + Qty, Rate


    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={titleStyle}>{title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 180 }} disabled={isThemeLocked || isLockedForEditing}>
                        <InputLabel id="theme-select-label">Invoice Theme</InputLabel>
                        <Select labelId="theme-select-label" value={selectedThemeProfileId} label="Invoice Theme" onChange={handleThemeChange}>
                            {allThemeProfiles.map(theme => (<MenuItem key={theme.id} value={theme.id}>{theme.profileName}{theme.isDefault && " (Default)"}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleMenuClick} endIcon={<ArrowDropDownIcon />} disabled={saveInProgress}>
                        {saveInProgress ? <CircularProgress color="inherit" size={24} /> : 'Save'}
                    </Button>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                        <MenuItem onClick={() => handleSaveOptionClick('Draft')}>Save as Draft</MenuItem>
                        <MenuItem onClick={() => handleSaveOptionClick('Review')}>Send for Approval</MenuItem>
                        <MenuItem onClick={() => handleSaveOptionClick('Approved')}>Save and Approve</MenuItem>
                    </Menu>
                    <IconButton onClick={() => navigate('/sales')}><ArrowBackIcon /></IconButton>
                </Box>
            </Paper>

            {isLockedForEditing && <Alert severity="info" sx={{ mb: 2 }}>This invoice has payments applied and is locked for editing.</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Dialog open={!!successMessage} onClose={handleCloseSuccessDialog}><DialogTitle>Success</DialogTitle><DialogContent><DialogContentText>{successMessage}</DialogContentText></DialogContent><DialogActions><Button onClick={handleCloseSuccessDialog} autoFocus>OK</Button></DialogActions></Dialog>
            <Dialog open={isStockWarningModalOpen} onClose={() => setIsStockWarningModalOpen(false)}><DialogTitle>Stock Warning</DialogTitle><DialogContent><DialogContentText>{stockWarning}</DialogContentText></DialogContent><DialogActions><Button onClick={() => setIsStockWarningModalOpen(false)}>Cancel</Button><Button onClick={() => proceedWithSave(saveArgs, true)} color="primary" variant="contained">Proceed Anyway</Button></DialogActions></Dialog>

            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Invoice Details</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2} rowSpacing={3}>
                            <Grid item xs={11} sm={11}>
                                <Autocomplete
                                    options={customerOptions}
                                    getOptionLabel={(o) => o.label || ""}
                                    value={customerOptions.find(c => c._id === invoiceData.customerId) || null}
                                    onChange={handleCustomerChange}
                                    renderInput={(params) => <TextField {...params} label="Customer" size="small" required />}
                                    disabled={isLockedForEditing}
                                />
                            </Grid>
                            <Grid item xs={1} sm={1}>
                                <Tooltip title="Add New Customer">
                                    <IconButton onClick={handleOpenAddCustomerModal} color="primary" disabled={isLockedForEditing}>
                                        <PersonAddAlt1Icon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                             <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 1.5 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                label="Invoice #"
                                                fullWidth
                                                size="small"
                                                value={invoiceData.invoiceNumber}
                                                onChange={handleChange}
                                                name="invoiceNumber"
                                                disabled={isEditMode}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                label="Invoice Date"
                                                type="date"
                                                value={isValidDateFns(invoiceData.invoiceDate) ? formatDateFns(new Date(invoiceData.invoiceDate), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => handleDateChange('invoiceDate', e.target.value)}
                                                fullWidth
                                                size="small"
                                                InputLabelProps={inputLabelProps}
                                                disabled={isLockedForEditing}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                label="Due Date"
                                                type="date"
                                                value={isValidDateFns(invoiceData.dueDate) ? formatDateFns(new Date(invoiceData.dueDate), 'yyyy-MM-dd') : ''}
                                                onChange={(e) => handleDateChange('dueDate', e.target.value)}
                                                fullWidth
                                                size="small"
                                                InputLabelProps={inputLabelProps}
                                                disabled={isLockedForEditing}
                                            />
                                             <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'black', textAlign: 'center' }}>
                                                Payment Terms: {formattedPaymentTerms}
                                             </Typography>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Grid container spacing={2} direction="column">
                                        {currentThemeSettings?.showBillToSection && (
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" gutterBottom>Billing Address</Typography>
                                                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap', color: 'text.secondary', p: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '80px' }}>
                                                    {invoiceData.customerAddress || 'Select a customer'}
                                                </Typography>
                                                {invoiceData.customerGstin && <Typography variant="caption">GSTIN: {invoiceData.customerGstin}</Typography>}
                                                {invoiceData.customerVat && <Typography variant="caption" display="block">VAT: {invoiceData.customerVat}</Typography>}
                                            </Grid>
                                        )}
                                        {currentThemeSettings?.showShipToSection && (
                                            <Grid item xs={12}>
                                                <TextField
                                                    name="shipToAddress"
                                                    label="Shipping Address"
                                                    value={invoiceData.shipToAddress}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    size="small"
                                                    InputLabelProps={inputLabelProps}
                                                    disabled={isLockedForEditing}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2} direction="column">
                            {(currentThemeSettings?.showPoNumber || currentThemeSettings?.showSaleAgentOnInvoice) && (
                                <Grid item>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Grid container spacing={2}>
                                            {currentThemeSettings?.showPoNumber && (
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label="PO Number"
                                                        name="poNumber"
                                                        value={invoiceData.poNumber}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        size="small"
                                                        disabled={isLockedForEditing}
                                                    />
                                                </Grid>
                                            )}
                                            {currentThemeSettings?.showSaleAgentOnInvoice && (
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label="Sale Agent"
                                                        name="saleAgentName"
                                                        value={invoiceData.saleAgentName}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        size="small"
                                                        disabled={isLockedForEditing}
                                                    />
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}

                            {currentThemeSettings?.customHeaderFields?.length > 0 && (
                                <Grid item>
                                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                                        <Grid container spacing={2}>
                                            {currentThemeSettings.customHeaderFields.map(field => (
                                                <Grid item xs={12} sm={6} key={field.id}>
                                                   {renderCustomFieldInput(field, invoiceData[field.id], handleChange, isLockedForEditing)}
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h6" gutterBottom>Items</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ '& .MuiTableCell-head': { fontWeight: 500, fontSize: '0.8rem', color: 'text.secondary' } }}>
                            {renderDynamicTableHeaders()}
                        </TableHead>
                        <TableBody sx={{ '& .MuiTableCell-root': { fontSize: '0.8rem' } }}>
                            {renderDynamicTableRows()}
                        </TableBody>
                        <TableFooter>
                           <TableRow sx={{ '& td, & th': { fontWeight: 500, borderTop: '2px solid #333', fontSize: '0.8rem' } }}>
                                <TableCell colSpan={firstSectionColSpan} align="right">Sub-total (A)</TableCell>
                                {itemTableColumns?.showGrossValue && <TableCell align="center">{formatCurrency(displayData.totalGrossValueOnItems, currencySymbol)}</TableCell>}
                                {itemTableColumns?.discountPerItem && <TableCell align="center">{formatCurrency(displayData.totalDiscountOnItems, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode !== 'no_tax' && <TableCell />}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell />}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.totalCgstOnItems, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.totalSgstOnItems, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.totalIgstOnItems, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showVat && <TableCell align="center">{formatCurrency(displayData.totalVatOnItems, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showCess &&
                                    <TableCell align="center">{formatCurrency(displayData.totalCessOnItems, currencySymbol)}</TableCell>
                                }
                                <TableCell align="center">{formatCurrency(displayData.subTotalA, currencySymbol)}</TableCell>
                                <TableCell/>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={numCols} style={{ paddingTop: '16px', borderBottom: "none" }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Additional Charges:</Typography>
                                </TableCell>
                            </TableRow>

                            {displayData.appliedCharges.map((charge) => {
                                const isDeduction = charge.id === 'mandatory_discount';
                                const sign = isDeduction ? -1 : 1;
                                const chargeTotalAmount = (charge.calculatedAmount * sign) + (charge.cgst * sign) + (charge.sgst * sign) + (charge.igst * sign) + (charge.vat * sign) + (charge.cess * sign);
                                return (
                                <TableRow key={charge.id}>
                                     <TableCell colSpan={firstSectionColSpan} align="right">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                        <Typography>{charge.label}</Typography>
                                            <TextField
                                                type="text" size="small" variant="outlined"
                                                value={charge.userInput || ''}
                                                onChange={(e) => handleAdditionalChargeChange(charge.id, e)}
                                                sx={{ width: '100px' }}
                                                InputProps={{ endAdornment: charge.valueType === 'percentage' ? <InputAdornment position="end">%</InputAdornment> : null }}
                                                disabled={isLockedForEditing}
                                            />
                                        </Box>
                                    </TableCell>
                                    {itemTableColumns?.showGrossValue && <TableCell align="center">{formatCurrency(charge.calculatedAmount * sign, currencySymbol)}</TableCell>}
                                    {itemTableColumns?.discountPerItem && <TableCell />}
                                    {currentThemeSettings.taxDisplayMode !== 'no_tax' && <TableCell />}
                                    {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell />}
                                    {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(charge.cgst * sign, currencySymbol)}</TableCell>}
                                    {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(charge.sgst * sign, currencySymbol)}</TableCell>}
                                    {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(charge.igst * sign, currencySymbol)}</TableCell>}
                                    {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showVat && <TableCell align="center">{formatCurrency(charge.vat * sign, currencySymbol)}</TableCell>}
                                    {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showCess &&
                                        <TableCell align="center">{formatCurrency(charge.cess * sign, currencySymbol)}</TableCell>
                                    }
                                    <TableCell align="center">{formatCurrency(chargeTotalAmount, currencySymbol)}</TableCell>
                                    <TableCell/>
                                </TableRow>
                            )})}

                             <TableRow sx={{ '& td, & th': { fontWeight: 'bold', borderTop: '2px solid #333' } }}>
                                <TableCell colSpan={firstSectionColSpan} align="right">Sub-total (B)</TableCell>
                                {itemTableColumns?.showGrossValue && <TableCell align="center">{formatCurrency(displayData.totalChargesValue, currencySymbol)}</TableCell>}
                                {itemTableColumns?.discountPerItem && <TableCell />}
                                {currentThemeSettings.taxDisplayMode !== 'no_tax' && <TableCell />}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell />}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.totalCgstOnCharges, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.totalSgstOnCharges, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.totalIgstOnCharges, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showVat && <TableCell align="center">{formatCurrency(displayData.totalVatOnCharges, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showCess &&
                                    <TableCell align="center">{formatCurrency(displayData.totalCessOnCharges, currencySymbol)}</TableCell>
                                }
                                <TableCell align="center">{formatCurrency(displayData.subTotalB, currencySymbol)}</TableCell>
                                <TableCell/>
                            </TableRow>

                            <TableRow sx={{ '& td, & th': { fontWeight: 'bold', borderTop: '2px solid #333' } }}>
                                <TableCell colSpan={firstSectionColSpan} align="right">Grand Total (A+B)</TableCell>
                                {itemTableColumns?.showGrossValue && <TableCell align="center">{formatCurrency(displayData.totalGrossValueOnItems + displayData.totalChargesValue, currencySymbol)}</TableCell>}
                                {itemTableColumns?.discountPerItem && <TableCell align="center">{formatCurrency(displayData.totalDiscountOnItems, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode !== 'no_tax' && <TableCell />}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell />}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.cgstAmount, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.sgstAmount, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && <TableCell align="center">{formatCurrency(displayData.igstAmount, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showVat && <TableCell align="center">{formatCurrency(displayData.vatAmount, currencySymbol)}</TableCell>}
                                {currentThemeSettings.taxDisplayMode === 'breakdown' && itemTableColumns?.showCess &&
                                    <TableCell align="center">{formatCurrency(displayData.overallCessAmount, currencySymbol)}</TableCell>
                                }
                                <TableCell align="center">{formatCurrency(displayData.grandTotal, currencySymbol)}</TableCell>
                                <TableCell/>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
                <Button startIcon={<AddIcon />} onClick={addLineItem} sx={{ mt: 1 }} disabled={isLockedForEditing}>Add Item</Button>

                <Divider sx={{ my: 2.5 }} />

                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <TextField name="notes" label="Notes" value={invoiceData.notes} onChange={handleChange} fullWidth multiline rows={4} size="small" InputLabelProps={inputLabelProps} sx={{ mb: 2 }} />
                        <TextField name="termsAndConditions" label="Terms & Conditions" value={invoiceData.termsAndConditions} onChange={handleChange} fullWidth multiline rows={5} size="small" InputLabelProps={inputLabelProps}/>
                    </Grid>
                     <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                             <Grid container spacing={1} alignItems="center">
                                {currentThemeSettings?.enableRounding || currentThemeSettings.invoiceTotalCalculation === 'manual' ? (
                                    <>
                                        <Grid item xs={6}><Typography align="right">Rounding Off:</Typography></Grid>
                                        <Grid item xs={6}><Typography align="right">{formatCurrency(displayData.roundOffAmount, currencySymbol)}</Typography></Grid>
                                    </>
                                ) : null}
                                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                                <Grid item xs={6}><Typography variant="h6" align="right">Total Amount:</Typography></Grid>
                                <Grid item xs={6}>
                                    {currentThemeSettings.invoiceTotalCalculation === 'manual' ? (
                                        <TextField
                                            name="manualTotal"
                                            type="number"
                                            size="small"
                                            variant="outlined"
                                            value={invoiceData.manualTotal ?? displayData.finalAmount.toFixed(2)}
                                            onChange={handleChange}
                                            fullWidth
                                            inputProps={{ style: { textAlign: 'right', fontWeight: 'bold' } }}
                                            InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                            disabled={isLockedForEditing}
                                        />
                                    ) : (
                                        <Typography variant="h6" align="right">{formatCurrency(displayData.finalAmount, currencySymbol)}</Typography>
                                    )}
                                </Grid>
                             </Grid>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>Payment Summary</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        {currentThemeSettings.showAmountReceived && (
                                            <TableRow>
                                                <TableCell sx={{ border: 'none' }}>Amount Received:</TableCell>
                                                <TableCell align="right" sx={{ border: 'none' }}>
                                                    {isEditMode && displayData.amountPaid > 0 ? (
                                                        <Link href="#" underline="always" onClick={(e) => e.preventDefault()}>
                                                            {formatCurrency(displayData.amountPaid, currencySymbol)}
                                                        </Link>
                                                    ) : (
                                                        formatCurrency(displayData.amountPaid, currencySymbol)
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {currentThemeSettings.showCreditNoteIssued && (
                                             <TableRow>
                                                <TableCell sx={{ border: 'none' }}>Credit Note Issued:</TableCell>
                                                <TableCell align="right" sx={{ border: 'none' }}>
                                                    {isEditMode && displayData.creditsApplied > 0 ? (
                                                        <Link href="#" underline="always" onClick={(e) => e.preventDefault()}>
                                                            {formatCurrency(displayData.creditsApplied, currencySymbol)}
                                                        </Link>
                                                    ) : (
                                                        formatCurrency(displayData.creditsApplied, currencySymbol)
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {currentThemeSettings.showExpensesAdjusted && (
                                             <TableRow>
                                                <TableCell sx={{ border: 'none' }}>Bill/Expenses Adjusted:</TableCell>
                                                <TableCell align="right" sx={{ border: 'none' }}>
                                                    {isEditMode && displayData.expensesAdjusted > 0 ? (
                                                        <Link href="#" underline="always" onClick={(e) => e.preventDefault()}>
                                                            {formatCurrency(displayData.expensesAdjusted, currencySymbol)}
                                                        </Link>
                                                    ) : (
                                                        formatCurrency(displayData.expensesAdjusted, currencySymbol)
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={1}>
                                 <Grid item xs={6}><Typography variant="h6" align="right">Balance Due:</Typography></Grid>
                                 <Grid item xs={6}><Typography variant="h6" align="right" color="error">{formatCurrency(displayData.balanceDue, currencySymbol)}</Typography></Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={isAddCustomerModalOpen} onClose={handleCloseAddCustomerModal}>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogContent>
                    <DialogContentText>Quickly add a customer. More details can be added from the customer menu.</DialogContentText>
                    {newCustomerError && <Alert severity="error" sx={{ my: 1 }}>{newCustomerError}</Alert>}
                    <TextField autoFocus margin="dense" name="displayName" label="Customer Name *" type="text" fullWidth variant="outlined" value={newCustomerData.displayName} onChange={handleNewCustomerDataChange} />
                    <Link component="button" variant="body2" onClick={() => window.open('/account-transaction/customer/new', '_blank')} sx={{ mt: 2, textAlign: 'center' }}>+ Add full customer details</Link>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddCustomerModal}>Cancel</Button>
                    <Button onClick={handleSaveNewCustomer} variant="contained" disabled={newCustomerLoading}>{newCustomerLoading ? <CircularProgress size={24} /> : "Save"}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddItemModalOpen} onClose={handleCloseAddItemModal}>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>Quickly add an item. More details can be added later from the inventory menu.</DialogContentText>
                    {newItemError && <Alert severity="error" sx={{ mt: 1 }}>{newItemError}</Alert>}
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
                        <Typography onClick={() => setNewItemData(p => ({ ...p, itemType: 'product' }))} sx={{ cursor: 'pointer', color: newItemData.itemType === 'product' ? 'primary.main' : 'text.secondary', fontWeight: 'bold' }}>Product</Typography>
                        <Switch checked={newItemData.itemType === 'service'} onChange={handleItemTypeSwitchChange} />
                        <Typography onClick={() => setNewItemData(p => ({ ...p, itemType: 'service' }))} sx={{ cursor: 'pointer', color: newItemData.itemType === 'service' ? 'primary.main' : 'text.secondary', fontWeight: 'bold' }}>Service</Typography>
                    </Box>
                    <TextField autoFocus margin="dense" name="itemName" label="Item Name *" type="text" fullWidth variant="outlined" value={newItemData.itemName} onChange={handleNewItemChange} />
                    <TextField margin="dense" name="salePrice" label="Sale Price *" type="number" fullWidth variant="outlined" value={newItemData.salePrice} onChange={handleNewItemChange} InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} />
                    <FormControl fullWidth margin="dense" size="small"><InputLabel>GST Rate</InputLabel><Select name="gstRate" value={newItemData.gstRate} label="GST Rate" onChange={handleNewItemChange}><MenuItem value={0}><em>None</em></MenuItem>{taxOptions.map(tax => (<MenuItem key={tax.id} value={tax.rate}>{tax.name}</MenuItem>))}</Select></FormControl>
                    <Link component="button" variant="body2" onClick={() => window.open('/Inventory?action=new', '_blank')} sx={{ mt: 2, textAlign: 'center' }}>+ Add detailed item</Link>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddItemModal}>Cancel</Button>
                    <Button onClick={handleSaveNewItem} variant="contained" disabled={newItemLoading}>{newItemLoading ? <CircularProgress size={24} /> : "Save"}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};