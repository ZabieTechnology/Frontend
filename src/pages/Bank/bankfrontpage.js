import React, { useState, useEffect } from 'react';

// MUI Core Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// MUI Icons Imports
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';

// --- THEME DEFINITION ---
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h6: { fontWeight: 600, fontSize: '1.15rem' },
    h4: { fontWeight: 700, fontSize: '1.75rem' },
    h5: { fontWeight: 600, fontSize: '1.3rem', marginBottom: '16px' },
    subtitle1: { fontWeight: 500, fontSize: '1rem', color: '#424242', marginBottom: '12px' }
  },
  palette: {
    primary: { main: '#007aff' },
    secondary: { main: '#6c757d' },
    background: { default: '#F7F9FC', paper: '#ffffff' },
    text: { primary: '#1c1c1e', secondary: '#6c757d' },
    error: { main: '#d32f2f' },
    success: { main: '#22c55e' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: '999px', padding: '8px 22px', boxShadow: 'none' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: '20px' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#E8F5E9', borderRadius: '12px',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#A5D6A7' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#66BB6A' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
          '&.whiteBg': { backgroundColor: 'white' }
        },
        input: { color: '#1B5E20', '&.whiteBg': { color: '#212121' } }
      }
    },
    MuiInputLabel: { styleOverrides: { root: { color: '#2E7D32', fontWeight: 500 } } },
    MuiCheckbox: { styleOverrides: { root: { color: '#2E7D32', '&.Mui-checked': { color: '#1B5E20' } } } },
    MuiRadio: { styleOverrides: { root: { color: '#2E7D32', '&.Mui-checked': { color: '#1B5E20' } } } },
    MuiTableCell: { styleOverrides: { head: { backgroundColor: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }, body: { borderColor: '#C8E6C9' } } }
  }
});

// --- SHARED STYLES ---
const actionButtonStyle = { backgroundColor: '#C8E6C9', color: '#2E7D32', '&:hover': { backgroundColor: '#A5D6A7' } };
const secondaryButtonStyle = { backgroundColor: '#E0E0E0', color: '#424242', '&:hover': { backgroundColor: '#BDBDBD' }, padding: '10px 20px' };
const deleteButtonStyle = { backgroundColor: '#FFCDD2', color: '#C62828', '&:hover': { backgroundColor: '#EF9A9A' } };
const saveButtonStyle = { backgroundColor: '#66BB6A', color: 'white', '&:hover': { backgroundColor: '#4CAF50' } };
const activeTabStyle = { backgroundColor: '#9CCC65', color: '#1B5E20', '&:hover': { backgroundColor: '#8BC34A' } };
const inactiveTabStyle = { backgroundColor: '#E0E0E0', color: '#424242', '&:hover': { backgroundColor: '#BDBDBD' } };
const contentButtonStyle = { backgroundColor: '#DCEDC8', color: '#33691E', '&:hover': { backgroundColor: '#C5E1A5' } };

// --- BANK PAGE COMPONENTS ---

const BankAccountCard = ({ bankName, accountNumber, balance, statementDate }) => (
  <Paper sx={{ backgroundColor: '#F1F8E9', padding: { xs: '16px', sm: '24px' }, mb: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <Box>
      <Typography variant="h6" component="h2" sx={{ color: '#37474F' }}>{bankName} - {accountNumber}</Typography>
      <Typography variant="h4" component="p" sx={{ color: '#263238', my: 0.5 }}>₹ {balance}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: { xs: 2.5, sm: 3 } }}>Statement Balance as of {statementDate}</Typography>
      <Button variant="contained" sx={contentButtonStyle}>Reconcile</Button>
    </Box>
    <Box><Button variant="contained" sx={contentButtonStyle}>Manage Account</Button></Box>
  </Paper>
);

