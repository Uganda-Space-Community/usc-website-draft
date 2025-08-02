# Uganda Space Community — Design System

> Living document. Reference for all page implementations.
> Actual CSS values in `site/index.html` — this doc captures intent and rules.

---

## 1. Color Palette

### Light Mode (Default)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#F7F8FA` | Page background |
| `--bg-alt` | `#FFFFFF` | Card backgrounds, footer |
| `--bg-alt-subtle` | `#F2F3F6` | Alternating sections |
| `--text` | `#0C1A2E` | Primary text |
| `--text-2` | `#5C6678` | Secondary text |
| `--text-3` | `#8A91A0` | Tertiary text, meta |
| `--border` | `#E4E6EA` | Default borders |
| `--border-hover` | `#D0D3D8` | Hover borders |
| `--gold` | `#B8953F` | Primary accent |
| `--red` | `#D94F3D` | Warm accent (Ugandan flag) |
| `--emerald` | `#1F8A5B` | Success/active status |
| `--crimson` | `#B5342E` | Error/urgent status |
| `--star-color` | `rgba(150,155,165,0.18)` | Star field dots |

### Dark Mode

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0A1628` | Page background |
| `--bg-alt` | `#0F1F35` | Card backgrounds, footer |
| `--bg-alt-subtle` | `#0C1929` | Alternating sections |
| `--text` | `#EAECF0` | Primary text |
| `--text-2` | `#7A8498` | Secondary text |
| `--text-3` | `#5C6678` | Tertiary text |
| `--border` | `rgba(255,255,255,0.06)` | Default borders |
| `--border-hover` | `rgba(255,255,255,0.12)` | Hover borders |
| `--gold` | `#C9A84C` | Primary accent |
| `--red` | `#E05A4A` | Warm accent |
| `--star-color` | `rgba(255,255,255,0.08)` | Star field dots |

### Color Rules

- **Gold:** Primary accent for CTAs, labels, links, icons, hover states
- **Red:** Competition, urgency, national identity (Ugandan flag). Used sparingly.
- **Emerald:** Active status, success indicators
- **Crimson:** Error status, urgent alerts (use red `--red` for visual accent instead)

---

## 2. Typography

### Font Families

| Font | Usage |
|---|---|
| **Inter** | Everything — body, headings, labels, buttons, numbers, navigation |

### Type Scale

| Element | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Hero heading | Inter | clamp(2.8rem, 7vw, 5.2rem) | 300 | Light, elegant |
| Section heading (h2) | Inter | 2.2rem | 300 | Light weight |
| Card heading (h3) | Inter | 1.1-1.2rem | 300-400 | |
| Card subheading (h4) | Inter | 0.95-1.1rem | 400 | |
| Body text | Inter | 0.88-0.95rem | 300 | Line-height 1.65-1.8 |
| Caption/meta | Inter | 0.68-0.76rem | 400 | Color: --text-3 |
| Labels | Inter | 0.62-0.7rem | 600 | Uppercase, tracked 0.12em |
| Navigation | Inter | 0.8-0.92rem | 500-600 | |
| Numbers/stats | Inter | 1.3-2.2rem | 700 | |
| Buttons | Inter | 0.76-0.82rem | 600 | Uppercase on hero buttons |

### Rules

- All headings use `letter-spacing: -0.015em` to `-0.025em`
- Line-height: headings 1.15, body 1.65-1.8
- Labels are always uppercase with 0.12-0.16em letter-spacing

---

## 3. Spacing

### Scale

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Icon padding, micro gaps |
| sm | 8px | Small gaps, inline elements |
| md | 12-16px | Element gaps, padding |
| lg | 20-24px | Card padding, section inner spacing |
| xl | 28-32px | Grid gaps, wrapper padding |
| 2xl | 40-48px | Section gaps between major groups |
| 3xl | 56-64px | Large section gaps |
| section | 96-112px | Vertical section padding |

### Wrapper

- Max-width: 1280px
- Padding: 0 32px (0 18px on mobile)
- Centered with `margin: 0 auto`

---

## 4. Components

### Buttons

| Class | Style | Usage |
|---|---|---|
| `.btn-gold` | Gold background, white text | Primary CTAs |
| `.btn-ghost` | Transparent, white border | Secondary CTAs |
| `.btn-red` | Red background, white text | Urgent actions |
| `.btn-hero` | Circle icon + text | Hero CTA |

### Cards

| Class | Style | Usage |
|---|---|---|
| `.tc-event-card` | Background image, text overlay | Featured events |
| `.updates-feat-card` | Image top, text below | Featured updates |
| `.updates-list-item` | Thumbnail + text, 2-column grid | List items |
| `.pc-campaign` | Text with progress bar | Campaign slides |
| `.pc-project-row` | Status dot + title + count | Project list |

### Lists

| Class | Style | Usage |
|---|---|---|
| `.events-compact` | Date + title + meta, border-bottom | Event headlines |
| `.headline-item` | Type label + title + meta, left-border | News headlines |
| `.feed-item` | Category + title + meta, left-border | Update feed |

### Filters

| Class | Style | Usage |
|---|---|---|
| `.filter-chips` | Horizontal row of pill buttons | Category filtering |
| `.filter-chip` | Pill button, active state = gold fill | Individual filter |

