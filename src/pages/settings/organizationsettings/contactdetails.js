import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Paper, // Use Paper for better grouping
  Grid, // <<< Import Grid component here
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios"; // Import axios

const initialContactState = {
  designation: "",
  name: "",
  panNumber: "",
  dinNumber: "",
  aadhaar: "",
  mobile: "",
  email: "",
};

function ContactDetails() {
  const [contacts, setContacts] = useState([initialContactState]); // Start with one empty contact
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || ''; // Get from .env

  // --- Fetch existing contacts ---
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/contacts`, { withCredentials: true });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setContacts(response.data); // Set fetched contacts
      } else {
        // No contacts found or empty array returned, keep the initial empty contact state
        setContacts([initialContactState]);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(`Failed to load contacts: ${err.response?.data?.message || err.message}`);
      setContacts([initialContactState]); // Reset to initial state on error
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]); // Dependency

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]); // Run on mount

  // --- Handlers ---
  const handleAddContact = () => {
    setContacts([...contacts, { ...initialContactState }]); // Add a new empty contact object
  };

  const handleRemoveContact = (index) => {
    // Prevent removing the last contact form
    if (contacts.length <= 1) {
        setError("At least one primary contact is required.");
        setTimeout(() => setError(null), 3000);
        return;
    }
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  const handleChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;

    // Remove auto-fill logic or make it more robust if needed
    // if (field === "panNumber" && value.length >= 4) {
    //   const fourthDigit = value[3];
    //   if (fourthDigit === "P") {
    //     // Fetch actual data instead of hardcoding
    //     // newContacts[index].name = "Legal Name";
    //     // newContacts[index].mobile = "1234567890";
    //     // newContacts[index].email = "example@example.com";
    //   }
    // }

    setContacts(newContacts);
  };

  // --- Save Contacts ---
  const handleSaveContacts = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation (e.g., check required fields for all contacts)
    const isValid = contacts.every(contact =>
        contact.designation && contact.name && contact.panNumber && contact.mobile && contact.email
    );

    if (!isValid) {
        setError("Please fill in all required (*) fields for every contact.");
        setLoading(false);
        setTimeout(() => setError(null), 5000);
        return;
    }


    try {
      const response = await axios.put(`${API_BASE_URL}/api/contacts`, contacts, { // Send the whole array
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      setSuccess("Contact details saved successfully!");
      // Optionally update state with response data if backend modifies it
      if (response.data && Array.isArray(response.data.data)) {
          // Ensure _id is preserved if backend sends it back
          const updatedContacts = response.data.data.map((newContact, index) => ({
              ...newContact,
              _id: contacts[index]?._id || newContact._id // Try to keep existing _id if possible
          }));
          setContacts(updatedContacts);
      } else {
          // If backend doesn't return data, refetch to be sure
          fetchContacts();
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving contacts:", err);
      setError(`Failed to save contacts: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Primary Contact Details
      </Typography>

      {/* Loading Indicator */}
      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      {/* Feedback Alerts */}
      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}


      {!loading && contacts.map((contact, index) => (
        // Use Paper for each contact block
        <Paper key={contact._id || index} elevation={2} sx={{ mb: 3, p: 2, pt: 4, position: 'relative' }}> {/* Add key, adjust padding */}
          {/* Remove button positioned absolutely */}
           {contacts.length > 1 && (
            <IconButton
              color="error"
              onClick={() => handleRemoveContact(index)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
              size="small"
              aria-label={`Remove Contact ${index + 1}`}
            >
              <DeleteIcon />
            </IconButton>
          )}

          <Typography variant="h6" gutterBottom sx={{ mb: 2, textAlign: 'center' }}> {/* Center title */}
            Contact {index + 1}
          </Typography>

          {/* Use Grid for better layout */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Designation"
                value={contact.designation}
                onChange={(e) => handleChange(index, "designation", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Name"
                value={contact.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="PAN Number"
                value={contact.panNumber}
                onChange={(e) => handleChange(index, "panNumber", e.target.value)}
                variant="outlined"
                size="small"
                inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }} // Example validation + uppercase
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DIN Number"
                value={contact.dinNumber}
                onChange={(e) => handleChange(index, "dinNumber", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aadhaar"
                value={contact.aadhaar}
                onChange={(e) => handleChange(index, "aadhaar", e.target.value)}
                variant="outlined"
                size="small"
                inputProps={{ maxLength: 12 }} // Aadhaar is 12 digits
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Mobile"
                value={contact.mobile}
                onChange={(e) => handleChange(index, "mobile", e.target.value)}
                variant="outlined"
                size="small"
                type="tel" // Use tel type
              />
            </Grid>
            <Grid item xs={12}> {/* Email full width */}
              <TextField
                fullWidth
                required
                label="E-mail id"
                value={contact.email}
                onChange={(e) => handleChange(index, "email", e.target.value)}
                variant="outlined"
                size="small"
                type="email" // Use email type
              />
            </Grid>
          </Grid>

        </Paper>
      ))}

      {!loading && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
             <Button
                variant="outlined" // Use outlined for add button
                startIcon={<AddIcon />}
                onClick={handleAddContact}
                disabled={loading}
            >
                Add Contact
            </Button>

            <Button
                variant="contained"
                color="primary"
                onClick={handleSaveContacts} // Call the save handler
                disabled={loading || contacts.length === 0} // Disable if no contacts or loading
            >
                {loading ? <CircularProgress size={24} /> : "Save Contacts"}
            </Button>
          </Box>
      )}

    </Box>
  );
}

export default ContactDetails;
