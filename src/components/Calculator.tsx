import { useState, useCallback } from 'react';
import { CalculatorState, CalculationResult, EMPLOYMENT_STATUS_LABELS, MARITAL_STATUS_LABELS, ABSENCE_SCOPE_LABELS, BENEFIT_TYPE_LABELS, DISABILITY_DEDUCTIONS } from '@/types/calculator';
import { calculateResult, calculateDaysDifference, formatCurrency } from '@/utils/calculations';
import { WizardProgress } from './WizardProgress';
import { Step1Threshold } from './steps/Step1Threshold';
import { Step2Disability } from './steps/Step2Disability';
import { Step3Family } from './steps/Step3Family';
import { Step4Employment } from './steps/Step4Employment';
import { Step5Incapacity } from './steps/Step5Incapacity';
import { Step6Hospitalization } from './steps/Step6Hospitalization';
import { Step7OtherBenefits } from './steps/Step7OtherBenefits';
import { Step8Result } from './steps/Step8Result';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, RotateCcw, Printer, FileText, Shield, Calculator as CalcIcon } from 'lucide-react';

const STEP_TITLES = [
  'בדיקות סף',
  'נכות',
  'משפחה',
  'תעסוקה',
  'אי כושר',
  'אשפוז',
  'גמלאות',
  'תוצאה',
];

const initialState: CalculatorState = {
  recognizedEvent: null,
  eventDate: '',
  age: null,
  recognizedDisability: null,
  disabilityPercent: null,
  maritalStatus: null,
  hasChildren: null,
  childrenCount: 0,
  children: [],
  employmentStatus: null,
  grossAvg3m: 0,
  avgMonthlyDeductions: 0,
  additionalPay: 0,
  prevYearIncome: 0,
  currentYearIncome: 0,
  absenceStartDate: '',
  absenceEndDate: '',
  absenceScope: 'full',
  hospitalized: null,
  hospitalDays: 0,
  hasOtherBenefits: null,
  otherBenefits: [],
};

