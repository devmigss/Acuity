import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccountDeactivatedPage from '../pages/auth/AccountDeactivatedPage';
import * as AuthContext from '../context/AuthContext';
import { api } from '../services/api/apiClient';
import Swal from 'sweetalert2';

vi.mock('../services/api/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
    showLoading: vi.fn(),
    close: vi.fn(),
    mixin: vi.fn().mockReturnValue({
      fire: vi.fn(),
    }),
  },
}));

describe('AccountDeactivatedPage Component RTL Tests', () => {
  let mockLogout;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout = vi.fn().mockResolvedValue(true);

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { email: 'student@labgroup.acuity.app' },
      logout: mockLogout,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AccountDeactivatedPage />
      </MemoryRouter>
    );
  };

  it('1. Renders SELF deactivation copy and allows requesting reactivation', async () => {
    api.get.mockResolvedValue({
      state: 'SELF',
      deactivatedBy: 'SELF',
      deactivatedAt: '2026-10-01T10:00:00.000Z',
      pendingRequest: null,
      canSelfReactivate: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/account deactivated/i)).toBeInTheDocument();
      expect(screen.getByText(/you deactivated this account on/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request reactivation/i })).toBeEnabled();
    });
  });

  it('2. Renders ADMIN deactivation copy', async () => {
    api.get.mockResolvedValue({
      state: 'ADMIN',
      deactivatedBy: 'ADMIN',
      deactivatedAt: '2026-10-01T10:00:00.000Z',
      pendingRequest: null,
      canSelfReactivate: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/an administrator deactivated this account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request reactivation/i })).toBeEnabled();
    });
  });

  it('3. Renders ACCESS_REVOKED copy and hides request button', async () => {
    api.get.mockResolvedValue({
      state: 'ACCESS_REVOKED',
      deactivatedBy: null,
      deactivatedAt: null,
      pendingRequest: null,
      canSelfReactivate: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/access revoked/i)).toBeInTheDocument();
      expect(screen.getByText(/your faculty whitelist access has been revoked/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /request reactivation/i })).not.toBeInTheDocument();
    });
  });

  it('4. Shows pending request status box and disables request button', async () => {
    api.get.mockResolvedValue({
      state: 'SELF',
      deactivatedBy: 'SELF',
      deactivatedAt: '2026-10-01T10:00:00.000Z',
      pendingRequest: {
        id: 'req-1',
        createdAt: '2026-10-02T10:00:00.000Z',
        message: 'Please restore my account access.',
        status: 'PENDING',
      },
      canSelfReactivate: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/request pending since/i)).toBeInTheDocument();
      expect(screen.getByText(/please restore my account access/i)).toBeInTheDocument();
      const pendingBtn = screen.getByRole('button', { name: /request pending/i });
      expect(pendingBtn).toBeDisabled();
    });
  });

  it('5. Sign out button executes logout', async () => {
    api.get.mockResolvedValue({
      state: 'SELF',
      deactivatedBy: 'SELF',
      deactivatedAt: '2026-10-01T10:00:00.000Z',
      pendingRequest: null,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
