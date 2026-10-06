"""
==============================================================
  STATIC REFERENCE DATA / TAXONOMY
==============================================================
All the fixed "menus" the frontend renders from, plus the
mappings used to turn raw student input into model features.

Keeping this in one module means the frontend can fetch it
from a single `/taxonomy` endpoint and always stay in sync
with whatever the backend actually expects.
==============================================================
"""

from typing import Dict, List

# ─────────────────────────────────────────────
#  1. WAEC / O'LEVEL SUBJECTS
# ─────────────────────────────────────────────
# The first 22 are the subjects present in the historical training
# dataset (real signal). The last 2 (marked NEW_NO_HISTORY) are
# accepted for completeness / future data collection but currently
# have no historical rows, so they contribute 0 signal to the trained
# model beyond the generic aggregate features (best5, average, etc).
CORE_SUBJECTS: List[str] = [
    "Mathematics", "English Language", "Civic Education",
    "Physics", "Chemistry", "Biology",
    "Technical Drawing", "Further Mathematics",
    "Foods and Nutrition", "Agricultural Science", "Geography",
    "Literature in English", "Igbo/Yoruba/Hausa",
    "CRS/IRS", "Economics", "Government",
    "Music", "French/Arabic", "Fine Art/Visual Art", "History",
    "Financial Accounting", "Commerce",
]

NEW_NO_HISTORY_SUBJECTS: List[str] = [
    "Home Economics", "Computer Studies",
]

ALL_SUBJECTS: List[str] = CORE_SUBJECTS + NEW_NO_HISTORY_SUBJECTS

# Trade subjects and extra electives the frontend's Grades step offers per
# study type. They have no historical training data (zero model signal beyond
# the generic grade aggregates), so they are accepted by request validation
# only — ALL_SUBJECTS above is left untouched because train_model.py uses it
# as the trained grade-column list.
EXTRA_SUBJECTS_NO_HISTORY: List[str] = [
    "Data Processing", "GSM Repairs", "Electrical Installation",
    "Catering Craft Practice", "Photography", "Garment Making",
    "Marketing", "Office Practice", "Bookkeeping",
    "Marketing (Trade)", "Bookkeeping (Trade)",
]

# Everything a request's `grades` may contain.
ACCEPTED_SUBJECTS: List[str] = ALL_SUBJECTS + EXTRA_SUBJECTS_NO_HISTORY

# Grade scale used throughout (WAEC-style, -1 = not offered)
GRADE_SCALE = {6: "A1", 5: "B2", 4: "B3", 3: "C4", 2: "C5", 1: "C6/F", -1: "Not offered"}

# ─────────────────────────────────────────────
#  2. SUBJECT → ACADEMIC-STRENGTH CATEGORY MAP
# ─────────────────────────────────────────────
# A subject can contribute to more than one strength bucket.
# Used to compute science/engineering/medical/commercial/arts strength.
SUBJECT_CATEGORY_MAP: Dict[str, List[str]] = {
    "Mathematics":            ["science", "engineering", "commercial"],
    "English Language":       ["arts", "commercial"],
    "Civic Education":        ["arts"],
    "Physics":                ["science", "engineering"],
    "Chemistry":              ["science", "engineering", "medical"],
    "Biology":                ["science", "medical"],
    "Technical Drawing":      ["engineering"],
    "Further Mathematics":    ["science", "engineering"],
    "Foods and Nutrition":    ["medical", "science"],
    "Agricultural Science":   ["science", "medical"],
    "Geography":              ["science", "arts"],
    "Literature in English":  ["arts"],
    "Igbo/Yoruba/Hausa":      ["arts"],
    "CRS/IRS":                ["arts"],
    "Economics":              ["commercial", "arts"],
    "Government":             ["arts", "commercial"],
    "Music":                  ["arts"],
    "French/Arabic":          ["arts"],
    "Fine Art/Visual Art":    ["arts"],
    "History":                ["arts"],
    "Financial Accounting":   ["commercial"],
    "Commerce":               ["commercial"],
    "Home Economics":         ["arts", "commercial"],
    "Computer Studies":       ["engineering", "science"],
}

STRENGTH_CATEGORIES = ["science", "engineering", "medical", "commercial", "arts"]

# ─────────────────────────────────────────────
#  3. APTITUDE ASSESSMENT
# ─────────────────────────────────────────────
# 12 categories x 2 questions = 24 questions, each rated 1-5.
APTITUDE_CATEGORIES = [
    "logical_reasoning", "analytical_thinking", "mathematical_ability",
    "creativity", "communication", "leadership", "teamwork",
    "problem_solving", "attention_to_detail", "curiosity",
    "practical_skills", "research_interest",
]

