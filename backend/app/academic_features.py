"""
==============================================================
  ACADEMIC FEATURE ENGINEERING
==============================================================
Turns a raw {subject: grade} map into the richer set of academic
signals described in the spec: grade counts, credit passes,
average grade, best-5/best-9, and per-category subject strength.

Every value here is a deterministic function of grades the student
actually reports — nothing here is invented or fitted; it's the
same kind of aggregate a school counsellor would compute by hand.
Grade scale: 6=A1, 5=B2, 4=B3, 3=C4, 2=C5, 1=C6/F, -1=not offered.
A "credit pass" is grade >= 3 (C4 or better), matching WAEC/JAMB
admission convention.
==============================================================
"""

from typing import Dict, List
from .taxonomy import SUBJECT_CATEGORY_MAP, STRENGTH_CATEGORIES

CREDIT_THRESHOLD = 3  # C4 or better


def offered_grades(grades: Dict[str, int]) -> Dict[str, int]:
    """Returns only subjects the student actually offered (grade != -1)."""
    return {s: g for s, g in grades.items() if g is not None and g != -1}


def compute_academic_features(grades: Dict[str, int]) -> Dict[str, float]:
    """
    Given a full {subject_name: grade} map (grade -1 if not offered),
    compute the full set of derived academic features.
    """
    offered = offered_grades(grades)
    values = list(offered.values())

    n_A = sum(1 for g in values if g == 6)
    n_B = sum(1 for g in values if g in (4, 5))
    n_C = sum(1 for g in values if g == 3)
    credit_passes = sum(1 for g in values if g >= CREDIT_THRESHOLD)
    average_grade = round(sum(values) / len(values), 3) if values else 0.0

    sorted_desc = sorted(values, reverse=True)
    best_five = round(sum(sorted_desc[:5]) / min(5, len(sorted_desc)), 3) if sorted_desc else 0.0
    best_nine = round(sum(sorted_desc[:9]) / min(9, len(sorted_desc)), 3) if sorted_desc else 0.0

    features: Dict[str, float] = {
        "n_grade_A": n_A,
        "n_grade_B": n_B,
        "n_grade_C": n_C,
        "credit_passes": credit_passes,
        "average_grade": average_grade,
        "best_five_avg": best_five,
        "best_nine_avg": best_nine,
    }

    # Per-category strength: mean grade (0-1 scaled) across subjects
    # tagged with that category that the student actually offered.
    for category in STRENGTH_CATEGORIES:
        cat_grades = [
            g for s, g in offered.items()
            if category in SUBJECT_CATEGORY_MAP.get(s, [])
        ]
        strength = round((sum(cat_grades) / len(cat_grades)) / 6, 3) if cat_grades else 0.0
        features[f"{category}_strength"] = strength

    return features


def academic_feature_names() -> List[str]:
    """Stable, ordered list of academic-feature column names."""
    base = ["n_grade_A", "n_grade_B", "n_grade_C", "credit_passes",
            "average_grade", "best_five_avg", "best_nine_avg"]
    strengths = [f"{c}_strength" for c in STRENGTH_CATEGORIES]
    return base + strengths
