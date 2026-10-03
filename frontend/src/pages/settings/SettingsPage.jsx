/**
 * Acuity — Account Settings Page
 *
 * REQ: ACUITY_REQUIREMENTS.md Section 11 — Profile Management
 * Strict validation, SweetAlert2 integration, and role-based field rendering.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/routes/routeConstants';
import {
  validateFirstName,
  validateLastName,
  validateBiography,
  validateDeptOrGroup,
  validateAvatarFile,
  checkPasswordPolicy,
} from '@/utils/profileValidation';
import {
  toastSuccess,
  toastError,
  toastInfo,
  confirmAction,
  confirmTyped,
  errorModal,
  showLoading,
  closeAlert,
} from '@/utils/alerts';
import { api } from '@/services/api/apiClient';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    uploadAvatar,
    changePassword,
    signOutOtherDevices,
    deactivateAccount,
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');

  // ── Initial Form Data Extraction ──
  const initialValues = useMemo(() => {
    const splitNames = (user?.displayName || '').trim().split(' ');
    return {
      firstName: user?.firstName || splitNames[0] || '',
      lastName: user?.lastName || (splitNames.length > 1 ? splitNames.slice(1).join(' ') : '') || '',
      email: user?.email || '',
      biography: user?.bio || user?.biography || '',
      avatar: user?.avatarUrl || user?.avatar || '',
      institution: user?.tenant || 'University of Santo Tomas',
      groupOrDept: user?.department || user?.laboratoryGroup || user?.group || '',
    };
  }, [user]);

  const [formData, setFormData] = useState(initialValues);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
  const [avatarInlineError, setAvatarInlineError] = useState('');

  // ── Validation & Touched State ──
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    biography: false,
    groupOrDept: false,
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync state when user profile loads or changes from server
  const [prevInitialValues, setPrevInitialValues] = useState(initialValues);
  if (prevInitialValues !== initialValues) {
    setPrevInitialValues(initialValues);
    setFormData(initialValues);
  }

  // Role detection
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'systemadmin' || user?.role === 'admin';
  const isStudent = !isFaculty && !isAdmin;

  const groupOrDeptLabel = isFaculty
    ? 'Department'
    : isStudent
    ? 'Laboratory Group'
    : null;

  // ── Dirty State Tracking ──
  const isFormDirty = useMemo(() => {
    if (selectedAvatarFile) return true;
    if (formData.avatar !== initialValues.avatar) return true;
    if (formData.firstName.trim() !== initialValues.firstName.trim()) return true;
    if (formData.lastName.trim() !== initialValues.lastName.trim()) return true;
    if (formData.biography.trim() !== initialValues.biography.trim()) return true;
    if (formData.groupOrDept.trim() !== initialValues.groupOrDept.trim()) return true;
    return false;
  }, [formData, initialValues, selectedAvatarFile]);

  // ── Unsaved Changes Guard: beforeunload ──
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  // ── Tab Switching with Unsaved Changes Guard ──
  const handleTabSwitch = async (newTab) => {
    if (newTab === activeTab) return;
    if (isFormDirty) {
      const stay = await confirmAction({
        title: 'You have unsaved changes.',
        text: 'Do you want to discard your changes and switch tabs?',
        confirmText: 'Discard changes',
        cancelText: 'Keep editing',
        danger: true,
      });
      if (!stay) {
        return; // User clicked "Keep editing"
      }
      // Revert dirty form data to initial
      setFormData(initialValues);
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl('');
      setAvatarInlineError('');
      setProfileErrors({});
      setTouched({ firstName: false, lastName: false, biography: false, groupOrDept: false });
    }
    setActiveTab(newTab);
  };

  // ── Field Validation Runner ──
  const validateField = (name, value) => {
    let error = null;
    if (name === 'firstName') {
      error = validateFirstName(value);
    } else if (name === 'lastName') {
      error = validateLastName(value);
    } else if (name === 'biography') {
      error = validateBiography(value);
    } else if (name === 'groupOrDept' && groupOrDeptLabel) {
      error = validateDeptOrGroup(value, groupOrDeptLabel);
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setProfileErrors((prev) => ({ ...prev, [name]: error || undefined }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Revalidate on change if already touched or has error
    if (touched[name] || profileErrors[name]) {
      const error = validateField(name, value);
      setProfileErrors((prev) => ({ ...prev, [name]: error || undefined }));
    }
  };

  // ── Avatar Pick & Preview Handler ──
  const handleAvatarFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarInlineError('');
    const validation = await validateAvatarFile(file);

    if (!validation.isValid) {
      setAvatarInlineError(validation.error || 'Invalid image file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedAvatarFile(file);
    setAvatarPreviewUrl(validation.dataUrl || '');
  };

  const handleCancelNewAvatar = () => {
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl('');
    setAvatarInlineError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveExistingAvatar = () => {
    handleCancelNewAvatar();
    setFormData((prev) => ({ ...prev, avatar: '' }));
  };

  // ── Profile Submit Handler ──
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Mark all touched
    setTouched({
      firstName: true,
      lastName: true,
      biography: true,
      groupOrDept: true,
    });

    // Run full validation
    const errors = {};
    const firstErr = validateFirstName(formData.firstName);
    if (firstErr) errors.firstName = firstErr;

    const lastErr = validateLastName(formData.lastName);
    if (lastErr) errors.lastName = lastErr;

    const bioErr = validateBiography(formData.biography);
    if (bioErr) errors.biography = bioErr;

    if (groupOrDeptLabel) {
      const deptErr = validateDeptOrGroup(formData.groupOrDept, groupOrDeptLabel);
      if (deptErr) errors.groupOrDept = deptErr;
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      // Focus first invalid field
      const firstInvalidKey = Object.keys(errors)[0];
      const el = document.getElementById(firstInvalidKey);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSavingProfile(true);
    setProfileErrors({});

    try {
      let finalAvatarUrl = formData.avatar;

      // 1. Upload new avatar if selected
      if (selectedAvatarFile) {
        const avatarRes = await uploadAvatar(selectedAvatarFile);
        if (avatarRes?.avatarUrl) {
          finalAvatarUrl = avatarRes.avatarUrl;
        }
      }

      // 2. Update researcher profile (strictly excluding read-only fields)
      await updateProfile({
        firstName: formData.firstName.trim().replace(/\s+/g, ' '),
        lastName: formData.lastName.trim().replace(/\s+/g, ' '),
        biography: formData.biography.trim(),
        department: isFaculty ? formData.groupOrDept.trim().replace(/\s+/g, ' ') : undefined,
        laboratoryGroup: isStudent ? formData.groupOrDept.trim().replace(/\s+/g, ' ') : undefined,
        avatarUrl: finalAvatarUrl,
      });

      // Reset file staging
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl('');
      setAvatarInlineError('');

      // Show user-friendly toast outcome
      toastSuccess('Profile updated.');
    } catch (err) {
      const fieldErrors = err.fieldErrors || err.response?.data?.fieldErrors;
      if (fieldErrors) {
        setProfileErrors(fieldErrors);
        const firstInvalidKey = Object.keys(fieldErrors)[0];
        const el = document.getElementById(firstInvalidKey);
        if (el) el.focus();
      } else {
        errorModal({
          title: 'Unable to Save Profile',
          text: err.response?.data?.error || err.message || 'Something went wrong on our side. Please try again.',
        });
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Password Form State & Handlers ──
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Live Password Policy Checklist
  const passwordPolicy = useMemo(() => {
    return checkPasswordPolicy(passwordData.newPassword);
  }, [passwordData.newPassword]);

  // Detect if user logged in through Google SSO
  const isGoogleAccount = useMemo(() => {
    const token = user?.cognitoSession?.getAccessToken()?.getJwtToken() || '';
    return token.startsWith('mock-token-') || user?.email?.includes('@ust.edu.ph') && !user?.cognitoSession?.refreshToken;
  }, [user]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Please enter your current password.';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Please enter a new password.';
    } else {
      const { minLength, hasUpper, hasLower, hasNumber, hasSpecial } = passwordPolicy;
      if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        errors.newPassword = 'Password does not meet all security requirements listed below.';
      } else if (passwordData.newPassword === passwordData.currentPassword) {
        errors.newPassword = 'New password cannot be the same as your current password.';
      }
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toastSuccess('Password changed successfully.');
    } catch (err) {
      setPasswordErrors({ currentPassword: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Session Management: Sign Out of All Devices ──
  const handleSignOutAllDevices = async () => {
    const confirmed = await confirmAction({
      title: 'Sign Out of All Devices?',
      text: 'This will sign you out of all devices and browsers, including this device. You will need to sign in again to access Acuity.',
      confirmText: 'Sign Out Everywhere',
      cancelText: 'Cancel',
      danger: true,
    });

    if (!confirmed) return;

    try {
      showLoading('Signing out of all devices...');
      await signOutOtherDevices();
      closeAlert();
      toastInfo('Signed out of all devices.');
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (err) {
      closeAlert();
      toastError(err.message || 'Failed to revoke active sessions.');
    }
  };

  // ── Account Deactivation Handler ──
  const handleDeactivateAccount = async () => {
    let projectWarning = '';
    try {
      const projectsRes = await api.get('/projects');
      const list = Array.isArray(projectsRes) ? projectsRes : projectsRes?.projects || [];
      const ownedProjects = list.filter((p) => p.ownerId === user?.id || p.owner?.id === user?.id);
      if (ownedProjects.length > 0) {
        projectWarning = `\n\nWarning: You currently own ${ownedProjects.length} active research project${
          ownedProjects.length > 1 ? 's' : ''
        }. Deactivating your account will leave these projects without an active owner.`;
      }
    } catch {
      // Proceed without blocking if project check cannot be completed
    }

    const deactivationText = `Sign-ins are disabled; submitted projects and annotations stay intact for the lab group; an administrator must approve any reactivation.${projectWarning}`;

    const confirmed = await confirmTyped({
      title: 'Confirm Deactivation',
      text: deactivationText,
      expected: 'DEACTIVATE',
      confirmText: 'Deactivate Account',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      showLoading('Deactivating account...');
      await deactivateAccount();
      closeAlert();
      toastInfo('Your account has been deactivated.');
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } catch (err) {
      closeAlert();
      errorModal({
        title: 'Deactivation Failed',
        text: err.message || 'Failed to deactivate account.',
      });
    }
  };

  // ── Bio Character Counter Colors ──
  const bioLen = formData.biography.length;
  const bioCounterClass =
    bioLen >= 500
      ? 'text-danger-600 font-bold'
      : bioLen >= 450
      ? 'text-amber-600 font-semibold'
      : 'text-surface-400';

  // Has errors in profile form
  const hasProfileErrors = Object.values(profileErrors).some(Boolean);

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your researcher profile, password credentials, and account security."
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-surface-200 gap-6" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          onClick={() => handleTabSwitch('profile')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          onClick={() => handleTabSwitch('security')}
          className={`pb-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
            activeTab === 'security'
              ? 'border-primary-600 text-primary-900'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Security &amp; Account
        </button>
      </div>

      {/* ── 1. Profile Tab ── */}
      {activeTab === 'profile' && (
        <Card
          title="Researcher Profile"
          subtitle="Your information visible within your research cohort and adviser review workflows."
        >
          <form onSubmit={handleProfileSubmit} noValidate className="space-y-6">
            {/* Avatar & Photo Action Area */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-surface-100">
              {/* Clickable Avatar Preview */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-20 h-20 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 shrink-0 cursor-pointer overflow-hidden shadow-xs"
                title="Click to upload a new avatar photo"
                aria-label="Upload new avatar photo"
              >
                {avatarPreviewUrl || formData.avatar ? (
                  <img
                    src={avatarPreviewUrl || formData.avatar}
                    alt={user?.displayName || 'User Avatar'}
                    className="w-full h-full rounded-full object-cover border-2 border-surface-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl border-2 border-primary-200 shadow-inner">
                    {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                {/* Hover Camera Icon */}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <svg className="w-6 h-6 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileSelected}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    id="avatar-file-input"
                    aria-describedby="avatar-rules"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer"
                  >
                    {avatarPreviewUrl ? 'Change photo' : 'Upload new photo'}
                  </Button>

                  {avatarPreviewUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelNewAvatar}
                      className="text-surface-600 hover:text-surface-900 cursor-pointer"
                    >
                      Cancel
                    </Button>
                  ) : formData.avatar ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveExistingAvatar}
                      className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 cursor-pointer"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>

                <p id="avatar-rules" className="text-xs text-surface-400">
                  Recommended format: JPG, PNG, or WebP. Max file size 5 MB.
                </p>

                {avatarInlineError && (
                  <p className="text-xs text-danger-600 font-medium" role="alert">
                    {avatarInlineError}
                  </p>
                )}
              </div>

              {/* Role Badge */}
              <div className="sm:ml-auto text-left sm:text-right">
                <div className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Account Role</div>
                <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-bold capitalize">
                  {user?.role === 'systemadmin' || user?.role === 'admin'
                    ? 'System Admin'
                    : isFaculty
                    ? 'Faculty Adviser'
                    : 'Student'}
                </div>
              </div>
            </div>

            {/* Responsive Two-Column Layout: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="e.g., Juan"
                  value={formData.firstName}
                  onChange={handleProfileChange}
                  onBlur={handleBlur}
                  error={profileErrors.firstName}
                  autoComplete="given-name"
                  aria-invalid={Boolean(profileErrors.firstName)}
                  aria-describedby={profileErrors.firstName ? 'firstName-error' : undefined}
                  required
                />
              </div>

              <div>
                <Input
                  label="Last Name"
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="e.g., Dela Cruz"
                  value={formData.lastName}
                  onChange={handleProfileChange}
                  onBlur={handleBlur}
                  error={profileErrors.lastName}
                  autoComplete="family-name"
                  aria-invalid={Boolean(profileErrors.lastName)}
                  aria-describedby={profileErrors.lastName ? 'lastName-error' : undefined}
                  required
                />
              </div>
            </div>

            {/* Email Address (Read-only, tied to auth identity) */}
            <div>
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                helpText="Email address is tied to your login identity and cannot be edited directly."
                className="opacity-75 cursor-not-allowed bg-surface-50"
              />
            </div>

            {/* Biography Multiline Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="biography" className="text-sm font-medium text-surface-700">
                  Biography
                </label>
                <span
                  className={`text-xs ${bioCounterClass}`}
                  aria-live={bioLen >= 450 ? 'polite' : 'off'}
                >
                  {bioLen} / 500 characters
                </span>
              </div>
              <textarea
                id="biography"
                name="biography"
                rows={4}
                maxLength={500}
                value={formData.biography}
                onChange={handleProfileChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(profileErrors.biography)}
                aria-describedby={profileErrors.biography ? 'biography-error' : 'biography-desc'}
                placeholder="Share your research focus, laboratory specialization, or thesis background..."
                className={`w-full py-2.5 px-3.5 rounded-lg border bg-white text-surface-900 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 transition-colors resize-y leading-relaxed ${
                  profileErrors.biography
                    ? 'border-danger-500 focus:ring-danger-500/20'
                    : 'border-surface-300 focus:ring-primary-500/20 focus:border-primary-500'
                }`}
              />
              {profileErrors.biography ? (
                <p id="biography-error" className="text-xs text-danger-600 font-medium" role="alert">
                  {profileErrors.biography}
                </p>
              ) : (
                <p id="biography-desc" className="text-xs text-surface-500">
                  Brief summary displayed to advisers and collaborators on review queues and project rosters.
                </p>
              )}
            </div>

            {/* Academic Institution (Read-Only) and Role-dependent Dept / Lab Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <Input
                  label="Academic Institution / Tenant"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  disabled
                  helpText="Assigned by institutional registration."
                  className="opacity-75 cursor-not-allowed bg-surface-50"
                />
              </div>

              {groupOrDeptLabel && (
                <div>
                  <Input
                    label={groupOrDeptLabel}
                    id="groupOrDept"
                    name="groupOrDept"
                    value={formData.groupOrDept}
                    onChange={handleProfileChange}
                    onBlur={handleBlur}
                    error={profileErrors.groupOrDept}
                    aria-invalid={Boolean(profileErrors.groupOrDept)}
                    aria-describedby={profileErrors.groupOrDept ? 'groupOrDept-error' : undefined}
                    placeholder={
                      isFaculty
                        ? 'e.g., Department of Biological Sciences'
                        : 'e.g., Molecular Microbiology Lab'
                    }
                  />
                </div>
              )}
            </div>

            {/* Save Profile Button */}
            <div className="pt-3 border-t border-surface-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={isSavingProfile || isLoading}
                disabled={!isFormDirty || hasProfileErrors || isSavingProfile}
                className="bg-[#0B1F3A] hover:bg-[#071527] text-white px-6 font-semibold shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── 2. Security & Account Tab ── */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card
            title="Change Password"
            subtitle="Follows standard AWS Cognito password security policy."
          >
            {isGoogleAccount ? (
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 leading-relaxed flex items-center gap-3">
                <svg className="w-5 h-5 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <span>
                  Passwords for Google-authenticated accounts are managed through your Google account. Password change via Acuity is disabled.
                </span>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
                {/* Current Password */}
                <div className="relative">
                  <Input
                    label="Current Password"
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={passwordErrors.currentPassword}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                    }
                    className="absolute right-3 top-[34px] text-xs text-surface-400 hover:text-surface-700 cursor-pointer"
                  >
                    {showPasswords.current ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div className="relative">
                    <Input
                      label="New Password"
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      error={passwordErrors.newPassword}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute right-3 top-[34px] text-xs text-surface-400 hover:text-surface-700 cursor-pointer"
                    >
                      {showPasswords.new ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      error={passwordErrors.confirmPassword}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                      }
                      className="absolute right-3 top-[34px] text-xs text-surface-400 hover:text-surface-700 cursor-pointer"
                    >
                      {showPasswords.confirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Password Policy Live Requirements Checklist */}
                <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200 space-y-2">
                  <div className="text-xs font-semibold text-surface-700">Password Requirements:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    <div className={`flex items-center gap-1.5 ${passwordPolicy.minLength ? 'text-emerald-700 font-medium' : 'text-surface-500'}`}>
                      <span>{passwordPolicy.minLength ? '✓' : '○'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordPolicy.hasUpper ? 'text-emerald-700 font-medium' : 'text-surface-500'}`}>
                      <span>{passwordPolicy.hasUpper ? '✓' : '○'}</span>
                      <span>At least one uppercase letter (A–Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordPolicy.hasLower ? 'text-emerald-700 font-medium' : 'text-surface-500'}`}>
                      <span>{passwordPolicy.hasLower ? '✓' : '○'}</span>
                      <span>At least one lowercase letter (a–z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordPolicy.hasNumber ? 'text-emerald-700 font-medium' : 'text-surface-500'}`}>
                      <span>{passwordPolicy.hasNumber ? '✓' : '○'}</span>
                      <span>At least one number (0–9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordPolicy.hasSpecial ? 'text-emerald-700 font-medium' : 'text-surface-500'}`}>
                      <span>{passwordPolicy.hasSpecial ? '✓' : '○'}</span>
                      <span>At least one special character</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isChangingPassword || isLoading}
                    className="bg-[#0B1F3A] hover:bg-[#071527] text-white px-6 font-semibold shadow-xs cursor-pointer"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Active Sessions & Sign Out of All Devices Card */}
          <Card
            title="Session Management"
            subtitle="Manage your active logins across browser devices."
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-50 border border-surface-200">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-surface-900">Sign Out of All Devices</div>
                <div className="text-xs text-surface-500">
                  Revokes all active sessions across all devices and browsers, including this current device.
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSignOutAllDevices}
                className="shrink-0 cursor-pointer"
              >
                Sign Out of All Devices
              </Button>
            </div>
          </Card>

          {/* Danger Zone: Account Deactivation (Hidden for System Administrators) */}
          {!isAdmin && (
            <div className="bg-white rounded-xl border border-danger-200/80 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5 max-w-xl">
                  <h3 className="text-sm font-bold text-surface-900">Deactivate Account</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">
                    This action flags your account as inactive and immediately disables future sign-ins. Your submitted projects and annotations will remain intact for your laboratory group.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivateAccount}
                  className="shrink-0 text-danger-600 border-danger-300 hover:bg-danger-50 hover:border-danger-400 hover:text-danger-700 font-semibold cursor-pointer"
                >
                  Deactivate Account
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
