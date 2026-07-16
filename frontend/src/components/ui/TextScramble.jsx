import { useState, useEffect, useRef, useCallback } from 'react';

export default function TextScramble({
  text,
  speed = 30,
  trigger = 'hover',
  className = '',
  scrambleOnMount = false
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef(null);
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const originalText = text;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iteration += 1 / 3;

      if (iteration >= originalText.length) {
        clearInterval(intervalRef.current);
        setDisplayText(originalText);
        setIsScrambling(false);
      }
    }, speed);
  }, [text, speed, isScrambling]);

  useEffect(() => {
    if (scrambleOnMount) {
      scramble();
    }
    return () => clearInterval(intervalRef.current);
  }, [scrambleOnMount, scramble]);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') scramble();
  };

  const handleClick = () => {
    if (trigger === 'click') scramble();
  };

  return (
    <span
      className={`font-mono ${className}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      style={{ cursor: trigger !== 'none' ? 'pointer' : 'default' }}
    >
      {displayText}
    </span>
  );
}
