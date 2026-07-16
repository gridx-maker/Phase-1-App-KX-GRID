import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const animations = {
  fadeUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  },
  fadeDown: {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 }
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 }
  },
  fadeRight: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  rotate: {
    hidden: { opacity: 0, rotate: -10, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1 }
  },
  flip: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0 }
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(20px)' },
    visible: { opacity: 1, filter: 'blur(0px)' }
  },
  slideUp: {
    hidden: { opacity: 0, y: 100, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  },
  pop: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', bounce: 0.4 }
    }
  }
};

export default function RevealOnScroll({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.1,
  className = '',
  stagger = false,
  staggerDelay = 0.1
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin: '-50px',
    amount: threshold
  });

  const selectedAnimation = animations[animation] || animations.fadeUp;

  if (stagger) {
    return (
      <div ref={ref} className={className}>
        {Array.isArray(children) ? (
          children.map((child, index) => (
            <motion.div
              key={index}
              variants={selectedAnimation}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              transition={{
                duration,
                delay: delay + index * staggerDelay,
                ease: [0.25, 0.4, 0.25, 1]
              }}
            >
              {child}
            </motion.div>
          ))
        ) : (
          children
        )}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={selectedAnimation}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
      style={animation === 'flip' ? { transformStyle: 'preserve-3d' } : {}}
    >
      {children}
    </motion.div>
  );
}
