import React, { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  Search,
  Edit,
  Visibility,
  Delete,
  Add,
  FilterList,
  MoreVert,
  ViewColumn,
  CheckCircle,
  Cancel,
  FileUpload,
  FileDownload
} from '@mui/icons-material';

// --- Helper Components & Data ---

// Master list of all possible columns, now categorized
const categorizedColumns = [
    {
        category: 'General',
        columns: [
            { id: 'id', numeric: false, label: 'Customer ID', filterable: true },
            { id: 'companyName', numeric: false, label: 'Company Name', filterable: true },
            { id: 'name', numeric: false, label: 'Display Name', filterable: true },
            { id: 'businessType', numeric: false, label: 'Type of Business', filterable: true },
            { id: 'status', numeric: false, label: 'Status', filterable: true },
            { id: 'creationDate', numeric: false, label: 'Creation Date', filterable: false },
        ]
    },
    {
        category: 'Contact',
        columns: [
            { id: 'contactName', numeric: false, label: 'Name', filterable: true },
            { id: 'phone', numeric: false, label: 'Contact', filterable: true },
            { id: 'email', numeric: false, label: 'Email', filterable: true },
            { id: 'website', numeric: false, label: 'Website', filterable: true },
        ]
    },
    {
        category: 'Address',
        columns: [
            { id: 'billingState', numeric: false, label: 'Billing State', filterable: true },
            { id: 'deliveryState', numeric: false, label: 'Delivery State', filterable: true },
            { id: 'billingCountry', numeric: false, label: 'Billing Country', filterable: true },
            { id: 'deliveryCountry', numeric: false, label: 'Delivery Country', filterable: true },
        ]
    },
    {
        category: 'Financial',
        columns: [
            { id: 'paymentTerms', numeric: false, label: 'Payment Terms', filterable: true },
            { id: 'creditLimit', numeric: true, label: 'Credit Limit', filterable: false },
        ]
    },
     {
        category: 'Tax',
        columns: [
            { id: 'gstin', numeric: false, label: 'GSTIN', filterable: true },
            { id: 'tds', numeric: false, label: 'TDS', filterable: true },
            { id: 'tcs', numeric: false, label: 'TCS', filterable: true },
            { id: 'gstTds', numeric: false, label: 'GST TDS', filterable: true },
            { id: 'gstTcs', numeric: false, label: 'GST TCS', filterable: true },
        ]
    }
];

// Flattened list for easier access elsewhere in the component
const allColumns = categorizedColumns.flatMap(cat => cat.columns);


