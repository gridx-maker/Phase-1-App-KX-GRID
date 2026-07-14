# DecryptedText Component Integration Guide

## Overview
The DecryptedText component from React Bits has been integrated into this project to add an interactive decryption/scrambling text animation effect. Perfect for creating engaging, futuristic text animations that reveal characters as users interact with or scroll past elements.

## Component Location
`frontend/src/components/ui/DecryptedText.jsx`

## Dependencies
- **motion** (GreenSock Motion library) - Already installed
- **React** - Already installed

## How to Use

### Basic Usage
```jsx
import DecryptedText from '@/components/ui/DecryptedText';

<DecryptedText text="Hover me!" />
```

### With Custom Configuration
```jsx
<DecryptedText
  text="Customize me"
  speed={50}
  sequential={true}
  revealDirection="start"
  animateOn="inViewHover"
  className="text-white"
  encryptedClassName="text-white/50"
  useOriginalCharsOnly={true}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | "" | The text content to decrypt/reveal |
| `speed` | number | 50 | Time in ms between each iteration/character reveal |
| `maxIterations` | number | 10 | Max iterations for non-sequential mode (random character count) |
| `sequential` | boolean | false | Reveal characters one at a time in sequence vs randomly |
| `revealDirection` | "start" \| "end" \| "center" | "start" | Direction to reveal characters (start=left to right, end=right to left, center=middle outward) |
| `useOriginalCharsOnly` | boolean | false | Use only characters from the text for scrambling, not full charset |
| `characters` | string | "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()+_" | Characters to use for scrambling effect |
| `className` | string | "" | CSS class for revealed/decrypted characters |
| `parentClassName` | string | "" | CSS class for the main container span |
| `encryptedClassName` | string | "" | CSS class for scrambled/encrypted characters |
| `animateOn` | "hover" \| "view" \| "inViewHover" \| "click" | "hover" | Trigger animation on hover, scroll-into-view, both, or click |
| `clickMode` | "once" \| "toggle" | "once" | Click behavior: run once or toggle encrypt/decrypt |

## Animation Modes

### Hover
Characters scramble on hover and return to plain on mouse leave.
```jsx
<DecryptedText
  text="Hover over me"
  animateOn="hover"
/>
```

### View (Scroll)
Animation triggers automatically when element enters viewport.
```jsx
<DecryptedText
  text="Reveals when scrolled into view"
  animateOn="view"
/>
```

### InViewHover (Recommended)
Triggers when scrolled into view, then responds to hover afterward.
```jsx
<DecryptedText
  text="Scroll into view, then hover"
  animateOn="inViewHover"
/>
```

### Click
Reveals on click with optional toggle mode.
```jsx
<DecryptedText
  text="Click me to decrypt"
  animateOn="click"
  clickMode="toggle"
/>
```

## Reveal Directions

### Start (Left to Right)
```jsx
<DecryptedText
  text="Reveal from left"
  sequential={true}
  revealDirection="start"
/>
```

### End (Right to Left)
```jsx
<DecryptedText
  text="Reveal from right"
  sequential={true}
  revealDirection="end"
/>
```

### Center (Middle Outward)
```jsx
<DecryptedText
  text="Reveal from center"
  sequential={true}
  revealDirection="center"
/>
```

## Usage Examples

### Hero Subtitle (Currently Implemented)
```jsx
<h2 className="font-unbounded font-bold text-xl md:text-2xl lg:text-3xl mb-2">
  <DecryptedText
    text="India's First University Integrated"
    speed={50}
    sequential={true}
    revealDirection="start"
    animateOn="inViewHover"
    className="text-white"
    encryptedClassName="text-white/50"
    useOriginalCharsOnly={true}
  />
</h2>
<h2 className="font-unbounded font-bold text-xl md:text-2xl lg:text-3xl">
  <DecryptedText
    text="Automotive, Motorsport & Media Skill Programmes"
    speed={50}
    sequential={true}
    revealDirection="start"
    animateOn="inViewHover"
    className="text-primary"
    encryptedClassName="text-primary/50"
    useOriginalCharsOnly={true}
  />
</h2>
```

### Fast Encryption/Decryption
```jsx
<DecryptedText
  text="Fast decrypt"
  speed={30}
  sequential={true}
  animateOn="hover"
  className="text-cyan-400"
  encryptedClassName="text-cyan-400/30"
