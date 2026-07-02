import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AdminSelect({ value, options, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const activeOption = options.find((option) => String(option.value) === String(value)) || options[0];

  useEffect(() => {
    function handlePointerDown(event) {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function chooseOption(nextValue) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className={`admin-select ${isOpen ? 'admin-select--open' : ''}`} ref={selectRef}>
      <button
        className="admin-select__trigger"
        type="button"
        data-no-scroll-top="true"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{activeOption?.label}</span>
        <ChevronDown size={18} />
      </button>

      {isOpen && (
        <div className="admin-select__menu" role="listbox">
          {options.map((option) => {
            const selected = String(option.value) === String(value);

            return (
              <button
                className={`admin-select__option ${selected ? 'admin-select__option--active' : ''}`}
                type="button"
                data-no-scroll-top="true"
                role="option"
                aria-selected={selected}
                key={option.value || 'all'}
                onClick={() => chooseOption(option.value)}
              >
                <span>{option.label}</span>
                {selected && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
