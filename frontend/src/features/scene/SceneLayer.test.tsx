import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { loading } from '@/lib/loading';
import { renderWithProviders } from '@/test/render';

import { SceneLayer } from './SceneLayer';

describe('SceneLayer', () => {
  it('renders no canvas and never blocks the preloader when WebGL is unavailable', async () => {
    // jsdom has no WebGL, which is exactly the situation of an unsupported browser.
    const onActiveChange = vi.fn();
    const { container } = renderWithProviders(<SceneLayer onActiveChange={onActiveChange} />);

    await waitFor(() => {
      expect(onActiveChange).toHaveBeenCalledWith(false);
    });
    expect(onActiveChange).not.toHaveBeenCalledWith(true);
    expect(container.querySelector('canvas')).not.toBeInTheDocument();

    // Nothing was registered for the scene, so other tasks alone decide when loading completes.
    loading.register('fonts');
    loading.done('fonts');
    expect(loading.getSnapshot().complete).toBe(true);
  });

  it('stays out of the way on pages other than the home page', () => {
    const onActiveChange = vi.fn();
    const { container } = renderWithProviders(
      <SceneLayer onActiveChange={onActiveChange} />,
      '/projects',
    );

    expect(container.querySelector('canvas')).not.toBeInTheDocument();
    expect(onActiveChange).not.toHaveBeenCalledWith(true);
  });
});
