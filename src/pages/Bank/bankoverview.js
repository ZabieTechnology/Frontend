import React from 'react';

// --- MUI Component Imports (Path-based for performance) ---
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Mock Data ---
// This data would typically come from an API call.

const summaryData = {
  totalBalance: 54520.35,
  monthlyIncome: 8200.00,
  monthlySpending: -3150.78,
};

const recentTransactions = [
  { id: 1, date: '2024-07-28', description: 'Grocery Store', amount: -75.40, category: 'Food' },
  { id: 2, date: '2024-07-27', description: 'Monthly Salary', amount: 4100.00, category: 'Income' },
  { id: 3, date: '2024-07-26', description: 'Gas Station', amount: -55.21, category: 'Transport' },
  { id: 4, date: '2024-07-25', description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment' },
  { id: 5, date: '2024-07-24', description: 'Restaurant Dinner', amount: -120.00, category: 'Food' },
];

const spendingData = [
    { name: 'Utilities', value: 400 },
    { name: 'Food', value: 650 },
    { name: 'Transport', value: 300 },
    { name: 'Entertainment', value: 250 },
    { name: 'Shopping', value: 550 },
    { name: 'Other', value: 200 },
];

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

// --- Reusable Components ---

/**
 * A card for displaying a key financial metric.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the metric.
 * @param {number} props.value - The value of the metric.
 * @param {string} [props.color] - The color of the value text.
 */
const SummaryCard = ({ title, value, color = 'text.primary' }) => (
  <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 2 }}>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Typography>
    </CardContent>
  </Card>
);

// --- Main App Component ---

export default function BankOverview() {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.100', p: 4, minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Bank Overview
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              boxShadow: 3,
              borderRadius: 2,
              py: 1,
              px: 3
            }}
          >
            New Transaction
          </Button>
        </Box>

        {/* Summary Cards Section */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <SummaryCard title="Total Balance" value={summaryData.totalBalance} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SummaryCard title="This Month's Income" value={summaryData.monthlyIncome} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SummaryCard title="This Month's Spending" value={summaryData.monthlySpending} color="error.main" />
          </Grid>
        </Grid>

        {/* Main Content Section (Transactions and Chart) */}
        <Grid container spacing={4}>
          {/* Recent Transactions Table */}
          <Grid item xs={12} lg={7}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>Recent Transactions</Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table aria-label="recent transactions table">
                <TableHead sx={{ bgcolor: 'grey.200' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentTransactions.map((row) => (
                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {row.date}
                      </TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell align="right" sx={{ color: row.amount > 0 ? 'success.main' : 'error.main', fontWeight: 'medium' }}>
                        {row.amount > 0 ? '+' : ''}${Math.abs(row.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Spending Chart */}
          <Grid item xs={12} lg={5}>
             <Typography variant="h5" sx={{ mb: 2, fontWeight: 'medium' }}>Spending by Category</Typography>
             <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={spendingData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {spendingData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
             </Paper>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}