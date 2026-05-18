import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EntryCard } from '@/components/EntryCard';
import type { Entry } from '@/lib/types';

const baseEntry: Entry = {
  id: 'e1',
  userId: 'u1',
  emotionId: 1,
  intensity: 4,
  note: 'Une note privée',
  contextTags: ['travail', 'sport'],
  createdAt: new Date('2026-05-04T12:00:00Z').toISOString(),
  emotion: {
    id: 1,
    label: 'Heureux',
    categoryId: 1,
    colorHex: '#FFD700',
    category: {
      id: 1,
      label: 'Joie',
      colorHex: '#FFD700',
      iconName: 'smile',
    },
  },
};

describe('EntryCard', () => {
  it('renders emotion label, intensity, note and tags', () => {
    const { getByText } = render(<EntryCard entry={baseEntry} />);
    expect(getByText('Heureux')).toBeTruthy();
    expect(getByText('Joie')).toBeTruthy();
    expect(getByText('4/5')).toBeTruthy();
    expect(getByText('Une note privée')).toBeTruthy();
    expect(getByText('#travail')).toBeTruthy();
    expect(getByText('#sport')).toBeTruthy();
  });

  it('hides note section when null', () => {
    const { queryByText } = render(
      <EntryCard entry={{ ...baseEntry, note: null, contextTags: null }} />
    );
    expect(queryByText('Une note privée')).toBeNull();
    expect(queryByText('#travail')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<EntryCard entry={baseEntry} onPress={onPress} />);
    fireEvent.press(getByText('Heureux'));
    expect(onPress).toHaveBeenCalled();
  });
});
