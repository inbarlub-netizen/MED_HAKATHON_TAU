# Source Audit

Honest accounting of every reference reviewed for ClinFlight OS, what (if anything) was reused, and
the licensing basis. **No proprietary UI, paid templates, commercial screenshots, or copyrighted
medical cases were copied. All clinical cases are synthetic and original.**

## Research references (architecture / concept inspiration only)

| # | Source | URL | What it is | License | Code reused? | What we took | Risk | Attribution |
|---|--------|-----|-----------|---------|--------------|--------------|------|-------------|
| 1 | EasyMED | https://github.com/FreedomIntelligence/EasyMED | Virtual standardized patient, intent recognition, evaluation agent | Repo license (review before any code reuse) | **No** | Concept only: patient agent → intent → evaluation → trajectory feedback split | Low (no code copied) | Not required (inspiration) |
| 2 | MedAgentSim | https://github.com/MAXNORM8650/MedAgentSim | Doctor/patient/measurement agents, vitals, labs, imaging | Repo license | **No** | Concept: measurement agent + diagnostic flow structure | Low | Not required |
| 3 | EvoPatient | https://github.com/ZJUMAI/EvoPatient | Multi-agent patient simulation & evaluation | Repo license | **No** | Concept: patient profiles + evaluation framing | Low | Not required |
| 4 | PatientSim | https://www.physionet.org/content/persona-patientsim/ | Patient persona dataset (anxious, guarded, confused elderly…) | PhysioNet credentialed | **No** | Concept only: persona taxonomy names | Medium (data is credentialed — we used none) | Not required (no data used) |
| 5 | MedConceal | https://arxiv.org/abs/2604.08788 | Hidden-information disclosure concept | Paper | **No** | Core concept of the **Hidden Concern Engine** | Low | Cited as inspiration |
| 6 | MedSimAI | https://arxiv.org/abs/2503.05793 | Deliberate practice, formative OSCE feedback | Paper | **No** | Concept: repeated attempts + formative scoring | Low | Cited as inspiration |
| 7 | Body Interact | https://bodyinteract.com/ | Commercial virtual patient sim | Proprietary | **No** | Market reference only — never inspected code/UI | None | N/A |
| 8 | SimX | https://www.simxvr.com/ | Commercial VR sim | Proprietary | **No** | Market reference only | None | N/A |
| 9 | Aquifer | https://aquifer.org/ | Structured clinical cases | Proprietary | **No** | Market reference only | None | N/A |
| 10 | AMBOSS | https://www.amboss.com/ | Knowledge platform | Proprietary | **No** | Market reference only | None | N/A |
| 11 | Osmosis | https://www.osmosis.org/ | Video learning | Proprietary | **No** | Market reference only | None | N/A |

## UI / library references

| # | Source | URL | License | Code reused? | What we took | Risk | Attribution |
|---|--------|-----|---------|--------------|--------------|------|-------------|
| 12 | shadcn/ui | https://ui.shadcn.com/examples/dashboard | MIT | **Pattern** | We use the same foundation (Radix + Tailwind) and the styled-primitive pattern, hand-written to our theme. No files copied verbatim. | Low | MIT permits; credit given here |
| 13 | TailAdmin free admin | https://github.com/TailAdmin/free-react-tailwind-admin-dashboard | MIT (free tier) | **No** | Layout inspiration only; no code copied | Low | Not required |
| 14 | React Flow | https://reactflow.dev/examples | MIT | **No** (not used in MVP) | Considered for pathway maps; deferred | None | N/A |
| 15 | Recharts | https://recharts.org/ | MIT | **Yes (dependency)** | Chart components via npm | Low | MIT |
| 16 | Motion / Framer Motion | https://motion.dev/ | MIT | **Yes (dependency)** | Animations via npm | Low | MIT |

## Direct npm dependencies (all permissive licenses)

- `react`, `react-dom`, `react-router-dom` — MIT
- `@radix-ui/*` — MIT
- `lucide-react` — ISC
- `recharts` — MIT
- `framer-motion` — MIT
- `zustand` — MIT
- `tailwindcss`, `autoprefixer`, `postcss` — MIT
- `class-variance-authority`, `clsx`, `tailwind-merge` — MIT
- `vite`, `@vitejs/plugin-react`, `typescript` — MIT / Apache-2.0

## Summary

- **Reused code:** only standard MIT/ISC npm libraries.
- **Inspiration only:** research repos and papers (#1–6) for architecture and the hidden-concern
  concept; shadcn/ui for the component pattern.
- **Never touched:** proprietary products (#7–11) — market positioning reference only.
- **Clinical content:** 100% synthetic and original.
