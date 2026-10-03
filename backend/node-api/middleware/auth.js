const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { prisma } = require('../utils/db');

// Create the Cognito ID token verifier
let verifier = null;
if (process.env.AWS_COGNITO_USER_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  try {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      tokenUse: 'id',
      clientId: process.env.AWS_COGNITO_CLIENT_ID,
    });
  } catch (err) {
    console.warn('Cognito verifier initialization warning:', err.message);
  }
}

/**
 * Creates authentication middleware with optional flags (e.g. allowUnsynced, allowInactive)
 */
function createAuthMiddleware(options = {}) {
  const allowUnsynced = Boolean(options.allowUnsynced);
  const allowInactive = Boolean(options.allowInactive);

  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 'UNAUTHORIZED', error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    let payload = null;

    // 1. Mock token handling for development & test environments
    if (process.env.NODE_ENV !== 'production' && token.startsWith('mock-token-')) {
      if (token === 'mock-token-noemail') {
        payload = {
          sub: 'cognito-mock-noemail',
          email_verified: true,
          iat: Math.floor(Date.now() / 1000),
        };
      } else {
        // Format can be: mock-token-email@domain.com, mock-token-unverified-email@domain.com,
        // or mock-token-iat-{timestamp}-{email}
        const isUnverified = token.startsWith('mock-token-unverified-');
        let rawEmail = isUnverified
          ? token.replace('mock-token-unverified-', '')
          : token.replace('mock-token-', '');

        let iat = Math.floor(Date.now() / 1000);
        if (rawEmail.startsWith('iat-')) {
          const match = rawEmail.match(/^iat-(\d+)-(.*)$/);
          if (match) {
            iat = parseInt(match[1], 10);
            rawEmail = match[2];
          }
        }

        payload = {
          sub: `cognito-mock-${rawEmail}`,
          email: rawEmail,
          email_verified: !isUnverified,
          given_name: 'Mock',
          family_name: 'User',
          iat,
        };
      }
    } else {
      // 2. Real Cognito ID Token Verification
      if (!verifier) {
        return res.status(500).json({ code: 'AUTH_CONFIG_ERROR', error: 'Cognito verifier is not configured.' });
      }

      try {
        payload = await verifier.verify(token);
      } catch (err) {
        console.error('Cognito ID token verification failed:', err.message);
        return res.status(401).json({ code: 'UNAUTHORIZED', error: 'Unauthorized: Invalid or expired token' });
      }
    }

    // 3. Reject if email is missing or email_verified !== true
    if (!payload.email) {
      return res.status(401).json({ code: 'UNAUTHORIZED', error: 'Token missing verified email claim' });
    }

    if (payload.email_verified !== true && payload.email_verified !== 'true') {
      return res.status(401).json({ code: 'UNAUTHORIZED', error: 'Email must be verified to access this resource' });
    }

    // Attach raw verified token claims to request
    req.user = payload;

    // 4. Query PostgreSQL for user record where cognitoId = sub (or email in dev)
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { cognitoId: payload.sub },
            { email: payload.email },
          ],
        },
        include: { role: true, tenant: true },
      });

      // 5. User not found in database
      if (!user) {
        if (allowUnsynced) {
          return next();
        }
        return res.status(401).json({
          code: 'NOT_SYNCED',
          error: 'User account not synced to local database',
        });
      }

      // If user has placeholder seed cognitoId and real token arrived, link it
      if (user.cognitoId.startsWith('seed:') && payload.sub && !payload.sub.startsWith('seed:')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { cognitoId: payload.sub },
        });
        user.cognitoId = payload.sub;
      }

      // 5.5 Check if user account is deactivated
      if (user.isActive === false && !allowInactive) {
        return res.status(403).json({
          code: 'ACCOUNT_DEACTIVATED',
          error: 'This account has been deactivated.',
        });
      }

      // 5.6 Check session revocation (sessionsValidAfter)
      if (payload.iat && user.sessionsValidAfter) {
        const tokenIssuedAtSec = payload.iat;
        const validAfterSec = Math.floor(user.sessionsValidAfter.getTime() / 1000);
        if (tokenIssuedAtSec < validAfterSec) {
          return res.status(401).json({
            code: 'SESSION_REVOKED',
            error: 'Session revoked. Please sign in again.',
          });
        }
      }

      // 7. Check if tenant is suspended (non-admin only)
      if (user.role?.name !== 'Admin' && user.tenant && user.tenant.isActive === false) {
        return res.status(403).json({
          code: 'TENANT_SUSPENDED',
          error: 'Your institution account has been suspended.',
        });
      }

      // Attach resolved DB user record to request
      req.dbUser = user;
      return next();
    } catch (dbErr) {
      console.error('Error resolving user in requireAuth:', dbErr);
      return res.status(500).json({ code: 'SERVER_ERROR', error: 'Failed to verify user session in database' });
    }
  };
}

/**
 * Main requireAuth middleware.
 * Supports:
 * - router.use(requireAuth)
 * - router.post('/sync', requireAuth({ allowUnsynced: true }))
 * - router.get('/status', requireAuth.allowInactive)
 */
const requireAuth = (reqOrOptions, res, next) => {
  if (
    typeof reqOrOptions === 'object' &&
    (reqOrOptions.allowUnsynced !== undefined || reqOrOptions.allowInactive !== undefined)
  ) {
    return createAuthMiddleware(reqOrOptions);
  }
  return createAuthMiddleware({})(reqOrOptions, res, next);
};

requireAuth.allowUnsynced = createAuthMiddleware({ allowUnsynced: true });
requireAuth.allowInactive = createAuthMiddleware({ allowInactive: true });

module.exports = {
  requireAuth,
  createAuthMiddleware,
};
