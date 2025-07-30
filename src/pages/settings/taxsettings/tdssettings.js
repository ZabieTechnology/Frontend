import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import Alert from '@mui/material/Alert';
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
// TDS Form Component (Moved outside to prevent re-rendering on parent state change)
// ==================================================================================
const TdsForm = ({ data, onChange }) => (
  <>
    <TextField autoFocus margin="dense" name="natureOfPayment" label="Nature of Payment" fullWidth value={data.natureOfPayment} onChange={onChange} required />
    <TextField margin="dense" name="section" label="Section" fullWidth value={data.section} onChange={onChange} required />
    {/* Added Description field */}
    <TextField
      margin="dense"
      name="description"
      label="Description / Applicability"
      fullWidth
      value={data.description || ''}
      onChange={onChange}
      multiline
      rows={3}
      helperText="Provide a brief description of when this TDS rate is applicable."
    />
    <TextField margin="dense" name="threshold" label="Threshold (₹)" type="number" fullWidth value={data.threshold} onChange={onChange} required />
    <TextField margin="dense" name="tdsRate" label="TDS Rate (%)" type="number" fullWidth value={data.tdsRate} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} />
    <TextField margin="dense" name="tdsRateNoPan" label="TDS Rate - No PAN (%)" type="number" fullWidth value={data.tdsRateNoPan} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} />
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
// TDS Management Component Logic
// ==================================================================================
const initialNewTdsState = {
  natureOfPayment: "",
  section: "",
  threshold: "",
  tdsRate: "",
  tdsRateNoPan: "",
  effectiveDate: "",
  description: "", // Added description field
};

function TdsManagement() {
  const [tdsRates, setTdsRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newTdsData, setNewTdsData] = useState(initialNewTdsState);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchTdsRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all rates by setting limit to -1
      const response = await axios.get(`${API_BASE_URL}/api/tds-rates`, { params: { limit: -1 }, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setTdsRates(response.data.data);
      } else {
        setTdsRates([]);
        console.warn("Fetched TDS rates but the data format was not as expected.", response.data);
      }
    } catch (err) {
      console.error("Error fetching TDS rates:", err);
      setError(`Error fetching TDS rates: ${err.response?.data?.message || err.message}`);
      setTdsRates([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchTdsRates();
  }, [fetchTdsRates]);

  const groupedTdsRates = useMemo(() => {
    const groups = {};
    tdsRates.forEach(rate => {
      const key = `${rate.natureOfPayment}-${rate.section}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(rate);
    });
    // Sort each group by effective date descending (newest first)
    for (const key in groups) {
      groups[key].sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    }
    return groups;
  }, [tdsRates]);

  const handleToggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleOpenAddDialog = () => {
    setNewTdsData(initialNewTdsState);
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
      await axios.post(`${API_BASE_URL}/api/tds-rates`, data, { withCredentials: true });
      setSuccess("New TDS rate added successfully.");
      fetchTdsRates(); // Refetch data from the server
      handleCloseAddDialog();
    } catch (err) {
      setError(`Failed to save TDS rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteTds = async (tdsId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/tds-rates/${tdsId}`, { withCredentials: true });
      setSuccess("TDS rate deleted successfully.");
      fetchTdsRates(); // Refetch data from the server
    } catch (err)
    {
      setError(`Failed to delete TDS rate: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const confirmDelete = (tdsId, tdsName) => {
    confirm({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete the TDS rate for "${tdsName}"? This action cannot be revoked.`,
      onConfirmAction: () => handleDeleteTds(tdsId),
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        TDS Settings
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<AddIcon />} sx={{ mb: 3 }}>
        Add New TDS Rate
      </Button>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ width: '5%' }} />
                <TableCell sx={{ fontWeight: 'bold' }}>Sl.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nature of Payment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                {/* Added Description column header */}
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Threshold (₹)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TDS Rate (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>TDS Rate - No PAN (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Effective Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedTdsRates).map(([groupKey, groupRates], groupIndex) => {
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
                      <TableCell component="th" scope="row">{mainRate.natureOfPayment}</TableCell>
                      <TableCell>{mainRate.section}</TableCell>
                      {/* Added Description cell */}
                      <TableCell>{mainRate.description}</TableCell>
                      <TableCell>{new Intl.NumberFormat('en-IN').format(mainRate.threshold)}</TableCell>
                      <TableCell>{mainRate.tdsRate?.toFixed(2)}%</TableCell>
                      <TableCell>{mainRate.tdsRateNoPan?.toFixed(2)}%</TableCell>
                      <TableCell>{new Date(mainRate.effectiveDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => confirmDelete(mainRate._id, mainRate.natureOfPayment)} aria-label="delete tds rate">
                           <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {isExpanded && historyRates.map((historyRow) => (
                      <TableRow key={historyRow._id} hover>
                        <TableCell />
                        <TableCell />
                        <TableCell component="th" scope="row" style={{ fontStyle: 'italic', color: 'grey.600', paddingLeft: '2.5rem' }}>
                          History
                        </TableCell>
                        <TableCell /> {/* Empty cell for Section alignment */}
                        {/* Added description for history row */}
                        <TableCell>{historyRow.description}</TableCell>
                        <TableCell>{new Intl.NumberFormat('en-IN').format(historyRow.threshold)}</TableCell>
                        <TableCell>{historyRow.tdsRate?.toFixed(2)}%</TableCell>
                        <TableCell>{historyRow.tdsRateNoPan?.toFixed(2)}%</TableCell>
                        <TableCell>{new Date(historyRow.effectiveDate).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => confirmDelete(historyRow._id, historyRow.natureOfPayment)} aria-label="delete tds rate">
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
               {Object.keys(groupedTdsRates).length === 0 && !loading && (
                <TableRow>
                  {/* Updated colSpan to account for the new column */}
                  <TableCell colSpan={10} align="center">No TDS rates configured yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New TDS Rate</DialogTitle>
        <DialogContent><TdsForm data={newTdsData} onChange={(e) => handleDataChange(e, setNewTdsData)} /></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={() => handleSaveNew(newTdsData)} variant="contained" disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TdsManagement;