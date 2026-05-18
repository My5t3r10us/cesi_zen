import React from 'react';
import { render } from '@testing-library/react-native';
import { IntensityPicker } from '@/components/IntensityPicker';

describe('IntensityPicker', () => {
  it('renders the current numeric value and label', () => {
    const { getByText } = render(<IntensityPicker value={3} onChange={() => {}} />);
    expect(getByText('3/5')).toBeTruthy();
    expect(getByText(/modérée/i)).toBeTruthy();
  });

  it('shows "Nulle" for 0', () => {
    const { getByText } = render(<IntensityPicker value={0} onChange={() => {}} />);
    expect(getByText(/nulle/i)).toBeTruthy();
  });

  it('shows "Très élevée" for 5', () => {
    const { getByText } = render(<IntensityPicker value={5} onChange={() => {}} />);
    expect(getByText(/très élevée/i)).toBeTruthy();
  });
});
