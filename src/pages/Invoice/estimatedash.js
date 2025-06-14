import React from 'react';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
  TableSortLabel,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  TablePagination,
  Menu,
  MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    Cancel as CancelIcon,
    FilterList as FilterListIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    Receipt as ReceiptIcon,
    LocalShipping as LocalShippingIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// A light theme for the dashboard
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#673ab7',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#172b4d',
      secondary: '#6b778c',
    },
    success: {
        main: '#4caf50',
    },
    error: {
        main: '#f44336'
    },
    info: {
        main: '#2196f3'
    },
    warning: {
        main: '#ff9800'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    h5: {
      fontWeight: 600,
    },
    h6: {
        fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
        containedPrimary: {
            backgroundColor: '#2962ff',
            '&:hover': {
                backgroundColor: '#0039cb',
            }
        },
        containedSecondary: {
            backgroundColor: '#7e57c2',
            '&:hover': {
                backgroundColor: '#4d2c91',
            }
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            }
        }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }
      }
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                color: '#6b778c',
                fontWeight: '600',
                padding: '12px 16px',
            },
            body: {
                color: '#172b4d',
            }
        }
    }
  }
});

// Styled components for custom tab-like buttons
const NavButton = styled(Button)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.common.white : 'transparent',
  color: theme.palette.text.primary,
  boxShadow: selected ? '0px 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1, 2),
   '&:hover': {
     backgroundColor: selected ? theme.palette.common.white : theme.palette.action.hover,
   }
}));

// --- Reusable Header Component ---
const AppHeader = ({ activeTab }) => {
    const navItems = ['Overview', 'Sales Invoice', 'Credit Notes', 'Estimate', 'Other Platforms'];
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4
        }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, backgroundColor: '#f4f6f8', p: 0.5, borderRadius: '12px' }}>
                {navItems.map(item => (
                    <NavButton key={item} selected={activeTab === item}>
                    {item}
                    </NavButton>
                ))}
            </Box>

            {['Sales Invoice', 'Credit Notes', 'Estimate'].includes(activeTab) && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<UploadIcon />}>Import</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
            )}
        </Box>
    );
};

// --- Sorting utility functions ---
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// --- Reusable Enhanced Table Head ---
function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, onFilterClick, filters, headCells } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: '#fafafa' }}>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all estimates',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {headCell.sortable !== false ? (
                    <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={createSortHandler(headCell.id)}
                    >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                ) : (
                    headCell.label
                )}
                {headCell.filterable !== false && (
                    <IconButton size="small" onClick={(e) => onFilterClick(e, headCell.id)}>
                        <FilterListIcon fontSize="small" color={filters && filters[headCell.id]?.length > 0 ? 'primary' : 'inherit'} />
                    </IconButton>
                )}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// --- Estimate Page Component ---
const estimateHeadCells = [
    { id: 'id', label: 'Customer ID' },
    { id: 'customer', label: 'Customer Name' },
    { id: 'date', label: 'Estimate Date' },
    { id: 'amount', numeric: true, label: 'Estimate Amount' },
    { id: 'sentStatus', label: 'Sent/Unsent' },
    { id: 'download_share', label: 'Download / Share', sortable: false, filterable: false },
    { id: 'invoice_dl', label: 'Invoiced/Delivery Challan', sortable: false, filterable: false },
    { id: 'actions', label: 'Actions', sortable: false, filterable: false }
];

