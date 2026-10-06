// ─────────────────────────────────────────────────────────────
//  Shared types — mirror backend/app/schemas.py + taxonomy.py
// ─────────────────────────────────────────────────────────────

export type StudentType = 'Science' | 'Art' | 'Commercial' | '';

export interface AptitudeQuestion {
  id: string;
  category: string;
  text: string;
}

export interface FollowUpQuestion {
  id: string;
  text: string;
}

export interface Taxonomy {
  subjects: {
    all: string[];
    core_with_historical_data: string[];
    new_no_historical_data: string[];
    grade_scale: Record<string, string>;
  };
  aptitude: {
    questions: AptitudeQuestion[];
    rating_scale: Record<string, string>;
  };
  career_interests: Record<string, string[]>;
  follow_up_questions: Record<string, FollowUpQuestion[]>;
  work_styles: string[];
  learning_styles: string[];
  // Keyed by the same top-level category as career_interests — look up
  // career_goals[activeCategory] once exactly one category is selected.
  career_goals: Record<string, string[]>;
  extracurriculars: string[];
  university_preferences: {
    ownership_types: string[];
    geopolitical_zones: string[];
    hostel_preferences: string[];
    distance_preferences: string[];
  };
  student_types: string[];
}

export interface University {
  name: string;
  ownership: string;
  state: string;
  zone: string;
}

export interface UniversityPreferences {
  preferred_university: string;
  preferred_state: string;
  preferred_zone: string;
  ownership: string;
  tuition_budget_naira: number | '';
  hostel_preference: string;
  distance_preference: string;
}

export interface PredictionRequest {
  student_type: StudentType;
  jamb_score: number;
  grades: Record<string, number>;
  aptitude_answers: Record<string, number>;
  career_interests: string[];
  follow_up_answers: Record<string, boolean>;
  work_style: string[];
  learning_style: string[];
  career_goals: string[];
  extracurriculars: string[];
  university_preferences: UniversityPreferences;
}

export interface CourseRecommendation {
  rank: number;
  course: string;
  confidence_score: number;
  confidence_pct: string;
  reasons: string[];
  career_pathways: string[];
  similar_careers: string[];
  recommended_skills: string[];
}

export interface PredictionResponse {
  status: string;
  model: string;
  top_recommendation: CourseRecommendation;
  top_five: CourseRecommendation[];
  all_probabilities: Record<string, number>;
  student_strengths: string[];
  student_weaknesses: string[];
  improvement_areas: string[];
  academic_features: Record<string, number>;
  aptitude_scores: Record<string, number>;
  suitability_scores: Record<string, number>;
  university_preference_notes: string[];
  note: string;
}

// ─────────────────────────────────────────────────────────────
//  Static helper data that doesn't need to come from the API
// ─────────────────────────────────────────────────────────────

// Grade scale matches backend: 6=A1 (best) ... 1=C6/F, -1 not offered.
export const GRADE_OPTIONS = [
  { label: 'A1', value: 6 },
  { label: 'B2', value: 5 },
  { label: 'B3', value: 4 },
  { label: 'C4', value: 3 },
  { label: 'C5', value: 2 },
  { label: 'C6 / F', value: 1 },
];

export const STUDENT_TYPE_OPTIONS: { value: StudentType; label: string; icon: string; blurb: string }[] = [
  { value: 'Science', label: 'Science', icon: '🔬', blurb: 'Maths, Physics, Chemistry, Biology and related subjects.' },
  { value: 'Art', label: 'Art', icon: '🎨', blurb: 'Literature, Government, Languages, History and related subjects.' },
  { value: 'Commercial', label: 'Commercial', icon: '📊', blurb: 'Commerce, Accounting, Economics and related subjects.' },
];

// ─────────────────────────────────────────────
//  Study type ↔ career-interest category compatibility
// ─────────────────────────────────────────────
// Which top-level career interest categories (StepInterests /
// taxonomy.career_interests keys — Technology, Health, Engineering,
// Business, Arts) a given study type is allowed to pick from. Used to
// stop obviously mismatched combinations (e.g. Art + Engineering,
// Science + Business, Commercial + Health) at StepInterests, before the
// student can move on to later steps or submit the form.
export const STUDENT_TYPE_CAREER_CATEGORIES: Record<Exclude<StudentType, ''>, string[]> = {
  Science: ['Technology', 'Health', 'Engineering'],
  Commercial: ['Business', 'Technology'],
  Art: ['Arts', 'Business'],
};

