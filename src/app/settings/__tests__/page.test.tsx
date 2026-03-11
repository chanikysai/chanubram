import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SettingsPage from '@/app/settings/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API calls
global.fetch = jest.fn();

const mockUseSession = require('next-auth/react').useSession;
const mockUseRouter = require('next/navigation').useRouter;

const mockUserA = {
  id: 'user-id-a',
  name: 'User A',
  email: 'userA@example.com',
  image: 'http://example.com/imageA.jpg',
};

const mockUserB = {
  id: 'user-id-b',
  name: 'User B',
  email: 'userB@example.com',
  image: 'http://example.com/imageB.jpg',
};

const mockPartneredUserA = {
  ...mockUserA,
  partnerId: 'user-id-b',
};

const mockPartnerInfo = {
  id: 'user-id-b',
  name: 'User B',
  image: 'http://example.com/imageB.jpg',
};

const mockPendingInvite = {
  code: 'pendinginvitecode',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockExpiredInvite = {
  code: 'expiredinvitecode',
  expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

// Helper function to mock fetch responses
const mockFetchResponse = (data: any, status: number = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    json: async () => data,
    status: status,
  });
};

// Helper function to mock fetch responses for error
const mockFetchError = (message: string, status: number = 400) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message }),
        status: status,
    });
};


describe('SettingsPage', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseRouter as jest.Mock).mockReturnValue({ push });
    // Default mock for authenticated user
    mockUseSession.mockReturnValue({ data: { user: mockUserA }, status: 'authenticated' });
  });

  it('should render loading state when session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    render(<SettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to sign-in if not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<SettingsPage />);
    expect(push).toHaveBeenCalledWith('/auth/signin');
  });

  it('should render user profile and partner info when user is partnered', async () => {
    mockFetchResponse({
      user: mockUserA,
      partner: mockPartnerInfo,
      pendingInvite: null,
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('User A')).toBeInTheDocument();
      expect(screen.getByText('userA@example.com')).toBeInTheDocument();
      expect(screen.getByText('Partner Connection')).toBeInTheDocument();
      expect(screen.getByText('You are partnered with:')).toBeInTheDocument();
      expect(screen.getByText('User B')).toBeInTheDocument();
      expect(screen.queryByText('Generate Invite Code')).not.toBeInTheDocument();
      expect(screen.queryByText('Enter invite code')).not.toBeInTheDocument();
    });
  });

  it('should render UI for generating invite when user is not partnered', async () => {
    mockFetchResponse({
      user: mockUserA,
      partner: null,
      pendingInvite: null,
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Partner Connection')).toBeInTheDocument();
      expect(screen.getByText('Generate Invite Code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter invite code')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Accept Invite' })).toBeInTheDocument();
    });
  });

  it('should display pending invite details when user has one', async () => {
    mockFetchResponse({
      user: mockUserA,
      partner: null,
      pendingInvite: mockPendingInvite,
    });

    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByText('Your pending invite code:')).toBeInTheDocument();
      expect(screen.getByText(mockPendingInvite.code)).toBeInTheDocument();
      expect(screen.getByText('Expires on:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Copy Code' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
      expect(screen.queryByText('Generate Invite Code')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter invite code')).not.toBeInTheDocument();
    });
  });

  it('should handle generating an invite code', async () => {
    mockFetchResponse({ user: mockUserA, partner: null, pendingInvite: null }); // Initial fetch
    mockFetchResponse({ inviteCode: 'newinvite', expiresAt: new Date().toISOString() }, 201); // Generate invite response
    mockFetchResponse({ user: { ...mockUserA, id: 'user-id-a' }, partner: null, pendingInvite: { code: 'newinvite', expiresAt: new Date().toISOString() } }); // Second fetch after generation

    render(<SettingsPage />);

    await waitFor(() => {
        expect(screen.getByText('Generate Invite Code')).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Generate Invite Code' }));

    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument(); // Check button state
    });

    await waitFor(() => {
      expect(screen.getByText('Your pending invite code:')).toBeInTheDocument();
      expect(screen.getByText('newinvite')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Copy Code' })).toBeInTheDocument();
    });
  });

  it('should handle accepting an invite code', async () => {
    mockFetchResponse({ user: mockUserA, partner: null, pendingInvite: null }); // Initial fetch
    mockFetchResponse({ message: 'Partner successfully paired!' }, 200); // Accept invite response
    mockFetchResponse({ // Second fetch to show user is now partnered
      user: { ...mockUserA, partnerId: 'user-id-b' },
      partner: mockPartnerInfo,
      pendingInvite: null,
    });

    render(<SettingsPage />);

    await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter invite code')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter invite code'), { target: { value: 'someinvitecode' } });
    fireEvent.click(screen.getByRole('button', { name: 'Accept Invite' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Accepting...' })).toBeInTheDocument(); // Check button state
    });

    await waitFor(() => {
      expect(screen.getByText('Partner successfully paired!')).toBeInTheDocument();
      expect(screen.getByText('You are partnered with:')).toBeInTheDocument();
      expect(screen.getByText('User B')).toBeInTheDocument();
    });
  });

  it('should display error message when generating invite fails', async () => {
    mockFetchResponse({ user: mockUserA, partner: null, pendingInvite: null }); // Initial fetch
    mockFetchError('Failed to generate invite code', 500);

    render(<SettingsPage />);

    await waitFor(() => {
        expect(screen.getByText('Generate Invite Code')).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Generate Invite Code' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate invite code')).toBeInTheDocument();
    });
  });

  it('should display error message when accepting invite fails', async () => {
    mockFetchResponse({ user: mockUserA, partner: null, pendingInvite: null }); // Initial fetch
    fireEvent.change(screen.getByPlaceholderText('Enter invite code'), { target: { value: 'someinvitecode' } });
    mockFetchError('Invalid or expired invite code', 404);

    render(<SettingsPage />);

    await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter invite code')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Accept Invite' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid or expired invite code')).toBeInTheDocument();
    });
  });

  it('should handle copying invite code to clipboard', async () => {
    // Mock navigator.clipboard.writeText
    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText');
    writeTextSpy.mockResolvedValue(undefined); // Mock success

    mockFetchResponse({
      user: mockUserA,
      partner: null,
      pendingInvite: mockPendingInvite,
    });

    render(<SettingsPage />);

    await waitFor(() => {
        expect(screen.getByText('Your pending invite code:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Copy Code' }));

    await waitFor(() => {
        expect(writeTextSpy).toHaveBeenCalledWith(mockPendingInvite.code);
        // Check alert if you want to test alert visibility, but it's generally harder
        // For now, just checking the spy call is sufficient for functionality.
    });

    writeTextSpy.mockRestore(); // Clean up mock
  });

  it('should dismiss pending invite when dismiss button is clicked', async () => {
    mockFetchResponse({
      user: mockUserA,
      partner: null,
      pendingInvite: mockPendingInvite,
    });

    render(<SettingsPage />);

    await waitFor(() => {
        expect(screen.getByText('Your pending invite code:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    // Check that the pending invite section is no longer visible
    await waitFor(() => {
      expect(screen.queryByText('Your pending invite code:')).not.toBeInTheDocument();
      expect(screen.queryByText(mockPendingInvite.code)).not.toBeInTheDocument();
      // The generate/accept forms should reappear
      expect(screen.getByText('Generate Invite Code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter invite code')).toBeInTheDocument();
    });
  });
});
