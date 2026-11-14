import { createContext, useContext } from 'react';

/** True while the WebGL scene is on screen, so CSS-only decoration can step back. */
export const SceneActiveContext = createContext(false);

export function useSceneActive(): boolean {
  return useContext(SceneActiveContext);
}
