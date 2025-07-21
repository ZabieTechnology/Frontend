import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, InputBase, Button, Tabs, Tab, Box, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox,
  Select, MenuItem, FormControl, InputLabel, IconButton, TextField, Grid, Chip, Tooltip,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Popover, Divider, TableSortLabel, FormGroup,
  FormControlLabel, Alert
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GavelIcon from '@mui/icons-material/Gavel'; // Icon for Rule Match
import PaymentIcon from '@mui/icons-material/Payment'; // Icon for Overpayment
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Icon for Bank Account
import CreditCardIcon from '@mui/icons-material/CreditCard'; // Icon for Credit Card
import { visuallyHidden } from '@mui/utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme for the application
// This theme defines the color palette, typography, and component-specific style overrides.
const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' }, // Green primary color
    secondary: { main: '#6c757d' }, // Grey secondary color
    background: { default: '#f4f6f8', paper: '#ffffff' }, // Light grey background
    text: { primary: '#333333', secondary: '#555555' },
    info: { main: '#2196F3' }, // Blue for informational elements
    error: { main: '#D32F2F'} // Red for error states
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif', // Modern, readable font
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 } // Buttons with normal casing
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          '&.Mui-selected': { color: '#4CAF50' } // Selected tab color
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#4CAF50' } // Tab indicator color
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': { backgroundColor: '#388E3C' } // Darker green on hover for primary buttons
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '8px' } // Slightly more rounded chips
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#E8F5E9', // Light green background for table headers
          fontWeight: 'bold',
          color: '#2E7D32', // Dark green text for table headers
          paddingTop: '8px',
          paddingBottom: '8px',
          position: 'relative' // For filter icon positioning
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.5), // Slight white transparency for text fields
          borderRadius: '4px',
          '& .MuiInputBase-input': {
            padding: '8px 10px',
            fontSize: '0.875rem'
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: alpha('#000000', 0.15) }, // Lighter border
            '&:hover fieldset': { borderColor: alpha('#000000', 0.3) }, // Darker border on hover
            '&.Mui-focused fieldset': { borderColor: '#4CAF50' } // Primary color border when focused
          }
        }
      }
    }
  }
});

