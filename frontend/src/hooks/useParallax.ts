import { useEffect, useRef, useState } from 'react';

interface ParallaxOptions {
  mode: 'disabled' | 'standard' | 'smooth' | 'subtle' | 'dramatic';
  intensity?: number;
  performance?: 'auto' | 'smooth' | 'performance' | 'mobile-off';
}

export const useParallax = (options: ParallaxOptions) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const animationRef = useRef<number>();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      // Check for transform3d support
      const testElement = document.createElement('div');
      testElement.style.transform = 'translate3d(0,0,0)';
      const isTransform3dSupported = testElement.style.transform !== '';
      
      setIsSupported(isTransform3dSupported && 'requestAnimationFrame' in window);
    };

    checkSupport();
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || options.mode === 'disabled') return;

    // Skip parallax on mobile if performance setting says so
    if (isMobile && options.performance === 'mobile-off') return;

    // Skip if not supported
    if (!isSupported) return;

    const getParallaxSettings = () => {
      const baseIntensity = options.intensity || 0.5;
      
      switch (options.mode) {
        case 'subtle':
          return { 
            intensity: Math.min(baseIntensity * 0.3, 0.3),
            threshold: 0.1 
          };
        case 'dramatic':
          return { 
            intensity: Math.min(baseIntensity * 1.5, 1.0),
            threshold: 0.05 
          };
        case 'smooth':
          return { 
            intensity: baseIntensity,
            threshold: 0.01 
          };
        case 'standard':
        default:
          return { 
            intensity: baseIntensity,
            threshold: 0.1 
          };
      }
    };

    const { intensity, threshold } = getParallaxSettings();
    let ticking = false;
    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      // Check if element is in viewport (with buffer)
      const isInViewport = (
        scrollY + windowHeight > elementTop - 200 &&
        scrollY < elementTop + elementHeight + 200
      );

      if (!isInViewport) {
        ticking = false;
        return;
      }

      // Calculate parallax offset
      const rate = (scrollY - elementTop + windowHeight) / (elementHeight + windowHeight);
      const parallaxOffset = (scrollY - elementTop) * intensity;

      // Apply transform with hardware acceleration
      if (options.performance === 'performance') {
        // Use translate instead of translate3d for better performance on some devices
        element.style.transform = `translateY(${parallaxOffset}px)`;
      } else {
        // Use translate3d for hardware acceleration
        element.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
      }

      // Apply will-change for smoother animation
      element.style.willChange = 'transform';

      ticking = false;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Performance optimization: skip if scroll change is below threshold
      if (Math.abs(currentScrollY - lastScrollY) < threshold) return;
      
      lastScrollY = currentScrollY;

      if (!ticking) {
        if (options.performance === 'smooth' || options.performance === 'auto') {
          animationRef.current = requestAnimationFrame(updateParallax);
        } else {
          // Use setTimeout for lower performance impact
          setTimeout(updateParallax, 16); // ~60fps
        }
        ticking = true;
      }
    };

    // Set initial transform
    updateParallax();

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (element) {
        element.style.transform = '';
        element.style.willChange = '';
      }
    };
  }, [options, isMobile, isSupported]);

  return {
    ref: elementRef,
    isMobile,
    isSupported,
    isActive: options.mode !== 'disabled' && isSupported && !(isMobile && options.performance === 'mobile-off')
  };
}; 