// Total subjects a student must select on the Grades step.
export const MIN_SUBJECTS = 8;
export const MAX_SUBJECTS = 9;

// ─────────────────────────────────────────────
//  Subjects offered per study type (Grades step)
// ─────────────────────────────────────────────
// Subject names must match the backend's accepted subject names exactly
// (backend/app/taxonomy.py). Only the subjects listed for the chosen
// study type are shown, so e.g. an Art student never sees Biology.
export type SubjectSectionKey = 'core' | 'coreElectives' | 'optional' | 'trade';

export interface SubjectSection {
  key: SubjectSectionKey;
  title: string;
  hint: string;
  subjects: string[];
  // Max subjects selectable in this section. maxPick 1 behaves like a
  // radio group: picking another subject replaces the current one.
  maxPick?: number;
}

const CORE_SUBJECTS_ALL = ['English Language', 'Mathematics', 'Civic Education'];

export const SUBJECT_SECTIONS_BY_STUDENT_TYPE: Record<Exclude<StudentType, ''>, SubjectSection[]> = {
  Science: [
    { key: 'core', title: 'Core Subjects', hint: 'Compulsory for every student.', subjects: CORE_SUBJECTS_ALL },
    { key: 'coreElectives', title: 'Core Electives', hint: 'Your science subjects.', subjects: ['Physics', 'Chemistry', 'Biology'] },
    {
      key: 'optional', title: 'Optional Electives', hint: 'Pick the ones you offered.',
      subjects: ['Further Mathematics', 'Agricultural Science', 'Geography', 'Technical Drawing'],
    },
    {
      key: 'trade', title: 'Trade Subject', hint: 'Compulsory — pick just 1.', maxPick: 1,
      subjects: ['Data Processing', 'GSM Repairs', 'Electrical Installation'],
    },
  ],
  Art: [
    { key: 'core', title: 'Core Subjects', hint: 'Compulsory for every student.', subjects: CORE_SUBJECTS_ALL },
    {
      key: 'coreElectives', title: 'Core Arts Electives', hint: 'Your arts subjects (CRS or IRS).',
      subjects: ['Literature in English', 'Government', 'CRS/IRS'],
    },
    {
      key: 'optional', title: 'Optional Electives', hint: 'Pick 1 or 2.', maxPick: 2,
      subjects: ['Igbo/Yoruba/Hausa', 'French/Arabic', 'Music', 'Fine Art/Visual Art'],
    },
    {
      key: 'trade', title: 'Trade Subject', hint: 'Compulsory — pick just 1.', maxPick: 1,
      subjects: ['Catering Craft Practice', 'Photography', 'Garment Making'],
    },
  ],
  Commercial: [
    { key: 'core', title: 'Core Subjects', hint: 'Compulsory for every student.', subjects: CORE_SUBJECTS_ALL },
    {
      key: 'coreElectives', title: 'Core Commercial Electives', hint: 'Your commercial subjects.',
      subjects: ['Economics', 'Financial Accounting', 'Commerce', 'Government'],
    },
    {
      key: 'optional', title: 'Optional Electives', hint: 'Pick 1 or 2.', maxPick: 2,
      subjects: ['Marketing', 'Office Practice', 'Bookkeeping', 'Agricultural Science', 'Biology', 'Igbo/Yoruba/Hausa'],
    },
    {
      // "(Trade)" suffix keeps these distinct from the optional-elective
      // Marketing / Bookkeeping above, since grades are keyed by name.
      key: 'trade', title: 'Trade Subject', hint: 'Compulsory — pick just 1.', maxPick: 1,
      subjects: ['Data Processing', 'Marketing (Trade)', 'Bookkeeping (Trade)'],
    },
  ],
};

export function getAllowedSubjects(studentType: StudentType): string[] {
  if (!studentType) return [];
  return SUBJECT_SECTIONS_BY_STUDENT_TYPE[studentType].flatMap((s) => s.subjects);
}
