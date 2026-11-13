import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';
import './custom-picker.css';

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  disabled = false,
  allowCustom = true,
  placement = 'auto'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [computedPlacement, setComputedPlacement] = useState('bottom');

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const activeItemRef = useRef(null);

  // Normalize options to array of strings
  const cleanOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map((opt) => (typeof opt === 'object' && opt !== null ? opt.label || opt.value : String(opt)));
  }, [options]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return cleanOptions;
    const term = searchTerm.toLowerCase().trim();
    return cleanOptions.filter((opt) => opt.toLowerCase().includes(term));
  }, [cleanOptions, searchTerm]);

  // Check if current search term exactly matches an option
  const exactMatchExists = useMemo(() => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return cleanOptions.some((opt) => opt.toLowerCase() === term);
  }, [cleanOptions, searchTerm]);

  // Calculate top or bottom placement
  const calculatePlacement = () => {
    if (!containerRef.current) return;
    if (placement !== 'auto') {
      setComputedPlacement(placement);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 800;
    const popoverHeight = 260;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      setComputedPlacement('top');
    } else {
      setComputedPlacement('bottom');
    }
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      calculatePlacement();
      setSearchTerm('');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Focus search input on open & scroll to active item
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        if (activeItemRef.current) {
          activeItemRef.current.scrollIntoView({ block: 'nearest' });
        }
      }, 50);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (item) => {
    if (onChange) {
      onChange(item);
    }
    setIsOpen(false);
  };

  const handleCustomAdd = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    handleSelect(trimmed);
  };

  return (
    <div className="custom-picker-wrap" ref={containerRef}>
      {/* Trigger Button */}
      <div
        className={`custom-picker-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleOpen}
      >
        {value ? (
          <span className="custom-picker-value">{value}</span>
        ) : (
          <span className="custom-picker-placeholder">{placeholder}</span>
        )}
        {isOpen ? (
          <ChevronUp size={16} color="#64748b" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0 }} />
        )}
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`custom-country-popover placement-${computedPlacement}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Input */}
          <div className="custom-country-search-wrap">
            <Search size={15} className="custom-country-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="custom-country-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0]);
                  } else if (allowCustom && searchTerm.trim()) {
                    handleCustomAdd();
                  }
                }
              }}
            />
          </div>

          {/* List of Options */}
          <div className="custom-country-list">
            {/* Custom option prompt if typed something not in list */}
            {allowCustom && searchTerm.trim() && !exactMatchExists && (
              <div
                className="custom-country-item"
                style={{ color: '#2563eb', fontWeight: 700, backgroundColor: '#f0fdf4' }}
                onClick={handleCustomAdd}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} color="#2563eb" />
                  <span>Use "{searchTerm.trim()}"</span>
                </span>
              </div>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value && value.toLowerCase() === opt.toLowerCase();
                return (
                  <div
                    key={opt}
                    ref={isSelected ? activeItemRef : null}
                    className={`custom-country-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(opt)}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check size={14} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                );
              })
            ) : !allowCustom || !searchTerm.trim() ? (
              <div className="custom-country-empty">No options found</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

