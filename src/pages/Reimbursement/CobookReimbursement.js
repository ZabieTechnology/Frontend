import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
  DialogContentText,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';

// A more modern, clean theme for the app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
            }
        }
    }
  },
});


const initialTransactionsData = {
    toReview: [
      {
        user: 'SAMANDA',
        expenses: [
          { id: 1, date: '2024-03-31', expenseHead: 'Cab fare', typeOfExpense: 'Transportation', total: 2500 },
          { id: 2, date: '2024-03-31', expenseHead: 'Hotel Expense', typeOfExpense: 'Accommodation', total: 8500 },
          { id: 3, date: '2024-03-30', expenseHead: 'Flight Charges', typeOfExpense: 'Travel', total: 12500 },
        ],
      },
      {
        user: 'RAHUL',
        expenses: [
          { id: 4, date: '2024-03-29', expenseHead: 'Fuel', typeOfExpense: 'Vehicle', total: 3000 },
          { id: 5, date: '2024-03-29', expenseHead: 'Client Dinner', typeOfExpense: 'Meals', total: 4200 },
        ],
      },
    ],
    toPay: [
      {
        user: 'SAMANDA',
        expenses: [
          { id: 6, date: '2024-03-25', expenseHead: 'Office Supplies', typeOfExpense: 'Stationery', total: 1500 },
          { id: 7, date: '2024-03-24', expenseHead: 'Internet Bill', typeOfExpense: 'Utilities', total: 2000 },
        ],
      },
    ],
    all: [
      { id: 1, name: 'Samanda', date: '2024-03-31', expenseHead: 'Cab fare', typeOfExpense: 'Transportation', total: 2500, status: 'To Review' },
      { id: 2, name: 'Samanda', date: '2024-03-31', expenseHead: 'Hotel Expense', typeOfExpense: 'Accommodation', total: 8500, status: 'To Review' },
      { id: 3, name: 'Samanda', date: '2024-03-30', expenseHead: 'Flight Charges', typeOfExpense: 'Travel', total: 12500, status: 'Approved' },
      { id: 4, name: 'Rahul', date: '2024-03-29', expenseHead: 'Fuel', typeOfExpense: 'Vehicle', total: 3000, status: 'To Review' },
      { id: 5, name: 'Rahul', date: '2024-03-29', expenseHead: 'Client Dinner', typeOfExpense: 'Meals', total: 4200, status: 'Paid' },
      { id: 6, name: 'Samanda', date: '2024-03-25', expenseHead: 'Office Supplies', typeOfExpense: 'Stationery', total: 1500, status: 'To Pay' },
      { id: 7, name: 'Samanda', date: '2024-03-24', expenseHead: 'Internet Bill', typeOfExpense: 'Utilities', total: 2000, status: 'Declined' },
    ],
  };


// --- Helper Functions ---
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

// --- Reusable Components ---

const StatusChip = ({ status }) => {
    const style = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '0.75rem',
      color: '#fff',
      backgroundColor: '#9e9e9e', // Default grey
    };

    switch (status) {
      case 'To Review':
      case 'Approved':
        style.backgroundColor = '#4caf50'; // Green
        break;
      case 'To Pay':
        style.backgroundColor = '#ff9800'; // Orange
        break;
      case 'Paid':
        style.backgroundColor = '#2196f3'; // Blue
        break;
      case 'Declined':
        style.backgroundColor = '#f44336'; // Red
        break;
      default:
        break;
    }

    return <Box component="span" sx={style}>{status}</Box>;
};

