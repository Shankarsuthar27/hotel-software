import React, { useState } from 'react';
import { X, DollarSign, ArrowDownRight, ArrowUpRight, CheckCircle2, History, Printer } from 'lucide-react';

export default function CashDrawerModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cash_in' | 'cash_out' | 'history'
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notification, setNotification] = useState('');

  // Sample cashier shift data
  const [transactions, setTransactions] = useState([
    { id: 'tx_1', type: 'opening', label: 'Opening Shift Balance', amount: 5000, time: '26 Oct 2026, 08:00 AM', staff: 'Astha FrontDesk' },
    { id: 'tx_2', type: 'in', label: 'Folio Settlement (RES_4 - Walk-in)', amount: 2625, time: '26 Oct 2026, 01:02 PM', staff: 'Astha FrontDesk' },
    { id: 'tx_3', type: 'in', label: 'Folio Settlement (RES_5 - Walk-in)', amount: 2625, time: '26 Oct 2026, 01:08 PM', staff: 'Astha FrontDesk' }
  ]);

  if (!isOpen) return null;

  const totalIn = transactions.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const openingBalance = 5000;
  const currentCashInDrawer = openingBalance + totalIn - totalOut;

  const handleCashAction = (type) => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const newTx = {
      id: `tx_${Date.now()}`,
      type,
      label: reason.trim() || (type === 'in' ? 'Cash Top-up / Paid In' : 'Petty Cash / Paid Out'),
      amount: val,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      staff: 'Current Cashier'
    };

    setTransactions([newTx, ...transactions]);
    setAmount('');
    setReason('');
    setNotification(type === 'in' ? `✅ Added ₹${val.toFixed(2)} to Cash Drawer` : `✅ Paid out ₹${val.toFixed(2)} from Drawer`);
    setTimeout(() => setNotification(''), 3000);
    setActiveTab('overview');
  };

  const handlePopDrawer = () => {
    setNotification('⚡ Physical cash drawer pulse signal dispatched!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '560px',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          borderBottom: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🪙
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#92400e' }}>
                Cash Drawer Management
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#b45309' }}>
                Shift: Day Shift (Hotel Astha Front Desk)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#92400e',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {notification && (
          <div style={{
            background: '#ecfdf5',
            color: '#065f46',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderBottom: '1px solid #a7f3d0',
            textAlign: 'center'
          }}>
            {notification}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          
          {/* Cash Summary Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center',
            marginBottom: '1.25rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Opening Float</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>₹{openingBalance.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Cash Collected</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>+₹{totalIn.toLocaleString()}</div>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>Total In Drawer</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>₹{currentCashInDrawer.toLocaleString()}</div>
            </div>
          </div>

          {/* Action Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '8px',
            marginBottom: '1.2rem'
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                border: 'none',
                background: activeTab === 'overview' ? '#eff6ff' : 'transparent',
                color: activeTab === 'overview' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Recent Transactions
            </button>
            <button
              onClick={() => setActiveTab('cash_in')}
              style={{
                border: 'none',
                background: activeTab === 'cash_in' ? '#ecfdf5' : 'transparent',
                color: activeTab === 'cash_in' ? '#059669' : '#64748b',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              + Cash In (Float)
            </button>
            <button
              onClick={() => setActiveTab('cash_out')}
              style={{
                border: 'none',
                background: activeTab === 'cash_out' ? '#fef2f2' : 'transparent',
                color: activeTab === 'cash_out' ? '#dc2626' : '#64748b',
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              - Cash Out (Paid Out)
            </button>
          </div>

          {/* Tab 1: Overview & List */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transactions.map((tx) => (
                  <div key={tx.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>{tx.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{tx.time} • {tx.staff}</div>
                    </div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: tx.type === 'in' || tx.type === 'opening' ? '#16a34a' : '#dc2626'
                    }}>
                      {tx.type === 'out' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={handlePopDrawer}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Pop Cash Drawer
                </button>
                <button
                  type="button"
                  onClick={() => alert('Printing shift cash audit report...')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  Print Shift Report
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Cash In */}
          {activeTab === 'cash_in' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Amount to Add (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Reason / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Top up change float"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleCashAction('in')}
                style={{
                  marginTop: '6px',
                  padding: '10px',
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Cash In
              </button>
            </div>
          )}

          {/* Tab 3: Cash Out */}
          {activeTab === 'cash_out' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Amount to Withdraw (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Reason / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Petty cash for milk / newspaper"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleCashAction('out')}
                style={{
                  marginTop: '6px',
                  padding: '10px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Cash Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
