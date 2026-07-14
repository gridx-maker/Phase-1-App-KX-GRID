# BlurText Component Integration Guide

## Overview
The BlurText component from React Bits has been integrated into this project to add a beautiful blur and fade-in animation to text elements as they come into view.

## Component Location
`frontend/src/components/ui/BlurText.jsx`

## Dependencies
- **motion** (GreenSock Motion library) - Already installed

## How to Use

### Basic Usage
```jsx
import BlurText from '@/components/ui/BlurText';

<BlurText
  text="Your text here"
  delay={150}
  stepDuration={0.5}
  className="font-unbounded font-black text-3xl"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | "" | The text content to animate |
| `animateBy` | string | "words" | Animate by 'words' or 'letters' |
| `direction` | string | "top" | Direction: 'top' (from top) or 'bottom' (from bottom) |
| `delay` | number | 200 | Delay between animations for each word/letter (ms) |
| `stepDuration` | number | 0.35 | Time taken for each word/letter to animate (seconds) |
| `threshold` | number | 0.1 | Intersection threshold for triggering animation (0-1) |
| `rootMargin` | string | "0px" | Root margin for intersection observer |
| `className` | string | "" | CSS classes for styling |
| `onAnimationComplete` | function | undefined | Callback when all animations complete |

## Animation Effects

### Blur and Fade
The text starts with:
- 10px blur
- 0% opacity
- Offset (-50px from top, or +50px from bottom based on direction)

Then animates to:
- 0px blur
- 100% opacity
- 0px offset

## Usage Examples

### Hero Tagline (Currently Implemented)
```jsx
<BlurText
  text="LEARN. EXECUTE. LEAD."
  animateBy="words"
  direction="top"
  delay={150}
  stepDuration={0.5}
  className="font-unbounded font-black text-3xl md:text-5xl lg:text-6xl tracking-tight mb-8 text-white"
/>
```

### Section Heading
```jsx
<BlurText
  text="Discover Our Features"
  animateBy="words"
  direction="top"
  delay={100}
  stepDuration={0.4}
  className="font-unbounded font-bold text-4xl text-white mb-4"
/>
```

### Letter-by-Letter Animation
```jsx
<BlurText
  text="Welcome"
  animateBy="letters"
  direction="top"
  delay={80}
  stepDuration={0.3}
  className="font-bold text-2xl text-cyan-400"
/>
```

### Bottom-Up Animation
```jsx
<BlurText
  text="Rise Up"
  animateBy="words"
  direction="bottom"
  delay={120}
  stepDuration={0.4}
  className="text-xl text-white"
/>
```

### With Animation Callback
```jsx
const handleComplete = () => {
  console.log('Text animation completed!');
};

<BlurText
  text="Animation Complete"
  delay={150}
  stepDuration={0.5}
  onAnimationComplete={handleComplete}
  className="text-2xl text-white"
/>
```

## Animation Behavior

### Intersection Observer Integration
- The text only animates when it comes into view
- Triggered based on the `threshold` prop (default: 0.1 = 10% visible)
- Uses `rootMargin` for adjusting the trigger area

### Timing Control
- `delay`: Controls spacing between word/letter animations
- `stepDuration`: Controls how long each word/letter takes to animate

### Examples:
```jsx
// Fast staggered animation
<BlurText text="Fast Fade" delay={50} stepDuration={0.2} />

// Slow elegant animation
<BlurText text="Elegant Text" delay={300} stepDuration={0.8} />

// Medium balanced animation (used in hero)
<BlurText text="Balanced" delay={150} stepDuration={0.5} />
```

## Customization

### Custom Animation Direction
```jsx
// Top-down (default)
<BlurText text="From Top" direction="top" />

// Bottom-up
<BlurText text="From Bottom" direction="bottom" />
```

### Animation Granularity
```jsx
// Animate by words
<BlurText text="Each word fades in" animateBy="words" />

// Animate by letters (character-by-character)
<BlurText text="LEEL" animateBy="letters" />
```

### Visibility Threshold
```jsx
// Trigger when 50% visible
<BlurText text="Visible" threshold={0.5} />

// Trigger when completely visible
<BlurText text="Fully Visible" threshold={1} />

// Trigger slightly before coming into view
<BlurText text="Early Trigger" rootMargin="100px" />
```

## Styling

The component supports all Tailwind CSS classes:

```jsx
<BlurText
  text="Styled Text"
  className="
    font-unbounded
    font-bold
    text-3xl
    text-cyan-400
    tracking-wider
    drop-shadow-lg
  "
/>
```

## Best Practices

### 1. Semantic HTML
The component renders as a `<p>` tag, which is appropriate for text content.

### 2. Performance
- Use `words` animation for better performance
- Avoid animating very long text passages
- Use `letters` sparingly as it creates more DOM elements

### 3. Readability
- Set appropriate delays and step durations to ensure text is readable
- Don't make animations too fast or users might miss them
- Don't make them too slow or it becomes distracting

### 4. Accessibility
- The text is fully readable even during animation
- Motion can be respected using prefers-reduced-motion if needed
- Use meaningful text content

## Components That Could Use BlurText

Consider applying BlurText to:
- [ ] Section headings and titles
- [ ] Hero taglines (already done)
- [ ] Feature descriptions
- [ ] Call-to-action text
- [ ] Statistics and numbers
- [ ] Quote sections
- [ ] Page intros
- [ ] Social proof text

## Current Implementation

### Landing Page
The BlurText component is currently integrated in:
- **Hero Section** - "LEARN. EXECUTE. LEAD." tagline
  - Location: `LandingPage.js:285-292`
  - Settings: words animation, top direction, 150ms delay, 0.5s duration

## Motion Library Information

The BlurText component uses the motion library for animations:
- Lightweight animation library
- Hardware-accelerated animations
- Built-in viewport detection
- Smooth, performant animations

For more information: [Motion Library](https://motion.dev/)

## Troubleshooting

### Text not animating
- Check if the component is in the viewport when page loads
- Verify `threshold` and `rootMargin` settings
- Ensure the component is mounted properly

### Animation too fast/slow
- Adjust `stepDuration` for overall speed (0.2-1.0 recommended)
- Adjust `delay` for spacing between words/letters

### Styling not applied
- Ensure CSS class names are correct
- Check that Tailwind is properly configured
- Verify className string format

## Support

For issues or questions:
- Original component: [React Bits](https://github.com/react-bits)
- Component file: `frontend/src/components/ui/BlurText.jsx`
- Motion library: [https://motion.dev/](https://motion.dev/)
