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

              setUser({
                id: currentUser.getUsername(),
                email: userAttr.email,
                role: ROLES.STUDENT, // Hardcoding to student initially, will be handled via DB or custom attributes later
                username: currentUser.getUsername(),
                cognitoSession: session
              });
            }
            setIsLoading(false);
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
        new CognitoUserAttribute({ Name: 'email', Value: email })
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
      updateProfile,
      changePassword,
      deactivateAccount
    }),
    [user, isAuthenticated, isLoading, login, registerUser, verifyOtp, resendOtp, logout, loginWithGoogle, updateProfile, changePassword, deactivateAccount]
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