// Mock data for the customer table, including new fields.
const mockCustomers = [
  { id: 'CUST-001', creationDate: new Date('2024-05-15T10:00:00Z'), companyName: 'Innovate Inc.', name: 'Innovate Inc.', businessType: 'Technology', gstin: '22AAAAA0000A1Z5', contactName: 'John Doe', phone: '(123) 456-7890', email: 'contact@innovate.com', website: 'innovate.com', billingState: 'California', deliveryState: 'California', billingCountry: 'USA', deliveryCountry: 'USA', balance: 2500.00, paymentTerms: 'Net 30', creditLimit: 10000, tds: false, tcs: false, gstTds: false, gstTcs: false, status: 'Active', overdueDays: 0 },
  { id: 'CUST-002', creationDate: new Date('2025-06-20T11:00:00Z'), companyName: 'Synergy Corp.', name: 'Synergy Corp.', businessType: 'Consulting', gstin: '29BBBBB1111B2Z6', contactName: 'Jane Smith', phone: '(987) 654-3210', email: 'support@synergy.co', website: 'synergy.co', billingState: 'New York', deliveryState: 'New York', billingCountry: 'USA', deliveryCountry: 'USA', balance: 0.00, paymentTerms: 'Net 15', creditLimit: 5000, tds: false, tcs: false, gstTds: false, gstTcs: false, status: 'Active', overdueDays: 0 },
  { id: 'CUST-003', creationDate: new Date('2023-11-10T12:00:00Z'), companyName: 'Apex Solutions', name: 'Apex Solutions', businessType: 'Software', gstin: '27CCCCC2222C3Z7', contactName: 'Peter Jones', phone: '(555) 123-4567', email: 'admin@apex.io', website: 'apex.io', billingState: 'Texas', deliveryState: 'Texas', billingCountry: 'USA', deliveryCountry: 'USA', balance: 5150.75, paymentTerms: 'Net 30', creditLimit: 15000, tds: true, tcs: false, gstTds: false, gstTcs: false, status: 'Overdue', overdueDays: 15 },
  { id: 'CUST-004', creationDate: new Date('2025-07-05T13:00:00Z'), companyName: 'Quantum Systems', name: 'Quantum Systems', businessType: 'Hardware', gstin: '33DDDDD3333D4Z8', contactName: 'Mary Johnson', phone: '(222) 333-4444', email: 'info@quantum.dev', website: 'quantum.dev', billingState: 'Florida', deliveryState: 'Florida', billingCountry: 'USA', deliveryCountry: 'USA', balance: 850.00, paymentTerms: 'Net 60', creditLimit: 20000, tds: false, tcs: false, gstTds: false, gstTcs: false, status: 'Active', overdueDays: 0 },
  { id: 'CUST-005', creationDate: new Date('2025-07-12T14:00:00Z'), companyName: 'Future Gadgets', name: 'Future Gadgets', businessType: 'Retail', gstin: '06EEEEE4444E5Z9', contactName: 'David Williams', phone: '(444) 555-6666', email: 'sales@futuregadgets.com', website: 'futuregadgets.com', billingState: 'Washington', deliveryState: 'Washington', billingCountry: 'USA', deliveryCountry: 'USA', balance: 0.00, paymentTerms: 'COD', creditLimit: 2000, tds: false, tcs: true, gstTds: false, gstTcs: false, status: 'Inactive', overdueDays: 0 },
];

// Function to determine chip color based on status.
const getStatusChipProps = (status) => {
  switch (status) {
    case 'Active':
      return { label: status, color: 'success' };
    case 'Inactive':
      return { label: status, color: 'secondary' };
    case 'Overdue':
      return { label: status, color: 'error' };
    default:
      return { label: status, color: 'default' };
  }
};

// --- Advanced Filter Menu Component ---
const AdvancedFilterMenu = ({ anchorEl, onClose, columnId, columnLabel, options, selectedValues, onFilterChange }) => {
    const [searchText, setSearchText] = useState('');
    const [currentSelection, setCurrentSelection] = useState(selectedValues || []);

    useEffect(() => {
        setCurrentSelection(selectedValues || []);
    }, [selectedValues]);

    const handleToggle = (value) => {
        const currentIndex = currentSelection.indexOf(value);
        const newSelection = [...currentSelection];

        if (currentIndex === -1) {
            newSelection.push(value);
        } else {
            newSelection.splice(currentIndex, 1);
        }
        setCurrentSelection(newSelection);
    };

    const handleSelectAll = () => setCurrentSelection(options);
    const handleClear = () => setCurrentSelection([]);
    const handleApply = () => onFilterChange(columnId, currentSelection);

    const filteredOptions = options.filter(option =>
        String(option).toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} MenuListProps={{ 'aria-labelledby': 'basic-button' }} PaperProps={{ style: { minWidth: 250, maxHeight: 400 } }}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle1">Filter by {columnLabel}</Typography>
                <TextField size="small" variant="outlined" placeholder="Search values..." value={searchText} onChange={(e) => setSearchText(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search fontSize="small" /></InputAdornment>), }}/>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button size="small" onClick={handleSelectAll}>Select All</Button>
                    <Button size="small" onClick={handleClear}>Clear</Button>
                </Box>
            </Box>
            <Divider />
            <Box sx={{ overflowY: 'auto', maxHeight: 200, p: 1 }}>
                <FormGroup>
                    {filteredOptions.map((option) => (
                        <FormControlLabel key={option} control={<Checkbox checked={currentSelection.indexOf(option) !== -1} onChange={() => handleToggle(option)} />} label={String(option)}/>
                    ))}
                </FormGroup>
            </Box>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleApply}>Apply</Button>
            </Box>
        </Menu>
    );
};

