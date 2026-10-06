"""
==============================================================
  APTITUDE SCORING  +  DERIVED SUITABILITY SCORES
==============================================================
Section A: turns 24 raw 1-5 answers into 12 category scores
            (averaged, 0-1 scaled).
Section B: combines academic strengths + aptitude scores into
            the higher-level "suitability" scores from the spec
            (STEM score, medical suitability, etc). These are
            transparent weighted blends used for explanation and
            re-ranking — they are documented, not black-box.
==============================================================
"""

from typing import Dict, List
from .taxonomy import APTITUDE_QUESTIONS, APTITUDE_CATEGORIES


def score_aptitude(answers: Dict[str, int]) -> Dict[str, float]:
    """
    answers: {question_id: rating 1-5}
    returns: {category: average_rating_0_to_1}
    Missing answers for a question are simply excluded from that
    category's average rather than assumed.
    """
    buckets: Dict[str, List[int]] = {c: [] for c in APTITUDE_CATEGORIES}
    for q in APTITUDE_QUESTIONS:
        rating = answers.get(q["id"])
        if rating is not None:
            buckets[q["category"]].append(max(1, min(5, int(rating))))

    scores = {}
    for cat, ratings in buckets.items():
        scores[cat] = round((sum(ratings) / len(ratings) - 1) / 4, 3) if ratings else 0.5
    return scores


def compute_suitability_scores(
    academic: Dict[str, float],
    aptitude: Dict[str, float],
) -> Dict[str, float]:
    """
    Blends real academic strength (0-1) with self-reported aptitude
    (0-1) into the higher-level scores requested in the spec.
    Weights are simple, documented, and equal-weighted (60% academic /
    40% aptitude) unless noted — this is a transparent heuristic, not
    a fitted model, which keeps the "why" fully explainable.
    """
    def blend(acad_keys, apt_keys, acad_w=0.6, apt_w=0.4):
        acad_val = sum(academic.get(k, 0.0) for k in acad_keys) / max(1, len(acad_keys))
        apt_val = sum(aptitude.get(k, 0.5) for k in apt_keys) / max(1, len(apt_keys))
        return round(acad_w * acad_val + apt_w * apt_val, 3)

    return {
        "stem_score": blend(
            ["science_strength", "engineering_strength"],
            ["logical_reasoning", "mathematical_ability", "problem_solving"],
        ),
        "medical_suitability": blend(
            ["medical_strength", "science_strength"],
            ["attention_to_detail", "research_interest"],
        ),
        "commercial_suitability": blend(
            ["commercial_strength"],
            ["leadership", "communication"],
        ),
        "arts_suitability": blend(
            ["arts_strength"],
            ["creativity", "communication"],
        ),
        "leadership_score": aptitude.get("leadership", 0.5),
        "creativity_score": aptitude.get("creativity", 0.5),
        "research_score": aptitude.get("research_interest", 0.5),
        "communication_score": aptitude.get("communication", 0.5),
        "technical_score": blend(
            ["engineering_strength", "science_strength"],
            ["practical_skills", "problem_solving"],
        ),
    }


def suitability_feature_names() -> List[str]:
    return [
        "stem_score", "medical_suitability", "commercial_suitability",
        "arts_suitability", "leadership_score", "creativity_score",
        "research_score", "communication_score", "technical_score",
    ]
