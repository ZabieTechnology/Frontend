import React, { useState } from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogContentText from '@mui/material/DialogContentText'; // For confirmation dialog

const TransactionsPage = () => {
  // --- Tab State ---
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // --- Add Dialog State ---
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };
  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };

  // --- Edit Dialog State ---
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // Store the item being edited

  const handleEditDialogOpen = (item) => {
    setEditItem(item);
    setEditDialogOpen(true);
  };
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditItem(null);
  };

  // --- Delete Dialog State ---
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteDialogOpenItemId] = useState(null);

  const handleDeleteDialogOpen = (id) => {
    setDeleteDialogOpenItemId(id);
    setDeleteDialogOpen(true);
  };
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteDialogOpenItemId(null);
  };

  // --- Sorting State ---
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState(null);

  const handleSort = (property) => () => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // --- Data (Replace with your actual data and data fetching/management) ---
  const [transactionsData, setTransactionsData] = useState({
    toReview: [
      {
        user: 'SAMANDA',
        expenses: [
          {
            id: 1,
            date: '31/3/2024',
            expenseHead: 'Cab fare',
            typeOfExpense: 'Transportation Charges',
            total: '$ 2,500',
          },
          {
            id: 2,
            date: '31/3/2024',
            expenseHead: 'Hotel Expense',
            typeOfExpense: 'Hotel Expenses',
            total: '$ 2,500',
          },
          {
            id: 3,
            date: '31/3/2024',
            expenseHead: 'Flight Charges',
            typeOfExpense: 'Travel Charges',
            total: '$ 2,500',
          },
        ],
        approvalAmount: '$ 7,500',
      },
      {
        user: 'RAHUL',
        expenses: [
          {
            id: 4,
            date: '31/3/2024',
            expenseHead: 'Fuel',
            typeOfExpense: 'Fuel Charges',
            total: '$ 2,500',
          },
          {
            id: 5,
            date: '31/3/2024',
            expenseHead: 'Cab',
            typeOfExpense: 'Transportation Charges',
            total: '$ 2,500',
          },
        ],
        approvalAmount: '$ 5,000',
      },
    ],
    toPay: [
      {
        user: 'SAMANDA',
        expenses: [
          {
            id: 6,
            date: '31/3/2024',
            expenseHead: 'Cab fare',
            typeOfExpense: 'Transportation Charges',
            total: '$ 2,500',
          },
          {
            id: 7,
            date: '31/3/2024',
            expenseHead: 'Hotel Expense',
            typeOfExpense: 'Hotel Expenses',
            total: '$ 2,500',
          },
          {
            id: 8,
            date: '31/3/2024',
            expenseHead: 'Flight Charges',
            typeOfExpense: 'Travel Charges',
            total: '$ 2,000',
          },
        ],
        approvalAmount: '$ 7,500',
      },
      {
        user: 'RAHUL',
        expenses: [
          {
            id: 9,
            date: '31/3/2024',
            expenseHead: 'Fuel',
            typeOfExpense: 'Fuel Charges',
            total: '$ 2,500',
          },
          {
            id: 10,
            date: '31/3/2024',
            expenseHead: 'Cab',
            typeOfExpense: 'Transportation Charges',
            total: '$ 2,500',
          },
        ],
        approvalAmount: '$ 5,000',
      },
    ],
    all: [
      {
        id: 11,
        name: 'Samanda',
        date: '31/3/2024',
        expenseHead: 'Cab fare',
        typeOfExpense: 'Transportation Charges',
        total: '$ 2,500',
        status: 'Approve',
      },
      {
        id: 12,
        name: 'Samanda',
        date: '31/3/2024',
        expenseHead: 'Hotel Expense',
        typeOfExpense: 'Hotel Expenses',
        total: '$ 2,500',
        status: 'Paid',
      },
      {
        id: 13,
        name: 'Samanda',
        date: '31/3/2024',
        expenseHead: 'Flight Charges',
        typeOfExpense: 'Travel Charges',
        total: '$ 2,500',
        status: 'Approve',
      },
      {
        id: 14,
        name: 'Samanda',
        date: '31/3/2024',
        expenseHead: 'Cab fare',
        typeOfExpense: 'Transportation Charges',
        total: '$ 2,500',
        status: 'Declined',
      },
      {
        id: 15,
        name: 'Samanda',
        date: '31/3/2024',
        expenseHead: 'Cab fare',
        typeOfExpense: 'Transportation Charges',
        total: '$ 2,500',
        status: 'Paid',
      },
      {
        id: 16,
        name: 'Rahul',
        date: '31/3/2024',
        expenseHead: 'Hotel Expense',
        typeOfExpense: 'Hotel Expenses',
        total: '$ 2,500',
        status: 'Approve',
      },
      {
        id: 17,
        name: 'Rahul',
        date: '31/3/2024',
        expenseHead: 'Flight Charges',
        typeOfExpense: 'Travel Charges',
        total: '$ 2,500',
        status: 'Declined',
      },
      {
        id: 18,
        name: 'Rahul',
        date: '31/3/2024',
        expenseHead: 'Cab fare',
        typeOfExpense: 'Transportation Charges',
        total: '$ 2,500',
        status: 'Paid',
      },
      {
        id: 19,
        name: 'Rahul',
        date: '31/3/2024',
        expenseHead: 'Hotel Expense',
        typeOfExpense: 'Hotel Expenses',
        total: '$ 2,500',
        status: 'Approve',
      },
      {
        id: 20,
        name: 'Rahul',
        date: '31/3/2024',
        expenseHead: 'Flight Charges',
        typeOfExpense: 'Travel Charges',
        total: '$ 2,500',
        status: 'Paid',
      },
      {
        id: 21,
        name: 'Rahul',
        date: '31/3/2024',
        expenseHead: 'Hotel Expense',
        typeOfExpense: 'Hotel Expenses',
        total: '$ 2,500',
        status: 'Declined',
      },
    ],
  });

  // --- Styles ---
  const styles = {
    container: {
      padding: 3,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    tabs: {
      marginBottom: 2,
    },
    userSection: {
      marginBottom: 2,
    },
    avatar: {
      marginRight: 1,
    },
    tableContainer: {
      marginBottom: 2,
    },
    tableHeaderCell: {
      backgroundColor: '#e0e0e0',
      fontWeight: 'bold',
      textAlign: 'left',
    },
    actionCell: {
      textAlign: 'right',
    },
    addButton: {
      backgroundColor: '#1976d2',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1565c0',
      },
    },
    searchField: {
      marginRight: 1,
    },
    searchAndFilter: {
      display: 'flex',
      alignItems: 'center',
    },
    payAllButton: {
      backgroundColor: '#607D8B',
      color: 'white',
      '&:hover': {
        backgroundColor: '#455A64',
      },
    },
    allTableContainer: {
      marginTop: 2,
    },
    allTableHeaderCell: {
      backgroundColor: '#e0e0e0',
      fontWeight: 'bold',
      textAlign: 'left',
    },
    allTableCell: {
      textAlign: 'left',
    },
    allStatusCell: {
      color: (status) => {
        switch (status) {
          case 'Approve':
            return 'green';
          case 'Paid':
            return 'blue';
          case 'Declined':
            return 'red';
          default:
            return 'black';
        }
      },
      fontWeight: 'bold',
    },
    iconButton: {
      padding: 2,
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    },
    dialogPaper: {
      minWidth: '400px',
    },
  };

  // --- Components ---
  const UserTransactions = ({ user, expenses, approvalAmount, tab }) => {
    const isToPayTab = tab === 1;

    return (
      <Box sx={styles.userSection}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={styles.avatar}>{user.charAt(0)}</Avatar>
          <Typography variant="h6">{user}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 1 }}>
          {isToPayTab ? (
            <Button variant="contained" sx={styles.payAllButton}>
              Pay All : {approvalAmount}
            </Button>
          ) : (
            <Button variant="contained" color="primary">
              Approve All : {approvalAmount}
            </Button>
          )}
        </Box>
        <TableContainer component={Paper} sx={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={styles.tableHeaderCell}>
                  Select
                </TableCell>
                <TableCell sx={styles.tableHeaderCell}>Date</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Expense Head</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Type of Expense</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Total</TableCell>
                <TableCell sx={styles.tableHeaderCell}>Approval</TableCell>
                <TableCell sx={{ ...styles.tableHeaderCell, ...styles.actionCell }}>
                  View / Edit / Decline
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow key={expense.id}>
                  <TableCell padding="checkbox">
                    <Checkbox size="small" />
                  </TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.expenseHead}</TableCell>
                  <TableCell>{expense.typeOfExpense}</TableCell>
                  <TableCell>{expense.total}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="success" size="small">
                      Approve
                    </Button>
                  </TableCell>
                  <TableCell sx={styles.actionCell}>
                    <IconButton aria-label="view" size="small" sx={styles.iconButton}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      aria-label="edit"
                      size="small"
                      sx={styles.iconButton}
                      onClick={() => handleEditDialogOpen(expense)} // Open Edit Dialog
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="decline"
                      size="small"
                      sx={styles.iconButton}
                      onClick={() => handleDeleteDialogOpen(expense.id)} // Open Delete Confirmation
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const AllTransactionsTable = ({ transactions }) => {
    const sortedTransactions = React.useMemo(() => {
      if (!sortBy) {
        return transactions;
      }

      return [...transactions].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }, [transactions, sortBy, sortOrder]);

    return (
      <TableContainer component={Paper} sx={styles.allTableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={styles.allTableHeaderCell}>
                Select
              </TableCell>
              <TableCell
                sx={{ ...styles.allTableHeaderCell, cursor: 'pointer' }}
                sortDirection={sortBy === 'name' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortOrder : 'asc'}
                  onClick={handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{ ...styles.allTableHeaderCell, cursor: 'pointer' }}
                sortDirection={sortBy === 'date' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'date'}
                  direction={sortBy === 'date' ? sortOrder : 'asc'}
                  onClick={handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{ ...styles.allTableHeaderCell, cursor: 'pointer' }}
                sortDirection={sortBy === 'expenseHead' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'expenseHead'}
                  direction={sortBy === 'expenseHead' ? sortOrder : 'asc'}
                  onClick={handleSort('expenseHead')}
                >
                  Expense Head
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{ ...styles.allTableHeaderCell, cursor: 'pointer' }}
                sortDirection={sortBy === 'typeOfExpense' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'typeOfExpense'}
                  direction={sortBy === 'typeOfExpense' ? sortOrder : 'asc'}
                  onClick={handleSort('typeOfExpense')}
                >
                  Type of Expense
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{ ...styles.allTableHeaderCell, cursor: 'pointer' }}
                sortDirection={sortBy === 'total' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'total'}
                  direction={sortBy === 'total' ? sortOrder : 'asc'}
                  onClick={handleSort('total')}
                >
                  Total
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{ ...styles.allTableHeaderCell, cursor: 'pointer' }}
                sortDirection={sortBy === 'status' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={styles.allTableHeaderCell}>
                View / Edit / Decline
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions.map((transaction, index) => (
              <TableRow key={transaction.id}>
                <TableCell padding="checkbox">
                  <Checkbox size="small" />
                </TableCell>
                <TableCell sx={styles.allTableCell}>{transaction.name}</TableCell>
                <TableCell sx={styles.allTableCell}>{transaction.date}</TableCell>
                <TableCell sx={styles.allTableCell}>{transaction.expenseHead}</TableCell>
                <TableCell sx={styles.allTableCell}>{transaction.typeOfExpense}</TableCell>
                <TableCell sx={styles.allTableCell}>{transaction.total}</TableCell>
                <TableCell sx={{ ...styles.allTableCell, ...styles.allStatusCell, color: styles.allStatusCell.color(transaction.status) }}>
                  {transaction.status}
                </TableCell>
                <TableCell sx={styles.allTableCell}>
                  <IconButton aria-label="view" size="small" sx={styles.iconButton}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    aria-label="edit"
                    size="small"
                    sx={styles.iconButton}
                    onClick={() => handleEditDialogOpen(transaction)} // Open Edit Dialog
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label="decline"
                    size="small"
                    sx={styles.iconButton}
                    onClick={() => handleDeleteDialogOpen(transaction.id)} // Open Delete Confirmation
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const AddTransactionDialog = () => {
    const [name, setName] = useState('');
    const names = ['Samanda', 'Rahul', 'Other User'];
    const [date, setDate] = useState('');
    const [expenseHead, setExpenseHead] = useState('');
    const [typeOfExpense, setTypeOfExpense] = useState('');
    const [total, setTotal] = useState('');

    const handleSaveAdd = () => {
      // Logic to add the new transaction
      console.log('Adding new transaction:', { name, date, expenseHead, typeOfExpense, total });
      // Update data source (e.g., API call, state update)
      handleAddDialogClose();
    };

    return (
      <Dialog open={isAddDialogOpen} onClose={handleAddDialogClose} PaperProps={{ sx: styles.dialogPaper }}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="name-select-label">Name</InputLabel>
            <Select
              labelId="name-select-label"
              id="name-select"
              value={name}
              label="Name"
              onChange={(e) => setName(e.target.value)}
            >
              {names.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Date" fullWidth margin="normal" value={date} onChange={(e) => setDate(e.target.value)} />
          <TextField label="Expense Head" fullWidth margin="normal" value={expenseHead} onChange={(e) => setExpenseHead(e.target.value)} />
          <TextField label="Type of Expense" fullWidth margin="normal" value={typeOfExpense} onChange={(e) => setTypeOfExpense(e.target.value)} />
          <TextField label="Total" fullWidth margin="normal" type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAdd}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const EditTransactionDialog = () => {
    const [name, setName] = useState(editItem ? editItem.name : '');
    const [date, setDate] = useState(editItem ? editItem.date : '');
    const [expenseHead, setExpenseHead] = useState(editItem ? editItem.expenseHead : '');
    const [typeOfExpense, setTypeOfExpense] = useState(editItem ? editItem.typeOfExpense : '');
    const [total, setTotal] = useState(editItem ? editItem.total : '');

    const handleSaveEdit = () => {
      // Logic to save the edited transaction
      console.log('Saving edited transaction:', { ...editItem, name, date, expenseHead, typeOfExpense, total });
      // Update data source (e.g., API call, state update)
      handleEditDialogClose();
    };

    return (
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose} PaperProps={{ sx: styles.dialogPaper }}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="name-select-label">Name</InputLabel>
            <Select
              labelId="name-select-label"
              id="name-select"
              value={name}
              label="Name"
              onChange={(e) => setName(e.target.value)}
            >
              {['Samanda', 'Rahul', 'Other User'].map((n) => ( // Replace with your names
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Date" fullWidth margin="normal" value={date} onChange={(e) => setDate(e.target.value)} />
          <TextField label="Expense Head" fullWidth margin="normal" value={expenseHead} onChange={(e) => setExpenseHead(e.target.value)} />
          <TextField label="Type of Expense" fullWidth margin="normal" value={typeOfExpense} onChange={(e) => setTypeOfExpense(e.target.value)} />
          <TextField label="Total" fullWidth margin="normal" type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const DeleteConfirmationDialog = () => {
    const handleDeleteConfirm = () => {
      // Logic to delete the item
      console.log('Deleting item with ID:', deleteItemId);
      // Update data source (e.g., API call, state update)
      handleDeleteDialogClose();
    };

    return (
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // --- Main Component ---
  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h4">Transaction</Typography>
        <Box sx={styles.searchAndFilter}>
          <TextField
            size="small"
            placeholder="Search..."
            variant="outlined"
            sx={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton aria-label="advanced search" size="small">
            <TuneIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={styles.addButton}
            onClick={handleAddDialogOpen} // Open Add Dialog
          >
            Add New
          </Button>
        </Box>
      </Box>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={styles.tabs}>
        <Tab label="To Review" />
        <Tab label="To Pay" />
        <Tab label="All" />
      </Tabs>

      {selectedTab === 0 &&
        transactionsData.toReview.map((transaction, index) => (
          <UserTransactions
            key={transaction.user + index} // Use a more robust key
            user={transaction.user}
            expenses={transaction.expenses}
            approvalAmount={transaction.approvalAmount}
            tab={selectedTab}
          />
        ))}

      {selectedTab === 1 &&
        transactionsData.toPay.map((transaction, index) => (
          <UserTransactions
            key={transaction.user + index} // Use a more robust key
            user={transaction.user}
            expenses={transaction.expenses}
            approvalAmount={transaction.approvalAmount}
            tab={selectedTab}
          />
        ))}

      {selectedTab === 2 && <AllTransactionsTable transactions={transactionsData.all} />}

      <AddTransactionDialog />
      <EditTransactionDialog />
      <DeleteConfirmationDialog />
    </Box>
  );
};

export default TransactionsPage;