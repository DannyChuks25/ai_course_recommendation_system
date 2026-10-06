import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StepProgressBar from '../components/StepProgressBar';
import Loader from '../components/Loader';
import StepProfile, { type ProfileData } from '../components/steps/StepProfile';
import StepGrades from '../components/steps/StepGrades';
import StepAptitude from '../components/steps/StepAptitude';
import StepInterests from '../components/steps/StepInterests';
import StepFollowUp from '../components/steps/StepFollowUp';
import StepStyle from '../components/steps/StepStyle';
import StepGoals from '../components/steps/StepGoals';
import StepActivities from '../components/steps/StepActivities';
import StepPreferences from '../components/steps/StepPreferences';
import { fetchTaxonomy, fetchUniversities, submitPrediction } from '../lib/api';
import { getAllowedSubjects } from '../types';
import type { Taxonomy, University, UniversityPreferences } from '../types';

const STEP_LABELS = [
  'Profile', 'Grades', 'Aptitude', 'Interests', 'Follow-up', 'Style', 'Goals', 'Activities', 'Preferences',
];
const TOTAL_STEPS = STEP_LABELS.length;

const EMPTY_PREFS: UniversityPreferences = {
  preferred_university: '',
  preferred_state: '',
  preferred_zone: '',
  ownership: '',
  tuition_budget_naira: '',
  hostel_preference: '',
  distance_preference: '',
};

// Moved OUTSIDE the Recommend component (module scope) rather than defined
// inside its render body. A component defined inside another component's
// function gets a brand-new function identity on every re-render, which
// makes React unmount + remount the entire subtree on every keystroke —
// that's what causes inputs to lose focus after one character and long
// scrollable steps to jump back to the top. Keeping it here keeps its
// identity stable across re-renders so the DOM (and focus, and scroll
// position) is preserved instead.
function RecommendShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-125 h-125 bg-amber-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-100 h-75 bg-orange-600/5 rounded-full blur-[80px]" />
      </div>

      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-amber-400 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-white font-black text-lg tracking-tight">Course Finder</h1>
            <p className="text-slate-500 text-xs font-mono">AI-Powered Recommendation</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}

export default function Recommend() {
  const navigate = useNavigate();

  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({ student_type: '', jamb_score: '' });
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, number>>({});

  // Only one category can be active at a time (requirement #2) — goals
  // and follow-up questions are both derived from this single value.
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [careerInterests, setCareerInterests] = useState<string[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, boolean>>({});

  const [workStyle, setWorkStyle] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<UniversityPreferences>(EMPTY_PREFS);

  useEffect(() => {
    Promise.all([fetchTaxonomy(), fetchUniversities()])
      .then(([taxonomyData, universityData]) => {
        setTaxonomy(taxonomyData);
        setUniversities(universityData);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load the form.'));
  }, []);

  // When the study type changes (e.g. student goes Back to step 1), drop any
  // selected subjects that don't belong to the new study type so stale
  // subjects (like Biology on an Art profile) never reach the payload.
  const handleProfileChange = (next: ProfileData) => {
    if (next.student_type !== profile.student_type) {
      const allowed = new Set(getAllowedSubjects(next.student_type));
      setGrades((prev) => Object.fromEntries(Object.entries(prev).filter(([subject]) => allowed.has(subject))));
    }
    setProfile(next);
  };

  const goNext = () => {
    setDirection('forward');
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => {
    setDirection('backward');
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // Changing (or clearing) the active category also clears any career
  // goals already picked, since goals are scoped to the old category and
  // wouldn't be valid choices under a new one.
  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    setCareerGoals([]);
    setFollowUpAnswers({});
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      student_type: profile.student_type,
      jamb_score: parseInt(profile.jamb_score, 10),
      grades,
      aptitude_answers: aptitudeAnswers,
      career_interests: careerInterests,
      follow_up_answers: followUpAnswers,
      work_style: workStyle,
      learning_style: learningStyle,
      career_goals: careerGoals,
      extracurriculars,
      university_preferences: {
        ...prefs,
        tuition_budget_naira: prefs.tuition_budget_naira === '' ? 0 : prefs.tuition_budget_naira,
      },
    };

    try {
      const data = await submitPrediction(payload);
      toast.success('Recommendations ready!');
      navigate('/results', { state: { recommendations: data, formData: payload } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <RecommendShell>
        <div className="bg-slate-900/80 border border-red-900/50 rounded-2xl p-8 text-center">
          <p className="text-red-400 font-bold mb-2">Couldn't load the form</p>
          <p className="text-slate-400 text-sm mb-6">{loadError}</p>
          <p className="text-slate-500 text-xs font-mono">
            Make sure the backend API is running (see backend/README.md), then refresh.
          </p>
        </div>
      </RecommendShell>
    );
  }

  if (!taxonomy) {
    return (
      <RecommendShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Loading form…</p>
        </div>
      </RecommendShell>
    );
  }

  return (
    <>
      {isSubmitting && <Loader message="Analyzing your profile…" />}
      <RecommendShell>
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl animate-fadeInUp">
          <StepProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} stepLabels={STEP_LABELS} />

          <div key={currentStep} className={direction === 'forward' ? 'animate-slideInRight' : 'animate-slideInLeft'}>
          {currentStep === 1 && <StepProfile data={profile} onChange={handleProfileChange} onNext={goNext} />}
          {currentStep === 2 && (
            <StepGrades studentType={profile.student_type} grades={grades} onChange={setGrades} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 3 && (
            <StepAptitude
              taxonomy={taxonomy}
              answers={aptitudeAnswers}
              onChange={setAptitudeAnswers}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <StepInterests
              taxonomy={taxonomy}
              studentType={profile.student_type}
              activeCategory={activeCategory}
              selected={careerInterests}
              onChangeCategory={handleCategoryChange}
              onChangeSelected={setCareerInterests}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <StepFollowUp
              taxonomy={taxonomy}
              activeCategory={activeCategory}
              answers={followUpAnswers}
              onChange={setFollowUpAnswers}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 6 && (
            <StepStyle
              taxonomy={taxonomy}
              workStyle={workStyle}
              learningStyle={learningStyle}
              onChangeWork={setWorkStyle}
              onChangeLearning={setLearningStyle}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 7 && (
            <StepGoals
              taxonomy={taxonomy}
              activeCategory={activeCategory}
              selected={careerGoals}
              onChange={setCareerGoals}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 8 && (
            <StepActivities
              taxonomy={taxonomy}
              selected={extracurriculars}
              onChange={setExtracurriculars}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {currentStep === 9 && (
            <StepPreferences
              taxonomy={taxonomy}
              universities={universities}
              prefs={prefs}
              onChange={setPrefs}
              onSubmit={handleSubmit}
              onBack={goBack}
              isLoading={isSubmitting}
            />
          )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs font-mono mt-6">
          Your data is used only to generate course recommendations.
        </p>
      </RecommendShell>
    </>
  );
}
