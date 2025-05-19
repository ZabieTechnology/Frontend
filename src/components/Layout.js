import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import {
Drawer,
List,
ListItem,
ListItemButton, // Use ListItemButton for better semantics and ripple effect
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

Tooltip // Import Tooltip

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

Money, // Icon for Expenses

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

Build

} from "@mui/icons-material";

import { useTheme } from "@mui/material/styles";

import { jwtDecode } from "jwt-decode";



// Helper component for sidebar items

const SidebarListItem = ({ to, icon, primaryText, sidebarOpen, onClick, children, nested = false }) => {

const theme = useTheme();

const commonSx = {

color: theme.palette.text.primary,

textDecoration: 'none',

py: 1,

minHeight: 48,

justifyContent: sidebarOpen ? 'initial' : 'center',

px: 2.5,

'&:hover': {

backgroundColor: theme.palette.action.hover,

},

...(nested && sidebarOpen && { pl: 4 }),

};



const itemContent = (

<>

<ListItemIcon

sx={{

minWidth: 0,

mr: sidebarOpen ? 3 : 'auto',

justifyContent: 'center',

color: 'inherit',

}}

>

{icon}

</ListItemIcon>

<ListItemText

primary={primaryText}

sx={{ opacity: sidebarOpen ? 1 : 0, whiteSpace: 'nowrap' }}

/>

{children} {/* For Expand/Collapse icons */}

</>

);



const button = to ? (

<ListItemButton component={Link} to={to} sx={commonSx}>

{itemContent}

</ListItemButton>

) : (

<ListItemButton onClick={onClick} sx={commonSx}>

{itemContent}

</ListItemButton>

);



return (

<Tooltip title={!sidebarOpen ? primaryText : ""} placement="right">

<ListItem disablePadding sx={{ display: 'block' }}>

{button}

</ListItem>

</Tooltip>

);

};





const Layout = ({ setToken }) => {

const theme = useTheme();

const [sidebarOpen, setSidebarOpen] = useState(true);

const [username, setUsername] = useState("");

const [openSettings, setOpenSettings] = useState(false);

const [openOrganizationDetails, setOpenOrganizationDetails] = useState(false);

const [openTaxCompliance, setOpenTaxCompliance] = useState(false);

const [openAccountTransaction, setOpenAccountTransaction] = useState(false);

const [anchorEl, setAnchorEl] = useState(null);



const handleLogout = () => {

localStorage.removeItem("token");

setToken(null);

};



const user = {

name: username || "Guest",

avatarInitial: (username || "G")[0].toUpperCase(),

};



const toggleSidebar = () => {

setSidebarOpen((prevState) => !prevState);

};



const handleSettingsToggle = () => setOpenSettings(!openSettings);

const handleOrganizationDetailsToggle = () => setOpenOrganizationDetails(!openOrganizationDetails);

const handleTaxComplianceToggle = () => setOpenTaxCompliance(!openTaxCompliance);

const handleAccountTransactionToggle = () => setOpenAccountTransaction(!openAccountTransaction);



const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);

const handlePopoverClose = () => setAnchorEl(null);

const popoverOpen = Boolean(anchorEl);

const popoverId = popoverOpen ? "submenu-popover" : undefined;





useEffect(() => {

const token = localStorage.getItem("token");

if (token) {

try {

const decodedToken = jwtDecode(token);

setUsername(decodedToken.sub);

} catch (err) {

console.error("Error decoding token:", err);

}

}

}, []);





