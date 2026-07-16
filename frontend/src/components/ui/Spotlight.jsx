import { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function Spotlight({
  children,
  className = '',
  spotlightColor = '#00F0FF',
  spotlightSize = 300
}) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Spotlight gradient */}
      <motion.div
        className="absolute pointer-events-none z-0"
        animate={{
          opacity: isHovered ? 0.15 : 0,
          x: mousePosition.x - spotlightSize / 2,
          y: mousePosition.y - spotlightSize / 2
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: spotlightSize,
          height: spotlightSize,
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(${spotlightColor}08 1px, transparent 1px), linear-gradient(90deg, ${spotlightColor}08 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: isHovered ? 1 : 0.3,
          transition: 'opacity 0.3s'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
