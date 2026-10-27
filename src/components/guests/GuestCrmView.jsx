import React, { useState, useMemo } from 'react';
import { Users, Search, Phone, Mail, Award, Calendar, DollarSign } from 'lucide-react';

export default function GuestCrmView({ reservations }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique guests and aggregate stay stats
  const guestsList = useMemo(() => {
    const map = {};

    reservations.forEach((res) => {
      const g = res.primaryGuest;
      if (!g || !g.name) return;

      const key = (g.phone || g.name).toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: g.name,
          phone: g.phone || 'N/A',
          email: g.email || 'N/A',
          gstin: g.gstin || '',
          nationality: g.nationality || 'Indian',
          totalStays: 0,
          totalSpent: 0,
          isVIP: false,
          lastStayDate: res.checkInDate,
          recentBookingRef: res.bookingReference
        };
      }

      map[key].totalStays += 1;
      map[key].totalSpent += Number(res.totalAmount) || 0;
      if (res.isVIP) map[key].isVIP = true;
      if (res.checkInDate > map[key].lastStayDate) {
        map[key].lastStayDate = res.checkInDate;
        map[key].recentBookingRef = res.bookingReference;
      }
    });

    return Object.values(map);
  }, [reservations]);

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guestsList;
    const q = searchQuery.toLowerCase();
    return guestsList.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.phone.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.gstin.toLowerCase().includes(q)
    );
  }, [guestsList, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{
        background: '#ffffff',
        padding: '1.25rem 1.75rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Guest CRM & Directory
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Central repository of guest profiles, lifetime stays, cumulative spend, and preferences
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search guest by name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Guests Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-light)', textAlign: 'left' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Guest Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contact Details</th>
              <th style={{ padding: '0.85rem 1rem' }}>GSTIN (Corporate)</th>
              <th style={{ padding: '0.85rem 1rem' }}>Lifetime Stays</th>
              <th style={{ padding: '0.85rem 1rem' }}>Total Spent (₹)</th>
              <th style={{ padding: '0.85rem 1rem' }}>Most Recent Stay</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Status Tag</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.82rem'
                    }}>
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{guest.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{guest.nationality}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ color: '#334155' }}>{guest.phone}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{guest.email}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                  {guest.gstin ? (
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{guest.gstin}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Individual / B2C</span>
                  )}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                  {guest.totalStays} {guest.totalStays === 1 ? 'Booking' : 'Bookings'}
                </td>

                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                  ₹{guest.totalSpent?.toLocaleString()}
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 600 }}>{guest.lastStayDate}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{guest.recentBookingRef}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  {guest.isVIP ? (
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      background: '#fef3c7',
                      color: '#b45309',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      fontSize: '0.72rem'
                    }}>
                      ⭐ VIP GUEST
                    </span>
                  ) : (
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.72rem'
                    }}>
                      Verified
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
