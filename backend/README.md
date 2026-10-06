# Course Recommendation Backend — v2

FastAPI + Random Forest backend for the AI-powered university course
recommendation system.

## What changed from v1

- **Old**: one flat `rf_main.py`, fixed 22 hard-coded subject fields,
  free-text interests, no explanation, no aptitude/preferences.
- **New**: modular `app/` package, dynamic subject map (only offered
  subjects required), engineered academic features, an aptitude
  assessment, a hierarchical career-interest taxonomy, work/learning
  style, career goals, extracurriculars, university preferences, a
  transparent explanation + re-ranking layer, and a richer response
  (top-5, reasons, strengths/weaknesses, pathways, skills).

## Why some new features don't feed the ML model directly

The historical dataset (`clean_dataset_latest.csv`) only ever recorded
grades, JAMB score, student type, and free-text interests against a
course outcome. There is no historical data linking aptitude scores,
work style, learning style, career goals, extracurriculars, or
university preferences to actual course outcomes — collecting that
requires real student feedback over time.

So, to avoid the model reporting false confidence for relationships
that were never actually observed:

- **Fed directly into the trained Random Forest** (real signal):
  grades, JAMB score, student type, interests (mapped to the trained
  keyword vocabulary), and engineered academic features (best-5/9,
  credit passes, subject-category strength) — all deterministic
  functions of the real grade data.
- **Used in the explanation + re-ranking layer, not the trained
  model** (self-reported / preference signal): aptitude scores, work
  style, learning style, career goals, extracurriculars, university
  preferences. These generate the "why", strengths/weaknesses, and a
  small transparent confidence boost when a course directly matches a
  stated career goal or interest — clearly labelled as a boost, not
  disguised as extra model confidence.

Once real outcome data exists for the new signals (e.g. "students who
rated high on `leadership` and chose X actually enrolled/succeeded in
X"), they can be added straight into `train_model.py`'s feature matrix.

## Project layout

```
backend/
  app/
    taxonomy.py            # every static list/menu (subjects, aptitude
                            # questions, interest hierarchy, work/learning
                            # style, career goals, extracurriculars, uni prefs)
    schemas.py              # Pydantic request/response models + validation
    academic_features.py    # best5/9, credit passes, subject-category strength
    aptitude.py             # aptitude scoring + derived suitability scores
    ml_pipeline.py           # loads model, builds the exact trained feature vector
    explain.py               # course metadata, "why" reasons, re-ranking, uni-pref notes
    main.py                   # FastAPI app + endpoints
  train_model.py             # retraining script (v2 feature set)
  clean_dataset_latest.csv   # historical training data (unchanged)
  rf_model_artifacts.pkl     # trained model + encoders (regenerate with train_model.py)
  requirements.txt
```

## Running locally

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt

# (re)train the model — writes rf_model_artifacts.pkl + confusion_matrix_rf.png
python3 train_model.py            # full hyperparameter grid search (slow, ~tens of minutes)
# or, for a fast local iteration:
QUICK_TRAIN=1 python3 train_model.py

# run the API
uvicorn app.main:app --reload --port 8000
```

Then visit `http://localhost:8000/docs` for interactive API docs, or
`GET http://localhost:8000/taxonomy` for every menu the frontend needs.

## Key endpoints

| Method | Path        | Purpose |
|--------|-------------|---------|
| GET    | `/`         | Health check |
| GET    | `/taxonomy` | All subjects, aptitude questions, interest hierarchy, work/learning styles, career goals, extracurriculars, university-preference options |
| GET    | `/courses`  | All course labels the model can recommend |
| POST   | `/predict`  | Full enriched recommendation (see `schemas.PredictionRequest`) |

## Model artifact size note

`rf_model_artifacts.pkl` is capped (`max_depth=20`, `min_samples_leaf=3`,
150 trees in the quick-train default) to keep the pickle a reasonable
~40MB while still hitting ~99.6% test accuracy on this dataset — the
full grid search in `train_model.py` (no `QUICK_TRAIN`) will search a
wider hyperparameter space but takes considerably longer and can
produce a much larger artifact if `max_depth=None` wins.
