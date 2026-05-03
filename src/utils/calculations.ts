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

export function calculateBaseDailyRate(state: CalculatorState, minDailyRate: number): number {
  const { employmentStatus, age } = state;

  if (employmentStatus === 'employee') {
    const { grossAvg3m, avgMonthlyDeductions, additionalPay } = state;
    const cappedGross = Math.min(grossAvg3m, CONSTANTS.SALARY_CAP);
    const netMonthlyForCalc = Math.max(0, cappedGross - avgMonthlyDeductions + (additionalPay / 12));
    return netMonthlyForCalc / 30;
  }

  if (employmentStatus === 'self_employed') {
    const { prevYearIncome, currentYearIncome } = state;
    const incomeDiff = prevYearIncome - currentYearIncome;
    const monthlyIncome = incomeDiff / 12;
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
): { rate: number; applied: boolean; reason: string } {
  const { hospitalized, hospitalDays, age, maritalStatus, hasChildren } = state;

  if (!hospitalized || hospitalDays <= 14) {
    return { rate: 0, applied: false, reason: '' };
  }

  if (age !== null && age >= 14 && age < 18) {
    return {
      rate: 0.125,
      applied: true,
      reason: 'הפחתה של 12.5% עבור ימי אשפוז (גיל 14-18)',
    };
  }

  if (
    age !== null &&
    age >= 18 &&
    maritalStatus === 'single' &&
    (!hasChildren || allChildrenGrownFlag)
  ) {
    return {
      rate: 0.25,
      applied: true,
      reason: 'הפחתה של 25% עבור ימי אשפוז (רווק/ה ללא ילדים מתחת לגיל 18)',
    };
  }

  return { rate: 0, applied: false, reason: '' };
}

export function calculateDisabilityDeduction(
  recognizedDisability: boolean | null,
  disabilityPercent: number | null,
  daysOfDisability: number
): number {
  if (!recognizedDisability || !disabilityPercent) return 0;
  const monthlyDeduction = DISABILITY_DEDUCTIONS[disabilityPercent] || 0;
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
  const daysOfDisability = calculateDaysDifference(state.absenceStartDate, state.absenceEndDate);
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
  const hospitalDays = state.hospitalized ? Math.min(state.hospitalDays, daysOfDisability) : 0;

  let paymentBeforeDeductions: number;
  if (hospitalReduction.applied && hospitalDays > 0) {
    const regularDays = daysOfDisability - hospitalDays;
    const regularPayment = dailyRate * regularDays;
    const hospitalPayment = dailyRate * (1 - hospitalReduction.rate) * hospitalDays;
    paymentBeforeDeductions = regularPayment + hospitalPayment;
  } else {
    paymentBeforeDeductions = dailyRate * daysOfDisability;
  }

  const disabilityDeduction = calculateDisabilityDeduction(
    state.recognizedDisability, state.disabilityPercent, daysOfDisability
  );
  const otherBenefitsDeduction = calculateOtherBenefitsDeduction(state, daysOfDisability);
  const healthInsuranceDeduction = CONSTANTS.HEALTH_INSURANCE_MONTHLY * (daysOfDisability / 30);

  const totalDeductions = disabilityDeduction + otherBenefitsDeduction + healthInsuranceDeduction;
  const totalPayment = Math.max(0, paymentBeforeDeductions - totalDeductions);

  return {
    daysOfDisability,
    dailyRate,
    baseDailyRate,
    minDailyRate,
    maxDailyRate,
    absenceFactor,
    paymentBeforeDeductions,
    disabilityDeduction,
    otherBenefitsDeduction,
    healthInsuranceDeduction,
    hospitalReduction: hospitalReduction.applied ? dailyRate * hospitalReduction.rate * hospitalDays : 0,
    totalDeductions,
    totalPayment,
    hasChildUnder21: hasChildUnder21Flag,
    allChildrenGrown: allChildrenGrownFlag,
    hospitalReductionRate: hospitalReduction.rate,
    hospitalReductionApplied: hospitalReduction.applied,
    hospitalReductionReason: hospitalReduction.reason,
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
