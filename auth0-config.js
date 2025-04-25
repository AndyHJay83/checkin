// Auth0 Configuration
const auth0Config = {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    audience: process.env.AUTH0_AUDIENCE,
    redirectUri: window.location.origin
};

export default auth0Config; 