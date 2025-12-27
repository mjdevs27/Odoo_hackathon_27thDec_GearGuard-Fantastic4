# GearGuard Design System Guide

## Overview

The design system has been extracted from the landing page to ensure consistent theming across all pages. All design tokens are stored in `design-system.json` and can be accessed via the `useDesignSystem` hook.

---

## Files Created

1. **`src/design-system.json`** - Complete design configuration
2. **`src/hooks/useDesignSystem.ts`** - Hook and helper functions

---

## Design Tokens

### Colors

#### Primary Palette (Blue)
```typescript
import designSystem from './design-system.json';

const primaryBlue = designSystem.colors.primary[600]; // #2563eb
```

#### Slate Palette (Grays)
```typescript
const darkBg = designSystem.colors.slate[900]; // #0f172a
const lightBg = designSystem.colors.slate[100]; // #f1f5f9
```

#### Semantic Colors
```typescript
const success = designSystem.colors.semantic.success; // #10b981
const warning = designSystem.colors.semantic.warning; // #f59e0b
const error = designSystem.colors.semantic.error; // #ef4444
```

#### Priority Colors
```typescript
const urgentColor = designSystem.colors.priority.urgent; // #ef4444
const highColor = designSystem.colors.priority.high; // #f97316
const mediumColor = designSystem.colors.priority.medium; // #f59e0b
const lowColor = designSystem.colors.priority.low; // #10b981
```

#### Stage Colors
```typescript
const newColor = designSystem.colors.stage.new; // #3b82f6
const inProgressColor = designSystem.colors.stage.in_progress; // #f59e0b
const repairedColor = designSystem.colors.stage.repaired; // #10b981
const scrapColor = designSystem.colors.stage.scrap; // #ef4444
```

---

## Component Styles

### Buttons

#### Using Helper Function
```tsx
import { getButtonStyles } from '@/hooks/useDesignSystem';

function MyButton() {
  const isDark = true; // or get from theme context
  const buttonStyle = getButtonStyles('primary', 'lg', isDark);
  
  return (
    <button style={buttonStyle}>
      Click Me
    </button>
  );
}
```

#### Using Tailwind Classes (Recommended)
```tsx
// Primary Button
<button className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xl shadow-blue-600/30 transition-all">
  Primary Action
</button>

// Secondary Button (Light Mode)
<button 
  className="px-8 py-4 rounded-full backdrop-blur-sm font-semibold transition-all"
  style={{
    backgroundColor: 'rgba(30,64,175,0.1)',
    border: '1px solid rgba(30,64,175,0.3)',
    color: '#1e40af'
  }}
>
  Secondary Action
</button>

// Secondary Button (Dark Mode)
<button 
  className="px-8 py-4 rounded-full backdrop-blur-sm font-semibold transition-all"
  style={{
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#ffffff'
  }}
>
  Secondary Action
</button>
```

---

### Cards

#### Using Helper Function
```tsx
import { getCardStyles } from '@/hooks/useDesignSystem';

function FeatureCard() {
  const isDark = true;
  const cardStyle = getCardStyles(isDark);
  
  return (
    <div style={cardStyle}>
      <h3>Feature Title</h3>
      <p>Feature description</p>
    </div>
  );
}
```

#### Using Tailwind Classes (Recommended)
```tsx
// Light Mode Card
<div className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all">
  Content
</div>

// Dark Mode Card
<div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all">
  Content
</div>
```

---

### Badges

#### Priority Badges
```tsx
import { getPriorityBadgeStyles } from '@/hooks/useDesignSystem';

function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' | 'urgent' }) {
  const isDark = true;
  const badgeStyle = getPriorityBadgeStyles(priority, isDark);
  
  return (
    <span style={badgeStyle}>
      {priority.toUpperCase()}
    </span>
  );
}
```

#### Stage Badges
```tsx
import { getStageBadgeStyles } from '@/hooks/useDesignSystem';

function StageBadge({ stage }: { stage: 'new' | 'in_progress' | 'repaired' | 'scrap' }) {
  const isDark = true;
  const badgeStyle = getStageBadgeStyles(stage, isDark);
  
  return (
    <span style={badgeStyle}>
      {stage.replace('_', ' ').toUpperCase()}
    </span>
  );
}
```

