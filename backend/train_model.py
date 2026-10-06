"""
==============================================================
  COURSE RECOMMENDATION SYSTEM — RANDOM FOREST MODEL (v2)
==============================================================
  1. Loads clean_dataset_latest.csv (real historical data)
  2. Preprocesses grades, student type, interests (unchanged core signal)
  3. NEW: computes engineered academic features (best5/9, credit
     passes, subject-category strength) purely from real grades
  4. NEW: appends suitability scores computed with a NEUTRAL (0.5)
     aptitude prior, since no historical aptitude data exists yet —
     this keeps the model retrainable later once real aptitude data
     is collected, without fabricating relationships now
  5. Trains + evaluates a RandomForestClassifier
  6. Saves model + encoders + engineered feature spec to .pkl
==============================================================
"""

import os
import pickle
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)

import sys
sys.path.insert(0, os.path.dirname(__file__))
from app.academic_features import compute_academic_features, academic_feature_names
from app.aptitude import score_aptitude, compute_suitability_scores, suitability_feature_names
from app.taxonomy import ALL_SUBJECTS

warnings.filterwarnings("ignore")

QUICK = os.environ.get("QUICK_TRAIN") == "1"

# ─────────────────────────────────────────────
#  STEP 1 — LOAD DATASET
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 1: Loading Dataset")
print("=" * 60)

CSV_CANDIDATES = ["clean_dataset_latest.csv", "../clean_dataset_latest.csv"]
df = None
for path in CSV_CANDIDATES:
    if os.path.exists(path):
        df = pd.read_csv(path)
        print(f"  Loaded dataset from: {path}")
        break
if df is None:
    raise FileNotFoundError("Could not find clean_dataset_latest.csv")

print(f"  Shape: {df.shape}  |  Courses: {df['course'].nunique()}")

# ─────────────────────────────────────────────
#  STEP 2 — FEATURE COLUMNS
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 2: Defining Features")
print("=" * 60)

# Grade columns = every subject the *new* taxonomy supports. Subjects
# not present historically (Home Economics, Computer Studies) are
# added as constant -1 columns — harmless, and ready for future data.
GRADE_COLS = ALL_SUBJECTS
for col in GRADE_COLS:
    if col not in df.columns:
        df[col] = -1

TARGET_COL = "course"
STUDENT_TYPE = "Student Type"
JAMB_COL = "jamb_score"
INTEREST_COL = "interests"

print(f"  Grade features: {len(GRADE_COLS)} (incl. {[c for c in GRADE_COLS if df[c].nunique() == 1]} with no historical data)")

# ─────────────────────────────────────────────
#  STEP 3 — PREPROCESSING (core signal, unchanged approach)
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 3: Preprocessing")
print("=" * 60)

student_type_encoder = LabelEncoder()
df["student_type_enc"] = student_type_encoder.fit_transform(df[STUDENT_TYPE].astype(str))
print(f"  Student types: {list(student_type_encoder.classes_)}")

def parse_interests(series: pd.Series):
    return series.fillna("").apply(
        lambda x: [tok.strip().lower() for tok in x.split(",") if tok.strip()]
    )

interests_lists = parse_interests(df[INTEREST_COL])
mlb = MultiLabelBinarizer()
interest_matrix = mlb.fit_transform(interests_lists)
interest_df = pd.DataFrame(interest_matrix, columns=[f"int_{c}" for c in mlb.classes_])
print(f"  Interest keywords: {len(mlb.classes_)}")

grade_df = df[GRADE_COLS].fillna(-1).astype(int)

# ─────────────────────────────────────────────
#  STEP 3b — NEW: ENGINEERED ACADEMIC + SUITABILITY FEATURES
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 3b: Engineered Academic + Suitability Features")
print("=" * 60)

acad_names = academic_feature_names()
suit_names = suitability_feature_names()
neutral_aptitude = score_aptitude({})  # no historical aptitude data -> neutral 0.5 prior

acad_rows = []
suit_rows = []
for _, row in grade_df.iterrows():
    grades_map = {subj: int(row[subj]) for subj in GRADE_COLS}
    academic = compute_academic_features(grades_map)
    suitability = compute_suitability_scores(academic, neutral_aptitude)
    acad_rows.append([academic[n] for n in acad_names])
    suit_rows.append([suitability[n] for n in suit_names])

