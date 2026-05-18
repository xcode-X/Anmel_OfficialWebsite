import { Suspense, lazy } from 'react';
import HeroSection from '../components/home/HeroSection';

const HomeBelowFold = lazy(() => import('../components/home/HomeBelowFold'));

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={null}>
        <HomeBelowFold />
      </Suspense>
    </>
  );
}
