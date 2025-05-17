import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const BulkUpload = () => {
  // --- Data (Replace with your actual data source) ---
  const topTableData = [
    { label: 'Handled by', value: 'Yaseem' },
    { label: 'Petty Cash Balance', value: '50,000' },
    { label: 'Date', value: '10-11-2024' },
    { label: 'Expense Total', value: '1,463.20' },
    { label: 'Balance', value: '48,536.80' },
  ];

  const bottomTableData = [
    {
      viewBill: 'AXC',
      supplier: 'AXC',
      date: '12-Nov',
      description: 'Travel',
      net: '150.00',
      tax: '27.00',
      total: '177.00',
    },
    {
      viewBill: 'ABC',
      supplier: 'ABC',
      date: '24-Nov',
      description: 'Food',
      net: '650.00',
      tax: '117',
      total: '767.00',
    },
    {
      viewBill: 'JDK',
      supplier: 'JDK',
      date: '30-Nov',
      description: 'Gift',
      net: '340',
      tax: '61.2',
      total: '401.2',
    },
    {
      viewBill: 'ADC',
      supplier: 'ADC',
      date: '01-Dec',
      description: 'Parking',
      net: '100',
      tax: '18',
      total: '118',
    },
  ];

  const bottomTableTotal = {
    net: '1,240.00',
    tax: '223.20',
    total: '1,463.20',
  };

  // --- Reorganized Styles ---
  const styles = {
    container: {
      padding: 3,
    },
    tableContainer: {
      marginTop: 2,
      marginBottom: 2,
    },
    cell: {
      border: '1px solid #e0e0e0',
      padding: '8px',
      textAlign: 'center',
    },
    headerCell: {
      fontWeight: 'bold',
      backgroundColor: '#f5f5f5',
    },
    removeButton: {
      color: 'red',
      '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.08)' },
    },
    totalRow: {
      fontWeight: 'bold',
    },
  };

  // --- Reorganized Components ---
  const TopTable = () => (
    <TableContainer component={Paper} sx={styles.tableContainer}>
      <Table>
        <TableBody>
          {topTableData.map((item, index) => (
            <TableRow key={index}>
              <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
                {item.label}
              </TableCell>
              <TableCell sx={styles.cell}>{item.value}</TableCell>
              <TableCell sx={styles.cell}></TableCell>
              <TableCell sx={styles.cell}></TableCell>
              <TableCell sx={styles.cell}></TableCell>
              <TableCell sx={styles.cell}></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const BottomTable = () => (
    <TableContainer component={Paper} sx={styles.tableContainer}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              View Bill
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Supplier
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Date
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Description
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Net
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Tax
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Total
            </TableCell>
            <TableCell sx={{ ...styles.cell, ...styles.headerCell }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bottomTableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell sx={styles.cell}>{row.viewBill}</TableCell>
              <TableCell sx={styles.cell}>{row.supplier}</TableCell>
              <TableCell sx={styles.cell}>{row.date}</TableCell>
              <TableCell sx={styles.cell}>{row.description}</TableCell>
              <TableCell sx={styles.cell}>{row.net}</TableCell>
              <TableCell sx={styles.cell}>{row.tax}</TableCell>
              <TableCell sx={styles.cell}>{row.total}</TableCell>
              <TableCell sx={styles.cell}>
                <IconButton
                  aria-label="remove"
                  size="small"
                  sx={styles.removeButton}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={styles.totalRow}>
            <TableCell sx={styles.cell}></TableCell>
            <TableCell sx={styles.cell}></TableCell>
            <TableCell sx={styles.cell}></TableCell>
            <TableCell sx={styles.cell}>Expense total</TableCell>
            <TableCell sx={styles.cell}>{bottomTableTotal.net}</TableCell>
            <TableCell sx={styles.cell}>{bottomTableTotal.tax}</TableCell>
            <TableCell sx={styles.cell}>{bottomTableTotal.total}</TableCell>
            <TableCell sx={styles.cell}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={styles.container}>
      <Typography variant="h6" gutterBottom>
        Bulk Upload
      </Typography>
      <TopTable />
      <BottomTable />
    </Box>
  );
};

export default BulkUpload;