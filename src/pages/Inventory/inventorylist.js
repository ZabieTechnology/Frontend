import React, { useState, useEffect, useCallback } from 'react';
import {
    Autocomplete,
    Box, Grid, Paper, Typography, TextField, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton, Divider, CircularProgress, Alert,
    InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Tooltip,
    Checkbox,
    Pagination
} from '@mui/material';
import {
    Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, ArrowBack as ArrowBackIcon,
    Palette as PaletteIcon, Payment as PaymentIcon, PersonAddAlt1 as PersonAddAlt1Icon,
    PictureAsPdf as PictureAsPdfIcon, History as HistoryIcon, Close as CloseIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    MoreVert as MoreVertIcon,
    Visibility,
    Edit
} from '@mui/icons-material';
import { format as formatDateFns, isValid as isValidDateFns, startOfDay, addDays } from 'date-fns';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const createData = (id, name, code, category, qty, sellingPrice, fullItem) => {
    return { id, name, code, category, qty, sellingPrice, selected: false, fullItem };
};

// ==========================================================================
// ===               Confirmation Dialog Hook & Component                 ===
// ==========================================================================
function ConfirmationDialog({ open, options, onCancel, onConfirm }) {
    const { title, message } = options;
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle>{title || 'Confirm Action'}</DialogTitle>
            <DialogContent><Typography>{message}</Typography></DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained">Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}

const useConfirmationDialog = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogOptions, setDialogOptions] = useState({ title: '', message: '', onConfirm: () => {} });

    const confirm = (options) => {
        setDialogOptions(options);
        setDialogOpen(true);
    };

    const onConfirm = () => {
        if (dialogOptions.onConfirm) {
            dialogOptions.onConfirm();
        }
        setDialogOpen(false);
    };

    const onCancel = () => {
        setDialogOpen(false);
    };

    const ConfirmationDialogComponent = () => (
        <ConfirmationDialog
            open={dialogOpen}
            options={dialogOptions}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );

    return { confirm, ConfirmationDialog: ConfirmationDialogComponent };
};


