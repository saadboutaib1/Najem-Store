import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import { getAdminText } from './i18n/admin.js';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import Categories from './pages/Categories.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminCategoryForm from './pages/admin/AdminCategoryForm.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminProductForm from './pages/admin/AdminProductForm.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminOrderDetails from './pages/admin/AdminOrderDetails.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';

function PublicLayout() {
  return (
    <>
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function DocumentTitle() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    if (!pathname.startsWith('/admin')) {
      document.title = 'Najem Store';
      return;
    }

    const ta = (path, fallback) => getAdminText(language, path, fallback);
    let pageTitle = ta('common.admin');

    if (pathname === '/admin/login') pageTitle = ta('login.title');
    else if (pathname.startsWith('/admin/dashboard')) pageTitle = ta('common.dashboard');
    else if (pathname.startsWith('/admin/products/create')) pageTitle = ta('products.createTitle');
    else if (pathname.startsWith('/admin/products/edit')) pageTitle = ta('products.editTitle');
    else if (pathname.startsWith('/admin/products')) pageTitle = ta('common.products');
    else if (pathname.startsWith('/admin/categories/create')) pageTitle = ta('categories.createTitle');
    else if (pathname.startsWith('/admin/categories/edit')) pageTitle = ta('categories.editTitle');
    else if (pathname.startsWith('/admin/categories')) pageTitle = ta('common.categories');
    else if (pathname.startsWith('/admin/orders/')) pageTitle = ta('orders.details');
    else if (pathname.startsWith('/admin/orders')) pageTitle = ta('common.orders');
    else if (pathname.startsWith('/admin/settings')) pageTitle = ta('common.settings');
    else if (pathname.startsWith('/admin/profile')) pageTitle = ta('common.profile');

    document.title = `Najem Store | ${pageTitle}`;
  }, [language, pathname]);

  return null;
}

export default function App() {
  return (
    <div className="app-shell">
      <DocumentTitle />
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/create" element={<AdminCategoryForm />} />
          <Route path="categories/edit/:id" element={<AdminCategoryForm />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/create" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </div>
  );
}
