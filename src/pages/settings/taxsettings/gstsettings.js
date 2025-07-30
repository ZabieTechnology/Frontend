import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios'; // Import axios for real API calls

// --- A mock hook since the original is not provided. ---
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


// --- THEME AND STYLING ---
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

// --- MAIN GST MANAGEMENT COMPONENT ---
function GSTManagement() {
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const [dialogState, setDialogState] = useState({ type: null, data: null });
  const [gstHeadOptions, setGstHeadOptions] = useState([]);

  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchApiData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both GST rates and the filtered chart of accounts to derive the heads
      const [ratesRes, accountsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/gst-rates`, { params: { limit: -1 }, withCredentials: true }),
        axios.get(`${API_BASE_URL}/api/chart-of-accounts`, { params: { 'enabledOptions.GST': true, limit: -1 }, withCredentials: true })
      ]);

      setTaxRates(ratesRes.data?.data || []);

      const gstEnabledAccounts = accountsRes.data?.data || [];
      const headOptions = gstEnabledAccounts.map(acc => ({
          value: acc.name,
          label: `${acc.name} (${acc.code})`
      }));
      setGstHeadOptions(headOptions);

    } catch (err) {
      setNotification({ open: true, message: `Failed to load data: ${err.response?.data?.message || err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchApiData();
  }, [fetchApiData]);

  const handleOpenDialog = (type, data = null) => setDialogState({ type, data });
  const handleCloseDialog = () => setDialogState({ type: null, data: null });

  const handleSave = async (taxData, isEdit) => {
    const endpoint = isEdit ? `/api/gst-rates/${taxData._id}` : `/api/gst-rates`;
    const method = isEdit ? 'put' : 'post';
    const successMessage = `GST rate ${isEdit ? 'updated' : 'added'} successfully.`;

    const taxRateValue = parseFloat(taxData.taxRate);
    const cessRateValue = parseFloat(taxData.cessRate || 0);

    const isDuplicate = taxRates.some(rate =>
        (isEdit ? rate._id !== taxData._id : true) &&
        rate.head === taxData.head &&
        parseFloat(rate.taxRate) === taxRateValue &&
        parseFloat(rate.cessRate) === cessRateValue
    );

    if (isDuplicate) {
        throw new Error(`A tax rate with the same head, tax rate, and cess rate already exists.`);
    }

    const payload = {
        ...taxData,
        taxRate: taxRateValue,
        sgstRate: taxRateValue / 2,
        cgstRate: taxRateValue / 2,
        igstRate: taxRateValue,
        cessRate: cessRateValue,
    };

    try {
      await axios[method](`${API_BASE_URL}${endpoint}`, payload, { withCredentials: true });
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
          await axios.delete(`${API_BASE_URL}/api/gst-rates/${taxId}`, { withCredentials: true });
          setNotification({ open: true, message: "GST rate deleted successfully.", severity: 'success' });
          fetchApiData();
        } catch (err) {
          setNotification({ open: true, message: `Failed to delete: ${err.response?.data?.message || err.message}`, severity: 'error' });
        }
      },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
        <ConfirmationDialog />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" color="text.primary">GST Settings</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('add')}>
            Add GST Rate
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
                  <TableCell>SGST</TableCell>
                  <TableCell>CGST</TableCell>
                  <TableCell>IGST</TableCell>
                  <TableCell>Cess</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                ) : taxRates.length > 0 ? taxRates.map((row, index) => (
                  <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{fontWeight: 500}}>{row.taxName}</TableCell>
                    <TableCell>{row.head}</TableCell>
                    <TableCell>{row.taxRate?.toFixed(2)}%</TableCell>
                    <TableCell>{row.sgstRate?.toFixed(2)}%</TableCell>
                    <TableCell>{row.cgstRate?.toFixed(2)}%</TableCell>
                    <TableCell>{row.igstRate?.toFixed(2)}%</TableCell>
                    <TableCell>{row.cessRate?.toFixed(2)}%</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog('view', row)}><VisibilityIcon color="action" /></IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog('edit', row)}><EditIcon color="primary" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row._id, row.taxName)}><DeleteIcon color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5 }}>No GST rates configured.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <AddEditGstDialog
          key={dialogState.type === 'edit' ? dialogState.data?._id : 'add'}
          open={dialogState.type === 'add' || dialogState.type === 'edit'}
          onClose={handleCloseDialog}
          onSave={handleSave}
          tax={dialogState.data}
          gstHeadOptions={gstHeadOptions}
        />

        <ViewGstDialog open={dialogState.type === 'view'} onClose={handleCloseDialog} tax={dialogState.data} />

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

function AddEditGstDialog({ open, onClose, onSave, tax, gstHeadOptions }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!tax;

  useEffect(() => {
    setError(null);
    setIsSubmitting(false);
    const initialData = isEdit
      ? { ...tax, taxRate: tax.taxRate?.toString(), cessRate: tax.cessRate?.toString() }
      : { taxName: '', taxRate: '', head: '', cessRate: '0' };
    setFormData(initialData);
  }, [open, tax, isEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const newFormData = { ...formData, [name]: value };

    if (name === 'head') {
      if (value.includes('Cess')) {
        newFormData.taxRate = '0';
      } else {
        newFormData.cessRate = '0';
      }
    }

    setFormData(newFormData);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{isEdit ? 'Edit GST Rate' : 'Add New GST Rate'}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          <TextField autoFocus name="taxName" label="Tax Name" fullWidth value={formData.taxName || ''} onChange={handleChange} required />
          <TextField
            name="taxRate"
            label="Tax Rate (%)"
            type="number"
            fullWidth
            value={formData.taxRate || ''}
            onChange={handleChange}
            required
            disabled={formData.head?.includes('Cess')}
          />
          <TextField
            name="cessRate"
            label="Cess Rate (%)"
            type="number"
            fullWidth
            value={formData.cessRate || ''}
            onChange={handleChange}
            disabled={!formData.head?.includes('Cess')}
          />
          <FormControl fullWidth required>
            <InputLabel>Head</InputLabel>
            <Select name="head" value={formData.head || ''} label="Head" onChange={handleChange}>
              <MenuItem value=""><em>Select Head</em></MenuItem>
              {gstHeadOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
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

function ViewGstDialog({ open, onClose, tax }) {
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
            <DetailItem label="Output CGST" value={`${tax.cgstRate?.toFixed(2) || '0.00'}%`} />
            <DetailItem label="Output SGST" value={`${tax.sgstRate?.toFixed(2) || '0.00'}%`} />
            <DetailItem label="Output IGST" value={`${tax.igstRate?.toFixed(2) || '0.00'}%`} />
            <DetailItem label="Cess" value={`${tax.cessRate?.toFixed(2) || '0.00'}%`} />
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


export default GSTManagement;