// ==========================================================================
// ===               Create/Edit Item Modal Component                     ===
// ==========================================================================
const renderModalSectionTitle = (title) => (
    <Box sx={{ bgcolor: '#e5e7eb', p: 1, borderRadius: '4px', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#374151' }}>
            {title}
        </Typography>
    </Box>
);

function CreateItemModal({ open, onClose, onSave, itemToEdit, isViewMode }) {
    const [itemType, setItemType] = useState('product');
    const [saleWithTax, setSaleWithTax] = useState(true);
    const [category, setCategory] = useState('');
    const [itemName, setItemName] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [gstRate, setGstRate] = useState('');
    const [cessRate, setCessRate] = useState('');
    const [cessAmount, setCessAmount] = useState('');
    const [measuringUnit, setMeasuringUnit] = useState('');
    const [warehouse, setWarehouse] = useState('');
    const [itemCode, setItemCode] = useState('');
    const [hsnCode, setHsnCode] = useState('');
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [lowStockAlertCount, setLowStockAlertCount] = useState('');
    const [openingStockQty, setOpeningStockQty] = useState('');
    const [pricePerItem, setPricePerItem] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [mfgDate, setMfgDate] = useState('');
    const [itemSubCategory, setItemSubCategory] = useState('');
    const [batchCode, setBatchCode] = useState('');
    const [barcode, setBarcode] = useState(null);
    const [categories, setCategories] = useState([]);
    const [itemSubCategories, setItemSubCategories] = useState([]);
    const [measuringUnits, setMeasuringUnits] = useState([]);
    const [gstRates, setGstRates] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    const fetchDropdownData = useCallback(async (type, setter) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=${type}&limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setter(response.data.data.map(item => ({ value: item.value, label: item.label, _id: item._id })));
            }
        } catch (err) { console.error(`Error fetching ${type}:`, err); }
    }, [API_BASE_URL]);

    const fetchGstRates = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/gst-rates`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                const fetchedTaxes = response.data.data.filter(tax => tax.head && tax.head.toLowerCase().includes('output')).map(tax => ({_id: tax._id, value: tax.taxRate, label: tax.taxName || `Tax @ ${parseFloat(tax.taxRate) || 0}%`}));
                setGstRates(fetchedTaxes);
            }
        } catch (err) { console.error("Error fetching GST rates:", err); }
    }, [API_BASE_URL]);

    useEffect(() => {
        if (open) {
            fetchDropdownData('Item_Category', setCategories);
            fetchDropdownData('Item_sub_Category', setItemSubCategories);
            fetchDropdownData('Measuring_Unit', setMeasuringUnits);
            fetchDropdownData('Warehouse', setWarehouses);
            fetchGstRates();
        }
    }, [open, fetchDropdownData, fetchGstRates]);

    useEffect(() => {
        const resetForm = () => {
            setItemType('product'); setSaleWithTax(true); setCategory(''); setItemName(''); setSalePrice('');
            setGstRate(''); setCessRate(''); setCessAmount(''); setMeasuringUnit(''); setWarehouse(''); setItemCode(''); setHsnCode('');
            setAsOfDate(new Date().toISOString().split('T')[0]); setDescription(''); setLowStockAlertCount('');
            setOpeningStockQty(''); setPricePerItem('');
            setSerialNo(''); setExpiryDate(''); setMfgDate(''); setItemSubCategory(''); setBatchCode('');
            setBarcode(null);
        };

        if (open) {
            if (itemToEdit) {
                setItemType(itemToEdit.itemType || 'product');
                setSaleWithTax(itemToEdit.saleWithTax || true);
                setCategory(itemToEdit.category || '');
                setItemName(itemToEdit.itemName || '');
                setSalePrice(itemToEdit.salePrice || '');
                setGstRate(itemToEdit.gstRate || '');
                setCessRate(itemToEdit.cessRate || '');
                setCessAmount(itemToEdit.cessAmount || '');
                setMeasuringUnit(itemToEdit.measuringUnit || '');
                setWarehouse(itemToEdit.warehouse || '');
                setItemCode(itemToEdit.itemCode || '');
                setHsnCode(itemToEdit.hsnCode || '');
                setAsOfDate(itemToEdit.asOfDate ? itemToEdit.asOfDate.split('T')[0] : new Date().toISOString().split('T')[0]);
                setDescription(itemToEdit.description || '');
                setLowStockAlertCount(itemToEdit.lowStockAlertCount || '');
                setSerialNo(itemToEdit.serialNo || '');
                setExpiryDate(itemToEdit.expiryDate ? itemToEdit.expiryDate.split('T')[0] : '');
                setMfgDate(itemToEdit.mfgDate ? itemToEdit.mfgDate.split('T')[0] : '');
                setItemSubCategory(itemToEdit.itemSubCategory || '');
                setBatchCode(itemToEdit.batchCode || '');
                setOpeningStockQty(''); setPricePerItem('');
                setBarcode(null);
            } else {
                resetForm();
            }
        }
    }, [itemToEdit, open]);

    const generateBarcode = () => {
        const value = serialNo || `ITEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        if (window.JsBarcode) {
            const canvas = document.createElement('canvas');
            try {
                window.JsBarcode(canvas, value, {
                    format: "CODE128",
                    displayValue: true,
                    fontSize: 18,
                    textMargin: 0,
                    margin: 10
                });
                setBarcode(canvas.toDataURL("image/png"));
            } catch (e) {
                console.error("Barcode generation failed:", e);
                alert("Failed to generate barcode. The value may contain invalid characters.");
            }
        } else {
            alert("Barcode library not loaded yet. Please try again in a moment.");
        }
    };

    const handleSave = async () => {
        if (!itemName || !salePrice) {
            alert('Please fill in at least Item Name and Sale Price.');
            return;
        }
        const payload = {
            itemType, saleWithTax, category, itemName,
            salePrice: parseFloat(salePrice) || 0,
            gstRate: parseFloat(gstRate) || 0,
            cessRate: parseFloat(cessRate) || 0,
            cessAmount: parseFloat(cessAmount) || 0,
            measuringUnit, warehouse, itemCode, hsnCode, asOfDate, description,
            lowStockAlertCount: itemType === 'product' ? (parseInt(lowStockAlertCount) || 0) : undefined,
            openingStockQty: itemType === 'product' ? (parseFloat(openingStockQty) || 0) : undefined,
            pricePerItem: itemType === 'product' ? (parseFloat(pricePerItem) || 0) : undefined,
            serialNo, expiryDate, mfgDate, itemSubCategory, batchCode
        };
        onSave(payload, itemToEdit ? itemToEdit._id : null);
    };

    const totalValue = (parseFloat(openingStockQty) || 0) * (parseFloat(pricePerItem) || 0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', borderBottom: '1px solid #e0e0e0' }}>
                 {isViewMode ? 'View Item' : (itemToEdit ? 'Edit Item' : 'Create New Item')}
                 <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3, backgroundColor: '#f9fafb' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        {renderModalSectionTitle("Basic Details")}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, my: 2 }}>
                            <Typography
                                onClick={() => !isViewMode && setItemType('product')}
                                sx={{
                                    fontWeight: 'bold',
                                    color: itemType === 'product' ? 'success.main' : 'text.secondary',
                                    cursor: isViewMode ? 'default' : 'pointer',
                                    transition: 'color 0.2s'
                                }}
                            >
                                Product
                            </Typography>
                            <Switch
                                checked={itemType === 'service'}
                                onChange={(e) => !isViewMode && setItemType(e.target.checked ? 'service' : 'product')}
                                disabled={isViewMode}
                            />
                            <Typography
                                onClick={() => !isViewMode && setItemType('service')}
                                sx={{
                                    fontWeight: 'bold',
                                    color: itemType === 'service' ? 'text.primary' : 'text.secondary',
                                    cursor: isViewMode ? 'default' : 'pointer',
                                    transition: 'color 0.2s'
                                }}
                            >
                                Service
                            </Typography>
                        </Box>
                        <TextField fullWidth margin="dense" size="small" label="Item Name" value={itemName} onChange={(e) => setItemName(e.target.value)} disabled={isViewMode} />
                        <FormControl fullWidth margin="dense" size="small" disabled={isViewMode}><InputLabel>Category</InputLabel><Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>{categories.map((cat) => ( <MenuItem key={cat._id} value={cat.value}>{cat.label}</MenuItem> ))}</Select></FormControl>
                        <FormControl fullWidth margin="dense" size="small" disabled={isViewMode}><InputLabel>Item Sub Category</InputLabel><Select value={itemSubCategory} label="Item Sub Category" onChange={(e) => setItemSubCategory(e.target.value)}>{itemSubCategories.map((subCat) => ( <MenuItem key={subCat._id} value={subCat.value}>{subCat.label}</MenuItem> ))}</Select></FormControl>
                        <TextField fullWidth margin="dense" size="small" label="Sale Price" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} disabled={isViewMode}/>
                        <FormControl fullWidth margin="dense" size="small" disabled={isViewMode}><InputLabel>GST Tax Rate (%)</InputLabel><Select value={gstRate} label="GST Tax Rate (%)" onChange={(e) => setGstRate(e.target.value)}>{gstRates.map((rate) => ( <MenuItem key={rate._id} value={rate.value}>{rate.label}</MenuItem> ))}</Select></FormControl>
                        <TextField fullWidth margin="dense" size="small" label="CESS Rate (%)" type="number" value={cessRate} onChange={(e) => setCessRate(e.target.value)} disabled={isViewMode}/>
                        <TextField fullWidth margin="dense" size="small" label="Fixed CESS Per Unit" type="number" value={cessAmount} onChange={(e) => setCessAmount(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} disabled={isViewMode}/>
                        <FormControl fullWidth margin="dense" size="small" disabled={isViewMode}><InputLabel>Measuring Unit</InputLabel><Select value={measuringUnit} label="Measuring Unit" onChange={(e) => setMeasuringUnit(e.target.value)}>{measuringUnits.map((unit) => ( <MenuItem key={unit._id} value={unit.value}>{unit.label}</MenuItem>))}</Select></FormControl>
                        <FormControl fullWidth margin="dense" size="small" disabled={isViewMode}><InputLabel>Warehouse</InputLabel><Select value={warehouse} label="Warehouse" onChange={(e) => setWarehouse(e.target.value)}>{warehouses.map((wh) => ( <MenuItem key={wh._id} value={wh.value}>{wh.label}</MenuItem> ))}</Select></FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                         {renderModalSectionTitle("Stock & Other Details")}
                         <TextField fullWidth margin="dense" size="small" label="Item Code" value={itemCode} onChange={(e) => setItemCode(e.target.value)} disabled={isViewMode}/>
                         <TextField fullWidth margin="dense" size="small" label="HSN Code" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} disabled={isViewMode}/>
                         <TextField fullWidth margin="dense" size="small" label="Batch Code" value={batchCode} onChange={(e) => setBatchCode(e.target.value)} disabled={isViewMode} />
                        <Grid container spacing={1} alignItems="flex-end">
                            <Grid item xs={9}>
                                <TextField fullWidth margin="dense" size="small" label="Serial No" value={serialNo} onChange={(e) => setSerialNo(e.target.value)} disabled={isViewMode}/>
                            </Grid>
                            <Grid item xs={3}>
                                <Button onClick={generateBarcode} fullWidth variant="outlined" size="small" sx={{ mb: '8px' }} disabled={isViewMode}>Generate</Button>
                            </Grid>
                        </Grid>
                        {barcode && <Box sx={{ mt: 1, p:1, textAlign: 'center', backgroundColor: 'white', border: '1px solid #ddd' }}><img src={barcode} alt="Generated Barcode" style={{ maxWidth: '100%' }}/></Box>}
                         <TextField fullWidth margin="dense" size="small" label="Mfg Date" type="date" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} InputLabelProps={{ shrink: true }} disabled={isViewMode}/>
                         <TextField fullWidth margin="dense" size="small" label="Expiry Date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} InputLabelProps={{ shrink: true }} disabled={isViewMode}/>

                        {itemType === 'product' && (
                            <>
                                <TextField fullWidth margin="dense" size="small" label="Low Stock Alert Count" type="number" value={lowStockAlertCount} onChange={(e) => setLowStockAlertCount(e.target.value)} disabled={isViewMode}/>
                                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', opacity: itemToEdit || isViewMode ? 0.6 : 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Opening Stock</Typography>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={4}><TextField label="QTY" type="number" value={openingStockQty} onChange={(e) => setOpeningStockQty(e.target.value)} size="small" fullWidth disabled={!!itemToEdit || isViewMode}/></Grid>
                                        <Grid item xs={4}><TextField label="Price/Item" type="number" value={pricePerItem} onChange={(e) => setPricePerItem(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small" fullWidth disabled={!!itemToEdit || isViewMode}/></Grid>
                                        <Grid item xs={4}><TextField label="Total Value" value={totalValue.toFixed(2)} disabled InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small" fullWidth /></Grid>
                                    </Grid>
                                </Box>
                                <TextField fullWidth margin="dense" size="small" label="As of Date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} disabled={!!itemToEdit || isViewMode}/>
                            </>
                        )}
                        <TextField fullWidth margin="dense" multiline rows={2} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mt: 2 }} disabled={isViewMode}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
                {!isViewMode && <Button onClick={handleSave} variant="contained" color="primary">Save Item</Button>}
            </DialogActions>
        </Dialog>
    );
}

