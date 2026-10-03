/**
 * Acuity — Account Deactivated Page (/account-deactivated)
 *
 * Standalone landing page displayed when a user account is deactivated,
 * access revoked, or tenant suspended.
 *
 * Provides:
 * - State-specific messaging (SELF, ADMIN, ACCESS_REVOKED, TENANT_SUSPENDED)
 * - Optional instant self-reactivation if within SELF_REACTIVATION_DAYS
 * - Reactivation request submission to administrators with message length guard (<=300 chars)
 * - Display of active pending request timestamp and disabled request button
 * - Clean sign-out action
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api/apiClient';
import { ROUTES } from '@/routes/routeConstants';
import { toastSuccess, toastError, showLoading, closeAlert } from '@/utils/alerts';
import Button from '@/components/ui/Button';

export default function AccountDeactivatedPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState({
    state: 'SELF',
    deactivatedBy: null,
    deactivatedAt: null,
    pendingRequest: null,
    canSelfReactivate: false,
  });
  const [fetchError, setFetchError] = useState(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await api.get('/auth/status');
      setStatusData({
        state: data.state || 'SELF',
        deactivatedBy: data.deactivatedBy || null,
        deactivatedAt: data.deactivatedAt || null,
        pendingRequest: data.pendingRequest || null,
        canSelfReactivate: Boolean(data.canSelfReactivate),
      });
    } catch (err) {
      console.error('Failed to fetch account status:', err);
      // If 401 or token is completely revoked, send to login
      if (err.status === 401) {
        logout();
        navigate(ROUTES.AUTH.LOGIN, { replace: true });
        return;
      }
      setFetchError(err.message || 'Unable to load account status.');
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSignOut = async () => {
    try {
      showLoading('Signing out...');
      await logout();
      closeAlert();
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (err) {
      closeAlert();
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  };

  const handleSelfReactivate = async () => {
    try {
      showLoading('Reactivating account...');
      await api.post('/auth/self-reactivate', {});
      closeAlert();
      toastSuccess('Your account has been reactivated.');
      // Refresh status or go to home/dashboard
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      closeAlert();
      toastError(err.message || 'Failed to reactivate account.');
      fetchStatus();
    }
  };

  const handleOpenRequestModal = async () => {
    const result = await Swal.fire({
      title: 'Request Reactivation',
      text: 'Submit a request to the system administrators to reactivate your Acuity account.',
      input: 'textarea',
      inputPlaceholder: 'Add an optional message for the administrator (max 300 characters)...',
      inputAttributes: {
        maxlength: '300',
        rows: '4',
        className:
          'w-full px-3.5 py-2.5 text-sm rounded-xl border border-surface-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all',
      },
      showCancelButton: true,
      confirmButtonText: 'Send Request',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border border-surface-200 shadow-xl bg-white p-6 font-sans text-surface-900',
        title: 'text-lg font-bold text-surface-900 mb-2 font-sans',
        htmlContainer: 'text-sm text-surface-600 mb-4 font-sans leading-relaxed',
        confirmButton:
          'px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-[#0B1F3A] hover:bg-[#071527] active:scale-95 transition-all cursor-pointer mr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        cancelButton:
          'px-5 py-2.5 rounded-xl font-medium text-sm text-surface-700 bg-surface-100 hover:bg-surface-200 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-surface-400 focus:ring-offset-2',
      },
      preConfirm: (value) => {
        const text = (value || '').trim();
        if (text.length > 300) {
          Swal.showValidationMessage('Message must be 300 characters or fewer.');
          return false;
        }
        return text;
      },
    });

    if (!result.isConfirmed) return;

    const message = result.value || '';
    setSubmittingRequest(true);

    try {
      showLoading('Submitting request...');
      await api.post('/auth/reactivation-request', { message: message || undefined });
      closeAlert();
      toastSuccess('Request sent.');
      await fetchStatus();
    } catch (err) {
      closeAlert();
      toastError(err.message || 'Failed to submit reactivation request.');
      await fetchStatus();
    } finally {
      setSubmittingRequest(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'recently';
    }
  };

  // State-specific presentation rules
  const { state, deactivatedAt, pendingRequest, canSelfReactivate } = statusData;
  const isSelf = state === 'SELF';
  const isAdminDeactivated = state === 'ADMIN';
  const isAccessRevoked = state === 'ACCESS_REVOKED';
  const isTenantSuspended = state === 'TENANT_SUSPENDED';

  const canRequest = (isSelf || isAdminDeactivated) && !isAccessRevoked && !isTenantSuspended;

  let pageTitle = 'Account Deactivated';
  let pageDescription = 'This account has been deactivated.';

  if (isSelf) {
    pageTitle = 'Account Deactivated';
    pageDescription = `You deactivated this account on ${formatDate(
      deactivatedAt
    )}. You can ask an administrator to reactivate it.`;
  } else if (isAdminDeactivated) {
    pageTitle = 'Account Deactivated';
    pageDescription = 'An administrator deactivated this account. You can send them a request.';
  } else if (isAccessRevoked) {
    pageTitle = 'Access Revoked';
    pageDescription = 'Your faculty whitelist access has been revoked. Contact your administrator.';
  } else if (isTenantSuspended) {
    pageTitle = 'Institution Account Suspended';
    pageDescription = 'Your educational institution access has been suspended. Contact your administrator.';
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          A
        </div>
        <span className="text-xl font-bold tracking-tight text-surface-900 font-sans">
          Acuity
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-surface-200 shadow-xl overflow-hidden">
        {/* Banner header with accent color */}
        <div className={`p-6 sm:p-8 text-center border-b ${
          isAccessRevoked || isTenantSuspended
            ? 'bg-rose-50/70 border-rose-100'
            : 'bg-amber-50/70 border-amber-100'
        }`}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-xs mb-4">
            {isAccessRevoked || isTenantSuspended ? (
              <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 font-sans tracking-tight">
            {pageTitle}
          </h1>
          <p className="mt-2 text-sm text-surface-600 leading-relaxed max-w-md mx-auto">
            {pageDescription}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-surface-500 font-medium">Checking reactivation status...</span>
            </div>
          ) : fetchError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {fetchError}
            </div>
          ) : (
            <>
              {/* Optional Instant Self-Reactivation (if SELF_REACTIVATION_DAYS > 0) */}
              {canSelfReactivate && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-emerald-800">
                    <span className="font-semibold block">Grace Period Active:</span>
                    You can reactivate your account immediately without waiting for administrator review.
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSelfReactivate}
                    className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                  >
                    Reactivate My Account
                  </Button>
                </div>
              )}

              {/* Pending Request Status Box */}
              {pendingRequest && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-900">
                    <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Request pending since {formatDate(pendingRequest.createdAt)}</span>
                  </div>
                  {pendingRequest.message && (
                    <div className="text-surface-600 bg-white/70 p-2.5 rounded-lg border border-amber-200/50 italic">
                      &ldquo;{pendingRequest.message}&rdquo;
                    </div>
                  )}
                  <p className="text-amber-800/80 leading-relaxed pt-1">
                    An administrator has been notified and will review your request. You will receive an update once a decision is made.
                  </p>
                </div>
              )}

              {/* Informational callout for Revoked / Suspended accounts */}
              {(isAccessRevoked || isTenantSuspended) && (
                <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 leading-relaxed">
                  Reactivation requests cannot be submitted automatically for this account state. Please contact your institutional department chair or platform administrator for resolution.
                </div>
              )}

              {/* Account details summary */}
              <div className="py-3 px-4 rounded-xl bg-surface-50 border border-surface-200/70 text-xs text-surface-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-surface-400">Account:</span>
                  <span className="font-mono font-medium text-surface-800">{user?.email || 'Authenticated User'}</span>
                </div>
                {deactivatedAt && (
                  <div className="flex justify-between">
                    <span className="text-surface-400">Deactivated on:</span>
                    <span className="text-surface-800">{formatDate(deactivatedAt)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-surface-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto cursor-pointer text-xs"
                >
                  Sign Out
                </Button>

                {canRequest && (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={Boolean(pendingRequest) || submittingRequest}
                    onClick={handleOpenRequestModal}
                    className={`w-full sm:w-auto text-xs font-semibold ${
                      pendingRequest
                        ? 'opacity-60 cursor-not-allowed bg-surface-300 text-surface-600 hover:bg-surface-300'
                        : 'bg-[#0B1F3A] hover:bg-[#071527] text-white cursor-pointer shadow-xs'
                    }`}
                  >
                    {pendingRequest ? 'Request Pending' : 'Request Reactivation'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