### Dividers

| Class | Style | Usage |
|---|---|---|
| `.section-divider` | Star + dots + lines | Between major sections |
| `.section-divider-star` | Red dot with glow + ring | Center of divider |

### Status Indicators

| Class | Color | Meaning |
|---|---|---|
| `.status-active` | Emerald | Active/ongoing |
| `.status-progress` | Gold | In progress |
| `.status-seeking` | Red | Needs members |

---

## 5. Layout Patterns

### Two-Column (Events)
```
┌──────────────────┬──────────────────┐
│  Featured        │  Compact List    │
│  (scrollable)    │  (scrollable)    │
└──────────────────┴──────────────────┘
```
Grid: `1.2fr 1fr`, max-height 450px

### Three-Column (Updates)
```
┌──────────┬──────────┬──────────┐
│ Featured │ Latest   │ External │
│ (cards)  │ (list)   │ (list)   │
└──────────┴──────────┴──────────┘
```
Grid: `1.2fr 1fr 1fr`, max-height 450px

### Bundled (Projects + Campaigns)
```
┌──────────────────────┬──────────────────────┐
│  Campaigns           │  Projects List       │
│  (slideshow)         │  (5 items)           │
└──────────────────────┴──────────────────────┘
```
Grid: `1.2fr 1fr`

---

## 6. Icons

- All inline SVG, 24x24 viewBox
- Stroke-based, `stroke-width: 1.5`
- Color: `currentColor` (inherits text color)
- Sizes: `.ico` (22px), `.ico-sm` (18px)

---

## 7. Interactions

| Element | Transition | Duration |
|---|---|---|
| Hover states | color, border-color | 0.2s |
| Card hover | transform translateY(-2px), shadow | 0.3s |
| Slide transitions | opacity | 0.5-0.6s |
| Button gap animation | gap (5px → 9px) | 0.2s |
| Marquee scroll | transform translateX | 40s linear |
| Logo float | transform translateY + rotate | 4s ease-in-out |
| Emblem float | transform translateY + rotate | 6s ease-in-out |

### Scroll Effects

- `.scroll-fade`: CSS mask gradient at top/bottom edges
- Fade height: 20px from edge

---

## 8. Responsive

| Breakpoint | Changes |
|---|---|
| 1280px+ | Full layout, wrapper 1280px |
| 900px | Stack grids to 1 column, show hamburger, hide scroll indicator |
| 640px | Reduce padding (18px), smaller headings, stack all grids |

### Mobile Patterns
- Nav: Hamburger → dropdown
- Hero: Reduced height, smaller heading
- Grids: Single column
- Featured items: Max-height for scroll

---

## 9. Dark/Light Mode

- Toggle via `.theme-toggle` button (sun/moon icon)
- Stored in `localStorage` key: `usc-theme`
- Default: Light mode
- Transition: `background 0.3s, color 0.3s` on body
- Hero stays dark in both modes
- Nav adapts: transparent over hero, solid when scrolled
- Star field visible in both modes (different dot colors)

---

## 10. Section Order (Homepage)

```
1. Hero
2. Mission + Slideshow
3. Pillars (Get Involved)
4. Events (featured + compact)
5. News/Updates (3-column)
6. Projects + Campaigns
7. Marquee Ribbon
8. CTA
9. Footer
```

Dividers between: Mission→Pillars, Pillars→Events, Events→Updates, Updates→Projects

---

## 11. Naming & Voice

- "The Community" (not "The Constellation" — overused)
- "The Constellation" kept for tagline/footer only
- Section labels: gold uppercase (Discover, Get Involved, Latest, etc.)
- CTA language: action-oriented (Join, Explore, Register, View)

---

## 12. Discover Page

### Layout
- 3-column: Filters (220px) | Main View (1fr) | Sidebar (280px)
- Featured story slideshow at top (full width, fade transitions)
- Card grid below (2 columns)
- Sidebar: Quick Stats, Pinned Items, Calendar Heatmap, Quick Actions

### Tabs
- All, Events, News, Opportunities, Projects
- Tab active state: gold underline
- Tabs control card filtering

### Filters
- Type: Radio buttons (All, Events, News, Opportunities, Projects)
- Campaign: Checkboxes (Space Week, CubeSat, Outreach)
- Date Range: Two date inputs

### Calendar Heatmap
- GitHub-style colored squares
- 4 levels: empty, light, medium, dark, gold
- Interactive: click to filter events by date

### Expand Mode
- "View More" button expands main view
- Sidebar stays visible
- "Back to Overview" to collapse

### Card Grid
- 2 columns on desktop, 1 on mobile
- Each card: image + category label + title + description + date
- Hover: border highlight + shadow

---

## 13. Navigation Structure

### Homepage Nav
- Updates → updates.html
- Launchpad → launchpad.html
- Knowledge → knowledge.html
- Community → community.html
- FAQ → faq.html

### Updates Page Nav
- Home → index.html
- Updates → updates.html (active)
- Launchpad → launchpad.html
- Knowledge → knowledge.html
- Community → community.html

---

## 14. Content Types

| Type | Label Color | Icon |
|---|---|---|
| Event | Gold | Calendar |
| News | Gold | Newspaper |
| Opportunity | Gold | Briefcase/Document |
| Project | Gold | Layers/Box |
