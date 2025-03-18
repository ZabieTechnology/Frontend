import React, { useState } from "react";
import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
} from "@mui/material";

function VATManagement() {
  const [vatApplicable, setVatApplicable] = useState("No"); // State for VAT Applicable
  const [vatNumber, setVatNumber] = useState(""); // State for VAT Number

  // Handle VAT Applicable change
  const handleVatApplicableChange = (event) => {
    setVatApplicable(event.target.value);
  };

  // Handle VAT Number change
  const handleVatNumberChange = (event) => {
    setVatNumber(event.target.value);
  };

  // Handle save
  const handleSave = () => {
    console.log("VAT Applicable:", vatApplicable);
    console.log("VAT Number:", vatNumber);
    alert("VAT details saved successfully!");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        VAT Management
      </Typography>

      {/* VAT Applicable Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          VAT Applicable
        </Typography>
        <RadioGroup
          row
          value={vatApplicable}
          onChange={handleVatApplicableChange}
        >
          <FormControlLabel value="No" control={<Radio />} label="No" />
          <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
        </RadioGroup>
        {vatApplicable === "Yes" && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            VAT Number is required if the option is "Yes".
          </Typography>
        )}
      </Box>

      {/* VAT Number Input (Visible only if "Yes" is selected) */}
      {vatApplicable === "Yes" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="VAT Number"
            value={vatNumber}
            onChange={handleVatNumberChange}
            placeholder="Enter VAT Number"
          />
        </Box>
      )}

      {/* Save Button */}
      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
}

export default VATManagement;