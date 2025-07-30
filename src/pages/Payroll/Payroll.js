import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddIcon from '@mui/icons-material/PersonAdd';


// 1. Define a custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#68B984',
            contrastText: '#fff',
        },
        secondary: {
            main: '#f5f5f5',
            contrastText: '#000',
        },
        warning: {
            main: '#ff9800',
            contrastText: '#fff',
        },
        info: {
             main: '#e8f5e9' // A light green for info cards
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: '20px', padding: '6px 24px' } } },
        MuiPaper: { styleOverrides: { root: { borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } } },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#e8f5e9',
                        '& fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: '1px solid #68B984' },
                    },
                },
            },
        },
    },
});

// 2. Updated mock data with new structure for dynamic allowances/deductions
const initialEmployees = [
    {
        id: 1, name: 'Anil Babu', employeeId: '21406', dateOfJoining: '2025-01-01', gender: 'Male', designation: 'Team Lead', department: 'Sales', mobileNumber: '123-456-7890', email: 'ab@gmail.com', taxRegime: 'Old', annualCTC: 1800000,
        allowances: {
            'Basic': 80000, 'House Rent Allowance': 40000, 'Conveyance Allowance': 1600, 'Fixed Allowance': 20000, 'Transport Allowance': 1600,
        },
        deductions: {
            'TDS': 5000, 'Professional Tax': 200, 'EPF': 1800, 'ESI': 1500, 'Canteen': 500,
        },
        reimbursementEnabled: true, isSalesAgent: false, notes: 'This employee is a top performer.', resignationDate: null, onPayroll: true,
        outstandingPayment: 20000.00, pfNo: 'BN/SHAG/26563/21406', bankDetails: { bankName: 'SBI Bank', accountNo: '10032245566', ifsc: 'SBIN5486' },
        panAadhaar: 'ABCDE1234F', esicNumber: '1234567890', payPeriod: 'Monthly', workLocation: 'Bangalore Head Office',
        declarations: { epf: 24000, ppf: 50000, elss: 10000, insurance: 12000, nps: 0 },
        leaves: [
            { date: '2025-06-02', type: 'Personal Leave' }, { date: '2025-06-07', type: 'Holiday' },
            { date: '2025-06-08', type: 'Holiday' }, { date: '2025-06-11', type: 'Personal Leave', hours: 4 },
            { date: '2025-06-12', type: 'Personal Leave' }, { date: '2025-06-14', type: 'Holiday' }, { date: '2025-06-16', type: 'Leave without Pay' },
        ],
        overtime: [{ date: '2025-06-20', hours: 2 }, { date: '2025-06-21', hours: 3 }],
        reimbursementStatus: 'Approved', reimbursementAmount: 1000
    },
    {
        id: 2, name: 'Imtiyaz', employeeId: 'EMP002', dateOfJoining: '2021-11-20', gender: 'Male', designation: 'Product Manager', department: 'Product', mobileNumber: '098-765-4321', email: 'abc@gmail.com', taxRegime: 'New', annualCTC: 2400000,
        allowances: {
            'Basic': 100000, 'House Rent Allowance': 50000, 'Conveyance Allowance': 1600, 'Fixed Allowance': 30000, 'Transport Allowance': 1600,
        },
        deductions: {
            'TDS': 5000, 'Professional Tax': 200, 'EPF': 1800, 'ESI': 1800,
        },
        reimbursementEnabled: false, isSalesAgent: true, notes: '', resignationDate: null, onPayroll: true,
        outstandingPayment: 15000.00, pfNo: 'BN/SHAG/26563/EMP002', bankDetails: { bankName: 'HDFC Bank', accountNo: '50100234567890', ifsc: 'HDFC0000123' },
        panAadhaar: 'FGHIJ5678K', esicNumber: '0987654321', payPeriod: 'Monthly', workLocation: 'Mumbai Branch',
        declarations: { epf: 21600, ppf: 0, elss: 0, insurance: 25000, nps: 15000 },
        leaves: [
            { date: '2025-06-04', type: 'Sick Leave' }, { date: '2025-06-07', type: 'Holiday' },
            { date: '2025-06-08', type: 'Holiday' }, { date: '2025-06-09', type: 'Personal Leave' },
            { date: '2025-06-10', type: 'Personal Leave' }, { date: '2025-06-12', type: 'Sick Leave', hours: 4 },
            { date: '2025-06-13', type: 'Personal Leave' }, { date: '2025-06-14', type: 'Holiday' },
        ],
        overtime: [],
        reimbursementStatus: 'No Reimbursement', reimbursementAmount: 0,
    },
     {
        id: 3, name: 'John Doe', employeeId: 'EMP003', dateOfJoining: '2023-05-10', gender: 'Male', designation: 'Software Engineer', department: 'IT', mobileNumber: '111-222-3333', email: 'john.doe@example.com', taxRegime: 'New', annualCTC: 0,
        allowances: {}, deductions: {}, reimbursementEnabled: false, isSalesAgent: false, notes: '', resignationDate: null, onPayroll: false,
        outstandingPayment: 0, pfNo: '', bankDetails: { bankName: '', accountNo: '', ifsc: '' },
        panAadhaar: '', esicNumber: '', payPeriod: 'Monthly', workLocation: 'Main Office',
        declarations: {}, leaves: [], overtime: [], reimbursementStatus: 'No Reimbursement', reimbursementAmount: 0,
    },
];

const declarationSections = [
    { id: 'epf', title: 'Employee Provident Fund (EPF)', subtitle: 'Voluntary contribution to EPF account.' },
    { id: 'ppf', title: 'Public Provident Fund (PPF)', subtitle: 'Assign to a specific tax-deferred savings plan.' },
    { id: 'elss', title: 'Equity Linked Savings Scheme (ELSS)', subtitle: 'Tax-saving mutual funds with 3-year lock-in period.' },
    { id: 'insurance', title: 'Life Insurance Premium', subtitle: 'Premium paid for life insurance policies.' },
    { id: 'nps', title: 'National Pension System (NPS)', subtitle: 'Invest in a centrally-managed pension account.' },
];

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const calculateTds = (ctc, regime, declarations = {}, standardDeduction = 50000) => {
    let taxableIncomeAfterDeductions = ctc - standardDeduction;
    let applicable80C = 0;
    if (regime === 'Old') {
        const totalDeclared80C = Object.values(declarations).reduce((sum, val) => sum + Number(val || 0), 0);
        applicable80C = Math.min(totalDeclared80C, 150000);
        taxableIncomeAfterDeductions -= applicable80C;
    }

    const finalTaxableIncome = Math.max(0, taxableIncomeAfterDeductions);
    let tax = 0;
    const slabBreakdown = [];

    if (regime === 'New') {
        const slabs = [
            { from: 0, to: 300000, rate: 0 },
            { from: 300000, to: 600000, rate: 0.05 },
            { from: 600000, to: 900000, rate: 0.10 },
            { from: 900000, to: 1200000, rate: 0.15 },
            { from: 1200000, to: 1500000, rate: 0.20 },
            { from: 1500000, to: Infinity, rate: 0.30 },
        ];

        slabs.forEach(slab => {
            if (finalTaxableIncome > slab.from) {
                const taxableInSlab = Math.min(finalTaxableIncome, slab.to) - slab.from;
                if (taxableInSlab > 0) {
                    const taxInSlab = taxableInSlab * slab.rate;
                    if (taxInSlab > 0) {
                        tax += taxInSlab;
                        const slabText = slab.to === Infinity
                            ? `Tax on amount above ${formatCurrency(slab.from)} @ ${slab.rate * 100}%`
                            : `Tax on next ${formatCurrency(slab.to - slab.from)} @ ${slab.rate * 100}%`;
                        slabBreakdown.push({ text: slabText, amount: formatCurrency(taxInSlab) });
                    }
                }
            }
        });

    } else { // Old Regime
         const slabs = [
            { from: 0, to: 250000, rate: 0 },
            { from: 250000, to: 500000, rate: 0.05 },
            { from: 500000, to: 1000000, rate: 0.20 },
            { from: 1000000, to: Infinity, rate: 0.30 },
        ];

        slabs.forEach(slab => {
            if (finalTaxableIncome > slab.from) {
                const taxableInSlab = Math.min(finalTaxableIncome, slab.to) - slab.from;
                if (taxableInSlab > 0) {
                    const taxInSlab = taxableInSlab * slab.rate;
                    if (taxInSlab > 0) {
                        tax += taxInSlab;
                         const slabText = slab.to === Infinity
                            ? `Tax on amount above ${formatCurrency(slab.from)} @ ${slab.rate * 100}%`
                            : `Tax on next ${formatCurrency(slab.to - slab.from)} @ ${slab.rate * 100}%`;
                        slabBreakdown.push({ text: slabText, amount: formatCurrency(taxInSlab) });
                    }
                }
            }
        });
    }

    const cess = tax > 0 ? tax * 0.04 : 0;
    const finalTax = tax + cess;
    return {
        taxableIncome: finalTaxableIncome,
        taxBeforeCess: tax,
        cess,
        annualTax: Math.round(finalTax),
        monthlyTds: Math.round(finalTax / 12),
        applicable80C,
        slabBreakdown,
    };
};



