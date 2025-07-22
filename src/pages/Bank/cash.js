import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Container, Box, Grid, Card, CardContent, Button, Typography, Paper, TextField,
    Dialog, DialogContent, DialogActions, IconButton,
    MenuItem, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Checkbox, InputAdornment, Menu, Divider, FormGroup, FormControlLabel, TableSortLabel,
    DialogTitle
} from '@mui/material';
import {
    Close as CloseIcon, Visibility as ViewIcon, Edit as EditIcon,
    Delete as DeleteIcon, Email as EmailIcon, PictureAsPdf as PdfIcon, ArrowBack as ArrowBackIcon,
    Add as AddIcon, FilterList as FilterListIcon, ArrowUpward, ArrowDownward, CheckCircle as CheckCircleIcon,
    CalendarToday as CalendarIcon, Autorenew as SyncIcon, UploadFile as UploadFileIcon
} from '@mui/icons-material';


// --- Reusable Filter and Sort Menu Component ---
const FilterSortMenu = ({
    anchorEl, onClose, onSort, onFilter, onSelectAll, filterOptions, selectedFilters
}) => (
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        PaperProps={{ elevation: 2, sx: { mt: 1, borderRadius: 2, minWidth: 220, maxHeight: 400 } }}
    >
        <Box>
            <MenuItem onClick={() => { onSort('asc'); onClose(); }}>
                <ArrowUpward fontSize="small" sx={{ mr: 1.5 }} /> Sort A to Z
            </MenuItem>
            <MenuItem onClick={() => { onSort('desc'); onClose(); }}>
                <ArrowDownward fontSize="small" sx={{ mr: 1.5 }} /> Sort Z to A
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <Box px={2} py={1}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Filter by value</Typography>
                <FormGroup>
                    <FormControlLabel
                        label="Select All"
                        control={<Checkbox
                            size="small"
                            checked={filterOptions.length === selectedFilters.size}
                            indeterminate={selectedFilters.size > 0 && selectedFilters.size < filterOptions.length}
                            onChange={onSelectAll}
                        />}
                    />
                    {filterOptions.map(option => (
                        <FormControlLabel
                            key={option}
                            label={option || "(Blanks)"}
                            control={<Checkbox
                                size="small"
                                checked={selectedFilters.has(option)}
                                onChange={() => onFilter(option)}
                            />}
                        />
                    ))}
                </FormGroup>
            </Box>
        </Box>
    </Menu>
);

// --- Voucher Modal Component ---
const VoucherModal = ({ transaction, onClose }) => {
    if (!transaction) return null;
    const isExpense = transaction.type === 'Expense';
    const voucherType = isExpense ? 'Cash Payment Voucher' : 'Cash Receipt Voucher';
    const amount = isExpense ? transaction.spent : transaction.received;

    return (
        <Dialog open={!!transaction} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent sx={{p: 0}}>
                <Box p={3} borderBottom={1} borderColor="grey.200">
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h5" component="h2" fontWeight="bold">Your Company Name</Typography>
                            <Typography variant="body2" color="text.secondary">123 Business Rd, Finance City, FC 54321</Typography>
                        </Box>
                        <Box textAlign="right">
                             <Typography variant="h6" fontWeight="bold" color={isExpense ? 'error.main' : 'success.main'}>{voucherType}</Typography>
                            <Typography variant="body2">Voucher No: <Box component="span" fontWeight="bold">{String(transaction.id).padStart(3, '0')}</Box></Typography>
                             <Typography variant="body2">Date: <Box component="span" fontWeight="bold">{transaction.date}</Box></Typography>
                        </Box>
                    </Box>
                </Box>
                <Box p={3} my={2}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}><Typography variant="subtitle1" fontWeight="bold">{isExpense ? 'Paid To:' : 'Received From:'}</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body1">{transaction.description}</Typography></Grid>
                    </Grid>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Grid item xs={4}><Typography variant="subtitle1" fontWeight="bold">Amount:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="h4" fontWeight="bold">₹{amount ? amount.toFixed(2) : '0.00'}</Typography></Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={4}><Typography variant="subtitle1" fontWeight="bold">Amount in Words:</Typography></Grid>
                        <Grid item xs={8}><Typography variant="body1" fontStyle="italic">(Amount in words placeholder)</Typography></Grid>
                    </Grid>
                </Box>
                 <Box mt={4} p={3} display="flex" justifyContent="space-around">
                    <Box textAlign="center" width="40%">
                        <Box borderTop={1} borderColor="grey.400" pt={1}><Typography variant="caption">Authorized Signature</Typography></Box>
                    </Box>
                    <Box textAlign="center" width="40%">
                        <Box borderTop={1} borderColor="grey.400" pt={1}><Typography variant="caption">Receiver's Signature</Typography></Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
                 <Button onClick={onClose}>Close</Button>
                <Button variant="contained" color="error" startIcon={<DeleteIcon />}>Delete</Button>
                <Button variant="contained" startIcon={<EmailIcon />}>Email</Button>
                <Button variant="contained" color="secondary" startIcon={<PdfIcon />}>PDF</Button>
            </DialogActions>
        </Dialog>
    );
};

