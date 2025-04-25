import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import CheckInPage from './pages/CheckInPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import auth0Config from '../../auth0-config';

function App() {
  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience
      }}
    >
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<CheckInPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </Router>
    </Auth0Provider>
  );
}

export default App; 