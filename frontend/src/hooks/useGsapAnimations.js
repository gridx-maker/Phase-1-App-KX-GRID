import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade-in + translateY on scroll enter
 * @param {object} options - { y, duration, delay, ease, stagger }
 */
export function useFadeUp(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const {
      y = 40,
      duration = 0.9,
      delay = 0,
      ease = 'power3.out',
      stagger = 0,
    } = options;
    const targets = stagger ? el.children : el;
    gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }
    );
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);
  return ref;
}

/**
 * Clip-reveal from left (for section headings)
 */
export function useRevealLeft(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { duration = 1, delay = 0, ease = 'expo.out' } = options;
    gsap.fromTo(
      el,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0 0% 0 0)',
        opacity: 1,
        duration,
        delay,
        ease,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  }, []);
  return ref;
}

/**
 * Counter animation for stat numbers
 */
export function useCountUp(target, duration = 1.6, delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rawText = String(target);
    const suffix = rawText.replace(/[0-9.]/g, '');
    const num = parseFloat(rawText);
    if (isNaN(num)) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: num,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent =
          Number.isInteger(num)
            ? Math.round(obj.val) + suffix
            : obj.val.toFixed(1) + suffix;
      },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  }, [target]);
  return ref;
}

/**
 * Staggered card entrance
 */
export function useStaggerCards(stagger = 0.12, y = 30) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      [...el.children],
      { opacity: 0, y, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      }
    );
  }, []);
  return ref;
}

/**
 * Parallax on scroll
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      yPercent: -20 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);
  return ref;
}