// --- Add Account Modal ---
const AddAccountModal = ({ open, onClose }) => {
     const StyledPillTextField = (props) => ( <TextField variant="standard" fullWidth sx={{ '& .MuiInputBase-root': { backgroundColor: '#e6ee9c', borderRadius: '50px', px: 2, py: 0.5 }, '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none', }, }} {...props} /> );
    return ( <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"> <DialogTitle fontWeight="bold">Add Cash accounts</DialogTitle> <DialogContent> <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>Cash Account details</Typography> <Box component="form" noValidate autoComplete="off" sx={{mt: 3}}> <Grid container spacing={2} alignItems="center"> <Grid item xs={4}><Typography>Cash head name</Typography></Grid> <Grid item xs={8}><StyledPillTextField /></Grid> <Grid item xs={4}><Typography>Code</Typography></Grid> <Grid item xs={8}><StyledPillTextField /></Grid> <Grid item xs={4}><Typography>Cash account type</Typography></Grid> <Grid item xs={8}> <StyledPillTextField select defaultValue="petty"> <MenuItem value="petty">Petty Cash</MenuItem> <MenuItem value="main">Main Cash</MenuItem> </StyledPillTextField> </Grid> </Grid> </Box> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={onClose}>Cancel</Button> <Button variant="contained" onClick={onClose}>Save</Button> </DialogActions> </Dialog> );
};


// --- View Components ---
const DashboardView = ({ onViewStatement, onAddAccount }) => (
    <Box>
        <Card elevation={0} sx={{ borderRadius: 8, backgroundColor: '#f1f8e9', p: 2, position: 'relative' }}>
             <Button variant="contained" sx={{ position: 'absolute', top: 24, right: 24, borderRadius: '50px', textTransform: 'none', backgroundColor: '#cddc39', color: 'black', '&:hover': { backgroundColor: '#c0ca33' } }}>
                Manage Account
            </Button>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h4" component="h2" fontWeight="bold">Petty Cash</Typography>
                <Typography variant="h3" component="p" fontWeight="bold" mt={1}>₹ 3,500.00</Typography>
                <Typography color="text.secondary" variant="body2" mt={1}>Statement Balance as of 26 May 2025</Typography>
                <Button variant="contained" onClick={onViewStatement} size="large" sx={{ mt: 4, borderRadius: '50px', textTransform: 'none', backgroundColor: '#cddc39', color: 'black', '&:hover': { backgroundColor: '#c0ca33' } }}>
                    View Statement
                </Button>
            </CardContent>
        </Card>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
             <Button variant="contained" startIcon={<AddIcon />} onClick={onAddAccount} sx={{ borderRadius: '50px', textTransform: 'none', px:3, backgroundColor: '#cddc39', color: 'black', '&:hover': { backgroundColor: '#c0ca33' }}}>
                Add Cash Account
            </Button>
        </Box>
    </Box>
);

