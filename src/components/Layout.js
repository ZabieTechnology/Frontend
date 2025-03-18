import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
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
  Contacts as ContactsIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  Gavel as GavelIcon,
  Inventory as InventoryIcon,
  AccountBalance as BankIcon,
  Payment as PayrollIcon,
  Tune as AdvancedSettingsIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

const Layout = ({ setToken }) => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [openSettings, setOpenSettings] = useState(false); // State for Settings submenu
  const [openOrganizationDetails, setOpenOrganizationDetails] = useState(false); // State for Organization Details submenu
  const [openTaxCompliance, setOpenTaxCompliance] = useState(false); // State for Tax/Compliance submenu
  const [anchorEl, setAnchorEl] = useState(null); // State for Popover

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Mock user data (replace with actual data from API or state)
  const user = {
    name: username || "Guest", // Display username or fallback to "Guest"
    avatar: `https://via.placeholder.com/100x100.png?text=${username || "Guest"}`,
  };

  // Toggle sidebar state
  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState); // Toggle sidebar visibility
  };

  // Handle submenu click
  const handleSubmenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close submenu
  const handleSubmenuClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "submenu-popover" : undefined;

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get the token from localStorage

    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the JWT token
        setUsername(decodedToken.sub); // Assuming the username is stored in 'identity'
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        sx={{
          width: sidebarOpen ? 240 : 72, // Adjust width based on state
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarOpen ? 240 : 72, // Animated transition
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s ease",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Sidebar Header with Logo (aligned with the top bar) */}
        <Box
          sx={{
            height: 64, // Matches the top bar height
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            position: "relative",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Co-book
          </Typography>
          {/* Centered Divider */}
          <Divider
            sx={{
              width: "80%", // Make the line shorter
              height: "1px",
              backgroundColor: theme.palette.divider,
              position: "absolute",
              bottom: 0, // Position at the bottom of the header
            }}
          />
        </Box>

        {/* Sidebar Links */}
        <List>
          {/* Dashboard */}
          <ListItem
            button
            component={Link}
            to="/home"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none", // Remove purple link styles
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Dashboard" />}
          </ListItem>

          {/* Info */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none", // Remove purple link styles
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Info" />}
          </ListItem>

          {/* Sales */}
          <ListItem
            button
            component={Link}
            to="/sales"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Work />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Sales" />}
          </ListItem>

          {/* Expenses */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Money />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Expenses" />}
          </ListItem>

          {/* Inventory */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <AccountBalance />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Inventory" />}
          </ListItem>

          {/* Bank */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <AccountBalanceWallet />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Bank" />}
          </ListItem>

          {/* Cash */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Receipt />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Cash" />}
          </ListItem>

          {/* Payroll */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <ListAlt />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Payroll" />}
          </ListItem>

          {/* Reimbursement */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Report />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Reimbursement" />}
          </ListItem>

          {/* Taxation */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Work />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Taxation" />}
          </ListItem>

          {/* C-Reports */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Work />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="C-Reports" />}
          </ListItem>

          {/* Co-book Tools */}
          <ListItem
            button
            component={Link}
            to="/info"
            sx={{
              color: theme.palette.text.primary,
              textDecoration: "none",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Co-book Tools" />}
          </ListItem>

          {/* Settings */}
          <ListItem button onClick={() => setOpenSettings(!openSettings)}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Settings" />}
            {openSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openSettings} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Organization Details */}
              <ListItem button onClick={() => setOpenOrganizationDetails(!openOrganizationDetails)}>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText primary="Organization Details" />
                {openOrganizationDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={openOrganizationDetails} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* Company Information */}
                  <ListItem
                    button
                    component={Link}
                    to="/settings/organizationsetting/companyinformation"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: "none",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText primary="Company Information" />
                  </ListItem>

                  {/* Contact Details */}
                  <ListItem
                    button
                    component={Link}
                    to="/settings/organizationsettings/contactdetails"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: "none",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText primary="Contact Details" />
                  </ListItem>

                  {/* Nature of Business */}
                  <ListItem
                    button
                    component={Link}
                    to="/settings/organizationsettings/natureofbusiness"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: "none",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText primary="Nature of Business" />
                  </ListItem>

                  {/* Financial Details */}
                  <ListItem
                    button
                    component={Link}
                    to="/settings/organizationsettings/financialdetails"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: "none",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText primary="Financial Details" />
                  </ListItem>

                  {/* Dropdown Management */}
                  <ListItem
                    button
                    component={Link}
                    to="/settings/global-settings/dropdown"
                    sx={{
                      color: theme.palette.text.primary,
                      textDecoration: "none",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText primary="Dropdown Management" />
                  </ListItem>
                </List>
              </Collapse>

              {/* Tax/Compliance Details */}
              <ListItem button onClick={() => setOpenTaxCompliance(!openTaxCompliance)}>
                <ListItemIcon>
                  <GavelIcon />
                </ListItemIcon>
                <ListItemText primary="Tax/Compliance Details" />
                {openTaxCompliance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
              <Collapse in={openTaxCompliance} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* GST */}
                  <ListItem
  button
  component={Link}
  to="/settings/taxcompliancedetails/GSTManagement"
  sx={{
    color: theme.palette.text.primary,
    textDecoration: "none",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }}
>
  <ListItemIcon>
    <GavelIcon />
  </ListItemIcon>
  <ListItemText primary="GST" />
</ListItem>
<ListItem
  button
  component={Link}
  to="/settings/taxcompliancedetails/vat-management"
  sx={{
    color: theme.palette.text.primary,
    textDecoration: "none",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }}
>
  <ListItemIcon>
    <GavelIcon />
  </ListItemIcon>
  <ListItemText primary="VAT" />
</ListItem>
                  <ListItem button onClick={handleSubmenuClick}>
                    <ListItemText primary="TDS" />
                  </ListItem>
                  <ListItem button onClick={handleSubmenuClick}>
                    <ListItemText primary="TCS" />
                  </ListItem>
                  <ListItem button onClick={handleSubmenuClick}>
                    <ListItemText primary="Advance TAX" />
                  </ListItem>
                </List>
              </Collapse>

              {/* Other Settings */}
              <ListItem button onClick={handleSubmenuClick}>
                <ListItemIcon>
                  <Receipt />
                </ListItemIcon>
                <ListItemText primary="Invoice" />
              </ListItem>
              <ListItem button onClick={handleSubmenuClick}>
                <ListItemIcon>
                  <Money />
                </ListItemIcon>
                <ListItemText primary="Expenses" />
              </ListItem>
              <ListItem button onClick={handleSubmenuClick}>
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Inventory" />
              </ListItem>
              <ListItem button onClick={handleSubmenuClick}>
                <ListItemIcon>
                  <BankIcon />
                </ListItemIcon>
                <ListItemText primary="Bank & Cash" />
              </ListItem>
              <ListItem button onClick={handleSubmenuClick}>
                <ListItemIcon>
                  <PayrollIcon />
                </ListItemIcon>
                <ListItemText primary="Payroll" />
              </ListItem>
              <ListItem button onClick={handleSubmenuClick}>
                <ListItemIcon>
                  <AdvancedSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Advanced Settings" />
              </ListItem>
            </List>
          </Collapse>
        </List>

        <Divider sx={{ mt: "auto" }} />

        {/* Sidebar Toggle Button - Above Logout */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: 1,
          }}
        >
          <IconButton
            onClick={toggleSidebar} // Toggle sidebar visibility
            sx={{
              color: theme.palette.text.primary,
              transform: sidebarOpen ? "rotate(360deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>

        {/* Logout Button */}
        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              color: theme.palette.text.primary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Logout" />}
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content with Top Bar */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 2,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            height: 64, // Matches the sidebar header height
            zIndex: 1,
          }}
        >
          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexGrow: 1,
              maxWidth: "500px",
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
              padding: "4px 8px",
            }}
          >
            <Search />
            <InputBase
              placeholder="Search"
              sx={{
                flexGrow: 1,
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.primary,
              }}
            />
          </Box>

          {/* User Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={user.avatar} alt={user.name} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.name}
            </Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: theme.palette.background.default,
            padding: 3,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Submenu Popover */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleSubmenuClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: 2 }}>Submenu Content Here</Typography>
      </Popover>
    </Box>
  );
};

export default Layout;