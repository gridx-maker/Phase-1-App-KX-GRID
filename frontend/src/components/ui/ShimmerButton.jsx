import { motion } from 'motion/react';

export default function ShimmerButton({
  children,
  className = '',
  shimmerColor = '#ffffff',
  backgroundColor = 'transparent',
  borderColor = '#00F0FF',
  onClick,
  ...props
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden px-8 py-4 rounded-xl font-semibold ${className}`}
      style={{
        background: backgroundColor,
        border: `2px solid ${borderColor}`
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ['−100%', '200%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'linear'
        }}
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}30, transparent)`,
          width: '50%'
        }}
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
