import React, { useEffect, useRef, useState } from 'react';

// CSS-driven scroll reveal (replaces framer-motion to keep the 43KB gzip
// motion chunk out of the critical path). Classes live in index.css.
export const Reveal = ({ children, className = '', delay = 0, direction = 'up', eager = false }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction}${visible ? ' reveal-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
};
