import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';

// --- INLINE SVG ICONS ---
const Add = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Search = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const ArrowDropDown = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);
const Edit = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const Eye = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const Cancel = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const FilterList = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const Download = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const Share = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
);


// --- THEME AND STYLING ---
const modernTheme = createTheme({
  palette: {
    primary: { main: '#007aff' },
    secondary: { main: '#6c757d' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#1c1c1e', secondary: '#6c757d' },
    success: { main: '#4caf50' },
    error: { main: '#d32f2f' },
    info: { main: '#2196f3' },
    warning: { main: '#ff9800' }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    h5: { fontWeight: 600, },
    h6: { fontWeight: 600, },
    button: { textTransform: 'none', fontWeight: 600, }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 20px', },
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: { borderRadius: 12, }
        }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', }
      }
    },
    MuiTableCell: {
        styleOverrides: {
            head: { color: '#6b778c', fontWeight: '600', padding: '12px 16px', },
            body: { color: '#172b4d', }
        }
    }
  }
});

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
              'aria-label': 'select all delivery challans',
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
                       <FilterList fontSize="small" color={filters && filters[headCell.id]?.length > 0 ? 'primary' : 'inherit'} />
                   </IconButton>
               )}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const getNatureChipStyles = (nature) => {
    const colors = {
        'Goods sent for Job Work': { bgColor: '#bbdefb', textColor: '#0d47a1' },
        'Goods sent for Approval': { bgColor: '#d1c4e9', textColor: '#311b92' },
        'Stock transfers between branches': { bgColor: '#e1bee7', textColor: '#4a148c' },
        'Exhibition or Demonstration': { bgColor: '#ffecb3', textColor: '#ff6f00' },
        'Return of Goods': { bgColor: '#ffcdd2', textColor: '#b71c1c' },
        'Supply on Approval': { bgColor: '#c8e6c9', textColor: '#1b5e20' },
    };
    const style = colors[nature] || { bgColor: '#e0e0e0', textColor: '#424242' };
    return { ...style, fontWeight: 'bold' };
};

// --- Delivery Challan Page Component ---
const deliveryChallanHeadCells = [
    { id: 'id', label: 'Delivery No.' },
    { id: 'customer', label: 'Customer Name' },
    { id: 'date', label: 'Delivery Date' },
    { id: 'nature', label: 'Nature' },
    { id: 'download_share', label: 'Download / Share', sortable: false, filterable: false },
    { id: 'actions', label: 'Actions', sortable: false, filterable: false }
];

const DeliveryChallanPage = () => {
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

    const challanRows = React.useMemo(() => [
        { id: 'DLY-00001', customer: 'John Doe', date: '11 Sep 2024', nature: 'Goods sent for Job Work' },
        { id: 'DLY-00002', customer: 'Jane Smith', date: '11 Sep 2024', nature: 'Goods sent for Approval' },
        { id: 'DLY-00003', customer: 'Jane Smith', date: '11 Sep 2024', nature: 'Stock transfers between branches' },
        { id: 'DLY-00004', customer: 'Jane Smith', date: '11 Sep 2024', nature: 'Exhibition or Demonstration' },
        { id: 'DLY-00005', customer: 'Jane Smith', date: '11 Sep 2024', nature: 'Return of Goods' },
        { id: 'DLY-00006', customer: 'John Doe', date: '10 Sep 2024', nature: 'Supply on Approval' },
        { id: 'DLY-00007', customer: 'Jane Smith', date: '10 Sep 2024', nature: 'Goods sent for Job Work' },
        { id: 'DLY-00008', customer: 'Adam Johnson', date: '09 Sep 2024', nature: 'Goods sent for Approval' },
    ], []);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = challanRows.map((n) => n.id);
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
        let rows = challanRows.filter(row => {
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
    }, [challanRows, filters, searchTerm]);

    const uniqueColumnValues = currentFilterKey ? [...new Set(challanRows.map(item => item[currentFilterKey]))] : [];

    const filteredUniqueColumnValues = uniqueColumnValues.filter(val => String(val).toLowerCase().includes(filterSearch.toLowerCase()));

    const isAllSelected = filteredUniqueColumnValues.length > 0 && tempFilterValues.length === filteredUniqueColumnValues.length;
    const isIndeterminate = tempFilterValues.length > 0 && tempFilterValues.length < filteredUniqueColumnValues.length;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: {xs: 1, md: 2} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Typography variant="h6">Delivery Challan</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><Search/></InputAdornment>)}}/>
                            <Button variant="outlined" endIcon={<ArrowDropDown />} onClick={handleSortMenuClick}>Sort by: {sortBy}</Button>
                            <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={handleSortMenuClose}>
                                {sortOptions.map(option => <MenuItem key={option} onClick={() => handleSortMenuItemClick(option)}>{option}</MenuItem>)}
                            </Menu>
                           <Button variant="contained" startIcon={<Add />}>New Delivery Challan</Button>
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="delivery challan table">
                            <EnhancedTableHead
                                numSelected={selected.length}
                                onSelectAllClick={handleSelectAllClick}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                rowCount={challanRows.length}
                                onFilterClick={handleFilterClick}
                                filters={filters}
                                headCells={deliveryChallanHeadCells}
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
                                            <TableCell>
                                                <Chip label={row.nature} size="small" sx={getNatureChipStyles(row.nature)} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex'}}>
                                                    <IconButton size="small" aria-label="download" color="primary"><Download fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="share" color="secondary"><Share fontSize="small" /></IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex'}}>
                                                    <IconButton size="small" aria-label="view" color="info"><Eye fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="edit" color="warning"><Edit fontSize="small" /></IconButton>
                                                    <IconButton size="small" aria-label="cancel" color="error"><Cancel fontSize="small" /></IconButton>
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
                             <TextField fullWidth size="small" variant="outlined" placeholder="Search..." value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><Search fontSize="small"/></InputAdornment>)}} sx={{mb: 1}}/>
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
    <ThemeProvider theme={modernTheme}>
      <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 }, minHeight: '100vh' }}>
        <DeliveryChallanPage />
      </Box>
    </ThemeProvider>
  );
}