APTITUDE_QUESTIONS: List[Dict] = [
    {"id": "aq_01", "category": "logical_reasoning", "text": "I can easily spot the pattern in a sequence of numbers or shapes."},
    {"id": "aq_02", "category": "logical_reasoning", "text": "I enjoy solving logic puzzles or brain teasers."},
    {"id": "aq_03", "category": "analytical_thinking", "text": "I like breaking a complicated problem into smaller parts before solving it."},
    {"id": "aq_04", "category": "analytical_thinking", "text": "I naturally look for cause-and-effect relationships when something goes wrong."},
    {"id": "aq_05", "category": "mathematical_ability", "text": "I am comfortable working with numbers, formulas, and calculations."},
    {"id": "aq_06", "category": "mathematical_ability", "text": "I find it easy to understand graphs, statistics, or mathematical models."},
    {"id": "aq_07", "category": "creativity", "text": "I often come up with original ideas or unusual solutions."},
    {"id": "aq_08", "category": "creativity", "text": "I enjoy designing, drawing, writing, or creating something from scratch."},
    {"id": "aq_09", "category": "communication", "text": "I find it easy to explain my ideas clearly to other people."},
    {"id": "aq_10", "category": "communication", "text": "I enjoy writing or speaking in front of others."},
    {"id": "aq_11", "category": "leadership", "text": "I naturally take charge when working in a group."},
    {"id": "aq_12", "category": "leadership", "text": "People often come to me for direction or decisions."},
    {"id": "aq_13", "category": "teamwork", "text": "I work well with others to achieve a shared goal."},
    {"id": "aq_14", "category": "teamwork", "text": "I enjoy collaborating rather than working entirely alone."},
    {"id": "aq_15", "category": "problem_solving", "text": "I stay calm and look for solutions when something unexpected happens."},
    {"id": "aq_16", "category": "problem_solving", "text": "I enjoy troubleshooting and fixing things that are broken."},
    {"id": "aq_17", "category": "attention_to_detail", "text": "I notice small errors or inconsistencies that others often miss."},
    {"id": "aq_18", "category": "attention_to_detail", "text": "I double-check my work carefully before considering it done."},
    {"id": "aq_19", "category": "curiosity", "text": "I like learning how things work, even outside my usual subjects."},
    {"id": "aq_20", "category": "curiosity", "text": "I frequently ask 'why' and look things up on my own."},
    {"id": "aq_21", "category": "practical_skills", "text": "I enjoy building, repairing, or physically working with tools/machines."},
    {"id": "aq_22", "category": "practical_skills", "text": "I learn best by doing something hands-on rather than just reading about it."},
    {"id": "aq_23", "category": "research_interest", "text": "I enjoy investigating a topic deeply rather than just getting a quick answer."},
    {"id": "aq_24", "category": "research_interest", "text": "I would enjoy conducting experiments or long-term studies."},
]

APTITUDE_RATING_SCALE = {1: "Strongly Disagree", 2: "Disagree", 3: "Neutral", 4: "Agree", 5: "Strongly Agree"}

# ─────────────────────────────────────────────
#  4. HIERARCHICAL CAREER INTERESTS
# ─────────────────────────────────────────────
INTEREST_HIERARCHY: Dict[str, List[str]] = {
    "Technology": [
        "Artificial Intelligence", "Software Engineering", "Cybersecurity",
        "Networking", "Data Science", "Cloud Computing", "Robotics",
        "Game Development", "Mobile Development", "Web Development",
    ],
    "Health": [
        "Medicine", "Nursing", "Pharmacy", "Physiotherapy",
        "Public Health", "Nutrition",
    ],
    "Engineering": [
        "Mechanical", "Civil", "Electrical", "Chemical",
        "Petroleum", "Aerospace", "Mechatronics",
    ],
    "Business": [
        "Accounting", "Banking", "Marketing", "Finance", "Entrepreneurship",
    ],
    "Arts": [
        "Journalism", "Music", "Theatre", "Creative Writing", "Linguistics",
    ],
}

