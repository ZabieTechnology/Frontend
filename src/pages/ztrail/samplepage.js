import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    createTheme,
    ThemeProvider,
    TextField,
    Grid,
    Chip,
    List,
    ListItem,
    Switch,
    FormControlLabel,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalculateIcon from '@mui/icons-material/Calculate';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


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
        info: {
             main: '#e8f5e9' // A light green for info cards
        },
        leave: {
            holiday: '#88d8b0',
            personal: '#ff6f69',
            sick: '#ffcc5c',
            halfDay: '#fca3b4',
        }
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

// 2. Updated mock data
const initialEmployees = [
    {
        id: 1, name: 'Anil Babu', employeeId: '21406', dateOfJoining: '2025-01-01', gender: 'Male', designation: 'Team Lead', department: 'Sales', mobileNumber: '123-456-7890', email: 'ab@gmail.com', taxRegime: 'Old', annualCTC: 1800000, basic: 80000, houseRentAllowance: 40000, conveyanceAllowance: 1600, fixedAllowance: 20000, transportAllowance: 1600, tdsDeducted: 5000, professionalTax: 200, epf: 1800, reimbursementEnabled: true, isSalesAgent: false, notes: 'This employee is a top performer.', resignationDate: null,
        outstandingPayment: 20000.00, pfNo: 'BN/SHAG/26563/21406', bankDetails: { bankName: 'SBI Bank', accountNo: '10032245566', ifsc: 'SBIN5486' },
        declarations: { epf: 24000, ppf: 50000, elss: 10000, insurance: 12000, nps: 0 },
        leaves: [
            { date: '2025-06-02', type: 'personal' }, { date: '2025-06-07', type: 'holiday' },
            { date: '2025-06-08', type: 'holiday' }, { date: '2025-06-11', type: 'halfDay' },
            { date: '2025-06-12', type: 'personal' }, { date: '2025-06-14', type: 'holiday' },
        ]
    },
    {
        id: 2, name: 'Imtiyaz', employeeId: 'EMP002', dateOfJoining: '2021-11-20', gender: 'Male', designation: 'Product Manager', department: 'Product', mobileNumber: '098-765-4321', email: 'abc@gmail.com', taxRegime: 'New', annualCTC: 2400000, basic: 100000, houseRentAllowance: 50000, conveyanceAllowance: 1600, fixedAllowance: 30000, transportAllowance: 1600, tdsDeducted: 5000, professionalTax: 200, epf: 1800, reimbursementEnabled: false, isSalesAgent: true, notes: '', resignationDate: null,
        outstandingPayment: 15000.00, pfNo: 'BN/SHAG/26563/EMP002', bankDetails: { bankName: 'HDFC Bank', accountNo: '50100234567890', ifsc: 'HDFC0000123' },
        declarations: { epf: 21600, ppf: 0, elss: 0, insurance: 25000, nps: 15000 },
        leaves: [
            { date: '2025-06-04', type: 'sick' }, { date: '2025-06-07', type: 'holiday' },
            { date: '2025-06-08', type: 'holiday' }, { date: '2025-06-09', type: 'personal' },
            { date: '2025-06-10', type: 'personal' }, { date: '2025-06-12', type: 'halfDay' },
            { date: '2025-06-13', type: 'personal' }, { date: '2025-06-14', type: 'holiday' },
        ]
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

const calculateTds = (ctc, regime) => {
    const taxableIncome = ctc - 50000; let tax = 0;
    if (regime === 'New') {
        if (taxableIncome > 1500000) tax = (taxableIncome - 1500000) * 0.30 + 187500;
        else if (taxableIncome > 1200000) tax = (taxableIncome - 1200000) * 0.20 + 125000;
        else if (taxableIncome > 900000) tax = (taxableIncome - 900000) * 0.15 + 75000;
        else if (taxableIncome > 600000) tax = (taxableIncome - 600000) * 0.10 + 30000;
        else if (taxableIncome > 300000) tax = (taxableIncome - 300000) * 0.05;
    } else {
        if (taxableIncome > 1000000) tax = (taxableIncome - 1000000) * 0.30 + 112500;
        else if (taxableIncome > 500000) tax = (taxableIncome - 500000) * 0.20 + 12500;
    }
    const finalTax = tax > 0 ? tax + (tax * 0.04) : 0;
    return Math.round(finalTax / 12);
};

function HeaderNavigation({ currentView, onNavigate }) {
    const navItems = ['Dashboard', 'Employees', 'Leave Register', 'Run Payroll', 'Payroll History'];
    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {navItems.map((item) => {
                const isCurrent = (item.replace(' ', '').toLowerCase() === currentView.replace(' ', '').toLowerCase());
                return ( <Button key={item} variant={isCurrent ? 'contained' : 'text'} color={isCurrent ? 'primary' : 'secondary'} sx={{ backgroundColor: !isCurrent ? '#f5f5f5' : undefined, color: !isCurrent ? 'black' : undefined, '&:hover': { backgroundColor: isCurrent ? '#5a9f73' : '#e0e0e0' } }} onClick={() => onNavigate(item)} >{item}</Button> );
            })}
        </Box>
    );
}

function EmployeeTable({ employees, onEdit, onDelete, onShowDeclaration, onShowCalculator, onShowReport }) {
    return (
        <Paper>
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead><TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Designation</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Annual CTC</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Tax Regime</TableCell><TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                        {employees.map((row) => (
                            <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row" onClick={() => onShowReport(row)} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>{row.name}</TableCell>
                                <TableCell>{row.email}</TableCell><TableCell>{row.designation}</TableCell><TableCell>{row.department}</TableCell><TableCell>{row.resignationDate ? 'Resigned' : formatCurrency(row.annualCTC)}</TableCell>
                                <TableCell><Chip label={row.taxRegime} size="small" color={row.taxRegime === 'Old' ? 'success' : 'warning'} sx={{ color: 'white', fontWeight: 'bold' }} /></TableCell>
                                <TableCell sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => onShowCalculator(row)}><CalculateIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => onShowDeclaration(row)}><DescriptionIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => onEdit(row)}><EditIcon fontSize="small" /></IconButton><IconButton size="small" sx={{ color: 'red' }} onClick={() => onDelete(row.id)}><DeleteIcon fontSize="small" /></IconButton>
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

function EditEmployeeForm({ employee, onSave, onBack }) {
    const [formData, setFormData] = useState(employee);
    const [isPayrollEnabled, setIsPayrollEnabled] = useState(!!employee?.annualCTC);
    const [autoCalculateTDS, setAutoCalculateTDS] = useState(true);

    useEffect(() => {
        if (autoCalculateTDS && isPayrollEnabled) {
            const monthlyTDS = calculateTds(formData.annualCTC, formData.taxRegime);
            setFormData(prev => ({ ...prev, tdsDeducted: monthlyTDS }));
        }
    }, [formData.annualCTC, formData.taxRegime, autoCalculateTDS, isPayrollEnabled]);

    const handleChange = (e) => { const { name, value, checked, type } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
    const handleTaxRegimeChange = (e, newRegime) => { if (newRegime) setFormData(prev => ({ ...prev, taxRegime: newRegime })) };
    const FormRow = ({ label, children }) => ( <Grid item xs={12} container alignItems="center" sx={{ mb: 2 }}><Grid item xs={12} md={4}><Typography variant="body1">{label}</Typography></Grid><Grid item xs={12} md={8}>{children}</Grid></Grid> );
    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button>
            <Paper sx={{ p: 3 }}>
                <FormControlLabel control={<Switch checked={isPayrollEnabled} onChange={(e) => setIsPayrollEnabled(e.target.checked)} />} label="Add Employee to Payroll" sx={{ mb: 3 }} />
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Basic details</Typography>
                        <FormRow label="Employee Name*"><TextField fullWidth size="small" name="name" value={formData.name} onChange={handleChange} /></FormRow>
                        <FormRow label="Employee ID*"><TextField fullWidth size="small" name="employeeId" value={formData.employeeId} onChange={handleChange} /></FormRow>
                        <FormRow label="Date of Joining*"><TextField fullWidth size="small" name="dateOfJoining" type="date" value={formData.dateOfJoining || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></FormRow>
                        {isPayrollEnabled && <FormRow label="Gender*"><TextField fullWidth size="small" name="gender" value={formData.gender} onChange={handleChange} /></FormRow>}
                        <FormRow label="Designation*"><TextField fullWidth size="small" name="designation" value={formData.designation} onChange={handleChange} /></FormRow>
                        <FormRow label="Department*"><TextField fullWidth size="small" name="department" value={formData.department} onChange={handleChange} /></FormRow>
                        <FormRow label="Mobile Number"><TextField fullWidth size="small" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} /></FormRow>
                        <FormRow label="Email"><TextField fullWidth size="small" name="email" type="email" value={formData.email} onChange={handleChange} /></FormRow>
                        <FormRow label="Select Tax Regime"><ToggleButtonGroup value={formData.taxRegime} exclusive onChange={handleTaxRegimeChange} size="small"><ToggleButton value="Old">Old</ToggleButton><ToggleButton value="New">New</ToggleButton></ToggleButtonGroup></FormRow>
                        <FormRow label=""><Box><FormControlLabel control={<Switch name="reimbursementEnabled" checked={formData.reimbursementEnabled} onChange={handleChange} />} label="Reimbursement Claims Enabled" /><FormControlLabel control={<Switch name="isSalesAgent" checked={formData.isSalesAgent} onChange={handleChange} />} label="Is a Sales Agent" /></Box></FormRow>
                        <FormRow label="Resignation Date"><TextField fullWidth size="small" name="resignationDate" type="date" value={formData.resignationDate || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></FormRow>
                    </Grid>
                    {isPayrollEnabled && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Salary details</Typography>
                            <FormRow label="Annual CTC*"><TextField fullWidth size="small" name="annualCTC" type="number" value={formData.annualCTC} onChange={handleChange} /></FormRow>
                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Cost (Monthly)</Typography>
                            <FormRow label="Basic"><TextField fullWidth size="small" name="basic" type="number" value={formData.basic} onChange={handleChange} /></FormRow>
                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Allowances</Typography>
                            <FormRow label="House Rent Allowance"><TextField fullWidth size="small" name="houseRentAllowance" type="number" value={formData.houseRentAllowance} onChange={handleChange} /></FormRow>
                            <FormRow label="Conveyance Allowance"><TextField fullWidth size="small" name="conveyanceAllowance" type="number" value={formData.conveyanceAllowance} onChange={handleChange} /></FormRow>
                            <FormRow label="Fixed Allowance"><TextField fullWidth size="small" name="fixedAllowance" type="number" value={formData.fixedAllowance} onChange={handleChange} /></FormRow>
                            <FormRow label="Transport Allowance"><TextField fullWidth size="small" name="transportAllowance" type="number" value={formData.transportAllowance} onChange={handleChange} /></FormRow>
                            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Deductions</Typography>
                            <FormRow label="TDS Deducted"><Box sx={{display: 'flex', flexDirection: 'column'}}><TextField fullWidth size="small" name="tdsDeducted" type="number" value={formData.tdsDeducted} onChange={handleChange} disabled={autoCalculateTDS} /><FormControlLabel control={<Switch checked={autoCalculateTDS} onChange={(e) => setAutoCalculateTDS(e.target.checked)} />} label="Calculate TDS Automatically" /></Box></FormRow>
                            <FormRow label="Professional tax"><TextField fullWidth size="small" name="professionalTax" type="number" value={formData.professionalTax} onChange={handleChange} /></FormRow>
                            <FormRow label="Employee contribution to EPF"><TextField fullWidth size="small" name="epf" type="number" value={formData.epf} onChange={handleChange} /></FormRow>
                        </Grid>
                    )}
                </Grid>
                 <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={() => onSave(formData)}>Save</Button>
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

function EmployeeProfileView({ employee, onBack, onEdit, showEditButton = false }) {
    if (employee.resignationDate) { return ( <Box><Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to List</Button><Paper sx={{p: 4, textAlign: 'center'}}><Typography variant="h5">{employee.name} has resigned.</Typography><Typography>Resignation Date: {employee.resignationDate}</Typography></Paper></Box> ); }
    const createRow = (label, monthly, annually) => ({ label, monthly, annually });
    const monthlyAllowances = employee.fixedAllowance + employee.conveyanceAllowance + employee.transportAllowance;
    const grossMonthly = employee.basic + employee.houseRentAllowance + monthlyAllowances;
    const grossAnnual = grossMonthly * 12;
    const annualEPF = employee.epf * 12;
    const annualProfTax = employee.professionalTax * 12;
    const totalDeclared80C = Object.values(employee.declarations).reduce((sum, val) => sum + Number(val || 0), 0);
    const applicable80C = Math.min(totalDeclared80C, 150000);
    const standardDeduction = 50000;
    let taxableIncome = grossAnnual - standardDeduction - annualProfTax;
    if (employee.taxRegime === 'Old') taxableIncome -= applicable80C;
    const monthlyTDS = calculateTds(grossAnnual, employee.taxRegime);
    const totalAnnualTax = monthlyTDS * 12;
    const totalAnnualDeductions = totalAnnualTax + annualEPF + annualProfTax;
    const netAnnualSalary = grossAnnual - totalAnnualDeductions;
    const earningsRows = [createRow('Basic', formatCurrency(employee.basic), formatCurrency(employee.basic * 12)), createRow('House Rent Allowance', formatCurrency(employee.houseRentAllowance), formatCurrency(employee.houseRentAllowance * 12)), createRow('Other Allowances', formatCurrency(monthlyAllowances), formatCurrency(monthlyAllowances * 12)),];
    const deductionsRows = [createRow('EPF (Employee)', formatCurrency(employee.epf), formatCurrency(annualEPF)), createRow('Professional Tax', formatCurrency(employee.professionalTax), formatCurrency(annualProfTax)), createRow('Income Tax (TDS)', formatCurrency(monthlyTDS), formatCurrency(totalAnnualTax)),];
    const SummaryRow = ({ label, value, bold }) => (<Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}><Typography sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{label}</Typography><Typography sx={{ fontWeight: bold ? 'bold' : 'normal' }}>{value}</Typography></Box>);
    const DisplayTable = ({ title, rows, footerLabel, footerMonthly, footerAnnually }) => (<Paper sx={{ p: 2, mb: 3 }}><Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography><TableContainer><Table size="small"><TableHead><TableRow><TableCell>Component</TableCell><TableCell align="right">Monthly</TableCell><TableCell align="right">Annually</TableCell></TableRow></TableHead><TableBody>{rows.map(row => (<TableRow key={row.label}><TableCell>{row.label}</TableCell><TableCell align="right">{row.monthly}</TableCell><TableCell align="right">{row.annually}</TableCell></TableRow>))}<TableRow sx={{ backgroundColor: '#f5f5f5' }}><TableCell sx={{ fontWeight: 'bold' }}>{footerLabel}</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>{footerMonthly}</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>{footerAnnually}</TableCell></TableRow></TableBody></Table></TableContainer></Paper>);
    return (<Box><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}><Button startIcon={<ArrowBackIcon />} onClick={onBack}>Back to List</Button>{showEditButton && <Button variant="contained" startIcon={<EditIcon />} onClick={() => onEdit(employee)}>Edit Employee</Button>}</Box><Typography variant="h4" gutterBottom>Salary Details</Typography><Grid container spacing={4}><Grid item xs={12} md={7}><DisplayTable title="Earnings" rows={earningsRows} footerLabel="Gross Earnings" footerMonthly={formatCurrency(grossMonthly)} footerAnnually={formatCurrency(grossAnnual)} /><DisplayTable title="Deductions" rows={deductionsRows} footerLabel="Total Deductions" footerMonthly={formatCurrency(totalAnnualDeductions / 12)} footerAnnually={formatCurrency(totalAnnualDeductions)} /></Grid><Grid item xs={12} md={5}><Paper sx={{ p: 2 }}><Typography variant="h6" gutterBottom>Tax Calculation Summary ({employee.taxRegime} Regime)</Typography><SummaryRow label="Gross Annual Salary" value={formatCurrency(grossAnnual)} /><SummaryRow label="Taxable Income" value={formatCurrency(taxableIncome > 0 ? taxableIncome : 0)} bold /><SummaryRow label="Total Tax Liability" value={formatCurrency(totalAnnualTax)} bold /></Paper><Paper sx={{ p: 2, mt: 3, backgroundColor: 'primary.main', color: 'white' }}><Typography variant="h6">Take Home Salary</Typography><SummaryRow label="Annual Take Home" value={formatCurrency(netAnnualSalary)} bold /><SummaryRow label="Monthly Take Home" value={formatCurrency(netAnnualSalary / 12)} bold /></Paper></Grid></Grid></Box>);
}

function RunPayroll({ employees, onBack }) {
    const activeEmployees = employees.filter(emp => !emp.resignationDate);
    return (<Box><Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to Main List</Button><Paper><Box sx={{p: 2}}><Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Run Payroll</Typography><Typography>Showing {activeEmployees.length} active employees.</Typography></Box><TableContainer><Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Department</TableCell><TableCell align="right">Net Payable</TableCell><TableCell align="center">Actions</TableCell></TableRow></TableHead><TableBody>{activeEmployees.map(emp => {const grossAnnual = emp.annualCTC; const monthlyTDS = calculateTds(grossAnnual, emp.taxRegime); const annualTDS = monthlyTDS * 12; const annualEPF = emp.epf * 12; const annualProfTax = emp.professionalTax * 12; const totalAnnualDeductions = annualTDS + annualEPF + annualProfTax; const netAnnualSalary = grossAnnual - totalAnnualDeductions; return (<TableRow key={emp.id}><TableCell>{emp.name}</TableCell><TableCell>{emp.department}</TableCell><TableCell align="right">{formatCurrency(netAnnualSalary / 12)}</TableCell><TableCell align="center"><Button size="small" variant="contained">Pay</Button></TableCell></TableRow>)})}</TableBody></Table></TableContainer></Paper></Box>)
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

function LeaveRegister({ employees, onBack }) {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // Start with June 2025

    const handleMonthChange = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
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
            if(leaveDate.getMonth() === month && leaveDate.getFullYear() === year) {
                if(leave.type === 'personal') acc.personal += 1;
                if(leave.type === 'sick') acc.sick += 1;
                if(leave.type === 'halfDay') acc.total += 0.5; else if (leave.type !== 'holiday') acc.total +=1;
            }
            return acc;
        }, {total: 0, personal: 0, sick: 0});
    }

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Back to Dashboard</Button>
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, gap: 2}}>
                <IconButton onClick={() => handleMonthChange(-1)}><ChevronLeftIcon /></IconButton>
                <Typography variant="h5" sx={{minWidth: '200px', textAlign: 'center'}}>{monthName} {year}</Typography>
                <IconButton onClick={() => handleMonthChange(1)}><ChevronRightIcon /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 2, flexWrap: 'wrap' }}>
                <LegendItem color={theme.palette.leave.holiday} label="Holiday" />
                <LegendItem color={theme.palette.leave.personal} label="Personal Leave" />
                <LegendItem color={theme.palette.leave.sick} label="Sick Leave" />
                <LegendItem color={theme.palette.leave.halfDay} label="Half Day" />
            </Box>
            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 120, borderRight: '1px solid #ddd' }}>Employee</TableCell>
                            {[...Array(daysInMonth)].map((_, day) => <TableCell key={day} align="center">{day + 1}</TableCell>)}
                            <TableCell align="center" sx={{borderLeft: '1px solid #ddd'}}>Total Leave</TableCell>
                            <TableCell align="center">Personal</TableCell>
                            <TableCell align="center">Sick</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map(emp => {
                            const totals = calculateLeaveTotals(emp.leaves);
                            return(
                            <TableRow key={emp.id}>
                                <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>{emp.name}</TableCell>
                                {[...Array(daysInMonth)].map((_, day) => {
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                                    const leave = emp.leaves.find(l => l.date === dateStr);
                                    return (
                                        <TableCell key={day} align="center" sx={{ backgroundColor: leave ? theme.palette.leave[leave.type] : 'inherit', p: 1, border: '1px solid #eee' }} />
                                    );
                                })}
                                 <TableCell align="center" sx={{borderLeft: '1px solid #ddd'}}>{totals.total}</TableCell>
                                 <TableCell align="center">{totals.personal}</TableCell>
                                 <TableCell align="center">{totals.sick}</TableCell>
                            </TableRow>
                        )})}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

