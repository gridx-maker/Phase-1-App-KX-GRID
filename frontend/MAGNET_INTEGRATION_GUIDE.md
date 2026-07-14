# Magnet Component Integration Guide

## Overview
The Magnet component from React Bits has been integrated into this project to add an interactive "magnetic pull" effect to buttons and interactive elements.

## Component Location
`frontend/src/components/ui/Magnet.jsx`

## Already Integrated
The Magnet component has been applied to all buttons in:
- ✅ **LandingPage.js** - All navigation, hero, CTA, and contact buttons
- ✅ **PromoCarousel.js** - Dialog form buttons

## How to Use

### Basic Usage
```jsx
import Magnet from '@/components/ui/Magnet';
import { Button } from '@/components/ui/button';

<Magnet padding={50} magnetStrength={40}>
  <Button onClick={handleClick}>
    Click Me
  </Button>
</Magnet>
```

### Recommended Settings

#### Desktop Navigation Buttons
```jsx
<Magnet padding={50} magnetStrength={40}>
  <Button>Navigation Button</Button>
</Magnet>
```

#### Hero/CTA Buttons (Large prominent buttons)
```jsx
<Magnet padding={60} magnetStrength={35}>
  <Button className="btn-primary h-12 px-8">
    Primary CTA
  </Button>
</Magnet>
```

#### Large Feature Buttons
```jsx
<Magnet padding={70} magnetStrength={30}>
  <Button className="btn-primary h-14 px-12">
    Large CTA
  </Button>
</Magnet>
```

#### Mobile/Modal Buttons (Disabled magnet effect)
```jsx
<Magnet padding={50} magnetStrength={40} disabled={true}>
  <Button className="w-full">
    Modal Button
  </Button>
</Magnet>
```

## Props Reference

| Prop | Type | Default | Best Use Case |
|------|------|---------|---------------|
| `padding` | number | 100 | Distance around element that activates magnet (px) |
| `magnetStrength` | number | 2 | Higher = less movement, Lower = more movement |
| `disabled` | boolean | false | Disable on mobile, modals, or full-width buttons |
| `activeTransition` | string | "transform 0.3s ease-out" | CSS transition when active |
| `inactiveTransition` | string | "transform 0.5s ease-in-out" | CSS transition when inactive |

## When to Disable the Magnet Effect

Use `disabled={true}` in these scenarios:
1. **Mobile responsive buttons** - Full-width buttons on mobile
2. **Modal/Dialog buttons** - Buttons in popups or dialogs
3. **Dropdown menu buttons** - Buttons in constrained spaces
4. **Form submit buttons** - When in tight layouts
5. **Full-width buttons** - Any button with `w-full` class

## Integration Checklist for Other Components

To add Magnet to other components:

1. **Import the component**
   ```jsx
   import Magnet from '@/components/ui/Magnet';
   ```

2. **Wrap each button**
   ```jsx
   // Before
   <Button onClick={handleClick}>Click</Button>

   // After
   <Magnet padding={50} magnetStrength={40}>
     <Button onClick={handleClick}>Click</Button>
   </Magnet>
   ```

3. **Adjust settings based on context** (see recommendations above)

4. **Test on desktop and mobile** to ensure the effect works properly

## Components That Should Be Updated

Consider adding Magnet to buttons in:
- [ ] `LoginPage.js`
- [ ] `RegisterPage.js`
- [ ] `ProgramsPage.js`
- [ ] `StudentDashboard.js`
- [ ] `AdminPanel.js`
- [ ] `TeamPage.js`
- [ ] Other page components with buttons

## Tips for Best Results

1. **Larger padding for larger buttons** - Big CTAs need more activation area
2. **Higher magnetStrength for subtle effect** - Use 30-40 for professional feel
3. **Lower magnetStrength for dramatic effect** - Use 10-20 for playful interfaces
4. **Always disable on mobile** - Full-width buttons don't benefit from the effect
5. **Test hover boundaries** - Ensure the magnetic area doesn't overlap with nearby elements

## Examples from Implementation

### Navigation Button (Desktop)
```jsx
<Magnet padding={50} magnetStrength={40}>
  <Button
    onClick={() => navigate('/programs')}
    className="bg-[#00e5ff] text-black hover:bg-[#00e5ff]/90 px-6 font-semibold"
  >
    View Programs
  </Button>
</Magnet>
```

### Hero CTA Button
```jsx
<Magnet padding={60} magnetStrength={35}>
  <Button
    onClick={() => navigate('/programs')}
    className="btn-primary h-12 px-8 text-base font-bold"
  >
    VIEW PROGRAMS
  </Button>
</Magnet>
```

### Contact Button
```jsx
<Magnet padding={60} magnetStrength={35}>
  <Button
    onClick={() => setCallbackOpen(true)}
    className="btn-primary h-14 px-8 gap-2"
  >
    <Phone className="w-5 h-5" />
    Request Call Back
  </Button>
</Magnet>
```

### Mobile Menu Button (Disabled)
```jsx
<Magnet padding={50} magnetStrength={40} disabled={true}>
  <Button
    onClick={() => navigate('/login/student')}
    className="w-full border-white/10"
  >
    Student Login
  </Button>
</Magnet>
```

## Performance Notes

- The Magnet component uses `requestAnimationFrame` for smooth animations
- Mouse listeners are efficiently cleaned up on unmount
- The effect is hardware-accelerated using `transform` and `will-change`
- No performance impact when disabled

## Support

For issues or questions about the Magnet component:
- Original component: [React Bits](https://github.com/react-bits)
- Component file: `frontend/src/components/ui/Magnet.jsx`
