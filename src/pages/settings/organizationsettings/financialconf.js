import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormLabel from '@mui/material/FormLabel';
import CssBaseline from '@mui/material/CssBaseline';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import styled from "@emotion/styled";

// Modern theme for the application
const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2c3e50' },
    secondary: { main: '#1abc9c' },
    background: { default: '#ecf0f1', paper: '#ffffff' },
    text: { primary: '#34495e', secondary: '#7f8c8d' }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, color: '#2c3e50' },
    h6: { fontWeight: 600, color: '#34495e' },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16, boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px', padding: '32px' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, padding: '10px 20px' } } },
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiSelect: { defaultProps: { variant: 'outlined' } }
  }
});

// Styled Paper component for form containers
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': { boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }
}));

const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function FinancialDetails() {
  const [salesTurnover, setSalesTurnover] = useState('');
  const [exceeded5Cr, setExceeded5Cr] = useState(false);
  const [eInvoiceApplicable, setEInvoiceApplicable] = useState(false);
  const [dataLockType, setDataLockType] = useState('none');
  const [lockDate, setLockDate] = useState(new Date());
  const [currency, setCurrency] = useState('INR');

  const [booksBeginningDate, setBooksBeginningDate] = useState(new Date('2024-04-01'));
  const [financialYearStartMonth, setFinancialYearStartMonth] = useState('April');
  const [financialYearEndMonth, setFinancialYearEndMonth] = useState('March');

  const isEInvoiceMandatory = salesTurnover === '>5 Cr' || exceeded5Cr;

  useEffect(() => { if (isEInvoiceMandatory) setEInvoiceApplicable(true); }, [isEInvoiceMandatory]);
  useEffect(() => {
    const startIndex = monthOptions.indexOf(financialYearStartMonth);
    if (startIndex !== -1) setFinancialYearEndMonth(monthOptions[(startIndex - 1 + 12) % 12]);
  }, [financialYearStartMonth]);

  const handleSave = () => {
    console.log("Saving Financial Details:", { salesTurnover, exceeded5Cr, eInvoiceApplicable, booksBeginningDate, financialYearStartMonth, dataLockType, lockDate: dataLockType !== 'none' ? lockDate : null, currency });
    alert('Financial details saved to console!');
  };

  return (
    <Box>
        <Typography variant="h4" gutterBottom>Financial Configuration</Typography>
      <StyledPaper>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Turnover & E-Invoicing</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Previous Year's Sales Turnover</InputLabel>
              <Select value={salesTurnover} label="Previous Year's Sales Turnover" onChange={(e) => setSalesTurnover(e.target.value)}>
                <MenuItem value={"<1 Cr"}>&lt; 1 Cr</MenuItem>
                <MenuItem value={"1-2 Cr"}>1 Cr - 2 Cr</MenuItem>
                <MenuItem value={"2-5 Cr"}>2 Cr - 5 Cr</MenuItem>
                <MenuItem value={">5 Cr"}>&gt; 5 Cr</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={exceeded5Cr} onChange={(e) => setExceeded5Cr(e.target.checked)} />} label="Turnover exceeded 5 Cr in any prior FY?" />
            <FormControlLabel control={<Switch checked={eInvoiceApplicable} onChange={(e) => setEInvoiceApplicable(e.target.checked)} disabled={isEInvoiceMandatory} />} label="Is E-invoicing Applicable?" />
            {isEInvoiceMandatory && <FormHelperText sx={{ color: 'secondary.main', fontWeight: 'bold' }}>E-invoicing is mandatory since turnover exceeds 5 Cr</FormHelperText>}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Fiscal Period & Currency</Typography>
            <DatePicker label="Books Beginning From" value={booksBeginningDate} onChange={setBooksBeginningDate} sx={{ width: '100%', mt: 2 }} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Financial Year Start Month *</InputLabel>
              <Select value={financialYearStartMonth} label="Financial Year Start Month *" onChange={(e) => setFinancialYearStartMonth(e.target.value)}>
                {monthOptions.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              Financial Year: <strong>{financialYearStartMonth} to {financialYearEndMonth}</strong>
            </Typography>
            <FormControl fullWidth margin="normal" sx={{ mt: 2 }}>
              <InputLabel>Base Currency</InputLabel>
              <Select value={currency} label="Base Currency" onChange={(e) => setCurrency(e.target.value)}>
                <MenuItem value="INR">INR (Indian Rupee)</MenuItem>
                <MenuItem value="USD">USD (United States Dollar)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
             <Typography variant="h6" gutterBottom>Data Security</Typography>
              <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Data Locking Options</FormLabel>
                  <RadioGroup row value={dataLockType} onChange={(e) => setDataLockType(e.target.value)}>
                      <FormControlLabel value="none" control={<Radio />} label="No Lock" />
                      <FormControlLabel value="all" control={<Radio />} label="Stop all users making changes" />
                      <FormControlLabel value="admin_exempt" control={<Radio />} label="Stop all users (except admin)" />
                  </RadioGroup>
              </FormControl>
              {dataLockType !== 'none' && (
                  <Box sx={{ mt: 2, pl: 2 }}>
                      <DatePicker label="Lock entries on and before" value={lockDate} onChange={setLockDate} sx={{ width: {xs: '100%', md: '50%'}, mt: 1 }} />
                  </Box>
              )}
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px solid #ecf0f1' }}>
            <Button variant="contained" color="secondary" size="large" onClick={handleSave}>Save Config</Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}

// Main App component to render the form
export default function App() {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ maxWidth: '1200px', margin: 'auto' }}>
                <FinancialDetails />
            </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}