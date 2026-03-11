// src/app/mood/page.tsx
'use client'; // Assuming Next.js App Router

import React, { useState, useEffect } from 'react';
import MoodSelector from '../../components/MoodSelector'; // Adjust path if needed

interface Mood {
  id: string;
  label: string;
  emoji: string;
}

// Mock data for partner's mood
// In a real app, this would come from an API or real-time updates
const mockPartnerMood = {
  user: 'Partner Name', // Placeholder for partner identifier
  mood: { id: 'neutral', label: 'Neutral', emoji: '😐' },
  note: 'Just chilling.',
  timestamp: new Date().toISOString(),
};

const MoodPage: React.FC = () => {
  const [myMoodData, setMyMoodData] = useState<{ mood: Mood | null; note: string }>({
    mood: null,
    note: '',
  });

  const handleMyMoodUpdate = (data: { mood: Mood | null; note: string }) => {
    setMyMoodData(data);
    // In a real application, you would send this data to the server here
    console.log('My mood updated:', data);
  };

  // State and effect to simulate fetching partner's mood on component mount
  const [partnerMoodData, setPartnerMoodData] = useState<{ user: string; mood: Mood | null; note: string; timestamp: string } | null>(null);

  useEffect(() => {
    // Simulate fetching partner's mood
    // In a real app, this would be an API call or WebSocket subscription
    const timer = setTimeout(() => {
      setPartnerMoodData(mockPartnerMood);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Basic styling to mimic a clean UI
  const containerStyle: React.CSSProperties = {
    padding: '30px',
    maxWidth: '800px',
    margin: '40px auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '40px',
    padding: '25px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fdfdfd',
  };

  const partnerSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    backgroundColor: '#f0f8ff', // AliceBlue for partner's mood section
  };

  const hrStyle: React.CSSProperties = {
    margin: '50px 0',
    borderColor: '#e0e0e0',
    borderTop: 'none', // Remove default top border
  };


  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '40px' }}>Share Your Mood</h1>

      <div style={sectionStyle}>
        <h2 style={{ color: '#007bff', marginBottom: '20px' }}>Your Mood</h2>
        <MoodSelector
          onMoodUpdate={handleMyMoodUpdate}
          initialMood={myMoodData.mood}
          initialNote={myMoodData.note}
        />
        {myMoodData.mood && (
          <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
            <p style={{ fontSize: '1.1rem', color: '#444' }}>
              <strong>Your current mood:</strong> {myMoodData.mood.emoji} {myMoodData.mood.label}
            </p>
            {myMoodData.note && (
              <p style={{ color: '#555' }}><strong>Note:</strong> {myMoodData.note}</p>
            )}
            <p><small style={{ color: '#777' }}>Last updated: Just now</small></p>
          </div>
        )}
      </div>

      <hr style={hrStyle}/>

      <div style={partnerSectionStyle}>
        <h2 style={{ color: '#28a745', marginBottom: '20px' }}>Partner's Mood</h2>
        {partnerMoodData ? (
          <div style={{ backgroundColor: '#eafaf1', padding: '20px', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.1rem', color: '#28a745' }}>
              <strong>{partnerMoodData.user} is feeling:</strong> {partnerMoodData.mood?.emoji || '❓'} {partnerMoodData.mood?.label || 'Unknown'}
            </p>
            {partnerMoodData.note && <p style={{ color: '#555' }}><strong>Note:</strong> {partnerMoodData.note}</p>}
            <p><small style={{ color: '#777' }}>Updated: {new Date(partnerMoodData.timestamp).toLocaleString()}</small></p>
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>Partner's mood is not available or still loading...</p>
        )}
      </div>
    </div>
  );
};

export default MoodPage;
