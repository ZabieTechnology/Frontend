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
  ButtonGroup,
  Tabs,
  Tab,
  TextField
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {
  Download,
  Share,
  ArrowBack as ArrowBackIcon,
  MailOutline as MailIcon,
  WhatsApp as WhatsAppIcon,
  Link as LinkIcon,
  ArrowDropDown as ArrowDropDownIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Repeat as RepeatIcon,
  FileCopy as FileCopyIcon,
  Settings as SettingsIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Create a default theme as a fallback
const defaultTheme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  palette: {
    primary: { main: '#1976d2' },
    success: { main: '#4caf50' },
    warning: { main: '#f57c00' },
    info: { main: '#0288d1' },
    grey: {
        100: '#f5f5f5',
        300: '#e0e0e0',
        400: '#bdbdbd',
    },
    text: { primary: '#333', secondary: '#777' },
    background: { paper: '#ffffff' }
  },
});

// Styled components for custom buttons
const ActionButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.grey[400],
  },
}));

const PrimaryActionButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    textTransform: 'none',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    }
}));

// Styled wrappers for different themes
const ModernThemeWrapper = styled(Paper)(({ theme, selectedColor }) => ({
    padding: theme.spacing(4),
    fontFamily: 'Arial, sans-serif',
    borderTop: `5px solid ${selectedColor || theme.palette.primary.main}`,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    position: 'relative',
}));

// Set the base URL for your API. Ensure REACT_APP_API_URL is set in your .env file.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getStatusChipProps = (status) => {
    switch (status?.toLowerCase()) {
        case 'paid': return { label: 'Paid', color: 'success', sx: { backgroundColor: '#e8f5e9', color: '#388e3c' } };
        case 'partially paid': return { label: 'Partially Paid', color: 'warning', sx: { backgroundColor: '#fff8e1', color: '#f57c00' } };
        case 'draft': return { label: 'Draft', color: 'default', sx: { backgroundColor: '#f5f5f5', color: '#616161' } };
        case 'for review': return { label: 'For Review', color: 'info', sx: { backgroundColor: '#e1f5fe', color: '#0277bd' } };
        case 'approved': return { label: 'Approved', color: 'success' };
        default: return { label: status || 'Unknown', color: 'info' };
    }
};

