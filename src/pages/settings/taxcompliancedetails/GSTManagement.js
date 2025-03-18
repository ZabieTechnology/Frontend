import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

function GSTManagement() {
  const [gstTdsApplicable, setGstTdsApplicable] = useState("No");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);

  // Sample data for the table
  const taxData = [
    { id: 1, taxName: "25%", head: "Outward", sgst: "12.5%", cgst: "12.5%", igst: "25%" },
    { id: 2, taxName: "18%", head: "Inward", sgst: "9%", cgst: "9%", igst: "18%" },
    { id: 3, taxName: "18%", head: "Outward", sgst: "9%", cgst: "9%", igst: "18%" },
    { id: 4, taxName: "18%", head: "TCS", sgst: "9%", cgst: "9%", igst: "18%" },
    { id: 5, taxName: "18%", head: "TDS", sgst: "9%", cgst: "9%", igst: "18%" },
    { id: 6, taxName: "18%", head: "RCM", sgst: "9%", cgst: "9%", igst: "18%" },
  ];

  // Handle GST TDS Applicable change
  const handleGstTdsChange = (event) => {
    setGstTdsApplicable(event.target.value);
  };

  // Handle row click to show tax details
  const handleRowClick = (tax) => {
    setSelectedTax(tax);
  };

  // Handle close tax details popup
  const handleClosePopup = () => {
    setSelectedTax(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        GST Number
      </Typography>

      {/* GST TDS Applicable Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          GST TDS applicable
        </Typography>
        <RadioGroup
          row
          value={gstTdsApplicable}
          onChange={handleGstTdsChange}
        >
          <FormControlLabel value="No" control={<Radio />} label="No" />
          <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
        </RadioGroup>
        {gstTdsApplicable === "Yes" && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            All the ledgers will be available if the option is yes.
          </Typography>
        )}
      </Box>

      {/* GST Number Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S1 No</TableCell>
              <TableCell>Tax Name</TableCell>
              <TableCell>Head</TableCell>
              <TableCell>SGST</TableCell>
              <TableCell>CGST</TableCell>
              <TableCell>IGST</TableCell>
              <TableCell>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taxData.map((row) => (
              <TableRow key={row.id} onClick={() => handleRowClick(row)}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.taxName}</TableCell>
                <TableCell>{row.head}</TableCell>
                <TableCell>{row.sgst}</TableCell>
                <TableCell>{row.cgst}</TableCell>
                <TableCell>{row.igst}</TableCell>
                <TableCell>
                  <Button>Edit</Button>
                  <Button>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New GST % Button */}
      <Button
        variant="contained"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Add New GST %
      </Button>

      {/* Tax Details Popup */}
      {selectedTax && (
        <Dialog open={!!selectedTax} onClose={handleClosePopup}>
          <DialogTitle>Tax Details</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              <strong>Output CGST:</strong> {selectedTax.cgst}
            </Typography>
            <Typography variant="body1">
              <strong>Output SGST:</strong> {selectedTax.sgst}
            </Typography>
            <Typography variant="body1">
              <strong>Output IGST:</strong> {selectedTax.igst}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePopup}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add New GST % Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New GST %</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Tax Name"
            placeholder="e.g., 18%"
          />
          <TextField
            margin="normal"
            fullWidth
            label="Head"
            placeholder="e.g., Outward"
          />
          <TextField
            margin="normal"
            fullWidth
            label="SGST"
            placeholder="e.g., 9%"
          />
          <TextField
            margin="normal"
            fullWidth
            label="CGST"
            placeholder="e.g., 9%"
          />
          <TextField
            margin="normal"
            fullWidth
            label="IGST"
            placeholder="e.g., 18%"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => setOpenDialog(false)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GSTManagement;