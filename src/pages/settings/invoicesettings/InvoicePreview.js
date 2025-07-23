import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    RadioGroup,
    FormControlLabel,
    Radio,
    TableFooter,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// --- HELPER FUNCTIONS ---

// Helper to format currency
const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- SAMPLE INVOICE DATA (for items and totals) ---
const sampleInvoiceData = {
    invoiceTo: "Sample Customer Pvt. Ltd.",
    invoiceToAddress: "123 Business Park, Tech City, 560001",
    invoiceToGstin: "29AAPCS1234A1Z5",
    invoiceToMobile: "9876543210",
    shipToAddress: "456 Industrial Area, Tech City, 560002",
    invoiceNumber: "007",
    poNumber: "PO-XYZ-12345",
    invoiceDate: new Date().toLocaleDateString('en-GB'),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
    items: [
        { id: 1, description: "Premium Software Suite - Annual License", hsnSacCode: "998314", quantity: 1, pricePerItem: 25000, discountPerItem: 1000, taxRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0, cessRate: 0.5, vatRate: 5, amount: 28420 },
        { id: 2, description: "Cloud Hosting Services - Basic Plan", hsnSacCode: "998315", quantity: 12, pricePerItem: 1500, discountPerItem: 0, taxRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0, cessRate: 0, vatRate: 0, amount: 21240 },
        { id: 3, description: "Consultation Services - 5 Hours", hsnSacCode: "998311", quantity: 5, pricePerItem: 3000, discountPerItem: 500, taxRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 0, cessRate: 0.2, vatRate: 0, amount: 17160 },
    ],
    subTotal: 58000,
    discountAmountCalculated: 1500,
    taxableAmount: 56500,
    cgstAmount: 5085,
    sgstAmount: 5085,
    igstAmount: 0,
    overallCessAmount: 149,
    vatAmount: 1200,
    taxTotal: 10170,
    grandTotal: 66819,
    amountReceived: 10000,
    creditNoteIssued: 500,
    expensesAdjusted: 200,
    amountInWords: "Sixty Six Thousand Eight Hundred Nineteen Only",
    saleAgentName: "As per Staff records",
    "custom_header_1658145748332": "REF-ABC",
    "custom_header_1658145758332": true,
    "custom_header_1658145768332": "Yes",
    "custom_header_1658145778332": "07/2025",
};

// --- THEME WRAPPERS ---
const ModernThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(3),
    fontFamily: 'Arial, sans-serif',
    borderTop: `5px solid ${selectedColor || '#2196F3'}`,
    minHeight: '500px',
    color: '#333',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'relative',
}));

const StylishThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(3),
    fontFamily: 'Georgia, serif',
    borderLeft: `8px solid ${selectedColor || '#FF5722'}`,
    backgroundColor: '#f9f9f9',
    minHeight: '500px',
    color: '#444',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    position: 'relative',
}));

const SimpleThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(2),
    fontFamily: 'Verdana, sans-serif',
    border: `1px solid ${selectedColor || '#ccc'}`,
    minHeight: '500px',
    color: '#555',
    backgroundColor: '#fff',
    position: 'relative',
}));

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// --- CUSTOM FIELD RENDERER ---
const renderCustomField = (field, value) => {
    const fieldValue = value !== undefined ? value : field.defaultValue;

    const getPlaceholder = (type) => {
        switch (type) {
            case 'text':
                return '(Text)';
            case 'number':
                return '(Number)';
            case 'date':
                return '(dd/mm/yyyy)';
            case 'date_month_year':
                return '(mm/yyyy)';
            default:
                return '(Not Set)';
        }
    };

    switch (field.type) {
        case 'tick_box':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" sx={{ color: 'inherit', mr: 0.5 }}>{field.label}:</Typography>
                    <Checkbox checked={!!fieldValue} disabled size="small" sx={{ p: 0 }} />
                </Box>
            );
        case 'yes_no_radio':
            return (
                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" sx={{ color: 'inherit', mr: 1 }}>{field.label}:</Typography>
                    <RadioGroup row value={fieldValue === 'yes' ? 'yes' : 'no'} name={`radio-buttons-group-${field.id}`}>
                        <FormControlLabel value="yes" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography variant="body2">Yes</Typography>} disabled />
                        <FormControlLabel value="no" control={<Radio size="small" sx={{ p: 0.5 }} />} label={<Typography variant="body2">No</Typography>} disabled />
                    </RadioGroup>
                </Box>
            );
        case 'date':
        case 'date_month_year':
        case 'number':
        case 'text':
        default:
            return (
                <Typography variant="body2" key={field.id} sx={{ color: 'inherit' }}>
                    {field.label}: {fieldValue || getPlaceholder(field.type)}
                </Typography>
            );
    }
};


