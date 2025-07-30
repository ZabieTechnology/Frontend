import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TableSortLabel from '@mui/material/TableSortLabel';
import DialogContentText from '@mui/material/DialogContentText';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    UploadFile as UploadIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
} from '@mui/icons-material';

// Import global styles
import '../../../assets/styles/global.css';
import '../../../assets/styles/settings.css';

const API_URL = '/api/industry-classifications';

// --- Helper to get JWT token ---
// In a real app, you would get this from your auth context or local storage
const getAuthToken = () => {
    // Corrected to use 'token' to match the key used in App.js
    return localStorage.getItem('token');
};

const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Axios request interceptor to add the JWT token to requests
axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Axios response interceptor to handle 401 Unauthorized errors globally
axiosInstance.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear the invalid token and redirect to the login page
      // Corrected to use 'token' to match the key used in App.js
      localStorage.removeItem('token');
      // You can also dispatch a logout action if using a state manager like Redux
      window.location.href = '/login';
    }
    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);


const initialItemState = {
    natureOfBusiness: '',
    industry: '',
    code: '',
    isLocked: false
};

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function IndustryClassification() {
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(initialItemState);
    const [isEditing, setIsEditing] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('industry');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [parsedCsvData, setParsedCsvData] = useState([]);
    const [importError, setImportError] = useState('');

    /**
     * Fetches classification data from the API.
     * It now handles 404 errors by treating them as an empty dataset,
     * which is common for new tenants with no data yet.
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(''); // Clear previous errors before a new fetch
            const response = await axiosInstance.get('');
            setClassifications(response.data || []);
        } catch (err) {
            // The 401 interceptor will handle auth errors.
            // We only need to handle other potential errors here.
            if (err.response && err.response.status !== 401) {
                 if (err.response.status === 404) {
                    setClassifications([]); // Treat 404 as empty data
                } else {
                    setError(err.response?.data?.message || 'Failed to fetch classifications.');
                }
            } else if (!err.response) {
                 setError('Network error. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showSuccessMessage = (message) => {
        setSuccess(message);
        // The snackbar will auto-hide, no need for a manual timeout to clear the message
    };

    const handleToggleLock = async (id) => {
        const itemToUpdate = classifications.find(item => item._id === id);
        if (!itemToUpdate) return;
        const updatedItem = { ...itemToUpdate, isLocked: !itemToUpdate.isLocked };
        try {
            await axiosInstance.put(`/${id}`, updatedItem);
            showSuccessMessage('Item lock status updated successfully.');
            fetchData(); // Refresh data
        } catch (err) {
            if (err.response?.status !== 401) {
                setError(err.response?.data?.message || 'Failed to update lock status.');
            }
        }
    };

    const handleOpenDialog = (item = null) => {
        setError(''); // Clear errors when opening a dialog
        if (item) {
            setCurrentItem({ ...item });
            setIsEditing(true);
        } else {
            setCurrentItem(initialItemState);
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentItem(initialItemState);
    };

    const handleSaveItem = async () => {
        if (!currentItem.industry || !currentItem.natureOfBusiness || !currentItem.code) {
            setError('All fields are required.');
            return;
        }
        setError('');

        // The backend is responsible for adding the tenant_id from the JWT
        const apiCall = isEditing
            ? axiosInstance.put(`/${currentItem._id}`, currentItem)
            : axiosInstance.post('', currentItem);

        try {
            await apiCall;
            showSuccessMessage(`Classification ${isEditing ? 'updated' : 'added'} successfully.`);
            handleCloseDialog();
            fetchData(); // Refresh data
        } catch (err) {
            if (err.response?.status !== 401) {
                setError(err.response?.data?.message || 'Failed to save item.');
            }
        }
    };

    const handleOpenDeleteConfirm = (id) => {
        setItemToDelete(id);
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setItemToDelete(null);
        setOpenDeleteConfirm(false);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axiosInstance.delete(`/${itemToDelete}`);
            showSuccessMessage('Item deleted successfully.');
            handleCloseDeleteConfirm();
            fetchData(); // Refresh data
        } catch (err) {
            if (err.response?.status !== 401) {
                setError(err.response?.data?.message || 'Failed to delete item.');
            }
        }
    };

    const sortedAndFilteredClassifications = useMemo(() => {
        let filtered = classifications;
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = classifications.filter(item =>
                (item.natureOfBusiness || '').toLowerCase().includes(lowercasedFilter) ||
                (item.industry || '').toLowerCase().includes(lowercasedFilter) ||
                (item.code || '').toLowerCase().includes(lowercasedFilter)
            );
        }
        return filtered.sort(getComparator(order, orderBy));
    }, [searchTerm, classifications, order, orderBy]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleOpenImportDialog = () => {
        setImportError('');
        setParsedCsvData([]);
        setOpenImportDialog(true);
    };
    const handleCloseImportDialog = () => setOpenImportDialog(false);
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      setImportError('');
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim(),
          complete: (results) => {
              const requiredHeaders = ['Industry', 'NatureOfBusiness', 'Code'];
              const actualHeaders = results.meta.fields;
              const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
              if (missingHeaders.length > 0) {
                  setImportError(`Missing CSV columns: ${missingHeaders.join(', ')}`);
                  setParsedCsvData([]);
                  return;
              }
              const data = results.data.map(row => ({
                  industry: row.Industry,
                  natureOfBusiness: row.NatureOfBusiness,
                  code: row.Code,
              }));
              setParsedCsvData(data);
          },
          error: (err) => setImportError(err.message),
      });
    };
    const handleAddCsvData = async () => {
        if (parsedCsvData.length === 0) return;
        try {
            // Using Promise.all for more efficient bulk insertion
            await Promise.all(parsedCsvData.map(item => axiosInstance.post('', item)));
            showSuccessMessage('CSV data imported successfully.');
            handleCloseImportDialog();
            fetchData(); // Refresh data
        } catch (err) {
            if (err.response?.status !== 401) {
                setImportError(err.response?.data?.message || 'Failed to import some items.');
            }
        }
    };
    const handleDownloadSampleCsv = () => {
        const csv = Papa.unparse([{ Industry: 'Sample Industry', NatureOfBusiness: 'Sample Nature Of Business', Code: '00001' }]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'sample_industries.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !classifications.length) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    const tableHeaders = [
        { id: 'industry', label: 'Industry' },
        { id: 'natureOfBusiness', label: 'Nature Of Business' },
        { id: 'code', label: 'Code' }
    ];

    return (
        <div className="main-container">
            <div className="content-wrapper">
                <Paper className="page-header">
                    <h4 className="h4-title" style={{ margin: 0 }}>Industry Classification</h4>
                </Paper>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                </Snackbar>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ minWidth: '300px', flexGrow: 1 }}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),}}
                        />
                         <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleOpenImportDialog}>
                                Import from CSV
                            </Button>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                                Add New
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead className="table-header">
                            <TableRow>
                                {tableHeaders.map((h) => (
                                    <TableCell key={h.id} sortDirection={orderBy === h.id ? order : false} className="font-bold">
                                        <TableSortLabel active={orderBy === h.id} direction={orderBy === h.id ? order : 'asc'} onClick={() => handleRequestSort(h.id)}>
                                            {h.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell className="font-bold" align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedAndFilteredClassifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <TableRow key={row._id} hover sx={{backgroundColor: row.isLocked ? '#fafafa' : 'inherit'}}>
                                    <TableCell>{row.industry}</TableCell>
                                    <TableCell>{row.natureOfBusiness}</TableCell>
                                    <TableCell>{row.code}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={row.isLocked ? 'Unlock' : 'Lock'}>
                                            <IconButton onClick={() => handleToggleLock(row._id)}>{row.isLocked ? <LockIcon /> : <LockOpenIcon />}</IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <span><IconButton onClick={() => handleOpenDialog(row)} color="primary" disabled={row.isLocked}><EditIcon /></IconButton></span>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                           <span><IconButton onClick={() => handleOpenDeleteConfirm(row._id)} color="error" disabled={row.isLocked}><DeleteIcon /></IconButton></span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={sortedAndFilteredClassifications.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                    <DialogTitle>{isEditing ? 'Edit Classification' : 'Add New Classification'}</DialogTitle>
                    <DialogContent>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <TextField autoFocus margin="dense" label="Industry" fullWidth variant="outlined" value={currentItem.industry} onChange={(e) => setCurrentItem({ ...currentItem, industry: e.target.value })}/>
                        <TextField margin="dense" label="Nature Of Business" fullWidth variant="outlined" value={currentItem.natureOfBusiness} onChange={(e) => setCurrentItem({ ...currentItem, natureOfBusiness: e.target.value })} />
                        <TextField margin="dense" label="Code" fullWidth variant="outlined" value={currentItem.code} onChange={(e) => setCurrentItem({ ...currentItem, code: e.target.value })} />
                         <FormControlLabel control={<Switch checked={!!currentItem.isLocked} onChange={(e) => setCurrentItem({ ...currentItem, isLocked: e.target.checked })} />} label="Lock this item" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSaveItem} variant="contained" className="btn-save">Save</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent><DialogContentText>Are you sure you want to delete this item? This action cannot be undone.</DialogContentText></DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openImportDialog} onClose={handleCloseImportDialog} fullWidth maxWidth="md">
                    <DialogTitle>Import from CSV</DialogTitle>
                    <DialogContent>
                        {importError && <Alert severity="error" sx={{ mb: 2 }}>{importError}</Alert>}
                        <Box sx={{ my: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                            <Typography gutterBottom>Upload a CSV file with columns: `Industry`, `NatureOfBusiness`, `Code`.</Typography>
                            <Button variant="contained" component="label">Upload File<input type="file" hidden accept=".csv" onChange={handleFileChange} /></Button>
                            <Link component="button" variant="body2" onClick={handleDownloadSampleCsv} sx={{ ml: 2 }}>Download Sample CSV</Link>
                        </Box>
                        {parsedCsvData.length > 0 && (
                            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                <Table stickyHeader size="small">
                                    <TableHead><TableRow><TableCell>Industry</TableCell><TableCell>NatureOfBusiness</TableCell><TableCell>Code</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {parsedCsvData.map((row, index) => (
                                            <TableRow key={index}><TableCell>{row.industry}</TableCell><TableCell>{row.natureOfBusiness}</TableCell><TableCell>{row.code}</TableCell></TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseImportDialog}>Cancel</Button>
                        <Button onClick={handleAddCsvData} variant="contained" className="btn-save" disabled={parsedCsvData.length === 0}>Import Data</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default IndustryClassification;