// --- Column Chooser Dialog ---
const ColumnChooserDialog = ({ open, onClose, visibleColumns, onColumnToggle }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Show/Hide Columns</DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                {categorizedColumns.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.category}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{category.category}</Typography>
                        <Divider />
                        <FormGroup sx={{ pl: 1, mt: 1 }}>
                            {category.columns.map((column) => (
                                <FormControlLabel
                                    key={column.id}
                                    control={<Checkbox checked={visibleColumns.includes(column.id)} onChange={() => onColumnToggle(column.id)} />}
                                    label={column.label}
                                />
                            ))}
                        </FormGroup>
                    </Grid>
                ))}
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Done</Button>
        </DialogActions>
    </Dialog>
);


// --- Overdue Settings Dialog ---
const OverdueSettingsDialog = ({ open, onClose, onSave, value, onChange }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Overdue Status Settings</DialogTitle>
        <DialogContent>
            <Typography gutterBottom>Set the number of days after which a status is considered "Overdue".</Typography>
            <TextField
                autoFocus
                margin="dense"
                id="overdueDays"
                label="Overdue Days"
                type="number"
                fullWidth
                variant="standard"
                value={value}
                onChange={onChange}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onSave}>Save</Button>
        </DialogActions>
    </Dialog>
);


// --- Main Customer List Page Component ---

