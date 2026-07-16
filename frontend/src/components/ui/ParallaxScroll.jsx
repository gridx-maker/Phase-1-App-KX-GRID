import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

export default function ParallaxScroll({
  children,
  speed = 0.5,
  direction = 'up',
  className = ''
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const springConfig = { stiffness: 100, damping: 30, mass: 1 };

  const yRange = direction === 'up'
    ? [100 * speed, -100 * speed]
    : [-100 * speed, 100 * speed];

  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], yRange),
    springConfig
  );

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxText({
  text,
  baseVelocity = 3,
  className = ''
}) {
  const baseX = useRef(0);
  const scrollRef = useRef(null);

  const { scrollY } = useScroll();
  const scrollVelocity = useTransform(scrollY, [0, 1000], [0, 5]);

  const x = useTransform(scrollY, (value) => {
    baseX.current = (baseX.current - baseVelocity) % (100 / 3);
    return `${baseX.current}%`;
  });

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} ref={scrollRef}>
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, -1000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20 / baseVelocity,
            ease: 'linear'
          }
        }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="flex-shrink-0">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
