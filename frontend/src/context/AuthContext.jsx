/**
 * Acuity — AWS Cognito Authentication Context
 * REQ: ACUITY_REQUIREMENTS.md Section 7 — Authentication Requirements.
 */

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { userPool } from '../services/cognito';
import { ROLES } from '@/constants/roles';
import { errorModal } from '@/utils/alerts';

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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function getCognitoToken(user) {
  if (user?.cognitoSession?.getIdToken) {
    try {
      const token = user.cognitoSession.getIdToken().getJwtToken();
      if (token) return token;
    } catch {
      // ignore
    }
  }
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    const token = await new Promise((resolve) => {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) resolve(null);
        else resolve(session.getIdToken ? session.getIdToken().getJwtToken() : (session.getAccessToken ? session.getAccessToken().getJwtToken() : null));
      });
    });
    if (token) return token;
  }
  if (user?.email) {
    return `mock-token-${user.email}`;
  }
  return '';
}

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

              const idToken = session.getIdToken().getJwtToken();

              // Call the backend sync endpoint first to ensure user exists and fix any ID mismatch
              fetch(`${API_BASE}/auth/sync`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ 
                  firstName: userAttr.given_name || '',
                  lastName: userAttr.family_name || ''
                })
              })
              .then(res => {
                if (!res.ok) {
                  return res.json().then(errData => {
                    const err = new Error(errData.error || `Sync failed (${res.status})`);
                    err.code = errData.code;
                    err.status = res.status;
                    throw err;
                  });
                }
                // Then fetch the REAL role and profile fields from the database
                return fetch(`${API_BASE}/auth/me`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${idToken}`
                  }
                });
              })
              .then(res => {
                if (!res.ok) {
                  return res.json().then(errData => {
                    const err = new Error(errData.error || `Profile retrieval failed (${res.status})`);
                    err.code = errData.code;
                    err.status = res.status;
                    throw err;
                  });
                }
                return res.json();
              })
              .then(data => {
                const dbUser = data.user;
                const firstName = dbUser?.firstName || userAttr.given_name || '';
                const lastName = dbUser?.lastName || userAttr.family_name || '';
                setUser({
                  id: dbUser?.id || currentUser.getUsername(),
                  email: userAttr.email,
                  firstName,
                  lastName,
                  displayName: `${firstName} ${lastName}`.trim() || userAttr.email?.split('@')[0],
                  tenant: dbUser?.tenant?.institutionName || dbUser?.tenant?.name || 'University of Santo Tomas',
                  role: normalizeRole(dbUser?.role?.name),
                  username: currentUser.getUsername(),
                  cognitoSession: session,
                  avatarUrl: dbUser?.avatarUrl || null,
                  avatar: dbUser?.avatarUrl || null,
                  bio: dbUser?.bio || '',
                  department: dbUser?.department || '',
                  laboratoryGroup: dbUser?.laboratoryGroup || '',
                });
                setIsLoading(false);
              })
              .catch(err => {
                if (err.code === 'ACCOUNT_DEACTIVATED' || err.code === 'ACCESS_REVOKED' || err.code === 'TENANT_SUSPENDED') {
                  const deactivatedUser = {
                    id: currentUser.getUsername(),
                    email: userAttr.email,
                    firstName: userAttr.given_name || '',
                    lastName: userAttr.family_name || '',
                    displayName: `${userAttr.given_name || ''} ${userAttr.family_name || ''}`.trim() || userAttr.email?.split('@')[0],
                    isDeactivated: true,
                    deactivatedReason: err.code,
                    cognitoSession: session,
                  };
                  setUser(deactivatedUser);
                  setIsLoading(false);
                  return;
                }
                console.error("Session verification failed:", err);
                currentUser.signOut();
                setUser(null);
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

            const idToken = result.getIdToken().getJwtToken();

            // Call the backend sync endpoint first to ensure they exist
            fetch(`${API_BASE}/auth/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ 
                firstName: userAttr.given_name || '',
                lastName: userAttr.family_name || ''
              })
            }).then(syncRes => {
              if (!syncRes.ok) {
                return syncRes.json().then(errData => {
                  const err = new Error(errData.error || 'Account synchronization failed');
                  err.code = errData.code;
                  throw err;
                });
              }
              // After sync, fetch the real role
              return fetch(`${API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${idToken}`
                }
              });
            })
            .then(meRes => {
              if (!meRes.ok) {
                return meRes.json().then(errData => {
                  const err = new Error(errData.error || 'Failed to fetch user details');
                  err.code = errData.code;
                  throw err;
                });
              }
              return meRes.json();
            })
            .then(data => {
              const dbUser = data.user;
              const firstName = dbUser?.firstName || userAttr.given_name || '';
              const lastName = dbUser?.lastName || userAttr.family_name || '';
              const sessionUser = {
                id: dbUser?.id || cognitoUser.getUsername(),
                email: userAttr.email,
                firstName,
                lastName,
                displayName: `${firstName} ${lastName}`.trim() || userAttr.email?.split('@')[0],
                tenant: dbUser?.tenant?.institutionName || dbUser?.tenant?.name || 'University of Santo Tomas',
                role: normalizeRole(dbUser?.role?.name),
                username: cognitoUser.getUsername(),
                cognitoSession: result,
                avatarUrl: dbUser?.avatarUrl || null,
                avatar: dbUser?.avatarUrl || null,
                bio: dbUser?.bio || '',
                department: dbUser?.department || '',
                laboratoryGroup: dbUser?.laboratoryGroup || '',
              };
              setUser(sessionUser);
              setIsLoading(false);
              resolve(sessionUser);
            })
            .catch(err => {
              if (err.code === 'ACCOUNT_DEACTIVATED' || err.code === 'ACCESS_REVOKED' || err.code === 'TENANT_SUSPENDED') {
                const deactivatedUser = {
                  id: cognitoUser.getUsername(),
                  email: userAttr.email,
                  firstName: userAttr.given_name || '',
                  lastName: userAttr.family_name || '',
                  displayName: `${userAttr.given_name || ''} ${userAttr.family_name || ''}`.trim() || userAttr.email?.split('@')[0],
                  isDeactivated: true,
                  deactivatedReason: err.code,
                  cognitoSession: result,
                };
                setUser(deactivatedUser);
                setIsLoading(false);
                resolve(deactivatedUser);
                return;
              }
              console.error("Login verification failed:", err);
              cognitoUser.signOut();
              setUser(null);
              setIsLoading(false);
              reject(err);
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

  // Handle global 403 access denied and 401 session revoked security events
  useEffect(() => {
    const handleAccessDenied = async (e) => {
      const code = e.detail?.code;
      if (code === 'ACCOUNT_DEACTIVATED' || code === 'ACCESS_REVOKED' || code === 'TENANT_SUSPENDED') {
        if (typeof window !== 'undefined' && window.location.pathname !== '/account-deactivated') {
          window.location.href = '/account-deactivated';
        }
        return;
      }
      const message = e.detail?.message || 'Access Denied: Contact your administrator';
      await errorModal({
        title: 'Access Denied',
        text: message,
        confirmText: 'Sign Out'
      });
      logout();
    };

    const handleSessionRevoked = async () => {
      await logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    };

    window.addEventListener('acuity:access-denied', handleAccessDenied);
    window.addEventListener('acuity:session-revoked', handleSessionRevoked);
    return () => {
      window.removeEventListener('acuity:access-denied', handleAccessDenied);
      window.removeEventListener('acuity:session-revoked', handleSessionRevoked);
    };
  }, [logout]);

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

  const loginWithGoogle = useCallback(async (email) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setIsLoading(false);
        // Simple domain check simulation
        if (email.endsWith('@gmail.com') || email.endsWith('@yahoo.com')) {
          reject(new Error("Access Denied: Personal email domains are not allowed. Please use your institutional email."));
          return;
        }

        // Format names nicely from email (e.g. juanmiguel.gonzales -> Juan Miguel Gonzales)
        const usernamePart = (email.split('@')[0] || '').replace(/[._-]/g, ' ');
        const nameParts = usernamePart.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1));
        const defaultFirstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || 'Researcher';
        const defaultLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        // Mock a successful login with a mock token that the backend will accept
        const mockToken = 'mock-token-' + email;
        const mockSession = {
          getIdToken: () => ({ getJwtToken: () => mockToken }),
          getAccessToken: () => ({ getJwtToken: () => mockToken })
        };
        
        fetch(`${API_BASE}/auth/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({ 
            email,
            firstName: defaultFirstName,
            lastName: defaultLastName
          })
        })
        .then(() => fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        }))
        .then(res => res.json())
        .then(data => {
           const dbUser = data.user;
           const firstName = dbUser?.firstName || defaultFirstName;
           const lastName = dbUser?.lastName || defaultLastName;
           const sessionUser = {
             id: dbUser?.id || 'mock-' + email,
             email: email,
             firstName,
             lastName,
             displayName: `${firstName} ${lastName}`.trim() || email.split('@')[0],
             role: normalizeRole(dbUser?.role?.name),
             tenant: dbUser?.tenant?.institutionName || dbUser?.tenant?.name || 'University of Santo Tomas',
             username: email,
             cognitoSession: mockSession,
             avatarUrl: dbUser?.avatarUrl || null,
             avatar: dbUser?.avatarUrl || null,
             bio: dbUser?.bio || '',
             department: dbUser?.department || '',
             laboratoryGroup: dbUser?.laboratoryGroup || '',
           };
           setUser(sessionUser);
           resolve(sessionUser);
        })
        .catch(err => {
           reject(err);
        });
      }, 600);
    });
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

  const updateProfile = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const token = await getCognitoToken(user);
      
      const res = await fetch(`${API_BASE}/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        const updated = result.user || {};
        setUser(prev => {
          const newFirst = updated.firstName !== undefined ? updated.firstName : (prev?.firstName || '');
          const newLast = updated.lastName !== undefined ? updated.lastName : (prev?.lastName || '');
          const newAvatar = updated.avatarUrl !== undefined ? updated.avatarUrl : (prev?.avatarUrl || prev?.avatar || '');
          return {
            ...prev,
            firstName: newFirst,
            lastName: newLast,
            bio: updated.bio !== undefined ? updated.bio : prev?.bio,
            department: updated.department !== undefined ? updated.department : prev?.department,
            laboratoryGroup: updated.laboratoryGroup !== undefined ? updated.laboratoryGroup : prev?.laboratoryGroup,
            displayName: `${newFirst} ${newLast}`.trim() || prev?.displayName || prev?.email?.split('@')[0],
            avatarUrl: newAvatar,
            avatar: newAvatar,
          };
        });
        return result;
      } else {
        const err = new Error(result.message || result.error || 'Failed to update profile');
        err.fieldErrors = result.fieldErrors;
        err.code = result.code;
        throw err;
      }
    } catch (e) {
      console.error('Update profile error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const uploadAvatar = useCallback(async (file) => {
    setIsLoading(true);
    try {
      const token = await getCognitoToken(user);

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API_BASE}/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setUser(prev => ({
          ...prev,
          avatarUrl: result.avatarUrl,
          avatar: result.avatarUrl,
        }));
        return result;
      } else {
        const err = new Error(result.error || result.message || 'Failed to upload avatar');
        err.code = result.code;
        throw err;
      }
    } catch (e) {
      console.error('Upload avatar error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      const currentUser = userPool.getCurrentUser();
      if (!currentUser) {
        setIsLoading(false);
        // Simulation fallback for mock session in dev
        if (user?.cognitoSession?.getAccessToken()?.getJwtToken()?.startsWith('mock-token-')) {
          setTimeout(() => {
            resolve({ message: 'Password changed successfully (mock).' });
          }, 400);
          return;
        }
        reject(new Error('No active user session found.'));
        return;
      }

      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setIsLoading(false);
          reject(new Error('Session expired. Please log in again.'));
          return;
        }

        currentUser.changePassword(oldPassword, newPassword, (changeErr, result) => {
          setIsLoading(false);
          if (changeErr) {
            // Map Cognito pool error codes to user-friendly messages
            if (changeErr.code === 'NotAuthorizedException') {
              reject(new Error('Your current password is incorrect.'));
            } else if (changeErr.code === 'LimitExceededException') {
              reject(new Error('Too many attempts. Please wait a few minutes and try again.'));
            } else if (changeErr.code === 'InvalidPasswordException') {
              reject(new Error(changeErr.message || 'Password does not meet complexity requirements.'));
            } else {
              reject(new Error(changeErr.message || 'Failed to change password.'));
            }
            return;
          }
          resolve(result);
        });
      });
    });
  }, [user]);

  const signOutOtherDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getCognitoToken(user);
      if (token) {
        try {
          await fetch(`${API_BASE}/me/sessions/revoke`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (apiErr) {
          console.warn('Backend sessions revoke call warning:', apiErr);
        }
      }

      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        await new Promise((resolve) => {
          currentUser.globalSignOut({
            onSuccess: () => resolve(true),
            onFailure: (err) => {
              console.warn('Cognito globalSignOut warning:', err);
              resolve(true);
            },
          });
        });
      }

      await logout();
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [user, logout]);

  const deactivateAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getCognitoToken(user);

      const res = await fetch(`${API_BASE}/me/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmation: 'DEACTIVATE' }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || 'Failed to deactivate account.');
        err.code = data.code;
        throw err;
      }

      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        await new Promise((resolve) => {
          currentUser.globalSignOut({
            onSuccess: () => resolve(true),
            onFailure: (err) => {
              console.warn('Cognito globalSignOut on deactivate warning:', err);
              resolve(true);
            },
          });
        });
      }

      await logout();
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [user, logout]);

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
      uploadAvatar,
      changePassword,
      signOutOtherDevices,
      deactivateAccount
    }),
    [user, isAuthenticated, isLoading, login, registerUser, verifyOtp, resendOtp, logout, loginWithGoogle, forgotPassword, confirmPasswordReset, updateProfile, uploadAvatar, changePassword, signOutOtherDevices, deactivateAccount]
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
