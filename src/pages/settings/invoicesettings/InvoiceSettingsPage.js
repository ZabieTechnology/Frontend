import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Grid, Paper, Typography, Button, Switch, FormControlLabel, TextField,
    Select, MenuItem, FormControl, InputLabel, Divider, CircularProgress, Alert,
    IconButton, Tooltip, Checkbox, Avatar, Accordion, AccordionSummary, AccordionDetails,
    Radio, RadioGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment
} from '@mui/material';
import {
    Save as SaveIcon, ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon, Image as ImageIcon, ViewQuilt as ViewQuiltIcon,
    ListAlt as ListAltIcon, Description as DescriptionIcon,
    SettingsApplications as SettingsApplicationsIcon, QrCodeScanner as QrCodeScannerIcon,
    ReceiptLong as ReceiptLongIcon, AccountBalance as AccountBalanceIcon, TextFields as TextFieldsIcon,
    Palette as PaletteIcon, Edit as EditIcon, Percent as PercentIcon,
    UnfoldMore as UnfoldMoreIcon, UnfoldLess as UnfoldLessIcon, Functions as FunctionsIcon, PostAdd as PostAddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InvoicePreview from './InvoicePreview';

// Base themes definition
const baseThemes = [
    { name: "Modern", previewImage: "/images/themes/001-bank.png" },
    { name: "Stylish", previewImage: "/images/themes/002-online banking.png" },
    { name: "Simple", previewImage: "/images/themes/038-tax.png" },
];

// Expanded color palette for better visibility and accessibility
const colorPalette = [
    '#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', '#009688', '#795548', '#000000',
    '#0D47A1', // Dark Blue
    '#4A148C', // Deep Purple
    '#1B5E20', // Dark Green
    '#B71C1C', // Dark Red
    '#FF6F00', // Amber Dark
    '#006064', // Cyan Dark
];

// Text color palette with more light colors added
const textColorPalette = ['#212121', '#D32F2F', '#1976D2', '#757575', '#616161', '#8D6E63'];

const MANDATORY_ITEM_COLUMNS = {
    pricePerItem: true,
    quantity: true,
};

const OPTIONAL_ITEM_COLUMNS_DEFAULT = {
    batchNo: false,
    expDate: false,
    mfgDate: false,
    discountPerItem: false,
    hsnSacCode: true,
    serialNo: false,
    showCess: false,
    showVat: false, // Added for VAT toggle
    showGrossValue: true,
};

const initialSingleThemeProfileData = {
    baseThemeName: "Simple",
    selectedColor: "#757575",
    textColor: "#212121",
    itemTableColumns: {
        ...MANDATORY_ITEM_COLUMNS,
        ...OPTIONAL_ITEM_COLUMNS_DEFAULT,
    },
    taxDisplayMode: 'breakdown', // 'no_tax' or 'breakdown'
    customItemColumns: [],
    invoiceHeading: "TAX INVOICE",
    invoicePrefix: "INV-",
    invoiceSuffix: "",
    showPoNumber: true,
    customHeaderFields: [],
    upiId: "",
    upiQrCodeImageUrl: "",
    bankAccountId: '',
    defaultSalesAccountId: '',
    showSaleAgentOnInvoice: false,
    showBillToSection: true,
    showShipToSection: true,
    // Added for payment received sections
    showAmountReceived: true,
    showCreditNoteIssued: true,
    showExpensesAdjusted: true,
    signatureImageUrl: '',
    authorisedSignatory: 'For (Your Company Name)',
    invoiceFooter: "",
    invoiceFooterImageUrl: "",
    termsAndConditionsId: '',
    notesDefault: "Thank you for your business!",
    // New Round Off Settings
    enableRounding: false,
    roundingMethod: 'auto', // 'auto' is the only option now
    invoiceTotalCalculation: 'auto', // 'auto' or 'manual'
    roundOffAccountId: '',
    // Additional Charges below subtotal
    additionalCharges: [
        // **NEW**: Mandatory Discount Row
        {
            id: 'mandatory_discount',
            label: 'Discount',
            valueType: 'percentage',
            value: 0,
            accountId: '',
            isMandatory: true,
            showInPreview: true,
        }
    ],
};

const initialGlobalSettings = {
    companyLogoUrl: "/images/default_logo.png",
    nextInvoiceNumber: 1,
    currency: "INR",
};

const rawInitialCompanyDetails = {
    name: "Your Company Name", address: "123 Main St, Anytown, USA", mobile: "555-1234",
    email: "contact@example.com", gstin: "YOUR_GSTIN_HERE",
};

const initialInvoiceSettings = {
    _id: null,
    global: initialGlobalSettings,
    savedThemes: [
        {
            id: `theme_profile_${Date.now()}`,
            profileName: 'Default Simple Grey',
            isDefault: true,
            ...JSON.parse(JSON.stringify(initialSingleThemeProfileData))
        }
    ],
};

const accordionKeys = [
    'themeProfiles', 'customizeTheme', 'titleAndNumber', 'headerFields',
    'showHideSections', 'itemTable', 'taxDisplay', 'totalsRounding', 'additionalCharges', 'paymentSettings',
    'accountingLink', 'signatureEtc', 'coreBusiness'
];

const getColumnLabel = (key, customItemColumns) => {
    if (key.startsWith('custom_item_')) {
        const customCol = customItemColumns.find(col => col.id === key);
        return customCol ? customCol.name : key;
    }
    const labels = {
        pricePerItem: "Price Per Item", quantity: "Quantity", batchNo: "Batch No", expDate: "Expiry Date",
        mfgDate: "Mfg Date", discountPerItem: "Discount Per Item", hsnSacCode: "HSN/SAC Code", serialNo: "Serial No",
        showGrossValue: "Gross Value",
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const InvoiceSettingsPage = () => {
    const [settings, setSettings] = useState(initialInvoiceSettings);
    const [activeThemeProfileId, setActiveThemeProfileId] = useState(
        settings.savedThemes.find(t => t.isDefault)?.id || (settings.savedThemes.length > 0 ? settings.savedThemes[0].id : null)
    );

    const [signatureImageFile, setSignatureImageFile] = useState(null);
    const [upiQrCodeFile, setUpiQrCodeFile] = useState(null);
    const [invoiceFooterImageFile, setInvoiceFooterImageFile] = useState(null);

    const [signaturePreview, setSignaturePreview] = useState(null);
    const [upiQrPreview, setUpiQrPreview] = useState(null);
    const [footerImagePreview, setFooterImagePreview] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [companyDetails, setCompanyDetails] = useState({
        ...rawInitialCompanyDetails,
        logoUrl: initialInvoiceSettings.global.companyLogoUrl,
    });

    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [profileToRename, setProfileToRename] = useState(null);
    const [newProfileName, setNewProfileName] = useState("");

    const [themeForPreviewStyle, setThemeForPreviewStyle] = useState({
        baseThemeName: settings.savedThemes.find(t => t.isDefault)?.baseThemeName || baseThemes[0].name,
        selectedColor: settings.savedThemes.find(t => t.isDefault)?.selectedColor || colorPalette[0],
        textColor: settings.savedThemes.find(t => t.isDefault)?.textColor || textColorPalette[0],
    });

    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [salesAccountOptions, setSalesAccountOptions] = useState([]);
    const [roundOffAccountOptions, setRoundOffAccountOptions] = useState([]);
    const [additionalChargeAccountOptions, setAdditionalChargeAccountOptions] = useState([]);

    // State for accordion expansion
    const [expandedAccordions, setExpandedAccordions] = useState({});

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedAccordions(prev => ({ ...prev, [panel]: isExpanded ? true : false }));
    };

    const handleExpandAll = () => {
        const allExpanded = accordionKeys.reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setExpandedAccordions(allExpanded);
    };

    const handleCollapseAll = () => {
        setExpandedAccordions({});
    };


    const getActiveThemeProfile = useCallback(() => {
        return settings.savedThemes.find(t => t.id === activeThemeProfileId);
    }, [settings.savedThemes, activeThemeProfileId]);

    useEffect(() => {
        const activeProfile = getActiveThemeProfile();
        if (activeProfile) {
            setSignaturePreview(activeProfile.signatureImageUrl ? (activeProfile.signatureImageUrl.startsWith('http') || activeProfile.signatureImageUrl.startsWith('data:') ? activeProfile.signatureImageUrl : `${API_BASE_URL}${activeProfile.signatureImageUrl.startsWith('/') ? '' : '/uploads/signatures/'}${activeProfile.signatureImageUrl}`) : null);
            setUpiQrPreview(activeProfile.upiQrCodeImageUrl ? (activeProfile.upiQrCodeImageUrl.startsWith('http') || activeProfile.upiQrCodeImageUrl.startsWith('data:') ? activeProfile.upiQrCodeImageUrl : `${API_BASE_URL}${activeProfile.upiQrCodeImageUrl.startsWith('/') ? '' : '/uploads/upi_qr/'}${activeProfile.upiQrCodeImageUrl}`) : null);
            setFooterImagePreview(activeProfile.invoiceFooterImageUrl ? (activeProfile.invoiceFooterImageUrl.startsWith('http') || activeProfile.invoiceFooterImageUrl.startsWith('data:') ? activeProfile.invoiceFooterImageUrl : `${API_BASE_URL}${activeProfile.invoiceFooterImageUrl.startsWith('/') ? '' : '/uploads/footers/'}${activeProfile.invoiceFooterImageUrl}`) : null);

            setSignatureImageFile(null);
            setUpiQrCodeFile(null);
            setInvoiceFooterImageFile(null);

            setThemeForPreviewStyle({
                baseThemeName: activeProfile.baseThemeName,
                selectedColor: activeProfile.selectedColor,
                textColor: activeProfile.textColor,
            });
        }
    }, [activeThemeProfileId, getActiveThemeProfile, API_BASE_URL]);

    const updatePreviewThemeFromDefault = useCallback((savedThemesArray) => {
        const defaultTheme = savedThemesArray.find(t => t.isDefault);
        if (defaultTheme) {
            setThemeForPreviewStyle({
                baseThemeName: defaultTheme.baseThemeName,
                selectedColor: defaultTheme.selectedColor,
                textColor: defaultTheme.textColor || textColorPalette[0],
            });
        } else if (savedThemesArray.length > 0) {
             setThemeForPreviewStyle({
                baseThemeName: savedThemesArray[0].baseThemeName,
                selectedColor: savedThemesArray[0].selectedColor,
                textColor: savedThemesArray[0].textColor || textColorPalette[0],
            });
        }
    }, []);

    const fetchBankAccounts = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Bank Accounts`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setBankAccountOptions(response.data.data.map(acc => ({
                    value: acc._id,
                    label: `${acc.name || 'N/A'} ${acc.code ? `(${acc.code})` : ''} ${acc.description ? `- ${acc.description.split('\n')[0].substring(0,30)}...` : ''}`.trim()
                })));
            } else {
                setBankAccountOptions([]);
            }
        } catch (err) {
            console.error("Error fetching bank accounts:", err);
            setError(prevError => prevError ? `${prevError}\nFailed to load bank accounts.` : "Failed to load bank accounts.");
            setBankAccountOptions([]);
        }
    }, [API_BASE_URL]);

    const fetchSalesAccounts = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Sales`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setSalesAccountOptions(response.data.data.map(acc => ({
                    value: acc._id,
                    label: `${acc.name || 'N/A'} ${acc.code ? `(${acc.code})` : ''}`.trim()
                })));
            } else {
                setSalesAccountOptions([]);
            }
        } catch (err) {
            console.error("Error fetching sales accounts:", err);
            setError(prevError => prevError ? `${prevError}\nFailed to load sales accounts.` : "Failed to load sales accounts.");
            setSalesAccountOptions([]);
        }
    }, [API_BASE_URL]);

    const fetchRoundOffAccounts = useCallback(async () => {
        try {
            const promises = [
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Expense`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Other Income`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Direct Incomes`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Sales`, { withCredentials: true }),
            ];

            const responses = await Promise.all(promises);

            const accounts = responses.flatMap(response => (response.data && Array.isArray(response.data.data)) ? response.data.data : []);

            if (accounts.length > 0) {
                const uniqueAccounts = Array.from(new Map(accounts.map(acc => [acc._id, acc])).values());
                setRoundOffAccountOptions(uniqueAccounts.map(acc => ({
                    value: acc._id,
                    label: `${acc.name || 'N/A'} ${acc.code ? `(${acc.code})` : ''} [${acc.accountType}]`.trim()
                })));
            } else {
                setRoundOffAccountOptions([]);
            }
        } catch (err) {
            console.error("Error fetching round-off accounts:", err);
            setError(prevError => prevError ? `${prevError}\nFailed to load round-off accounts.` : "Failed to load round-off accounts.");
            setRoundOffAccountOptions([]);
        }
    }, [API_BASE_URL]);

    // Fetches accounts from multiple types to provide a comprehensive list for additional charges.
    const fetchAdditionalChargeAccounts = useCallback(async () => {
        try {
            const promises = [
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Direct Incomes`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Other Income`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Expense`, { withCredentials: true }),
                axios.get(`${API_BASE_URL}/api/chart-of-accounts?accountType=Sales`, { withCredentials: true })
            ];

            const responses = await Promise.all(promises);

            const accounts = responses.flatMap(response => (response.data && Array.isArray(response.data.data)) ? response.data.data : []);

            if (accounts.length > 0) {
                // Using a Set to filter out duplicate accounts if any, then mapping to options.
                const uniqueAccounts = Array.from(new Map(accounts.map(acc => [acc._id, acc])).values());
                setAdditionalChargeAccountOptions(uniqueAccounts.map(acc => {
                    const isDeduction = ['Expense', 'Sales'].includes(acc.accountType);
                    const baseLabel = `${acc.name || 'N/A'} ${acc.code ? `(${acc.code})` : ''} [${acc.accountType}]`.trim();
                    return {
                        value: acc._id,
                        label: isDeduction ? `(-) ${baseLabel}` : baseLabel
                    };
                }));
            } else {
                setAdditionalChargeAccountOptions([]);
            }
        } catch (err) {
            console.error("Error fetching additional charge accounts:", err);
            setError(prevError => prevError ? `${prevError}\nFailed to load additional charge accounts.` : "Failed to load additional charge accounts.");
            setAdditionalChargeAccountOptions([]);
        }
    }, [API_BASE_URL]);


    const fetchInvoiceSettings = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/invoice-settings`, { withCredentials: true });
            if (response.data && response.data._id) {
                const fetched = response.data;
                const savedThemesFromServer = Array.isArray(fetched.savedThemes) && fetched.savedThemes.length > 0
                                                ? fetched.savedThemes
                                                : [{ ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)), id: `default_profile_${Date.now()}`, profileName: "Default Theme", isDefault: true }];

                const globalConf = fetched.global || initialGlobalSettings;

                const themesWithDefaults = savedThemesFromServer.map(theme => {
                    const fullTheme = {
                        ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)),
                        ...theme,
                        itemTableColumns: {
                            ...OPTIONAL_ITEM_COLUMNS_DEFAULT,
                            ...theme.itemTableColumns,
                            ...MANDATORY_ITEM_COLUMNS,
                        },
                        id: theme.id || `theme_profile_${Date.now()}_${Math.random()}`,
                    };

                    // **NEW**: Ensure mandatory discount charge exists for backward compatibility
                    if (!fullTheme.additionalCharges.some(c => c.id === 'mandatory_discount')) {
                        fullTheme.additionalCharges.unshift({
                            id: 'mandatory_discount',
                            label: 'Discount',
                            valueType: 'percentage',
                            value: 0,
                            accountId: '',
                            isMandatory: true,
                            showInPreview: true,
                        });
                    }
                    return fullTheme;
                });

                setSettings({
                    _id: fetched._id,
                    global: { ...initialGlobalSettings, ...globalConf },
                    savedThemes: themesWithDefaults,
                });

                const defaultTheme = themesWithDefaults.find(t => t.isDefault) || themesWithDefaults[0];
                setActiveThemeProfileId(defaultTheme.id);
                updatePreviewThemeFromDefault(themesWithDefaults);

                setCompanyDetails({
                    ...rawInitialCompanyDetails,
                    logoUrl: globalConf.companyLogoUrl || initialGlobalSettings.global.companyLogoUrl
                });

            } else {
                setSettings(initialInvoiceSettings);
                setActiveThemeProfileId(initialInvoiceSettings.savedThemes[0].id);
                updatePreviewThemeFromDefault(initialInvoiceSettings.savedThemes);
                setCompanyDetails({
                    ...rawInitialCompanyDetails,
                    logoUrl: initialInvoiceSettings.global.companyLogoUrl
                });
            }
        } catch (err) {
            console.error("Error fetching settings:", err); setError(`Failed to load settings: ${err.message}`);
            setSettings(initialInvoiceSettings);
            setActiveThemeProfileId(initialInvoiceSettings.savedThemes[0].id);
            updatePreviewThemeFromDefault(initialInvoiceSettings.savedThemes);
            setCompanyDetails({
                ...rawInitialCompanyDetails,
                logoUrl: initialInvoiceSettings.global.companyLogoUrl
            });
        } finally { setLoading(false); }
    }, [API_BASE_URL, updatePreviewThemeFromDefault]);

    // **NEW**: Effect to find and set the default "Discounts (Sales)" account
    useEffect(() => {
        if (additionalChargeAccountOptions.length > 0) {
            const discountAccount = additionalChargeAccountOptions.find(opt => opt.label.toLowerCase().includes('discounts (sales)'));
            if (discountAccount) {
                setSettings(prev => {
                    const newSavedThemes = prev.savedThemes.map(profile => {
                        const newCharges = (profile.additionalCharges || []).map(charge => {
                            if (charge.id === 'mandatory_discount' && !charge.accountId) {
                                return { ...charge, accountId: discountAccount.value };
                            }
                            return charge;
                        });
                        return { ...profile, additionalCharges: newCharges };
                    });
                    return { ...prev, savedThemes: newSavedThemes };
                });
            }
        }
    }, [additionalChargeAccountOptions]);


    useEffect(() => {
        fetchInvoiceSettings();
        fetchBankAccounts();
        fetchSalesAccounts();
        fetchRoundOffAccounts();
        fetchAdditionalChargeAccounts();
    }, [fetchInvoiceSettings, fetchBankAccounts, fetchSalesAccounts, fetchRoundOffAccounts, fetchAdditionalChargeAccounts]);

    const handleActiveThemeProfileChange = (eventOrPath, valueOrEvent) => {
        const activeId = activeThemeProfileId;
        if (!activeId) return;

        setSettings(prev => {
            const newSavedThemes = prev.savedThemes.map(profile => {
                if (profile.id === activeId) {
                    let updatedProfile;
                    if (typeof eventOrPath === 'string') {
                        const keys = eventOrPath.split('.');
                        let currentLevel = JSON.parse(JSON.stringify(profile));
                        let ref = currentLevel;
                        keys.forEach((key, index) => {
                            if (index === keys.length - 1) {
                                ref[key] = valueOrEvent;
                            } else {
                                ref[key] = { ...(ref[key] || {}) };
                                ref = ref[key];
                            }
                        });
                        updatedProfile = currentLevel;
                    } else {
                        const { name, value, type, checked } = eventOrPath.target;
                        const val = type === 'checkbox' || type === 'switch' ? checked : value;
                        updatedProfile = JSON.parse(JSON.stringify(profile));

                        if (name.includes('.')) {
                            const [key1, key2] = name.split('.');
                            if (!updatedProfile[key1]) updatedProfile[key1] = {};
                            updatedProfile[key1][key2] = val;
                        } else {
                            updatedProfile[name] = val;
                        }
                    }

                    if (eventOrPath === 'baseThemeName' || eventOrPath === 'selectedColor' || eventOrPath.target?.name === 'baseThemeName' || eventOrPath.target?.name === 'selectedColor' || eventOrPath === 'textColor') {
                        setThemeForPreviewStyle({
                            baseThemeName: updatedProfile.baseThemeName,
                            selectedColor: updatedProfile.selectedColor,
                            textColor: updatedProfile.textColor,
                        });
                    }
                    return updatedProfile;
                }
                return profile;
            });
            return { ...prev, savedThemes: newSavedThemes };
        });
    };

    const handleGlobalSettingChange = (event) => {
        const { name, value } = event.target;
        setSettings(prev => ({
            ...prev,
            global: {
                ...prev.global,
                [name]: value,
            }
        }));
        if (name === 'companyLogoUrl') {
            setCompanyDetails(prevCompDetails => ({ ...prevCompDetails, logoUrl: value }));
        }
    };

    const handleImageUpload = (file, fieldPrefix) => {
        if (!activeThemeProfileId || !file) return;
        const fileStateSetter = {
            signatureImage: setSignatureImageFile,
            upiQrCodeImage: setUpiQrCodeFile,
            invoiceFooterImage: setInvoiceFooterImageFile,
        }[fieldPrefix];
        const urlStateField = `${fieldPrefix}ImageUrl`;
        const previewSetter = {
            signatureImage: setSignaturePreview,
            upiQrCodeImage: setUpiQrPreview,
            invoiceFooterImage: setFooterImagePreview,
        }[fieldPrefix];

        if(fileStateSetter) fileStateSetter(file);

        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile =>
                profile.id === activeThemeProfileId
                    ? { ...profile, [urlStateField]: '' }
                    : profile
            )
        }));
        if(previewSetter) previewSetter(URL.createObjectURL(file));
    };

    const handleSignatureUpload = (event) => handleImageUpload(event.target.files[0], 'signatureImage');
    const handleUpiQrUpload = (event) => handleImageUpload(event.target.files[0], 'upiQrCodeImage');
    const handleFooterImageUpload = (event) => handleImageUpload(event.target.files[0], 'invoiceFooterImage');

    const handleRemoveImage = (fieldPrefix) => {
        if (!activeThemeProfileId) return;
        const fileStateSetter = {
            signatureImage: setSignatureImageFile,
            upiQrCodeImage: setUpiQrCodeFile,
            invoiceFooterImage: setInvoiceFooterImageFile,
        }[fieldPrefix];
        const urlStateField = `${fieldPrefix}ImageUrl`;
        const previewSetter = {
            signatureImage: setSignaturePreview,
            upiQrCodeImage: setUpiQrPreview,
            invoiceFooterImage: setFooterImagePreview,
        }[fieldPrefix];

        if(fileStateSetter) fileStateSetter(null);
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile =>
                profile.id === activeThemeProfileId
                    ? { ...profile, [urlStateField]: '' }
                    : profile
            )
        }));
        if(previewSetter) previewSetter(null);
    };

    const handleAddCustomColumn = () => {
        if (!activeThemeProfileId) return;
        const newColId = `custom_item_${Date.now()}`;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile => {
                if (profile.id === activeThemeProfileId) {
                    const updatedItemTableColumns = { ...(profile.itemTableColumns || initialSingleThemeProfileData.itemTableColumns), [newColId]: true };
                    const updatedCustomItemColumns = [...(profile.customItemColumns || []), { id: newColId, name: '', type: 'text' }];
                    return { ...profile, itemTableColumns: updatedItemTableColumns, customItemColumns: updatedCustomItemColumns };
                }
                return profile;
            })
        }));
    };

    const handleCustomColumnNameChange = (id, newName) => {
       if (!activeThemeProfileId) return;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile =>
                profile.id === activeThemeProfileId
                    ? { ...profile, customItemColumns: (profile.customItemColumns || []).map(col => col.id === id ? { ...col, name: newName } : col) }
                    : profile
            )
        }));
    };

    const handleRemoveCustomColumn = (idToRemove) => {
        if (!activeThemeProfileId) return;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile => {
                if (profile.id === activeThemeProfileId) {
                    const updatedCustomItems = (profile.customItemColumns || []).filter(col => col.id !== idToRemove);
                    const { [idToRemove]: _, ...updatedItemTableColumns } = (profile.itemTableColumns || initialSingleThemeProfileData.itemTableColumns);
                    return { ...profile, customItemColumns: updatedCustomItems, itemTableColumns: updatedItemTableColumns };
                }
                return profile;
            })
        }));
    };

    const handleAddCustomHeaderField = () => {
        if(!activeThemeProfileId) return;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(p =>
                p.id === activeThemeProfileId ? { ...p, customHeaderFields: [...(p.customHeaderFields || []), {id: `custom_header_${Date.now()}`, label: '', displayOnInvoice: true, type: 'text', defaultValue: ''}]} : p
            )
        }));
    };

    const handleCustomHeaderFieldChange = (id, event) => {
        if(!activeThemeProfileId) return;
        const { name, value, checked, type: inputType } = event.target;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(p => {
                if (p.id === activeThemeProfileId) {
                    return {
                        ...p,
                        customHeaderFields: (p.customHeaderFields || []).map(field => {
                            if (field.id === id) {
                                const newField = { ...field };
                                const val = inputType === 'checkbox' ? checked : value;

                                if (name === 'type') {
                                    newField.type = val;
                                    // Reset default value when type changes
                                    if (val === 'tick_box') {
                                        newField.defaultValue = false;
                                    } else if (val === 'yes_no_radio') {
                                        newField.defaultValue = 'no';
                                    } else {
                                        newField.defaultValue = '';
                                    }
                                } else {
                                   newField[name] = val;
                                }
                                return newField;
                            }
                            return field;
                        })
                    };
                }
                return p;
            })
        }));
    };

    const handleRemoveCustomHeaderField = (idToRemove) => {
       if(!activeThemeProfileId) return;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(p =>
                p.id === activeThemeProfileId ? { ...p, customHeaderFields: (p.customHeaderFields || []).filter(field => field.id !== idToRemove)} : p
            )
        }));
    };

    const handleAddAdditionalCharge = () => {
        if (!activeThemeProfileId) return;
        const newCharge = {
            id: `charge_${Date.now()}`,
            label: '',
            valueType: 'percentage',
            value: 0,
            accountId: ''
        };
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile =>
                profile.id === activeThemeProfileId
                    ? { ...profile, additionalCharges: [...(profile.additionalCharges || []), newCharge] }
                    : profile
            )
        }));
    };

    // **UPDATED**: Handles changes for additional charges, including the new checkbox
    const handleAdditionalChargeChange = (id, eventOrKey, value) => {
        if (!activeThemeProfileId) return;

        let changes;
        if (typeof eventOrKey === 'object' && eventOrKey.target) { // It's a standard event from textfield/select
            const { name, value: eventValue } = eventOrKey.target;
            changes = { [name]: eventValue };
        } else { // It's a custom call for the checkbox: ('showInPreview', true)
            changes = { [eventOrKey]: value };
        }

        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile =>
                profile.id === activeThemeProfileId
                    ? {
                        ...profile,
                        additionalCharges: (profile.additionalCharges || []).map(charge =>
                            charge.id === id ? { ...charge, ...changes } : charge
                        )
                    }
                    : profile
            )
        }));
    };

    const handleRemoveAdditionalCharge = (idToRemove) => {
        if (!activeThemeProfileId) return;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(profile =>
                profile.id === activeThemeProfileId
                    ? { ...profile, additionalCharges: (profile.additionalCharges || []).filter(charge => charge.id !== idToRemove) }
                    : profile
            )
        }));
    };

    const handleAddNewThemeProfile = () => {
        const newId = `theme_profile_${Date.now()}`;
        const newProfile = {
            ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)),
            id: newId,
            profileName: `New Theme ${settings.savedThemes.length + 1}`,
            isDefault: settings.savedThemes.length === 0,
        };
        setSettings(prev => ({
            ...prev,
            savedThemes: [...prev.savedThemes, newProfile]
        }));
        setActiveThemeProfileId(newId);
    };

    const openRenameDialog = (profile) => {
        setProfileToRename(profile);
        setNewProfileName(profile.profileName);
        setRenameDialogOpen(true);
    };

    const handleRenameProfile = () => {
        if (profileToRename && newProfileName.trim() !== "") {
            setSettings(prev => ({
                ...prev,
                savedThemes: prev.savedThemes.map(p =>
                    p.id === profileToRename.id ? { ...p, profileName: newProfileName.trim() } : p
                )
            }));
        }
        setRenameDialogOpen(false);
        setProfileToRename(null);
    };

    const handleSetDefaultThemeProfile = (idToSetAsDefault) => {
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(theme => ({
                ...theme,
                isDefault: theme.id === idToSetAsDefault
            }))
        }));
        const newDefault = settings.savedThemes.find(t => t.id === idToSetAsDefault);
        if (newDefault) {
             setThemeForPreviewStyle({
                baseThemeName: newDefault.baseThemeName,
                selectedColor: newDefault.selectedColor,
                textColor: newDefault.textColor || textColorPalette[0]
            });
        }
    };

    const handleDeleteThemeProfile = (idToDelete) => {
        if (settings.savedThemes.length <= 1) {
            setError("Cannot delete the last theme profile. At least one must exist.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        const themeToDelete = settings.savedThemes.find(t => t.id === idToDelete);
        if (themeToDelete?.isDefault) {
            setError("Cannot delete the default theme profile. Set another as default first.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        const remainingThemes = settings.savedThemes.filter(theme => theme.id !== idToDelete);
        setSettings(prev => ({
            ...prev,
            savedThemes: remainingThemes
        }));
        if (activeThemeProfileId === idToDelete) {
            const defaultTheme = remainingThemes.find(t => t.isDefault) || (remainingThemes.length > 0 ? remainingThemes[0] : null);
            if (defaultTheme) {
                setActiveThemeProfileId(defaultTheme.id);
            } else {
                setActiveThemeProfileId(null);
            }
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true); setError(null); setSuccess(null);
        const activeProfileForValidation = getActiveThemeProfile();

        if (activeProfileForValidation) {
            if (!activeProfileForValidation.defaultSalesAccountId) {
                setError("Accounting Link Settings: Default Sales Account is mandatory for the active theme.");
                setLoading(false);
                setTimeout(() => setError(null), 5000);
                return;
            }
            if (activeProfileForValidation.enableRounding && !activeProfileForValidation.roundOffAccountId) {
                setError("Totals & Rounding Settings: Round Off Account is mandatory when rounding is enabled.");
                setLoading(false);
                setTimeout(() => setError(null), 5000);
                return;
            }
            const emptyCustomItemCol = (activeProfileForValidation.customItemColumns || []).find(col => col.name.trim() === '');
            if (emptyCustomItemCol) {
                setError("Custom item column names cannot be empty for the active theme."); setLoading(false); setTimeout(() => setError(null), 5000); return;
            }
            const emptyCustomHeaderField = (activeProfileForValidation.customHeaderFields || []).find(field => field.label.trim() === '');
            if (emptyCustomHeaderField) {
                setError("Custom header field labels cannot be empty for the active theme."); setLoading(false); setTimeout(() => setError(null), 5000); return;
            }
            // VALIDATION: An accounting ledger is no longer mandatory, but a label is required if a value is entered.
            const invalidAdditionalCharge = (activeProfileForValidation.additionalCharges || []).find(
                charge => (charge.value && Number(charge.value) !== 0) && !charge.label.trim()
            );
            if(invalidAdditionalCharge) {
                setError("Additional Charges must have a label if a value is entered."); setLoading(false); setTimeout(() => setError(null), 5000); return;
            }
        }
        if (!settings.savedThemes.some(theme => theme.isDefault)) {
            setError("Critical: No default theme set. Please set one."); setLoading(false); setTimeout(() => setError(null), 5000); return;
        }
         settings.savedThemes.forEach(theme => {
            if (theme.profileName.trim() === '') {
                 setError(`Theme profile name for ID ${theme.id.slice(-4)} cannot be empty.`); setLoading(false); setTimeout(() => setError(null), 5000); return;
            }
        });

        const payload = new FormData();
        payload.append('global', JSON.stringify(settings.global));

        const themesToSave = settings.savedThemes.map(profile => {
            const { signatureImageFile, upiQrCodeFile, invoiceFooterImageFile, ...restOfProfile } = profile;
            return {
                ...restOfProfile,
                itemTableColumns: {
                    ...profile.itemTableColumns,
                    ...MANDATORY_ITEM_COLUMNS
                },
                signatureImageUrl: profile.signatureImageUrl || '',
                upiQrCodeImageUrl: profile.upiQrCodeImageUrl || '',
                invoiceFooterImageUrl: profile.invoiceFooterImageUrl || '',
            };
        });
        payload.append('savedThemes', JSON.stringify(themesToSave));

        const activeProfileForSave = getActiveThemeProfile();
        if (activeProfileForSave) {
            if (signatureImageFile) payload.append(`signatureImage_${activeProfileForSave.id}`, signatureImageFile, signatureImageFile.name);
            else if (!signatureImageFile && !activeProfileForSave.signatureImageUrl) payload.append(`removeSignature_${activeProfileForSave.id}`, 'true');

            if (upiQrCodeFile) payload.append(`upiQrCodeImage_${activeProfileForSave.id}`, upiQrCodeFile, upiQrCodeFile.name);
            else if (!upiQrCodeFile && !activeProfileForSave.upiQrCodeImageUrl) payload.append(`removeUpiQrCode_${activeProfileForSave.id}`, 'true');

            if (invoiceFooterImageFile) payload.append(`invoiceFooterImage_${activeProfileForSave.id}`, invoiceFooterImageFile, invoiceFooterImageFile.name);
            else if (!invoiceFooterImageFile && !activeProfileForSave.invoiceFooterImageUrl) payload.append(`removeFooterImage_${activeProfileForSave.id}`, 'true');
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/invoice-settings`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true,
            });
            setSuccess("Invoice settings saved successfully!");
            if (response.data && response.data.data) {
                 const saved = response.data.data;
                 const savedThemesFromServer = Array.isArray(saved.savedThemes) && saved.savedThemes.length > 0
                                                 ? saved.savedThemes
                                                 : [{ ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)), id: `default_profile_${Date.now()}`, profileName: "Default Theme", isDefault: true }];

                 const themesWithDefaults = savedThemesFromServer.map(theme => {
                    const fullTheme = {
                        ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)),
                        ...theme,
                        itemTableColumns: {
                            ...MANDATORY_ITEM_COLUMNS,
                            ...(theme.itemTableColumns || OPTIONAL_ITEM_COLUMNS_DEFAULT)
                        },
                        signatureImageFile: null,
                        upiQrCodeFile: null,
                        invoiceFooterImageFile: null,
                    };

                    if (!fullTheme.additionalCharges.some(c => c.id === 'mandatory_discount')) {
                        fullTheme.additionalCharges.unshift({
                            id: 'mandatory_discount',
                            label: 'Discount',
                            valueType: 'percentage',
                            value: 0,
                            accountId: '',
                            isMandatory: true,
                            showInPreview: true,
                        });
                    }
                    return fullTheme;
                });

                 setSettings(prev => ({
                    ...prev,
                    _id: saved._id,
                    global: { ...initialGlobalSettings, ...(saved.global || {})},
                    savedThemes: themesWithDefaults,
                 }));

                const newActiveDefault = themesWithDefaults.find(t => t.isDefault) || themesWithDefaults[0];
                setActiveThemeProfileId(newActiveDefault.id);
                updatePreviewThemeFromDefault(themesWithDefaults);
            }
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Error saving settings:", err); setError(`Failed to save settings: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setError(null), 5000);
        } finally { setLoading(false); }
    };


    if (loading || !activeThemeProfileId) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    const activeProfileForSettingsUI = settings.savedThemes.find(t => t.id === activeThemeProfileId) || settings.savedThemes[0];

    if (!activeProfileForSettingsUI) {
         return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Typography color="error">Error: No theme profile available for editing.</Typography></Box>;
    }

    // **NEW**: Filter charges for the preview based on the 'showInPreview' checkbox for the discount row
    const chargesForPreview = (activeProfileForSettingsUI.additionalCharges || []).filter(charge => {
        if (charge.id === 'mandatory_discount') {
            return !!charge.showInPreview;
        }
        return true;
    });

    const settingsForPreview = {
        ...activeProfileForSettingsUI,
        activeThemeName: themeForPreviewStyle.baseThemeName,
        selectedColor: themeForPreviewStyle.selectedColor,
        textColor: themeForPreviewStyle.textColor,
        companyLogoUrl: settings.global.companyLogoUrl,
        currency: settings.global.currency,
        nextInvoiceNumber: settings.global.nextInvoiceNumber,
        additionalCharges: chargesForPreview
    };

    const toggleableItemColumns = Object.keys(activeProfileForSettingsUI.itemTableColumns || initialSingleThemeProfileData.itemTableColumns)
        .filter(key => key !== 'showCess' && key !== 'showVat' && !MANDATORY_ITEM_COLUMNS.hasOwnProperty(key) && (initialSingleThemeProfileData.itemTableColumns.hasOwnProperty(key) || key.startsWith('custom_item_')))
        .sort((a,b) => {
            const aIsCustom = a.startsWith('custom_item_');
            const bIsCustom = b.startsWith('custom_item_');
            if (aIsCustom && !bIsCustom) return 1;
            if (!aIsCustom && bIsCustom) return -1;
            return a.localeCompare(b);
        });

    const SubheadingLabel = ({ children }) => (
        <Box sx={{ px: 2, pb: 2, mt: -1 }}>
            <Typography
                component="span"
                sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    bgcolor: '#E8F5E9',
                    color: '#388E3C',
                    borderRadius: '16px',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                }}
            >
                {children}
            </Typography>
        </Box>
    );


    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Invoice Settings &amp; Customization</Typography>
                <IconButton onClick={() => navigate(-1)} aria-label="go back"><ArrowBackIcon /></IconButton>
            </Paper>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={5} lg={4}>
                    <Paper elevation={2} sx={{ p: 2.5, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                        {activeProfileForSettingsUI && (
                            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'primary.main' }}>
                                <Typography variant="h6" gutterBottom>
                                    Summary for: <strong>{activeProfileForSettingsUI.profileName}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    Color: <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: activeProfileForSettingsUI.selectedColor, ml: 1, border: '1px solid #ccc' }} />
                                    <Box component="span" sx={{ ml: 0.5 }}>{activeProfileForSettingsUI.selectedColor}</Box>
                                </Typography>
                                 <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    Text Color: <Box component="span" sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: activeProfileForSettingsUI.textColor, ml: 1, border: '1px solid #ccc' }} />
                                    <Box component="span" sx={{ ml: 0.5 }}>{activeProfileForSettingsUI.textColor}</Box>
                                </Typography>
                                <Typography variant="body2">Currency: {settings.global.currency}</Typography>
                                <Typography variant="body2">
                                    Sales Ledger: {salesAccountOptions.find(o => o.value === activeProfileForSettingsUI.defaultSalesAccountId)?.label || 'Not Set'}
                                </Typography>
                            </Paper>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                            <Tooltip title="Expand All">
                                <IconButton onClick={handleExpandAll} size="small"><UnfoldMoreIcon /></IconButton>
                            </Tooltip>
                            <Tooltip title="Collapse All">
                                <IconButton onClick={handleCollapseAll} size="small"><UnfoldLessIcon /></IconButton>
                            </Tooltip>
                        </Box>

                        <Accordion expanded={!!expandedAccordions['themeProfiles']} onChange={handleAccordionChange('themeProfiles')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography><ViewQuiltIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Manage Theme Profiles</Typography>
                            </AccordionSummary>
                            <SubheadingLabel>Switch and organize saved theme profiles with ease.</SubheadingLabel>
                             <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <FormControl fullWidth>
                                    <Typography variant="subtitle2" gutterBottom>Select a profile to edit or set as default</Typography>
                                    <RadioGroup
                                        value={settings.savedThemes.find(t => t.isDefault)?.id || ''}
                                        onChange={(e) => handleSetDefaultThemeProfile(e.target.value)}
                                    >
                                        {settings.savedThemes.map(theme => (
                                            <Paper
                                                key={theme.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    borderColor: activeThemeProfileId === theme.id ? 'primary.main' : 'grey.300',
                                                    borderWidth: activeThemeProfileId === theme.id ? 2 : 1,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                                    <Radio value={theme.id} />
                                                    <Typography sx={{ ml: 1 }}>
                                                        {theme.profileName} {theme.isDefault ? "(Default)" : ""}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    onClick={() => setActiveThemeProfileId(theme.id)}
                                                    disabled={activeThemeProfileId === theme.id}
                                                >
                                                    Edit
                                                </Button>
                                            </Paper>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <Button size="small" startIcon={<AddIcon />} onClick={handleAddNewThemeProfile} variant="outlined" sx={{alignSelf: 'flex-start'}}>Add New Theme Profile</Button>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion expanded={!!expandedAccordions['customizeTheme']} onChange={handleAccordionChange('customizeTheme')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography><PaletteIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Customize Active Theme</Typography>
                            </AccordionSummary>
                             <SubheadingLabel>Edit the look and feel of your current theme.</SubheadingLabel>
                            <AccordionDetails>
                                {activeProfileForSettingsUI && (
                                  <Paper variant="outlined" sx={{p:1.5}}>
                                      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                         <Typography variant="subtitle1" gutterBottom>{activeProfileForSettingsUI.profileName}</Typography>
                                         <Box>
                                            <IconButton size="small" onClick={() => openRenameDialog(activeProfileForSettingsUI)}><EditIcon fontSize="small"/></IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteThemeProfile(activeProfileForSettingsUI.id)} color="error" disabled={settings.savedThemes.length <= 1 || activeProfileForSettingsUI.isDefault}><DeleteIcon fontSize="inherit"/></IconButton>
                                         </Box>
                                      </Box>
                                      <FormControl fullWidth size="small" sx={{my:1}}>
                                          <InputLabel>Base Theme</InputLabel>
                                          <Select
                                              name="baseThemeName"
                                              value={activeProfileForSettingsUI.baseThemeName}
                                              label="Base Theme"
                                              onChange={(e) => handleActiveThemeProfileChange('baseThemeName', e.target.value)}
                                          >
                                              {baseThemes.map(bt => <MenuItem key={bt.name} value={bt.name}>{bt.name}</MenuItem>)}
                                          </Select>
                                      </FormControl>
                                      <Typography variant="caption">Accent Color:</Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt:0.5 }}>
                                          {colorPalette.map(color => (
                                              <Tooltip title={color} key={`${activeThemeProfileId}-${color}`}>
                                                  <Box onClick={() => handleActiveThemeProfileChange('selectedColor', color)}
                                                       sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: color, cursor: 'pointer', border: activeProfileForSettingsUI.selectedColor === color ? '3px solid white' : `1px solid ${color}`, boxShadow: activeProfileForSettingsUI.selectedColor === color ? `0 0 0 2px ${color}` : '0 1px 2px rgba(0,0,0,0.2)' }}/>
                                              </Tooltip>
                                          ))}
                                      </Box>
                                       <Typography variant="caption">Text Color:</Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt:0.5 }}>
                                          {textColorPalette.map(color => (
                                              <Tooltip title={color} key={`${activeThemeProfileId}-text-${color}`}>
                                                  <Box onClick={() => handleActiveThemeProfileChange('textColor', color)}
                                                       sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: color, cursor: 'pointer', border: `1px solid ${color === '#FFFFFF' ? '#ccc' : 'transparent'}`, outline: activeProfileForSettingsUI.textColor === color ? `2px solid ${activeProfileForSettingsUI.selectedColor}` : 'none', outlineOffset: '2px' }}/>
                                              </Tooltip>
                                          ))}
                                      </Box>
                                  </Paper>
                                )}
                            </AccordionDetails>
                        </Accordion>


                        {activeProfileForSettingsUI && (
                            <>
                                <Accordion expanded={!!expandedAccordions['titleAndNumber']} onChange={handleAccordionChange('titleAndNumber')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><ReceiptLongIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Invoice Title & Number Format</Typography></AccordionSummary>
                                    <SubheadingLabel>Edit invoice title and define how invoice numbers are generated.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <TextField name="invoiceHeading" label="Invoice Heading" value={activeProfileForSettingsUI.invoiceHeading} onChange={(e) => handleActiveThemeProfileChange('invoiceHeading', e.target.value)} size="small" fullWidth />
                                        <TextField name="invoicePrefix" label="Invoice Prefix" value={activeProfileForSettingsUI.invoicePrefix} onChange={(e) => handleActiveThemeProfileChange('invoicePrefix', e.target.value)} size="small" fullWidth />
                                        <TextField name="invoiceSuffix" label="Invoice Suffix" value={activeProfileForSettingsUI.invoiceSuffix} onChange={(e) => handleActiveThemeProfileChange('invoiceSuffix', e.target.value)} size="small" fullWidth />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['headerFields']} onChange={handleAccordionChange('headerFields')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><TextFieldsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Add Custom Header Fields</Typography></AccordionSummary>
                                    <SubheadingLabel>Include additional details like PO Number, Project Name, etc.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showPoNumber} onChange={(e) => handleActiveThemeProfileChange('showPoNumber', e.target.checked)} name="showPoNumber" />} label="Show PO Number field on Invoice" />
                                        <Divider sx={{my: 2}}/>
                                        <Button size="small" startIcon={<AddIcon />} onClick={handleAddCustomHeaderField} variant="text" sx={{alignSelf: 'flex-start', mb:1}}>Add Header Field</Button>
                                        {(activeProfileForSettingsUI.customHeaderFields || []).map((field) => (
                                            <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} sm={5}>
                                                        <TextField name="label" label="Field Label" value={field.label} onChange={(e) => handleCustomHeaderFieldChange(field.id, e)} size="small" fullWidth />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <FormControl size="small" fullWidth>
                                                            <InputLabel>Type</InputLabel>
                                                            <Select name="type" value={field.type || 'text'} label="Type" onChange={(e) => handleCustomHeaderFieldChange(field.id, e)}>
                                                                <MenuItem value="text">Text</MenuItem>
                                                                <MenuItem value="number">Number</MenuItem>
                                                                <MenuItem value="date">Date</MenuItem>
                                                                <MenuItem value="date_month_year">Date (Month/Year)</MenuItem>
                                                                <MenuItem value="tick_box">Tick box</MenuItem>
                                                                <MenuItem value="yes_no_radio">Yes/No (Radio)</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                        <FormControlLabel control={<Checkbox name="displayOnInvoice" checked={!!field.displayOnInvoice} onChange={(e) => handleCustomHeaderFieldChange(field.id, e)} size="small" />} label="Show" />
                                                        <IconButton size="small" onClick={() => handleRemoveCustomHeaderField(field.id)} color="error"><DeleteIcon fontSize="inherit" /></IconButton>
                                                    </Grid>
                                                    {(field.type === 'tick_box' || field.type === 'yes_no_radio') && (
                                                        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', pt: '8px !important' }}>
                                                            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>Default:</Typography>
                                                            {field.type === 'tick_box' && (
                                                                <FormControlLabel control={<Checkbox name="defaultValue" checked={!!field.defaultValue} onChange={(e) => handleCustomHeaderFieldChange(field.id, e)} size="small" />} label="Checked" />
                                                            )}
                                                            {field.type === 'yes_no_radio' && (
                                                                <FormControl component="fieldset" size="small">
                                                                    <RadioGroup row name="defaultValue" value={field.defaultValue || 'no'} onChange={(e) => handleCustomHeaderFieldChange(field.id, e)}>
                                                                        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                                                                        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                                                                    </RadioGroup>
                                                                </FormControl>
                                                            )}
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Paper>
                                        ))}
                                        {(activeProfileForSettingsUI.customHeaderFields || []).length === 0 && (<Typography variant="caption" color="textSecondary" display="block">No custom header fields defined for this theme.</Typography>)}
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['showHideSections']} onChange={handleAccordionChange('showHideSections')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><SettingsApplicationsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Show/Hide Invoice Sections</Typography></AccordionSummary>
                                    <SubheadingLabel>Choose to show or hide fields like billing address, shipping info, etc.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showBillToSection} onChange={(e) => handleActiveThemeProfileChange('showBillToSection', e.target.checked)} name="showBillToSection" />} label="Show 'Bill To' Section" />
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showShipToSection} onChange={(e) => handleActiveThemeProfileChange('showShipToSection', e.target.checked)} name="showShipToSection" />} label="Show 'Ship To' Section" />
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showSaleAgentOnInvoice} onChange={(e) => handleActiveThemeProfileChange('showSaleAgentOnInvoice', e.target.checked)} name="showSaleAgentOnInvoice" />} label="Show Sale Agent" />
                                        <Divider sx={{my:1}}><Typography variant="caption">Payment Summary</Typography></Divider>
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showAmountReceived} onChange={(e) => handleActiveThemeProfileChange('showAmountReceived', e.target.checked)} name="showAmountReceived" />} label="Show 'Amount Received'" />
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showCreditNoteIssued} onChange={(e) => handleActiveThemeProfileChange('showCreditNoteIssued', e.target.checked)} name="showCreditNoteIssued" />} label="Show 'Credit Note Issued'" />
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showExpensesAdjusted} onChange={(e) => handleActiveThemeProfileChange('showExpensesAdjusted', e.target.checked)} name="showExpensesAdjusted" />} label="Show 'Expenses Adjusted'" />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['itemTable']} onChange={handleAccordionChange('itemTable')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><ListAltIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Item Table Columns</Typography></AccordionSummary>
                                    <SubheadingLabel>Decide which item details (like rate, quantity) appear in the invoice.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>Column Visibility</Typography>
                                            <Typography variant="caption" display="block" sx={{mb:1}}>Mandatory: Price, Qty.</Typography>
                                            <Grid container spacing={0.5}>
                                                {toggleableItemColumns.map((key) => (
                                                    <Grid item xs={6} sm={12} md={6} key={key}>
                                                        <FormControlLabel control={<Checkbox checked={!!activeProfileForSettingsUI.itemTableColumns[key]} onChange={(e) => handleActiveThemeProfileChange(`itemTableColumns.${key}`, e.target.checked)} name={key} size="small"/>} label={getColumnLabel(key, activeProfileForSettingsUI.customItemColumns || [])} sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }} />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                <Typography variant="subtitle2">Manage Custom Columns</Typography>
                                                <Button size="small" startIcon={<AddIcon />} onClick={handleAddCustomColumn} variant="outlined">Add Column</Button>
                                            </Box>
                                            {(activeProfileForSettingsUI.customItemColumns || []).map((col) => (
                                                <Box key={col.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <TextField label="Column Name" value={col.name} onChange={(e) => handleCustomColumnNameChange(col.id, e.target.value)} size="small" variant="outlined" sx={{flexGrow:1}} placeholder="Enter display name" />
                                                    <IconButton size="small" onClick={() => handleRemoveCustomColumn(col.id)} color="error"><DeleteIcon fontSize="inherit"/></IconButton>
                                                </Box>
                                            ))}
                                            {(activeProfileForSettingsUI.customItemColumns || []).length === 0 && (<Typography variant="caption" color="textSecondary" display="block">No custom item columns defined.</Typography>)}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['taxDisplay']} onChange={handleAccordionChange('taxDisplay')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography><PercentIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Tax Display Settings</Typography>
                                    </AccordionSummary>
                                    <SubheadingLabel>Set how tax amounts or labels appear on invoices.</SubheadingLabel>
                                    <AccordionDetails>
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                aria-label="tax-display-mode"
                                                name="taxDisplayMode"
                                                value={activeProfileForSettingsUI.taxDisplayMode || 'breakdown'}
                                                onChange={(e) => handleActiveThemeProfileChange(e)}
                                            >
                                                <FormControlLabel value="no_tax" control={<Radio />} label="No Tax (e.g., for Bill of Supply)" />
                                                <FormControlLabel value="breakdown" control={<Radio />} label="Show GST/VAT Breakdown" />
                                            </RadioGroup>
                                        </FormControl>
                                        <Box sx={{ pl: 4, mt: 1, display: 'flex', flexDirection: 'column' }}>
                                             <FormControlLabel
                                                control={<Switch
                                                    checked={!!activeProfileForSettingsUI.itemTableColumns.showCess}
                                                    onChange={(e) => handleActiveThemeProfileChange('itemTableColumns.showCess', e.target.checked)}
                                                    name="showCess"
                                                    disabled={activeProfileForSettingsUI.taxDisplayMode !== 'breakdown'}
                                                />}
                                                label="Show CESS % in line item"
                                            />
                                            <FormControlLabel
                                                control={<Switch
                                                    checked={!!activeProfileForSettingsUI.itemTableColumns.showVat}
                                                    onChange={(e) => handleActiveThemeProfileChange('itemTableColumns.showVat', e.target.checked)}
                                                    name="showVat"
                                                    disabled={activeProfileForSettingsUI.taxDisplayMode !== 'breakdown'}
                                                />}
                                                label="Show VAT % in line item"
                                            />
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['additionalCharges']} onChange={handleAccordionChange('additionalCharges')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography><PostAddIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Additional Charges</Typography>
                                    </AccordionSummary>
                                    <SubheadingLabel>Add charges like shipping or insurance below the subtotal.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Button size="small" startIcon={<AddIcon />} onClick={handleAddAdditionalCharge} variant="text" sx={{alignSelf: 'flex-start', mb:1}}>Add Charge</Button>
                                        {(activeProfileForSettingsUI.additionalCharges || []).map((charge) => (
                                            <Paper key={charge.id} variant="outlined" sx={{ p: 2, mb: 1, backgroundColor: charge.isMandatory ? 'grey.50' : 'inherit', border: charge.isMandatory ? '1px solid #ddd' : '1px solid #eee' }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField name="label" label="Charge Label" value={charge.label} onChange={(e) => handleAdditionalChargeChange(charge.id, e)} size="small" fullWidth InputProps={{ readOnly: charge.isMandatory }} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Account</InputLabel>
                                                            <Select name="accountId" value={charge.accountId} label="Account" onChange={(e) => handleAdditionalChargeChange(charge.id, e)}>
                                                                <MenuItem value=""><em>None</em></MenuItem>
                                                                {additionalChargeAccountOptions.map(opt => (
                                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Value Type</InputLabel>
                                                            <Select name="valueType" value={charge.valueType} label="Value Type" onChange={(e) => handleAdditionalChargeChange(charge.id, e)}>
                                                                <MenuItem value="percentage">Percentage</MenuItem>
                                                                <MenuItem value="fixed">Fixed Amount</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField
                                                            name="value"
                                                            label="Value"
                                                            type="number"
                                                            value={charge.value}
                                                            onChange={(e) => handleAdditionalChargeChange(charge.id, e)}
                                                            size="small"
                                                            fullWidth
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">{charge.valueType === 'percentage' ? '%' : settings.global.currency}</InputAdornment>,
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={2} sx={{textAlign: 'right'}}>
                                                        <IconButton size="small" onClick={() => handleRemoveAdditionalCharge(charge.id)} color="error" disabled={charge.isMandatory}>
                                                            <DeleteIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Grid>
                                                    {/* **NEW**: Checkbox for showing mandatory discount in preview */}
                                                    {charge.isMandatory && (
                                                        <Grid item xs={12}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={!!charge.showInPreview}
                                                                        onChange={(e) => handleAdditionalChargeChange(charge.id, 'showInPreview', e.target.checked)}
                                                                        name="showInPreview"
                                                                    />
                                                                }
                                                                label="Show this discount in invoice preview and calculations"
                                                            />
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Paper>
                                        ))}
                                        {(activeProfileForSettingsUI.additionalCharges || []).filter(c => !c.isMandatory).length === 0 && (<Typography variant="caption" color="textSecondary" display="block">No custom additional charges defined.</Typography>)}
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['totalsRounding']} onChange={handleAccordionChange('totalsRounding')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography><FunctionsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Totals & Rounding</Typography>
                                    </AccordionSummary>
                                    <SubheadingLabel>Manage invoice total calculations and rounding.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.enableRounding} onChange={(e) => handleActiveThemeProfileChange('enableRounding', e.target.checked)} name="enableRounding" />} label="Enable Round Off for Total Amount" />
                                        <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 2, opacity: activeProfileForSettingsUI.enableRounding ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                Rounding method is always Automatic.
                                            </Typography>
                                            <FormControl fullWidth size="small" disabled={!activeProfileForSettingsUI.enableRounding}>
                                                <InputLabel id="round-off-account-select-label">Round Off Account</InputLabel>
                                                <Select
                                                    labelId="round-off-account-select-label"
                                                    name="roundOffAccountId"
                                                    value={activeProfileForSettingsUI.roundOffAccountId || ''}
                                                    label="Round Off Account"
                                                    onChange={(e) => handleActiveThemeProfileChange('roundOffAccountId', e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>None</em>
                                                    </MenuItem>
                                                    {roundOffAccountOptions.map(opt => (
                                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom>Invoice Creation</Typography>
                                            <Typography
                                                component="div"
                                                sx={{
                                                    display: 'inline-block',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    mb: 1.5,
                                                    bgcolor: '#E8F5E9',
                                                    color: '#388E3C',
                                                    borderRadius: '16px',
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                Set how totals are calculated on the sales invoice screen.
                                            </Typography>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    row
                                                    aria-label="invoice-total-calculation"
                                                    name="invoiceTotalCalculation"
                                                    value={activeProfileForSettingsUI.invoiceTotalCalculation || 'auto'}
                                                    onChange={(e) => handleActiveThemeProfileChange(e)}
                                                >
                                                    <FormControlLabel value="auto" control={<Radio />} label="Automatic Calculation" />
                                                    <FormControlLabel value="manual" control={<Radio />} label="Allow Manual Entry" />
                                                </RadioGroup>
                                            </FormControl>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['paymentSettings']} onChange={handleAccordionChange('paymentSettings')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><QrCodeScannerIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Customer Payment Settings</Typography></AccordionSummary>
                                    <SubheadingLabel>Let customers know how they can pay you.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Typography variant="subtitle2">UPI Details:</Typography>
                                        <TextField name="upiId" label="UPI ID" value={activeProfileForSettingsUI.upiId} onChange={(e) => handleActiveThemeProfileChange('upiId', e.target.value)} size="small" fullWidth />
                                        <Button variant="outlined" component="label" startIcon={<ImageIcon />} size="small">Upload UPI QR <input type="file" hidden onChange={handleUpiQrUpload} accept="image/*" /></Button>
                                        {upiQrPreview && <Avatar src={upiQrPreview} variant="rounded" sx={{width:100, height:100, border:'1px solid #ddd'}}/>}
                                        {upiQrPreview && <Button size="small" color="error" onClick={() => handleRemoveImage('upiQrCodeImage')} startIcon={<DeleteIcon/>}>Remove QR</Button>}

                                        <Divider /> <Typography variant="subtitle2">Bank Account:</Typography>
                                        <FormControl fullWidth size="small"><InputLabel id="bank-account-select-label-active">Bank Account</InputLabel>
                                            <Select
                                                labelId="bank-account-select-label-active"
                                                name="bankAccountId"
                                                value={activeProfileForSettingsUI.bankAccountId}
                                                label="Bank Account"
                                                onChange={(e) => handleActiveThemeProfileChange('bankAccountId', e.target.value)}
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {bankAccountOptions.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['accountingLink']} onChange={handleAccordionChange('accountingLink')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography><AccountBalanceIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Accounting Link Settings</Typography>
                                    </AccordionSummary>
                                    <SubheadingLabel>Connect invoice items with your accounting/ledger system.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="sales-account-select-label">Default Sales Account</InputLabel>
                                            <Select
                                                labelId="sales-account-select-label"
                                                name="defaultSalesAccountId"
                                                value={activeProfileForSettingsUI.defaultSalesAccountId || ''}
                                                label="Default Sales Account"
                                                onChange={(e) => handleActiveThemeProfileChange('defaultSalesAccountId', e.target.value)}
                                            >
                                                <MenuItem value="">
                                                    <em>None (Manual Selection on Invoice)</em>
                                                </MenuItem>
                                                {salesAccountOptions.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['signatureEtc']} onChange={handleAccordionChange('signatureEtc')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><DescriptionIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Signature, Terms, Notes & Footer Settings</Typography></AccordionSummary>
                                    <SubheadingLabel>Add signature, custom messages, terms, or footer notes on your invoice.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <Grid container spacing={2} alignItems="flex-end">
                                            <Grid item xs={12} md={5}>
                                                <TextField
                                                    name="authorisedSignatory"
                                                    label="Authorised Signatory"
                                                    value={activeProfileForSettingsUI.authorisedSignatory}
                                                    onChange={(e) => handleActiveThemeProfileChange('authorisedSignatory', e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Button variant="outlined" component="label" startIcon={<ImageIcon />} size="medium" fullWidth>
                                                    Upload
                                                    <input type="file" hidden onChange={handleSignatureUpload} accept="image/*" />
                                                </Button>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                {signaturePreview && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                          <Avatar src={signaturePreview} variant="rounded" sx={{width: 'auto', height: 35, border:'1px solid #ddd'}}/>
                                                          <IconButton size="small" color="error" onClick={() => handleRemoveImage('signatureImage')}><DeleteIcon/></IconButton>
                                                    </Box>
                                                )}
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 1 }} />

                                        <TextField name="termsAndConditionsId" label="Terms & Conditions" value={activeProfileForSettingsUI.termsAndConditionsId} onChange={(e) => handleActiveThemeProfileChange('termsAndConditionsId', e.target.value)} multiline rows={3} size="small" />
                                        <TextField name="notesDefault" label="Default Notes" value={activeProfileForSettingsUI.notesDefault} onChange={(e) => handleActiveThemeProfileChange('notesDefault', e.target.value)} multiline rows={2} size="small" />
                                        <TextField name="invoiceFooter" label="Invoice Footer Text" value={activeProfileForSettingsUI.invoiceFooter} onChange={(e) => handleActiveThemeProfileChange('invoiceFooter', e.target.value)} multiline rows={2} size="small" />
                                        <Divider /> <Typography variant="subtitle2">Footer Image:</Typography>
                                        <Button variant="outlined" component="label" startIcon={<ImageIcon />} size="small">Upload Footer Image <input type="file" hidden onChange={handleFooterImageUpload} accept="image/*" /></Button>
                                        {footerImagePreview && <Avatar src={footerImagePreview} variant="rounded" sx={{width:'100%', height:'auto', maxHeight:100, border:'1px solid #ddd'}}/>}
                                        {footerImagePreview && <Button size="small" color="error" onClick={() => handleRemoveImage('invoiceFooterImage')} startIcon={<DeleteIcon/>}>Remove Footer Image</Button>}
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion expanded={!!expandedAccordions['coreBusiness']} onChange={handleAccordionChange('coreBusiness')} sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mt: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><SettingsApplicationsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Core Business Settings</Typography></AccordionSummary>
                                    <SubheadingLabel>Set your company logo, default currency, and invoice number format.</SubheadingLabel>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <TextField name="nextInvoiceNumber" label="Next Invoice Number (Global)" type="number" value={settings.global.nextInvoiceNumber} onChange={handleGlobalSettingChange} size="small" fullWidth InputProps={{ inputProps: { min: 1 } }}/>
                                        <TextField name="companyLogoUrl" label="Company Logo URL (Global)" value={settings.global.companyLogoUrl} onChange={handleGlobalSettingChange} size="small" fullWidth helperText="Enter full URL or path like /images/logo.png"/>
                                         <FormControl fullWidth size="small" sx={{mt:1}}>
                                             <InputLabel id="global-currency-select-label">Global Currency</InputLabel>
                                             <Select
                                                 labelId="global-currency-select-label"
                                                 name="currency"
                                                 value={settings.global.currency}
                                                 label="Global Currency"
                                                 onChange={handleGlobalSettingChange}
                                             >
                                                 <MenuItem value="INR">INR (₹)</MenuItem>
                                                 <MenuItem value="USD">USD ($)</MenuItem>
                                                 <MenuItem value="EUR">EUR (€)</MenuItem>
                                                 <MenuItem value="GBP">GBP (£)</MenuItem>
                                             </Select>
                                         </FormControl>
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7} lg={8}>
                    <Paper elevation={2} sx={{ p: {xs: 1, sm: 2.5}, height: 'calc(100vh - 120px)', position: 'sticky', top: '20px', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom align="center">Live Invoice Preview</Typography>
                        <Box sx={{ border: '1px solid #ddd', minHeight: 'calc(100% - 40px)', backgroundColor: '#fff' }}>
                           {activeProfileForSettingsUI &&
                            <InvoicePreview
                                settings={settingsForPreview}
                                companyDetails={companyDetails}
                                bankAccountOptions={bankAccountOptions}
                            />
                           }
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                <DialogTitle>Rename Theme Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter a new name for the theme profile "<b>{profileToRename?.profileName}</b>".
                    </DialogContentText>
                    <TextField autoFocus margin="dense" id="newProfileName" label="New Profile Name" type="text" fullWidth variant="standard" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRenameProfile} disabled={!newProfileName.trim()}>Rename</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSaveSettings} disabled={loading} size="large">
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Save All Settings"}
                </Button>
            </Box>
        </Box>
    );
};

export default InvoiceSettingsPage;
