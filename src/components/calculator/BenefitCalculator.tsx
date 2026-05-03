import React, { useState, useCallback } from 'react';
import StepIndicator from './StepIndicator';
import StepPersonalInfo from './StepPersonalInfo';
import StepChildrenInfo from './StepChildrenInfo';
import StepOptionsInput from './StepOptionsInput';
import ResultsView from './ResultsView';
import { createInitialState, type CalculatorState, type OptionData } from '@/types/calculator';

const STEP_LABELS = ['פרטים אישיים', 'ילדים', 'אופציות'];

/**
 * Main calculator component
 * - No localStorage, no persistence
 * - All values initialize as null
 * - Export is read-only (doesn't clear data)
 * - Only reset button or page refresh clears data
 */
const BenefitCalculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>(createInitialState);

  // Update functions - replace only, never concatenate
  const updateWidowAge = useCallback((age: number | null) => {
    setState(prev => ({ ...prev, widowAge: age }));
  }, []);

  const updateDeceasedAge = useCallback((age: number | null) => {
    setState(prev => ({ ...prev, deceasedAge: age }));
  }, []);

  const updateNumberOfChildren = useCallback((count: number | null) => {
    setState(prev => ({
      ...prev,
      numberOfChildren: count,
      childrenAges: count !== null ? Array(count).fill(null) : [],
    }));
  }, []);

  const updateChildAge = useCallback((index: number, age: number | null) => {
    setState(prev => {
      const newAges = [...prev.childrenAges];
      newAges[index] = age;
      return { ...prev, childrenAges: newAges };
    });
  }, []);

  const updateOption = useCallback((
    optionId: string,
    field: keyof OptionData,
    value: number | null
  ) => {
    setState(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      ),
    }));
  }, []);

  // Navigation
  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.min(prev.step + 1, 3) }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const showResults = useCallback(() => {
    setState(prev => ({ ...prev, showResults: true }));
  }, []);

  const goBackToEdit = useCallback(() => {
    setState(prev => ({ ...prev, showResults: false }));
  }, []);

  // Reset - complete clear, return to step 1
  const resetAll = useCallback(() => {
    setState(createInitialState());
  }, []);

  // Export - read-only, does NOT clear data
  const exportData = useCallback(() => {
    const exportObj = {
      exportDate: new Date().toISOString(),
      tool: 'מחשבון השוואת זכאויות — ביטוח לאומי',
      personalInfo: {
        widowAge: state.widowAge,
        deceasedAge: state.deceasedAge,
        numberOfChildren: state.numberOfChildren,
        childrenAges: state.childrenAges,
      },
      options: state.options.map(opt => ({
        name: opt.name,
        baseAmount: opt.baseAmount,
        additionalAmount: opt.additionalAmount,
        adjustmentFactor: opt.adjustmentFactor,
        total: Math.round(
          ((opt.baseAmount ?? 0) + (opt.additionalAmount ?? 0)) *
          ((opt.adjustmentFactor ?? 100) / 100)
        ),
      })),
    };

    const jsonString = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `benefit-comparison-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [state]);

  // Render results
  if (state.showResults) {
    return (
      <ResultsView
        state={state}
        onExport={exportData}
        onReset={resetAll}
        onGoBack={goBackToEdit}
      />
    );
  }

  return (
    <div>
      <StepIndicator
        currentStep={state.step}
        totalSteps={3}
        stepLabels={STEP_LABELS}
        onStepClick={goToStep}
      />

      {state.step === 1 && (
        <StepPersonalInfo
          widowAge={state.widowAge}
          deceasedAge={state.deceasedAge}
          onWidowAgeChange={updateWidowAge}
          onDeceasedAgeChange={updateDeceasedAge}
          onNext={nextStep}
        />
      )}

      {state.step === 2 && (
        <StepChildrenInfo
          numberOfChildren={state.numberOfChildren}
          childrenAges={state.childrenAges}
          onNumberOfChildrenChange={updateNumberOfChildren}
          onChildAgeChange={updateChildAge}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {state.step === 3 && (
        <StepOptionsInput
          options={state.options}
          onOptionChange={updateOption}
          onShowResults={showResults}
          onPrev={prevStep}
        />
      )}
    </div>
  );
};

export default BenefitCalculator;
