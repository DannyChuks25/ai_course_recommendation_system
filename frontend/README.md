# Course Recommendation Frontend — v2

React + TypeScript + Tailwind v4 wizard for the AI-powered university
course recommendation system.

## Flow

1. **Home** (`/`) — landing page.
2. **Recommend** (`/recommend`) — an 8-step wizard, driven entirely by
   `GET /taxonomy` from the backend so the form always matches whatever
   the API currently accepts:
   1. Academic profile (student type + JAMB)
   2. WAEC subjects offered + grades (search + toggle, only real subjects required)
   3. Aptitude assessment (24 questions, 1–5 rating)
   4. Hierarchical career interests (Technology → AI, Software Engineering, …)
   5. Work style + learning style
   6. Career goals, ranked by priority (drag-free up/down reordering)
   7. Extracurricular activities
   8. University preferences + submit
3. **Results** (`/results`) — dashboard: top pick, top-5 with expandable
   reasons/pathways/skills, strengths/weaknesses/improvement areas, and
   university-preference guidance notes.

## Project layout

```
src/
  types.ts                    # mirrors backend/app/schemas.py + taxonomy.py
  lib/
    api.ts                    # fetchTaxonomy() / submitPrediction()
    formStyles.ts             # shared style tokens (dark-slate/amber theme)
  components/
    RatingScale.tsx           # 1-5 aptitude rating control
    PriorityRankList.tsx       # select + reorder (career goals)
    SelectableGrid.tsx         # generic multi-select chip grid
    StepNav.tsx                # shared back/continue buttons
    CourseCard.tsx             # expandable recommendation card
    steps/                     # one component per wizard step
  pages/
    Home.tsx, Recommend.tsx, Results.tsx
```

## Running locally

```bash
cd frontend
npm install
cp .env.example .env   # points at the backend, defaults to http://localhost:8000
npm run dev
```

Make sure the backend (`backend/`) is running first — the wizard fetches
`GET /taxonomy` on load and will show an error state if it can't reach it.

## Build

```bash
npm run build   # tsc -b && vite build
```
