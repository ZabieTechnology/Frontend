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
// FIX: Replaced the package import with a CDN URL to resolve the module error.
import { jwtDecode } from "https://unpkg.com/jwt-decode@4.0.0/build/esm/index.js";


// --- Data-driven menu structure ---
// Centralized configuration for all sidebar items.
// To add, remove, or re-order items, you only need to modify this array.
const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <Home />, path: '/home' },
    {
        id: 'account-transaction',
        text: 'A/C Transaction',
        icon: <AttachMoneyIcon />,
        children: [
            { id: 'customer', text: 'Customer', icon: <PeopleIcon />, path: '/account-transaction/customer' },
            { id: 'vendor', text: 'Vendor', icon: <VendorIcon />, path: '/account-transaction/vendor' },
            { id: 'chart-of-accounts', text: 'Chart of Accounts', icon: <ChartOfAccountsIcon />, path: '/account-transaction/chart-of-accounts' },
            { id: 'staff', text: 'Staff', icon: <StaffIcon />, path: '/account-transaction/staff' },
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
    // --- MODIFIED: Converted Bank to a collapsible menu and added Payment ---
    {
        id: 'bank',
        text: 'Bank',
        icon: <AccountBalanceWallet />,
        children: [
            { id: 'payment', text: 'Payment', icon: <Receipt />, path: 'payments' },
            { id: 'Record Page', text: 'Reconsilation', icon: <Receipt />, path: 'Bank/new' },
            { id: 'BankOverview', text: 'Overview', icon: <Receipt />, path: 'BankOverview' },
            { id: 'Banklist', text: 'Bank', icon: <Receipt />, path: 'Bank' },
            { id: 'Creditcardlist', text: 'Credit Card', icon: <Receipt />, path: 'CreditCard' },
            { id: 'ChequeList', text: 'Cheque', icon: <Receipt />, path: 'Cheque' },
            { id: 'Cashlist', text: 'Cash', icon: <Receipt />, path: 'cash' },
            { id: 'LoanList', text: 'Loan', icon: <Receipt />, path: 'loan' },
            { id: 'WalletList', text: 'Wallet', icon: <Receipt />, path: 'Wallet' },
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
                    { id: 'company-info', text: 'Company Information', icon: <Info />, path: '/settings/organizationsetting/companyinformation' },
                    { id: 'contact-details', text: 'Contact Details', icon: <PeopleIcon />, path: '/settings/organizationsettings/contactdetails' },
                    { id: 'nature-of-business', text: 'Nature of Business', icon: <Work />, path: '/settings/organizationsettings/natureofbusiness' },
                    { id: 'financial-details', text: 'Financial Details', icon: <AttachMoneyIcon />, path: '/settings/organizationsettings/financialdetails' },
                    { id: 'dropdown-management', text: 'Dropdown Management', icon: <ListAlt />, path: '/settings/global-settings/dropdown' },
                ]
            },
            {
                id: 'finance', text: 'Finance', icon: <AttachMoneyIcon />,
                children: [
                    {
                        id: 'tax-compliance', text: 'Tax/Compliance', icon: <GavelIcon />,
                        children: [
                            { id: 'gst', text: 'GST', path: '/settings/taxcompliancedetails/GSTManagement' },
                            { id: 'vat', text: 'VAT', path: '/settings/taxcompliancedetails/vat-management' },
                            { id: 'OfficalDocument', text: 'Document Settings', path: 'OfficaldocumentSettings' },
                            { id: 'tds', text: 'TDS', path: 'tdssettings' },
                            { id: 'tcs', text: 'TCS', path: 'tcssettings' },
                            { id: 'advance-tax', text: 'Advance TAX', action: 'popover' },
                        ]
                    },
                    { id: 'invoice-settings', text: 'Invoice', icon: <Receipt />, path: '/settings/invoicesettings/InvoiceSettingsPage' },
                    { id: 'estimate-settings', text: 'Estimate', icon: <RequestQuote />, path: 'settings/Finance/quotationsettings' },
                    { id: 'expense-settings', text: 'Expense', icon: <Money />, action: 'popover' },

                ]
            },
            { id: 'advanced-settings', text: 'Advanced Settings', icon: <AdvancedSettingsIcon />, action: 'popover' },
        ]
    }
];

// --- Recursive component to render sidebar items ---
// This component handles rendering of a single item and its children, if any.
const RecursiveSidebarItem = ({ item, sidebarOpen, openMenus, handleMenuClick, level = 1, onPopoverOpen }) => {
    const theme = useTheme();
    const location = useLocation();

    const isMenuOpen = openMenus[item.id] || false;
    const isNested = level > 1;

    // Determine if the current item or any of its children are active
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

// --- Main Layout Component ---
const Layout = ({ setToken }) => {
    const theme = useTheme();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [openMenus, setOpenMenus] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
    }, [setToken]);

    // Effect to set user info from JWT token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUsername(decodedToken.sub || "User");
                setUserEmail(decodedToken.email || '');
            } catch (err) {
                console.error("Error decoding token:", err);
                handleLogout();
            }
        }
    }, [handleLogout]);

    // Effect to open parent menus of the active route on page load
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

    // Unified handler for all collapsible menus
    const handleMenuClick = (id) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
    const handlePopoverClose = () => setAnchorEl(null);
    const popoverOpen = Boolean(anchorEl);

    const user = {
        name: username || "Guest",
        avatarInitial: (username || "G")[0].toUpperCase(),
        email: userEmail || "guest@example.com"
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* --- Sidebar / Drawer --- */}
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

            {/* --- Main Content Area --- */}
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
                            {user.avatarInitial}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                            {user.email}
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

            {/* --- Popover for "Coming Soon" features --- */}
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
