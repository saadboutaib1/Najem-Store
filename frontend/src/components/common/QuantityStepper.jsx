import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({
  value,
  onIncrease,
  onDecrease,
  min = 1,
  max,
  label,
  increaseLabel,
  decreaseLabel,
}) {
  const isDecreaseDisabled = value <= min;
  const isIncreaseDisabled = Number.isFinite(Number(max)) && value >= max;

  return (
    <div className="quantity-stepper" aria-label={label}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={isDecreaseDisabled}
        aria-label={decreaseLabel}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <span>{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={isIncreaseDisabled}
        aria-label={increaseLabel}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
