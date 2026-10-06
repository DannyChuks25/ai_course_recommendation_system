"""
==============================================================
  NIGERIAN UNIVERSITIES — STATIC REFERENCE DATASET
==============================================================
There is no single reliable, freely-licensed live API for the full,
current list of accredited Nigerian universities with ownership type,
so this is a curated static dataset of well-known institutions instead
of an unverified live external call. It's intentionally a reference
list for the searchable dropdown, not a claim of exhaustive/real-time
NUC accreditation status — the frontend already tells users to verify
current details (fees, cut-off marks, accreditation) directly with the
institution or JAMB, see explain.university_preference_notes().

Each entry: name, ownership (Federal/State/Private), state, zone.
==============================================================
"""

from typing import Dict, List, TypedDict


class University(TypedDict):
    name: str
    ownership: str
    state: str
    zone: str


NIGERIAN_UNIVERSITIES: List[University] = [
    # ── Federal ──
    {"name": "University of Lagos", "ownership": "Federal", "state": "Lagos", "zone": "South West"},
    {"name": "University of Ibadan", "ownership": "Federal", "state": "Oyo", "zone": "South West"},
    {"name": "Obafemi Awolowo University", "ownership": "Federal", "state": "Osun", "zone": "South West"},
    {"name": "University of Benin", "ownership": "Federal", "state": "Edo", "zone": "South South"},
    {"name": "University of Nigeria, Nsukka", "ownership": "Federal", "state": "Enugu", "zone": "South East"},
    {"name": "Ahmadu Bello University", "ownership": "Federal", "state": "Kaduna", "zone": "North West"},
    {"name": "University of Ilorin", "ownership": "Federal", "state": "Kwara", "zone": "North Central"},
    {"name": "University of Port Harcourt", "ownership": "Federal", "state": "Rivers", "zone": "South South"},
    {"name": "Federal University of Technology, Akure", "ownership": "Federal", "state": "Ondo", "zone": "South West"},
    {"name": "Federal University of Technology, Minna", "ownership": "Federal", "state": "Niger", "zone": "North Central"},
    {"name": "Federal University of Technology, Owerri", "ownership": "Federal", "state": "Imo", "zone": "South East"},
    {"name": "University of Calabar", "ownership": "Federal", "state": "Cross River", "zone": "South South"},
    {"name": "University of Uyo", "ownership": "Federal", "state": "Akwa Ibom", "zone": "South South"},
    {"name": "University of Jos", "ownership": "Federal", "state": "Plateau", "zone": "North Central"},
    {"name": "University of Maiduguri", "ownership": "Federal", "state": "Borno", "zone": "North East"},
    {"name": "Bayero University Kano", "ownership": "Federal", "state": "Kano", "zone": "North West"},
    {"name": "Usmanu Danfodiyo University", "ownership": "Federal", "state": "Sokoto", "zone": "North West"},
    {"name": "Nnamdi Azikiwe University", "ownership": "Federal", "state": "Anambra", "zone": "South East"},
    {"name": "Federal University, Lafia", "ownership": "Federal", "state": "Nasarawa", "zone": "North Central"},
    {"name": "Federal University, Oye-Ekiti", "ownership": "Federal", "state": "Ekiti", "zone": "South West"},
    {"name": "Federal University, Otuoke", "ownership": "Federal", "state": "Bayelsa", "zone": "South South"},
    {"name": "Federal University, Dutsin-Ma", "ownership": "Federal", "state": "Katsina", "zone": "North West"},
    {"name": "Federal University, Gusau", "ownership": "Federal", "state": "Zamfara", "zone": "North West"},
    {"name": "Nigerian Defence Academy", "ownership": "Federal", "state": "Kaduna", "zone": "North West"},
    {"name": "National Open University of Nigeria", "ownership": "Federal", "state": "Lagos", "zone": "South West"},

    # ── State ──
    {"name": "Lagos State University", "ownership": "State", "state": "Lagos", "zone": "South West"},
    {"name": "Ambrose Alli University", "ownership": "State", "state": "Edo", "zone": "South South"},
    {"name": "Rivers State University", "ownership": "State", "state": "Rivers", "zone": "South South"},
    {"name": "Ekiti State University", "ownership": "State", "state": "Ekiti", "zone": "South West"},
    {"name": "Delta State University", "ownership": "State", "state": "Delta", "zone": "South South"},
    {"name": "Enugu State University of Science and Technology", "ownership": "State", "state": "Enugu", "zone": "South East"},
    {"name": "Kaduna State University", "ownership": "State", "state": "Kaduna", "zone": "North West"},
    {"name": "Kano University of Science and Technology, Wudil", "ownership": "State", "state": "Kano", "zone": "North West"},
    {"name": "Osun State University", "ownership": "State", "state": "Osun", "zone": "South West"},
    {"name": "Ondo State University of Science and Technology", "ownership": "State", "state": "Ondo", "zone": "South West"},
    {"name": "Imo State University", "ownership": "State", "state": "Imo", "zone": "South East"},
    {"name": "Abia State University", "ownership": "State", "state": "Abia", "zone": "South East"},
    {"name": "Benue State University", "ownership": "State", "state": "Benue", "zone": "North Central"},
    {"name": "Plateau State University", "ownership": "State", "state": "Plateau", "zone": "North Central"},
    {"name": "Akwa Ibom State University", "ownership": "State", "state": "Akwa Ibom", "zone": "South South"},

    # ── Private ──
    {"name": "Covenant University", "ownership": "Private", "state": "Ogun", "zone": "South West"},
    {"name": "Babcock University", "ownership": "Private", "state": "Ogun", "zone": "South West"},
    {"name": "Bowen University", "ownership": "Private", "state": "Osun", "zone": "South West"},
    {"name": "Afe Babalola University", "ownership": "Private", "state": "Ekiti", "zone": "South West"},
    {"name": "Pan-Atlantic University", "ownership": "Private", "state": "Lagos", "zone": "South West"},
    {"name": "American University of Nigeria", "ownership": "Private", "state": "Adamawa", "zone": "North East"},
    {"name": "Landmark University", "ownership": "Private", "state": "Kwara", "zone": "North Central"},
    {"name": "Redeemer's University", "ownership": "Private", "state": "Osun", "zone": "South West"},
    {"name": "Bells University of Technology", "ownership": "Private", "state": "Ogun", "zone": "South West"},
    {"name": "Lead City University", "ownership": "Private", "state": "Oyo", "zone": "South West"},
    {"name": "Igbinedion University", "ownership": "Private", "state": "Edo", "zone": "South South"},
    {"name": "Nile University of Nigeria", "ownership": "Private", "state": "FCT", "zone": "North Central"},
    {"name": "Baze University", "ownership": "Private", "state": "FCT", "zone": "North Central"},
    {"name": "Veritas University", "ownership": "Private", "state": "FCT", "zone": "North Central"},
    {"name": "Al-Hikmah University", "ownership": "Private", "state": "Kwara", "zone": "North Central"},
    {"name": "Crawford University", "ownership": "Private", "state": "Ogun", "zone": "South West"},
    {"name": "Caleb University", "ownership": "Private", "state": "Lagos", "zone": "South West"},
    {"name": "Elizade University", "ownership": "Private", "state": "Ondo", "zone": "South West"},
    {"name": "Godfrey Okoye University", "ownership": "Private", "state": "Enugu", "zone": "South East"},
    {"name": "Wellspring University", "ownership": "Private", "state": "Edo", "zone": "South South"},
]


def universities_by_name() -> Dict[str, University]:
    return {u["name"]: u for u in NIGERIAN_UNIVERSITIES}
