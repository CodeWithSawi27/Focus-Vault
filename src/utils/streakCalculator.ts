/**
 * Given an array of completion timestamps, calculate the current streak.
 * A streak is consecutive days with at least one completion.
 */
export const calculateStreak = (completionDates: string[]): number => {
  if (!completionDates.length) return 0;

  const uniqueDays = [...new Set(
    completionDates.map(d => new Date(d).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = uniqueDays[0];
  mostRecent.setHours(0, 0, 0, 0);

  // Streak must include today or yesterday to be active
  if (mostRecent < yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const current = uniqueDays[i];
    const prev = uniqueDays[i - 1];
    current.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);

    const diff = (prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};