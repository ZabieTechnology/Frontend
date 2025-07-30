import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
    InputBase,
    Typography,
    Avatar,
    IconButton,
    Collapse,
    Popover,
    Tooltip,
    useTheme,
} from "@mui/material";
import {
    Home,
    Info,
    Logout,
    Search,
    ChevronLeft,
    ChevronRight,
    Work,
    AccountBalance,
    AccountBalanceWallet,
    Receipt,
    Money,
    ListAlt,
    Report,
    Settings as SettingsIcon,
    Business as BusinessIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AttachMoney as AttachMoneyIcon,
    Gavel as GavelIcon,
    Tune as AdvancedSettingsIcon,
    People as PeopleIcon,
    Store as VendorIcon,
    Ballot as ChartOfAccountsIcon,
    Groups as StaffIcon,
    Assessment,
    RequestQuote,
    Build,
    Description as InvoiceIcon,
    NoteAdd as QuotationIcon,
    RemoveShoppingCart as CreditNoteIcon,
    Inventory as InventoryIcon,
    LocalShipping as DeliveryChallanIcon,
    CompareArrows as StockAdjustmentIcon,
} from "@mui/icons-material";
import axios from "axios"; // Import axios for API calls

// --- Data-driven menu structure ---
const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <Home />, path: '/home' },
    {
        id: 'account-transaction',
        text: 'Accounts',
        icon: <AttachMoneyIcon />,
        children: [
            { id: 'customer', text: 'Customer', icon: <PeopleIcon />, path: 'CustomerList' },
            { id: 'vendor', text: 'Vendor', icon: <VendorIcon />, path: '/account-transaction/vendor' },
            { id: 'staff', text: 'Staff', icon: <StaffIcon />, path: '/account-transaction/staff' },
            { id: 'chart-of-accounts', text: 'Chart of Accounts', icon: <ChartOfAccountsIcon />, path: '/account-transaction/chart-of-accounts' },
        ],
    },
    {
        id: 'sales',
        text: 'Sales',
        icon: <Work />,
        children: [
            { id: 'overview', text: 'Overview', icon: <InvoiceIcon />, path: 'Overviewsale' },
            { id: 'invoice', text: 'Invoice', icon: <InvoiceIcon />, path: 'sales' },
            { id: 'quotation', text: 'Quotation', icon: <QuotationIcon />, path: 'quote' },
            { id: 'credit-note', text: 'Credit Note', icon: <CreditNoteIcon />, path: 'CreditNote' },
            { id: 'otherplatform', text: 'Other Platform', icon: <CreditNoteIcon />, path: 'OtherPlatform' },
        ],
    },
      {
        id: 'expenses',
        text: 'Expenses',
        icon: <Money />,
        children: [
            { id: 'expense-overview', text: 'Overview', icon: <Assessment />, path: '/expenses/overview' },
            { id: 'expense-list', text: 'Expenses', icon: <Money />, path: 'expenses' },
            { id: 'fixed-asset', text: 'Fixed Asset', icon: <BusinessIcon />, path: 'FixedAsset' },
        ],
    },
    {
        id: 'inventory',
        text: 'Inventory',
        icon: <AccountBalance />,
        children: [
            { id: 'items', text: 'Items', icon: <InventoryIcon />, path: 'Inventory' },
            { id: 'delivery-challan', text: 'Delivery Challan', icon: <DeliveryChallanIcon />, path: 'DeliveryChallan' },
            { id: 'stock-adjustment', text: 'Stock Adjustment', icon: <StockAdjustmentIcon />, path: 'StockManagement' },
        ],
    },
    {
        id: 'bank',
        text: 'Bank',
        icon: <AccountBalanceWallet />,
        children: [
            { id: 'BankOverview', text: 'Overview', icon: <Receipt />, path: 'BankOverview' },
            { id: 'Banklist', text: 'Bank', icon: <Receipt />, path: 'Bank' },
            { id: 'Record Page', text: 'Bank Reconciliation', icon: <Receipt />, path: 'Bank/new' },
            { id: 'Creditcardlist', text: 'Credit Card', icon: <Receipt />, path: 'CreditCard' },
            { id: 'ChequeList', text: 'Cheque', icon: <Receipt />, path: 'Cheque' },
            { id: 'Cashlist', text: 'Cash', icon: <Receipt />, path: 'cash' },
            { id: 'LoanList', text: 'Loan', icon: <Receipt />, path: 'loan' },
            { id: 'WalletList', text: 'Wallet', icon: <Receipt />, path: 'Wallet' },

        ]
    },
{

    id: 'Payment', text: 'Payments/Receipts', icon: <GavelIcon />,
        children: [
            { id: 'payment', text: 'Payment', icon: <Receipt />, path: 'payments' },
            { id: 'receiptvoucher', text: 'Receipts', icon: <Receipt />, path: 'receiptvoucher' },
            { id: 'contravoucher', text: 'Contra', icon: <Receipt />, path: 'contravoucher' },
        ]
    },

    { id: 'payroll', text: 'Payroll', icon: <ListAlt />, path: '/Payroll' },
    { id: 'reimbursement', text: 'Reimbursement', icon: <Report />, path: '/Reimbursement' },
    { id: 'taxation', text: 'Taxation', icon: <RequestQuote />, path: '/info' },
    { id: 'c-reports', text: 'C-Reports', icon: <Assessment />, path: '/info' },
    { id: 'co-book-tools', text: 'Co-book Tools', icon: <Build />, path: '/info' },
    {
        id: 'settings',
        text: 'Settings',
        icon: <SettingsIcon />,
        children: [
            {
                id: 'organization', text: 'Organization', icon: <BusinessIcon />,
                children: [
                    { id: 'company-info', text: 'Business Profile', icon: <Info />, path: '/settings/organizationsetting/companyinformation' },
                    { id: 'contact-details', text: 'Contact', icon: <PeopleIcon />, path: '/settings/organizationsettings/contactdetails' },
                    { id: 'financial-details', text: 'Financial Settings', icon: <AttachMoneyIcon />, path: '/settings/organizationsettings/financialdetails' },

                ]
            },
            {
                id: 'finance', text: 'Finance', icon: <AttachMoneyIcon />,
                children: [
                    { id: 'invoice-settings', text: 'Invoice', icon: <Receipt />, path: '/settings/invoicesettings/InvoiceSettingsPage' },
                    { id: 'estimate-settings', text: 'Estimate', icon: <RequestQuote />, path: 'settings/Finance/quotationsettings' },
                    { id: 'expense-settings', text: 'Expense', icon: <Money />, action: 'popover' },
                    {id: 'coaclassification', text: 'COA Classification', icon: <Money />, path:'coaclass'},
                ]
            },
            {
            id: 'tax-compliance', text: 'Tax/Compliance', icon: <GavelIcon />,
                        children: [
                            { id: 'gst', text: 'GST', path: '/settings/taxcompliancedetails/GSTManagement' },
                            { id: 'vat', text: 'VAT', path: '/settings/taxcompliancedetails/vat-management' },
                            { id: 'tds', text: 'TDS', path: 'tdssettings' },
                            { id: 'tcs', text: 'TCS', path: 'tcssettings' },
                            { id: 'advance-tax', text: 'Advance Tax', action: 'popover' },
                        ]
            },
            { id: 'advanced-settings', text: 'Advanced Settings', icon: <AdvancedSettingsIcon />,
            children: [
            { id: 'dropdown-management', text: 'Dropdown Management', icon: <ListAlt />, path: '/settings/global-settings/dropdown' },
            { id: 'OfficalDocument', text: 'Document Rules', icon: <ListAlt />, path: 'OfficaldocumentSettings' },
            { id: 'trail', text: 'Sample', icon: <ListAlt />, path: 'SamplePage' },
            { id: 'RegionalSettings', text: 'Regional Settings', icon: <ListAlt />, path: 'RegionalSettings' },
            { id: 'IndustryClassification', text: 'Industry Class', icon: <ListAlt />, path: 'IndustryClassification' },
            ]
        }
        ]
    }
];

