// src/components/previews/InvoicePreview.js
import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    Avatar,
    Table, // <<< Added Table
    TableBody, // <<< Added TableBody
    TableCell, // <<< Added TableCell
    TableContainer, // <<< Added TableContainer
    TableHead, // <<< Added TableHead
    TableRow, // <<< Added TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Sample Invoice Data (in a real app, this might come from props or a context)
const sampleInvoiceData = {
    invoiceTo: "Sample Party",
    invoiceToAddress: "123 Sample St, Test City, 110001",
    invoiceToGstin: "GSTIN012345ABC",
    invoiceToMobile: "9876543210",
    shipToAddress: "456 Delivery Ave, Test City, 110002",
    invoiceNumber: "INV-2024-001",
    invoiceDate: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
    items: [
        { id: 1, description: "SAMSUNG A30", hsnSacCode: "8517", quantity: 1, pricePerItem: 10000, discountPerItem: 0, taxPerItem: 1800, batchNo: "B001", expDate: "12/25", mfgDate: "01/24", serialNo: "SN123", amount: 11800 },
        { id: 2, description: "PARLE-G GOLD", hsnSacCode: "1905", quantity: 2, pricePerItem: 10, discountPerItem: 0, taxPerItem: 1, batchNo: "P002", expDate: "10/24", mfgDate: "11/23", serialNo: "SN456", amount: 22 },
        { id: 3, description: "PUMA BLUE ROUND", hsnSacCode: "6402", quantity: 1, pricePerItem: 1850, discountPerItem: 100, taxPerItem: 315, batchNo: "PM003", expDate: "N/A", mfgDate: "N/A", serialNo: "SN789", amount: 2065 },
    ],
    subTotal: 12860,
    discountTotal: 100,
    taxableAmount: 12760,
    totalTax: 2116,
    grandTotal: 14876,
    amountInWords: "Fourteen Thousand Eight Hundred Seventy Six Only",
    bankDetails: { name: "Bank ABC - XX1234", accountNo: "xxxxxx1234", ifsc: "ABC000123" },
};

// Styled components for different themes (basic examples)
const ModernThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(3),
    fontFamily: 'Arial, sans-serif',
    borderTop: `5px solid ${selectedColor || theme.palette.primary.main}`,
    minHeight: '500px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
}));

const StylishThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(3),
    fontFamily: 'Georgia, serif',
    borderLeft: `8px solid ${selectedColor || theme.palette.secondary.main}`,
    backgroundColor: '#f9f9f9',
    minHeight: '500px',
    color: theme.palette.text.primary,
}));

const SimpleThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(2),
    fontFamily: 'Verdana, sans-serif',
    border: `1px solid ${selectedColor || '#ccc'}`,
    minHeight: '500px',
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
}));


