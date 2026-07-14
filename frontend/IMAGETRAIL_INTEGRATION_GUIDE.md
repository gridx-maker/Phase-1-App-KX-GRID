# ImageTrail Component Integration Guide

## Overview
The ImageTrail component from React Bits has been integrated into this project to add an interactive animated trail of images that follow the mouse cursor.

## Component Location
- **Component:** `frontend/src/components/ui/ImageTrail.jsx`
- **Styles:** `frontend/src/components/ui/ImageTrail.css`

## Dependencies
- **GSAP** (GreenSock Animation Platform) - Already installed

## How to Use

### Basic Usage
```jsx
import ImageTrail from '@/components/ui/ImageTrail';

<div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
  <ImageTrail
    items={[
      'https://picsum.photos/id/287/300/300',
      'https://picsum.photos/id/1001/300/300',
      'https://picsum.photos/id/1025/300/300',
      'https://picsum.photos/id/1026/300/300',
      'https://picsum.photos/id/1027/300/300',
      'https://picsum.photos/id/1028/300/300',
      'https://picsum.photos/id/1029/300/300',
      'https://picsum.photos/id/1030/300/300',
    ]}
    variant={1}
  />
</div>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | string[] | [] | An array of image URLs which will be animated in the trail |
| `variant` | number | 1 | A number from 1 to 8 - each with different animation styles |

## Available Variants

The ImageTrail component supports 8 different animation variants, each with unique visual effects:

### Variant 1 - Fade and Scale
Basic trail effect where images fade in, follow the cursor, and fade out while scaling down.
```jsx
<ImageTrail items={images} variant={1} />
```

### Variant 2 - Brightness Burst
Images scale up from zero with a brightness burst effect on the inner element.
```jsx
<ImageTrail items={images} variant={2} />
```

### Variant 3 - Float Up
Images appear and then float upward while fading out, with random horizontal drift.
```jsx
<ImageTrail items={images} variant={3} />
```

### Variant 4 - Momentum Trail
Images follow the cursor direction with momentum, creating a directional trail effect. Brightness and contrast adjust based on mouse speed.
```jsx
<ImageTrail items={images} variant={4} />
```

### Variant 5 - Rotation Follow
Images rotate to align with the direction of mouse movement, creating a dynamic spinning effect.
```jsx
<ImageTrail items={images} variant={5} />
```

### Variant 6 - Speed Effects
Image size, brightness, blur, and grayscale dynamically adjust based on mouse speed - faster movement creates more dramatic effects.
```jsx
<ImageTrail items={images} variant={6} />
```

### Variant 7 - Stacked Collage
Multiple images remain visible at once (up to 9), creating a collage-style effect with random scales and slight rotations.
```jsx
<ImageTrail items={images} variant={7} />
```

### Variant 8 - 3D Perspective
Images transform in 3D space based on cursor position relative to the center, with perspective rotations and depth effects.
```jsx
<ImageTrail items={images} variant={8} />
```

## Choosing a Variant

- **Variants 1-3:** Best for subtle, elegant effects
- **Variants 4-6:** Best for dynamic, speed-responsive interactions
- **Variant 7:** Best for creative, collage-style presentations
- **Variant 8:** Best for immersive, 3D experiences

## Image Sources

### Open Source Images (Free to use)
You can use images from these sources:

1. **Picsum Photos** (Lorem Ipsum for photos)
   ```jsx
   const images = [
     'https://picsum.photos/id/287/300/300',
     'https://picsum.photos/id/1001/300/300',
     'https://picsum.photos/id/1025/300/300',
     // Add more IDs...
   ];
   ```

2. **Unsplash** (Free high-quality photos)
   ```jsx
   const images = [
     'https://source.unsplash.com/300x300/?nature',
     'https://source.unsplash.com/300x300/?city',
     'https://source.unsplash.com/300x300/?technology',
     // Add more categories...
   ];
   ```

3. **Your Own Project Images**
   ```jsx
   const images = [
     '/assets/image1.jpg',
     '/assets/image2.jpg',
     '/assets/image3.jpg',
   ];
   ```

## Integration Examples

### Landing Page Hero Section
```jsx
import ImageTrail from '@/components/ui/ImageTrail';

