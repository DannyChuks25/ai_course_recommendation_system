"""
==============================================================
  COURSE RECOMMENDATION SYSTEM — API v2
==============================================================
  GET  /                    -> health check
  GET  /taxonomy             -> every menu/list the frontend needs
  GET  /courses              -> all course labels
  POST /predict               -> full enriched recommendation
==============================================================
"""

from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import PredictionRequest, PredictionResponse, CourseRecommendation
from . import ml_pipeline as ml
from . import explain
from .taxonomy import (
    ALL_SUBJECTS, CORE_SUBJECTS, NEW_NO_HISTORY_SUBJECTS, GRADE_SCALE,
    APTITUDE_QUESTIONS, APTITUDE_RATING_SCALE, INTEREST_HIERARCHY,
    WORK_STYLES, LEARNING_STYLES, CATEGORY_CAREER_GOALS, FOLLOW_UP_QUESTIONS,
    EXTRACURRICULARS, OWNERSHIP_TYPES, NIGERIAN_GEOPOLITICAL_ZONES,
    HOSTEL_PREFERENCES, DISTANCE_PREFERENCES,
)
from .universities import NIGERIAN_UNIVERSITIES

app = FastAPI(
    title="Course Recommendation API v2",
    description="AI-powered Nigerian university course recommendation system.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "Online",
        "model": "Random Forest Classifier v2",
        "total_courses": len(ml.ALL_COURSES),
        "message": "Course Recommendation API v2 is running. See /docs, GET /taxonomy, POST /predict.",
    }


@app.get("/taxonomy", tags=["Info"])
def get_taxonomy():
    """Single source of truth for every form menu the frontend renders."""
    return {
        "subjects": {
            "all": ALL_SUBJECTS,
            "core_with_historical_data": CORE_SUBJECTS,
            "new_no_historical_data": NEW_NO_HISTORY_SUBJECTS,
            "grade_scale": GRADE_SCALE,
        },
        "aptitude": {
            "questions": APTITUDE_QUESTIONS,
            "rating_scale": APTITUDE_RATING_SCALE,
        },
        "career_interests": INTEREST_HIERARCHY,
        "follow_up_questions": FOLLOW_UP_QUESTIONS,
        "work_styles": WORK_STYLES,
        "learning_styles": LEARNING_STYLES,
        # Keyed by the same top-level category as career_interests — the
        # frontend looks up career_goals[activeCategory] once exactly one
        # category is selected, rather than showing one flat generic list.
        "career_goals": CATEGORY_CAREER_GOALS,
        "extracurriculars": EXTRACURRICULARS,
        "university_preferences": {
            "ownership_types": OWNERSHIP_TYPES,
            "geopolitical_zones": NIGERIAN_GEOPOLITICAL_ZONES,
            "hostel_preferences": HOSTEL_PREFERENCES,
            "distance_preferences": DISTANCE_PREFERENCES,
        },
        "student_types": ml.STUDENT_TYPES,
    }


@app.get("/universities", tags=["Info"])
def list_universities():
    """
    Static curated Nigerian university reference list (name, ownership,
    state, zone) powering the searchable university select. See
    app/universities.py for why this is a static dataset rather than a
    live external API call.
    """
    return {"total": len(NIGERIAN_UNIVERSITIES), "universities": NIGERIAN_UNIVERSITIES}


@app.get("/courses", tags=["Info"])
def list_courses():
    return {"total": len(ml.ALL_COURSES), "courses": sorted(ml.ALL_COURSES)}


def _build_course_recommendation(rank: int, course: str, score: float, academic, suitability,
                                  career_interests, career_goals, student_type) -> CourseRecommendation:
    meta = explain.get_course_metadata(course)
    reasons = explain.build_reasons(course, academic, suitability, career_interests, career_goals, student_type)
    return CourseRecommendation(
        rank=rank,
        course=course,
        confidence_score=score,
        confidence_pct=f"{score * 100:.2f}%",
        reasons=reasons,
        career_pathways=meta["pathways"],
        similar_careers=meta["similar_careers"],
        recommended_skills=meta["skills"],
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(request: PredictionRequest):
    """
    Accepts the full enriched student profile and returns:
    top recommendation, top-5 with explanations, strengths/weaknesses,
    improvement areas, and university-preference guidance notes.
    """
    try:
        X, academic, aptitude_scores, suitability = ml.build_feature_vector(
            student_type=request.student_type,
            jamb_score=request.jamb_score,
            grades=request.grades,
            career_interests=request.career_interests,
            aptitude_answers=request.aptitude_answers,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    sorted_courses = ml.predict_proba_sorted(X)

    # Transparent preference-aware re-rank (career goals / interests boost)
    sorted_courses = explain.rerank_with_preferences(
        sorted_courses, request.career_goals, request.career_interests
    )

    top5_raw = sorted_courses[:3]
    top5: List[CourseRecommendation] = [
        _build_course_recommendation(
            i + 1, course, score, academic, suitability,
            request.career_interests, request.career_goals, request.student_type,
        )
        for i, (course, score) in enumerate(top5_raw)
    ]

    strengths, weaknesses, improvements = explain.summarize_strengths_weaknesses(academic, aptitude_scores)
    pref_notes = explain.university_preference_notes(request.university_preferences)

    return PredictionResponse(
        status="success",
        model="Random Forest Classifier v2 (+ transparent preference re-ranking)",
        top_recommendation=top5[0],
        top_five=top5,
        all_probabilities={c: s for c, s in sorted_courses},
        student_strengths=strengths,
        student_weaknesses=weaknesses,
        improvement_areas=improvements,
        academic_features=academic,
        aptitude_scores=aptitude_scores,
        suitability_scores=suitability,
        university_preference_notes=pref_notes,
        note=(
            "Confidence scores come from a Random Forest trained on real grade/JAMB/interest "
            "data, engineered academic features, and a small transparent boost for explicit "
            "career-goal/interest matches. Aptitude, work/learning style, extracurriculars, and "
            "university preferences currently inform the explanation and guidance sections; "
            "as real historical data for those is collected, they can be trained into the model directly."
        ),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
