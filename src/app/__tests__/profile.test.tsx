import { render, screen, fireEvent } from '@testing-library/react';
import { useSession, signIn, signOut } from 'next-auth/react';
import ProfilePage from '../profile/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockSignIn = signIn as jest.Mock;
const mockSignOut = signOut as jest.Mock;

describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('should render login prompt when user is not authenticated', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<ProfilePage />);

    expect(screen.getByText('You need to be logged in to view your profile.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should call signIn when Sign In button is clicked', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<ProfilePage />);

    const signInButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(signInButton);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('should render loading state when session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });

    render(<ProfilePage />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should render user profile details when authenticated', () => {
    const mockUserProfile = {
      name: 'Authenticated User',
      email: 'auth@example.com',
      image: 'http://example.com/auth_image.jpg',
      bio: 'This is a test bio.',
      provider: 'google',
    };

    mockUseSession.mockReturnValue({
      data: {
        user: mockUserProfile,
        expires: 'mock-expires',
      },
      status: 'authenticated',
    });

    render(<ProfilePage />);

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText(mockUserProfile.name!)).toBeInTheDocument();
    expect(screen.getByText(mockUserProfile.email!)).toBeInTheDocument();
    expect(screen.getByText(mockUserProfile.bio!)).toBeInTheDocument();
    expect(screen.getByText(`Signed in with: ${mockUserProfile.provider}`)).toBeInTheDocument();
    expect(screen.getByAltText('Profile Picture')).toHaveAttribute('src', mockUserProfile.image!);
    expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('should call signOut when Sign Out button is clicked', () => {
    const mockUserProfile = {
      name: 'Authenticated User',
      email: 'auth@example.com',
      image: 'http://example.com/auth_image.jpg',
      bio: 'This is a test bio.',
      provider: 'google',
    };

    mockUseSession.mockReturnValue({
      data: {
        user: mockUserProfile,
        expires: 'mock-expires',
      },
      status: 'authenticated',
    });

    render(<ProfilePage />);

    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('should display a placeholder if user profile is missing some data', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'partial@example.com',
          // name, image, bio are missing
        },
        expires: 'mock-expires',
      },
      status: 'authenticated',
    });

    render(<ProfilePage />);

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('partial@example.com')).toBeInTheDocument();
    expect(screen.getByText('No Name')).toBeInTheDocument(); // Default for missing name
    expect(screen.getByText('This user has not set a bio yet.')).toBeInTheDocument(); // Default for missing bio
    expect(screen.queryByAltText('Profile Picture')).not.toBeInTheDocument(); // Image should not be rendered
  });
});
