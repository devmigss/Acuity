/**
 * Acuity — AWS Cognito Authentication Context
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 */

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool } from '../services/cognito';
import { ROLES } from '@/constants/roles';

export const DEMO_USERS = {
  student: { email: 'student@labgroup.acuity.app' },
  faculty: { email: 'faculty@adviser.acuity.app' },
  systemadmin: { email: 'admin@acuity.app' },
};

const normalizeRole = (roleName) => {
  if (!roleName) return ROLES.STUDENT;
  const lower = roleName.toLowerCase();
  if (lower === 'admin' || lower === 'systemadmin') return ROLES.SYSTEMADMIN;
  if (lower === 'faculty') return ROLES.FACULTY;
  return ROLES.STUDENT;
};

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for an active session on mount
  useEffect(() => {
    const checkSession = async () => {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        currentUser.getSession((err, session) => {
          if (err || !session.isValid()) {
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          // Get user attributes
          currentUser.getUserAttributes((err, attributes) => {
            if (err) {
              setUser(null);
            } else {
              // Convert attributes array to a simple object
              const userAttr = {};
              attributes.forEach((attr) => {
                userAttr[attr.getName()] = attr.getValue();
              });

              // Call the backend sync endpoint first to ensure user exists and fix any ID mismatch
              fetch('http://localhost:3000/api/auth/sync', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.getAccessToken().getJwtToken()}`
                },
                body: JSON.stringify({ 
                  email: userAttr.email,
                  firstName: userAttr.given_name || '',
                  lastName: userAttr.family_name || ''
                })
              })
              .then(() => {
                // Then fetch the REAL role from the database
                return fetch('http://localhost:3000/api/auth/me', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${session.getAccessToken().getJwtToken()}`
                  }
                });
              })
              .then(res => res.json())
              .then(data => {
                const dbUser = data.user;
                setUser({
                  id: dbUser?.id || currentUser.getUsername(),
                  email: userAttr.email,
                  role: normalizeRole(dbUser?.role?.name),
                  username: currentUser.getUsername(),
                  cognitoSession: session
                });
                setIsLoading(false);
              })
              .catch(err => {
                console.error("Failed to fetch user details from backend database:", err);
                setUser({
                  id: currentUser.getUsername(),
                  email: userAttr.email,
                  role: ROLES.STUDENT,
                  username: currentUser.getUsername(),
                  cognitoSession: session
                });
                setIsLoading(false);
              });
            }
          });
        });
      } else {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const isAuthenticated = Boolean(user);

  /**
   * Register a new user in AWS Cognito
   */
  const registerUser = useCallback(async ({ firstName, lastName, email, password }) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'given_name', Value: firstName || '' }),
        new CognitoUserAttribute({ Name: 'family_name', Value: lastName || '' })
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        setIsLoading(false);
        if (err) {
          reject(err);
          return;
        }
        resolve(result.user);
      });
    });
  }, []);

  /**
   * Verify an account using a 6-digit OTP code sent to email
   */
  const verifyOtp = useCallback(async (email, code) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        setIsLoading(false);
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }, []);

  /**
   * Native Sign In with Email and Password
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: credentials.email || credentials.username,
        Password: credentials.password,
      });

      const cognitoUser = new CognitoUser({
        Username: credentials.email || credentials.username,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              setIsLoading(false);
              reject(err);
              return;
            }
            const userAttr = {};
            attributes.forEach((attr) => {
              userAttr[attr.getName()] = attr.getValue();
            });

            // Call the backend sync endpoint first to ensure they exist
            fetch('http://localhost:3000/api/auth/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${result.getAccessToken().getJwtToken()}`
              },
              body: JSON.stringify({ 
                email: userAttr.email,
                firstName: userAttr.given_name || '',
                lastName: userAttr.family_name || ''
              })
            }).then(() => {
              // After sync, fetch the real role
              return fetch('http://localhost:3000/api/auth/me', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${result.getAccessToken().getJwtToken()}`
                }
              });
            })
            .then(res => res.json())
            .then(data => {
              const dbUser = data.user;
              const sessionUser = {
                id: dbUser?.id || cognitoUser.getUsername(),
                email: userAttr.email,
                role: normalizeRole(dbUser?.role?.name),
                username: cognitoUser.getUsername(),
                cognitoSession: result
              };
              setUser(sessionUser);
              setIsLoading(false);
              resolve(sessionUser);
            })
            .catch(err => {
              console.error("Failed to sync or fetch user from backend database:", err);
              // Fallback
              const sessionUser = {
                id: cognitoUser.getUsername(),
                email: userAttr.email,
                role: ROLES.STUDENT,
                username: cognitoUser.getUsername(),
                cognitoSession: result
              };
              setUser(sessionUser);
              setIsLoading(false);
              resolve(sessionUser);
            });
          });
        },
        onFailure: (err) => {
          setIsLoading(false);
          reject(err);
        },
      });
    });
  }, []);

  /**
   * Sign out and clear active session
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    setUser(null);
    setIsLoading(false);
  }, []);

  const resendOtp = useCallback(async (email) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        setIsLoading(false);
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    alert("Google SSO is not configured in AWS Cognito yet. Please use standard email sign in.");
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: function (data) {
          setIsLoading(false);
          resolve(data);
        },
        onFailure: function (err) {
          setIsLoading(false);
          reject(err);
        },
      });
    });
  }, []);

  const confirmPasswordReset = useCallback(async (email, verificationCode, newPassword) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: function () {
          setIsLoading(false);
          resolve();
        },
        onFailure: function (err) {
          setIsLoading(false);
          reject(err);
        },
      });
    });
  }, []);

  const updateProfile = useCallback(async () => {}, []);
  const changePassword = useCallback(async () => {}, []);
  const deactivateAccount = useCallback(async () => {}, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      registerUser,
      verifyOtp,
      resendOtp,
      logout,
      loginWithGoogle,
      forgotPassword,
      confirmPasswordReset,
      updateProfile,
      changePassword,
      deactivateAccount
    }),
    [user, isAuthenticated, isLoading, login, registerUser, verifyOtp, resendOtp, logout, loginWithGoogle, forgotPassword, confirmPasswordReset, updateProfile, changePassword, deactivateAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
