import React, { useState } from 'react';
import {
  Box, Button, Container, Typography, Stack, Paper, Grid,
  TextField, Select, MenuItem, FormControl, InputLabel, IconButton,
  InputAdornment, Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction,
  FormControlLabel, RadioGroup, Radio, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // For adding rows
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; // For removing rows

// Theme for consistent styling across the application
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.15rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.3rem', // Used for page titles like "Add rule"
      marginBottom: '16px',
    },
    subtitle1: { // For section headers within forms
        fontWeight: 500,
        fontSize: '1rem',
        color: '#424242', // Dark grey for section titles
        marginBottom: '12px',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          padding: '8px 22px',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#E8F5E9', // Default light green for inputs
          borderRadius: '12px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#A5D6A7',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#66BB6A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4CAF50',
          },
          // For white background inputs like search bars
          '&.whiteBg': {
            backgroundColor: 'white',
          }
        },
        input: {
          color: '#1B5E20', // Default dark green text
           '&.whiteBg': { // Text color for white background inputs
             color: '#212121', // Standard dark text
           }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#2E7D32',
          fontWeight: 500,
        }
      }
    },
    MuiCheckbox: {
        styleOverrides: {
            root: {
                color: '#2E7D32',
                '&.Mui-checked': {
                    color: '#1B5E20',
                },
            }
        }
    },
    MuiRadio: {
        styleOverrides: {
            root: {
                color: '#2E7D32',
                '&.Mui-checked': {
                    color: '#1B5E20',
                },
            }
        }
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                backgroundColor: '#E8F5E9', // Light green for table headers
                color: '#1B5E20',
                fontWeight: 600,
            },
            body: {
                borderColor: '#C8E6C9', // Lighter green for cell borders
            }
        }
    },
  },
});

// Shared style object for primary action buttons (usually green)
const actionButtonStyle = {
  backgroundColor: '#C8E6C9',
  color: '#2E7D32',
  '&:hover': {
    backgroundColor: '#A5D6A7',
  },
};

// Shared style for secondary/navigation buttons (grey)
const secondaryButtonStyle = {
  backgroundColor: '#E0E0E0',
  color: '#424242',
  '&:hover': {
    backgroundColor: '#BDBDBD',
  },
  padding: '10px 20px',
};

// Style for delete button (red)
const deleteButtonStyle = {
    backgroundColor: '#FFCDD2',
    color: '#C62828',
    '&:hover': {
      backgroundColor: '#EF9A9A',
    },
  };

// Style for save button (brighter green)
const saveButtonStyle = {
    backgroundColor: '#66BB6A', // Brighter green for save
    color: 'white',
    '&:hover': {
        backgroundColor: '#4CAF50',
    },
};

// --- New Styles based on the image ---

// Style for the active top navigation tab
const activeTabStyle = {
    backgroundColor: '#9CCC65',
    color: '#1B5E20',
    '&:hover': {
        backgroundColor: '#8BC34A',
    },
};

// Style for the inactive top navigation tabs
const inactiveTabStyle = {
    backgroundColor: '#E0E0E0',
    color: '#424242',
    '&:hover': {
        backgroundColor: '#BDBDBD',
    },
};

// Style for buttons within the main content area (e.g., on cards)
const contentButtonStyle = {
    backgroundColor: '#DCEDC8',
    color: '#33691E',
    '&:hover': {
        backgroundColor: '#C5E1A5',
    },
};


// Component for displaying individual bank account details
const BankAccountCard = ({ bankName, accountNumber, balance, statementDate }) => {
  const cardStyle = {
    backgroundColor: '#F4FBEB', // Light lime green to match image
    padding: { xs: '16px', sm: '24px' },
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  return (
    <Paper sx={cardStyle}>
        {/* Left side content */}
        <Box>
            <Typography variant="h6" component="h2" sx={{ color: '#37474F', fontWeight: 500 }}>
                {bankName} - {accountNumber}
            </Typography>
            <Typography variant="h6" component="p" sx={{ color: '#37474F', fontWeight: 500, my: 0.5 }}>
                (₹ {balance})
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: { xs: 2.5, sm: 3 } }}>
                Statement Balance as of {statementDate}
            </Typography>
            <Button variant="contained" sx={contentButtonStyle}>
                Reconcile
            </Button>
        </Box>

        {/* Right side content */}
        <Box>
            <Button variant="contained" sx={contentButtonStyle}>
                Manage Account
            </Button>
        </Box>
    </Paper>
  );
};

