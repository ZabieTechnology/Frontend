import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
    CheckCircle as CheckCircleIcon,
    Download as DownloadIcon,
    Upload as UploadIcon
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
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
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
            backgroundColor: '#7e57c2',
            '&:hover': {
                backgroundColor: '#4d2c91',
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

// --- Other Platforms Page ---
const OtherPlatformsPage = () => {
    const eInvoiceServices = [
        "Services", "Goods", "Goods with e way bill", "Goods with einvoice",
         "Goods with einvoice and eway bill", "Service with einvoice",
         "Goods invoice for export/sez/eou", "Service invoice for export/sez/eou"
    ];
    const nonGstServices = ["Services", "Goods"];
    const apiLinks = ["Swiggy", "Zomato", "Shopify", "Inhouse software (Excel Data)", "Salesforce", "Amazon", "Flipkart", "Meesho", "Others"];

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
                <Card sx={{height: '100%'}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Create E-Invoice</Typography>
                        <Button variant="contained" sx={{mb: 2, bgcolor: 'rgba(103, 58, 183, 0.1)', color: 'secondary.main', '&:hover': {bgcolor: 'rgba(103, 58, 183, 0.2)'}}}>GST Invoice</Button>
                        <List dense>
                            {eInvoiceServices.map((service, index) => <ListItemText key={index} primary={`${index + 1}. ${service}`} />)}
                        </List>
                         <Typography variant="h6" gutterBottom sx={{mt: 2}}>Non-GST Invoice</Typography>
                         <List dense>
                            {nonGstServices.map((service, index) => <ListItemText key={index} primary={`${index + 1}. ${service}`} />)}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                 <Card sx={{height: '100%', textAlign: 'center'}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Co-book invoice Upload</Typography>
                        <Box sx={{my: 4}}>
                            <Button variant="outlined">Single Bill</Button>
                        </Box>
                        <Typography variant="h6" gutterBottom>Bulk Upload</Typography>
                        <Link href="#" underline="always">Excel file</Link>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                 <Card sx={{height: '100%'}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Link API</Typography>
                        <Typography variant="subtitle1" sx={{mb: 1}}>Support:</Typography>
                        <List dense>
                            {apiLinks.map((link) => (
                                <ListItem key={link} disableGutters>
                                    <ListItemIcon sx={{minWidth: 32}}>
                                        <CheckCircleIcon color="success" fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText primary={link} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}


// --- Main App Component ---
export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <AppHeader activeTab="Other Platforms" />
        <OtherPlatformsPage />
      </Box>
    </ThemeProvider>
  );
}