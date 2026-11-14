import { describe, expect, it, vi } from 'vitest';

import { loading } from './loading';

describe('loading registry', () => {
  it('starts empty and incomplete', () => {
    expect(loading.getSnapshot()).toEqual({ progress: 0, complete: false });
  });

  it('reports the weighted average of its tasks', () => {
    loading.register('fonts', 1);
    loading.register('scene', 3);

    loading.done('fonts');
    expect(loading.getSnapshot().progress).toBeCloseTo(0.25);

    loading.report('scene', 0.5);
    expect(loading.getSnapshot().progress).toBeCloseTo(0.625);
    expect(loading.getSnapshot().complete).toBe(false);

    loading.done('scene');
    expect(loading.getSnapshot()).toEqual({ progress: 1, complete: true });
  });

  it('never moves a task backwards and clamps out-of-range values', () => {
    loading.register('content');
    loading.report('content', 0.6);
    loading.report('content', 0.2);
    expect(loading.getSnapshot().progress).toBeCloseTo(0.6);

    loading.report('content', 7);
    expect(loading.getSnapshot().progress).toBe(1);
  });

  it('ignores reports for unknown tasks and duplicate registrations', () => {
    loading.register('content');
    loading.report('content', 0.5);
    loading.register('content');
    loading.report('missing', 1);

    expect(loading.getSnapshot().progress).toBeCloseTo(0.5);
  });

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = loading.subscribe(listener);
    loading.register('content');
    loading.done('content');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    loading.register('later');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('can finish everything at once for the safety timeout', () => {
    loading.register('fonts');
    loading.register('content');
    loading.finishAll();

    expect(loading.getSnapshot().complete).toBe(true);
  });
});
