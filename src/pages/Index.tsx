import BenefitCalculator from '@/components/calculator/BenefitCalculator';
import { Calculator, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Government-style header */}
      <header className="bg-primary text-primary-foreground print:bg-white print:text-foreground">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center print:bg-primary/10">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">
                  מחשבון השוואת זכאויות
                </h1>
                <p className="text-sm text-primary-foreground/80 print:text-muted-foreground">
                  כלי תמיכה בהחלטה להשוואת אופציות קצבה
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-primary-foreground/70 print:text-muted-foreground">
              <Calculator className="w-4 h-4" />
              <span>ביטוח לאומי</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <BenefitCalculator />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>מחשבון דטרמיניסטי להשוואת נתונים • ללא שמירת נתונים בין הפעלות</p>
            <p className="text-xs">הנתונים אינם מהווים אישור זכאות רשמי</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
