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
const initialCards = [
    { id: 1, name: 'HDFC Bank', number: '**** **** **** 1234', holder: 'John Doe', expiry: '12/25', type: 'Visa', limit: 50000, available: 35000, lastBilled: '2024-05-20', due: '2024-06-10', dueAmount: 5000 },
    { id: 2, name: 'ICICI Bank', number: '**** **** **** 5678', holder: 'Jane Smith', expiry: '10/26', type: 'Mastercard', limit: 100000, available: 80000, lastBilled: '2024-05-15', due: '2024-06-05', dueAmount: 12000 },
];

// --- MAIN APP COMPONENT ---
function CreditCardPage() {
    const [cards, setCards] = useState(initialCards);
    const [activeTab, setActiveTab] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleOpenModal = (card = null) => {
        setEditingCard(card);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingCard(null);
    };

    const handleSaveCard = (cardData) => {
        if (editingCard) {
            setCards(cards.map(c => c.id === editingCard.id ? { ...c, ...cardData } : c));
        } else {
            setCards([...cards, { ...cardData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Credit Card" />
                    </Tabs>
                </Box>
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h5">Credit Card Accounts</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Add New Card</Button>
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
                                    <TableCell>Card Name</TableCell>
                                    <TableCell>Card Number</TableCell>
                                    <TableCell>Card Holder</TableCell>
                                    <TableCell>Credit Limit</TableCell>
                                    <TableCell>Available Credit</TableCell>
                                    <TableCell>Last Billed On</TableCell>
                                    <TableCell>Due On</TableCell>
                                    <TableCell>Due Amount</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cards.map((card) => (
                                    <TableRow key={card.id} hover>
                                        <TableCell padding="checkbox"><Checkbox /></TableCell>
                                        <TableCell>{card.name}</TableCell>
                                        <TableCell>{card.number}</TableCell>
                                        <TableCell>{card.holder}</TableCell>
                                        <TableCell>₹{card.limit.toLocaleString()}</TableCell>
                                        <TableCell>₹{card.available.toLocaleString()}</TableCell>
                                        <TableCell>{card.lastBilled}</TableCell>
                                        <TableCell>{card.due}</TableCell>
                                        <TableCell>₹{card.dueAmount.toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => handleOpenModal(card)}><EditIcon /></IconButton>
                                            <IconButton size="small"><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
            <AddEditCardModal open={openModal} onClose={handleCloseModal} onSave={handleSaveCard} card={editingCard} />
        </Container>
    );
}

// --- Add/Edit Card Modal ---
const AddEditCardModal = ({ open, onClose, onSave, card }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(card || { name: '', number: '', holder: '', expiry: '', type: '', limit: '', available: '', lastBilled: '', due: '', dueAmount: '' });
    }, [card]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{card ? 'Edit Credit Card' : 'Add New Credit Card'}<IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton></DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}><TextField name="name" label="Card Name" value={formData.name || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="number" label="Card Number" value={formData.number || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="holder" label="Card Holder" value={formData.holder || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="expiry" label="Expiry (MM/YY)" value={formData.expiry || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Card Type</InputLabel><Select name="type" value={formData.type || ''} label="Card Type" onChange={handleChange}><MenuItem value="Visa">Visa</MenuItem><MenuItem value="Mastercard">Mastercard</MenuItem><MenuItem value="Amex">American Express</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} sm={6}><TextField name="limit" label="Credit Limit" type="number" value={formData.limit || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="available" label="Available Credit" type="number" value={formData.available || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="lastBilled" label="Last Billed On" type="date" value={formData.lastBilled || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="due" label="Due On" type="date" value={formData.due || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="dueAmount" label="Due Amount" type="number" value={formData.dueAmount || ''} onChange={handleChange} fullWidth /></Grid>
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
            <CreditCardPage />
        </ThemeProvider>
    );
}