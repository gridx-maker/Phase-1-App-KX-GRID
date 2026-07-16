import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function TextRevealByWord({
  text,
  className = '',
  textClassName = ''
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.9', 'start 0.25']
  });

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={className}>
      <p className={`flex flex-wrap ${textClassName}`}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          );
        })}
      </p>
    </div>
  );
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const y = useTransform(progress, range, [20, 0]);
  const blur = useTransform(progress, range, [8, 0]);

  return (
    <span className="relative mr-2 mt-1">
      <motion.span
        style={{
          opacity,
          y,
          filter: blur.get() > 0 ? `blur(${blur.get()}px)` : 'none'
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}
