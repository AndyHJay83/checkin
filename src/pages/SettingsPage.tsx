import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth0();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">User Profile</h2>
          <p className="text-gray-600">Name: {user?.name}</p>
          <p className="text-gray-600">Email: {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 