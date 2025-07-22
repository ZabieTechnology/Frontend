import React, { useState, useEffect } from 'react';
import {
    createTheme,
    ThemeProvider,
    CssBaseline,
    Container,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Tabs,
    Tab,
    Paper,
    TextField,
    InputAdornment,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Drawer,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

// --- THEME & STYLES ---

const theme = createTheme({
    palette: {
        primary: {
            main: '#84cc16', // lime-500
            light: '#a3e635', // lime-400
            dark: '#65a30d', // lime-600
            contrastText: '#1a2e05', // dark lime text
        },
        secondary: {
            main: '#f1f5f9', // slate-100
            contrastText: '#475569', // slate-600
        },
        background: {
            default: '#f8fafc', // slate-50
            paper: '#ffffff',
        },
        success: {
            main: '#22c55e', // green-500
            dark: '#16a34a', // green-600
        },
        warning: {
            main: '#f97316',
        }
    },
    typography: {
        fontFamily: 'sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: '600',
        },
    },
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: '8px' } } },
        MuiCard: { styleOverrides: { root: { borderRadius: '16px' } } },
        MuiPaper: { styleOverrides: { root: { borderRadius: '16px' } } },
        MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: '12px' } } } },
    },
});

// --- HELPER FUNCTIONS & DATA ---

function numberToWords(num) {
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (num === null || isNaN(num) || num === '') return '';
    if (Number(num) === 0) return 'Zero';
    let number = parseFloat(num).toFixed(2).split('.');
    let mainNumber = parseInt(number[0], 10);
    let decimalPart = parseInt(number[1], 10);
    const toWords = (n) => {
        if (n < 20) return a[n];
        let digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 === 0 ? '' : ' ' + toWords(n % 100));
        if (n < 100000) return toWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 === 0 ? '' : ' ' + toWords(n % 1000));
        if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 === 0 ? '' : ' ' + toWords(n % 100000));
        return toWords(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 === 0 ? '' : ' ' + toWords(n % 10000000));
    };
    let words = toWords(mainNumber);
    if (decimalPart > 0) {
        words += ' and ' + toWords(decimalPart) + ' paise';
    }
    words += ' only';
    return words.split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

const initialMockData = {
    Issued: [
        { id: 1, date: '02/05/2025', party: 'XYZ', name: 'Sam', number: '024654', amount: '2,000.00', clearance: '22/05/2025', cancellationReason: null, reconciled: true },
        { id: 2, date: '06/05/2025', party: 'ABC', name: 'ABC', number: '057489', amount: '2,500.00', clearance: '26/05/2025', cancellationReason: null, reconciled: true },
        { id: 3, date: '08/05/2025', party: 'ABC', name: 'DYC', number: '854633', amount: '3,500.00', clearance: 'Not Cleared', cancellationReason: null, reconciled: false },
    ],
    Received: [
        { id: 1, date: '03/06/2025', party: 'DEF', name: 'John', number: '987654', amount: '5,000.00', clearance: '15/06/2025', cancellationReason: null, reconciled: true },
        { id: 2, date: '10/06/2025', party: 'GHI', name: 'Jane', number: '123789', amount: '7,500.00', clearance: 'Not Cleared', cancellationReason: null, reconciled: false },
    ],
};

// --- PAGE COMPONENTS ---

const MainDashboard = ({ onNavigate }) => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <HeaderTabs />
        <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
                <InfoCard
                    title="Cheque Payment"
                    amount="3,500.00"
                    statementDate="26 May 2025"
                    onAddNew={() => onNavigate('issue')}
                    onViewDetails={() => onNavigate('details', { data: { type: 'Issued' } })}
                    addNewText="+ Issue new cheque"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <InfoCard
                    title="Cheque Receipt"
                    amount="3,500.00"
                    statementDate="26 May 2025"
                    onAddNew={() => onNavigate('receipt')}
                    onViewDetails={() => onNavigate('details', { data: { type: 'Received' } })}
                    addNewText="+ Add Cheque Receipt"
                />
            </Grid>
        </Grid>
    </Container>
);

