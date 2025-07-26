import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

// --- MOCK API SETUP FOR VAT ---
// This section simulates a backend API for VAT management.
const mockVatApi = {
  db: {
    rates: [
      { _id: '1', taxName: 'Standard VAT', head: 'VAT Output', taxRate: 5.00 },
      { _id: '2', taxName: 'Zero-Rated VAT', head: 'VAT Output', taxRate: 0.00 },
      { _id: '3', taxName: 'Exempt VAT', head: 'VAT Input', taxRate: 0.00 },
    ],
    heads: [
        { value: 'VAT Output', label: 'VAT Output' },
        { value: 'VAT Input', label: 'VAT Input' },
    ]
  },
  get: async (url, config) => {
    console.log('MOCK GET:', url, config);
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    if (url.includes('/api/vat-rates')) {
      return { data: { data: mockVatApi.db.rates } };
    }
    if (url.includes('/api/dropdown')) {
       if (config.params.type === 'VAT_Head') {
           return { data: { data: mockVatApi.db.heads } };
       }
    }
    return { data: { data: [] } };
  },
  post: async (url, data) => {
    console.log('MOCK POST:', url, data);
    await new Promise(res => setTimeout(res, 500));
    if (url.includes('/api/vat-rates')) {
      const taxRate = parseFloat(data.taxRate);
      const newRate = {
        ...data,
        _id: new Date().getTime().toString(),
        taxRate,
      };
      mockVatApi.db.rates.push(newRate);
      return { data: newRate };
    }
    return { data: {} };
  },
  put: async (url, data) => {
    console.log('MOCK PUT:', url, data);
    await new Promise(res => setTimeout(res, 500));
    if (url.includes('/api/vat-rates')) {
      const taxRate = parseFloat(data.taxRate);
      const updatedRate = {
        ...data,
        taxRate,
      };
      mockVatApi.db.rates = mockVatApi.db.rates.map(rate => rate._id === data._id ? updatedRate : rate);
      return { data: updatedRate };
    }
    return { data: {} };
  },
  delete: async (url) => {
    console.log('MOCK DELETE:', url);
    await new Promise(res => setTimeout(res, 500));
    if (url.includes('/api/vat-rates')) {
        const id = url.split('/').pop();
        mockVatApi.db.rates = mockVatApi.db.rates.filter(rate => rate._id !== id);
        return { data: { message: 'Deleted successfully' } };
    }
    return { data: {} };
  }
};


// A mock hook since the original is not provided.
const useConfirmationDialog = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirmAction: () => {} });

    const confirm = ({ title, message, onConfirmAction }) => {
        setDialogConfig({ title, message, onConfirmAction });
        setDialogOpen(true);
    };

    const handleConfirm = () => {
        dialogConfig.onConfirmAction();
        setDialogOpen(false);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const ConfirmationDialog = () => (
        <Dialog open={dialogOpen} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{fontWeight: 'bold'}}>{dialogConfig.title}</DialogTitle>
            <DialogContent>
                <Typography>{dialogConfig.message}</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );

    return { confirm, ConfirmationDialog };
};


// --- THEME AND STYLING (Identical to GST) ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#F50057',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212B36',
      secondary: '#637381',
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#2E7D32',
    },
  },
  typography: {
    fontFamily: '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h4: {
      fontWeight: 700,
    },
    subtitle1: {
        fontWeight: 600,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
      },
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                fontWeight: 'bold',
                color: '#637381',
                backgroundColor: '#F4F6F8',
                borderBottom: '1px solid #E0E0E0'
            }
        }
    }
  },
});

