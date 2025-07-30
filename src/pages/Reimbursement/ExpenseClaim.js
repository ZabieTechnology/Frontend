import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
// --- Date Picker Imports ---
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; // Or AdapterDayjs
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// -------------------------

// Sample list of names
const userNames = ['Rahul', 'Imtiaz', 'Yaseem', 'Other User'];

// Helper function to format date (optional)
const formatDate = (date) => {
  return date ? date.toLocaleDateString('en-CA') : ''; // Format as YYYY-MM-DD or your preference
};


function ExpenseFormAndList() {
  // --- State for Form Fields ---
  const [selectedDate, setSelectedDate] = useState(null);
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [currency, setCurrency] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [taxOption, setTaxOption] = useState('no'); // Default to 'no'
  const [taxPercent, setTaxPercent] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [expenseHead, setExpenseHead] = useState('');
  // ---------------------------

  // State for User Selection
  const [selectedName, setSelectedName] = useState(userNames[0]);

  // --- State for Published Expenses List ---
  const [publishedExpenses, setPublishedExpenses] = useState([]);
  // --------------------------------------

  const handleNameChange = (event) => {
    setSelectedName(event.target.value);
  };

  // --- Publish Handler ---
  const handlePublish = () => {
    const newExpense = {
      id: Date.now(), // Simple unique ID using timestamp
      date: formatDate(selectedDate), // Format the date for display
      supplier,
      invoiceNo,
      currency,
      totalAmount,
      taxOption,
      taxPercent,
      taxAmount,
      netAmount,
      expenseHead,
      publishedBy: selectedName // Capture who published it
    };

    setPublishedExpenses([...publishedExpenses, newExpense]);

    // --- Clear Form Fields (Optional) ---
    setSelectedDate(null);
    setSupplier('');
    setInvoiceNo('');
    setCurrency('');
    setTotalAmount('');
    setTaxOption('no');
    setTaxPercent('');
    setTaxAmount('');
    setNetAmount('');
    setExpenseHead('');
    // ---------------------------------
  };
  // ----------------------

  // --- Styles (Keep styles from previous examples) ---
   const greenBoxStyle = {
    backgroundColor: '#388E8E',
    borderRadius: 4,
    padding: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minHeight: 300, // Adjusted minimum height
  };

  const formRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    padding: '8px 0',
    minHeight: '40px', // Ensure consistent row height
    '&:last-child': {
        borderBottom: 'none',
    },
  };

   const labelStyle = {
      flexBasis: '30%',
      textAlign: 'left',
      paddingRight: 2,
  }

   const inputStyle = { // Adjusted for editable fields
       flexBasis: '65%',
       '& .MuiOutlinedInput-root': {
            height: '40px', // Match row height
           '& input': {
               padding: '8px 10px', // Adjust padding
               textAlign: 'right',
           },
            '& fieldset': {
               // Optionally add border back if needed
               // border: '1px solid #ccc',
           },
       },
   }
   const datePickerStyle = { // Style specifically for DatePicker if needed
       flexBasis: '65%',
        '& .MuiOutlinedInput-root': {
            height: '40px',
             '& input': {
               padding: '8px 10px',
               textAlign: 'right',
           },
        }
   }


   const radioInputStyle = {
        flexBasis: '65%',
        display: 'flex',
        justifyContent: 'flex-end',
    }
  // --------------------------------------------------

  return (
    // --- Wrap with LocalizationProvider for DatePicker ---
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 3 }}>
        <Grid container spacing={4}>

          {/* --- Left Column (Upload Bill) --- */}
          <Grid item xs={12} md={5}>
             <Paper elevation={3} sx={greenBoxStyle}>
              <Button variant="contained" component="label" color="inherit" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: '#f0f0f0' }}}>
                Upload Bill
                <input type="file" hidden />
              </Button>
            </Paper>
          </Grid>
          {/* ----------------------------------- */}


          {/* --- Right Column (Form) --- */}
          <Grid item xs={12} md={7}>
            {/* User Selection */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
              <Avatar sx={{ width: 32, height: 32, marginRight: 1 }}>
                {selectedName ? selectedName.charAt(0).toUpperCase() : '?'}
              </Avatar>
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                 <Select
                   value={selectedName}
                   onChange={handleNameChange}
                   disableUnderline
                   sx={{ fontSize: '1rem', fontWeight: '500', '.MuiSelect-select:focus': { backgroundColor: 'transparent' } }}
                 >
                   {userNames.map((name) => ( <MenuItem key={name} value={name}>{name}</MenuItem> ))}
                 </Select>
               </FormControl>
            </Box>

             {/* Form Fields Box */}
            <Box sx={{ border: '1px solid #e0e0e0', padding: '0 16px', marginBottom: 3 }}>
              {/* Form Row: Date */}
              <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Date</Typography>
                 <DatePicker
                    sx={datePickerStyle} // Apply specific style if needed
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{ textField: { size: 'small', variant: 'outlined' } }} // Make TextField smaller
                    format="dd-MM-yyyy" // Set desired date format
                 />
              </Box>

              {/* Form Row: Supplier */}
              <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Supplier</Typography>
                 <TextField sx={inputStyle} size="small" variant="outlined" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
              </Box>

              {/* Form Row: Invoice / Bill No. */}
              <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Invoice / Bill No.</Typography>
                 <TextField sx={inputStyle} size="small" variant="outlined" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
              </Box>

              {/* Form Row: Currency */}
              <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Currency</Typography>
                 <TextField sx={inputStyle} size="small" variant="outlined" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </Box>

              {/* Form Row: Total Amount */}
               <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Total Amount</Typography>
                 <TextField sx={inputStyle} size="small" variant="outlined" type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
              </Box>

              {/* Form Row: Tax */}
              <Box sx={formRowStyle}>
                  <Typography sx={labelStyle}>Tax</Typography>
                  <Box sx={radioInputStyle}>
                      <FormControl>
                          <RadioGroup row value={taxOption} onChange={(e) => setTaxOption(e.target.value)}>
                              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                          </RadioGroup>
                      </FormControl>
                   </Box>
              </Box>

              {/* Form Row: Tax % */}
               <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Tax %</Typography>
                 <TextField sx={inputStyle} size="small" variant="outlined" type="number" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)} />
              </Box>

              {/* Form Row: Tax Amount */}
               <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Tax Amount</Typography>
                 {/* In real app, this might be calculated & readOnly */}
                 <TextField sx={inputStyle} size="small" variant="outlined" type="number" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
              </Box>

               {/* Form Row: Net Amount */}
               <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Net Amount</Typography>
                 {/* In real app, this might be calculated & readOnly */}
                 <TextField sx={inputStyle} size="small" variant="outlined" type="number" value={netAmount} onChange={(e) => setNetAmount(e.target.value)} />
              </Box>

               {/* Form Row: Expense Head */}
               <Box sx={formRowStyle}>
                <Typography sx={labelStyle}>Expense Head</Typography>
                 <TextField sx={inputStyle} size="small" variant="outlined" value={expenseHead} onChange={(e) => setExpenseHead(e.target.value)} />
              </Box>
            </Box> {/* End Form Fields Box */}


            {/* Publish Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
               <Button variant="contained" size="small" onClick={handlePublish} sx={{backgroundColor: '#607D8B', '&:hover': { backgroundColor: '#455A64'}}}>
                 Publish
               </Button>
            </Box>

             {/* --- Published Expenses List --- */}
             {publishedExpenses.length > 0 && (
                <Box sx={{ marginTop: 4 }}>
                    <Typography variant="h6" gutterBottom>Published Expenses</Typography>
                    <Paper elevation={2}> {/* Wrap list in Paper for visual separation */}
                        <List disablePadding>
                            {publishedExpenses.map((expense, index) => (
                                <React.Fragment key={expense.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={`${expense.expenseHead} - ${expense.currency} ${expense.netAmount}`} // Example primary text
                                            secondary={
                                                <>
                                                    {`Date: ${expense.date}, Supplier: ${expense.supplier}, Invoice: ${expense.invoiceNo}`}
                                                    <br />
                                                    {`Total: ${expense.totalAmount}, Tax: ${expense.taxAmount} (${expense.taxPercent}%), By: ${expense.publishedBy}`}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {/* Add Divider between items except for the last one */}
                                    {index < publishedExpenses.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Box>
             )}
            {/* ------------------------------ */}


          </Grid>
          {/* --------------------------- */}
        </Grid>
      </Box>
    </LocalizationProvider> // --- End LocalizationProvider ---
  );
}

export default ExpenseFormAndList;