import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// --- INLINE SVG ICONS ---
const SearchIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const AddIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const FilterListIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const EditIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const DeleteIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

// --- THEME DEFINITION ---
const modernTheme = createTheme({
    palette: {
        primary: { main: '#007aff' },
        secondary: { main: '#6c757d' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#1c1c1e', secondary: '#6c757d' },
        error: { main: '#d32f2f' },
        success: { main: '#22c55e' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '12px'
                }
            }
        }
    }
});

// --- MOCK DATA ---
const initialLoans = [
    { id: 1, lender: 'HDFC Bank', principal: 500000, interestRate: 8.5, term: 60, startDate: '2023-01-15', status: 'Active', nextPaymentDate: '2025-08-05', nextPaymentAmount: 10250.50 },
    { id: 2, name: 'Bajaj Finserv', principal: 100000, interestRate: 12.0, term: 24, startDate: '2024-06-20', status: 'Active', nextPaymentDate: '2025-07-20', nextPaymentAmount: 4707.35 },
    { id: 3, name: 'Personal Loan', principal: 25000, interestRate: 15.5, term: 12, startDate: '2025-05-10', status: 'Paid Off', nextPaymentDate: '-', nextPaymentAmount: 0 },
];

// --- MAIN LOAN PAGE COMPONENT ---
function LoanPage() {
    const [loans, setLoans] = useState(initialLoans);
    const [activeTab, setActiveTab] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenModal = (loan = null) => {
        setEditingLoan(loan);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingLoan(null);
    };

    const handleSaveLoan = (loanData) => {
        if (editingLoan) {
            setLoans(loans.map(l => l.id === editingLoan.id ? { ...l, ...loanData } : l));
        } else {
            setLoans([...loans, { ...loanData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDeleteLoan = (loanId) => {
        setLoans(loans.filter(l => l.id !== loanId));
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Loans" />
                    </Tabs>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5">Loan Accounts</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Add New Loan</Button>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <TextField
                            size="small"
                            placeholder="Search..."
                            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                        />
                        <IconButton><FilterListIcon /></IconButton>
                    </Stack>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox"><Checkbox /></TableCell>
                                    <TableCell>Lender/Loan Name</TableCell>
                                    <TableCell>Principal</TableCell>
                                    <TableCell>Interest Rate</TableCell>
                                    <TableCell>Term (Months)</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Next Payment</TableCell>
                                    <TableCell>Next Payment Amount</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loans.map((loan) => (
                                    <TableRow key={loan.id} hover>
                                        <TableCell padding="checkbox"><Checkbox /></TableCell>
                                        <TableCell>{loan.name || loan.lender}</TableCell>
                                        <TableCell>₹{loan.principal.toLocaleString()}</TableCell>
                                        <TableCell>{loan.interestRate}%</TableCell>
                                        <TableCell>{loan.term}</TableCell>
                                        <TableCell>
                                            <Box
                                                component="span"
                                                sx={{
                                                    bgcolor: loan.status === 'Active' ? 'success.main' : 'secondary.main',
                                                    color: 'white',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {loan.status}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{loan.nextPaymentDate}</TableCell>
                                        <TableCell>₹{loan.nextPaymentAmount.toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleOpenModal(loan)}><EditIcon /></IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteLoan(loan.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
            <AddEditLoanModal open={openModal} onClose={handleCloseModal} onSave={handleSaveLoan} loan={editingLoan} />
        </Container>
    );
}

// --- Add/Edit Loan Modal ---
const AddEditLoanModal = ({ open, onClose, onSave, loan }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(loan || { name: '', principal: '', interestRate: '', term: '', startDate: '', status: 'Active' });
    }, [loan]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        // Basic calculation for next payment amount (EMI)
        // P x R x (1+R)^N / [(1+R)^N-1]
        const principal = parseFloat(formData.principal);
        const rate = parseFloat(formData.interestRate) / 100 / 12; // monthly interest rate
        const term = parseInt(formData.term);
        let emi = 0;
        if (principal > 0 && rate > 0 && term > 0) {
            const emiTop = principal * rate * Math.pow(1 + rate, term);
            const emiBottom = Math.pow(1 + rate, term) - 1;
            emi = emiTop / emiBottom;
        }

        // Simple logic for next payment date
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        const finalData = {
            ...formData,
            principal: parseFloat(principal),
            interestRate: parseFloat(formData.interestRate),
            term: parseInt(term),
            nextPaymentAmount: parseFloat(emi.toFixed(2)),
            nextPaymentDate: nextPaymentDate.toISOString().split('T')[0]
        };
        onSave(finalData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{loan ? 'Edit Loan' : 'Add New Loan'}<IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton></DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}><TextField name="name" label="Lender / Loan Name" value={formData.name || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="principal" label="Principal Amount (₹)" type="number" value={formData.principal || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="interestRate" label="Interest Rate (%)" type="number" value={formData.interestRate || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="term" label="Term (in months)" type="number" value={formData.term || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="startDate" label="Start Date" type="date" value={formData.startDate || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" value={formData.status || 'Active'} label="Status" onChange={handleChange}><MenuItem value="Active">Active</MenuItem><MenuItem value="Paid Off">Paid Off</MenuItem></Select></FormControl></Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default function App() {
    return (
        <ThemeProvider theme={modernTheme}>
            <CssBaseline />
            <LoanPage />
        </ThemeProvider>
    );
}