import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // Assuming theme.js is in the same directory or src/
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout"; // Your main layout component
import Home from "./components/Home";
import Info from "./components/Info";
import Sales from "./components/Sales";
import Protected from "./components/Protected"; // Your protection HOC/component
import Expenses from "./pages/Expenses/AccountingPage";
import Expensesform from "./pages/Expenses/AddExpensePage";

// Settings Pages
import CompanyInformation from "./pages/settings/organizationsettings/companyinformation";
import ContactDetails from "./pages/settings/organizationsettings/contactdetails";
import NatureOfBusiness from "./pages/settings/organizationsettings/natureofbusiness";
import FinancialDetails from "./pages/settings/organizationsettings/financialdetails";
import DropdownManagement from "./pages/settings/globalsettings/DropdownManagement";
import GSTManagement from "./pages/settings/taxcompliancedetails/GSTManagement";
import VATManagement from "./pages/settings/taxcompliancedetails/VATManagement";
import InvoiceSettingsPage from './pages/settings/invoicesettings/InvoiceSettingsPage';

// Account Transaction Pages
import CustomerListPage from "./pages/AccountTransaction/customer"; // Assuming customer.js is the list page
import CustomerForm from "./pages/AccountTransaction/CustomerForm";   // Your customer form component
import VendorListPage from "./pages/AccountTransaction/vendor";
import ChartOfAccounts from "./pages/AccountTransaction/chartofaccounts";
import Staff from "./pages/AccountTransaction/staff";
import Staffdetails from "./pages/AccountTransaction/StaffForm";
import VendorDetailsPage from "./pages/AccountTransaction/VendorDetailsPage";
import ChartOfAccountsForm from "./pages/AccountTransaction/ChartOfAccountsForm";

// Optional: A component for 404 Not Found
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    // Listen for changes to localStorage from other tabs/windows if needed
    window.addEventListener('storage', handleStorageChange);
    // Initial check
    const storedToken = localStorage.getItem("token");
    if (token !== storedToken) {
        setToken(storedToken);
    }
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]); // Rerun if token state changes, or if localStorage changes

  // This component will be the element for the parent route.
  // Layout.js should contain an <Outlet /> from react-router-dom for child routes to render into.
  const ProtectedRoutesWrapper = () => (
    <Protected token={token}>
      <Layout setToken={setToken} /> {/* Layout component contains the UI shell and <Outlet /> */}
    </Protected>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - All children of this route will render inside Layout's <Outlet /> */}
          <Route element={<ProtectedRoutesWrapper />}>
            {/* Default protected route, e.g., dashboard or home */}
            <Route path="/home" element={<Home />} />
            {/* Add other top-level protected routes here if they also use the Layout */}
            <Route path="/info" element={<Info />} />
            <Route path="/sales" element={<Sales />} />

            {/* Settings Routes */}
            <Route path="/settings/organizationsetting/companyinformation" element={<CompanyInformation />} />
            <Route path="/settings/organizationsettings/contactdetails" element={<ContactDetails />} />
            <Route path="/settings/organizationsettings/natureofbusiness" element={<NatureOfBusiness />} />
            <Route path="/settings/organizationsettings/financialdetails" element={<FinancialDetails />} />
            <Route path="/settings/global-settings/dropdown" element={<DropdownManagement />} />
            <Route path="/settings/taxcompliancedetails/GSTManagement" element={<GSTManagement />} />
            <Route path="/settings/taxcompliancedetails/vat-management" element={<VATManagement />} />
            <Route path="/settings/invoicesettings/InvoiceSettingsPage" element={<InvoiceSettingsPage />} />

            {/* Account Transaction - Customer Routes */}
            <Route path="/account-transaction/customer" element={<CustomerListPage />} />
            <Route path="/account-transaction/customer/new" element={<CustomerForm />} />
            <Route path="/account-transaction/customer/edit/:customerId" element={<CustomerForm />} />
            {/* Account Transaction - Vendor Routes */}
            <Route path="/account-transaction/vendor" element={<VendorListPage />} />
            <Route path="/account-transaction/vendor/new" element={<VendorDetailsPage />} />
            <Route path="/account-transaction/vendor/edit/:vendorId" element={<VendorDetailsPage />} />
            {/* Account Transaction - Staff Routes */}
            <Route path="/account-transaction/staff" element={<Staff />} />
            <Route path="/account-transaction/staff/new" element={<Staffdetails />} />
            <Route path="/account-transaction/staff/edit/:staffId" element={<Staffdetails />} />
            {/* Account Transaction - Charts Routes */}
            <Route path="/account-transaction/chart-of-accounts" element={<ChartOfAccounts />} />
            <Route path="/account-transaction/chart-of-accounts/new" element={<ChartOfAccountsForm />} />
            <Route path="/account-transaction/chart-of-accounts/edit/:chartofaccountsId" element={<ChartOfAccountsForm />} />

            <Route path="/Expenses" element={<Expenses/>} />
            <Route path="/Expenses/new" element={<Expensesform/>} />
            <Route path="/Expenses/edit/:expenseId" element={<Expensesform/>} />


             {/* If you want a default page for the root of protected routes,
                 ensure /home or another path is handled, or add an index route here.
                 For example, if accessing "/" when logged in should go to "/home":
                 The Navigate component below handles this.
             */}
          </Route>

          {/* Fallback route: Navigate to /home if logged in, otherwise to /login */}
          <Route path="/" element={<Navigate replace to={token ? "/home" : "/login"} />} />

          {/* Optional: Catch-all 404 Not Found Route - place it last */}
          {/* <Route path="*" element={<ProtectedRoutesWrapper><NotFoundPage /></ProtectedRoutesWrapper>} /> */}
          {/* Or a simpler 404 without layout: <Route path="*" element={<NotFoundPage />} /> */}

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