// --- MAIN VAT MANAGEMENT COMPONENT ---
function VATManagement() {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const [dialogState, setDialogState] = useState({ type: null, data: null });
  const [vatHeadOptions, setVatHeadOptions] = useState([]);

  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = ''; // Not needed with mock

  const api = mockVatApi; // Use the mock VAT API

  const fetchApiData = useCallback(async () => {
    setLoading(true);
    try {
      const [ratesRes, headsRes] = await Promise.all([
        api.get(`${API_BASE_URL}/api/vat-rates`, { params: { limit: -1 } }),
        api.get(`${API_BASE_URL}/api/dropdown`, { params: { type: 'VAT_Head' } })
      ]);
      setTaxRates(ratesRes.data?.data || []);
      setVatHeadOptions(headsRes.data?.data.map(opt => ({ value: opt.value, label: opt.label })) || []);
    } catch (err) {
      setNotification({ open: true, message: `Failed to load data: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, api]);

  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  const handleOpenDialog = (type, data = null) => setDialogState({ type, data });
  const handleCloseDialog = () => setDialogState({ type: null, data: null });

  const handleSave = async (taxData, isEdit) => {
    const endpoint = isEdit ? `/api/vat-rates/${taxData._id}` : `/api/vat-rates`;
    const method = isEdit ? 'put' : 'post';
    const successMessage = `VAT rate ${isEdit ? 'updated' : 'added'} successfully.`;

    const isDuplicate = taxRates.some(rate =>
        (isEdit ? rate._id !== taxData._id : true) &&
        rate.head === taxData.head &&
        parseFloat(rate.taxRate) === parseFloat(taxData.taxRate)
    );

    if (isDuplicate) {
        throw new Error(`A tax rate with the same head and tax rate already exists.`);
    }

    try {
      await api[method](`${API_BASE_URL}${endpoint}`, taxData);
      setNotification({ open: true, message: successMessage, severity: 'success' });
      fetchApiData();
      handleCloseDialog();
    } catch (err) {
      // Re-throw to be caught by the dialog's submit handler
      throw err.response?.data?.message ? new Error(err.response.data.message) : err;
    }
  };

  const handleDelete = (taxId, taxName) => {
    confirm({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete "${taxName}"? This action cannot be undone.`,
      onConfirmAction: async () => {
        try {
          await api.delete(`${API_BASE_URL}/api/vat-rates/${taxId}`);
          setNotification({ open: true, message: "VAT rate deleted successfully.", severity: 'success' });
          fetchApiData();
        } catch (err) {
          setNotification({ open: true, message: `Failed to delete: ${err.message}`, severity: 'error' });
        }
      },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
        <ConfirmationDialog />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" color="text.primary">VAT Settings</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('add')}>
            Add VAT Rate
          </Button>
        </Box>

        <Paper elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Tax Name</TableCell>
                  <TableCell>Head</TableCell>
                  <TableCell>Tax Rate</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                ) : taxRates.length > 0 ? taxRates.map((row, index) => (
                  <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{fontWeight: 500}}>{row.taxName}</TableCell>
                    <TableCell>{row.head}</TableCell>
                    <TableCell>{row.taxRate?.toFixed(2)}%</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog('view', row)}><VisibilityIcon color="action" /></IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog('edit', row)}><EditIcon color="primary" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row._id, row.taxName)}><DeleteIcon color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>No VAT rates configured.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <AddEditVatDialog
          key={dialogState.type === 'edit' ? dialogState.data?._id : 'add'}
          open={dialogState.type === 'add' || dialogState.type === 'edit'}
          onClose={handleCloseDialog}
          onSave={handleSave}
          tax={dialogState.data}
          vatHeadOptions={vatHeadOptions}
        />

        <ViewVatDialog open={dialogState.type === 'view'} onClose={handleCloseDialog} tax={dialogState.data} />

        <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification(p => ({...p, open: false}))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setNotification(p => ({...p, open: false}))} severity={notification.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: 6 }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// --- REUSABLE DIALOG COMPONENTS ---

function AddEditVatDialog({ open, onClose, onSave, tax, vatHeadOptions }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!tax;

  useEffect(() => {
    setError(null);
    setIsSubmitting(false);
    const initialData = isEdit
      ? { ...tax, taxRate: tax.taxRate?.toString() }
      : { taxName: '', taxRate: '', head: '' };
    setFormData(initialData);
  }, [open, tax, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.taxName || !formData.taxRate || !formData.head) {
      setError("Tax Name, Tax Rate, and Head are required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(formData, isEdit);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{isEdit ? 'Edit VAT Rate' : 'Add New VAT Rate'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField autoFocus name="taxName" label="Tax Name" fullWidth value={formData.taxName || ''} onChange={handleChange} required />
          <TextField
            name="taxRate"
            label="Tax Rate (%)"
            type="number"
            fullWidth
            value={formData.taxRate || ''}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Head</InputLabel>
            <Select name="head" value={formData.head || ''} label="Head" onChange={handleChange}>
              <MenuItem value=""><em>Select Head</em></MenuItem>
              {vatHeadOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isEdit ? 'Update' : 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ViewVatDialog({ open, onClose, tax }) {
    if (!tax) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <DialogTitle sx={{ bgcolor: '#212B36', color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {tax.taxName}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#F9FAFB' }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <DetailItem label="Head" value={tax.head} />
            <DetailItem label="Tax Rate" value={`${tax.taxRate?.toFixed(2) || '0.00'}%`} />
          </Box>
        </DialogContent>
      </Dialog>
    );
};

const DetailItem = ({ label, value }) => (
    <Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight="bold">{value}</Typography>
    </Box>
);


export default function App() {
  return (
      <VATManagement />
  );
}
