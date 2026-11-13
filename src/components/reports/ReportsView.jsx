import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Users,
  Receipt,
  Moon,
  Calendar,
  RotateCcw,
  FileDown,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  X,
  CreditCard,
  Building
} from 'lucide-react';
import {
  exportToExcel,
  exportMultipleSheetsToExcel,
  exportManagerReportExcel,
  exportGuestDetailsExcel,
  exportFolioListExcel,
  exportNightAuditExcel,
  exportReservationReportExcel,
  generateManagerReportData,
  generateGuestDetailsExport,
  generateFolioListExport,
  generateNightAuditExport,
  generateReservationsExport,
  generate7SheetsReservationExport,
  generateOtaCommissionExport
} from '../../services/exportService';
import ReportDatePicker from './ReportDatePicker';
import './reports.css';

export default function ReportsView({
  property = {},
  rooms = [],
  reservations = [],
  nightAudits = [],
  folios = {}
}) {
  // Navigation Tabs: 'directory' | 'ota'
  const [activeTab, setActiveTab] = useState('directory');

  // Accordion Expand/Collapse states (all 5 expanded by default matching reference image)
  const [expandedCards, setExpandedCards] = useState({
    manager: true,
    guest: true,
    folio: true,
    nightaudit: true,
    reservation: true
  });

  // Track which card has an open date picker to elevate its z-index over sibling cards
  const [activeCardPicker, setActiveCardPicker] = useState(null);

  const toggleCard = (cardKey) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  // Card 1: Manager Report Form State
  const defaultManagerDate = '28/10/2026';
  const [managerDate, setManagerDate] = useState(defaultManagerDate);

  // Card 2: Guest Details Report Form State
  const defaultGuestStartDate = '05/09/2026';
  const defaultGuestEndDate = '06/11/2026';
  const [guestStartDate, setGuestStartDate] = useState(defaultGuestStartDate);
  const [guestEndDate, setGuestEndDate] = useState(defaultGuestEndDate);

  // Card 3: Folio List Report Form State
  const defaultFolioStartDate = '01/11/2026';
  const defaultFolioEndDate = '06/11/2026';
  const defaultFolioMode = 'Both';
  const defaultFolioInclude = 'Confirmed +5';
  const [folioStartDate, setFolioStartDate] = useState(defaultFolioStartDate);
  const [folioEndDate, setFolioEndDate] = useState(defaultFolioEndDate);
  const [folioMode, setFolioMode] = useState(defaultFolioMode);
  const [folioInclude, setFolioInclude] = useState(() => {
    try {
      return localStorage.getItem('pms_reports_folio_include') || defaultFolioInclude;
    } catch {
      return defaultFolioInclude;
    }
  });

  useEffect(() => {
    try {
      if (folioInclude) {
        localStorage.setItem('pms_reports_folio_include', folioInclude);
      }
    } catch (e) {}
  }, [folioInclude]);

  // Card 4: Night Audit Report Form State
  const defaultAuditDate = '05/11/2026';
  const [auditDate, setAuditDate] = useState(defaultAuditDate);

  // Card 5: Reservation Report Form State
  const defaultResType = 'All (7 sheets)';
  const defaultMarketSegment = 'All segments';
  const defaultResStartDate = '01/11/2026';
  const defaultResEndDate = '03/11/2026';
  const [resType, setResType] = useState(defaultResType);
  const [marketSegment, setMarketSegment] = useState(defaultMarketSegment);
  const [resStartDate, setResStartDate] = useState(defaultResStartDate);
  const [resEndDate, setResEndDate] = useState(defaultResEndDate);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Generate Manager Report
  const handleGenerateManagerReport = () => {
    try {
      const ok = exportManagerReportExcel(
        managerDate,
        property,
        rooms,
        reservations,
        nightAudits,
        folios
      );
      if (ok) {
        showToast(`Manager Report for ${managerDate} exported successfully (.xlsx)`);
      } else {
        const data = generateManagerReportData(property, rooms, reservations, nightAudits);
        const fileName = `Manager_Report_${managerDate.replace(/\//g, '-')}.xlsx`;
        exportToExcel(data, fileName, 'Manager Summary');
        showToast(`Manager Report for ${managerDate} exported successfully (.xlsx)`);
      }
    } catch (e) {
      console.error(e);
      showToast('Error generating Manager Report');
    }
  };

  // 2. Generate Guest Details Report
  const handleGenerateGuestReport = () => {
    try {
      const ok = exportGuestDetailsExcel(
        guestStartDate,
        guestEndDate,
        property,
        reservations
      );
      if (ok) {
        showToast(`Guest Details Report (${guestStartDate} to ${guestEndDate}) exported successfully (.xlsx)`);
      } else {
        const data = generateGuestDetailsExport(reservations);
        const fileName = `Guest_Details_Report_${guestStartDate.replace(/\//g, '-')}_to_${guestEndDate.replace(/\//g, '-')}.xlsx`;
        exportToExcel(data, fileName, 'Guest Details');
        showToast(`Guest Details Report (${guestStartDate} to ${guestEndDate}) exported successfully (.xlsx)`);
      }
    } catch (e) {
      console.error(e);
      showToast('Error generating Guest Details Report');
    }
  };

  // 3. Generate Folio List Report
  const handleGenerateFolioReport = () => {
    try {
      const ok = exportFolioListExcel(
        folioStartDate,
        folioEndDate,
        folioMode,
        folioInclude,
        property,
        reservations,
        folios
      );
      if (ok) {
        showToast(`Folio List Report (${folioStartDate} to ${folioEndDate}) exported successfully (.xlsx)`);
      } else {
        const data = generateFolioListExport(reservations, folios, folioMode, folioInclude);
        const fileName = `Folio_List_Report_${folioMode}_${folioStartDate.replace(/\//g, '-')}.xlsx`;
        exportToExcel(data, fileName, `Folios_${folioMode}`);
        showToast(`Folio List Report (${folioMode} Mode) exported successfully (.xlsx)`);
      }
    } catch (e) {
      console.error(e);
      showToast('Error generating Folio List Report');
    }
  };

  // 4. Generate Night Audit Report
  const handleGenerateNightAuditReport = () => {
    try {
      const ok = exportNightAuditExcel(
        auditDate,
        property,
        rooms,
        reservations,
        folios,
        nightAudits
      );
      if (ok) {
        showToast(`Night Audit Report for ${auditDate} exported successfully (.xlsx)`);
      } else {
        const data = generateNightAuditExport(nightAudits);
        const fileName = `Night_Audit_Report_${auditDate.replace(/\//g, '-')}.xlsx`;
        exportToExcel(data, fileName, 'Night Audit Archive');
        showToast(`Night Audit Report for ${auditDate} exported successfully (.xlsx)`);
      }
    } catch (e) {
      console.error(e);
      showToast('Error generating Night Audit Report');
    }
  };

  // 5. Generate Reservation Report
  const handleGenerateReservationReport = () => {
    const success = exportReservationReportExcel(
      resStartDate,
      resEndDate,
      resType,
      marketSegment,
      property,
      reservations
    );
    if (success) {
      showToast(`Reservation Report (${resType}) exported successfully (.xlsx)`);
    } else {
      showToast(`Reservation Report export failed. Check parameters.`, 'error');
    }
  };

  // OTA & Commission export
  const handleGenerateOtaReport = () => {
    const data = generateOtaCommissionExport();
    exportToExcel(data, 'OTA_Commission_Payouts_Report.xlsx', 'OTA & Commissions');
    showToast('OTA & Commission Report exported successfully (.xlsx)');
  };

  return (
    <div className="reports-page-container">
      {/* 1. Sub-navigation tabs matching media_1793703049870_7244c6d5.jpg */}
      <div className="reports-tabs-header">
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          Reports Directory
        </button>
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'ota' ? 'active' : ''}`}
          onClick={() => setActiveTab('ota')}
        >
          OTA & Commission Report
        </button>
      </div>

      {/* Tab 1: Reports Directory View */}
      {activeTab === 'directory' && (
        <div className="reports-list-stack">
          {/* ========================================================
              CARD 1: Manager Report (Financial)
             ======================================================== */}
          <div className={`report-card-item ${activeCardPicker === 'manager' ? 'has-open-picker' : ''}`}>
            <div className="report-card-header" onClick={() => toggleCard('manager')}>
              <div className="report-card-header-left">
                <div className="report-card-icon-badge">
                  <FileSpreadsheet size={19} strokeWidth={2} />
                </div>
                <div className="report-card-title-group">
                  <div className="report-card-title-row">
                    <h3 className="report-card-title">Manager Report</h3>
                    <span className="rpt-pill-badge financial">Financial</span>
                  </div>
                  <p className="report-card-desc">
                    Comprehensive daily financial and operational summary including Room Revenue, Extra Charges, Taxes, Payments, City/Advance/Guest Ledgers, Occupancy, ADR, RevPAR, and POS summaries.
                  </p>
                </div>
              </div>
              <div className="report-card-chevron">
                {expandedCards.manager ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedCards.manager && (
              <div className="report-card-body">
                <div className="report-format-row">
                  <FileSpreadsheet size={15} className="report-format-icon" strokeWidth={2.2} />
                  <span>Format: Excel (.xlsx)</span>
                </div>

                <div className="report-form-row">
                  <div className="report-inputs-group">
                    <ReportDatePicker
                      label="As on Date"
                      value={managerDate}
                      onChange={setManagerDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'manager' : null)}
                    />
                  </div>

                  <div className="report-actions-group">
                    <button
                      type="button"
                      className="report-btn-reset"
                      onClick={() => setManagerDate(defaultManagerDate)}
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      className="report-btn-generate"
                      onClick={handleGenerateManagerReport}
                    >
                      <FileDown size={15} />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 2: Guest Details Report (Operational)
             ======================================================== */}
          <div className={`report-card-item ${activeCardPicker === 'guest' ? 'has-open-picker' : ''}`}>
            <div className="report-card-header" onClick={() => toggleCard('guest')}>
              <div className="report-card-header-left">
                <div className="report-card-icon-badge">
                  <Users size={19} strokeWidth={2} />
                </div>
                <div className="report-card-title-group">
                  <div className="report-card-title-row">
                    <h3 className="report-card-title">Guest Details Report</h3>
                    <span className="rpt-pill-badge operational">Operational</span>
                  </div>
                  <p className="report-card-desc">
                    Lists details of guests in-house or overlapping with a specific date, including contact info, nationality, and VIP status.
                  </p>
                </div>
              </div>
              <div className="report-card-chevron">
                {expandedCards.guest ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedCards.guest && (
              <div className="report-card-body">
                <div className="report-format-row">
                  <FileSpreadsheet size={15} className="report-format-icon" strokeWidth={2.2} />
                  <span>Format: Excel (.xlsx)</span>
                </div>

                <div className="report-form-row">
                  <div className="report-inputs-group">
                    <ReportDatePicker
                      label="Start Date"
                      value={guestStartDate}
                      onChange={setGuestStartDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'guest' : null)}
                    />
                    <ReportDatePicker
                      label="End Date"
                      value={guestEndDate}
                      onChange={setGuestEndDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'guest' : null)}
                    />
                  </div>

                  <div className="report-actions-group">
                    <button
                      type="button"
                      className="report-btn-reset"
                      onClick={() => {
                        setGuestStartDate(defaultGuestStartDate);
                        setGuestEndDate(defaultGuestEndDate);
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      className="report-btn-generate"
                      onClick={handleGenerateGuestReport}
                    >
                      <FileDown size={15} />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 3: Folio List Report (Financial)
             ======================================================== */}
          <div className={`report-card-item ${activeCardPicker === 'folio' ? 'has-open-picker' : ''}`}>
            <div className="report-card-header" onClick={() => toggleCard('folio')}>
              <div className="report-card-header-left">
                <div className="report-card-icon-badge">
                  <Receipt size={19} strokeWidth={2} />
                </div>
                <div className="report-card-title-group">
                  <div className="report-card-title-row">
                    <h3 className="report-card-title">Folio List Report</h3>
                    <span className="rpt-pill-badge financial">Financial</span>
                  </div>
                  <p className="report-card-desc">
                    Comprehensive listing of guest and non-guest folios within a date range, with configurable folio mode (Open, Close, Both) and reservation status filters including invoice number, guest, pax, charges, taxes, credits, and folio balances.
                  </p>
                </div>
              </div>
              <div className="report-card-chevron">
                {expandedCards.folio ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedCards.folio && (
              <div className="report-card-body">
                <div className="report-format-row">
                  <FileSpreadsheet size={15} className="report-format-icon" strokeWidth={2.2} />
                  <span>Format: Excel (.xlsx)</span>
                </div>

                <div className="report-form-row">
                  <div className="report-inputs-group">
                    <ReportDatePicker
                      label="Start Date"
                      value={folioStartDate}
                      onChange={setFolioStartDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'folio' : null)}
                    />
                    <ReportDatePicker
                      label="End Date"
                      value={folioEndDate}
                      onChange={setFolioEndDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'folio' : null)}
                    />

                    <div className="report-field-item">
                      <label className="report-field-label">Folio Mode</label>
                      <select
                        className="report-select-input"
                        value={folioMode}
                        onChange={(e) => setFolioMode(e.target.value)}
                        style={{ minWidth: '130px' }}
                      >
                        <option value="Both">Both</option>
                        <option value="Open">Open</option>
                        <option value="Close">Close</option>
                      </select>
                    </div>

                    <div className="report-field-item">
                      <label className="report-field-label">Include</label>
                      <select
                        className="report-select-input"
                        value={folioInclude}
                        onChange={(e) => setFolioInclude(e.target.value)}
                        style={{ minWidth: '150px' }}
                      >
                        <option value="Confirmed +5">Confirmed +5</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In-House">In-House</option>
                        <option value="Checked-Out">Checked-Out</option>
                        <option value="All Statuses">All Statuses</option>
                      </select>
                    </div>
                  </div>

                  <div className="report-actions-group">
                    <button
                      type="button"
                      className="report-btn-reset"
                      onClick={() => {
                        setFolioStartDate(defaultFolioStartDate);
                        setFolioEndDate(defaultFolioEndDate);
                        setFolioMode(defaultFolioMode);
                        setFolioInclude(defaultFolioInclude);
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      className="report-btn-generate"
                      onClick={handleGenerateFolioReport}
                    >
                      <FileDown size={15} />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 4: Night Audit Report (Audit)
             ======================================================== */}
          <div className={`report-card-item ${activeCardPicker === 'nightaudit' ? 'has-open-picker' : ''}`}>
            <div className="report-card-header" onClick={() => toggleCard('nightaudit')}>
              <div className="report-card-header-left">
                <div className="report-card-icon-badge">
                  <Moon size={19} strokeWidth={2} />
                </div>
                <div className="report-card-title-group">
                  <div className="report-card-title-row">
                    <h3 className="report-card-title">Night Audit Report</h3>
                    <span className="rpt-pill-badge audit">Audit</span>
                  </div>
                  <p className="report-card-desc">
                    Detailed end-of-day audit details including in-house room tariffs, guest folio ledger balances, receipts/payments log, misc charges, void charges, room/pax status, and POS outlet summaries.
                  </p>
                </div>
              </div>
              <div className="report-card-chevron">
                {expandedCards.nightaudit ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedCards.nightaudit && (
              <div className="report-card-body">
                <div className="report-format-row">
                  <FileSpreadsheet size={15} className="report-format-icon" strokeWidth={2.2} />
                  <span>Format: Excel (.xlsx)</span>
                </div>

                <div className="report-form-row">
                  <div className="report-inputs-group">
                    <ReportDatePicker
                      label="Audit Date"
                      value={auditDate}
                      onChange={setAuditDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'nightaudit' : null)}
                    />
                  </div>

                  <div className="report-actions-group">
                    <button
                      type="button"
                      className="report-btn-reset"
                      onClick={() => setAuditDate(defaultAuditDate)}
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      className="report-btn-generate"
                      onClick={handleGenerateNightAuditReport}
                    >
                      <FileDown size={15} />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CARD 5: Reservation Report (Operational)
             ======================================================== */}
          <div className={`report-card-item ${activeCardPicker === 'reservation' ? 'has-open-picker' : ''}`}>
            <div className="report-card-header" onClick={() => toggleCard('reservation')}>
              <div className="report-card-header-left">
                <div className="report-card-icon-badge">
                  <Calendar size={19} strokeWidth={2} />
                </div>
                <div className="report-card-title-group">
                  <div className="report-card-title-row">
                    <h3 className="report-card-title">Reservation Report</h3>
                    <span className="rpt-pill-badge operational">Operational</span>
                  </div>
                  <p className="report-card-desc">
                    Lists reservations within a date range, grouped by status. Select All to generate all 7 sheets (Confirmed, Arrivals, In-House, Checked-Out, Cancelled, Hold, No-Show), or choose a specific type for a single sheet. Columns: Reservation Code, Guest Name, Booking Date, Rooms, Check-In/Out Dates, Source, Total Amount, Due Amount, VIP, Single Lady, Group Reservation.
                  </p>
                </div>
              </div>
              <div className="report-card-chevron">
                {expandedCards.reservation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {expandedCards.reservation && (
              <div className="report-card-body">
                <div className="report-format-row">
                  <FileSpreadsheet size={15} className="report-format-icon" strokeWidth={2.2} />
                  <span>Format: Excel (.xlsx)</span>
                </div>

                <div className="report-form-row">
                  <div className="report-inputs-group">
                    <div className="report-field-item">
                      <label className="report-field-label">Reservation Type</label>
                      <select
                        className="report-select-input"
                        value={resType}
                        onChange={(e) => setResType(e.target.value)}
                        style={{ minWidth: '155px' }}
                      >
                        <option value="All (7 sheets)">All (7 sheets)</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Arrivals">Arrivals</option>
                        <option value="In-House">In-House</option>
                        <option value="Checked-Out">Checked-Out</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Hold">Hold</option>
                        <option value="No-Show">No-Show</option>
                      </select>
                    </div>

                    <div className="report-field-item">
                      <label className="report-field-label">Market Segment (Optional)</label>
                      <select
                        className="report-select-input"
                        value={marketSegment}
                        onChange={(e) => setMarketSegment(e.target.value)}
                        style={{ minWidth: '160px' }}
                      >
                        <option value="All segments">All segments</option>
                        <option value="Walk-In">Walk-In</option>
                        <option value="Direct Booking">Direct Booking</option>
                        <option value="OTA">OTA</option>
                        <option value="Corporate">Corporate</option>
                      </select>
                    </div>

                    <ReportDatePicker
                      label="Start Date"
                      value={resStartDate}
                      onChange={setResStartDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'reservation' : null)}
                    />
                    <ReportDatePicker
                      label="End Date"
                      value={resEndDate}
                      onChange={setResEndDate}
                      onOpenChange={(open) => setActiveCardPicker(open ? 'reservation' : null)}
                    />
                  </div>

                  <div className="report-actions-group">
                    <button
                      type="button"
                      className="report-btn-reset"
                      onClick={() => {
                        setResType(defaultResType);
                        setMarketSegment(defaultMarketSegment);
                        setResStartDate(defaultResStartDate);
                        setResEndDate(defaultResEndDate);
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      className="report-btn-generate"
                      onClick={handleGenerateReservationReport}
                    >
                      <FileDown size={15} />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: OTA & Commission Report View */}
      {activeTab === 'ota' && (
        <div className="ota-commission-container">
          {/* Top KPI Cards */}
          <div className="ota-metrics-grid">
            <div className="ota-metric-card">
              <div className="ota-metric-label">Total OTA Bookings</div>
              <div className="ota-metric-value">42</div>
              <div className="ota-metric-sub">Across 4 Connected OTAs</div>
            </div>
            <div className="ota-metric-card">
              <div className="ota-metric-label">Gross OTA Revenue</div>
              <div className="ota-metric-value" style={{ color: '#059669' }}>
                ₹2,52,000
              </div>
              <div className="ota-metric-sub">Before Commissions & TDS</div>
            </div>
            <div className="ota-metric-card">
              <div className="ota-metric-label">Commission Payable</div>
              <div className="ota-metric-value" style={{ color: '#ea580c' }}>
                ₹37,537
              </div>
              <div className="ota-metric-sub">Average Rate: 14.8%</div>
            </div>
            <div className="ota-metric-card">
              <div className="ota-metric-label">Net Realized Payout</div>
              <div className="ota-metric-value" style={{ color: '#2563eb' }}>
                ₹2,11,943
              </div>
              <div className="ota-metric-sub">Post Commission & Deductions</div>
            </div>
          </div>

          {/* Table Card */}
          <div className="ota-table-card">
            <div className="ota-table-header">
              <h3 className="ota-table-title">Channel Commission & Payout Ledger</h3>
              <button
                type="button"
                className="report-btn-generate"
                onClick={handleGenerateOtaReport}
              >
                <FileDown size={15} />
                <span>Export to Excel (.xlsx)</span>
              </button>
            </div>

            <table className="ota-table">
              <thead>
                <tr>
                  <th>OTA Channel</th>
                  <th>Bookings</th>
                  <th>Room Nights</th>
                  <th>Gross Revenue (₹)</th>
                  <th>Commission Rate</th>
                  <th>Commission Due (₹)</th>
                  <th>Net Payout (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {generateOtaCommissionExport().map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{row['OTA Channel']}</td>
                    <td>{row['Total Bookings']}</td>
                    <td>{row['Room Nights']}</td>
                    <td style={{ fontWeight: 600 }}>₹{row['Gross Revenue (₹)'].toLocaleString()}</td>
                    <td>{row['Commission Rate']}</td>
                    <td style={{ color: '#ea580c', fontWeight: 600 }}>₹{row['Commission Due (₹)'].toLocaleString()}</td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>₹{row['Net Payout (₹)'].toLocaleString()}</td>
                    <td>
                      <span className={`ota-status-badge ${row.Status === 'SETTLED' ? 'settled' : 'pending'}`}>
                        {row.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="rpt-toast">
          <CheckCircle2 size={18} className="rpt-toast-icon" strokeWidth={2.4} />
          <span className="rpt-toast-text">{toastMessage}</span>
          <button
            type="button"
            className="rpt-toast-close"
            onClick={() => setToastMessage(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
