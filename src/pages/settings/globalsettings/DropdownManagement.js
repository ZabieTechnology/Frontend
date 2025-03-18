import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete, CloudUpload } from "@mui/icons-material";

function DropdownManagement() {
  const [dropdownValues, setDropdownValues] = useState([]);
  const [filteredValues, setFilteredValues] = useState([]); // For filtered data
  const [openDialog, setOpenDialog] = useState(false);
  const [currentValue, setCurrentValue] = useState({
    id: "",
    type: "",
    value: "",
    label: "",
  });
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState(""); // For filter input

  // Fetch dropdown values from the backend
  const fetchDropdownValues = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL; // Use environment variable
      const response = await axios.get(`${apiUrl}/api/dropdown`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      console.log("API Response:", response.data); // Debug the response

      // Ensure the response data is in the correct format
      if (response.data && Array.isArray(response.data.data)) {
        setDropdownValues(response.data.data);
        setFilteredValues(response.data.data); // Initialize filtered data
        setTotalItems(response.data.total || 0);
      } else {
        console.error("Invalid API response format:", response.data);
        setDropdownValues([]);
        setFilteredValues([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching dropdown values:", error);
      setDropdownValues([]); // Set to empty array on error
      setFilteredValues([]);
      setTotalItems(0); // Reset total items on error
    }
  };

  useEffect(() => {
    fetchDropdownValues();
  }, [currentPage, itemsPerPage]);

  // Handle filter input change
  useEffect(() => {
    if (filter) {
      const filtered = dropdownValues.filter(
        (item) =>
          item.type.toLowerCase().includes(filter.toLowerCase()) ||
          item.value.toLowerCase().includes(filter.toLowerCase()) ||
          item.label.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredValues(filtered);
    } else {
      setFilteredValues(dropdownValues); // Reset to all data if no filter
    }
  }, [filter, dropdownValues]);

  // Handle adding/editing a dropdown value
  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const updatedUser = "Admin"; // Replace with the logged-in user's username or ID

      if (currentValue.id) {
        // Update existing value
        await axios.put(`${apiUrl}/api/dropdown/${currentValue.id}`, {
          label: currentValue.label,
          updated_user: updatedUser, // Automatically set the updated user
        });
      } else {
        // Add new value
        await axios.post(`${apiUrl}/api/dropdown`, {
          type: currentValue.type,
          value: currentValue.value,
          label: currentValue.label,
          updated_user: updatedUser, // Automatically set the updated user
        });
      }
      setOpenDialog(false);
      fetchDropdownValues(); // Refresh the list
    } catch (error) {
      console.error("Error saving dropdown value:", error);
    }
  };

  // Handle deleting a dropdown value
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/dropdown/${id}`);
      fetchDropdownValues(); // Refresh the list
    } catch (error) {
      console.error("Error deleting dropdown value:", error);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/dropdown/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Dropdown values uploaded successfully.");
      fetchDropdownValues(); // Refresh the list
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Dropdown Values
      </Typography>

      {/* Upload Excel File Section */}
      <Box sx={{ mb: 3 }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
          id="upload-file"
        />
        <label htmlFor="upload-file">
          <Button variant="contained" component="span" startIcon={<CloudUpload />}>
            Upload Excel
          </Button>
        </label>
        <Button variant="contained" onClick={handleFileUpload} sx={{ ml: 2 }}>
          Submit
        </Button>
      </Box>

      {/* Add New Value Button */}
      <Button
        variant="contained"
        onClick={() => {
          setCurrentValue({ id: "", type: "", value: "", label: "" });
          setOpenDialog(true);
        }}
        sx={{ mb: 3 }}
      >
        Add New Value
      </Button>

      {/* Filter Input */}
      <TextField
        fullWidth
        label="Filter by Type, Value, or Label"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Pagination Controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}>
            Next
          </Button>
        </Box>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Items per page</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Items per page"
          >
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={200}>200</MenuItem>
            <MenuItem value={-1}>All</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table to Display Dropdown Values */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredValues && filteredValues.length > 0 ? (
              filteredValues.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setCurrentValue({
                          id: item._id,
                          type: item.type,
                          value: item.value,
                          label: item.label,
                        });
                        setOpenDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(item._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Adding/Editing Values */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{currentValue.id ? "Edit Dropdown Value" : "Add Dropdown Value"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Type"
            value={currentValue.type}
            onChange={(e) => setCurrentValue({ ...currentValue, type: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Value"
            value={currentValue.value}
            onChange={(e) => setCurrentValue({ ...currentValue, value: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Label"
            value={currentValue.label}
            onChange={(e) => setCurrentValue({ ...currentValue, label: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DropdownManagement;