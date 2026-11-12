import React, { useState, useEffect, useRef } from 'react';
import { FileText, X, Utensils, ChevronDown, ChevronUp, Bed, Users } from 'lucide-react';

export default function AddRatePlanModal({
  isOpen,
  onClose,
  onCreateRatePlan,
  onUpdateRatePlan,
  ratePlanToEdit = null,
  mealPlans = [],
  roomTypes = [],
  showToast
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedMealPlanId, setSelectedMealPlanId] = useState(null);
  const [isMealDropdownOpen, setIsMealDropdownOpen] = useState(false);
  const [roomTypeRates, setRoomTypeRates] = useState({});
  const [error, setError] = useState('');

  const dropdownRef = useRef(null);

  // Close meal plan dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMealDropdownOpen(false);
      }
    }
    if (isMealDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMealDropdownOpen]);

  // Initialize or reset form state
  useEffect(() => {
    if (isOpen) {
      if (ratePlanToEdit) {
        setName(ratePlanToEdit.name || '');
        setCode(ratePlanToEdit.code || '');
        setSelectedMealPlanId(ratePlanToEdit.mealPlanId || null);

        // Prepopulate room rates from existing plan or fallback defaults
        const initialRates = {};
        roomTypes.forEach((rt) => {
          const existing =
            ratePlanToEdit.roomTypeRates?.[rt.id] ||
            (rt.id === 'rt_standard' ? ratePlanToEdit.roomTypeRates?.rt_normal : null) ||
            (rt.id === 'rt_normal' ? ratePlanToEdit.roomTypeRates?.rt_standard : null) ||
            (rt.id === 'rt_deluxe' ? ratePlanToEdit.roomTypeRates?.rt_delux : null) ||
            Object.entries(ratePlanToEdit.roomTypeRates || {}).find(([k]) => {
              const matched = roomTypes.find((t) => t.id === k);
              return (
                (matched && matched.name.toLowerCase() === rt.name.toLowerCase()) ||
                k.toLowerCase() === rt.name.toLowerCase()
              );
            })?.[1];

          if (existing) {
            initialRates[rt.id] = {
              active: existing.active !== undefined ? existing.active : false,
              basePrice: existing.basePrice ?? rt.basePrice ?? 0,
              extraAdult: existing.extraAdult ?? rt.extraAdultPrice ?? 0,
              extraChild: existing.extraChild ?? rt.extraChildPrice ?? 0
            };
          } else {
            initialRates[rt.id] = {
              active: false,
              basePrice: rt.basePrice ?? 0,
              extraAdult: rt.extraAdultPrice ?? 0,
              extraChild: rt.extraChildPrice ?? 0
            };
          }
        });
        setRoomTypeRates(initialRates);
        setError('');
      } else {
        setName('');
        setCode('');
        setSelectedMealPlanId(null);

        // Blank initial rates for all room types
        const initialRates = {};
        roomTypes.forEach((rt) => {
          initialRates[rt.id] = {
            active: false,
            basePrice: rt.basePrice ?? 0,
            extraAdult: rt.extraAdultPrice ?? 0,
            extraChild: rt.extraChildPrice ?? 0
          };
        });
        setRoomTypeRates(initialRates);
        setError('');
      }
      setIsMealDropdownOpen(false);
    }
  }, [isOpen, ratePlanToEdit, roomTypes]);

  if (!isOpen) return null;

  const handleToggleRoomActive = (roomTypeId) => {
    setRoomTypeRates((prev) => {
      const current = prev[roomTypeId] || { active: false, basePrice: 0, extraAdult: 0, extraChild: 0 };
      const nextActive = !current.active;
      const rt = roomTypes.find((t) => t.id === roomTypeId);
      return {
        ...prev,
        [roomTypeId]: {
          ...current,
          active: nextActive,
          basePrice: current.basePrice > 0 ? current.basePrice : (nextActive && rt?.basePrice ? rt.basePrice : current.basePrice),
          extraAdult: current.extraAdult > 0 ? current.extraAdult : (nextActive && rt?.extraAdultPrice ? rt.extraAdultPrice : current.extraAdult),
          extraChild: current.extraChild > 0 ? current.extraChild : (nextActive && rt?.extraChildPrice ? rt.extraChildPrice : current.extraChild)
        }
      };
    });
  };

  const handleRateFieldChange = (roomTypeId, field, value) => {
    const numVal = value === '' ? '' : Math.max(0, Number(value));
    setRoomTypeRates((prev) => ({
      ...prev,
      [roomTypeId]: {
        ...prev[roomTypeId],
        [field]: numVal
      }
    }));
  };

  const selectedMealPlan = mealPlans.find((m) => m.id === selectedMealPlanId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter rate plan name');
      return;
    }
    if (!code.trim()) {
      setError('Please enter rate plan code');
      return;
    }

    // Ensure mirrored keys for aliases (e.g. rt_standard <-> rt_normal)
    const finalRoomTypeRates = { ...roomTypeRates };
    if (finalRoomTypeRates.rt_standard && !finalRoomTypeRates.rt_normal) {
      finalRoomTypeRates.rt_normal = { ...finalRoomTypeRates.rt_standard };
    } else if (finalRoomTypeRates.rt_normal && !finalRoomTypeRates.rt_standard) {
      finalRoomTypeRates.rt_standard = { ...finalRoomTypeRates.rt_normal };
    }

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      mealPlanId: selectedMealPlanId || null,
      mealPlanName: selectedMealPlan ? selectedMealPlan.name : '-',
      status: 'ACTIVE',
      roomTypeRates: finalRoomTypeRates
    };

    if (ratePlanToEdit) {
      const targetPlanId = ratePlanToEdit.id || ratePlanToEdit.code;
      if (onUpdateRatePlan) {
        onUpdateRatePlan(targetPlanId, payload);
      }
      if (showToast) {
        showToast('Success: Rate plan updated successfully');
      }
    } else {
      if (onCreateRatePlan) {
        onCreateRatePlan(payload);
      }
      if (showToast) {
        showToast('Success: Rate plan created successfully');
      }
    }

    onClose();
  };

  return (
    <div className="meal-plan-drawer-overlay" onClick={onClose}>
      <div
        className="meal-plan-drawer-container"
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 1. Header (Matching Images 2, 3 & 4) */}
        <div className="meal-plan-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="meal-plan-drawer-icon-badge">
              <FileText size={18} color="#2563EB" />
            </div>
            <h3 className="meal-plan-drawer-title">
              {ratePlanToEdit ? 'Edit Rate Plan' : 'Add Rate Plan'}
            </h3>
          </div>
          <button
            type="button"
            className="meal-plan-drawer-close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Scrollable Body Form (Matching Images 2, 3 & 4) */}
        <form onSubmit={handleSubmit} className="meal-plan-drawer-form">
          <div className="meal-plan-drawer-body">
            {error && (
              <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                {error}
              </div>
            )}

            {/* Row 1: Name * and Code * (2 Columns) */}
            <div className="meal-plan-drawer-row-2col">
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="e.g. Summer Special 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Code <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="Enter Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Meal Plan Dropdown (Matching Image 4) */}
            <div className="meal-plan-drawer-field" ref={dropdownRef} style={{ position: 'relative' }}>
              <label className="meal-plan-drawer-label">Meal Plan</label>
              <div
                onClick={() => setIsMealDropdownOpen(!isMealDropdownOpen)}
                style={{
                  height: '42px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0 14px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Utensils size={15} color="#64748B" />
                  <span
                    style={{
                      fontSize: '13.5px',
                      color: selectedMealPlan ? '#0F172A' : '#94A3B8'
                    }}
                  >
                    {selectedMealPlan ? selectedMealPlan.name : 'Select Meal Plan'}
                  </span>
                </div>
                {isMealDropdownOpen ? (
                  <ChevronUp size={16} color="#64748B" />
                ) : (
                  <ChevronDown size={16} color="#64748B" />
                )}
              </div>

              {/* Dropdown Options Menu (Matching Image 4) */}
              {isMealDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
                    zIndex: 50,
                    overflow: 'hidden',
                    padding: '6px 0'
                  }}
                >
                  <div
                    onClick={() => {
                      setSelectedMealPlanId(null);
                      setIsMealDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13.5px',
                      fontWeight: selectedMealPlanId === null ? 600 : 500,
                      color: selectedMealPlanId === null ? '#2563EB' : '#0F172A',
                      backgroundColor: selectedMealPlanId === null ? '#EFF6FF' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMealPlanId !== null) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMealPlanId !== null) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    No Meal Plan
                  </div>

                  {mealPlans.map((mp) => {
                    const isSelected = selectedMealPlanId === mp.id;
                    return (
                      <div
                        key={mp.id || mp.code}
                        onClick={() => {
                          setSelectedMealPlanId(mp.id);
                          setIsMealDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          fontSize: '13.5px',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#2563EB' : '#0F172A',
                          backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {mp.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Row Type Rates Header Section (Matching Images 2, 3 & 4) */}
            <div style={{ marginTop: '10px', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Room Type Rates</span>
                <span style={{ color: '#EF4444' }}>*</span>
              </div>
              <p style={{ margin: '4px 0 14px 0', fontSize: '12.5px', color: '#64748B' }}>
                Set base prices and additional charges for each room type.
              </p>
            </div>

            {/* Room Type Cards (Matching Images 2, 3 & 4) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {roomTypes.map((rt) => {
                const rates = roomTypeRates[rt.id] || {
                  active: false,
                  basePrice: 0,
                  extraAdult: 0,
                  extraChild: 0
                };
                const isActive = !!rates.active;

                return (
                  <div
                    key={rt.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    {/* Room Type Card Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Bed size={18} color="#64748B" />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                            {rt.name}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '2px'
                            }}
                          >
                            <Users size={12} color="#64748B" />
                            <span>
                              Max {rt.maxAdults || 2} Adults, {rt.maxChildren || 2} Children
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active / Inactive Toggle Switch */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div
                          onClick={() => handleToggleRoomActive(rt.id)}
                          style={{
                            width: '40px',
                            height: '22px',
                            borderRadius: '9999px',
                            backgroundColor: isActive ? '#2563EB' : '#94A3B8',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          title={isActive ? 'Deactivate room rate' : 'Activate room rate'}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#FFFFFF',
                              position: 'absolute',
                              top: '3px',
                              left: isActive ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Room Type Inputs Row (3 Columns) */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '6px'
                          }}
                        >
                          Base Room Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          style={{
                            width: '100%',
                            height: '38px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '13.5px',
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                          }}
                          value={rates.basePrice ?? 0}
                          onChange={(e) => handleRateFieldChange(rt.id, 'basePrice', e.target.value)}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '6px'
                          }}
                        >
                          Extra Adult Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          style={{
                            width: '100%',
                            height: '38px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '13.5px',
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                          }}
                          value={rates.extraAdult ?? 0}
                          onChange={(e) => handleRateFieldChange(rt.id, 'extraAdult', e.target.value)}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#475569',
                            marginBottom: '6px'
                          }}
                        >
                          Extra Child Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          style={{
                            width: '100%',
                            height: '38px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '13.5px',
                            color: '#0F172A',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box'
                          }}
                          value={rates.extraChild ?? 0}
                          onChange={(e) => handleRateFieldChange(rt.id, 'extraChild', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Footer Actions (Matching Images 2, 3 & 4) */}
          <div className="meal-plan-drawer-footer">
            <button
              type="button"
              className="meal-plan-drawer-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="meal-plan-drawer-btn-create"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