return (

<Box sx={{ display: "flex", height: "100vh" }}>

{/* Sidebar */}

<Drawer

variant="permanent"

anchor="left"

sx={{

width: sidebarOpen ? 240 : 72,

flexShrink: 0,

[`& .MuiDrawer-paper`]: {

width: sidebarOpen ? 240 : 72,

boxSizing: 'border-box',

backgroundColor: theme.palette.background.paper,

color: theme.palette.text.primary,

overflowX: 'hidden',

transition: theme.transitions.create('width', {

easing: theme.transitions.easing.sharp,

duration: theme.transitions.duration.enteringScreen,

}),

},

}}

>

<Box

sx={{

height: 64,

display: 'flex',

alignItems: 'center',

justifyContent: 'center',

position: 'relative',

}}

>

{sidebarOpen ? (

<Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>

Co-book

</Typography>

) : (

<BusinessIcon />

)}

<Divider sx={{ width: '80%', position: 'absolute', bottom: 0, left: '10%', right: '10%' }} />

</Box>



<List sx={{ pt: 1 }}>

<SidebarListItem to="/home" icon={<Home />} primaryText="Dashboard" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<Info />} primaryText="Info" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/sales" icon={<Work />} primaryText="Sales" sidebarOpen={sidebarOpen} />

{/* Updated Expenses Link */}

<SidebarListItem to="/Expenses" icon={<Money />} primaryText="Expenses" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<AccountBalance />} primaryText="Inventory" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<AccountBalanceWallet />} primaryText="Bank" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<Receipt />} primaryText="Cash" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<ListAlt />} primaryText="Payroll" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<Report />} primaryText="Reimbursement" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<RequestQuote />} primaryText="Taxation" sidebarOpen={sidebarOpen} />

<SidebarListItem to="/info" icon={<Assessment />} primaryText="C-Reports" sidebarOpen={sidebarOpen} />



<SidebarListItem

icon={<AttachMoneyIcon />}

primaryText="Account Transaction"

sidebarOpen={sidebarOpen}

onClick={handleAccountTransactionToggle}

>

{sidebarOpen && (openAccountTransaction ? <ExpandLessIcon /> : <ExpandMoreIcon />)}

</SidebarListItem>

<Collapse in={openAccountTransaction && sidebarOpen} timeout="auto" unmountOnExit>

<List component="div" disablePadding>

<SidebarListItem to="/account-transaction/customer" icon={<PeopleIcon />} primaryText="Customer" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/account-transaction/vendor" icon={<VendorIcon />} primaryText="Vendor" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/account-transaction/chart-of-accounts" icon={<ChartOfAccountsIcon />} primaryText="Chart of Accounts" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/account-transaction/staff" icon={<StaffIcon />} primaryText="Staff" sidebarOpen={sidebarOpen} nested />

</List>

</Collapse>



<SidebarListItem to="/info" icon={<Build />} primaryText="Co-book Tools" sidebarOpen={sidebarOpen} />



<SidebarListItem

icon={<SettingsIcon />}

primaryText="Settings"

sidebarOpen={sidebarOpen}

onClick={handleSettingsToggle}

>

{sidebarOpen && (openSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />)}

</SidebarListItem>

<Collapse in={openSettings && sidebarOpen} timeout="auto" unmountOnExit>

<List component="div" disablePadding>

<SidebarListItem

icon={<BusinessIcon />}

primaryText="Organization Details"

sidebarOpen={sidebarOpen}

onClick={handleOrganizationDetailsToggle}

nested

>

{sidebarOpen && (openOrganizationDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />)}

</SidebarListItem>

<Collapse in={openOrganizationDetails && sidebarOpen} timeout="auto" unmountOnExit>

<List component="div" disablePadding>

<SidebarListItem to="/settings/organizationsetting/companyinformation" icon={<Info />} primaryText="Company Information" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/settings/organizationsettings/contactdetails" icon={<PeopleIcon />} primaryText="Contact Details" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/settings/organizationsettings/natureofbusiness" icon={<Work />} primaryText="Nature of Business" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/settings/organizationsettings/financialdetails" icon={<AttachMoneyIcon />} primaryText="Financial Details" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/settings/global-settings/dropdown" icon={<ListAlt />} primaryText="Dropdown Management" sidebarOpen={sidebarOpen} nested />

