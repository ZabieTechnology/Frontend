import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Info from "./components/Info";
import Protected from "./components/Protected";

// Settings Pages
import CompanyInformation from "./pages/settings/organizationsettings/companyinformation";
import ContactDetails from "./pages/settings/organizationsettings/contactdetails";
import NatureOfBusiness from "./pages/settings/organizationsettings/natureofbusiness";
import FinancialDetails from "./pages/settings/organizationsettings/financialdetails";
import DropdownManagement from "./pages/settings/globalsettings/DropdownManagement";
import GSTManagement from "./pages/settings/taxcompliancedetails/GSTManagement";
import VATManagement from "./pages/settings/taxcompliancedetails/VATManagement";
import TDSManagement from "./pages/settings/taxcompliancedetails/tds";
import TCSManagement from "./pages/settings/taxcompliancedetails/tcs";
import InvoiceSettingsPage from "./pages/settings/invoicesettings/InvoiceSettingsPage";
import QuotationSettingsPage from "./pages/settings/Finance/quotationsettings";
import OfficialDocumentSettings from "./pages/settings/globalsettings/officialdocumentsettings";
// import InvoicePreview from "./pages/settings/invoicesettings/InvoicePreview"; // Not used as a direct route

// Account Transaction Pages
import CustomerListPage from "./pages/AccountTransaction/customer";
import CustomerForm from "./pages/AccountTransaction/CustomerForm";
import VendorListPage from "./pages/AccountTransaction/vendor";

// VendorDetailsPage was pointing to vendor list, assuming it's a form like CustomerForm
import VendorForm from "./pages/AccountTransaction/VendorDetailsPage"; // Corrected: Assuming VendorDetailsPage is a form like CustomerForm
import ChartOfAccountsListPage from "./pages/AccountTransaction/chartofaccounts";
import ChartOfAccountsForm from "./pages/AccountTransaction/ChartOfAccountsForm";
import StaffListPage from "./pages/AccountTransaction/staff";
import StaffForm from "./pages/AccountTransaction/StaffForm";

// Expenses Page
import ExpenseListPage from "./pages/Expenses/ExpenseListPage";
import AddExpensePage from "./pages/Expenses/AddExpensePage";
import FixedAsset from "./pages/Expenses/FixedAsset";

// Sales Page (Invoice was the old folder name based on comments)
import OverviewSales from "./pages/Invoice/overviewsales";
import SalesPage from "./pages/Invoice/Salesinvoicedash";
import SalesInvoiceCreate from "./pages/Invoice/SalesInvoiceCreate";
import Creditnotepagedash from "./pages/Invoice/creditnotepagedash";
import Creditnotecreate from "./pages/Invoice/creditnotecreate";
import Quotationdash from "./pages/Invoice/estimatedash";
import Quotecreate from "./pages/Invoice/estimate";
import OtherPlatform from "./pages/Invoice/Otherplatforms"
import InvoiceDetails from "./pages/Invoice/SalesInvoicepreview"

// Payment Page
import RecordPaymentPage from "./pages/Payments/RecordPaymentPage";
import Receiptvoucher from "./pages/Payments/receiptvoucher";
import ContraVoucher from "./pages/Payments/contravoucher";


// Payroll Page
import Payrolllist from "./pages/Payroll/Payroll";
//import AddExpensePage from "./pages/Expenses/AddExpensePage";

// Inventory Page
import Inventorylist from "./pages/Inventory/inventorylist";
import DeliveryChallan from "./pages/Inventory/deliverychallandash";
import StockAdjustment from "./pages/Inventory/stockadjustment";

// Bank Page
import BankFront from "./pages/Bank/bankfrontpage";
import BankRecord from "./pages/Bank/bankrecopage";
import BankOverview from "./pages/Bank/bankoverview";
import AccCreditCard from "./pages/Bank/creditcard";
import Cheque from "./pages/Bank/cheque";
import Cash from "./pages/Bank/cash";
import Loan from "./pages/Bank/loan";
import Wallet from "./pages/Bank/wallet";


