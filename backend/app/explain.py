"""
==============================================================
  EXPLANATION ENGINE  +  PREFERENCE-AWARE RE-RANKING
==============================================================
Turns raw model probabilities into a human-readable "why", plus
strengths/weaknesses, career pathways, similar careers, and
recommended skills — and nudges the ranking using signals the ML
model itself was never trained on (aptitude, career goals, work
style, university preferences), documented as a transparent boost
rather than disguised as extra model confidence.
==============================================================
"""

from typing import Dict, List, Tuple
from .taxonomy import (
    SUBJECT_CATEGORY_MAP, STRENGTH_CATEGORIES, CAREER_GOAL_TO_COURSES,
    LEAF_INTEREST_KEYWORDS,
)

# ─────────────────────────────────────────────
#  CURATED METADATA (higher quality for common courses)
# ─────────────────────────────────────────────
COURSE_METADATA: Dict[str, Dict[str, List[str]]] = {
    "Computer Science": {
        "pathways": ["Software Development", "Data Science", "AI/ML Engineering", "Postgraduate Research"],
        "similar_careers": ["Software Engineer", "Data Scientist", "Systems Analyst", "IT Consultant"],
        "skills": ["Programming (Python/Java)", "Data Structures & Algorithms", "Databases", "Version Control (Git)"],
    },
    "Software Engineering": {
        "pathways": ["Backend/Frontend Development", "DevOps", "Product Engineering", "Technical Leadership"],
        "similar_careers": ["Software Engineer", "Mobile Developer", "Cloud Engineer"],
        "skills": ["Software Design Patterns", "Testing & QA", "Cloud Platforms", "Agile/Scrum"],
    },
    "Medicine and Surgery": {
        "pathways": ["Clinical Practice", "Surgery Specialization", "Public Health", "Medical Research"],
        "similar_careers": ["Medical Doctor", "Surgeon", "Medical Researcher"],
        "skills": ["Clinical Diagnosis", "Anatomy & Physiology", "Patient Communication", "Emergency Response"],
    },
    "Nursing": {
        "pathways": ["Clinical Nursing", "Nurse Practitioner", "Nursing Education", "Public Health Nursing"],
        "similar_careers": ["Registered Nurse", "Midwife", "Health Educator"],
        "skills": ["Patient Care", "Clinical Procedures", "Health Assessment", "Communication"],
    },
    "Mechanical Engineering": {
        "pathways": ["Manufacturing", "Automotive Design", "Energy Systems", "Robotics"],
        "similar_careers": ["Mechanical Engineer", "Automotive Engineer", "Maintenance Engineer"],
        "skills": ["CAD Design", "Thermodynamics", "Mechanics of Materials", "Manufacturing Processes"],
    },
    "Civil Engineering": {
        "pathways": ["Structural Engineering", "Construction Management", "Urban Infrastructure", "Water Resources"],
        "similar_careers": ["Civil Engineer", "Site Engineer", "Structural Designer"],
        "skills": ["Structural Analysis", "AutoCAD", "Project Management", "Surveying"],
    },
    "Electrical Engineering": {
        "pathways": ["Power Systems", "Electronics", "Telecommunications", "Control Systems"],
        "similar_careers": ["Electrical Engineer", "Power Systems Engineer", "Electronics Engineer"],
        "skills": ["Circuit Design", "Power Systems", "Signal Processing", "PLC Programming"],
    },
    "Accounting": {
        "pathways": ["Financial Accounting", "Auditing", "Tax Consulting", "Chartered Accountancy (ICAN/ACCA)"],
        "similar_careers": ["Accountant", "Auditor", "Financial Analyst"],
        "skills": ["Financial Reporting", "Excel/Spreadsheet Modelling", "Auditing Standards", "Taxation"],
    },
    "Law": {
        "pathways": ["Litigation", "Corporate Law", "Public Policy", "Judiciary"],
        "similar_careers": ["Lawyer", "Legal Advisor", "Policy Analyst"],
        "skills": ["Legal Research", "Argumentation", "Legal Writing", "Negotiation"],
    },
    "Architecture": {
        "pathways": ["Building Design", "Urban Planning", "Interior Architecture", "Sustainable Design"],
        "similar_careers": ["Architect", "Urban Planner", "Interior Designer"],
        "skills": ["AutoCAD/Revit", "Design Thinking", "Building Codes", "3D Modelling"],
    },
    "Mass Communication": {
        "pathways": ["Broadcast Journalism", "Public Relations", "Digital Media", "Advertising"],
        "similar_careers": ["Journalist", "PR Officer", "Content Strategist"],
        "skills": ["Writing & Editing", "Media Production", "Public Speaking", "Digital Marketing"],
    },
    "Journalism and Media Studies": {
        "pathways": ["Broadcast Journalism", "Investigative Reporting", "Digital Media", "Public Relations"],
        "similar_careers": ["Journalist", "News Editor", "Media Producer"],
        "skills": ["Writing & Editing", "Interviewing", "Media Ethics", "Digital Storytelling"],
    },
    "Pharmacy": {
        "pathways": ["Community Pharmacy", "Hospital Pharmacy", "Pharmaceutical Research", "Drug Regulation"],
        "similar_careers": ["Pharmacist", "Pharmaceutical Researcher"],
        "skills": ["Pharmacology", "Drug Interactions", "Patient Counselling", "Compounding"],
    },
    "Business Administration": {
        "pathways": ["General Management", "Marketing", "Operations", "Entrepreneurship"],
        "similar_careers": ["Business Manager", "Operations Analyst", "Entrepreneur"],
        "skills": ["Business Strategy", "Financial Literacy", "Leadership", "Marketing Fundamentals"],
    },
    "Data Science": {
        "pathways": ["Data Analytics", "Machine Learning Engineering", "Business Intelligence", "Research"],
        "similar_careers": ["Data Scientist", "Data Analyst", "ML Engineer"],
        "skills": ["Python/R", "Statistics", "Machine Learning", "Data Visualization"],
    },
    "Artificial Intelligence": {
        "pathways": ["Machine Learning Engineering", "Research", "Robotics", "AI Product Development"],
        "similar_careers": ["AI Engineer", "ML Researcher", "Data Scientist"],
        "skills": ["Machine Learning", "Python", "Neural Networks", "Mathematics for AI"],
    },
    "Cyber Security": {
        "pathways": ["Security Operations", "Penetration Testing", "Security Architecture", "Risk & Compliance"],
        "similar_careers": ["Security Analyst", "Penetration Tester", "IT Auditor"],
        "skills": ["Network Security", "Ethical Hacking", "Risk Assessment", "Cryptography"],
    },
    "Entrepreneurship": {
        "pathways": ["Startup Founder", "Small Business Owner", "Venture Development", "Innovation Consulting"],
        "similar_careers": ["Entrepreneur", "Business Development Manager"],
        "skills": ["Business Planning", "Pitching & Fundraising", "Financial Management", "Marketing"],
    },
    "Public Health": {
        "pathways": ["Epidemiology", "Health Policy", "Community Health", "Health Program Management"],
        "similar_careers": ["Public Health Officer", "Epidemiologist", "Health Program Manager"],
        "skills": ["Epidemiology", "Biostatistics", "Health Policy Analysis", "Community Outreach"],
    },
    "Banking and Finance": {
        "pathways": ["Investment Banking", "Retail Banking", "Financial Analysis", "Risk Management"],
        "similar_careers": ["Banker", "Financial Analyst", "Investment Advisor"],
        "skills": ["Financial Modelling", "Risk Analysis", "Banking Regulations", "Excel"],
    },
}

