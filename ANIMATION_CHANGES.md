# Animation & UI Enhancement Documentation

This document outlines all the animation components and UI enhancements added to the KX-GRID frontend application.

---

## Table of Contents

1. [New Animation Components](#new-animation-components)
2. [Landing Page Enhancements](#landing-page-enhancements)
3. [Programs Page Enhancements](#programs-page-enhancements)
4. [Usage Examples](#usage-examples)
5. [Dependencies](#dependencies)

---

## New Animation Components

### 1. RotatingWords.jsx
**Location:** `frontend/src/components/ui/RotatingWords.jsx`

A 3D rotating word carousel that cycles through an array of words with a flip animation.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `words` | array | required | Array of words to rotate through |
| `className` | string | `''` | Additional CSS classes |
| `interval` | number | `2000` | Time between word changes (ms) |

---

### 2. FloatingParticles.jsx
**Location:** `frontend/src/components/ui/FloatingParticles.jsx`

Canvas-based particle system with mouse repulsion effect and particle connections.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `particleCount` | number | `80` | Number of particles |
| `particleColor` | string | `'#00F0FF'` | Particle color |
| `lineColor` | string | `'#00F0FF'` | Connection line color |
| `particleSize` | number | `2` | Size of particles |
| `speed` | number | `0.5` | Particle movement speed |
| `connectionDistance` | number | `150` | Max distance for connections |
| `className` | string | `''` | Additional CSS classes |

---

### 3. ParallaxScroll.jsx
**Location:** `frontend/src/components/ui/ParallaxScroll.jsx`

Scroll-based parallax effects with optional marquee text overlay.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Content to apply parallax to |
| `speed` | number | `0.5` | Parallax speed multiplier |
| `className` | string | `''` | Additional CSS classes |
| `direction` | string | `'up'` | Direction: 'up' or 'down' |

---

### 4. MagneticButton.jsx
**Location:** `frontend/src/components/ui/MagneticButton.jsx`

Button with magnetic hover effect that follows cursor movement.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Button content |
| `className` | string | `''` | Additional CSS classes |
| `strength` | number | `0.3` | Magnetic pull strength |
| `onClick` | function | - | Click handler |

---

### 5. TextScramble.jsx
**Location:** `frontend/src/components/ui/TextScramble.jsx`

Hacker-style text scramble/decode effect on hover or mount.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | required | Text to display |
| `className` | string | `''` | Additional CSS classes |
| `scrambleOnHover` | boolean | `true` | Scramble on hover |
| `scrambleOnMount` | boolean | `false` | Scramble on component mount |
| `speed` | number | `50` | Scramble speed (ms) |

---

### 6. AnimatedCounter.jsx
**Location:** `frontend/src/components/ui/AnimatedCounter.jsx`

Animated number counter with spring physics animation.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | number | required | Target number |
| `className` | string | `''` | Additional CSS classes |
| `duration` | number | `2` | Animation duration (s) |
| `prefix` | string | `''` | Text before number |
| `suffix` | string | `''` | Text after number |

---

### 7. RevealOnScroll.jsx
**Location:** `frontend/src/components/ui/RevealOnScroll.jsx`

Scroll-triggered reveal animations with multiple variants.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Content to reveal |
| `className` | string | `''` | Additional CSS classes |
| `variant` | string | `'fadeUp'` | Animation variant |
| `delay` | number | `0` | Animation delay (s) |
| `duration` | number | `0.6` | Animation duration (s) |
| `threshold` | number | `0.1` | Intersection threshold |

**Available Variants:**
- `fadeUp` - Fade in from bottom
- `fadeDown` - Fade in from top
- `fadeLeft` - Fade in from left
- `fadeRight` - Fade in from right
- `scale` - Scale up from small
- `rotate` - Rotate in
- `flip` - 3D flip effect
- `blur` - Blur to clear
- `slideUp` - Slide up
- `pop` - Pop in with bounce

---

### 8. GlowingCard.jsx
**Location:** `frontend/src/components/ui/GlowingCard.jsx`

Card component with mouse-following glow effect.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Card content |
| `className` | string | `''` | Additional CSS classes |
| `glowColor` | string | `'#00F0FF'` | Glow color |
| `glowSize` | number | `400` | Glow radius |
| `borderRadius` | string | `'1rem'` | Card border radius |

---

### 9. ShimmerButton.jsx
**Location:** `frontend/src/components/ui/ShimmerButton.jsx`

Button with traveling shimmer animation effect.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Button content |
| `className` | string | `''` | Additional CSS classes |
| `shimmerColor` | string | `'#ffffff'` | Shimmer color |
| `backgroundColor` | string | `'transparent'` | Background color |
| `borderColor` | string | `'#00F0FF'` | Border color |
| `onClick` | function | - | Click handler |

---

### 10. Spotlight.jsx
**Location:** `frontend/src/components/ui/Spotlight.jsx`

Section wrapper with cursor-following spotlight and grid overlay.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | required | Section content |
| `className` | string | `''` | Additional CSS classes |
| `spotlightColor` | string | `'#00F0FF'` | Spotlight color |
| `spotlightSize` | number | `300` | Spotlight diameter |

---

### 11. TextRevealByWord.jsx
**Location:** `frontend/src/components/ui/TextRevealByWord.jsx`

Word-by-word text reveal based on scroll position.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | required | Text to reveal |
| `className` | string | `''` | Container classes |
| `textClassName` | string | `''` | Text classes |

---

### 12. WavyText.jsx
**Location:** `frontend/src/components/ui/WavyText.jsx`

Letter-by-letter wave animation with hover effects.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | required | Text to animate |
| `className` | string | `''` | Additional CSS classes |
| `delay` | number | `0` | Animation delay (s) |
| `duration` | number | `0.05` | Stagger duration (s) |

---

## Landing Page Enhancements

**File:** `frontend/src/pages/LandingPage.js`

### Hero Section
- **FloatingParticles** - Background particle animation
- **RotatingWords** - Cycling through "LEARN", "EXECUTE", "LEAD", "DOMINATE"
- **GlitchText** - Main heading with glitch effect
- **BlurText** - Animated description text
- **MagneticButton** - Interactive CTA buttons
- **Animated gradient orbs** - Background decorative elements
- **Scroll indicator** - Animated mouse scroll hint

### Stats Section
- **AnimatedStatItem** - Custom component with:
  - Gradient text colors
  - Count-up animation on scroll
  - Staggered reveal animations

### Features Section
- **Spotlight** - Cursor-following spotlight wrapper
- **FeatureCard3D** - Custom 3D cards with:
  - Perspective tilt on hover
  - Animated gradient borders
  - TextScramble titles
  - Glow effects
  - Icon animations

### Programs Section
- **ProgramCard3D** - Interactive cards with:
  - 3D flip animation on hover
  - Sparkle particle effects
  - GlitchText on hover
  - Gradient overlays
  - Scale animations

### Why Choose Us Section
- **WavyText** - Animated heading
- **GlowingCard** - Cards with mouse-following glow
- **RevealOnScroll** - Staggered item reveals

### Partners Section
- **Animated marquee** - Auto-scrolling partner logos
- **Hover pause** - Animation pauses on hover

### CTA Section
- **DecryptedText** - Hacker-style text reveal
- **MagneticButton** - Interactive buttons
- **Animated background** - Gradient orbs

---

## Programs Page Enhancements

**File:** `frontend/src/pages/ProgramsPage.js`

### Background
- **FloatingParticles** - Fixed position particle background

### Hero Section
- **Spotlight** - Interactive spotlight effect
- **RotatingWords** - "UNLOCK", "DISCOVER", "UNLEASH", "IGNITE"
- **GlitchText** - Main heading
- **BlurText** - Description text
- **DecryptedText** - Subheading animation

### Filter Section
- **MagneticButton** - Interactive filter buttons
- **Active state animations** - Scale and glow effects

### Program Cards
- **AnimatedProgramCard** - Custom component with:
  - Mouse-position spotlight effect
  - Shimmer animation on hover
  - 3D transform on hover
  - Sparkle particle effects
  - Animated stats with rotating icons
  - Gradient overlays
  - Scale animations

### Loading State
- **Animated skeletons** - Pulsing placeholder cards

### Registration Dialog
- **GlowingCard** - Dialog wrapper with glow
- **TextScramble** - Animated form labels
- **DecryptedText** - Success message animation

### CTA Section
- **RevealOnScroll** - Scroll-triggered reveals
- **GlitchText** - Animated heading
- **DecryptedText** - Description animation
- **MagneticButton** - Interactive CTA

---

## Usage Examples

### Basic RotatingWords
```jsx
import RotatingWords from '../components/ui/RotatingWords';

<RotatingWords
  words={['Hello', 'World', 'React']}
  interval={2000}
  className="text-4xl font-bold text-cyan-400"
/>
```

### FloatingParticles Background
```jsx
import FloatingParticles from '../components/ui/FloatingParticles';

<div className="relative min-h-screen">
  <FloatingParticles
    particleCount={100}
    particleColor="#00F0FF"
    className="fixed inset-0 -z-10"
  />
  {/* Your content */}
</div>
```

### MagneticButton
```jsx
import MagneticButton from '../components/ui/MagneticButton';

<MagneticButton
  onClick={() => console.log('clicked')}
  className="px-6 py-3 bg-cyan-500 rounded-lg"
  strength={0.4}
>
  Hover Me
</MagneticButton>
```

### RevealOnScroll
```jsx
import RevealOnScroll from '../components/ui/RevealOnScroll';

<RevealOnScroll variant="fadeUp" delay={0.2}>
  <h2>This content fades up on scroll</h2>
</RevealOnScroll>
```

### GlowingCard
```jsx
import GlowingCard from '../components/ui/GlowingCard';

<GlowingCard
  glowColor="#FF00FF"
  className="p-6 bg-gray-900"
>
  <h3>Card Title</h3>
  <p>Card content with glow effect</p>
</GlowingCard>
```

---

## Dependencies

These components rely on the following packages (already installed):

```json
{
  "motion": "^11.x",
  "gsap": "^3.x",
  "tailwindcss": "^3.x"
}
```

### Motion (Framer Motion)
Used for:
- Spring physics animations
- Gesture handling (hover, tap)
- Scroll-linked animations
- Layout animations

### GSAP
Used for:
- Complex timeline animations
- ScrollTrigger effects
- Performance-optimized animations

### Tailwind CSS
Used for:
- Responsive styling
- Utility classes
- Custom animations via config

---

## Color Scheme

The animations use the following primary colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | `#00F0FF` | Primary accent, glows, particles |
| Purple | `#A855F7` | Secondary accent, gradients |
| Blue | `#3B82F6` | Tertiary accent |
| Dark | `#0a0a0a` | Background |

---

## Performance Notes

1. **FloatingParticles** uses Canvas API for optimal performance
2. **RevealOnScroll** uses IntersectionObserver to minimize reflows
3. **Motion components** use GPU-accelerated transforms
4. **Particle connections** are distance-limited to reduce calculations

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

*Note: Some 3D effects may have reduced quality on older browsers.*

---

**Last Updated:** January 2026