# Reverse lookup: leaf interest -> its top-level parent category.
# Used to enforce, server-side, that all selected interests belong to
# the same single active category (mirrors the frontend's one-category-
# at-a-time UI, as defense in depth).
LEAF_TO_PARENT_CATEGORY: Dict[str, str] = {
    leaf: category for category, leaves in INTEREST_HIERARCHY.items() for leaf in leaves
}
# free-text interest vocabulary the ML model was trained on. This lets a
# clean hierarchical UI selection still produce a meaningful, real,
# trained-on feature vector instead of inventing a new untrained one.
LEAF_INTEREST_KEYWORDS: Dict[str, List[str]] = {
    "Artificial Intelligence": ["ai", "machine learning", "robotics", "data analysis"],
    "Software Engineering":    ["programming", "coding", "software", "software systems", "apps"],
    "Cybersecurity":           ["hacking", "security", "network protection"],
    "Networking":              ["networks", "it systems", "communication systems"],
    "Data Science":            ["data", "data analysis", "statistics", "statistical analysis", "data modelling"],
    "Cloud Computing":         ["it systems", "software integration", "systems"],
    "Robotics":                ["robotics", "robots", "automation", "machines"],
    "Game Development":       ["coding", "programming", "animation", "creative coding"],
    "Mobile Development":      ["apps", "mobile apps", "programming", "software"],
    "Web Development":        ["website layouts", "coding", "programming", "ui design", "user interface"],

    "Medicine":                ["medicine", "medical science", "diagnosis", "patients", "treatment"],
    "Nursing":                 ["patients", "care", "healthcare", "hospital"],
    "Pharmacy":                ["medication", "drugs", "health science"],
    "Physiotherapy":           ["rehabilitation", "human body", "therapy"],
    "Public Health":           ["community health", "disease prevention", "healthcare"],
    "Nutrition":               ["health diet", "food"],

    "Mechanical":              ["engines", "machines", "mechanics", "automobiles"],
    "Civil":                   ["buildings", "construction", "structures", "building estimation"],
    "Electrical":              ["electricity", "circuits", "power systems", "electronics"],
    "Chemical":                ["chemicals", "chemical production", "reactions"],
    "Petroleum":               ["oil", "gas", "drilling"],
    "Aerospace":               ["aircraft", "flight", "space"],
    "Mechatronics":            ["robotics", "automation", "circuits", "machines"],

    "Accounting":              ["bookkeeping", "financial records", "auditing"],
    "Banking":                 ["banking", "financial markets", "money management"],
    "Marketing":               ["branding", "advertising", "sales strategies", "consumer behavior"],
    "Finance":                 ["financial analysis", "investment", "risk analysis"],
    "Entrepreneurship":        ["business startup", "business oppurtunities", "innovation"],

    "Journalism":              ["news reporting", "writing", "media"],
    "Music":                   ["music"],
    "Theatre":                 ["storytelling", "media", "creativity"],
    "Creative Writing":        ["writing", "storytelling"],
    "Linguistics":             ["cultural studies", "communication", "society"],
}

# ─────────────────────────────────────────────
#  5. WORK STYLE
# ─────────────────────────────────────────────
WORK_STYLES: List[str] = [
    "Working with computers", "Working with people", "Working outdoors",
    "Laboratory work", "Building machines", "Solving mathematical problems",
    "Teaching", "Business management", "Scientific research",
    "Designing products", "Creative arts",
]

# ─────────────────────────────────────────────
#  6. LEARNING STYLE
# ─────────────────────────────────────────────
LEARNING_STYLES: List[str] = [
    "Practical projects", "Laboratory experiments", "Programming",
    "Reading and research", "Group learning", "Independent learning",
    "Creative design", "Public speaking", "Field work",
]

# ─────────────────────────────────────────────
#  7. CAREER GOALS — dynamic, keyed by the SAME top-level category
#     used in INTEREST_HIERARCHY. Since a student can now only be
#     active in one category at a time (see StepInterests), the goals
#     shown are always specific to that one category rather than a
#     generic flat list — this is what lets goal selection carry much
#     more specific signal than "Software Engineer" for everyone.
# ─────────────────────────────────────────────
CATEGORY_CAREER_GOALS: Dict[str, List[str]] = {
    "Technology": [
        "AI Engineer", "Backend Developer", "Mobile Developer", "Cybersecurity Analyst",
        "Data Engineer", "Cloud Engineer", "DevOps Engineer", "Network Administrator",
        "UI/UX Designer", "Game Developer",
    ],
    "Health": [
        "General Physician", "Surgeon", "Dentist", "Optometrist", "Pediatrician",
        "Pharmacist", "Physiotherapist", "Radiographer", "Medical Laboratory Scientist",
        "Anesthesiologist", "Public Health Specialist", "Registered Nurse",
        "Nutritionist", "Veterinary Doctor",
    ],
    "Engineering": [
        "Civil Engineer", "Petroleum Engineer", "Mechanical Engineer", "Mechatronics Engineer",
        "Chemical Engineer", "Electrical Engineer", "Aerospace Engineer", "Marine Engineer",
        "Biomedical Engineer", "Materials Engineer", "Automotive Engineer", "Industrial Engineer",
    ],
    "Business": [
        "Investment Banker", "Chartered Accountant", "Financial Analyst", "Entrepreneur",
        "Marketing Manager", "HR Manager", "Supply Chain Manager", "Tax Consultant",
        "Insurance Underwriter", "Actuary", "Project Manager", "Business Consultant",
    ],
    "Arts": [
        "Journalist", "Lawyer", "Animator", "Content Strategist", "Graphic Designer",
        "Photographer", "Fashion Designer", "Interior Designer", "Illustrator",
        "Political Analyst", "Diplomat", "Psychologist", "Urban Planner",
    ],
}