_GENERIC_TEMPLATES: List[Tuple[List[str], Dict[str, List[str]]]] = [
    (["Engineering"], {
        "pathways": ["Design & Development", "Field Operations", "Postgraduate Specialization", "Project Management"],
        "similar_careers": ["Engineer (specialized field)", "Project Engineer", "Technical Consultant"],
        "skills": ["Engineering Mathematics", "Technical Drawing/CAD", "Problem Solving", "Project Management"],
    }),
    (["Science", "Biology", "Chemistry", "Physics", "Geology", "Geophysics", "Meteorology"], {
        "pathways": ["Research", "Laboratory Practice", "Academia", "Industry Application"],
        "similar_careers": ["Research Scientist", "Laboratory Analyst", "Science Educator"],
        "skills": ["Laboratory Techniques", "Data Analysis", "Scientific Writing", "Critical Thinking"],
    }),
    (["Design", "Art", "Illustration", "Photography", "Fashion", "Animation", "Graphics"], {
        "pathways": ["Freelance Practice", "Studio/Agency Work", "Product Design", "Creative Direction"],
        "similar_careers": ["Designer", "Creative Director", "Visual Artist"],
        "skills": ["Design Software (Adobe Suite/Figma)", "Visual Composition", "Portfolio Building", "Client Communication"],
    }),
    (["Management", "Administration", "Marketing", "Supply Chain", "Insurance", "Taxation", "Human Resource"], {
        "pathways": ["Corporate Management", "Consulting", "Operations", "Entrepreneurship"],
        "similar_careers": ["Business Analyst", "Operations Manager", "Consultant"],
        "skills": ["Business Strategy", "Communication", "Data-Driven Decision Making", "Leadership"],
    }),
    (["Health", "Medical", "Nutrition", "Physiotherapy", "Radiography", "Radiology", "Optometry", "Anatomy", "Physiology", "Dentistry", "Oncology"], {
        "pathways": ["Clinical Practice", "Specialization/Residency", "Public Health", "Health Research"],
        "similar_careers": ["Healthcare Professional", "Clinical Specialist", "Health Researcher"],
        "skills": ["Clinical Skills", "Patient Care", "Health Sciences Foundation", "Attention to Detail"],
    }),
    (["Agricultur", "Crop", "Animal Science", "Fisheries", "Forestry", "Horticulture", "Soil"], {
        "pathways": ["Agribusiness", "Extension Services", "Research", "Sustainable Farming"],
        "similar_careers": ["Agricultural Officer", "Farm Manager", "Agribusiness Consultant"],
        "skills": ["Crop/Animal Science Fundamentals", "Agribusiness Planning", "Sustainable Practices", "Data Analysis"],
    }),
    (["Political Science", "International Relations", "Public Administration", "Sociology", "Psychology", "Criminology", "Human Rights"], {
        "pathways": ["Public Policy", "Civil Service", "NGO/Advocacy Work", "Academia"],
        "similar_careers": ["Policy Analyst", "Civil Servant", "Social Researcher"],
        "skills": ["Research & Analysis", "Policy Writing", "Communication", "Critical Thinking"],
    }),
]

