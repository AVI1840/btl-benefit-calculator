import {
  CalculatorState,
  CalculationResult,
  CONSTANTS,
  DISABILITY_DEDUCTIONS,
  AbsenceScope,
} from '@/types/calculator';

export function calculateDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, diffDays);
}

export function getAbsenceFactor(scope: AbsenceScope): number {
  switch (scope) {
    case 'full': return 1;
    case 'half': return 0.5;
    case 'quarter': return 0.25;
    default: return 1;
  }
}

export function hasChildUnder21(children: { age: number }[]): boolean {
  return children.some((child) => child.age < 21);
}

export function allChildrenGrown(children: { age: number }[]): boolean {
  return children.length > 0 && children.every((child) => child.age >= 18);
}

/**
 * Get disability deduction for any percentage.
 * For exact matches (20,30,...100,101) use the table directly.
 * For in-between values, round DOWN to nearest 10 (e.g. 25% → 20%, 35% → 30%).
 * Below 20% = no deduction.
 */
export function getDisabilityMonthlyDeduction(percent: number): number {
  // Exact match
  if (DISABILITY_DEDUCTIONS[percent] !== undefined) {
    return DISABILITY_DEDUCTIONS[percent];
  }
  // Above 100 → use 101 (special)
  if (percent > 100) {
    return DISABILITY_DEDUCTIONS[101];
  }
  // Below 20 → no deduction
  if (percent < 20) {
    return 0;
  }
  // Round down to nearest 10
  const rounded = Math.floor(percent / 10) * 10;
  return DISABILITY_DEDUCTIONS[rounded] || 0;
}

export function calculateBaseDailyRate(state: CalculatorState, minDailyRate: number): number {
  const { employmentStatus, age } = state;

  if (employmentStatus === 'employee') {
    const { grossAvg3m, avgMonthlyDeductions, additionalPay } = state;
    const cappedGross = Math.min(grossAvg3m, CONSTANTS.SALARY_CAP);
    const netMonthlyForCalc = Math.max(0, cappedGross - avgMonthlyDeductions + (additionalPay / 12));
    return netMonthlyForCalc / 30;
  }

  if (employmentStatus === 'self_employed') {
    const { prevYearIncome } = state;
    // For self-employed: base on pre-event annual income / 12 / 30
    // This represents the daily earning capacity before the event
    const monthlyIncome = prevYearIncome / 12;
    const dailyRate = monthlyIncome / 30;
    return Math.max(minDailyRate, dailyRate);
  }

  // not_working
  if (age !== null && age >= 14 && age < 18) {
    return minDailyRate * 0.5;
  }
  return minDailyRate;
}

export function calculateHospitalReduction(
  state: CalculatorState,
  hasChildUnder21Flag: boolean,
  allChildrenGrownFlag: boolean
): { rate: number; applied: boolean; reason: string; applicableDays: number } {
  const { hospitalized, hospitalDays, age, maritalStatus, hasChildren } = state;

  if (!hospitalized || hospitalDays <= 14) {
    return { rate: 0, applied: false, reason: '', applicableDays: 0 };
  }

  // Only days BEYOND 14 are subject to reduction
  const applicableDays = hospitalDays - 14;

  // Age 14-18
  if (age !== null && age >= 14 && age < 18) {
    return {
      rate: 0.125,
      applied: true,
      reason: `הפחתה של 12.5% על ${applicableDays} ימי אשפוז (מעבר ל-14 הראשונים, גיל 14-18)`,
      applicableDays,
    };
  }

  // 18+ single without minor children
  if (
    age !== null &&
    age >= 18 &&
    maritalStatus === 'single' &&
    (!hasChildren || allChildrenGrownFlag)
  ) {
    return {
      rate: 0.25,
      applied: true,
      reason: `הפחתה של 25% על ${applicableDays} ימי אשפוז (מעבר ל-14 הראשונים, רווק/ה ללא ילדים מתחת לגיל 18)`,
      applicableDays,
    };
  }

  return { rate: 0, applied: false, reason: '', applicableDays: 0 };
}

export function calculateDisabilityDeduction(
  recognizedDisability: boolean | null,
  disabilityPercent: number | null,
  daysOfDisability: number
): number {
  if (!recognizedDisability || !disabilityPercent) return 0;
  const monthlyDeduction = getDisabilityMonthlyDeduction(disabilityPercent);
  return (monthlyDeduction / 30) * daysOfDisability;
}

