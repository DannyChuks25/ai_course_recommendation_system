"""
==============================================================
  ML PIPELINE
==============================================================
Loads the trained RandomForest + encoders and builds the exact
feature vector the model expects: raw grades + jamb + student
type + interest multi-hot + engineered academic/suitability
features. Column order MUST match train_model.py exactly.
==============================================================
"""

import os
import pickle
from typing import Dict, List, Tuple

import numpy as np

from .academic_features import compute_academic_features, academic_feature_names
from .aptitude import score_aptitude, compute_suitability_scores, suitability_feature_names
from .taxonomy import LEAF_INTEREST_KEYWORDS

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "rf_model_artifacts.pkl")


class ModelNotLoadedError(RuntimeError):
    pass


def _load_artifacts():
    path = os.path.abspath(MODEL_PATH)
    if not os.path.exists(path):
        raise ModelNotLoadedError(
            f"Model file not found at {path}. Run train_model.py first."
        )
    with open(path, "rb") as f:
        return pickle.load(f)


_artifacts = _load_artifacts()

model = _artifacts["model"]
label_encoder = _artifacts["label_encoder"]
student_type_encoder = _artifacts["student_type_encoder"]
mlb = _artifacts["mlb"]
grade_cols: List[str] = _artifacts["grade_cols"]
feature_names: List[str] = _artifacts["feature_names"]

ALL_COURSES = list(label_encoder.classes_)
STUDENT_TYPES = list(student_type_encoder.classes_)


def leaf_interests_to_keywords(leaves: List[str]) -> List[str]:
    """Maps hierarchical leaf interests to the keyword vocabulary the
    MultiLabelBinarizer was actually trained on."""
    keywords = set()
    for leaf in leaves:
        keywords.update(LEAF_INTEREST_KEYWORDS.get(leaf, []))
    return list(keywords)


def build_feature_vector(
    student_type: str,
    jamb_score: int,
    grades: Dict[str, int],
    career_interests: List[str],
    aptitude_answers: Dict[str, int],
) -> Tuple[np.ndarray, Dict[str, float], Dict[str, float], Dict[str, float]]:
    """
    Returns (X, academic_features, aptitude_scores, suitability_scores)
    so the caller can reuse the engineered features for explanations
    without recomputing them.
    """
    # 1. Raw grade vector, in the exact trained column order
    grade_vector = [grades.get(col, -1) for col in grade_cols]

    # 2. JAMB score
    jamb_vector = [jamb_score]

    # 3. Student type (map "Art" -> "Arts" or vice versa to match training)
    st = student_type
    if st not in student_type_encoder.classes_:
        # tolerate "Art" vs "Arts" naming mismatches
        alt = "Arts" if st == "Art" else ("Art" if st == "Arts" else st)
        st = alt if alt in student_type_encoder.classes_ else student_type_encoder.classes_[0]
    student_type_enc = student_type_encoder.transform([st])[0]

    # 4. Interests -> keywords -> multi-hot via trained MLB
    keywords = leaf_interests_to_keywords(career_interests)
    interest_vector = mlb.transform([[k.lower() for k in keywords]])[0].tolist()

    # 5. Engineered academic features (real, derived from actual grades)
    academic = compute_academic_features(grades)
    academic_vector = [academic[name] for name in academic_feature_names()]

    # 6. Aptitude + suitability (self-reported + transparent blend)
    aptitude_scores = score_aptitude(aptitude_answers)
    suitability = compute_suitability_scores(academic, aptitude_scores)
    suitability_vector = [suitability[name] for name in suitability_feature_names()]

    full_vector = (
        grade_vector + jamb_vector + [student_type_enc]
        + interest_vector + academic_vector + suitability_vector
    )
    return np.array(full_vector).reshape(1, -1), academic, aptitude_scores, suitability


def predict_proba_sorted(X: np.ndarray) -> List[Tuple[str, float]]:
    proba = model.predict_proba(X)[0]
    course_names = label_encoder.classes_
    sorted_idx = np.argsort(proba)[::-1]
    return [(course_names[i], round(float(proba[i]), 6)) for i in sorted_idx]
