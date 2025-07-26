// src/pages/AccountTransaction/GSTDutyLedgersPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Link,
  Breadcrumbs,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// --- Main Component ---
const GSTDutyLedgersPage = () => {
  // --- State Management ---
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Hooks ---
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAndFilterAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all accounts. Using limit=-1 to ensure we get all records for filtering.
        const response = await axios.get(`${API_BASE_URL}/api/chart-of-accounts`, {
          params: { limit: -1 },
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data.data)) {
          // Filter the accounts based on the specific criteria
          const filteredData = response.data.data.filter(account =>
            account.nature === 'Liability' &&
            account.mainHead === 'Current Liability' &&
            account.category === 'Other Current Liability (Duties & Taxes)' && // Corrected capitalization
            account.gstEnabled === true // Assuming 'gstEnabled' is the field name for GST status
          );
          setLedgers(filteredData);
        } else {
          setError('Failed to fetch accounts: Invalid data format received.');
        }
      } catch (err) {
        setError(`Error fetching accounts: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterAccounts();
  }, [API_BASE_URL]);

  // --- Render Logic ---
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
       <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          GST Duty Ledgers
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/account-transaction/chart-of-accounts">
            Chart of Accounts
          </Link>
          <Typography color="text.primary">GST Ledgers (Duties & Taxes)</Typography>
        </Breadcrumbs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-labelledby="gstLedgersTable">
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Account Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Account Code</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Opening Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 1 }}>Loading Ledgers...</Typography>
                  </TableCell>
                </TableRow>
              ) : ledgers.length > 0 ? (
                ledgers.map((ledger) => (
                  <TableRow
                    key={ledger._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate(`/account-transaction/chart-of-accounts/view/${ledger._id}`)}
                      >
                        {ledger.name}
                      </Link>
                    </TableCell>
                    <TableCell>{ledger.code}</TableCell>
                    <TableCell>{ledger.description || '—'}</TableCell>
                    <TableCell align="right">
                      {ledger.openingBalance != null ? ledger.openingBalance.toLocaleString() : '—'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No GST-enabled ledgers found under "Other current liability (Duties & Taxes)".
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ensure accounts are correctly categorized and have GST enabled.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default GSTDutyLedgersPage;
