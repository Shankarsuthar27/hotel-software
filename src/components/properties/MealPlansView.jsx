import React, { useState, useEffect, useRef } from 'react';
import {
  UtensilsCrossed,
  Plus,
  MoreVertical,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AddMealPlanModal from './AddMealPlanModal';

export default function MealPlansView({
  mealPlans = [],
  triggerAddMealPlan = 0,
  onCreateMealPlan,
  onUpdateMealPlan,
  onDeleteMealPlan,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Sync external header trigger button
  const lastTriggerRef = useRef(triggerAddMealPlan);
  useEffect(() => {
    if (triggerAddMealPlan > 0 && triggerAddMealPlan !== lastTriggerRef.current) {
      setEditingPlan(null);
      setIsModalOpen(true);
    }
    lastTriggerRef.current = triggerAddMealPlan;
  }, [triggerAddMealPlan]);

  // Close action dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  // Auto close popover on window/container scroll or resize
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClose = () => setActiveMenuId(null);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenuId]);

  const handleToggleMenu = (e, planId, idx) => {
    e.stopPropagation();
    if (activeMenuId === planId) {
      setActiveMenuId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 92;
    const menuWidth = 142;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight + 20 || (mealPlans.length > 1 && idx === mealPlans.length - 1 && spaceBelow < 180);

    setMenuPos({
      top: openUpwards ? Math.max(10, rect.top - menuHeight - 4) : rect.bottom + 4,
      left: Math.max(10, rect.right - menuWidth)
    });
    setActiveMenuId(planId);
  };

  const normalizeInclusionTag = (tag) => {
    if (!tag) return '';
    return tag.trim().split(/[\s(]/)[0].toUpperCase();
  };

  const formatPricingType = (model) => {
    if (model === 'INCLUDED_IN_TARIFF') return 'INCLUDED IN TARIFF';
    if (model === 'PER_ROOM') return 'PER ROOM';
    return 'PER PERSON';
  };

  const formatRate = (rate) => {
    const num = Number(rate);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleEdit = (mp) => {
    setEditingPlan(mp);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (mp) => {
    if (onDeleteMealPlan) {
      onDeleteMealPlan(mp.id);
    }
    setActiveMenuId(null);
    if (showToast) {
      showToast(`Deleted meal plan "${mp.name}"`);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        minHeight: 'calc(100vh - 54px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {mealPlans.length === 0 ? (
        /* Empty State */
        <div className="properties-empty-state" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="properties-empty-icon-box">
            <UtensilsCrossed size={26} color="#64748B" />
          </div>
          <h2 className="properties-empty-title">No Meal Plans Found</h2>
          <p className="properties-empty-sub">
            Get started by creating a new meal plan for your property.
          </p>
          <button
            type="button"
            className="properties-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Create Meal Plan</span>
          </button>
        </div>
      ) : (
        /* Flush Edge-to-Edge Data Table (Matching OTAL PMS Specification) */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table
              className="properties-table"
              style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
            >
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ width: '20%', padding: '14px 16px 14px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Meal Plan
                  </th>
                  <th style={{ width: '13%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Short Code
                  </th>
                  <th style={{ width: '22%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Inclusions
                  </th>
                  <th style={{ width: '16%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Pricing Type
                  </th>
                  <th style={{ width: '11%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Adult Rate
                  </th>
                  <th style={{ width: '11%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Child Rate
                  </th>
                  <th style={{ width: '10%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Status
                  </th>
                  <th style={{ width: '7%', padding: '14px 24px 14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {mealPlans.map((mp, idx) => {
                  const inclusionsList =
                    mp.inclusions && mp.inclusions.length > 0
                      ? mp.inclusions
                      : mp.inclusionDetails && mp.inclusionDetails.length > 0
                      ? mp.inclusionDetails.map((d) => d.type)
                      : [];

                  return (
                    <tr key={mp.id || mp.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* 1. Meal Plan */}
                      <td style={{ padding: '15px 16px 15px 24px' }}>
                        <strong style={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                          {mp.name}
                        </strong>
                      </td>

                      {/* 2. Short Code */}
                      <td style={{ padding: '15px 16px' }}>
                        <span className="properties-code-pill">{mp.code}</span>
                      </td>

                      {/* 3. Inclusions (LUNCH, DINNER, BREAKFAST, SNACKS) */}
                      <td style={{ padding: '15px 16px' }}>
                        {inclusionsList.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '220px' }}>
                            {inclusionsList.map((inc, i) => {
                              const tag = normalizeInclusionTag(inc);
                              const colorClass = tag.toLowerCase();
                              return (
                                <span
                                  key={i}
                                  className={`properties-inclusion-pill ${colorClass}`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>Room Only</span>
                        )}
                      </td>

                      {/* 4. Pricing Type */}
                      <td style={{ padding: '15px 16px' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            color: '#334155',
                            fontWeight: 600,
                            letterSpacing: '0.3px'
                          }}
                        >
                          {formatPricingType(mp.pricingModel)}
                        </span>
                      </td>

                      {/* 5. Adult Rate */}
                      <td style={{ padding: '15px 16px' }}>
                        <span
                          style={{
                            color: '#0F172A',
                            fontWeight: 600,
                            fontSize: '13.5px'
                          }}
                        >
                          {formatRate(mp.adultPrice)}
                        </span>
                      </td>

                      {/* 6. Child Rate */}
                      <td style={{ padding: '15px 16px' }}>
                        <span
                          style={{
                            color: '#0F172A',
                            fontWeight: 600,
                            fontSize: '13.5px'
                          }}
                        >
                          {formatRate(mp.childPrice)}
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td style={{ padding: '15px 16px' }}>
                        <span className="properties-status-pill">
                          {mp.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                        </span>
                      </td>

                      {/* 8. Action (3-Dots + Popover Menu) */}
                      <td
                        className="properties-action-cell"
                        style={{ position: 'relative', textAlign: 'center', padding: '15px 24px 15px 16px' }}
                      >
                        <button
                          type="button"
                          className="properties-action-btn"
                          onClick={(e) => handleToggleMenu(e, mp.id, idx)}
                          title="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === mp.id && (
                          <div
                            className="properties-action-menu fixed-popover"
                            ref={menuRef}
                            style={{
                              position: 'fixed',
                              top: `${menuPos.top}px`,
                              left: `${menuPos.left}px`,
                              zIndex: 9999
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="properties-action-item"
                              onClick={() => handleEdit(mp)}
                            >
                              <SquarePen size={15} color="#334155" />
                              <span>Edit</span>
                            </button>
                            <div className="properties-action-divider" />
                            <button
                              type="button"
                              className="properties-action-item delete"
                              onClick={() => handleDelete(mp)}
                            >
                              <Trash2 size={15} color="#EF4444" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Matching Image 1 & 6) */}
          <div
            className="properties-pagination-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div className="properties-pagination-text" style={{ fontSize: '13px', color: '#64748B' }}>
              Showing{' '}
              <strong style={{ color: '#0F172A', fontWeight: 600 }}>
                {mealPlans.length > 0 ? `1–${mealPlans.length}` : '0–0'}
              </strong>{' '}
              of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{mealPlans.length}</strong> results
            </div>

            <div className="properties-pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="properties-page-btn"
                disabled
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="properties-page-btn active"
                title="Page 1"
              >
                1
              </button>
              <button
                type="button"
                className="properties-page-btn"
                disabled
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Meal Plan Modal Drawer */}
      <AddMealPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
        }}
        onCreateMealPlan={onCreateMealPlan}
        onUpdateMealPlan={onUpdateMealPlan}
        mealPlanToEdit={editingPlan}
        showToast={showToast}
      />
    </div>
  );
}
