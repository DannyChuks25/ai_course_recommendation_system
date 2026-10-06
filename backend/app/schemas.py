"""
==============================================================
  PYDANTIC SCHEMAS
==============================================================
Request/response contracts for the enriched recommendation API.
Validation here is the source of truth the frontend must match.
==============================================================
"""

from typing import Dict, List
from pydantic import BaseModel, Field, field_validator, model_validator

from .taxonomy import (
    ACCEPTED_SUBJECTS, INTEREST_HIERARCHY, WORK_STYLES, LEARNING_STYLES,
    ALL_CAREER_GOALS, EXTRACURRICULARS, OWNERSHIP_TYPES,
    NIGERIAN_GEOPOLITICAL_ZONES, HOSTEL_PREFERENCES, DISTANCE_PREFERENCES,
    APTITUDE_QUESTIONS, FOLLOW_UP_QUESTIONS, LEAF_TO_PARENT_CATEGORY,
)

ALL_LEAF_INTERESTS = [leaf for leaves in INTEREST_HIERARCHY.values() for leaf in leaves]
VALID_APTITUDE_IDS = {q["id"] for q in APTITUDE_QUESTIONS}
VALID_FOLLOW_UP_IDS = {q["id"] for questions in FOLLOW_UP_QUESTIONS.values() for q in questions}


class UniversityPreferences(BaseModel):
    # All fields required — previously optional, which let students continue
    # with an entirely empty preferences step (validation fix #7).
    preferred_university: str = Field(..., min_length=1)
    preferred_state: str = Field(..., min_length=1, description="Auto-filled from the selected university")
    preferred_zone: str = Field(..., description=f"One of {NIGERIAN_GEOPOLITICAL_ZONES}")
    ownership: str = Field(..., description=f"One of {OWNERSHIP_TYPES} — auto-filled from the selected university")
    tuition_budget_naira: int = Field(..., ge=0)
    hostel_preference: str = Field(..., description=f"One of {HOSTEL_PREFERENCES}")
    distance_preference: str = Field(..., description=f"One of {DISTANCE_PREFERENCES}")

    @field_validator("preferred_zone")
    @classmethod
    def _zone(cls, v):
        if v not in NIGERIAN_GEOPOLITICAL_ZONES:
            raise ValueError(f"preferred_zone must be one of {NIGERIAN_GEOPOLITICAL_ZONES}")
        return v

    @field_validator("ownership")
    @classmethod
    def _ownership(cls, v):
        if v not in OWNERSHIP_TYPES:
            raise ValueError(f"ownership must be one of {OWNERSHIP_TYPES}")
        return v

    @field_validator("hostel_preference")
    @classmethod
    def _hostel(cls, v):
        if v not in HOSTEL_PREFERENCES:
            raise ValueError(f"hostel_preference must be one of {HOSTEL_PREFERENCES}")
        return v

    @field_validator("distance_preference")
    @classmethod
    def _distance(cls, v):
        if v not in DISTANCE_PREFERENCES:
            raise ValueError(f"distance_preference must be one of {DISTANCE_PREFERENCES}")
        return v


