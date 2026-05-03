export interface ChildInfo {
  id: string;
  age: number;
}

export interface OtherBenefit {
  id: string;
  benefitType: BenefitType;
  benefitAmount: number;
  benefitFrequency: 'monthly' | 'period';
}

export type BenefitType = 
  | 'idf_disabled' 
  | 'general_disability' 
  | 'unemployment' 
  | 'injury_compensation' 
  | 'state_pension' 
  | 'persecution_disabled' 
  | 'other';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type EmploymentStatus = 'employee' | 'self_employed' | 'not_working';
export type AbsenceScope = 'full' | 'half' | 'quarter';

export interface CalculatorState {
  // Step 1: Threshold checks
  recognizedEvent: boolean | null;
  eventDate: string;
  age: number | null;

  // Step 2: Disability
  recognizedDisability: boolean | null;
  disabilityPercent: number | null;

  // Step 3: Family
  maritalStatus: MaritalStatus | null;
  hasChildren: boolean | null;
  childrenCount: number;
  children: ChildInfo[];

  // Step 4: Employment
  employmentStatus: EmploymentStatus | null;
  grossAvg3m: number;
  avgMonthlyDeductions: number;
  additionalPay: number;
  prevYearIncome: number;
  currentYearIncome: number;

  // Step 5: Incapacity
  absenceStartDate: string;
  absenceEndDate: string;
  absenceScope: AbsenceScope;

  // Step 6: Hospitalization
  hospitalized: boolean | null;
  hospitalDays: number;

  // Step 7: Other benefits
  hasOtherBenefits: boolean | null;
  otherBenefits: OtherBenefit[];
}

export interface CalculationResult {
  rawDays: number;
  waitingDays: number;
  daysOfDisability: number;
  dailyRate: number;
  baseDailyRate: number;
  minDailyRate: number;
  maxDailyRate: number;
  absenceFactor: number;
  paymentBeforeDeductions: number;
  disabilityDeduction: number;
  otherBenefitsDeduction: number;
  healthInsuranceDeduction: number;
  hospitalReduction: number;
  totalDeductions: number;
  totalPayment: number;
  hasChildUnder21: boolean;
  allChildrenGrown: boolean;
  hospitalReductionRate: number;
  hospitalReductionApplied: boolean;
  hospitalReductionReason: string;
  hospitalApplicableDays: number;
  cappedAtMax: boolean;
}

export const CONSTANTS = {
  MIN_DAILY_NO_CHILD_UNDER_21: 244.10,
  MIN_DAILY_WITH_CHILD_UNDER_21: 316.50,
  MAX_MULTIPLIER_OF_BASE: 5,
  HEALTH_INSURANCE_MONTHLY: 25,
  DAYS: 30,
  SALARY_CAP: 47465,
  MAX_DAYS_PER_EVENT: 182, // 6 months max per event
  WAITING_DAYS: 2, // first 2 days unpaid (unless > 12 days total)
} as const;

export const DISABILITY_DEDUCTIONS: Record<number, number> = {
  20: 1161.45,
  30: 1742.18,
  40: 2322.91,
  50: 2903.64,
  60: 3484.36,
  70: 4065.09,
  80: 4645.82,
  90: 5226.54,
  100: 5807.27,
  101: 8130.19, // +100
};

export const BENEFIT_TYPE_LABELS: Record<BenefitType, string> = {
  idf_disabled: 'נכי צה״ל',
  general_disability: 'נכות כללית',
  unemployment: 'אבטלה',
  injury_compensation: 'דמי פגיעה',
  state_pension: 'פנסיה מאוצר המדינה',
  persecution_disabled: 'נכי רדיפות',
  other: 'אחר',
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'רווק/ה',
  married: 'נשוי/ה',
  divorced: 'גרוש/ה',
  widowed: 'אלמן/ה',
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  employee: 'שכיר',
  self_employed: 'עצמאי',
  not_working: 'לא עבד/ה',
};

export const ABSENCE_SCOPE_LABELS: Record<AbsenceScope, string> = {
  full: 'מלא',
  half: 'חצי',
  quarter: 'רבע',
};
