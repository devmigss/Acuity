const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Create the verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  tokenUse: "access", // Or "id" if you are passing the ID token
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
});

/**
 * Middleware to protect routes and verify AWS Cognito JWTs
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const payload = await verifier.verify(token);
    
    // Attach the user information to the request object
    req.user = payload;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { requireAuth };