// Component for the "Add Bank Account" page
const AddBankAccountPage = ({ onBack }) => {
  const [country, setCountry] = useState('India');
  const [searchBank, setSearchBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [bankAccountType, setBankAccountType] = useState('');

  const formSectionPaperStyle = { padding: {xs: '20px', sm: '30px'}, backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'};
  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ ...secondaryButtonStyle, mb: 3 }}> Back to Dashboard </Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={formSectionPaperStyle}>
            <Typography variant="h5" component="h2" sx={{ color: '#37474F'}}> Search Account </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}> Find and connect your bank, credit card, or payment provider to Co-book. </Typography>
            <FormControl fullWidth sx={{ mb: 2.5 }}>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select labelId="country-select-label" value={country} label="Country" onChange={(e) => setCountry(e.target.value)} >
                <MenuItem value="India">India</MenuItem> <MenuItem value="USA">USA</MenuItem> <MenuItem value="UK">UK</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Search Bank" variant="outlined" value={searchBank} onChange={(e) => setSearchBank(e.target.value)}
              InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton edge="end" sx={{color: '#2E7D32'}}> <SearchIcon /> </IconButton> </InputAdornment> ), className: 'whiteBg' }} // Added whiteBg for specific styling
              InputLabelProps={{className: 'whiteBg'}} // Ensure label color consistency for whiteBg
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}> or </Typography>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={formSectionPaperStyle}>
            <Typography variant="h5" component="h2" sx={{ color: '#37474F' }}> Add bank without linking </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}> Account details </Typography>
            <Stack spacing={2.5}>
              <TextField fullWidth label="Bank name" variant="outlined" />
              <TextField fullWidth label="Account name" variant="outlined" />
               <FormControl fullWidth>
                <InputLabel id="bank-account-type-select-label">Bank Account type</InputLabel>
                <Select
                  labelId="bank-account-type-select-label"
                  value={bankAccountType}
                  label="Bank Account type"
                  onChange={(e) => setBankAccountType(e.target.value)}
                >
                  <MenuItem value="Current Account">Current Account</MenuItem>
                  <MenuItem value="Savings Account">Savings Account</MenuItem>
                  <MenuItem value="Overdraft">Overdraft</MenuItem>
                  <MenuItem value="Cash Credit">Cash Credit</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Currency" variant="outlined" />
              <FormControl fullWidth>
                <InputLabel id="account-type-select-label">Account type</InputLabel>
                <Select
                  labelId="account-type-select-label"
                  value={accountType}
                  label="Account type"
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <MenuItem value="Bank">Bank</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" sx={{...actionButtonStyle, mt: 2, alignSelf: 'flex-start' }}> Add Account </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Component for creating/editing a single bank rule (based on PDF)
const CreateEditRuleForm = ({ onCancel, onSave }) => {
    const [bankAccount, setBankAccount] = useState('');
    const [ruleName, setRuleName] = useState('');
    const [applyConditionLogic, setApplyConditionLogic] = useState('any'); // 'any' or 'all'
    const [conditions, setConditions] = useState([{ field: '', condition: '', value: '' }]);
    const [allocateContact, setAllocateContact] = useState('');
    const [percentLineItems, setPercentLineItems] = useState([{ description: '', account: '', taxRate: '', percent: '' }]);
    const [fixedValueLineItems, setFixedValueLineItems] = useState([{ description: '', account: '', taxRate: '', amount: '' }]);

    const formCardStyle = { p: {xs: 2, sm: 3}, mb: 3, backgroundColor: '#FBFCFF' }; // Light background for cards within the form

    // --- Handlers for dynamic rows ---
    const addRow = (setter, newRow) => setter(prev => [...prev, newRow]);
    const removeRow = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));
    const updateRow = (setter, index, field, value) => {
        setter(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    const availableFields = ["Payee", "Description", "Amount", "Reference"]; // Example fields
    const availableConditions = ["Contains", "Equals", "Starts with", "Is blank", "Is not blank"]; // Example conditions

    return (
        <Paper sx={{ p: {xs: 2, sm: 4}, backgroundColor: 'white' }}>
            <Typography variant="h5" sx={{ color: '#37474F', mb: 3}}>Add rule</Typography>

            <Paper sx={formCardStyle}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="bank-credit-card-select-label">Select Bank/Credit Card</InputLabel>
                            <Select
                                labelId="bank-credit-card-select-label"
                                value={bankAccount}
                                label="Select Bank/Credit Card"
                                onChange={(e) => setBankAccount(e.target.value)}
                            >
                                <MenuItem value="icici_0487">ICICI Bank - 0487</MenuItem>
                                <MenuItem value="sbi_0879">SBI Bank - 0879</MenuItem>
                                <MenuItem value="hdfc_cc_1234">HDFC Credit Card - 1234</MenuItem>
                                <MenuItem value="axis_bank_5678">Axis Bank - 5678</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Rule Name" value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={formCardStyle}>
                <Typography variant="subtitle1">Apply a bank rule if</Typography>
                <FormControl component="fieldset">
                    <RadioGroup row value={applyConditionLogic} onChange={(e) => setApplyConditionLogic(e.target.value)}>
                        <FormControlLabel value="any" control={<Radio />} label="Any condition matches" />
                        <FormControlLabel value="all" control={<Radio />} label="All condition matches" />
                    </RadioGroup>
                </FormControl>
            </Paper>

            <Paper sx={formCardStyle}>
                <Typography variant="subtitle1">Add conditions</Typography>
                {conditions.map((cond, index) => (
                    <Grid container spacing={1} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                        <Grid item xs={12} sm={3.5}> <FormControl fullWidth><InputLabel>Field</InputLabel><Select value={cond.field} label="Field" onChange={e => updateRow(setConditions, index, 'field', e.target.value)}>{availableFields.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}</Select></FormControl> </Grid>
                        <Grid item xs={12} sm={3.5}> <FormControl fullWidth><InputLabel>Condition</InputLabel><Select value={cond.condition} label="Condition" onChange={e => updateRow(setConditions, index, 'condition', e.target.value)}>{availableConditions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl> </Grid>
                        <Grid item xs={12} sm={3.5}> <TextField fullWidth label="Value" value={cond.value} onChange={e => updateRow(setConditions, index, 'value', e.target.value)} /> </Grid>
                        <Grid item xs={12} sm={1.5} sx={{textAlign: 'right'}}> <Tooltip title="Remove Condition"><IconButton onClick={() => removeRow(setConditions, index)} color="error"><RemoveCircleOutlineIcon /></IconButton></Tooltip> </Grid>
                    </Grid>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => addRow(setConditions, { field: '', condition: '', value: '' })} sx={{mt:1, ...actionButtonStyle}}>Add Condition</Button>
            </Paper>

            <Paper sx={formCardStyle}>
                <Typography variant="subtitle1">Allocate contact</Typography>
                <FormControl fullWidth> <InputLabel>Select Account</InputLabel> <Select value={allocateContact} label="Select Account" onChange={(e) => setAllocateContact(e.target.value)}> <MenuItem value="contact1">Contact 1</MenuItem> <MenuItem value="contact2">Contact 2</MenuItem> </Select> </FormControl>
            </Paper>

            <Paper sx={formCardStyle}>
                <Typography variant="subtitle1">Allocate item</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2}}>With any remainder, allocate ratios using percent line items</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead> <TableRow> <TableCell>Description</TableCell> <TableCell>Account</TableCell> <TableCell>TAX rate</TableCell> <TableCell>Percent</TableCell> <TableCell align="right">Actions</TableCell> </TableRow> </TableHead>
                        <TableBody>
                            {percentLineItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell><TextField variant="standard" fullWidth value={item.description} onChange={e => updateRow(setPercentLineItems, index, 'description', e.target.value)} /></TableCell>
                                    <TableCell><TextField variant="standard" fullWidth value={item.account} onChange={e => updateRow(setPercentLineItems, index, 'account', e.target.value)}/></TableCell>
                                    <TableCell><TextField variant="standard" fullWidth value={item.taxRate} onChange={e => updateRow(setPercentLineItems, index, 'taxRate', e.target.value)}/></TableCell>
                                    <TableCell><TextField variant="standard" fullWidth type="number" value={item.percent} onChange={e => updateRow(setPercentLineItems, index, 'percent', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}/></TableCell>
                                    <TableCell align="right"><Tooltip title="Remove Item"><IconButton onClick={() => removeRow(setPercentLineItems, index)} color="error" size="small"><RemoveCircleOutlineIcon /></IconButton></Tooltip></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => addRow(setPercentLineItems, { description: '', account: '', taxRate: '', percent: '' })} sx={{mt:1, ...actionButtonStyle}}>Add Item</Button>

                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3, mb: 2}}>Automatically allocate fixed value line items</Typography>
                 <TableContainer>
                    <Table size="small">
                        <TableHead> <TableRow> <TableCell>Description</TableCell> <TableCell>Account</TableCell> <TableCell>TAX rate</TableCell> <TableCell>Amount</TableCell> <TableCell align="right">Actions</TableCell> </TableRow> </TableHead>
                        <TableBody>
                            {fixedValueLineItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell><TextField variant="standard" fullWidth value={item.description} onChange={e => updateRow(setFixedValueLineItems, index, 'description', e.target.value)}/></TableCell>
                                    <TableCell><TextField variant="standard" fullWidth value={item.account} onChange={e => updateRow(setFixedValueLineItems, index, 'account', e.target.value)}/></TableCell>
                                    <TableCell><TextField variant="standard" fullWidth value={item.taxRate} onChange={e => updateRow(setFixedValueLineItems, index, 'taxRate', e.target.value)}/></TableCell>
                                    <TableCell><TextField variant="standard" fullWidth type="number" value={item.amount} onChange={e => updateRow(setFixedValueLineItems, index, 'amount', e.target.value)}/></TableCell>
                                    <TableCell align="right"><Tooltip title="Remove Item"><IconButton onClick={() => removeRow(setFixedValueLineItems, index)} color="error" size="small"><RemoveCircleOutlineIcon /></IconButton></Tooltip></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => addRow(setFixedValueLineItems, { description: '', account: '', taxRate: '', amount: '' })} sx={{mt:1, ...actionButtonStyle}}>Add Item</Button>
            </Paper>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button variant="outlined" sx={{...deleteButtonStyle, borderColor: '#C62828'}} onClick={onCancel}>Delete</Button> {/* Assuming cancel acts as delete here or needs another handler */}
                <Button variant="outlined" sx={secondaryButtonStyle} onClick={onCancel}>Cancel</Button>
                <Button variant="contained" sx={saveButtonStyle} onClick={onSave}>Save</Button>
            </Stack>
        </Paper>
    );
};


// Component for the "Add Bank Rules" page (List View)
const AddBankRulesPage = ({ onBack }) => {
  const [searchRule, setSearchRule] = useState('');
  const initialRules = [
    { id: 1, name: 'SBI-Service Charge', condition: "Analysis text contains 'SERVICE CHARGE'", checked: false },
    { id: 2, name: 'Room Rent', condition: "Analysis text contains 'Rent'", checked: false },
    { id: 3, name: 'Rocky', condition: "Description contains 'Rocky'", checked: false },
    { id: 4, name: 'Facebook', condition: "Description contains 'Facebook'", checked: true },
    { id: 5, name: 'Google', condition: "Description contains 'Google'", checked: false },
  ];
  const [rules, setRules] = useState(initialRules);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'

  const handleRuleToggle = (id) => {
    const newRules = rules.map(rule => rule.id === id ? { ...rule, checked: !rule.checked } : rule);
    setRules(newRules); setSelectAll(newRules.every(rule => rule.checked));
  };
  const handleSelectAllToggle = (event) => {
    const newCheckedState = event.target.checked;
    setSelectAll(newCheckedState); setRules(rules.map(rule => ({ ...rule, checked: newCheckedState })));
  };

  const rulesContainerStyle = { backgroundColor: '#F1F8E9', padding: { xs: '16px', sm: '24px' }, borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
  const filteredRules = rules.filter(rule => rule.name.toLowerCase().includes(searchRule.toLowerCase()) || rule.condition.toLowerCase().includes(searchRule.toLowerCase()));

  if (viewMode === 'form') {
    return <CreateEditRuleForm onCancel={() => setViewMode('list')} onSave={() => { /* Add save logic here */ setViewMode('list'); }} />;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ ...secondaryButtonStyle, mb: 3 }}> Back to Dashboard </Button>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <TextField sx={{ flexGrow: 1, mr: 2, '& .MuiOutlinedInput-root': { backgroundColor: 'white', borderRadius: '999px', className: 'whiteBg' }}}
          placeholder="Search Rule" variant="outlined" value={searchRule} onChange={(e) => setSearchRule(e.target.value)}
          InputProps={{ startAdornment: ( <InputAdornment position="start"> <IconButton edge="start" sx={{color: '#2E7D32'}}> <SearchIcon /> </IconButton> </InputAdornment> ), className: 'whiteBg' }}
          InputLabelProps={{className: 'whiteBg'}}
        />
        <Button variant="contained" sx={{...actionButtonStyle, whiteSpace: 'nowrap' }} onClick={() => setViewMode('form')}> + Add new Rule </Button>
      </Stack>
      <Paper sx={rulesContainerStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2, borderBottom: '1px solid #E0E0E0' }}>
          <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAllToggle} />} label="Select all" sx={{color: '#37474F'}} />
          <Button variant="contained" sx={deleteButtonStyle} startIcon={<DeleteIcon />}> Delete </Button>
        </Stack>
        <List>
          {filteredRules.map((rule) => (
            <ListItem key={rule.id} divider sx={{ '&:last-child': { borderBottom: 0 } }}>
              <Checkbox edge="start" checked={rule.checked} onChange={() => handleRuleToggle(rule.id)} tabIndex={-1} disableRipple />
              <ListItemText primary={rule.name} secondary={rule.condition} primaryTypographyProps={{ fontWeight: '500', color: '#37474F' }} secondaryTypographyProps={{ color: 'text.secondary' }} />
              <ListItemSecondaryAction> <Button variant="contained" sx={actionButtonStyle} onClick={() => setViewMode('form') /* Pass rule data for editing */}> Edit </Button> </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

// Component for the main dashboard view
const DashboardPage = ({ onAddAccountClick, onAddRulesClick, bankAccounts }) => (
    <Box>
      {bankAccounts.map((account, index) => (
        <BankAccountCard key={index} {...account} />
      ))}
      <Stack direction="row" spacing={2} sx={{ mt: 4 }} justifyContent="flex-end">
        <Button variant="contained" sx={contentButtonStyle} onClick={onAddAccountClick}>
          + Add Bank Account
        </Button>
        <Button variant="contained" sx={contentButtonStyle} onClick={onAddRulesClick}>
          + Add Bank Rules
        </Button>
      </Stack>
    </Box>
  );

// Main App component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('Credit Card');
  const bankAccounts = [
    { bankName: 'ICICI Bank CC', accountNumber: '0487', balance: '23,547.33', statementDate: '26 May 2025' },
    { bankName: 'SBI Bank CC', accountNumber: '0879', balance: '1,63,587.23', statementDate: '26 May 2025' },
  ];

  const renderContent = () => {
    switch(currentPage) {
        case 'addAccount':
            return <AddBankAccountPage onBack={() => setCurrentPage('dashboard')} />;
        case 'addRules':
            return <AddBankRulesPage onBack={() => setCurrentPage('dashboard')} />;
        default: // 'dashboard'
            return <DashboardPage
                bankAccounts={bankAccounts}
                onAddAccountClick={() => setCurrentPage('addAccount')}
                onAddRulesClick={() => setCurrentPage('addRules')}
            />
    }
  };

  const navTabs = ['Overview', 'Bank', 'Credit Card', 'Cheque', 'Cash', 'Loan', 'Wallet'];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, backgroundColor: '#F7F9FC', minHeight: '100vh' }}>
        <Stack direction="row" spacing={1} sx={{ mb: { xs: 3, sm: 4 } }} justifyContent="center" flexWrap="wrap">
            {navTabs.map(tab => (
                <Button
                    key={tab}
                    variant="contained"
                    onClick={() => setActiveTab(tab)}
                    sx={activeTab === tab ? activeTabStyle : inactiveTabStyle}
                >
                    {tab}
                </Button>
            ))}
        </Stack>

        {renderContent()}
      </Container>
    </ThemeProvider>
  );
}

export default App;
