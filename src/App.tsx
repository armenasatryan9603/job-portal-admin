import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
// LOGIN DISABLED - Login component commented out
// import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
// LOGIN DISABLED - useAuth import commented out
// import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import React from 'react';
import Subscriptions from './pages/Subscriptions';
import UserDetail from './pages/UserDetail';
import UserSubscriptions from './pages/UserSubscriptions';
import Users from './pages/Users';

const AppRoutes: React.FC = () => {
  // LOGIN DISABLED - No authentication check needed
  // const { isAuthenticated, loading } = useAuth();

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-gray-600">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <Routes>
      {/* LOGIN DISABLED - Login route commented out */}
      {/* <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      /> */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <UserDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <Layout>
              <Subscriptions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-subscriptions"
        element={
          <ProtectedRoute>
            <Layout>
              <UserSubscriptions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
