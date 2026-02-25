# Responsive QA Checklist

Manual test flow for mobile/tablet/desktop before every deploy.

## Test Breakpoints

| Label      | Width   | Device Example              |
|------------|---------|-----------------------------|
| Narrow     | 320px   | iPhone SE, Galaxy S8        |
| Phone      | 375px   | iPhone 12/13/14             |
| Phone+     | 414px   | iPhone 12 Pro Max           |
| Tablet     | 768px   | iPad Mini (portrait)        |
| Laptop     | 1024px  | iPad Pro landscape / laptop |
| Desktop    | 1280px+ | Desktop monitors            |

## How to Test

1. Open Chrome DevTools (F12) > Toggle Device Toolbar (Ctrl+Shift+M)
2. Set viewport to each breakpoint width
3. Walk through each page below and verify the checklist items

---

## Pages to Test

### 1. Landing Page (`/`)

**Screenshots to capture:**
- [ ] Hero section at 320px and 1280px
- [ ] Navbar with hamburger at 375px
- [ ] Testimonials grid at 768px (2-col) and 480px (1-col)
- [ ] Comparison cards at 480px (stacked)
- [ ] Footer at 375px

**Checklist:**
- [ ] No horizontal scroll at any breakpoint
- [ ] Hamburger menu appears below 768px
- [ ] Hamburger opens/closes, links work, drawer dismisses on click
- [ ] Desktop nav links hidden when hamburger is visible
- [ ] Hero heading scales smoothly (clamp)
- [ ] "Get Started" button is full-width on mobile (<480px)
- [ ] Company logos wrap cleanly
- [ ] Testimonial cards: 3-col at desktop, 2-col at tablet, 1-col at phone
- [ ] Comparison cards stack at mobile
- [ ] Use case tags wrap and don't overflow
- [ ] Footer stacks vertically on mobile
- [ ] All buttons/links meet 44px minimum tap target

### 2. Checkout Success (`/checkout/success`)

**Screenshots to capture:**
- [ ] Full page at 375px

**Checklist:**
- [ ] Card padding reduces on small screens (clamp)
- [ ] Spinner centered, text readable
- [ ] No horizontal overflow

### 3. Checkout Cancel (`/checkout/cancel`)

**Screenshots to capture:**
- [ ] Full page at 375px

**Checklist:**
- [ ] Card padding reduces on small screens
- [ ] "Try Again" button is full-width, 44px+ height
- [ ] "Sign Out" link has comfortable tap target
- [ ] Error text doesn't overflow card

### 4. Dashboard (`/dashboard`)

**Screenshots to capture:**
- [ ] Full layout at 375px with sidebar closed
- [ ] Sidebar drawer open at 375px
- [ ] Instance status (active) at 375px and 1280px
- [ ] Launch button (paid status) at 375px
- [ ] Provisioning progress at 375px

**Checklist:**
- [ ] Sidebar hidden by default on mobile
- [ ] Hamburger button visible in header on mobile
- [ ] Sidebar slides in from left with backdrop overlay
- [ ] Tapping backdrop closes sidebar
- [ ] X button inside sidebar closes it
- [ ] Nav links close sidebar on click
- [ ] Sidebar static (always visible) on desktop (md+)
- [ ] Hamburger hidden on desktop
- [ ] Email truncated at 150px on small screens
- [ ] Main content padding: 16px mobile, 24px desktop
- [ ] Hero "Open Assistant Dashboard" button full-width on mobile
- [ ] "Launch Your OpenClaw" button full-width on mobile
- [ ] Instance URL doesn't overflow (truncated with copy button)
- [ ] Instance controls wrap cleanly
- [ ] Plan/Region pill wraps on narrow screens
- [ ] Setup steps grid: 2-col on sm+, 1-col below
- [ ] Progress bar dots visible and not clipped

### 5. Billing (`/dashboard/billing`)

**Screenshots to capture:**
- [ ] Plan cards at 375px (stacked) and 768px (3-col)

**Checklist:**
- [ ] "Open Billing Portal" button full-width on mobile
- [ ] Plan cards: 3-col on sm+, 1-col below
- [ ] Card content doesn't overflow

### 6. Settings (`/dashboard/settings`)

**Screenshots to capture:**
- [ ] Danger zone at 375px (stacked)

**Checklist:**
- [ ] Danger zone layout stacks on mobile (text above button)
- [ ] "Cancel Subscription" button full-width on mobile
- [ ] Config list items don't overflow

---

## Global Checks (All Pages)

- [ ] No horizontal scrollbar at any breakpoint (320px through 1440px)
- [ ] No text clipping or overlap
- [ ] No elements hidden behind the iOS notch (safe-area-inset padding applied)
- [ ] Images/SVGs maintain aspect ratio
- [ ] Font sizes remain readable at 320px (minimum ~12px body, ~11px labels)
- [ ] Interactive elements have adequate spacing (no accidental taps)
- [ ] Loading states don't cause layout shift

---

## Pre-Deploy Sign-Off

| Check | Status |
|-------|--------|
| All pages pass at 320px | |
| All pages pass at 375px | |
| All pages pass at 768px | |
| All pages pass at 1280px | |
| No console errors | |
| Build succeeds (`npm run build`) | |
| Tested on actual mobile device (optional) | |
