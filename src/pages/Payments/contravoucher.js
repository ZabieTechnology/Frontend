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


// --- INLINE SVG ICONS ---
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

// --- MOCK DATA FOR CONTRA VOUCHER ---
const accounts = [
  { id: 'cash', name: 'Cash Account', type: 'Cash' },
  { id: 'bank-main', name: 'Main Bank Account (**** 1234)', type: 'Bank' },
  { id: 'bank-savings', name: 'Savings Account (**** 5678)', type: 'Bank' },
  { id: 'petty-cash', name: 'Petty Cash', type: 'Cash' },
];

const contraVouchers = [
    { id: 'CV-001', date: '2025-06-28', fromAccountId: 'bank-main', toAccountId: 'cash', amount: 1000.00, reference: 'Cash withdrawal for office expenses' },
    { id: 'CV-002', date: '2025-06-29', fromAccountId: 'cash', toAccountId: 'bank-main', amount: 5200.50, reference: 'Cash deposit from daily sales' },
    { id: 'CV-003', date: '2025-06-30', fromAccountId: 'bank-main', toAccountId: 'petty-cash', amount: 200.00, reference: 'Replenish petty cash fund' },
    { id: 'CV-004', date: '2025-07-01', fromAccountId: 'bank-main', toAccountId: 'bank-savings', amount: 15000.00, reference: 'Transfer to savings' },
];


