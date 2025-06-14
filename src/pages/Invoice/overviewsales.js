import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  TablePagination,
  IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Upload as UploadIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

// A light theme for the dashboard
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#673ab7',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#172b4d',
      secondary: '#6b778c',
    },
    success: {
        main: '#4caf50',
    },
    error: {
        main: '#f44336'
    },
    info: {
        main: '#2196f3'
    },
    warning: {
        main: '#ff9800'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    h4: {
        fontWeight: 'bold',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
        fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
        containedPrimary: {
            backgroundColor: '#2962ff',
            '&:hover': {
                backgroundColor: '#0039cb',
            }
        },
        containedSecondary: {
            backgroundColor: '#e8eaf6',
            color: '#3f51b5',
            '&:hover': {
                backgroundColor: '#c5cae9',
            }
        }
      }
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            }
        }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        }
      }
    },
    MuiTableCell: {
        styleOverrides: {
            head: {
                color: '#6b778c',
                fontWeight: '600',
                padding: '12px 16px',
            },
            body: {
                color: '#172b4d',
            }
        }
    }
  }
});

// Styled components for custom tab-like buttons
const NavButton = styled(Button)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.common.white : 'transparent',
  color: theme.palette.text.primary,
  boxShadow: selected ? '0px 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1, 2),
   '&:hover': {
     backgroundColor: selected ? theme.palette.common.white : theme.palette.action.hover,
   }
}));

// --- Reusable Header Component ---
const AppHeader = ({ activeTab }) => {
    const navItems = ['Overview', 'Sales Invoice', 'Credit Notes', 'Estimate', 'Other Platforms'];
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4
        }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, backgroundColor: '#f4f6f8', p: 0.5, borderRadius: '12px' }}>
                {navItems.map(item => (
                    <NavButton key={item} selected={activeTab === item}>
                    {item}
                    </NavButton>
                ))}
            </Box>

            {['Sales Invoice', 'Credit Notes', 'Estimate'].includes(activeTab) && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<UploadIcon />}>Import</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
                </Box>
            )}
        </Box>
    );
};


// --- Overview Page Component ---
const OverviewPage = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [searchTerm, setSearchTerm] = React.useState('');

    const overviewRows = React.useMemo(() => [
        { customer: 'Claudia Alves', days1_30: '$2,500', days31_60: '$2,500', days61_90: '$2,500', days90plus: '$2,500', total: '$10,000' },
        { customer: 'John Smith', days1_30: '$1,200', days31_60: '$3,400', days61_90: '$0', days90plus: '$0', total: '$4,600' },
        { customer: 'Jane Doe', days1_30: '$5,000', days31_60: '$1,500', days61_90: '$1,500', days90plus: '$0', total: '$8,000' },
        { customer: 'Peter Jones', days1_30: '$750', days31_60: '$0', days61_90: '$0', days90plus: '$0', total: '$750' },
        { customer: 'Mary Johnson', days1_30: '$3,100', days31_60: '$2,200', days61_90: '$1,000', days90plus: '$500', total: '$6,800' },
        { customer: 'Chris Lee', days1_30: '$4,500', days31_60: '$0', days61_90: '$0', days90plus: '$0', total: '$4,500' },
    ], []);

    const filteredRows = React.useMemo(() => {
        return overviewRows.filter(row =>
            row.customer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [overviewRows, searchTerm]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
                <Grid container spacing={3}>
                <Grid item xs={6}><Card><CardContent><Typography variant="h4" component="div">50</Typography><Typography sx={{ color: 'text.secondary' }}>Total Invoices</Typography></CardContent></Card></Grid>
                <Grid item xs={6}><Card sx={{backgroundColor: '#e8f5e9'}}><CardContent><Typography variant="h5" component="div" sx={{ color: '#4caf50', fontWeight: 'bold' }}>$24,500</Typography><Typography sx={{ color: 'text.secondary' }}>Total Sales</Typography></CardContent></Card></Grid>
                <Grid item xs={6}><Card sx={{backgroundColor: '#fff3e0'}}><CardContent><Typography variant="h5" component="div" sx={{ color: '#ff9800', fontWeight: 'bold' }}>$3,200</Typography><Typography sx={{ color: 'text.secondary' }}>Sales return</Typography></CardContent></Card></Grid>
                <Grid item xs={6}><Card><CardContent><Typography variant="h4" component="div">24</Typography><Typography sx={{ color: 'text.secondary' }}>Yet to Publish</Typography></CardContent></Card></Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}><Typography variant="h6" sx={{ color: 'text.secondary' }}>Total Receivables</Typography><Box sx={{ bgcolor: '#ffebee', color: '#f44336', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'bold'}}>16%</Box></Box>
                        <Typography variant="h4" component="div" sx={{ mt: 1 }}>$45,750</Typography>
                        <Typography variant="body2" sx={{ color: '#f44336' }}>% Overdue</Typography>
                        <Box sx={{ mt: 2 }}>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2" color="text.secondary">0-30 days</Typography><Typography variant="body2" color="text.primary" sx={{fontWeight: 'medium'}}>$25,000</Typography></Box>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2" color="text.secondary">31-60 days</Typography><Typography variant="body2" color="text.primary" sx={{fontWeight: 'medium'}}>$15,000</Typography></Box>
                             <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="body2" color="text.secondary">61-90 days</Typography><Typography variant="body2" color="text.primary" sx={{fontWeight: 'medium'}}>$5,750</Typography></Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%'}}>
                    <Button variant="outlined" sx={{ flexGrow: 1, fontSize: '1rem' }}>Customers List</Button>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ flexGrow: 1, fontSize: '1rem' }}>New Invoice</Button>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ flexGrow: 1, fontSize: '1rem' }}>New Estimate</Button>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Paper sx={{ p: {xs: 1, md: 2} }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6">Accounts Receivable</Typography>
                        <TextField size="small" placeholder="Search Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}/>
                    </Box>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }} aria-label="accounts receivable table">
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>1-30 Days</TableCell>
                                    <TableCell>31-60 Days</TableCell>
                                    <TableCell>61-90 Days</TableCell>
                                    <TableCell>90+ Days</TableCell>
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.customer} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">{row.customer}</TableCell>
                                        <TableCell>{row.days1_30}</TableCell>
                                        <TableCell>{row.days31_60}</TableCell>
                                        <TableCell>{row.days61_90}</TableCell>
                                        <TableCell>{row.days90plus}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
}

// --- Main App Component ---
export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <AppHeader activeTab="Overview" />
        <OverviewPage />
      </Box>
    </ThemeProvider>
  );
}