const RecursiveSidebarItem = ({ item, sidebarOpen, openMenus, handleMenuClick, level = 1, onPopoverOpen }) => {
    const theme = useTheme();
    const location = useLocation();

    const isMenuOpen = openMenus[item.id] || false;
    const isNested = level > 1;

    const isActive = (item) => {
        if (item.path && item.path !== '/info' && location.pathname.startsWith(item.path)) {
            return true;
        }
        if (item.children) {
            return item.children.some(child => isActive(child));
        }
        return false;
    };

    const active = isActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const handleClick = (e) => {
        if (hasChildren) {
            handleMenuClick(item.id);
        }
        if (item.action === 'popover') {
            onPopoverOpen(e);
        }
    };

    const commonSx = {
        color: active ? theme.palette.primary.main : theme.palette.text.primary,
        backgroundColor: active ? theme.palette.action.selected : 'transparent',
        textDecoration: 'none',
        py: 1,
        minHeight: 48,
        justifyContent: sidebarOpen ? 'initial' : 'center',
        px: 2.5,
        mb: 0.5,
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        ...(isNested && sidebarOpen && { pl: 2.5 + (level - 1) * 2 }),
    };

    const itemContent = (
        <>
            <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                {item.icon || <Box sx={{ width: 24 }} />}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ opacity: sidebarOpen ? 1 : 0, whiteSpace: 'nowrap' }} />
            {sidebarOpen && hasChildren && (isMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
        </>
    );

    const button = item.path ? (
        <ListItemButton component={Link} to={item.path} sx={commonSx} onClick={handleClick}>
            {itemContent}
        </ListItemButton>
    ) : (
        <ListItemButton sx={commonSx} onClick={handleClick}>
            {itemContent}
        </ListItemButton>
    );

    return (
        <>
            <Tooltip title={!sidebarOpen ? item.text : ""} placement="right">
                <ListItem disablePadding sx={{ display: 'block', px: sidebarOpen ? 1.5 : 0 }}>
                    {button}
                </ListItem>
            </Tooltip>
            {hasChildren && (
                <Collapse in={isMenuOpen && sidebarOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.children.map((child) => (
                            <RecursiveSidebarItem
                                key={child.id}
                                item={child}
                                sidebarOpen={sidebarOpen}
                                openMenus={openMenus}
                                handleMenuClick={handleMenuClick}
                                level={level + 1}
                                onPopoverOpen={onPopoverOpen}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

const Layout = ({ setToken }) => {
    const theme = useTheme();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("Guest"); // Default to Guest
    const [openMenus, setOpenMenus] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL || '';

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUsername("Guest"); // Reset username on logout
    }, [setToken]);

    // --- THIS IS THE UPDATED USEEFFECT HOOK ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Fetch user profile from the backend
                    const response = await axios.get(`${apiUrl}/api/auth/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    // Set the username from the response
                    setUsername(response.data.username || "User");
                } catch (err) {
                    console.error("Failed to fetch user profile:", err);
                    // If token is invalid or expired, log the user out
                    handleLogout();
                }
            }
        };

        fetchUserProfile();
    }, [handleLogout, apiUrl]);

    useEffect(() => {
        const findPath = (items, currentPath) => {
            for (const item of items) {
                if (item.path && currentPath.startsWith(item.path)) {
                    return [item.id];
                }
                if (item.children) {
                    const childPath = findPath(item.children, currentPath);
                    if (childPath.length > 0) {
                        return [item.id, ...childPath];
                    }
                }
            }
            return [];
        };

        const activePath = findPath(menuItems, location.pathname);
        const initialOpenMenus = {};
        activePath.forEach(id => { initialOpenMenus[id] = true; });
        setOpenMenus(initialOpenMenus);
    }, [location.pathname]);


    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const handleMenuClick = (id) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
    const handlePopoverClose = () => setAnchorEl(null);
    const popoverOpen = Boolean(anchorEl);

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Drawer
                variant="permanent"
                anchor="left"
                sx={{
                    width: sidebarOpen ? 240 : 88,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: sidebarOpen ? 240 : 88,
                        boxSizing: 'border-box',
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        overflowX: 'hidden',
                        borderRight: 'none',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    },
                }}
            >
                <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sidebarOpen ? <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Co-book</Typography> : <BusinessIcon />}
                </Box>
                <Divider sx={{ mx: 2 }} />

                <List sx={{ pt: 1, flexGrow: 1 }}>
                    {menuItems.map((item) => (
                        <RecursiveSidebarItem
                            key={item.id}
                            item={item}
                            sidebarOpen={sidebarOpen}
                            openMenus={openMenus}
                            handleMenuClick={handleMenuClick}
                            onPopoverOpen={handlePopoverOpen}
                        />
                    ))}
                </List>

                <Box sx={{ flexGrow: 1 }} />

                <Tooltip title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"} placement="right">
                    <Box sx={{ display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'center', p: 2 }}>
                        <IconButton onClick={toggleSidebar} sx={{ color: theme.palette.text.primary }}>
                            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                        </IconButton>
                    </Box>
                </Tooltip>

                <Divider sx={{ mx: 2 }} />

                <Box sx={{ p: 1.5 }}>
                    <Tooltip title={!sidebarOpen ? "Logout" : ""} placement="right">
                         <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                justifyContent: sidebarOpen ? 'initial' : 'center',
                                px: 2.5,
                                borderRadius: theme.shape.borderRadius,
                            }}
                         >
                            <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 3 : 'auto', justifyContent: 'center' }}>
                                <Logout />
                            </ListItemIcon>
                            <ListItemText primary="Logout" sx={{ opacity: sidebarOpen ? 1 : 0 }} />
                         </ListItemButton>
                    </Tooltip>
                </Box>
            </Drawer>

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Box
                    component="header"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 3,
                        py: 1,
                        backgroundColor: theme.palette.background.paper,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        height: 64,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: theme.palette.action.hover,
                            borderRadius: theme.shape.borderRadius,
                            p: '4px 8px',
                            flexGrow: { xs: 1, md: 0 },
                            maxWidth: { md: '400px' },
                        }}
                    >
                        <Search sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <InputBase placeholder="Search…" sx={{ flexGrow: 1, color: 'inherit' }} />
                    </Box>
                    <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                            {username[0].toUpperCase()}
                        </Avatar>
                        {/* --- THIS IS THE UPDATED TYPOGRAPHY --- */}
                        <Typography variant="body1" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                            {username}
                        </Typography>
                    </Box>
                </Box>
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: theme.palette.background.default,
                        p: 3,
                        overflowY: "auto",
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            <Popover
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
                PaperProps={{ sx: { p: 1.5, ml: 1, borderRadius: theme.shape.borderRadius } }}
            >
                <Typography variant="body2">This feature is coming soon.</Typography>
            </Popover>
        </Box>
    );
};

export default Layout;