class PredictionRequest(BaseModel):
    # --- core academic (existing, retained) ---
    student_type: str = Field(..., examples=["Science"])
    jamb_score: int = Field(..., ge=100, le=400, examples=[260])

    # --- 1. rich WAEC subjects: only subjects actually offered ---
    grades: Dict[str, int] = Field(
        ...,
        description="Map of subject name -> grade (1-6). Omit subjects not offered; "
                    "do NOT need to supply all subjects.",
        examples=[{"Mathematics": 6, "English Language": 5, "Physics": 6, "Chemistry": 5}],
    )

    # --- 3. aptitude assessment ---
    aptitude_answers: Dict[str, int] = Field(
        default_factory=dict,
        description="Map of question_id -> rating (1-5). Every question must be answered.",
    )

    # --- 4. hierarchical career interests (leaf names, multi-select, ONE category only) ---
    career_interests: List[str] = Field(default_factory=list)

    # --- 4b. adaptive follow-up answers for the active category (yes/no) ---
    follow_up_answers: Dict[str, bool] = Field(default_factory=dict)

    # --- 5. work style ---
    work_style: List[str] = Field(default_factory=list)

    # --- 6. learning style ---
    learning_style: List[str] = Field(default_factory=list)

    # --- 7. career goals, ranked by priority (order = priority, first = highest). Exactly 5 required. ---
    career_goals: List[str] = Field(default_factory=list)

    # --- 8. extracurriculars ---
    extracurriculars: List[str] = Field(default_factory=list)

    # --- 9. university preferences (all sub-fields required once the section is reached) ---
    university_preferences: UniversityPreferences

    @field_validator("student_type")
    @classmethod
    def _student_type(cls, v):
        allowed = ["Science", "Art", "Commercial"]
        if v not in allowed:
            raise ValueError(f"student_type must be one of {allowed}")
        return v

    @field_validator("grades")
    @classmethod
    def _grades(cls, v):
        cleaned = {}
        for subject, grade in v.items():
            if subject not in ACCEPTED_SUBJECTS:
                raise ValueError(f"Unknown subject '{subject}'. Must be one of {ACCEPTED_SUBJECTS}")
            if grade != -1 and not (1 <= grade <= 6):
                raise ValueError(f"Grade for '{subject}' must be -1 (not offered) or 1-6, got {grade}")
            cleaned[subject] = grade
        if not any(g != -1 for g in cleaned.values()):
            raise ValueError("At least one subject with a real grade must be provided")
        return cleaned

    @field_validator("aptitude_answers")
    @classmethod
    def _aptitude(cls, v):
        for qid, rating in v.items():
            if qid not in VALID_APTITUDE_IDS:
                raise ValueError(f"Unknown aptitude question id '{qid}'")
            if not (1 <= rating <= 5):
                raise ValueError(f"Aptitude rating for '{qid}' must be 1-5, got {rating}")
        missing = VALID_APTITUDE_IDS - set(v.keys())
        if missing:
            raise ValueError(f"All {len(VALID_APTITUDE_IDS)} aptitude questions must be answered "
                              f"({len(missing)} missing)")
        return v

    @field_validator("career_interests")
    @classmethod
    def _interests(cls, v):
        if not v:
            raise ValueError("Select at least one career interest")
        categories = set()
        for leaf in v:
            if leaf not in ALL_LEAF_INTERESTS:
                raise ValueError(f"Unknown career interest '{leaf}'")
            categories.add(LEAF_TO_PARENT_CATEGORY[leaf])
        if len(categories) > 1:
            raise ValueError(
                f"Career interests must all come from a single category, got: {sorted(categories)}"
            )
        return v

    @field_validator("follow_up_answers")
    @classmethod
    def _follow_up(cls, v):
        for qid in v:
            if qid not in VALID_FOLLOW_UP_IDS:
                raise ValueError(f"Unknown follow-up question id '{qid}'")
        return v

    @field_validator("work_style")
    @classmethod
    def _work_style(cls, v):
        for w in v:
            if w not in WORK_STYLES:
                raise ValueError(f"Unknown work style '{w}'")
        return v

    @field_validator("learning_style")
    @classmethod
    def _learning_style(cls, v):
        for w in v:
            if w not in LEARNING_STYLES:
                raise ValueError(f"Unknown learning style '{w}'")
        return v

    @field_validator("career_goals")
    @classmethod
    def _career_goals(cls, v):
        for w in v:
            if w not in ALL_CAREER_GOALS:
                raise ValueError(f"Unknown career goal '{w}'")
        if len(v) != 5:
            raise ValueError(f"Exactly 5 ranked career goals are required, got {len(v)}")
        return v

    @field_validator("extracurriculars")
    @classmethod
    def _extracurriculars(cls, v):
        for w in v:
            if w not in EXTRACURRICULARS:
                raise ValueError(f"Unknown extracurricular '{w}'")
        return v


class CourseRecommendation(BaseModel):
    rank: int
    course: str
    confidence_score: float
    confidence_pct: str
    reasons: List[str]
    career_pathways: List[str] = Field(default_factory=list)
    similar_careers: List[str] = Field(default_factory=list)
    recommended_skills: List[str] = Field(default_factory=list)


class PredictionResponse(BaseModel):
    status: str
    model: str
    top_recommendation: CourseRecommendation
    top_five: List[CourseRecommendation]
    all_probabilities: Dict[str, float]
    student_strengths: List[str]
    student_weaknesses: List[str]
    improvement_areas: List[str]
    academic_features: Dict[str, float]
    aptitude_scores: Dict[str, float]
    suitability_scores: Dict[str, float]
    university_preference_notes: List[str]
    note: str
