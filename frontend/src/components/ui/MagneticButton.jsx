import { useRef, useState } from 'react';
import { motion } from 'motion/react';

export default function MagneticButton({
  children,
  className = '',
  strength = 40,
  innerStrength = 20,
  ...props
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [innerPosition, setInnerPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) / width;
    const deltaY = (clientY - centerY) / height;

    setPosition({
      x: deltaX * strength,
      y: deltaY * strength
    });

    setInnerPosition({
      x: deltaX * innerStrength,
      y: deltaY * innerStrength
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setInnerPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
      className={`inline-block ${className}`}
      {...props}
    >
      <motion.div
        animate={{ x: innerPosition.x, y: innerPosition.y }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
