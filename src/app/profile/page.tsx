'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface UserProfile {
  name: string | null;
  email: string | null;
  bio: string | null;
  image: string | null;
  provider: string | null; // Added from session callback
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'authenticated') {
        try {
          // In a real app, you might fetch more detailed data from your backend.
          // For this example, we'll use data directly from the session which is limited.
          setUserProfile({
            name: session.user?.name || null,
            email: session.user?.email || null,
            image: session.user?.image || null,
            bio: "User bio is not directly available from session. Needs backend fetch.", // Placeholder for bio
            provider: session.user?.provider || null, // Access provider from session
          });
        } catch (err) {
          setError('Failed to fetch profile data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status]);

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!session) {
    return (
      <div className="text-center py-10">
        <p>You need to be logged in to view your profile.</p>
        <button
          onClick={() => signIn()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleEditProfile = async () => {
    // This function would typically trigger a form or navigate to an edit page
    // and then make an API call to update the user's profile in the database.
    alert('Edit profile functionality not implemented yet.');
    // Example:
    // const updatedData = { name: 'New Name', bio: 'New Bio' };
    // try {
    //   const response = await fetch('/api/user/profile', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(updatedData),
    //   });
    //   if (response.ok) {
    //     const updatedProfile = await response.json();
    //     setUserProfile(updatedProfile);
    //     alert('Profile updated successfully!');
    //   } else {
    //     alert('Failed to update profile.');
    //   }
    // } catch (err) {
    //   console.error('Error updating profile:', err);
    //   alert('An error occurred while updating profile.');
    // }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      {userProfile ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          {userProfile.image && (
            <div className="flex justify-center mb-4">
              <img
                src={userProfile.image}
                alt="Profile Picture"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold">{userProfile.name || 'No Name'}</h2>
            <p className="text-gray-600">{userProfile.email}</p>
            <p className="text-gray-700 mt-2">{userProfile.bio || 'This user has not set a bio yet.'}</p>
            <p className="text-sm text-gray-500 mt-1">Signed in with: {userProfile.provider}</p>
          </div>

          <div className="text-center">
            <button
              onClick={handleEditProfile}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
            >
              Edit Profile
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center">Could not load profile details.</p>
      )}
    </div>
  );
}
