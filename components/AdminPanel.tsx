
import React from 'react';
import { CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export const AdminPanel: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-xl">
      <div className="flex items-center text-gray-800 mb-6">
        <ShieldCheckIcon className="h-8 w-8 mr-3 text-[#004040]" />
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
      </div>
      <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <CogIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This Admin Panel is a placeholder for future development.
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              Features like meeting logs and user activity management would be implemented here.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700 mb-2">User Management (Mock)</h3>
            <p className="text-sm text-gray-500">List and manage users, roles, and permissions.</p>
            <button className="mt-3 text-sm text-[#004040] hover:text-yellow-500 font-medium">View Users &rarr;</button>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Meeting Logs (Mock)</h3>
            <p className="text-sm text-gray-500">View logs of all scheduled meetings and AI interactions.</p>
            <button className="mt-3 text-sm text-[#004040] hover:text-yellow-500 font-medium">View Logs &rarr;</button>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700 mb-2">System Settings (Mock)</h3>
            <p className="text-sm text-gray-500">Configure application-wide settings and integrations.</p>
            <button className="mt-3 text-sm text-[#004040] hover:text-yellow-500 font-medium">Configure Settings &rarr;</button>
        </div>
         <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700 mb-2">API Usage Stats (Mock)</h3>
            <p className="text-sm text-gray-500">Monitor Gemini API usage and performance.</p>
            <button className="mt-3 text-sm text-[#004040] hover:text-yellow-500 font-medium">View Stats &rarr;</button>
        </div>
      </div>
    </div>
  );
};