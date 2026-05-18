import { useState, useEffect, useRef } from 'react';

/**
 * Site-wide decorative dot pattern (same style as footer).
 * Animates background position subtly based on mouse movement.
 */
export default function MousePattern() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const raf = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const x = 50 + (e.clientX / window.innerWidth - 0.5) * 4;
        const y = 50 + (e.clientY / window.innerHeight - 0.5) * 4;
        setPosition({ x, y });
        raf.current = null;
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.18] transition-[background-position] duration-150 ease-out"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(120, 113, 108, 0.35) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          backgroundPosition: `${position.x}% ${position.y}%`,
        }}
      />
    </div>
  );
}
