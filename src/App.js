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
import CompanyInformation from "./pages/settings/organizationsettings/companyinfo";
import ContactDetails from "./pages/settings/organizationsettings/contactinfo";
import NatureOfBusiness from "./pages/settings/organizationsettings/businessnature";
import FinancialDetails from "./pages/settings/organizationsettings/financialconf"; // Corrected path
import DropdownManagement from "./pages/settings/globalsettings/dropdowndata";
import GSTManagement from "./pages/settings/taxsettings/gstsettings"; // Corrected path
import VATManagement from "./pages/settings/taxsettings/vatsettings";
import TDSManagement from "./pages/settings/taxsettings/tdssettings";
import TCSManagement from "./pages/settings/taxsettings/tcssettings";
import InvoiceSettingsPage from "./pages/settings/invoicesettings/invoiceinfosettings"; // Corrected path
import QuotationSettingsPage from "./pages/settings/invoicesettings/salesquotsettings";
import OfficialDocumentSettings from "./pages/settings/globalsettings/docrules";
import COAClassifications from "./pages/settings/finance/coaclassification";

// import InvoicePreview from "./pages/settings/invoicesettings/InvoicePreview"; // Not used as a direct route

// Account Transaction Pages
import CustomerListPage from "./pages/AccountTransaction/customerlist";
import CustomerForm from "./pages/accountTransaction/customercreate";
import VendorListPage from "./pages/AccountTransaction/vendorlist";
import VendorForm from "./pages/accountTransaction/vendorcreate";
import ChartOfAccountsListPage from "./pages/accountTransaction/coalist";
import ChartOfAccountsForm from "./pages/accountTransaction/coacreate";
import StaffListPage from "./pages/AccountTransaction/stafflist";
import StaffForm from "./pages/accountTransaction/staffcreate";

// Expenses Page
import ExpenseListPage from "./pages/expenses/ExpenseListPage";
import AddExpensePage from "./pages/expenses/AddExpensePage";
import FixedAsset from "./pages/expenses/FixedAsset";

// Sales Page (Invoice was the old folder name based on comments)
import OverviewSales from "./pages/sales/overviewsales";
import SalesPage from "./pages/Sales/invoicelist";
import SalesInvoiceCreate from "./pages/sales/invoicecreate";
import Creditnotepagedash from "./pages/sales/creditnotelist";
import Creditnotecreate from "./pages/sales/creditnotecreate";
import Quotationdash from "./pages/sales/estimatelist";
import Quotecreate from "./pages/sales/estimatecreate";
import OtherPlatform from "./pages/sales/Otherplatforms"
import InvoiceDetails from "./pages/Sales/invoicesummary"

// Payment Page
import RecordPaymentPage from "./pages/payments/paymentvoucher";
import Receiptvoucher from "./pages/payments/receiptvoucher";
import ContraVoucher from "./pages/payments/contravoucher";


// Payroll Page
import Payrolllist from "./pages/payroll/Payroll";
//import AddExpensePage from "./pages/Expenses/AddExpensePage";

// Inventory Page
import Inventorylist from "./pages/inventory/inventorylist";
import InventoryCreate from "./pages/inventory/inventorycreate";
import DeliveryChallan from "./pages/inventory/deliverychallanlist";
import DeliveryChallanCrte from "./pages/inventory/deliverychallancreate";
import StockAdjustment from "./pages/inventory/stockadjustment";

// Bank Page
import BankFront from "./pages/bank/bankfrontpage";
import BankRecord from "./pages/bank/bankrecopage";
import BankOverview from "./pages/bank/bankoverview";
import AccCreditCard from "./pages/bank/creditcard";
import Cheque from "./pages/bank/cheque";
import Cash from "./pages/bank/cash";
import Loan from "./pages/bank/loan";
import Wallet from "./pages/bank/wallet";
import Ztrail from "./pages/ztrail/samplepage";


// Reimbursement Page
import Reimbursement from "./pages/reimbursement/CobookReimbursement";
import Reimbursementexclaim from "./pages/reimbursement/ExpenseClaim";
import Reimbursementmiclaim from "./pages/reimbursement/Milagechaims";



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
            <Route path="sales/*" element={<SalesPage />} />
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
            <Route path="coaclass" element={<COAClassifications />} />


            {/* Corrected Invoice Settings Route to match Layout.js link */}
            <Route path="settings/invoicesettings/InvoiceSettingsPage" element={<InvoiceSettingsPage />} />
            <Route path="settings/Finance/quotationsettings" element={<QuotationSettingsPage />} />
            <Route path="OfficaldocumentSettings" element={<OfficialDocumentSettings />} />

            {/* Account Transaction Routes */}
            <Route path="account-transaction/customer" element={<CustomerListPage />} />
            <Route path="account-transaction/customer/new" element={<CustomerForm />} />
            <Route path="account-transaction/customer/edit/:customerId" element={<CustomerForm />} />

            <Route path="account-transaction/vendor" element={<VendorListPage />} />
            <Route path="account-transaction/vendor/new" element={<VendorForm />} />
            <Route path="account-transaction/vendor/edit/:vendorId" element={<VendorForm />} />

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
            <Route path="Inventory/new" element={<InventoryCreate />} />
            <Route path="DeliveryChallan" element={<DeliveryChallan />} />
            <Route path="DeliveryChallan/new" element={<DeliveryChallanCrte />} />
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


            {/* Trail */}
            <Route path="SamplePage" element={<Ztrail />} />


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