const StatementView = ({ onBack, onAddExpense, onTopup }) => {
    const initialData = useMemo(() => [ { id: 1, date: '2025-05-02', description: 'Grocery', type: 'Expense', spent: 1000.00, received: 0 }, { id: 2, date: '2025-05-06', description: 'Office Expenses', type: 'Expense', spent: 500.00, received: 0 }, { id: 3, date: '2025-05-08', description: 'Cash Topup', type: 'Topup', spent: 0, received: 1000.00 }, { id: 4, date: '2025-05-01', description: 'Stationery', type: 'Expense', spent: 150.00, received: 0 }, ], []);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentColumn, setCurrentColumn] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
    const [filters, setFilters] = useState(() => { const initialFilters = {}; const headersToFilter = ['id', 'date', 'description', 'type']; headersToFilter.forEach(key => { const uniqueValues = Array.from(new Set(initialData.map(item => item[key]))); initialFilters[key] = new Set(uniqueValues); }); return initialFilters; });
    const handleMenuOpen = (event, columnKey) => { setAnchorEl(event.currentTarget); setCurrentColumn(columnKey); };
    const handleMenuClose = () => { setAnchorEl(null); setCurrentColumn(null); };
    const handleSort = (direction) => { setSortConfig({ key: currentColumn, direction }); };
    const handleFilterChange = useCallback((column, value) => { setFilters(prev => ({...prev, [column]: new Set(prev[column].has(value) ? [...prev[column]].filter(v => v !== value) : [...prev[column], value])})); }, []);
    const handleSelectAllForColumn = useCallback((column, allOptions, isChecked) => { setFilters(prev => ({ ...prev, [column]: isChecked ? new Set(allOptions) : new Set() })); }, []);
    const dataWithRunningBalance = useMemo(() => { const chronologicallySorted = [...initialData].sort((a, b) => new Date(a.date) - new Date(b.date)); let runningBalance = 0; return chronologicallySorted.map(item => { runningBalance += item.received - item.spent; return { ...item, balance: runningBalance }; }); }, [initialData]);
    const sortedAndFilteredData = useMemo(() => { let filteredData = dataWithRunningBalance; Object.keys(filters).forEach(key => { const filterValues = filters[key]; filteredData = filteredData.filter(item => filterValues.has(item[key])); }); if (sortConfig.key) { filteredData.sort((a, b) => { const valA = a[sortConfig.key]; const valB = b[sortConfig.key]; if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; return 0; }); } return filteredData; }, [dataWithRunningBalance, sortConfig, filters]);
    const handleSelectAllClick = (event) => { setSelectedRows(event.target.checked ? new Set(sortedAndFilteredData.map(n => n.id)) : new Set()); };
    const handleRowCheckboxClick = (event, id) => { event.stopPropagation(); setSelectedRows(prev => { const newSet = new Set(prev); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); return newSet; }); };
    const tableHeaders = [ { id: 'id', label: 'Sr no', numeric: true, filterable: true }, { id: 'date', label: 'Date', numeric: false, filterable: true }, { id: 'description', label: 'Description', numeric: false, filterable: true }, { id: 'type', label: 'Type', numeric: false, filterable: true }, { id: 'spent', label: 'Spent', numeric: true, filterable: false }, { id: 'received', label: 'Received', numeric: true, filterable: false }, { id: 'balance', label: 'Balance', numeric: true, filterable: false } ];
    const currentFilterOptions = useMemo(() => currentColumn ? Array.from(new Set(initialData.map(item => item[currentColumn]))) : [], [initialData, currentColumn]);
    return ( <> <VoucherModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} /> {currentColumn && ( <FilterSortMenu anchorEl={anchorEl} onClose={handleMenuClose} onSort={handleSort} onFilter={(value) => handleFilterChange(currentColumn, value)} onSelectAll={(e) => handleSelectAllForColumn(currentColumn, currentFilterOptions, e.target.checked)} filterOptions={currentFilterOptions} selectedFilters={filters[currentColumn] || new Set()} /> )} <Box> <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={4}> <Button onClick={onBack} startIcon={<ArrowBackIcon />}>Back to Dashboard</Button> <Box> <Button variant="contained" onClick={onTopup} sx={{ mr: 2, ...pillButtonStyles}}>Topup Cash</Button> <Button variant="contained" startIcon={<AddIcon />} onClick={onAddExpense} sx={pillButtonStyles}>Add New Expense</Button> </Box> </Box> <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #dcedc8' }}> <Table> <TableHead sx={{ backgroundColor: '#dcedc8' }}> <TableRow> <TableCell padding="checkbox"><Checkbox color="primary" indeterminate={selectedRows.size > 0 && selectedRows.size < sortedAndFilteredData.length} checked={sortedAndFilteredData.length > 0 && sortedAndFilteredData.length === selectedRows.size} onChange={handleSelectAllClick} /></TableCell> {tableHeaders.map((headCell) => ( <TableCell key={headCell.id} align={headCell.numeric ? 'right' : 'left'} sortDirection={sortConfig.key === headCell.id ? sortConfig.direction : false}> <Box display="flex" alignItems="center" justifyContent={headCell.numeric ? 'flex-end' : 'flex-start'}> <TableSortLabel active={sortConfig.key === headCell.id} direction={sortConfig.key === headCell.id ? sortConfig.direction : 'asc'} onClick={() => setSortConfig({ key: headCell.id, direction: (sortConfig.key === headCell.id && sortConfig.direction === 'asc') ? 'desc' : 'asc' })}>{headCell.label}</TableSortLabel> {headCell.filterable && <IconButton size="small" sx={{ ml: 0.5 }} onClick={(e) => handleMenuOpen(e, headCell.id)}><FilterListIcon fontSize="small" /></IconButton>} </Box> </TableCell> ))} <TableCell align="center">Actions</TableCell> </TableRow> </TableHead> <TableBody> {sortedAndFilteredData.map((row) => { const isItemSelected = selectedRows.has(row.id); return ( <TableRow key={row.id} hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected} onClick={() => setSelectedTransaction(row)}> <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} onClick={(event) => handleRowCheckboxClick(event, row.id)} /></TableCell> <TableCell>{row.id}</TableCell><TableCell>{row.date}</TableCell><TableCell>{row.description}</TableCell><TableCell>{row.type}</TableCell> <TableCell align="right">{row.spent ? row.spent.toFixed(2) : '-'}</TableCell><TableCell align="right">{row.received ? row.received.toFixed(2) : '-'}</TableCell> <TableCell align="right">{row.balance.toFixed(2)}</TableCell> <TableCell align="center"><Box onClick={(e) => e.stopPropagation()}><IconButton size="small"><ViewIcon fontSize="small" /></IconButton><IconButton size="small"><EditIcon fontSize="small" /></IconButton><IconButton size="small"><DeleteIcon fontSize="small" /></IconButton></Box></TableCell> </TableRow> )})} </TableBody> </Table> </TableContainer> </Box> </> );
};

