import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'bg-indigo-50 text-indigo-600 border-indigo-600'
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-transparent';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(
                    '/dashboard'
                  )}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/users"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(
                    '/users'
                  )}`}
                >
                  Users
                </Link>
                <Link
                  to="/subscriptions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(
                    '/subscriptions'
                  )}`}
                >
                  Subscription Plans
                </Link>
                <Link
                  to="/user-subscriptions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive(
                    '/user-subscriptions'
                  )}`}
                >
                  User Subscriptions
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

export default Layout;
