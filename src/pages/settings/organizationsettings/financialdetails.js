import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ThemeProvider,
    createTheme,
    Grid,
    Paper,
    FormControlLabel,
    Switch,
    FormHelperText,
    RadioGroup,
    Radio,
    FormLabel,
    CssBaseline,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import styled from "@emotion/styled";

// A modern theme for the application
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
        default: '#f4f6f8',
        paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
        fontWeight: 700,
    },
    h6: {
        fontWeight: 600,
    }
  },
  components: {
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                padding: '24px',
            }
        }
    }
  }
});

// Styled Paper component for the form container
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  padding: "24px",
  margin: "auto",
}));

// Moved outside the component to prevent re-creation on every render
const monthOptions = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ##################################################################
// ##                 FINANCIAL DETAILS COMPONENT                  ##
// ##################################################################

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

  useEffect(() => {
    if (isEInvoiceMandatory) setEInvoiceApplicable(true);
  }, [isEInvoiceMandatory]);

  useEffect(() => {
    const startIndex = monthOptions.indexOf(financialYearStartMonth);
    if (startIndex !== -1) {
        const endIndex = (startIndex - 1 + 12) % 12;
        setFinancialYearEndMonth(monthOptions[endIndex]);
    }
  }, [financialYearStartMonth]);

  const handleSave = () => {
    console.log("Saving Financial Details:", {
      salesTurnover, exceeded5Cr, eInvoiceApplicable, booksBeginningDate,
      financialYearStartMonth, dataLockType, lockDate: dataLockType !== 'none' ? lockDate : null, currency,
    });
    alert('Financial details saved to console!');
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" gutterBottom>Financial Configuration</Typography>
      <StyledPaper elevation={3}>
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
            {isEInvoiceMandatory && <FormHelperText sx={{ color: 'primary.main', fontWeight: 'bold' }}>E-invoicing is mandatory.</FormHelperText>}
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="contained" color="primary" size="large" onClick={handleSave}>Save Financial Config</Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}

// Main App component to render the form
function App() {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
         <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5, maxWidth: '1000px', margin: 'auto' }}>
                <FinancialDetails />
            </Box>
        </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