export function Calculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<CalculatorState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  const updateState = useCallback((updates: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
    const newErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  }, [errors]);

  const isStopped = () => {
    if (state.recognizedEvent === false) return true;
    if (state.age !== null && state.age < 14) return true;
    return false;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (state.recognizedEvent === null) {
          newErrors.recognizedEvent = 'נא לבחור האם הוכרת כנפגע/ת פעולות איבה';
        }
        if (state.recognizedEvent === true) {
          if (!state.eventDate) newErrors.eventDate = 'נא להזין תאריך אירוע';
          if (state.age === null) newErrors.age = 'נא להזין גיל';
        }
        break;
      case 2:
        if (state.recognizedDisability === null) newErrors.recognizedDisability = 'נא לבחור האם יש לך אחוזי נכות מוכרים';
        if (state.recognizedDisability === true && !state.disabilityPercent) newErrors.disabilityPercent = 'נא לבחור אחוז נכות';
        break;
      case 3:
        if (!state.maritalStatus) newErrors.maritalStatus = 'נא לבחור מצב משפחתי';
        if (state.hasChildren === null) newErrors.hasChildren = 'נא לבחור האם יש לך ילדים';
        if (state.hasChildren === true && state.children.length === 0) newErrors.children = 'נא להוסיף לפחות ילד/ה אחד/ת';
        break;
      case 4:
        if (!state.employmentStatus) newErrors.employmentStatus = 'נא לבחור מצב תעסוקה';
        if (state.employmentStatus === 'employee' && !state.grossAvg3m) newErrors.grossAvg3m = 'נא להזין ממוצע שכר ברוטו';
        if (state.employmentStatus === 'self_employed' && !state.prevYearIncome) newErrors.prevYearIncome = 'נא להזין הכנסה שנתית בשנה שלפני האירוע';
        break;
      case 5:
        if (!state.absenceStartDate) newErrors.absenceStartDate = 'נא להזין תאריך תחילת אי כושר';
        if (!state.absenceEndDate) newErrors.absenceEndDate = 'נא להזין תאריך סיום אי כושר';
        if (state.absenceStartDate && state.absenceEndDate) {
          const days = calculateDaysDifference(state.absenceStartDate, state.absenceEndDate);
          if (days <= 0) newErrors.absenceEndDate = 'תאריך סיום חייב להיות לאחר תאריך התחלה';
        }
        break;
      case 6:
        if (state.hospitalized === null) newErrors.hospitalized = 'נא לבחור האם היית מאושפז/ת';
        if (state.hospitalized === true && !state.hospitalDays) newErrors.hospitalDays = 'נא להזין מספר ימי אשפוז';
        break;
      case 7:
        if (state.hasOtherBenefits === null) newErrors.hasOtherBenefits = 'נא לבחור האם את/ה מקבל/ת גמלאות נוספות';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (isStopped()) return;
    if (validateStep(currentStep)) {
      if (currentStep === 7) {
        const calcResult = calculateResult(state);
        setResult(calcResult);
      }
      setCurrentStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleReset = () => {
    setState(initialState);
    setErrors({});
    setResult(null);
    setCurrentStep(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToClipboard = () => {
    if (!result) return;
    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      '     מחשבון תט״ר לנפגע פעולות איבה — ביטוח לאומי',
      '═══════════════════════════════════════════════════',
      '',
      `תאריך חישוב: ${new Date().toLocaleDateString('he-IL')}`,
      '',
      '── פרטים אישיים ──',
      `גיל ביום האירוע: ${state.age}`,
      `תאריך אירוע: ${state.eventDate}`,
      `מצב משפחתי: ${state.maritalStatus ? MARITAL_STATUS_LABELS[state.maritalStatus] : '—'}`,
      `ילדים: ${state.hasChildren ? state.children.map(c => `גיל ${c.age}`).join(', ') : 'אין'}`,
      `מצב תעסוקה: ${state.employmentStatus ? EMPLOYMENT_STATUS_LABELS[state.employmentStatus] : '—'}`,
      '',
      '── תקופת אי כושר ──',
      `מתאריך: ${state.absenceStartDate}  עד: ${state.absenceEndDate}`,
      `סה״כ ימים (גולמי): ${result.rawDays}`,
      `ימי המתנה: ${result.waitingDays}`,
      `ימים לתשלום: ${result.daysOfDisability}`,
      `היקף: ${ABSENCE_SCOPE_LABELS[state.absenceScope]}`,
      '',
      '── חישוב ──',
      `תעריף יומי: ${formatCurrency(result.dailyRate)}`,
      `לפני ניכויים: ${formatCurrency(result.paymentBeforeDeductions)}`,
    ];

    if (result.disabilityDeduction > 0) lines.push(`ניכוי נכות: -${formatCurrency(result.disabilityDeduction)}`);
    if (result.otherBenefitsDeduction > 0) lines.push(`ניכוי גמלאות: -${formatCurrency(result.otherBenefitsDeduction)}`);
    if (result.hospitalReduction > 0) lines.push(`הפחתת אשפוז: -${formatCurrency(result.hospitalReduction)}`);
    lines.push(`ביטוח בריאות: -${formatCurrency(result.healthInsuranceDeduction)}`);
    lines.push(`סה״כ ניכויים: -${formatCurrency(result.totalDeductions)}`);
    lines.push('');
    lines.push(`💰 סכום סופי לתשלום: ${formatCurrency(result.totalPayment)}`);
    lines.push('');
    lines.push('═══════════════════════════════════════════════════');
    lines.push('* המחשבון מיועד להערכה ראשונית בלבד ואינו מהווה אישור רשמי');

    navigator.clipboard.writeText(lines.join('\n'));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Threshold state={state} updateState={updateState} errors={errors} />;
      case 2: return <Step2Disability state={state} updateState={updateState} errors={errors} />;
      case 3: return <Step3Family state={state} updateState={updateState} errors={errors} />;
      case 4: return <Step4Employment state={state} updateState={updateState} errors={errors} />;
      case 5: return <Step5Incapacity state={state} updateState={updateState} errors={errors} />;
      case 6: return <Step6Hospitalization state={state} updateState={updateState} errors={errors} />;
      case 7: return <Step7OtherBenefits state={state} updateState={updateState} errors={errors} />;
      case 8: return result ? <Step8Result state={state} result={result} /> : null;
      default: return null;
    }
  };

  const stopped = isStopped();
  const canProceed = currentStep < 8 && !stopped;
  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === 8;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground print:bg-white print:text-foreground print:border-b-4 print:border-primary">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center print:bg-primary/10">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  מחשבון תט״ר לנפגע פעולות איבה
                </h1>
                <p className="text-sm text-primary-foreground/80 print:text-muted-foreground">
                  חישוב תגמול תלוי רווחה
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-primary-foreground/70 print:text-muted-foreground">
              <CalcIcon className="w-4 h-4" />
              <span>ביטוח לאומי</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-card rounded-xl shadow-lg p-6 sm:p-8 border border-border">
          <WizardProgress
            currentStep={currentStep}
            totalSteps={8}
            stepTitles={STEP_TITLES}
            stopped={stopped}
          />

          <main role="main" aria-live="polite">
            {renderStep()}
          </main>

          <div className="flex justify-between mt-8 pt-6 border-t border-border print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={!canGoBack}
              className="flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              הקודם
            </Button>

            <div className="flex gap-2 flex-wrap">
              {isLastStep && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">הדפסה</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">העתק ללוח</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    חישוב חדש
                  </Button>
                </>
              )}

              {canProceed && (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  הבא
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center mt-6 text-sm text-muted-foreground print:hidden">
          <p>המחשבון מיועד להערכה ראשונית בלבד ואינו מהווה אישור רשמי.</p>
          <p className="text-xs mt-1">הנתונים אינם נשמרים ואינם מועברים לשום גורם.</p>
        </footer>
      </div>
    </div>
  );
}