const ChequeDetailsPage = ({ onNavigate, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab === 'Issued' ? 0 : 1);
    const [tableData, setTableData] = useState(initialMockData);
    const [editingId, setEditingId] = useState(null);
    const [cancelConfirm, setCancelConfirm] = useState({ open: false, row: null });
    const [reconciledDialog, setReconciledDialog] = useState(false);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const handleClearanceUpdate = (e, rowToUpdate) => {
        const { value } = e.target; // <x_bin_342>-MM-DD format
        const currentTabName = activeTab === 0 ? 'Issued' : 'Received';
        const chequeDateYYYYMMDD = rowToUpdate.date.split('/').reverse().join('-');
        if (value && value < chequeDateYYYYMMDD) return;
        const formattedDate = value ? value.split('-').reverse().join('/') : 'Not Cleared';
        setTableData(prevData => ({ ...prevData, [currentTabName]: prevData[currentTabName].map(row => row.id === rowToUpdate.id ? { ...row, clearance: formattedDate } : row) }));
    };

    const handleCancelClick = (rowToCancel) => {
        if (rowToCancel.reconciled) {
            setReconciledDialog(true);
        } else {
            setCancelConfirm({ open: true, row: rowToCancel });
        }
    };

    const handleConfirmCancel = (reason) => {
        const { row } = cancelConfirm;
        if (!row || !reason) return;

        const currentTabName = activeTab === 0 ? 'Issued' : 'Received';
        setTableData(prevData => ({
            ...prevData,
            [currentTabName]: prevData[currentTabName].map(r =>
                r.id === row.id ? { ...r, clearance: 'Cancelled', cancellationReason: reason } : r
            )
        }));
        setCancelConfirm({ open: false, row: null });
    };

    const handleEditBlur = () => setEditingId(null);
    const currentTabName = activeTab === 0 ? 'Issued' : 'Received';

    return (
        <>
            <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4 } }}>
                <Button onClick={() => onNavigate('dashboard')} startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>Back to Dashboard</Button>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                            <Tab label="Cheque Issued" />
                            <Tab label="Cheque Received" />
                        </Tabs>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="contained" onClick={() => onNavigate('issue')} sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}>+ Issue New Cheque</Button>
                            <Button variant="contained" onClick={() => onNavigate('receipt')} sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}>+ Add Cheque Receipt</Button>
                        </Box>
                    </Box>
                    <FilterSection />
                    <DetailsTable
                        data={tableData[currentTabName]}
                        editingId={editingId}
                        onViewClick={(row) => onNavigate(currentTabName === 'Issued' ? 'issue' : 'receipt', { data: row, readOnly: true })}
                        onEditClick={(row) => onNavigate(currentTabName === 'Issued' ? 'issue' : 'receipt', { data: row, readOnly: false })}
                        onCancelClick={handleCancelClick}
                        onClearanceClick={(row) => row.clearance === 'Not Cleared' && setEditingId(row.id)}
                        onEditBlur={handleEditBlur}
                        onClearanceUpdate={handleClearanceUpdate}
                    />
                </Paper>
            </Container>
            <CancelConfirmationDialog
                open={cancelConfirm.open}
                onClose={() => setCancelConfirm({ open: false, row: null })}
                onConfirm={handleConfirmCancel}
                chequeNumber={cancelConfirm.row?.number}
            />
             <ReconciledDialog
                open={reconciledDialog}
                onClose={() => setReconciledDialog(false)}
            />
        </>
    );
};

// --- UI COMPONENTS ---

