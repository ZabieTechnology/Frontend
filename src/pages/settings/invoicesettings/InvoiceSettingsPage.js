import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Grid, Paper, Typography, Button, Switch, FormControlLabel, TextField,
    Select, MenuItem, FormControl, InputLabel, Divider, CircularProgress, Alert,
    IconButton, Tooltip, Checkbox, Avatar, Accordion, AccordionSummary, AccordionDetails,
    Radio, RadioGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import {
    Save as SaveIcon, ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon, Image as ImageIcon, ViewQuilt as ViewQuiltIcon,
    ListAlt as ListAltIcon, Description as DescriptionIcon,
    SettingsApplications as SettingsApplicationsIcon, QrCodeScanner as QrCodeScannerIcon,
    ReceiptLong as ReceiptLongIcon, AccountBalance as AccountBalanceIcon, TextFields as TextFieldsIcon,
    Palette as PaletteIcon, Edit as EditIcon, Percent as PercentIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InvoicePreview from './InvoicePreview';

// Base themes definition
const baseThemes = [
    { name: "Modern", previewImage: "/images/themes/001-bank.png" },
    { name: "Stylish", previewImage: "/images/themes/002-online banking.png" },
    { name: "Advanced GST (Tally)", previewImage: "/images/themes/004-receptionist.png" },
    { name: "Advanced GST (A)", previewImage: "/images/themes/019-currency.png" },
    { name: "Billbook (A)", previewImage: "/images/themes/023-cut card.png" },
    { name: "Simple", previewImage: "/images/themes/038-tax.png" },
];

const colorPalette = [
    '#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', '#009688', '#795548', '#000000'
];

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
};

const initialSingleThemeProfileData = {
    baseThemeName: "Modern",
    selectedColor: "#4CAF50",
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
    signatureImageUrl: '',
    authorisedSignatory: 'For (Your Company Name)',
    invoiceFooter: "",
    invoiceFooterImageUrl: "",
    termsAndConditionsId: '',
    notesDefault: "Thank you for your business!",
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
            profileName: 'Default Modern Green',
            isDefault: true,
            ...JSON.parse(JSON.stringify(initialSingleThemeProfileData))
        }
    ],
};


