import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  Tabs,
  Tab,
  TextField,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
  TableFooter,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {
  Share,
  ArrowBack as ArrowBackIcon,
  MailOutline as MailIcon,
  WhatsApp as WhatsAppIcon,
  Link as LinkIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  FileCopy as FileCopyIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  History as HistoryIcon,
  Description as NotesIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  CreditScore as CreditScoreIcon,
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Send as SendIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';

//================================================================================
// --- REUSABLE INVOICE PREVIEW COMPONENT ---
//================================================================================

// --- Helper Functions & Styled Components ---

const getCurrencySymbol = (currencyCode = 'INR') => {
    const symbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
    };
    return symbols[currencyCode] || '₹';
};

const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    const symbolToUse = getCurrencySymbol(currencySymbol) || currencySymbol;
    return `${symbolToUse}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const safeFormatDate = (dateInput, formatString) => {
    if (!dateInput) return 'N/A';
    try {
        const date = dateInput instanceof Date ? dateInput : parseISO(dateInput);
        return isValid(date) ? format(date, formatString) : 'Invalid Date';
    } catch (e) {
        console.error("Date formatting failed:", e);
        return 'Invalid Date';
    }
};

const toWords = (num) => {
    const a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    const b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

    if ((num = Math.floor(num).toString()).length > 9) return 'Overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (parseInt(n[1], 10) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (parseInt(n[2], 10) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (parseInt(n[3], 10) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (parseInt(n[4], 10) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (parseInt(n[5], 10) !== 0) ? ((str !== '') ? '' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    let result = str.trim();
    if (result) {
        result = result.charAt(0).toUpperCase() + result.slice(1);
        return result + ' Only';
    }
    return 'Zero Only';
};

const ModernThemeWrapper = styled(Paper, {
    shouldForwardProp: (prop) => prop !== 'selectedColor' && prop !== 'textColor'
})(({ theme, selectedColor, textColor }) => ({
    padding: theme.spacing(3), fontFamily: 'Arial, sans-serif',
    borderTop: `5px solid ${selectedColor || '#2196F3'}`,
    color: textColor || '#333', backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative',
}));

const renderCustomField = (field, value) => {
    const fieldValue = value !== undefined ? value : field.defaultValue;

    const getPlaceholder = (type) => {
        switch (type) {
            case 'text': return '(Text)';
            case 'number': return '(Number)';
            case 'date': return '(dd/mm/yyyy)';
            default: return '(Not Set)';
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
                    <RadioGroup row value={fieldValue ? 'yes' : 'no'} name={`radio-buttons-group-${field.id}`}>
                        <FormControlLabel value="yes" control={<Radio size="small" />} label={<Typography variant="body2">Yes</Typography>} disabled />
                        <FormControlLabel value="no" control={<Radio size="small" />} label={<Typography variant="body2">No</Typography>} disabled />
                    </RadioGroup>
                </Box>
            );
        default:
            return (
                <Typography variant="body2" key={field.id} sx={{ color: 'inherit' }}>
                    {field.label}: {fieldValue || getPlaceholder(field.type)}
                </Typography>
            );
    }
};


// --- InvoicePreview Component ---

const InvoicePreview = ({ settings, companyDetails, invoiceData }) => {

    // Merge passed settings with defaults to ensure all keys exist
    const effectiveSettings = {
        activeThemeName: "Modern", selectedColor: "#2196F3",
        ...settings,
        itemTableColumns: { ...settings?.itemTableColumns },
        customHeaderFields: settings?.customHeaderFields || [],
        additionalCharges: settings?.additionalCharges || [],
    };

    const {
        selectedColor, textColor, itemTableColumns,
        termsAndConditionsId,
        showBillToSection, showShipToSection,
        invoicePrefix, invoiceSuffix, invoiceHeading = "TAX INVOICE",
        showPoNumber, taxDisplayMode, customHeaderFields, showSaleAgentOnInvoice,
        notesDefault, authorisedSignatory, signatureImageUrl,
        upiId, upiQrCodeImageUrl, bankAccountId, enableRounding,
        showAmountReceived, showCreditNoteIssued, showExpensesAdjusted,
        additionalCharges, invoiceFooter, invoiceFooterImageUrl
    } = effectiveSettings;

    const currencySymbol = getCurrencySymbol(companyDetails?.currency);

    const displayCompany = {
        name: companyDetails?.name || "Your Company Name",
        address: companyDetails?.address || "123 Main St, Anytown, USA",
        mobile: companyDetails?.mobile || "555-1234",
        email: companyDetails?.email || "contact@example.com",
        gstin: companyDetails?.gstin || "YOUR_GSTIN_HERE",
        vatNumber: companyDetails?.vatNumber || "YOUR_VAT_NUMBER_HERE",
        logoUrl: companyDetails?.logoUrl,
    };

    const formattedInvoiceNumber = `${invoicePrefix || ''}${invoiceData.invoiceNumber}${invoiceSuffix || ''}`;

    const columnTotals = React.useMemo(() => {
        const totals = { grossValue: 0, discount: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, vat: 0, amount: 0, taxableAmount: 0 };
        (invoiceData.items || []).forEach(item => {
            const gross = (item.quantity || 0) * (item.rate || 0);
            const discount = item.discountPerItem || 0;
            totals.grossValue += gross;
            totals.discount += discount;
            totals.cgst += item.cgstAmount || 0;
            totals.sgst += item.sgstAmount || 0;
            totals.igst += item.igstAmount || 0;
            totals.cess += item.cessAmountCalculated || 0;
            totals.vat += item.vatAmount || 0;
            totals.amount += item.amount || 0;
            totals.taxableAmount += gross - discount;
        });
        return totals;
    }, [invoiceData.items]);

    const calculatedCharges = (additionalCharges || []).map(charge => {
        const amount = parseFloat(charge.value) || 0;
        const taxRate = 18; // Assuming 18% for charges
        const taxAmount = amount * (taxRate / 100);
        return { ...charge, amount, total: amount + taxAmount, cgst: taxAmount / 2, sgst: taxAmount / 2, igst: 0, cess: 0, vat: 0, taxRate};
    });

    const totalAdditionalCharges = calculatedCharges.reduce((acc, charge) => {
        acc.amount += charge.amount;
        acc.total += charge.total;
        acc.cgst += charge.cgst;
        acc.sgst += charge.sgst;
        acc.igst += charge.igst || 0;
        acc.cess += charge.cess || 0;
        acc.vat += charge.vat || 0;
        return acc;
    }, { amount: 0, total: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, vat: 0 });


    const finalGrandTotal = columnTotals.amount + totalAdditionalCharges.total;
    const roundedTotal = Math.round(finalGrandTotal);
    const roundingOffAmount = enableRounding ? roundedTotal - finalGrandTotal : 0;
    const finalAmountPayable = enableRounding ? roundedTotal : finalGrandTotal;
    const totalPaid = (invoiceData.amountReceived || 0) + (invoiceData.creditNoteIssued || 0) + (invoiceData.expensesAdjusted || 0);
    const finalBalanceDue = finalAmountPayable - totalPaid;
    const amountInWords = toWords(finalAmountPayable);

    const renderTableHeaders = React.useCallback(() => {
        const headers = [<TableCell key="sno">#</TableCell>, <TableCell key="desc">Items</TableCell>];
        if (itemTableColumns.hsnSacCode) headers.push(<TableCell key="hsn">HSN/SAC</TableCell>);
        headers.push(<TableCell align="right" key="qty">Qty</TableCell>, <TableCell align="right" key="rate">Rate</TableCell>);
        if (itemTableColumns.showGrossValue) headers.push(<TableCell align="right" key="gross">Gross Value</TableCell>);
        if (itemTableColumns.discountPerItem) headers.push(<TableCell align="right" key="discount">Discount</TableCell>);
        if (taxDisplayMode === 'breakdown') {
            headers.push(<TableCell align="right">Tax %</TableCell>, <TableCell align="right">CGST</TableCell>, <TableCell align="right">SGST</TableCell>, <TableCell align="right">IGST</TableCell>);
            if (itemTableColumns.showCess) headers.push(<TableCell align="right">Cess</TableCell>);
            if (itemTableColumns.showVat) headers.push(<TableCell align="right">VAT</TableCell>);
        }
        headers.push(<TableCell align="right" key="amount">Amount</TableCell>);
        return <TableRow sx={{ '& th': {color: 'inherit', fontWeight:'bold', fontSize: '0.8rem'}}}>{headers}</TableRow>;
    }, [itemTableColumns, taxDisplayMode]);

    const renderTableRows = () => (invoiceData.items || []).map((item, index) => (
        <TableRow key={item.id || index} sx={{'& td': {fontSize: '0.8rem'}}}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{item.itemName || item.description}</TableCell>
            {itemTableColumns.hsnSacCode && <TableCell>{item.hsnSac}</TableCell>}
            <TableCell align="right">{item.quantity}</TableCell>
            <TableCell align="right">{formatCurrency(item.rate, currencySymbol)}</TableCell>
            {itemTableColumns.showGrossValue && <TableCell align="right">{formatCurrency(item.quantity * item.rate, currencySymbol)}</TableCell>}
            {itemTableColumns.discountPerItem && <TableCell align="right">{formatCurrency(item.discountPerItem, currencySymbol)}</TableCell>}
            {taxDisplayMode === 'breakdown' && <>
                <TableCell align="right">{item.taxRate}%</TableCell>
                <TableCell align="right">{formatCurrency(item.cgstAmount, currencySymbol)}</TableCell>
                <TableCell align="right">{formatCurrency(item.sgstAmount, currencySymbol)}</TableCell>
                <TableCell align="right">{formatCurrency(item.igstAmount, currencySymbol)}</TableCell>
                {itemTableColumns.showCess && <TableCell align="right">{formatCurrency(item.cessAmountCalculated, currencySymbol)}</TableCell>}
                {itemTableColumns.showVat && <TableCell align="right">{formatCurrency(item.vatAmount, currencySymbol)}</TableCell>}
            </>}
            <TableCell align="right">{formatCurrency(item.amount, currencySymbol)}</TableCell>
        </TableRow>
    ));

    const numCols = React.useMemo(() => renderTableHeaders().props.children.length, [renderTableHeaders]);
    const numValueCols = 1 + (itemTableColumns.showGrossValue ? 1 : 0) + (itemTableColumns.discountPerItem ? 1 : 0) + (taxDisplayMode === 'breakdown' ? (4 + (itemTableColumns.showCess ? 1 : 0) + (itemTableColumns.showVat ? 1 : 0)) : 0);
    const labelColSpan = numCols - numValueCols;

    return (
        <ModernThemeWrapper selectedColor={selectedColor} textColor={textColor}>
            <Grid container spacing={2}>
                <Grid item xs={7}>
                    {displayCompany.logoUrl && <Avatar src={displayCompany.logoUrl} alt="Logo" variant="square" sx={{ width: 80, height: 80, mb: 1, objectFit: 'contain' }} />}
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: selectedColor }}>{displayCompany.name}</Typography>
                    <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>{displayCompany.address}</Typography>
                    <Typography variant="body2">Mobile: {displayCompany.mobile}</Typography>
                    <Typography variant="body2">Email: {displayCompany.email}</Typography>
                    <Typography variant="body2">GSTIN: {displayCompany.gstin}</Typography>
                    {displayCompany.vatNumber && <Typography variant="body2">VAT: {displayCompany.vatNumber}</Typography>}
                </Grid>
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 2 }}>
                         {invoiceData.qrCodeUrl && (
                            <img src={invoiceData.qrCodeUrl} alt="E-invoice QR Code" style={{ width: 80, height: 80 }} />
                        )}
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{invoiceHeading}</Typography>
                            <Typography variant="body1">{formattedInvoiceNumber}</Typography>
                             {invoiceData.eWayBillNumber && <Typography variant="body2">e-Way Bill: {invoiceData.eWayBillNumber}</Typography>}
                            <Typography variant="body2">Date: {safeFormatDate(invoiceData.invoiceDate, 'dd/MM/yyyy')}</Typography>
                            <Typography variant="body2">Due Date: {safeFormatDate(invoiceData.dueDate, 'dd/MM/yyyy')}</Typography>
                            {showPoNumber && <Typography variant="body2">PO Number: {invoiceData.poNumber}</Typography>}
                            {customHeaderFields?.map(field => field.displayOnInvoice && <Box key={field.id}>{renderCustomField(field, invoiceData[field.id])}</Box>)}
                            {showSaleAgentOnInvoice && invoiceData.saleAgentName && <Typography variant="body2" sx={{fontWeight:'bold', mt:0.5}}>Sale Agent: {invoiceData.saleAgentName}</Typography>}
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
                {showBillToSection && <Grid item xs={showShipToSection ? 6:12}><Typography variant="subtitle1" sx={{fontWeight:'bold'}}>BILL TO:</Typography><Typography variant="body1">{invoiceData.customer?.name}</Typography><Typography variant="body2">{invoiceData.customerAddress}</Typography></Grid>}
                {showShipToSection && <Grid item xs={showBillToSection ? 6:12}><Typography variant="subtitle1" sx={{fontWeight:'bold'}}>SHIP TO:</Typography><Typography variant="body2">{invoiceData.shipToAddress}</Typography></Grid>}

                <Grid item xs={12} sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: `${selectedColor}20` }}>{renderTableHeaders()}</TableHead>
                            <TableBody>{renderTableRows()}</TableBody>
                            <TableFooter sx={{'& td, & th': {fontSize: '0.8rem', fontWeight: 'bold'}}}>
                                <TableRow>
                                    <TableCell colSpan={labelColSpan} align="right">Sub-total (A)</TableCell>
                                    {itemTableColumns.showGrossValue && <TableCell align="right">{formatCurrency(columnTotals.grossValue, currencySymbol)}</TableCell>}
                                    {itemTableColumns.discountPerItem && <TableCell align="right">{formatCurrency(columnTotals.discount, currencySymbol)}</TableCell>}
                                    {taxDisplayMode === 'breakdown' && <>
                                        <TableCell/>
                                        <TableCell align="right">{formatCurrency(columnTotals.cgst, currencySymbol)}</TableCell>
                                        <TableCell align="right">{formatCurrency(columnTotals.sgst, currencySymbol)}</TableCell>
                                        <TableCell align="right">{formatCurrency(columnTotals.igst, currencySymbol)}</TableCell>
                                        {itemTableColumns.showCess && <TableCell align="right">{formatCurrency(columnTotals.cess, currencySymbol)}</TableCell>}
                                        {itemTableColumns.showVat && <TableCell align="right">{formatCurrency(columnTotals.vat, currencySymbol)}</TableCell>}
                                    </>}
                                    <TableCell align="right">{formatCurrency(columnTotals.amount, currencySymbol)}</TableCell>
                                </TableRow>

                                {calculatedCharges.length > 0 && <TableRow><TableCell colSpan={numCols} sx={{borderBottom: "none", pt: 2, fontSize: '0.8rem', fontWeight: 'bold'}}><Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Additional Charges:</Typography></TableCell></TableRow>}
                                {calculatedCharges.map(charge => (
                                    <TableRow key={charge.id} sx={{'& td': {fontSize: '0.8rem'}}}>
                                        <TableCell colSpan={labelColSpan} align="right">{charge.label}</TableCell>
                                        {itemTableColumns.showGrossValue && <TableCell align="right">{formatCurrency(charge.amount, currencySymbol)}</TableCell>}
                                        {itemTableColumns.discountPerItem && <TableCell />}
                                        {taxDisplayMode === 'breakdown' && <>
                                            <TableCell align="right">{charge.taxRate}%</TableCell>
                                            <TableCell align="right">{formatCurrency(charge.cgst, currencySymbol)}</TableCell>
                                            <TableCell align="right">{formatCurrency(charge.sgst, currencySymbol)}</TableCell>
                                            <TableCell align="right">{formatCurrency(charge.igst, currencySymbol)}</TableCell>
                                            {itemTableColumns.showCess && <TableCell align="right">{formatCurrency(charge.cess, currencySymbol)}</TableCell>}
                                            {itemTableColumns.showVat && <TableCell align="right">{formatCurrency(charge.vat, currencySymbol)}</TableCell>}
                                        </>}
                                        <TableCell align="right">{formatCurrency(charge.total, currencySymbol)}</TableCell>
                                    </TableRow>
                                ))}

                                {calculatedCharges.length > 0 && (
                                    <>
                                    <TableRow>
                                        <TableCell colSpan={labelColSpan} align="right">Sub-total (B)</TableCell>
                                        {itemTableColumns.showGrossValue && <TableCell align="right">{formatCurrency(totalAdditionalCharges.amount, currencySymbol)}</TableCell>}
                                        {itemTableColumns.discountPerItem && <TableCell />}
                                        {taxDisplayMode === 'breakdown' && <>
                                            <TableCell/>
                                            <TableCell align="right">{formatCurrency(totalAdditionalCharges.cgst, currencySymbol)}</TableCell>
                                            <TableCell align="right">{formatCurrency(totalAdditionalCharges.sgst, currencySymbol)}</TableCell>
                                            <TableCell align="right">{formatCurrency(totalAdditionalCharges.igst, currencySymbol)}</TableCell>
                                            {itemTableColumns.showCess && <TableCell align="right">{formatCurrency(totalAdditionalCharges.cess, currencySymbol)}</TableCell>}
                                            {itemTableColumns.showVat && <TableCell align="right">{formatCurrency(totalAdditionalCharges.vat, currencySymbol)}</TableCell>}
                                        </>}
                                        <TableCell align="right">{formatCurrency(totalAdditionalCharges.total, currencySymbol)}</TableCell>
                                    </TableRow>
                                    <TableRow sx={{'& td, & th': {fontWeight:'bold', borderTop:'2px solid #333'}}}>
                                        <TableCell colSpan={labelColSpan} align="right">Grand Total (A+B)</TableCell>
                                        {itemTableColumns.showGrossValue && <TableCell align="right">{formatCurrency(columnTotals.grossValue + totalAdditionalCharges.amount, currencySymbol)}</TableCell>}
                                        {itemTableColumns.discountPerItem && <TableCell align="right">{formatCurrency(columnTotals.discount, currencySymbol)}</TableCell>}
                                        {taxDisplayMode === 'breakdown' && <>
                                            <TableCell/>
                                            <TableCell align="right">{formatCurrency(columnTotals.cgst + totalAdditionalCharges.cgst, currencySymbol)}</TableCell>
                                            <TableCell align="right">{formatCurrency(columnTotals.sgst + totalAdditionalCharges.sgst, currencySymbol)}</TableCell>
                                            <TableCell align="right">{formatCurrency(columnTotals.igst + totalAdditionalCharges.igst, currencySymbol)}</TableCell>
                                            {itemTableColumns.showCess && <TableCell align="right">{formatCurrency(columnTotals.cess + totalAdditionalCharges.cess, currencySymbol)}</TableCell>}
                                            {itemTableColumns.showVat && <TableCell align="right">{formatCurrency(columnTotals.vat + totalAdditionalCharges.vat, currencySymbol)}</TableCell>}
                                        </>}
                                        <TableCell align="right">{formatCurrency(finalGrandTotal, currencySymbol)}</TableCell>
                                    </TableRow>
                                    </>
                                )}
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}><Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <Box><Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>Amount in Words: </Typography><Typography variant="body1" component="span">{amountInWords}</Typography></Box>
                        {notesDefault && <Box sx={{mt:2}}><Typography variant="subtitle2" sx={{fontWeight:'bold'}}>Notes:</Typography><Typography variant="caption" sx={{whiteSpace:'pre-line'}}>{notesDefault}</Typography></Box>}
                        <Box sx={{mt:2}}><Typography variant="subtitle2" sx={{fontWeight:'bold'}}>Terms & Conditions:</Typography><Typography variant="caption" sx={{whiteSpace:'pre-line'}}>{termsAndConditionsId}</Typography></Box>
                        {(upiId || upiQrCodeImageUrl || bankAccountId) && <Box sx={{mt:2}}><Typography variant="subtitle2" sx={{fontWeight:'bold'}}>Payment Details:</Typography>{upiId && <Typography variant="caption" display="block">UPI ID: {upiId}</Typography>}{bankAccountId && <Typography variant="caption" display="block">Bank: {bankAccountId}</Typography>}</Box>}
                    </Grid>
                    <Grid item xs={12} md={5}>
                        {enableRounding && <TableContainer component={Paper} sx={{mb:2, border:'1px solid #ccc'}}><Table size="small"><TableBody>
                            <TableRow><TableCell>Rounding Off</TableCell><TableCell align="right">{formatCurrency(roundingOffAmount, currencySymbol)}</TableCell></TableRow>
                            <TableRow><TableCell sx={{fontWeight:'bold'}}>Total Amount</TableCell><TableCell align="right" sx={{fontWeight:'bold'}}>{formatCurrency(finalAmountPayable, currencySymbol)}</TableCell></TableRow>
                        </TableBody></Table></TableContainer>}

                        <TableContainer component={Paper} sx={{border:'1px solid #ccc'}}><Table size="small">
                            <TableHead><TableRow><TableCell colSpan={2} sx={{fontWeight:'bold'}}>Invoice Payments:</TableCell></TableRow></TableHead>
                            <TableBody>
                                {showAmountReceived && <TableRow><TableCell>Amount Received:</TableCell><TableCell align="right">{formatCurrency(invoiceData.amountReceived, currencySymbol)}</TableCell></TableRow>}
                                {showCreditNoteIssued && <TableRow><TableCell>Credit Note Issued:</TableCell><TableCell align="right">{formatCurrency(invoiceData.creditNoteIssued, currencySymbol)}</TableCell></TableRow>}
                                {showExpensesAdjusted && <TableRow><TableCell>Bill/Expenses Adjusted:</TableCell><TableCell align="right">{formatCurrency(invoiceData.expensesAdjusted, currencySymbol)}</TableCell></TableRow>}
                            </TableBody>
                            <TableFooter><TableRow><TableCell sx={{fontWeight:'bold', borderTop:'1px solid #000'}}>Balance Due:</TableCell><TableCell align="right" sx={{fontWeight:'bold', borderTop:'1px solid #000'}}>{formatCurrency(finalBalanceDue, currencySymbol)}</TableCell></TableRow></TableFooter>
                        </Table></TableContainer>

                        <Box sx={{mt: 4, textAlign: 'right'}}>
                            <Typography variant="body2" sx={{mb: 4}}>
                                {authorisedSignatory || `For (${displayCompany.name})`}
                            </Typography>
                            <Box sx={{minHeight: '60px', mb: 1}}>
                                {signatureImageUrl && <img src={signatureImageUrl} alt="Signature" style={{ maxHeight: '60px', maxWidth: '180px' }}/>}
                            </Box>
                            <Divider />
                            <Typography variant="caption" sx={{mt: 0.5}}>Authorised Signatory</Typography>
                        </Box>
                    </Grid>
                </Grid></Grid>

                <Grid item xs={12} sx={{textAlign: 'center', pt: 2, mt: 2, borderTop: `1px solid ${selectedColor || 'rgba(0,0,0,0.12)'}`}}>
                    {invoiceFooter && <Typography variant="caption" display="block">{invoiceFooter}</Typography>}
                    {invoiceFooterImageUrl && <Box component="img" src={invoiceFooterImageUrl} alt="Footer" sx={{maxWidth: '100%', maxHeight: '80px', mt: 1}} />}
                </Grid>
            </Grid>
        </ModernThemeWrapper>
    );
};


//================================================================================
// --- INVOICE SUMMARY PAGE ---
//================================================================================

const defaultTheme = createTheme({
  typography: { fontFamily: 'Inter, sans-serif' },
  palette: {
    primary: { main: '#1976d2' }, success: { main: '#4caf50' },
    warning: { main: '#f57c00' }, info: { main: '#0288d1' },
    text: { primary: '#333', secondary: '#777' },
  },
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.grey[300], color: theme.palette.text.primary,
  textTransform: 'none',
  '&:hover': { backgroundColor: theme.palette.grey[100], borderColor: theme.palette.grey[400] },
}));

const PrimaryActionButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main, color: 'white',
    textTransform: 'none', borderRadius: '8px',
    '&:hover': { backgroundColor: theme.palette.primary.dark }
}));

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getStatusChipProps = (status) => {
    switch (status?.toLowerCase()) {
        case 'paid': return { label: 'Paid', color: 'success' };
        case 'partially paid': return { label: 'Partially Paid', color: 'warning' };
        case 'draft': return { label: 'Draft', color: 'default' };
        case 'review': return { label: 'In Review', color: 'info' };
        default: return { label: status || 'Unknown', color: 'info' };
    }
};

export default function InvoicePage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [themeSettings, setThemeSettings] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activityHistory, setActivityHistory] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const handleShareMenuClick = (event) => setShareMenuAnchorEl(event.currentTarget);
  const handleMoreMenuClick = (event) => setMoreMenuAnchorEl(event.currentTarget);
  const handleDownloadMenuClick = (event) => setDownloadMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => {
      setShareMenuAnchorEl(null);
      setMoreMenuAnchorEl(null);
      setDownloadMenuAnchorEl(null);
    };
  const handleTabChange = (event, newValue) => setTabValue(newValue);

    const handleAddNote = () => {
        if (newNote.trim() !== '') {
            const noteToAdd = { text: newNote, author: 'Current User', timestamp: new Date().toISOString() };
            // In a real app, an API call would save the note.
            setNotes(prev => [noteToAdd, ...prev]);
            setNewNote('');
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
             // In a real app, an API call would upload files.
            setAttachments(prev => [...prev, ...files]);
        }
    };

    const handleRemoveAttachment = (fileToRemove) => {
        // In a real app, an API call would delete the file.
        setAttachments(prev => prev.filter(file => file !== fileToRemove));
    };

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchInvoiceAndTheme = async () => {
        if (!invoiceId) {
            setError("No invoice ID provided.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [invoiceRes, settingsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`, { withCredentials: true, signal }),
                axios.get(`${API_BASE_URL}/api/invoice-settings`, { withCredentials: true, signal })
            ]);

            if (signal.aborted) return;

            const invoiceData = invoiceRes.data.data;
            invoiceData.allocatedAmount = 5.00; // Mock data
            invoiceData.eWayBillNumber = "EWB123456789012"; // Mock data
            invoiceData.qrCodeUrl = `https://placehold.co/80x80/000000/FFFFFF?text=QR`; // Mock data

            // To test the "review" state, you can uncomment the following line
            // invoiceData.status = 'review';

            setInvoice({ ...invoiceData, items: invoiceData.lineItems });

            const allSettings = settingsRes.data;
            const globalSettings = allSettings.global || {};
            const companyInfo = {
                ...(globalSettings.companyDetails || invoiceData.company),
                currency: globalSettings.currency || 'INR'
            };
            setCompanyDetails(companyInfo);

            const selectedTheme = allSettings?.savedThemes?.find(t => t.id === invoiceData.selectedThemeProfileId) || allSettings?.savedThemes?.find(t => t.isDefault);
            setThemeSettings(selectedTheme);

            setNotes(invoiceData.comments || []);
            setActivityHistory([{ text: `Invoice created by ${invoiceData.created_by || 'System'}`, timestamp: invoiceData.created_date }, ...(invoiceData.activities || [])]);
            setAttachments(invoiceData.attachments || []);

        } catch (err) {
            if (!axios.isCancel(err)) setError("Failed to load invoice details.");
        } finally {
            if (!signal.aborted) setLoading(false);
        }
    };

    fetchInvoiceAndTheme();
    return () => abortController.abort();
  }, [invoiceId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error || !invoice || !themeSettings) return <Box sx={{p: 4}}><Alert severity="error">{error || 'Could not load invoice data.'}</Alert></Box>;

  const statusProps = getStatusChipProps(invoice.status);
  const currentStatus = invoice.status.toLowerCase();
  const showPaymentHistory = ['approved', 'paid', 'partially paid'].includes(currentStatus);
  const canRecordPayment = ['approved', 'partially paid'].includes(currentStatus);
  const currencySymbol = getCurrencySymbol(companyDetails?.currency);

  return (
    <ThemeProvider theme={defaultTheme}>
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{themeSettings.invoiceHeading || 'Invoice'}</Typography>
                <Chip size="small" {...statusProps} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadMenuClick}>Download</Button>
                <Menu anchorEl={downloadMenuAnchorEl} open={Boolean(downloadMenuAnchorEl)} onClose={handleMenuClose}>
                    <MenuItem><ListItemIcon><PictureAsPdfIcon/></ListItemIcon><ListItemText>PDF</ListItemText></MenuItem>
                    <MenuItem><ListItemIcon><NotesIcon/></ListItemIcon><ListItemText>EXCEL</ListItemText></MenuItem>
                </Menu>

                <Button variant="outlined" startIcon={<Share />} onClick={handleShareMenuClick}>Share</Button>
                <Menu anchorEl={shareMenuAnchorEl} open={Boolean(shareMenuAnchorEl)} onClose={handleMenuClose}>
                    <MenuItem><ListItemIcon><MailIcon/></ListItemIcon><ListItemText>Mail</ListItemText></MenuItem>
                    <MenuItem><ListItemIcon><WhatsAppIcon/></ListItemIcon><ListItemText>WhatsApp</ListItemText></MenuItem>
                    <MenuItem><ListItemIcon><LinkIcon/></ListItemIcon><ListItemText>Create Link</ListItemText></MenuItem>
                </Menu>

                {currentStatus !== 'approved' && (
                    <>
                        {currentStatus !== 'review' &&
                            <Button variant="outlined" color="info" startIcon={<SendIcon />}>Send for Approval</Button>
                        }
                        <Button variant="contained" color="success" startIcon={<CheckIcon />}>Save & Approve</Button>
                    </>
                )}

                <IconButton sx={{border: '1px solid #ddd', borderRadius: '8px'}} onClick={handleMoreMenuClick}><MoreVertIcon /></IconButton>
                <Menu anchorEl={moreMenuAnchorEl} open={Boolean(moreMenuAnchorEl)} onClose={handleMenuClose}>
                    <MenuItem><ListItemIcon><EditIcon/></ListItemIcon><ListItemText>Edit Invoice</ListItemText></MenuItem>
                    <MenuItem><ListItemIcon><FileCopyIcon/></ListItemIcon><ListItemText>Copy Invoice</ListItemText></MenuItem>
                    <MenuItem><ListItemIcon><DeleteIcon/></ListItemIcon><ListItemText>Delete Invoice</ListItemText></MenuItem>
                </Menu>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={showPaymentHistory ? 8 : 12}>
                <InvoicePreview settings={themeSettings} companyDetails={companyDetails} invoiceData={invoice} />
              <Paper sx={{ p: 2, mt: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
                    <Tab icon={<NotesIcon />} iconPosition="start" label="Notes" />
                    <Tab icon={<AttachFileIcon />} iconPosition="start" label="Attachments" />
                </Tabs>
                <Box hidden={tabValue !== 0} p={2}>
                    <List dense>{activityHistory.map((act, i) => <ListItemText key={i} primary={act.text} secondary={safeFormatDate(act.timestamp, 'PPpp')}/>)}</List>
                </Box>
                <Box hidden={tabValue !== 1} p={2}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField fullWidth multiline rows={2} label="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                        <Button variant="contained" onClick={handleAddNote}>Save</Button>
                    </Box>
                    <List>{notes.map((note, i) => <ListItemText key={i} primary={note.text} secondary={`${note.author} - ${safeFormatDate(note.timestamp, 'PPpp')}`}/>)}</List>
                </Box>
                <Box hidden={tabValue !== 2} p={2}>
                     <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                     <Button variant="contained" startIcon={<AttachFileIcon />} onClick={() => fileInputRef.current?.click()}>Upload Files</Button>
                     <List dense sx={{mt: 2}}>{attachments.map((file, i) => (
                        <ListItem key={i} secondaryAction={<IconButton onClick={() => handleRemoveAttachment(file)}><DeleteIcon /></IconButton>}>
                            <ListItemIcon><AttachFileIcon/></ListItemIcon>
                            <ListItemText primary={file.name} />
                        </ListItem>
                    ))}</List>
                </Box>
              </Paper>
            </Grid>
            {showPaymentHistory && (
              <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                     <PrimaryActionButton sx={{ flex: 1 }}>Generate E-way Bill</PrimaryActionButton>
                     <ActionButton sx={{ flex: 1 }} variant="outlined">Generate e-Invoice</ActionButton>
                  </Box>
                  <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>Payment Summary</Typography>
                      <List dense>
                        <ListItem disableGutters><ListItemText primary="Invoice Amount" /><Typography>{formatCurrency(invoice.grandTotal, currencySymbol)}</Typography></ListItem>
                        <ListItem disableGutters><ListItemText primary="Total Amount Received" /><Typography>{formatCurrency(invoice.amountPaid, currencySymbol)}</Typography></ListItem>
                        <ListItem disableGutters><ListItemText primary="Credit/Bills Allocated" /><Typography>{formatCurrency(invoice.allocatedAmount, currencySymbol)}</Typography></ListItem>
                      </List>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Balance Amount</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>{formatCurrency(invoice.balanceDue, currencySymbol)}</Typography>
                      </Box>
                      {canRecordPayment && (
                         <Box sx={{ display: 'flex', gap: 1, mt: 2, border: '1px solid #ddd', borderRadius: '8px', p: 1 }}>
                            <Button sx={{ flex: 1, textTransform: 'none' }} startIcon={<ReceiptIcon />}>
                                Record Receipt
                            </Button>
                            <Divider orientation="vertical" flexItem />
                            <Button sx={{ flex: 1, textTransform: 'none' }} startIcon={<AccountBalanceWalletIcon />}>
                                Bills/Expenses
                            </Button>
                             <Divider orientation="vertical" flexItem />
                            <Button sx={{ flex: 1, textTransform: 'none' }} startIcon={<CreditScoreIcon />}>
                                Credit Note
                            </Button>
                         </Box>
                      )}
                  </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
    </ThemeProvider>
  );
}