const HeroSection = () => {
  const heroImages = [
    'https://picsum.photos/id/1011/300/300',
    'https://picsum.photos/id/1015/300/300',
    'https://picsum.photos/id/1016/300/300',
    'https://picsum.photos/id/1018/300/300',
    'https://picsum.photos/id/1019/300/300',
    'https://picsum.photos/id/1020/300/300',
  ];

  return (
    <section className="relative h-screen">
      <div className="absolute inset-0">
        <ImageTrail items={heroImages} variant={1} />
      </div>
      <div className="relative z-10">
        {/* Your hero content */}
      </div>
    </section>
  );
};
```

### Portfolio Section
```jsx
const PortfolioSection = () => {
  const portfolioImages = [
    '/portfolio/project1.jpg',
    '/portfolio/project2.jpg',
    '/portfolio/project3.jpg',
    '/portfolio/project4.jpg',
    '/portfolio/project5.jpg',
  ];

  return (
    <section className="relative py-20" style={{ minHeight: '600px' }}>
      <div className="absolute inset-0 pointer-events-none">
        <ImageTrail items={portfolioImages} variant={7} />
      </div>
      <div className="relative z-10 container mx-auto">
        {/* Portfolio content */}
      </div>
    </section>
  );
};
```

### Interactive Gallery
```jsx
const InteractiveGallery = () => {
  const [selectedVariant, setSelectedVariant] = useState(1);

  const galleryImages = [
    'https://picsum.photos/id/100/300/300',
    'https://picsum.photos/id/101/300/300',
    'https://picsum.photos/id/102/300/300',
    'https://picsum.photos/id/103/300/300',
    'https://picsum.photos/id/104/300/300',
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(variant => (
          <button
            key={variant}
            onClick={() => setSelectedVariant(variant)}
            className={selectedVariant === variant ? 'active' : ''}
          >
            Variant {variant}
          </button>
        ))}
      </div>
      <div style={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
        <ImageTrail
          key={selectedVariant}
          items={galleryImages}
          variant={selectedVariant}
        />
      </div>
    </div>
  );
};
```

## Container Requirements

The ImageTrail component requires a parent container with:
1. **Defined height** - Use `height`, `min-height`, or `h-screen`
2. **Position relative** - For absolute positioning of trail images
3. **Overflow handling** - Usually `overflow: hidden` to contain the effect

Example:
```jsx
<div style={{
  height: '500px',
  position: 'relative',
  overflow: 'hidden'
}}>
  <ImageTrail items={images} variant={1} />
</div>
```

Or with Tailwind:
```jsx
<div className="h-[500px] relative overflow-hidden">
  <ImageTrail items={images} variant={1} />
</div>
```

## Best Practices

### 1. Image Optimization
- Use optimized images (WebP format recommended)
- Keep image sizes reasonable (300x300 to 500x500px)
- Limit the number of images to 6-10 for optimal performance

### 2. Performance
- The component uses GSAP for hardware-accelerated animations
- Each variant is optimized for smooth 60fps performance
- Images are lazily animated only when triggered by mouse movement

### 3. Accessibility
- The ImageTrail is primarily decorative
- Ensure your main content has proper z-index layering
- Consider disabling on mobile devices where hover isn't available

### 4. Mobile Considerations
```jsx
const isMobile = window.innerWidth < 768;

{!isMobile && (
  <ImageTrail items={images} variant={1} />
)}
```

### 5. Layering Content
```jsx
<section className="relative h-screen">
  {/* Background ImageTrail */}
  <div className="absolute inset-0 pointer-events-none opacity-30">
    <ImageTrail items={images} variant={1} />
  </div>

  {/* Foreground content with higher z-index */}
  <div className="relative z-10">
    <h1>Your Content</h1>
  </div>
</section>
```

## Customization

### Adjusting Image Size
Edit `ImageTrail.css`:
```css
.content__img {
  width: 150px;  /* Change from 190px */
  aspect-ratio: 1.1;
}
```

### Adjusting Animation Threshold
The threshold controls how far the mouse must move before showing the next image. Lower values = more sensitive:

Edit in `ImageTrail.jsx` (search for `this.threshold = 80;`):
```javascript
this.threshold = 60;  // More sensitive
this.threshold = 100; // Less sensitive
```

### Custom Border Radius
Edit `ImageTrail.css`:
```css
.content__img {
  border-radius: 50%;  /* Circular images */
}
```

## Troubleshooting

### Images Not Appearing
- Check that the container has a defined height
- Verify image URLs are accessible
- Ensure `position: relative` is set on the container

### Animation Not Smooth
- Reduce the number of images
- Check that GSAP is properly installed
- Ensure browser supports CSS transforms

### Images Overflow Container
- Add `overflow: hidden` to the parent container
- Check z-index layering

## Components That Could Use ImageTrail

Consider adding ImageTrail to:
- [ ] Landing page hero section
- [ ] About page background
- [ ] Portfolio/gallery sections
- [ ] Team page interactive elements
- [ ] Contact page decorative elements

## Performance Notes

- Uses GSAP for hardware-accelerated animations
- Efficiently manages active image count
- Automatically cleans up event listeners on unmount
- Images are positioned using GPU-accelerated transforms
- No impact on main content interactivity when using `pointer-events: none`

## Support

For issues or questions about the ImageTrail component:
- Original component: [React Bits](https://github.com/react-bits)
- Component file: `frontend/src/components/ui/ImageTrail.jsx`
- CSS file: `frontend/src/components/ui/ImageTrail.css`
- GSAP documentation: [https://greensock.com/docs/](https://greensock.com/docs/)