const getColumnLabel = (key, customItemColumns) => {
    if (key.startsWith('custom_item_')) {
        const customCol = customItemColumns.find(col => col.id === key);
        return customCol ? customCol.name : key;
    }
    const labels = {
        pricePerItem: "Price Per Item", quantity: "Quantity", batchNo: "Batch No", expDate: "Expiry Date",
        mfgDate: "Mfg Date", discountPerItem: "Discount Per Item", hsnSacCode: "HSN/SAC Code", serialNo: "Serial No",
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
    });

    const [bankAccountOptions, setBankAccountOptions] = useState([]);
    const [salesAccountOptions, setSalesAccountOptions] = useState([]);

    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

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
            });
        }
    }, [activeThemeProfileId, getActiveThemeProfile, API_BASE_URL]);

    const updatePreviewThemeFromDefault = useCallback((savedThemesArray) => {
        const defaultTheme = savedThemesArray.find(t => t.isDefault);
        if (defaultTheme) {
            setThemeForPreviewStyle({
                baseThemeName: defaultTheme.baseThemeName,
                selectedColor: defaultTheme.selectedColor,
            });
        } else if (savedThemesArray.length > 0) {
             setThemeForPreviewStyle({
                baseThemeName: savedThemesArray[0].baseThemeName,
                selectedColor: savedThemesArray[0].selectedColor,
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

                setSettings({
                    _id: fetched._id,
                    global: { ...initialGlobalSettings, ...globalConf },
                    savedThemes: savedThemesFromServer.map(theme => ({
                        ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)),
                        ...theme,
                        itemTableColumns: {
                            ...MANDATORY_ITEM_COLUMNS,
                            ...(theme.itemTableColumns || OPTIONAL_ITEM_COLUMNS_DEFAULT)
                        },
                        id: theme.id || `theme_profile_${Date.now()}_${Math.random()}`,
                    })),
                });

                const defaultTheme = savedThemesFromServer.find(t => t.isDefault) || savedThemesFromServer[0];
                setActiveThemeProfileId(defaultTheme.id);
                updatePreviewThemeFromDefault(savedThemesFromServer);

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

    useEffect(() => {
        fetchInvoiceSettings();
        fetchBankAccounts();
        fetchSalesAccounts();
    }, [fetchInvoiceSettings, fetchBankAccounts, fetchSalesAccounts]);

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

                        if (name === 'taxDisplayMode') {
                            updatedProfile.itemTableColumns.showCess = value === 'breakdown';
                        }
                    }

                    if (eventOrPath === 'baseThemeName' || eventOrPath === 'selectedColor' || eventOrPath.target?.name === 'baseThemeName' || eventOrPath.target?.name === 'selectedColor') {
                        setThemeForPreviewStyle({
                            baseThemeName: updatedProfile.baseThemeName,
                            selectedColor: updatedProfile.selectedColor,
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
                p.id === activeThemeProfileId ? { ...p, customHeaderFields: [...(p.customHeaderFields || []), {id: `custom_header_${Date.now()}`, label: '', displayOnInvoice: true, type: 'text'}]} : p
            )
        }));
    };

    const handleCustomHeaderFieldChange = (id, event) => {
        if(!activeThemeProfileId) return;
        const { name, value, checked, type } = event.target;
        setSettings(prev => ({
            ...prev,
            savedThemes: prev.savedThemes.map(p =>
                p.id === activeThemeProfileId ? { ...p, customHeaderFields: (p.customHeaderFields || []).map(field =>
                    field.id === id ? { ...field, [name]: type === 'checkbox' ? checked : value } : field
                )} : p
            )
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
             setThemeForPreviewStyle({ baseThemeName: newDefault.baseThemeName, selectedColor: newDefault.selectedColor });
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
            const emptyCustomItemCol = (activeProfileForValidation.customItemColumns || []).find(col => col.name.trim() === '');
            if (emptyCustomItemCol) {
                setError("Custom item column names cannot be empty for the active theme."); setLoading(false); setTimeout(() => setError(null), 5000); return;
            }
            const emptyCustomHeaderField = (activeProfileForValidation.customHeaderFields || []).find(field => field.label.trim() === '');
            if (emptyCustomHeaderField) {
                setError("Custom header field labels cannot be empty for the active theme."); setLoading(false); setTimeout(() => setError(null), 5000); return;
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

                 setSettings(prev => ({
                    ...prev,
                    _id: saved._id,
                    global: { ...initialGlobalSettings, ...(saved.global || {})},
                    savedThemes: savedThemesFromServer.map(theme => ({
                        ...JSON.parse(JSON.stringify(initialSingleThemeProfileData)),
                        ...theme,
                        itemTableColumns: {
                            ...MANDATORY_ITEM_COLUMNS,
                            ...(theme.itemTableColumns || OPTIONAL_ITEM_COLUMNS_DEFAULT)
                        },
                        signatureImageFile: null,
                        upiQrCodeFile: null,
                        invoiceFooterImageFile: null,
                    })),
                 }));

                const newActiveDefault = savedThemesFromServer.find(t => t.isDefault) || savedThemesFromServer[0];
                setActiveThemeProfileId(newActiveDefault.id);
                updatePreviewThemeFromDefault(savedThemesFromServer);
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

    const toggleableItemColumns = Object.keys(activeProfileForSettingsUI.itemTableColumns || initialSingleThemeProfileData.itemTableColumns)
        .filter(key => key !== 'showCess' && !MANDATORY_ITEM_COLUMNS.hasOwnProperty(key) && (initialSingleThemeProfileData.itemTableColumns.hasOwnProperty(key) || key.startsWith('custom_item_')))
        .sort((a,b) => {
            const aIsCustom = a.startsWith('custom_item_');
            const bIsCustom = b.startsWith('custom_item_');
            if (aIsCustom && !bIsCustom) return 1;
            if (!aIsCustom && bIsCustom) return -1;
            return a.localeCompare(b);
        });


    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
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
                                <Typography variant="body2">Currency: {settings.global.currency}</Typography>
                                <Typography variant="body2">
                                    Sales Ledger: {salesAccountOptions.find(o => o.value === activeProfileForSettingsUI.defaultSalesAccountId)?.label || 'Not Set'}
                                </Typography>
                            </Paper>
                        )}

                        <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography><ViewQuiltIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Manage Theme Profiles</Typography>
                            </AccordionSummary>
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

                        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography><PaletteIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Customize Active Theme</Typography>
                            </AccordionSummary>
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
                                      <Typography variant="caption">Selected Color:</Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, mt:0.5 }}>
                                          {colorPalette.map(color => (
                                              <Tooltip title={color} key={`${activeThemeProfileId}-${color}`}>
                                                  <Box onClick={() => handleActiveThemeProfileChange('selectedColor', color)}
                                                       sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: color, cursor: 'pointer', border: activeProfileForSettingsUI.selectedColor === color ? '3px solid white' : `1px solid ${color}`, boxShadow: activeProfileForSettingsUI.selectedColor === color ? `0 0 0 2px ${color}` : '0 1px 2px rgba(0,0,0,0.2)' }}/>
                                              </Tooltip>
                                          ))}
                                      </Box>
                                  </Paper>
                                )}
                            </AccordionDetails>
                        </Accordion>


                        {activeProfileForSettingsUI && (
                            <>
                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><ReceiptLongIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Invoice Title & Number Format</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Edit invoice title and define how invoice numbers are generated.</Typography>
                                    </Box>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                        <TextField name="invoiceHeading" label="Invoice Heading" value={activeProfileForSettingsUI.invoiceHeading} onChange={(e) => handleActiveThemeProfileChange('invoiceHeading', e.target.value)} size="small" fullWidth />
                                        <TextField name="invoicePrefix" label="Invoice Prefix" value={activeProfileForSettingsUI.invoicePrefix} onChange={(e) => handleActiveThemeProfileChange('invoicePrefix', e.target.value)} size="small" fullWidth />
                                        <TextField name="invoiceSuffix" label="Invoice Suffix" value={activeProfileForSettingsUI.invoiceSuffix} onChange={(e) => handleActiveThemeProfileChange('invoiceSuffix', e.target.value)} size="small" fullWidth />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><TextFieldsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Add Custom Header Fields</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Include additional details like PO Number, Project Name, etc.</Typography>
                                    </Box>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showPoNumber} onChange={(e) => handleActiveThemeProfileChange('showPoNumber', e.target.checked)} name="showPoNumber" />} label="Show PO Number field on Invoice" />
                                        <Divider sx={{my: 1}}/>
                                        <Button size="small" startIcon={<AddIcon />} onClick={handleAddCustomHeaderField} variant="text" sx={{alignSelf: 'flex-start', mb:1}}>Add Header Field</Button>
                                        {(activeProfileForSettingsUI.customHeaderFields || []).map((field) => (
                                            <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <TextField name="label" label={`Field Label`} value={field.label} onChange={(e) => handleCustomHeaderFieldChange(field.id, e)} size="small" variant="outlined" sx={{flexGrow:1}} placeholder="Enter field label" />
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <InputLabel>Type</InputLabel>
                                                    <Select
                                                        name="type"
                                                        value={field.type || 'text'}
                                                        label="Type"
                                                        onChange={(e) => handleCustomHeaderFieldChange(field.id, e)}
                                                    >
                                                        <MenuItem value="text">Text</MenuItem>
                                                        <MenuItem value="number">Number</MenuItem>
                                                        <MenuItem value="date">Date</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <FormControlLabel control={<Checkbox name="displayOnInvoice" checked={!!field.displayOnInvoice} onChange={(e) => handleCustomHeaderFieldChange(field.id, e)} size="small"/>} label="Show" sx={{fontSize: '0.8rem', mr:0}}/>
                                                <IconButton size="small" onClick={() => handleRemoveCustomHeaderField(field.id)} color="error"><DeleteIcon fontSize="inherit"/></IconButton>
                                            </Box>
                                        ))}
                                        {(activeProfileForSettingsUI.customHeaderFields || []).length === 0 && (<Typography variant="caption" color="textSecondary" display="block">No custom header fields defined for this theme.</Typography>)}
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><SettingsApplicationsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Show/Hide Invoice Sections</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Choose to show or hide fields like billing address, shipping info, etc.</Typography>
                                    </Box>
                                    <AccordionDetails sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showBillToSection} onChange={(e) => handleActiveThemeProfileChange('showBillToSection', e.target.checked)} name="showBillToSection" />} label="Show 'Bill To' Section" />
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showShipToSection} onChange={(e) => handleActiveThemeProfileChange('showShipToSection', e.target.checked)} name="showShipToSection" />} label="Show 'Ship To' Section" />
                                        <FormControlLabel control={<Switch checked={!!activeProfileForSettingsUI.showSaleAgentOnInvoice} onChange={(e) => handleActiveThemeProfileChange('showSaleAgentOnInvoice', e.target.checked)} name="showSaleAgentOnInvoice" />} label="Show Sale Agent" />
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><ListAltIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Item Table Columns</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Decide which item details (like rate, quantity) appear in the invoice.</Typography>
                                    </Box>
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

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography><PercentIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Tax Display Settings</Typography>
                                    </AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Set how tax amounts or labels appear on invoices.</Typography>
                                    </Box>
                                    <AccordionDetails>
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                aria-label="tax-display-mode"
                                                name="taxDisplayMode"
                                                value={activeProfileForSettingsUI.taxDisplayMode || 'breakdown'}
                                                onChange={(e) => handleActiveThemeProfileChange(e)}
                                            >
                                                <FormControlLabel value="no_tax" control={<Radio />} label="No Tax (e.g., for Bill of Supply)" />
                                                <FormControlLabel value="breakdown" control={<Radio />} label="Show GST Breakdown (Tax %, CGST, SGST, IGST, CESS)" />
                                            </RadioGroup>
                                        </FormControl>
                                    </AccordionDetails>
                                </Accordion>

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><QrCodeScannerIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Customer Payment Settings</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Let customers know how they can pay you.</Typography>
                                    </Box>
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

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography><AccountBalanceIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Accounting Link Settings</Typography>
                                    </AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Connect invoice items with your accounting/ledger system.</Typography>
                                    </Box>
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

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><DescriptionIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Signature, Terms, Notes & Footer Settings</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Add signature, custom messages, terms, or footer notes on your invoice.</Typography>
                                    </Box>
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

                                <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid #eee', borderRadius:1, mt: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography><SettingsApplicationsIcon sx={{mr:1, verticalAlign: 'bottom'}}/>Core Business Settings</Typography></AccordionSummary>
                                    <Box sx={{px: 2, pb: 1, color: 'green', fontStyle: 'italic'}}>
                                        <Typography variant="caption">Set your company logo, default currency, and invoice number format.</Typography>
                                    </Box>
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
                                settings={{
                                    ...activeProfileForSettingsUI,
                                    activeThemeName: themeForPreviewStyle.baseThemeName,
                                    selectedColor: themeForPreviewStyle.selectedColor,
                                    companyLogoUrl: settings.global.companyLogoUrl,
                                    currency: settings.global.currency,
                                    nextInvoiceNumber: settings.global.nextInvoiceNumber
                                }}
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

// --- This is a placeholder for your App component ---
// In a real Create React App project, you would have an App.js
// that renders the InvoiceSettingsPage, likely within a Router.
export default function App() {
    // A placeholder for ThemeProvider if you use one
    return <InvoiceSettingsPage />;
}