function StockTransactionModal({ open, onClose, transactions, itemName }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Stock Transaction History: {itemName}</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Price/Item</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Recorded By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.length > 0 ? transactions.map(tx => (
                                <TableRow key={tx._id}>
                                    <TableCell>{new Date(tx.transaction_date).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography color={tx.transaction_type === 'IN' ? 'success.main' : 'error.main'}>
                                            {tx.transaction_type}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{tx.quantity}</TableCell>
                                    <TableCell align="right">{tx.price_per_item ? `₹${tx.price_per_item.toFixed(2)}` : 'N/A'}</TableCell>
                                    <TableCell>{tx.notes}</TableCell>
                                    <TableCell>{tx.recorded_by}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} align="center">No transactions found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}


function TransactionPage() {
    const [tableRows, setTableRows] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [filterCategories, setFilterCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openTransactionModal, setOpenTransactionModal] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [selectedItemForTx, setSelectedItemForTx] = useState(null);

    const { confirm, ConfirmationDialog } = useConfirmationDialog();
    const API_BASE_URL = process.env.REACT_APP_API_URL || '';

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: ITEMS_PER_PAGE, category: categoryFilter };
            const response = await axios.get(`${API_BASE_URL}/api/inventory`, { params, withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                const formattedRows = response.data.data.map(item => createData(item._id, item.itemName, item.itemCode, item.category, `${item.currentStock || 0} ${item.measuringUnit || ''}`, `₹${(item.salePrice || 0).toFixed(2)}`, item));
                setTableRows(formattedRows);
                setTotalItems(response.data.total);
            }
        } catch (error) { console.error("Failed to fetch items:", error); }
        finally { setLoading(false); }
    }, [currentPage, API_BASE_URL, categoryFilter]);

    const fetchFilterCategories = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dropdown?type=Item_Category&limit=-1`, { withCredentials: true });
            if (response.data && Array.isArray(response.data.data)) {
                setFilterCategories(response.data.data.map(item => ({ value: item.value, label: item.label, _id: item._id })));
            }
        } catch (err) { console.error(`Error fetching Item_Category:`, err); }
    }, [API_BASE_URL]);

    useEffect(() => { fetchItems(); }, [fetchItems]);
    useEffect(() => { fetchFilterCategories(); }, [fetchFilterCategories]);

    const handleOpenCreateModal = () => { setItemToEdit(null); setIsViewMode(false); setOpenCreateModal(true); };
    const handleViewItem = (item) => { setItemToEdit(item.fullItem); setIsViewMode(true); setOpenCreateModal(true); };
    const handleEditItem = (item) => { setItemToEdit(item.fullItem); setIsViewMode(false); setOpenCreateModal(true); };

    const handleShowTransactions = async (item) => {
        setSelectedItemForTx(item);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory/${item.id}/stock-transactions`, { withCredentials: true });
            setTransactionHistory(response.data.data);
            setOpenTransactionModal(true);
        } catch (error) { console.error("Failed to fetch transaction history:", error); alert('Could not fetch transaction history.'); }
    };

    const executeDeleteItem = async (itemId) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/inventory/${itemId}`, { withCredentials: true });
            alert('Item deleted successfully!');
            fetchItems();
        } catch (error) { alert(`Error: ${error.response?.data?.message || error.message}`); }
    };

    const confirmDelete = (itemId, itemName) => {
        confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete "${itemName || itemId}"? This action cannot be undone.`,
            onConfirm: () => executeDeleteItem(itemId),
        });
    };

    const handleSaveItem = async (payload, itemId) => {
         try {
            const response = itemId ? await axios.put(`${API_BASE_URL}/api/inventory/${itemId}`, payload, { withCredentials: true }) : await axios.post(`${API_BASE_URL}/api/inventory`, payload, { withCredentials: true });
            if (response.data && response.data.data) {
                alert(`Item ${itemId ? 'updated' : 'saved'} successfully!`);
                setOpenCreateModal(false);
                fetchItems();
            }
        } catch (error) { alert(`Error: ${error.response?.data?.message || error.message}`); }
    };

    const handleSelectAllClick = (event) => setTableRows(rows => rows.map(r => ({...r, selected: event.target.checked})));
    const handleCheckboxClick = (event, id) => setTableRows(rows => rows.map(r => r.id === id ? {...r, selected: !r.selected} : r));
    const isSelected = (id) => tableRows.find(row => row.id === id)?.selected || false;
    const numSelected = tableRows.filter((row) => row.selected).length;
    const handleCategoryChange = (event) => { setCategoryFilter(event.target.value); setCurrentPage(1); };
    const handlePageChange = (event, value) => setCurrentPage(value);

    return (
        <Box sx={{ p: 3, backgroundColor: '#fff', minHeight: '100vh' }}>
            <ConfirmationDialog />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Paper elevation={0} sx={{ backgroundColor: '#f0fdf4', p: 1.5, borderRadius: '8px', border: '1px solid #dcfce7' }}><Typography variant="h5" component="div" sx={{ color: '#16a34a', fontWeight: 'bold' }}>$0</Typography><Typography variant="body2" sx={{ color: '#4b5563' }}>Stock Value</Typography></Paper>
                <Button variant="contained" color="secondary" sx={{ textTransform: 'none', padding: '8px 20px', borderRadius: '6px' }}>Download</Button>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Inventory Items</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TextField placeholder="Search Item" variant="outlined" size="small" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon/></InputAdornment>, sx: { borderRadius: '6px', backgroundColor: '#f8fafc'}}} sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: '200px' }} />
                    <FormControl size="small" sx={{ minWidth: 150, backgroundColor: '#f8fafc', borderRadius: '6px' }}><InputLabel>Item Category</InputLabel><Select value={categoryFilter} label="Item Category" onChange={handleCategoryChange} displayEmpty sx={{ borderRadius: '6px' }}><MenuItem value=""><em>All Categories</em></MenuItem>{filterCategories.map((cat) => ( <MenuItem key={cat._id || cat.value} value={cat.value}>{cat.label}</MenuItem> ))}</Select></FormControl>
                    <Button variant="outlined" size="small" sx={{ borderColor: '#e2e8f0', color: '#64748b', textTransform: 'none', borderRadius: '6px', backgroundColor: '#f8fafc' }}>Show Low Stock</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small" sx={{ color: '#64748b'}}><FilterListIcon /></IconButton><IconButton size="small" sx={{ color: '#64748b'}}><MoreVertIcon /></IconButton>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreateModal} sx={{ textTransform: 'none', padding: '8px 16px', borderRadius: '6px' }}>Create Item</Button>
                </Box>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px'}}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell padding="checkbox"><Checkbox color="primary" indeterminate={numSelected > 0 && numSelected < tableRows.length} checked={tableRows.length > 0 && numSelected === tableRows.length} onChange={handleSelectAllClick} size="small" /></TableCell>
                            {['Item Name', 'Item Code', 'Category', 'Stock QTY', 'Selling Price', 'Actions'].map((headCell) => (
                                <TableCell key={headCell} align={headCell === 'Actions' ? 'right' : 'left'} sx={{ fontWeight: 'bold', color: '#334155', fontSize: '0.8rem' }}>{headCell}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}><Typography>Loading...</Typography></TableCell></TableRow>
                        ) : tableRows.length > 0 ? tableRows.map((row) => (
                                <TableRow hover role="checkbox" aria-checked={isSelected(row.id)} tabIndex={-1} key={row.id} selected={isSelected(row.id)}>
                                    <TableCell padding="checkbox" onClick={(event) => handleCheckboxClick(event, row.id)}><Checkbox color="primary" checked={isSelected(row.id)} size="small"/></TableCell>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.code}</TableCell>
                                    <TableCell>{row.category}</TableCell>
                                    <TableCell>{row.qty}</TableCell>
                                    <TableCell>{row.sellingPrice}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="info" onClick={() => handleShowTransactions(row)}><HistoryIcon fontSize="small"/></IconButton>
                                        <IconButton size="small" color="default" onClick={() => handleViewItem(row)}><Visibility fontSize="small"/></IconButton>
                                        <IconButton size="small" color="primary" onClick={() => handleEditItem(row)}><Edit fontSize="small"/></IconButton>
                                        <IconButton size="small" color="error" onClick={() => confirmDelete(row.id, row.name)}><DeleteIcon fontSize="small"/></IconButton>
                                    </TableCell>
                                </TableRow>
                            )) : (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No items found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                 <Typography variant="body2" color="text.secondary">{`Showing ${tableRows.length} of ${totalItems} items`}</Typography>
                <Pagination count={Math.ceil(totalItems / ITEMS_PER_PAGE)} page={currentPage} onChange={handlePageChange} color="primary" shape="rounded" disabled={totalItems === 0}/>
            </Box>
            {openCreateModal && <CreateItemModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSave={handleSaveItem} itemToEdit={itemToEdit} isViewMode={isViewMode} />}
            {openTransactionModal && <StockTransactionModal open={openTransactionModal} onClose={() => setOpenTransactionModal(false)} transactions={transactionHistory} itemName={selectedItemForTx?.name} />}
        </Box>
    );
}

export default TransactionPage;
