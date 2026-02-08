import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Navbar from '../layouts/Navbar/Navbar';
import Users from '../pages/Users/Users';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AuthWatcher from '../components/ProtectedRoute/AuthWatcher';
import PublicRoute from '../components/ProtectedRoute/PublicRoute';
import Inventory from '../pages/Inventory/Inventory';
import { useAccessToken } from '../store/auth-store';
import ProductInventory from '../pages/Inventory/ProductInventory';
import OrderInventory from '../pages/Order/OrderInventory';
import Categories from '../pages/Categories/Categories';
import Clients from '../pages/Clients/Clients';
import Units from '../pages/Units/Units';
import SystemConfiguration from '../pages/SystemConfiguration/SystemConfiguration';
import Sales from '../pages/Sales/Sales';

// TODO: Add use state to get access_tocken from localStorage, then check if it's auth and set store
export function App() {
  const token = useAccessToken();
  const isIn = () => !!token;
  return (
    <>
      <AuthWatcher />
      {isIn() && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/:productId"
          element={
            <ProtectedRoute>
              <ProductInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <OrderInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system-configuration"
          element={
            <ProtectedRoute>
              <SystemConfiguration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/units"
          element={
            <ProtectedRoute>
              <Units />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
