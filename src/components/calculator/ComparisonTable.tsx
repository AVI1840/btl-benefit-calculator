import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import type { OptionData } from '@/types/calculator';
import { calculateOptionTotal, findBestOptionIndex } from '@/types/calculator';

interface ComparisonTableProps {
  options: OptionData[];
  widowAge: number | null;
  deceasedAge: number | null;
  numberOfChildren: number | null;
  childrenAges: (number | null)[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  options,
  widowAge,
  deceasedAge,
  numberOfChildren,
  childrenAges,
}) => {
  const totals = options.map(calculateOptionTotal);
  const bestIndex = findBestOptionIndex(options);
  const hasAnyData = totals.some(t => t > 0);

  return (
    <div>
      {/* Summary cards - visible on all screens */}
      {hasAnyData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {options.map((option, index) => {
            const isBest = index === bestIndex;
            const total = totals[index];
            if (total === 0 && !option.baseAmount && !option.additionalAmount) return (
              <div key={option.id} className="rounded-lg border border-dashed border-border p-4 text-center opacity-50">
                <p className="text-sm text-muted-foreground">{option.name}</p>
                <p className="text-lg font-semibold text-muted-foreground mt-1">—</p>
              </div>
            );
            return (
              <div
                key={option.id}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  isBest
                    ? 'border-success bg-success/5 shadow-md ring-1 ring-success/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {isBest && <Trophy className="w-4 h-4 text-success" />}
                  <p className={`text-sm font-medium ${isBest ? 'text-success' : 'text-muted-foreground'}`}>
                    {option.name}
                  </p>
                </div>
                <p className={`text-xl font-bold ${isBest ? 'text-success' : 'text-foreground'}`}>
                  {total.toLocaleString('he-IL')} ₪
                </p>
                {isBest && (
                  <span className="inline-flex items-center gap-1 text-xs text-success font-medium mt-1">
                    <TrendingUp className="w-3 h-3" />
                    מומלצת
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto print-table">
        <table className="w-full border-collapse" role="table" aria-label="טבלת השוואת אופציות">
          <thead>
            <tr>
              <th className="table-header-cell rounded-tr-lg">פרמטר</th>
              {options.map((option, index) => (
                <th
                  key={option.id}
                  className={`table-header-cell ${
                    index === options.length - 1 ? 'rounded-tl-lg' : ''
                  } ${index === bestIndex && hasAnyData ? 'bg-success/90' : ''}`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {index === bestIndex && hasAnyData && <Trophy className="w-4 h-4" />}
                    {option.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Personal info rows */}
            <tr className="table-row-odd">
              <td className="p-3 font-medium border-b border-border">גיל האלמן/ה</td>
              {options.map((_, i) => (
                <td key={i} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                  {widowAge ?? '—'}
                </td>
              ))}
            </tr>
            
            <tr className="table-row-even">
              <td className="p-3 font-medium border-b border-border">גיל המנוח/ה</td>
              {options.map((_, i) => (
                <td key={i} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                  {deceasedAge ?? '—'}
                </td>
              ))}
            </tr>
            
            <tr className="table-row-odd">
              <td className="p-3 font-medium border-b border-border">מספר ילדים</td>
              {options.map((_, i) => (
                <td key={i} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                  {numberOfChildren ?? '—'}
                </td>
              ))}
            </tr>

            {/* Children ages row - only if there are children */}
            {numberOfChildren !== null && numberOfChildren > 0 && (
              <tr className="table-row-even">
                <td className="p-3 font-medium border-b border-border">גילאי ילדים</td>
                {options.map((_, i) => (
                  <td key={i} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                    {childrenAges.filter(a => a !== null).join(', ') || '—'}
                  </td>
                ))}
              </tr>
            )}

            {/* Option values */}
            <tr className={numberOfChildren && numberOfChildren > 0 ? 'table-row-odd' : 'table-row-even'}>
              <td className="p-3 font-medium border-b border-border">סכום בסיס (₪)</td>
              {options.map((option, i) => (
                <td key={option.id} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                  {option.baseAmount !== null ? option.baseAmount.toLocaleString('he-IL') : '—'}
                </td>
              ))}
            </tr>
            
            <tr className={numberOfChildren && numberOfChildren > 0 ? 'table-row-even' : 'table-row-odd'}>
              <td className="p-3 font-medium border-b border-border">תוספת (₪)</td>
              {options.map((option, i) => (
                <td key={option.id} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                  {option.additionalAmount !== null ? option.additionalAmount.toLocaleString('he-IL') : '—'}
                </td>
              ))}
            </tr>
            
            <tr className={numberOfChildren && numberOfChildren > 0 ? 'table-row-odd' : 'table-row-even'}>
              <td className="p-3 font-medium border-b border-border">מקדם התאמה (%)</td>
              {options.map((option, i) => (
                <td key={option.id} className={`p-3 text-center border-b border-border ${i === bestIndex && hasAnyData ? 'bg-success/5' : ''}`}>
                  {option.adjustmentFactor !== null ? `${option.adjustmentFactor}%` : '100%'}
                </td>
              ))}
            </tr>

            {/* Total row */}
            <tr className="table-total-row">
              <td className="p-3 font-bold border-t-2 border-primary rounded-br-lg">סה״כ (₪)</td>
              {options.map((option, index) => (
                <td
                  key={option.id}
                  className={`p-3 text-center font-bold border-t-2 border-primary text-lg ${
                    index === options.length - 1 ? 'rounded-bl-lg' : ''
                  } ${index === bestIndex && hasAnyData ? 'text-success bg-success/10' : ''}`}
                >
                  {totals[index].toLocaleString('he-IL')}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {options.map((option, index) => {
          const total = totals[index];
          const isBest = index === bestIndex && hasAnyData;
          const hasData = option.baseAmount !== null || option.additionalAmount !== null;
          
          if (!hasData) return null;

          return (
            <div
              key={option.id}
              className={`rounded-lg border-2 p-4 ${
                isBest
                  ? 'border-success bg-success/5 shadow-md'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isBest && <Trophy className="w-5 h-5 text-success" />}
                  <h3 className={`font-semibold text-lg ${isBest ? 'text-success' : 'text-primary'}`}>
                    {option.name}
                  </h3>
                </div>
                {isBest && (
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                    מומלצת
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">סכום בסיס</span>
                  <span className="font-medium">{option.baseAmount !== null ? `${option.baseAmount.toLocaleString('he-IL')} ₪` : '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">תוספת</span>
                  <span className="font-medium">{option.additionalAmount !== null ? `${option.additionalAmount.toLocaleString('he-IL')} ₪` : '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">מקדם התאמה</span>
                  <span className="font-medium">{option.adjustmentFactor !== null ? `${option.adjustmentFactor}%` : '100%'}</span>
                </div>
                <div className={`flex justify-between py-2 mt-1 rounded-md px-2 ${isBest ? 'bg-success/10' : 'bg-muted'}`}>
                  <span className="font-bold">סה״כ</span>
                  <span className={`font-bold text-lg ${isBest ? 'text-success' : 'text-foreground'}`}>
                    {total.toLocaleString('he-IL')} ₪
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonTable;
