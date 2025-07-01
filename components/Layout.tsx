
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { APP_NAME, LOGO_URL } from '../constants';
import { Squares2X2Icon, ChatBubbleLeftEllipsisIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
}

const SidebarLink: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
        isActive ? 'bg-[#FFDF00] text-[#004040]' : 'text-gray-100 hover:bg-yellow-300 hover:text-[#004040]'
      }`
    }
  >
    <Icon className="h-6 w-6 mr-3" />
    {label}
  </NavLink>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#004040] text-white flex flex-col p-4 space-y-2">
        <div className="px-4 py-2 mb-6">
          <img src={LOGO_URL} alt={`${APP_NAME} Logo`} className="h-12 w-auto" />
        </div>
        <nav className="flex-grow space-y-1">
          <SidebarLink to="/dashboard" icon={Squares2X2Icon} label="Dashboard" />
          <SidebarLink to="/ai-assistant" icon={ChatBubbleLeftEllipsisIcon} label="AI Assistant" />
          {currentUser?.isAdmin && (
            <SidebarLink to="/admin" icon={Cog6ToothIcon} label="Admin Panel" />
          )}
        </nav>
        <div className="mt-auto">
           <button
            onClick={handleLogoutClick}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-100 hover:bg-yellow-300 hover:text-[#004040] transition-colors duration-150 ease-in-out"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">{APP_NAME}</h1>
            {currentUser && (
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium text-[#004040]">{currentUser.email}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
