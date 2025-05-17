import React, { useState, useCallback } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    FormControlLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useTheme, // To access theme colors for contrast
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check'; // For selected color indication

// --- Sample Data (Keep separate for clarity) ---
const initialInvoiceData = {
    company: {
        name: 'FRAME DECORE',
        address: 'NEAR EMC HOSPITAL , EMC ROAD , VENNALA PO',
        cityStateZip: 'Ernakulam , Kerala , 602028',
        mobile: '9072315636',
    },
    invoiceNo: 'AABBCCDD / 202',
    invoiceDate: '17/01/2023',
    dueDate: '16/02/2023',
    billTo: {
        name: 'Sample Party',
        address: 'No F2 , Outer Circle , Connaught Clicus , New Delhi',
        cityStateZip: '110001 Outer',
        mobile: '7400417400',
        gstin: '07ABCCH2702H4ZZ',
        state: 'DELHI',
    },
    shipTo: {
        details: '1234123 324324234 , Bengaluru ,',
    },
    items: [
        { sno: 1, name: 'SAMSUNG A30', description: 'samsung phone', hsn: '1234', batch: 'BATCH123', exp: '12/25', mfg: '01/23', qty: '1 PCS', rate: 10000, tax: 1800, amount: 11800 },
        { sno: 2, name: 'PARLE - G 2000', description: 'best biscuit', hsn: '40511209', batch: '', exp: '', mfg: '', qty: '1 BOX', rate: 342.86, tax: 17.14, amount: 360 },
        { sno: 3, name: 'PUMA BLUE ROUND NECK T-SHIRT', description: '', hsn: '2032', batch: 'PUMABRN', exp: '', mfg: '05/22', qty: '2 PCS', rate: 900, tax: 0, amount: 1800 }, // Corrected amount
    ],
    notes: 'Sample Note: Thank you for your business!',
    // Terms moved to state
    subtotal: 11242.86, // Recalculated based on rate * qty
    totalAmount: 14050, // Kept from original for consistency, though tax calc might differ slightly
    taxableAmount: 12142.86, // From original
    igst5: 17.14,  // From item 2 tax
    igst18: 1800, // From item 1 tax
    receivedAmount: 14453.5, // From original
    balance: -403.5, // Recalculated: totalAmount - receivedAmount
    totalInWords: 'Fourteen Thousand Fifty Rupees Only', // Added "Only"
};

// --- Sample Constants ---
const sampleColors = ['#0000FF', '#008000', '#FF0000', '#800080', '#FFA500', '#A52A2A', '#000000', '#808080'];
const sampleBankDetails = {
    10: { name: "SBI", accNo: "XXXX XXXX 1234", ifsc: "SBIN0001234" },
    20: { name: "HDFC", accNo: "XXXX XXXX 5678", ifsc: "HDFC0005678" },
};
const sampleTerms = {
    sales: [
        '1. Goods once sold will not be taken back or exchanged.',
        '2. Interest @ 18% p.a. will be charged if payment is not made within the due date.',
        '3. All disputes are subject to Ernakulam jurisdiction only.',
    ],
    service: [
        '1. Payment is due upon receipt of invoice.',
        '2. Services rendered are non-refundable.',
        '3. All disputes are subject to Ernakulam jurisdiction only.',
    ],
    custom: [
        '1. Custom term A agreed upon separately.',
        '2. Custom term B applies.',
    ]
};

