import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the brand heading and tagline', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vincent Ariga · A&J');
    expect(screen.getByText('Software · Streaming · Apps')).toBeInTheDocument();
  });

  it('lists the brand palette', () => {
    render(<App />);

    expect(screen.getByRole('list', { name: 'A&J colour palette' }).children).toHaveLength(6);
  });
});