function HeaderNavigation({ currentView, onNavigate }) {
    const navItems = ['Dashboard', 'Employees', 'Leave Register', 'Overtime Register', 'Run Payroll', 'Payroll History', 'Settings'];
    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {navItems.map((item) => {
                const isCurrent = (item.replace(/ /g, '').toLowerCase() === currentView.replace(/ /g, '').toLowerCase());
                return ( <Button key={item} variant={isCurrent ? 'contained' : 'text'} color={isCurrent ? 'primary' : 'secondary'} sx={{ backgroundColor: !isCurrent ? '#f5f5f5' : undefined, color: !isCurrent ? 'black' : undefined, '&:hover': { backgroundColor: isCurrent ? '#5a9f73' : '#e0e0e0' } }} onClick={() => onNavigate(item)} >{item}</Button> );
            })}
        </Box>
    );
}

function GlobalSettings({ financialYear, onFinancialYearChange }) {
    return (
        <Paper sx={{p:2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h6">Company Payroll</Typography>
            <FormControl size="small">
                <InputLabel>Financial Year</InputLabel>
                <Select
                    value={financialYear}
                    label="Financial Year"
                    onChange={(e) => onFinancialYearChange(e.target.value)}
                    sx={{minWidth: 150}}
                >
                    <MenuItem value="2024-2025">2024-2025</MenuItem>
                    <MenuItem value="2025-2026">2025-2026</MenuItem>
                </Select>
            </FormControl>
        </Paper>
    );
}


function Dashboard({ employees, payrollHistory }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Calculations for info cards
    const activeEmployees = employees.filter(emp => !emp.resignationDate && emp.onPayroll);
    const totalEmployees = activeEmployees.length;
    const salaryPayable = activeEmployees.reduce((acc, emp) => {
        const grossPay = Object.values(emp.allowances || {}).reduce((sum, val) => sum + Number(val || 0), 0) + (emp.reimbursementAmount || 0);
        const deductions = Object.values(emp.deductions || {}).reduce((sum, val) => sum + Number(val || 0), 0);
        return acc + (grossPay - deductions);
    }, 0);
    const totalTDS = activeEmployees.reduce((acc, emp) => acc + (emp.deductions?.['TDS'] || 0), 0);
    const totalEPF = activeEmployees.reduce((acc, emp) => acc + (emp.deductions?.['EPF'] || 0), 0);
    const totalESI = activeEmployees.reduce((acc, emp) => acc + (emp.deductions?.['ESI'] || 0), 0);

    // Data for charts
    const payrollChartData = [
        { name: 'Jan 25', value: 160000 },
        { name: 'Feb 25', value: 175000 },
        { name: 'Mar 25', value: 150000 },
        { name: 'Apr 25', value: 180000 },
        { name: 'May 25', value: 170000 },
        { name: 'Jun 25', value: 200000 },
    ];

    const departmentCounts = employees.reduce((acc, emp) => {
        if (emp.onPayroll) {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
        }
        return acc;
    }, {});

    const departmentChartData = Object.keys(departmentCounts).map(dept => ({
        name: dept,
        Employees: departmentCounts[dept]
    }));

    const InfoCard = ({ title, value }) => (
        <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                <Typography color="text.secondary">{title}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
            </Paper>
        </Grid>
    );

    return (
        <Box>
             <Box sx={{ display: 'flex', overflowX: 'auto', mb: 2, pb: 1 }}>
                {months.map((month, index) => (
                    <Button
                        key={month}
                        onClick={() => setSelectedMonth(index)}
                        variant={selectedMonth === index ? 'contained' : 'outlined'}
                        sx={{ mr: 1, flexShrink: 0 }}
                    >
                        {month} {new Date().getFullYear()}
                    </Button>
                ))}
            </Box>
            <Grid container spacing={2}>
                <InfoCard title="Total Employees" value={totalEmployees} />
                <InfoCard title="Salary Payable" value={formatCurrency(salaryPayable)} />
                <InfoCard title="TDS" value={formatCurrency(totalTDS)} />
                <InfoCard title="EPF" value={formatCurrency(totalEPF)} />
                <InfoCard title="ESI" value={formatCurrency(totalESI)} />
            </Grid>
            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                     <Paper sx={{p:2, height: 300}}>
                         <Typography variant="h6">Payroll Chart</Typography>
                        <ResponsiveContainer>
                            <LineChart data={payrollChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{p:2, height: 300}}>
                        <Typography variant="h6">Salary by department</Typography>
                        <ResponsiveContainer>
                            <BarChart data={departmentChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Employees" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}


function EmployeeTable({ employees, onEdit, onDelete, onShowDeclaration, onShowCalculator, onShowReport, onAddToPayroll }) {
    return (
        <Paper>
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead><TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Designation</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Annual CTC</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Tax Regime</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell><TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                        {employees.map((row) => (
                            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row" onClick={() => onShowReport(row)} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell><TableCell>{row.designation}</TableCell><TableCell>{row.department}</TableCell><TableCell>{row.annualCTC > 0 ? formatCurrency(row.annualCTC) : 'Not on Payroll'}</TableCell>
                                <TableCell><Chip label={row.taxRegime} size="small" color={row.taxRegime === 'Old' ? 'warning' : 'success'} sx={{ color: 'white', fontWeight: 'bold' }} /></TableCell>
                                <TableCell>
                                    <Chip
                                        label={row.onPayroll ? 'On Payroll' : 'Outside Payroll'}
                                        size="small"
                                        color={row.onPayroll ? 'primary' : 'default'}
                                        sx={{ color: row.onPayroll ? 'white' : 'inherit', fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                                    {row.onPayroll ? (
                                        <>
                                            <IconButton size="small" onClick={() => onShowCalculator(row)}><VisibilityIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" onClick={() => onShowDeclaration(row)}><DescriptionIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" onClick={() => onEdit(row)}><EditIcon fontSize="small" /></IconButton>
                                            <IconButton size="small" sx={{ color: 'red' }} onClick={() => onDelete(row.id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </>
                                    ) : (
                                        <IconButton size="small" color="primary" onClick={() => onAddToPayroll(row)}><PersonAddIcon fontSize="small" /></IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}


function QuickUploadSection() {
    return ( <Paper sx={{ p: 3, mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', flexWrap: 'wrap', gap: 2 }}><Typography variant="h6" sx={{ fontWeight: 'bold' }}>Quickly add employee to the company!</Typography><Button variant="contained" color="primary">Bulk Upload</Button></Paper> );
}

function EditEmployeeForm({ employee, onSave, onBack, settings }) {
    const [formData, setFormData] = useState(employee);
    const [isPayrollEnabled, setIsPayrollEnabled] = useState(!!employee?.onPayroll);
    const [autoCalculateTDS, setAutoCalculateTDS] = useState(true);

    useEffect(() => {
        if (autoCalculateTDS && isPayrollEnabled) {
            const { monthlyTds } = calculateTds(formData.annualCTC, formData.taxRegime, formData.declarations);
            setFormData(prev => ({
                ...prev,
                deductions: {
                    ...prev.deductions,
                    'TDS': monthlyTds
                }
            }));
        }
    }, [formData.annualCTC, formData.taxRegime, formData.declarations, autoCalculateTDS, isPayrollEnabled]);

    useEffect(() => {
        // Initialize allowances and deductions from settings if not present
        const initialAllowances = {};
        settings.allowances.forEach(a => initialAllowances[a.name] = employee.allowances?.[a.name] || 0);

        const initialDeductions = {};
        settings.deductions.forEach(d => initialDeductions[d.name] = employee.deductions?.[d.name] || 0);

        setFormData({
            ...employee,
            allowances: initialAllowances,
            deductions: initialDeductions,
            bankDetails: employee.bankDetails || { bankName: '', accountNo: '', ifsc: '' }
        });
        setIsPayrollEnabled(!!employee?.onPayroll);
    }, [employee, settings]);

    const handleDynamicChange = (e, type, name) => {
         const { value } = e.target;
         setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [name]: value
            }
         }));
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        if (name.includes('.')) {
            const [outerKey, innerKey] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [outerKey]: {
                    ...prev[outerKey],
                    [innerKey]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };
    const handleTaxRegimeChange = (e, newRegime) => { if (newRegime) setFormData(prev => ({ ...prev, taxRegime: newRegime })) };

    const handleSaveClick = () => {
        onSave({ ...formData, onPayroll: isPayrollEnabled });
    };

    const FormRow = ({ label, children }) => ( <Grid item xs={12} container alignItems="center" sx={{ mb: 2 }}><Grid item xs={12} md={4}><Typography variant="body1">{label}</Typography></Grid><Grid item xs={12} md={8}>{children}</Grid></Grid> );

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button>
            <Paper sx={{ p: 3 }}>
                <FormControlLabel control={<Switch checked={isPayrollEnabled} onChange={(e) => setIsPayrollEnabled(e.target.checked)} />} label="Add Employee to Payroll" sx={{ mb: 3 }} />
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        {/* Basic Details Section */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Basic details</Typography>
                        <FormRow label="Employee Name*"><TextField fullWidth size="small" name="name" value={formData.name || ''} onChange={handleChange} /></FormRow>
                        <FormRow label="Employee ID*"><TextField fullWidth size="small" name="employeeId" value={formData.employeeId || ''} onChange={handleChange} /></FormRow>
                        <FormRow label="Date of Joining*"><TextField fullWidth size="small" name="dateOfJoining" type="date" value={formData.dateOfJoining || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></FormRow>
                        {isPayrollEnabled && <FormRow label="Gender*"><TextField fullWidth size="small" name="gender" value={formData.gender || ''} onChange={handleChange} /></FormRow>}
                        <FormRow label="Designation*"><TextField fullWidth size="small" name="designation" value={formData.designation || ''} onChange={handleChange} /></FormRow>
                        <FormRow label="Department*"><TextField fullWidth size="small" name="department" value={formData.department || ''} onChange={handleChange} /></FormRow>
                        <FormRow label="Mobile Number"><TextField fullWidth size="small" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} /></FormRow>
                        <FormRow label="Email"><TextField fullWidth size="small" name="email" type="email" value={formData.email || ''} onChange={handleChange} /></FormRow>
                        <FormRow label="Select Tax Regime">
                            <ToggleButtonGroup
                                value={formData.taxRegime}
                                exclusive
                                onChange={handleTaxRegimeChange}
                                size="small"
                            >
                                <ToggleButton value="Old" sx={{ '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: 'warning.main', color: 'warning.contrastText' } }}>
                                    Old
                                </ToggleButton>
                                <ToggleButton value="New">
                                    New
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </FormRow>
                        <FormRow label=""><Box><FormControlLabel control={<Switch name="reimbursementEnabled" checked={formData.reimbursementEnabled || false} onChange={handleChange} />} label="Reimbursement Claims Enabled" /><FormControlLabel control={<Switch name="isSalesAgent" checked={formData.isSalesAgent || false} onChange={handleChange} />} label="Is a Sales Agent" /></Box></FormRow>
                        <FormRow label="Resignation Date">
                            <Box>
                                <TextField fullWidth size="small" name="resignationDate" type="date" value={formData.resignationDate || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                                {formData.resignationDate && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Last Payroll Month: {new Date(formData.resignationDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </Typography>
                                )}
                            </Box>
                        </FormRow>
                    </Grid>
                    {isPayrollEnabled && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Salary details</Typography>
                            <FormRow label="Annual CTC*"><TextField fullWidth size="small" name="annualCTC" type="number" value={formData.annualCTC || ''} onChange={handleChange} /></FormRow>

                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Allowances</Typography>
                             {settings.allowances.map(allowance => (
                                <FormRow key={allowance.name} label={allowance.name}>
                                    <TextField fullWidth size="small" type="number" value={formData.allowances?.[allowance.name] || 0} onChange={(e) => handleDynamicChange(e, 'allowances', allowance.name)} />
                                </FormRow>
                            ))}

                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Deductions</Typography>
                            {settings.deductions.map(deduction => (
                                <FormRow key={deduction.name} label={deduction.name}>
                                    <TextField fullWidth size="small" type="number" value={formData.deductions?.[deduction.name] || 0} onChange={(e) => handleDynamicChange(e, 'deductions', deduction.name)} disabled={deduction.name === 'TDS' && autoCalculateTDS}/>
                                </FormRow>
                            ))}
                             <FormControlLabel control={<Switch checked={autoCalculateTDS} onChange={(e) => setAutoCalculateTDS(e.target.checked)} />} label="Calculate TDS Automatically" />


                            {/* Statutory & Financial Details */}
                            <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold' }}> Statutory & Financial Details </Typography>
                            <FormRow label="PAN / Aadhaar"><TextField fullWidth size="small" name="panAadhaar" value={formData.panAadhaar || ''} onChange={handleChange} /></FormRow>
                            <FormRow label="PF UAN"><TextField fullWidth size="small" name="pfNo" value={formData.pfNo || ''} onChange={handleChange} /></FormRow>
                            <FormRow label="ESIC Number"><TextField fullWidth size="small" name="esicNumber" value={formData.esicNumber || ''} onChange={handleChange} /></FormRow>
                            <FormRow label="Work Location / Branch"><TextField fullWidth size="small" name="workLocation" value={formData.workLocation || ''} onChange={handleChange} /></FormRow>
                            <FormRow label="Pay Period">
                                <Select fullWidth size="small" name="payPeriod" value={formData.payPeriod || 'Monthly'} onChange={handleChange}>
                                    <MenuItem value="Monthly">Monthly</MenuItem>
                                    <MenuItem value="Weekly">Weekly</MenuItem>
                                </Select>
                            </FormRow>
                            <FormRow label="Bank Name"><TextField fullWidth size="small" name="bankDetails.bankName" value={formData.bankDetails?.bankName || ''} onChange={handleChange} /></FormRow>
                            <FormRow label="Bank Account Number"><TextField fullWidth size="small" name="bankDetails.accountNo" value={formData.bankDetails?.accountNo || ''} onChange={handleChange} /></FormRow>
                            <FormRow label="Bank IFSC"><TextField fullWidth size="small" name="bankDetails.ifsc" value={formData.bankDetails?.ifsc || ''} onChange={handleChange} /></FormRow>

                        </Grid>
                    )}
                </Grid>
                 <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={handleSaveClick}>Save</Button>
            </Paper>
        </Box>
    );
}

function DeclarationForm({ employee, onSave, onBack }) {
    const [declarations, setDeclarations] = useState(employee.declarations || {});
    const total = Object.values(declarations).reduce((sum, val) => sum + (Number(val) || 0), 0);
    const handleFileUpload = (investment) => console.log(`Uploading proof for ${investment}`);

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button>
            <Paper sx={{ p: { xs: 2, md: 4 } }}>
                 <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Investment Declarations for {employee.name}</Typography>
                 <List sx={{ p: 0 }}>
                    {declarationSections.map(item => (
                        <ListItem key={item.id} divider sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', py: 2, px: 0, gap: 2 }}>
                            <Box sx={{ flex: '1 1 300px' }}><Typography variant="body1" sx={{ fontWeight: 500 }}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.subtitle}</Typography></Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 1 250px' }}><TextField fullWidth size="small" label="Amount" type="number" value={declarations[item.id] || ''} onChange={(e) => setDeclarations(p => ({...p, [item.id]: e.target.value}))} /><IconButton color="primary" onClick={() => handleFileUpload(item.title)}><FileUploadIcon /></IconButton></Box>
                        </ListItem>
                    ))}
                 </List>
                 <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3, gap: 2 }}><Typography variant="h6">Total Declared:</Typography><Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatCurrency(total)}</Typography></Box>
                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}><Button variant="contained" color="primary" onClick={() => onSave(declarations)}>Save Declaration</Button></Box>
            </Paper>
        </Box>
    );
}

const TaxComparisonView = ({ employee, financialYear, onBack }) => {
    // --- Common Calculations ---
    const monthlyAllowances = Object.values(employee.allowances || {}).reduce((sum, val) => sum + Number(val || 0), 0) - (employee.allowances?.['Basic'] || 0);
    const grossAnnual = ((employee.allowances?.['Basic'] || 0) + monthlyAllowances) * 12;

    // --- Tax Calculations ---
    const standardDeduction = 50000;
    const oldRegimeCalc = calculateTds(grossAnnual, 'Old', employee.declarations, standardDeduction);
    const newRegimeCalc = calculateTds(grossAnnual, 'New', {}, standardDeduction);

    const otherDeductionsAnnual = (Object.values(employee.deductions || {}).reduce((sum, val) => sum + Number(val || 0), 0)) * 12;

    const netTakeHomeOld = grossAnnual - otherDeductionsAnnual - oldRegimeCalc.annualTax;
    const netTakeHomeNew = grossAnnual - otherDeductionsAnnual - newRegimeCalc.annualTax;
    const isOldRegimeRecommended = netTakeHomeOld >= netTakeHomeNew;

    const SummaryRow = ({ label, value, bold }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="body2" sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{value}</Typography>
        </Box>
    );

    const TaxCalculationCard = ({ title, calcData, isRecommended }) => {
        const netTakeHome = grossAnnual - otherDeductionsAnnual - calcData.annualTax;
        return (
            <Paper sx={{ p: 2, height: '100%', position: 'relative', border: isRecommended ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`, display: 'flex', flexDirection: 'column' }}>
                {isRecommended && <Chip label="Recommended" color="success" size="small" sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, color: 'white' }} />}
                <Typography variant="h6">{title}</Typography>
                <Box sx={{ my: 2, flexGrow: 1 }}>
                    <SummaryRow label="Gross Annual Salary" value={formatCurrency(grossAnnual)} />
                    <SummaryRow label="Less: Standard Deduction" value={formatCurrency(standardDeduction)} />
                    {title === 'Old Regime' && <SummaryRow label="Less: 80C Declarations" value={formatCurrency(calcData.applicable80C)} />}
                    <SummaryRow label="Taxable Income" value={formatCurrency(calcData.taxableIncome)} bold />

                    <Typography variant="body2" sx={{mt: 2, mb: 1, fontWeight: 'bold'}}>Tax Calculation:</Typography>
                    {calcData.slabBreakdown.map((slab, index) => (
                       <SummaryRow key={index} label={slab.text} value={slab.amount} />
                    ))}

                    <SummaryRow label="Total Income Tax" value={formatCurrency(calcData.taxBeforeCess)} bold />
                    <SummaryRow label="Add: Health & Education Cess (4%)" value={formatCurrency(calcData.cess)} />
                    <SummaryRow label="Total Tax Liability" value={formatCurrency(calcData.annualTax)} bold />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mt: 'auto' }}>
                    Take Home: {formatCurrency(netTakeHome)}
                </Typography>
            </Paper>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Button startIcon={<ArrowBackIcon />} onClick={onBack}>Back to Salary Details</Button>
            </Box>
            <Typography variant="h4" gutterBottom>Tax Regime Comparison for FY {financialYear}</Typography>
            <Grid container spacing={3}>
                 <Grid item xs={12} md={6}>
                    <TaxCalculationCard
                        title="Old Regime"
                        calcData={oldRegimeCalc}
                        isRecommended={isOldRegimeRecommended}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                     <TaxCalculationCard
                        title="New Regime"
                        calcData={newRegimeCalc}
                        isRecommended={!isOldRegimeRecommended}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

function EmployeeProfileView({ employee, onBack, onEdit, showEditButton = false, financialYear, settings }) {
    const [showTaxComparison, setShowTaxComparison] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = new Date().getFullYear();

    if (employee.resignationDate) { return ( <Box><Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button><Paper sx={{p: 4, textAlign: 'center'}}><Typography variant="h5">{employee.name} has resigned.</Typography><Typography>Resignation Date: {employee.resignationDate}</Typography></Paper></Box> ); }
    if (!employee.onPayroll) { return ( <Box><Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button><Paper sx={{p: 4, textAlign: 'center'}}><Typography variant="h5">{employee.name} is not on the payroll.</Typography><Button variant="contained" sx={{mt:2}} onClick={() => onEdit(employee)}>Add to Payroll</Button></Paper></Box> ); }

    // Early exit for tax comparison view
    if (showTaxComparison) {
        return <TaxComparisonView employee={employee} financialYear={financialYear} onBack={() => setShowTaxComparison(false)} />;
    }

    const hourlyRate = (employee.allowances?.['Basic'] || 0) / ((settings.workingDaysInMonth || 22) * settings.workingHoursPerDay);

    // --- LOP Calculation ---
    const unpaidLeaveTypeNames = settings.leaveTypes.filter(lt => !lt.isPaid).map(lt => lt.name);
    const monthlyLeaves = (employee.leaves || []).filter(leave => new Date(leave.date).getMonth() === selectedMonth && new Date(leave.date).getFullYear() === year);
    const unpaidHoursInMonth = monthlyLeaves.reduce((acc, leave) => unpaidLeaveTypeNames.includes(leave.type) ? acc + (leave.hours || settings.workingHoursPerDay) : acc, 0);
    const unpaidDaysInMonth = unpaidHoursInMonth / settings.workingHoursPerDay;
    const lossOfPay = unpaidHoursInMonth * hourlyRate;

    // --- Overtime Calculation ---
    const monthlyOvertime = (employee.overtime || []).filter(ot => new Date(ot.date).getMonth() === selectedMonth && new Date(ot.date).getFullYear() === year);
    const overtimeHours = monthlyOvertime.reduce((acc, ot) => acc + (ot.hours || 0), 0);
    const overtimePay = overtimeHours * hourlyRate * (settings.overtimeRateMultiplier || 1.5);

    // --- Main Profile View Calculations ---
    const grossMonthly = Object.values(employee.allowances || {}).reduce((sum, val) => sum + Number(val || 0), 0) + overtimePay;
    const grossAnnual = Object.values(employee.allowances || {}).reduce((sum, val) => sum + Number(val || 0), 0) * 12;

    const totalMonthlyDeductions = Object.values(employee.deductions || {}).reduce((sum, val) => sum + Number(val || 0), 0) + lossOfPay;
    const netMonthlySalary = grossMonthly - totalMonthlyDeductions;

    const earningsRows = settings.allowances.map(a => ({
        label: a.name,
        monthly: formatCurrency(employee.allowances?.[a.name] || 0),
        annually: formatCurrency((employee.allowances?.[a.name] || 0) * 12)
    }));
    earningsRows.push({label: 'Overtime', monthly: formatCurrency(overtimePay), annually: 'N/A'});

    const deductionsRows = settings.deductions.map(d => ({
        label: d.name,
        monthly: formatCurrency(employee.deductions?.[d.name] || 0),
        annually: formatCurrency((employee.deductions?.[d.name] || 0) * 12)
    }));
    deductionsRows.push({label: 'Loss of Pay (LOP)', monthly: formatCurrency(lossOfPay), annually: 'N/A'});


    const SummaryRow = ({ label, value, bold }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="body2" sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{value}</Typography>
        </Box>
    );

    const DisplayTable = ({ title, rows, footerLabel, footerMonthly, footerAnnually }) => (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Component</TableCell>
                            <TableCell align="right">Monthly</TableCell>
                            <TableCell align="right">Annually</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(row => (
                            <TableRow key={row.label}>
                                <TableCell>{row.label}</TableCell>
                                <TableCell align="right">{row.monthly}</TableCell>
                                <TableCell align="right">{row.annually}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{footerLabel}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{footerMonthly}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{footerAnnually}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack}>Back to List</Button>
                <Box>
                    <Button variant="outlined" sx={{mr: 2}} onClick={() => setShowTaxComparison(true)}>Tax Comparison</Button>
                    {showEditButton && <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEdit(employee)}>Edit Employee</Button>}
                </Box>
            </Box>
             <Box sx={{ display: 'flex', overflowX: 'auto', mb: 2, pb: 1 }}>
                {months.map((month, index) => (
                    <Button
                        key={month}
                        onClick={() => setSelectedMonth(index)}
                        variant={selectedMonth === index ? 'contained' : 'outlined'}
                        sx={{ mr: 1, flexShrink: 0 }}
                    >
                        {month} {year}
                    </Button>
                ))}
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <DisplayTable title="Earnings" rows={earningsRows} footerLabel="Gross Earnings" footerMonthly={formatCurrency(grossMonthly)} footerAnnually={formatCurrency(grossAnnual)} />
                    <DisplayTable title="Deductions" rows={deductionsRows} footerLabel="Total Deductions" footerMonthly={formatCurrency(totalMonthlyDeductions)} footerAnnually="N/A" />
                </Grid>

                <Grid item xs={12} md={5}>
                     <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Attendance for {months[selectedMonth]}</Typography>
                        <SummaryRow label="Total Working Days in Month" value={settings.workingDaysInMonth} />
                        <SummaryRow label="Unpaid Leave Days (LOP)" value={unpaidDaysInMonth.toFixed(2)} />
                         <SummaryRow label="Overtime Hours" value={`${overtimeHours.toFixed(2)} hrs`} />
                        <SummaryRow label="Payable Days" value={(settings.workingDaysInMonth - unpaidDaysInMonth).toFixed(2)} bold/>
                    </Paper>
                    <Paper sx={{ p: 2, mt: 3, backgroundColor: 'primary.main', color: 'white' }}>
                        <Typography variant="h6">Take Home Salary for {months[selectedMonth]}</Typography>
                        <SummaryRow label="Monthly Take Home" value={formatCurrency(netMonthlySalary)} bold />
                        <Typography variant="caption" sx={{mt: 1, display: 'block'}}>Annual salary figures do not include variable monthly deductions like LOP.</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}


function RunPayroll({ employees, onBack, onEdit, onRunPayroll, settings }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const activeEmployees = employees.filter(emp => !emp.resignationDate && emp.onPayroll);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelecteds = activeEmployees.map((n) => n.id);
            setSelectedEmployees(newSelecteds);
            return;
        }
        setSelectedEmployees([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selectedEmployees.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedEmployees, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedEmployees.slice(1));
        } else if (selectedIndex === selectedEmployees.length - 1) {
            newSelected = newSelected.concat(selectedEmployees.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedEmployees.slice(0, selectedIndex),
                selectedEmployees.slice(selectedIndex + 1),
            );
        }
        setSelectedEmployees(newSelected);
    };

    const isSelected = (id) => selectedEmployees.indexOf(id) !== -1;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handleRunPayrollClick = (withBookEntry) => {
        const payrollData = activeEmployees
            .filter(emp => selectedEmployees.includes(emp.id))
            .map(emp => {
                const hourlyRate = (emp.allowances?.['Basic'] || 0) / ((settings.workingDaysInMonth || 22) * settings.workingHoursPerDay);

                // LOP
                const unpaidLeaveTypeNames = settings.leaveTypes.filter(lt => !lt.isPaid).map(lt => lt.name);
                const monthlyLeaves = (emp.leaves || []).filter(leave => new Date(leave.date).getMonth() === selectedMonth && new Date(leave.date).getFullYear() === new Date().getFullYear());
                const unpaidHoursInMonth = monthlyLeaves.reduce((acc, leave) => unpaidLeaveTypeNames.includes(leave.type) ? acc + (leave.hours || settings.workingHoursPerDay) : acc, 0);
                const lossOfPay = unpaidHoursInMonth * hourlyRate;

                // Overtime
                const monthlyOvertime = (emp.overtime || []).filter(ot => new Date(ot.date).getMonth() === selectedMonth && new Date(ot.date).getFullYear() === new Date().getFullYear());
                const overtimeHours = monthlyOvertime.reduce((acc, ot) => acc + (ot.hours || 0), 0);
                const overtimePay = overtimeHours * hourlyRate * (settings.overtimeRateMultiplier || 1.5);

                const totalAllowances = Object.values(emp.allowances || {}).reduce((sum, val) => sum + Number(val||0), 0);
                const totalDeductions = Object.values(emp.deductions || {}).reduce((sum, val) => sum + Number(val||0), 0);

                let grossPay = totalAllowances + overtimePay - lossOfPay + (emp.reimbursementAmount || 0);
                let netPay = grossPay - totalDeductions;

                return { ...emp, grossPay, netPay, lossOfPay, overtimePay, paymentStatus: 'Pending' };
            });
        onRunPayroll(selectedMonth, payrollData, withBookEntry);
    };


    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to Main List</Button>

            <Box sx={{ display: 'flex', overflowX: 'auto', mb: 2, pb: 1 }}>
                {months.map((month, index) => (
                    <Button
                        key={month}
                        onClick={() => setSelectedMonth(index)}
                        variant={selectedMonth === index ? 'contained' : 'outlined'}
                        sx={{ mr: 1, flexShrink: 0 }}
                    >
                        {month} {new Date().getFullYear()}
                    </Button>
                ))}
            </Box>

            <Paper>
                <Box sx={{p: 2}}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Run payroll for {months[selectedMonth]}</Typography>
                    <Typography>{activeEmployees.length} active employees.</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < activeEmployees.length}
                                        checked={activeEmployees.length > 0 && selectedEmployees.length === activeEmployees.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Gross Pay</TableCell>
                                <TableCell>Reimbursement</TableCell>
                                <TableCell>Deductions</TableCell>
                                <TableCell>Net Pay</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activeEmployees.map(emp => {
                                const isItemSelected = isSelected(emp.id);

                                 const hourlyRate = (emp.allowances?.['Basic'] || 0) / ((settings.workingDaysInMonth || 22) * settings.workingHoursPerDay);
                                const unpaidLeaveTypeNames = settings.leaveTypes.filter(lt => !lt.isPaid).map(lt => lt.name);
                                const monthlyLeaves = (emp.leaves || []).filter(leave => new Date(leave.date).getMonth() === selectedMonth && new Date(leave.date).getFullYear() === new Date().getFullYear());
                                const unpaidHoursInMonth = monthlyLeaves.reduce((acc, leave) => unpaidLeaveTypeNames.includes(leave.type) ? acc + (leave.hours || settings.workingHoursPerDay) : acc, 0);
                                const lossOfPay = unpaidHoursInMonth * hourlyRate;

                                const monthlyOvertime = (emp.overtime || []).filter(ot => new Date(ot.date).getMonth() === selectedMonth && new Date(ot.date).getFullYear() === new Date().getFullYear());
                                const overtimeHours = monthlyOvertime.reduce((acc, ot) => acc + (ot.hours || 0), 0);
                                const overtimePay = overtimeHours * hourlyRate * (settings.overtimeRateMultiplier || 1.5);

                                const totalAllowances = Object.values(emp.allowances || {}).reduce((sum, val) => sum + Number(val||0), 0);
                                const totalDeductions = Object.values(emp.deductions || {}).reduce((sum, val) => sum + Number(val||0), 0);

                                let grossPay = totalAllowances + overtimePay - lossOfPay + (emp.reimbursementAmount || 0);
                                let netPay = grossPay - totalDeductions;


                                return (
                                    <TableRow key={emp.id} hover onClick={(event) => handleClick(event, emp.id)} role="checkbox" aria-checked={isItemSelected} selected={isItemSelected}>
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isItemSelected} />
                                        </TableCell>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell>{formatCurrency(grossPay)}</TableCell>
                                        <TableCell>{formatCurrency(emp.reimbursementAmount)}</TableCell>
                                        <TableCell>{formatCurrency(totalDeductions)}</TableCell>
                                        <TableCell>{formatCurrency(netPay)}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(emp); }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                 <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" disabled={selectedEmployees.length === 0} onClick={() => handleRunPayrollClick(false)}>
                        Run Payroll without Book Entry
                    </Button>
                    <Button variant="contained" disabled={selectedEmployees.length === 0} onClick={() => handleRunPayrollClick(true)}>
                        Run Payroll with Book Entry
                    </Button>
                </Box>
            </Paper>
        </Box>
    )
}


function EmployeeReport({employee, onBack}) {
    const commissionData = [{ name: 'Jan 25', Commission: 32000, Bonus: 15000 }, { name: 'Feb 25', Commission: 50000, Bonus: 10000 }, { name: 'Mar 25', Commission: 24000, Bonus: 15000 }, { name: 'Apr 25', Commission: 38000, Bonus: 15000 },];
    const leaveData = [{ name: 'Jan 25', Availed: 2, Balance: 1 }, { name: 'Feb 25', Availed: 12, Balance: 2 }, { name: 'Mar 25', Availed: 3, Balance: 1 }, { name: 'Apr 25', Availed: 4, Balance: 5 },];
    const InfoCard = ({title, value, children}) => ( <Grid item xs={12} sm={6} md={3}><Paper sx={{p: 2, backgroundColor: 'info.main', height: '100%'}}><Typography variant="subtitle2" color="text.secondary">{title}</Typography>{value && <Typography variant="h6" sx={{fontWeight: 'bold'}}>{value}</Typography>}{children}</Paper></Grid> );
    const ChartCard = ({title, data, children}) => ( <Grid item xs={12} md={6}><Paper sx={{p: 2, height: '350px'}}><Typography variant="h6" sx={{mb: 2}}>{title}</Typography><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></Paper></Grid> );
    return (
        <Box>
             <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button>
             <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>{employee.name}</Typography>
             <Grid container spacing={3}>
                <InfoCard title="Employee No." value={employee.employeeId} />
                <InfoCard title="Joining Date" value={new Date(employee.dateOfJoining).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})} />
                <InfoCard title="Bank Details"><Typography sx={{fontWeight: 'bold'}}>{employee.bankDetails.bankName}</Typography><Typography>Account no: {employee.bankDetails.accountNo}</Typography><Typography>IFSC Code: {employee.bankDetails.ifsc}</Typography></InfoCard>
                <InfoCard title="Download Payslip"><Typography>Select Period</Typography><TextField type="month" size="small" fullWidth sx={{my: 0.5}} InputLabelProps={{ shrink: true }}/><TextField type="month" size="small" fullWidth sx={{my: 0.5}} InputLabelProps={{ shrink: true }}/><Button variant="contained" fullWidth>Download</Button></InfoCard>
                <InfoCard title="Outstanding Payment" value={formatCurrency(employee.outstandingPayment)} /><InfoCard title="PF No." value={employee.pfNo} />
                <ChartCard title="Commission and Bonus"><BarChart data={commissionData} margin={{ top: 5, right: 20, left: -10, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" angle={-45} textAnchor="end" height={60} /><YAxis /><Tooltip /><Legend verticalAlign="top" wrapperStyle={{top: -5}} /><Bar dataKey="Commission" fill="#8884d8" /><Bar dataKey="Bonus" fill="#82ca9d" /></BarChart></ChartCard>
                <ChartCard title="Leave Status"><BarChart data={leaveData} margin={{ top: 5, right: 20, left: -10, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" angle={-45} textAnchor="end" height={60}/><YAxis /><Tooltip /><Legend verticalAlign="top" wrapperStyle={{top: -5}} /><Bar dataKey="Availed" fill="#8884d8" /><Bar dataKey="Balance" fill="#82ca9d" /></BarChart></ChartCard>
             </Grid>
        </Box>
    )
}

function LeaveRegister({ employees, onBack, onUpdateLeaves, settings }) {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // Start with June 2025
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLeave, setNewLeave] = useState({ employeeId: '', date: '', type: '', hours: '' });

    // Computed property to check if the selected leave type in the modal is paid
    const isSelectedLeavePaid = settings.leaveTypes.find(lt => lt.name === newLeave.type)?.isPaid;

    useEffect(() => {
        // Set a default leave type when the modal opens if one isn't set
        if (isModalOpen && !newLeave.type && settings.leaveTypes.length > 0) {
            setNewLeave(prev => ({ ...prev, type: settings.leaveTypes[0].name, hours: '' }));
        }
    }, [isModalOpen, newLeave.type, settings.leaveTypes]);

    const handleMonthChange = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleOpenModal = (employeeId = '', date = '') => {
        const defaultType = settings.leaveTypes.length > 0 ? settings.leaveTypes[0].name : '';
        setNewLeave({ employeeId, date, type: defaultType, hours: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveLeave = () => {
        if (newLeave.employeeId && newLeave.date && newLeave.type) {
            const leaveData = {
                employeeId: newLeave.employeeId,
                date: newLeave.date,
                type: newLeave.type,
            };
            // Only add hours if it's a paid leave and hours are entered
            if (isSelectedLeavePaid && newLeave.hours) {
                leaveData.hours = parseFloat(newLeave.hours);
            }
            onUpdateLeaves(leaveData);
            handleCloseModal();
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const LegendItem = ({ color, label }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color }} />
            <Typography variant="body2">{label}</Typography>
        </Box>
    );

    const calculateLeaveTotals = (employeeLeaves) => {
        return employeeLeaves.reduce((acc, leave) => {
            const leaveDate = new Date(leave.date);
            const leaveTypeDetails = settings.leaveTypes.find(lt => lt.name === leave.type);

            if(leaveDate.getMonth() === month && leaveDate.getFullYear() === year && leaveTypeDetails) {
                 if (leave.hours) {
                    acc.total += leave.hours / settings.workingHoursPerDay;
                } else if(leave.type !== 'Holiday') { // Don't count holidays in total
                    acc.total += 1;
                }

                // Increment specific leave type counters
                if(!acc[leave.type]) acc[leave.type] = 0;
                acc[leave.type] += leave.hours ? (leave.hours / settings.workingHoursPerDay) : 1;
            }
            return acc;
        }, {total: 0});
    }

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack}>Back to Dashboard</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Add Leave Entry</Button>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, gap: 2}}>
                <IconButton onClick={() => handleMonthChange(-1)}><ChevronLeftIcon /></IconButton>
                <Typography variant="h5" sx={{minWidth: '200px', textAlign: 'center'}}>{monthName} {year}</Typography>
                <IconButton onClick={() => handleMonthChange(1)}><ChevronRightIcon /></IconButton>
            </Box>
             <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 2, flexWrap: 'wrap' }}>
                {settings.leaveTypes.map(lt => (
                    <LegendItem key={lt.name} color={lt.color} label={lt.name} />
                ))}
            </Box>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 120, borderRight: '1px solid #ddd', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>Employee</TableCell>
                            {[...Array(daysInMonth)].map((_, day) => <TableCell key={day} align="center" sx={{p:1}}>{day + 1}</TableCell>)}
                            <TableCell align="center" sx={{borderLeft: '1px solid #ddd'}}>Total Days</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map(emp => {
                             const totals = calculateLeaveTotals(emp.leaves);
                            return(
                            <TableRow key={emp.id}>
                                <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>{emp.name}</TableCell>
                                {[...Array(daysInMonth)].map((_, day) => {
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                                    const leave = emp.leaves.find(l => l.date === dateStr);
                                    const leaveTypeDetails = leave ? settings.leaveTypes.find(lt => lt.name === leave.type) : null;

                                    return (
                                        <TableCell
                                            key={day}
                                            align="center"
                                            sx={{
                                                backgroundColor: leaveTypeDetails ? leaveTypeDetails.color : 'inherit',
                                                p: 1,
                                                border: '1px solid #eee',
                                                cursor: leave ? 'not-allowed' : 'pointer'
                                            }}
                                            onClick={() => !leave && handleOpenModal(emp.id, dateStr)}
                                        >
                                          {leave && leave.hours ? `${leave.hours}h` : ''}
                                        </TableCell>
                                    );
                                })}
                                 <TableCell align="center" sx={{borderLeft: '1px solid #ddd', fontWeight: 'bold'}}>{totals.total.toFixed(2)}</TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Add Leave Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Add New Leave Entry</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Employee</InputLabel>
                        <Select
                            value={newLeave.employeeId}
                            readOnly={!!newLeave.employeeId}
                            onChange={(e) => setNewLeave(prev => ({ ...prev, employeeId: e.target.value }))}
                        >
                            {employees.map(emp => (
                                <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="Date"
                        type="date"
                        fullWidth
                        value={newLeave.date}
                        InputProps={{
                            readOnly: !!newLeave.date,
                        }}
                        onChange={(e) => setNewLeave(prev => ({ ...prev, date: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                            value={newLeave.type}
                            onChange={(e) => setNewLeave(prev => ({ ...prev, type: e.target.value, hours: '' }))} // Reset hours on type change
                        >
                             {settings.leaveTypes.map(lt => (
                                <MenuItem key={lt.name} value={lt.name}>{lt.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {isSelectedLeavePaid && (
                         <TextField
                            margin="dense"
                            label="Hours (optional)"
                            type="number"
                            fullWidth
                            value={newLeave.hours}
                            onChange={(e) => setNewLeave(prev => ({ ...prev, hours: e.target.value }))}
                            helperText={`Leave empty for a full day (${settings.workingHoursPerDay} hours).`}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSaveLeave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function OvertimeRegister({ employees, onBack, onUpdateOvertime, settings }) {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newOvertime, setNewOvertime] = useState({ employeeId: '', date: '', hours: '' });

    const handleMonthChange = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleOpenModal = (employeeId = '', date = '') => {
        setNewOvertime({ employeeId, date, hours: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveOvertime = () => {
        if (newOvertime.employeeId && newOvertime.date && newOvertime.hours) {
            onUpdateOvertime({
                 ...newOvertime,
                 hours: parseFloat(newOvertime.hours)
            });
            handleCloseModal();
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack}>Back to Dashboard</Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>Add Overtime Entry</Button>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, gap: 2}}>
                <IconButton onClick={() => handleMonthChange(-1)}><ChevronLeftIcon /></IconButton>
                <Typography variant="h5" sx={{minWidth: '200px', textAlign: 'center'}}>{monthName} {year}</Typography>
                <IconButton onClick={() => handleMonthChange(1)}><ChevronRightIcon /></IconButton>
            </Box>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 120, borderRight: '1px solid #ddd', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>Employee</TableCell>
                            {[...Array(daysInMonth)].map((_, day) => <TableCell key={day} align="center" sx={{p:1}}>{day + 1}</TableCell>)}
                            <TableCell align="center" sx={{borderLeft: '1px solid #ddd'}}>Total Hours</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map(emp => {
                             const totalHours = (emp.overtime || []).reduce((acc, ot) => {
                                const otDate = new Date(ot.date);
                                if (otDate.getMonth() === month && otDate.getFullYear() === year) {
                                    return acc + ot.hours;
                                }
                                return acc;
                             }, 0);
                            return(
                            <TableRow key={emp.id}>
                                <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd', position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>{emp.name}</TableCell>
                                {[...Array(daysInMonth)].map((_, day) => {
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                                    const overtime = (emp.overtime || []).find(l => l.date === dateStr);
                                    return (
                                        <TableCell
                                            key={day}
                                            align="center"
                                            sx={{ p: 1, border: '1px solid #eee', cursor: 'pointer', backgroundColor: overtime ? '#e8f5e9' : 'inherit' }}
                                            onClick={() => handleOpenModal(emp.id, dateStr)}
                                        >
                                          {overtime ? `${overtime.hours}h` : ''}
                                        </TableCell>
                                    );
                                })}
                                 <TableCell align="center" sx={{borderLeft: '1px solid #ddd', fontWeight: 'bold'}}>{totalHours.toFixed(2)}</TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Add Overtime Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Add Overtime Entry</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Employee</InputLabel>
                        <Select value={newOvertime.employeeId} readOnly={!!newOvertime.employeeId} onChange={(e) => setNewOvertime(prev => ({ ...prev, employeeId: e.target.value }))}>
                            {employees.map(emp => (<MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField margin="dense" label="Date" type="date" fullWidth value={newOvertime.date} InputProps={{readOnly: !!newOvertime.date}} onChange={(e) => setNewOvertime(prev => ({ ...prev, date: e.target.value }))} InputLabelProps={{ shrink: true }} />
                    <TextField margin="dense" label="Hours" type="number" fullWidth value={newOvertime.hours} onChange={(e) => setNewOvertime(prev => ({ ...prev, hours: e.target.value }))} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSaveOvertime} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}


function PayrollHistory({ history, employees, onBack, onViewPayslip, onMakePayment, settings }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthHistory = history[selectedMonth] || [];

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to Main List</Button>

            <Box sx={{ display: 'flex', overflowX: 'auto', mb: 2, pb: 1 }}>
                {months.map((month, index) => (
                    <Button
                        key={month}
                        onClick={() => setSelectedMonth(index)}
                        variant={selectedMonth === index ? 'contained' : 'outlined'}
                        sx={{ mr: 1, flexShrink: 0 }}
                    >
                        {month} {new Date().getFullYear()}
                    </Button>
                ))}
            </Box>

            <Paper>
                <Box sx={{p: 2}}>
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Payroll History for {months[selectedMonth]}</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Net Pay</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                             {monthHistory.length > 0 ? monthHistory.map(record => {
                                const employeeDetails = employees.find(e => e.id === record.id);
                                return (
                                    <TableRow key={record.id}>
                                        <TableCell>{employeeDetails?.name}</TableCell>
                                        <TableCell>{formatCurrency(record.netPay)}</TableCell>
                                        <TableCell>
                                            <Chip label={record.paymentStatus || 'Pending'} color={record.paymentStatus === 'Paid' ? 'success' : 'warning'} size="small"/>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button size="small" variant="outlined" sx={{mr: 1}} onClick={() => onViewPayslip(employeeDetails)}>View Details</Button>
                                            <Button size="small" variant="contained" disabled={record.paymentStatus === 'Paid'} onClick={() => onMakePayment(selectedMonth, record.id)}>
                                                Make Payment
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                             }) : (
                               <TableRow>
                                    <TableCell colSpan={4} align="center">No payroll history for this month.</TableCell>
                               </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    )
}

function Settings({ settings, onSettingsChange, onBack }) {
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLeaveTypeChange = (index, field, value) => {
        const updatedLeaveTypes = [...localSettings.leaveTypes];
        updatedLeaveTypes[index][field] = value;
        setLocalSettings(prev => ({ ...prev, leaveTypes: updatedLeaveTypes }));
    };

    const handleAddLeaveType = () => {
        const newLeaveTypes = [...localSettings.leaveTypes, { name: '', color: '#cccccc', isPaid: false }];
        setLocalSettings(prev => ({...prev, leaveTypes: newLeaveTypes}));
    };

    const handleRemoveLeaveType = (index) => {
        const updatedLeaveTypes = localSettings.leaveTypes.filter((_, i) => i !== index);
        setLocalSettings(prev => ({...prev, leaveTypes: updatedLeaveTypes}));
    };

    const handleSaveChanges = () => {
        onSettingsChange(localSettings);
        alert('Settings saved!');
    };
    const handlePayrollComponentChange = (index, field, value, type) => {
        const updatedComponents = [...localSettings[type]];
        updatedComponents[index][field] = value;
        setLocalSettings(prev => ({ ...prev, [type]: updatedComponents }));
    };

    const handleAddPayrollComponent = (type) => {
        const newComponent = { name: '', ledger: '' };
        setLocalSettings(prev => ({...prev, [type]: [...prev[type], newComponent]}));
    };

    const handleRemovePayrollComponent = (index, type) => {
        const updatedComponents = localSettings[type].filter((_, i) => i !== index);
        setLocalSettings(prev => ({...prev, [type]: updatedComponents}));
    };


    const PayrollComponentManager = ({ title, type }) => (
        <Box>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>{title}</Typography>
            {localSettings[type].map((component, index) => (
                <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                    <Grid item xs={5}>
                        <TextField fullWidth size="small" label="Name" value={component.name} onChange={(e) => handlePayrollComponentChange(index, 'name', e.target.value, type)} />
                    </Grid>
                    <Grid item xs={5}>
                        <TextField fullWidth size="small" label="Ledger Account" value={component.ledger} onChange={(e) => handlePayrollComponentChange(index, 'ledger', e.target.value, type)} />
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton onClick={() => handleRemovePayrollComponent(index, type)}><DeleteIcon /></IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => handleAddPayrollComponent(type)} sx={{ mt: 1 }}>
                Add {title.slice(0, -1)}
            </Button>
        </Box>
    );


    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to Dashboard</Button>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Company Settings</Typography>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Working Rules</Typography>
                <TextField label="Working Hours per Day" type="number" name="workingHoursPerDay" value={localSettings.workingHoursPerDay || 8} onChange={handleChange} fullWidth sx={{mb: 2, maxWidth: 400}} />
                <TextField label="Working Days in a Month" type="number" name="workingDaysInMonth" value={localSettings.workingDaysInMonth || 22} onChange={handleChange} fullWidth sx={{mb: 2, maxWidth: 400}}/>
                <TextField label="Overtime Rate Multiplier (e.g., 1.5 for 1.5x)" type="number" name="overtimeRateMultiplier" value={localSettings.overtimeRateMultiplier || 1.5} onChange={handleChange} fullWidth sx={{maxWidth: 400}}/>


                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Leave Types</Typography>
                {localSettings.leaveTypes.map((leaveType, index) => (
                    <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth size="small" label="Leave Name" value={leaveType.name} onChange={(e) => handleLeaveTypeChange(index, 'name', e.target.value)} />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                             <TextField fullWidth size="small" label="Color" type="color" value={leaveType.color} onChange={(e) => handleLeaveTypeChange(index, 'color', e.target.value)} sx={{ '& .MuiInputBase-input': {height: '40px'} }} />
                        </Grid>
                         <Grid item xs={6} sm={4}>
                             <FormControlLabel control={<Switch checked={leaveType.isPaid} onChange={(e) => handleLeaveTypeChange(index, 'isPaid', e.target.checked)} />} label="Is a Paid Leave" />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{textAlign: 'right'}}>
                            <IconButton onClick={() => handleRemoveLeaveType(index)}><DeleteIcon /></IconButton>
                        </Grid>
                    </Grid>
                ))}
                 <Button startIcon={<AddIcon />} onClick={handleAddLeaveType} sx={{ mt: 1 }}>
                    Add Leave Type
                </Button>

                <PayrollComponentManager title="Allowances" type="allowances" />
                <PayrollComponentManager title="Deductions" type="deductions" />
                <PayrollComponentManager title="Other Earnings" type="otherEarnings" />

            </Paper>
             <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={handleSaveChanges}>Save Settings</Button>
        </Box>
    );
}

// Main App component with updated logic
export default function App() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [view, setView] = useState('dashboard');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [payrollHistory, setPayrollHistory] = useState({});
    const [financialYear, setFinancialYear] = useState('2025-2026');
    const [settings, setSettings] = useState({
        workingHoursPerDay: 8,
        workingDaysInMonth: 22,
        overtimeRateMultiplier: 1.5,
        leaveTypes: [
            { name: 'Holiday', color: '#88d8b0', isPaid: true },
            { name: 'Personal Leave', color: '#ff6f69', isPaid: true },
            { name: 'Sick Leave', color: '#ffcc5c', isPaid: true },
            { name: 'Leave without Pay', color: '#cccccc', isPaid: false },
        ],
        allowances: [
            { name: 'Basic', ledger: 'Basic Salary Expense' },
            { name: 'House Rent Allowance', ledger: 'HRA Expense' },
            { name: 'Conveyance Allowance', ledger: 'Conveyance Expense' },
            { name: 'Fixed Allowance', ledger: 'Fixed Allowance Expense' },
            { name: 'Transport Allowance', ledger: 'Transport Allowance Expense' },
        ],
        deductions: [
            { name: 'TDS', ledger: 'TDS Payable' },
            { name: 'EPF', ledger: 'EPF Payable' },
            { name: 'ESI', ledger: 'ESI Payable' },
            { name: 'Professional Tax', ledger: 'Professional Tax Payable' },
            { name: 'Canteen', ledger: 'Canteen Deduction' },
        ],
        otherEarnings: [
            { name: 'Overtime', ledger: 'Overtime Expense' },
            { name: 'Leave Encashment', ledger: 'Leave Salary Expense' }
        ]
    });

    const handleSettingsChange = (newSettings) => {
        setSettings(newSettings);
    };

    const handleNavigate = (targetView, employee) => {
        setSelectedEmployee(employee);
        setView(targetView.replace(/ /g, '').toLowerCase());
    };

    const handleBackToList = () => {
        setSelectedEmployee(null);
        const currentMainView = view.includes('runpayroll') || view.includes('payrollhistory') ? view : 'employees';
        setView(currentMainView);
    };

    const handleHeaderNavigate = (target) => {
        setView(target.replace(/ /g, '').toLowerCase());
        setSelectedEmployee(null);
    };

    const handleAddToPayroll = (employee) => {
        const newEmployeeTemplate = {
            ...employee,
            onPayroll: true,
            annualCTC: 0,
            allowances: {},
            deductions: {},
            reimbursementEnabled: false, isSalesAgent: false, notes: '', resignationDate: null,
            outstandingPayment: 0, pfNo: '', bankDetails: { bankName: '', accountNo: '', ifsc: '' },
            panAadhaar: '', esicNumber: '', payPeriod: 'Monthly', workLocation: '',
            declarations: {}, leaves: [], overtime: [], reimbursementStatus: 'No Reimbursement', reimbursementAmount: 0,
        };
        handleNavigate('edit', newEmployeeTemplate);
    };

    const handleSaveEmployee = (formData) => {
        if (employees.find(e => e.id === formData.id)) {
            const updatedEmployees = employees.map(emp => (emp.id === formData.id ? formData : emp));
            setEmployees(updatedEmployees);
        } else {
            const newEmployeeData = { ...formData, id: Date.now() };
            setEmployees(prev => [...prev, newEmployeeData]);
        }
        setView('employees');
        setSelectedEmployee(null);
    };


    const handleSaveDeclaration = (declarationData) => {
        setEmployees(emps => emps.map(emp => emp.id === selectedEmployee.id ? { ...emp, declarations: declarationData } : emp));
        setView('employees');
        setSelectedEmployee(null);
    };

    const handleDeleteEmployee = (id) => setEmployees(employees.filter(emp => emp.id !== id));

    const handleUpdateLeaves = (newLeaveData) => {
        setEmployees(prevEmployees => {
            return prevEmployees.map(emp => {
                if (emp.id === newLeaveData.employeeId) {
                    const updatedLeaves = [...(emp.leaves || [])];
                    const existingLeaveIndex = updatedLeaves.findIndex(l => l.date === newLeaveData.date);
                    if (existingLeaveIndex > -1) {
                        updatedLeaves[existingLeaveIndex] = { ...updatedLeaves[existingLeaveIndex], ...newLeaveData};
                    } else {
                        updatedLeaves.push(newLeaveData);
                    }
                    return { ...emp, leaves: updatedLeaves };
                }
                return emp;
            });
        });
    };

    const handleUpdateOvertime = (newOvertimeData) => {
         setEmployees(prevEmployees => {
            return prevEmployees.map(emp => {
                if (emp.id === newOvertimeData.employeeId) {
                    const updatedOvertime = [...(emp.overtime || [])];
                    const existingIndex = updatedOvertime.findIndex(ot => ot.date === newOvertimeData.date);
                    if (existingIndex > -1) {
                        updatedOvertime[existingIndex] = { ...updatedOvertime[existingIndex], ...newOvertimeData};
                    } else {
                        updatedOvertime.push(newOvertimeData);
                    }
                    return { ...emp, overtime: updatedOvertime };
                }
                return emp;
            });
        });
    };

    const handleRunPayroll = (month, payrollData, withBookEntry) => {
        setPayrollHistory(prev => ({
            ...prev,
            [month]: payrollData
        }));

        if (withBookEntry) {
            const journalEntry = { debits: [], credits: [] };
            const creditTotals = {};
            const debitTotals = {};

            payrollData.forEach(emp => {
                // Process Allowances
                settings.allowances.forEach(allowance => {
                    const amount = emp.allowances?.[allowance.name] || 0;
                    if (amount > 0) {
                        if (!debitTotals[allowance.ledger]) debitTotals[allowance.ledger] = 0;
                        debitTotals[allowance.ledger] += amount;
                    }
                });

                // Process Other Earnings (Overtime)
                const overtimeLedger = settings.otherEarnings.find(e => e.name === 'Overtime')?.ledger;
                if (overtimeLedger && emp.overtimePay > 0) {
                    if (!debitTotals[overtimeLedger]) debitTotals[overtimeLedger] = 0;
                    debitTotals[overtimeLedger] += emp.overtimePay;
                }
                 // Process Reimbursement
                const reimbursementLedger = settings.otherEarnings.find(e => e.name === 'Reimbursement')?.ledger;
                if (reimbursementLedger && emp.reimbursementAmount > 0) {
                    if (!debitTotals[reimbursementLedger]) debitTotals[reimbursementLedger] = 0;
                    debitTotals[reimbursementLedger] += emp.reimbursementAmount;
                }

                // Process Deductions
                settings.deductions.forEach(deduction => {
                    const amount = emp.deductions?.[deduction.name] || 0;
                    if (amount > 0) {
                        if (!creditTotals[deduction.ledger]) creditTotals[deduction.ledger] = 0;
                        creditTotals[deduction.ledger] += amount;
                    }
                });
            });

            journalEntry.debits = Object.keys(debitTotals).map(ledger => ({ account: ledger, amount: debitTotals[ledger] }));
            journalEntry.credits = Object.keys(creditTotals).map(ledger => ({ account: ledger, amount: creditTotals[ledger] }));

            const totalDebits = journalEntry.debits.reduce((sum, item) => sum + item.amount, 0);
            const totalCredits = journalEntry.credits.reduce((sum, item) => sum + item.amount, 0);
            journalEntry.credits.push({ account: 'Salary Payable', amount: totalDebits - totalCredits });

            console.log("Generated Journal Entry:", journalEntry);
        }

        alert(`Payroll run for ${new Date(0, month).toLocaleString('default', { month: 'long' })} was successful!`);
        setView('payrollhistory');
    };

    const handleMakePayment = (month, employeeId) => {
        // Update payroll history
        setPayrollHistory(prev => {
            const monthHistory = prev[month] || [];
            const updatedHistory = monthHistory.map(rec =>
                rec.id === employeeId ? {...rec, paymentStatus: 'Paid'} : rec
            );
            return {...prev, [month]: updatedHistory};
        });

        // Generate Journal Entry
        const journalEntry = { debits: [], credits: [] };
        const netPay = payrollHistory[month].find(r => r.id === employeeId).netPay;
        journalEntry.debits.push({account: 'Salary Payable', amount: netPay});
        journalEntry.credits.push({account: 'Bank Account', amount: netPay});

        console.log("Payment Journal Entry:", journalEntry);
        alert('Payment recorded successfully!');

    };


    const renderContent = () => {
        switch(view) {
            case 'dashboard': return <Dashboard employees={employees} payrollHistory={payrollHistory} />;
            case 'edit': return <EditEmployeeForm employee={selectedEmployee} onSave={handleSaveEmployee} onBack={handleBackToList} settings={settings} />;
            case 'view': return <EmployeeProfileView employee={selectedEmployee} onBack={handleBackToList} onEdit={(emp) => handleNavigate('edit', emp)} showEditButton={true} financialYear={financialYear} settings={settings} />;
            case 'report': return <EmployeeReport employee={selectedEmployee} onBack={handleBackToList} />;
            case 'calculate': return <EmployeeProfileView employee={selectedEmployee} onBack={handleBackToList} onEdit={(emp) => handleNavigate('edit', emp)} showEditButton={true} financialYear={financialYear} settings={settings} />;
            case 'declaration': return <DeclarationForm employee={selectedEmployee} onSave={handleSaveDeclaration} onBack={handleBackToList} />;
            case 'runpayroll': return <RunPayroll employees={employees} onBack={() => setView('dashboard')} onEdit={(emp) => handleNavigate('edit', emp)} onRunPayroll={handleRunPayroll} settings={settings} />;
            case 'leaveregister': return <LeaveRegister employees={employees} onBack={() => setView('dashboard')} onUpdateLeaves={handleUpdateLeaves} settings={settings} />;
            case 'overtimeregister': return <OvertimeRegister employees={employees} onBack={() => setView('dashboard')} onUpdateOvertime={handleUpdateOvertime} settings={settings} />;
            case 'payrollhistory': return <PayrollHistory history={payrollHistory} employees={employees} onBack={() => setView('dashboard')} onViewPayslip={(emp) => handleNavigate('view', emp)} onMakePayment={handleMakePayment} settings={settings}/>;
            case 'settings': return <Settings settings={settings} onSettingsChange={handleSettingsChange} onBack={() => setView('dashboard')} />;
            default:
                return (
                     <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Employee List</Typography>
                        </Box>
                        <EmployeeTable
                            employees={employees}
                            onEdit={(emp) => handleNavigate('edit', emp)}
                            onDelete={handleDeleteEmployee}
                            onShowDeclaration={(emp) => handleNavigate('declaration', emp)}
                            onShowCalculator={(emp) => handleNavigate('calculate', emp)}
                            onShowReport={(emp) => handleNavigate('report', emp)}
                            onAddToPayroll={handleAddToPayroll}
                        />
                        <QuickUploadSection />
                    </Box>
                );
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#FCFCFC' }}>
                <HeaderNavigation currentView={view} onNavigate={handleHeaderNavigate} />
                 <GlobalSettings financialYear={financialYear} onFinancialYearChange={setFinancialYear} />
                {renderContent()}
            </Container>
        </ThemeProvider>
    );
}