# Flat, de-duplicated list of every possible goal across all categories —
# used for validation only (a request's goals must all be real goals,
# regardless of which category they came from).
ALL_CAREER_GOALS: List[str] = sorted({g for goals in CATEGORY_CAREER_GOALS.values() for g in goals})

# Maps each specific career goal to the course(s) they most directly
# correspond to (real course labels from clean_dataset_latest.csv),
# used to boost matching courses in the explanation / re-ranking layer.
CAREER_GOAL_TO_COURSES: Dict[str, List[str]] = {
    # Technology
    "AI Engineer":                  ["Artificial Intelligence", "Computer Science"],
    "Backend Developer":            ["Software Engineering", "Computer Science"],
    "Mobile Developer":              ["Software Engineering", "Computer Science"],
    "Cybersecurity Analyst":        ["Cyber Security"],
    "Data Engineer":                ["Data Science", "Information Systems"],
    "Cloud Engineer":               ["Information Technology", "Computer Science"],
    "DevOps Engineer":              ["Software Engineering", "Computer Science"],
    "Network Administrator":        ["Network Engineering"],
    "UI/UX Designer":               ["UI/UX Design"],
    "Game Developer":               ["Software Engineering", "Computer Science"],
    # Health
    "General Physician":            ["Medicine and Surgery"],
    "Surgeon":                      ["Medicine and Surgery"],
    "Dentist":                      ["Dentistry"],
    "Optometrist":                  ["Optometry"],
    "Pediatrician":                 ["Medicine and Surgery"],
    "Pharmacist":                   ["Pharmacy"],
    "Physiotherapist":              ["Physiotherapy"],
    "Radiographer":                 ["Radiography", "Radiology"],
    "Medical Laboratory Scientist": ["Medical Laboratory Science"],
    "Anesthesiologist":             ["Medicine and Surgery"],
    "Public Health Specialist":     ["Public Health"],
    "Registered Nurse":             ["Nursing"],
    "Nutritionist":                 ["Nutrition and Dietetics"],
    "Veterinary Doctor":            ["Veterinary Medicine"],
    # Engineering
    "Civil Engineer":               ["Civil Engineering"],
    "Petroleum Engineer":           ["Petroleum Engineering"],
    "Mechanical Engineer":          ["Mechanical Engineering"],
    "Mechatronics Engineer":        ["Mechatronics Engineering"],
    "Chemical Engineer":            ["Chemical Engineering"],
    "Electrical Engineer":          ["Electrical Engineering"],
    "Aerospace Engineer":           ["Aerospace Engineering"],
    "Marine Engineer":              ["Marine Engineering"],
    "Biomedical Engineer":          ["Biomedical Engineering"],
    "Materials Engineer":           ["Materials Engineering"],
    "Automotive Engineer":          ["Automotive Engineering"],
    "Industrial Engineer":          ["Industrial Engineering"],
    # Business
    "Investment Banker":            ["Banking and Finance"],
    "Chartered Accountant":         ["Accounting"],
    "Financial Analyst":            ["Banking and Finance", "Actuarial Science"],
    "Entrepreneur":                 ["Entrepreneurship", "Business Administration"],
    "Marketing Manager":            ["Marketing"],
    "HR Manager":                   ["Human Resource Management"],
    "Supply Chain Manager":         ["Supply Chain Management"],
    "Tax Consultant":               ["Taxation"],
    "Insurance Underwriter":        ["Insurance"],
    "Actuary":                      ["Actuarial Science"],
    "Project Manager":              ["Project Management"],
    "Business Consultant":          ["Business Administration"],
    # Arts
    "Journalist":                   ["Journalism and Media Studies"],
    "Lawyer":                       ["Law"],
    "Animator":                     ["Animation", "Motion Graphics"],
    "Content Strategist":           ["Journalism and Media Studies"],
    "Graphic Designer":             ["Graphics Design"],
    "Photographer":                 ["Photography"],
    "Fashion Designer":             ["Fashion Design"],
    "Interior Designer":            ["Interior Design"],
    "Illustrator":                  ["Illustration"],
    "Political Analyst":            ["Political Science"],
    "Diplomat":                     ["International Relations"],
    "Psychologist":                 ["Psychology"],
    "Urban Planner":                ["Urban and Regional Planning", "Architecture"],
}

