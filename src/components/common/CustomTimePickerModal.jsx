import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import './custom-picker.css';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function CustomTimePickerModal({
  isOpen,
  onClose,
  value = '12:00',
  onSave,
  label = 'Select time'
}) {
  // Parse initial hour and minute
  const parsedTime = useMemo(() => {
    if (!value || !value.includes(':')) {
      return { hour: '12', minute: '00' };
    }
    const [h, m] = value.split(':');
    return {
      hour: String(h || '12').padStart(2, '0'),
      minute: String(m || '00').padStart(2, '0')
    };
  }, [value]);

  const [selectedHour, setSelectedHour] = useState(parsedTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsedTime.minute);
  const [searchTerm, setSearchTerm] = useState('');

  const containerRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);
  const activeHourRef = useRef(null);
  const activeMinuteRef = useRef(null);

  // Sync state when opened with a value
  useEffect(() => {
    if (isOpen) {
      setSelectedHour(parsedTime.hour);
      setSelectedMinute(parsedTime.minute);
      setSearchTerm('');
      setTimeout(() => {
        if (activeHourRef.current) {
          activeHourRef.current.scrollIntoView({ block: 'center' });
        }
        if (activeMinuteRef.current) {
          activeMinuteRef.current.scrollIntoView({ block: 'center' });
        }
      }, 50);
    }
  }, [isOpen, parsedTime.hour, parsedTime.minute]);

  // Handle outside click & Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle Search Input typing
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    const clean = val.trim();
    if (!clean) return;

    if (clean.includes(':')) {
      const parts = clean.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && h >= 0 && h <= 23) {
        setSelectedHour(String(h).padStart(2, '0'));
      }
      if (!isNaN(m) && m >= 0 && m <= 59) {
        setSelectedMinute(String(m).padStart(2, '0'));
      }
    } else {
      const num = parseInt(clean, 10);
      if (!isNaN(num) && num >= 0 && num <= 23) {
        setSelectedHour(String(num).padStart(2, '0'));
      }
    }
  };

  const handleDone = () => {
    const finalTime = `${selectedHour}:${selectedMinute}`;
    if (onSave) {
      onSave(finalTime);
    }
    onClose();
  };

  // Filtered Hours & Minutes based on search
  const filteredHours = useMemo(() => {
    if (!searchTerm.trim()) return HOURS;
    const term = searchTerm.trim().toLowerCase();
    if (term.includes(':')) {
      const hPart = term.split(':')[0];
      return HOURS.filter((h) => h.includes(hPart));
    }
    return HOURS.filter((h) => h.includes(term));
  }, [searchTerm]);

  const filteredMinutes = useMemo(() => {
    if (!searchTerm.trim()) return MINUTES;
    const term = searchTerm.trim().toLowerCase();
    if (term.includes(':')) {
      const mPart = term.split(':')[1];
      return MINUTES.filter((m) => m.includes(mPart));
    }
    return MINUTES;
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="custom-time-popover"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Header: "Select time" and big display "12 : 30" */}
      <div className="custom-time-header">
        <span className="custom-time-label">{label}</span>
        <div className="custom-time-display">
          <span className="custom-time-digits hour">{selectedHour}</span>
          <span className="custom-time-colon">:</span>
          <span className="custom-time-digits minute">{selectedMinute}</span>
        </div>
      </div>

      {/* 2. Search Box */}
      <div className="custom-time-search-wrap">
        <Search size={14} className="custom-time-search-icon" />
        <input
          type="text"
          className="custom-time-search-input"
          placeholder="Search time..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleDone();
            }
          }}
        />
      </div>

      {/* 3. Dual Column Scrollable Selector */}
      <div className="custom-time-columns-wrap">
        {/* Hours Column */}
        <div className="custom-time-col" ref={hourListRef}>
          {filteredHours.map((h) => {
            const isSelected = h === selectedHour;
            return (
              <div
                key={`h-${h}`}
                ref={isSelected ? activeHourRef : null}
                className={`custom-time-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedHour(h)}
              >
                {h}
              </div>
            );
          })}
        </div>

        {/* Center Divider Colon */}
        <div className="custom-time-center-sep">:</div>

        {/* Minutes Column */}
        <div className="custom-time-col" ref={minuteListRef}>
          {filteredMinutes.map((m) => {
            const isSelected = m === selectedMinute;
            return (
              <div
                key={`m-${m}`}
                ref={isSelected ? activeMinuteRef : null}
                className={`custom-time-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedMinute(m)}
              >
                {m}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="custom-time-actions">
        <button
          type="button"
          className="custom-time-btn-cancel"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="custom-time-btn-done"
          onClick={handleDone}
        >
          Done
        </button>
      </div>
    </div>
  );
}

