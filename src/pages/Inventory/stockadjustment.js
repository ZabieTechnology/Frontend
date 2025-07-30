import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// --- INLINE SVG ICONS ---
const AddCircleOutline = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);
const DeleteOutline = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);


// --- THEME DEFINITION ---
const modernTheme = createTheme({
    palette: {
        primary: { main: '#007aff' },
        secondary: { main: '#6c757d' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#1c1c1e', secondary: '#6c757d' },
        success: { main: '#4caf50' },
        error: { main: '#d32f2f' },
        info: { main: '#2196f3' },
        warning: { main: '#ff9800' }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        }
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 'bold',
                    backgroundColor: '#f1f3f4',
                }
            }
        }
    },
});

// Helper to get today's date in YYYY-MM-DD format
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Mock database of products with cost
const productDatabase = [
    { sku: 'PROD-001', name: 'Wireless Mouse', stock: 60, cost: 20.50 },
    { sku: 'PROD-002', name: 'USB-C Cable', stock: 150, cost: 7.99 },
    { sku: 'PROD-003', name: 'Bluetooth Keyboard', stock: 75, cost: 45.00 },
    { sku: 'PROD-004', name: '1TB SSD Drive', stock: 40, cost: 99.99 },
    { sku: 'PROD-005', name: '27-inch 4K Monitor', stock: 25, cost: 349.50 },
];