</List>

</Collapse>



<SidebarListItem

icon={<GavelIcon />}

primaryText="Tax/Compliance Details"

sidebarOpen={sidebarOpen}

onClick={handleTaxComplianceToggle}

nested

>

{sidebarOpen && (openTaxCompliance ? <ExpandLessIcon /> : <ExpandMoreIcon />)}

</SidebarListItem>

<Collapse in={openTaxCompliance && sidebarOpen} timeout="auto" unmountOnExit>

<List component="div" disablePadding>

<SidebarListItem to="/settings/taxcompliancedetails/GSTManagement" icon={<></>} primaryText="GST" sidebarOpen={sidebarOpen} nested />

<SidebarListItem to="/settings/taxcompliancedetails/vat-management" icon={<></>} primaryText="VAT" sidebarOpen={sidebarOpen} nested />

<SidebarListItem icon={<></>} primaryText="TDS" sidebarOpen={sidebarOpen} onClick={handlePopoverOpen} nested />

<SidebarListItem icon={<></>} primaryText="TCS" sidebarOpen={sidebarOpen} onClick={handlePopoverOpen} nested />

<SidebarListItem icon={<></>} primaryText="Advance TAX" sidebarOpen={sidebarOpen} onClick={handlePopoverOpen} nested />

</List>

</Collapse>

<SidebarListItem to="/settings/invoicesettings/InvoiceSettingsPage" icon={<Receipt />} primaryText="Invoice Settings" sidebarOpen={sidebarOpen} nested />

<SidebarListItem icon={<Money />} primaryText="Expense Settings" sidebarOpen={sidebarOpen} onClick={handlePopoverOpen} nested />

<SidebarListItem icon={<AdvancedSettingsIcon />} primaryText="Advanced Settings" sidebarOpen={sidebarOpen} onClick={handlePopoverOpen} nested />

</List>

</Collapse>

</List>



<Box sx={{ flexGrow: 1 }} />

<Tooltip title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"} placement="right">

<Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>

<IconButton onClick={toggleSidebar} sx={{ color: theme.palette.text.primary }}>

{sidebarOpen ? <ChevronLeft /> : <ChevronRight />}

</IconButton>

</Box>

</Tooltip>

<Divider />

<SidebarListItem

icon={<Logout />}

primaryText="Logout"

sidebarOpen={sidebarOpen}

onClick={handleLogout}

/>

</Drawer>



<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

<Box

component="header"

sx={{

display: "flex",

alignItems: "center",

justifyContent: "space-between",

px: 2,

py: 1,

backgroundColor: theme.palette.background.paper,

color: theme.palette.text.primary,

boxShadow: theme.shadows[1],

height: 64,

zIndex: theme.zIndex.drawer + 1,

}}

>

<Box

sx={{

display: "flex",

alignItems: "center",

backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[100],

borderRadius: theme.shape.borderRadius,

p: '4px 8px',

flexGrow: { xs: 1, md: 0 },

maxWidth: { md: '400px' },

}}

>

<Search sx={{ mr: 1, color: theme.palette.text.secondary }} />

<InputBase

placeholder="Search…"

sx={{ flexGrow: 1, color: 'inherit' }}

inputProps={{ 'aria-label': 'search' }}

/>

</Box>

<Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

<Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>{user.avatarInitial}</Avatar>

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

position: 'relative',

}}

>

<Outlet />

</Box>

</Box>



<Popover

id={popoverId}

open={popoverOpen}

anchorEl={anchorEl}

onClose={handlePopoverClose}

anchorOrigin={{ vertical: 'center', horizontal: 'right' }}

transformOrigin={{ vertical: 'top', horizontal: 'left' }}

PaperProps={{

sx: { p: 1.5, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }

}}

>

<Typography variant="body2">Popover content for {anchorEl?.id || 'selected item'}</Typography>

</Popover>

</Box>

);

};



export default Layout;