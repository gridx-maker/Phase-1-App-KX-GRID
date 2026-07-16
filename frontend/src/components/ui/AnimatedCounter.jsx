import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';

export default function AnimatedCounter({
  value,
  duration = 2,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Parse the numeric value
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  const originalSuffix = String(value).replace(/[0-9.]/g, '') || suffix;

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
    delay: delay * 1000
  });

  const display = useTransform(spring, (current) => {
    return decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current);
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      spring.set(numericValue);
    }
  }, [isInView, numericValue, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {originalSuffix}
    </span>
  );
}
