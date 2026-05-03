import { CalculatorState, CalculationResult, CONSTANTS, DISABILITY_DEDUCTIONS, BENEFIT_TYPE_LABELS, EMPLOYMENT_STATUS_LABELS, MARITAL_STATUS_LABELS, ABSENCE_SCOPE_LABELS } from '@/types/calculator';
import { formatCurrency } from '@/utils/calculations';
import { Calculator, Calendar, TrendingDown, TrendingUp, AlertCircle, Info, Banknote, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step8Props {
  state: CalculatorState;
  result: CalculationResult;
}

export function Step8Result({ state, result }: Step8Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">תוצאת החישוב</h2>

      {/* Main result card */}
      <Card className="result-card mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-success">
            <Banknote className="w-6 h-6" />
            סכום סופי לתשלום
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-foreground">{formatCurrency(result.totalPayment)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            עבור {result.daysOfDisability} ימי אי כושר
            {result.waitingDays > 0 && ` (לא כולל ${result.waitingDays} ימי המתנה)`}
          </p>
        </CardContent>
      </Card>

      {/* Warnings */}
      {result.cappedAtMax && (
        <div className="error-box flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">תקופה חורגת מהמקסימום</p>
            <p className="text-sm mt-1">
              התקופה המקורית ({result.rawDays} ימים) חורגת מהמקסימום של {CONSTANTS.MAX_DAYS_PER_EVENT} ימים.
              החישוב מבוסס על {result.daysOfDisability} ימים. להארכה יש לפנות לוועדה רפואית.
            </p>
          </div>
        </div>
      )}

      {result.waitingDays > 0 && (
        <div className="info-box flex items-start gap-3 mb-4">
          <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">תקופת המתנה</p>
            <p className="text-sm mt-1">
              {result.waitingDays} ימים ראשונים אינם משולמים (תקופת המתנה).
              אם תקופת אי הכושר עולה על 12 ימים, ימי ההמתנה משולמים רטרואקטיבית.
            </p>
          </div>
        </div>
      )}

      {/* Input summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5 text-primary" />
            סיכום נתונים שהוזנו
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 text-sm">
            <div className="calc-row">
              <span className="calc-label">גיל ביום האירוע</span>
              <span className="calc-value">{state.age}</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">מצב משפחתי</span>
              <span className="calc-value">{state.maritalStatus ? MARITAL_STATUS_LABELS[state.maritalStatus] : '—'}</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">מצב תעסוקה</span>
              <span className="calc-value">{state.employmentStatus ? EMPLOYMENT_STATUS_LABELS[state.employmentStatus] : '—'}</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">ילדים</span>
              <span className="calc-value">{state.hasChildren ? `${state.children.length} (גילאי: ${state.children.map(c => c.age).join(', ')})` : 'אין'}</span>
            </div>
            {state.recognizedDisability && state.disabilityPercent && (
              <div className="calc-row">
                <span className="calc-label">נכות מוכרת</span>
                <span className="calc-value">{state.disabilityPercent === 101 ? 'מעל 100%' : `${state.disabilityPercent}%`}</span>
              </div>
            )}
            <div className="calc-row">
              <span className="calc-label">היקף אי כושר</span>
              <span className="calc-value">{ABSENCE_SCOPE_LABELS[state.absenceScope]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Days */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-primary" />
              תקופת אי כושר
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="calc-row">
                <span className="calc-label">סה״כ ימים (גולמי)</span>
                <span className="calc-value">{result.rawDays} ימים</span>
              </div>
              {result.waitingDays > 0 && (
                <div className="calc-row">
                  <span className="calc-label">ימי המתנה</span>
                  <span className="calc-value text-destructive">-{result.waitingDays} ימים</span>
                </div>
              )}
              <div className="calc-row border-t-2 pt-2">
                <span className="calc-label font-medium">ימים לתשלום</span>
                <span className="calc-value text-primary">{result.daysOfDisability} ימים</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">היקף אי כושר</span>
                <span className="calc-value">{result.absenceFactor * 100}%</span>
              </div>
              {state.hospitalized && state.hospitalDays > 0 && (
                <div className="calc-row">
                  <span className="calc-label">ימי אשפוז</span>
                  <span className="calc-value">{state.hospitalDays} ימים</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="w-5 h-5 text-primary" />
              תעריפים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="calc-row">
                <span className="calc-label">תעריף בסיס יומי</span>
                <span className="calc-value">{formatCurrency(result.baseDailyRate)}</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">תעריף מינימום</span>
                <span className="calc-value">{formatCurrency(result.minDailyRate)}</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">תעריף מקסימום</span>
                <span className="calc-value">{formatCurrency(result.maxDailyRate)}</span>
              </div>
              <div className="calc-row border-t-2 pt-2">
                <span className="calc-label font-medium">תעריף יומי סופי</span>
                <span className="calc-value text-primary">{formatCurrency(result.dailyRate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Before deductions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-success" />
              לפני ניכויים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(result.paymentBeforeDeductions)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(result.dailyRate)} × {result.daysOfDisability} ימים
              {result.hospitalReductionApplied && ' (כולל הפחתת אשפוז)'}
            </p>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="w-5 h-5 text-destructive" />
              פירוט ניכויים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.disabilityDeduction > 0 && (
                <div className="calc-row">
                  <span className="calc-label">ניכוי נכות</span>
                  <span className="calc-value text-destructive">-{formatCurrency(result.disabilityDeduction)}</span>
                </div>
              )}
              {result.otherBenefitsDeduction > 0 && (
                <div className="calc-row">
                  <span className="calc-label">ניכוי גמלאות אחרות</span>
                  <span className="calc-value text-destructive">-{formatCurrency(result.otherBenefitsDeduction)}</span>
                </div>
              )}
              {result.hospitalReduction > 0 && (
                <div className="calc-row">
                  <span className="calc-label">הפחתת אשפוז</span>
                  <span className="calc-value text-destructive">-{formatCurrency(result.hospitalReduction)}</span>
                </div>
              )}
              <div className="calc-row">
                <span className="calc-label">ביטוח בריאות</span>
                <span className="calc-value text-destructive">-{formatCurrency(result.healthInsuranceDeduction)}</span>
              </div>
              <div className="calc-row border-t-2 pt-2">
                <span className="calc-label font-medium">סה״כ ניכויים</span>
                <span className="calc-value text-destructive font-bold">-{formatCurrency(result.totalDeductions)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic info messages */}
      <div className="mt-6 space-y-4">
        {result.hospitalReductionApplied && (
          <div className="info-box flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">הפחתת אשפוז הופעלה</p>
              <p className="text-sm mt-1">{result.hospitalReductionReason}</p>
              <p className="text-sm mt-1">
                14 ימי אשפוז ראשונים — ללא הפחתה. {result.hospitalApplicableDays} ימים נוספים — הפחתה של {result.hospitalReductionRate * 100}%.
              </p>
            </div>
          </div>
        )}

        {result.disabilityDeduction > 0 && state.disabilityPercent && (
          <div className="info-box flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">ניכוי נכות</p>
              <p className="text-sm mt-1">
                עבור {state.disabilityPercent === 101 ? 'מעל 100%' : `${state.disabilityPercent}%`} נכות,
                הניכוי החודשי הוא {formatCurrency(DISABILITY_DEDUCTIONS[state.disabilityPercent] || 0)}.
                לתקופה של {result.daysOfDisability} ימים: {formatCurrency(result.disabilityDeduction)}.
              </p>
            </div>
          </div>
        )}

        {result.otherBenefitsDeduction > 0 && state.otherBenefits.length > 0 && (
          <div className="info-box flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">ניכוי גמלאות אחרות</p>
              <ul className="text-sm mt-1 list-disc list-inside">
                {state.otherBenefits.map((benefit) => (
                  <li key={benefit.id}>
                    {BENEFIT_TYPE_LABELS[benefit.benefitType]}: {formatCurrency(benefit.benefitAmount)}{' '}
                    ({benefit.benefitFrequency === 'monthly' ? 'חודשי' : 'לתקופה'})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="info-box flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm">
            <strong>ביטוח בריאות:</strong> {formatCurrency(CONSTANTS.HEALTH_INSURANCE_MONTHLY)} לחודש
            (היתרה משולמת על ידי הביטוח הלאומי)
          </p>
        </div>

        {result.hasChildUnder21 && (
          <div className="info-box flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm">
              התעריף המינימלי גבוה יותר ({formatCurrency(CONSTANTS.MIN_DAILY_WITH_CHILD_UNDER_21)} ליום)
              בגלל ילד מתחת לגיל 21.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
