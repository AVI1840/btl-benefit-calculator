import { CalculatorState, CalculationResult, CONSTANTS, DISABILITY_DEDUCTIONS, BENEFIT_TYPE_LABELS } from '@/types/calculator';
import { formatCurrency, formatNumber } from '@/utils/calculations';
import { Calculator, Calendar, TrendingDown, TrendingUp, AlertCircle, Info, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step8Props {
  state: CalculatorState;
  result: CalculationResult;
}

export function Step8Result({ state, result }: Step8Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6">תוצאת החישוב</h2>

      {/* כרטיס סיכום ראשי */}
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
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* ימי אי כושר */}
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
                <span className="calc-label">ימי אי כושר</span>
                <span className="calc-value">{result.daysOfDisability} ימים</span>
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

        {/* תעריף יומי */}
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

        {/* סכום לפני ניכויים */}
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

        {/* ניכויים */}
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

      {/* הודעות דינמיות */}
      <div className="mt-6 space-y-4">
        {result.hospitalReductionApplied && (
          <div className="info-box flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">הפחתת אשפוז הופעלה</p>
              <p className="text-sm mt-1">{result.hospitalReductionReason}</p>
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
                הניכוי החודשי הוא {formatCurrency(DISABILITY_DEDUCTIONS[state.disabilityPercent])}.
                לתקופה של {result.daysOfDisability} ימים, הניכוי הוא {formatCurrency(result.disabilityDeduction)}.
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