// --- Helper Function ---
function formatCurrency(amount) {
    if (typeof amount !== 'number') return amount; // Handle non-numeric gracefully
    const formatted = Math.abs(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${amount < 0 ? '-' : ''}₹ ${formatted}`;
}

// --- Main Component ---
function InvoiceSettingsPage() {
    const muiTheme = useTheme(); // Access MUI theme for contrast calculation
    const invoiceData = initialInvoiceData; // Use initial data for preview base

    // --- State for Settings ---
    const [selectedThemeIndex, setSelectedThemeIndex] = useState(0); // Example state for theme
    const [selectedColor, setSelectedColor] = useState(sampleColors[0]); // Default to first color
    const [showPartyDetails, setShowPartyDetails] = useState(true);
    const [showMultilineDescription, setShowMultilineDescription] = useState(false); // Example
    const [showItemTax, setShowItemTax] = useState(true); // Default to true as tax column is shown initially
    const [showMobile, setShowMobile] = useState(true);
    const [showGstin, setShowGstin] = useState(true);
    const [selectedBank, setSelectedBank] = useState(''); // Store bank key ('', '10', '20')
    const [selectedTermsKey, setSelectedTermsKey] = useState('sales'); // Store terms key
    const [leaveSignatureSpace, setLeaveSignatureSpace] = useState(true);
    const [enableReceiverSignature, setEnableReceiverSignature] = useState(false);

    // State for table column visibility
    const [columnVisibility, setColumnVisibility] = useState({
        sno: true,
        items: true, // Items column is mandatory
        hsn: true,
        batch: true,
        exp: true,
        mfg: true,
        qty: true,
        rate: true,
        tax: true,
        amount: true, // Amount column is mandatory
    });

    // --- Event Handlers ---
    const handleCheckboxChange = useCallback((setter) => (event) => {
        setter(event.target.checked);
    }, []);

    const handleColumnVisibilityChange = useCallback((columnKey) => (event) => {
        setColumnVisibility(prev => ({
            ...prev,
            [columnKey]: event.target.checked,
        }));
    }, []);

    const handleColorSelect = useCallback((color) => {
        setSelectedColor(color);
    }, []);

    const handleThemeSelect = useCallback((index) => {
        setSelectedThemeIndex(index);
        // In a real app, you might apply theme styles here
    }, []);

    const handleBankChange = useCallback((event) => {
        setSelectedBank(event.target.value);
    }, []);

    const handleTermsChange = useCallback((event) => {
        setSelectedTermsKey(event.target.value);
    }, []);

    // --- Dynamic Calculation for Preview ---
    const currentTerms = sampleTerms[selectedTermsKey] || [];
    const bankAccountDetails = selectedBank ? sampleBankDetails[selectedBank] : null;

    // Calculate visible columns for table rendering and colSpan adjustments
    const visibleColumns = Object.entries(columnVisibility)
        .filter(([key, value]) => value)
        .map(([key]) => key);

    // Determine colSpan for SUBTOTAL/TOTAL rows based on visible columns
    // Count columns before the 'Amount' column
    const amountColumnIndex = visibleColumns.indexOf('amount');
    const subtotalColSpan = amountColumnIndex !== -1 ? amountColumnIndex : visibleColumns.length -1; // Span until amount or last visible col

    // Determine text color based on selected background color for contrast
    const headerTextColor = muiTheme.palette.getContrastText(selectedColor);

    // --- Render Logic ---
    return (
        <Box sx={{ p: 3, bgcolor: 'grey.100' }}> {/* Lighter background */}
            <Grid container spacing={3}>

                {/* Left Column: Invoice Preview */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        {/* --- Invoice Header --- */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                {/* Company Logo Placeholder */}
                                {/* <Box sx={{ width: 100, height: 50, bgcolor: 'grey.300', mb: 1 }}>Logo</Box> */}
                                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: selectedColor }}>{invoiceData.company.name}</Typography>
                                <Typography variant="body2">{invoiceData.company.address}</Typography>
                                <Typography variant="body2">{invoiceData.company.cityStateZip}</Typography>
                                <Typography variant="body2">Mobile: {invoiceData.company.mobile}</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1, color: selectedColor }}>TAX INVOICE</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Invoice No</Typography>
                                    <Typography variant="body2">{invoiceData.invoiceNo}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Invoice Date</Typography>
                                    <Typography variant="body2">{invoiceData.invoiceDate}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Due Date</Typography>
                                    <Typography variant="body2">{invoiceData.dueDate}</Typography>
                                </Box>
                                <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>ORIGINAL FOR RECIPIENT</Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        {/* --- Billing and Shipping --- */}
                        {showPartyDetails && (
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={6}>
                                    <Typography variant="overline" display="block" sx={{ fontWeight: 'bold' }}>BILL TO</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{invoiceData.billTo.name}</Typography>
                                    <Typography variant="body2">{invoiceData.billTo.address}</Typography>
                                    <Typography variant="body2">{invoiceData.billTo.cityStateZip}</Typography>
                                    {showMobile && <Typography variant="body2">Mobile: {invoiceData.billTo.mobile}</Typography>}
                                    {showGstin && <Typography variant="body2">GSTIN: {invoiceData.billTo.gstin}</Typography>}
                                    <Typography variant="body2">State: {invoiceData.billTo.state}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="overline" display="block" sx={{ fontWeight: 'bold' }}>SHIP TO</Typography>
                                    <Typography variant="body2">{invoiceData.shipTo.details}</Typography>
                                    {/* Add more ship to details if available */}
                                </Grid>
                            </Grid>
                        )}
                         {!showPartyDetails && <Typography variant="caption" sx={{mb: 2, display: 'block', fontStyle: 'italic'}}>Party details hidden by settings.</Typography>}

                        {/* --- Items Table --- */}
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: selectedColor, color: headerTextColor }}>
                                    <TableRow>
                                        {/* Dynamically render headers based on visibility state */}
                                        {columnVisibility.sno && <TableCell sx={{ fontWeight: 'bold', color: 'inherit' }}>S.NO</TableCell>}
                                        {columnVisibility.items && <TableCell sx={{ fontWeight: 'bold', color: 'inherit' }}>ITEMS</TableCell>}
                                        {columnVisibility.hsn && <TableCell sx={{ fontWeight: 'bold', color: 'inherit' }}>HSN NO</TableCell>}
                                        {columnVisibility.batch && <TableCell sx={{ fontWeight: 'bold', color: 'inherit' }}>BATCH NO</TableCell>}
                                        {columnVisibility.exp && <TableCell sx={{ fontWeight: 'bold', color: 'inherit' }}>EXP DATE</TableCell>}
                                        {columnVisibility.mfg && <TableCell sx={{ fontWeight: 'bold', color: 'inherit' }}>MFG DATE</TableCell>}
                                        {columnVisibility.qty && <TableCell sx={{ fontWeight: 'bold', color: 'inherit', textAlign: 'right' }}>QTY</TableCell>}
                                        {columnVisibility.rate && <TableCell sx={{ fontWeight: 'bold', color: 'inherit', textAlign: 'right' }}>RATE</TableCell>}
                                        {columnVisibility.tax && <TableCell sx={{ fontWeight: 'bold', color: 'inherit', textAlign: 'right' }}>TAX</TableCell>}
                                        {columnVisibility.amount && <TableCell sx={{ fontWeight: 'bold', color: 'inherit', textAlign: 'right' }}>AMOUNT</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoiceData.items.map((item) => (
                                        <TableRow key={item.sno}>
                                            {/* Dynamically render cells based on visibility state */}
                                            {columnVisibility.sno && <TableCell>{item.sno}</TableCell>}
                                            {columnVisibility.items && <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ whiteSpace: showMultilineDescription ? 'normal' : 'nowrap' }} // Control wrapping
                                                >
                                                    {item.description}
                                                </Typography>
                                            </TableCell>}
                                            {columnVisibility.hsn && <TableCell>{item.hsn || '-'}</TableCell>}
                                            {columnVisibility.batch && <TableCell>{item.batch || '-'}</TableCell>}
                                            {columnVisibility.exp && <TableCell>{item.exp || '-'}</TableCell>}
                                            {columnVisibility.mfg && <TableCell>{item.mfg || '-'}</TableCell>}
                                            {columnVisibility.qty && <TableCell sx={{ textAlign: 'right' }}>{item.qty}</TableCell>}
                                            {columnVisibility.rate && <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(item.rate)}</TableCell>}
                                            {columnVisibility.tax && <TableCell sx={{ textAlign: 'right', ...( !showItemTax && { visibility: 'hidden' } ) }}>{/* Show/hide tax value */}
                                                 {formatCurrency(item.tax)}
                                            </TableCell>}
                                            {columnVisibility.amount && <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(item.amount)}</TableCell>}
                                        </TableRow>
                                    ))}
                                    {/* Subtotal Row - Adjusted colSpan */}
                                     <TableRow>
                                        <TableCell colSpan={subtotalColSpan} sx={{ borderBottom: 'none' }}></TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', borderBottom: 'none' }}>SUBTOTAL</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', borderBottom: 'none' }}>
                                            {formatCurrency(invoiceData.subtotal)}
                                        </TableCell>
                                     </TableRow>
                                    {/* Total Row - Adjusted colSpan */}
                                    <TableRow>
                                        <TableCell colSpan={subtotalColSpan} sx={{ fontWeight: 'bold', textAlign: 'right', borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
                                            TOTAL
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right', borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
                                            {formatCurrency(invoiceData.totalAmount)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* --- Notes, Terms, Totals --- */}
                        <Grid container spacing={3}> {/* Increased spacing */}
                            {/* Left Side: Notes & Terms */}
                            <Grid item xs={12} md={7}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="overline" display="block" sx={{ fontWeight: 'bold' }}>NOTES</Typography>
                                    <Typography variant="body2">{invoiceData.notes}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="overline" display="block" sx={{ fontWeight: 'bold' }}>TERMS AND CONDITIONS</Typography>
                                    {currentTerms.map((term, index) => (
                                        <Typography key={index} variant="caption" component="p">{term}</Typography> // Use caption and p
                                    ))}
                                </Box>
                                {bankAccountDetails && (
                                     <Box sx={{ mt: 2, p: 1, border: '1px dashed grey', borderRadius: 1 }}>
                                         <Typography variant="overline" display="block" sx={{ fontWeight: 'bold' }}>BANK DETAILS</Typography>
                                         <Typography variant="caption">Bank: {bankAccountDetails.name}</Typography><br/>
                                         <Typography variant="caption">A/C No: {bankAccountDetails.accNo}</Typography><br/>
                                         <Typography variant="caption">IFSC: {bankAccountDetails.ifsc}</Typography>
                                     </Box>
                                )}
                            </Grid>

                            {/* Right Side: Totals */}
                            <Grid item xs={12} md={5}>
                                <Box sx={{ textAlign: 'right', mb: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2">Taxable Amount</Typography>
                                        <Typography variant="body2">{formatCurrency(invoiceData.taxableAmount)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2">IGST 5%</Typography>
                                        <Typography variant="body2">{formatCurrency(invoiceData.igst5)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2">IGST 18%</Typography>
                                        <Typography variant="body2">{formatCurrency(invoiceData.igst18)}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>TOTAL AMOUNT</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(invoiceData.totalAmount)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2">Received Amount</Typography>
                                        <Typography variant="body2">{formatCurrency(invoiceData.receivedAmount)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Balance</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: invoiceData.balance < 0 ? 'error.main' : 'inherit' }}>
                                            {formatCurrency(invoiceData.balance)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Total in Words */}
                                <Box sx={{ mt: 2, textAlign: 'right' }}>
                                    <Typography variant="caption" display="block">Total Amount (in words)</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{invoiceData.totalInWords}</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* --- Signature --- */}
                         <Grid container spacing={2} sx={{ mt: 4 }}>
                             <Grid item xs={enableReceiverSignature ? 6 : 12} sx={{ textAlign: enableReceiverSignature ? 'left' : 'right'}}>
                                 <Typography variant="caption" display="block">Authorised Signature for</Typography>
                                 <Typography variant="body1" sx={{ fontWeight: 'bold', color: selectedColor }}>{invoiceData.company.name}</Typography>
                                 {leaveSignatureSpace && <Box sx={{ height: '50px', borderBottom: '1px solid #ccc', mt: 1, maxWidth: '200px' }}></Box>}
                             </Grid>
                             {enableReceiverSignature && (
                                 <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                     <Typography variant="caption" display="block">Receiver's Signature</Typography>
                                     <Typography variant="body1" sx={{ fontWeight: 'bold' }}>&nbsp;</Typography> {/* Placeholder */}
                                     {leaveSignatureSpace && <Box sx={{ height: '50px', borderBottom: '1px solid #ccc', mt: 1, maxWidth: '200px', float: 'right' }}></Box>}
                                 </Grid>
                             )}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Right Column: Settings */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: '16px' /* Make settings sticky */ }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Invoice Customisation</Typography>

                        {/* --- Themes --- */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Themes</Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            {[...Array(6)].map((_, index) => (
                                <Grid item xs={4} key={index}>
                                    <Paper
                                        variant="outlined"
                                        onClick={() => handleThemeSelect(index)}
                                        sx={{
                                            height: 80,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative', // For checkmark positioning
                                            border: selectedThemeIndex === index ? 2 : 1, // Thicker border if selected
                                            borderColor: selectedThemeIndex === index ? 'primary.main' : 'grey.300', // Highlight if selected
                                            '&:hover': { borderColor: 'primary.light' }
                                        }}>
                                         {selectedThemeIndex === index && (
                                            <CheckIcon sx={{ position: 'absolute', top: 4, right: 4, color: 'primary.main' }} fontSize="small"/>
                                        )}
                                        <Typography variant="caption">Theme {index + 1}</Typography>
                                        {/* Basic Theme Preview elements */}
                                        <Box sx={{position: 'absolute', top: 5, left: 5, width: 15, height: 15, bgcolor: sampleColors[index % sampleColors.length], borderRadius: '2px'}}></Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                         <Button variant="outlined" size="small" fullWidth sx={{ mb: 3 }}> {/* Changed style */}
                             Create Custom Theme
                         </Button>

                        {/* --- Color --- */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Accent Color</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            {sampleColors.map((color) => (
                                <Box
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        bgcolor: color,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: selectedColor === color ? '2px solid black' : '1px solid #ccc', // Highlight selected
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                 {selectedColor === color && <CheckIcon sx={{ color: muiTheme.palette.getContrastText(color) }} fontSize="small"/>}
                                </Box>
                            ))}
                        </Box>

                        {/* --- General Settings --- */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>General Settings</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                            <FormControlLabel control={<Checkbox checked={showPartyDetails} onChange={handleCheckboxChange(setShowPartyDetails)} />} label="Show Party Details Section" />
                            <FormControlLabel control={<Checkbox checked={showMultilineDescription} onChange={handleCheckboxChange(setShowMultilineDescription)} />} label="Allow Item Description on Multiple Lines" />
                            <FormControlLabel control={<Checkbox checked={showItemTax} onChange={handleCheckboxChange(setShowItemTax)} />} label="Show Item Tax in Table" />
                        </Box>

                         {/* --- Party Details Settings --- */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Party Details Visibility</Typography>
                         <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                             <FormControlLabel control={<Checkbox checked={showMobile} onChange={handleCheckboxChange(setShowMobile)} disabled={!showPartyDetails}/>} label="Show Mobile Number" />
                             <FormControlLabel control={<Checkbox checked={showGstin} onChange={handleCheckboxChange(setShowGstin)} disabled={!showPartyDetails}/>} label="Show GSTIN" />
                         </Box>

                        {/* --- Table Column Settings --- */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Table Columns Visibility</Typography>
                        <Grid container spacing={0} sx={{ mb: 3 }}> {/* Use Grid for better layout */}
                             {Object.keys(columnVisibility).filter(key => key !== 'items' && key !== 'amount').map(key => ( // Exclude mandatory columns
                                 <Grid item xs={6} sm={4} key={key}>
                                    <FormControlLabel
                                        control={<Checkbox checked={columnVisibility[key]} onChange={handleColumnVisibilityChange(key)} />}
                                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} // Format key to label
                                        sx={{ textTransform: 'capitalize'}}
                                    />
                                 </Grid>
                             ))}
                        </Grid>


                        {/* --- Miscellaneous Accordion --- */}
                        <Accordion defaultExpanded sx={{ mb: 1, boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 'bold' }}>Miscellaneous</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Bank Account (Optional)</InputLabel>
                                    <Select label="Bank Account (Optional)" value={selectedBank} onChange={handleBankChange}>
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {Object.entries(sampleBankDetails).map(([key, details]) => (
                                             <MenuItem key={key} value={key}>{details.name} (...{details.accNo.slice(-4)})</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Terms and Conditions Template</InputLabel>
                                    <Select label="Terms and Conditions Template" value={selectedTermsKey} onChange={handleTermsChange}>
                                        {Object.keys(sampleTerms).map(key => (
                                             <MenuItem key={key} value={key} sx={{textTransform: 'capitalize'}}>{key}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Display current terms preview */}
                                <Box sx={{ maxHeight: 100, overflowY: 'auto', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'medium'}}>Preview:</Typography>
                                    {currentTerms.map((term, index) => (
                                        <Typography key={index} variant="caption" component="p" sx={{fontSize: '0.7rem'}}>{term}</Typography>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        {/* --- Signature Accordion --- */}
                        <Accordion sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' }, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ fontWeight: 'bold' }}>Signature Area</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <FormControlLabel control={<Checkbox checked={leaveSignatureSpace} onChange={handleCheckboxChange(setLeaveSignatureSpace)} />} label="Leave Blank Space for Signature(s)" />
                                <FormControlLabel control={<Checkbox checked={enableReceiverSignature} onChange={handleCheckboxChange(setEnableReceiverSignature)} />} label="Enable Receiver's Signature Field" />
                            </AccordionDetails>
                        </Accordion>

                        <Button variant="contained" color="primary" fullWidth>
                            Save Changes
                        </Button>

                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
}

export default InvoiceSettingsPage;

// --- Optional: Wrap with ThemeProvider if needed in your App ---
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// const theme = createTheme();
// function App() {
//  return (
//    <ThemeProvider theme={theme}>
//      <InvoiceSettingsPage />
//    </ThemeProvider>
//  );
// }