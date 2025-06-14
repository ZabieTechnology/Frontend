// PayrollManagementSystem.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    AppBar, Toolbar, Typography, Tabs, Tab, Box, Button, Card, CardContent, TextField, MenuItem, IconButton, Table, TableHead, TableBody, TableRow, TableCell, Chip, Select, InputLabel, FormControl, Grid, Divider, Stack, Paper, InputAdornment, CircularProgress // Added CircularProgress for potential loading states
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Calculate as CalculateIcon,
    Assignment as AssignmentIcon, // Used for Investments
    Receipt as ReceiptIcon,      // Used for Payslips
    BarChart as BarChartIcon,    // Used for Reports
    CalendarToday as CalendarTodayIcon, // Used for Financial Year
    Edit as EditIcon,
    Delete as DeleteIcon,
    Group as GroupIcon,
    AttachMoney as AttachMoneyIcon,
    RemoveCircleOutline as TotalDeductionIcon,
    AccountBalanceWallet as WalletIcon,
    Send as SendIcon,           // Added for Payslips
    Download as DownloadIcon,   // Added for Reports
    FileUploadOutlined as FileUploadOutlinedIcon // Added for Investment Upload
} from '@mui/icons-material';

// --- Constants ---
const TABS = [
    'Dashboard', 'Employees', 'Salary Calculator', 'Investment Declarations', 'Payslips', 'Reports', 'Financial Year',
];
const ICONS = [
    <DashboardIcon />, <PeopleIcon />, <CalculateIcon />, <AssignmentIcon />,
    <ReceiptIcon />, <BarChartIcon />, <CalendarTodayIcon />
];
const TAX_REGIMES = ['New Regime', 'Old Regime'];
const PAYMENT_STATUS_MONTHS = ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];


// --- Helper function for currency formatting ---
const formatCurrency = (amount, showSymbol = true) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return showSymbol ? '₹-' : '-';
    }
    return numAmount.toLocaleString('en-IN', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};


// --- Sample Data (Existing Data - Unchanged) ---
const defaultInvestmentSections = [
    { name: 'Employee Provident Fund (EPF)', description: 'Mandatory contribution to EPF account', maxLimit: 150000, declaredAmount: 0 },
    { name: 'Public Provident Fund (PPF)', description: 'Long-term savings scheme with tax benefits', maxLimit: 150000, declaredAmount: 0 },
    { name: 'Equity Linked Savings Scheme (ELSS)', description: 'Tax-saving mutual funds with 3-year lock-in', maxLimit: 150000, declaredAmount: 0 },
    { name: 'Life Insurance Premium', description: 'Premium paid for life insurance policies', maxLimit: 150000, declaredAmount: 0 },
    { name: 'National Pension System (NPS)', description: 'Voluntary contribution to NPS account', maxLimit: 150000, declaredAmount: 0 },
];
const payslipsData = [
    { id: 1, months: ['APR 2025', 'MAY 2025', 'JUN 2025', 'JUL 2025', 'AUG 2025', 'SEP 2025'] },
    { id: 2, months: ['APR 2025', 'MAY 2025', 'JUN 2025', 'JUL 2025', 'AUG 2025', 'SEP 2025'] },
    { id: 3, months: ['APR 2025', 'MAY 2025', 'JUN 2025', 'JUL 2025', 'AUG 2025', 'SEP 2025'] },
];
const paymentStatusData = [
    { id: 1, status: Array(12).fill('Pending') },
    { id: 2, status: Array(12).fill('Pending') },
    { id: 3, status: Array(12).fill('Pending') },
];
const reportData = {
    comparisonMonth: 'April 2025',
    comparisonPreviousMonth: 'March 2025',
    comparison: [
        { department: 'Engineering', marchEmployees: 1, aprilEmployees: 1, employeeChange: '0.0%', marchGross: 150000, aprilGross: 150000, grossChange: '0.0%' },
        { department: 'Product', marchEmployees: 1, aprilEmployees: 1, employeeChange: '0.0%', marchGross: 200000, aprilGross: 200000, grossChange: '0.0%' },
        { department: 'Total', marchEmployees: 2, aprilEmployees: 2, employeeChange: '0.0%', marchGross: 350000, aprilGross: 350000, grossChange: '0.0%' },
    ],
    detailedMonth: 'April 2025',
    detailedActiveEmployees: 2,
    payroll: [
        { id: 1, employee: 'John Doe', designation: 'Senior Developer', department: 'Engineering', basic: 75000, hra: 30000, special: 45000, gross: 150000, pf: 9000, tds: 20800, totalDeductions: 30000, netPay: 120000 },
        { id: 2, employee: 'Jane Smith', designation: 'Product Manager', department: 'Product', basic: 100000, hra: 40000, special: 60000, gross: 200000, pf: 12000, tds: 46150, totalDeductions: 58350, netPay: 141650 },
    ],
    payrollTotal: {
        employees: 2, basic: 175000, hra: 70000, special: 105000, gross: 350000, pf: 21000, tds: 66950, totalDeductions: 88350, netPay: 261650
    }
};

// --- Sub-Components (Panel Components) ---