/>
```

### Slow Elegant Reveal
```jsx
<DecryptedText
  text="Slow, elegant reveal"
  speed={100}
  sequential={true}
  revealDirection="center"
  animateOn="inViewHover"
  className="text-white"
  encryptedClassName="text-white/20"
/>
```

### Clickable Toggle Effect
```jsx
<DecryptedText
  text="Click to toggle encryption"
  speed={60}
  sequential={false}
  maxIterations={15}
  animateOn="click"
  clickMode="toggle"
  className="cursor-pointer text-blue-400"
  encryptedClassName="text-blue-400/40"
/>
```

### Custom Character Set
```jsx
<DecryptedText
  text="Special characters"
  characters="!@#$%^&*()_+-=[]{}|;:',.<>?/~`"
  speed={40}
  sequential={true}
  animateOn="hover"
  className="text-purple-400"
  encryptedClassName="text-purple-400/50"
/>
```

### Only Original Characters (Natural Feel)
```jsx
<DecryptedText
  text="This uses only letters from this sentence"
  speed={50}
  sequential={true}
  useOriginalCharsOnly={true}
  animateOn="inViewHover"
  className="text-green-400"
  encryptedClassName="text-green-400/40"
/>
```

## Timing Recommendations

### Speed Settings (milliseconds per character)

```jsx
// Very Fast (Chaotic)
<DecryptedText text="Fast" speed={20} sequential={true} />

// Fast (Snappy)
<DecryptedText text="Fast" speed={40} sequential={true} />

// Medium (Balanced - Recommended)
<DecryptedText text="Medium" speed={50} sequential={true} />

// Slow (Elegant)
<DecryptedText text="Slow" speed={80} sequential={true} />

// Very Slow (Dramatic)
<DecryptedText text="Very Slow" speed={120} sequential={true} />
```

## Sequential vs Non-Sequential

### Sequential Mode
Reveals one character at a time in specified direction.
```jsx
<DecryptedText
  text="One char at a time"
  sequential={true}
  revealDirection="start"
  speed={50}
/>
```

### Non-Sequential Mode
Random scrambling iterations before fully revealing.
```jsx
<DecryptedText
  text="Random scrambling"
  sequential={false}
  maxIterations={15}
  speed={40}
/>
```

## Styling

### Color Coordination
```jsx
<DecryptedText
  text="Styled encryption"
  className="text-cyan-400 font-bold"
  encryptedClassName="text-cyan-400/30"
/>
```

### With Tailwind Classes
```jsx
<DecryptedText
  text="Full styling"
  className="text-white font-unbounded font-bold tracking-wide"
  encryptedClassName="text-white/40"
  parentClassName="inline-block"
/>
```

## Best Practices

### 1. Choose the Right Animation Trigger
- **hover**: Interactive, requires user attention
- **view**: Automatic on page scroll, great for hero sections
- **inViewHover** (Recommended): Best balance - triggers on scroll, then interactive
- **click**: Good for call-to-action or emphasis

### 2. Speed Selection
- Shorter text: faster speed (30-50ms)
- Longer text: slower speed (60-100ms) for readability
- Sequential: faster because it's one character per interval
- Non-sequential: can be faster, handles many characters per iteration

### 3. Character Visibility
- Use `encryptedClassName` with different opacity for contrast
- Example: `encryptedClassName="text-white/30"` makes scrambled text visible
- Helps users see the animation effect

### 4. Performance
- Sequential mode is smoother for longer animations
- Non-sequential is better for quick snappy effects
- Avoid animating very long passages of text
- Use `useOriginalCharsOnly={true}` for more natural feel

### 5. Accessibility
- Text is always readable (screen readers get original text)
- Encrypted characters don't interfere with accessibility
- Animation is interactive, not mandatory for understanding
- Provides visual interest without compromising content

### 6. Mobile Considerations
```jsx
const isMobile = window.innerWidth < 768;

{!isMobile ? (
  <DecryptedText text="Hover me" animateOn="hover" />
) : (
  <DecryptedText text="Tap me" animateOn="click" clickMode="once" />
)}
```

## Advanced Patterns

### Animated Reveal on Page Load
```jsx
<DecryptedText
  text="Welcome to GRID"
  animateOn="view"
  sequential={true}
  speed={40}
  revealDirection="center"
  className="text-2xl font-bold text-white"
  encryptedClassName="text-white/30"
