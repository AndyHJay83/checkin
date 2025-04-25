import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const CheckInPage: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Welcome to Check-In</h1>
          <p className="mb-4">Please log in to access the check-in system.</p>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Check-In System</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Select an event to manage check-ins.</p>
      </div>
    </div>
  );
};

export default CheckInPage; 