import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function MileageClaims() {
  const [driver, setDriver] = useState('Imtiaz Shah'); // Default value
  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState(null); // Date type
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tripType, setTripType] = useState('one-way'); // Default value
  const [distance, setDistance] = useState(0.00);
  const [description, setDescription] = useState('');

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>
          CREATE MILEAGE CLAIM
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {/* Placeholder for the Map (replace with actual map component) */}
            <Box
              sx={{
                height: 300,
                bgcolor: '#f0f0f0', // Light gray background
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Placeholder for Map
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2, // Spacing between form elements
                mt: 2, // Top margin
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Driver</InputLabel>
                <Select
                  value={driver}
                  label="Driver"
                  onChange={(e) => setDriver(e.target.value)}
                >
                  <MenuItem value="Imtiaz Shah">Imtiaz Shah</MenuItem>
                  {/* Add other drivers as needed */}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Vehicle *</InputLabel>
                <Select
                  value={vehicle}
                  label="Vehicle *"
                  onChange={(e) => setVehicle(e.target.value)}
                >
                  <MenuItem value="">Add a vehicle</MenuItem>
                  {/* Add vehicle options */}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <DatePicker
                  label="Date *"
                  value={date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} size="small" />} // Use TextField for styling
                  format="dd-MMM-yyyy" // As in the PDF
                />
              </FormControl>

              <TextField
                label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                fullWidth
                size="small"
              />

              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                >
                  <FormControlLabel
                    value="one-way"
                    control={<Radio size="small" />}
                    label="One-way"
                  />
                  <FormControlLabel
                    value="round-trip"
                    control={<Radio size="small" />}
                    label="Round trip"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                label="Distance *"
                type="number"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <Typography>mi</Typography>, // "mi" label
                }}
              />

              <TextField
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                size="small"
              />

              <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                Create claim
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

export default MileageClaims;