// Styled component for the search bar container
// Provides a consistent look and feel for search inputs across the application.
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05), // Light background for search
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1), // Darker on hover
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: { // Responsive width
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

// Styled component for the search icon wrapper within the search bar
// Ensures the search icon is correctly positioned.
const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none', // Icon doesn't interfere with input
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Styled component for the search input field itself
// Customizes the padding and transition for the input base.
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`, // Padding for the icon
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch', // Wider on medium screens and up
    },
  },
}));

// --- Mock Data & Constants ---
const ACCOUNTS_RECEIVABLE_ID = 'accAR'; // Constant for Accounts Receivable ID

const mockBankAccounts = [
    {id: 'ba1', name: 'Main Checking Account (XXX-1234)', currency: 'SGD'},
    {id: 'ba2', name: 'Savings Account (YYY-5678)', currency: 'SGD'},
    {id: 'ba3', name: 'Business USD Account (ZZZ-9012)', currency: 'USD'}
];

const mockCreditCards = [
    {id: 'cc1', name: 'Business Visa (XXX-5555)', currency: 'SGD'},
    {id: 'cc2', name: 'Corporate Amex (YYY-8888)', currency: 'USD'},
];

const initialLedgerOptions = [
  { id: 'l1', name: 'Bank Charges' }, { id: 'l2', name: 'Salary Payable' }, { id: 'l3', name: 'Travelling Fee' },
  { id: 'l4', name: 'Accounts Receivable' }, { id: 'l5', name: 'Office Supplies' }, { id: 'l6', name: 'Software Subscriptions' },
  { id: 'l7', name: 'Utilities' }, { id: 'l8', name: 'Sales Revenue' }, { id: 'l9', name: 'Cost of Goods Sold'}
];
const initialContactOptions = [
  { id: 'c1', name: 'Google' }, { id: 'c2', name: 'Facebook' }, { id: 'c3', name: 'XYZ pvt ltd' },
  { id: 'c4', name: 'Staples' }, { id: 'c5', name: 'Adobe Inc.' }, { id: 'c6', name: 'Local Electricity Board'}
];
const initialAccountOptionsForModal = [
  { id: 'acc1', name: 'IT Subscriptions' }, { id: 'acc2', name: 'Bank Fees' }, { id: 'acc3', name: 'Office Rent' },
  { id: ACCOUNTS_RECEIVABLE_ID, name: 'Accounts Receivable' }
];
const initialTaxRateOptions = [
  { id: 'tax0', name: 'No Tax', rate: 0 }, { id: 'tax5', name: 'GST 5%', rate: 0.05 }, { id: 'tax10', name: 'VAT 10%', rate: 0.1 }
];

const mockInvoices = [
  { id: 'inv1', date: '31/05/2024', description: 'Google India Services', reference: 'INV/20458', spent: 95.00, received: 0 },
  { id: 'inv2', date: '31/05/2024', description: 'ABC Limited Supplies for Tx 1', reference: 'INV/20452', spent: 1095.00, received: 0 },
  { id: 'inv3', date: '01/06/2024', description: 'Adobe CC (Partial)', reference: 'ADB-PART-123', spent: 0, received: 30.00 },
];

// --- Data per Bank Account ---
const allBankStatementData = {
    'ba1': [
      { id: 'bs-ba1-1', srNo: 1, date: '31/05/2024', description: 'BA1 - XERO SG INV-450005', type: 'Payment', spent: 1095.00, received: 0, balance: 10500.00, status: 'Reconciled' },
      { id: 'bs-ba1-2', srNo: 2, date: '30/05/2024', description: 'BA1 - Salary May', type: 'Payment', spent: 2500.00, received: 0, balance: 8000.00, status: 'Reconciled' },
      { id: 'bs-ba1-3', srNo: 3, date: '29/05/2024', description: 'BA1 - Unreconciled Payout', type: 'Payment', spent: 300.00, received: 0, balance: 7700.00, status: 'Unreconciled' },
    ],
    'ba2': [
      { id: 'bs-ba2-1', srNo: 1, date: '02/06/2024', description: 'BA2 - Transfer from Main', type: 'Receipt', spent: 0, received: 500.00, balance: 5500.00, status: 'Unreconciled' },
    ],
    'ba3': [
      { id: 'bs-ba3-1', srNo: 1, date: '03/06/2024', description: 'BA3 - Incoming Wire USD', type: 'Receipt', spent: 0, received: 2000.00, balance: 2000.00, status: 'Unreconciled' },
    ],
    'cc1': [
      { id: 'bs-cc1-1', srNo: 1, date: '28/05/2024', description: 'CC1 - AWS Services', type: 'Payment', spent: 150.00, received: 0, balance: 150.00, status: 'Unreconciled' },
      { id: 'bs-cc1-2', srNo: 2, date: '25/05/2024', description: 'CC1 - Payment Received - Thank You', type: 'Receipt', spent: 0, received: 500.00, balance: -350.00, status: 'Reconciled' },
    ],
    'cc2': [
      { id: 'bs-cc2-1', srNo: 1, date: '01/06/2024', description: 'CC2 - Delta Airlines Ticket', type: 'Payment', spent: 1250.75, received: 0, balance: 1250.75, status: 'Unreconciled' },
    ]
};

const allAccountTransactionData = {
    'ba1': [
        { id: 'at-ba1-1', date: '31/05/2024', description: 'BA1 - XERO SG INV-492005', reference: 'INV-492005', type: 'Payment', spent: 1095.00, received: 0, status: 'Reconciled', balance: 10500.00 },
        { id: 'at-ba1-2', date: '29/05/2024', description: 'BA1 - Office Rent', reference: 'RENT-MAY24', type: 'Payment', spent: 1200.00, received: 0, status: 'Reconciled', balance: 9300.00 },
    ],
    'ba2': [
        { id: 'at-ba2-1', date: '02/06/2024', description: 'BA2 - Interest Earned', reference: 'INT-MAY24', type: 'Receipt', spent: 0, received: 5.50, status: 'Unreconciled', balance: 5505.50 },
    ],
    'ba3': [
        { id: 'at-ba3-1', date: '03/06/2024', description: 'BA3 - Wire Fee', reference: 'WIRE-FEE-001', type: 'Payment', spent: 25.00, received: 0, status: 'Unreconciled', balance: 1975.00 },
    ],
    'cc1': [
        { id: 'at-cc1-1', date: '28/05/2024', description: 'CC1 - AWS Services', reference: 'AWS-MAY24', type: 'Payment', spent: 150.00, received: 0, status: 'Unreconciled', balance: 150.00 },
    ],
    'cc2': [
        { id: 'at-cc2-1', date: '01/06/2024', description: 'CC2 - Delta Airlines Ticket', reference: 'DELTA-9876', type: 'Payment', spent: 1250.75, received: 0, status: 'Unreconciled', balance: 1250.75 },
    ]
};


// --- Utility Functions for Sorting ---
// These functions handle the logic for sorting table data.
function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy];
  let valB = b[orderBy];

  // Convert to appropriate types for comparison
  if (orderBy === 'amount' || orderBy === 'spent' || orderBy === 'received' || orderBy === 'balance') {
    valA = parseFloat(valA);
    valB = parseFloat(valB);
  } else if (orderBy === 'date') {
    const partsA = String(valA).split('/'); // Assuming DD/MM/YYYY
    const partsB = String(valB).split('/');
    valA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
    valB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
  } else if (orderBy === 'srNo') { // srNo is specific to Bank Statement
    valA = parseInt(valA, 10);
    valB = parseInt(valB, 10);
  } else {
    // Default to string comparison for other fields like description, reference, type, status
    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();
  }

  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Stable sort preserves the original order of elements that have equal sort keys.
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Fallback to original index if comparator returns 0
  });
  return stabilizedThis.map((el) => el[0]);
}
// --- End Utility Functions ---

// Main application component
function App() {
  // --- Component State ---
  const [accountType, setAccountType] = useState('bank'); // 'bank' or 'credit_card'
  const [selectedAccountId, setSelectedAccountId] = useState(mockBankAccounts[0].id);
  const [tabValue, setTabValue] = useState(0);

  // State for the Reconciliation Tab
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [ledgerOptions, setLedgerOptions] = useState(initialLedgerOptions);
  const [contactOptions, setContactOptions] = useState(initialContactOptions);
  const [accountOptions] = useState(initialAccountOptionsForModal);
  const [taxRateOptions] = useState(initialTaxRateOptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ date: '', description: '', type: [], amount: '', remarks: '', matchingItems: '' });
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');

  // State for the Bank Statement Tab
  const [bankStatementRows, setBankStatementRows] = useState([]);
  const [selectedBankStatementRows, setSelectedBankStatementRows] = useState([]);
  const [bankStatementSearchTerm, setBankStatementSearchTerm] = useState('');
  const [bankStatementStartDate, setBankStatementStartDate] = useState('');
  const [bankStatementEndDate, setBankStatementEndDate] = useState('');
  const [bankStatementMinAmount, setBankStatementMinAmount] = useState('');
  const [bankStatementMaxAmount, setBankStatementMaxAmount] = useState('');
  const [bsOrder, setBsOrder] = useState('asc');
  const [bsOrderBy, setBsOrderBy] = useState('srNo');

  // State for Account Transaction Tab
  const [accountTransactionRows, setAccountTransactionRows] = useState([]);
  const [selectedAccountTransactionRows, setSelectedAccountTransactionRows] = useState([]);
  const [accountTransactionSearchTerm, setAccountTransactionSearchTerm] = useState('');
  const [accountTransactionStartDate, setAccountTransactionStartDate] = useState('');
  const [accountTransactionEndDate, setAccountTransactionEndDate] = useState('');
  const [accountTransactionMinAmount, setAccountTransactionMinAmount] = useState('');
  const [accountTransactionMaxAmount, setAccountTransactionMaxAmount] = useState('');
  const [atOrder, setAtOrder] = useState('asc');
  const [atOrderBy, setAtOrderBy] = useState('date');


  // State for Shared Modals and Popovers
  const [filterPopoverAnchorEl, setFilterPopoverAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [popoverSearchText, setPopoverSearchText] = useState('');
  const [popoverSelectedOptions, setPopoverSelectedOptions] = useState([]);

  // State for AI Analysis Modal
  const [analyzingTransaction, setAnalyzingTransaction] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // State for Potential Matches Popover
  const [popoverAnchorEl_match, setPopoverAnchorEl_match] = useState(null);
  const [currentPotentialMatches, setCurrentPotentialMatches] = useState([]);
  const [selectedPotentialMatchId, setSelectedPotentialMatchId] = useState(null);
  const [transactionForMatching, setTransactionForMatching] = useState(null);
  const [potentialMatchError, setPotentialMatchError] = useState('');

  // State for Search Invoice Modal
  const [isSearchInvoiceModalOpen, setIsSearchInvoiceModalOpen] = useState(false);
  const [transactionForInvoiceSearch, setTransactionForInvoiceSearch] = useState(null);
  const [invoiceSearchResults, setInvoiceSearchResults] = useState([]);
  const [selectedInvoiceInModal, setSelectedInvoiceInModal] = useState(null);
  const [invoiceSearchNameRef, setInvoiceSearchNameRef] = useState('');
  const [invoiceSearchAmount, setInvoiceSearchAmount] = useState('');
  const [newTransactionLines, setNewTransactionLines] = useState([{ id: Date.now(), contact: '', description: '', qty: 1, unitPrice: 0, account: '', taxRate: 'tax0', amount: 0 }]);
  const [newAdjustmentLines, setNewAdjustmentLines] = useState([{ id: Date.now(), contact: '', description: '', account: '', taxRate: 'tax0', amount: 0 }]);
  const [searchInvoiceError, setSearchInvoiceError] = useState('');
  // --- End Component State ---

  // Effect to update data when selectedAccountId changes
  useEffect(() => {
    const currentBankStatements = allBankStatementData[selectedAccountId] || [];
    const unreconciledStatements = currentBankStatements.filter(
      (stmt) => stmt.status === 'Unreconciled'
    );

    const newReconciliationTransactions = unreconciledStatements.map(stmt => ({
      id: `rec-${stmt.id}`, // Create a unique ID for the reconciliation view
      date: stmt.date,
      description: stmt.description,
      type: stmt.type,
      amount: stmt.spent > 0 ? stmt.spent : stmt.received,
      ledger: '',
      contact: '',
      remarks: '',
      matchingItems: 'Potential Match', // Default value
      invoiceSearchText: 'Search Invoice',
      isBankLedger: false,
      isReconciled: false,
      primaryAction: null,
      potentialMatches: [] // Default value
    }));

    setTransactions(newReconciliationTransactions);
    setBankStatementRows(currentBankStatements);
    setAccountTransactionRows(allAccountTransactionData[selectedAccountId] || []);

    // Reset selections and filters for all tabs
    setSelected([]);
    setSelectedBankStatementRows([]);
    setSelectedAccountTransactionRows([]);
    setSearchTerm('');
    setFilters({ date: '', description: '', type: [], amount: '', remarks: '', matchingItems: '' });
    setBankStatementSearchTerm('');
    setBankStatementStartDate('');
    setBankStatementEndDate('');
    setBankStatementMinAmount('');
    setBankStatementMaxAmount('');
    setAccountTransactionSearchTerm('');
    setAccountTransactionStartDate('');
    setAccountTransactionEndDate('');
    setAccountTransactionMinAmount('');
    setAccountTransactionMaxAmount('');

  }, [selectedAccountId]);


  // Memoized list of all unique transaction types for filter dropdowns.
  const allTransactionTypes = useMemo(() => Array.from(new Set([...transactions, ...bankStatementRows, ...accountTransactionRows].map(t => t.type))), [transactions, bankStatementRows, accountTransactionRows]);

  // Configuration for Reconciliation Table Headers
  const headCellsReconciliation = useMemo(() => [
    { id: 'date', label: 'Date', sortable: true, filterable: true, filterType: 'popoverText', minWidth: 120 },
    { id: 'description', label: 'Description', sortable: true, filterable: true, filterType: 'popoverText', minWidth: 200 },
    { id: 'type', label: 'Type', sortable: true, filterable: true, filterType: 'popoverSelect', options: allTransactionTypes, minWidth: 120 },
    { id: 'amount', label: 'Amount', sortable: true, filterable: true, filterType: 'popoverText', minWidth: 100, align: 'right', numeric:true },
    { id: 'actionsBox', label: 'Details, Matching & Remarks', sortable: false, filterable: false, minWidth: 420, align: 'left' }, // Combined box for actions & remarks
    { id: 'reconcileAction', label: 'Reconcile Action', sortable: false, filterable: false, minWidth: 170, align: 'center' },
    { id: 'analyze', label: 'Analyze ✨', sortable: false, filterable: false, minWidth: 120, align: 'center' },
  ], [allTransactionTypes]);

  // Configuration for Bank Statement Table Headers
  const headCellsBankStatement = [
    { id: 'srNo', label: 'Sr no', sortable: true, minWidth: 80 },
    { id: 'date', label: 'Date', sortable: true, minWidth: 120 },
    { id: 'description', label: 'Description', sortable: true, minWidth: 350 },
    { id: 'type', label: 'Type', sortable: true, minWidth: 100 },
    { id: 'spent', label: 'Spent', sortable: true, minWidth: 100, align: 'right', numeric: true },
    { id: 'received', label: 'Received', sortable: true, minWidth: 100, align: 'right', numeric: true },
    { id: 'balance', label: 'Balance', sortable: true, minWidth: 120, align: 'right', numeric: true },
    { id: 'status', label: 'Status', sortable: true, minWidth: 120 },
  ];

  // Configuration for Account Transaction Table Headers
  const headCellsAccountTransaction = [
    { id: 'date', label: 'Date', sortable: true, minWidth: 120 },
    { id: 'description', label: 'Description', sortable: true, minWidth: 300 },
    { id: 'reference', label: 'Reference', sortable: true, minWidth: 150 },
    { id: 'type', label: 'Type', sortable: true, minWidth: 100 },
    { id: 'spent', label: 'Spent', sortable: true, minWidth: 100, align: 'right', numeric: true },
    { id: 'received', label: 'Received', sortable: true, minWidth: 100, align: 'right', numeric: true },
    { id: 'balance', label: 'Balance', sortable: true, minWidth: 120, align: 'right', numeric: true}, // Added Balance
    { id: 'status', label: 'Status', sortable: true, minWidth: 120 },
  ];


  // --- Event Handlers ---
    const handleAccountTypeChange = (event) => {
        const newType = event.target.value;
        setAccountType(newType);
        if (newType === 'bank') {
            setSelectedAccountId(mockBankAccounts[0]?.id || '');
        } else {
            setSelectedAccountId(mockCreditCards[0]?.id || '');
        }
    };

    const handleAccountChange = (event) => {
        setSelectedAccountId(event.target.value);
    };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Filter Popover Handlers for Reconciliation Tab
  const handleOpenFilterPopover = (event, columnId) => {
    setFilterPopoverAnchorEl(event.currentTarget);
    setCurrentFilterColumn(columnId);
    const headCell = headCellsReconciliation.find(h => h.id === columnId);
    if (headCell?.filterType === 'popoverSelect') {
      setPopoverSelectedOptions(filters[columnId] || []);
    } else {
      setPopoverSearchText(filters[columnId] || '');
    }
  };
  const handleCloseFilterPopover = () => {
    setFilterPopoverAnchorEl(null);
    setCurrentFilterColumn(null);
    // Reset popover-specific states if necessary
    setPopoverSearchText('');
    setPopoverSelectedOptions([]);
  };
  const handleApplyPopoverFilter = () => {
    const headCell = headCellsReconciliation.find(h => h.id === currentFilterColumn);
    if (headCell?.filterType === 'popoverSelect') {
      setFilters(prev => ({ ...prev, [currentFilterColumn]: popoverSelectedOptions }));
    } else {
      setFilters(prev => ({ ...prev, [currentFilterColumn]: popoverSearchText }));
    }
    handleCloseFilterPopover();
  };
  const handleClearPopoverFilter = (columnId) => {
    const headCell = headCellsReconciliation.find(h => h.id === columnId);
    if (headCell?.filterType === 'popoverSelect') {
      setPopoverSelectedOptions([]);
      setFilters(prev => ({ ...prev, [columnId]: [] }));
    } else {
      setPopoverSearchText('');
      setFilters(prev => ({ ...prev, [columnId]: '' }));
    }
    // Optionally close popover after clearing
    // handleCloseFilterPopover();
  };
   const handlePopoverMultiSelectChange = (event) => {
     const { name, checked } = event.target;
    setPopoverSelectedOptions(prev =>
      checked ? [...prev, name] : prev.filter(opt => opt !== name)
      );
   };

  // Memoized and processed transactions for the Reconciliation Tab, applying filters and sorting.
  const processedTransactions = useMemo(() => {
    let filteredData = transactions.filter(transaction => {
        // Global search filter
        const globalSearchMatch = searchTerm === '' ||
          ['description', 'date', 'type', 'amount', 'remarks'] // Added remarks to global search
              .some(key => String(transaction[key]).toLowerCase().includes(searchTerm.toLowerCase()));
        if (searchTerm && !globalSearchMatch) return false;

        // Column-specific filters
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            // If filter is empty, skip this filter
            if ((typeof filterValue === 'string' && !filterValue) || (Array.isArray(filterValue) && filterValue.length === 0)) return true;

            let transactionValueString = '';
            // Special handling for ledger and contact to filter by name from options
            if (key === 'ledger') {
                const ledgerName = ledgerOptions.find(opt => opt.id === transaction.ledger)?.name || '';
                transactionValueString = ledgerName.toLowerCase();
            } else if (key === 'contact') {
                const contactName = contactOptions.find(opt => opt.id === transaction.contact)?.name || '';
                transactionValueString = contactName.toLowerCase();
            } else {
                transactionValueString = String(transaction[key]).toLowerCase();
            }

            const headCellConfig = headCellsReconciliation.find(h => h.id === key);

            if (headCellConfig?.filterType === 'popoverSelect') {
                // For multi-select filters, check if transaction value is in the selected options
                return Array.isArray(filterValue) ? filterValue.map(f=>f.toLowerCase()).includes(transactionValueString) : false;
            }
            // Default text filter (applies to remarks, description, etc.)
            return transactionValueString.includes(String(filterValue).toLowerCase());
        });
    });
    return stableSort(filteredData, getComparator(order, orderBy));
  }, [transactions, searchTerm, filters, order, orderBy, ledgerOptions, contactOptions, headCellsReconciliation]);

  // Memoized and processed bank statement rows, applying filters and sorting.
  const processedBankStatementRows = useMemo(() => {
    let filteredData = bankStatementRows.filter(row => {
        // Search term filter (description, type, status, amounts)
        if (bankStatementSearchTerm &&
            !row.description.toLowerCase().includes(bankStatementSearchTerm.toLowerCase()) &&
            !row.type.toLowerCase().includes(bankStatementSearchTerm.toLowerCase()) &&
            !row.status.toLowerCase().includes(bankStatementSearchTerm.toLowerCase()) &&
            !String(row.spent).includes(bankStatementSearchTerm) &&
            !String(row.received).includes(bankStatementSearchTerm) &&
            !String(row.balance).includes(bankStatementSearchTerm)
        ) {
            return false;
        }
        // Date range filter
        if (bankStatementStartDate) {
            const rowDateParts = row.date.split('/');
            const rowDate = new Date(Date.UTC(rowDateParts[2], rowDateParts[1] - 1, rowDateParts[0]));
            const filterStartDate = new Date(bankStatementStartDate + "T00:00:00Z"); // Ensure UTC for comparison
            if (rowDate < filterStartDate) return false;
        }
        if (bankStatementEndDate) {
            const rowDateParts = row.date.split('/');
            const rowDate = new Date(Date.UTC(rowDateParts[2], rowDateParts[1] - 1, rowDateParts[0]));
            const filterEndDate = new Date(bankStatementEndDate + "T23:59:59Z"); // Ensure UTC and include full end day
             if (rowDate > filterEndDate) return false;
        }

        // Amount range filter
        const minAmount = parseFloat(bankStatementMinAmount);
        const maxAmount = parseFloat(bankStatementMaxAmount);
        const rowSpent = parseFloat(row.spent);
        const rowReceived = parseFloat(row.received);

        let amountInRange = true;
        if (!isNaN(minAmount)) {
            amountInRange = (rowSpent > 0 && rowSpent >= minAmount) || (rowReceived > 0 && rowReceived >= minAmount);
            if (rowSpent === 0 && rowReceived === 0) { // If no spent/received, check balance
                amountInRange = parseFloat(row.balance) >= minAmount;
            }
        }
        if (amountInRange && !isNaN(maxAmount)) {
            const currentCheck = (rowSpent > 0 && rowSpent <= maxAmount) || (rowReceived > 0 && rowReceived <= maxAmount);
            if (rowSpent === 0 && rowReceived === 0) { // If no spent/received, check balance
                 amountInRange = parseFloat(row.balance) <= maxAmount;
            } else {
                amountInRange = currentCheck;
            }
        }
        if (!amountInRange) return false;

        return true;
    });
    return stableSort(filteredData, getComparator(bsOrder, bsOrderBy));
  }, [bankStatementRows, bankStatementSearchTerm, bankStatementStartDate, bankStatementEndDate, bankStatementMinAmount, bankStatementMaxAmount, bsOrder, bsOrderBy]);

  // Memoized and processed account transaction rows, applying filters and sorting.
  const processedAccountTransactionRows = useMemo(() => {
    let filteredData = accountTransactionRows.filter(row => {
        // Search term filter (description, reference, type, status, amounts)
        if (accountTransactionSearchTerm &&
            !row.description.toLowerCase().includes(accountTransactionSearchTerm.toLowerCase()) &&
            !row.reference.toLowerCase().includes(accountTransactionSearchTerm.toLowerCase()) &&
            !row.type.toLowerCase().includes(accountTransactionSearchTerm.toLowerCase()) &&
            !row.status.toLowerCase().includes(accountTransactionSearchTerm.toLowerCase()) &&
            !String(row.spent).includes(accountTransactionSearchTerm) &&
            !String(row.received).includes(accountTransactionSearchTerm)
        ) {
            return false;
        }
        // Date range filter
        if (accountTransactionStartDate) {
            const rowDateParts = row.date.split('/');
            const rowDate = new Date(Date.UTC(rowDateParts[2], rowDateParts[1] - 1, rowDateParts[0]));
            const filterStartDate = new Date(accountTransactionStartDate + "T00:00:00Z");
            if (rowDate < filterStartDate) return false;
        }
        if (accountTransactionEndDate) {
            const rowDateParts = row.date.split('/');
            const rowDate = new Date(Date.UTC(rowDateParts[2], rowDateParts[1] - 1, rowDateParts[0]));
            const filterEndDate = new Date(accountTransactionEndDate + "T23:59:59Z");
            if (rowDate > filterEndDate) return false;
        }

        // Amount range filter (checks if spent OR received falls in range)
        const minAmount = parseFloat(accountTransactionMinAmount);
        const maxAmount = parseFloat(accountTransactionMaxAmount);
        const rowSpent = parseFloat(row.spent);
        const rowReceived = parseFloat(row.received);

        let amountInRange = true;
        if (!isNaN(minAmount)) {
            amountInRange = (rowSpent > 0 && rowSpent >= minAmount) || (rowReceived > 0 && rowReceived >= minAmount);
        }
        if (amountInRange && !isNaN(maxAmount)) {
             amountInRange = (rowSpent > 0 && rowSpent <= maxAmount) || (rowReceived > 0 && rowReceived <= maxAmount);
        }
        if (!amountInRange && (rowSpent > 0 || rowReceived > 0)) return false; // Only apply if there is a spent or received amount

        return true;
    });
    return stableSort(filteredData, getComparator(atOrder, atOrderBy));
  }, [accountTransactionRows, accountTransactionSearchTerm, accountTransactionStartDate, accountTransactionEndDate, accountTransactionMinAmount, accountTransactionMaxAmount, atOrder, atOrderBy]);


  // Row Selection Handlers for Reconciliation Tab
  const handleSelectRow = (event, id) => {
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
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = processedTransactions.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Row Selection Handlers for Bank Statement Tab
  const handleBankStatementSelectRow = (event, id) => {
    const selectedIndex = selectedBankStatementRows.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedBankStatementRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedBankStatementRows.slice(1));
    } else if (selectedIndex === selectedBankStatementRows.length - 1) {
      newSelected = newSelected.concat(selectedBankStatementRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedBankStatementRows.slice(0, selectedIndex),
        selectedBankStatementRows.slice(selectedIndex + 1),
      );
    }
    setSelectedBankStatementRows(newSelected);
  };
  const handleBankStatementSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = processedBankStatementRows.map((n) => n.id);
      setSelectedBankStatementRows(newSelecteds);
      return;
    }
    setSelectedBankStatementRows([]);
  };
  const isBankStatementRowSelected = (id) => selectedBankStatementRows.indexOf(id) !== -1;

  // Row Selection Handlers for Account Transaction Tab
    const handleAccountTransactionSelectRow = (event, id) => {
        const selectedIndex = selectedAccountTransactionRows.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedAccountTransactionRows, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedAccountTransactionRows.slice(1));
        } else if (selectedIndex === selectedAccountTransactionRows.length - 1) {
            newSelected = newSelected.concat(selectedAccountTransactionRows.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedAccountTransactionRows.slice(0, selectedIndex),
                selectedAccountTransactionRows.slice(selectedIndex + 1),
            );
        }
        setSelectedAccountTransactionRows(newSelected);
    };
    const handleAccountTransactionSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = processedAccountTransactionRows.map((n) => n.id);
            setSelectedAccountTransactionRows(newSelecteds);
            return;
        }
        setSelectedAccountTransactionRows([]);
    };
    const isAccountTransactionRowSelected = (id) => selectedAccountTransactionRows.indexOf(id) !== -1;


  // Handles changes to ledger, contact or remarks in the reconciliation table.
  const handleTransactionDetailChange = (id, field, value) => {
    setTransactions(prev => {
        const isEditingSelectedRow = selected.includes(id);
        let newTransactions = [...prev];

        if (isEditingSelectedRow && (field === 'ledger' || field === 'contact')) {
            // Apply change to all selected rows for ledger or contact
            newTransactions = newTransactions.map(t => {
                if (selected.includes(t.id)) {
                    let updatedTransaction = { ...t, [field]: value, primaryAction: 'ledger', isReconciled: false };

                    if (updatedTransaction.matchingItems && !['Potential Match', 'No Matches', 'Matching Items'].includes(updatedTransaction.matchingItems)) {
                        updatedTransaction.matchingItems = 'Potential Match';
                    }
                    if (field === 'ledger') {
                         const selectedLedger = ledgerOptions.find(opt => opt.id === value);
                         if (selectedLedger && selectedLedger.name === 'Accounts Receivable') {
                             updatedTransaction.type = 'Contra';
                             updatedTransaction.isBankLedger = true;
                         } else if (updatedTransaction.isBankLedger) {
                             const originalRow = allBankStatementData[selectedAccountId]?.find(stmt => `rec-${stmt.id}` === t.id);
                             updatedTransaction.type = originalRow ? originalRow.type : 'Payment';
                             updatedTransaction.isBankLedger = false;
                         }
                    }
                    return updatedTransaction;
                }
                return t;
            });
        } else {
            // Apply change to only the directly edited row (original behavior for remarks or non-selected rows)
            newTransactions = newTransactions.map(t => {
                if (t.id === id) {
                    let updatedTransaction = { ...t, [field]: value };
                    if (field === 'ledger' || field === 'contact' || field === 'remarks') {
                         updatedTransaction.primaryAction = 'ledger';
                         updatedTransaction.isReconciled = false;
                    }
                    if (field === 'ledger' || field === 'contact') { // Keep this for single edit too
                        if (updatedTransaction.matchingItems && !['Potential Match', 'No Matches', 'Matching Items'].includes(updatedTransaction.matchingItems)) {
                            updatedTransaction.matchingItems = 'Potential Match';
                        }
                    }
                    if (field === 'ledger') { // Keep this for single edit too
                       const selectedLedger = ledgerOptions.find(opt => opt.id === value);
                       if (selectedLedger && selectedLedger.name === 'Accounts Receivable') {
                           updatedTransaction.type = 'Contra';
                           updatedTransaction.isBankLedger = true;
                       } else if (updatedTransaction.isBankLedger) {
                           const originalRow = allBankStatementData[selectedAccountId]?.find(stmt => `rec-${stmt.id}` === t.id);
                           updatedTransaction.type = originalRow ? originalRow.type : 'Payment';
                           updatedTransaction.isBankLedger = false;
                       }
                    }
                    return updatedTransaction;
                }
                return t;
            });
        }
        return newTransactions;
    });
  };

  // Handles adding a new ledger or contact option.
  const handleAddNew = (type) => {
    // Using prompt for simplicity; a modal would be better for UX.
    const name = prompt(`Enter name for new ${type}:`);
    if (name) {
      const newOption = { id: `${type.charAt(0)}${Date.now()}`, name };
      if (type === 'ledger') {
        setLedgerOptions(prev => [...prev, newOption]);
      } else if (type === 'contact') {
        setContactOptions(prev => [...prev, newOption]);
      }
    }
  };

  // AI Analysis Modal Handlers
  const handleOpenAnalysisModal = (transaction) => {
      setAnalyzingTransaction(transaction);
      setIsAnalysisModalOpen(true);
      fetchTransactionAnalysis(transaction);
  };
  const fetchTransactionAnalysis = async (transactionData) => {
      setIsLoadingAnalysis(true);
      setAnalysisError('');
      setAnalysisResult(null);

      const ledgerNames = ledgerOptions.map(l => `"${l.name}"`).join(', ');
      const contactNames = contactOptions.map(c => `"${c.name}"`).join(', ');

      const promptText = `Analyze this bank transaction: Description: "${transactionData.description}", Type: "${transactionData.type}", Amount: ${transactionData.amount}. Return a JSON object with the following properties: "enhanced_description" (a cleaner, standardized version of the original description), "suggested_category" (a general expense or income category like 'Utilities', 'Subscription', 'Client Payment', etc.), "suggested_ledger_name" (choose the best fit from this list: [${ledgerNames}] or suggest a concise new one if no good fit, or "N/A" if unsure), and "suggested_contact_name" (choose the best fit from this list: [${contactNames}] or suggest a concise new one if no good fit, or "N/A" if unsure).`;

      const payload = {
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: "OBJECT",
                  properties: {
                      "enhanced_description": { "type": "STRING" },
                      "suggested_category": { "type": "STRING" },
                      "suggested_ledger_name": { "type": "STRING" },
                      "suggested_contact_name": { "type": "STRING" }
                  }
              }
          }
      };

      // The API key is an empty string. The environment will provide the key at runtime.
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          if (!response.ok) {
              const errorData = await response.json();
              console.error("API Error Data:", errorData);
              throw new Error(`API Error ${response.status}: ${errorData?.error?.message || 'Unknown error from API'}`);
          }
          const result = await response.json();
          if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
              setAnalysisResult(JSON.parse(result.candidates[0].content.parts[0].text));
          } else {
              console.error("Unexpected API response structure:", result);
              throw new Error("Failed to parse AI response or response format is unexpected.");
          }
      } catch (error) {
          console.error("Analysis fetch error:", error);
          setAnalysisError(error.message || "An unexpected error occurred during AI analysis. Check console for details. Ensure API key is valid.");
      } finally {
          setIsLoadingAnalysis(false);
      }
  };
  const handleCloseAnalysisModal = () => setIsAnalysisModalOpen(false);
  const handleApplySuggestions = () => {
      if (!analysisResult || !analyzingTransaction) return;
      const { enhanced_description, suggested_ledger_name, suggested_contact_name } = analysisResult;

      // Find existing ledger/contact or use current if suggestion not found/applicable
      const ledgerId = ledgerOptions.find(l => l.name === suggested_ledger_name)?.id || analyzingTransaction.ledger;
      const contactId = contactOptions.find(c => c.name === suggested_contact_name)?.id || analyzingTransaction.contact;

      setTransactions(prev => prev.map(t =>
          t.id === analyzingTransaction.id ? {
              ...t,
              description: (enhanced_description && enhanced_description !== "N/A") ? enhanced_description : t.description,
              ledger: ledgerId,
              contact: contactId,
              primaryAction: 'ledger', // Indicate that details were filled, possibly via AI
              isReconciled: false, // Reset reconciled status as details changed
              matchingItems: 'Potential Match' // Update matching status
          } : t
      ));
      handleCloseAnalysisModal();
  };

  // Potential Matches Popover Handlers
  const handleMatchingItemsClick = (event, transaction) => {
      // Open popover only if there are potential matches and the item isn't already reconciled or processed via ledger/invoice actions.
      if (transaction.potentialMatches?.length && transaction.primaryAction !== 'ledger' && transaction.primaryAction !== 'invoice' && !transaction.isReconciled) {
          setPotentialMatchError('');
          setPopoverAnchorEl_match(event.currentTarget);
          setCurrentPotentialMatches(transaction.potentialMatches);
          setTransactionForMatching(transaction);
          setSelectedPotentialMatchId(null); // Reset selection
      }
  };
  const handleMatchingItemsClose = () => {
      setPopoverAnchorEl_match(null);
      setPotentialMatchError('');
  };
  const handleSelectPotentialMatch = (matchId) => {
      setSelectedPotentialMatchId(prevId => prevId === matchId ? null : matchId); // Toggle selection
      setPotentialMatchError(''); // Clear any previous error
  };
  const handleConfirmMatch = () => {
      setPotentialMatchError('');
      if (!selectedPotentialMatchId || !transactionForMatching) return;

      const matchedItemData = currentPotentialMatches.find(m => m.id === selectedPotentialMatchId);
      if (!matchedItemData) {
          setPotentialMatchError("Selected match not found.");
          return;
      }

      const originalTxAmount = parseFloat(transactionForMatching.amount.toFixed(2));
      let relevantMatchAmount = 0;

      // Determine which amount (spent/received) from the match is relevant
      if (transactionForMatching.type === 'Payment') {
          relevantMatchAmount = parseFloat(matchedItemData.spent.toFixed(2));
      } else if (transactionForMatching.type === 'Receipt') {
          relevantMatchAmount = parseFloat(matchedItemData.received.toFixed(2));
      } else { // For 'Contra' or other types, might need more specific logic
          if (matchedItemData.spent > 0 && matchedItemData.received === 0) {
              relevantMatchAmount = parseFloat(matchedItemData.spent.toFixed(2));
          } else if (matchedItemData.received > 0 && matchedItemData.spent === 0) {
              relevantMatchAmount = parseFloat(matchedItemData.received.toFixed(2));
          } else {
              setPotentialMatchError(`Ambiguous match amount for transaction type '${transactionForMatching.type}'.`);
              return;
          }
      }

      // Check for amount mismatch (allowing for small floating point differences)
      if (Math.abs(originalTxAmount - relevantMatchAmount) > 0.01) {
          setPotentialMatchError(`Amount Mismatch: Original is ${originalTxAmount.toFixed(2)}, selected match is ${relevantMatchAmount.toFixed(2)}.`);
          return;
      }

      // If match is confirmed, remove the original transaction from the list
      const reconciledTransactionId = transactionForMatching.id;
      setTransactions(prev => prev.filter(t => t.id !== reconciledTransactionId));
      setSelected(prevSelected => prevSelected.filter(id => id !== reconciledTransactionId)); // Also remove from selected list
      handleMatchingItemsClose();
  };

  // Search Invoice Modal Handlers
  const handleOpenSearchInvoiceModal = (transaction) => {
      setSearchInvoiceError('');
      setTransactionForInvoiceSearch(transaction);
      // Basic pre-filtering of invoices based on description or amount proximity
      setInvoiceSearchResults(
          mockInvoices.filter(inv =>
              inv.description.toLowerCase().includes(transaction.description.substring(0, 10).toLowerCase()) ||
              Math.abs(inv.spent - transaction.amount) < 50 ||
              Math.abs(inv.received - transaction.amount) < 50
          )
      );
      setInvoiceSearchNameRef('');
      setInvoiceSearchAmount('');
      setSelectedInvoiceInModal(null);
      // Reset lines for new transaction/adjustment
      setNewTransactionLines([{ id: Date.now(), contact: '', description: '', qty: 1, unitPrice: 0, account: '', taxRate: 'tax0', amount: 0 }]);
      setNewAdjustmentLines([{ id: Date.now(), contact: '', description: '', account: '', taxRate: 'tax0', amount: 0 }]);
      setIsSearchInvoiceModalOpen(true);
  };
  const handleCloseSearchInvoiceModal = () => {
      setIsSearchInvoiceModalOpen(false);
      setSearchInvoiceError('');
  };
  const handleModalInvoiceSearch = () => {
      setSearchInvoiceError('');
      let filteredInvoices = mockInvoices;
      if (invoiceSearchNameRef) {
          filteredInvoices = filteredInvoices.filter(i =>
              i.description.toLowerCase().includes(invoiceSearchNameRef.toLowerCase()) ||
              i.reference.toLowerCase().includes(invoiceSearchNameRef.toLowerCase())
          );
      }
      if (invoiceSearchAmount) {
          const searchAmountNum = parseFloat(invoiceSearchAmount);
          if (!isNaN(searchAmountNum)) {
              filteredInvoices = filteredInvoices.filter(i => i.spent === searchAmountNum || i.received === searchAmountNum);
          }
      }
      setInvoiceSearchResults(filteredInvoices);
  };
  const handleClearModalInvoiceSearch = () => {
      setSearchInvoiceError('');
      setInvoiceSearchNameRef('');
      setInvoiceSearchAmount('');
      setInvoiceSearchResults(mockInvoices); // Reset to all mock invoices
  };
  const handleSelectInvoiceInModal = (invoiceId) => {
      setSelectedInvoiceInModal(prevId => {
          const newId = prevId === invoiceId ? null : invoiceId;
          // When a new invoice is selected or deselected, reset manual lines.
          // This ensures manual lines are explicitly for the current context (either purely manual or supplementing the *currently* selected invoice).
          setNewTransactionLines([{ id: Date.now(), contact: '', description: '', qty: 1, unitPrice: 0, account: '', taxRate: 'tax0', amount: 0 }]);
          setNewAdjustmentLines([{ id: Date.now(), contact: '', description: '', account: '', taxRate: 'tax0', amount: 0 }]);
          setSearchInvoiceError('');
          return newId;
      });
  };

  // Handlers for creating/updating new transaction/adjustment lines in the Search Invoice modal
  const handleUpdateNewLine = (lineId, field, value, lineType) => {
      setSearchInvoiceError('');
      // No longer deselecting invoice here, allowing manual lines alongside a selected invoice.
      // setSelectedInvoiceInModal(null); // This was removed to allow manual lines with a selected invoice
      const updater = (lines) => lines.map(line => {
          if (line.id === lineId) {
              const updatedLine = { ...line, [field]: value };
              // Auto-calculate amount for transaction lines based on qty, price, tax
              if (lineType === 'transaction' && (field === 'qty' || field === 'unitPrice' || field === 'taxRate')) {
                  const qty = parseFloat(updatedLine.qty) || 0;
                  const unitPrice = parseFloat(updatedLine.unitPrice) || 0;
                  const taxRateInfo = taxRateOptions.find(txR => txR.id === updatedLine.taxRate);
                  const taxRateValue = taxRateInfo ? taxRateInfo.rate : 0;
                  updatedLine.amount = parseFloat((qty * unitPrice * (1 + taxRateValue)).toFixed(2));
              }
              // Adjust amount if tax rate changes for adjustment lines
              if (lineType === 'adjustment' && field === 'taxRate') {
                  const currentTaxRateInfo = taxRateOptions.find(txR => txR.id === line.taxRate);
                  const currentTax = currentTaxRateInfo ? currentTaxRateInfo.rate : 0;
                  const baseAmount = (parseFloat(line.amount) || 0) / (1 + currentTax); // Calculate base before new tax
                  const newTaxRateInfo = taxRateOptions.find(txR => txR.id === updatedLine.taxRate);
                  const newTax = newTaxRateInfo ? newTaxRateInfo.rate : 0;
                  updatedLine.amount = parseFloat((baseAmount * (1 + newTax)).toFixed(2));
              }
              // Directly update amount for adjustment lines if amount field is changed
              if (lineType === 'adjustment' && field === 'amount') {
                  updatedLine.amount = parseFloat(value) || 0;
              }
              return updatedLine;
          }
          return line;
      });

      if (lineType === 'transaction') setNewTransactionLines(updater);
      else if (lineType === 'adjustment') setNewAdjustmentLines(updater);
  };
  const handleAddNewLine = (lineType, prefillAccount = null) => {
      setSearchInvoiceError('');
      const newLineBase = {
        id: Date.now(),
        contact: '',
        description: lineType === 'transaction' && prefillAccount === ACCOUNTS_RECEIVABLE_ID ? 'Overpayment' : '',
        account: prefillAccount || '',
        taxRate: 'tax0',
        amount: 0
      };
      if (lineType === 'transaction') {
          setNewTransactionLines(prev => [...prev, { ...newLineBase, qty: 1, unitPrice: 0 }]);
      } else { // adjustment
          setNewAdjustmentLines(prev => [...prev, newLineBase]);
      }
  };
  const handleRemoveLine = (lineId, lineType) => {
      setSearchInvoiceError('');
      if (lineType === 'transaction') {
          setNewTransactionLines(prev => prev.length > 1 ? prev.filter(l => l.id !== lineId) : prev);
      } else {
          setNewAdjustmentLines(prev => prev.length > 1 ? prev.filter(l => l.id !== lineId) : prev);
      }
  };
  // Calculates total for manually created lines in Search Invoice modal.
  const calculateSearchInvoiceTotal = (includeSelectedInvoice = false) => {
      let total = 0;
      const manualTransactionTotal = newTransactionLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
      const manualAdjustmentTotal = newAdjustmentLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
      total = manualTransactionTotal + manualAdjustmentTotal;

      if (includeSelectedInvoice && selectedInvoiceInModal && transactionForInvoiceSearch) {
          const invoice = invoiceSearchResults.find(inv => inv.id === selectedInvoiceInModal);
          if (invoice) {
              const invoiceAmount = transactionForInvoiceSearch.type === 'Payment' ? (invoice.spent || 0) : (invoice.received || 0);
              total += parseFloat(invoiceAmount.toFixed(2));
          }
      }
      return total;
  };

  // Handles reconciling and removing based on Search Invoice modal (either selected invoice or manual lines).
  const handleSearchInvoiceReconcile = () => {
      setSearchInvoiceError('');
      if (!transactionForInvoiceSearch) return;

      const originalTxAmount = parseFloat(transactionForInvoiceSearch.amount.toFixed(2));
      let combinedAmountToMatch = 0;
      let invoiceContribution = 0;

      if (selectedInvoiceInModal) {
          const invoice = invoiceSearchResults.find(inv => inv.id === selectedInvoiceInModal);
          if (!invoice) {
              setSearchInvoiceError("Selected invoice for matching not found. Please try again.");
              return;
          }
          invoiceContribution = transactionForInvoiceSearch.type === 'Payment' ? (invoice.spent || 0) : (invoice.received || 0);
          invoiceContribution = parseFloat(invoiceContribution.toFixed(2));
      }

      const manualLinesTotal = calculateSearchInvoiceTotal(false); // Calculate total of only manual lines
      combinedAmountToMatch = invoiceContribution + manualLinesTotal; // Add invoice amount (if any) and manual lines
      combinedAmountToMatch = parseFloat(combinedAmountToMatch.toFixed(2));


      if (selectedInvoiceInModal && manualLinesTotal === 0 && Math.abs(originalTxAmount - invoiceContribution) > 0.01) {
           setSearchInvoiceError(`Selected invoice amount (${invoiceContribution.toFixed(2)}) does not match bank transaction (${originalTxAmount.toFixed(2)}). Add manual lines to cover the difference or deselect the invoice to create lines from scratch.`);
           return;
      }


      if (Math.abs(originalTxAmount - combinedAmountToMatch) > 0.01) {
          setSearchInvoiceError(`Total amount to reconcile (${combinedAmountToMatch.toFixed(2)}) does not match bank transaction amount (${originalTxAmount.toFixed(2)}). Adjust manual lines or the selected invoice.`);
          return;
      }

      if (!selectedInvoiceInModal && manualLinesTotal === 0) { // If no invoice and no manual lines with value
           setSearchInvoiceError(`Cannot reconcile with zero amount. Add lines or select an invoice.`);
           return;
      }


      // If all checks pass, remove the original transaction
      const reconciledTransactionId = transactionForInvoiceSearch.id;
      setTransactions(prev => prev.filter(t => t.id !== reconciledTransactionId));
      setSelected(prevSelected => prevSelected.filter(id => id !== reconciledTransactionId));
      handleCloseSearchInvoiceModal();
  };


  // Handlers for reconciling transactions directly from the Reconciliation table.
  const handleReconcileSingleRowAndRemove = (rowIdToProcess) => {
      const rowToReconcile = transactions.find(t => t.id === rowIdToProcess);

      if (rowToReconcile && rowToReconcile.ledger && rowToReconcile.contact && !rowToReconcile.isReconciled) {
          // Proceed with removal
          setTransactions(prevTransactions =>
              prevTransactions.filter(transaction => transaction.id !== rowIdToProcess)
          );
          setSelected(prevSelected => prevSelected.filter(id => id !== rowIdToProcess)); // Remove from selection if it was selected
      } else if (rowToReconcile && !rowToReconcile.isReconciled && (!rowToReconcile.ledger || !rowToReconcile.contact)) {
          // Using a custom modal/alert in a real app is better than window.alert
          console.error("Please select Ledger and Contact Name before reconciling this row.");
      }
      // No action if already reconciled, as button would be disabled.
  };

  const handleReconcileSelectedAndRemove = () => {
      const idsToRemove = [];
      const stillSelected = []; // Rows that couldn't be reconciled remain selected

      selected.forEach(id => {
          const transaction = transactions.find(t => t.id === id);
          if (transaction && transaction.ledger && transaction.contact && !transaction.isReconciled) {
              idsToRemove.push(id);
          } else {
              stillSelected.push(id);
          }
      });

      if (idsToRemove.length > 0) {
          setTransactions(prevTransactions =>
              prevTransactions.filter(transaction => !idsToRemove.includes(transaction.id))
          );
          setSelected(stillSelected); // Update selection to only those not removed
      } else if (selected.length > 0) {
          console.error("Ensure selected rows have Ledger and Contact Name filled (and are not already reconciled) to reconcile.");
      }
  };

  // Handler for removing selected rows from Account Transaction tab
  const handleRemoveSelectedAccountTransactions = () => {
    if (selectedAccountTransactionRows.length > 0) {
        setAccountTransactionRows(prevRows =>
            prevRows.filter(row => !selectedAccountTransactionRows.includes(row.id))
        );
        setSelectedAccountTransactionRows([]); // Clear selection after removal
    }
  };

  // Handler for importing bank statement (placeholder)
  const handleImportBankStatement = () => {
    console.log("Import Bank Statement button clicked. Actual import logic to be implemented.");
  };

  // Handler for "Rule Match" button
  const handleRuleMatch = (rowId) => {
    console.log(`Rule Match clicked for row: ${rowId}`);
    const transactionToRuleMatch = transactions.find(t => t.id === rowId);
    if (transactionToRuleMatch && !transactionToRuleMatch.isReconciled) {
        setTransactions(prev => prev.filter(t => t.id !== rowId));
        setSelected(prevSelected => prevSelected.filter(id => id !== rowId));
    }
  };


  // Table Sort Handlers
  const handleRequestSort = (event, property) => { // For Reconciliation table
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const createSortHandler = (property) => (event) => { // For Reconciliation table
    handleRequestSort(event, property);
  };
  const handleBsRequestSort = (event, property) => { // For Bank Statement table
    const isAsc = bsOrderBy === property && bsOrder === 'asc';
    setBsOrder(isAsc ? 'desc' : 'asc');
    setBsOrderBy(property);
  };
  const createBsSortHandler = (property) => (event) => { // For Bank Statement table
    handleBsRequestSort(event, property);
  };
  const handleAtRequestSort = (event, property) => { // For Account Transaction table
    const isAsc = atOrderBy === property && atOrder === 'asc';
    setAtOrder(isAsc ? 'desc' : 'asc');
    setAtOrderBy(property);
  };
  const createAtSortHandler = (property) => (event) => { // For Account Transaction table
    handleAtRequestSort(event, property);
  };
  // --- End Event Handlers ---

    // Combine all accounts to easily find details like currency
    const allAccounts = useMemo(() => [...mockBankAccounts, ...mockCreditCards], []);
    const selectedAccountDetails = useMemo(() => allAccounts.find(acc => acc.id === selectedAccountId), [selectedAccountId, allAccounts]);


  // Calculate current statement balance
  const currentStatementBalance = useMemo(() => {
    const currentAccountData = allBankStatementData[selectedAccountId] || [];
    if (currentAccountData.length > 0) {
        // Find the item with the highest Sr no, assuming it's the latest.
        const latestEntry = currentAccountData.reduce((latest, current) => (current.srNo > latest.srNo ? current : latest), currentAccountData[0]);
        return latestEntry.balance;
    }
    return 0;
  }, [selectedAccountId]); // Re-calculate if selected account or its statement data changes

  // Calculate current account transaction balance
  const currentAccountTransactionBalance = useMemo(() => {
    const currentAccountData = allAccountTransactionData[selectedAccountId] || [];
    if (currentAccountData.length > 0) {
        // This assumes the last item is the latest. A more robust solution might use dates.
        return currentAccountData[currentAccountData.length - 1].balance;
    }
    return 0;
  }, [selectedAccountId]);


  // Boolean to control the visibility of the matching popover.
  const openMatchingPopover = Boolean(popoverAnchorEl_match);
  const matchingPopoverId = openMatchingPopover ? 'matching-items-popover' : undefined;

  // Calculate total for display in Search Invoice Modal footer
  const searchInvoiceModalDisplayTotal = useMemo(() => {
    let total = 0;
    const manualLinesOnlyTotal = newTransactionLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0) +
                              newAdjustmentLines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

    if (selectedInvoiceInModal && transactionForInvoiceSearch) {
        const invoice = invoiceSearchResults.find(inv => inv.id === selectedInvoiceInModal);
        if (invoice) {
            const invoiceAmount = transactionForInvoiceSearch.type === 'Payment' ? (invoice.spent || 0) : (invoice.received || 0);
            total += parseFloat(invoiceAmount.toFixed(2));
        }
    }
    total += manualLinesOnlyTotal;
    return parseFloat(total.toFixed(2));
  }, [selectedInvoiceInModal, newTransactionLines, newAdjustmentLines, invoiceSearchResults, transactionForInvoiceSearch]);


  // --- JSX Structure ---
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh', p: { xs: 1, sm: 2, md: 3 } }}>

        {/* Bank Account Selection and Balance Display */}
        <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid item xs={12} md={7}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl sx={{minWidth: 180 }} size="small">
                            <InputLabel id="account-type-select-label">Account Type</InputLabel>
                            <Select
                                labelId="account-type-select-label"
                                id="account-type-select"
                                value={accountType}
                                label="Account Type"
                                onChange={handleAccountTypeChange}
                            >
                                <MenuItem value="bank">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}><AccountBalanceWalletIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Bank Accounts</Box>
                                </MenuItem>
                                <MenuItem value="credit_card">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}><CreditCardIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Credit Cards</Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{minWidth: 300, flexGrow: 1 }} size="small">
                            <InputLabel id="account-select-label">Select Account</InputLabel>
                            <Select
                                labelId="account-select-label"
                                id="account-select"
                                value={selectedAccountId}
                                label="Select Account"
                                onChange={handleAccountChange}
                            >
                                {(accountType === 'bank' ? mockBankAccounts : mockCreditCards).map((account) => (
                                    <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid item xs={12} md={5}>
                   <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: {xs: 1, sm: 4}, alignItems: {sm: 'center'}, justifyContent: { xs: 'flex-start', md: 'flex-end'}, textAlign: {xs: 'left', sm: 'right'} }}>
                        <Typography variant="h6" sx={{ color: 'primary.main'}}>
                            Statement: <Typography component="span" variant="h6" fontWeight="700">{currentStatementBalance.toFixed(2)}</Typography> {selectedAccountDetails?.currency}
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                            Account: <Typography component="span" variant="h6" fontWeight="700">{currentAccountTransactionBalance.toFixed(2)}</Typography> {selectedAccountDetails?.currency}
                        </Typography>
                   </Box>
                </Grid>
            </Grid>
        </Paper>

        {/* Tabs for navigation */}
        <Paper elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Reconciliation" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
            <Tab label="Bank Statement" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
            <Tab label="Account Transaction" id="simple-tab-2" aria-controls="simple-tabpanel-2" />
          </Tabs>
        </Paper>

        {/* Controls for Reconciliation Tab (Search and Bulk Reconcile Button) */}
        {tabValue === 0 && (
          <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Search>
                  <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Global Search (Description, Date, Type, Amount)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    inputProps={{ 'aria-label': 'search reconciliation transactions' }}
                  />
                </Search>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: {xs: 'left', md: 'right'} }}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selected.length === 0} // Enable if any row is selected
                    onClick={handleReconcileSelectedAndRemove}
                    startIcon={<PlaylistRemoveIcon />}
                  >
                      Reconcile Selected & Remove
                  </Button>
              </Grid>
            </Grid>
            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              {selected.length > 0 && `Selected ${selected.length} item(s). `}
              {`Showing ${processedTransactions.length} of ${transactions.length} unreconciled transactions.`}
            </Typography>
          </Paper>
        )}

        {/* TabPanel for Reconciliation */}
        <TabPanel value={tabValue} index={0} p={0}>
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table sx={{ minWidth: 1800 }} aria-label="reconciliation transaction table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < processedTransactions.length}
                        checked={processedTransactions.length > 0 && selected.length === processedTransactions.length}
                        onChange={handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all reconciliation transactions' }}
                    />
                  </TableCell>
                  {headCellsReconciliation.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align || (headCell.numeric ? 'right' : 'left')}
                        padding={'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{minWidth: headCell.minWidth }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: headCell.align === 'right' ? 'flex-end' : headCell.align ==='center' ? 'center' : 'flex-start' }}>
                            {headCell.sortable ? (
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
                            ) : ( headCell.label )}
                           {headCell.filterable && headCell.id !== 'actionsBox' && ( // Exclude filter for the actions box
                                <Tooltip title={`Filter by ${headCell.label}`}>
                                    <IconButton
                                        onClick={(e) => handleOpenFilterPopover(e, headCell.id)}
                                        size="small"
                                        sx={{
                                            ml: 0.5,
                                            color: (filters[headCell.id] && ((typeof filters[headCell.id] === 'string' && filters[headCell.id] !== '') || (Array.isArray(filters[headCell.id]) && filters[headCell.id].length > 0))) ? 'primary.main' : 'action.active'
                                        }}
                                    >
                                        <FilterListIcon fontSize="inherit" />
                                    </IconButton>
                                </Tooltip>
                           )}
                        </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {processedTransactions.map((row) => {
                    const isItemSelected = isSelected(row.id);
                    const isReconciledByOtherMeans = row.primaryAction === 'match' || row.primaryAction === 'invoice' || row.primaryAction === 'rule';

                    let reconcileButtonTooltipText = "";
                    if (!row.ledger || !row.contact) {
                        reconcileButtonTooltipText = "Ledger & Contact required";
                    } else if (row.isReconciled || isReconciledByOtherMeans) {
                        reconcileButtonTooltipText = "Already Reconciled";
                    } else {
                        reconcileButtonTooltipText = "Reconcile this item";
                    }

                    return (
                        <TableRow
                            hover
                            onClick={(event) => handleSelectRow(event, row.id)}
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            sx={{ '& > *': { borderBottom: 'unset' } }}
                        >
                            <TableCell padding="checkbox"><Checkbox color="primary" checked={isItemSelected} /></TableCell>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell><Chip label={row.type} size="small" color={row.type === 'Contra' ? 'info' : (row.type === 'Payment' ? 'error' : 'success')} variant="outlined"/></TableCell>
                            <TableCell align="right">{row.amount.toFixed(2)}</TableCell>

                            <TableCell> {/* Combined Actions Box with Remarks */}
                                <Paper variant="outlined" sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: '400px' }}>
                                    <FormControl fullWidth size="small" variant="outlined" disabled={row.isReconciled || isReconciledByOtherMeans}>
                                        <InputLabel id={`ledger-label-${row.id}`}>Ledger</InputLabel>
                                        <Select
                                            labelId={`ledger-label-${row.id}`}
                                            value={row.ledger}
                                            onChange={(e) => handleTransactionDetailChange(row.id, 'ledger', e.target.value)}
                                            label="Ledger"
                                            onClick={(e) => e.stopPropagation()}
                                            MenuProps={{ PaperProps: { style: { maxHeight: 200 }}}}
                                        >
                                            {ledgerOptions.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                                            <Divider />
                                            <MenuItem onClick={(e) => { e.stopPropagation(); handleAddNew('ledger');}} sx={{color:'primary.main',fontWeight:'bold'}}><AddCircleOutlineIcon sx={{mr:1, fontSize:'1.2rem'}}/>Add New Ledger</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth size="small" variant="outlined" disabled={row.isReconciled || isReconciledByOtherMeans}>
                                        <InputLabel id={`contact-label-${row.id}`}>Contact</InputLabel>
                                        <Select
                                            labelId={`contact-label-${row.id}`}
                                            value={row.contact}
                                            onChange={(e) => handleTransactionDetailChange(row.id, 'contact', e.target.value)}
                                            label="Contact"
                                            onClick={(e) => e.stopPropagation()}
                                            MenuProps={{ PaperProps: { style: { maxHeight: 200 }}}}
                                        >
                                            {contactOptions.map(opt => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
                                            <Divider />
                                            <MenuItem onClick={(e) => { e.stopPropagation(); handleAddNew('contact');}} sx={{color:'primary.main',fontWeight:'bold'}}><AddCircleOutlineIcon sx={{mr:1, fontSize:'1.2rem'}}/>Add New Contact</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5, gap: 1}}>
                                        <Chip
                                            label={row.matchingItems}
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleMatchingItemsClick(e, row); }}
                                            clickable={!!row.potentialMatches?.length && !row.isReconciled && !isReconciledByOtherMeans}
                                            color={row.matchingItems.startsWith('Matched:') ? 'success' : (row.matchingItems === 'No Matches' ? 'default' : (row.matchingItems === 'Potential Match' ? 'warning' : 'info'))}
                                            variant={row.matchingItems.startsWith('Matched:') ? 'filled' : 'outlined'}
                                            sx={{cursor: (!!row.potentialMatches?.length && !row.isReconciled && !isReconciledByOtherMeans) ? 'pointer' : 'default', flex: 1}}
                                            disabled={row.isReconciled || isReconciledByOtherMeans}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={(e) => {e.stopPropagation(); handleOpenSearchInvoiceModal(row)}}
                                            disabled={row.isReconciled || isReconciledByOtherMeans}
                                            sx={{flex: 1}}
                                        >
                                            {row.invoiceSearchText}
                                        </Button>
                                         <Tooltip title="Apply Matching Rule">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="secondary"
                                                onClick={(e) => { e.stopPropagation(); handleRuleMatch(row.id);}}
                                                disabled={row.isReconciled || isReconciledByOtherMeans}
                                                startIcon={<GavelIcon />}
                                                sx={{flex: 1}}
                                            >
                                                Rule Match
                                            </Button>
                                         </Tooltip>
                                    </Box>
                                     <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        placeholder="Add remarks..."
                                        label="Remarks"
                                        value={row.remarks || ''}
                                        onChange={(e) => handleTransactionDetailChange(row.id, 'remarks', e.target.value)}
                                        onClick={(e) => e.stopPropagation()} // Prevent row click when interacting
                                        disabled={row.isReconciled || isReconciledByOtherMeans}
                                        sx={{mt: 1}}
                                        multiline
                                        rows={2}
                                    />
                                </Paper>
                            </TableCell>
                            <TableCell align="center"> {/* Row-level Reconcile Button */}
                                <Tooltip title={reconcileButtonTooltipText}>
                                    <span>
                                        <Button
                                            variant={"outlined"}
                                            color={"primary"}
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleReconcileSingleRowAndRemove(row.id); }}
                                            startIcon={<AutorenewIcon />}
                                            disabled={!row.ledger || !row.contact || row.isReconciled || isReconciledByOtherMeans}
                                        >
                                            Reconcile & Remove
                                        </Button>
                                    </span>
                                </Tooltip>
                            </TableCell>
                            <TableCell align="center"> {/* Analyze Button */}
                                <Tooltip title="Analyze with AI">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); handleOpenAnalysisModal(row); }}
                                            color="info"
                                            disabled={row.isReconciled || isReconciledByOtherMeans}
                                        >
                                            <AutoAwesomeIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {processedTransactions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={headCellsReconciliation.length + 1} align="center" sx={{p:3}}>
                            <Typography variant="subtitle1">No unreconciled transactions for this account.</Typography>
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* TabPanel for Bank Statement */}
        <TabPanel value={tabValue} index={1}>
            <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="flex-end"> {/* Use alignItems="flex-end" for better baseline alignment */}
                    <Grid item xs={12} sm={6} md={2.5}>
                        <TextField
                            fullWidth
                            label="Search Description, Type, Status..."
                            variant="outlined"
                            size="small"
                            value={bankStatementSearchTerm}
                            onChange={(e) => setBankStatementSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{mr:1, color:'action.active'}}/> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3} md={1.5}>
                        <TextField fullWidth label="Start Date" type="date" variant="outlined" size="small" value={bankStatementStartDate} onChange={(e) => setBankStatementStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6} sm={3} md={1.5}>
                        <TextField fullWidth label="End Date" type="date" variant="outlined" size="small" value={bankStatementEndDate} onChange={(e) => setBankStatementEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6} sm={3} md={1.5}>
                        <TextField fullWidth label="Min Amount" type="number" variant="outlined" size="small" value={bankStatementMinAmount} onChange={(e) => setBankStatementMinAmount(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={3} md={1.5}>
                        <TextField fullWidth label="Max Amount" type="number" variant="outlined" size="small" value={bankStatementMaxAmount} onChange={(e) => setBankStatementMaxAmount(e.target.value)} />
                    </Grid>
                     <Grid item xs={6} sm={6} md={1.5} sx={{textAlign: 'right'}}>
                        <Button onClick={() => { setBankStatementSearchTerm(''); setBankStatementStartDate(''); setBankStatementEndDate(''); setBankStatementMinAmount(''); setBankStatementMaxAmount('');}} variant="outlined" size="medium">Clear Filters</Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} sx={{textAlign: 'right'}}>
                         <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleImportBankStatement}
                            size="medium"
                        >
                            Import Statement
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table sx={{ minWidth: 1000 }} aria-label="bank statement table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={selectedBankStatementRows.length > 0 && selectedBankStatementRows.length < processedBankStatementRows.length}
                                    checked={processedBankStatementRows.length > 0 && selectedBankStatementRows.length === processedBankStatementRows.length}
                                    onChange={handleBankStatementSelectAllClick}
                                    inputProps={{ 'aria-label': 'select all bank statement rows' }}
                                />
                            </TableCell>
                            {headCellsBankStatement.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.align || 'left'}
                                    padding={'normal'}
                                    sortDirection={bsOrderBy === headCell.id ? bsOrder : false}
                                    sx={{minWidth: headCell.minWidth }}
                                >
                                    {headCell.sortable ? (
                                        <TableSortLabel
                                            active={bsOrderBy === headCell.id}
                                            direction={bsOrderBy === headCell.id ? bsOrder : 'asc'}
                                            onClick={createBsSortHandler(headCell.id)}
                                        >
                                            {headCell.label}
                                            {bsOrderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{bsOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>) : null}
                                        </TableSortLabel>
                                     ) : ( headCell.label )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedBankStatementRows.map((row) => {
                            const isItemSelected = isBankStatementRowSelected(row.id);
                            return (
                                <TableRow
                                    hover
                                    key={row.id}
                                    selected={isItemSelected}
                                    onClick={(event) => handleBankStatementSelectRow(event, row.id)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                >
                                    <TableCell padding="checkbox"> <Checkbox color="primary" checked={isItemSelected} /> </TableCell>
                                    <TableCell>{row.srNo}</TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell><Chip label={row.type} size="small" color={row.type === 'Payment' ? 'error' : (row.type === 'Receipt' ? 'success' : 'default')} variant="outlined"/></TableCell>
                                    <TableCell align="right">{row.spent > 0 ? row.spent.toFixed(2) : '-'}</TableCell>
                                    <TableCell align="right">{row.received > 0 ? row.received.toFixed(2) : '-'}</TableCell>
                                    <TableCell align="right">{row.balance.toFixed(2)}</TableCell>
                                    <TableCell><Chip label={row.status} size="small" color={row.status === 'Reconciled' ? 'success' : 'warning'} variant={row.status === 'Reconciled' ? 'filled' : 'outlined'}/></TableCell>
                                </TableRow>
                            );
                        })}
                        {processedBankStatementRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={headCellsBankStatement.length + 1} align="center" sx={{p:3}}>
                                    <Typography variant="subtitle1">No bank statement entries match your criteria for the selected account.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </TabPanel>

        {/* TabPanel for Account Transaction */}
        <TabPanel value={tabValue} index={2}>
            <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            label="Search Description, Reference..."
                            variant="outlined"
                            size="small"
                            value={accountTransactionSearchTerm}
                            onChange={(e) => setAccountTransactionSearchTerm(e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{mr:1, color:'action.active'}}/> }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={2} md={1.5}>
                        <TextField fullWidth label="Start Date" type="date" variant="outlined" size="small" value={accountTransactionStartDate} onChange={(e) => setAccountTransactionStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6} sm={2} md={1.5}>
                        <TextField fullWidth label="End Date" type="date" variant="outlined" size="small" value={accountTransactionEndDate} onChange={(e) => setAccountTransactionEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={6} sm={2} md={1.5}>
                        <TextField fullWidth label="Min Amount" type="number" variant="outlined" size="small" value={accountTransactionMinAmount} onChange={(e) => setAccountTransactionMinAmount(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={2} md={1.5}>
                        <TextField fullWidth label="Max Amount" type="number" variant="outlined" size="small" value={accountTransactionMaxAmount} onChange={(e) => setAccountTransactionMaxAmount(e.target.value)} />
                    </Grid>
                     <Grid item xs={6} sm={2} md={1.5} sx={{textAlign: 'right'}}>
                        <Button onClick={() => { setAccountTransactionSearchTerm(''); setAccountTransactionStartDate(''); setAccountTransactionEndDate(''); setAccountTransactionMinAmount(''); setAccountTransactionMaxAmount('');}} variant="outlined" size="medium">Clear</Button>
                    </Grid>
                    <Grid item xs={6} sm={12} md={1.5} sx={{textAlign: 'right'}}>
                        <Button
                            variant="contained"
                            color="error"
                            size="medium"
                            disabled={selectedAccountTransactionRows.length === 0}
                            onClick={handleRemoveSelectedAccountTransactions}
                            startIcon={<DeleteIcon />}
                        >
                            Remove Selected
                        </Button>
                    </Grid>
                </Grid>
                 <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                    {selectedAccountTransactionRows.length > 0 && `Selected ${selectedAccountTransactionRows.length} item(s). `}
                    {`Showing ${processedAccountTransactionRows.length} of ${accountTransactionRows.length} transactions.`}
                </Typography>
            </Paper>
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table sx={{ minWidth: 1000 }} aria-label="account transaction table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={selectedAccountTransactionRows.length > 0 && selectedAccountTransactionRows.length < processedAccountTransactionRows.length}
                                    checked={processedAccountTransactionRows.length > 0 && selectedAccountTransactionRows.length === processedAccountTransactionRows.length}
                                    onChange={handleAccountTransactionSelectAllClick}
                                    inputProps={{ 'aria-label': 'select all account transaction rows' }}
                                />
                            </TableCell>
                            {headCellsAccountTransaction.map((headCell) => (
                                <TableCell
                                    key={headCell.id}
                                    align={headCell.align || 'left'}
                                    padding={'normal'}
                                    sortDirection={atOrderBy === headCell.id ? atOrder : false}
                                    sx={{minWidth: headCell.minWidth }}
                                >
                                    {headCell.sortable ? (
                                        <TableSortLabel
                                            active={atOrderBy === headCell.id}
                                            direction={atOrderBy === headCell.id ? atOrder : 'asc'}
                                            onClick={createAtSortHandler(headCell.id)}
                                        >
                                            {headCell.label}
                                            {atOrderBy === headCell.id ? (<Box component="span" sx={visuallyHidden}>{atOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>) : null}
                                        </TableSortLabel>
                                     ) : ( headCell.label )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedAccountTransactionRows.map((row) => {
                            const isItemSelected = isAccountTransactionRowSelected(row.id);
                            return (
                                <TableRow
                                    hover
                                    key={row.id}
                                    selected={isItemSelected}
                                    onClick={(event) => handleAccountTransactionSelectRow(event, row.id)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                >
                                    <TableCell padding="checkbox"> <Checkbox color="primary" checked={isItemSelected} /> </TableCell>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell>{row.reference}</TableCell>
                                    <TableCell><Chip label={row.type} size="small" color={row.type === 'Payment' ? 'error' : (row.type === 'Receipt' ? 'success' : 'default')} variant="outlined"/></TableCell>
                                    <TableCell align="right">{row.spent > 0 ? row.spent.toFixed(2) : '-'}</TableCell>
                                    <TableCell align="right">{row.received > 0 ? row.received.toFixed(2) : '-'}</TableCell>
                                    <TableCell align="right">{row.balance ? row.balance.toFixed(2) : '-'}</TableCell>
                                    <TableCell><Chip label={row.status} size="small" color={row.status === 'Reconciled' ? 'success' : 'warning'} variant={row.status === 'Reconciled' ? 'filled' : 'outlined'}/></TableCell>
                                </TableRow>
                            );
                        })}
                        {processedAccountTransactionRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={headCellsAccountTransaction.length + 1} align="center" sx={{p:3}}>
                                    <Typography variant="subtitle1">No account transaction entries match your criteria for the selected account.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </TabPanel>


        {/* --- Shared Modals & Popovers --- */}
        {/* Filter Popover for Reconciliation Tab */}
        <Popover
            open={Boolean(filterPopoverAnchorEl)}
            anchorEl={filterPopoverAnchorEl}
            onClose={handleCloseFilterPopover}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
            <Box sx={{ p: 2, width: 280 }}>
                <Typography variant="subtitle1" gutterBottom>Filter by {headCellsReconciliation.find(h => h.id === currentFilterColumn)?.label || currentFilterColumn}</Typography>
                {headCellsReconciliation.find(h => h.id === currentFilterColumn)?.filterType === 'popoverText' && (
                    <TextField
                        fullWidth
                        label={`Search ${headCellsReconciliation.find(h => h.id === currentFilterColumn)?.label || currentFilterColumn}`}
                        variant="outlined"
                        size="small"
                        value={popoverSearchText}
                        onChange={(e) => setPopoverSearchText(e.target.value)}
                        autoFocus
                    />
                )}
                {headCellsReconciliation.find(h => h.id === currentFilterColumn)?.filterType === 'popoverSelect' && (
                    <FormGroup sx={{maxHeight: 200, overflowY: 'auto'}}>
                        {(headCellsReconciliation.find(h => h.id === currentFilterColumn)?.options || []).map(optValue => (
                            <FormControlLabel
                                control={<Checkbox checked={popoverSelectedOptions.includes(String(optValue).toLowerCase())} onChange={handlePopoverMultiSelectChange} name={String(optValue).toLowerCase()} />}
                                label={String(optValue)}
                                key={String(optValue)}
                            />
                        ))}
                    </FormGroup>
                )}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => handleClearPopoverFilter(currentFilterColumn)} size="small">Clear</Button>
                    <Button onClick={handleApplyPopoverFilter} variant="contained" size="small">Apply</Button>
                </Box>
            </Box>
        </Popover>

        {/* AI Analysis Dialog */}
        <Dialog open={isAnalysisModalOpen} onClose={handleCloseAnalysisModal} maxWidth="sm" fullWidth>
            <DialogTitle sx={{backgroundColor: 'info.main', color: 'white'}}>
                ✨ AI Transaction Analysis
                {analyzingTransaction && <Typography variant="caption" display="block">For: {analyzingTransaction.description.substring(0,50)}...</Typography>}
            </DialogTitle>
            <DialogContent dividers>
                {isLoadingAnalysis && (
                    <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', p:3, flexDirection:'column'}}>
                        <CircularProgress />
                        <Typography sx={{mt:2}}>Analyzing transaction with AI...</Typography>
                    </Box>
                )}
                {analysisError && <Alert severity="error" sx={{my:1}}>{analysisError}</Alert>}
                {!isLoadingAnalysis && analysisResult && (
                    <Box sx={{my:2}}>
                        <Typography variant="h6" gutterBottom>Suggestions from AI:</Typography>
                        <Paper variant="outlined" sx={{p:2, mb:2, borderColor:'info.light', backgroundColor: alpha(theme.palette.info.light, 0.1)}}>
                            <Typography variant="subtitle1"><strong>Enhanced Description:</strong></Typography>
                            <Typography gutterBottom>{analysisResult.enhanced_description||"N/A"}</Typography>
                            <Typography variant="subtitle1" sx={{mt:1}}><strong>Suggested Category:</strong></Typography>
                            <Chip label={analysisResult.suggested_category||"N/A"} color="info" variant="outlined" size="small"/>
                            <Typography variant="subtitle1" sx={{mt:2}}><strong>Suggested Ledger:</strong></Typography>
                            <Typography gutterBottom>{analysisResult.suggested_ledger_name||"N/A"}</Typography>
                            <Typography variant="subtitle1" sx={{mt:1}}><strong>Suggested Contact:</strong></Typography>
                            <Typography>{analysisResult.suggested_contact_name||"N/A"}</Typography>
                        </Paper>
                    </Box>
                )}
                {!isLoadingAnalysis && !analysisResult && !analysisError && <Typography sx={{p:2}}>No analysis results available. Ensure your API key is correctly configured if you expect AI results.</Typography>}
            </DialogContent>
            <DialogActions sx={{p:2}}>
                <Button onClick={handleCloseAnalysisModal} color="secondary">Close</Button>
                <Button onClick={handleApplySuggestions} color="primary" variant="contained" disabled={isLoadingAnalysis || !analysisResult || !!analysisError}>Apply Suggestions</Button>
            </DialogActions>
        </Dialog>

        {/* Potential Matches Popover */}
        <Popover
            id={matchingPopoverId}
            open={openMatchingPopover}
            anchorEl={popoverAnchorEl_match}
            onClose={handleMatchingItemsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
            <Box sx={{ p: 2, width: { xs: '90vw', sm: 500, md: 600 }, border: '1px solid #ddd' }}>
                <Typography variant="h6" gutterBottom>Potential Matches</Typography>
                {transactionForMatching && (
                    <Typography variant="body2" sx={{mb:1, backgroundColor: alpha(theme.palette.warning.light, 0.1), p:1, borderRadius:1}}>
                        Original: "{transactionForMatching.description}" - Amount: <strong>{transactionForMatching.amount.toFixed(2)}</strong>
                    </Typography>
                )}
                {potentialMatchError && <Alert severity="error" sx={{my:1}}>{potentialMatchError}</Alert>}
                <TableContainer component={Paper} variant="outlined" sx={{maxHeight: 300}}>
                    <Table size="small" stickyHeader>
                        <TableHead sx={{backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.1)}}>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell align="right">Spent</TableCell>
                                <TableCell align="right">Received</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentPotentialMatches.map((match) => (
                                <TableRow
                                    key={match.id}
                                    hover
                                    onClick={() => handleSelectPotentialMatch(match.id)}
                                    selected={selectedPotentialMatchId === match.id}
                                    sx={{cursor: 'pointer', '&.Mui-selected': {backgroundColor: alpha(theme.palette.primary.main, 0.08)}}}
                                >
                                    <TableCell padding="checkbox"><Checkbox color="primary" checked={selectedPotentialMatchId === match.id} onChange={() => handleSelectPotentialMatch(match.id)}/></TableCell>
                                    <TableCell>{match.date}</TableCell>
                                    <TableCell>{match.description}</TableCell>
                                    <TableCell>{match.reference}</TableCell>
                                    <TableCell align="right">{match.spent > 0 ? match.spent.toFixed(2) : '-'}</TableCell>
                                    <TableCell align="right">{match.received > 0 ? match.received.toFixed(2) : '-'}</TableCell>
                                </TableRow>
                            ))}
                            {currentPotentialMatches.length === 0 && (
                                <TableRow><TableCell colSpan={6} align="center" sx={{p:2}}>No potential matches found for this transaction.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleMatchingItemsClose} sx={{ mr: 1 }}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleConfirmMatch} disabled={!selectedPotentialMatchId}>Confirm Match & Remove</Button>
                </Box>
            </Box>
        </Popover>

        {/* Search Invoice Dialog */}
        <Dialog open={isSearchInvoiceModalOpen} onClose={handleCloseSearchInvoiceModal} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                Search Invoice / Create Transaction
                {transactionForInvoiceSearch && <Typography variant="caption" display="block">Original Bank Tx: {transactionForInvoiceSearch.description} (Amount: {transactionForInvoiceSearch.amount.toFixed(2)})</Typography>}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start', flexWrap:'wrap' }}>
                    <TextField label="Search invoice by name or ref number" value={invoiceSearchNameRef} onChange={e => setInvoiceSearchNameRef(e.target.value)} size="small" sx={{flexGrow: 1, minWidth: '200px'}}/>
                    <TextField label="Search by amount" type="number" value={invoiceSearchAmount} onChange={e => setInvoiceSearchAmount(e.target.value)} size="small" sx={{minWidth: '150px'}}/>
                    <Button onClick={handleModalInvoiceSearch} variant="contained" startIcon={<SearchIcon />} sx={{height: 'fit-content', mt: {xs:1, sm:0}}}>Search Invoices</Button>
                    <Button onClick={handleClearModalInvoiceSearch} variant="outlined" sx={{height: 'fit-content', mt: {xs:1, sm:0}}}>Clear Search</Button>
                </Box>
                <Typography variant="h6" gutterBottom>Found Invoices (Select one to reconcile directly)</Typography>
                {selectedInvoiceInModal &&
                    <Alert severity="info" sx={{mb:1}} size="small">
                        Invoice selected. You can add transaction/adjustment lines below to account for any difference.
                    </Alert>
                }
                {!selectedInvoiceInModal && invoiceSearchResults.length > 0 &&
                     <Alert severity="info" sx={{mb:1}} size="small">
                        Select an invoice to reconcile against it, or use the manual lines below.
                    </Alert>
                }
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200, mb: 2 }}>
                    <Table size="small" stickyHeader>
                        <TableHead><TableRow><TableCell padding="checkbox"></TableCell><TableCell>Date</TableCell><TableCell>Description</TableCell><TableCell>Reference</TableCell><TableCell align="right">Spent</TableCell><TableCell align="right">Received</TableCell></TableRow></TableHead>
                        <TableBody>
                            {invoiceSearchResults.map(inv => (
                                <TableRow hover key={inv.id} selected={selectedInvoiceInModal === inv.id} onClick={() => handleSelectInvoiceInModal(inv.id)} sx={{cursor:'pointer'}}>
                                    <TableCell padding="checkbox"><Checkbox checked={selectedInvoiceInModal === inv.id} /></TableCell>
                                    <TableCell>{inv.date}</TableCell><TableCell>{inv.description}</TableCell><TableCell>{inv.reference}</TableCell>
                                    <TableCell align="right">{inv.spent > 0 ? inv.spent.toFixed(2) : '-'}</TableCell>
                                    <TableCell align="right">{inv.received > 0 ? inv.received.toFixed(2) : '-'}</TableCell>
                                </TableRow>
                            ))}
                            {invoiceSearchResults.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{p:2}}>No invoices found matching search.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Divider sx={{ my: 2 }}><Chip label="OR MANUALLY CREATE / ADJUST" size="small"/></Divider>
                <Typography variant="h6" gutterBottom>Add Transaction Lines</Typography>
                {newTransactionLines.map((line) => (
                    <Grid container spacing={1} key={line.id} sx={{ mb: 1.5, alignItems: 'center', p:1, borderRadius:1, backgroundColor: alpha(theme.palette.grey[500],0.05) }}>
                        <Grid item xs={12} sm={2.5}><FormControl fullWidth size="small"><InputLabel id={`newline-contact-label-${line.id}`}>Contact</InputLabel><Select labelId={`newline-contact-label-${line.id}`} value={line.contact} onChange={e => handleUpdateNewLine(line.id, 'contact', e.target.value, 'transaction')} label="Contact">{contactOptions.map(c=><MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}<Divider /><MenuItem onClick={(e) => { e.stopPropagation(); handleAddNew('contact');}} sx={{color:'primary.main',fontWeight:'bold'}}><AddCircleOutlineIcon sx={{mr:1, fontSize:'1.2rem'}}/>New Contact</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={2.5}><TextField fullWidth label="Description" size="small" value={line.description} onChange={e => handleUpdateNewLine(line.id, 'description', e.target.value, 'transaction')} /></Grid>
                        <Grid item xs={6} sm={1}><TextField fullWidth label="Qty" type="number" size="small" value={line.qty} inputProps={{min:0}} onChange={e => handleUpdateNewLine(line.id, 'qty', e.target.value, 'transaction')} /></Grid>
                        <Grid item xs={6} sm={1.5}><TextField fullWidth label="Unit Price" type="number" size="small" value={line.unitPrice} inputProps={{min:0, step:"0.01"}} onChange={e => handleUpdateNewLine(line.id, 'unitPrice', e.target.value, 'transaction')} /></Grid>
                        <Grid item xs={12} sm={2}><FormControl fullWidth size="small" ><InputLabel id={`newline-account-label-${line.id}`}>Account</InputLabel><Select labelId={`newline-account-label-${line.id}`} value={line.account} onChange={e => handleUpdateNewLine(line.id, 'account', e.target.value, 'transaction')} label="Account">{accountOptions.map(a=><MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={6} sm={1.5}><FormControl fullWidth size="small" ><InputLabel id={`newline-tax-label-${line.id}`}>Tax</InputLabel><Select labelId={`newline-tax-label-${line.id}`} value={line.taxRate} onChange={e => handleUpdateNewLine(line.id, 'taxRate', e.target.value, 'transaction')} label="Tax">{taxRateOptions.map(t=><MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={4} sm={0.5} sx={{textAlign: 'right', pr:1}}><Typography variant="body2"><strong>{line.amount.toFixed(2)}</strong></Typography></Grid>
                        <Grid item xs={2} sm={0.5} sx={{textAlign: 'center'}}><Tooltip title="Remove Line">{<span><IconButton size="small" onClick={() => newTransactionLines.length > 1 ? handleRemoveLine(line.id, 'transaction') : null} color="error" disabled={newTransactionLines.length <= 1 }><DeleteIcon /></IconButton></span>}</Tooltip></Grid>
                    </Grid>
                ))}
                <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                    <Button onClick={() => handleAddNewLine('transaction')} startIcon={<AddCircleOutlineIcon />} size="small" >Add Transaction Line</Button>
                    <Button
                        onClick={() => handleAddNewLine('transaction', ACCOUNTS_RECEIVABLE_ID)}
                        startIcon={<PaymentIcon />}
                        size="small"
                        variant="outlined"
                        color="info"
                    >
                        Create Overpayment (to A/R)
                    </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Add Adjustments (e.g., Bank Fees)</Typography>
                {newAdjustmentLines.map((line) => (
                    <Grid container spacing={1} key={line.id} sx={{ mb: 1.5, alignItems: 'center', p:1, borderRadius:1, backgroundColor: alpha(theme.palette.grey[500],0.05) }}>
                        <Grid item xs={12} sm={3}><FormControl fullWidth size="small" ><InputLabel id={`adjline-contact-label-${line.id}`}>Contact</InputLabel><Select labelId={`adjline-contact-label-${line.id}`} value={line.contact} onChange={e => handleUpdateNewLine(line.id, 'contact', e.target.value, 'adjustment')} label="Contact">{contactOptions.map(c=><MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={3.5}><TextField fullWidth label="Description" size="small" value={line.description} onChange={e => handleUpdateNewLine(line.id, 'description', e.target.value, 'adjustment')} /></Grid>
                        <Grid item xs={12} sm={2.5}><FormControl fullWidth size="small" ><InputLabel id={`adjline-account-label-${line.id}`}>Account</InputLabel><Select labelId={`adjline-account-label-${line.id}`} value={line.account} onChange={e => handleUpdateNewLine(line.id, 'account', e.target.value, 'adjustment')} label="Account">{accountOptions.map(a=><MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={6} sm={1.5}><FormControl fullWidth size="small" ><InputLabel id={`adjline-tax-label-${line.id}`}>Tax</InputLabel><Select labelId={`adjline-tax-label-${line.id}`} value={line.taxRate} onChange={e => handleUpdateNewLine(line.id, 'taxRate', e.target.value, 'adjustment')} label="Tax">{taxRateOptions.map(t=><MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={4} sm={1}><TextField fullWidth label="Amount" type="number" size="small" value={line.amount} inputProps={{step:"0.01"}} onChange={e => handleUpdateNewLine(line.id, 'amount', e.target.value, 'adjustment')} /></Grid>
                        <Grid item xs={2} sm={0.5} sx={{textAlign: 'center'}}><Tooltip title="Remove Adjustment">{<span><IconButton size="small" onClick={() => newAdjustmentLines.length > 1 ? handleRemoveLine(line.id, 'adjustment') : null} color="error" disabled={newAdjustmentLines.length <=1 }><DeleteIcon /></IconButton></span>}</Tooltip></Grid>
                    </Grid>
                ))}
                <Button onClick={() => handleAddNewLine('adjustment')} startIcon={<AddCircleOutlineIcon />} size="small" >Add Adjustment Line</Button>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}`, mt:1, backgroundColor: alpha(theme.palette.grey[500], 0.05) }}>
                <Box sx={{flexGrow: 1, textAlign:'left'}}>
                    {searchInvoiceError && <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{mb:1}}>{searchInvoiceError}</Alert>}
                     <Typography variant="h6">
                        Total to Reconcile: {searchInvoiceModalDisplayTotal.toFixed(2)}
                    </Typography>
                    {transactionForInvoiceSearch && (
                        Math.abs(searchInvoiceModalDisplayTotal - transactionForInvoiceSearch.amount) > 0.01 &&
                        <Typography variant="caption" color={Math.abs(searchInvoiceModalDisplayTotal - transactionForInvoiceSearch.amount) > 0.01 ? "error" : "warning.main"}>
                            Difference from bank tx: {(searchInvoiceModalDisplayTotal - transactionForInvoiceSearch.amount).toFixed(2)}
                        </Typography>
                    )}
                </Box>
                <Button onClick={handleCloseSearchInvoiceModal} color="secondary">Cancel</Button>
                <Button
                    onClick={handleSearchInvoiceReconcile}
                    variant="contained"
                    color="primary"
                    disabled={ // Disable if bank tx amount doesn't match total, OR if no invoice selected and manual lines are zero
                        !transactionForInvoiceSearch ||
                        Math.abs(searchInvoiceModalDisplayTotal - transactionForInvoiceSearch.amount) > 0.01 ||
                        (!selectedInvoiceInModal && newTransactionLines.every(l => l.amount === 0) && newAdjustmentLines.every(l => l.amount ===0))
                    }
                >
                    Reconcile & Remove
                </Button>
            </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}

// Helper component to render content for each tab.
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other} // Spread other props to the div
    >
      {value === index && (<Box sx={{ pt: value === 0 ? 0 : 3 }}>{children}</Box>)} {/* Removed pt for first tab to align with controls */}
    </div>
  );
}

export default App;
