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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';

// Note: The useConfirmationDialog hook is assumed to be available in your project.
// For this self-contained example, we'll mock its functionality, similar to your tds.js.
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
// Advance Tax Form Component
// ==================================================================================
const AdvanceTaxForm = ({ data, onChange }) => (
  <>
    {/* Business Type Dropdown */}
    <FormControl fullWidth margin="dense" required>
      <InputLabel id="business-type-label">Business Type</InputLabel>
      <Select
        labelId="business-type-label"
        name="businessType"
        value={data.businessType}
        label="Business Type"
        onChange={onChange}
      >
        <MenuItem value="Individual/HUF">Individual / HUF</MenuItem>
        <MenuItem value="AOP/BOI">AOP / BOI</MenuItem>
        <MenuItem value="Partnership Firm">Partnership Firm (including LLP)</MenuItem>
        <MenuItem value="Company - Domestic">Company - Domestic</MenuItem>
        <MenuItem value="Company - Foreign">Company - Foreign</MenuItem>
        <MenuItem value="Co-operative Society">Co-operative Society</MenuItem>
      </Select>
    </FormControl>

    {/* Description Field */}
    <TextField
      margin="dense"
      name="description"
      label="Description / Applicability"
      fullWidth
      value={data.description || ''}
      onChange={onChange}
      multiline
      rows={3}
      helperText="Provide a brief description of when this rule is applicable (e.g., specific turnover conditions)."
    />

    {/* Financial Fields */}
    <TextField margin="dense" name="turnoverLimit" label="Turnover Limit (₹)" type="number" fullWidth value={data.turnoverLimit} onChange={onChange} required />
    <TextField margin="dense" name="taxRate" label="Base Tax Rate (%)" type="number" fullWidth value={data.taxRate} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} />
    <TextField margin="dense" name="surchargeRate" label="Surcharge Rate (%)" type="number" fullWidth value={data.surchargeRate} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} helperText="Enter 0 if not applicable." />
    <TextField margin="dense" name="cessRate" label="Health & Education Cess (%)" type="number" fullWidth value={data.cessRate} onChange={onChange} required InputProps={{ inputProps: { min: 0, step: "0.01" } }} />

    {/* Effective Date */}
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
// Advance Tax Management Component Logic
// ==================================================================================
const initialNewAdvanceTaxState = {
  businessType: "",
  description: "",
  turnoverLimit: "",
  taxRate: "",
  surchargeRate: "",
  cessRate: "",
  effectiveDate: "",
};