const HeaderTabs = () => {
    const tabs = ['Overview', 'Bank', 'Credit Card', 'Cheque', 'Cash', 'Loan', 'Wallet'];
    const [value, setValue] = useState(3);
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={(e, val) => setValue(val)} variant="scrollable" scrollButtons="auto">
                {tabs.map(tab => <Tab label={tab} key={tab} />)}
            </Tabs>
        </Box>
    );
};

const InfoCard = ({ title, amount, statementDate, onAddNew, onViewDetails, addNewText }) => (
    <Card elevation={2} sx={{ bgcolor: '#f7fee7' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">{title}</Typography>
                <Button variant="contained" color="primary" onClick={onAddNew}>{addNewText}</Button>
            </Box>
            <Typography variant="h4" component="p" fontWeight="bold">₹ {amount}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Statement Balance as of {statementDate}</Typography>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
            <Button onClick={onViewDetails} sx={{ bgcolor: '#dcfce7', color: 'primary.contrastText' }}>View Details</Button>
        </CardActions>
    </Card>
);

const FilterSection = () => (
    <Paper elevation={0} sx={{ p: 2, mb: 4, bgcolor: '#f7fee7' }}>
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} lg={2.4}><TextField fullWidth label="Search" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={6} lg={2.4}><TextField fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6} lg={2.4}><TextField fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6} lg={2.4}><TextField fullWidth label="Min Amount" type="number" /></Grid>
            <Grid item xs={12} sm={6} lg={2.4}><TextField fullWidth label="Max Amount" type="number" /></Grid>
        </Grid>
    </Paper>
);