// Reimbursement Page
import Reimbursement from "./pages/Reimbursement/CobookReimbursement";
import Reimbursementexclaim from "./pages/Reimbursement/ExpenseClaim";
import Reimbursementmiclaim from "./pages/Reimbursement/Milagechaims";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener('storage', handleStorageChange);
    // Ensure initial state matches localStorage
    const storedToken = localStorage.getItem("token");
    if (token !== storedToken) {
        setToken(storedToken);
    }
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]); // Dependency array includes token to re-run if token changes programmatically

  const ProtectedRoutesWrapper = () => (
    <Protected token={token}>
      <Layout setToken={setToken} />
    </Protected>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoutesWrapper />}>
            {/* Redirect from root based on token */}
            <Route path="/" element={<Navigate replace to={token ? "/home" : "/login"} />} />
            <Route path="home" element={<Home />} />
            <Route path="info" element={<Info />} />

            {/* Sales Routes */}
            <Route path="Overviewsale" element={<OverviewSales />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="sales/new" element={<SalesInvoiceCreate />} />
            <Route path="CreditNote" element={<Creditnotepagedash />} />
            <Route path="CreditNote/new" element={<Creditnotecreate />} />
            <Route path="CreditNote/edit/:id" element={<Creditnotecreate />} />
            <Route path="CreditNote/view/:id" element={<Creditnotecreate />} />
            <Route path="quote" element={<Quotationdash />} />
            <Route path="quote/new" element={<Quotecreate />} />
            <Route path="OtherPlatform" element={<OtherPlatform />} />
            <Route path="/sales/invoice/:invoiceId" element={<InvoiceDetails />} />
            <Route path="sales/edit/:invoiceId" element={<SalesInvoiceCreate />} />

            {/* <Route path="sales/edit/:invoiceId" element={<CreateSalesInvoicePage />} />  // Example edit route */}


            {/* Expenses Routes */}
            <Route path="expenses" element={<ExpenseListPage />} />
            <Route path="expenses/new" element={<AddExpensePage />} />
            <Route path="expenses/edit/:expenseId" element={<AddExpensePage />} />
            <Route path="FixedAsset" element={<FixedAsset/>} />



            {/* Settings Routes */}
            <Route path="settings/organizationsetting/companyinformation" element={<CompanyInformation />} />
            <Route path="settings/organizationsettings/contactdetails" element={<ContactDetails />} />
            <Route path="settings/organizationsettings/natureofbusiness" element={<NatureOfBusiness />} />
            <Route path="settings/organizationsettings/financialdetails" element={<FinancialDetails />} />
            <Route path="settings/global-settings/dropdown" element={<DropdownManagement />} />
            <Route path="settings/taxcompliancedetails/GSTManagement" element={<GSTManagement />} />
            <Route path="settings/taxcompliancedetails/vat-management" element={<VATManagement />} />
            <Route path="tdssettings" element={<TDSManagement />} />
            <Route path="tcssettings" element={<TCSManagement />} />

            {/* Corrected Invoice Settings Route to match Layout.js link */}
            <Route path="settings/invoicesettings/InvoiceSettingsPage" element={<InvoiceSettingsPage />} />
            <Route path="settings/Finance/quotationsettings" element={<QuotationSettingsPage />} />
            <Route path="OfficaldocumentSettings" element={<OfficialDocumentSettings />} />

            {/* Account Transaction Routes */}
            <Route path="account-transaction/customer" element={<CustomerListPage />} />
            <Route path="account-transaction/customer/new" element={<CustomerForm />} />
            <Route path="account-transaction/customer/edit/:customerId" element={<CustomerForm />} />

            <Route path="account-transaction/vendor" element={<VendorListPage />} />
            <Route path="account-transaction/vendor/new" element={<VendorForm />} /> {/* Assuming VendorForm component */}
            <Route path="account-transaction/vendor/edit/:vendorId" element={<VendorForm />} /> {/* Assuming VendorForm component */}

            <Route path="account-transaction/staff" element={<StaffListPage />} />
            <Route path="account-transaction/staff/new" element={<StaffForm />} />
            <Route path="account-transaction/staff/edit/:staffId" element={<StaffForm />} />

            <Route path="account-transaction/chart-of-accounts" element={<ChartOfAccountsListPage />} />
            <Route path="account-transaction/chart-of-accounts/new" element={<ChartOfAccountsForm />} />
            <Route path="account-transaction/chart-of-accounts/edit/:accountId" element={<ChartOfAccountsForm />} />

            {/* Payment Routes */}
            <Route path="payments" element={<RecordPaymentPage />} />
            <Route path="receiptvoucher" element={<Receiptvoucher />} />
            <Route path="contravoucher" element={<ContraVoucher />} />


            {/* Payroll Routes */}
            <Route path="Payroll" element={<Payrolllist />} />

            {/* Reimbursement Routes */}
            <Route path="Reimbursement" element={<Reimbursement />} />
            <Route path="Reimbursement/eclaim" element={<Reimbursementexclaim />} />
            <Route path="Reimbursement/mclaim" element={<Reimbursementmiclaim />} />

            {/* Inventory */}
            <Route path="Inventory" element={<Inventorylist />} />
            <Route path="DeliveryChallan" element={<DeliveryChallan />} />
            <Route path="StockManagement" element={<StockAdjustment />} />

            {/* Bank */}
            <Route path="Bank" element={<BankFront />} />
            <Route path="Bank/new" element={<BankRecord />} />
            <Route path="BankOverview" element={<BankOverview />} />
            <Route path="CreditCard" element={<AccCreditCard />} />
            <Route path="Cheque" element={<Cheque />} />
            <Route path="cash" element={<Cash />} />
            <Route path="loan" element={<Loan />} />
            <Route path="Wallet" element={<Wallet />} />


            {/* Catch-all for undefined protected routes, redirect to home */}
            <Route path="*" element={<Navigate replace to="/home" />} />
          </Route>

          {/* Fallback for any other non-matched routes, redirect to login or home based on token */}
          {/* This catch-all should be outside the ProtectedRoutesWrapper if it's meant to catch truly unhandled paths */}
          <Route path="*" element={<Navigate replace to={token ? "/home" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
