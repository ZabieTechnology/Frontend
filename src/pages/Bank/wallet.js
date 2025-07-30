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
const initialWallets = [
    { id: 1, name: 'Paytm', balance: 1250.75, lastTransaction: '2025-07-28', status: 'Active' },
    { id: 2, name: 'Google Pay', balance: 5320.00, lastTransaction: '2025-07-29', status: 'Active' },
    { id: 3, name: 'PhonePe', balance: 850.20, lastTransaction: '2025-07-25', status: 'Active' },
    { id: 4, name: 'Amazon Pay', balance: 25.50, lastTransaction: '2025-06-15', status: 'Inactive' },
];

// --- MAIN WALLET PAGE COMPONENT ---
function WalletPage() {
    const [wallets, setWallets] = useState(initialWallets);
    const [activeTab, setActiveTab] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenModal = (wallet = null) => {
        setEditingWallet(wallet);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingWallet(null);
    };

    const handleSaveWallet = (walletData) => {
        if (editingWallet) {
            setWallets(wallets.map(w => w.id === editingWallet.id ? { ...w, ...walletData } : w));
        } else {
            setWallets([...wallets, { ...walletData, id: Date.now(), lastTransaction: new Date().toISOString().split('T')[0] }]);
        }
        handleCloseModal();
    };

    const handleDeleteWallet = (walletId) => {
        setWallets(wallets.filter(w => w.id !== walletId));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Wallets" />
                    </Tabs>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5">Wallet Accounts</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Add New Wallet</Button>
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
                                    <TableCell>Wallet Name</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Last Transaction</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {wallets.map((wallet) => (
                                    <TableRow key={wallet.id} hover>
                                        <TableCell padding="checkbox"><Checkbox /></TableCell>
                                        <TableCell>{wallet.name}</TableCell>
                                        <TableCell>₹{wallet.balance.toLocaleString()}</TableCell>
                                        <TableCell>{wallet.lastTransaction}</TableCell>
                                        <TableCell>
                                            <Box
                                                component="span"
                                                sx={{
                                                    bgcolor: wallet.status === 'Active' ? 'success.main' : 'secondary.main',
                                                    color: 'white',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {wallet.status}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleOpenModal(wallet)}><EditIcon /></IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteWallet(wallet.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
            <AddEditWalletModal open={openModal} onClose={handleCloseModal} onSave={handleSaveWallet} wallet={editingWallet} />
        </Container>
    );
}

// --- Add/Edit Wallet Modal ---
const AddEditWalletModal = ({ open, onClose, onSave, wallet }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(wallet || { name: '', balance: '', status: 'Active' });
    }, [wallet]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const finalData = {
            ...formData,
            balance: parseFloat(formData.balance),
        };
        onSave(finalData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{wallet ? 'Edit Wallet' : 'Add New Wallet'}<IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton></DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}><TextField name="name" label="Wallet Name" value={formData.name || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="balance" label="Current Balance (₹)" type="number" value={formData.balance || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Status</InputLabel><Select name="status" value={formData.status || 'Active'} label="Status" onChange={handleChange}><MenuItem value="Active">Active</MenuItem><MenuItem value="Inactive">Inactive</MenuItem></Select></FormControl></Grid>
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
            <WalletPage />
        </ThemeProvider>
    );
}