_GENERIC_FALLBACK = {
    "pathways": ["Industry Practice", "Postgraduate Study", "Academia", "Related Professional Certification"],
    "similar_careers": ["Professional in this field", "Consultant", "Researcher"],
    "skills": ["Core subject fundamentals", "Communication", "Analytical Thinking", "Research Skills"],
}


def get_course_metadata(course: str) -> Dict[str, List[str]]:
    if course in COURSE_METADATA:
        return COURSE_METADATA[course]
    for keywords, meta in _GENERIC_TEMPLATES:
        if any(k.lower() in course.lower() for k in keywords):
            return meta
    return _GENERIC_FALLBACK


# ─────────────────────────────────────────────
#  STRENGTHS / WEAKNESSES / IMPROVEMENT AREAS
# ─────────────────────────────────────────────

def summarize_strengths_weaknesses(
    academic: Dict[str, float], aptitude: Dict[str, float]
) -> Tuple[List[str], List[str], List[str]]:
    strengths, weaknesses, improvements = [], [], []

    for cat in STRENGTH_CATEGORIES:
        val = academic.get(f"{cat}_strength", 0.0)
        if val >= 0.7:
            strengths.append(f"Strong {cat} subject performance")
        elif 0 < val < 0.45:
            weaknesses.append(f"Weaker {cat} subject performance")
            improvements.append(f"Consider extra practice/tutoring in {cat}-related subjects")

    for cat, val in aptitude.items():
        label = cat.replace("_", " ")
        if val >= 0.75:
            strengths.append(f"High {label}")
        elif val <= 0.35:
            improvements.append(f"Room to grow in {label}")

    if academic.get("credit_passes", 0) >= 7:
        strengths.append("Strong overall credit pass count")
    if not strengths:
        strengths.append("Balanced profile across subjects and aptitude areas")
    if not weaknesses:
        weaknesses.append("No significant academic weak areas detected")
    if not improvements:
        improvements.append("Keep building on current strengths through electives and projects")

    return strengths, weaknesses, improvements


# ─────────────────────────────────────────────
#  PER-COURSE "WHY" REASONS
# ─────────────────────────────────────────────

_CATEGORY_COURSE_KEYWORDS = {
    "science":    ["science", "biology", "chemistry", "physics", "geology", "geophysics", "meteorology", "medicine", "medical"],
    "engineering": ["engineering", "computer", "technology", "mechatronics", "surveying"],
    "medical":    ["medicine", "nursing", "health", "pharmacy", "physiology", "anatomy", "dentistry", "radiography", "radiology", "optometry", "nutrition", "physiotherapy"],
    "commercial": ["business", "accounting", "banking", "marketing", "management", "finance", "insurance", "taxation", "entrepreneurship", "supply chain"],
    "arts":       ["art", "design", "law", "journalism", "theatre", "music", "language", "history", "archaeology", "sociology", "political"],
}


