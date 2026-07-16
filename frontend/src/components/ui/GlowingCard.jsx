import { useRef, useState } from 'react';
import { motion } from 'motion/react';

export default function GlowingCard({
  children,
  className = '',
  glowColor = '#00F0FF',
  glowSize = 400,
  borderRadius = '1rem'
}) {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderRadius }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          opacity: isHovered ? 0.6 : 0,
          x: mousePosition.x - glowSize / 2,
          y: mousePosition.y - glowSize / 2
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: glowSize,
          height: glowSize,
          background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
          borderRadius: '50%'
        }}
      />

      {/* Border glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: isHovered ? 1 : 0
        }}
        style={{
          borderRadius,
          background: `linear-gradient(135deg, ${glowColor}20 0%, transparent 50%, ${glowColor}10 100%)`,
          boxShadow: isHovered ? `0 0 30px ${glowColor}30, inset 0 0 30px ${glowColor}10` : 'none'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