const UserTransactions = ({ userData, onEdit, onDelete }) => {
    const totalAmount = userData.expenses.reduce((sum, exp) => sum + exp.total, 0);

    return (
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>{userData.user.charAt(0)}</Avatar>
            <Typography variant="h6">{userData.user}</Typography>
          </Box>
          <Button variant="contained">
            Approve All : ${totalAmount.toLocaleString()}
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Expense Head</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userData.expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.expenseHead}</TableCell>
                  <TableCell>{expense.typeOfExpense}</TableCell>
                  <TableCell align="right">${expense.total.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => onEdit(expense)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => onDelete(expense.id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
};

const AllTransactionsTable = ({ transactions, onEdit, onDelete }) => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('date');

    const handleRequestSort = (property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };

    const headCells = [
        { id: 'name', label: 'Name' },
        { id: 'date', label: 'Date' },
        { id: 'expenseHead', label: 'Expense Head' },
        { id: 'typeOfExpense', label: 'Type' },
        { id: 'total', label: 'Total', numeric: true },
        { id: 'status', label: 'Status' },
        { id: 'actions', label: 'Actions', disableSorting: true },
    ];

    const sortedRows = useMemo(() =>
        [...transactions].sort(getComparator(order, orderBy)),
    [transactions, order, orderBy]);

    return (
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                    {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        {headCell.disableSorting ? (
                            headCell.label
                        ) : (
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={() => handleRequestSort(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                            ) : null}
                        </TableSortLabel>
                        )}
                    </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox"><Checkbox size="small" /></TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.expenseHead}</TableCell>
                  <TableCell>{row.typeOfExpense}</TableCell>
                  <TableCell align="right">${row.total.toLocaleString()}</TableCell>
                  <TableCell><StatusChip status={row.status} /></TableCell>
                  <TableCell align="left">
                    <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => onEdit(row)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => onDelete(row.id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
};

const TransactionDialog = ({ open, onClose, transaction, onSave }) => {
    const [formData, setFormData] = useState({});

    React.useEffect(() => {
      // Initialize form data when dialog opens or transaction changes
      setFormData(transaction || {
        name: 'Samanda',
        date: new Date().toISOString().split('T')[0],
        expenseHead: '',
        typeOfExpense: 'Transportation',
        total: '',
      });
    }, [transaction, open]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
      // Simple validation
      if (!formData.expenseHead || !formData.total) {
        alert('Please fill in all required fields.');
        return;
      }
      onSave(formData);
      onClose();
    };

    return (
      <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '400px' } }}>
        <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Name</InputLabel>
            <Select name="name" value={formData.name || ''} label="Name" onChange={handleChange}>
              <MenuItem value="Samanda">Samanda</MenuItem>
              <MenuItem value="Rahul">Rahul</MenuItem>
            </Select>
          </FormControl>
          <TextField name="date" label="Date" type="date" fullWidth margin="dense" value={formData.date || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField name="expenseHead" label="Expense Head" fullWidth margin="dense" value={formData.expenseHead || ''} onChange={handleChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type of Expense</InputLabel>
            <Select name="typeOfExpense" value={formData.typeOfExpense || ''} label="Type of Expense" onChange={handleChange}>
              <MenuItem value="Transportation">Transportation</MenuItem>
              <MenuItem value="Accommodation">Accommodation</MenuItem>
              <MenuItem value="Meals">Meals</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField name="total" label="Total Amount" type="number" fullWidth margin="dense" value={formData.total || ''} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    );
};

const DeleteConfirmationDialog = ({ open, onClose, onConfirm }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent><DialogContentText>Are you sure you want to delete this transaction? This action cannot be undone.</DialogContentText></DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>Delete</Button>
      </DialogActions>
    </Dialog>
);


// --- Main Page Component ---
const TransactionsPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [transactionsData] = useState(initialTransactionsData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleTabChange = (event, newValue) => setSelectedTab(newValue);

  const handleOpenDialog = (transaction = null) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = (data) => {
    // This is where you would call an API
    // For now, we just update the local state
    console.log("Saving:", data);
    // Logic to update state would go here
  };

  const handleOpenDeleteDialog = (id) => setDeleteId(id);

  const handleCloseDeleteDialog = () => setDeleteId(null);

  const handleConfirmDelete = () => {
    console.log("Deleting:", deleteId);
    // Logic to update state would go here
    handleCloseDeleteDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Transactions</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField size="small" placeholder="Search..." InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
          <IconButton><TuneIcon /></IconButton>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Expense Claim
          </Button>
          <Button variant="contained" onClick={() => console.log('Mileage Claim Clicked')}>
            Mileage Claim
          </Button>
        </Box>
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="To Review" />
        <Tab label="To Pay" />
        <Tab label="All" />
      </Tabs>

      {selectedTab === 0 && transactionsData.toReview.map(data =>
          <UserTransactions key={data.user} userData={data} onEdit={handleOpenDialog} onDelete={handleOpenDeleteDialog} />
      )}
      {selectedTab === 1 && transactionsData.toPay.map(data =>
          <UserTransactions key={data.user} userData={data} onEdit={handleOpenDialog} onDelete={handleOpenDeleteDialog} />
      )}
      {selectedTab === 2 &&
          <AllTransactionsTable transactions={transactionsData.all} onEdit={handleOpenDialog} onDelete={handleOpenDeleteDialog} />
      }

      <TransactionDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        transaction={editingTransaction}
        onSave={handleSaveTransaction}
      />
      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

// --- App Entry Point ---
export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <TransactionsPage />
        </ThemeProvider>
    );
}