function AdvanceTaxManagement() {
  const [advanceTaxRules, setAdvanceTaxRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRuleData, setNewRuleData] = useState(initialNewAdvanceTaxState);
  const [expandedGroups, setExpandedGroups] = useState({});

  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  // IMPORTANT: Update this with your actual API endpoint for advance tax rules
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';
  const API_ENDPOINT = `${API_BASE_URL}/api/advance-tax-rules`;

  const fetchAdvanceTaxRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all rules by setting limit to -1
      const response = await axios.get(API_ENDPOINT, { params: { limit: -1 }, withCredentials: true });
      if (response.data && Array.isArray(response.data.data)) {
        setAdvanceTaxRules(response.data.data);
      } else {
        setAdvanceTaxRules([]);
        console.warn("Fetched Advance Tax rules but the data format was not as expected.", response.data);
      }
    } catch (err) {
      console.error("Error fetching Advance Tax rules:", err);
      setError(`Error fetching rules: ${err.response?.data?.message || err.message}`);
      setAdvanceTaxRules([]);
    } finally {
      setLoading(false);
    }
  }, [API_ENDPOINT]);

  useEffect(() => {
    fetchAdvanceTaxRules();
  }, [fetchAdvanceTaxRules]);

  // Group rules by Business Type to show historical data
  const groupedAdvanceTaxRules = useMemo(() => {
    const groups = {};
    advanceTaxRules.forEach(rule => {
      const key = rule.businessType;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(rule);
    });
    // Sort each group by effective date descending (newest first)
    for (const key in groups) {
      groups[key].sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    }
    return groups;
  }, [advanceTaxRules]);

  const handleToggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleOpenAddDialog = () => {
    setNewRuleData(initialNewAdvanceTaxState);
    setOpenAddDialog(true);
  };
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleDataChange = (event) => {
    const { name, value } = event.target;
    setNewRuleData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNew = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(API_ENDPOINT, data, { withCredentials: true });
      setSuccess("New Advance Tax rule added successfully.");
      fetchAdvanceTaxRules(); // Refetch data
      handleCloseAddDialog();
    } catch (err) {
      setError(`Failed to save rule: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_ENDPOINT}/${ruleId}`, { withCredentials: true });
      setSuccess("Advance Tax rule deleted successfully.");
      fetchAdvanceTaxRules(); // Refetch data
    } catch (err) {
      setError(`Failed to delete rule: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const confirmDelete = (ruleId, ruleName) => {
    confirm({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete the rule for "${ruleName}"? This action cannot be revoked.`,
      onConfirmAction: () => handleDeleteRule(ruleId),
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Advance Tax Settings
      </Typography>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Button variant="contained" onClick={handleOpenAddDialog} startIcon={<AddIcon />} sx={{ mb: 3 }}>
        Add New Rule
      </Button>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.200' }}>
              <TableRow>
                <TableCell sx={{ width: '5%' }} />
                <TableCell sx={{ fontWeight: 'bold' }}>Sl.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Business Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Turnover Limit (₹)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tax Rate (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Surcharge (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cess (%)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Effective Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedAdvanceTaxRules).map(([groupKey, groupRules], groupIndex) => {
                const isExpanded = expandedGroups[groupKey];
                const mainRule = groupRules[0];
                const historyRules = groupRules.slice(1);

                return (
                  <React.Fragment key={groupKey}>
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                       <TableCell>
                        {historyRules.length > 0 && (
                          <IconButton aria-label="expand row" size="small" onClick={() => handleToggleGroup(groupKey)}>
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell>{groupIndex + 1}</TableCell>
                      <TableCell component="th" scope="row">{mainRule.businessType}</TableCell>
                      <TableCell>{mainRule.description}</TableCell>
                      <TableCell>{new Intl.NumberFormat('en-IN').format(mainRule.turnoverLimit)}</TableCell>
                      <TableCell>{mainRule.taxRate?.toFixed(2)}%</TableCell>
                      <TableCell>{mainRule.surchargeRate?.toFixed(2)}%</TableCell>
                      <TableCell>{mainRule.cessRate?.toFixed(2)}%</TableCell>
                      <TableCell>{new Date(mainRule.effectiveDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => confirmDelete(mainRule._id, mainRule.businessType)} aria-label="delete rule">
                           <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {/* Historical Data Rows */}
                    {isExpanded && historyRules.map((historyRow) => (
                      <TableRow key={historyRow._id} hover sx={{ bgcolor: 'grey.50' }}>
                        <TableCell />
                        <TableCell />
                        <TableCell component="th" scope="row" style={{ fontStyle: 'italic', color: 'grey.600', paddingLeft: '2.5rem' }}>
                          History
                        </TableCell>
                        <TableCell style={{ fontStyle: 'italic', color: 'grey.600' }}>{historyRow.description}</TableCell>
                        <TableCell style={{ fontStyle: 'italic', color: 'grey.600' }}>{new Intl.NumberFormat('en-IN').format(historyRow.turnoverLimit)}</TableCell>
                        <TableCell style={{ fontStyle: 'italic', color: 'grey.600' }}>{historyRow.taxRate?.toFixed(2)}%</TableCell>
                        <TableCell style={{ fontStyle: 'italic', color: 'grey.600' }}>{historyRow.surchargeRate?.toFixed(2)}%</TableCell>
                        <TableCell style={{ fontStyle: 'italic', color: 'grey.600' }}>{historyRow.cessRate?.toFixed(2)}%</TableCell>
                        <TableCell style={{ fontStyle: 'italic', color: 'grey.600' }}>{new Date(historyRow.effectiveDate).toLocaleDateString('en-GB')}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => confirmDelete(historyRow._id, historyRow.businessType)} aria-label="delete rule">
                            <DeleteIcon fontSize="small"/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
               {Object.keys(groupedAdvanceTaxRules).length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={10} align="center">No Advance Tax rules configured yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Advance Tax Rule</DialogTitle>
        <DialogContent><AdvanceTaxForm data={newRuleData} onChange={handleDataChange} /></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={() => handleSaveNew(newRuleData)} variant="contained" disabled={loading}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdvanceTaxManagement;