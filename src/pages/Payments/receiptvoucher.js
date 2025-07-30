import React, { useState, useRef, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- INLINE SVG ICONS ---
const ArrowBackIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const EyeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const SaveIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
);

// --- THEME DEFINITION ---
const modernTheme = createTheme({
  palette: {
    primary: { main: '#007aff' },
    secondary: { main: '#6c757d' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#1c1c1e', secondary: '#6c757d' },
    error: { main: '#d32f2f' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiPaper: { styleOverrides: { root: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' } } }
  },
});

// --- MOCK DATA ---
const customers = [
  { id: 1, name: 'Stark Industries', address: '1 Stark Tower, New York, NY 10001', email: 'contact@starkindustries.com' },
  { id: 2, name: 'Wayne Enterprises', address: '1007 Mountain Drive, Gotham City', email: 'info@wayne-ent.com' },
  { id: 3, name: 'Ollivanders Wand Shop', address: 'Diagon Alley, London', email: 'wands@ollivanders.co.uk' },
];

const invoices = [
    { id: 'INV-001', customerId: 1, date: '2025-06-15', total: 5000, paid: 2000 },
    { id: 'INV-002', customerId: 1, date: '2025-06-20', total: 3000, paid: 3000 },
    { id: 'INV-003', customerId: 2, date: '2025-06-18', total: 7500, paid: 0 },
    { id: 'INV-004', customerId: 2, date: '2025-06-22', total: 1200, paid: 500 },
    { id: 'INV-005', customerId: 3, date: '2025-06-25', total: 800, paid: 0 },
];

const paymentMethods = [
    { id: 'cash', name: 'Cash' }, { id: 'credit_card', name: 'Credit Card' },
    { id: 'bank_transfer', name: 'Bank Transfer' }, { id: 'check', name: 'Check' },
];

// --- PDF RECEIPT COMPONENT ---
const ReceiptPDF = React.forwardRef(({ receipt }, ref) => {
    if (!receipt) return null;
    const customer = customers.find(c => c.id === receipt.customerId);

    return (
        <Box ref={ref} sx={{ p: 4, backgroundColor: '#fff' }}>
             <style>{`
                /* PDF styles */
                .receipt-pdf-container { font-family: 'Inter', sans-serif; color: #1c1c1e; }
                .receipt-pdf-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
                .receipt-pdf-logo { width: 150px; height: auto; }
                .receipt-pdf-title h1 { margin: 0; font-size: 28px; font-weight: 700; color: #007aff; text-align: right; }
                .receipt-pdf-title p { margin: 5px 0 0; font-size: 14px; color: #6c757d; text-align: right; }
                .receipt-pdf-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
                .receipt-pdf-details h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
                .receipt-pdf-details p { margin: 0 0 8px; font-size: 14px; line-height: 1.6; }
                .receipt-pdf-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
                .receipt-pdf-table th, .receipt-pdf-table td { padding: 12px 15px; text-align: left; font-size: 14px; border-bottom: 1px solid #e0e0e0; }
                .receipt-pdf-table thead { background-color: #f4f6f8; }
                .receipt-pdf-table th { font-weight: 600; }
                .receipt-pdf-table .amount { text-align: right; font-weight: 500; }
                .receipt-pdf-summary { margin-top: 30px; display: flex; justify-content: flex-end; }
                .receipt-pdf-summary-box { width: 50%; max-width: 350px; background-color: #f4f6f8; padding: 20px; border-radius: 8px; }
                .receipt-pdf-summary-box table { width: 100%; }
                .receipt-pdf-summary-box td { padding: 8px 0; }
                .receipt-pdf-summary-box .total-label { font-weight: 600; }
                .receipt-pdf-summary-box .total-amount { font-size: 20px; font-weight: 700; color: #007aff; text-align: right; }
                .receipt-pdf-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; font-size: 12px; color: #6c757d; }
            `}</style>
            <div className="receipt-pdf-container">
                <div className="receipt-pdf-header">
                    <img src="https://placehold.co/150x50/007aff/ffffff?text=YourLogo" alt="Company Logo" className="receipt-pdf-logo" />
                    <div className="receipt-pdf-title">
                        <h1>Receipt</h1>
                        <p><strong>Receipt #:</strong> {receipt.id}</p>
                        <p><strong>Date:</strong> {receipt.date}</p>
                    </div>
                </div>
                <div className="receipt-pdf-details">
                    <div>
                        <h3>Received From</h3>
                        <p><strong>{customer.name}</strong></p>
                        <p>{customer.address}</p>
                        <p>{customer.email}</p>
                    </div>
                    <div>
                        <h3>Received By</h3>
                        <p><strong>Your Company Name</strong></p>
                        <p>123 Business Avenue, Metropolis, 54321</p>
                    </div>
                </div>
                <div className="receipt-pdf-summary" style={{justifyContent: 'flex-start', marginTop: '20px'}}>
                    <div className="receipt-pdf-summary-box" style={{width: '100%', maxWidth: 'none'}}>
                        <table><tbody>
                            <tr><td className="total-label">Total Amount Received</td><td className="total-amount">{receipt.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody></table>
                    </div>
                </div>
                <h3 style={{marginTop: '40px', fontSize: '16px', fontWeight: 600}}>Payment for Invoices</h3>
                <table className="receipt-pdf-table">
                    <thead><tr><th>Invoice #</th><th>Invoice Date</th><th className="amount">Amount Paid</th></tr></thead>
                    <tbody>
                        {receipt.invoices.map(invId => {
                            const inv = invoices.find(i => i.id === invId);
                            return <tr key={invId}><td>{inv.id}</td><td>{inv.date}</td><td className="amount">{/* Logic for partial payment would go here */}</td></tr>
                        })}
                    </tbody>
                </table>
                <div className="receipt-pdf-footer">
                    <p>Thank you for your payment!</p>
                </div>
            </div>
        </Box>
    );
});

// --- MAIN APP COMPONENT ---
function ReceiptVoucherApp() {
  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [receiptMethod, setReceiptMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // App State
  const [receipts, setReceipts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const pdfRef = useRef();

  const outstandingInvoices = useMemo(() => {
    return selectedCustomer ? invoices.filter(i => i.customerId === selectedCustomer && (i.total > i.paid)) : [];
  }, [selectedCustomer]);

  useEffect(() => {
    const totalDue = outstandingInvoices
        .filter(i => selectedInvoices.includes(i.id))
        .reduce((sum, i) => sum + (i.total - i.paid), 0);
    setAmountReceived(totalDue > 0 ? totalDue.toFixed(2) : '');
  }, [selectedInvoices, outstandingInvoices]);

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices(prev =>
        prev.includes(invoiceId) ? prev.filter(id => id !== invoiceId) : [...prev, invoiceId]
    );
  };

  const handleSaveReceipt = () => {
    if (!selectedCustomer || !amountReceived || !receiptMethod || selectedInvoices.length === 0) {
        setSnackbar({ open: true, message: 'Please fill all required fields and select at least one invoice.', severity: 'warning' });
        return;
    }

    const newReceipt = {
        id: `RCPT-${String(receipts.length + 1).padStart(3, '0')}`,
        customerId: selectedCustomer,
        date: receiptDate,
        amount: parseFloat(amountReceived),
        method: receiptMethod,
        reference,
        invoices: selectedInvoices,
    };

    setReceipts(prev => [...prev, newReceipt]);
    setSnackbar({ open: true, message: `Receipt ${newReceipt.id} saved successfully!`, severity: 'success' });

    // Reset form
    setSelectedCustomer('');
    setSelectedInvoices([]);
    setAmountReceived('');
    setReceiptMethod('');
    setReference('');
  };

  const handleViewClick = (receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" color="text.primary">Receipt Voucher</Typography>
          <Link href="#" underline="none" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontWeight: 500 }}>
            <ArrowBackIcon size={16} style={{ marginRight: '8px' }} /> Back to Sales
          </Link>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 4 } }}>
            <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 3 }}>Record a New Receipt</Typography>
            <Box sx={{border: '1px solid #e0e0e0', borderRadius: 3, p: 3}}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <FormControl fullWidth>
                            <InputLabel>Received From *</InputLabel>
                            <Select label="Received From *" value={selectedCustomer} onChange={(e) => {setSelectedCustomer(e.target.value); setSelectedInvoices([]);}}>
                            {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <TextField fullWidth label="Receipt Date" type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControl fullWidth>
                            <InputLabel>Receipt Method *</InputLabel>
                            <Select label="Receipt Method *" value={receiptMethod} onChange={(e) => setReceiptMethod(e.target.value)}>
                            {paymentMethods.map((m) => <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={3}>
                         <TextField fullWidth label="Reference / Description" value={reference} onChange={(e) => setReference(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={2}>
                        <TextField fullWidth label="Amount Received *" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}/>
                    </Grid>
                </Grid>
            </Box>

            {selectedCustomer && (
                <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Outstanding Invoices</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{boxShadow: 'none', border: '1px solid #e0e0e0'}}>
                    <Table>
                        <TableHead sx={{backgroundColor: '#f4f6f8'}}>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Invoice #</TableCell>
                                <TableCell align="right">Invoice Amount</TableCell>
                                <TableCell align="right">Amount Due</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {outstandingInvoices.length > 0 ? outstandingInvoices.map(invoice => (
                                <TableRow key={invoice.id} hover onClick={() => handleSelectInvoice(invoice.id)} sx={{ cursor: 'pointer' }}>
                                    <TableCell padding="checkbox"><Checkbox checked={selectedInvoices.includes(invoice.id)}/></TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.id}</TableCell>
                                    <TableCell align="right">{invoice.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                    <TableCell align="right">{(invoice.total - invoice.paid).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} align="center">No outstanding invoices for this customer.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                </>
            )}

            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 4}}>
                <Button variant="contained" size="large" sx={{ py: 1.5, px: 4 }} onClick={handleSaveReceipt} startIcon={<SaveIcon />}>Save Receipt</Button>
            </Box>

            {receipts.length > 0 && <>
                <Divider sx={{ my: 5 }} />
                <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 2 }}>Recent Receipts</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{boxShadow: 'none', border: '1px solid #e0e0e0'}}>
                  <Table>
                    <TableHead sx={{backgroundColor: '#f4f6f8'}}>
                      <TableRow>
                        <TableCell>Receipt #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Receipt Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {receipts.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{fontWeight: 500}}>{row.id}</TableCell>
                            <TableCell>{customers.find(c=>c.id === row.customerId)?.name}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell align="right" sx={{fontWeight: 500}}>{row.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                            <TableCell align="center">
                                <IconButton size="small" onClick={() => handleViewClick(row)} title="View Receipt">
                                    <EyeIcon size={16} />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            </>}
        </Paper>
      </Container>

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" PaperProps={{sx: {borderRadius: 4}}}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Receipt Preview
          <IconButton onClick={handleCloseModal}><XIcon size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
            <ReceiptPDF ref={pdfRef} receipt={selectedReceipt} />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f4f6f8' }}>
            <Button variant="contained" onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <ReceiptVoucherApp />
    </ThemeProvider>
  );
}