def build_reasons(
    course: str,
    academic: Dict[str, float],
    suitability: Dict[str, float],
    career_interests: List[str],
    career_goals: List[str],
    student_type: str,
) -> List[str]:
    reasons: List[str] = []
    course_lower = course.lower()

    # Academic strength match — only surface a strength if it's actually
    # relevant to this specific course, not every strength for every course.
    for cat in STRENGTH_CATEGORIES:
        if academic.get(f"{cat}_strength", 0) >= 0.7 and any(
            k in course_lower for k in _CATEGORY_COURSE_KEYWORDS[cat]
        ):
            reasons.append(f"Strong {cat} subject performance supports this field")

    # Suitability scores
    if suitability.get("stem_score", 0) >= 0.7 and any(
        k in course_lower for k in ["engineering", "computer", "science", "technology", "data"]
    ):
        reasons.append("High STEM aptitude and academic profile")
    if suitability.get("medical_suitability", 0) >= 0.7 and any(
        k in course_lower for k in ["medicine", "nursing", "health", "pharmacy", "physiology", "anatomy"]
    ):
        reasons.append("Strong medical/health suitability score")
    if suitability.get("commercial_suitability", 0) >= 0.7 and any(
        k in course_lower for k in ["business", "accounting", "banking", "marketing", "management", "finance"]
    ):
        reasons.append("Strong commercial aptitude and business-relevant subjects")
    if suitability.get("arts_suitability", 0) >= 0.7 and any(
        k in course_lower for k in ["art", "design", "law", "journalism", "theatre", "music"]
    ):
        reasons.append("Strong arts/humanities aptitude")

    # Career interest match (via keyword overlap)
    for leaf in career_interests:
        if leaf.lower() in course_lower or course_lower in leaf.lower():
            reasons.append(f"Matches stated career interest in {leaf}")

    # Career goal match
    for goal in career_goals:
        if course in CAREER_GOAL_TO_COURSES.get(goal, []):
            reasons.append(f"Directly aligned with stated career goal: {goal}")

    if not reasons:
        reasons.append(f"Reasonable fit based on overall {student_type.lower()} academic profile")

    # de-duplicate while preserving order
    seen = set()
    unique_reasons = []
    for r in reasons:
        if r not in seen:
            seen.add(r)
            unique_reasons.append(r)
    return unique_reasons[:5]


# ─────────────────────────────────────────────
#  PREFERENCE-AWARE RE-RANKING (transparent boost)
# ─────────────────────────────────────────────

def rerank_with_preferences(
    sorted_courses: List[Tuple[str, float]],
    career_goals: List[str],
    career_interests: List[str],
) -> List[Tuple[str, float]]:
    """
    Applies a small, capped, transparent boost (not disguised as model
    confidence) for courses that directly match stated career goals or
    interests, then re-sorts. Boost is additive on a copy of the score
    and re-normalized, so relative ML confidence ordering is preserved
    except where the student has given explicit extra signal.
    """
    boosted = []
    for course, score in sorted_courses:
        boost = 0.0
        for rank, goal in enumerate(career_goals):
            if course in CAREER_GOAL_TO_COURSES.get(goal, []):
                boost += 0.08 / (rank + 1)  # earlier-priority goals count more
        for leaf in career_interests:
            if leaf.lower() in course.lower() or course.lower() in leaf.lower():
                boost += 0.03
        boosted.append((course, min(1.0, score + boost)))

    total = sum(s for _, s in boosted) or 1.0
    normalized = [(c, round(s / total, 6)) for c, s in boosted]
    return sorted(normalized, key=lambda x: x[1], reverse=True)


def university_preference_notes(prefs) -> List[str]:
    """
    Honest, general guidance rather than fabricated per-university course
    matching (we don't have a verified live database of which Nigerian
    university offers which course, tuition, or hostel availability).
    """
    if prefs is None:
        return []
    notes = []
    if prefs.preferred_zone and prefs.preferred_zone != "No preference":
        notes.append(
            f"You indicated a preference for universities in {prefs.preferred_zone}. "
            "Cross-check JAMB's official CAOS/institution list to confirm which "
            "accredited universities in that zone run your recommended course."
        )
    if prefs.ownership and prefs.ownership != "No preference":
        notes.append(
            f"You indicated a preference for {prefs.ownership} universities — tuition and "
            "admission cut-off marks differ significantly by ownership type, so verify "
            "current cut-off marks directly with JAMB/the institution."
        )
    if prefs.tuition_budget_naira is not None:
        notes.append(
            "Tuition budget noted — Federal universities are generally the most affordable, "
            "followed by State, then Private; confirm current fees on each institution's website."
        )
    if prefs.hostel_preference and prefs.hostel_preference != "No preference":
        notes.append(f"Hostel preference noted: {prefs.hostel_preference}.")
    if prefs.preferred_university:
        notes.append(
            f"You mentioned {prefs.preferred_university} as a preferred university — verify "
            "directly that it currently runs your recommended course and check its JAMB cut-off mark."
        )
    return notes
