import { useState, useEffect } from 'react';

export type DeviceFormFactor =
  | 'phone_portrait'
  | 'phone_landscape'
  | 'square_foldable'
  | 'tablet'
  | 'desktop';

export function useDeviceAdaptive() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const { width, height } = dimensions;
  const aspectRatio = width / (height || 1);

  // Pure native detection based on physical viewport
  let formFactor: DeviceFormFactor = 'desktop';

  if (width < 640 && aspectRatio < 1.0) {
    formFactor = 'phone_portrait';
  } else if (height < 520 && aspectRatio > 1.35) {
    formFactor = 'phone_landscape';
  } else if (aspectRatio >= 0.82 && aspectRatio <= 1.25 && width <= 960) {
    // Foldable inner screen (Galaxy Z Fold, Surface Duo) or square tablet
    formFactor = 'square_foldable';
  } else if (width >= 640 && width < 1024) {
    formFactor = 'tablet';
  } else {
    formFactor = 'desktop';
  }

  const isPhonePortrait = formFactor === 'phone_portrait';
  const isPhoneLandscape = formFactor === 'phone_landscape';
  const isSquare = formFactor === 'square_foldable';
  const isTablet = formFactor === 'tablet';
  const isDesktop = formFactor === 'desktop';
  const isCompactMobile = isPhonePortrait || isPhoneLandscape;

  return {
    width,
    height,
    aspectRatio,
    formFactor,
    isPhonePortrait,
    isPhoneLandscape,
    isSquare,
    isTablet,
    isDesktop,
    isCompactMobile,
  };
}
