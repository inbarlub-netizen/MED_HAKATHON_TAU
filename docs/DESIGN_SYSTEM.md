# ClinFlight Design System

A custom design language for ClinFlight OS. The goal: every screen should feel like a **premium
medical simulation cockpit**, never a generic admin dashboard.

Built on the **shadcn/ui foundation** (Radix UI primitives + Tailwind), styled to a bespoke theme —
not from scratch, and not a copied template.

## Foundations

| Token | Value | Use |
|---|---|---|
| `ink-900` | `#07111F` | App background (deepest) |
| `ink-800` | `#0B1220` | Panels, sidebar |
| `ink-700` | `#0F1A2E` | Raised surfaces |
| Brand cyan | `#22d3ee` | Primary accent, trust |
| Brand blue | `#3b82f6` | Primary gradient partner |
| Brand violet | `#8b5cf6` | Clinical presence, secondary |
| Concern | `#a855f7` / fuchsia | **Hidden concern** (locked → unlocked) |
| Success | `#34d399` | Good actions, indicated tests |
| Warning | `#fbbf24` | Guarded, low-yield, focus areas |
| Danger | `#fb7185` | Judgmental phrasing, missed safety |

- **Typography:** Inter (400–800), tight tracking on headings, `tabular`/`ss01` features.
- **Surfaces:** glassmorphism — `border-white/10` + `bg-white/[0.035]` + `backdrop-blur-xl`.
- **Radius:** `rounded-2xl` panels, `rounded-xl` controls, `rounded-full` chips/score rings.
- **Shadows:** `shadow-glow` (cyan), `shadow-glow-violet`, `shadow-card` (depth).
- **Motion:** Framer Motion — card fade-up entrance, hidden-concern `pulse-ring`, animated score
  rings and meters. Subtle, never distracting.
- **Backdrops:** radial cyan/violet glows + faint grid (`bg-grid`) — an Aceternity-style hero,
  hand-written so there are no licensing concerns.

## Reusable components

Located in `src/components/`:

| Component | File | Purpose |
|---|---|---|
| `Card`, `CardHeader` | `ui/primitives.tsx` | Glass panel + standardized header (icon, title, subtitle, right slot) |
| `Stat` (**metric card**) | `ui/primitives.tsx` | KPI tile with value, unit, delta, tone, icon |
| `Badge` | `ui/primitives.tsx` | Tonal status pills (slate/cyan/violet/success/warning/danger) |
| `Button` | `ui/primitives.tsx` | CVA variants: primary, violet, ghost, danger, subtle |
| `SectionTitle`, `FadeIn` | `ui/primitives.tsx` | Page headers + entrance animation |
| `RadialScore` (**score ring**) | `common/Scores.tsx` | Animated circular OSCE/score gauge |
| `ScoreMeter` | `common/Scores.tsx` | Animated bar meter with delta arrows |
| `HiddenConcernChip` | `common/Scores.tsx` | Locked → clue → partial → unlocked, with pulse |
| `Waveform` | `common/Scores.tsx` | Live voice waveform (mic-driven or idle) |
| **Timeline cards** | `pages/Debrief.tsx` (`ReplayTimeline`) | Replay events with sentiment color + coaching |
| **Patient panel** | `pages/Cockpit.tsx` (`LeftColumn`) | Patient identity, persona, vitals, hidden-concern state |
| Radix wrappers | `ui/radix.tsx` | Tabs, Progress, Tooltip, Dialog, Switch, ScrollArea, Separator |
| `AppLayout` | `layout/AppLayout.tsx` | Cockpit sidebar nav + safety rail + animated route transitions |

## Screen priorities (all delivered)

1. **Landing** — premium hero, the loop, comparison, specialty cards.
2. **Student Flight Deck** — profile, detected weakness, recommended case, radar/trend charts.
3. **Clinical Cockpit** — 3-column voice-first encounter (patient panel · transcript+mic · OSCE tracker).
4. **OSCE Replay & Debrief** — score ring, evidence rubric, EPA bars, filterable timeline.
5. **Faculty Command** — cohort KPIs, skill heatmap, curriculum gaps, recommendations.
6. **Instructor Copilot** — debrief queue, load balancing, AI debrief guide.
7. **Case Builder Preview** — stepper + live disclosure-trigger tester.

## Principles

- High contrast, readable type, clear focus states.
- Critical meaning never conveyed by color alone (icons + labels accompany every status).
- Optimized for a laptop demo; responsive down to tablet without broken layouts.
- No Lorem Ipsum, no broken empty states — every screen has real, intentional content.
