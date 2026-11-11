import React, { useState, useEffect, useRef } from 'react';
import {
  Tag,
  Plus,
  MoreVertical,
  SquarePen,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AddRatePlanModal from './AddRatePlanModal';

export default function RatePlansView({
  ratePlans = [],
  mealPlans = [],
  roomTypes = [],
  triggerAddRatePlan = 0,
  onCreateRatePlan,
  onUpdateRatePlan,
  onDeleteRatePlan,
  showToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Sync external header trigger button (+ Create Rate Plan in Top Nav)
  const lastTriggerRef = useRef(triggerAddRatePlan);
  useEffect(() => {
    if (triggerAddRatePlan > 0 && triggerAddRatePlan !== lastTriggerRef.current) {
      setEditingPlan(null);
      setIsModalOpen(true);
    }
    lastTriggerRef.current = triggerAddRatePlan;
  }, [triggerAddRatePlan]);

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
    const openUpwards = spaceBelow < menuHeight + 20 || (ratePlans.length > 1 && idx === ratePlans.length - 1 && spaceBelow < 180);

    setMenuPos({
      top: openUpwards ? Math.max(10, rect.top - menuHeight - 4) : rect.bottom + 4,
      left: Math.max(10, rect.right - menuWidth)
    });
    setActiveMenuId(planId);
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (plan) => {
    if (onDeleteRatePlan) {
      onDeleteRatePlan(plan.id);
    }
    setActiveMenuId(null);
    if (showToast) {
      showToast(`Deleted rate plan "${plan.name}"`);
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
      {ratePlans.length === 0 ? (
        /* Empty State */
        <div className="properties-empty-state" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="properties-empty-icon-box">
            <Tag size={26} color="#64748B" />
          </div>
          <h2 className="properties-empty-title">No Rate Plans Found</h2>
          <p className="properties-empty-sub">
            Get started by creating a new rate plan for your property.
          </p>
          <button
            type="button"
            className="properties-btn-primary"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Create Rate Plan</span>
          </button>
        </div>
      ) : (
        /* Flush Edge-to-Edge Data Table (Matching Image 1) */
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
                  <th style={{ width: '28%', padding: '14px 16px 14px 24px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Rate Plan
                  </th>
                  <th style={{ width: '18%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Short Code
                  </th>
                  <th style={{ width: '18%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Status
                  </th>
                  <th style={{ width: '26%', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Meal Plan
                  </th>
                  <th style={{ width: '10%', padding: '14px 24px 14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratePlans.map((rp, idx) => {
                  const mealPlanDisplay =
                    rp.mealPlanName && rp.mealPlanName !== '-'
                      ? rp.mealPlanName
                      : rp.mealPlanId
                      ? mealPlans.find((m) => m.id === rp.mealPlanId)?.name || '-'
                      : '-';

                  return (
                    <tr key={rp.id || rp.code} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* 1. Rate Plan Name */}
                      <td style={{ padding: '15px 16px 15px 24px' }}>
                        <strong style={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>
                          {rp.name}
                        </strong>
                      </td>

                      {/* 2. Short Code */}
                      <td style={{ padding: '15px 16px' }}>
                        <span className="properties-code-pill">{rp.code}</span>
                      </td>

                      {/* 3. Status */}
                      <td style={{ padding: '15px 16px' }}>
                        <span className="properties-status-pill">
                          {rp.status === 'INACTIVE' ? 'Inactive' : 'Active'}
                        </span>
                      </td>

                      {/* 4. Meal Plan */}
                      <td style={{ padding: '15px 16px' }}>
                        <span style={{ color: mealPlanDisplay === '-' ? '#64748B' : '#334155', fontSize: '13.5px', fontWeight: 500 }}>
                          {mealPlanDisplay}
                        </span>
                      </td>

                      {/* 5. Action (3-Dots + Popover Menu) */}
                      <td
                        className="properties-action-cell"
                        style={{ position: 'relative', textAlign: 'center', padding: '15px 24px 15px 16px' }}
                      >
                        <button
                          type="button"
                          className="properties-action-btn"
                          onClick={(e) => handleToggleMenu(e, rp.id, idx)}
                          title="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === rp.id && (
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
                              onClick={() => handleEdit(rp)}
                            >
                              <SquarePen size={15} color="#334155" />
                              <span>Edit</span>
                            </button>
                            <div className="properties-action-divider" />
                            <button
                              type="button"
                              className="properties-action-item delete"
                              onClick={() => handleDelete(rp)}
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

          {/* Pagination Footer (Matching Image 1) */}
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
                {ratePlans.length > 0 ? `1–${ratePlans.length}` : '0–0'}
              </strong>{' '}
              of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{ratePlans.length}</strong> results
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

      {/* Add / Edit Rate Plan Drawer Modal */}
      {isModalOpen && (
        <AddRatePlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
          onCreateRatePlan={onCreateRatePlan}
          onUpdateRatePlan={onUpdateRatePlan}
          ratePlanToEdit={editingPlan}
          mealPlans={mealPlans}
          roomTypes={roomTypes}
          showToast={showToast}
        />
      )}
    </div>
  );
}

