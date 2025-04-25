import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthButton: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <span className="text-gray-700">{user?.name}</span>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Log Out
          </button>
        </>
      ) : (
        <button
          onClick={() => loginWithRedirect()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Log In
        </button>
      )}
    </div>
  );
};

export default AuthButton; 