const AddExpenseView = ({ onBack }) => {
    const [formValues, setFormValues] = useState({
        billNo: '', billDate: '', billSource: '', supplierGst: '', supplier: '', dueDate: '',
        expenseHead: '', narration: '', totalAmount: '', gstPercentage: '', gstAmount: '', netAmount: ''
    });

    useEffect(() => {
        const total = parseFloat(formValues.totalAmount) || 0;
        const gst = parseFloat(formValues.gstPercentage) || 0;
        const gstAmt = (total * gst) / 100;
        const netAmt = total + gstAmt;
        setFormValues(prev => ({...prev, gstAmount: gstAmt.toFixed(2), netAmount: netAmt.toFixed(2) }));
    }, [formValues.totalAmount, formValues.gstPercentage]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const FormTextField = (props) => (
         <TextField variant="standard" fullWidth InputProps={{ disableUnderline: true, ...props.InputProps, sx: {backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: 1, px: 1.5, py: 0.5, mt: 0.5, ...props.InputProps?.sx} }} {...props} />
    );

    return (
         <Box>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="bold">Add New Expense / Bill</Typography>
                <Box>
                    <Button variant="outlined" size="small" sx={{mr:1, color: 'text.secondary', borderColor: 'divider', textTransform: 'none'}}>Note</Button>
                    <Button variant="outlined" size="small" sx={{mr:1, color: 'text.secondary', borderColor: 'divider', textTransform: 'none'}}>History</Button>
                    <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>
                </Box>
             </Box>
            <Grid container spacing={4} sx={{p:2, borderRadius: 4}}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent:'center', alignItems: 'center', border: '1px solid #e0e0e0' }} elevation={0}>
                         <Typography variant="h6" fontWeight="bold" mb={2}>Upload Invoice</Typography>
                         <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} sx={{width: '100%', py: 1, color: 'text.primary', borderColor: 'text.primary', textTransform: 'none'}}>
                             Choose Invoice File
                             <input type="file" hidden />
                         </Button>
                         <Typography variant="caption" color="text.secondary" sx={{mt: 2, textAlign: 'center'}}>Upload an invoice to auto-fill details using Google Document AI.</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                     <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e0e0e0' }} elevation={0}>
                         <Grid container spacing={2}>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">Bill No.</Typography> <FormTextField name="billNo" value={formValues.billNo} onChange={handleInputChange} /> </Grid>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">Bill Date **</Typography> <FormTextField type="text" name="billDate" value={formValues.billDate} onChange={handleInputChange} placeholder="MM/DD/YYYY" InputProps={{endAdornment: <InputAdornment position="end"><CalendarIcon fontSize="small"/></InputAdornment>}}/> </Grid>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">Bill Source</Typography> <FormTextField select name="billSource" value={formValues.billSource} onChange={handleInputChange}><MenuItem value="direct">Direct Upload</MenuItem></FormTextField> </Grid>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">Due Date</Typography> <FormTextField type="text" name="dueDate" value={formValues.dueDate} onChange={handleInputChange} placeholder="MM/DD/YYYY" InputProps={{endAdornment: <InputAdornment position="end"><CalendarIcon fontSize="small"/></InputAdornment>}}/> </Grid>

                            <Grid item xs={6} md={6}> <Typography variant="caption" color="text.secondary">Supplier GST</Typography> <FormTextField name="supplierGst" value={formValues.supplierGst} onChange={handleInputChange} /> </Grid>
                            <Grid item xs={6} md={6}> <Typography variant="caption" color="text.secondary">Supplier **</Typography> <FormTextField name="supplier" value={formValues.supplier} onChange={handleInputChange} /> </Grid>

                            <Grid item xs={12}> <Typography variant="caption" color="text.secondary">Expense Head **</Typography> <FormTextField select name="expenseHead" value={formValues.expenseHead} onChange={handleInputChange}><MenuItem value="office">Office Supplies</MenuItem></FormTextField> </Grid>

                            <Grid item xs={12}> <Typography variant="caption" color="text.secondary">Narration / Description</Typography> <TextField fullWidth name="narration" value={formValues.narration} onChange={handleInputChange} multiline rows={3} variant="outlined" sx={{backgroundColor: 'white', borderRadius: 2}} /> </Grid>

                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">Total Amount</Typography> <FormTextField type="number" name="totalAmount" value={formValues.totalAmount} onChange={handleInputChange} /> </Grid>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">GST %</Typography> <FormTextField type="number" name="gstPercentage" value={formValues.gstPercentage} onChange={handleInputChange} /> </Grid>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">GST Amount</Typography> <FormTextField type="number" name="gstAmount" value={formValues.gstAmount} InputProps={{ readOnly: true }} /> </Grid>
                            <Grid item xs={6} md={3}> <Typography variant="caption" color="text.secondary">Net Amount</Typography> <FormTextField type="number" name="netAmount" value={formValues.netAmount} InputProps={{ readOnly: true }} /> </Grid>
                         </Grid>
                     </Paper>
                </Grid>
            </Grid>
         </Box>
    );
};

