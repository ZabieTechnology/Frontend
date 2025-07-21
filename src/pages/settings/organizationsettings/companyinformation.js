import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
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
    TextField,
    CircularProgress,
    Alert,
    Avatar,
    CssBaseline,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Upload as UploadIcon } from "@mui/icons-material";
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

// ##################################################################
// ##                 COMPANY INFORMATION COMPONENT                ##
// ##################################################################

const initialFormData = {
  _id: null,
  logo: null,
  logoPreview: null,
  logoFilename: '',
  legalName: "",
  tradeName: "",
  companyRegistrationNumber: "",
  panNumber: "",
  mobileNo: "",
  email: "",
  website: "",
  gstType: "",
  gstIsdNumber: "",
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingAddressLine3: "",
  deliveryAddressLine1: "",
  deliveryAddressLine2: "",
  deliveryAddressLine3: "",
  state: "",
  country: "",
  pinCode: "",
  gstRegistered: false,
  gstNumber: "",
  pfEnabled: false,
  pfNumber: "",
  esicEnabled: false,
  esicNumber: "",
  iecRegistered: false,
  iecNumber: "",
  tdsTcsEnabled: false,
  tanNumber: "",
  tdsTcsFinancialYear: "",
  advanceTaxEnabled: false,
};

function CompanyInformation() {
  const [formData, setFormData] = useState(initialFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper function to generate financial years
  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate years from 4 years ago to 4 years in the future
    for (let i = -4; i <= 4; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        // Format as YYYY-YY, e.g., 2023-24
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
      ...(name === 'gstRegistered' && !checked && { gstNumber: '' }),
      ...(name === 'pfEnabled' && !checked && { pfNumber: '' }),
      ...(name === 'esicEnabled' && !checked && { esicNumber: '' }),
      ...(name === 'iecRegistered' && !checked && { iecNumber: '' }),
      ...(name === 'tdsTcsEnabled' && !checked && { tanNumber: '', tdsTcsFinancialYear: '' }),
    }));
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
        ...prevData,
        deliveryAddressLine1: '',
        deliveryAddressLine2: '',
        deliveryAddressLine3: '',
      }));
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo file size should not exceed 2MB.");
        return;
      }
      setFormData((prevData) => ({
        ...prevData,
        logo: file,
        logoPreview: URL.createObjectURL(file),
        logoFilename: file.name
      }));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    console.log("Submitting Company Information:", formData);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess("Company information saved successfully!");
    setLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>Company Information</Typography>
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      <StyledPaper elevation={3} component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Upload Logo</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar src={formData.logoPreview || undefined} alt="Company Logo" sx={{ width: 64, height: 64, bgcolor: 'grey.300' }}>
                {!formData.logoPreview && <UploadIcon />}
              </Avatar>
              <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                {formData.logo ? formData.logo.name : "Choose Logo"}
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

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>GST Information</Typography>
            <FormControlLabel control={<Switch checked={formData.gstRegistered} onChange={handleSwitchChange} name="gstRegistered" />} label="GST Registered" />
            {formData.gstRegistered && (
              <TextField margin="dense" required fullWidth label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>GST Type</InputLabel>
              <Select label="GST Type" name="gstType" value={formData.gstType} onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {gstTypes.map((gstType) => (<MenuItem key={gstType.value} value={gstType.value}>{gstType.label}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField margin="normal" fullWidth label="GST ISD Number" name="gstIsdNumber" value={formData.gstIsdNumber} onChange={handleChange} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Registered / Billing Address</Typography>
            <TextField margin="normal" required fullWidth label="Address Line 1" name="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Address Line 2" name="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange} />
            <TextField margin="normal" fullWidth label="Address Line 3" name="billingAddressLine3" value={formData.billingAddressLine3} onChange={handleChange} />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Delivery Address</Typography>
            <FormControlLabel control={<Switch checked={sameAsBilling} onChange={handleSameAsBillingChange} />} label="Same as billing address" />
            {!sameAsBilling && (
              <>
                <TextField margin="normal" required fullWidth label="Address Line 1" name="deliveryAddressLine1" value={formData.deliveryAddressLine1} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Address Line 2" name="deliveryAddressLine2" value={formData.deliveryAddressLine2} onChange={handleChange} />
                <TextField margin="normal" fullWidth label="Address Line 3" name="deliveryAddressLine3" value={formData.deliveryAddressLine3} onChange={handleChange} />
              </>
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>State</InputLabel>
              <Select label="State" name="state" value={formData.state} onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {states.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Country</InputLabel>
              <Select label="Country" name="country" value={formData.country} onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {countries.map((c) => (<MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField margin="normal" required fullWidth label="PIN/ZIP Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
          </Grid>
        </Grid>

        {/* Compliance Section */}
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>Compliance & Tax Information</Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.pfEnabled} onChange={handleSwitchChange} name="pfEnabled" />} label="PF Enabled" />
                {formData.pfEnabled && (<TextField margin="dense" required fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} />)}
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.esicEnabled} onChange={handleSwitchChange} name="esicEnabled" />} label="ESIC Enabled" />
                {formData.esicEnabled && (<TextField margin="dense" required fullWidth label="ESIC Number" name="esicNumber" value={formData.esicNumber} onChange={handleChange} />)}
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.iecRegistered} onChange={handleSwitchChange} name="iecRegistered" />} label="IEC Registered" />
                {formData.iecRegistered && (<TextField margin="dense" required fullWidth label="IEC Number" name="iecNumber" value={formData.iecNumber} onChange={handleChange} />)}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch checked={formData.tdsTcsEnabled} onChange={handleSwitchChange} name="tdsTcsEnabled" />} label="TDS/TCS Enabled" />
              {formData.tdsTcsEnabled && (
                <Box sx={{ pl: 2, pt: 1 }}>
                  <TextField margin="dense" required fullWidth label="TAN Number" name="tanNumber" value={formData.tanNumber} onChange={handleChange} />
                  <FormControl fullWidth margin="dense">
                      <InputLabel id="financial-year-label">Since which financial year</InputLabel>
                      <Select
                          labelId="financial-year-label"
                          id="tdsTcsFinancialYear"
                          name="tdsTcsFinancialYear"
                          value={formData.tdsTcsFinancialYear}
                          label="Since which financial year"
                          onChange={handleChange}
                      >
                          <MenuItem value=""><em>None</em></MenuItem>
                          {financialYears.map((year) => (
                              <MenuItem key={year} value={year}>{year}</MenuItem>
                          ))}
                      </Select>
                  </FormControl>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.advanceTaxEnabled} onChange={handleSwitchChange} name="advanceTaxEnabled" />} label="Advance Tax Enabled" />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save Company Info"}
          </Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5, maxWidth: '1000px', margin: 'auto' }}>
          <CompanyInformation />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
