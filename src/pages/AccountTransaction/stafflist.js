// src/pages/AccountTransaction/StaffListPage.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Avatar,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  CircularProgress,
  Alert,
  Link,
  Switch,
  Checkbox,
  Menu,
  FormControlLabel,
  FormGroup,
  TableSortLabel,
  Tooltip,
  Grid,
  Card,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  MoreVert,
  FilterList,
  PeopleAlt,
  BusinessCenter,
  AccountBalanceWallet,
  Store,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useConfirmationDialog from '../../hooks/useConfirmationDialog';

const headCellsInitial = [
    { id: 'firstName', label: 'First Name', numeric: false },
    { id: 'lastName', label: 'Last Name', numeric: false },
    { id: 'department', label: 'Department', numeric: false },
    { id: 'designation', label: 'Designation', numeric: false },
    { id: 'salesAgent', label: 'Sales Agent', numeric: false },
    { id: 'outstandingAmount', label: 'Outstanding Amount', numeric: true },
    { id: 'customField', label: 'Custom Field', numeric: false },
];

const SummaryCard = ({ title, value, icon, color }) => (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h5" component="div">
                {value}
            </Typography>
        </Box>
        <Box>
             <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
                {icon}
            </Avatar>
        </Box>
    </Card>
);


const StaffListPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState([]);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);
  const [tempFilterValues, setTempFilterValues] = useState([]);
  const [filterValueSearch, setFilterValueSearch] = useState('');


  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('firstName');

  const [visibleColumns, setVisibleColumns] = useState(headCellsInitial.map(c => c.id));
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState(null);


  const navigate = useNavigate();
  const { confirm, ConfirmationDialog } = useConfirmationDialog();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: searchTerm,
        sort: orderBy,
        order,
        ...filters,
      };
      const response = await axios.get(`${API_BASE_URL}/api/staff`, {
        params,
        withCredentials: true,
        paramsSerializer: params => {
            return Object.entries(params).map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `${key}[]=${encodeURIComponent(v)}`).join('&');
                }
                return `${key}=${encodeURIComponent(value)}`;
            }).join('&');
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const staffWithDemoData = response.data.data.map((staff, index) => ({
            ...staff,
            hasBackendData: index % 3 === 0,
        }));
        setStaffMembers(staffWithDemoData);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);

        const outstanding = staffWithDemoData.reduce((sum, staff) => sum + (staff.outstandingAmount || 0), 0);
        const departments = new Set(staffWithDemoData.map(s => s.department).filter(Boolean));
        setSummaryData({
            totalStaff: response.data.total || 0,
            salesAgents: staffWithDemoData.filter(s => s.isSalesAgent).length,
            totalDepartments: departments.size,
            totalOutstanding: outstanding.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        });

      } else {
        setStaffMembers([]);
        setTotalItems(0);
        setTotalPages(0);
        setError('Failed to fetch staff: Invalid data format.');
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(
        `Error fetching staff: ${err.response?.data?.message || err.message}`
      );
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, page, itemsPerPage, searchTerm, orderBy, order, filters]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = staffMembers.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const uniqueColumnValues = useMemo(() => {
    if (!filterColumn) return [];
    const values = new Set(staffMembers.map(item => item[filterColumn]));
    const filteredValues = Array.from(values).filter(Boolean);
    if(filterValueSearch){
        return filteredValues.filter(val => String(val).toLowerCase().includes(filterValueSearch.toLowerCase()));
    }
    return filteredValues;
  }, [staffMembers, filterColumn, filterValueSearch]);

  const handleFilterMenuOpen = (event, column) => {
    setFilterMenuAnchorEl(event.currentTarget);
    setFilterColumn(column);
    setTempFilterValues(filters[column] || []);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
    setFilterColumn(null);
    setFilterValueSearch('');
  };

  const handleApplyFilter = () => {
    setFilters(prev => ({...prev, [filterColumn]: tempFilterValues}));
    handleFilterMenuClose();
  };

  const handleTempFilterChange = (value) => {
      setTempFilterValues(prev =>
          prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
  };

  const handleClearAllTempFilters = () => setTempFilterValues([]);
  const handleSelectAllTempFilters = () => setTempFilterValues(uniqueColumnValues);

  const handleColumnMenuOpen = (event) => setColumnMenuAnchorEl(event.currentTarget);
  const handleColumnMenuClose = () => setColumnMenuAnchorEl(null);

  const handleToggleColumn = (columnId) => {
    setVisibleColumns(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };


  const handleAddStaff = () => navigate('/account-transaction/staff/new');
  const handleEditStaff = (staffId) => navigate(`/account-transaction/staff/edit/${staffId}`);
  const handleViewStaff = (staffId) => navigate(`/account-transaction/staff/edit/${staffId}?view=true`);

  const handleDeleteStaff = async (staffId, staffName) => {
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/staff/${staffId}`, { withCredentials: true });
      setSuccess(`Staff member "${staffName}" deleted successfully.`);
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete staff: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDelete = (staffId, staffName) => {
    confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete staff member "${staffName || staffId}"?`,
      onConfirmAction: () => handleDeleteStaff(staffId, staffName),
    });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeItemsPerPage = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const headCells = useMemo(() => headCellsInitial.filter(c => visibleColumns.includes(c.id)), [visibleColumns]);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5' }}>
      <ConfirmationDialog />
      <Typography variant="h4" gutterBottom sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
        Staff Management
      </Typography>

      {summaryData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                  <SummaryCard title="Total Staff" value={summaryData.totalStaff} icon={<PeopleAlt />} color="primary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                  <SummaryCard title="Sales Agents" value={summaryData.salesAgents} icon={<Store />} color="secondary" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                  <SummaryCard title="Total Departments" value={summaryData.totalDepartments} icon={<BusinessCenter />} color="warning" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                  <SummaryCard title="Total Outstanding" value={summaryData.totalOutstanding} icon={<AccountBalanceWallet />} color="error" />
              </Grid>
          </Grid>
      )}


      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 2, bgcolor: '#fff', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Staff List</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField label="Search Staff" variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange}/>
            <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddStaff}>
              Add New Staff
            </Button>
            <IconButton onClick={handleColumnMenuOpen}><MoreVert /></IconButton>
          </Box>
        </Box>

        {loading && !summaryData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < staffMembers.length}
                      checked={staffMembers.length > 0 && selected.length === staffMembers.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  {headCells.map((headCell) => (
                    <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleSortRequest(headCell.id)}>
                          {headCell.label}
                        </TableSortLabel>
                        <IconButton size="small" onClick={(e) => handleFilterMenuOpen(e, headCell.id)}>
                          <FilterList fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={headCells.length + 2} align="center"><CircularProgress/></TableCell></TableRow>
                : staffMembers.length > 0 ? staffMembers.map((staff) => {
                    const isItemSelected = isSelected(staff._id);
                    return (
                      <TableRow key={staff._id} hover onClick={(event) => handleClick(event, staff._id)} role="checkbox" aria-checked={isItemSelected} tabIndex={-1} selected={isItemSelected}>
                        <TableCell padding="checkbox"><Checkbox checked={isItemSelected} /></TableCell>
                        {visibleColumns.includes('firstName') && <TableCell><Link component="button" variant="body2" onClick={(e) => { e.stopPropagation(); handleViewStaff(staff._id); }} sx={{ textAlign: 'left' }}>{staff.firstName}</Link></TableCell>}
                        {visibleColumns.includes('lastName') && <TableCell>{staff.lastName}</TableCell>}
                        {visibleColumns.includes('department') && <TableCell>{staff.department || 'N/A'}</TableCell>}
                        {visibleColumns.includes('designation') && <TableCell>{staff.designation || 'N/A'}</TableCell>}
                        {visibleColumns.includes('salesAgent') && <TableCell><Switch checked={!!staff.isSalesAgent} readOnly size="small" /></TableCell>}
                        {visibleColumns.includes('outstandingAmount') && <TableCell>{staff.outstandingAmount ? staff.outstandingAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</TableCell>}
                        {visibleColumns.includes('customField') && <TableCell>{staff.customField || 'N/A'}</TableCell>}
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleViewStaff(staff._id); }}><Visibility fontSize="small"/></IconButton>
                          <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditStaff(staff._id);}}><Edit fontSize="small"/></IconButton>
                          <Tooltip title={staff.hasBackendData ? "Cannot delete staff with associated data" : "Delete"}>
                              <span>
                                <IconButton size="small" color="error" disabled={staff.hasBackendData} onClick={(e) => { e.stopPropagation(); confirmDelete(staff._id, `${staff.firstName} ${staff.lastName}`);}}><Delete fontSize="small"/></IconButton>
                              </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                 : (
                  <TableRow><TableCell colSpan={headCells.length + 2} align="center">No staff members found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Menu anchorEl={columnMenuAnchorEl} open={Boolean(columnMenuAnchorEl)} onClose={handleColumnMenuClose}>
             <Typography sx={{px: 2, py: 1, fontWeight: 'bold'}}>View/Hide Columns</Typography>
            <FormGroup sx={{p:2}}>
                {headCellsInitial.map(col => (
                    <FormControlLabel key={col.id} control={<Checkbox checked={visibleColumns.includes(col.id)} onChange={() => handleToggleColumn(col.id)} />} label={col.label} />
                ))}
            </FormGroup>
        </Menu>

        <Menu anchorEl={filterMenuAnchorEl} open={Boolean(filterMenuAnchorEl)} onClose={handleFilterMenuClose} PaperProps={{ sx: { width: 320 }}}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Filter by {filterColumn}</Typography>
            <TextField fullWidth variant="standard" placeholder="Search values..." value={filterValueSearch} onChange={(e) => setFilterValueSearch(e.target.value)} />
            <Box sx={{display: 'flex', justifyContent: 'space-between', my: 1}}>
                <Button size="small" onClick={handleSelectAllTempFilters}>Select All</Button>
                <Button size="small" onClick={handleClearAllTempFilters}>Clear</Button>
            </Box>
            <FormGroup sx={{maxHeight: 200, overflowY: 'auto'}}>
              {uniqueColumnValues.map((value) => (
                <FormControlLabel key={value} control={<Checkbox checked={tempFilterValues.includes(value)} onChange={() => handleTempFilterChange(value)}/>} label={String(value)} />
              ))}
            </FormGroup>
            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1}}>
                <Button onClick={handleFilterMenuClose}>Cancel</Button>
                <Button variant="contained" onClick={handleApplyFilter}>Apply</Button>
            </Box>
          </Box>
        </Menu>

        {!loading && totalItems > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">Items per page:</Typography>
              <Select value={itemsPerPage} onChange={handleChangeItemsPerPage} size="small" sx={{ ml: 1, mr: 2 }}>
                {[5, 10, 20, 50].map((val) => (<MenuItem key={val} value={val}>{val}</MenuItem>))}
              </Select>
              <Typography variant="body2">
                Showing {Math.min((page - 1) * itemsPerPage + 1, totalItems)}-
                {Math.min(page * itemsPerPage, totalItems)} of {totalItems}
              </Typography>
            </Box>
            <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary"/>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StaffListPage;
