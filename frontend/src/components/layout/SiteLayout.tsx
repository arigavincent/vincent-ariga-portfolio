import { useState } from 'react';

import { BootContext } from '@/hooks/useBooted';
import { useBootLoading } from '@/hooks/useBootLoading';

import { CustomCursor } from './CustomCursor';
import { Footer } from './Footer';
import { Grain } from './Grain';
import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { Preloader } from './Preloader';
import { ScrollProgress } from './ScrollProgress';
import { SkipLink } from './SkipLink';
import { SmoothScroll } from './SmoothScroll';

/** The shell around every public page: preloader, cursor, smooth scroll, header and footer. */
export function SiteLayout() {
  const [booted, setBooted] = useState(false);
  useBootLoading();

  return (
    <BootContext value={booted}>
      <SmoothScroll>
        <SkipLink />
        <Preloader
          onFinished={() => {
            setBooted(true);
          }}
        />
        <ScrollProgress />
        <Header />
        <main id="main" tabIndex={-1} className="relative z-10 outline-none">
          <PageTransition />
        </main>
        <Footer />
        <Grain />
        <CustomCursor />
      </SmoothScroll>
    </BootContext>
  );
}