// Main App component with updated logic
export default function App() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [view, setView] = useState('Employees');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleNavigate = (targetView, employee) => {
        setSelectedEmployee(employee);
        setView(targetView.replace(' ', '').toLowerCase());
    };

    const handleBackToList = () => {
        setSelectedEmployee(null);
        setView('employees');
    };

    const handleHeaderNavigate = (target) => {
        setView(target.replace(' ', '').toLowerCase());
        setSelectedEmployee(null);
    };

    const handleSaveEmployee = (formData) => {
        let updatedEmployee;
        if (formData.id) {
            const updatedEmployees = employees.map(emp => {
                if (emp.id === formData.id) {
                    updatedEmployee = formData;
                    return formData;
                }
                return emp;
            });
            setEmployees(updatedEmployees);
        } else {
            updatedEmployee = { ...formData, id: Date.now() };
            setEmployees([...employees, updatedEmployee]);
        }
        handleNavigate('view', updatedEmployee);
    };

    const handleAddNewEmployee = () => {
        const newEmployee = {
            id: null, name: '', employeeId: '', dateOfJoining: '', gender: '', designation: '', department: '', mobileNumber: '', email: '', taxRegime: 'New', declarations: {}, resignationDate: null,
            reimbursementEnabled: false, isSalesAgent: false,
            annualCTC: 0, basic: 0, houseRentAllowance: 0, conveyanceAllowance: 0, fixedAllowance: 0, transportAllowance: 0, professionalTax: 0, epf: 0, tdsDeducted: 0,
            outstandingPayment: 0, pfNo: '', bankDetails: { bankName: '', accountNo: '', ifsc: '' },
            leaves: [],
        };
        handleNavigate('edit', newEmployee);
    };

    const handleSaveDeclaration = (declarationData) => {
        setEmployees(emps => emps.map(emp => emp.id === selectedEmployee.id ? { ...emp, declarations: declarationData } : emp));
        handleBackToList();
    };

    const handleDeleteEmployee = (id) => setEmployees(employees.filter(emp => emp.id !== id));

    const renderContent = () => {
        switch(view) {
            case 'edit': return <EditEmployeeForm employee={selectedEmployee} onSave={handleSaveEmployee} onBack={handleBackToList} />;
            case 'view': return <EmployeeProfileView employee={selectedEmployee} onBack={handleBackToList} onEdit={(emp) => handleNavigate('edit', emp)} showEditButton={true} />;
            case 'report': return <EmployeeReport employee={selectedEmployee} onBack={handleBackToList} />;
            case 'calculate': return <EmployeeProfileView employee={selectedEmployee} onBack={handleBackToList} />;
            case 'declaration': return <DeclarationForm employee={selectedEmployee} onSave={handleSaveDeclaration} onBack={handleBackToList} />;
            case 'runpayroll': return <RunPayroll employees={employees} onBack={handleBackToList} />;
            case 'leaveregister': return <LeaveRegister employees={employees} onBack={() => setView('employees')} />;
            default:
                return (
                     <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Employee List</Typography>
                            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNewEmployee}>+ Add Employee to Payroll</Button>
                        </Box>
                        <EmployeeTable
                            employees={employees}
                            onEdit={(emp) => handleNavigate('edit', emp)}
                            onDelete={handleDeleteEmployee}
                            onShowDeclaration={(emp) => handleNavigate('declaration', emp)}
                            onShowCalculator={(emp) => handleNavigate('calculate', emp)}
                            onShowReport={(emp) => handleNavigate('report', emp)}
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
                {renderContent()}
            </Container>
        </ThemeProvider>
    );
}
