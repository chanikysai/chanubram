// src/components/__tests__/MoodSelector.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MoodSelector from '../MoodSelector';

describe('MoodSelector', () => {
  const mockOnMoodUpdate = jest.fn();

  beforeEach(() => {
    mockOnMoodUpdate.mockClear();
  });

  it('should call onMoodUpdate with initial values on mount', async () => {
    const initialMood = { id: 'happy', label: 'Happy', emoji: '😄' };
    const initialNote = 'Ready for the day!';
    render(<MoodSelector onMoodUpdate={mockOnMoodUpdate} initialMood={initialMood} initialNote={initialNote} />);

    await waitFor(() => {
      expect(mockOnMoodUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnMoodUpdate).toHaveBeenCalledWith({
        mood: initialMood,
        note: initialNote,
      });
    });
  });

  it('should call onMoodUpdate with empty values if no initial values provided', async () => {
    render(<MoodSelector onMoodUpdate={mockOnMoodUpdate} />);

    await waitFor(() => {
      expect(mockOnMoodUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnMoodUpdate).toHaveBeenCalledWith({
        mood: null,
        note: '',
      });
    });
  });

  it('should update state and call onMoodUpdate when a mood is selected', async () => {
    render(<MoodSelector onMoodUpdate={mockOnMoodUpdate} />);

    const joyfulButton = screen.getByText('Joyful');
    fireEvent.click(joyfulButton);

    await waitFor(() => {
      // Expecting multiple calls: initial (null, ''), then mood select
      expect(mockOnMoodUpdate).toHaveBeenCalledTimes(2);
      const lastCallArgs = mockOnMoodUpdate.mock.calls[mockOnMoodUpdate.mock.calls.length - 1][0];
      expect(lastCallArgs.mood).toEqual(expect.objectContaining({ id: 'joyful', label: 'Joyful', emoji: '😊' }));
      expect(lastCallArgs.note).toBe(''); // Note should still be empty
    });
  });

  it('should update state and call onMoodUpdate when a note is entered', async () => {
    render(<MoodSelector onMoodUpdate={mockOnMoodUpdate} />);

    const noteTextarea = screen.getByLabelText('Optional private note:');
    const noteContent = 'Feeling a bit overwhelmed today.';
    fireEvent.change(noteTextarea, { target: { value: noteContent } });

    await waitFor(() => {
      // Expecting multiple calls: initial (null, ''), then note change
      expect(mockOnMoodUpdate).toHaveBeenCalledTimes(2);
      const lastCallArgs = mockOnMoodUpdate.mock.calls[mockOnMoodUpdate.mock.calls.length - 1][0];
      expect(lastCallArgs.mood).toBeNull(); // Mood should still be null
      expect(lastCallArgs.note).toBe(noteContent);
    });
  });

  it('should update both mood and note and call onMoodUpdate accordingly', async () => {
    render(<MoodSelector onMoodUpdate={mockOnMoodUpdate} />);

    const happyButton = screen.getByText('Happy');
    fireEvent.click(happyButton);

    const noteTextarea = screen.getByLabelText('Optional private note:');
    const noteContent = 'Great day!';
    fireEvent.change(noteTextarea, { target: { value: noteContent } });

    await waitFor(() => {
      // Total calls will be: initial, mood select, note change
      expect(mockOnMoodUpdate).toHaveBeenCalledTimes(3);
      const lastCallArgs = mockOnMoodUpdate.mock.calls[mockOnMoodUpdate.mock.calls.length - 1][0];
      expect(lastCallArgs.mood).toEqual(expect.objectContaining({ id: 'happy', label: 'Happy', emoji: '😄' }));
      expect(lastCallArgs.note).toBe(noteContent);
    });
  });
});
