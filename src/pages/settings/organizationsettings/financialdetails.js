import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker"; // Correct import
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"; // Correct import
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"; // Correct import

function FinancialDetails() {
  const [salesTurnover, setSalesTurnover] = useState("");
  const [exceeded5Cr, setExceeded5Cr] = useState("");
  const [booksBeginningDate, setBooksBeginningDate] = useState(new Date("2023-04-01"));
  const [financialYearStartMonth, setFinancialYearStartMonth] = useState("April");
  const [dataLockOption, setDataLockOption] = useState("No");
  const [lockDate, setLockDate] = useState(new Date("2024-01-31"));
  const [currency, setCurrency] = useState("INR");
  const [financialYearEndMonth, setFinancialYearEndMonth] = useState("March");

  const handleSave = () => {
    console.log({
      salesTurnover,
      exceeded5Cr,
      booksBeginningDate,
      financialYearStartMonth,
      dataLockOption,
      lockDate,
      currency,
      financialYearEndMonth,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Details
      </Typography>

      {/* Sales Turnover of Previous Year */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="sales-turnover-label">Sales Turnover of Previous Year (Excl. GST/VAT/etc)</InputLabel>
        <Select
          labelId="sales-turnover-label"
          id="salesTurnover"
          value={salesTurnover}
          label="Sales Turnover of Previous Year (Excl. GST/VAT/etc)"
          onChange={(e) => setSalesTurnover(e.target.value)}
        >
          <MenuItem value="<1 Cr">{"<1 Cr"}</MenuItem>
          <MenuItem value=">1 Cr - 2 Cr">{">1 Cr - 2 Cr"}</MenuItem>
          <MenuItem value=">2 Cr - 5 Cr">{">2 Cr - 5 Cr"}</MenuItem>
          <MenuItem value=">5 Cr">{">5 Cr"}</MenuItem>
        </Select>
      </FormControl>

      {/* Did Sales Turnover exceeded 5 Crore? */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="exceeded-5cr-label">Did Sales Turnover exceeded 5 Crore in any of the Financial Year </InputLabel>
        <Select
          labelId="exceeded-5cr-label"
          id="exceeded5Cr"
          value={exceeded5Cr}
          label="Did Sales Turnover exceeded 5 Crore in any of the Financial Year"
          onChange={(e) => setExceeded5Cr(e.target.value)}
        >
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </Select>
      </FormControl>

      {/* Books Beginning Date */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Books Beginning from"
          value={booksBeginningDate}
          onChange={(newValue) => setBooksBeginningDate(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
      </LocalizationProvider>

      {/* Financial Year Start Month */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="financial-year-start-label">Financial Year Start Month *</InputLabel>
        <Select
          labelId="financial-year-start-label"
          id="financialYearStartMonth"
          value={financialYearStartMonth}
          label="Financial Year Start Month *"
          onChange={(e) => setFinancialYearStartMonth(e.target.value)}
        >
          <MenuItem value="April">April</MenuItem>
          <MenuItem value="May">May</MenuItem>
          <MenuItem value="June">June</MenuItem>
          <MenuItem value="July">July</MenuItem>
          <MenuItem value="August">August</MenuItem>
          <MenuItem value="September">September</MenuItem>
          <MenuItem value="October">October</MenuItem>
          <MenuItem value="November">November</MenuItem>
          <MenuItem value="December">December</MenuItem>
          <MenuItem value="January">January</MenuItem>
          <MenuItem value="February">February</MenuItem>
          <MenuItem value="March">March</MenuItem>
        </Select>
      </FormControl>

      {/* Data Lock Option */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="data-lock-label">Data Lock Option</InputLabel>
        <Select
          labelId="data-lock-label"
          id="dataLockOption"
          value={dataLockOption}
          label="Data Lock Option"
          onChange={(e) => setDataLockOption(e.target.value)}
        >
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </Select>
      </FormControl>

      {/* Lock Date */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Stop all users making changes on and before"
          value={lockDate}
          onChange={(newValue) => setLockDate(newValue)}
          renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
        />
      </LocalizationProvider>

      {/* Currency */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="currency-label">Currency</InputLabel>
        <Select
          labelId="currency-label"
          id="currency"
          value={currency}
          label="Currency"
          onChange={(e) => setCurrency(e.target.value)}
        >
          <MenuItem value="INR">INR (Indian Rupee)</MenuItem>
          {/* Add more currencies if needed */}
        </Select>
      </FormControl>

      {/* Financial Year End Month */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="financial-year-end-label">Financial Year End Month *</InputLabel>
        <Select
          labelId="financial-year-end-label"
          id="financialYearEndMonth"
          value={financialYearEndMonth}
          label="Financial Year End Month *"
          onChange={(e) => setFinancialYearEndMonth(e.target.value)}
        >
          <MenuItem value="March">March</MenuItem>
          <MenuItem value="April">April</MenuItem>
          <MenuItem value="May">May</MenuItem>
          <MenuItem value="June">June</MenuItem>
          <MenuItem value="July">July</MenuItem>
          <MenuItem value="August">August</MenuItem>
          <MenuItem value="September">September</MenuItem>
          <MenuItem value="October">October</MenuItem>
          <MenuItem value="November">November</MenuItem>
          <MenuItem value="December">December</MenuItem>
          <MenuItem value="January">January</MenuItem>
          <MenuItem value="February">February</MenuItem>
        </Select>
      </FormControl>

      {/* Save Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Save
      </Button>
    </Box>
  );
}

export default FinancialDetails;