# ─────────────────────────────────────────────
#  7b. ADAPTIVE FOLLOW-UP QUESTIONS — shown right after the student
#      picks their one active interest category, before ranking goals.
#      Short yes/no questions that narrow things down further within
#      that category. Answers currently sharpen the explanation layer
#      (see explain.py); they can be trained into the model directly
#      once real outcome data exists for them, same as aptitude.
# ─────────────────────────────────────────────
FOLLOW_UP_QUESTIONS: Dict[str, List[Dict[str, str]]] = {
    "Technology": [
        {"id": "tq_1", "text": "Do you enjoy writing code?"},
        {"id": "tq_2", "text": "Are you interested in Artificial Intelligence?"},
        {"id": "tq_3", "text": "Do you like solving security problems?"},
        {"id": "tq_4", "text": "Do you enjoy building mobile apps?"},
        {"id": "tq_5", "text": "Do you enjoy designing websites or interfaces?"},
        {"id": "tq_6", "text": "Do you prefer working with data over visuals?"},
    ],
    "Health": [
        {"id": "hq_1", "text": "Do you prefer surgery over patient consultation?"},
        {"id": "hq_2", "text": "Do you enjoy working with children?"},
        {"id": "hq_3", "text": "Do you prefer laboratory work over clinical work?"},
        {"id": "hq_4", "text": "Would you rather diagnose diseases than treat them?"},
        {"id": "hq_5", "text": "Are you interested in eye care?"},
        {"id": "hq_6", "text": "Do you enjoy emergency medicine?"},
    ],
    "Engineering": [
        {"id": "eq_1", "text": "Do you enjoy working with machines and mechanical systems?"},
        {"id": "eq_2", "text": "Are you interested in construction and infrastructure?"},
        {"id": "eq_3", "text": "Do you enjoy working with electrical circuits and systems?"},
        {"id": "eq_4", "text": "Are you interested in the oil and gas industry?"},
        {"id": "eq_5", "text": "Do you enjoy designing and building physical prototypes?"},
        {"id": "eq_6", "text": "Do you prefer on-site work over an office or lab?"},
    ],
    "Business": [
        {"id": "bq_1", "text": "Do you enjoy managing money and budgets?"},
        {"id": "bq_2", "text": "Are you interested in starting your own business?"},
        {"id": "bq_3", "text": "Do you enjoy persuading and selling to people?"},
        {"id": "bq_4", "text": "Do you prefer analyzing data over meeting clients directly?"},
        {"id": "bq_5", "text": "Are you interested in the stock market and investments?"},
        {"id": "bq_6", "text": "Do you enjoy leading and managing teams?"},
    ],
    "Arts": [
        {"id": "aq2_1", "text": "Do you enjoy writing and storytelling?"},
        {"id": "aq2_2", "text": "Are you interested in visual design or illustration?"},
        {"id": "aq2_3", "text": "Do you enjoy public speaking or performing?"},
        {"id": "aq2_4", "text": "Are you interested in law and justice?"},
        {"id": "aq2_5", "text": "Do you enjoy analyzing society and culture?"},
        {"id": "aq2_6", "text": "Do you prefer working independently on creative projects?"},
    ],
}


# ─────────────────────────────────────────────
#  8. EXTRACURRICULAR ACTIVITIES
# ─────────────────────────────────────────────
EXTRACURRICULARS: List[str] = [
    "Coding club", "Robotics club", "Debate", "Student leadership", "Music",
    "Sports", "Art", "Science competitions", "Business competitions",
    "Community service",
]

# ─────────────────────────────────────────────
#  9. UNIVERSITY PREFERENCES
# ─────────────────────────────────────────────
OWNERSHIP_TYPES: List[str] = ["Federal", "State", "Private", "No preference"]

NIGERIAN_GEOPOLITICAL_ZONES: List[str] = [
    "North Central", "North East", "North West",
    "South East", "South South", "South West", "No preference",
]

HOSTEL_PREFERENCES: List[str] = ["Prefer on-campus hostel", "Prefer off-campus", "No preference"]

DISTANCE_PREFERENCES: List[str] = [
    "Close to home (same state)", "Within region", "Anywhere in the country",
]