const AddBankAccountPage = ({ onBack }) => {
  const [country, setCountry] = useState('India');
  const [searchBank, setSearchBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [bankAccountType, setBankAccountType] = useState('');
  const formSectionPaperStyle = { padding: { xs: '20px', sm: '30px' }, backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ ...secondaryButtonStyle, mb: 3 }}>Back to Dashboard</Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={formSectionPaperStyle}>
            <Typography variant="h5" component="h2" sx={{ color: '#37474F' }}>Search Account</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>Find and connect your bank, credit card, or payment provider.</Typography>
            <FormControl fullWidth sx={{ mb: 2.5 }}><InputLabel>Country</InputLabel><Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)}><MenuItem value="India">India</MenuItem><MenuItem value="USA">USA</MenuItem><MenuItem value="UK">UK</MenuItem></Select></FormControl>
            <TextField fullWidth label="Search Bank" variant="outlined" value={searchBank} onChange={(e) => setSearchBank(e.target.value)} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton edge="end" sx={{ color: '#2E7D32' }}><SearchIcon /></IconButton></InputAdornment>), className: 'whiteBg' }} InputLabelProps={{ className: 'whiteBg' }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}><Typography variant="h6" sx={{ color: 'text.secondary' }}>or</Typography></Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={formSectionPaperStyle}>
            <Typography variant="h5" component="h2" sx={{ color: '#37474F' }}>Add bank without linking</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>Account details</Typography>
            <Stack spacing={2.5}>
              <TextField fullWidth label="Bank name" variant="outlined" />
              <TextField fullWidth label="Account name" variant="outlined" />
              <FormControl fullWidth><InputLabel>Bank Account type</InputLabel><Select value={bankAccountType} label="Bank Account type" onChange={(e) => setBankAccountType(e.target.value)}><MenuItem value="Current Account">Current Account</MenuItem><MenuItem value="Savings Account">Savings Account</MenuItem><MenuItem value="Overdraft">Overdraft</MenuItem><MenuItem value="Cash Credit">Cash Credit</MenuItem></Select></FormControl>
              <TextField fullWidth label="Currency" variant="outlined" />
              <FormControl fullWidth><InputLabel>Account type</InputLabel><Select value={accountType} label="Account type" onChange={(e) => setAccountType(e.target.value)}><MenuItem value="Bank">Bank</MenuItem><MenuItem value="Credit Card">Credit Card</MenuItem></Select></FormControl>
              <Button variant="contained" sx={{ ...actionButtonStyle, mt: 2, alignSelf: 'flex-start' }}>Add Account</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const CreateEditRuleForm = ({ onCancel, onSave }) => {
    // State and handlers for the form...
    return (<Paper sx={{ p: 4 }}><Typography variant="h5">Add/Edit Rule Form Placeholder</Typography><Stack direction="row" spacing={2} sx={{mt: 2}}><Button onClick={onCancel} sx={secondaryButtonStyle}>Cancel</Button><Button onClick={onSave} sx={saveButtonStyle}>Save</Button></Stack></Paper>);
};

const AddBankRulesPage = ({ onBack }) => {
  const [searchRule, setSearchRule] = useState('');
  const [rules, setRules] = useState([ { id: 1, name: 'SBI-Service Charge', condition: "Analysis text contains 'SERVICE CHARGE'", checked: false }, { id: 2, name: 'Room Rent', condition: "Analysis text contains 'Rent'", checked: false }, { id: 3, name: 'Rocky', condition: "Description contains 'Rocky'", checked: false }, { id: 4, name: 'Facebook', condition: "Description contains 'Facebook'", checked: true }, { id: 5, name: 'Google', condition: "Description contains 'Google'", checked: false }]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  if (viewMode === 'form') return <CreateEditRuleForm onCancel={() => setViewMode('list')} onSave={() => setViewMode('list')} />;
  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ ...secondaryButtonStyle, mb: 3 }}>Back to Dashboard</Button>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <TextField sx={{ flexGrow: 1, mr: 2, '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '999px' } }} placeholder="Search Rule" variant="outlined" value={searchRule} onChange={(e) => setSearchRule(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><IconButton edge="start" sx={{ color: '#2E7D32' }}><SearchIcon /></IconButton></InputAdornment>) }} />
        <Button variant="contained" sx={{ ...actionButtonStyle, whiteSpace: 'nowrap' }} onClick={() => setViewMode('form')}>+ Add new Rule</Button>
      </Stack>
      <Paper sx={{ backgroundColor: '#F1F8E9', padding: { xs: '16px', sm: '24px' }, borderRadius: '20px' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
          <FormControlLabel control={<Checkbox checked={selectAll} onChange={(e) => { setSelectAll(e.target.checked); setRules(rules.map(r => ({ ...r, checked: e.target.checked }))) }} />} label="Select all" sx={{ color: '#37474F' }} />
          <Button variant="contained" sx={deleteButtonStyle} startIcon={<DeleteIcon />}>Delete</Button>
        </Stack>
        <List>{rules.filter(r => r.name.toLowerCase().includes(searchRule.toLowerCase())).map((rule) => (<ListItem key={rule.id} divider><Checkbox edge="start" checked={rule.checked} onChange={() => setRules(rules.map(r => r.id === rule.id ? { ...r, checked: !r.checked } : r))} /><ListItemText primary={rule.name} secondary={rule.condition} /><ListItemSecondaryAction><Button variant="contained" sx={actionButtonStyle} onClick={() => setViewMode('form')}>Edit</Button></ListItemSecondaryAction></ListItem>))}</List>
      </Paper>
    </Box>
  );
};

const DashboardPage = ({ onAddAccountClick, onAddRulesClick, bankAccounts }) => (
  <Box>
    {bankAccounts.map((account, index) => (<BankAccountCard key={index} {...account} />))}
    <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="flex-end">
      <Button variant="contained" sx={contentButtonStyle} onClick={onAddAccountClick}>+ Add Bank Account</Button>
      <Button variant="contained" sx={contentButtonStyle} onClick={onAddRulesClick}>+ Add Bank Rules</Button>
    </Stack>
  </Box>
);

const BankPage = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const bankAccounts = [ { bankName: 'ICICI Bank', accountNumber: '0487', balance: '23,547.33', statementDate: '26 May 2025' }, { bankName: 'SBI Bank', accountNumber: '0879', balance: '1,63,587.23', statementDate: '26 May 2025' }];
    switch (currentPage) {
        case 'addAccount': return <AddBankAccountPage onBack={() => setCurrentPage('dashboard')} />;
        case 'addRules': return <AddBankRulesPage onBack={() => setCurrentPage('dashboard')} />;
        default: return <DashboardPage bankAccounts={bankAccounts} onAddAccountClick={() => setCurrentPage('addAccount')} onAddRulesClick={() => setCurrentPage('addRules')} />;
    }
};

// --- WALLET PAGE COMPONENTS (Integrated) ---

const initialWallets = [
    { id: 1, name: 'Paytm', balance: 1250.75, lastTransaction: '2025-07-28', status: 'Active' },
    { id: 2, name: 'Google Pay', balance: 5320.00, lastTransaction: '2025-07-29', status: 'Active' },
    { id: 3, name: 'PhonePe', balance: 850.20, lastTransaction: '2025-07-25', status: 'Active' },
    { id: 4, name: 'Amazon Pay', balance: 25.50, lastTransaction: '2025-06-15', status: 'Inactive' },
];

const AddEditWalletModal = ({ open, onClose, onSave, wallet }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => { setFormData(wallet || { name: '', balance: '', status: 'Active' }); }, [wallet]);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = () => onSave({ ...formData, balance: parseFloat(formData.balance) });
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
            <DialogActions><Button onClick={onClose}>Cancel</Button><Button onClick={handleSubmit} variant="contained">Save</Button></DialogActions>
        </Dialog>
    );
};

