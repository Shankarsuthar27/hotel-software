import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { generateTaxInvoiceSummary } from '../../services/taxEngine';

export default function GstInvoiceModal({ isOpen, onClose, reservation, folio, property }) {
  if (!isOpen || !reservation) return null;

  const invoiceSummary = generateTaxInvoiceSummary(
    folio?.transactions || [],
    property,
    reservation.primaryGuest
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay printable-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        {/* Modal Controls (Hidden in Print) */}
        <div className="modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Tax Invoice Preview — {folio?.folioNumber || 'FOL_INV'}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Tax Invoice</span>
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.55rem' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Document */}
        <div className="modal-body printable-document" style={{ padding: '2.5rem' }}>
          {/* Document Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.04em' }}>
              TAX INVOICE
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
              (Issued under Section 31 of Central Goods and Services Tax Act, 2017)
            </p>
          </div>

          {/* Supplier & Recipient Meta Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            {/* Supplier / Hotel Details */}
            <div style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                {property?.legalName}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                Trade Name: <strong>{property?.tradeName}</strong>
              </div>
              <div style={{ color: '#334155', lineHeight: 1.5 }}>
                {property?.addressLine}<br />
                {property?.city}, {property?.state} - {property?.postalCode}<br />
                Phone: {property?.phone} • Email: {property?.email}
              </div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid #e2e8f0', fontWeight: 700, color: '#0f172a' }}>
                GSTIN: <span style={{ fontFamily: 'var(--font-mono)' }}>{property?.gstin}</span>
              </div>
            </div>

            {/* Invoice Specifics */}
            <div style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.25rem 0', color: '#64748b' }}>Invoice No:</td>
                    <td style={{ padding: '0.25rem 0', fontWeight: 800, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      INV-{folio?.folioNumber || '379'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.25rem 0', color: '#64748b' }}>Invoice Date:</td>
                    <td style={{ padding: '0.25rem 0', fontWeight: 700, textAlign: 'right' }}>
                      {property?.businessDate}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.25rem 0', color: '#64748b' }}>Booking Reference:</td>
                    <td style={{ padding: '0.25rem 0', fontWeight: 700, textAlign: 'right' }}>
                      {reservation.bookingReference}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.25rem 0', color: '#64748b' }}>Room Number:</td>
                    <td style={{ padding: '0.25rem 0', fontWeight: 700, textAlign: 'right' }}>
                      Room {reservation.roomNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.25rem 0', color: '#64748b' }}>Stay Period:</td>
                    <td style={{ padding: '0.25rem 0', fontWeight: 600, textAlign: 'right', fontSize: '0.74rem' }}>
                      {reservation.checkInDate} to {reservation.checkOutDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Billed To / Guest Details */}
          <div style={{ border: '1px solid #cbd5e1', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: '0.3rem' }}>
              DETAILS OF RECEIVER / BILLED TO:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{reservation.primaryGuest?.name}</strong>
                <div style={{ color: '#475569', fontSize: '0.78rem' }}>Phone: {reservation.primaryGuest?.phone} • Email: {reservation.primaryGuest?.email || 'N/A'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b' }}>Recipient GSTIN: </span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: reservation.primaryGuest?.gstin ? '#2563eb' : '#64748b' }}>
                  {reservation.primaryGuest?.gstin || 'Unregistered / B2C'}
                </strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Place of Supply: {property?.state} (Code: 29)
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Goods/Services Tax Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.78rem', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #94a3b8', textAlign: 'center' }}>
                <th style={{ padding: '0.5rem', width: '35px', borderRight: '1px solid #cbd5e1' }}>#</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>Service Description</th>
                <th style={{ padding: '0.5rem', width: '70px', borderRight: '1px solid #cbd5e1' }}>SAC Code</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>Taxable Val (₹)</th>
                <th style={{ padding: '0.5rem', width: '80px', borderRight: '1px solid #cbd5e1' }}>CGST</th>
                <th style={{ padding: '0.5rem', width: '80px', borderRight: '1px solid #cbd5e1' }}>SGST</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoiceSummary.lineItems.map((item) => (
                <tr key={item.itemIndex} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{item.itemIndex}</td>
                  <td style={{ padding: '0.5rem', borderRight: '1px solid #cbd5e1' }}>
                    <strong>{item.description}</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Date: {item.date}</div>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}>
                    {item.sacCode}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                    {item.taxableValue?.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                    {item.cgstRate}%: ₹{item.cgstAmount}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                    {item.sgstRate}%: ₹{item.sgstAmount}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700 }}>
                    {item.totalAmount?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                <td colSpan={3} style={{ padding: '0.65rem 0.75rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                  TOTAL INVOICE VALUES:
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                  ₹{invoiceSummary.totalTaxable?.toLocaleString()}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                  ₹{invoiceSummary.totalCgst?.toLocaleString()}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                  ₹{invoiceSummary.totalSgst?.toLocaleString()}
                </td>
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontSize: '0.92rem', color: '#0f172a' }}>
                  ₹{invoiceSummary.totalGross?.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Bottom Signatures & Certification */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginTop: '2.5rem', fontSize: '0.76rem', color: '#475569' }}>
            <div>
              <p><strong>Declaration:</strong></p>
              <p style={{ marginTop: '0.2rem' }}>
                We declare that this invoice shows the actual price of the hospitality services described and that all particulars are true and correct. Goods/services once consumed are non-refundable.
              </p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2.5rem' }}>
                For {property?.legalName}
              </div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.35rem', fontWeight: 700 }}>
                Authorized Signatory / Front Desk Cashier
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
