import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import Branches from "./pages/Branches";
import CalenderBooking from "./pages/CalenderBooking";
import Bookings from "./pages/Bookings";
import Packages from "./pages/Packages";
import Error from "./pages/Error";
import CustomerPackage from "./pages/CustomerPackage";
import Staff from "./pages/Staff";
import Customers from "./pages/Customers";
import AllProducts from "./pages/AllProducts";
import Orders from "./pages/Orders";
import Reviews from "./pages/Reviews";
import Tax from "./pages/Tax";
import StaffEarnings from "./pages/StaffEarnings";
import Coupon from "./pages/Coupon";
import DailyBooking from "./pages/DailyBooking";
import OrderReport from "./pages/OrderReport";
import OverallBooking from "./pages/OverallBooking";
import StaffsServices from "./pages/StaffsServices";
import StaffPayout from "./pages/StaffPayout";
import Settings from "./pages/Settings";
import AccessControl from "./pages/AccessControl";
import AppBanner from "./pages/AppBanner";
import List from "./pages/List";
import Category from "./pages/Category";
import SubCategory from "./pages/SubCategory";
import Brand from "./pages/Brand";
import Units from "./pages/Units";
import Tags from "./pages/Tags";
import ProductVariations from "./pages/ProductVariations";
import ProductCategory from "./pages/ProductCategory";
import ProductSubCategory from "./pages/ProductSubCategory";
import NotificationList from "./pages/NotificationList";
import NotificationTamplate from "./pages/NotificationTamplate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import CustomerMembership from "./pages/CustomerMembership";
import Commission from "./pages/Commission";
import QuickBooking from "./components/QuickBooking";
import Manager from "./pages/Manager";
import InvoiceDetail from "./pages/InvoiceDetail";
import ForgotPassword from "./pages/ForgotPassword";
import PasswordReset from "./pages/PasswordReset";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/quickbooking" element={<QuickBooking />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendarbooking"
          element={
            <PrivateRoute>
              <MainLayout>
                <CalenderBooking />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branch"
          element={
            <PrivateRoute>
              <MainLayout>
                <Branches />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <MainLayout>
                <Bookings />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/services/list"
          element={
            <PrivateRoute>
              <MainLayout>
                <List />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/services/category"
          element={
            <PrivateRoute>
              <MainLayout>
                <Category />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/services/sub-category"
          element={
            <PrivateRoute>
              <MainLayout>
                <SubCategory />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/package"
          element={
            <PrivateRoute>
              <MainLayout>
                <Packages />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <PrivateRoute>
              <MainLayout>
                <Membership />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customerpackage"
          element={
            <PrivateRoute>
              <MainLayout>
                <CustomerPackage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customermembership"
          element={
            <PrivateRoute>
              <MainLayout>
                <CustomerMembership />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/managers"
          element={
            <PrivateRoute>
              <MainLayout>
                <Manager />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/empoloyees"
          element={
            <PrivateRoute>
              <MainLayout>
                <Staff />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <MainLayout>
                <Customers />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/all-products"
          element={
            <PrivateRoute>
              <MainLayout>
                <AllProducts />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/brands"
          element={
            <PrivateRoute>
              <MainLayout>
                <Brand />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/categories"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProductCategory />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/sub-categories"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProductSubCategory />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/units"
          element={
            <PrivateRoute>
              <MainLayout>
                <Units />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/tags"
          element={
            <PrivateRoute>
              <MainLayout>
                <Tags />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/product-variations"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProductVariations />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <MainLayout>
                <Orders />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <PrivateRoute>
              <MainLayout>
                <Reviews />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tax"
          element={
            <PrivateRoute>
              <MainLayout>
                <Tax />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/staffearning"
          element={
            <PrivateRoute>
              <MainLayout>
                <StaffEarnings />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/coupon"
          element={
            <PrivateRoute>
              <MainLayout>
                <Coupon />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/commission"
          element={
            <PrivateRoute>
              <MainLayout>
                <Commission />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dailybooking"
          element={
            <PrivateRoute>
              <MainLayout>
                <DailyBooking />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/order-report"
          element={
            <PrivateRoute>
              <MainLayout>
                <OrderReport />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/overallbooking"
          element={
            <PrivateRoute>
              <MainLayout>
                <OverallBooking />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/staffpayout"
          element={
            <PrivateRoute>
              <MainLayout>
                <StaffPayout />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/staffservice"
          element={
            <PrivateRoute>
              <MainLayout>
                <StaffsServices />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <PrivateRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notification/notification-list"
          element={
            <PrivateRoute>
              <MainLayout>
                <NotificationList />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notification/tamplate"
          element={
            <PrivateRoute>
              <MainLayout>
                <NotificationTamplate />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/appbanner"
          element={
            <PrivateRoute>
              <MainLayout>
                <AppBanner />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/accesscontrol"
          element={
            <PrivateRoute>
              <MainLayout>
                <AccessControl />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/invoicedetails"
          element={
            <PrivateRoute>
              <MainLayout>
                <InvoiceDetail />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Error />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        style={{ zIndex: 1002 }}
      />
    </>
  );
}

export default App;
