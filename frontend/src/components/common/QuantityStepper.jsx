import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({
  value,
  onIncrease,
  onDecrease,
  max,
  label,
  increaseLabel,
  decreaseLabel,
}) {
  return (
    <div className="quantity-stepper" aria-label={label}>
      <button type="button" onClick={onDecrease} aria-label={decreaseLabel}>
        <Minus size={16} aria-hidden="true" />
      </button>
      <span>{value}</span>
      <button type="button" onClick={onIncrease} disabled={value >= max} aria-label={increaseLabel}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