#### Tailwind Badge Classes
```tsx
// Urgent Priority (Light)
<span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
  URGENT
</span>

// Urgent Priority (Dark)
<span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
  URGENT
</span>
```

---

### Inputs

```tsx
import { getInputStyles } from '@/hooks/useDesignSystem';

function SearchInput() {
  const isDark = true;
  const inputStyle = getInputStyles(isDark);
  
  return (
    <input 
      type="text" 
      placeholder="Search..."
      style={inputStyle}
    />
  );
}
```

#### Tailwind Input Classes
```tsx
// Light Mode
<input 
  type="text"
  className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 transition-all"
  placeholder="Search..."
/>

// Dark Mode
<input 
  type="text"
  className="w-full px-4 py-3 rounded-lg border text-white placeholder-slate-600 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 transition-all"
  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
  placeholder="Search..."
/>
```

---

## Typography

### Font Sizes
```tsx
<h1 className="text-7xl font-extrabold">Heading 1</h1>
<h2 className="text-5xl font-bold">Heading 2</h2>
<h3 className="text-3xl font-bold">Heading 3</h3>
<p className="text-lg">Body text</p>
<span className="text-sm">Small text</span>
```

### Font Weights
```tsx
<span className="font-normal">Normal (400)</span>
<span className="font-medium">Medium (500)</span>
<span className="font-semibold">Semibold (600)</span>
<span className="font-bold">Bold (700)</span>
<span className="font-extrabold">Extrabold (800)</span>
```

---

## Spacing

Use Tailwind's spacing scale which matches the design system:
```tsx
<div className="p-4">Padding 1rem</div>
<div className="p-6">Padding 1.5rem</div>
<div className="p-8">Padding 2rem</div>
<div className="gap-4">Gap 1rem</div>
<div className="space-y-6">Vertical spacing 1.5rem</div>
```

---

## Effects

### Backdrop Blur
```tsx
<div className="backdrop-blur-sm">Small blur</div>
<div className="backdrop-blur-md">Medium blur</div>
<div className="backdrop-blur-xl">Extra large blur</div>
```

### Transitions
```tsx
<button className="transition-all duration-200">Fast transition</button>
<button className="transition-all duration-300">Slow transition</button>
```

### Hover Effects
```tsx
<div className="hover:scale-105 hover:-translate-y-1 transition-transform">
  Hover to lift
</div>
```

---

## Dark Mode Implementation

### Using Tailwind Dark Mode
```tsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  This adapts to dark mode
</div>
```

### Using State
```tsx
const [isDark, setIsDark] = useState(true);

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);
```

---

## Complete Component Examples

### Feature Card
```tsx
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
```

### Request Card with Priority Badge
```tsx
function RequestCard({ request }: { request: MaintenanceRequest }) {
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600/20 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-600/20 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-600/20 dark:text-red-400'
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {request.subject}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[request.priority]}`}>
          {request.priority.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {request.equipment_name}
      </p>
    </div>
  );
}
```

---

## Best Practices

1. **Always use Tailwind classes when possible** - They're optimized and tree-shakeable
2. **Use design system colors for consistency** - Avoid hardcoding colors
3. **Maintain dark mode support** - Use `dark:` prefix for dark mode styles
4. **Use backdrop blur for glassmorphism** - Matches landing page aesthetic
5. **Add transitions to interactive elements** - Smooth user experience
6. **Use rounded-full for buttons** - Capsule shape from landing page
7. **Consistent spacing** - Use 4, 6, 8 for padding/gaps

---

## Quick Reference

**Primary Blue:** `#3b82f6` / `bg-blue-600`
**Dark Background:** `#0f172a` / `bg-slate-900`
**Light Background:** `#f1f5f9` / `bg-slate-100`
**Border Radius:** `rounded-2xl` (cards), `rounded-full` (buttons/badges)
**Backdrop Blur:** `backdrop-blur-sm` or `backdrop-blur-xl`
**Transition:** `transition-all duration-300`

Use this design system to maintain visual consistency across all pages! 🎨
