import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Box, Divider, InputBase, Typography, Avatar, IconButton } from "@mui/material";
import { Home, Info, Logout, Search, ChevronLeft, ChevronRight, Work, AccountBalance, AccountBalanceWallet, Receipt, Money, ListAlt, Report } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

const Layout = ({ setToken }) => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Mock user data (replace with actual data from API or state)
  const user = {
    name: username || "Guest", // Display username or fallback to "Guest"
    avatar: `https://via.placeholder.com/100x100.png?text=${username || "Guest"}`
  };

  // Toggle sidebar state
  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState); // Toggle sidebar visibility
  };

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
              <Home />
            </ListItemIcon>
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Dashboard" />}
          </ListItem>
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
            {sidebarOpen && <ListItemText sx={{ fontSize: "12px" }} disableTypography primary="Sales" />}
          </ListItem>
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
    </Box>
  );
};

export default Layout;
