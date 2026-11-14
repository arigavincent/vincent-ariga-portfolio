import { createContext, useContext } from 'react';

/** True once the preloader has lifted, so intro animations can wait for their audience. */
export const BootContext = createContext(false);

export function useBooted(): boolean {
  return useContext(BootContext);
}
