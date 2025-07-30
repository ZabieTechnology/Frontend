import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Papa from 'papaparse'; // Import papaparse

// MUI Core Components - Path-based imports for better tree-shaking
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import TableSortLabel from '@mui/material/TableSortLabel';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';

// MUI Icons - These are already optimally imported
import {
  Edit, Delete, Lock, LockOpen, Add as AddIcon,
  Star as DefaultIcon, StarBorder as NotDefaultIcon, Map as MapIcon, UploadFile as UploadIcon,
  Search as SearchIcon, Download as DownloadIcon
} from '@mui/icons-material';

import '../../../assets/styles/global.css';
import '../../../assets/styles/settings.css';

const API_URL = '/api/regional-settings';
const AUTH_API_URL = '/api/auth/profile';

// --- Axios Instance with Auth ---
const getAuthToken = () => localStorage.getItem('token');

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const initialRegionState = {
    _id: null, regionName: '', currency: '', countryCode: '', flag: '',
    currencySymbol: '', isDefaultBase: false, isLocked: false, states: [],
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

function RegionalSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('user'); // Default to non-admin

  const [openRegionDialog, setOpenRegionDialog] = useState(false);
  const [openStateDialog, setOpenStateDialog] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(initialRegionState);
  const [statesForEdit, setStatesForEdit] = useState([]);
  const [newState, setNewState] = useState({ name: '', code: '', zone: 'State' });
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('regionName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Ref for the file input
  const fileInputRef = useRef(null);

  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user role and data concurrently
      const [profileRes, settingsRes] = await Promise.all([
          axiosInstance.get(AUTH_API_URL),
          axiosInstance.get(API_URL)
      ]);

      setUserRole(profileRes.data.role || 'user');
      const sanitizedData = settingsRes.data.map(s => ({ ...s, states: s.states || [] }));
      setSettings(sanitizedData);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSuccessMessage = (message) => {
    setSuccess(message);
  };

  const handleOpenRegionDialog = (setting = null) => {
    setError('');
    setCurrentRegion(setting ? { ...setting } : initialRegionState);
    setOpenRegionDialog(true);
  };

  const handleCloseRegionDialog = () => setOpenRegionDialog(false);

  const handleSaveRegion = async () => {
    if (!currentRegion.regionName || !currentRegion.currency || !currentRegion.countryCode) {
      setError("Region Name, Currency, and Country Code are required.");
      return;
    }
    setError('');
    const apiCall = currentRegion._id
        ? axiosInstance.put(`${API_URL}/${currentRegion._id}`, currentRegion)
        : axiosInstance.post(API_URL, currentRegion);
    try {
        await apiCall;
        showSuccessMessage(`Regional setting ${currentRegion._id ? 'updated' : 'added'} successfully!`);
        handleCloseRegionDialog();
        fetchData();
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to save settings.');
    }
  };

  const handleOpenDeleteConfirm = (id) => {
      setItemToDelete(id);
      setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

  const handleConfirmDelete = async () => {
      if (!itemToDelete) return;
      try {
        await axiosInstance.delete(`${API_URL}/${itemToDelete}`);
        showSuccessMessage('Item deleted successfully.');
        handleCloseDeleteConfirm();
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete item.');
      }
  };

  const handleOpenStateDialog = (region) => {
    setCurrentRegion(region);
    setStatesForEdit([...(region.states || [])]);
    setOpenStateDialog(true);
  };

  const handleCloseStateDialog = () => {
    setOpenStateDialog(false);
    setNewState({ name: '', code: '', zone: 'State' });
  };

  const handleAddState = () => {
    if (newState.name.trim() === '') return;
    setStatesForEdit([...statesForEdit, { _id: `new_${Date.now()}`, ...newState }]);
    setNewState({ name: '', code: '', zone: 'State' });
  };

  const handleDeleteState = (stateId) => {
    setStatesForEdit(statesForEdit.filter(s => s._id !== stateId));
  };

  const handleSaveStates = async () => {
    if (!currentRegion) return;
    try {
      await axiosInstance.put(`${API_URL}/states/${currentRegion._id}`, { states: statesForEdit });
      showSuccessMessage(`States for ${currentRegion.regionName} updated.`);
      handleCloseStateDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save states.');
    }
  };

  // --- CSV Import/Export Handlers ---
  const handleImportClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const regionsToImport = results.data.map(row => ({
            regionName: row.regionName,
            currency: row.currency,
            countryCode: row.countryCode,
            flag: row.flag,
            currencySymbol: row.currencySymbol,
            states: row.states // Pass the states JSON string
        }));

        try {
            setLoading(true);
            setError('');
            const response = await axiosInstance.post(`${API_URL}/bulk-import`, { regions: regionsToImport });
            showSuccessMessage(response.data.message);
            fetchData(); // Refresh data
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to import CSV file.');
        } finally {
            setLoading(false);
        }
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`);
      }
    });

    event.target.value = null;
  };

  const handleDownloadSample = () => {
    const headers = ["regionName", "currency", "countryCode", "flag", "currencySymbol", "states"];
    const sampleData = [
      {
        regionName: "United States",
        currency: "USD",
        countryCode: "+1",
        flag: "🇺🇸",
        currencySymbol: "$",
        states: JSON.stringify([
          {name: "California", code: "CA", zone: "State"},
          {name: "New York", code: "NY", zone: "State"}
        ])
      },
      {
        regionName: "India",
        currency: "INR",
        countryCode: "+91",
        flag: "🇮🇳",
        currencySymbol: "₹",
        states: JSON.stringify([
          {name: "Maharashtra", code: "MH", zone: "State"},
          {name: "Delhi", code: "DL", zone: "Union Territory"}
        ])
      },
    ];

    const csv = Papa.unparse({
        fields: headers,
        data: sampleData.map(item => headers.map(header => item[header]))
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-regions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedAndFilteredSettings = useMemo(() => {
    let filtered = settings;
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = settings.filter(setting =>
        (setting.regionName || '').toLowerCase().includes(lowercasedFilter) ||
        (setting.currency || '').toLowerCase().includes(lowercasedFilter) ||
        (setting.currencySymbol || '').toLowerCase().includes(lowercasedFilter) ||
        (setting.countryCode || '').toLowerCase().includes(lowercasedFilter)
      );
    }
    return filtered.sort(getComparator(order, orderBy));
  }, [settings, searchTerm, order, orderBy]);

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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  const tableHeaders = [
      { id: 'regionName', label: 'Region' }, { id: 'currency', label: 'Currency' },
      { id: 'currencySymbol', label: 'Symbol' }, { id: 'countryCode', label: 'Country Code' }
  ];

  return (
    <div className="main-container">
      <div className="content-wrapper">
          <Paper className="page-header"><h4 className="h4-title" style={{margin: 0}}>Global Regional Settings</h4></Paper>
          <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}><Alert severity="success" sx={{ width: '100%' }}>{success}</Alert></Snackbar>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TextField variant="outlined" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: '40%' }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)}}/>
                  {isAdmin && (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <input
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleImportClick}>Import from CSV</Button>
                        <Button variant="text" size="small" startIcon={<DownloadIcon />} onClick={handleDownloadSample}>Download Sample</Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenRegionDialog()}>Add New Region</Button>
                    </Box>
                  )}
              </Box>
          </Paper>
          <TableContainer component={Paper}>
            <Table>
              <TableHead className="table-header">
                <TableRow>
                  <TableCell className="font-bold">Default</TableCell> <TableCell className="font-bold">Flag</TableCell>
                  {tableHeaders.map(header => (<TableCell key={header.id} sortDirection={orderBy === header.id ? order : false} className="font-bold"><TableSortLabel active={orderBy === header.id} direction={orderBy === header.id ? order : 'asc'} onClick={() => handleRequestSort(header.id)}>{header.label}</TableSortLabel></TableCell>))}
                  <TableCell className="font-bold">States</TableCell>
                  {isAdmin && <TableCell className="font-bold" align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAndFilteredSettings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row._id} hover sx={{backgroundColor: row.isLocked ? '#fafafa' : 'inherit'}}>
                    <TableCell><Tooltip title={row.isDefaultBase ? "Default Base Currency" : "Set as Default"}><IconButton color="primary" disabled>{row.isDefaultBase ? <DefaultIcon /> : <NotDefaultIcon />}</IconButton></Tooltip></TableCell>
                    <TableCell className="flag-cell">{row.flag}</TableCell>
                    <TableCell>{row.regionName}</TableCell> <TableCell>{row.currency}</TableCell>
                    <TableCell>{row.currencySymbol}</TableCell> <TableCell>{row.countryCode}</TableCell>
                    <TableCell>
                       <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <Typography>({(row.states || []).length})</Typography>
                          {isAdmin && <Button size="small" variant="text" startIcon={<MapIcon />} onClick={() => handleOpenStateDialog(row)} disabled={row.isLocked}>Manage</Button>}
                       </Box>
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <Tooltip title={row.isLocked ? "Unlock" : "Lock"}><IconButton onClick={() => handleOpenRegionDialog(row)}>{row.isLocked ? <Lock /> : <LockOpen />}</IconButton></Tooltip>
                        <Tooltip title="Edit"><span><IconButton onClick={() => handleOpenRegionDialog(row)} color="primary" disabled={row.isLocked}><Edit /></IconButton></span></Tooltip>
                        <Tooltip title="Delete"><span><IconButton onClick={() => handleOpenDeleteConfirm(row._id)} color="error" disabled={row.isLocked}><Delete /></IconButton></span></Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={sortedAndFilteredSettings.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}/>
          <Dialog open={openRegionDialog} onClose={handleCloseRegionDialog} fullWidth maxWidth="sm">
            <DialogTitle>{currentRegion._id ? 'Edit Regional Setting' : 'Add New Regional Setting'}</DialogTitle>
            <DialogContent>
               {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
               <TextField autoFocus margin="dense" label="Region Name" fullWidth value={currentRegion.regionName} onChange={e => setCurrentRegion({...currentRegion, regionName: e.target.value})} />
               <TextField margin="dense" label="Currency" fullWidth value={currentRegion.currency} onChange={e => setCurrentRegion({...currentRegion, currency: e.target.value})} />
               <TextField margin="dense" label="Symbol" fullWidth value={currentRegion.currencySymbol} onChange={e => setCurrentRegion({...currentRegion, currencySymbol: e.target.value})} />
               <TextField margin="dense" label="Country Code" fullWidth value={currentRegion.countryCode} onChange={e => setCurrentRegion({...currentRegion, countryCode: e.target.value})} />
               <TextField margin="dense" label="Flag Emoji" fullWidth value={currentRegion.flag} onChange={e => setCurrentRegion({...currentRegion, flag: e.target.value})} />
               <FormControlLabel control={<Switch checked={!!currentRegion.isDefaultBase} onChange={e => setCurrentRegion({...currentRegion, isDefaultBase: e.target.checked})} />} label="Set as Default Base Currency" />
               <FormControlLabel control={<Switch checked={!!currentRegion.isLocked} onChange={e => setCurrentRegion({...currentRegion, isLocked: e.target.checked})} />} label="Lock this item" />
            </DialogContent>
            <DialogActions><Button onClick={handleCloseRegionDialog}>Cancel</Button><Button onClick={handleSaveRegion} className="btn-save">Save</Button></DialogActions>
          </Dialog>
          <Dialog open={openStateDialog} onClose={handleCloseStateDialog} fullWidth maxWidth="sm">
              <DialogTitle>Manage States for {currentRegion.regionName}</DialogTitle>
              <DialogContent>
                  <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                       <TextField label="New State Name" value={newState.name} onChange={e => setNewState({...newState, name: e.target.value})} fullWidth size="small"/>
                       <TextField label="State Code" value={newState.code} onChange={e => setNewState({...newState, code: e.target.value})} sx={{width: '150px'}} size="small"/>
                       <FormControl size="small" sx={{width: '200px'}}>
                            <InputLabel>Zone</InputLabel>
                            <Select label="Zone" value={newState.zone} onChange={e => setNewState({...newState, zone: e.target.value})}><MenuItem value="State">State</MenuItem><MenuItem value="Union Territory">Union Territory</MenuItem></Select>
                       </FormControl>
                       <Button onClick={handleAddState} variant="outlined">Add</Button>
                  </Box>
                  <List dense>{statesForEdit.map(state => (<ListItem key={state._id} secondaryAction={<IconButton edge="end" onClick={() => handleDeleteState(state._id)}><Delete /></IconButton>}><ListItemText primary={state.name} secondary={`Code: ${state.code || 'N/A'} | Zone: ${state.zone || 'N/A'}`} /></ListItem>))}</List>
              </DialogContent>
              <DialogActions><Button onClick={handleCloseStateDialog}>Cancel</Button><Button onClick={handleSaveStates} className="btn-save">Save States</Button></DialogActions>
          </Dialog>
          <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogContent><DialogContentText>Are you sure you want to delete this region? This action cannot be undone.</DialogContentText></DialogContent>
              <DialogActions><Button onClick={handleCloseDeleteConfirm}>Cancel</Button><Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button></DialogActions>
          </Dialog>
      </div>
    </div>
  );
}

export default RegionalSettings;