const formatCurrency = (amount, currencySymbol = '₹') => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
        return `${currencySymbol}0.00`;
    }
    return `${currencySymbol}${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to safely format dates and prevent crashes
const safeFormatDate = (dateInput, formatString) => {
    if (!dateInput) return '';
    try {
        let date;
        if (dateInput instanceof Date) {
            date = dateInput;
        } else {
            date = parseISO(dateInput);
        }

        if (isValid(date)) {
            return format(date, formatString);
        }
        return 'Invalid Date';
    } catch (e) {
        console.error("Date formatting error:", e);
        return '';
    }
};

export default function InvoicePage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [invoice, setInvoice] = useState(null);
  const [themeSettings, setThemeSettings] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // State for dropdown menus
  const [printMenuAnchorEl, setPrintMenuAnchorEl] = useState(null);
  const [shareMenuAnchorEl, setShareMenuAnchorEl] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);

  // State for History & Notes tabs
  const [tabValue, setTabValue] = useState(0);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activityHistory, setActivityHistory] = useState([]);


  const handlePrintMenuClick = (event) => {
    setPrintMenuAnchorEl(event.currentTarget);
  };

  const handleShareMenuClick = (event) => {
    setShareMenuAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClick = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setPrintMenuAnchorEl(null);
    setShareMenuAnchorEl(null);
    setMoreMenuAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddNote = () => {
    if (newNote.trim() !== '') {
        const noteToAdd = {
            text: newNote,
            author: 'Current User', // Replace with actual user name
            timestamp: new Date(),
        };
        // In a real app, you would make an API call here to save the note
        setNotes([noteToAdd, ...notes]);
        setNewNote('');
        console.log("Saving note:", noteToAdd);
    }
  };

  const updateInvoiceStatus = async (newStatus) => {
      try {
        // API call to update the invoice status
        await axios.patch(`${API_BASE_URL}/api/sales-invoices/${invoiceId}/status`, { status: newStatus });
        setInvoice(prev => ({ ...prev, status: newStatus }));
        // Optionally, add a success notification
      } catch (err) {
          console.error(`Failed to update status to ${newStatus}:`, err);
          // Optionally, add an error notification
      }
      handleMenuClose();
  };

  useEffect(() => {
    // Using AbortController to prevent memory leaks and race conditions
    // by cancelling fetches if the component unmounts.
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchInvoiceAndTheme = async () => {
        if (!invoiceId) {
            setError("No invoice ID provided.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch both invoice and settings data concurrently
            const [invoiceResponse, settingsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`, { signal }),
                axios.get(`${API_BASE_URL}/api/invoice-settings`, { signal })
            ]);

            // Do not update state if the component has unmounted
            if (signal.aborted) return;

            const invoiceData = invoiceResponse.data.data;
            const processedData = {
                ...invoiceData,
                invoiceDate: invoiceData.invoiceDate ? parseISO(invoiceData.invoiceDate) : null,
                dueDate: invoiceData.dueDate ? parseISO(invoiceData.dueDate) : null,
            };
            setInvoice(processedData);

            setNotes(Array.isArray(processedData.comments) ? processedData.comments : []);
            setActivityHistory([
                { text: `Invoice created by ${processedData.created_by || 'system'}`, timestamp: processedData.created_date },
                ...(Array.isArray(processedData.activities) ? processedData.activities : [])
            ]);

            const allSettings = settingsResponse.data;
            setGlobalSettings(allSettings.global);

            const selectedTheme = allSettings?.savedThemes?.find(
                (theme) => theme.id === processedData.selectedThemeProfileId
            );

            if (selectedTheme) {
                setThemeSettings(selectedTheme);
            } else {
                // Fallback to the default theme from the server if no specific theme is set on the invoice
                const defaultThemeFromServer = allSettings?.savedThemes?.find(theme => theme.isDefault);
                if(defaultThemeFromServer) {
                    setThemeSettings(defaultThemeFromServer);
                }
            }

        } catch (err) {
            // Don't update state for abort errors
            if (axios.isCancel(err)) {
                console.log('Request canceled:', err.message);
            } else if (!signal.aborted) {
                console.error("API Error fetching data:", err);
                setError("Invoice or settings not found or failed to load.");
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };

    fetchInvoiceAndTheme();

    // Cleanup function to abort fetch on unmount
    return () => {
      abortController.abort();
    };
  }, [invoiceId]);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (margin * 2);
        const imgProperties = pdf.getImageProperties(imgData);
        const contentHeight = (imgProperties.height * contentWidth) / imgProperties.width;
        let heightLeft = contentHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, contentHeight);
        heightLeft -= (pageHeight - (margin * 2));
        while (heightLeft > 0) {
            position -= (pageHeight - margin);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position + margin, contentWidth, contentHeight);
            heightLeft -= (pageHeight - (margin * 2));
        }
        pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
        console.error("Error generating PDF:", err);
        setError("Failed to generate PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleEditInvoice = () => {
    navigate(`/sales/edit/${invoice._id}`);
    handleMenuClose();
  };

  const handleCopyInvoice = () => {
    navigate('/sales/new', { state: { copiedInvoiceData: invoice } });
    handleMenuClose();
  };

  const handleInvoiceSettings = () => {
    navigate('/settings/invoicesettings/InvoiceSettingsPage');
    handleMenuClose();
  };

  const handleDeleteInvoice = async () => {
      // In a real app, show a confirmation modal before deleting
      try {
          await axios.delete(`${API_BASE_URL}/api/sales-invoices/${invoiceId}`);
          console.log(`Deleted invoice: ${invoice._id}`);
          navigate('/sales');
      } catch (err) {
          console.error("Failed to delete invoice:", err);
          // Show an error notification
      }
      handleMenuClose();
  }


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  if (error || !invoice || !themeSettings) {
    return (
        <Box sx={{ p: 4 }}>
            <Alert severity="error">
                {error || 'Invoice or its theme could not be loaded.'}
                <Button onClick={() => navigate('/sales')} sx={{ ml: 2 }}>Go Back to List</Button>
            </Alert>
        </Box>
    );
  }

  const statusProps = getStatusChipProps(invoice.status);
  const currencySymbol = globalSettings?.currency === 'INR' ? '₹' : '$';
  const currentStatus = invoice.status.toLowerCase();
  const showPaymentHistory = ['approved', 'paid', 'partially paid'].includes(currentStatus);
  const canRecordPayment = ['approved', 'partially paid'].includes(currentStatus);

  const renderTotalsRow = (label, amount, isBold = false) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) && !isBold) return null;
    return (
      <Grid container>
        <Grid item xs={6} sx={{ textAlign: 'right', pr: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>{label}:</Typography>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Typography variant="body1" sx={{ fontWeight: isBold ? 'bold' : 'normal' }}>
            {formatCurrency(parsedAmount, currencySymbol)}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <ThemeProvider theme={defaultTheme}>
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{themeSettings.invoiceHeading}</Typography>
                <Chip size="small" {...statusProps} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {currentStatus === 'draft' && (
                    <>
                        <PrimaryActionButton startIcon={<SendIcon />} onClick={() => updateInvoiceStatus('For Review')}>Send for Review</PrimaryActionButton>
                    </>
                )}

                {currentStatus === 'for review' && (
                    <>
                        <ActionButton startIcon={<UndoIcon />} onClick={() => updateInvoiceStatus('Draft')}>Request Changes</ActionButton>
                        <PrimaryActionButton startIcon={<CheckIcon />} onClick={() => updateInvoiceStatus('Approved')}>Approve Invoice</PrimaryActionButton>
                    </>
                )}

                {canRecordPayment && (
                    <PrimaryActionButton
                        startIcon={<ReceiptIcon />}
                        onClick={() => navigate('/receiptvoucher', {
                            state: {
                                customerId: invoice.customer?._id,
                                selectedIds: [invoice._id],
                                reference: `Payment against invoice #${invoice.invoiceNumber}`
                            }
                        })}
                    >
                        Record Payment
                    </PrimaryActionButton>
                )}

                <ButtonGroup variant="outlined" aria-label="action button group">
                    <ActionButton startIcon={isDownloading ? <CircularProgress size={20} /> : <Download />} onClick={handleDownloadPdf} disabled={isDownloading}>Download PDF</ActionButton>
                    <ActionButton onClick={handlePrintMenuClick} endIcon={<ArrowDropDownIcon />}>Print PDF</ActionButton>
                </ButtonGroup>
                <Menu anchorEl={printMenuAnchorEl} open={Boolean(printMenuAnchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleMenuClose}>Thermal Print</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Normal Print</MenuItem>
                </Menu>

                {showPaymentHistory && (
                    <>
                        <ButtonGroup variant="outlined" aria-label="share button group" sx={{ml: 1}}>
                            <ActionButton startIcon={<Share />} onClick={handleShareMenuClick}>Share</ActionButton>
                            <ActionButton size="small" onClick={handleShareMenuClick}><ArrowDropDownIcon /></ActionButton>
                        </ButtonGroup>
                        <Menu anchorEl={shareMenuAnchorEl} open={Boolean(shareMenuAnchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={handleMenuClose}><ListItemIcon><MailIcon fontSize="small" /></ListItemIcon><ListItemText>Mail</ListItemText></MenuItem>
                            <MenuItem onClick={handleMenuClose}><ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon><ListItemText>WhatsApp</ListItemText></MenuItem>
                            <MenuItem onClick={handleMenuClose}><ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon><ListItemText>Create Link</ListItemText></MenuItem>
                        </Menu>
                    </>
                )}

                <IconButton sx={{border: '1px solid #ddd', borderRadius: '8px', ml: 1}} onClick={handleMoreMenuClick}><MoreVertIcon /></IconButton>
                <Menu anchorEl={moreMenuAnchorEl} open={Boolean(moreMenuAnchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEditInvoice}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon><ListItemText>Edit Invoice</ListItemText></MenuItem>
                    <MenuItem onClick={handleCopyInvoice}><ListItemIcon><FileCopyIcon fontSize="small" /></ListItemIcon><ListItemText>Copy Invoice</ListItemText></MenuItem>
                    {showPaymentHistory && <MenuItem onClick={handleMenuClose}><ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon><ListItemText>Issue Credit Note</ListItemText></MenuItem>}
                    {showPaymentHistory && <MenuItem onClick={handleMenuClose}><ListItemIcon><RepeatIcon fontSize="small" /></ListItemIcon><ListItemText>Repeatative Invoice</ListItemText></MenuItem>}
                    <MenuItem onClick={handleInvoiceSettings}><ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon><ListItemText>Invoice Settings</ListItemText></MenuItem>
                    <MenuItem onClick={handleDeleteInvoice}><ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon><ListItemText>Delete Invoice</ListItemText></MenuItem>
                </Menu>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={showPaymentHistory ? 8 : 12}>
              <ModernThemeWrapper selectedColor={themeSettings.selectedColor} ref={printRef}>
                {/* Invoice Preview Content... */}
                <Grid container spacing={2}>
                    <Grid item xs={7}>
                        {globalSettings?.companyLogoUrl && (
                            <Avatar src={globalSettings.companyLogoUrl} alt="Company Logo" variant="square" sx={{ width: 80, height: 80, mb: 1, objectFit: 'contain' }} />
                        )}
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{invoice.company?.name}</Typography>
                        <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>{invoice.company?.address}</Typography>
                        <Typography variant="body2">Mobile: {invoice.company?.mobile}</Typography>
                        <Typography variant="body2">Email: {invoice.company?.email}</Typography>
                        <Typography variant="body2">GSTIN: {invoice.company?.gstin}</Typography>
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{themeSettings.invoiceHeading}</Typography>
                        <Typography variant="body1">{invoice.invoiceNumber}</Typography>
                        <Typography variant="body2">Date: {invoice.invoiceDate ? format(invoice.invoiceDate, 'dd/MM/yyyy') : 'N/A'}</Typography>
                        {themeSettings.showPoNumber && <Typography variant="body2">Due Date: {invoice.dueDate ? format(invoice.dueDate, 'dd/MM/yyyy') : 'N/A'}</Typography>}
                    </Grid>

                    <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                    <Grid item xs={themeSettings.showShipToSection ? 6 : 12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>BILL TO:</Typography>
                        <Typography variant="body1">{invoice.customer?.name}</Typography>
                        <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>{invoice.customerAddress}</Typography>
                        <Typography variant="body2">GSTIN: {invoice.customerGstin}</Typography>
                        <Typography variant="body2">Mobile: {invoice.customer?.mobile}</Typography>
                    </Grid>
                    {themeSettings.showShipToSection && (
                        <Grid item xs={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>SHIP TO:</Typography>
                            <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>{invoice.shipToAddress}</Typography>
                        </Grid>
                    )}

                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: `${themeSettings.selectedColor}20` }}>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Items</TableCell>
                                        {themeSettings.itemTableColumns.hsnSacCode && <TableCell>HSN/SAC</TableCell>}
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Rate</TableCell>
                                        {themeSettings.itemTableColumns.discountPerItem && <TableCell align="right">Discount</TableCell>}
                                        {themeSettings.taxDisplayMode === 'breakdown' && (
                                            <>
                                                <TableCell align="right">Tax %</TableCell>
                                                <TableCell align="right">CGST</TableCell>
                                                <TableCell align="right">SGST</TableCell>
                                                <TableCell align="right">IGST</TableCell>
                                                {themeSettings.itemTableColumns.showCess && <TableCell align="right">Cess</TableCell>}
                                            </>
                                        )}
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoice.lineItems?.map((item, index) => (
                                        <TableRow key={item.id || index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.itemName || item.description}</TableCell>
                                            {themeSettings.itemTableColumns.hsnSacCode && <TableCell>{item.hsnSac}</TableCell>}
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">{formatCurrency(item.rate, currencySymbol)}</TableCell>
                                            {themeSettings.itemTableColumns.discountPerItem && <TableCell align="right">{formatCurrency(item.discountPerItem, currencySymbol)}</TableCell>}
                                            {themeSettings.taxDisplayMode === 'breakdown' && (
                                                <>
                                                    <TableCell align="right">{item.taxRate}%</TableCell>
                                                    <TableCell align="right">{formatCurrency(item.cgstAmount, currencySymbol)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(item.sgstAmount, currencySymbol)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(item.igstAmount, currencySymbol)}</TableCell>
                                                    {themeSettings.itemTableColumns.showCess && <TableCell align="right">{formatCurrency(item.cessAmountCalculated, currencySymbol)}</TableCell>}
                                                </>
                                            )}
                                            <TableCell align="right">{formatCurrency(item.amount, currencySymbol)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    <Grid item xs={12} container sx={{ mt: 2 }}>
                        <Grid item xs={12} md={7} sx={{ pr: { md: 2 }, mb: {xs: 2, md: 0} }}>
                            <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>Amount in Words: </Typography>
                            <Typography variant="body1" component="span">{invoice.totalInWords}</Typography>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            {renderTotalsRow("Subtotal", invoice.subTotal)}
                            {renderTotalsRow("Discount", invoice.discountAmountCalculated)}
                            {themeSettings.taxDisplayMode !== 'no_tax' && (
                                <>
                                    {renderTotalsRow("Taxable Amount", invoice.taxableAmount)}
                                    {renderTotalsRow("CGST", invoice.cgstAmount)}
                                    {renderTotalsRow("SGST", invoice.sgstAmount)}
                                    {renderTotalsRow("IGST", invoice.igstAmount)}
                                    {renderTotalsRow("CESS", invoice.overallCessAmount)}
                                </>
                            )}
                            <Divider sx={{ my: 1 }} />
                            {renderTotalsRow("TOTAL AMOUNT", invoice.grandTotal, true)}
                            {renderTotalsRow("Amount Received", invoice.amountPaid)}
                            {renderTotalsRow("Balance Due", invoice.balanceDue, true)}
                        </Grid>
                    </Grid>

                    <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                    <Grid item xs={12} md={7}>
                        {invoice.notes && (<>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Notes:</Typography>
                            <Typography variant="caption" sx={{whiteSpace: 'pre-line'}}>{invoice.notes}</Typography>
                        </>)}
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: invoice.notes ? 1 : 0 }}>Terms & Conditions:</Typography>
                        <Typography variant="caption" sx={{whiteSpace: 'pre-line'}}>{invoice.termsAndConditions}</Typography>
                        {invoice.bankDetails && (
                            <Box sx={{mt: 2}}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Payment Details:</Typography>
                                <Typography variant="caption" display="block">
                                    Bank: {invoice.bankDetails.name}, A/C: {invoice.bankDetails.accountNo}, IFSC: {invoice.bankDetails.ifsc}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={5} sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                         <Box sx={{mt: 4}}>
                            <Typography variant="body2" sx={{ display: 'block', mb: 4 }}>For ({invoice.company?.name})</Typography>
                            <Divider />
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>Authorised Signatory</Typography>
                        </Box>
                    </Grid>
                </Grid>
              </ModernThemeWrapper>

              {/* History and Notes Section */}
              <Paper sx={{ p: 2, mt: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="history and notes tabs">
                        <Tab label="History" />
                        <Tab label="Notes" />
                    </Tabs>
                </Box>
                {/* History Panel */}
                <Box hidden={tabValue !== 0} p={2}>
                    {activityHistory.length > 0 ? (
                        <List dense>
                            {activityHistory.map((activity, index) => (
                                <ListItem key={index} disableGutters>
                                    <ListItemText
                                        primary={activity.text}
                                        secondary={safeFormatDate(activity.timestamp, 'PPpp')}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">No history available.</Typography>
                    )}
                </Box>
                {/* Notes Panel */}
                <Box hidden={tabValue !== 1} p={2}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            label="Add a note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleAddNote}>Save</Button>
                    </Box>
                    <Divider />
                    {notes.length > 0 ? (
                        <List>
                            {notes.map((note, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                    <ListItemText
                                        primary={note.text}
                                        secondary={`${note.author} - ${safeFormatDate(note.timestamp, 'PPpp')}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>No notes yet.</Typography>
                    )}
                </Box>
              </Paper>
            </Grid>
            {showPaymentHistory && (
              <Grid item xs={12} md={4}>
                  <>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                         <PrimaryActionButton fullWidth>Generate E-way Bill</PrimaryActionButton>
                         <ActionButton fullWidth variant="outlined">Generate e-Invoice</ActionButton>
                      </Box>

                      <Paper sx={{ p: 2, mt: 3 }}>
                          <Typography variant="h6" gutterBottom>Payment History</Typography>
                          <List dense>
                            <ListItem disableGutters>
                              <ListItemText primary="Invoice Amount" />
                              <Typography variant="body2">{formatCurrency(invoice.grandTotal, currencySymbol)}</Typography>
                            </ListItem>
                            <ListItem disableGutters>
                              <ListItemText primary="Total Amount Received" />
                              <Typography variant="body2">{formatCurrency(invoice.amountPaid, currencySymbol)}</Typography>
                            </ListItem>
                          </List>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Balance Amount</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'green' }}>{formatCurrency(invoice.balanceDue, currencySymbol)}</Typography>
                          </Box>
                      </Paper>
                  </>
              </Grid>
            )}
          </Grid>
        </Box>
    </ThemeProvider>
  );
}
