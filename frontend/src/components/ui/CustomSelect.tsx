import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  searchable?: boolean;
  disabled?: boolean;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  ariaLabel,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  searchable,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value);
  const showSearch = searchable ?? options.length > 8;

  const filteredOptions =
    showSearch && searchTerm.trim()
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.trim().toLowerCase()),
        )
      : options;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && showSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showSearch]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (prev) setSearchTerm('');
      return !prev;
    });
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          isOpen ? 'border-violet-500 bg-white ring-2 ring-violet-500/20' : ''
        } ${buttonClassName}`}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-violet-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute left-0 z-50 mt-1.5 w-full min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ${menuClassName}`}
        >
          {showSearch && (
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar opción..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <ul className="max-h-60 overflow-y-auto overscroll-contain p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2.5 text-center text-xs text-slate-400">
                Sin coincidencias
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      title={`Seleccionar ${option.label}`}
                      onClick={() => handleSelect(option.value)}
                      className={`cursor-pointer flex w-full min-h-10 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-violet-50 font-semibold text-violet-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-violet-600" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
