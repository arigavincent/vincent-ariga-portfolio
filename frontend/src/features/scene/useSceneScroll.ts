import { useEffect } from 'react';

import { gsap, ScrollTrigger } from '@/lib/gsap';
import { homeSections } from '@/lib/site';

import { poses, resetSceneState, sceneState } from './poses';
import { computeStops, type SceneStop, type SectionBox } from './stops';

/** Wait this long after the layout settles before rebuilding the timeline. */
const REBUILD_DELAY_MS = 200;

function measureSections(): SectionBox[] {
  return homeSections.flatMap((section) => {
    const element = document.getElementById(section.id);
    if (!element) {
      return [];
    }
    const rect = element.getBoundingClientRect();
    return [{ id: section.id, top: rect.top + window.scrollY, height: rect.height }];
  });
}

/**
 * One paused timeline, one unit long, that blends the scene from pose to pose. ScrollTrigger maps
 * the page's scroll range onto it.
 */
function buildTimeline(stops: SceneStop[]): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut' } });
  timeline.to(sceneState, { progress: 1, duration: 1, ease: 'none' }, 0);
  stops.forEach((stop, index) => {
    const previous = stops[index - 1];
    if (!previous) {
      return;
    }
    timeline.to(
      sceneState,
      { ...poses[stop.id], duration: stop.progress - previous.progress },
      previous.progress,
    );
  });
  return timeline;
}

/**
 * Scroll storytelling: ties the 3D scene to the page's scroll position with GSAP ScrollTrigger.
 * Section positions are re-measured whenever the page's height changes (content loading, fonts,
 * resizes), so each pose always lines up with its section.
 */
export function useSceneScroll(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let timeline: gsap.core.Timeline | undefined;
    let trigger: ScrollTrigger | undefined;
    let rebuildTimer: number | undefined;

    function build() {
      trigger?.kill();
      timeline?.kill();
      resetSceneState();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      timeline = buildTimeline(computeStops(measureSections(), window.innerHeight, maxScroll));
      trigger = ScrollTrigger.create({ animation: timeline, start: 0, end: 'max', scrub: 0.6 });
    }

    build();
    const observer = new ResizeObserver(() => {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(build, REBUILD_DELAY_MS);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      window.clearTimeout(rebuildTimer);
      trigger?.kill();
      timeline?.kill();
      resetSceneState();
    };
  }, [enabled]);
}