const DetailsTable = ({ data, editingId, onClearanceClick, onEditBlur, onClearanceUpdate, onViewClick, onEditClick, onCancelClick }) => {
    const tableHeaders = ['Select', 'Sr no', 'Date', 'Party', 'Cheque Name', 'Cheque Number', 'Amount', 'Clearance date', 'Actions'];
    return (
        <TableContainer component={Paper} elevation={0}>
            <Table>
                <TableHead sx={{ bgcolor: '#dcfce7' }}><TableRow>{tableHeaders.map(h => <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>)}</TableRow></TableHead>
                <TableBody>
                    {data.map(row => (
                        <TableRow key={row.id} hover>
                            <TableCell padding="checkbox"><Checkbox /></TableCell>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.party}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.number}</TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>
                                <Box>
                                    {editingId === row.id ? (
                                        <TextField type="date" size="small" variant="standard" autoFocus onBlur={onEditBlur} onChange={e => onClearanceUpdate(e, row)} InputProps={{ inputProps: { min: row.date.split('/').reverse().join('-') }}}/>
                                    ) : (
                                        <Typography variant="body2" onClick={() => onClearanceClick(row)} sx={{ cursor: row.clearance === 'Not Cleared' ? 'pointer' : 'default', color: row.clearance === 'Cancelled' ? 'error.dark' : row.clearance === 'Not Cleared' ? 'error.main' : 'text.primary' }}>{row.clearance}</Typography>
                                    )}
                                    {row.reconciled && (
                                        <Chip label="Reconciled" color="success" size="small" sx={{ mt: 0.5, height: 'auto', '& .MuiChip-label': { py: 0.25, px: 1, fontSize: '0.7rem' } }}/>
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton size="small" color="primary" onClick={() => onEditClick(row)}><EditIcon /></IconButton>
                                    <IconButton size="small" color="success" onClick={() => onViewClick(row)}><VisibilityIcon /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => onCancelClick(row)}><CancelIcon /></IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// --- MODAL & DRAWER COMPONENTS ---

const StyledTextField = (props) => (
    <TextField variant="filled" sx={{".MuiFilledInput-root": { borderRadius: '12px', bgcolor: 'primary.light', '&:hover': {bgcolor: 'primary.main'} }}} {...props} />
);

const SectionTitle = ({ children }) => (
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark', mt: 2, mb: 2 }}>{children}</Typography>
);

const AddItemsTable = ({ title, headers, items, hasCheckbox, onSelectionChange, selectedIds }) => (
    <Box mt={2}>
       {title && <SectionTitle>{title}</SectionTitle>}
        <TableContainer component={Paper} elevation={1}>
            <Table size="small">
                <TableHead sx={{bgcolor: '#dcfce7'}}><TableRow>{headers.map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
                <TableBody>
                     {items.map(row => (
                        <TableRow key={row.id}>
                            {hasCheckbox && <TableCell padding="checkbox"><Checkbox checked={(selectedIds || []).includes(row.id)} onChange={(e) => onSelectionChange(e, row.id)}/></TableCell>}
                            {Object.values(row).slice(1).map((val, i) => <TableCell key={i}>{val}</TableCell>)}
                            <TableCell>
                                { hasCheckbox ? <IconButton size="small" color="success"><VisibilityIcon /></IconButton> : <IconButton size="small" color="error"><DeleteIcon /></IconButton> }
                            </TableCell>
                        </TableRow>
                     ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
);

const SearchInvoiceDrawer = ({open, onClose, onMatch}) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const invoices = [ { id: 1, date: '15/05/2024', desc: 'Google India', ref: 'INV/214512', spent: '95.00' }, { id: 2, date: '11/05/2024', desc: 'ABC Limited', ref: 'INV/214512', spent: '95.00' }, ];
    const invoiceHeaders = ['Select', 'Date', 'Description', 'Reference', 'Spent', 'Received'];

    const handleSelectionChange = (event, id) => {
        const selectedIndex = selectedIds.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) newSelected = newSelected.concat(selectedIds, id);
        else if (selectedIndex === 0) newSelected = newSelected.concat(selectedIds.slice(1));
        else if (selectedIndex === selectedIds.length - 1) newSelected = newSelected.concat(selectedIds.slice(0, -1));
        else if (selectedIndex > 0) newSelected = newSelected.concat(selectedIds.slice(0, selectedIndex), selectedIds.slice(selectedIndex + 1));
        setSelectedIds(newSelected);
    };

    const handleMatch = () => {
        const matched = invoices.filter(inv => selectedIds.includes(inv.id));
        onMatch(matched);
        onClose();
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: { xs: '90vw', md: '60vw', lg: '50vw' }, p: 2, bgcolor: '#f7fee7', height: '100%', display: 'flex', flexDirection: 'column' }} role="presentation">
                <Box display="flex" justifyContent="space-between" alignItems="center"><Typography variant="h5">Search Invoices</Typography><IconButton onClick={onClose}><CloseIcon /></IconButton></Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                     <Grid container spacing={2} alignItems="center" sx={{ my: 1 }}>
                        <Grid item xs={12} sm={6}><TextField variant="outlined" fullWidth size="small" label="Search by name or ref number" /></Grid>
                        <Grid item xs={12} sm={6}><TextField variant="outlined" fullWidth size="small" label="Search by amount" /></Grid>
                        <Grid item xs={12} sm={6}><Button fullWidth variant="contained">Search</Button></Grid>
                        <Grid item xs={12} sm={6}><Button fullWidth variant="outlined">Clear Search</Button></Grid>
                    </Grid>
                    <AddItemsTable title="" headers={invoiceHeaders} items={invoices} hasCheckbox selectedIds={selectedIds} onSelectionChange={handleSelectionChange} />
                </Box>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, borderTop: 1, borderColor: 'divider' }}><Button onClick={onClose}>Cancel</Button><Button onClick={handleMatch} variant="contained">Match</Button></Box>
            </Box>
        </Drawer>
    );
};

const IssueChequeForm = ({ onBack, initialData, readOnly }) => {
    const [details, setDetails] = useState({ bank: '', amount: '', payee: '', contact: '', date: '', chequeNo: '' });
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [matchedInvoices, setMatchedInvoices] = useState([]);
    const bankAccounts = ['PUBLIC BANK', 'MAYBANK', 'CIMB BANK', 'RHB BANK', 'HONG LEONG BANK'];

    useEffect(() => {
        if(initialData) {
            setDetails({
                bank: 'PUBLIC BANK', // Default or from data
                amount: initialData.amount || '',
                payee: initialData.name || '',
                contact: initialData.party || '',
                date: initialData.date.split('/').reverse().join('-') || '', // Format for date input
                chequeNo: initialData.number || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDetails(prevDetails => ({...prevDetails, [name]: value }));
    };

    const handleMatch = (invoices) => {
        setMatchedInvoices(invoices);
        if (invoices.length > 0) {
            const totalAmount = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.spent), 0);
            const payeeName = invoices[0].desc;
            setDetails(prevDetails => ({ ...prevDetails, amount: totalAmount.toFixed(2), payee: payeeName, contact: payeeName }));
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>Back to Dashboard</Button>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography variant="h5" gutterBottom>{readOnly ? 'View Cheque' : 'Issue New Cheque'}</Typography>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        <Grid item xs={12} lg={7}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                     <FormControl fullWidth variant="filled" sx={{".MuiFilledInput-root": { borderRadius: '12px', bgcolor: 'primary.light', '&:hover': {bgcolor: 'primary.main'} }}}>
                                        <InputLabel id="select-bank-label">Select Bank</InputLabel>
                                        <Select labelId="select-bank-label" name="bank" value={details.bank} onChange={handleInputChange} readOnly={readOnly}>
                                            {bankAccounts.map((bank) => <MenuItem key={bank} value={bank}>{bank}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}><StyledTextField name="payee" label="Payee Name" value={details.payee} fullWidth onChange={handleInputChange} InputProps={{readOnly: readOnly}}/></Grid>
                                <Grid item xs={12} sm={6}><StyledTextField name="amount" label="Amount" type="number" value={details.amount} fullWidth onChange={handleInputChange} InputProps={{readOnly: readOnly}}/></Grid>
                                <Grid item xs={12} sm={6}><StyledTextField name="contact" label="Contact Name" value={details.contact} fullWidth onChange={handleInputChange} InputProps={{readOnly: readOnly}}/></Grid>
                                <Grid item xs={12} sm={6}><StyledTextField name="date" label="Cheque Date" type="date" value={details.date} fullWidth onChange={handleInputChange} InputLabelProps={{shrink: true}} InputProps={{readOnly: readOnly}}/></Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField name="match" label="Match Expense Bills" value={matchedInvoices.length > 0 ? `${matchedInvoices.length} invoice(s) matched` : ''}
                                        InputProps={{ readOnly: true, endAdornment: <Button variant="contained" onClick={() => !readOnly && setSearchDrawerOpen(true)} sx={{mr: -1.5, height: '100%'}}>Search Invoice</Button>}}
                                    />
                                </Grid>
                            </Grid>
                            {!readOnly && <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
                                <Button variant="outlined" color="primary">Print and Save</Button>
                                <Button variant="contained" color="primary">Save</Button>
                            </Box>}
                             <ChequeSample details={details} />
                        </Grid>
                        <Grid item xs={12} lg={5}>
                             <Paper elevation={2} sx={{p: 2, bgcolor: '#f7fee7', height: '100%'}}>
                                 <SectionTitle>Matched Invoices</SectionTitle>
                                 {matchedInvoices.length > 0 ? (
                                     <AddItemsTable headers={['Date', 'Description', 'Reference', 'Spent', 'Action']} items={matchedInvoices.map(inv => ({...inv, action:''}))} />
                                 ) : ( <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%'}}><Typography color="text.secondary">No invoices matched yet.</Typography></Box>)}
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            <SearchInvoiceDrawer open={searchDrawerOpen} onClose={() => setSearchDrawerOpen(false)} onMatch={handleMatch} />
        </>
    );
};

const AddNewReceiptModal = ({ onBack, initialData, readOnly }) => {
    const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
    const [matchedInvoices, setMatchedInvoices] = useState([]);
    const [formState, setFormState] = useState({ amount: '', contactName: '', chequeDate: '' });

    useEffect(() => {
        if(initialData) {
            setFormState({
                amount: initialData.amount || '',
                contactName: initialData.party || '',
                chequeDate: initialData.date.split('/').reverse().join('-') || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    };

    const handleMatch = (invoices) => {
        setMatchedInvoices(invoices);
        if (invoices.length > 0) {
            const totalAmount = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.spent), 0);
            const contactName = invoices[0].desc;
            setFormState(prev => ({ ...prev, amount: totalAmount.toFixed(2), contactName: contactName }));
        }
    };

    return (
        <>
            <Container maxWidth="xl" sx={{py: 4}}>
                 <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>Back to Dashboard</Button>
                <Paper elevation={3} sx={{ p: 4 }}>
                     <Typography variant="h5" gutterBottom>{readOnly ? 'View Receipt' : 'Add new receipt'}</Typography>
                    <Grid container spacing={4} sx={{mt: 1}}>
                        <Grid item xs={12} lg={5}>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <StyledTextField label="Amount" name="amount" type="number" value={formState.amount} onChange={handleInputChange} InputProps={{readOnly: readOnly}} fullWidth/>
                                <StyledTextField label="Contact Name" name="contactName" value={formState.contactName} onChange={handleInputChange} InputProps={{readOnly: readOnly}} fullWidth/>
                                <StyledTextField label="Cheque Date" name="chequeDate" type="date" value={formState.chequeDate} onChange={handleInputChange} InputLabelProps={{shrink: true}} InputProps={{readOnly: readOnly}} fullWidth/>
                                <StyledTextField label="Match Invoices" value={matchedInvoices.length > 0 ? `${matchedInvoices.length} invoice(s) matched` : ''}
                                    InputProps={{ readOnly: true, endAdornment: <Button variant="contained" onClick={() => !readOnly && setSearchDrawerOpen(true)} sx={{mr: -1.5}}>Search</Button>}}
                                />
                                {!readOnly && <>
                                    <Button variant="contained" color="primary" sx={{py: 1.5}}>Save</Button>
                                    <Divider><Typography variant="caption">OR</Typography></Divider>
                                    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{py: 1.5}}>
                                        Upload Cheque <input type="file" hidden />
                                    </Button>
                                </>}
                            </Box>
                        </Grid>
                        <Grid item xs={12} lg={7}>
                            <Paper elevation={2} sx={{p: 2, bgcolor: '#f7fee7', height: '100%'}}>
                                 <SectionTitle>Matched Invoices</SectionTitle>
                                 {matchedInvoices.length > 0 ? (
                                     <AddItemsTable headers={['Date', 'Description', 'Reference', 'Spent', 'Action']} items={matchedInvoices.map(inv => ({...inv, action:''}))} />
                                 ) : (<Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%'}}><Typography color="text.secondary">No invoices matched yet.</Typography></Box>)}
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            <SearchInvoiceDrawer open={searchDrawerOpen} onClose={() => setSearchDrawerOpen(false)} onMatch={handleMatch} />
        </>
    );
};

const CancelConfirmationDialog = ({ open, onClose, onConfirm, chequeNumber }) => {
    const [reason, setReason] = useState('');
    const reasons = ['Spoiled Cheque', 'Lost Cheque', 'Entry Error', 'Duplicate Payment', 'Other'];

    const handleConfirmClick = () => {
        onConfirm(reason);
        setReason('');
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{display: 'flex', alignItems: 'center'}}>
                <WarningIcon color="warning" sx={{mr: 1}}/>
                Confirm Cancellation
            </DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to cancel Cheque No. <strong>{chequeNumber}</strong>? This action cannot be undone.</Typography>
                <FormControl fullWidth sx={{mt: 2}} required>
                    <InputLabel id="cancel-reason-label">Reason for Cancellation</InputLabel>
                    <Select
                        labelId="cancel-reason-label"
                        value={reason}
                        label="Reason for Cancellation"
                        onChange={(e) => setReason(e.target.value)}
                    >
                        {reasons.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Back</Button>
                <Button onClick={handleConfirmClick} color="error" variant="contained" disabled={!reason}>Confirm Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

const ReconciledDialog = ({ open, onClose }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{display: 'flex', alignItems: 'center'}}>
            <CheckCircleIcon color="success" sx={{mr: 1}}/>
            Transaction Reconciled
        </DialogTitle>
        <DialogContent>
            <Typography>This cheque has been reconciled with the bank and cannot be cancelled or deleted.</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} variant="contained">OK</Button>
        </DialogActions>
    </Dialog>
);


const ChequeSample = ({ details }) => {
    const formattedDate = (details.date || '').replace(/(\d{2})(\d{2})(\d{4})/, '$1 $2 $3').split('').join(' ');
    const formattedAmount = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(details.amount || 0);
    return (
        <Paper elevation={3} sx={{ p: 2, fontFamily: 'monospace', width: '100%' }}>
            <Box display="flex" justifyContent="space-between">
                <Box><Typography variant="h6" color="error" fontWeight="bold">{details.bank || 'PUBLIC BANK'}</Typography><Typography variant="caption">{details.bank || 'SELECT YOUR BANK'}</Typography></Box>
                <Box textAlign="right"><Typography variant="caption">A/C PAYEE ONLY</Typography><br/><Typography variant="caption">PLUS CURRENT ACCOUNT</Typography></Box>
            </Box>
            <Box display="flex" justifyContent="flex-end" alignItems="center" my={1}><Typography variant="caption" mr={1}>DATE:</Typography><Box borderBottom={1} width={150} textAlign="center">{formattedDate || 'DD MM YY YY'}</Box></Box>
            <Box borderTop={2} sx={{ borderStyle: 'dashed' }} borderColor="grey.400" pt={2} mt={1}>
                <Box display="flex" alignItems="center"><Typography width={70}>PAY:</Typography><Box borderBottom={1} flexGrow={1} fontWeight="bold">{details.payee ? `** ${details.payee} **` : ''}</Box></Box>
                <Box display="flex" mt={1}><Typography width={70} variant="body2">AMOUNT:</Typography><Box borderBottom={1} flexGrow={1} height={50} fontWeight="bold">{details.amount ? `** ${numberToWords(details.amount)} **` : ''}</Box></Box>
            </Box>
            <Box display="flex" justifyContent="flex-end" alignItems="center" mt={2}><Typography mr={1}>₹</Typography><Box border={2} p={1} minWidth={150} textAlign="center" borderRadius={1} fontWeight="bold">{`** ${formattedAmount} **`}</Box></Box>
            <Typography variant="caption" mt={2} display="block">CHEQUE NO. {details.chequeNo || 'xxxxxx'}</Typography>
        </Paper>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState({ name: 'dashboard', data: null, readOnly: false });

  const handleNavigate = (name, params = {}) => {
      setView({ name, data: params.data || null, readOnly: !!params.readOnly });
  };

  const renderView = () => {
    switch (view.name) {
      case 'details':
        return <ChequeDetailsPage onNavigate={handleNavigate} initialTab={view.data.type} />;
      case 'issue':
        return <IssueChequeForm onBack={() => handleNavigate('dashboard')} initialData={view.data} readOnly={view.readOnly} />;
      case 'receipt':
        return <AddNewReceiptModal onBack={() => handleNavigate('dashboard')} initialData={view.data} readOnly={view.readOnly} />;
      default:
        return <MainDashboard onNavigate={handleNavigate}/>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        {renderView()}
      </Box>
    </ThemeProvider>
  );
}
