import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Laboratory from "./pages/Laboratory";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCarts from "./pages/admin/AdminCarts";

// 读取当前登录用户
function getCurrentUser() {
  try {
    const savedUser = localStorage.getItem("liquidAlchemyCurrentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

// 检查年龄验证
function isAgeVerified() {
  return localStorage.getItem("liquidAlchemyAgeVerified") === "true";
}

// 检查是否登录
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// 检查是否管理员
function isAdminUser(user) {
  return user?.role === "admin" || user?.is_admin === true;
}

// 只需要年龄验证的页面
const AgeVerifiedRoute = ({ children }) => {
  if (!isAgeVerified()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AccountRoute = ({ children }) => {
  const location = useLocation();

  if (!isAgeVerified()) {
    return <Navigate to="/" replace />;
  }

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const user = getCurrentUser();

  if (!isAgeVerified()) {
    return <Navigate to="/" replace />;
  }

  if (!user || !isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录 / 注册页面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 普通浏览页面：只需要年龄验证，不强制登录 */}
        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={
            <AgeVerifiedRoute>
              <ProductListing />
            </AgeVerifiedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <AgeVerifiedRoute>
              <ProductDetail />
            </AgeVerifiedRoute>
          }
        />

        <Route
          path="/laboratory"
          element={
            <AgeVerifiedRoute>
              <Laboratory />
            </AgeVerifiedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <AgeVerifiedRoute>
              <Cart />
            </AgeVerifiedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <AgeVerifiedRoute>
              <Checkout />
            </AgeVerifiedRoute>
          }
        />

        <Route
          path="/payment-success"
          element={
            <AgeVerifiedRoute>
              <PaymentSuccess />
            </AgeVerifiedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <AgeVerifiedRoute>
              <Wishlist />
            </AgeVerifiedRoute>
          }
        />

        {/* 个人账户页面：需要登录 */}
        <Route
          path="/account"
          element={
            <AccountRoute>
              <Account />
            </AccountRoute>
          }
        />

        {/* 管理员页面：需要管理员身份 */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/carts"
          element={
            <AdminRoute>
              <AdminCarts />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

