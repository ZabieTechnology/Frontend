import React, { useState, useRef, useEffect } from 'react';
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
import ButtonGroup from '@mui/material/ButtonGroup';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import { createTheme, ThemeProvider } from '@mui/material/styles';


// --- INLINE SVG ICONS (Replaces lucide-react) ---
const ArrowLeft = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const FileText = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const Eye = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const Edit = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Trash2 = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const ChevronDown = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);


// Note: jsPDF and html2canvas are now loaded dynamically via a useEffect hook
// to resolve the previous compilation error.

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
  { id: 4, name: 'Gekko & Co', address: '33 Wall Street, New York, NY', email: 'gg@gekko.com' },
];

const paymentMethods = [
    { id: 'cash', name: 'Cash' }, { id: 'credit_card', name: 'Credit Card' },
    { id: 'bank_transfer', name: 'Bank Transfer' }, { id: 'check', name: 'Check' },
];

const paymentVouchers = [
    { id: 'PV-001', date: '2025-06-28', customerId: 1, amount: 1500.00, method: 'Credit Card', reference: 'Payment for Invoice #INV-2025-05-12' },
    { id: 'PV-002', date: '2025-06-29', customerId: 2, amount: 2500.50, method: 'Bank Transfer', reference: 'Q2 Consulting Services' },
    { id: 'PV-003', date: '2025-06-30', customerId: 3, amount: 750.25, method: 'Cash', reference: 'Rare Phoenix Feather Core' },
    { id: 'PV-004', date: '2025-06-30', customerId: 4, amount: 5200.00, method: 'Check', reference: 'Market Analysis Report' },
];

