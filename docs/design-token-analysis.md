# 🎨 Innovate Bhutan ERP - Complete Design Token Analysis

**Generated:** 2026-05-14  
**Version:** 1.0

---

## 📋 TABLE OF CONTENTS

1. [Color System](#1-color-system)
2. [Typography](#2-typography)
3. [Spacing & Layout](#3-spacing--layout)
4. [Border Radius](#4-border-radius)
5. [Shadows & Effects](#5-shadows--effects)
6. [Animations & Transitions](#6-animations--transitions)
7. [Component Patterns](#7-component-patterns)
8. [Glassmorphism](#8-glassmorphism)
9. [State & Interaction](#9-state--interaction)
10. [Recommendations](#10-recommendations)

---

## 1. COLOR SYSTEM

### Primary Color Palette (Luxury Emerald Green)

```css
/* Emerald Green System */
--primary: #0A5F4E;              /* Luxury Deep Emerald - Main brand color */
--primary-vibrant: #0F766E;      /* Rich Jade - Vibrant accent */
--primary-intense: #064E3B;       /* Deep Forest - Darker shade */
--primary-foreground: #FFFFFF;    /* White text on primary */
--primary-light: #D1FAE5;         /* Light green for backgrounds */
--primary-glow: rgba(10, 95, 78, 0.25);     /* Subtle glow effect */
--primary-shimmer: rgba(10, 95, 78, 0.4);   /* Shimmer effect */
```

**Tailwind Mapping:**
```js
primary: {
  DEFAULT: "#10B981",      // Lighter emerald for better visibility
  foreground: "#000000",   // Black text on primary
}
```

### Gradients

```css
/* Luxury Green Gradients */
--gradient-primary: linear-gradient(135deg, #064E3B 0%, #0A5F4E 50%, #0F766E 100%);
--gradient-luxury: linear-gradient(145deg, #064E3B 0%, #0A5F4E 50%, #0F766E 100%);
--gradient-crystal: linear-gradient(180deg, rgba(10, 95, 78, 0.15) 0%, rgba(10, 95, 78, 0.05) 100%);
```

### Secondary Colors

```css
/* Secondary - Purple */
--secondary: #8B5CF6;
--secondary-foreground: #FFFFFF;

/* Accent Colors */
--success: #059669;    /* Green for success states */
--warning: #D97706;    /* Amber for warnings */
--destructive: #DC2626; /* Red for danger/delete */
--info: #0891B2;       /* Cyan for info */
```

### Neutral Colors (Light Mode)

```css
/* Background & Foreground */
--background: #FFFFFF;
--background-solid: #FFFFFF;
--foreground: #0A0A0A;    /* Deepest black for max contrast */

/* Cards */
--card: #FFFFFF;
--card-foreground: #0A0A0A;

/* Text Hierarchy */
--text-primary: #0A0A0A;
--text-secondary: #374151;
--text-tertiary: #6B7280;
```

### Dark Mode Colors

```css
/* Dark Mode Backgrounds */
--background: #050505;     /* Ultra dark, not pure black */
--foreground: #FFFFFF;
--card: rgba(15, 15, 15, 0.95);

/* Dark Mode Text */
--text-primary: #FFFFFF;
--text-secondary: #D1D5DB;
--text-tertiary: #9CA3AF;

/* Dark Mode Borders */
--border: rgba(255, 255, 255, 0.12);
```

### Border System

```css
/* Borders - Light Mode */
--border: rgba(0, 0, 0, 0.12);           /* Default border */
--border-light: rgba(0, 0, 0, 0.06);      /* Subtle border */
--border-strong: rgba(0, 0, 0, 0.18);     /* Strong border */
--border-accent: rgba(10, 95, 78, 0.3);    /* Primary tint border */
```

---

## 2. TYPOGRAPHY

### Font Families

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

### Font Weights & Styles

```css
/* Heading Styles */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Body Text */
body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Text Effects

```css
/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #059669 0%, #10B981 50%, #14B8A6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gold Gradient Text */
.gradient-text-gold {
  background: linear-gradient(135deg, #EAB308 0%, #FACC15 50%, #FEF08A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Neon Text Glow */
.neon-text {
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
}

.dark .text-glow {
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3),
               0 0 20px rgba(16, 185, 129, 0.2);
}
```

---

## 3. SPACING & LAYOUT

### Container

```css
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

### Border Radius Scale

```css
--radius: 16px;  /* Base radius */

/* Derived Radius */
radius-sm: calc(var(--radius) - 10px);  /* 6px */
radius-md: calc(var(--radius) - 6px);   /* 10px */
radius-lg: calc(var(--radius) - 2px);   /* 14px */
radius-xl: var(--radius);              /* 16px */
```

---

## 4. BORDER RADIUS

### Usage Patterns

| Component | Radius | Value |
|-----------|--------|-------|
| Buttons | `rounded-md` | 10px |
| Cards | `rounded-lg` | 14px |
| Modals | `radius-xl` | 16px |
| Inputs | `rounded-md` | 10px |
| Badges | `rounded-full` | 9999px |
| Avatars | `rounded-full` | 9999px |

---

## 5. SHADOWS & EFFECTS

### Shadow Scale (Light Mode)

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-md: 0 6px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.10);
--shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.12);
--shadow-2xl: 0 50px 100px rgba(0, 0, 0, 0.15);
```

### Shadow Scale (Dark Mode)

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow-md: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 16px 32px rgba(0, 0, 0, 0.6);
--shadow-xl: 0 32px 64px rgba(0, 0, 0, 0.7);
--shadow-2xl: 0 64px 128px rgba(0, 0, 0, 0.8);
```

### Premium Green Shadows

```css
/* Light Mode */
--shadow-primary: 0 8px 32px rgba(10, 95, 78, 0.3), 0 0 60px rgba(10, 95, 78, 0.15);
--shadow-luxury: 0 20px 60px rgba(10, 95, 78, 0.25), 0 0 100px rgba(10, 95, 78, 0.1);

/* Dark Mode - Neon Glow */
--shadow-primary: 0 0 60px rgba(10, 95, 78, 0.6), 0 0 120px rgba(10, 95, 78, 0.4), 0 0 180px rgba(10, 95, 78, 0.2);
--shadow-luxury: 0 25px 80px rgba(10, 95, 78, 0.5), 0 0 150px rgba(10, 95, 78, 0.3);
--neon-shadow: 0 0 80px rgba(10, 95, 78, 0.7), 0 0 160px rgba(15, 118, 110, 0.5);
```

### Glass Effects

```css
/* Light Mode Glass */
--glass-stroke: rgba(255, 255, 255, 0.95);
--glass-bg: rgba(255, 255, 255, 0.85);
--glass-border: rgba(10, 95, 78, 0.25);
--glass-shadow: 0 12px 48px rgba(10, 95, 78, 0.12), 0 0 80px rgba(10, 95, 78, 0.08);
--prestige-blur: blur(24px);
--crystal-blur: blur(40px);

/* Dark Mode Glass */
--glass-stroke: rgba(255, 255, 255, 0.15);
--glass-bg: rgba(20, 20, 20, 0.90);
--glass-border: rgba(10, 95, 78, 0.4);
--glass-shadow: 0 12px 48px rgba(10, 95, 78, 0.2), 0 0 80px rgba(10, 95, 78, 0.15);
--prestige-blur: blur(30px);
--crystal-blur: blur(50px);
```

---

## 6. ANIMATIONS & TRANSITIONS

### Transition Timing Functions

```css
/* Luxury Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-luxury: 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Global Transitions

```css
/* Smooth transitions for all elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, 
                      fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Interactive elements get slightly longer transitions */
button, a, input, textarea, select {
  transition-duration: 200ms;
}
```

### Keyframe Animations

#### 1. Accordion (Built-in)

```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

.animate-accordion-down { animation: accordion-down 0.2s ease-out; }
.animate-accordion-up { animation: accordion-up 0.2s ease-out; }
```

#### 2. Marquee (Scrolling Text)

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee { animation: marquee 25s linear infinite; }
```

#### 3. Text Color Cycle

```css
@keyframes textColorCycle {
  0%, 100% { color: #10B981; }   /* Emerald */
  25% { color: #8B5CF6; }       /* Purple */
  50% { color: #F59E0B; }       /* Amber */
  75% { color: #3B82F6; }       /* Blue */
}

.animate-text-color { animation: textColorCycle 4s ease-in-out infinite; }
```

#### 4. Float Animations (4 variants)

```css
@keyframes float0 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes float1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(12px); }
}

@keyframes float2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float3 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.animate-float-0 { animation: float0 4s ease-in-out infinite; }
.animate-float-1 { animation: float1 5s ease-in-out infinite; }
.animate-float-2 { animation: float2 3.5s ease-in-out infinite; }
.animate-float-3 { animation: float3 4.5s ease-in-out infinite; }
```

#### 5. Shimmer (Loading Effect)

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer { animation: shimmer 2s linear infinite; }
.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

#### 6. Electric Pulse (Cinematic)

```css
@keyframes electric-pulse {
  0% { transform: translateX(-100%); opacity: 0; }
  10% { opacity: 1; }
  80% { opacity: 0.8; }
  100% { transform: translateX(400%); opacity: 0; }
}

.animate-electric-pulse { 
  animation: electric-pulse 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
  animation-delay: 0.8s; 
}
```

#### 7. Border Flicker (Live Wire Effect)

```css
@keyframes border-flicker {
  0%, 100% { opacity: 1; }
  48%       { opacity: 1; }
  50%       { opacity: 0.3; }
  52%       { opacity: 1; }
  94%       { opacity: 1; }
  96%       { opacity: 0.4; }
  98%       { opacity: 1; }
}

.animate-border-flicker { animation: border-flicker 4s ease-in-out infinite; }
```

#### 8. Cinematic Reveal (Movie Title Style)

```css
@keyframes cinematic-reveal {
  0% { stroke-dashoffset: 283; opacity: 0; }
  10% { opacity: 1; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

.animate-cinematic-reveal { animation: cinematic-reveal 2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
```

#### 9. Pulse Glow (Breathing Effect)

```css
@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 3px rgba(16, 185, 129, 0.5)); }
  50% { opacity: 1; filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.8)); }
}

.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
```

#### 10. Core Pulse (Dramatic Center Element)

```css
@keyframes core-pulse {
  0%, 100% { 
    transform: scale(1); 
    filter: brightness(1) drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)); 
  }
  50% { 
    transform: scale(1.05); 
    filter: brightness(1.2) drop-shadow(0 0 20px rgba(16, 185, 129, 1)); 
  }
}

.animate-core-pulse { animation: core-pulse 3s ease-in-out infinite; }
```

#### 11. Float Up (Magic Dust Particles)

```css
@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-20px) scale(0.5); opacity: 0; }
}

.animate-float-up { animation: float-up 3s ease-out infinite; }
.animate-float-up-delay-1 { animation: float-up 3s ease-out infinite; animation-delay: 0.5s; }
.animate-float-up-delay-2 { animation: float-up 3s ease-out infinite; animation-delay: 1s; }
```

#### 12. Fade In Up (Entry Animation)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }

/* Stagger delays */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }
```

#### 13. Scanning Line (Security Scan Effect)

```css
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

#### 14. Letter Glow Pulse

```css
@keyframes letter-glow-pulse {
  0%, 100% { text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }
  50% { text-shadow: 0 0 25px rgba(16, 185, 129, 0.8), 0 0 35px rgba(16, 185, 129, 0.4); }
}

.letter-glow-pulse { animation: letter-glow-pulse 2s ease-in-out infinite; }
```

### Framer Motion Usage (31 files)

**Common patterns found:**

```typescript
// Page Transition (slide + fade)
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -100 }}
transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}

// Stagger Children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Scale + Fade
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.3, duration: 0.6 }}
```

---

## 7. COMPONENT PATTERNS

### Button Styles

```css
/* Luxury Button (Custom) */
.btn-luxury {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
  transition: all 0.3s ease;
}

.btn-luxury:hover {
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
  transform: translateY(-1px);
}
```

### Button Variants (shadcn/ui)

| Variant | Usage | Effect |
|---------|-------|--------|
| `default` | Primary actions | Emerald bg + hover |
| `destructive` | Delete/Danger | Red bg + hover |
| `outline` | Secondary | Border + bg hover |
| `secondary` | Alternative | Purple bg + hover |
| `ghost` | Subtle | Transparent + hover |
| `link` | Text link | Underline on hover |

### Card Hover Effects

```css
/* Glassmorphism Card */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Hover Lift Effect */
.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

### Focus Styles (Accessibility)

```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Enhanced Focus Ring */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4),
              0 0 0 6px rgba(16, 185, 129, 0.1);
}

.dark .focus-ring:focus-visible {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.6),
              0 0 0 6px rgba(16, 185, 129, 0.2);
}
```

---

## 8. GLASSMORPHISM

### Glass Card Implementation

```css
/* Standard Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

/* Layered Glass (Enhanced) */
.glass-layered {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

/* Dark Mode Glass */
.dark .glass-layered {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 60px rgba(16, 185, 129, 0.1);
}
```

---

## 9. STATE & INTERACTION

### Hover States

```css
/* Icon Scale on Hover */
.group-hover:scale-110 { transition: transform 0.2s; }

/* Card Border Glow */
.border-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, #059669, #14B8A6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.border-glow:hover::before {
  opacity: 1;
}
```

### Loading States

```css
/* Shimmer Loading */
.shimmer {
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255,255,255,0.3) 50%, 
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

### Disabled States

```css
disabled:pointer-events-none disabled:opacity-50
```

### Active/Touch States (iOS)

```css
@media (hover: none) {
  .group:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}
```

---

## 10. RECOMMENDATIONS

### 🔴 Critical Issues

1. **Inconsistent Primary Color**
   - `tailwind.config.js` has `#10B981` (lighter)
   - `globals.css` has `#0A5F4E` (darker)
   - **Fix:** Standardize to `#0A5F4E` across both files

2. **Duplicate Animation Definitions**
   - `shimmer`, `fadeInUp`, `cinematic-*` defined multiple times
   - **Fix:** Consolidate into single definitions

3. **Missing Semantic Tokens**
   - Some components use hardcoded values
   - **Fix:** Create comprehensive token system

### 🟡 Improvement Opportunities

1. **Page Transitions**
   - No consistent page transition animation
   - **Recommendation:** Add Framer Motion `AnimatePresence` at layout level

2. **Modal Transitions**
   - Modals need smooth entry/exit animations
   - **Recommendation:** Add scale + fade with bounce

3. **Table Row Hover**
   - Tables lack interactive feedback
   - **Recommendation:** Add subtle bg color shift + scale

4. **Form Input Focus**
   - Inputs need stronger focus indication
   - **Recommendation:** Add border color glow + shadow

### 🟢 Strengths to Preserve

1. ✅ Comprehensive color system with dark mode
2. ✅ Extensive animation library
3. ✅ Glassmorphism effects well-implemented
4. ✅ Accessibility focus styles
5. ✅ Reduced motion support

### 📋 Design Token Consolidation Plan

```
NEW STRUCTURE:
:root {
  /* === COLORS === */
  --color-primary-50: #D1FAE5;
  --color-primary-100: #A7F3D0;
  --color-primary-500: #0A5F4E;
  --color-primary-600: #064E3B;
  --color-primary-700: #064E3B;
  
  /* === TRANSITIONS === */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* === DURATIONS === */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

---

## 🎬 ANIMATION CATALOG SUMMARY

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Accordion | 200ms | ease-out | Collapsible content |
| Marquee | 25s | linear | Scrolling text |
| Text Color Cycle | 4s | ease-in-out | Attention text |
| Float (0-3) | 3.5-5s | ease-in-out | Decorative elements |
| Shimmer | 2s | linear | Loading skeletons |
| Electric Pulse | 2.5s | custom | Cinematic reveals |
| Border Flicker | 4s | ease-in-out | Live indicators |
| Cinematic Reveal | 2s | custom | Logo reveals |
| Pulse Glow | 2s | ease-in-out | Breathing effects |
| Core Pulse | 3s | ease-in-out | Center elements |
| Float Up | 3s | ease-out | Particles |
| Fade In Up | 0.6s | ease-out | Page content |
| Letter Glow | 2s | ease-in-out | Text emphasis |

---

**Total Tokens Analyzed:**
- Colors: 45+
- Animations: 14 keyframe sets
- Transitions: 4 timing functions
- Shadows: 10 variants
- Components: 50+ styled elements
