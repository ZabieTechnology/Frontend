// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Info from "./components/Info";
import Sales from "./components/Sales";
import Protected from "./components/Protected"; // Import Protected
import CompanyInformation from "./pages/settings/organizationsettings/companyinformation";
import ContactDetails from "./pages/settings/organizationsettings/contactdetails";
import NatureOfBusiness from "./pages/settings/organizationsettings/natureofbusiness";
import FinancialDetails from "./pages/settings/organizationsettings/financialdetails";
import DropdownManagement from "./pages/settings/globalsettings/DropdownManagement"; // Import DropdownManagement
import GSTManagement from "./pages/settings/taxcompliancedetails/GSTManagement"; // Import the GSTManagement component
import VATManagement from "./pages/settings/taxcompliancedetails/VATManagement";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Update token whenever it's changed in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} /> {/* Wrap Layout in Protected */}
              </Protected>
            }
          >
            {/* Nested Routes */}
            <Route index element={<Home />} /> {/* Home page */}
          </Route>

          <Route
            path="/info"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<Info />} /> {/* Info page */}
          </Route>

          <Route
            path="/sales"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<Sales />} /> {/* Sales page */}
          </Route>

          {/* Company Information Route */}
          <Route
            path="/settings/organizationsetting/companyinformation"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<CompanyInformation />} /> {/* Company Information page */}
          </Route>

          {/* Contact Details Route */}
          <Route
            path="/settings/organizationsettings/contactdetails"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<ContactDetails />} /> {/* Contact Details page */}
          </Route>

          {/* Nature of Business Route */}
          <Route
            path="/settings/organizationsettings/natureofbusiness"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<NatureOfBusiness />} /> {/* Nature of Business page */}
          </Route>

          {/* Financial Details Route */}
          <Route
            path="/settings/organizationsettings/financialdetails"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<FinancialDetails />} /> {/* Financial Details page */}
          </Route>

          {/* Dropdown Management Route */}
          <Route
            path="/settings/global-settings/dropdown"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<DropdownManagement />} /> {/* Dropdown Management page */}
          </Route>

        {/* GST Details Route */}
        <Route
            path="/settings/taxcompliancedetails/GSTManagement"
            element={
              <Protected token={token}>
                <Layout setToken={setToken} />
              </Protected>
            }
          >
            <Route index element={<GSTManagement />} /> {/* GST Details page */}
          </Route>

          <Route
  path="/settings/taxcompliancedetails/vat-management"
  element={
    <Protected token={token}>
      <Layout setToken={setToken} />
    </Protected>
  }
>
  <Route index element={<VATManagement />} /> {/* VAT Management page */}
</Route>


          {/* Default route, redirects based on authentication */}
          <Route path="/" element={<Navigate to={token ? "/home" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;