const EstimatePage = () => {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(8);
    const [filters, setFilters] = React.useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [currentFilterKey, setCurrentFilterKey] = React.useState(null);
    const [tempFilterValues, setTempFilterValues] = React.useState([]);
    const [filterSearch, setFilterSearch] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortAnchorEl, setSortAnchorEl] = React.useState(null);
    const [sortBy, setSortBy] = React.useState('This Month');
    const sortOptions = ['This Month', 'Last Month', 'This Year', 'All Time'];

    const estimateRows = React.useMemo(() => [
        { id: 'EST-00001', customer: 'John Doe', date: '11 Sep 2024', amount: 1200, sentStatus: 'Sent' },
        { id: 'EST-00002', customer: 'Jane Smith', date: '11 Sep 2024', amount: 2500, sentStatus: 'Unsent' },
        { id: 'EST-00003', customer: 'Jane Smith', date: '11 Sep 2024', amount: 2500, sentStatus: 'Sent' },
        { id: 'EST-00004', customer: 'Jane Smith', date: '11 Sep 2024', amount: 2500, sentStatus: 'Sent' },
        { id: 'EST-00005', customer: 'Jane Smith', date: '11 Sep 2024', amount: 2500, sentStatus: 'Unsent' },
        { id: 'EST-00006', customer: 'John Doe', date: '10 Sep 2024', amount: 1500, sentStatus: 'Sent' },
        { id: 'EST-00007', customer: 'Jane Smith', date: '10 Sep 2024', amount: 3000, sentStatus: 'Unsent' },
        { id: 'EST-00008', customer: 'Adam Johnson', date: '09 Sep 2024', amount: 500, sentStatus: 'Sent' },
    ], []);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = estimateRows.map((n) => n.id);
            setSelected(newSelected);
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

    const handleFilterClick = (event, key) => {
        setAnchorEl(event.currentTarget);
        setCurrentFilterKey(key);
        setFilterSearch('');
        setTempFilterValues(filters[key] || []);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
        setCurrentFilterKey(null);
        setTempFilterValues([]);
    };

    const handleFilterChange = (event) => {
        const { value, checked } = event.target;
        setTempFilterValues(prev =>
            checked ? [...prev, value] : prev.filter(item => item !== value)
        );
    };

    const handleSelectAllFilter = (event) => {
        if (event.target.checked) {
            setTempFilterValues(filteredUniqueColumnValues);
        } else {
            setTempFilterValues([]);
        }
    };

    const handleApplyFilter = () => {
        setFilters(prev => ({ ...prev, [currentFilterKey]: tempFilterValues }));
        handleFilterClose();
    };

    const handleClearFilter = () => {
        setFilters(prev => ({...prev, [currentFilterKey]: []}));
        handleFilterClose();
    }

    const handleSortMenuClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = () => {
        setSortAnchorEl(null);
    };

    const handleSortMenuItemClick = (option) => {
        setSortBy(option);
        handleSortMenuClose();
    };

    const filteredRows = React.useMemo(() => {
        let rows = estimateRows.filter(row => {
            return Object.keys(filters).every(key => {
                if (!filters[key] || filters[key].length === 0) return true;
                return filters[key].includes(row[key]);
            });
        });
        if (searchTerm) {
            rows = rows.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        return rows;
    }, [estimateRows, filters, searchTerm]);

    const uniqueColumnValues = currentFilterKey ? [...new Set(estimateRows.map(item => item[currentFilterKey]))] : [];

    const filteredUniqueColumnValues = uniqueColumnValues.filter(val => val.toString().toLowerCase().includes(filterSearch.toLowerCase()));

    const isAllSelected = filteredUniqueColumnValues.length > 0 && tempFilterValues.length === filteredUniqueColumnValues.length;
    const isIndeterminate = tempFilterValues.length > 0 && tempFilterValues.length < filteredUniqueColumnValues.length;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: {xs: 1, md: 2} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Typography variant="h6">Estimates</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                             <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}/>
                             <Button variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={handleSortMenuClick}>Sort by: {sortBy}</Button>
                             <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={handleSortMenuClose}>
                                 {sortOptions.map(option => <MenuItem key={option} onClick={() => handleSortMenuItemClick(option)}>{option}</MenuItem>)}
                             </Menu>
                            <Button variant="contained" startIcon={<AddIcon />}>New Estimate</Button>
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="estimate table">
                            <EnhancedTableHead
                                numSelected={selected.length}
                                onSelectAllClick={handleSelectAllClick}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                rowCount={estimateRows.length}
                                onFilterClick={handleFilterClick}
                                filters={filters}
                                headCells={estimateHeadCells}
                            />
                            <TableBody>
                                {stableSort(filteredRows, getComparator(order, orderBy))
                                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                 .map((row, index) => {
                                    const isItemSelected = isSelected(row.id);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => handleClick(event, row.id)}
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.id}
                                            selected={isItemSelected}
                                            sx={{cursor: 'pointer'}}
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
                                            <TableCell sx={{fontWeight: '500'}}>{row.id}</TableCell>
                                            <TableCell>{row.customer}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell align="right">{`$${row.amount.toLocaleString()}`}</TableCell>
                                            <TableCell>
                                                <Chip label={row.sentStatus} size="small" color={row.sentStatus === 'Sent' ? 'success' : 'warning'} sx={{fontWeight: 'bold'}} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex'}}>
                                                    <IconButton size="small" aria-label="download" color="primary"><DownloadIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="share" color="secondary"><ShareIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex'}}>
                                                    <IconButton size="small" aria-label="invoice" color="success"><ReceiptIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="delivery challan" color="info"><LocalShippingIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex'}}>
                                                    <IconButton size="small" aria-label="view" color="info"><VisibilityIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="edit" color="warning"><EditIcon fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="cancel" color="error"><CancelIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                     <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <Box sx={{ p: 2, pt: 1, width: 280 }}>
                             <TextField fullWidth size="small" variant="outlined" placeholder="Search..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>)}} sx={{mb: 1}}/>
                            <FormControlLabel
                                label="Select All"
                                 control={
                                    <Checkbox
                                        size="small"
                                        checked={isAllSelected}
                                        indeterminate={isIndeterminate}
                                        onChange={handleSelectAllFilter}
                                    />
                                }
                            />
                            <Divider/>
                            <FormGroup sx={{maxHeight: 200, overflow: 'auto', mt:1}}>
                                {filteredUniqueColumnValues.map(value => (
                                    <FormControlLabel
                                        key={value}
                                        control={<Checkbox checked={tempFilterValues.includes(String(value))} onChange={handleFilterChange} value={String(value)} size="small"/>}
                                        label={String(value)}
                                    />
                                ))}
                            </FormGroup>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                                <Button onClick={handleClearFilter} size="small">Clear</Button>
                                <Button onClick={handleApplyFilter} variant="contained" size="small">Apply</Button>
                            </Box>
                        </Box>
                    </Popover>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        component="div"
                        count={filteredRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>
            </Grid>
        </Grid>
    )
}

// --- Main App Component ---
export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <AppHeader activeTab="Estimate" />
        <EstimatePage />
      </Box>
    </ThemeProvider>
  );
}