// --- INVOICE PREVIEW COMPONENT ---
const InvoicePreview = ({ settings, companyDetails: companyDetailsProp, invoiceData, bankAccountOptions = [] }) => {

    const invoiceDataToUse = { ...sampleInvoiceData, ...(invoiceData || {}) };
    const currencySymbol = settings?.currency === 'INR' ? '₹' : '$';

    // Default settings merged with passed settings to ensure preview is always complete
    const defaultSettings = {
        activeThemeName: "Modern",
        selectedColor: "#4CAF50",
        itemTableColumns: {
            pricePerItem: true, quantity: true, hsnSacCode: true, discountPerItem: true,
            showCess: false, showVat: false, showGrossValue: true,
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
        bankAccountId: "",
        showSaleAgentOnInvoice: false,
        showBillToSection: true,
        showShipToSection: true,
        showAmountReceived: true,
        showCreditNoteIssued: true,
        showExpensesAdjusted: true,
        notesDefault: "Thank you!",
        termsAndConditionsId: "Default T&C.",
        signatureImageUrl: "",
        authorisedSignatory: "For Your Company Name",
        companyLogoUrl: "/images/default_logo.png",
        invoiceFooter: "",
        invoiceFooterImageUrl: "",
        additionalCharges: [
            { id: 'charge1', label: 'Delivery Charges', value: '100', valueType: 'fixed' },
            { id: 'charge2', label: 'Service Fee', value: '2', valueType: 'percentage' },
        ],
    };

    const effectiveSettings = {
        ...defaultSettings,
        ...settings,
        itemTableColumns: {
            ...defaultSettings.itemTableColumns,
            ...(settings?.itemTableColumns || {}),
        },
    };

    const {
        activeThemeName, selectedColor, itemTableColumns, customItemColumns,
        termsAndConditionsId, signatureImageUrl, authorisedSignatory, notesDefault,
        showBillToSection, showShipToSection, showSaleAgentOnInvoice,
        upiId, upiQrCodeImageUrl, bankAccountId, invoicePrefix, invoiceSuffix,
        invoiceHeading, invoiceFooter, invoiceFooterImageUrl, showPoNumber,
        customHeaderFields, taxDisplayMode, showAmountReceived,
        showCreditNoteIssued, showExpensesAdjusted, additionalCharges
    } = effectiveSettings;

    // Use company details from props, with a fallback structure
    const displayCompany = {
        name: companyDetailsProp?.tradeName || "Your Company Name",
        address: [
            companyDetailsProp?.billingAddressLine1,
            companyDetailsProp?.billingAddressLine2,
            companyDetailsProp?.billingAddressLine3,
            companyDetailsProp?.state,
            companyDetailsProp?.pinCode
        ].filter(Boolean).join(', '),
        mobile: companyDetailsProp?.mobileNo || "555-1234",
        email: companyDetailsProp?.email || "contact@example.com",
        gstin: companyDetailsProp?.gstNumber || "YOUR_GSTIN_HERE",
        logoUrl: companyDetailsProp?.logoUrl || effectiveSettings.companyLogoUrl,
        website: companyDetailsProp?.website || ""
    };

    const formattedInvoiceNumber = `${invoicePrefix || ''}${invoiceDataToUse.invoiceNumber || ''}${invoiceSuffix || ''}`;

    const renderTableHeaders = React.useCallback(() => {
        const headers = [];
        headers.push(<TableCell key="sno" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>#</TableCell>);
        headers.push(<TableCell key="desc" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Items</TableCell>);

        if (itemTableColumns.hsnSacCode) headers.push(<TableCell key="hsn" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>HSN/SAC</TableCell>);

        customItemColumns?.forEach(colConfig => {
            if (itemTableColumns[colConfig.id]) {
                 headers.push(<TableCell key={colConfig.id} sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>{colConfig.name}</TableCell>);
            }
        });
        headers.push(<TableCell align="right" key="qty" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Qty</TableCell>);
        headers.push(<TableCell align="right" key="rate" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Rate</TableCell>);
        if (itemTableColumns.showGrossValue) headers.push(<TableCell align="right" key="gross" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Gross Value</TableCell>);
        if (itemTableColumns.discountPerItem) headers.push(<TableCell align="right" key="discount" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Discount</TableCell>);

        if (taxDisplayMode === 'breakdown') {
            headers.push(<TableCell align="right" key="taxRate" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Tax %</TableCell>);
            headers.push(<TableCell align="right" key="cgst" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>CGST</TableCell>);
            headers.push(<TableCell align="right" key="sgst" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>SGST</TableCell>);
            headers.push(<TableCell align="right" key="igst" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>IGST</TableCell>);
            if (itemTableColumns.showCess) {
                headers.push(<TableCell align="right" key="cess" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Cess</TableCell>);
            }
            if (itemTableColumns.showVat) {
                headers.push(<TableCell align="right" key="vat" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>VAT</TableCell>);
            }
        }

        headers.push(<TableCell align="right" key="amount" sx={{color: 'inherit', fontWeight:'bold', borderBottom: '1px solid rgba(224, 224, 224, 1)'}}>Amount</TableCell>);
        return <TableRow>{headers}</TableRow>;
    }, [itemTableColumns, customItemColumns, taxDisplayMode]);

    const tableHeaderCells = React.useMemo(() => renderTableHeaders(), [renderTableHeaders]);

    const renderTableRows = () => {
        if (!Array.isArray(invoiceDataToUse.items) || invoiceDataToUse.items.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={tableHeaderCells.props.children.length} align="center" sx={{color: 'inherit'}}>
                        No items to display.
                    </TableCell>
                </TableRow>
            );
        }

        return invoiceDataToUse.items.map((item, index) => {
            const grossValue = item.quantity * item.pricePerItem;
            const taxableAmount = grossValue - (item.discountPerItem || 0);
            const cgstAmount = taxableAmount * ((item.cgstRate || 0) / 100);
            const sgstAmount = taxableAmount * ((item.sgstRate || 0) / 100);
            const igstAmount = taxableAmount * ((item.igstRate || 0) / 100);
            const cessAmount = taxableAmount * ((item.cessRate || 0) / 100);
            const vatAmount = taxableAmount * ((item.vatRate || 0) / 100);
            const finalAmount = taxDisplayMode === 'no_tax' ? taxableAmount : item.amount;

            return (
                <TableRow key={item.id || index}>
                    <TableCell sx={{color: 'inherit'}}>{index + 1}</TableCell>
                    <TableCell sx={{color: 'inherit'}}>{item.description}</TableCell>
                    {itemTableColumns.hsnSacCode && <TableCell sx={{color: 'inherit'}}>{item.hsnSacCode}</TableCell>}
                    {customItemColumns?.map(colConfig => {
                        if (itemTableColumns[colConfig.id]) {
                            return <TableCell key={colConfig.id} sx={{color: 'inherit'}}>{item[colConfig.id] || 'N/A'}</TableCell>;
                        }
                        return null;
                    })}
                    <TableCell align="right" sx={{color: 'inherit'}}>{item.quantity}</TableCell>
                    <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(item.pricePerItem, currencySymbol)}</TableCell>
                    {itemTableColumns.showGrossValue && <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(grossValue, currencySymbol)}</TableCell>}
                    {itemTableColumns.discountPerItem && <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(item.discountPerItem, currencySymbol)}</TableCell>}

                    {taxDisplayMode === 'breakdown' && (
                        <>
                            <TableCell align="right" sx={{color: 'inherit'}}>{item.taxRate !== undefined ? `${item.taxRate}%` : 'N/A'}</TableCell>
                            <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(cgstAmount, currencySymbol)}</TableCell>
                            <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(sgstAmount, currencySymbol)}</TableCell>
                            <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(igstAmount, currencySymbol)}</TableCell>
                            {itemTableColumns.showCess && <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(cessAmount, currencySymbol)}</TableCell>}
                            {itemTableColumns.showVat && <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(vatAmount, currencySymbol)}</TableCell>}
                        </>
                    )}

                    <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(finalAmount, currencySymbol)}</TableCell>
                </TableRow>
            );
        });
    };

    const InvoiceLayout = ({ children }) => {
        const themeMap = {
            "Stylish": <StylishThemeWrapper elevation={3} selectedColor={selectedColor}>{children}</StylishThemeWrapper>,
            "Simple": <SimpleThemeWrapper elevation={1} selectedColor={selectedColor}>{children}</SimpleThemeWrapper>,
            "Modern": <ModernThemeWrapper elevation={3} selectedColor={selectedColor}>{children}</ModernThemeWrapper>,
        };
        const SelectedThemeWrapper = themeMap[activeThemeName] || themeMap["Modern"];
        return React.cloneElement(SelectedThemeWrapper, {}, <>{children}</>);
    };

    const displaySignatureUrl = signatureImageUrl?.startsWith('http') || signatureImageUrl?.startsWith('data:') ? signatureImageUrl : (signatureImageUrl ? `${API_BASE_URL}/uploads/signatures/${signatureImageUrl}` : null);
    const displayUpiQrCodeUrl = upiQrCodeImageUrl?.startsWith('http') || upiQrCodeImageUrl?.startsWith('data:') ? upiQrCodeImageUrl : (upiQrCodeImageUrl ? `${API_BASE_URL}/uploads/upi_qr/${upiQrCodeImageUrl}` : null);
    const displayFooterImageUrl = invoiceFooterImageUrl?.startsWith('http') || invoiceFooterImageUrl?.startsWith('data:') ? invoiceFooterImageUrl : (invoiceFooterImageUrl ? `${API_BASE_URL}/uploads/footers/${invoiceFooterImageUrl}` : null);

    const selectedBankAccountLabel = bankAccountId && bankAccountOptions?.length > 0 ? bankAccountOptions.find(opt => opt.value === bankAccountId)?.label : null;

    // Calculate totals from items array for accuracy
    const columnTotals = React.useMemo(() => {
        const totals = {
            grossValue: 0,
            discount: 0,
            taxableAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            vat: 0,
            amount: 0,
        };

        if (!Array.isArray(invoiceDataToUse.items)) {
            return totals;
        }

        invoiceDataToUse.items.forEach(item => {
            const grossValue = item.quantity * item.pricePerItem;
            const discount = item.discountPerItem || 0;
            const taxableAmount = grossValue - discount;

            totals.grossValue += grossValue;
            totals.discount += discount;
            totals.taxableAmount += taxableAmount;
            totals.cgst += taxableAmount * ((item.cgstRate || 0) / 100);
            totals.sgst += taxableAmount * ((item.sgstRate || 0) / 100);
            totals.igst += taxableAmount * ((item.igstRate || 0) / 100);
            totals.cess += taxableAmount * ((item.cessRate || 0) / 100);
            totals.vat += taxableAmount * ((item.vatRate || 0) / 100);
            totals.amount += item.amount || taxableAmount + totals.cgst + totals.sgst + totals.igst + totals.cess + totals.vat;
        });

        return totals;
    }, [invoiceDataToUse.items]);

    // Calculate additional charges
    const calculatedCharges = (additionalCharges || []).map(charge => {
        let amount = 0;
        if (charge.valueType === 'percentage') {
            amount = (columnTotals.taxableAmount * (parseFloat(charge.value) || 0)) / 100;
        } else {
            amount = parseFloat(charge.value) || 0;
        }
        // Assuming a standard 18% tax for demonstration purposes
        const taxRate = 18;
        const taxAmount = amount * (taxRate / 100);
        return {
            ...charge,
            amount,
            taxableAmount: amount,
            cgst: taxAmount / 2,
            sgst: taxAmount / 2,
            igst: 0, // Assuming intra-state for sample
            cess: 0,
            vat: 0,
            total: amount + taxAmount
        };
    });

    const totalAdditionalChargesWithTax = calculatedCharges.reduce((sum, charge) => sum + charge.total, 0);

    const finalGrandTotal = columnTotals.amount + totalAdditionalChargesWithTax;
    const totalPaid = (invoiceDataToUse.amountReceived || 0) + (invoiceDataToUse.creditNoteIssued || 0) + (invoiceDataToUse.expensesAdjusted || 0);
    const finalBalanceDue = finalGrandTotal - totalPaid;

    return (
        <InvoiceLayout>
            <Grid container spacing={2}>
                <Grid item xs={7}>
                    {displayCompany.logoUrl && <Avatar src={displayCompany.logoUrl} alt="Company Logo" variant="square" sx={{ width: 80, height: 80, mb: 1, objectFit: 'contain' }} />}
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>{displayCompany.name}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{displayCompany.address}</Typography>
                    {displayCompany.mobile && <Typography variant="body2" sx={{color: 'inherit'}}>Mobile: {displayCompany.mobile}</Typography>}
                    {displayCompany.email && <Typography variant="body2" sx={{color: 'inherit'}}>Email: {displayCompany.email}</Typography>}
                    {displayCompany.gstin && <Typography variant="body2" sx={{color: 'inherit'}}>GSTIN: {displayCompany.gstin}</Typography>}
                    {displayCompany.website && <Typography variant="body2" sx={{color: 'inherit'}}>Website: {displayCompany.website}</Typography>}
                </Grid>
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>{invoiceHeading}</Typography>
                    <Typography variant="body1" sx={{color: 'inherit'}}>{formattedInvoiceNumber}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Date: {invoiceDataToUse.invoiceDate}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Due Date: {invoiceDataToUse.dueDate}</Typography>
                    {showPoNumber && invoiceDataToUse.poNumber && <Typography variant="body2" sx={{color: 'inherit'}}>PO Number: {invoiceDataToUse.poNumber}</Typography>}
                    {customHeaderFields?.map(field => field.displayOnInvoice && (
                        <Box key={field.id} sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5}}>
                            {renderCustomField(field, invoiceDataToUse[field.id])}
                        </Box>
                    ))}
                    {showSaleAgentOnInvoice && invoiceDataToUse.saleAgentName && (
                        <Typography variant="body2" sx={{ color: 'inherit', mt: 0.5 }}>
                            <Box component="span" sx={{ fontWeight: 'bold' }}>Sale Agent: </Box>
                            {invoiceDataToUse.saleAgentName}
                        </Typography>
                    )}
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2, borderColor: selectedColor || 'rgba(0,0,0,0.12)' }} /></Grid>

                {showBillToSection && (
                    <Grid item xs={showShipToSection ? 6 : 12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>BILL TO:</Typography>
                        <Typography variant="body1" sx={{color: 'inherit'}}>{invoiceDataToUse.invoiceTo}</Typography>
                        <Typography variant="body2" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{invoiceDataToUse.invoiceToAddress}</Typography>
                        {invoiceDataToUse.invoiceToGstin && <Typography variant="body2" sx={{color: 'inherit'}}>GSTIN: {invoiceDataToUse.invoiceToGstin}</Typography>}
                        {invoiceDataToUse.invoiceToMobile && <Typography variant="body2" sx={{color: 'inherit'}}>Mobile: {invoiceDataToUse.invoiceToMobile}</Typography>}
                    </Grid>
                )}
                {showShipToSection && (
                    <Grid item xs={showBillToSection ? 6 : 12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>SHIP TO:</Typography>
                        <Typography variant="body2" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{invoiceDataToUse.shipToAddress}</Typography>
                    </Grid>
                )}

                <Grid item xs={12} sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: selectedColor ? `${selectedColor}20` : 'action.hover' }}>
                                {tableHeaderCells}
                            </TableHead>
                            <TableBody>
                                {renderTableRows()}
                            </TableBody>
                            <TableFooter>
                                <TableRow sx={{ '& td, & th': { fontWeight: 'bold', backgroundColor: '#f0f0f0' } }}>
                                    <TableCell colSpan={2 + (itemTableColumns.hsnSacCode ? 1 : 0) + (customItemColumns?.filter(c => itemTableColumns[c.id]).length || 0) + 2} align="right">
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Sub-total (A)</Typography>
                                    </TableCell>
                                    {itemTableColumns.showGrossValue && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.grossValue, currencySymbol)}</Typography></TableCell>}
                                    {itemTableColumns.discountPerItem && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.discount, currencySymbol)}</Typography></TableCell>}
                                    {taxDisplayMode === 'breakdown' && <TableCell />}
                                    {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.cgst, currencySymbol)}</Typography></TableCell>}
                                    {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.sgst, currencySymbol)}</Typography></TableCell>}
                                    {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.igst, currencySymbol)}</Typography></TableCell>}
                                    {taxDisplayMode === 'breakdown' && itemTableColumns.showCess && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.cess, currencySymbol)}</Typography></TableCell>}
                                    {taxDisplayMode === 'breakdown' && itemTableColumns.showVat && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.vat, currencySymbol)}</Typography></TableCell>}
                                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(columnTotals.amount, currencySymbol)}</Typography></TableCell>
                                </TableRow>

                                {calculatedCharges.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={tableHeaderCells.props.children.length} style={{ borderBottom: "none", paddingTop: '16px' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Additional Charges:</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {calculatedCharges.length > 0 && calculatedCharges.map((charge) => (
                                    <TableRow key={charge.id}>
                                        <TableCell></TableCell>
                                        <TableCell>{charge.label}</TableCell>
                                        {itemTableColumns.hsnSacCode && <TableCell></TableCell>}
                                        {customItemColumns?.map(colConfig => itemTableColumns[colConfig.id] && <TableCell key={colConfig.id}></TableCell>)}
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                        {itemTableColumns.showGrossValue && <TableCell align="right">{formatCurrency(charge.amount, currencySymbol)}</TableCell>}
                                        {itemTableColumns.discountPerItem && <TableCell></TableCell>}
                                        {taxDisplayMode === 'breakdown' && <TableCell></TableCell>}
                                        {taxDisplayMode === 'breakdown' && <TableCell align="right">{formatCurrency(charge.cgst, currencySymbol)}</TableCell>}
                                        {taxDisplayMode === 'breakdown' && <TableCell align="right">{formatCurrency(charge.sgst, currencySymbol)}</TableCell>}
                                        {taxDisplayMode === 'breakdown' && <TableCell align="right">{formatCurrency(charge.igst, currencySymbol)}</TableCell>}
                                        {taxDisplayMode === 'breakdown' && itemTableColumns.showCess && <TableCell align="right">{formatCurrency(charge.cess, currencySymbol)}</TableCell>}
                                        {taxDisplayMode === 'breakdown' && itemTableColumns.showVat && <TableCell align="right">{formatCurrency(charge.vat, currencySymbol)}</TableCell>}
                                        <TableCell align="right">{formatCurrency(charge.total, currencySymbol)}</TableCell>
                                    </TableRow>
                                ))}

                                {calculatedCharges.length > 0 && (() => {
                                    const totalChargesGross = calculatedCharges.reduce((sum, charge) => sum + charge.amount, 0);
                                    const totalChargesCgst = calculatedCharges.reduce((sum, charge) => sum + charge.cgst, 0);
                                    const totalChargesSgst = calculatedCharges.reduce((sum, charge) => sum + charge.sgst, 0);
                                    const totalChargesIgst = calculatedCharges.reduce((sum, charge) => sum + charge.igst, 0);
                                    const totalChargesCess = calculatedCharges.reduce((sum, charge) => sum + (charge.cess || 0), 0);
                                    const totalChargesVat = calculatedCharges.reduce((sum, charge) => sum + (charge.vat || 0), 0);
                                    const totalChargesAmount = calculatedCharges.reduce((sum, charge) => sum + charge.total, 0);
                                    const visibleCustomColumnsCount = customItemColumns?.filter(col => itemTableColumns[col.id]).length || 0;
                                    const colSpanCount = 2 + (itemTableColumns.hsnSacCode ? 1 : 0) + visibleCustomColumnsCount + 2;

                                    const grandTotalGross = columnTotals.grossValue + totalChargesGross;
                                    const grandTotalDiscount = columnTotals.discount;
                                    const grandTotalCgst = columnTotals.cgst + totalChargesCgst;
                                    const grandTotalSgst = columnTotals.sgst + totalChargesSgst;
                                    const grandTotalIgst = columnTotals.igst + totalChargesIgst;
                                    const grandTotalCess = columnTotals.cess + totalChargesCess;
                                    const grandTotalVat = columnTotals.vat + totalChargesVat;

                                    return (
                                        <>
                                            <TableRow sx={{ '& td, & th': { fontWeight: 'bold', backgroundColor: '#f0f0f0' } }}>
                                                <TableCell colSpan={colSpanCount} align="right">
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Sub-total (B)</Typography>
                                                </TableCell>
                                                {itemTableColumns.showGrossValue && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesGross, currencySymbol)}</Typography></TableCell>}
                                                {itemTableColumns.discountPerItem && <TableCell></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesCgst, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesSgst, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesIgst, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && itemTableColumns.showCess && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesCess, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && itemTableColumns.showVat && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesVat, currencySymbol)}</Typography></TableCell>}
                                                <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(totalChargesAmount, currencySymbol)}</Typography></TableCell>
                                            </TableRow>
                                            <TableRow sx={{ '& td, & th': { fontWeight: 'bold', borderTop: '2px solid #333' } }}>
                                                <TableCell colSpan={colSpanCount} align="right">
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Grand Total (A+B)</Typography>
                                                </TableCell>
                                                {itemTableColumns.showGrossValue && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalGross, currencySymbol)}</Typography></TableCell>}
                                                {itemTableColumns.discountPerItem && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalDiscount, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell />}
                                                {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalCgst, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalSgst, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalIgst, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && itemTableColumns.showCess && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalCess, currencySymbol)}</Typography></TableCell>}
                                                {taxDisplayMode === 'breakdown' && itemTableColumns.showVat && <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(grandTotalVat, currencySymbol)}</Typography></TableCell>}
                                                <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(finalGrandTotal, currencySymbol)}</Typography></TableCell>
                                            </TableRow>
                                        </>
                                    );
                                })()}
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2, border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
                    <Grid container>
                        <Grid item xs={12} md={7}>
                            <Box>
                                <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', color: 'inherit' }}>Amount in Words: </Typography>
                                <Typography variant="body1" component="span" sx={{ color: 'inherit' }}>{invoiceDataToUse.amountInWords}</Typography>
                            </Box>
                            {notesDefault && (<Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Notes:</Typography>
                                <Typography variant="caption" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{notesDefault}</Typography>
                            </Box>)}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1, color: 'inherit' }}>Terms & Conditions:</Typography>
                                <Typography variant="caption" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{termsAndConditionsId}</Typography>
                            </Box>
                             {(upiId || displayUpiQrCodeUrl || bankAccountId) && (
                                <Box sx={{mt: 2}}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Payment Details:</Typography>
                                    {upiId && <Typography variant="caption" display="block" sx={{color: 'inherit'}}>UPI ID: {upiId}</Typography>}
                                    {displayUpiQrCodeUrl && <Box component="img" src={displayUpiQrCodeUrl} alt="UPI QR Code" sx={{maxHeight: '100px', mt: 0.5}} />}
                                    {bankAccountId && (selectedBankAccountLabel ?
                                        <Typography variant="caption" display="block" sx={{color: 'inherit', mt: 0.5}}>Bank: {selectedBankAccountLabel}</Typography> :
                                        <Typography variant="caption" display="block" sx={{color: 'inherit', fontStyle: 'italic', mt: 0.5}}>Bank Account ID: {bankAccountId}</Typography>
                                    )}
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <TableContainer>
                                <Table size="small" sx={{ border: '1px solid #ccc' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={2} sx={{ fontWeight: 'bold', color: 'inherit', borderBottom: '1px solid #ccc' }}>
                                                Invoice Payments:
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {showAmountReceived && (
                                            <TableRow>
                                                <TableCell sx={{color: 'inherit', borderBottom: '1px solid #ccc'}}>Amount Received:</TableCell>
                                                <TableCell align="right" sx={{color: 'inherit', borderBottom: '1px solid #ccc'}}>{formatCurrency(invoiceDataToUse.amountReceived, currencySymbol)}</TableCell>
                                            </TableRow>
                                        )}
                                        {showCreditNoteIssued && (
                                            <TableRow>
                                                <TableCell sx={{color: 'inherit', borderBottom: '1px solid #ccc'}}>Credit Note Issued:</TableCell>
                                                <TableCell align="right" sx={{color: 'inherit', borderBottom: '1px solid #ccc'}}>{formatCurrency(invoiceDataToUse.creditNoteIssued, currencySymbol)}</TableCell>
                                            </TableRow>
                                        )}
                                        {showExpensesAdjusted && (
                                            <TableRow>
                                                <TableCell sx={{color: 'inherit', borderBottom: 'none'}}>Expenses Adjusted:</TableCell>
                                                <TableCell align="right" sx={{color: 'inherit', borderBottom: 'none'}}>{formatCurrency(invoiceDataToUse.expensesAdjusted, currencySymbol)}</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell sx={{color: 'inherit', fontWeight: 'bold', borderTop: '1px solid #000'}}>Balance Due:</TableCell>
                                            <TableCell align="right" sx={{color: 'inherit', fontWeight: 'bold', borderTop: '1px solid #000'}}>{formatCurrency(finalBalanceDue, currencySymbol)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>

                             <Box sx={{mt: 4, textAlign: 'right'}}>
                                <Typography variant="body2" sx={{color: 'inherit', display: 'block', mb: 4}}>{authorisedSignatory}</Typography>
                                <Box sx={{minHeight: '50px'}}>
                                     {displaySignatureUrl && <img src={displaySignatureUrl} alt="Signature" style={{ maxHeight: '50px', maxWidth: '150px' }}/>}
                                </Box>
                                <Divider sx={{borderColor: 'currentColor'}}/>
                                <Typography variant="caption" sx={{color: 'inherit', display: 'block', mt: 0.5}}>Authorised Signatory</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} sx={{textAlign: 'center', mt: 2, pt: 2, borderTop: `1px solid ${selectedColor || 'rgba(0,0,0,0.08)'}`}}>
                    {invoiceFooter && <Typography variant="caption" display="block" sx={{color: 'inherit', mt: 1, whiteSpace: 'pre-line'}}>{invoiceFooter}</Typography>}
                    {displayFooterImageUrl && <Box component="img" src={displayFooterImageUrl} alt="Invoice Footer" sx={{maxWidth: '100%', maxHeight: '80px', mt: 1}} />}
                </Grid>
            </Grid>
        </InvoiceLayout>
    );
};

export default InvoicePreview;
