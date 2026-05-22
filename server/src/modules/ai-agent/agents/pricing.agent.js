/** Dynamic pricing stub — extend with demand signals & weather */
export function suggestDynamicPrice({ basePrice, isWeekend, isPeakHour }) {
  let multiplier = 1;
  if (isWeekend) multiplier += 0.15;
  if (isPeakHour) multiplier += 0.2;
  return Math.round(basePrice * multiplier);
}