function CustomerListPage() { // <-- RENAMED THIS FUNCTION
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [anchorEl, setAnchorEl] = useState({});
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState([]); // State for selected rows
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [visibleColumns, setVisibleColumns] = useState(['id', 'name', 'email', 'phone', 'status']);
  const [overdueSettingsOpen, setOverdueSettingsOpen] = useState(false);
  const [overdueDays, setOverdueDays] = useState(30);
  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);


  // Handlers for filter menus
  const handleFilterIconClick = (event, columnId) => setAnchorEl(prev => ({ ...prev, [columnId]: event.currentTarget }));
  const handleFilterMenuClose = (columnId) => setAnchorEl(prev => ({ ...prev, [columnId]: null }));
  const handleFilterChange = (columnId, values) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (!values || values.length === 0) delete newFilters[columnId];
      else newFilters[columnId] = values;
      return newFilters;
    });
    setPage(1); // Reset to first page after filter change
    handleFilterMenuClose(columnId);
  };

  // Handlers for main "More" menu
  const handleMoreMenuClick = (event) => setMoreMenuAnchorEl(event.currentTarget);
  const handleMoreMenuClose = () => setMoreMenuAnchorEl(null);

  // Handlers for column chooser
  const handleColumnChooserClick = () => {
    setColumnChooserOpen(true);
    handleMoreMenuClose();
  };
  const handleColumnChooserClose = () => setColumnChooserOpen(false);
  const handleColumnToggle = (columnId) => {
    setVisibleColumns(prev =>
        prev.includes(columnId)
            ? prev.filter(id => id !== columnId)
            : [...prev, columnId]
    );
  };

  // Handlers for Overdue Settings
  const handleOverdueSettingsClick = () => {
    setOverdueSettingsOpen(true);
    handleMoreMenuClose();
  };
  const handleOverdueSettingsClose = () => setOverdueSettingsOpen(false);
  const handleOverdueSettingsSave = () => {
    // Here you would typically save the setting to a backend or global state
    console.log(`Overdue days set to: ${overdueDays}`);
    handleOverdueSettingsClose();
  };

    // Handlers for Import/Export
    const handleImport = () => alert('Import functionality would be implemented here.');
    const handleExportMenuClick = (event) => setExportMenuAnchorEl(event.currentTarget);
    const handleExportMenuClose = () => setExportMenuAnchorEl(null);
    const handleExport = (format) => {
        alert(`Exporting data as ${format}...`);
        handleExportMenuClose();
    };


  // Handler for sorting
  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

    // Handlers for selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredCustomers.map((n) => n.id);
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
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;


  const handlePageChange = (event, newPage) => setPage(newPage);

  const processedCustomers = useMemo(() => {
    return mockCustomers.map(c => {
        let status = c.status;
        // only update status for customers who are not 'Inactive'
        if (status !== 'Inactive' && c.balance > 0) {
            // Check if overdueDays is a number and the balance is positive
            const isOverdue = typeof c.overdueDays === 'number' && c.overdueDays >= overdueDays;
            status = isOverdue ? 'Overdue' : 'Active';
        }
        return { ...c, status };
    });
  }, [overdueDays]);

  const filteredCustomers = useMemo(() => {
    let customers = [...processedCustomers];
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      customers = customers.filter(c => Object.values(c).some(val => String(val).toLowerCase().includes(lowercasedTerm)));
    }
    if (Object.keys(filters).length > 0) {
        customers = customers.filter(customer => Object.entries(filters).every(([field, values]) => !values || values.length === 0 || values.includes(customer[field])));
    }
    customers.sort((a, b) => {
      const valA = a[orderBy];
      const valB = b[orderBy];
      if (typeof valA === 'number' && typeof valB === 'number') return order === 'asc' ? valA - valB : valB - valA;
      if (String(valA) < String(valB)) return order === 'asc' ? -1 : 1;
      if (String(valA) > String(valB)) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return customers;
  }, [processedCustomers, searchTerm, filters, order, orderBy]);

  const paginatedCustomers = useMemo(() => filteredCustomers.slice((page - 1) * rowsPerPage, page * rowsPerPage), [filteredCustomers, page, rowsPerPage]);
  const handleAddCustomerClick = () => window.location.href = 'http://localhost:3000/account-transaction/customer/new';
  const getUniqueColumnValues = (columnId) => [...new Set(mockCustomers.map(item => item[columnId]))];

  const renderCellContent = (customer, col) => {
    const taxColumns = ['tds', 'tcs', 'gstTds', 'gstTcs'];
    const value = customer[col.id];

    if (taxColumns.includes(col.id)) {
        return <Box sx={{ display: 'flex', justifyContent: 'center' }}>{value ? <CheckCircle color="success" /> : <Cancel color="error" />}</Box>;
    }
    if (col.id === 'status') {
        return <Chip {...getStatusChipProps(customer.status)} size="small" />;
    }
    if (col.id === 'creationDate' && value instanceof Date) {
        return value.toLocaleDateString();
    }
    if (col.numeric && typeof value === 'number') {
        return `$${value.toFixed(2)}`;
    }
    return value;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Customer List Section */}
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', mt: 4 }}>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 3 }}>
             <Box>
                <Typography variant="h5" fontWeight={600}>Customer List</Typography>
                {selected.length > 0 && (
                    <Typography color="text.secondary" variant="subtitle2" sx={{mt: 0.5}}>{selected.length} of {filteredCustomers.length} selected</Typography>
                )}
             </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Tooltip title="Import Customers">
                  <IconButton onClick={handleImport}>
                    <FileUpload />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Customers">
                  <IconButton onClick={handleExportMenuClick}>
                    <FileDownload />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={exportMenuAnchorEl} open={Boolean(exportMenuAnchorEl)} onClose={handleExportMenuClose}>
                    <MenuItem onClick={() => handleExport('PDF')}>PDF</MenuItem>
                    <MenuItem onClick={() => handleExport('EXCEL')}>EXCEL</MenuItem>
                </Menu>
                <TextField variant="outlined" size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>), sx: { borderRadius: '8px', width: { xs: '100%', sm: 'auto' } }, }} />
                <Button variant="contained" startIcon={<Add />} onClick={handleAddCustomerClick} sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}>Add New</Button>
                <Tooltip title="More options">
                    <IconButton onClick={handleMoreMenuClick}><MoreVert /></IconButton>
                </Tooltip>
                <Menu anchorEl={moreMenuAnchorEl} open={Boolean(moreMenuAnchorEl)} onClose={handleMoreMenuClose}>
                    <MenuItem onClick={handleColumnChooserClick}><ViewColumn sx={{ mr: 1 }}/>Show/Hide Columns</MenuItem>
                    <MenuItem onClick={handleOverdueSettingsClick}>Overdue Settings</MenuItem>
                </Menu>
                <ColumnChooserDialog open={columnChooserOpen} onClose={handleColumnChooserClose} visibleColumns={visibleColumns} onColumnToggle={handleColumnToggle} />
                <OverdueSettingsDialog open={overdueSettingsOpen} onClose={handleOverdueSettingsClose} onSave={handleOverdueSettingsSave} value={overdueDays} onChange={(e) => setOverdueDays(e.target.value)} />
            </Box>
          </Box>

          {/* Customer Table */}
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                   <TableCell padding="checkbox">
                     <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < filteredCustomers.length}
                        checked={filteredCustomers.length > 0 && selected.length === filteredCustomers.length}
                        onChange={handleSelectAllClick}
                        inputProps={{
                          'aria-label': 'select all customers',
                        }}
                      />
                   </TableCell>
                   {allColumns.filter(c => visibleColumns.includes(c.id)).map((headCell) => (
                    <TableCell key={headCell.id} align="center" sortDirection={orderBy === headCell.id ? order : false}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                        <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : 'asc'} onClick={() => handleSortRequest(headCell.id)}>{headCell.label}</TableSortLabel>
                        {headCell.filterable && (
                          <>
                            <IconButton size="small" sx={{ color: filters[headCell.id] && filters[headCell.id].length > 0 ? 'primary.main' : 'inherit' }} onClick={(e) => handleFilterIconClick(e, headCell.id)}><FilterList fontSize="inherit" /></IconButton>
                            <AdvancedFilterMenu anchorEl={anchorEl[headCell.id]} onClose={() => handleFilterMenuClose(headCell.id)} columnId={headCell.id} columnLabel={headCell.label} options={getUniqueColumnValues(headCell.id)} selectedValues={filters[headCell.id] || []} onFilterChange={handleFilterChange}/>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCustomers.map((customer) => {
                  const isItemSelected = isSelected(customer.id);
                  const labelId = `enhanced-table-checkbox-${customer.id}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, customer.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={customer.id}
                      selected={isItemSelected}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      {allColumns.filter(c => visibleColumns.includes(c.id)).map(col => (
                          <TableCell key={col.id} align="center">
                             {renderCellContent(customer, col)}
                          </TableCell>
                      ))}
                      <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => alert(`Viewing details for ${customer.id}`)}>
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Customer">
                                <IconButton size="small" color="primary" onClick={() => alert(`Editing ${customer.id}`)}>
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Customer">
                                <IconButton size="small" color="error" onClick={() => alert(`Deleting ${customer.id}`)}>
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                          </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer with Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', pt: 2, mt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
             <Typography variant="body2" color="text.secondary">Showing {paginatedCustomers.length} of {filteredCustomers.length} customers</Typography>
             <Pagination count={Math.ceil(filteredCustomers.length / rowsPerPage)} page={page} onChange={handlePageChange} color="primary" shape="rounded"/>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default CustomerListPage; // <-- RENAMED THIS EXPORT