function WalletPage() {
    const [wallets, setWallets] = useState(initialWallets);
    const [openModal, setOpenModal] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null);
    const handleOpenModal = (wallet = null) => { setEditingWallet(wallet); setOpenModal(true); };
    const handleCloseModal = () => { setOpenModal(false); setEditingWallet(null); };
    const handleSaveWallet = (walletData) => {
        if (editingWallet) { setWallets(wallets.map(w => w.id === editingWallet.id ? { ...w, ...walletData } : w)); }
        else { setWallets([...wallets, { ...walletData, id: Date.now(), lastTransaction: new Date().toISOString().split('T')[0] }]); }
        handleCloseModal();
    };
    const handleDeleteWallet = (walletId) => setWallets(wallets.filter(w => w.id !== walletId));
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}><Typography variant="h5">Wallet Accounts</Typography><Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Add New Wallet</Button></Stack>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}><TextField size="small" placeholder="Search..." InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} /><IconButton><FilterListIcon /></IconButton></Stack>
                    <TableContainer>
                        <Table>
                            <TableHead><TableRow><TableCell padding="checkbox"><Checkbox /></TableCell><TableCell>Wallet Name</TableCell><TableCell>Balance</TableCell><TableCell>Last Transaction</TableCell><TableCell>Status</TableCell><TableCell align="center">Actions</TableCell></TableRow></TableHead>
                            <TableBody>{wallets.map((wallet) => (<TableRow key={wallet.id} hover><TableCell padding="checkbox"><Checkbox /></TableCell><TableCell>{wallet.name}</TableCell><TableCell>₹{wallet.balance.toLocaleString()}</TableCell><TableCell>{wallet.lastTransaction}</TableCell><TableCell><Box component="span" sx={{ bgcolor: wallet.status === 'Active' ? 'success.main' : 'secondary.main', color: 'white', px: 1.5, py: 0.5, borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>{wallet.status}</Box></TableCell><TableCell align="center"><IconButton size="small" onClick={() => handleOpenModal(wallet)}><EditIcon /></IconButton><IconButton size="small" onClick={() => handleDeleteWallet(wallet.id)}><DeleteIcon /></IconButton></TableCell></TableRow>))}</TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
            <AddEditWalletModal open={openModal} onClose={handleCloseModal} onSave={handleSaveWallet} wallet={editingWallet} />
        </Container>
    );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [activeTab, setActiveTab] = useState('Bank');
  const navTabs = ['Overview', 'Bank', 'Credit Card', 'Cheque', 'Cash', 'Loan', 'Wallet'];

  const renderContent = () => {
    switch(activeTab) {
        case 'Bank': return <BankPage />;
        case 'Wallet': return <WalletPage />;
        default: return (<Container><Typography>Page for {activeTab} is under construction.</Typography></Container>);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, backgroundColor: '#F7F9FC', minHeight: '100vh' }}>
        <Stack direction="row" spacing={1} sx={{ mb: { xs: 3, sm: 4 } }} justifyContent="center" flexWrap="wrap">
            {navTabs.map(tab => (
                <Button key={tab} variant="contained" onClick={() => setActiveTab(tab)} sx={activeTab === tab ? activeTabStyle : inactiveTabStyle}>
                    {tab}
                </Button>
            ))}
        </Stack>
        {renderContent()}
      </Container>
    </ThemeProvider>
  );
}

export default App;