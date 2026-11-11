import React, { useState, useEffect } from 'react';
import { Utensils, X, Coffee, Soup, Cookie, CheckCircle2, Clock } from 'lucide-react';

export default function AddMealPlanModal({
  isOpen,
  onClose,
  onCreateMealPlan,
  onUpdateMealPlan,
  mealPlanToEdit = null,
  showToast
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [inclusions, setInclusions] = useState([]);
  const [timings, setTimings] = useState({
    Breakfast: { from: '7:30 AM', to: '10:30 AM' },
    Lunch: { from: '12:30 PM', to: '3:30 PM' },
    Dinner: { from: '7:30 PM', to: '10:30 PM' },
    Snacks: { from: '4:00 PM', to: '5:00 PM' }
  });
  const [pricingModel, setPricingModel] = useState('PER_PERSON'); // 'PER_PERSON' | 'PER_ROOM' | 'INCLUDED_IN_TARIFF'
  const [adultPrice, setAdultPrice] = useState('0.00');
  const [childPrice, setChildPrice] = useState('0.00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (mealPlanToEdit) {
        setName(mealPlanToEdit.name || '');
        setCode(mealPlanToEdit.code || '');

        const incList = [];
        const nextTimings = {
          Breakfast: { from: '7:30 AM', to: '10:30 AM' },
          Lunch: { from: '12:30 PM', to: '3:30 PM' },
          Dinner: { from: '7:30 PM', to: '10:30 PM' },
          Snacks: { from: '4:00 PM', to: '5:00 PM' }
        };

        if (mealPlanToEdit.inclusionDetails && Array.isArray(mealPlanToEdit.inclusionDetails)) {
          mealPlanToEdit.inclusionDetails.forEach((d) => {
            const raw = d.type || '';
            const cap = raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : '';
            if (cap) {
              if (!incList.includes(cap)) incList.push(cap);
              if (d.from || d.to) {
                nextTimings[cap] = {
                  from: d.from || nextTimings[cap]?.from || '',
                  to: d.to || nextTimings[cap]?.to || ''
                };
              }
            }
          });
        } else if (mealPlanToEdit.inclusions && Array.isArray(mealPlanToEdit.inclusions)) {
          mealPlanToEdit.inclusions.forEach((str) => {
            const match = str.match(/^([A-Za-z]+)(?:\s*\((.*?)\s*-\s*(.*?)\))?/);
            if (match) {
              const cap = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
              if (!incList.includes(cap)) incList.push(cap);
              if (match[2] && match[3]) {
                nextTimings[cap] = { from: match[2].trim(), to: match[3].trim() };
              }
            }
          });
        }

        setInclusions(incList);
        setTimings(nextTimings);
        setPricingModel(mealPlanToEdit.pricingModel || 'PER_PERSON');
        setAdultPrice(
          mealPlanToEdit.adultPrice !== undefined
            ? Number(mealPlanToEdit.adultPrice).toFixed(2)
            : '0.00'
        );
        setChildPrice(
          mealPlanToEdit.childPrice !== undefined
            ? Number(mealPlanToEdit.childPrice).toFixed(2)
            : '0.00'
        );
        setError('');
      } else {
        setName('');
        setCode('');
        setInclusions([]);
        setTimings({
          Breakfast: { from: '7:30 AM', to: '10:30 AM' },
          Lunch: { from: '12:30 PM', to: '3:30 PM' },
          Dinner: { from: '7:30 PM', to: '10:30 PM' },
          Snacks: { from: '4:00 PM', to: '5:00 PM' }
        });
        setPricingModel('PER_PERSON');
        setAdultPrice('0.00');
        setChildPrice('0.00');
        setError('');
      }
    }
  }, [isOpen, mealPlanToEdit]);

  if (!isOpen) return null;

  const inclusionDefs = {
    Breakfast: {
      id: 'Breakfast',
      label: 'Breakfast',
      icon: Coffee,
      iconColor: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    Lunch: {
      id: 'Lunch',
      label: 'Lunch',
      icon: Utensils,
      iconColor: '#10B981',
      bgColor: '#D1FAE5'
    },
    Dinner: {
      id: 'Dinner',
      label: 'Dinner',
      icon: Soup,
      iconColor: '#8B5CF6',
      bgColor: '#EDE9FE'
    },
    Snacks: {
      id: 'Snacks',
      label: 'Snacks',
      icon: Cookie,
      iconColor: '#F97316',
      bgColor: '#FFEDD5'
    }
  };

  const pricingModels = [
    {
      id: 'PER_PERSON',
      title: 'Per Person',
      subtitle: 'Charge per guest individually'
    },
    {
      id: 'PER_ROOM',
      title: 'Per Room',
      subtitle: 'Flat rate per room'
    },
    {
      id: 'INCLUDED_IN_TARIFF',
      title: 'Included in Tariff',
      subtitle: 'Included in room tariff'
    }
  ];

  const toggleInclusion = (id) => {
    if (inclusions.includes(id)) {
      setInclusions(inclusions.filter((item) => item !== id));
    } else {
      setInclusions([...inclusions, id]);
    }
  };

  const updateTiming = (mealId, field, value) => {
    setTimings((prev) => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a meal plan name');
      return;
    }
    if (!code.trim()) {
      setError('Please enter a meal plan code');
      return;
    }

    // Format inclusions with selected timings, e.g. "Breakfast (07:30 AM - 10:30 AM)"
    const formattedInclusions = inclusions.map((inc) => {
      const t = timings[inc];
      if (t?.from && t?.to) {
        return `${inc} (${t.from} - ${t.to})`;
      }
      return inc;
    });

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      inclusions: formattedInclusions,
      inclusionDetails: inclusions.map((inc) => ({
        type: inc,
        from: timings[inc]?.from || '',
        to: timings[inc]?.to || ''
      })),
      pricingModel,
      adultPrice: pricingModel === 'INCLUDED_IN_TARIFF' ? 0 : parseFloat(adultPrice) || 0,
      childPrice: pricingModel === 'INCLUDED_IN_TARIFF' ? 0 : parseFloat(childPrice) || 0,
      status: 'ACTIVE'
    };

    if (mealPlanToEdit) {
      if (onUpdateMealPlan) {
        onUpdateMealPlan(mealPlanToEdit.id, payload);
      }
      if (showToast) {
        showToast('Success: Meal plan updated successfully');
      }
    } else {
      if (onCreateMealPlan) {
        onCreateMealPlan(payload);
      }
      if (showToast) {
        showToast('Success: Meal plan created successfully');
      }
    }

    // Reset and close
    setName('');
    setCode('');
    setInclusions([]);
    setPricingModel('PER_PERSON');
    setAdultPrice('0.00');
    setChildPrice('0.00');
    setError('');
    onClose();
  };

  const isBreakfastSelected = inclusions.includes('Breakfast');
  const isLunchSelected = inclusions.includes('Lunch');
  const isDinnerSelected = inclusions.includes('Dinner');
  const isSnacksSelected = inclusions.includes('Snacks');

  const renderInclusionCard = (id) => {
    const opt = inclusionDefs[id];
    const isSelected = inclusions.includes(id);
    const Icon = opt.icon;

    return (
      <div
        className={`meal-inclusion-card ${isSelected ? 'selected' : ''}`}
        onClick={() => toggleInclusion(id)}
      >
        <div
          className="meal-inclusion-icon-box"
          style={{ backgroundColor: opt.bgColor }}
        >
          <Icon size={18} color={opt.iconColor} />
        </div>
        <span className="meal-inclusion-name">{opt.label}</span>
        {isSelected && (
          <CheckCircle2 size={18} color="#2563EB" className="meal-inclusion-check" />
        )}
      </div>
    );
  };

  const renderTimingPair = (mealId) => {
    return (
      <div className="meal-timing-pair">
        <div className="meal-timing-col">
          <label className="meal-timing-label">From</label>
          <div className="meal-timing-input-wrap">
            <input
              type="text"
              className="meal-timing-input"
              value={timings[mealId]?.from || ''}
              onChange={(e) => updateTiming(mealId, 'from', e.target.value)}
            />
            <Clock size={15} className="meal-timing-clock-icon" />
          </div>
        </div>
        <div className="meal-timing-col">
          <label className="meal-timing-label">To</label>
          <div className="meal-timing-input-wrap">
            <input
              type="text"
              className="meal-timing-input"
              value={timings[mealId]?.to || ''}
              onChange={(e) => updateTiming(mealId, 'to', e.target.value)}
            />
            <Clock size={15} className="meal-timing-clock-icon" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="meal-plan-drawer-overlay" onClick={onClose}>
      <div
        className="meal-plan-drawer-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header (Matches Images 1, 2, 3) */}
        <div className="meal-plan-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="meal-plan-drawer-icon-badge">
              <Utensils size={18} color="#2563EB" />
            </div>
            <h3 className="meal-plan-drawer-title">
              {mealPlanToEdit ? 'Edit Meal Plan' : 'Add Meal Plan'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="meal-plan-drawer-form">
          <div className="meal-plan-drawer-body">
            {error && (
              <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* 1. Name & Code (2 Columns) */}
            <div className="meal-plan-drawer-row-2col">
              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="Enter Meal Plan Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="meal-plan-drawer-field">
                <label className="meal-plan-drawer-label">
                  Code <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meal-plan-drawer-input"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 2. Meal Inclusions with Dynamic Timing Rows (Matches Images 1, 2, 3) */}
            <div className="meal-plan-drawer-field">
              <label className="meal-plan-drawer-label">
                Meal Inclusions <span style={{ color: '#EF4444' }}>*</span>
              </label>

              <div className="meal-inclusions-grid">
                {/* Row 1 Cards: Breakfast & Lunch */}
                <div className="meal-inclusions-row">
                  {renderInclusionCard('Breakfast')}
                  {renderInclusionCard('Lunch')}
                </div>

                {/* Row 1 Timings (Rendered if Breakfast or Lunch is selected) */}
                {(isBreakfastSelected || isLunchSelected) && (
                  <div className="meal-inclusions-timings-row">
                    <div>{isBreakfastSelected && renderTimingPair('Breakfast')}</div>
                    <div>{isLunchSelected && renderTimingPair('Lunch')}</div>
                  </div>
                )}

                {/* Row 2 Cards: Dinner & Snacks */}
                <div className="meal-inclusions-row">
                  {renderInclusionCard('Dinner')}
                  {renderInclusionCard('Snacks')}
                </div>

                {/* Row 2 Timings (Rendered if Dinner or Snacks is selected) */}
                {(isDinnerSelected || isSnacksSelected) && (
                  <div className="meal-inclusions-timings-row">
                    <div>{isDinnerSelected && renderTimingPair('Dinner')}</div>
                    <div>{isSnacksSelected && renderTimingPair('Snacks')}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Pricing Model (3 Radio Cards) */}
            <div className="meal-plan-drawer-field">
              <label className="meal-plan-drawer-label">
                Pricing Model <span style={{ color: '#EF4444' }}>*</span>
              </label>

              <div className="pricing-models-list">
                {pricingModels.map((pm) => {
                  const isSelected = pricingModel === pm.id;
                  return (
                    <div
                      key={pm.id}
                      className={`pricing-model-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setPricingModel(pm.id)}
                    >
                      <div className="pricing-model-left">
                        <span className="pricing-model-title">{pm.title}</span>
                        <span className="pricing-model-sub">{pm.subtitle}</span>
                      </div>
                      <div className="pricing-model-radio">
                        {isSelected && <div className="pricing-model-radio-dot" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Conditional Price per Adult & Child */}
            {pricingModel !== 'INCLUDED_IN_TARIFF' && (
              <div className="meal-plan-drawer-row-2col">
                <div className="meal-plan-drawer-field">
                  <label className="meal-plan-drawer-label">
                    Price per Adult <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="meal-plan-drawer-input"
                    value={adultPrice}
                    onChange={(e) => setAdultPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="meal-plan-drawer-field">
                  <label className="meal-plan-drawer-label">
                    Price per Child <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="meal-plan-drawer-input"
                    value={childPrice}
                    onChange={(e) => setChildPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer (Matches Images 1, 2, 3) */}
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
              {mealPlanToEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
