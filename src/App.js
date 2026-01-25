import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// === Admin Pages ===

// === Student Pages ===

import MasterDashboard from './pages/admin/MasterDashboard';
import ExecutiveManagement from './pages/admin/ExecutiveManagement';
import ShopManagement from './pages/admin/ShopManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import ConfigurationSettings from './pages/admin/ConfigurationSettings';
import ExecutiveShopManagement from './pages/executive/ExecutiveShopManagement';
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';
import ExecutiveSellerManagement from './pages/executive/ExecutiveSellerManagement';
import ExecutiveServicesManagement from './pages/executive/ExecutiveServicesManagement';
import CustomerRegister from './components/CustomerRegister';
import NearbyShops from './pages/customers/NearbyShops';
import PurchaseHistory from './pages/customers/PurchaseHistory';
import WalletRedemption from './pages/customers/WalletRedemption';
import AddPurchase from './pages/customers/AddPurchase';
import SellerManagement from './pages/admin/SellerManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import CustomerHome from './pages/customers/CustomerHome';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Default route redirection based on role
  const getDefaultRoute = (role) => {
    switch (role) {
      case 'admin':
        return '/dashboard/super-admin/home';
      case 'executive':
        return '/dashboard/executive/home';
      case 'customer':
        return '/dashboard/customer/home';
      default:
        return '/';
    }
  };

  return (
    <Router>
      <Routes>
        {/* === LOGIN === */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={getDefaultRoute(user.role)} replace />
            ) : (
              <LoginPage setUser={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={getDefaultRoute(user.role)} replace />
            ) : (
              <CustomerRegister />
            )
          }
        />
        {/* === DASHBOARD LAYOUT (Shared) === */}
        <Route
          path="/dashboard/*"
          element={
            user ? (
              <DashboardLayout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          {/* ADMIN ROUTES */}
          <Route
            path="super-admin/home"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <MasterDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="super-admin/executives"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <ExecutiveManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="super-admin/shops"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <ShopManagement />
              </RoleProtectedRoute>
            }
          />
            <Route
            path="super-admin/sellers"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <SellerManagement />
              </RoleProtectedRoute>
            }
          />
                      <Route
            path="super-admin/services"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <ServiceManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="super-admin/customers"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <CustomerManagement />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="super-admin/settings"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin']}>
                <ConfigurationSettings />
              </RoleProtectedRoute>
            }
          />
          {/* STAFF ROUTES */}
          <Route
            path="executive/home"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <ExecutiveDashboard user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="executive/shops"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <ExecutiveShopManagement user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="executive/sellers"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <ExecutiveSellerManagement user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="executive/services"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <ExecutiveServicesManagement user={user} />
              </RoleProtectedRoute>
            }
          />
           <Route
            path="executive/nearby"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <NearbyShops user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="executive/history"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <PurchaseHistory user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="executive/redeem"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <WalletRedemption user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="executive/addpurchase"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['executive']}>
                <AddPurchase user={user} />
              </RoleProtectedRoute>
            }
          />
          {/* <Route
            path="Mytasks"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff', 'admin']}>
                <MyTasks user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="billing"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff']}>
                <Billing user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="petty-cash"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff']}>
                <PettyCash user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admission"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff']}>
                <Admission user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="manage-students"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff', 'admin']}>
                <ManageStudents user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="leave-salary"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff']}>
                <LeaveAndSalary user={user} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="leads"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['staff']}>
                <Leads user={user} />
              </RoleProtectedRoute>
            }
          /> */}
          {/* <Route
            path="manage-batches"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['admin','staff']}>
                <AdminBatches user={user}/>
              </RoleProtectedRoute>
            }
          /> */}
          {/* CUSTOMERS ROUTES */}
          <Route
            path="seller/home"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['seller']}>
                <ExecutiveDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="customer/home"
            element={
              <RoleProtectedRoute user={user} allowedRoles={['customer']}>
                <CustomerHome />
              </RoleProtectedRoute>
            }
          /> 
        </Route>

        {/* CATCH-ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