// Main App Component
const App = () => {
    // State for the voucher number
    const [stVoucherNo, setStVoucherNo] = useState('');

    // State for a list of new adjustments to be added
    const [newAdjustments, setNewAdjustments] = useState([
        { id: Date.now(), sku: '', productName: '', currentStock: 0, newQuantity: 0, reason: '', notes: '', adjustmentDate: getTodayDateString(), debitAccountHead: '', creditAccountHead: '' }
    ]);

    // State for error message
    const [errorMessage, setErrorMessage] = useState('');

    // State for adjustment history (the "database")
    const [adjustmentHistory, setAdjustmentHistory] = useState([
        { id: 1, stVoucherNo: 'ST-2023-001', sku: 'PROD-001', productName: 'Wireless Mouse', currentStock: 60, newQuantity: 55, difference: -5, valueDifference: -102.50, reason: 'Damaged Goods', debitAccountHead: 'COGS - Damaged Goods', creditAccountHead: 'Inventory', notes: 'Water damage', adjustmentDate: '2023-10-26', submissionTimestamp: new Date('2023-10-26T10:00:00').toLocaleString() },
        { id: 2, stVoucherNo: 'ST-2023-002', sku: 'PROD-002', productName: 'USB-C Cable', currentStock: 150, newQuantity: 200, difference: 50, valueDifference: 399.50, reason: 'Stocktake Correction', debitAccountHead: 'Inventory', creditAccountHead: 'Inventory Write-Off', notes: 'Found extra box', adjustmentDate: '2023-10-25', submissionTimestamp: new Date('2023-10-26T11:30:00').toLocaleString() }
    ]);

    // Handler to update a field in one of the new adjustment rows
    const handleUpdateNewAdjustment = (id, field, value) => {
        setNewAdjustments(currentAdjustments =>
            currentAdjustments.map(adj =>
                adj.id === id ? { ...adj, [field]: value } : adj
            )
        );
    };

    const handleProductSelect = (id, selectedProduct) => {
        setNewAdjustments(currentAdjustments =>
            currentAdjustments.map(adj => {
                if (adj.id === id) {
                    if (selectedProduct) {
                        return {
                            ...adj,
                            sku: selectedProduct.sku,
                            productName: selectedProduct.name,
                            currentStock: selectedProduct.stock,
                            newQuantity: selectedProduct.stock, // Default new qty to current stock
                        };
                    } else {
                        // Handle case where selection is cleared
                        return { ...adj, sku: '', productName: '', currentStock: 0, newQuantity: 0 };
                    }
                }
                return adj;
            })
        );
    };

    // Handler to add a new blank adjustment row to the form
    const addNewAdjustmentRow = () => {
        setNewAdjustments(currentAdjustments => [
            ...currentAdjustments,
            { id: Date.now(), sku: '', productName: '', currentStock: 0, newQuantity: 0, reason: '', notes: '', adjustmentDate: getTodayDateString(), debitAccountHead: '', creditAccountHead: '' }
        ]);
    };

    // Handler to remove an adjustment row from the form
    const removeNewAdjustmentRow = (id) => {
        setNewAdjustments(currentAdjustments =>
            currentAdjustments.filter(adj => adj.id !== id)
        );
    };

    // Handler for submitting all new adjustments
    const handleSubmitAllAdjustments = () => {
        if (!stVoucherNo) {
            setErrorMessage('ST Transfer Voucher No. is required.');
            return;
        }

        const processedAdjustments = [];
        // Validate each row
        for (const adj of newAdjustments) {
            if (!adj.sku || !adj.productName || !adj.reason || !adj.adjustmentDate || !adj.debitAccountHead || !adj.creditAccountHead) {
                setErrorMessage('For each row, all fields including Product, Debit/Credit Accounts, Reason, and Adjustment Date are required.');
                return;
            }
            if (adj.debitAccountHead === adj.creditAccountHead) {
                setErrorMessage('Debit and Credit accounts cannot be the same for a transaction.');
                return;
            }
            if (adj.currentStock === adj.newQuantity) {
                 setErrorMessage(`No change for ${adj.sku}. Current Stock and New Quantity cannot be the same.`);
                 return;
            }

            const product = productDatabase.find(p => p.sku === adj.sku);
            const difference = adj.newQuantity - adj.currentStock;
            const valueDifference = product ? difference * product.cost : 0;

            processedAdjustments.push({
                ...adj,
                id: Date.now() + Math.random(),
                stVoucherNo,
                difference,
                valueDifference,
                submissionTimestamp: new Date().toLocaleString()
            });
        }

        if (processedAdjustments.length === 0) {
             setErrorMessage('No valid adjustments to submit.');
             return;
        }

        setAdjustmentHistory(prevHistory => [...processedAdjustments, ...prevHistory]);

        // Reset the form to one blank row and clear any errors
        setNewAdjustments([{ id: Date.now(), sku: '', productName: '', currentStock: 0, newQuantity: 0, reason: '', notes: '', adjustmentDate: getTodayDateString(), debitAccountHead: '', creditAccountHead: '' }]);
        setStVoucherNo('');
        setErrorMessage('');
    };

    const DifferenceCell = ({ value, isCurrency = false }) => {
        const isPositive = value > 0;
        const color = isPositive ? 'success.main' : 'error.main';
        const symbol = isPositive ? '+' : '';
        const formattedValue = isCurrency ? `$${Math.abs(value).toFixed(2)}` : value;

        return (
            <Typography sx={{ color, fontWeight: 'bold' }}>
                {symbol}{formattedValue}
            </Typography>
        );
    };

    const accountHeads = [
        "Inventory",
        "COGS - Damaged Goods",
        "Inventory Write-Off",
        "Marketing & Promotions Expense",
        "Inventory Shrinkage",
        "Sales Return Clearing",
        "Purchase Clearing Account"
    ];

    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 5 }}>
                <Container maxWidth="xl">
                    <Paper sx={{ p: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
                            <Grid item>
                                <Typography variant="h4" gutterBottom color="primary">
                                    Stock Adjustments
                                </Typography>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="ST Transfer Voucher No."
                                    variant="outlined"
                                    size="small"
                                    value={stVoucherNo}
                                    onChange={(e) => setStVoucherNo(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            Add one or more adjustments below. The difference will be calculated automatically.
                        </Typography>

                        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2, mb: 2 }}>
                            {newAdjustments.map((adj, index) => {
                                const difference = adj.newQuantity - adj.currentStock;
                                return (
                                <Grid container spacing={1} alignItems="center" key={adj.id} sx={{ mb: index !== newAdjustments.length - 1 ? 2 : 0 }}>
                                    <Grid item xs={12} md={1.5}><Autocomplete options={productDatabase} getOptionLabel={(option) => option.sku} value={productDatabase.find(p => p.sku === adj.sku) || null} onChange={(event, newValue) => { handleProductSelect(adj.id, newValue); }} renderInput={(params) => <TextField {...params} label="SKU" variant="outlined" size="small" />} /></Grid>
                                    <Grid item xs={12} md={1.5}><TextField fullWidth label="Product Name" value={adj.productName} variant="outlined" size="small" InputProps={{ readOnly: true }} /></Grid>
                                    <Grid item xs={6} md={0.75}><TextField fullWidth label="Current" type="number" value={adj.currentStock} variant="outlined" size="small" InputProps={{ readOnly: true }} /></Grid>
                                    <Grid item xs={6} md={0.75}><TextField fullWidth label="New" type="number" value={adj.newQuantity} onChange={(e) => handleUpdateNewAdjustment(adj.id, 'newQuantity', parseInt(e.target.value, 10) || 0)} variant="outlined" size="small" /></Grid>
                                    <Grid item xs={6} md={0.5}><Box sx={{textAlign: 'center'}}><DifferenceCell value={difference} /></Box></Grid>
                                    <Grid item xs={6} md={1.25}><TextField fullWidth label="Adj. Date" type="date" value={adj.adjustmentDate} onChange={(e) => handleUpdateNewAdjustment(adj.id, 'adjustmentDate', e.target.value)} variant="outlined" size="small" InputLabelProps={{ shrink: true }} /></Grid>
                                    <Grid item xs={12} md={1.25}><FormControl fullWidth variant="outlined" size="small"><InputLabel>Debit Acct</InputLabel><Select value={adj.debitAccountHead} onChange={(e) => handleUpdateNewAdjustment(adj.id, 'debitAccountHead', e.target.value)} label="Debit Acct">{accountHeads.map(ah => <MenuItem key={ah} value={ah}>{ah}</MenuItem>)}</Select></FormControl></Grid>
                                    <Grid item xs={12} md={1.25}><FormControl fullWidth variant="outlined" size="small"><InputLabel>Credit Acct</InputLabel><Select value={adj.creditAccountHead} onChange={(e) => handleUpdateNewAdjustment(adj.id, 'creditAccountHead', e.target.value)} label="Credit Acct">{accountHeads.map(ah => <MenuItem key={ah} value={ah}>{ah}</MenuItem>)}</Select></FormControl></Grid>
                                    <Grid item xs={12} md={1}><FormControl fullWidth variant="outlined" size="small"><InputLabel>Reason</InputLabel><Select value={adj.reason} onChange={(e) => handleUpdateNewAdjustment(adj.id, 'reason', e.target.value)} label="Reason"><MenuItem value="Stocktake Correction">Stocktake</MenuItem><MenuItem value="Damaged Goods">Damaged</MenuItem><MenuItem value="Returned Item">Return</MenuItem><MenuItem value="Promotion">Promotion</MenuItem><MenuItem value="Other">Other</MenuItem></Select></FormControl></Grid>
                                    <Grid item xs={12} md={1}><TextField fullWidth label="Notes" value={adj.notes} onChange={(e) => handleUpdateNewAdjustment(adj.id, 'notes', e.target.value)} variant="outlined" size="small" /></Grid>
                                    <Grid item xs={12} md={0.75}><IconButton onClick={() => removeNewAdjustmentRow(adj.id)} color="error" disabled={newAdjustments.length <= 1}><DeleteOutline /></IconButton></Grid>
                                </Grid>
                            )})}
                        </Box>

                        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

                        <Grid container spacing={2}>
                            <Grid item><Button variant="outlined" onClick={addNewAdjustmentRow} startIcon={<AddCircleOutline />}>Add Another Product</Button></Grid>
                            <Grid item><Button variant="contained" color="primary" onClick={handleSubmitAllAdjustments}>Submit All Adjustments</Button></Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h5" gutterBottom>Adjustment History</Typography>
                        <TableContainer>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Voucher No.</TableCell>
                                        <TableCell>Adj. Date</TableCell>
                                        <TableCell>SKU</TableCell>
                                        <TableCell>Product Name</TableCell>
                                        <TableCell align="right">Prev. Stock</TableCell>
                                        <TableCell align="center">Difference</TableCell>
                                        <TableCell align="right">New Stock</TableCell>
                                        <TableCell align="center">Value Diff. ($)</TableCell>
                                        <TableCell>Debit Account</TableCell>
                                        <TableCell>Credit Account</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Notes</TableCell>
                                        <TableCell>Entry Created</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {adjustmentHistory.map((adj) => (
                                        <TableRow key={adj.id} hover>
                                            <TableCell>{adj.stVoucherNo}</TableCell>
                                            <TableCell>{adj.adjustmentDate}</TableCell>
                                            <TableCell>{adj.sku}</TableCell>
                                            <TableCell>{adj.productName}</TableCell>
                                            <TableCell align="right">{adj.currentStock}</TableCell>
                                            <TableCell align="center"><DifferenceCell value={adj.difference} /></TableCell>
                                            <TableCell align="right">{adj.newQuantity}</TableCell>
                                            <TableCell align="center"><DifferenceCell value={adj.valueDifference} isCurrency={true} /></TableCell>
                                            <TableCell>{adj.debitAccountHead}</TableCell>
                                            <TableCell>{adj.creditAccountHead}</TableCell>
                                            <TableCell>{adj.reason}</TableCell>
                                            <TableCell sx={{ maxWidth: 200, whiteSpace: 'normal', wordWrap: 'break-word' }}>{adj.notes}</TableCell>
                                            <TableCell>{adj.submissionTimestamp}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App;