// --- PDF VOUCHER COMPONENT ---
const VoucherPDF = React.forwardRef(({ voucher }, ref) => {
    if (!voucher) return null;
    const customer = customers.find(c => c.id === voucher.customerId);

    return (
        <Box ref={ref} sx={{ p: 4, backgroundColor: '#fff' }}>
             <style>
                {`
                .voucher-pdf-container { font-family: 'Inter', sans-serif; color: #1c1c1e; }
                .voucher-pdf-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
                .voucher-pdf-logo { width: 150px; height: auto; }
                .voucher-pdf-title h1 { margin: 0; font-size: 28px; font-weight: 700; color: #007aff; text-align: right; }
                .voucher-pdf-title p { margin: 5px 0 0; font-size: 14px; color: #6c757d; text-align: right; }
                .voucher-pdf-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
                .voucher-pdf-details h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
                .voucher-pdf-details p { margin: 0 0 8px; font-size: 14px; line-height: 1.6; }
                .voucher-pdf-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
                .voucher-pdf-table th, .voucher-pdf-table td { padding: 12px 15px; text-align: left; font-size: 14px; }
                .voucher-pdf-table thead { background-color: #f4f6f8; }
                .voucher-pdf-table th { font-weight: 600; }
                .voucher-pdf-table tbody tr { border-bottom: 1px solid #e0e0e0; }
                .voucher-pdf-table .amount { text-align: right; font-weight: 500; }
                .voucher-pdf-summary { margin-top: 30px; display: flex; justify-content: flex-end; }
                .voucher-pdf-summary-box { width: 50%; max-width: 350px; background-color: #f4f6f8; padding: 20px; border-radius: 8px; }
                .voucher-pdf-summary-box table { width: 100%; }
                .voucher-pdf-summary-box td { padding: 8px 0; }
                .voucher-pdf-summary-box .total-label { font-weight: 600; }
                .voucher-pdf-summary-box .total-amount { font-size: 20px; font-weight: 700; color: #007aff; text-align: right; }
                .voucher-pdf-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; font-size: 12px; color: #6c757d; }
                `}
            </style>
            <div className="voucher-pdf-container">
                <div className="voucher-pdf-header">
                    <img src="https://placehold.co/150x50/007aff/ffffff?text=YourLogo" alt="Company Logo" className="voucher-pdf-logo" />
                    <div className="voucher-pdf-title">
                        <h1>Payment Voucher</h1>
                        <p><strong>Voucher #:</strong> {voucher.id}</p>
                        <p><strong>Date:</strong> {voucher.date}</p>
                    </div>
                </div>
                <div className="voucher-pdf-details">
                    <div>
                        <h3>Paid To</h3>
                        <p><strong>{customer.name}</strong></p>
                        <p>{customer.address}</p>
                        <p>{customer.email}</p>
                    </div>
                    <div>
                        <h3>Paid By</h3>
                        <p><strong>Your Company Name</strong></p>
                        <p>123 Business Avenue</p>
                        <p>Metropolis, 54321</p>
                    </div>
                </div>
                <table className="voucher-pdf-table">
                    <thead><tr><th>Description</th><th>Payment Method</th><th className="amount">Amount</th></tr></thead>
                    <tbody><tr><td>{voucher.reference}</td><td>{voucher.method}</td><td className="amount">{voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr></tbody>
                </table>
                <div className="voucher-pdf-summary">
                    <div className="voucher-pdf-summary-box">
                        <table><tbody>
                            <tr><td>Subtotal</td><td className="amount">{voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                            <tr><td className="total-label">Total Paid</td><td className="total-amount">{voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody></table>
                    </div>
                </div>
                <div className="voucher-pdf-footer">
                    <p>Thank you for your business! If you have any questions, please contact us.</p>
                </div>
            </div>
        </Box>
    );
});


// --- MAIN APP COMPONENT ---
function PaymentVoucherApp() {
  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentDate, setPaymentDate] = useState('2025-06-30');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Snackbar (Notification) State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const pdfRef = useRef();

  // Split button state
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  // Dynamically load external scripts for PDF generation
  useEffect(() => {
    const jspdfScript = document.createElement('script');
    jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jspdfScript.async = true;
    document.body.appendChild(jspdfScript);

    const html2canvasScript = document.createElement('script');
    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    html2canvasScript.async = true;
    document.body.appendChild(html2canvasScript);

    return () => {
      if (document.body.contains(jspdfScript)) document.body.removeChild(jspdfScript);
      if (document.body.contains(html2canvasScript)) document.body.removeChild(html2canvasScript);
    };
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleViewClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleEditClick = (e, voucher) => {
    e.stopPropagation(); // Prevent row click if it exists
    setSnackbar({ open: true, message: `Edit functionality for ${voucher.id} is not yet implemented.`, severity: 'info' });
  };

  const handleCancelClick = (e, voucher) => {
    e.stopPropagation();
    setSnackbar({ open: true, message: `Cancel action for ${voucher.id} would require confirmation.`, severity: 'warning' });
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const downloadPdf = () => {
    return new Promise((resolve) => {
        const { jsPDF } = window;
        const html2canvas = window.html2canvas;

        if (!jsPDF || !html2canvas) {
            setSnackbar({ open: true, message: 'PDF libraries are still loading. Please try again.', severity: 'info' });
            return resolve(false);
        }

        const input = pdfRef.current;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Payment-Voucher-${selectedVoucher.id}.pdf`);
            resolve(true);
        });
    });
  };

  const handlePdfAction = async (action) => {
    setOpen(false);
    const downloaded = await downloadPdf();
    if (!downloaded) return;

    if (action === 'download') {
        setSnackbar({ open: true, message: `PDF for ${selectedVoucher.id} has been downloaded.`, severity: 'success' });
        handleCloseModal();
    } else if (action === 'email') {
        const customer = customers.find(c => c.id === selectedVoucher.customerId);
        const subject = encodeURIComponent(`Payment Voucher ${selectedVoucher.id} from Your Company`);
        const body = encodeURIComponent(`Hi ${customer.name},\n\nPlease find your payment voucher attached.\n\nThank you,\nYour Company Name`);
        window.location.href = `mailto:${customer.email}?subject=${subject}&body=${body}`;
        setSnackbar({ open: true, message: 'Please attach the downloaded PDF to the email.', severity: 'info' });
        handleCloseModal();
    }
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" color="text.primary">Payment Voucher</Typography>
          <Link href="#" underline="none" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontWeight: 500 }}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Invoices
          </Link>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 4 } }}>
            {/* --- CREATE PAYMENT FORM --- */}
            <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 3 }}>
              Record a New Payment
            </Typography>
            <Box sx={{border: '1px solid #e0e0e0', borderRadius: 3, p: 3}}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <FormControl fullWidth>
                            <InputLabel>Paid to *</InputLabel>
                            <Select label="Paid to *" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                            {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <TextField fullWidth label="Payment Date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={2}>
                        <FormControl fullWidth>
                            <InputLabel>Payment Method</InputLabel>
                            <Select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            {paymentMethods.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={3}>
                         <TextField fullWidth label="Reference / Description" value={reference} onChange={(e) => setReference(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={2}>
                        <TextField
                            fullWidth
                            label="Amount Paid"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 4}}>
                <Button variant="contained" size="large" sx={{ py: 1.5, px: 4 }}>Save Payment</Button>
            </Box>

            <Divider sx={{ my: 5 }} />

            {/* --- RECENT VOUCHERS LIST --- */}
            <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 2 }}>Recent Payment Vouchers</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{boxShadow: 'none', border: '1px solid #e0e0e0'}}>
              <Table>
                <TableHead sx={{backgroundColor: '#f4f6f8'}}>
                  <TableRow>
                    <TableCell>Voucher #</TableCell>
                    <TableCell>Contacts</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Reference / Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right" sx={{ pr: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentVouchers.map((row) => {
                    const customer = customers.find(c => c.id === row.customerId);
                    return (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{fontWeight: 500}}>{row.id}</TableCell>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.method}</TableCell>
                            <TableCell>{row.reference}</TableCell>
                            <TableCell align="right" sx={{fontWeight: 500}}>{row.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                            <TableCell align="right">
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => handleViewClick(row)} title="View Voucher">
                                        <Eye size={16} />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => handleEditClick(e, row)} title="Edit Voucher">
                                        <Edit size={16} />
                                    </IconButton>
                                    <IconButton size="small" onClick={(e) => handleCancelClick(e, row)} title="Cancel Voucher">
                                        <Trash2 size={16} color={modernTheme.palette.error.main} />
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
        </Paper>
      </Container>

      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" PaperProps={{sx: {borderRadius: 4}}}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Voucher Preview
          <IconButton onClick={handleCloseModal}><XIcon size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
            <VoucherPDF ref={pdfRef} voucher={selectedVoucher} />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f4f6f8' }}>
            <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
                <Button onClick={() => handlePdfAction('download')} startIcon={<FileText size={16}/>}>Download PDF</Button>
                <Button size="small" onClick={handleToggle}>
                    <ChevronDown size={16} />
                </Button>
            </ButtonGroup>
            <Popper
                sx={{ zIndex: 1 }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                    <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                        <MenuList id="split-button-menu" autoFocusItem>
                            <MenuItem onClick={() => handlePdfAction('email')}>Send via Email</MenuItem>
                        </MenuList>
                    </ClickAwayListener>
                    </Paper>
                </Grow>
                )}
            </Popper>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <PaymentVoucherApp />
    </ThemeProvider>
  );
}