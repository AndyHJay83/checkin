// Auth0 Configuration
interface Auth0Config {
  domain: string;
  clientId: string;
  audience: string;
  redirectUri: string;
}

const auth0Config: Auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
  redirectUri: window.location.origin
};

export default auth0Config; 