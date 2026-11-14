/**
 * Tracks real loading work (fonts, first API data, the 3D scene) so the preloader can show honest
 * progress. Each task has a weight and reports 0..1; overall progress is the weighted average.
 */

interface Task {
  weight: number;
  progress: number;
}

export interface LoadingSnapshot {
  /** Overall progress from 0 to 1. */
  progress: number;
  /** True once every registered task has finished. */
  complete: boolean;
}

const tasks = new Map<string, Task>();
const listeners = new Set<() => void>();
let snapshot: LoadingSnapshot = { progress: 0, complete: false };

function recompute(): void {
  let totalWeight = 0;
  let weighted = 0;
  for (const task of tasks.values()) {
    totalWeight += task.weight;
    weighted += task.weight * task.progress;
  }
  const progress = totalWeight === 0 ? 0 : weighted / totalWeight;
  const complete = tasks.size > 0 && progress >= 1;
  if (progress !== snapshot.progress || complete !== snapshot.complete) {
    snapshot = { progress, complete };
    listeners.forEach((listener) => {
      listener();
    });
  }
}

/** Registers a task. Registering the same id again keeps its current progress. */
function register(id: string, weight = 1): void {
  if (!tasks.has(id)) {
    tasks.set(id, { weight, progress: 0 });
    recompute();
  }
}

/** Reports progress for a task. Progress never moves backwards. */
function report(id: string, progress: number): void {
  const task = tasks.get(id);
  if (!task) {
    return;
  }
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped > task.progress) {
    task.progress = clamped;
    recompute();
  }
}

/** Marks a task finished. A failed task also counts as finished so the page is never stuck. */
function done(id: string): void {
  report(id, 1);
}

/** Finishes everything, used by the safety timeout. */
function finishAll(): void {
  for (const task of tasks.values()) {
    task.progress = 1;
  }
  recompute();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): LoadingSnapshot {
  return snapshot;
}

/** Clears all tasks. For tests. */
function reset(): void {
  tasks.clear();
  snapshot = { progress: 0, complete: false };
}

export const loading = { register, report, done, finishAll, subscribe, getSnapshot, reset };