academic_engineered_df = pd.DataFrame(acad_rows, columns=acad_names)
suitability_engineered_df = pd.DataFrame(suit_rows, columns=suit_names)
print(f"  Academic engineered features: {acad_names}")
print(f"  Suitability engineered features (neutral aptitude prior): {suit_names}")

feature_df = pd.concat(
    [
        grade_df.reset_index(drop=True),
        df[[JAMB_COL, "student_type_enc"]].reset_index(drop=True),
        interest_df.reset_index(drop=True),
        academic_engineered_df.reset_index(drop=True),
        suitability_engineered_df.reset_index(drop=True),
    ],
    axis=1,
)

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df[TARGET_COL])
X = feature_df.values
print(f"  Feature matrix shape: {X.shape}  |  Target classes: {len(label_encoder.classes_)}")

# ─────────────────────────────────────────────
#  STEP 4 — TRAIN / TEST SPLIT
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 4: Train / Test Split (80/20)")
print("=" * 60)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"  Train: {X_train.shape[0]}  |  Test: {X_test.shape[0]}")

# ─────────────────────────────────────────────
#  STEP 5 — HYPERPARAMETER TUNING
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 5: Hyperparameter Tuning")
print("=" * 60)

if QUICK:
    param_grid = {"n_estimators": [150], "max_depth": [20], "min_samples_split": [4],
                  "min_samples_leaf": [3], "max_features": ["sqrt"]}
else:
    param_grid = {
        "n_estimators": [200, 300, 400],
        "max_depth": [None, 20, 30],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2],
        "max_features": ["sqrt", "log2"],
    }

base_rf = RandomForestClassifier(random_state=42, n_jobs=-1, class_weight="balanced")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
grid_search = GridSearchCV(base_rf, param_grid, cv=cv, scoring="f1_weighted", n_jobs=-1, verbose=1)
grid_search.fit(X_train, y_train)

best_params = grid_search.best_params_
print(f"  Best CV F1 (weighted): {grid_search.best_score_:.4f}")
print(f"  Best Params: {best_params}")

# ─────────────────────────────────────────────
#  STEP 6 — FINAL MODEL
# ─────────────────────────────────────────────
model = RandomForestClassifier(**best_params, random_state=42, n_jobs=-1, class_weight="balanced")
model.fit(X_train, y_train)
print("  Model trained.")

# ─────────────────────────────────────────────
#  STEP 7 — EVALUATION
# ─────────────────────────────────────────────
print("\n" + "=" * 60)
print("  STEP 7: Evaluation")
print("=" * 60)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

print(f"  Accuracy : {accuracy:.4f}")
print(f"  Precision: {precision:.4f}")
print(f"  Recall   : {recall:.4f}")
print(f"  F1 Score : {f1:.4f}")

target_names = label_encoder.classes_
print("\n" + classification_report(y_test, y_pred, target_names=target_names, zero_division=0))

# ─────────────────────────────────────────────
#  STEP 8 — CONFUSION MATRIX
# ─────────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
fig, ax = plt.subplots(figsize=(22, 18))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=target_names, yticklabels=target_names, ax=ax, linewidths=0.5)
ax.set_title("Random Forest v2 — Confusion Matrix", fontsize=16, pad=14)
ax.set_xlabel("Predicted"); ax.set_ylabel("True")
plt.xticks(rotation=45, ha="right", fontsize=7)
plt.yticks(rotation=0, fontsize=7)
plt.tight_layout()
plt.savefig("confusion_matrix_rf.png", dpi=150)
print("  Confusion matrix saved -> confusion_matrix_rf.png")

# ─────────────────────────────────────────────
#  STEP 9 — SAVE ARTIFACTS
# ─────────────────────────────────────────────
artifacts = {
    "model": model,
    "label_encoder": label_encoder,
    "student_type_encoder": student_type_encoder,
    "mlb": mlb,
    "grade_cols": GRADE_COLS,
    "academic_feature_names": acad_names,
    "suitability_feature_names": suit_names,
    "feature_names": list(feature_df.columns),
    "metrics": {"accuracy": accuracy, "precision": precision, "recall": recall, "f1": f1},
}

with open("rf_model_artifacts.pkl", "wb") as f:
    pickle.dump(artifacts, f)

print("\n  Saved -> rf_model_artifacts.pkl")
print(f"  Test Accuracy: {accuracy:.2%}  |  Test F1: {f1:.4f}")
