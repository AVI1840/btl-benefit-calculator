import React from 'react';
import { Download, RefreshCw, ArrowRight, Printer, FileText } from 'lucide-react';
import ComparisonTable from './ComparisonTable';
import type { CalculatorState } from '@/types/calculator';
import { calculateOptionTotal, findBestOptionIndex } from '@/types/calculator';

interface ResultsViewProps {
  state: CalculatorState;
  onExport: () => void;
  onReset: () => void;
  onGoBack: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  state,
  onExport,
  onReset,
  onGoBack,
}) => {
  const bestIndex = findBestOptionIndex(state.options);
  const bestOption = bestIndex >= 0 ? state.options[bestIndex] : null;
  const bestTotal = bestOption ? calculateOptionTotal(bestOption) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      '         מחשבון השוואת זכאויות — ביטוח לאומי',
      '═══════════════════════════════════════════════════',
      '',
      `תאריך: ${new Date().toLocaleDateString('he-IL')}`,
      '',
      '── פרטים אישיים ──',
      `גיל האלמן/ה: ${state.widowAge ?? '—'}`,
      `גיל המנוח/ה: ${state.deceasedAge ?? '—'}`,
      `מספר ילדים: ${state.numberOfChildren ?? '—'}`,
    ];

    if (state.numberOfChildren && state.numberOfChildren > 0) {
      const ages = state.childrenAges.filter(a => a !== null).join(', ');
      lines.push(`גילאי ילדים: ${ages}`);
    }

    lines.push('', '── השוואת אופציות ──', '');

    state.options.forEach((opt) => {
      const total = calculateOptionTotal(opt);
      if (opt.baseAmount === null && opt.additionalAmount === null) return;
      lines.push(`${opt.name}:`);
      lines.push(`  סכום בסיס: ${opt.baseAmount !== null ? opt.baseAmount.toLocaleString('he-IL') : '—'} ₪`);
      lines.push(`  תוספת: ${opt.additionalAmount !== null ? opt.additionalAmount.toLocaleString('he-IL') : '—'} ₪`);
      lines.push(`  מקדם התאמה: ${opt.adjustmentFactor ?? 100}%`);
      lines.push(`  סה״כ: ${total.toLocaleString('he-IL')} ₪`);
      lines.push('');
    });

    if (bestOption) {
      lines.push('── המלצה ──');
      lines.push(`האופציה המומלצת: ${bestOption.name} — ${bestTotal.toLocaleString('he-IL')} ₪`);
    }

    lines.push('', '═══════════════════════════════════════════════════');
    lines.push('* הנתונים מוצגים לצורכי השוואה בלבד');

    navigator.clipboard.writeText(lines.join('\n'));
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Results header card */}
      <div className="calculator-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">טבלת השוואה</h2>
            <p className="text-sm text-muted-foreground mt-1">
              סיכום כל האופציות שהוזנו עם חישוב סופי
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={onGoBack} className="btn-secondary flex items-center gap-2 text-sm">
              <ArrowRight className="w-4 h-4" />
              חזור לעריכה
            </button>
            
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm print:hidden">
              <Printer className="w-4 h-4" />
              הדפסה
            </button>

            <button onClick={handleExportText} className="btn-secondary flex items-center gap-2 text-sm print:hidden">
              <FileText className="w-4 h-4" />
              העתק ללוח
            </button>
            
            <button onClick={onExport} className="btn-export flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              ייצוא JSON
            </button>
            
            <button onClick={onReset} className="btn-reset flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              התחלה חדשה
            </button>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="calculator-card">
        <ComparisonTable
          options={state.options}
          widowAge={state.widowAge}
          deceasedAge={state.deceasedAge}
          numberOfChildren={state.numberOfChildren}
          childrenAges={state.childrenAges}
        />
      </div>

      {/* Disclaimer */}
      <div className="calculator-card bg-muted/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">הערה חשובה</p>
            <p className="text-sm text-muted-foreground">
              הנתונים מוצגים לצורכי השוואה בלבד ואינם מהווים אישור זכאות רשמי.
              כל האופציות מוצגות במקביל לצורך קבלת החלטה מושכלת.
              לאישור סופי יש לפנות לסניף ביטוח לאומי.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
