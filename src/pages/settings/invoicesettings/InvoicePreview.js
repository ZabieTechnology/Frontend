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
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Helper to format currency
const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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
        { id: 1, description: "Premium Software Suite - Annual License", hsnSacCode: "998314", quantity: 1, pricePerItem: 25000, discountPerItem: 1000, taxRate: 18, taxPerItem: 4320, cgstRate: 9, sgstRate: 9, igstRate: 0, cessAmountPerItem: 100, amount: 28420 },
        { id: 2, description: "Cloud Hosting Services - Basic Plan", hsnSacCode: "998315", quantity: 12, pricePerItem: 1500, discountPerItem: 0, taxRate: 18, taxPerItem: 3240, cgstRate: 9, sgstRate: 9, igstRate: 0, cessAmountPerItem: 0, amount: 21240 },
        { id: 3, description: "Consultation Services - 5 Hours", hsnSacCode: "998311", quantity: 5, pricePerItem: 3000, discountPerItem: 500, taxRate: 18, taxPerItem: 2610, cgstRate: 9, sgstRate: 9, igstRate: 0, cessAmountPerItem: 50, amount: 17160 },
    ],
    subTotal: 58000,
    discountAmountCalculated: 1500,
    taxableAmount: 56500,
    cgstAmount: 5085,
    sgstAmount: 5085,
    igstAmount: 0,
    overallCessAmount: 150,
    taxTotal: 10170,
    grandTotal: 66820,
    amountPaid: 0,
    balanceDue: 66820,
    amountInWords: "Sixty Six Thousand Eight Hundred Twenty Only",
    bankDetails: {
        name: "Sample Bank Ltd.",
        accountNo: "xxxxxx1234",
        ifsc: "SMPL000567"
    },
    saleAgentName: "John Doe",
    "Project Code": "PRJ-001",
    "custom_header_12345": "REF-ABC",
};

const ModernThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(3),
    fontFamily: 'Arial, sans-serif',
    borderTop: `5px solid ${selectedColor || theme.palette.primary.main}`,
    minHeight: '500px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    position: 'relative',
}));

const StylishThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(3),
    fontFamily: 'Georgia, serif',
    borderLeft: `8px solid ${selectedColor || theme.palette.secondary.main}`,
    backgroundColor: '#f9f9f9',
    minHeight: '500px',
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[3],
    position: 'relative',
}));

const SimpleThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(2),
    fontFamily: 'Verdana, sans-serif',
    border: `1px solid ${selectedColor || '#ccc'}`,
    minHeight: '500px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
}));

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const InvoicePreview = ({ settings, companyDetails: companyDetailsProp, invoiceData, bankAccountOptions = [] }) => {

    const baseInvoiceDataForPreview = invoiceData || sampleInvoiceData || {};

    let itemsToUse = [];
    if (invoiceData && Array.isArray(invoiceData.lineItems)) {
        itemsToUse = invoiceData.lineItems;
    } else if (invoiceData && Array.isArray(invoiceData.items)) {
        itemsToUse = invoiceData.items;
    } else if (sampleInvoiceData && Array.isArray(sampleInvoiceData.items)) {
        itemsToUse = sampleInvoiceData.items;
    }

    const invoiceDataToUse = {
        ...sampleInvoiceData,
        ...baseInvoiceDataForPreview,
        items: itemsToUse,
    };

    const currencySymbol = invoiceDataToUse?.currencySymbol || settings?.currencySymbol || (settings?.currency === 'INR' ? '₹' : '$');

    const effectiveSettings = {
        activeThemeName: "Modern",
        selectedColor: "#4CAF50",
        itemTableColumns: {
            pricePerItem: true,
            quantity: true,
            hsnSacCode: true,
            batchNo: false, expDate: false, mfgDate: false, discountPerItem: false, serialNo: false,
        },
        taxDisplayMode: 'breakdown',
        customItemColumns: [],
        invoiceHeading: "TAX INVOICE",
        invoicePrefix: "INV-",
        invoiceSuffix: "",
        nextInvoiceNumber: 1,
        showPoNumber: true,
        customHeaderFields: [],
        upiId: "",
        upiQrCodeImageUrl: "",
        bankAccountId: "",
        showSaleAgentOnInvoice: false,
        showBillToSection: true,
        showShipToSection: true,
        notesDefault: "Thank you!",
        termsAndConditionsId: "Default T&C.",
        signatureImageUrl: "",
        authorisedSignatory: "For (Your Company Name)",
        companyLogoUrl: "/images/default_logo.png",
        invoiceFooter: "",
        invoiceFooterImageUrl: "",
        ...settings
    };

    const {
        activeThemeName,
        selectedColor,
        itemTableColumns,
        customItemColumns,
        termsAndConditionsId,
        signatureImageUrl,
        authorisedSignatory,
        notesDefault,
        companyLogoUrl,
        showBillToSection,
        showShipToSection,
        showSaleAgentOnInvoice,
        upiId,
        upiQrCodeImageUrl,
        bankAccountId,
        invoicePrefix,
        invoiceSuffix,
        invoiceHeading,
        invoiceFooter,
        invoiceFooterImageUrl,
        showPoNumber,
        taxDisplayMode,
        customHeaderFields
    } = effectiveSettings;

    const displayCompany = invoiceDataToUse?.companyDetails || companyDetailsProp || {
        name: "Your Company LLC",
        address: "123 Innovation Drive, Tech Park, Suite 100",
        mobile: "+1-555-0100",
        email: "info@yourcompany.com",
        gstin: "YOUR_COMPANY_GSTIN",
        logoUrl: companyLogoUrl,
    };

    const formattedInvoiceNumber = `${invoicePrefix || ''}${invoiceDataToUse.invoiceNumber || ''}${invoiceSuffix || ''}`;

    const renderTableHeaders = () => {
        const headers = [];
        headers.push(<TableCell key="sno" sx={{color: 'inherit', fontWeight:'bold'}}>#</TableCell>);
        headers.push(<TableCell key="desc" sx={{color: 'inherit', fontWeight:'bold'}}>Items</TableCell>);

        if (itemTableColumns.hsnSacCode) headers.push(<TableCell key="hsn" sx={{color: 'inherit', fontWeight:'bold'}}>HSN/SAC</TableCell>);
        if (itemTableColumns.batchNo) headers.push(<TableCell key="batch" sx={{color: 'inherit', fontWeight:'bold'}}>Batch No.</TableCell>);
        if (itemTableColumns.expDate) headers.push(<TableCell key="exp" sx={{color: 'inherit', fontWeight:'bold'}}>Exp. Date</TableCell>);
        if (itemTableColumns.mfgDate) headers.push(<TableCell key="mfg" sx={{color: 'inherit', fontWeight:'bold'}}>Mfg. Date</TableCell>);
        if (itemTableColumns.serialNo) headers.push(<TableCell key="serial" sx={{color: 'inherit', fontWeight:'bold'}}>Serial No.</TableCell>);

        customItemColumns?.forEach(colConfig => {
            if (itemTableColumns[colConfig.id]) {
                 headers.push(<TableCell key={colConfig.id} sx={{color: 'inherit', fontWeight:'bold'}}>{colConfig.name}</TableCell>);
            }
        });
        headers.push(<TableCell align="right" key="qty" sx={{color: 'inherit', fontWeight:'bold'}}>Qty</TableCell>);
        headers.push(<TableCell align="right" key="rate" sx={{color: 'inherit', fontWeight:'bold'}}>Rate</TableCell>);
        if (itemTableColumns.discountPerItem) headers.push(<TableCell align="right" key="discount" sx={{color: 'inherit', fontWeight:'bold'}}>Discount</TableCell>);

        if (taxDisplayMode === 'breakdown') {
            headers.push(<TableCell align="right" key="taxRate" sx={{color: 'inherit', fontWeight:'bold'}}>Tax %</TableCell>);
            headers.push(<TableCell align="right" key="cgst" sx={{color: 'inherit', fontWeight:'bold'}}>CGST</TableCell>);
            headers.push(<TableCell align="right" key="sgst" sx={{color: 'inherit', fontWeight:'bold'}}>SGST</TableCell>);
            headers.push(<TableCell align="right" key="igst" sx={{color: 'inherit', fontWeight:'bold'}}>IGST</TableCell>);
            if (itemTableColumns.showCess) {
                headers.push(<TableCell align="right" key="cess" sx={{color: 'inherit', fontWeight:'bold'}}>Cess</TableCell>);
            }
        }

        headers.push(<TableCell align="right" key="amount" sx={{color: 'inherit', fontWeight:'bold'}}>Amount</TableCell>);
        return <TableRow>{headers}</TableRow>;
    };

    const tableHeaderCells = React.useMemo(() => renderTableHeaders(), [itemTableColumns, customItemColumns, taxDisplayMode]);


    const renderTableRows = () => {
        if (!Array.isArray(invoiceDataToUse.items) || invoiceDataToUse.items.length === 0) {
            const numberOfColumns = tableHeaderCells.props.children.length;
            return (
                <TableRow>
                    <TableCell colSpan={numberOfColumns} align="center" sx={{color: 'inherit'}}>
                        No items to display.
                    </TableCell>
                </TableRow>
            );
        }

        return invoiceDataToUse.items.map((item, index) => {
            const taxableAmount = (item.pricePerItem * item.quantity) - (item.discountPerItem || 0);
            const cgstAmount = taxableAmount * ((item.cgstRate || 0) / 100);
            const sgstAmount = taxableAmount * ((item.sgstRate || 0) / 100);
            const igstAmount = taxableAmount * ((item.igstRate || 0) / 100);
            const finalAmount = taxDisplayMode === 'no_tax' ? taxableAmount : item.amount;

            return (
                <TableRow key={item.id || index}>
                    <TableCell sx={{color: 'inherit'}}>{index + 1}</TableCell>
                    <TableCell sx={{color: 'inherit'}}>{item.description}</TableCell>
                    {itemTableColumns.hsnSacCode && <TableCell sx={{color: 'inherit'}}>{item.hsnSacCode}</TableCell>}
                    {itemTableColumns.batchNo && <TableCell sx={{color: 'inherit'}}>{item.batchNo}</TableCell>}
                    {itemTableColumns.expDate && <TableCell sx={{color: 'inherit'}}>{item.expDate}</TableCell>}
                    {itemTableColumns.mfgDate && <TableCell sx={{color: 'inherit'}}>{item.mfgDate}</TableCell>}
                    {itemTableColumns.serialNo && <TableCell sx={{color: 'inherit'}}>{item.serialNo}</TableCell>}
                    {customItemColumns?.map(colConfig => {
                        if (itemTableColumns[colConfig.id]) {
                            const value = item[colConfig.id] || item[colConfig.name?.toLowerCase().replace(/\s+/g, '')] || 'N/A';
                            return <TableCell key={colConfig.id} sx={{color: 'inherit'}}>{value}</TableCell>;
                        }
                        return null;
                    })}
                    <TableCell align="right" sx={{color: 'inherit'}}>{item.quantity}</TableCell>
                    <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(item.pricePerItem, currencySymbol)}</TableCell>
                    {itemTableColumns.discountPerItem && <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(item.discountPerItem, currencySymbol)}</TableCell>}

                    {taxDisplayMode === 'breakdown' && (
                        <>
                            <TableCell align="right" sx={{color: 'inherit'}}>{item.taxRate !== undefined ? `${item.taxRate}%` : 'N/A'}</TableCell>
                            <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(cgstAmount, currencySymbol)}</TableCell>
                            <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(sgstAmount, currencySymbol)}</TableCell>
                            <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(igstAmount, currencySymbol)}</TableCell>
                            {itemTableColumns.showCess && <TableCell align="right" sx={{color: 'inherit'}}>{formatCurrency(item.cessAmountPerItem, currencySymbol)}</TableCell>}
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

        return React.cloneElement(SelectedThemeWrapper, {},
            <>
                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: selectedColor || 'text.secondary',
                        opacity: 0.7,
                        fontStyle: 'italic'
                    }}
                >
                    Theme: {activeThemeName}
                </Typography>
                {children}
            </>
        );
    };

    let displaySignatureUrl = null;
    if (signatureImageUrl && typeof signatureImageUrl === 'string' && signatureImageUrl.trim() !== "") {
        if (signatureImageUrl.startsWith('http') || signatureImageUrl.startsWith('data:')) {
            displaySignatureUrl = signatureImageUrl;
        } else {
            displaySignatureUrl = `${API_BASE_URL}${signatureImageUrl.startsWith('/') ? '' : '/uploads/signatures/'}${signatureImageUrl}`;
        }
    }

    let displayUpiQrCodeUrl = null;
    if (upiQrCodeImageUrl && typeof upiQrCodeImageUrl === 'string' && upiQrCodeImageUrl.trim() !== "") {
        if (upiQrCodeImageUrl.startsWith('http') || upiQrCodeImageUrl.startsWith('data:')) {
            displayUpiQrCodeUrl = upiQrCodeImageUrl;
        } else {
            displayUpiQrCodeUrl = `${API_BASE_URL}${upiQrCodeImageUrl.startsWith('/') ? '' : '/uploads/upi_qr/'}${upiQrCodeImageUrl}`;
        }
    }

    let displayFooterImageUrl = null;
    if (invoiceFooterImageUrl && typeof invoiceFooterImageUrl === 'string' && invoiceFooterImageUrl.trim() !== "") {
        if (invoiceFooterImageUrl.startsWith('http') || invoiceFooterImageUrl.startsWith('data:')) {
            displayFooterImageUrl = invoiceFooterImageUrl;
        } else {
            displayFooterImageUrl = `${API_BASE_URL}${invoiceFooterImageUrl.startsWith('/') ? '' : '/uploads/footers/'}${invoiceFooterImageUrl}`;
        }
    }

    let selectedBankAccountLabel = null;
    if (bankAccountId && bankAccountOptions && bankAccountOptions.length > 0) {
        const foundAccount = bankAccountOptions.find(opt => opt.value === bankAccountId);
        if (foundAccount) {
            selectedBankAccountLabel = foundAccount.label;
        }
    }

    const showTaxInTotals = taxDisplayMode !== 'no_tax';
    const finalGrandTotal = showTaxInTotals ? invoiceDataToUse.grandTotal : (invoiceDataToUse.subTotal - invoiceDataToUse.discountAmountCalculated);
    const finalBalanceDue = showTaxInTotals ? invoiceDataToUse.balanceDue : (finalGrandTotal - invoiceDataToUse.amountPaid);

    return (
        <InvoiceLayout>
            <Grid container spacing={2}>
                <Grid item xs={7}>
                    {displayCompany.logoUrl && (
                        <Avatar src={displayCompany.logoUrl.startsWith('http') || displayCompany.logoUrl.startsWith('/') ? displayCompany.logoUrl : process.env.PUBLIC_URL + displayCompany.logoUrl} alt="Company Logo" variant="square" sx={{ width: 80, height: 80, mb: 1, objectFit: 'contain', border: '1px solid #eee' }} onError={(e) => e.target.style.display='none'} />
                    )}
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>
                        {displayCompany.name}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{displayCompany.address}</Typography>
                    {displayCompany.mobile && <Typography variant="body2" sx={{color: 'inherit'}}>Mobile: {displayCompany.mobile}</Typography>}
                    {displayCompany.email && <Typography variant="body2" sx={{color: 'inherit'}}>Email: {displayCompany.email}</Typography>}
                    {displayCompany.gstin && <Typography variant="body2" sx={{color: 'inherit'}}>GSTIN: {displayCompany.gstin}</Typography>}
                </Grid>
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>
                        {invoiceHeading || "TAX INVOICE"}
                    </Typography>
                    <Typography variant="body1" sx={{color: 'inherit'}}>{formattedInvoiceNumber}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Date: {invoiceDataToUse.invoiceDate}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Due Date: {invoiceDataToUse.dueDate}</Typography>
                    {showPoNumber && invoiceDataToUse.poNumber && (
                        <Typography variant="body2" sx={{color: 'inherit'}}>PO Number: {invoiceDataToUse.poNumber}</Typography>
                    )}
                    {customHeaderFields?.map(field =>
                        field.displayOnInvoice && (
                            <Typography variant="body2" key={field.id} sx={{color: 'inherit'}}>
                                {field.label}: {invoiceDataToUse[field.id] || invoiceDataToUse[field.label?.toLowerCase().replace(/\s+/g, '')] || 'N/A'}
                            </Typography>
                        )
                    )}
                    {showSaleAgentOnInvoice && invoiceDataToUse.saleAgentName && (
                        <Typography variant="body2" sx={{color: 'inherit', mt: 0.5}}>Sale Agent: {invoiceDataToUse.saleAgentName}</Typography>
                    )}
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2, borderColor: selectedColor || 'rgba(0,0,0,0.12)' }} /></Grid>

                {showBillToSection && (
                    <Grid item xs={showShipToSection ? 6 : 12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>BILL TO:</Typography>
                        <Typography variant="body1" sx={{color: 'inherit'}}>{invoiceDataToUse.invoiceTo || invoiceDataToUse.customerName}</Typography>
                        <Typography variant="body2" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{invoiceDataToUse.invoiceToAddress || invoiceDataToUse.customerAddress}</Typography>
                        { (invoiceDataToUse.invoiceToGstin || invoiceDataToUse.customerGstin) && <Typography variant="body2" sx={{color: 'inherit'}}>GSTIN: {invoiceDataToUse.invoiceToGstin || invoiceDataToUse.customerGstin}</Typography>}
                        { (invoiceDataToUse.invoiceToMobile || invoiceDataToUse.customerMobile) && <Typography variant="body2" sx={{color: 'inherit'}}>Mobile: {invoiceDataToUse.invoiceToMobile || invoiceDataToUse.customerMobile}</Typography>}
                    </Grid>
                )}
                {showShipToSection && (
                    <Grid item xs={showBillToSection ? 6 : 12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>SHIP TO:</Typography>
                        <Typography variant="body2" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{invoiceDataToUse.shipToAddress || invoiceDataToUse.invoiceToAddress || invoiceDataToUse.customerAddress}</Typography>
                    </Grid>
                )}
                {(!showBillToSection && !showShipToSection) && <Grid item xs={12}><Typography variant="caption" color="textSecondary">Billing and Shipping details are hidden by settings.</Typography></Grid> }

                <Grid item xs={12} sx={{ mt: (showBillToSection || showShipToSection) ? 2 : 0 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: selectedColor ? `${selectedColor}20` : 'action.hover' }}>
                                {tableHeaderCells}
                            </TableHead>
                            <TableBody>
                                {renderTableRows()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12} container sx={{ mt: 2 }}>
                    <Grid item xs={12} md={7} sx={{ pr: { md: 2 }, mb: {xs: 2, md: 0} }}>
                        <Typography variant="body1" component="span" sx={{ fontWeight: 'bold', color: 'inherit' }}>Amount in Words: </Typography>
                        <Typography variant="body1" component="span" sx={{ color: 'inherit' }}>
                            {invoiceDataToUse.amountInWords}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Grid container>
                            <Grid item xs={7} sx={{ textAlign: 'right', pr: 2 }}>
                                <Typography variant="body1" sx={{color: 'inherit'}}>Subtotal:</Typography>
                                <Typography variant="body1" sx={{color: 'inherit'}}>Discount:</Typography>
                                {showTaxInTotals && <Typography variant="body1" sx={{color: 'inherit'}}>Taxable Amount:</Typography>}
                                {showTaxInTotals && taxDisplayMode === 'breakdown' && <Typography variant="body1" sx={{color: 'inherit'}}>CGST:</Typography>}
                                {showTaxInTotals && taxDisplayMode === 'breakdown' && <Typography variant="body1" sx={{color: 'inherit'}}>SGST:</Typography>}
                                {showTaxInTotals && taxDisplayMode === 'breakdown' && <Typography variant="body1" sx={{color: 'inherit'}}>IGST:</Typography>}
                                {showTaxInTotals && itemTableColumns.showCess && <Typography variant="body1" sx={{color: 'inherit'}}>CESS:</Typography>}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, color: selectedColor || 'inherit' }}>TOTAL AMOUNT:</Typography>
                                <Typography variant="body1" sx={{color: 'inherit', mt: 0.5}}>Amount Received:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'inherit' }}>Balance Due:</Typography>
                            </Grid>
                            <Grid item xs={5} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.subTotal, currencySymbol)}</Typography>
                                <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.discountAmountCalculated, currencySymbol)}</Typography>
                                {showTaxInTotals && <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.taxableAmount, currencySymbol)}</Typography>}
                                {showTaxInTotals && taxDisplayMode === 'breakdown' && <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.cgstAmount, currencySymbol)}</Typography>}
                                {showTaxInTotals && taxDisplayMode === 'breakdown' && <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.sgstAmount, currencySymbol)}</Typography>}
                                {showTaxInTotals && taxDisplayMode === 'breakdown' && <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.igstAmount, currencySymbol)}</Typography>}
                                {showTaxInTotals && itemTableColumns.showCess && <Typography variant="body1" sx={{color: 'inherit'}}>{formatCurrency(invoiceDataToUse.overallCessAmount, currencySymbol)}</Typography>}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, color: selectedColor || 'inherit' }}>{formatCurrency(finalGrandTotal, currencySymbol)}</Typography>
                                <Typography variant="body1" sx={{color: 'inherit', mt: 0.5}}>{formatCurrency(invoiceDataToUse.amountPaid, currencySymbol)}</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'inherit' }}>{formatCurrency(finalBalanceDue, currencySymbol)}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>


                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                </Grid>

                <Grid item xs={12} md={7}>
                    {notesDefault && (<>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Notes:</Typography>
                        <Typography variant="caption" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{notesDefault}</Typography>
                    </>)}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: notesDefault ? 1 : 0, color: 'inherit' }}>Terms & Conditions:</Typography>
                    <Typography variant="caption" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>
                        {termsAndConditionsId || "1. Goods once sold will not be taken back.\n2. All disputes subject to local jurisdiction."}
                    </Typography>
                    {(upiId || displayUpiQrCodeUrl || bankAccountId) && (
                        <Box sx={{mt: 2}}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Payment Details:</Typography>
                            {upiId && <Typography variant="caption" display="block" sx={{color: 'inherit'}}>UPI ID: {upiId}</Typography>}
                            {displayUpiQrCodeUrl && (
                                <Box component="img" src={displayUpiQrCodeUrl} alt="UPI QR Code" sx={{maxHeight: '100px', maxWidth: '100px', mt: 0.5, border: '1px solid #eee'}} onError={(e) => e.target.style.display='none'} />
                            )}
                            {bankAccountId && (
                                invoiceDataToUse.bankDetails && invoiceDataToUse.bankDetails.name ? (
                                    <Typography variant="caption" display="block" sx={{color: 'inherit', mt: (upiId || displayUpiQrCodeUrl) ? 0.5 : 0}}>
                                        Bank: {invoiceDataToUse.bankDetails.name}, A/C: {invoiceDataToUse.bankDetails.accountNo}, IFSC: {invoiceDataToUse.bankDetails.ifsc}
                                    </Typography>
                                ) : selectedBankAccountLabel ? (
                                     <Typography variant="caption" display="block" sx={{color: 'inherit', fontStyle: 'italic', mt: (upiId || displayUpiQrCodeUrl) ? 0.5 : 0}}>
                                        Bank: {selectedBankAccountLabel}
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" display="block" sx={{color: 'inherit', fontStyle: 'italic', mt: (upiId || displayUpiQrCodeUrl) ? 0.5 : 0}}>
                                        Bank Account ID: {bankAccountId}
                                    </Typography>
                                )
                            )}
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} md={5} sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                     <Box sx={{mt: 4}}>
                        <Typography variant="body2" sx={{color: 'inherit', display: 'block', mb: 4}}>
                            {authorisedSignatory || 'For (Your Company Name)'}
                        </Typography>
                        <Box sx={{minHeight: '50px'}}>
                             {displaySignatureUrl && (
                                 <img src={displaySignatureUrl} alt="Signature" style={{ maxHeight: '50px', maxWidth: '150px', display: 'block', marginLeft: 'auto' }} onError={(e) => e.target.style.display='none'}/>
                             )}
                        </Box>
                        <Divider sx={{borderColor: 'currentColor'}}/>
                        <Typography variant="caption" sx={{color: 'inherit', display: 'block', mt: 0.5}}>
                            Authorised Signatory
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sx={{textAlign: 'center', mt: 2, pt: 2, borderTop: `1px solid ${selectedColor || 'rgba(0,0,0,0.08)'}`}}>
                    {invoiceFooter && <Typography variant="caption" display="block" sx={{color: 'inherit', mt: 1, whiteSpace: 'pre-line'}}>{invoiceFooter}</Typography>}
                    {displayFooterImageUrl && (
                        <Box component="img" src={displayFooterImageUrl} alt="Invoice Footer" sx={{maxWidth: '100%', maxHeight: '80px', mt: 1, objectFit: 'contain'}} onError={(e) => e.target.style.display='none'} />
                    )}
                </Grid>
            </Grid>
        </InvoiceLayout>
    );
};

export default InvoicePreview;