/>
```

### Toggle Encryption on Click
```jsx
<div className="cursor-pointer">
  <DecryptedText
    text="Click to reveal"
    animateOn="click"
    clickMode="toggle"
    sequential={true}
    speed={50}
    className="text-white hover:text-cyan-400 transition-colors"
    encryptedClassName="text-white/40"
  />
</div>
```

### Staggered Decryption (Multiple Elements)
```jsx
{['First', 'Second', 'Third'].map((text, i) => (
  <div key={i} style={{ marginTop: '2rem' }}>
    <DecryptedText
      text={text}
      animateOn="view"
      sequential={true}
      speed={50}
    />
  </div>
))}
```

### Custom Character Pool
```jsx
<DecryptedText
  text="Matrix style"
  characters="01ｦｬｪﾧﾣﾪﾮ"
  speed={30}
  sequential={true}
  animateOn="hover"
  className="text-green-400 font-mono"
  encryptedClassName="text-green-400/50"
/>
```

## Troubleshooting

### Text Not Animating
- Check if `animateOn` is set correctly
- For "view" or "inViewHover": element must be within viewport
- For "hover": try hovering over the text
- For "click": click on the text element

### Animation Too Fast/Slow
- Adjust `speed` prop (milliseconds between changes)
- Increase for slower, decrease for faster
- Sequential mode: each interval = 1 character
- Non-sequential: each interval = multiple random characters

### Text Not Visible While Encrypted
- Add `encryptedClassName` with opacity color
- Example: `encryptedClassName="text-white/40"`
- This makes the scrambled text visible

### Styling Not Applied
- Ensure `className` is for revealed text
- Ensure `encryptedClassName` is for scrambled text
- Check Tailwind CSS is configured
- Use inline styles if needed

### Performance Issues on Long Text
- Set `sequential={true}` for smoother animation
- Increase `speed` value slightly
- Consider breaking text into smaller sections
- Use `useOriginalCharsOnly={true}` for lighter computation

## Components Currently Using DecryptedText

- **Landing Page Hero Section** - Subtitle animations (lines 310-331)
  - Two subtitle texts with sequential character reveal
  - Triggers on scroll, then responds to hover
  - Uses original characters only for natural feel

## Animation Lifecycle

1. **Initial State** - Text displays normally
2. **Trigger** - User hovers/scrolls/clicks based on `animateOn`
3. **Encryption** - Characters start scrambling
4. **Progressive Reveal** - Characters revealed one-by-one (sequential) or in waves (non-sequential)
5. **Complete** - All characters revealed, back to original text
6. **Reset** - On mouse leave (hover) or toggle again (click)

## Performance Notes

- Uses efficient interval-based animation
- Minimal DOM manipulation
- Only text content changes, not structure
- GPU acceleration through motion library
- Performs well even with 100+ character text
- Automatic cleanup on unmount

## Support

For issues or questions:
- Original component: [React Bits](https://github.com/react-bits)
- Component file: `frontend/src/components/ui/DecryptedText.jsx`
- Motion library: [https://motion.dev/](https://motion.dev/)

## Future Enhancement Ideas

Consider adding DecryptedText to:
- [ ] Feature section titles
- [ ] Call-to-action buttons
- [ ] Section headings
- [ ] Stats/metrics numbers
- [ ] Team member names
- [ ] Testimonial quotes
- [ ] Pricing plans
- [ ] Product feature names

## Comparison: DecryptedText vs Other Animation Components

| Component | Best For | Interaction | Performance |
|-----------|----------|-------------|-------------|
| **DecryptedText** | Futuristic, interactive reveal | Hover/Click/View | Excellent |
| **BlurText** | Fade-in entrance | Scroll trigger | Very Good |
| **TextType** | Typing effect, sequential | Auto-play | Good |
| **SplitText** | Word split, clip-path | Auto-play | Good |

Choose based on your UX needs:
- **DecryptedText**: Interactive, engaging, modern feel
- **BlurText**: Smooth entrance, less interactive
- **TextType**: Typewriter effect, narrative feel
- **SplitText**: Classic text splitting, word-based animation
