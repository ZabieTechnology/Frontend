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
  CircularProgress, // For loading indicator
  Alert, // For feedback
  Avatar, // To display logo preview
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import axios from "axios"; // For making API calls

// Styled Paper component for the curved grey box
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#f5f5f5", // Light grey background
  padding: "24px",
  // width: "50%", // Consider removing fixed width for responsiveness
  maxWidth: "1000px", // Set a max-width instead
  margin: "auto", // Center the paper
}));

// Define initial empty state
const initialFormData = {
  _id: null, // To track if editing
  logo: null, // Stores the File object for upload
  logoPreview: null, // Stores URL for preview
  logoFilename: '', // Stores filename from DB
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
  const [sameAsBilling, setSameAsBilling] = useState(false); // Keep separate for UI logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for dropdown values (assuming fetched elsewhere or hardcoded for now)
  // TODO: Replace with actual fetching logic, perhaps from a shared context or props
  const [gstTypes, setGstTypes] = useState([{value: 'regular', label: 'Regular'}, {value: 'composition', label: 'Composition'}]);
  const [states, setStates] = useState([{value: 'state1', label: 'State 1'}, {value: 'state2', label: 'State 2'}]);
  const [countries, setCountries] = useState([{value: 'country1', label: 'Country 1'}, {value: 'country2', label: 'Country 2'}]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || ''; // Get from .env

  // --- Fetch existing company data ---
  const fetchCompanyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/company-information`, { withCredentials: true });
      if (response.data && response.data._id) {
        // Data exists, populate form for editing
        const fetchedData = response.data;
        setFormData({
          ...initialFormData, // Start with defaults
          ...fetchedData, // Overwrite with fetched data
          logo: null, // Don't set the file object from fetch
          logoPreview: fetchedData.logoFilename ? `${API_BASE_URL}/uploads/logos/${fetchedData.logoFilename}` : null // Construct preview URL if logo exists
        });
        // Set sameAsBilling based on fetched data if addresses match
        setSameAsBilling(
            fetchedData.billingAddressLine1 === fetchedData.deliveryAddressLine1 &&
            fetchedData.billingAddressLine2 === fetchedData.deliveryAddressLine2 &&
            fetchedData.billingAddressLine3 === fetchedData.deliveryAddressLine3
        );
        console.log("Fetched company data:", fetchedData);
      } else {
        // No data found, form is in "create" mode
        setFormData(initialFormData);
        setSameAsBilling(false);
        console.log("No existing company data found.");
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError(`Failed to load company data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]); // Dependency

  useEffect(() => {
    fetchCompanyData();
    // TODO: Fetch actual dropdown values here if needed
    // fetchDropdownValues();
  }, [fetchCompanyData]); // Run fetch on mount

  // --- Handlers ---
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
      // Clear related number field if switch is turned off
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
      // Copy billing address to delivery address
      setFormData((prevData) => ({
        ...prevData,
        deliveryAddressLine1: prevData.billingAddressLine1,
        deliveryAddressLine2: prevData.billingAddressLine2,
        deliveryAddressLine3: prevData.billingAddressLine3,
      }));
    } else {
       // Optionally clear delivery address or leave as is
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
      setFormData((prevData) => ({
        ...prevData,
        logo: file, // Store the file object
        logoPreview: URL.createObjectURL(file), // Create a temporary URL for preview
      }));
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Create FormData object to send data + file
    const submissionData = new FormData();

    // Append all form fields (except file object and preview URL)
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'logo' && key !== 'logoPreview' && key !== '_id' && value !== null) {
        // Convert boolean to string for FormData
        if (typeof value === 'boolean') {
          submissionData.append(key, value.toString());
        } else {
          submissionData.append(key, value);
        }
      }
    });

    // Append the logo file if it exists
    if (formData.logo instanceof File) {
      submissionData.append('logo', formData.logo, formData.logo.name);
    }

    try {
        const url = `${API_BASE_URL}/api/company-information`;
        // Use PUT if we have an ID (editing), otherwise POST (creating)
        // Note: Backend uses upsert, so method might not strictly matter, but good practice.
        const method = formData._id ? 'put' : 'post';

        console.log(`Submitting (${method.toUpperCase()}) to:`, url);
        // Log FormData entries for debugging (won't show file content)
        // for (let pair of submissionData.entries()) {
        //     console.log(pair[0]+ ', ' + pair[1]);
        // }

        const response = await axios({
            method: method,
            url: url,
            data: submissionData,
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
            withCredentials: true,
        });

      setSuccess("Company information saved successfully!");
      // Update state with the saved data (including new ID if created)
      const savedData = response.data.data;
       setFormData({
          ...initialFormData,
          ...savedData,
          logo: null, // Clear file object after successful upload
          logoPreview: savedData.logoFilename ? `${API_BASE_URL}/uploads/logos/${savedData.logoFilename}` : null
        });
        // Update sameAsBilling again based on potentially updated addresses
        setSameAsBilling(
            savedData.billingAddressLine1 === savedData.deliveryAddressLine1 &&
            savedData.billingAddressLine2 === savedData.deliveryAddressLine2 &&
            savedData.billingAddressLine3 === savedData.deliveryAddressLine3
        );

      setTimeout(() => setSuccess(null), 5000); // Clear success message

    } catch (err) {
      console.error("Error saving company information:", err);
      setError(`Failed to save: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000); // Clear error message
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Company Information
      </Typography>

      {/* Loading Indicator */}
      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      {/* Feedback Alerts */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {!loading && ( // Only show form when not loading initial data
        <StyledPaper elevation={3} component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}> {/* Responsive grid */}
              <Typography variant="h6" gutterBottom>
                Upload Logo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                 {/* Logo Preview */}
                 <Avatar
                    src={formData.logoPreview || undefined} // Use preview URL
                    alt="Company Logo"
                    sx={{ width: 64, height: 64, bgcolor: 'grey.300' }} // Add background color
                 >
                    {!formData.logoPreview && <UploadIcon />} {/* Show icon if no preview */}
                 </Avatar>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                  {formData.logo ? formData.logo.name : "Choose Logo"}
                  <input type="file" hidden onChange={handleLogoChange} accept="image/*"/>
                </Button>
              </Box>

              <TextField
                margin="normal"
                required
                fullWidth
                id="legalName"
                label="Legal name"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="tradeName"
                label="Trade name"
                name="tradeName"
                value={formData.tradeName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                id="companyRegistrationNumber"
                label="Company Registration Number"
                name="companyRegistrationNumber"
                value={formData.companyRegistrationNumber}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="mobileNo"
                label="Mobile no."
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="E-mail"
                name="email"
                type="email" // Use email type
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                id="website"
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}> {/* Responsive grid */}
              <Typography variant="h6" gutterBottom>
                GST Type
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="gst-type-label">GST Type</InputLabel>
                <Select
                  labelId="gst-type-label"
                  id="gstType"
                  label="GST Type"
                  name="gstType"
                  value={formData.gstType}
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>None</em></MenuItem> {/* Add None option */}
                  {gstTypes.map((gstType) => (
                    <MenuItem key={gstType.value} value={gstType.value}>
                      {gstType.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Registered / Billing Address
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="billingAddressLine1"
                label="Address Line 1"
                name="billingAddressLine1"
                value={formData.billingAddressLine1}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                id="billingAddressLine2"
                label="Address Line 2"
                name="billingAddressLine2"
                value={formData.billingAddressLine2}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                id="billingAddressLine3"
                label="Address Line 3"
                name="billingAddressLine3"
                value={formData.billingAddressLine3}
                onChange={handleChange}
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Delivery Address
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={sameAsBilling}
                    onChange={handleSameAsBillingChange}
                    name="sameAsBilling"
                    color="primary"
                  />
                }
                label="Same as billing address"
              />
              {!sameAsBilling && (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="deliveryAddressLine1"
                    label="Address Line 1"
                    name="deliveryAddressLine1"
                    value={formData.deliveryAddressLine1}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="deliveryAddressLine2"
                    label="Address Line 2"
                    name="deliveryAddressLine2"
                    value={formData.deliveryAddressLine2}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="deliveryAddressLine3"
                    label="Address Line 3"
                    name="deliveryAddressLine3"
                    value={formData.deliveryAddressLine3}
                    onChange={handleChange}
                  />
                </>
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  id="state"
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                   <MenuItem value=""><em>None</em></MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.value} value={state.value}>
                      {state.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="country-label">Country</InputLabel>
                <Select
                  labelId="country-label"
                  id="country"
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                   <MenuItem value=""><em>None</em></MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.value} value={country.value}>
                      {country.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                required
                fullWidth
                id="pinCode"
                label="PIN/ZIP Code"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Toggle Buttons Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Compliance & Tax Information
            </Typography>
            <Grid container spacing={2}>
              {/* Row 1 */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.gstRegistered}
                      onChange={handleSwitchChange}
                      name="gstRegistered"
                    />
                  }
                  label="GST Registered"
                />
                {formData.gstRegistered && (
                  <TextField
                    margin="dense" // Use dense margin for conditional fields
                    required
                    fullWidth
                    id="gstNumber"
                    label="GST Number"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.pfEnabled}
                      onChange={handleSwitchChange}
                      name="pfEnabled"
                    />
                  }
                  label="PF Enabled"
                />
                {formData.pfEnabled && (
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="pfNumber"
                    label="PF Number"
                    name="pfNumber"
                    value={formData.pfNumber}
                    onChange={handleChange}
                  />
                )}
              </Grid>
              {/* Row 2 */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.esicEnabled}
                      onChange={handleSwitchChange}
                      name="esicEnabled"
                    />
                  }
                  label="ESIC Enabled"
                />
                {formData.esicEnabled && (
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="esicNumber"
                    label="ESIC Number"
                    name="esicNumber"
                    value={formData.esicNumber}
                    onChange={handleChange}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.iecRegistered}
                      onChange={handleSwitchChange}
                      name="iecRegistered"
                    />
                  }
                  label="IEC Registered"
                />
                {formData.iecRegistered && (
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="iecNumber"
                    label="IEC Number"
                    name="iecNumber"
                    value={formData.iecNumber}
                    onChange={handleChange}
                  />
                )}
              </Grid>
              {/* Row 3 */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tdsEnabled}
                      onChange={handleSwitchChange}
                      name="tdsEnabled"
                    />
                  }
                  label="TDS Enabled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tcsEnabled}
                      onChange={handleSwitchChange}
                      name="tcsEnabled"
                    />
                  }
                  label="TCS Enabled"
                />
              </Grid>
              {/* Row 4 */}
               <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.advanceTaxEnabled}
                      onChange={handleSwitchChange}
                      name="advanceTaxEnabled"
                    />
                  }
                  label="Advance Tax Enabled"
                />
              </Grid>
            </Grid>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading} // Disable button while submitting
          >
            {loading ? <CircularProgress size={24} /> : (formData._id ? "Update Information" : "Save Information")}
          </Button>
        </StyledPaper>
      )}
    </Box>
  );
}

export default CompanyInformation;
