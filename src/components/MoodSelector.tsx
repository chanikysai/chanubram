import React, { useState, useEffect } from 'react';

interface Mood {
  id: string;
  label: string;
  emoji: string;
}

interface MoodSelectorProps {
  onMoodUpdate: (moodData: { mood: Mood | null; note: string }) => void;
  initialMood?: Mood | null;
  initialNote?: string;
}

const moods: Mood[] = [
  { id: 'happy', label: 'Happy', emoji: '😄' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'stressed', label: 'Stressed', emoji: '😥' },
  { id: 'joyful', label: 'Joyful', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😔' },
];

const MoodSelector: React.FC<MoodSelectorProps> = ({
  onMoodUpdate,
  initialMood = null,
  initialNote = '',
}) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(initialMood);
  const [privateNote, setPrivateNote] = useState<string>(initialNote);

  // Call onMoodUpdate on mount to reflect initial state
  useEffect(() => {
    onMoodUpdate({ mood: selectedMood, note: privateNote });
  }, [selectedMood, privateNote, onMoodUpdate]); // Dependency array includes selectedMood and privateNote

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    // onMoodUpdate is now handled by useEffect
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrivateNote(event.target.value);
    // onMoodUpdate is now handled by useEffect
  };

  return (
    <div className="mood-selector">
      <h3>Select your current mood:</h3>
      <div className="mood-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood)}
            className={`mood-button ${selectedMood?.id === mood.id ? 'selected' : ''}`}
            aria-pressed={selectedMood?.id === mood.id}
            style={{
              backgroundColor: selectedMood?.id === mood.id ? '#cce5ff' : '#f8f9fa', // Light blue for selected, light gray for default
              border: `1px solid ${selectedMood?.id === mood.id ? '#007bff' : '#ced4da'}`, // Blue border for selected, gray for default
              color: '#212529',
              padding: '10px 15px',
              cursor: 'pointer',
              borderRadius: '5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease, border-color 0.2s ease',
            }}
          >
            {mood.emoji} {mood.label}
          </button>
        ))}
      </div>

      <div className="mood-note">
        <label htmlFor="private-note" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#495057' }}>Optional private note:</label>
        <textarea
          id="private-note"
          value={privateNote}
          onChange={handleNoteChange}
          placeholder="Add a short note for context..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ced4da',
            borderRadius: '5px',
            boxSizing: 'border-box',
            fontSize: '1rem',
            fontFamily: 'inherit', // Use the parent's font family
            lineHeight: '1.5',
            color: '#495057',
            backgroundColor: '#fff',
            resize: 'vertical', // Allow vertical resizing
          }}
        />
      </div>
    </div>
  );
};

export default MoodSelector;