const InvoicePreview = ({ settings, companyDetails }) => {
    const displayCompany = companyDetails || {
        name: "FRAME DECORE",
        address: "NEAR EMC HOSPITAL, EMC ROAD VENNALA PO, Ernakulam, Kerala, 682028",
        mobile: "0072316636",
        logoUrl: settings?.companyLogoUrl || "/images/default_logo.png"
    };

    const invoice = sampleInvoiceData;
    const {
        activeThemeName,
        selectedColor,
        itemTableColumns,
        customItemColumns,
        bankAccountId,
        termsAndConditionsId,
        signatureImageUrl,
        enableReceiverSignature,
        notesDefault
    } = settings;

    const renderTableHeaders = () => {
        const headers = [];
        headers.push(<TableCell key="sno" sx={{color: 'inherit'}}>#</TableCell>);
        headers.push(<TableCell key="desc" sx={{color: 'inherit'}}>Items</TableCell>);

        if (itemTableColumns.hsnSacCode) headers.push(<TableCell key="hsn" sx={{color: 'inherit'}}>HSN/SAC</TableCell>);
        if (itemTableColumns.batchNo) headers.push(<TableCell key="batch" sx={{color: 'inherit'}}>Batch No.</TableCell>);
        if (itemTableColumns.expDate) headers.push(<TableCell key="exp" sx={{color: 'inherit'}}>Exp. Date</TableCell>);
        if (itemTableColumns.mfgDate) headers.push(<TableCell key="mfg" sx={{color: 'inherit'}}>Mfg. Date</TableCell>);
        if (itemTableColumns.serialNo) headers.push(<TableCell key="serial" sx={{color: 'inherit'}}>Serial No.</TableCell>);

        customItemColumns?.forEach(col => {
            if (col.enabled) headers.push(<TableCell key={col.id || col.name} sx={{color: 'inherit'}}>{col.name}</TableCell>);
        });

        if (itemTableColumns.quantity) headers.push(<TableCell align="right" key="qty" sx={{color: 'inherit'}}>Qty</TableCell>);
        if (itemTableColumns.pricePerItem) headers.push(<TableCell align="right" key="rate" sx={{color: 'inherit'}}>Rate</TableCell>);
        if (itemTableColumns.discountPerItem) headers.push(<TableCell align="right" key="discount" sx={{color: 'inherit'}}>Discount</TableCell>);
        if (itemTableColumns.taxPerItem) headers.push(<TableCell align="right" key="tax" sx={{color: 'inherit'}}>Tax</TableCell>);
        headers.push(<TableCell align="right" key="amount" sx={{color: 'inherit'}}>Amount</TableCell>);
        return <TableRow>{headers}</TableRow>;
    };

    const renderTableRows = () => {
        return invoice.items.map((item, index) => (
            <TableRow key={item.id}>
                <TableCell sx={{color: 'inherit'}}>{index + 1}</TableCell>
                <TableCell sx={{color: 'inherit'}}>{item.description}</TableCell>
                {itemTableColumns.hsnSacCode && <TableCell sx={{color: 'inherit'}}>{item.hsnSacCode}</TableCell>}
                {itemTableColumns.batchNo && <TableCell sx={{color: 'inherit'}}>{item.batchNo}</TableCell>}
                {itemTableColumns.expDate && <TableCell sx={{color: 'inherit'}}>{item.expDate}</TableCell>}
                {itemTableColumns.mfgDate && <TableCell sx={{color: 'inherit'}}>{item.mfgDate}</TableCell>}
                {itemTableColumns.serialNo && <TableCell sx={{color: 'inherit'}}>{item.serialNo}</TableCell>}
                {customItemColumns?.map(col => {
                    if (col.enabled) return <TableCell key={col.id || col.name} sx={{color: 'inherit'}}>{item[col.name] || 'N/A'}</TableCell>;
                    return null;
                })}
                {itemTableColumns.quantity && <TableCell align="right" sx={{color: 'inherit'}}>{item.quantity}</TableCell>}
                {itemTableColumns.pricePerItem && <TableCell align="right" sx={{color: 'inherit'}}>{item.pricePerItem?.toFixed(2)}</TableCell>}
                {itemTableColumns.discountPerItem && <TableCell align="right" sx={{color: 'inherit'}}>{item.discountPerItem?.toFixed(2)}</TableCell>}
                {itemTableColumns.taxPerItem && <TableCell align="right" sx={{color: 'inherit'}}>{item.taxPerItem?.toFixed(2)}</TableCell>}
                <TableCell align="right" sx={{color: 'inherit'}}>{item.amount?.toFixed(2)}</TableCell>
            </TableRow>
        ));
    };

    const InvoiceLayout = ({ children }) => {
        if (activeThemeName === "Stylish") {
            return <StylishThemeWrapper elevation={3} selectedColor={selectedColor}>{children}</StylishThemeWrapper>;
        }
        if (activeThemeName === "Simple") {
            return <SimpleThemeWrapper elevation={1} selectedColor={selectedColor}>{children}</SimpleThemeWrapper>;
        }
        return <ModernThemeWrapper elevation={3} selectedColor={selectedColor}>{children}</ModernThemeWrapper>;
    };

    return (
        <InvoiceLayout>
            <Grid container spacing={2}>
                {/* Header Section */}
                <Grid item xs={7}>
                    {displayCompany.logoUrl && (
                        <Avatar src={displayCompany.logoUrl} alt="Company Logo" variant="square" sx={{ width: 80, height: 80, mb: 1, objectFit: 'contain' }} />
                    )}
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>
                        {displayCompany.name}
                    </Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>{displayCompany.address}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Mobile: {displayCompany.mobile}</Typography>
                </Grid>
                <Grid item xs={5} sx={{ textAlign: 'right' }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>
                        TAX INVOICE
                    </Typography>
                    <Typography variant="body1" sx={{color: 'inherit'}}># {invoice.invoiceNumber}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Date: {invoice.invoiceDate}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Due Date: {invoice.dueDate}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2, borderColor: selectedColor || 'rgba(0,0,0,0.12)' }} /></Grid>

                {/* Bill To / Ship To */}
                <Grid item xs={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>BILL TO:</Typography>
                    <Typography variant="body1" sx={{color: 'inherit'}}>{invoice.invoiceTo}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>{invoice.invoiceToAddress}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>GSTIN: {invoice.invoiceToGstin}</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>Mobile: {invoice.invoiceToMobile}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: selectedColor || 'inherit' }}>SHIP TO:</Typography>
                    <Typography variant="body2" sx={{color: 'inherit'}}>{invoice.shipToAddress || invoice.invoiceToAddress}</Typography>
                </Grid>

                {/* Items Table */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: selectedColor ? `${selectedColor}20` : 'action.hover' }}>
                                {renderTableHeaders()}
                            </TableHead>
                            <TableBody>
                                {renderTableRows()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Totals Section */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Grid container justifyContent="flex-end">
                        <Grid item xs={5} md={4}>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body1" sx={{color: 'inherit'}}>Subtotal:</Typography>
                                {itemTableColumns.discountPerItem && <Typography variant="body1" sx={{color: 'inherit'}}>Discount:</Typography>}
                                <Typography variant="body1" sx={{color: 'inherit'}}>Taxable Amount:</Typography>
                                {itemTableColumns.taxPerItem && <Typography variant="body1" sx={{color: 'inherit'}}>Total Tax (GST {invoice.items[0]?.taxPerItem && invoice.items[0]?.pricePerItem ? (invoice.items[0].taxPerItem / invoice.items[0].pricePerItem * 100).toFixed(0) : 18}%):</Typography>}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, color: selectedColor || 'inherit' }}>TOTAL AMOUNT:</Typography>
                                <Typography variant="body1" sx={{color: 'inherit'}}>Received Amount:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'inherit' }}>Balance:</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4} md={3}>
                            <Box sx={{ textAlign: 'right', fontWeight: 'medium' }}>
                                <Typography variant="body1" sx={{color: 'inherit'}}>{invoice.subTotal?.toFixed(2)}</Typography>
                                {itemTableColumns.discountPerItem && <Typography variant="body1" sx={{color: 'inherit'}}>{invoice.discountTotal?.toFixed(2)}</Typography>}
                                <Typography variant="body1" sx={{color: 'inherit'}}>{invoice.taxableAmount?.toFixed(2)}</Typography>
                                {itemTableColumns.taxPerItem && <Typography variant="body1" sx={{color: 'inherit'}}>{invoice.totalTax?.toFixed(2)}</Typography>}
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, color: selectedColor || 'inherit' }}>{invoice.grandTotal?.toFixed(2)}</Typography>
                                <Typography variant="body1" sx={{color: 'inherit'}}>0.00</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'inherit' }}>{invoice.grandTotal?.toFixed(2)}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 2, borderColor: selectedColor || 'rgba(0,0,0,0.12)' }} /></Grid>

                {/* Notes, T&C, Signature */}
                <Grid item xs={12} md={7}>
                    {notesDefault && (
                        <>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit' }}>Notes:</Typography>
                            <Typography variant="caption" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>{notesDefault}</Typography>
                        </>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: notesDefault ? 1 : 0, color: 'inherit' }}>Terms & Conditions:</Typography>
                    <Typography variant="caption" sx={{color: 'inherit', whiteSpace: 'pre-line'}}>
                        {settings.termsAndConditionsId || "1. Goods once sold will not be taken back.\n2. All disputes subject to jurisdiction."}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
                    {signatureImageUrl && (
                        <Box sx={{mb:1}}>
                            <Typography variant="caption" sx={{color: 'inherit'}}>Authorized Signature:</Typography>
                            <img src={signatureImageUrl} alt="Signature" style={{ maxHeight: '60px', maxWidth: '150px', display: 'block', marginLeft: 'auto' }} />
                        </Box>
                    )}
                    {enableReceiverSignature && (
                        <Box sx={{mt: 2, pt: 2, borderTop: `1px dashed ${selectedColor || '#ccc'}`}}>
                             <Typography variant="caption" sx={{color: 'inherit'}}>Receiver's Signature & Date</Typography>
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} sx={{textAlign: 'center', mt: 2}}>
                    <Typography variant="caption" sx={{color: 'inherit'}}>Total Amount (in words): {invoice.amountInWords}</Typography>
                </Grid>
            </Grid>
        </InvoiceLayout>
    );
};

export default InvoicePreview;
