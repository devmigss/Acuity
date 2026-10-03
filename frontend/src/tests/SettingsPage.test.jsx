import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from '../pages/settings/SettingsPage';
import * as AuthContext from '../context/AuthContext';
import * as alerts from '../utils/alerts';

// Mock alerts
vi.mock('../utils/alerts', () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  confirmAction: vi.fn(),
  confirmTyped: vi.fn(),
  errorModal: vi.fn(),
  showLoading: vi.fn(),
  closeAlert: vi.fn(),
}));

describe('SettingsPage Component Tests (§2 & §7 Spec)', () => {
  let mockUser;
  let mockUpdateProfile;
  let mockUploadAvatar;

  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      id: 'test-user-1',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan@test.edu',
      bio: 'Existing biography',
      role: 'Student',
      tenant: 'Acuity Dev Institution',
      laboratoryGroup: 'Group Alpha',
      avatarUrl: '',
    };

    mockUpdateProfile = vi.fn().mockResolvedValue({ success: true });
    mockUploadAvatar = vi.fn().mockResolvedValue({ success: true, avatarUrl: 'new-avatar.webp' });

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      uploadAvatar: mockUploadAvatar,
      changePassword: vi.fn(),
      signOutOtherDevices: vi.fn(),
      deactivateAccount: vi.fn(),
      isLoading: false,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
  };

  it('1. Save button is disabled when form is clean (pristine/unchanged)', () => {
    renderComponent();
    const saveButton = screen.getByRole('button', { name: /save profile changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('2. No error is shown before a field has been blurred (touched)', () => {
    renderComponent();
    const firstNameInput = screen.getByLabelText(/first name/i);

    // Modify input without blurring
    fireEvent.change(firstNameInput, { target: { value: '' } });

    // Inline error should not be visible before blur
    expect(screen.queryByText(/please enter your first name/i)).not.toBeInTheDocument();
  });

  it('3. Error displays on blur and clears dynamically when fixed', async () => {
    renderComponent();
    const firstNameInput = screen.getByLabelText(/first name/i);

    // Clear value and blur
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.blur(firstNameInput);

    // Error message now visible
    expect(screen.getByText(/please enter your first name/i)).toBeInTheDocument();
    expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');

    // Save button must be disabled when form is invalid
    const saveButton = screen.getByRole('button', { name: /save profile changes/i });
    expect(saveButton).toBeDisabled();

    // Type valid name to fix error
    fireEvent.change(firstNameInput, { target: { value: 'Maria' } });

    // Error should immediately clear
    expect(screen.queryByText(/please enter your first name/i)).not.toBeInTheDocument();
    expect(firstNameInput).toHaveAttribute('aria-invalid', 'false');
    expect(saveButton).not.toBeDisabled();
  });

  it('4. Shows unsaved-changes confirmation modal when switching tabs with dirty form', async () => {
    alerts.confirmAction.mockResolvedValue(false); // User clicks "Keep editing"

    renderComponent();
    const firstNameInput = screen.getByLabelText(/first name/i);

    // Make form dirty
    fireEvent.change(firstNameInput, { target: { value: 'ModifiedName' } });

    // Click Security tab
    const securityTab = screen.getByRole('tab', { name: /security & account/i });
    fireEvent.click(securityTab);

    // Confirm dialog was triggered
    expect(alerts.confirmAction).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringMatching(/unsaved changes/i),
        confirmText: 'Discard changes',
        cancelText: 'Keep editing',
      })
    );

    // Since user canceled discard, active tab remains Profile
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  });

  it('5. Maps server 400 fieldErrors onto the right inputs', async () => {
    const serverErr = new Error('Please fix the highlighted fields.');
    serverErr.fieldErrors = {
      firstName: 'Server says first name is invalid.',
    };
    mockUpdateProfile.mockRejectedValue(serverErr);

    renderComponent();
    const firstNameInput = screen.getByLabelText(/first name/i);

    // Change value so save button enables
    fireEvent.change(firstNameInput, { target: { value: 'ValidName' } });
    const saveButton = screen.getByRole('button', { name: /save profile changes/i });
    expect(saveButton).not.toBeDisabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Server says first name is invalid.')).toBeInTheDocument();
      expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('6. Sign Out of All Devices triggers confirmAction and executes signOutOtherDevices', async () => {
    alerts.confirmAction.mockResolvedValue(true);
    const mockSignOutOther = vi.fn().mockResolvedValue(true);
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      uploadAvatar: mockUploadAvatar,
      changePassword: vi.fn(),
      signOutOtherDevices: mockSignOutOther,
      deactivateAccount: vi.fn(),
      isLoading: false,
    });

    renderComponent();

    // Switch to Security tab
    const securityTab = screen.getByRole('tab', { name: /security & account/i });
    fireEvent.click(securityTab);

    const signOutBtn = screen.getByRole('button', { name: /sign out of all devices/i });
    expect(signOutBtn).toBeInTheDocument();

    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(alerts.confirmAction).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/sign out of all devices/i),
          confirmText: 'Sign Out Everywhere',
        })
      );
      expect(mockSignOutOther).toHaveBeenCalled();
    });
  });

  it('7. Deactivate Account triggers confirmTyped with expected DEACTIVATE', async () => {
    alerts.confirmTyped.mockResolvedValue(true);
    const mockDeactivate = vi.fn().mockResolvedValue({ message: 'Deactivated' });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
      uploadAvatar: mockUploadAvatar,
      changePassword: vi.fn(),
      signOutOtherDevices: vi.fn(),
      deactivateAccount: mockDeactivate,
      isLoading: false,
    });

    renderComponent();

    // Switch to Security tab
    const securityTab = screen.getByRole('tab', { name: /security & account/i });
    fireEvent.click(securityTab);

    const deactivateBtn = screen.getByRole('button', { name: /deactivate account/i });
    expect(deactivateBtn).toBeInTheDocument();

    fireEvent.click(deactivateBtn);

    await waitFor(() => {
      expect(alerts.confirmTyped).toHaveBeenCalledWith(
        expect.objectContaining({
          expected: 'DEACTIVATE',
          confirmText: 'Deactivate Account',
        })
      );
      expect(mockDeactivate).toHaveBeenCalled();
    });
  });

  it('8. Deactivate Account card is hidden for System Administrators', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { ...mockUser, role: 'systemadmin' },
      updateProfile: mockUpdateProfile,
      uploadAvatar: mockUploadAvatar,
      changePassword: vi.fn(),
      signOutOtherDevices: vi.fn(),
      deactivateAccount: vi.fn(),
      isLoading: false,
    });

    renderComponent();

    // Switch to Security tab
    const securityTab = screen.getByRole('tab', { name: /security & account/i });
    fireEvent.click(securityTab);

    // Sign out of all devices is visible
    expect(screen.getByRole('button', { name: /sign out of all devices/i })).toBeInTheDocument();

    // Deactivate account button and card are not rendered
    expect(screen.queryByRole('button', { name: /deactivate account/i })).not.toBeInTheDocument();
  });
});