// --- PDF CONTRA VOUCHER COMPONENT ---
const ContraPDF = React.forwardRef(({ voucher }, ref) => {
    if (!voucher) return null;
    const fromAccount = accounts.find(a => a.id === voucher.fromAccountId);
    const toAccount = accounts.find(a => a.id === voucher.toAccountId);

    return (
        <Box ref={ref} sx={{ p: 4, backgroundColor: '#fff' }}>
             <style>
                {`
                .contra-pdf-container { font-family: 'Inter', sans-serif; color: #1c1c1e; }
                .contra-pdf-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
                .contra-pdf-logo { width: 150px; height: auto; }
                .contra-pdf-title h1 { margin: 0; font-size: 28px; font-weight: 700; color: #007aff; text-align: right; }
                .contra-pdf-title p { margin: 5px 0 0; font-size: 14px; color: #6c757d; text-align: right; }
                .contra-pdf-details { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 30px; }
                .contra-pdf-details h3 { margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px; }
                .contra-pdf-details p { margin: 0 0 8px; font-size: 14px; line-height: 1.6; }
                .contra-pdf-table { width: 100%; margin-top: 40px; border-collapse: collapse; }
                .contra-pdf-table th, .contra-pdf-table td { padding: 12px 15px; text-align: left; font-size: 14px; }
                .contra-pdf-table thead { background-color: #f4f6f8; }
                .contra-pdf-table th { font-weight: 600; }
                .contra-pdf-table tbody tr { border-bottom: 1px solid #e0e0e0; }
                .contra-pdf-table .amount { text-align: right; font-weight: 500; }
                .contra-pdf-summary { margin-top: 30px; display: flex; justify-content: flex-end; }
                .contra-pdf-summary-box { width: 50%; max-width: 350px; background-color: #f4f6f8; padding: 20px; border-radius: 8px; }
                .contra-pdf-summary-box table { width: 100%; }
                .contra-pdf-summary-box td { padding: 8px 0; }
                .contra-pdf-summary-box .total-label { font-weight: 600; }
                .contra-pdf-summary-box .total-amount { font-size: 20px; font-weight: 700; color: #007aff; text-align: right; }
                .contra-pdf-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; font-size: 12px; color: #6c757d; }
                `}
            </style>
            <div className="contra-pdf-container">
                <div className="contra-pdf-header">
                    <img src="https://placehold.co/150x50/007aff/ffffff?text=YourLogo" alt="Company Logo" className="contra-pdf-logo" />
                    <div className="contra-pdf-title">
                        <h1>Contra Voucher</h1>
                        <p><strong>Voucher #:</strong> {voucher.id}</p>
                        <p><strong>Date:</strong> {voucher.date}</p>
                    </div>
                </div>

                <table className="contra-pdf-table">
                    <thead><tr><th>Account</th><th>Details</th><th className="amount">Debit</th><th className="amount">Credit</th></tr></thead>
                    <tbody>
                        <tr>
                            <td><strong>{toAccount.name}</strong></td>
                            <td>(Transfer To)</td>
                            <td className="amount">{voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                            <td className="amount">-</td>
                        </tr>
                        <tr>
                            <td><strong>{fromAccount.name}</strong></td>
                            <td>(Transfer From)</td>
                            <td className="amount">-</td>
                            <td className="amount">{voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="contra-pdf-details">
                    <div>
                        <h3>Narration / Reference</h3>
                        <p>{voucher.reference}</p>
                    </div>
                </div>

                <div className="contra-pdf-summary">
                    <div className="contra-pdf-summary-box">
                        <table><tbody>
                            <tr><td className="total-label">Total Amount</td><td className="total-amount">{voucher.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody></table>
                    </div>
                </div>
                <div className="contra-pdf-footer">
                    <p>This is a computer-generated document. If you have any questions, please contact us.</p>
                </div>
            </div>
        </Box>
    );
});


// --- MAIN APP COMPONENT ---
function ContraVoucherApp() {
  // Form State
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [contraDate, setContraDate] = useState('2025-07-01');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');

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
            pdf.save(`Contra-Voucher-${selectedVoucher.id}.pdf`);
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
        const subject = encodeURIComponent(`Contra Voucher ${selectedVoucher.id} from Your Company`);
        const body = encodeURIComponent(`Hi Team,\n\nPlease find the contra voucher attached for your records.\n\nThank you,\nFinance Department`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
          <Typography variant="h4" component="h1" color="text.primary">Contra Voucher</Typography>
          <Link href="#" underline="none" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontWeight: 500 }}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Dashboard
          </Link>
        </Box>

        <Paper sx={{ p: { xs: 2, md: 4 } }}>
            {/* --- CREATE CONTRA FORM --- */}
            <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 3 }}>
              Record a New Transfer
            </Typography>
            <Box sx={{border: '1px solid #e0e0e0', borderRadius: 3, p: 3}}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Transfer From *</InputLabel>
                            <Select label="Transfer From *" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                            {accounts.map((acc) => <MenuItem key={acc.id} value={acc.id} disabled={acc.id === toAccount}>{acc.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Transfer To *</InputLabel>
                            <Select label="Transfer To *" value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
                            {accounts.map((acc) => <MenuItem key={acc.id} value={acc.id} disabled={acc.id === fromAccount}>{acc.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField fullWidth label="Date" type="date" value={contraDate} onChange={(e) => setContraDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                         <TextField fullWidth label="Reference / Narration" value={reference} onChange={(e) => setReference(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                        />
                    </Grid>
                     <Grid item xs={12} md={3}>
                        <Button fullWidth variant="contained" size="large" sx={{ py: 1.5 }}>Save Transfer</Button>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: 5 }} />

            {/* --- RECENT VOUCHERS LIST --- */}
            <Typography variant="h6" component="h2" color="text.primary" sx={{ mb: 2 }}>Recent Contra Vouchers</Typography>
            <TableContainer component={Paper} variant="outlined" sx={{boxShadow: 'none', border: '1px solid #e0e0e0'}}>
              <Table>
                <TableHead sx={{backgroundColor: '#f4f6f8'}}>
                  <TableRow>
                    <TableCell>Voucher #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Transfer From</TableCell>
                    <TableCell>Transfer To</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right" sx={{ pr: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contraVouchers.map((row) => {
                    const fromAcc = accounts.find(a => a.id === row.fromAccountId);
                    const toAcc = accounts.find(a => a.id === row.toAccountId);
                    return (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{fontWeight: 500}}>{row.id}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{fromAcc.name}</TableCell>
                            <TableCell>{toAcc.name}</TableCell>
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
          Contra Voucher Preview
          <IconButton onClick={handleCloseModal}><XIcon size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
            <ContraPDF ref={pdfRef} voucher={selectedVoucher} />
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
      <ContraVoucherApp />
    </ThemeProvider>
  );
}