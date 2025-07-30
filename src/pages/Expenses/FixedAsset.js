import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';


// --- INLINE SVG ICONS ---
const Search = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const FilterAlt = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const Tune = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 17v2M3 5v10M7 19v-4M7 3v12M11 17v-2M11 3v10M15 19v-4M15 3v12M19 17v-2M19 3v10"/></svg>
);
const Close = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const Edit = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Visibility = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const Delete = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);
const Warning = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);


// --- THEME DEFINITION ---
const modernTheme = createTheme({
    palette: {
        primary: { main: '#007aff' },
        secondary: { main: '#6c757d' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#1c1c1e', secondary: '#6c757d' },
        error: { main: '#d32f2f' },
        action: {
            view: '#3f51b5',
            edit: '#4caf50',
            delete: '#f44336',
        }
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

// Mock data for the table, this can be replaced with API data
const initialAssets = [
  { id: 1, name: 'Table', assetNumber: 'ASSET-001', purchasePrice: 252.10, purchaseDate: '2024-03-31', warrantyExpiry: '2026-03-31', assetType: 'Office Equipment', description: 'Standard office table', assetAccount: '1500 - Office Equipment', accumulatedDepreciationAccount: '1501 - Acc Dep - Office Equip', depreciationExpenseAccount: '6500 - Depreciation', depreciationStartDate: '2024-04-01', depreciationMethod: 'Straight Line', averagingMethod: 'Full Month', effectiveLife: 5, currentValue: 250.00, accumulatedDepreciation: 2.10 },
  { id: 2, name: 'Chair', assetNumber: 'ASSET-002', purchasePrice: 150.00, purchaseDate: '2024-03-31', warrantyExpiry: '2025-03-31', assetType: 'Mobile', description: 'Ergonomic office chair', assetAccount: '1500 - Office Equipment', accumulatedDepreciationAccount: '1501 - Acc Dep - Office Equip', depreciationExpenseAccount: '6500 - Depreciation', depreciationStartDate: '2024-04-01', depreciationMethod: 'Straight Line', averagingMethod: 'Full Month', effectiveLife: 3, currentValue: 148.00, accumulatedDepreciation: 2.00 },
];

// --- Confirmation Dialog for Deletion ---
const ConfirmationDialog = ({ open, onClose, onConfirm, title, content }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{display: 'flex', alignItems: 'center'}}><Warning sx={{mr: 1, color: 'warning.main'}}/> {title}</DialogTitle>
        <DialogContent><Typography variant="body2">{content}</Typography></DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained">Confirm</Button>
        </DialogActions>
    </Dialog>
);


// --- Run Depreciation Modal ---
const RunDepreciationModal = ({ isOpen, onClose, onRun, onRollback }) => {
    const [action, setAction] = useState(0); // 0 for 'run', 1 for 'rollback'
    const currentYear = new Date().getFullYear();
    const [month, setMonth] = useState(new Date().getMonth()); // 0-11
    const [year, setYear] = useState(currentYear);

    const handleAction = () => {
        if (action === 0) {
            onRun({ month, year });
        } else {
            onRollback({ month, year });
        }
        onClose();
    };

    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Depreciation
                 <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                 <Tabs value={action} onChange={(e, newValue) => setAction(newValue)} centered>
                    <Tab label="Run Depreciation" />
                    <Tab label="Rollback Depreciation" />
                </Tabs>
                <Box p={3}>
                    {action === 0 && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>Select the month to run depreciation for all assets. This process cannot be undone.</Typography>
                    )}
                    {action === 1 && (
                        <Typography variant="body2" color="textSecondary" gutterBottom>Select the month of the depreciation run you wish to roll back.</Typography>
                    )}
                     <Stack direction="row" spacing={2} mt={2}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                                {months.map((m, i) => <MenuItem key={i} value={i}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleAction} variant="contained" color={action === 0 ? 'primary' : 'error'}>
                    {action === 0 ? 'Run Depreciation' : 'Rollback'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


// --- Advanced Search Drawer ---
const AdvancedSearchDrawer = ({ isOpen, onClose, onApply }) => {
    const handleApply = () => {
        console.log("Applying filters...");
        onApply({});
        onClose();
    };

    return (
       <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <Box sx={{ width: 400, p: 3 }}>
                <Typography variant="h6" gutterBottom>Advanced Search</Typography>
                <Stack spacing={3} mt={2}>
                    <TextField label="Search term" variant="outlined" fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Supplier</InputLabel>
                        <Select label="Supplier"><MenuItem value=""><em>None</em></MenuItem></Select>
                    </FormControl>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField label="Amount from" type="number" fullWidth/>
                        <Typography>to</Typography>
                        <TextField label="Amount to" type="number" fullWidth/>
                    </Stack>
                    <TextField label="Date from" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField label="Date to" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField label="Document reference" variant="outlined" fullWidth />
                     <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select label="Category"><MenuItem value=""><em>None</em></MenuItem></Select>
                    </FormControl>
                </Stack>
                 <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button sx={{ mr: 1 }}>Reset</Button>
                    <Button variant="contained" onClick={handleApply}>Apply</Button>
                </Box>
            </Box>
       </Drawer>
    );
};


// --- Asset Modal (Add/Edit) ---
const AssetModal = ({ isOpen, onClose, asset, onSave }) => {
    const [formData, setFormData] = useState(asset || {});

    React.useEffect(() => {
        setFormData(asset || {});
    }, [asset]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderSection = (title, fields) => (
         <Box>
            <Typography variant="h6" gutterBottom sx={{ backgroundColor: 'grey.200', p: 1, borderRadius: 1, textAlign: 'center' }}>{title}</Typography>
            <Stack spacing={2} mt={2}>
                 {fields.map(field => (
                    <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        fullWidth
                        variant="filled"
                        InputLabelProps={{ shrink: true }}
                    />
                 ))}
            </Stack>
        </Box>
    );

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {asset && asset.id ? 'Edit Asset' : 'Add New Asset'}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <form id="asset-form" onSubmit={handleSubmit}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{p: 2}}>
                        {renderSection('Details', [
                            { name: 'name', label: 'Asset name' },
                            { name: 'assetNumber', label: 'Asset number' },
                            { name: 'purchasePrice', label: 'Purchase price', type: 'number' },
                            { name: 'purchaseDate', label: 'Purchase date', type: 'date' },
                            { name: 'warrantyExpiry', label: 'Warranty expiry', type: 'date' },
                            { name: 'assetType', label: 'Asset type' },
                            { name: 'description', label: 'Description' },
                        ])}
                        {renderSection('Accounts', [
                            { name: 'assetAccount', label: 'Asset account' },
                            { name: 'accumulatedDepreciationAccount', label: 'Accumulated depreciation account' },
                            { name: 'depreciationExpenseAccount', label: 'Depreciation expense account' },
                        ])}
                         {renderSection('Book depreciation settings', [
                            { name: 'depreciationStartDate', label: 'Depreciation start date', type: 'date' },
                            { name: 'depreciationMethod', label: 'Depreciation method' },
                            { name: 'averagingMethod', label: 'Averaging method' },
                            { name: 'effectiveLife', label: 'Effective life (years)', type: 'number' },
                        ])}
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" form="asset-form" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

// --- Main App Component ---
function FixedAssetRegister() {
  const [assets, setAssets] = useState(initialAssets);
  const [activeTab, setActiveTab] = useState('Fixed asset');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isAdvancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [isDepreciationModalOpen, setIsDepreciationModalOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [selected, setSelected] = useState([]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = assets.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleRowClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const openAssetModalToAdd = () => {
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  };

  const openAssetModalToEdit = (asset) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (savedAsset) => {
    if (savedAsset.id) {
        setAssets(assets.map(asset => asset.id === savedAsset.id ? savedAsset : asset));
    } else {
        const newAsset = { ...savedAsset, id: Date.now(), currentValue: savedAsset.purchasePrice, accumulatedDepreciation: 0 };
        setAssets([...assets, newAsset]);
    }
    setIsAssetModalOpen(false);
  };

   const handleDeleteClick = (id) => {
        setAssetToDelete(id);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        setAssets(assets.filter(asset => asset.id !== assetToDelete));
        setSelected(selected.filter(selId => selId !== assetToDelete));
        setConfirmOpen(false);
        setAssetToDelete(null);
    };

   const handleApplyFilter = (criteria) => {
      console.log("Filtering with:", criteria);
  };

  const handleRunDepreciation = ({month, year}) => {
      console.log(`Running depreciation for ${month + 1}/${year}...`);
  }

  const handleRollbackDepreciation = ({month, year}) => {
       console.log(`Rolling back depreciation for ${month + 1}/${year}...`);
  }


  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
        <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(e, newTab) => newTab && setActiveTab(newTab)}
            sx={{ mb: 2 }}
        >
            <ToggleButton value="Expenses" sx={{bgcolor: activeTab === 'Expenses' ? 'action.hover' : 'background.paper'}}>Expenses</ToggleButton>
            <ToggleButton value="Fixed asset" sx={{bgcolor: activeTab === 'Fixed asset' ? 'action.hover' : 'background.paper'}}>Fixed Asset</ToggleButton>
        </ToggleButtonGroup>

        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Stack direction={{xs: 'column', md: 'row'}} justifyContent="space-between" alignItems="center" sx={{p: 2}} spacing={2}>
                <Typography variant="h5" component="h2">Fixed Asset Register</Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Button variant="contained" onClick={() => setIsDepreciationModalOpen(true)}>Run Depreciation</Button>
                    <Button variant="contained" color="primary" onClick={openAssetModalToAdd}>Add New asset</Button>
                    <TextField
                        size="small"
                        placeholder="Search..."
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
                        }}
                    />
                    <IconButton onClick={() => setAdvancedSearchOpen(true)}><FilterAlt /></IconButton>
                    <IconButton><Tune /></IconButton>
                </Stack>
            </Stack>

            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.200' }}>
                        <TableRow>
                            <TableCell padding="checkbox"><Checkbox indeterminate={selected.length > 0 && selected.length < assets.length} checked={assets.length > 0 && selected.length === assets.length} onChange={handleSelectAllClick} /></TableCell>
                            <TableCell>Asset name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Purchase date</TableCell>
                            <TableCell align="right">Cost</TableCell>
                            <TableCell align="right">Current Value</TableCell>
                            <TableCell align="right">Accumulated Depreciation</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((asset) => {
                            const isItemSelected = isSelected(asset.id);
                            return (
                                <TableRow key={asset.id} hover onClick={(event) => handleRowClick(event, asset.id)} role="checkbox" aria-checked={isItemSelected} selected={isItemSelected}>
                                    <TableCell padding="checkbox"><Checkbox checked={isItemSelected} /></TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.assetType}</TableCell>
                                    <TableCell>{asset.purchaseDate}</TableCell>
                                    <TableCell align="right">${(asset.purchasePrice || 0).toFixed(2)}</TableCell>
                                    <TableCell align="right">${(asset.currentValue || 0).toFixed(2)}</TableCell>
                                    <TableCell align="right">${(asset.accumulatedDepreciation || 0).toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                         <Stack direction="row" spacing={0} justifyContent="center">
                                            <IconButton size="small" sx={{color: 'action.view'}} onClick={(e) => { e.stopPropagation(); openAssetModalToEdit(asset); }}><Visibility /></IconButton>
                                            <IconButton size="small" sx={{color: 'action.edit'}} onClick={(e) => { e.stopPropagation(); openAssetModalToEdit(asset); }}><Edit /></IconButton>
                                            <IconButton size="small" sx={{color: 'action.delete'}} onClick={(e) => { e.stopPropagation(); handleDeleteClick(asset.id); }}><Delete /></IconButton>
                                         </Stack>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

        <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} asset={editingAsset} onSave={handleSaveAsset} />
        <AdvancedSearchDrawer isOpen={isAdvancedSearchOpen} onClose={() => setAdvancedSearchOpen(false)} onApply={handleApplyFilter} />
        <RunDepreciationModal isOpen={isDepreciationModalOpen} onClose={() => setIsDepreciationModalOpen(false)} onRun={handleRunDepreciation} onRollback={handleRollbackDepreciation} />
        <ConfirmationDialog
            open={isConfirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Asset"
            content="Are you sure you want to delete this asset? This action cannot be undone."
        />
    </Container>
  );
}


export default function App() {
    return (
        <ThemeProvider theme={modernTheme}>
            <CssBaseline />
            <FixedAssetRegister />
        </ThemeProvider>
    );
}