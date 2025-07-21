import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

// Note: The useConfirmationDialog hook is assumed to be available in your project.
// For this self-contained example, we'll mock its functionality.
const useConfirmationDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', message: '', onConfirmAction: () => {} });

  const confirm = ({ title, message, onConfirmAction }) => {
    setDialogConfig({ title, message, onConfirmAction });
    setDialogOpen(true);
  };

  const ConfirmationDialog = () => (
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>{dialogConfig.title}</DialogTitle>
      <DialogContent>
        <Typography>{dialogConfig.message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        <Button onClick={() => {
          dialogConfig.onConfirmAction();
          setDialogOpen(false);
        }} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirm, ConfirmationDialog };
};

// ==================================================================================
// TCS Form Component
// ==================================================================================
const TcsForm = ({ data, onChange }) => (
  <>
    <TextField autoFocus margin="dense" name="natureOfCollection" label="Nature of Collection" fullWidth value={data.natureOfCollection} onChange={onChange} required />
    <TextField margin="dense" name="section" label="Section" fullWidth value={data.section} onChange={onChange} required />
    <TextField margin="dense" name="threshold" label="Threshold (₹)" type="number" fullWidth value={data.threshold} onChange={onChange} required />
    <TextField margin="dense" name="tcsRate" label="TCS Rate (%)" type="number" fullWidth value={data.tcsRate} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} />
    <TextField margin="dense" name="tcsRateNoPan" label="TCS Rate - No PAN (%)" type="number" fullWidth value={data.tcsRateNoPan} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} />
    <TextField
      margin="dense"
      name="effectiveDate"
      label="Effective Date"
      type="date"
      fullWidth
      value={data.effectiveDate}
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
      required
    />
  </>
);


// ==================================================================================
// TCS Management Component Logic
// ==================================================================================
const initialNewTcsState = {
  natureOfCollection: "",
  section: "",
  threshold: "",
  tcsRate: "",
  tcsRateNoPan: "",
  effectiveDate: "",
};

function TcsManagement() {
  const [tcsRates, setTcsRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newTcsData, setNewTcsData] = useState(initialNewTcsState);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchTcsRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tcs-rates`, { params: { limit: -1 }, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setTcsRates(response.data.data);
      } else {
        setTcsRates([]);
        console.warn("Fetched TCS rates but the data format was not as expected.", response.data);
      }
    } catch (err) {
      console.error("Error fetching TCS rates:", err);
      setError(`Error fetching TCS rates: ${err.response?.data?.message || err.message}`);
      setTcsRates([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTcsRates();
  }, [fetchTcsRates]);

  const groupedTcsRates = useMemo(() => {
    const groups = {};
    tcsRates.forEach(rate => {
      const key = `${rate.natureOfCollection}-${rate.section}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(rate);
    });
    for (const key in groups) {
      groups[key].sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    }
    return groups;
  }, [tcsRates]);

  const handleToggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleOpenAddDialog = () => {
    setNewTcsData(initialNewTcsState);
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleDataChange = (event, setter) => {
    const { name, value } = event.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNew = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`${API_BASE_URL}/api/tcs-rates`, data, { withCredentials: true });
      setSuccess("New TCS rate added successfully.");
      fetchTcsRates();
      handleCloseAddDialog();
    } catch (err) {
      setError(`Failed to save TCS rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteTcs = async (tcsId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/tcs-rates/${tcsId}`, { withCredentials: true });
      setSuccess("TCS rate deleted successfully.");
      fetchTcsRates();
    } catch (err) {
      setError(`Failed to delete TCS rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const confirmDelete = (tcsId, tcsName) => {
    confirm({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete the TCS rate for "${tcsName}"? This action cannot be revoked.`,
      onConfirmAction: () => handleDeleteTcs(tcsId),
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        TCS Settings
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<AddIcon />} sx={{ mb: 3 }}>
        Add New TCS Rate
      </Button>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ width: '5%' }} />
                <TableCell sx={{ fontWeight: 'bold' }}>Sl.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nature of Collection</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Threshold (₹)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TCS Rate (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TCS Rate - No PAN (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Effective Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedTcsRates).map(([groupKey, groupRates], groupIndex) => {
                const isExpanded = expandedGroups[groupKey];
                const mainRate = groupRates[0];
                const historyRates = groupRates.slice(1);

                return (
                  <React.Fragment key={groupKey}>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                       <TableCell>
                        {historyRates.length > 0 && (
                          <IconButton aria-label="expand row" size="small" onClick={() => handleToggleGroup(groupKey)}>
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>{groupIndex + 1}</TableCell>
                      <TableCell component="th" scope="row">{mainRate.natureOfCollection}</TableCell>
                      <TableCell>{mainRate.section}</TableCell>
                      <TableCell>{new Intl.NumberFormat('en-IN').format(mainRate.threshold)}</TableCell>
                      <TableCell>{mainRate.tcsRate?.toFixed(2)}%</TableCell>
                      <TableCell>{mainRate.tcsRateNoPan?.toFixed(2)}%</TableCell>
                      <TableCell>{new Date(mainRate.effectiveDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => confirmDelete(mainRate._id, mainRate.natureOfCollection)} aria-label="delete tcs rate">
                           <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {isExpanded && historyRates.map((historyRow) => (
                      <TableRow key={historyRow._id} hover>
                        <TableCell />
                        <TableCell />
                        <TableCell colSpan={2} style={{ fontStyle: 'italic', color: 'grey.600', paddingLeft: '2.5rem' }}>
                          History
                        </TableCell>
                        <TableCell>{new Intl.NumberFormat('en-IN').format(historyRow.threshold)}</TableCell>
                        <TableCell>{historyRow.tcsRate?.toFixed(2)}%</TableCell>
                        <TableCell>{historyRow.tcsRateNoPan?.toFixed(2)}%</TableCell>
                        <TableCell>{new Date(historyRow.effectiveDate).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => confirmDelete(historyRow._id, historyRow.natureOfCollection)} aria-label="delete tcs rate">
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
               {Object.keys(groupedTcsRates).length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">No TCS rates configured yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New TCS Rate</DialogTitle>
        <DialogContent><TcsForm data={newTcsData} onChange={(e) => handleDataChange(e, setNewTcsData)} /></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={() => handleSaveNew(newTcsData)} variant="contained" disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TcsManagement;