// --- Dashboard Panel ---
function DashboardPanel({ dashboardData }) {
    // Basic check in case data isn't ready (though it's memoized)
    if (!dashboardData) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Dashboard Overview</Typography>
            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <GroupIcon color="primary" sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Total Employees</Typography>
                                    <Typography variant="h5" component="div">{dashboardData.totalEmployees}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Total Monthly Gross</Typography>
                                    <Typography variant="h5" component="div">{formatCurrency(dashboardData.totalMonthlyGross)}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TotalDeductionIcon color="warning" sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Total Monthly Deductions</Typography>
                                    <Typography variant="h5" component="div">{formatCurrency(dashboardData.totalMonthlyDeductions)} {/* Placeholder */}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={3}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <WalletIcon color="secondary" sx={{ fontSize: 40 }} />
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Net Monthly Payable</Typography>
                                    <Typography variant="h5" component="div">{formatCurrency(dashboardData.netMonthlyPayable)} {/* Placeholder */}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts/Analytics Section */}
            <Grid container spacing={3}>
                {/* Department Distribution */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Department - Monthly Gross Salary</Typography>
                            <Typography variant="caption" display="block" color="text.secondary" gutterBottom>Total: {formatCurrency(dashboardData.totalMonthlyGross)}</Typography>
                            <Box sx={{ mt: 2 }}>
                                {dashboardData.departmentAnalytics.length > 0 ? (
                                    dashboardData.departmentAnalytics.map((dept, index) => {
                                        const percentage = dashboardData.totalMonthlyGross > 0 ? (dept.totalMonthlyGross / dashboardData.totalMonthlyGross) * 100 : 0;
                                        return (
                                            <Box key={index} sx={{ mb: 2 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2">{dept.name} ({dept.count} {dept.count === 1 ? 'Emp' : 'Emps'})</Typography>
                                                    <Typography variant="body2" fontWeight="bold">{formatCurrency(dept.totalMonthlyGross)}</Typography>
                                                </Stack>
                                                <Box sx={{ width: '100%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 1, mt: 0.5, overflow: 'hidden' }}>
                                                    <Box sx={{ width: `${percentage}%`, height: '100%', backgroundColor: (theme) => theme.palette.primary.main, borderRadius: 1, transition: 'width 0.5s ease-in-out' }} />
                                                </Box>
                                            </Box>
                                        );
                                    })
                                ) : (<Typography>No department data available.</Typography>)}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tax Regime Distribution */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Employee Tax Regime Distribution</Typography>
                            <Typography variant="caption" display="block" color="text.secondary" gutterBottom>Total Employees: {dashboardData.totalEmployees}</Typography>
                            <Box sx={{ mt: 2 }}>
                                {dashboardData.taxRegimeDistribution.length > 0 ? (
                                    dashboardData.taxRegimeDistribution.map((regime, index) => (
                                        <Box key={index} sx={{ mb: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2">{regime.name}</Typography>
                                                <Typography variant="body2" fontWeight="bold">{regime.count} ({regime.percentage.toFixed(1)}%)</Typography>
                                            </Stack>
                                            <Box sx={{ width: '100%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 1, mt: 0.5, overflow: 'hidden' }}>
                                                <Box sx={{ width: `${regime.percentage}%`, height: '100%', backgroundColor: regime.name === 'New Regime' ? '#ff9800' : '#4caf50', borderRadius: 1, transition: 'width 0.5s ease-in-out' }} />
                                            </Box>
                                        </Box>
                                    ))
                                ) : (<Typography>No tax regime data available.</Typography>)}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Department Detailed Analytics */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Department Analytics</Typography>
                            {dashboardData.departmentAnalytics.length > 0 ? (
                                dashboardData.departmentAnalytics.map((dept, index) => (
                                    <Box key={index} sx={{ mb: index < dashboardData.departmentAnalytics.length - 1 ? 2 : 0 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">{dept.name}</Typography>
                                        <Divider sx={{ my: 0.5 }} />
                                        <Typography variant="body2">Employees: {dept.count}</Typography>
                                        <Typography variant="body2">Total Monthly Gross: {formatCurrency(dept.totalMonthlyGross)}</Typography>
                                        <Typography variant="body2">Average Monthly Salary: {formatCurrency(dept.averageMonthlySalary)}</Typography>
                                        {index < dashboardData.departmentAnalytics.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                                    </Box>
                                ))
                            ) : (<Typography>No department data to analyze.</Typography>)}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payroll Summary */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Payroll Summary</Typography>
                            <Typography variant="body1">Total Annual CTC: {formatCurrency(dashboardData.totalAnnualCTC)}</Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>Current Payroll Period: April 2025 {/* Placeholder */}</Typography>
                            <Button variant="outlined" size="small" sx={{ mt: 2 }} startIcon={<CalendarTodayIcon />}>View Payroll Calendar</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

// --- Employee Panel ---
function EmployeePanel({
    employees,
    newEmployee,
    setNewEmployee,
    onAddEmployee,
    onSelectEmployeeForTab,
    onEditEmployee,
    onDeleteEmployee
}) {
    return (
        <Box>
            <Typography variant="h5" gutterBottom>Manage Employees</Typography>
            {/* Add New Employee Form */}
            <Card sx={{ mb: 3 }} elevation={3}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Add New Employee</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField label="Full Name" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} fullWidth variant="outlined" size="small" required /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Email" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} fullWidth variant="outlined" size="small" required /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Designation" value={newEmployee.designation} onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })} fullWidth variant="outlined" size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Department" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} fullWidth variant="outlined" size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Annual CTC (INR)" type="number" value={newEmployee.ctc} onChange={(e) => setNewEmployee({ ...newEmployee, ctc: e.target.value })} fullWidth variant="outlined" size="small" required InputProps={{ inputProps: { min: 0 } }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tax Regime</InputLabel>
                                <Select value={newEmployee.taxRegime} label="Tax Regime" onChange={(e) => setNewEmployee({ ...newEmployee, taxRegime: e.target.value })}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {TAX_REGIMES.map(regime => <MenuItem key={regime} value={regime}>{regime}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'right' }}><Button variant="contained" onClick={onAddEmployee} startIcon={<PeopleIcon />}>Add Employee</Button></Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Employee List Table */}
            <Typography variant="h6" gutterBottom>Employee List</Typography>
            <Paper elevation={3} sx={{ overflowX: 'auto' }}> {/* Added overflowX */}
                <Table sx={{ minWidth: 800 }}> {/* Added minWidth */}
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell align="right">Annual CTC</TableCell>
                            <TableCell>Tax Regime</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">{employee.name}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.designation || '-'}</TableCell>
                                <TableCell>{employee.department || '-'}</TableCell>
                                <TableCell align="right">{formatCurrency(Number(employee.ctc))}</TableCell>
                                <TableCell>
                                    <Chip label={employee.taxRegime || '-'} size="small" color={employee.taxRegime === 'New Regime' ? 'warning' : employee.taxRegime === 'Old Regime' ? 'success' : 'default'} />
                                </TableCell>
                                <TableCell align="center">
                                    {/* Navigate to Declarations Tab for this employee */}
                                    <IconButton size="small" color="primary" title="View/Edit Declarations" onClick={() => onSelectEmployeeForTab(employee.id, 3)}>
                                        <AssignmentIcon fontSize="inherit" />
                                    </IconButton>
                                    {/* Navigate to Calculator Tab for this employee */}
                                    <IconButton size="small" color="info" title="Calculate Salary" onClick={() => onSelectEmployeeForTab(employee.id, 2)}>
                                        <CalculateIcon fontSize="inherit" />
                                    </IconButton>
                                    {/* Placeholder Edit Button */}
                                    <IconButton size="small" color="secondary" title="Edit Employee" onClick={() => onEditEmployee(employee.id)}>
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                                    {/* Placeholder Delete Button */}
                                    <IconButton size="small" color="error" title="Delete Employee" onClick={() => onDeleteEmployee(employee.id)}>
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}

// --- Salary Calculator Panel ---
function SalaryCalculatorPanel({
    selectedEmployeeDetails,
    calcCTC, setCalcCTC,
    bonusPercentage, setBonusPercentage,
    professionalTax, setProfessionalTax,
    employerPF, setEmployerPF,
    employeePF, setEmployeePF,
    addDeduction1, setAddDeduction1,
    addDeduction2, setAddDeduction2,
    calculatedSalary
}) {
    if (!selectedEmployeeDetails) {
        return (
            <Card elevation={3} sx={{ p: 2 }}>
                <Typography>Please select an employee from the Employees tab to calculate salary.</Typography>
            </Card>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Salary Calculator</Typography>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6">Calculating Salary for: {selectedEmployeeDetails.name}</Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {selectedEmployeeDetails.designation} - {selectedEmployeeDetails.department}
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    {/* Input Fields */}
                    <Grid container spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                        {/* CTC */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Cost to Company (CTC)</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={calcCTC} onChange={(e) => setCalcCTC(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0 } }} />
                        </Grid>
                        {/* Bonus % */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Bonus Included in CTC (%)</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={bonusPercentage} onChange={(e) => setBonusPercentage(Number(e.target.value))} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0, max: 100 } }} />
                        </Grid>
                        {/* Professional Tax */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Monthly Professional Tax</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={professionalTax} onChange={(e) => setProfessionalTax(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0 } }} />
                        </Grid>
                        {/* Employer PF */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Monthly Employer PF</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={employerPF} onChange={(e) => setEmployerPF(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0 } }} />
                        </Grid>
                        {/* Employee PF */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Monthly Employee PF</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={employeePF} onChange={(e) => setEmployeePF(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0 } }} />
                        </Grid>
                        {/* Additional Deduction 1 */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Monthly Additional Deduction (Optional 1)</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={addDeduction1} onChange={(e) => setAddDeduction1(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0 } }} />
                        </Grid>
                        {/* Additional Deduction 2 */}
                        <Grid item xs={12} sm={6}><Typography variant="body1">Monthly Additional Deduction (Optional 2)</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" type="number" value={addDeduction2} onChange={(e) => setAddDeduction2(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, sx: { '& input': { textAlign: 'right' } }, inputProps: { min: 0 } }} />
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />

                    {/* Calculated Output */}
                    <Typography variant="h6" gutterBottom>Estimated Salary Breakdown (Simplified)</Typography>
                    <Grid container spacing={1.5} sx={{ mt: 1 }}>
                        <Grid item xs={8}><Typography variant="body1">Total Monthly Deductions (Visible Inputs)</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body1" align="right" fontWeight="bold">{formatCurrency(calculatedSalary.totalMonthlyDeductions)}</Typography></Grid>

                        <Grid item xs={8}><Typography variant="body1">Total Annual Deductions (Visible Inputs x 12)</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body1" align="right" fontWeight="bold">{formatCurrency(calculatedSalary.totalAnnualDeductions)}</Typography></Grid>

                        <Grid item xs={8}><Typography variant="h6" sx={{ mt: 1 }}>Take Home Monthly Salary (Est.)</Typography></Grid>
                        <Grid item xs={4}><Typography variant="h6" align="right" fontWeight="bold" sx={{ mt: 1 }}>{formatCurrency(calculatedSalary.takeHomeMonthlySalary)}</Typography></Grid>

                        <Grid item xs={8}><Typography variant="body1">Take Home Annual Salary (Est.)</Typography></Grid>
                        <Grid item xs={4}><Typography variant="body1" align="right" fontWeight="bold">{formatCurrency(calculatedSalary.takeHomeAnnualSalary)}</Typography></Grid>

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'warning.lighter', borderColor: 'warning.light' }}>
                                <Typography variant="caption" color="text.secondary" component="div">
                                    <strong>Disclaimer:</strong> These "Take Home" values are simplified estimates based *only* on the CTC and the deduction fields shown above (Prof. Tax, Employee PF, Optional Deductions).
                                    <br />Actual take-home pay will likely differ due to factors like detailed salary structure (Basic, HRA, etc.), Income Tax (TDS) based on your tax regime and total income/investments, and other statutory deductions not explicitly entered here.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}


// --- Investment Declarations Panel ---
function InvestmentDeclarationsPanel({
    employees,
    selectedEmployeeId,
    handleEmployeeSelectChange,
    selectedEmployeeDetails,
    financialYear,
    investmentFormData,
    handleInvestmentChange,
    handleUploadClick,
    totalDeclared80C,
    onSaveDeclarations
}) {
    return (
        <Box>
            {/* Header with Employee Selector */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h5">Investment Declarations</Typography>
                <FormControl sx={{ minWidth: 240 }} size="small">
                    <InputLabel>Select Employee</InputLabel>
                    <Select value={selectedEmployeeId || ''} label="Select Employee" onChange={handleEmployeeSelectChange}>
                        <MenuItem value="" disabled><em>Select Employee...</em></MenuItem>
                        {employees.map(emp => (<MenuItem key={emp.id} value={emp.id}>{emp.name} ({emp.designation || 'No Designation'})</MenuItem>))}
                    </Select>
                </FormControl>
            </Stack>

            {/* Employee Info Box */}
            {selectedEmployeeDetails && (
                <Box sx={{ bgcolor: 'primary.lighter', p: 2, mb: 3, borderRadius: 1, border: '1px solid', borderColor: 'primary.light' }}>
                    <Typography variant="subtitle1" fontWeight="bold">{selectedEmployeeDetails.name}</Typography>
                    <Typography variant="body2">Financial Year: {financialYear}</Typography>
                    <Typography variant="body2">Tax Regime: <Chip component="span" label={selectedEmployeeDetails.taxRegime || 'Not Specified'} size="small" color={selectedEmployeeDetails.taxRegime === 'New Regime' ? 'warning' : selectedEmployeeDetails.taxRegime === 'Old Regime' ? 'success' : 'default'} /></Typography>
                </Box>
            )}

            {/* Declarations Card */}
            {!selectedEmployeeDetails ? (
                <Card elevation={3} sx={{ p: 2 }}><Typography>Please select an employee from the dropdown above.</Typography></Card>
            ) : (
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Section 80C Investments</Typography>
                        {investmentFormData.map((section, index) => (
                            <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center', borderBottom: '1px solid #eee', pb: 2 }}>
                                <Grid item xs={12} sm={7} md={8}>
                                    <Typography variant="body1" fontWeight="medium">{section.name}</Typography>
                                    <Typography variant="caption" display="block">{section.description}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Max Limit: {formatCurrency(section.maxLimit)}</Typography>
                                </Grid>
                                <Grid item xs={8} sm={3} md={3}>
                                    <TextField
                                        label="Declared Amount"
                                        size="small"
                                        type="number"
                                        value={section.declaredAmount || ''}
                                        onChange={(e) => handleInvestmentChange(index, e.target.value)}
                                        fullWidth
                                        InputProps={{
                                            inputProps: { min: 0, max: section.maxLimit },
                                            sx: { '& input': { textAlign: 'right' } },
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={4} sm={2} md={1} sx={{ textAlign: 'center' }}>
                                    <IconButton size="small" title={`Upload proof for ${section.name}`} onClick={() => handleUploadClick(section.name)} color="primary">
                                        <FileUploadOutlinedIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ textAlign: 'right', fontWeight: 'bold', mt: 2 }}>
                            <Typography variant="h6">Total Declared (80C): {formatCurrency(totalDeclared80C)}</Typography>
                             <Typography variant="caption" color="text.secondary" display="block">Overall 80C Limit: {formatCurrency(150000)}</Typography>
                        </Box>
                        <Button variant="contained" sx={{ mt: 3 }} onClick={onSaveDeclarations} startIcon={<AssignmentIcon />}>Save Declarations</Button>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

// --- Payslips Panel ---
function PayslipsPanel({ employees, payslipsData, paymentStatusData, onGeneratePayslip, onSendPayslip }) {
    return (
        <Box>
            <Typography variant="h5" gutterBottom>Payslips Generator</Typography>
            <Paper elevation={3} sx={{ mb: 4, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, background: (theme) => theme.palette.background.paper, minWidth: 180 }}>EMPLOYEE</TableCell>
                            {(payslipsData[0]?.months || PAYMENT_STATUS_MONTHS.slice(0, 6)).map(month => ( // Use sample months or default if empty
                                <TableCell key={month} align="center" colSpan={2} sx={{ background: (theme) => theme.palette.grey[100] }}>{month}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, background: (theme) => theme.palette.background.paper }}></TableCell>
                            {(payslipsData[0]?.months || PAYMENT_STATUS_MONTHS.slice(0, 6)).map(month => (
                                <React.Fragment key={month + '-actions'}>
                                    <TableCell align="center" sx={{ background: (theme) => theme.palette.grey[100] }}>Generate</TableCell>
                                    <TableCell align="center" sx={{ background: (theme) => theme.palette.grey[100] }}>Send</TableCell>
                                </React.Fragment>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((emp) => {
                            const payslipInfo = payslipsData.find(p => p.id === emp.id);
                            const monthsToShow = payslipInfo?.months || PAYMENT_STATUS_MONTHS.slice(0, 6); // Use actual months or fallback
                            return (
                                <TableRow key={emp.id} hover>
                                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, background: (theme) => theme.palette.background.paper }}>
                                        {emp.name}<br /><Typography variant="caption" color="textSecondary">{emp.designation || 'No Designation'}</Typography>
                                    </TableCell>
                                    {monthsToShow.map(month => (
                                        <React.Fragment key={month + '-' + emp.id}>
                                            <TableCell align="center"><Button size="small" variant="outlined" onClick={() => onGeneratePayslip(emp.id, month)}>Generate</Button></TableCell>
                                            <TableCell align="center"><Button size="small" variant="outlined" startIcon={<SendIcon fontSize='small' />} onClick={() => onSendPayslip(emp.id, month)}>Send</Button></TableCell>
                                        </React.Fragment>
                                    ))}
                                    {/* Render placeholders if employee not in payslipsData */}
                                    {!payslipInfo && monthsToShow.map((month, i) => (
                                         <React.Fragment key={`ph-${emp.id}-${i}`}>
                                             <TableCell align="center"><Button size="small" variant="outlined" onClick={() => onGeneratePayslip(emp.id, month)}>Generate</Button></TableCell>
                                             <TableCell align="center"><Button size="small" variant="outlined" startIcon={<SendIcon fontSize='small' />} onClick={() => onSendPayslip(emp.id, month)}>Send</Button></TableCell>
                                         </React.Fragment>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Payment Status Tracking (FY 2025-26)</Typography>
            <Paper elevation={3} sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1200 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, background: (theme) => theme.palette.background.paper, minWidth: 180 }}>EMPLOYEE</TableCell>
                            {PAYMENT_STATUS_MONTHS.map(month => (<TableCell key={month} align="center" sx={{ background: (theme) => theme.palette.grey[100] }}>{month}</TableCell>))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((emp) => {
                            const statusInfo = paymentStatusData.find(s => s.id === emp.id);
                            // Fallback to default 'Pending' status if employee not found in sample data
                            const statuses = statusInfo?.status || Array(12).fill('Pending');
                            return (
                                <TableRow key={emp.id} hover>
                                    <TableCell sx={{ position: 'sticky', left: 0, zIndex: 1, background: (theme) => theme.palette.background.paper }}>
                                        {emp.name}<br /><Typography variant="caption" color="textSecondary">{emp.designation || 'No Designation'}</Typography>
                                    </TableCell>
                                    {statuses.map((status, index) => (
                                        <TableCell key={index} align="center">
                                            <Chip
                                                label={status}
                                                size="small"
                                                color={status === 'Pending' ? 'error' : (status === 'Paid' ? 'success' : 'default')}
                                                variant={status === 'Pending' ? 'outlined' : 'filled'}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}


// --- Reports Panel ---
function ReportsPanel({ reportData, onExportReport }) {
    return (
        <Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Typography variant="h5">Reports</Typography>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExportReport}>Export Report</Button>
            </Stack>

            {/* Comparison Report */}
            <Card elevation={3} sx={{ mb: 4, overflowX: 'auto' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Department-wise Comparison Report</Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Comparing {reportData.comparisonMonth} with {reportData.comparisonPreviousMonth}</Typography>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>DEPARTMENT</TableCell>
                                <TableCell align="right">MARCH EMPLOYEES</TableCell>
                                <TableCell align="right">APRIL EMPLOYEES</TableCell>
                                <TableCell align="right">EMPLOYEE CHANGE %</TableCell>
                                <TableCell align="right">MARCH GROSS</TableCell>
                                <TableCell align="right">APRIL GROSS</TableCell>
                                <TableCell align="right">GROSS CHANGE %</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.comparison.map((row) => (
                                <TableRow key={row.department} hover>
                                    <TableCell component="th" scope="row">{row.department}</TableCell>
                                    <TableCell align="right">{row.marchEmployees}</TableCell>
                                    <TableCell align="right">{row.aprilEmployees}</TableCell>
                                    <TableCell align="right">{row.employeeChange}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.marchGross)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.aprilGross)}</TableCell>
                                    <TableCell align="right">{row.grossChange}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detailed Report */}
            <Card elevation={3} sx={{ overflowX: 'auto' }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6">Detailed Payroll Report</Typography>
                        <Typography variant="subtitle2" color="text.secondary">{reportData.detailedMonth}</Typography>
                    </Stack>
                    <Typography variant="caption" display="block" gutterBottom>Active Employees: {reportData.detailedActiveEmployees}</Typography>
                    <Table sx={{ minWidth: 1100 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>EMPLOYEE</TableCell>
                                <TableCell>DESIGNATION</TableCell>
                                <TableCell>DEPARTMENT</TableCell>
                                <TableCell align="right">BASIC</TableCell>
                                <TableCell align="right">HRA</TableCell>
                                <TableCell align="right">SPECIAL</TableCell>
                                <TableCell align="right">GROSS</TableCell>
                                <TableCell align="right">PF</TableCell>
                                <TableCell align="right">TDS</TableCell>
                                <TableCell align="right">TOTAL DEDUCTIONS</TableCell>
                                <TableCell align="right">NET PAY</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.payroll.map((row) => (
                                <TableRow key={row.id} hover>
                                    <TableCell component="th" scope="row">{row.employee}</TableCell>
                                    <TableCell>{row.designation}</TableCell>
                                    <TableCell>{row.department}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.basic)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.hra)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.special)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.gross)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.pf)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.tds)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.totalDeductions)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.netPay)}</TableCell>
                                </TableRow>
                            ))}
                            {/* Total Row */}
                            <TableRow sx={{ backgroundColor: '#f0f0f0', '& > *': { fontWeight: 'bold' } }}>
                                <TableCell colSpan={3}>Total ({reportData.payrollTotal.employees})</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.basic)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.hra)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.special)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.gross)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.pf)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.tds)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.totalDeductions)}</TableCell>
                                <TableCell align="right">{formatCurrency(reportData.payrollTotal.netPay)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </Box>
    );
}

// --- Financial Year Panel ---
function FinancialYearPanel({ financialYear, setFinancialYear, onSaveSettings }) {
    // Assuming fixed start/end months for simplicity as in original code
    const startMonth = "April";
    const endMonth = "March";

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Financial Year Settings</Typography>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Configure Payroll Period</Typography>
                    <FormControl sx={{ minWidth: 240, mt: 2 }} size="small">
                        <InputLabel>Select Financial Year</InputLabel>
                        <Select value={financialYear} label="Select Financial Year" onChange={(e) => setFinancialYear(e.target.value)}>
                            <MenuItem value="FY 2025-26">FY 2025-26</MenuItem>
                            <MenuItem value="FY 2024-25">FY 2024-25</MenuItem>
                            <MenuItem value="FY 2023-24">FY 2023-24</MenuItem>
                            {/* Add more years as needed */}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Start Month</InputLabel>
                            <Select value={startMonth} label="Start Month" readOnly> {/* Typically fixed */}
                                <MenuItem value="April">April</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>End Month</InputLabel>
                            <Select value={endMonth} label="End Month" readOnly> {/* Typically fixed */}
                                <MenuItem value="March">March</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={onSaveSettings} startIcon={<CalendarTodayIcon />}>Save Settings</Button>
                </CardContent>
            </Card>
        </Box>
    );
}


// --- Main Payroll Management System Component ---
export default function PayrollManagementSystem() {
    const [selectedTab, setSelectedTab] = useState(0);
    const [employees, setEmployees] = useState([
        // Existing employee data... (unchanged)
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', designation: 'Senior Developer', department: 'Engineering', ctc: 1800000, taxRegime: 'New Regime' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', designation: 'Product Manager', department: 'Product', ctc: 2400000, taxRegime: 'Old Regime' },
        { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', designation: 'QA Engineer', department: 'Engineering', ctc: 1500000, taxRegime: 'New Regime' },
        { id: 4, name: 'Test User', email: 'test.user@example.com', designation: 'Intern', department: 'Engineering', ctc: 600000, taxRegime: 'New Regime' },
    ]);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', designation: '', department: '', ctc: '', taxRegime: '' });
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || null);
    const [financialYear, setFinancialYear] = useState("FY 2025-26");

    // Investment Declaration State
    const [investmentFormData, setInvestmentFormData] = useState(
        // Create a deep copy initially to avoid direct mutation of defaults
        () => defaultInvestmentSections.map(section => ({ ...section }))
    );

    // Salary Calculator State
    const [calcCTC, setCalcCTC] = useState(0);
    const [bonusPercentage, setBonusPercentage] = useState(15);
    const [professionalTax, setProfessionalTax] = useState(200);
    const [employerPF, setEmployerPF] = useState(1800);
    const [employeePF, setEmployeePF] = useState(1800);
    const [addDeduction1, setAddDeduction1] = useState(0);
    const [addDeduction2, setAddDeduction2] = useState(0);

    // --- Effects ---
    // Update Investment form and Salary Calc CTC when employee changes
    useEffect(() => {
        const emp = employees.find(e => e.id === selectedEmployeeId);
        if (emp) {
            // TODO: In a real app, fetch ACTUAL saved declarations for this emp & FY
            // For now, resetting with defaults for the selected employee context
            console.log(`Updating forms for employee ${emp.name} (ID: ${emp.id}) and FY: ${financialYear}`);
            setInvestmentFormData(defaultInvestmentSections.map(section => ({ ...section, declaredAmount: 0 }))); // Reset amounts

            // Update Salary Calc CTC and reset other fields (or fetch actuals)
            setCalcCTC(Number(emp.ctc) || 0);
            // Resetting other calc fields - consider fetching employee defaults if available
            setBonusPercentage(15);
            setProfessionalTax(200); // Consider state-based PT if needed
            setEmployerPF(1800); // Placeholder - Should ideally be calculated
            setEmployeePF(1800); // Placeholder - Should ideally be calculated
            setAddDeduction1(0);
            setAddDeduction2(0);
        } else {
            // Reset if no employee selected or employee not found
            setInvestmentFormData(defaultInvestmentSections.map(section => ({ ...section, declaredAmount: 0 })));
            setCalcCTC(0);
            // Reset other fields too
            setBonusPercentage(15);
            setProfessionalTax(200);
            setEmployerPF(1800);
            setEmployeePF(1800);
            setAddDeduction1(0);
            setAddDeduction2(0);
        }
        // Using useCallback for handlers passed in dependency array helps prevent unnecessary runs,
        // but here dependencies are primitive/stable state setters, so it's okay.
    }, [selectedEmployeeId, financialYear, employees]); // Rerun if selected employee, FY, or the employee list itself changes


    // --- Event Handlers (Callbacks) ---
    const handleTabChange = useCallback((_, newValue) => setSelectedTab(newValue), []);

    const handleEmployeeSelectChange = useCallback((event) => {
        setSelectedEmployeeId(Number(event.target.value));
    }, []);

    const handleAddEmployee = useCallback(() => {
        const ctcValue = Number(newEmployee.ctc);
        if (newEmployee.name && newEmployee.email && ctcValue > 0) { // Basic validation
            // NOTE: ID generation is unsafe for real apps. Use UUID or backend ID.
            const nextId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
            const addedEmployee = { ...newEmployee, id: nextId, ctc: ctcValue };
            const updatedEmployees = [...employees, addedEmployee];
            setEmployees(updatedEmployees);
            setNewEmployee({ name: '', email: '', designation: '', department: '', ctc: '', taxRegime: '' }); // Reset form
            setSelectedEmployeeId(nextId); // Select the newly added employee
            setSelectedTab(1); // Stay on employee tab or switch? Decide UX. For now, stay.
            alert(`Employee "${addedEmployee.name}" added successfully!`); // Feedback
        } else {
            alert('Please fill in Name, Email, and a valid positive CTC.');
        }
    }, [newEmployee, employees]); // Dependency: newEmployee state and employees list

    const handleInvestmentChange = useCallback((index, value) => {
        setInvestmentFormData(prevData => {
            const updatedFormData = [...prevData];
            const numericValue = Math.max(0, Number(value) || 0); // Ensure non-negative number
            const limit = updatedFormData[index].maxLimit;
            updatedFormData[index] = { ...updatedFormData[index], declaredAmount: Math.min(numericValue, limit) };
            return updatedFormData;
        });
    }, []); // No dependencies needed as it uses the setter function's callback form

    // Placeholder Handlers for missing functionality
    const handleUploadClick = useCallback((sectionName) => alert(`Upload document for ${sectionName} - Not Implemented`), []);
    const handleSaveDeclarations = useCallback(() => alert('Save Declarations - Not Implemented'), []);
    const handleEditEmployee = useCallback((id) => alert(`Edit Employee ID: ${id} - Not Implemented`), []);
    const handleDeleteEmployee = useCallback((id) => {
         // Basic confirmation
         if (window.confirm(`Are you sure you want to delete employee ID: ${id}?`)) {
             alert(`Delete Employee ID: ${id} - Not Implemented (State update logic needed)`);
             // TODO: Implement actual deletion:
             // setEmployees(prev => prev.filter(emp => emp.id !== id));
             // if (selectedEmployeeId === id) setSelectedEmployeeId(null); // Deselect if deleted
         }
    }, []); // Add selectedEmployeeId if deselect logic is added
    const handleGeneratePayslip = useCallback((empId, month) => alert(`Generate Payslip for Employee ID: ${empId}, Month: ${month} - Not Implemented`), []);
    const handleSendPayslip = useCallback((empId, month) => alert(`Send Payslip for Employee ID: ${empId}, Month: ${month} - Not Implemented`), []);
    const handleExportReport = useCallback(() => alert('Export Report - Not Implemented'), []);
    const handleSaveSettings = useCallback(() => alert('Save Settings - Not Implemented'), []);

    // Handler to navigate to a tab AND select an employee (used by Employee actions)
    const handleSelectEmployeeForTab = useCallback((empId, tabIndex) => {
        setSelectedEmployeeId(empId);
        setSelectedTab(tabIndex);
    }, []);


    // --- Memos for Calculations (Unchanged Logic) ---
    const dashboardData = useMemo(() => {
        const totalEmployees = employees.length;
        const totalMonthlyGross = employees.reduce((sum, emp) => sum + (Number(emp.ctc) / 12), 0);
        // FIXME: Placeholder deduction calculation - Needs real logic
        const totalMonthlyDeductions = totalMonthlyGross * 0.25;
        const netMonthlyPayable = totalMonthlyGross - totalMonthlyDeductions;

        const departments = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            if (!departments[dept]) {
                departments[dept] = { count: 0, totalMonthlyGross: 0 };
            }
            departments[dept].count++;
            departments[dept].totalMonthlyGross += (Number(emp.ctc) / 12);
        });
        const departmentAnalytics = Object.entries(departments).map(([name, data]) => ({
            name,
            count: data.count,
            totalMonthlyGross: data.totalMonthlyGross,
            averageMonthlySalary: data.count > 0 ? data.totalMonthlyGross / data.count : 0,
        }));

        const taxRegimes = {};
        employees.forEach(emp => {
            const regime = emp.taxRegime || 'Not Specified';
            if (!taxRegimes[regime]) {
                taxRegimes[regime] = { count: 0 };
            }
            taxRegimes[regime].count++;
        });
        const taxRegimeDistribution = Object.entries(taxRegimes).map(([name, data]) => ({
            name,
            count: data.count,
            percentage: totalEmployees > 0 ? (data.count / totalEmployees) * 100 : 0,
        }));

        return {
            totalEmployees,
            totalMonthlyGross,
            totalMonthlyDeductions,
            netMonthlyPayable,
            departmentAnalytics,
            taxRegimeDistribution,
            totalAnnualCTC: employees.reduce((sum, emp) => sum + Number(emp.ctc), 0)
        };
    }, [employees]);

    const selectedEmployeeDetails = useMemo(() => {
        return employees.find(emp => emp.id === selectedEmployeeId) || null;
    }, [selectedEmployeeId, employees]);

    const totalDeclared80C = useMemo(() => {
        // Ensure investmentFormData is an array before reducing
        if (!Array.isArray(investmentFormData)) return 0;
        return investmentFormData.reduce((sum, section) => sum + (Number(section.declaredAmount) || 0), 0);
    }, [investmentFormData]);

    const calculatedSalary = useMemo(() => {
        // --- Simplified Calculation Logic (Unchanged) ---
        const annualCTC = Number(calcCTC) || 0;
        const monthlyGross = annualCTC / 12; // Very simplified gross
        const monthlyProfTax = Number(professionalTax) || 0;
        const monthlyEmpPF = Number(employeePF) || 0; // Note: Employee PF used for deduction
        const monthlyAddDed1 = Number(addDeduction1) || 0;
        const monthlyAddDed2 = Number(addDeduction2) || 0;

        // Simplified total deductions (Visible Inputs only, excluding Employer PF, Bonus effect, TDS)
        const simplifiedTotalMonthlyDeductions = monthlyProfTax + monthlyEmpPF + monthlyAddDed1 + monthlyAddDed2;
        const simplifiedTakeHomeMonthly = monthlyGross - simplifiedTotalMonthlyDeductions;

        return {
            totalMonthlyDeductions: simplifiedTotalMonthlyDeductions,
            totalAnnualDeductions: simplifiedTotalMonthlyDeductions * 12,
            takeHomeMonthlySalary: simplifiedTakeHomeMonthly,
            takeHomeAnnualSalary: simplifiedTakeHomeMonthly * 12,
        };
        // --- End Simplified Calculation ---
    }, [calcCTC, professionalTax, employeePF, addDeduction1, addDeduction2]);


    // --- Render Logic ---
    const renderTabContent = () => {
        switch (selectedTab) {
            case 0: return <DashboardPanel dashboardData={dashboardData} />;
            case 1: return <EmployeePanel
                employees={employees}
                newEmployee={newEmployee}
                setNewEmployee={setNewEmployee}
                onAddEmployee={handleAddEmployee}
                onSelectEmployeeForTab={handleSelectEmployeeForTab}
                onEditEmployee={handleEditEmployee}
                onDeleteEmployee={handleDeleteEmployee}
            />;
            case 2: return <SalaryCalculatorPanel
                selectedEmployeeDetails={selectedEmployeeDetails}
                calcCTC={calcCTC} setCalcCTC={setCalcCTC}
                bonusPercentage={bonusPercentage} setBonusPercentage={setBonusPercentage}
                professionalTax={professionalTax} setProfessionalTax={setProfessionalTax}
                employerPF={employerPF} setEmployerPF={setEmployerPF}
                employeePF={employeePF} setEmployeePF={setEmployeePF}
                addDeduction1={addDeduction1} setAddDeduction1={setAddDeduction1}
                addDeduction2={addDeduction2} setAddDeduction2={setAddDeduction2}
                calculatedSalary={calculatedSalary}
             />;
            case 3: return <InvestmentDeclarationsPanel
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                handleEmployeeSelectChange={handleEmployeeSelectChange}
                selectedEmployeeDetails={selectedEmployeeDetails}
                financialYear={financialYear}
                investmentFormData={investmentFormData}
                handleInvestmentChange={handleInvestmentChange}
                handleUploadClick={handleUploadClick}
                totalDeclared80C={totalDeclared80C}
                onSaveDeclarations={handleSaveDeclarations}
            />;
            case 4: return <PayslipsPanel
                employees={employees}
                payslipsData={payslipsData} // Pass sample data
                paymentStatusData={paymentStatusData} // Pass sample data
                onGeneratePayslip={handleGeneratePayslip}
                onSendPayslip={handleSendPayslip}
            />;
            case 5: return <ReportsPanel
                reportData={reportData} // Pass sample data
                onExportReport={handleExportReport}
             />;
            case 6: return <FinancialYearPanel
                financialYear={financialYear}
                setFinancialYear={setFinancialYear}
                onSaveSettings={handleSaveSettings}
            />;
            default: return <Typography>Invalid Tab Selected</Typography>;
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f4f6f8' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Payroll Management System
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="payroll navigation tabs"
                >
                    {TABS.map((tab, index) => (
                        <Tab
                            key={index}
                            icon={ICONS[index]}
                            iconPosition="start"
                            label={tab}
                            id={`tab-${index}`}
                            aria-controls={`tabpanel-${index}`}
                            sx={{ textTransform: 'none', minHeight: '64px' }} // Improve tab appearance
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, overflowY: 'auto' }}>
                {/* Render the content based on selected tab */}
                {renderTabContent()}
            </Box>
        </Box>
    );
}