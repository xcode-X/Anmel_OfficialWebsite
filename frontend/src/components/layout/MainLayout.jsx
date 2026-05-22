import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { usePageChrome } from '../../context/AppContext';
import Nav from './Nav';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import StickyCTA from './StickyCTA';
import ExitIntentPopup from '../lead/ExitIntentPopup';
import MousePattern from './MousePattern';

function PageSkeleton() {
  return (
    <div className="min-h-screen pt-20 animate-pulse" aria-hidden>
      <div className="h-[60vh] skeleton mx-0 rounded-none" />
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="h-8 skeleton w-1/3 mx-auto" />
        <div className="h-4 skeleton w-2/3 mx-auto" />
        <div className="grid grid-cols-3 gap-6 mt-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const { hideFooter, hideFloatingUi } = usePageChrome();

  return (
    <>
      <MousePattern />
      <ScrollProgress />
      <Nav />
      <main id="main-content">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      {!hideFloatingUi && <StickyCTA />}
      {!hideFloatingUi && <ExitIntentPopup />}
    </>
  );
}
