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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

function ContactDetails() {
  const [contacts, setContacts] = useState([
    {
      designation: "",
      name: "",
      panNumber: "",
      dinNumber: "",
      aadhaar: "",
      mobile: "",
      email: "",
    },
  ]);

  const handleAddContact = () => {
    setContacts([
      ...contacts,
      {
        designation: "",
        name: "",
        panNumber: "",
        dinNumber: "",
        aadhaar: "",
        mobile: "",
        email: "",
      },
    ]);
  };

  const handleRemoveContact = (index) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  const handleChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;

    // Auto-fill logic based on PAN number's 4th digit
    if (field === "panNumber" && value.length >= 4) {
      const fourthDigit = value[3];
      if (fourthDigit === "P") {
        newContacts[index].name = "Legal Name"; // Replace with actual legal name from organization settings
        newContacts[index].mobile = "1234567890"; // Replace with actual mobile from organization settings
        newContacts[index].email = "example@example.com"; // Replace with actual email from organization settings
      }
    }

    setContacts(newContacts);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Primary Contact
      </Typography>

      {contacts.map((contact, index) => (
        <Box key={index} sx={{ mb: 4, border: "1px solid #ccc", p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Contact {index + 1}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Designation *"
              value={contact.designation}
              onChange={(e) => handleChange(index, "designation", e.target.value)}
            />
            <TextField
              fullWidth
              label="Name *"
              value={contact.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="PAN Number *"
              value={contact.panNumber}
              onChange={(e) => handleChange(index, "panNumber", e.target.value)}
            />
            <TextField
              fullWidth
              label="DIN Number"
              value={contact.dinNumber}
              onChange={(e) => handleChange(index, "dinNumber", e.target.value)}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Aadhaar"
              value={contact.aadhaar}
              onChange={(e) => handleChange(index, "aadhaar", e.target.value)}
            />
            <TextField
              fullWidth
              label="Mobile *"
              value={contact.mobile}
              onChange={(e) => handleChange(index, "mobile", e.target.value)}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="E-mail id *"
              value={contact.email}
              onChange={(e) => handleChange(index, "email", e.target.value)}
            />
          </Box>

          {contacts.length > 1 && (
            <IconButton
              color="error"
              onClick={() => handleRemoveContact(index)}
              sx={{ mt: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      ))}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddContact}
        sx={{ mt: 2 }}
      >
        Add New Primary Contact
      </Button>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, ml: 2 }}
        onClick={() => console.log("Contacts:", contacts)}
      >
        Save
      </Button>
    </Box>
  );
}

export default ContactDetails;