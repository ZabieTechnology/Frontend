import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import axios from "axios"; // For making API calls

// Styled Paper component for the curved grey box
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#f5f5f5",
  padding: "24px",
  width: "50%",
}));

function CompanyInformation() {
  const [gstRegistered, setGstRegistered] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [pfEnabled, setPfEnabled] = useState(false);
  const [esicEnabled, setEsicEnabled] = useState(false);
  const [iecRegistered, setIecRegistered] = useState(false);
  const [tdsEnabled, setTdsEnabled] = useState(false);
  const [tcsEnabled, setTcsEnabled] = useState(false);
  const [advanceTaxEnabled, setAdvanceTaxEnabled] = useState(false);

  // State for dropdown values
  const [gstTypes, setGstTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch dropdown values from MongoDB on component mount
  useEffect(() => {
    const fetchDropdownValues = async () => {
      try {
        const gstTypesResponse = await axios.get("/api/gstTypes"); // Replace with your API endpoint
        const statesResponse = await axios.get("/api/states"); // Replace with your API endpoint
        const countriesResponse = await axios.get("/api/countries"); // Replace with your API endpoint

        setGstTypes(gstTypesResponse.data);
        setStates(statesResponse.data);
        setCountries(countriesResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      }
    };

    fetchDropdownValues();
  }, []);

  const handleGstRegisteredChange = (event) => {
    setGstRegistered(event.target.checked);
  };

  const handleSameAsBillingChange = (event) => {
    setSameAsBilling(event.target.checked);
  };

  const handlePfChange = (event) => {
    setPfEnabled(event.target.checked);
  };

  const handleEsicChange = (event) => {
    setEsicEnabled(event.target.checked);
  };

  const handleIecChange = (event) => {
    setIecRegistered(event.target.checked);
  };

  const handleTdsChange = (event) => {
    setTdsEnabled(event.target.checked);
  };

  const handleTcsChange = (event) => {
    setTcsEnabled(event.target.checked);
  };

  const handleAdvanceTaxChange = (event) => {
    setAdvanceTaxEnabled(event.target.checked);
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Company Information
      </Typography>
      <StyledPaper elevation={3}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Upload Logo
            </Typography>
            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
              Upload Logo
              <input type="file" hidden />
            </Button>

            <TextField
              margin="normal"
              required
              fullWidth
              id="legalName"
              label="Legal name"
              name="legalName"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="tradeName"
              label="Trade name"
              name="tradeName"
            />
            <TextField
              margin="normal"
              fullWidth
              id="companyRegistrationNumber"
              label="Company Registration Number"
              name="companyRegistrationNumber"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="mobileNo"
              label="Mobile no."
              name="mobileNo"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
            />
            <TextField
              margin="normal"
              fullWidth
              id="website"
              label="Website"
              name="website"
            />
          </Grid>

          {/* Right Column */}
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              GST Type
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="gst-type-label">GST Type</InputLabel>
              <Select labelId="gst-type-label" id="gstType" label="GST Type">
                {gstTypes.map((gstType) => (
                  <MenuItem key={gstType.value} value={gstType.value}>
                    {gstType.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Registered / Billing Address
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="billingAddressLine1"
              label="Address Line 1"
              name="billingAddressLine1"
            />
            <TextField
              margin="normal"
              fullWidth
              id="billingAddressLine2"
              label="Address Line 2"
              name="billingAddressLine2"
            />
            <TextField
              margin="normal"
              fullWidth
              id="billingAddressLine3"
              label="Address Line 3"
              name="billingAddressLine3"
            />

            <Typography variant="h6" gutterBottom>
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
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="deliveryAddressLine2"
                  label="Address Line 2"
                  name="deliveryAddressLine2"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  id="deliveryAddressLine3"
                  label="Address Line 3"
                  name="deliveryAddressLine3"
                />
              </>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel id="state-label">State</InputLabel>
              <Select labelId="state-label" id="state" label="State">
                {states.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="country-label">Country</InputLabel>
              <Select labelId="country-label" id="country" label="Country">
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
            />
          </Grid>
        </Grid>

        {/* Toggle Buttons Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Toggle Options
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={gstRegistered}
                    onChange={handleGstRegisteredChange}
                    name="gstRegistered"
                    color="primary"
                  />
                }
                label="GST Registered"
              />
              {gstRegistered && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="gstNumber"
                  label="GST Number"
                  name="gstNumber"
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={pfEnabled}
                    onChange={handlePfChange}
                    name="pfEnabled"
                    color="primary"
                  />
                }
                label="PF Enabled"
              />
              {pfEnabled && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="pfNumber"
                  label="PF Number"
                  name="pfNumber"
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={esicEnabled}
                    onChange={handleEsicChange}
                    name="esicEnabled"
                    color="primary"
                  />
                }
                label="ESIC Enabled"
              />
              {esicEnabled && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="esicNumber"
                  label="ESIC Number"
                  name="esicNumber"
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={iecRegistered}
                    onChange={handleIecChange}
                    name="iecRegistered"
                    color="primary"
                  />
                }
                label="IEC Registered"
              />
              {iecRegistered && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="iecNumber"
                  label="IEC Number"
                  name="iecNumber"
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tdsEnabled}
                    onChange={handleTdsChange}
                    name="tdsEnabled"
                    color="primary"
                  />
                }
                label="TDS Enabled"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tcsEnabled}
                    onChange={handleTcsChange}
                    name="tcsEnabled"
                    color="primary"
                  />
                }
                label="TCS Enabled"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advanceTaxEnabled}
                    onChange={handleAdvanceTaxChange}
                    name="advanceTaxEnabled"
                    color="primary"
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
        >
          Save
        </Button>
      </StyledPaper>
    </Box>
  );
}

export default CompanyInformation;