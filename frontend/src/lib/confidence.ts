/**
 * Display-only confidence transform.
 *
 * The Random Forest's raw confidence scores are mathematically correct,
 * but for a multi-class problem across 100+ courses they land in ranges
 * (single-digit to low-20s%) that read as "low confidence" to students
 * even when they're a strong relative signal. Per product decision,
 * this remaps the *displayed* percentage upward in bands so it reads
 * better, WITHOUT touching:
 *   - the underlying confidence_score used for sorting/ranking
 *   - anything sent to or computed by the backend
 *   - all_probabilities (still the real, unmodified values)
 *
 * This is purely cosmetic. If you show both figures anywhere, make sure
 * it's clear which one is which.
 */
export function displayConfidencePercent(rawPercent: number): number {
  let display = rawPercent;
  console.log(rawPercent);

  if (rawPercent >= 35 && rawPercent <= 40){
    display = rawPercent + 60;
  } else if (rawPercent >= 30 && rawPercent <= 35){
    display = rawPercent + 65;
  } else if (rawPercent >= 21 && rawPercent <= 30) {
    display = rawPercent + 70;
  } else if (rawPercent >= 10 && rawPercent < 21) {
    display = rawPercent + 60;
  } else if (rawPercent >= 5 && rawPercent < 10) {
    display = rawPercent + 50;
  } else if (rawPercent >= 1 && rawPercent < 5) {
    display = rawPercent + 40;
  }

  // Never show 100%+ — keep it just short of "certain".
  return Math.min(display, 99);
}

/** Convenience wrapper: takes the raw 0-1 confidence_score, returns a formatted "NN%" string. */
export function displayConfidenceLabel(rawScore: number): string {
  const rawPercent = rawScore * 100;
  return `${displayConfidencePercent(rawPercent).toFixed(0)}%`;
}
