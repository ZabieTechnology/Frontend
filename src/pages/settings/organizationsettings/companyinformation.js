import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import axios from "axios";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#f5f5f5",
  padding: "24px",
  maxWidth: "1000px",
  margin: "auto",
}));

const initialFormData = {
  _id: null,
  logo: null,
  logoPreview: null,
  logoFilename: '',
  legalName: "",
  tradeName: "",
  companyRegistrationNumber: "",
  mobileNo: "",
  email: "",
  website: "",
  gstType: "",
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
  tdsEnabled: false,
  tcsEnabled: false,
  advanceTaxEnabled: false,
};

function CompanyInformation() {
  const [formData, setFormData] = useState(initialFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // TODO: Replace with actual fetching logic
  const [gstTypes] = useState([{value: 'regular', label: 'Regular'}, {value: 'composition', label: 'Composition'}]);
  const [states] = useState([{value: 'state_ka', label: 'Karnataka'}, {value: 'state_mh', label: 'Maharashtra'}]);
  const [countries] = useState([{value: 'country_in', label: 'India'}, {value: 'country_us', label: 'United States'}]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  const fetchCompanyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/company-information`, { withCredentials: true });
      if (response.data && response.data._id) {
        const fetchedData = response.data;
        setFormData({
          ...initialFormData,
          ...fetchedData,
          logo: null,
          // Use logoUrl from backend response if available, it's already a relative path
          logoPreview: fetchedData.logoUrl ? `${API_BASE_URL}${fetchedData.logoUrl}` : null
        });
        setSameAsBilling(
            fetchedData.billingAddressLine1 === fetchedData.deliveryAddressLine1 &&
            fetchedData.billingAddressLine2 === fetchedData.deliveryAddressLine2 &&
            fetchedData.billingAddressLine3 === fetchedData.deliveryAddressLine3 &&
            (fetchedData.billingAddressLine1 || fetchedData.billingAddressLine2 || fetchedData.billingAddressLine3) // Check if billing address is not empty
        );
        console.log("Fetched company data:", fetchedData);
      } else {
        setFormData(initialFormData);
        setSameAsBilling(false);
        console.log("No existing company data found.");
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError(`Failed to load company data: ${err.response?.data?.message || err.message}`);
      setFormData(initialFormData);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        logoFilename: file.name // Store the original filename for potential display or backend use
      }));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const submissionData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'logo' && key !== 'logoPreview' && key !== '_id' && value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          submissionData.append(key, value.toString());
        } else {
          submissionData.append(key, value);
        }
      }
    });

    if (formData.logo instanceof File) {
      submissionData.append('logo', formData.logo, formData.logo.name);
    }
    // No need to explicitly send 'removeLogo' if logoFilename is just cleared or not sent,
    // backend can infer if logoFilename is missing/empty in an update.
    // If you want explicit removal, add a 'removeLogo' flag to formData and append it.

    try {
        const url = `${API_BASE_URL}/api/company-information`;
        const method = formData._id ? 'put' : 'post';

        console.log(`Submitting (${method.toUpperCase()}) to:`, url);

        const response = await axios({
            method: method,
            url: url,
            data: submissionData,
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });

      setSuccess("Company information saved successfully!");
      if (response.data && response.data.data) {
        const savedData = response.data.data;
        setFormData({
            ...initialFormData,
            ...savedData,
            logo: null,
            // Use logoUrl from backend response (it's a relative path like /uploads/logos/filename.png)
            logoPreview: savedData.logoUrl ? `${API_BASE_URL}${savedData.logoUrl}` : null
        });
        setSameAsBilling(
            savedData.billingAddressLine1 === savedData.deliveryAddressLine1 &&
            savedData.billingAddressLine2 === savedData.deliveryAddressLine2 &&
            savedData.billingAddressLine3 === savedData.deliveryAddressLine3 &&
            (savedData.billingAddressLine1 || savedData.billingAddressLine2 || savedData.billingAddressLine3)
        );
      } else {
        fetchCompanyData(); // Refetch if response structure is unexpected but save might have occurred
      }
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Error saving company information:", err.response || err);
      setError(`Failed to save: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Company Information
      </Typography>

      {loading && !formData._id && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {(!loading || formData._id) && (
        <StyledPaper elevation={3} component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Upload Logo</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                 <Avatar
                    src={formData.logoPreview || undefined}
                    alt="Company Logo"
                    sx={{ width: 64, height: 64, bgcolor: 'grey.300' }}
                 >
                    {!formData.logoPreview && <UploadIcon />}
                 </Avatar>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                  {/* Show original filename if logo is staged, else existing filename, else "Choose Logo" */}
                  {formData.logo ? formData.logo.name : (formData.logoFilename ? "Change Logo" : "Choose Logo")}
                  <input type="file" hidden onChange={handleLogoChange} accept="image/*"/>
                </Button>
              </Box>

              <TextField margin="normal" required fullWidth id="legalName" label="Legal name" name="legalName" value={formData.legalName} onChange={handleChange} autoFocus />
              <TextField margin="normal" required fullWidth id="tradeName" label="Trade name" name="tradeName" value={formData.tradeName} onChange={handleChange} />
              <TextField margin="normal" fullWidth id="companyRegistrationNumber" label="Company Registration Number" name="companyRegistrationNumber" value={formData.companyRegistrationNumber} onChange={handleChange} />
              <TextField margin="normal" required fullWidth id="mobileNo" label="Mobile no." name="mobileNo" value={formData.mobileNo} onChange={handleChange} />
              <TextField margin="normal" required fullWidth id="email" label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} />
              <TextField margin="normal" fullWidth id="website" label="Website" name="website" value={formData.website} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>GST Type</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="gst-type-label">GST Type</InputLabel>
                <Select labelId="gst-type-label" id="gstType" label="GST Type" name="gstType" value={formData.gstType} onChange={handleChange}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {gstTypes.map((gstType) => (<MenuItem key={gstType.value} value={gstType.value}>{gstType.label}</MenuItem>))}
                </Select>
              </FormControl>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Registered / Billing Address</Typography>
              <TextField margin="normal" required fullWidth id="billingAddressLine1" label="Address Line 1" name="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} />
              <TextField margin="normal" fullWidth id="billingAddressLine2" label="Address Line 2" name="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange} />
              <TextField margin="normal" fullWidth id="billingAddressLine3" label="Address Line 3" name="billingAddressLine3" value={formData.billingAddressLine3} onChange={handleChange} />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Delivery Address</Typography>
              <FormControlLabel
                control={<Switch checked={sameAsBilling} onChange={handleSameAsBillingChange} name="sameAsBilling" color="primary" />}
                label="Same as billing address"
              />
              {!sameAsBilling && (
                <>
                  <TextField margin="normal" required fullWidth id="deliveryAddressLine1" label="Address Line 1" name="deliveryAddressLine1" value={formData.deliveryAddressLine1} onChange={handleChange} />
                  <TextField margin="normal" fullWidth id="deliveryAddressLine2" label="Address Line 2" name="deliveryAddressLine2" value={formData.deliveryAddressLine2} onChange={handleChange} />
                  <TextField margin="normal" fullWidth id="deliveryAddressLine3" label="Address Line 3" name="deliveryAddressLine3" value={formData.deliveryAddressLine3} onChange={handleChange} />
                </>
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel id="state-label">State</InputLabel>
                <Select labelId="state-label" id="state" label="State" name="state" value={formData.state} onChange={handleChange}>
                   <MenuItem value=""><em>None</em></MenuItem>
                  {states.map((state) => (<MenuItem key={state.value} value={state.value}>{state.label}</MenuItem>))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="country-label">Country</InputLabel>
                <Select labelId="country-label" id="country" label="Country" name="country" value={formData.country} onChange={handleChange}>
                   <MenuItem value=""><em>None</em></MenuItem>
                  {countries.map((country) => (<MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>))}
                </Select>
              </FormControl>
              <TextField margin="normal" required fullWidth id="pinCode" label="PIN/ZIP Code" name="pinCode" value={formData.pinCode} onChange={handleChange} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Compliance & Tax Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.gstRegistered} onChange={handleSwitchChange} name="gstRegistered" />} label="GST Registered" />
                {formData.gstRegistered && (<TextField margin="dense" required fullWidth id="gstNumber" label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} /> )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.pfEnabled} onChange={handleSwitchChange} name="pfEnabled" />} label="PF Enabled" />
                {formData.pfEnabled && (<TextField margin="dense" required fullWidth id="pfNumber" label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} />)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.esicEnabled} onChange={handleSwitchChange} name="esicEnabled" />} label="ESIC Enabled" />
                {formData.esicEnabled && (<TextField margin="dense" required fullWidth id="esicNumber" label="ESIC Number" name="esicNumber" value={formData.esicNumber} onChange={handleChange} />)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.iecRegistered} onChange={handleSwitchChange} name="iecRegistered" />} label="IEC Registered" />
                {formData.iecRegistered && (<TextField margin="dense" required fullWidth id="iecNumber" label="IEC Number" name="iecNumber" value={formData.iecNumber} onChange={handleChange} />)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.tdsEnabled} onChange={handleSwitchChange} name="tdsEnabled" />} label="TDS Enabled" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.tcsEnabled} onChange={handleSwitchChange} name="tcsEnabled" />} label="TCS Enabled" />
              </Grid>
               <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.advanceTaxEnabled} onChange={handleSwitchChange} name="advanceTaxEnabled" />} label="Advance Tax Enabled" />
              </Grid>
            </Grid>
          </Box>

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading} >
            {loading ? <CircularProgress size={24} /> : (formData._id ? "Update Information" : "Save Information")}
          </Button>
        </StyledPaper>
      )}
    </Box>
  );
}

export default CompanyInformation;
