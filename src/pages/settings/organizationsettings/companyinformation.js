import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    FormControlLabel,
    Switch,
    TextField,
    CircularProgress,
    Alert,
    Avatar,
    ThemeProvider,
    createTheme,
    CssBaseline,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Upload as UploadIcon } from "@mui/icons-material";
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

const initialCompanyFormData = {
  legalName: "", tradeName: "", companyRegistrationNumber: "", panNumber: "",
  mobileNo: "", email: "", website: "", gstType: "", gstIsdNumber: "",
  billingAddressLine1: "", billingAddressLine2: "", billingAddressLine3: "",
  deliveryAddressLine1: "", deliveryAddressLine2: "", deliveryAddressLine3: "",
  state: "", country: "", pinCode: "", gstRegistered: false, gstNumber: "",
  pfEnabled: false, pfNumber: "", esicEnabled: false, esicNumber: "",
  iecRegistered: false, iecNumber: "", tdsTcsEnabled: false, tanNumber: "",
  tdsTcsFinancialYear: "", advanceTaxEnabled: false, logo: null, logoPreview: null,
  msmeEnabled: false, msmeNumber: "",
};

function CompanyInformation() {
  const [formData, setFormData] = useState(initialCompanyFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -4; i <= 4; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years.reverse();
  };

  const [financialYears] = useState(generateFinancialYears());
  const [gstTypes] = useState([{value: 'regular', label: 'Regular'}, {value: 'composition', label: 'Composition'}]);
  const [states] = useState([{value: 'state_ka', label: 'Karnataka'}, {value: 'state_mh', label: 'Maharashtra'}]);
  const [countries] = useState([{value: 'country_in', label: 'India'}, {value: 'country_us', label: 'United States'}]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  const handleSameAsBillingChange = (event) => {
    const isChecked = event.target.checked;
    setSameAsBilling(isChecked);
    if (isChecked) {
      setFormData((prevData) => ({
        ...prevData,
        deliveryAddressLine1: prevData.billingAddressLine1,
        deliveryAddressLine2: prevData.billingAddressLine2,
        deliveryAddressLine3: prevData.billingAddressLine3,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData, deliveryAddressLine1: '', deliveryAddressLine2: '', deliveryAddressLine3: '',
      }));
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { setError("Logo file size should not exceed 2MB."); return; }
      setFormData((prevData) => ({ ...prevData, logo: file, logoPreview: URL.createObjectURL(file) }));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); setError(null); setSuccess(null);
    console.log("Submitting Company Information:", formData);
    // Here you would typically send data to your backend API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess("Company information saved successfully!");
    setLoading(false);
  };

  const handleNext = () => {
    window.location.href = 'http://localhost:3000/settings/organizationsettings/contactdetails';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Company Information</Typography>
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <StyledPaper component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Basic Details</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
              <Avatar src={formData.logoPreview || undefined} alt="Company Logo" sx={{ width: 80, height: 80, bgcolor: 'background.default', border: '2px dashed #bdc3c7' }}>
                {!formData.logoPreview && <UploadIcon color="action" />}
              </Avatar>
              <Button variant="outlined" component="label">
                {formData.logo ? "Change Logo" : "Upload Logo"}
                <input type="file" hidden onChange={handleLogoChange} accept="image/*" />
              </Button>
            </Box>
            <TextField margin="normal" required fullWidth label="Legal name" name="legalName" value={formData.legalName} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="Trade name" name="tradeName" value={formData.tradeName} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Company Registration Number" name="companyRegistrationNumber" value={formData.companyRegistrationNumber} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="Mobile no." name="mobileNo" value={formData.mobileNo} onChange={handleChange} />
            <TextField margin="normal" required fullWidth label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Address Details</Typography>
            <TextField margin="normal" required fullWidth label="Billing Address Line 1" name="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Billing Address Line 2" name="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Billing Address Line 3" name="billingAddressLine3" value={formData.billingAddressLine3} onChange={handleChange} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Delivery Address</Typography>
            <FormControlLabel control={<Switch checked={sameAsBilling} onChange={handleSameAsBillingChange} />} label="Same as billing address" />
            {!sameAsBilling && (
              <>
                <TextField margin="normal" required fullWidth label="Delivery Address Line 1" name="deliveryAddressLine1" value={formData.deliveryAddressLine1} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Delivery Address Line 2" name="deliveryAddressLine2" value={formData.deliveryAddressLine2} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Delivery Address Line 3" name="deliveryAddressLine3" value={formData.deliveryAddressLine3} onChange={handleChange} />
              </>
            )}
             <Grid container spacing={2} sx={{mt: 1}}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>State</InputLabel>
                        <Select label="State" name="state" value={formData.state} onChange={handleChange}>
                            {states.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                     <FormControl fullWidth margin="normal">
                        <InputLabel>Country</InputLabel>
                        <Select label="Country" name="country" value={formData.country} onChange={handleChange}>
                            {countries.map((c) => (<MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
             </Grid>
            <TextField margin="normal" required fullWidth label="PIN/ZIP Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #ecf0f1' }}>
          <Typography variant="h6" gutterBottom>Compliance & Tax Information</Typography>
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={formData.gstRegistered} onChange={handleSwitchChange} name="gstRegistered" />} label="GST Registered" />
                {formData.gstRegistered && ( <>
                    <TextField margin="dense" required fullWidth label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>GST Type</InputLabel>
                        <Select label="GST Type" name="gstType" value={formData.gstType} onChange={handleChange}>
                            {gstTypes.map((gstType) => (<MenuItem key={gstType.value} value={gstType.value}>{gstType.label}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField margin="dense" fullWidth label="GST ISD Number" name="gstIsdNumber" value={formData.gstIsdNumber} onChange={handleChange} />
                </>)}
            </Grid>
            <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.tdsTcsEnabled} onChange={handleSwitchChange} name="tdsTcsEnabled" />} label="TDS/TCS Enabled" />{formData.tdsTcsEnabled && (<Box sx={{ pt: 1 }}><TextField margin="dense" required fullWidth label="TAN Number" name="tanNumber" value={formData.tanNumber} onChange={handleChange} /><FormControl fullWidth margin="dense"><InputLabel>Since which financial year</InputLabel><Select label="Since which financial year" name="tdsTcsFinancialYear" value={formData.tdsTcsFinancialYear} onChange={handleChange}>{financialYears.map((year) => (<MenuItem key={year} value={year}>{year}</MenuItem>))}</Select></FormControl></Box>)}</Grid>
            <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.advanceTaxEnabled} onChange={handleSwitchChange} name="advanceTaxEnabled" />} label="Advance Tax Enabled" /></Grid>
            <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.esicEnabled} onChange={handleSwitchChange} name="esicEnabled" />} label="ESIC Enabled" />{formData.esicEnabled && (<TextField margin="dense" required fullWidth label="ESIC Number" name="esicNumber" value={formData.esicNumber} onChange={handleChange} />)}</Grid>
            <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.pfEnabled} onChange={handleSwitchChange} name="pfEnabled" />} label="PF Enabled" />{formData.pfEnabled && (<TextField margin="dense" required fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} />)}</Grid>
            <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.iecRegistered} onChange={handleSwitchChange} name="iecRegistered" />} label="IEC Registered" />{formData.iecRegistered && (<TextField margin="dense" required fullWidth label="IEC Number" name="iecNumber" value={formData.iecNumber} onChange={handleChange} />)}</Grid>
            <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.msmeEnabled} onChange={handleSwitchChange} name="msmeEnabled" />} label="MSME Registered" />
                {formData.msmeEnabled && (
                    <TextField margin="dense" required fullWidth label="MSME Number" name="msmeNumber" value={formData.msmeNumber} onChange={handleChange} />
                )}
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #ecf0f1' }}>
          <Button type="submit" variant="contained" color="secondary" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Save Company Info"}
          </Button>
          <Button variant="outlined" color="primary" size="large" onClick={handleNext}>
            Next
          </Button>
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
                <CompanyInformation />
            </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