const pillButtonStyles = { borderRadius: '50px', textTransform: 'none', px:3, py: 1.5, backgroundColor: '#cddc39', color: 'black', '&:hover': { backgroundColor: '#c0ca33' }};
const TopupView = ({ onBack }) => {
    const [entryType, setEntryType] = useState('cash');
    const [formValues, setFormValues] = useState({
        date: '',
        receiptAmount: '',
        cashAccount: '',
        note: '',
        cashReceiptFrom: '',
        cashReceiptVoucherNo: '',
        contraAccount: '',
        contraVoucherNo: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const StyledPillTextField = (props) => (
         <TextField
            variant="standard"
            fullWidth
            sx={{
                '& .MuiInputBase-root': { backgroundColor: '#f5f5f5', borderRadius: '50px', px: 2, py: 1 },
                '& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInput-underline:hover:not(.Mui-disabled):before': {
                    borderBottom: 'none',
                },
            }}
            {...props}
        />
    );

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h5" fontWeight="bold">Cash Receipt Voucher Form</Typography>
                <Button onClick={onBack} startIcon={<CloseIcon />} sx={{color: 'text.secondary', textTransform: 'none'}}>Quick Shortcut</Button>
            </Box>
            <Grid container spacing={4} alignItems="flex-start">
                 {/* Left Column */}
                 <Grid item xs={12} md={6}>
                    <Grid container spacing={3} direction="column">
                        <Grid item><Typography variant="subtitle2" color="text.secondary">Date</Typography><StyledPillTextField name="date" value={formValues.date} onChange={handleInputChange} type="date" InputProps={{startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment>}} /></Grid>
                        <Grid item><Typography variant="subtitle2" color="text.secondary">Receipt Amount</Typography><StyledPillTextField name="receiptAmount" value={formValues.receiptAmount} onChange={handleInputChange} type="number" /></Grid>
                        <Grid item><Typography variant="subtitle2" color="text.secondary">Cash Account</Typography><StyledPillTextField name="cashAccount" value={formValues.cashAccount} onChange={handleInputChange} /></Grid>
                        <Grid item><Typography variant="subtitle2" color="text.secondary">Note</Typography><TextField fullWidth name="note" value={formValues.note} onChange={handleInputChange} multiline rows={4} sx={{'& .MuiOutlinedInput-root': { borderRadius: '20px', backgroundColor: '#f5f5f5' }}} /></Grid>
                    </Grid>
                 </Grid>
                 {/* Right Column */}
                 <Grid item xs={12} md={6}>
                     <Grid container spacing={3} direction="column">
                        <Grid item>
                             <Typography variant="subtitle2" gutterBottom fontWeight="medium">Entry Type</Typography>
                             <Box display="flex" gap={2}>
                                <Button fullWidth variant={entryType === 'cash' ? "contained" : "outlined"} onClick={() => setEntryType('cash')} sx={{...pillButtonStyles, backgroundColor: entryType === 'cash' ? '#cddc39' : 'transparent', borderColor: '#cddc39', color: 'black'}}>CASH RECEIPT <CheckCircleIcon fontSize="small" sx={{ ml: 1, visibility: entryType === 'cash' ? 'visible' : 'hidden' }} /></Button>
                                <Button fullWidth variant={entryType === 'contra' ? "contained" : "outlined"} onClick={() => setEntryType('contra')} sx={{...pillButtonStyles, backgroundColor: entryType === 'contra' ? '#cddc39' : 'transparent', borderColor: '#cddc39', color: 'black'}}>CONTRA ENTRY</Button>
                             </Box>
                        </Grid>
                        {entryType === 'cash' ?
                            <>
                                <Grid item><Typography variant="subtitle2" color="text.secondary">Cash Receipt from</Typography><StyledPillTextField select name="cashReceiptFrom" value={formValues.cashReceiptFrom} onChange={handleInputChange}><MenuItem value=""><em>None</em></MenuItem><MenuItem value="1">Option 1</MenuItem></StyledPillTextField></Grid>
                                <Grid item><Typography variant="subtitle2" color="text.secondary">Cash Receipt Vocuer No.</Typography><Box display="flex" alignItems="center" gap={1}><IconButton size="small"><SyncIcon /></IconButton><StyledPillTextField name="cashReceiptVoucherNo" value={formValues.cashReceiptVoucherNo} onChange={handleInputChange} /></Box></Grid>
                            </>
                            :
                            <>
                                <Grid item><Typography variant="subtitle2" color="text.secondary">Contra Accounts</Typography><StyledPillTextField select name="contraAccount" value={formValues.contraAccount} onChange={handleInputChange}><MenuItem value=""><em>None</em></MenuItem><MenuItem value="1">Account 1</MenuItem></StyledPillTextField></Grid>
                                <Grid item><Typography variant="subtitle2" color="text.secondary">Contra Voucher No.</Typography><StyledPillTextField name="contraVoucherNo" value={formValues.contraVoucherNo} onChange={handleInputChange} /></Grid>
                            </>
                        }
                    </Grid>
                 </Grid>
                 <Grid item xs={12} sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="contained" size="large" sx={{ borderRadius: '50px', px: 8, backgroundColor: '#212121', color: 'white', '&:hover': { backgroundColor: 'black'} }}>Topup</Button>
                 </Grid>
            </Grid>
        </Paper>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('Cash');
    const [view, setView] = useState('dashboard');
    const [isAddAccountOpen, setAddAccountOpen] = useState(false);
    const TABS = ['Overview', 'Bank', 'Credit Card', 'Cheque', 'Cash', 'Loan', 'Wallet'];

    const renderContent = () => {
        switch(view) {
            case 'statement': return <StatementView onBack={() => setView('dashboard')} onAddExpense={() => setView('addExpense')} onTopup={() => setView('topup')} />;
            case 'addExpense': return <AddExpenseView onBack={() => setView('statement')} />;
            case 'topup': return <TopupView onBack={() => setView('statement')} />;
            default: return <DashboardView onViewStatement={() => setView('statement')} onAddAccount={() => setAddAccountOpen(true)} />;
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, backgroundColor: 'white' }}>
             <AddAccountModal open={isAddAccountOpen} onClose={() => setAddAccountOpen(false)} />
             <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mb={5}>
                {TABS.map(tab => (
                    <Button key={tab} variant="contained" disableElevation onClick={() => setActiveTab(tab)}
                        sx={{ borderRadius: '50px', textTransform: 'none', px: 3, py: 1.5, fontWeight: 'normal', fontSize: '1rem',
                            backgroundColor: activeTab === tab ? '#cddc39' : '#e0e0e0', color: 'black', '&:hover': { backgroundColor: activeTab === tab ? '#c0ca33' : '#d5d5d5' }
                        }}
                    >{tab}</Button>
                ))}
            </Box>
            {renderContent()}
        </Container>
    );
}
