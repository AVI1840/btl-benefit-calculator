// Calculator types - all values are numbers or null, never strings

export interface PersonData {
  age: number | null;
  monthlyBenefit: number | null;
}

export interface OptionData {
  id: string;
  name: string;
  baseAmount: number | null;
  additionalAmount: number | null;
  adjustmentFactor: number | null;
}

export interface CalculatorState {
  step: number;
  widowAge: number | null;
  deceasedAge: number | null;
  numberOfChildren: number | null;
  childrenAges: (number | null)[];
  options: OptionData[];
  showResults: boolean;
}

export interface CalculatorContextType {
  state: CalculatorState;
  updateWidowAge: (age: number | null) => void;
  updateDeceasedAge: (age: number | null) => void;
  updateNumberOfChildren: (count: number | null) => void;
  updateChildAge: (index: number, age: number | null) => void;
  updateOption: (optionId: string, field: keyof OptionData, value: number | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  showResults: () => void;
  resetAll: () => void;
  exportData: () => void;
}

// Calculate total for an option
export const calculateOptionTotal = (option: OptionData): number => {
  const base = option.baseAmount ?? 0;
  const additional = option.additionalAmount ?? 0;
  const factor = option.adjustmentFactor ?? 100;
  return Math.round((base + additional) * (factor / 100));
};

// Find the best option index (highest total)
export const findBestOptionIndex = (options: OptionData[]): number => {
  const totals = options.map(calculateOptionTotal);
  const maxTotal = Math.max(...totals);
  if (maxTotal === 0) return -1;
  return totals.indexOf(maxTotal);
};

// Initial options - all 4 benefit comparison options
export const INITIAL_OPTIONS: OptionData[] = [
  { id: 'option1', name: 'אופציה א׳', baseAmount: null, additionalAmount: null, adjustmentFactor: null },
  { id: 'option2', name: 'אופציה ב׳', baseAmount: null, additionalAmount: null, adjustmentFactor: null },
  { id: 'option3', name: 'אופציה ג׳', baseAmount: null, additionalAmount: null, adjustmentFactor: null },
  { id: 'option4', name: 'אופציה ד׳', baseAmount: null, additionalAmount: null, adjustmentFactor: null },
];

export const createInitialState = (): CalculatorState => ({
  step: 1,
  widowAge: null,
  deceasedAge: null,
  numberOfChildren: null,
  childrenAges: [],
  options: INITIAL_OPTIONS.map(opt => ({ ...opt })),
  showResults: false,
});