export function calculateOtherBenefitsDeduction(
  state: CalculatorState,
  daysOfDisability: number
): number {
  if (!state.hasOtherBenefits || state.otherBenefits.length === 0) return 0;

  return state.otherBenefits.reduce((total, benefit) => {
    if (benefit.benefitFrequency === 'monthly') {
      return total + (benefit.benefitAmount / 30) * daysOfDisability;
    }
    return total + benefit.benefitAmount;
  }, 0);
}

export function calculateResult(state: CalculatorState): CalculationResult {
  const rawDays = calculateDaysDifference(state.absenceStartDate, state.absenceEndDate);

  // Waiting period: first 2 days are unpaid (unless incapacity > 12 days, then paid retroactively)
  const waitingDays = rawDays > 12 ? 0 : Math.min(2, rawDays);
  const daysOfDisability = Math.max(0, rawDays - waitingDays);

  // Max period cap: 182 days (6 months) per event, extendable
  const cappedDays = Math.min(daysOfDisability, CONSTANTS.MAX_DAYS_PER_EVENT);

  const absenceFactor = getAbsenceFactor(state.absenceScope);

  const hasChildUnder21Flag = hasChildUnder21(state.children);
  const allChildrenGrownFlag = allChildrenGrown(state.children);

  const minDailyRate = hasChildUnder21Flag
    ? CONSTANTS.MIN_DAILY_WITH_CHILD_UNDER_21
    : CONSTANTS.MIN_DAILY_NO_CHILD_UNDER_21;
  const maxDailyRate = minDailyRate * CONSTANTS.MAX_MULTIPLIER_OF_BASE;

  const baseDailyRate = calculateBaseDailyRate(state, minDailyRate);
  const clampedDailyRate = Math.min(Math.max(baseDailyRate, minDailyRate), maxDailyRate);
  const dailyRate = clampedDailyRate * absenceFactor;

  const hospitalReduction = calculateHospitalReduction(state, hasChildUnder21Flag, allChildrenGrownFlag);

  // Payment calculation with corrected hospital reduction
  let paymentBeforeDeductions: number;
  if (hospitalReduction.applied && hospitalReduction.applicableDays > 0) {
    // First 14 hospital days + all non-hospital days = full rate
    const fullRateDays = cappedDays - hospitalReduction.applicableDays;
    const fullPayment = dailyRate * fullRateDays;
    // Days beyond 14 in hospital = reduced rate
    const reducedPayment = dailyRate * (1 - hospitalReduction.rate) * hospitalReduction.applicableDays;
    paymentBeforeDeductions = fullPayment + reducedPayment;
  } else {
    paymentBeforeDeductions = dailyRate * cappedDays;
  }

  const disabilityDeduction = calculateDisabilityDeduction(
    state.recognizedDisability, state.disabilityPercent, cappedDays
  );
  const otherBenefitsDeduction = calculateOtherBenefitsDeduction(state, cappedDays);
  const healthInsuranceDeduction = CONSTANTS.HEALTH_INSURANCE_MONTHLY * (cappedDays / 30);

  const totalDeductions = disabilityDeduction + otherBenefitsDeduction + healthInsuranceDeduction;
  const totalPayment = Math.max(0, paymentBeforeDeductions - totalDeductions);

  return {
    rawDays,
    waitingDays,
    daysOfDisability: cappedDays,
    dailyRate,
    baseDailyRate,
    minDailyRate,
    maxDailyRate,
    absenceFactor,
    paymentBeforeDeductions,
    disabilityDeduction,
    otherBenefitsDeduction,
    healthInsuranceDeduction,
    hospitalReduction: hospitalReduction.applied
      ? dailyRate * hospitalReduction.rate * hospitalReduction.applicableDays
      : 0,
    totalDeductions,
    totalPayment,
    hasChildUnder21: hasChildUnder21Flag,
    allChildrenGrown: allChildrenGrownFlag,
    hospitalReductionRate: hospitalReduction.rate,
    hospitalReductionApplied: hospitalReduction.applied,
    hospitalReductionReason: hospitalReduction.reason,
    hospitalApplicableDays: hospitalReduction.applicableDays,
    cappedAtMax: rawDays - waitingDays > CONSTANTS.MAX_DAYS_PER_EVENT,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('he-IL').format(num);
}
