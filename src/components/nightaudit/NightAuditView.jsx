import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Search,
  MoreVertical,
  Calendar,
  LogOut,
  FileText,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import NightAuditDetailModal from './NightAuditDetailModal';
import './night-audit.css';

const NA_STORAGE_KEY = 'hotel_astha_night_audit_session_v2';

const defaultAuditsList = [
  {
    id: 'na_20261026',
    date: '26 Oct 2026',
    auditDate: '26 Oct 2026',
    newBusinessDate: '27 Oct 2026',
    isCurrent: true,
    status: 'running',
    statusText: 'Running (Stage 1)',
    startedDate: 'Oct 27, 2026',
    startedHour: '01:00',
    startedTime: 'Oct 27, 2026 01:00',
    startedBy: 'Astha India',
    completedDate: '—',
    completedHour: '—',
    completedTime: '—',
    completedBy: '—',
    performedBy: 'Astha India',
    chargesPostedCount: 2,
    amountPosted: 5250,
    totalRevenue: 5250,
    totalTax: 250,
    occupiedRooms: 2,
    vacantRooms: 2,
    adr: 2500,
    roomCharges: [
      {
        room: '101 - Delux Room',
        folio: 'FOL_5',
        guest: 'Mr Kkk Suthar',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      },
      {
        room: '102 - Delux Room',
        folio: 'FOL_4',
        guest: 'Mr Shankar Suthar',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      }
    ],
    checkedOutList: [],
    roomStatus: {
      total: 4,
      occupied: 2,
      dueOut: 0,
      vacant: 2,
      departed: 0,
      blocked: 0
    },
    paxStatus: [
      { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
      { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
      { status: 'Stayover', rooms: 2, adult: 2, child: 0 }
    ]
  },
  {
    id: 'na_20261025',
    date: '25 Oct 2026',
    auditDate: '25 Oct 2026',
    newBusinessDate: '26 Oct 2026',
    isCurrent: false,
    status: 'completed',
    statusText: 'Completed',
    startedDate: 'Oct 26, 2026',
    startedHour: '01:00',
    startedTime: 'Oct 26, 2026 01:00',
    startedBy: 'System',
    completedDate: 'Oct 26, 2026',
    completedHour: '01:00',
    completedTime: 'Oct 26, 2026 01:00',
    completedBy: '—',
    performedBy: 'System',
    chargesPostedCount: 1,
    amountPosted: 2625,
    totalRevenue: 2625,
    totalTax: 125,
    occupiedRooms: 1,
    vacantRooms: 3,
    adr: 2500,
    roomCharges: [
      {
        room: 'Unassigned - Delux Room',
        folio: 'FOL_1',
        guest: 'Krishna Suthar',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      }
    ],
    checkedOutList: [],
    roomStatus: {
      total: 4,
      occupied: 1,
      dueOut: 0,
      vacant: 3,
      departed: 0,
      blocked: 0
    },
    paxStatus: [
      { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
      { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
      { status: 'Stayover', rooms: 2, adult: 2, child: 3 }
    ]
  },
  {
    id: 'na_20261024',
    date: '24 Oct 2026',
    auditDate: '24 Oct 2026',
    newBusinessDate: '25 Oct 2026',
    isCurrent: false,
    status: 'completed',
    statusText: 'Completed',
    startedDate: 'Oct 25, 2026',
    startedHour: '01:00',
    startedTime: 'Oct 25, 2026 01:00',
    startedBy: 'System',
    completedDate: 'Oct 25, 2026',
    completedHour: '01:00',
    completedTime: 'Oct 25, 2026 01:00',
    completedBy: '—',
    performedBy: 'System',
    chargesPostedCount: 2,
    amountPosted: 5250,
    totalRevenue: 5250,
    totalTax: 250,
    occupiedRooms: 2,
    vacantRooms: 2,
    adr: 2500,
    roomCharges: [
      {
        room: '101 - Delux Room',
        folio: 'FOL_2',
        guest: 'Krishna Suthar',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      },
      {
        room: '102 - Delux Room',
        folio: 'FOL_4',
        guest: 'Shankar Suthar',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      }
    ],
    checkedOutList: [],
    roomStatus: {
      total: 4,
      occupied: 2,
      dueOut: 0,
      vacant: 2,
      departed: 0,
      blocked: 0
    },
    paxStatus: [
      { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
      { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
      { status: 'Stayover', rooms: 2, adult: 2, child: 0 }
    ]
  },
  {
    id: 'na_20261023',
    date: '23 Oct 2026',
    auditDate: '23 Oct 2026',
    newBusinessDate: '24 Oct 2026',
    isCurrent: false,
    status: 'completed',
    statusText: 'Completed',
    startedDate: 'Oct 24, 2026',
    startedHour: '01:00',
    startedTime: 'Oct 24, 2026 01:00',
    startedBy: 'System',
    completedDate: 'Oct 24, 2026',
    completedHour: '01:00',
    completedTime: 'Oct 24, 2026 01:00',
    completedBy: '—',
    performedBy: 'System',
    chargesPostedCount: 1,
    amountPosted: 2625,
    totalRevenue: 2625,
    totalTax: 125,
    occupiedRooms: 1,
    vacantRooms: 3,
    adr: 2500,
    roomCharges: [
      {
        room: '101 - Delux Room',
        folio: 'FOL_1',
        guest: 'Suresh Sharma',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      }
    ],
    checkedOutList: [],
    roomStatus: {
      total: 4,
      occupied: 1,
      dueOut: 0,
      vacant: 3,
      departed: 0,
      blocked: 0
    },
    paxStatus: [
      { status: 'Arrived', rooms: 1, adult: 1, child: 0 },
      { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
      { status: 'Stayover', rooms: 1, adult: 1, child: 0 }
    ]
  },
  {
    id: 'na_20261022',
    date: '22 Oct 2026',
    auditDate: '22 Oct 2026',
    newBusinessDate: '23 Oct 2026',
    isCurrent: false,
    status: 'completed',
    statusText: 'Completed',
    startedDate: 'Oct 23, 2026',
    startedHour: '01:00',
    startedTime: 'Oct 23, 2026 01:00',
    startedBy: 'System',
    completedDate: 'Oct 23, 2026',
    completedHour: '01:00',
    completedTime: 'Oct 23, 2026 01:00',
    completedBy: '—',
    performedBy: 'System',
    chargesPostedCount: 1,
    amountPosted: 2625,
    totalRevenue: 2625,
    totalTax: 125,
    occupiedRooms: 1,
    vacantRooms: 3,
    adr: 2500,
    roomCharges: [
      {
        room: '101 - Delux Room',
        folio: 'FOL_1',
        guest: 'Suresh Sharma',
        nrmlTariff: 2500,
        ofrdTariff: 2500,
        totalTax: 125,
        totalRent: 2625
      }
    ],
    checkedOutList: [],
    roomStatus: {
      total: 4,
      occupied: 1,
      dueOut: 0,
      vacant: 3,
      departed: 0,
      blocked: 0
    },
    paxStatus: [
      { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
      { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
      { status: 'Stayover', rooms: 1, adult: 1, child: 0 }
    ]
  }
];

const loadSavedSession = () => {
  try {
    const raw = localStorage.getItem(NA_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
};

export default function NightAuditView({
  property,
  reservations = [],
  rooms = [],
  nightAudits = [],
  onExecuteAudit
}) {
  const savedSession = React.useMemo(() => loadSavedSession(), []);

  const [viewMode, setViewMode] = useState('history'); // 'history' | 'execution'
  const [executionStage, setExecutionStage] = useState(1);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [processedNoShows, setProcessedNoShows] = useState(false);
  const [isNoShowsModalOpen, setIsNoShowsModalOpen] = useState(false);
  const [showNoShowToast, setShowNoShowToast] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isAuditFinished, setIsAuditFinished] = useState(false);
  const [openActionRowId, setOpenActionRowId] = useState(null);
  const [isAmendStayOpen, setIsAmendStayOpen] = useState(false);
  const [selectedAmendRoom, setSelectedAmendRoom] = useState(null);
  const [amendCheckOutDate, setAmendCheckOutDate] = useState('28/10/2026');
  const [showAmendToast, setShowAmendToast] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState(null); // { type: 'failed' | 'success' | 'settled', message: '' }
  const hiddenDateInputRef = React.useRef(null);

  const [roomStatusList, setRoomStatusList] = useState(
    () =>
      savedSession?.roomStatusList || [
        {
          id: 'rm_102',
          roomNumber: '102',
          resNo: '#RES_6',
          guest: 'Mr Krishna Suthar',
          arrival: '26 Oct 2026',
          departure: '27 Oct 2026',
          balance: '3,675.00',
          status: 'Due Out'
        }
      ]
  );

  // Close row action dropdown when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setOpenActionRowId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleConfirmAmendStay = () => {
    let formattedDate = '28 Oct 2026';
    if (amendCheckOutDate) {
      if (amendCheckOutDate.includes('/')) {
        const parts = amendCheckOutDate.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const monthNum = parseInt(parts[1], 10);
          const year = parts[2];
          const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
          const monthStr = months[monthNum - 1] || 'Oct';
          formattedDate = `${day} ${monthStr} ${year}`;
        }
      } else {
        formattedDate = amendCheckOutDate;
      }
    }

    const targetId = selectedAmendRoom?.id || 'rm_102';
    const updatedRooms = roomStatusList.map((r) =>
      r.id === targetId
        ? {
            ...r,
            departure: formattedDate,
            status: 'In House'
          }
        : r
    );

    setRoomStatusList(updatedRooms);
    setIsAmendStayOpen(false);
    setShowAmendToast(true);
    setTimeout(() => setShowAmendToast(false), 3500);
    setDueCheckoutsText('0 Rooms');
    setDueCheckoutsBadge('Clear');

    try {
      const current = loadSavedSession() || {};
      localStorage.setItem(
        NA_STORAGE_KEY,
        JSON.stringify({
          ...current,
          dueCheckoutsText: '0 Rooms',
          dueCheckoutsBadge: 'Clear',
          roomStatusList: updatedRooms
        })
      );
    } catch (e) {
      // ignore
    }
  };

  const handleCheckoutRoom = (roomId) => {
    const target = roomStatusList.find((r) => r.id === roomId);
    if (!target) return;

    const balanceNum = parseFloat(String(target.balance || '0').replace(/,/g, ''));
    const isPaid = balanceNum <= 0.01;

    if (!isPaid) {
      // Dues are still unpaid -> mark Check Out Failed!
      const updatedRooms = roomStatusList.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: 'Check Out Failed'
            }
          : r
      );
      setRoomStatusList(updatedRooms);
      setDueCheckoutsText('1 Rooms');
      setDueCheckoutsBadge('Action Required');
      setCheckoutNotice({
        type: 'failed',
        message: `Check Out Failed: Room ${target.roomNumber} has an unpaid balance of ${target.balance}. All dues must be paid before checkout.`
      });
      setTimeout(() => setCheckoutNotice(null), 5000);

      try {
        const current = loadSavedSession() || {};
        localStorage.setItem(
          NA_STORAGE_KEY,
          JSON.stringify({
            ...current,
            dueCheckoutsText: '1 Rooms',
            dueCheckoutsBadge: 'Action Required',
            roomStatusList: updatedRooms
          })
        );
      } catch (e) {
        // ignore
      }
      return;
    }

    // All dues are paid -> mark Checked Out successfully!
    const updatedRooms = roomStatusList.map((r) =>
      r.id === roomId
        ? {
            ...r,
            balance: '0.00',
            status: 'Checked Out'
          }
        : r
    );
    setRoomStatusList(updatedRooms);
    setDueCheckoutsText('0 Rooms');
    setDueCheckoutsBadge('Clear');
    setCheckoutNotice({
      type: 'success',
      message: `Room ${target.roomNumber} checked out successfully — all dues are cleared.`
    });
    setTimeout(() => setCheckoutNotice(null), 3500);

    try {
      const current = loadSavedSession() || {};
      localStorage.setItem(
        NA_STORAGE_KEY,
        JSON.stringify({
          ...current,
          dueCheckoutsText: '0 Rooms',
          dueCheckoutsBadge: 'Clear',
          roomStatusList: updatedRooms
        })
      );
    } catch (e) {
      // ignore
    }
  };

  const handleSettleBalance = (roomId) => {
    const target = roomStatusList.find((r) => r.id === roomId);
    const settledAmount = target?.balance || '3,675.00';
    const updatedRooms = roomStatusList.map((r) =>
      r.id === roomId
        ? {
            ...r,
            balance: '0.00'
          }
        : r
    );
    setRoomStatusList(updatedRooms);
    setCheckoutNotice({
      type: 'settled',
      message: `Balance settled: ${settledAmount} paid. All dues cleared — ready for checkout.`
    });
    setTimeout(() => setCheckoutNotice(null), 3500);

    try {
      const current = loadSavedSession() || {};
      localStorage.setItem(
        NA_STORAGE_KEY,
        JSON.stringify({
          ...current,
          roomStatusList: updatedRooms
        })
      );
    } catch (e) {
      // ignore
    }
  };

  const [pendingArrivals, setPendingArrivals] = useState([
    {
      id: 'res_7',
      resNo: '#RES_7',
      guest: 'Mr Krishna Suthar',
      roomType: 'Delux Room',
      resType: 'Confirmed',
      source: 'WALKIN',
      departure: '27 Oct 2026',
      total: '2,625.00'
    }
  ]);

  const handleConfirmProcessNoShows = () => {
    setPendingArrivals([]);
    setProcessedNoShows(true);
    setIsNoShowsModalOpen(false);
    setShowNoShowToast(true);
  };

  // Business date and system time matching reference image
  const [displayDateStr, setDisplayDateStr] = useState(
    () => savedSession?.displayDateStr || '26 Oct 2026'
  );
  const [displayTimeStr, setDisplayTimeStr] = useState(
    () => savedSession?.displayTimeStr || '11:09 AM'
  );

  // Checklist counts matching reference image
  const [pendingChecklistCount, setPendingChecklistCount] = useState(
    () => savedSession?.pendingChecklistCount || '01'
  );
  const [dueCheckoutsText, setDueCheckoutsText] = useState(
    () => savedSession?.dueCheckoutsText || '0 Rooms'
  );
  const [dueCheckoutsBadge, setDueCheckoutsBadge] = useState(
    () => savedSession?.dueCheckoutsBadge || 'Clear'
  );
  const [unsettledFoliosText, setUnsettledFoliosText] = useState(
    () => savedSession?.unsettledFoliosText || '0'
  );
  const [unsettledFoliosBadge, setUnsettledFoliosBadge] = useState(
    () => savedSession?.unsettledFoliosBadge || 'Clear'
  );

  // 6 Stepper stages
  const stages = [
    { id: 1, name: 'Pending Reservations' },
    { id: 2, name: 'Release Reservations' },
    { id: 3, name: 'Room Status' },
    { id: 4, name: 'Unsettled Folios' },
    { id: 5, name: 'Nightly Charge' },
    { id: 6, name: 'Create New Day' }
  ];

  const currentStageObj = stages.find((s) => s.id === executionStage) || stages[0];
  const stageProgressMap = {
    1: '0%',
    2: '17%',
    3: '33%',
    4: '50%',
    5: '67%',
    6: '83%'
  };
  const stageProgressPct = stageProgressMap[executionStage] || '0%';

  // Stage validation: disable Next Stage if pending arrivals in Stage 1, or due out / due balance / failed checkout in Stage 3
  const hasDueOutRooms = roomStatusList.some((r) => {
    const bal = parseFloat(String(r.balance || '0').replace(/,/g, ''));
    return (
      r.status === 'Due Out' ||
      r.status === 'Check Out Failed' ||
      (bal > 0 && r.status !== 'In House' && r.status !== 'Checked Out')
    );
  });

  const isNextDisabled =
    (executionStage === 1 && !processedNoShows && pendingArrivals.length > 0) ||
    (executionStage === 3 && hasDueOutRooms);

  // 5 Audit history records matching the exact rows from reference image
  const [auditsList, setAuditsList] = useState(
    () => savedSession?.auditsList || defaultAuditsList
  );
  // Finish Night Audit button click on Stage 6
  const handleFinishNightAuditClick = () => {
    setIsAuditFinished(true);
    setIsCompleteModalOpen(true);
  };

  // User clicks Continue on Night Audit Complete modal matching media_1793688171192_0cd5377a.png & media_1793689740993_f7b0c90c.png
  const handleCompleteAndContinue = () => {
    setIsCompleteModalOpen(false);
    setIsAuditFinished(false);
    setIsProcessing(true);

    if (onExecuteAudit) {
      onExecuteAudit();
    }

    // Confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    // 1. Finalize the 26 Oct 2026 audit record (matches media_1793689740993_f7b0c90c.png row 2)
    const finalized26 = {
      id: 'na_20261026',
      date: '26 Oct 2026',
      auditDate: '26 Oct 2026',
      newBusinessDate: '27 Oct 2026',
      isCurrent: false,
      status: 'completed',
      statusText: 'Completed',
      startedDate: 'Oct 27, 2026',
      startedHour: '01:00',
      startedTime: 'Oct 27, 2026 01:00',
      startedBy: 'Astha India',
      completedDate: 'Nov 3, 2026',
      completedHour: '12:03',
      completedTime: 'Nov 3, 2026 12:03',
      completedBy: 'shankar l',
      performedBy: 'shankar l',
      chargesPostedCount: 2,
      amountPosted: 5250,
      totalRevenue: 5250,
      totalTax: 250,
      occupiedRooms: 2,
      vacantRooms: 2,
      adr: 2500,
      roomCharges: [
        {
          room: '101 - Delux Room',
          folio: 'FOL_5',
          guest: 'Mr Kkk Suthar',
          nrmlTariff: 2500,
          ofrdTariff: 2500,
          totalTax: 125,
          totalRent: 2625
        },
        {
          room: '102 - Delux Room',
          folio: 'FOL_4',
          guest: 'Mr Shankar Suthar',
          nrmlTariff: 2500,
          ofrdTariff: 2500,
          totalTax: 125,
          totalRent: 2625
        }
      ],
      checkedOutList: [],
      roomStatus: {
        total: 4,
        occupied: 2,
        dueOut: 0,
        vacant: 2,
        departed: 0,
        blocked: 0
      },
      paxStatus: [
        { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
        { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
        { status: 'Stayover', rooms: 2, adult: 2, child: 0 }
      ]
    };

    // 2. Start brand new current audit for 27 Oct 2026 (matches media_1793689740993_f7b0c90c.png row 1)
    const newCurrent27 = {
      id: 'na_20261027',
      date: '27 Oct 2026',
      auditDate: '27 Oct 2026',
      newBusinessDate: '28 Oct 2026',
      isCurrent: true,
      status: 'running',
      statusText: 'Running (Stage 1)',
      startedDate: 'Nov 3, 2026',
      startedHour: '12:04',
      startedTime: 'Nov 3, 2026 12:04',
      startedBy: 'shankar l',
      completedDate: '—',
      completedHour: '—',
      completedTime: '—',
      completedBy: '—',
      performedBy: 'shankar l',
      chargesPostedCount: 1,
      amountPosted: 2625,
      totalRevenue: 2625,
      totalTax: 125,
      occupiedRooms: 1,
      vacantRooms: 3,
      adr: 2500,
      roomCharges: [
        {
          room: '102 - Delux Room',
          folio: 'FOL_6',
          guest: 'Mr Krishna Suthar',
          nrmlTariff: 2500,
          ofrdTariff: 2500,
          totalTax: 125,
          totalRent: 2625
        }
      ],
      checkedOutList: [],
      roomStatus: {
        total: 4,
        occupied: 1,
        dueOut: 1,
        vacant: 2,
        departed: 0,
        blocked: 0
      },
      paxStatus: [
        { status: 'Arrived', rooms: 0, adult: 0, child: 0 },
        { status: 'Checked Out', rooms: 0, adult: 0, child: 0 },
        { status: 'Stayover', rooms: 1, adult: 1, child: 0 }
      ]
    };

    // Older audits (25 Oct, 24 Oct, 23 Oct, 22 Oct)
    const olderList = auditsList.filter(
      (a) => a.id !== 'na_20261026' && a.id !== 'na_20261027'
    );

    const updatedAuditsList = [newCurrent27, finalized26, ...olderList];

    // New Header & Metrics matching media_1793689740993_f7b0c90c.png
    const nextDateStr = '27 Oct 2026';
    const nextTimeStr = '12:25 PM';
    const nextPendingCount = '01';
    const nextDueText = '1 Rooms';
    const nextDueBadge = 'Action Required';
    const nextUnsettledText = '0';
    const nextUnsettledBadge = 'Clear';
    const initial27Rooms = [
      {
        id: 'rm_102',
        roomNumber: '102',
        resNo: '#RES_6',
        guest: 'Mr Krishna Suthar',
        arrival: '26 Oct 2026',
        departure: '27 Oct 2026',
        balance: '3,675.00',
        status: 'Due Out'
      }
    ];

    setAuditsList(updatedAuditsList);
    setDisplayDateStr(nextDateStr);
    setDisplayTimeStr(nextTimeStr);
    setPendingChecklistCount(nextPendingCount);
    setDueCheckoutsText(nextDueText);
    setDueCheckoutsBadge(nextDueBadge);
    setUnsettledFoliosText(nextUnsettledText);
    setUnsettledFoliosBadge(nextUnsettledBadge);
    setRoomStatusList(initial27Rooms);

    // Save session state to localStorage for persistence
    try {
      localStorage.setItem(
        NA_STORAGE_KEY,
        JSON.stringify({
          auditsList: updatedAuditsList,
          displayDateStr: nextDateStr,
          displayTimeStr: nextTimeStr,
          pendingChecklistCount: nextPendingCount,
          dueCheckoutsText: nextDueText,
          dueCheckoutsBadge: nextDueBadge,
          unsettledFoliosText: nextUnsettledText,
          unsettledFoliosBadge: nextUnsettledBadge,
          roomStatusList: initial27Rooms
        })
      );
    } catch (e) {
      // ignore
    }

    // Reset wizard stage and pending arrivals for the new day
    setProcessedNoShows(false);
    setPendingArrivals([
      {
        id: 'res_8',
        resNo: '#RES_8',
        guest: 'Mr Krishna Suthar',
        roomType: 'Delux Room',
        resType: 'Confirmed',
        source: 'WALKIN',
        departure: '28 Oct 2026',
        total: '2,625.00'
      }
    ]);
    setExecutionStage(1);
    setIsProcessing(false);
    setViewMode('history');
  };

  // View: Execution mode matching media_1793685818055_c28469b2.png
  if (viewMode === 'execution') {
    return (
      <div className="na-exec-container">
        {/* Page Header */}
        <div className="na-exec-header">
          <div>
            <h1 className="na-exec-title">Night Audit Execution</h1>
            <div className="na-exec-subtitle">
              {displayDateStr === '27 Oct 2026'
                ? isAuditFinished
                  ? 'Wednesday, October 28, 2026'
                  : 'Tuesday, October 27, 2026'
                : isAuditFinished
                ? 'Tuesday, October 27, 2026'
                : 'Monday, October 26, 2026'}
            </div>
          </div>
          <button
            type="button"
            className="na-exec-btn-history"
            onClick={() => {
              if (isAuditFinished) {
                handleCompleteAndContinue();
              } else {
                setViewMode('history');
              }
            }}
          >
            <RotateCcw size={15} />
            <span>View History</span>
          </button>
        </div>

        {/* Card 1: Progress Stepper */}
        <div className="na-exec-stepper-card">
          <div className="na-exec-stepper-header">
            <h2 className="na-exec-stage-title">
              {isAuditFinished ? 'Complete' : currentStageObj.name}
            </h2>
            <div className="na-exec-progress-info">
              <span className="na-exec-progress-label">Stage Progress</span>
              <span className="na-exec-progress-pct">
                {isAuditFinished ? '100%' : `${stageProgressPct}%`}
              </span>
            </div>
          </div>

          <div className="na-exec-stepper-track">
            <div className="na-exec-stepper-line" />
            <div
              className="na-exec-stepper-line-active"
              style={{
                width: isAuditFinished
                  ? 'calc(100% - 72px)'
                  : `calc((100% - 72px) * ${(executionStage - 1) / 5})`
              }}
            />
            {stages.map((stage) => {
              const isActive = !isAuditFinished && stage.id === executionStage;
              const isCompleted = isAuditFinished || stage.id < executionStage;

              return (
                <div key={stage.id} className="na-exec-step-node">
                  <div
                    className={`na-exec-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : stage.id}
                  </div>
                  <span
                    className={`na-exec-step-text ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning Banner on Stage 6 (hidden once finished) */}
        {!isAuditFinished && executionStage === 6 && (
          <div className="na-freeze-alert">
            <AlertTriangle size={18} className="na-freeze-alert-icon" />
            <div>
              <div className="na-freeze-alert-title">Warning: Data Freeze</div>
              <div className="na-freeze-alert-text">
                You are closing day - {displayDateStr === '27 Oct 2026' ? '27/10/2026' : '26/10/2026'}. After Night Audit, data for this date will be frozen. This action cannot be undone.
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Stage Content */}
        <div className="na-exec-content-card">
          {/* STAGE 1: Pending Reservations */}
          {executionStage === 1 && (
            <div>
              <div className="na-exec-content-top">
                <h3 className="na-exec-content-title">Pending Arrivals</h3>
                <div className="na-exec-search-wrapper">
                  <Search size={15} className="na-exec-search-icon" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="na-exec-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="na-exec-table-wrapper">
                <table className="na-exec-table">
                  <thead>
                    <tr>
                      <th style={{ width: '13%' }}>Res No#</th>
                      <th style={{ width: '18%' }}>Guest</th>
                      <th style={{ width: '16%' }}>Room Type</th>
                      <th style={{ width: '13%' }}>Res. Type</th>
                      <th style={{ width: '12%' }}>Source</th>
                      <th style={{ width: '14%' }}>Departure</th>
                      <th style={{ width: '10%' }}>Total</th>
                      <th style={{ width: '4%', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingArrivals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            textAlign: 'center',
                            padding: '44px 0',
                            color: '#64748b',
                            fontSize: '13.5px'
                          }}
                        >
                          No pending reservations.
                        </td>
                      </tr>
                    ) : (
                      pendingArrivals.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="na-exec-res-link">{item.resNo}</span>
                          </td>
                          <td style={{ fontWeight: 500, color: '#1e293b' }}>
                            {item.guest}
                          </td>
                          <td>{item.roomType}</td>
                          <td>
                            <span className="na-exec-badge-confirmed">
                              {item.resType}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500, color: '#475569' }}>{item.source}</td>
                          <td>{item.departure}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.total}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="na-exec-btn-dots">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pendingArrivals.length > 0 && (
                <div className="na-exec-pagination-bar">
                  <div className="na-exec-pagination-info">
                    Showing <strong>1–1</strong> of <strong>1</strong> results
                  </div>
                  <div className="na-exec-pagination-controls">
                    <div className="na-exec-page-arrow">&lt;</div>
                    <div className="na-exec-page-num">1</div>
                    <div className="na-exec-page-arrow">&gt;</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: Release Reservations */}
          {executionStage === 2 && (
            <div>
              <div className="na-exec-content-top">
                <h3 className="na-exec-content-title">Release Reservations</h3>
                <div className="na-exec-search-wrapper">
                  <Search size={15} className="na-exec-search-icon" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="na-exec-search-input"
                  />
                </div>
              </div>

              <div className="na-exec-table-wrapper">
                <table className="na-exec-table">
                  <thead>
                    <tr>
                      <th>Res No#</th>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Rate Plan</th>
                      <th>Res. Type</th>
                      <th>Release Cutoff</th>
                      <th>Departure</th>
                      <th>Total</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '44px 0', color: '#64748b', fontSize: '13.5px' }}>
                        No release reservations found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 3: Room Status */}
          {executionStage === 3 && (
            <div>
              <div className="na-exec-content-top">
                <h3 className="na-exec-content-title">Room Status</h3>
                <div className="na-exec-search-wrapper">
                  <Search size={15} className="na-exec-search-icon" />
                  <input
                    type="text"
                    placeholder="Search guests..."
                    className="na-exec-search-input"
                  />
                </div>
              </div>

              <div className="na-exec-table-wrapper">
                <table className="na-exec-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Room</th>
                      <th style={{ width: '14%' }}>Reservation</th>
                      <th style={{ width: '18%' }}>Guest</th>
                      <th style={{ width: '14%' }}>Arrival</th>
                      <th style={{ width: '14%' }}>Departure</th>
                      <th style={{ width: '12%' }}>Balance</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '6%', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomStatusList.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>{item.roomNumber}</span>
                        </td>
                        <td>
                          <span className="na-exec-res-link">{item.resNo}</span>
                        </td>
                        <td style={{ fontWeight: 500, color: '#1e293b' }}>{item.guest}</td>
                        <td>{item.arrival}</td>
                        <td>{item.departure}</td>
                        <td>
                          <span
                            style={{
                              color:
                                item.balance === '0.00' || parseFloat(String(item.balance || '0').replace(/,/g, '')) <= 0
                                  ? '#059669'
                                  : '#dc2626',
                              fontWeight: 700
                            }}
                          >
                            {item.balance}
                          </span>
                        </td>
                        <td>
                          {item.status === 'Due Out' ? (
                            <span
                              className="na-exec-badge-dueout"
                              title="Click to Amend Stay"
                              onClick={() => {
                                setSelectedAmendRoom(item);
                                setAmendCheckOutDate('28/10/2026');
                                setIsAmendStayOpen(true);
                              }}
                            >
                              Due Out
                            </span>
                          ) : item.status === 'Check Out Failed' ? (
                            <span
                              className="na-exec-badge-failed"
                              title="Checkout failed due to unpaid balance. Click to Amend Stay or Settle Balance."
                              onClick={() => {
                                setSelectedAmendRoom(item);
                                setAmendCheckOutDate('28/10/2026');
                                setIsAmendStayOpen(true);
                              }}
                            >
                              <AlertTriangle size={12} strokeWidth={2.4} />
                              <span>Check Out Failed</span>
                            </span>
                          ) : item.status === 'Checked Out' ? (
                            <span className="na-exec-badge-checkedout">
                              <Check size={12} strokeWidth={2.8} />
                              <span>Checked Out</span>
                            </span>
                          ) : (
                            <span className="na-exec-badge-inhouse">{item.status}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', position: 'relative' }}>
                          <button
                            type="button"
                            className="na-exec-btn-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionRowId(openActionRowId === item.id ? null : item.id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openActionRowId === item.id && (
                            <div className="na-exec-action-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="na-exec-menu-item"
                                onClick={() => {
                                  setOpenActionRowId(null);
                                  setSelectedAmendRoom(item);
                                  setAmendCheckOutDate('28/10/2026');
                                  setIsAmendStayOpen(true);
                                }}
                              >
                                <Calendar size={15} className="na-exec-menu-icon" />
                                <span>Amend Stay</span>
                              </button>

                              {parseFloat(String(item.balance || '0').replace(/,/g, '')) > 0 && (
                                <button
                                  type="button"
                                  className="na-exec-menu-item"
                                  onClick={() => {
                                    setOpenActionRowId(null);
                                    handleSettleBalance(item.id);
                                  }}
                                >
                                  <CreditCard size={15} className="na-exec-menu-icon" />
                                  <span>Settle Balance ({item.balance})</span>
                                </button>
                              )}

                              <button
                                type="button"
                                className="na-exec-menu-item danger"
                                onClick={() => {
                                  setOpenActionRowId(null);
                                  handleCheckoutRoom(item.id);
                                }}
                              >
                                <LogOut size={15} className="na-exec-menu-icon" />
                                <span>Checkout</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="na-exec-pagination-bar">
                <div className="na-exec-pagination-info">
                  Showing <strong>1–1</strong> of <strong>1</strong> results
                </div>
                <div className="na-exec-pagination-controls">
                  <div className="na-exec-page-arrow">&lt;</div>
                  <div className="na-exec-page-num">1</div>
                  <div className="na-exec-page-arrow">&gt;</div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: Unsettled Folios */}
          {executionStage === 4 && (
            <div>
              <div className="na-exec-content-top">
                <h3 className="na-exec-content-title">Unsettled Folios</h3>
                <div className="na-exec-search-wrapper">
                  <Search size={15} className="na-exec-search-icon" />
                  <input
                    type="text"
                    placeholder="Search guests..."
                    className="na-exec-search-input"
                  />
                </div>
              </div>

              <div className="na-exec-table-wrapper">
                <table className="na-exec-table">
                  <thead>
                    <tr>
                      <th>Res No#</th>
                      <th>Folio</th>
                      <th>Guest</th>
                      <th>Arrival</th>
                      <th>Departure</th>
                      <th>Status</th>
                      <th>Balance</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '52px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                            <Search size={22} strokeWidth={1.8} />
                          </div>
                          <span style={{ color: '#64748b', fontSize: '13.5px' }}>
                            No unsettled folios found matching your search.
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 5: Nightly Charge */}
          {executionStage === 5 && (
            <div>
              <div className="na-exec-content-top">
                <h3 className="na-exec-content-title">Nightly Charge</h3>
                <div className="na-exec-search-wrapper">
                  <Search size={15} className="na-exec-search-icon" />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    className="na-exec-search-input"
                  />
                </div>
              </div>

              <div className="na-exec-table-wrapper">
                <table className="na-exec-table">
                  <thead>
                    <tr>
                      <th>Res No#</th>
                      <th>Room Amount</th>
                      <th>Tax Amount</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '52px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                            <Search size={22} strokeWidth={1.8} />
                          </div>
                          <span style={{ color: '#64748b', fontSize: '13.5px' }}>
                            No unposted nightly charges — everything is already posted.
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 6: Create New Day */}
          {executionStage === 6 && (
            <div style={{ padding: '60px 24px 80px 24px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Finalize Business Date
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 36px 0' }}>
                All wizard stages are clear. Confirm to roll the business date over.
              </p>

              <div style={{ maxWidth: '340px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: '#64748b' }}>Current Business Date:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {displayDateStr === '27 Oct 2026' ? '27/10/2026' : '26/10/2026'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>New Business Date:</span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>
                    {displayDateStr === '27 Oct 2026' ? '28/10/2026' : '27/10/2026'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Bottom Action Bar */}
        <div className="na-exec-action-card">
          <button
            type="button"
            className="na-exec-btn-prev"
            disabled={executionStage === 1}
            onClick={() => setExecutionStage((s) => Math.max(1, s - 1))}
          >
            &lt; Previous Stage
          </button>
          <div className="na-exec-action-right">
            {executionStage === 1 && !processedNoShows && pendingArrivals.length > 0 && (
              <button
                type="button"
                className="na-exec-btn-noshow"
                onClick={() => setIsNoShowsModalOpen(true)}
              >
                Process All No-Shows
              </button>
            )}

            {executionStage === 5 && (
              <button
                type="button"
                className="na-exec-btn-post"
              >
                Post
              </button>
            )}

            {executionStage === 6 ? (
              <button
                type="button"
                className="na-exec-btn-finish"
                onClick={handleFinishNightAuditClick}
                disabled={isProcessing}
              >
                <span>{isProcessing ? 'Finalizing...' : 'Finish Night Audit'}</span>
                <Check size={16} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                type="button"
                className={`na-exec-btn-next ${!isNextDisabled ? 'primary-active' : ''}`}
                disabled={isNextDisabled}
                title={
                  isNextDisabled
                    ? executionStage === 3
                      ? 'Please amend stay or checkout due out rooms before proceeding'
                      : 'Please process pending no-shows before proceeding'
                    : undefined
                }
                onClick={() => {
                  if (isNextDisabled) return;
                  setExecutionStage((s) => Math.min(6, s + 1));
                }}
              >
                Next Stage
              </button>
            )}
          </div>
        </div>

        {/* Toast Notification matching media_1793687395762_f74f5cc4.png */}
        {showNoShowToast && (
          <div className="na-exec-toast">
            <div className="na-exec-toast-icon">
              <CheckCircle2 size={18} strokeWidth={2.3} />
            </div>
            <span className="na-exec-toast-text">No-show processing complete</span>
            <button
              type="button"
              className="na-exec-toast-close"
              onClick={() => setShowNoShowToast(false)}
              aria-label="Close toast"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Process All No-Shows Confirmation Modal matching media_1793687276467_c72a16e1.png */}
        {isNoShowsModalOpen && (
          <div className="na-noshow-overlay" onClick={() => setIsNoShowsModalOpen(false)}>
            <div className="na-noshow-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="na-noshow-title">Process All No-Shows</h3>
              <p className="na-noshow-desc">
                Mark all 1 pending reservation(s) as no-show? This cannot be undone.
              </p>
              <div className="na-noshow-actions">
                <button
                  type="button"
                  className="na-noshow-btn-cancel"
                  onClick={() => setIsNoShowsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="na-noshow-btn-confirm"
                  onClick={handleConfirmProcessNoShows}
                >
                  Process All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Night Audit Complete Modal matching media_1793688171192_0cd5377a.png */}
        {isCompleteModalOpen && (
          <div className="na-complete-overlay" onClick={() => setIsCompleteModalOpen(false)}>
            <div className="na-complete-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="na-complete-close"
                onClick={() => setIsCompleteModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="na-complete-icon-badge">
                <CheckCircle2 size={30} strokeWidth={2.2} />
              </div>

              <h3 className="na-complete-title">Night Audit Complete!</h3>
              <p className="na-complete-subtitle">
                The business date has been successfully rolled over to{' '}
                <strong>{displayDateStr === '27 Oct 2026' ? '28 Oct 2026' : '27 Oct 2026'}</strong>.
              </p>

              <div className="na-complete-card">
                <div className="na-complete-row">
                  <span className="na-complete-row-label">New Business Date</span>
                  <span className="na-complete-row-val">
                    {displayDateStr === '27 Oct 2026' ? '28 Oct 2026' : '27 Oct 2026'}
                  </span>
                </div>
                <div className="na-complete-row">
                  <span className="na-complete-row-label">Status</span>
                  <span className="na-complete-status">
                    <span className="na-complete-status-dot">●</span>
                    <span>Processed</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="na-complete-btn-continue"
                onClick={handleCompleteAndContinue}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Amend Stay Modal matching media_1793692779363_2465adcc.png */}
        {isAmendStayOpen && (
          <div className="na-amend-overlay" onClick={() => setIsAmendStayOpen(false)}>
            <div className="na-amend-modal" onClick={(e) => e.stopPropagation()}>
              <div className="na-amend-header">
                <div className="na-amend-header-left">
                  <div className="na-amend-icon-badge">
                    <Calendar size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="na-amend-title">Amend Stay</h3>
                    <p className="na-amend-subtitle">
                      Room {selectedAmendRoom?.roomNumber || '102'} — {selectedAmendRoom?.guest || 'Mr Krishna Suthar'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="na-amend-close"
                  onClick={() => setIsAmendStayOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="na-amend-body">
                <p className="na-amend-desc">
                  Current scheduled check-out is <strong>{selectedAmendRoom?.departure || '27 Oct 2026'}</strong>.
                </p>

                <label className="na-amend-label">New Check-out Date</label>
                <div className="na-amend-input-wrapper">
                  <input
                    type="text"
                    className="na-amend-input"
                    value={amendCheckOutDate}
                    onChange={(e) => setAmendCheckOutDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                  <input
                    type="date"
                    ref={hiddenDateInputRef}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-');
                        setAmendCheckOutDate(`${d}/${m}/${y}`);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="na-amend-input-icon-btn"
                    onClick={() => {
                      try {
                        hiddenDateInputRef.current?.showPicker();
                      } catch (err) {
                        // ignore
                      }
                    }}
                    title="Choose Date"
                  >
                    <Calendar size={18} />
                  </button>
                </div>

                <div className="na-amend-actions">
                  <button
                    type="button"
                    className="na-amend-btn-cancel"
                    onClick={() => setIsAmendStayOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="na-amend-btn-submit"
                    onClick={handleConfirmAmendStay}
                  >
                    Amend Stay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Amend Stay Toast Notification */}
        {showAmendToast && (
          <div className="na-exec-toast">
            <div className="na-exec-toast-icon">
              <CheckCircle2 size={18} strokeWidth={2.3} />
            </div>
            <span className="na-exec-toast-text">Stay amended successfully — room status updated to In House</span>
            <button
              type="button"
              className="na-exec-toast-close"
              onClick={() => setShowAmendToast(false)}
              aria-label="Close toast"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Checkout Notification Toast (Failed, Success, or Settled) */}
        {checkoutNotice && (
          <div className={`na-exec-toast ${checkoutNotice.type === 'failed' ? 'danger' : ''}`}>
            <div className={`na-exec-toast-icon ${checkoutNotice.type === 'failed' ? 'danger' : ''}`}>
              {checkoutNotice.type === 'failed' ? (
                <AlertTriangle size={18} strokeWidth={2.3} />
              ) : (
                <CheckCircle2 size={18} strokeWidth={2.3} />
              )}
            </div>
            <span className="na-exec-toast-text">{checkoutNotice.message}</span>
            <button
              type="button"
              className="na-exec-toast-close"
              onClick={() => setCheckoutNotice(null)}
              aria-label="Close toast"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="night-audit-page">
      {/* 1. Header: Night Audit — 26 Oct 2026 & System Time: 11:09 AM */}
      <div className="night-audit-header">
        <h1 className="night-audit-title">
          <span>Night Audit</span>
          <span className="night-audit-dash">—</span>
          <span>{displayDateStr}</span>
        </h1>
        <div className="night-audit-subtitle">
          System Time: {displayTimeStr}
        </div>
      </div>

      {/* 2. Top 3 Metric Cards */}
      <div className="night-audit-metrics-grid">
        {/* Card 1: Audit Checklist */}
        <div className="night-audit-metric-card">
          <div className="night-audit-card-top">
            <div className="night-audit-icon-badge night-audit-icon-emerald">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                fact_check
              </span>
            </div>
            <span
              className={
                pendingChecklistCount === '00'
                  ? 'night-audit-pill-clear'
                  : 'night-audit-pill-pending'
              }
            >
              {pendingChecklistCount === '00' ? 'Clear' : '1 Pending'}
            </span>
          </div>
          <div>
            <div className="night-audit-card-label">Audit Checklist</div>
            <div className="night-audit-card-val">{pendingChecklistCount}</div>
          </div>
        </div>

        {/* Card 2: Due Checkouts */}
        <div className="night-audit-metric-card">
          <div className="night-audit-card-top">
            <div className="night-audit-icon-badge night-audit-icon-amber">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                logout
              </span>
            </div>
            <span
              className={
                dueCheckoutsBadge === 'Action Required'
                  ? 'night-audit-pill-action'
                  : 'night-audit-pill-clear'
              }
            >
              {dueCheckoutsBadge}
            </span>
          </div>
          <div>
            <div className="night-audit-card-label">Due Checkouts</div>
            <div className="night-audit-card-val">{dueCheckoutsText}</div>
          </div>
        </div>

        {/* Card 3: Unsettled Folios */}
        <div className="night-audit-metric-card">
          <div className="night-audit-card-top">
            <div className="night-audit-icon-badge night-audit-icon-rose">
              <span className="material-symbols-outlined select-none" style={{ fontSize: '20px' }}>
                receipt_long
              </span>
            </div>
            <span
              className={
                unsettledFoliosBadge === 'Action Required'
                  ? 'night-audit-pill-action'
                  : 'night-audit-pill-clear'
              }
            >
              {unsettledFoliosBadge}
            </span>
          </div>
          <div>
            <div className="night-audit-card-label">Unsettled Folios</div>
            <div className="night-audit-card-val">{unsettledFoliosText}</div>
          </div>
        </div>
      </div>

      {/* 3. Audit Checklist & History Card */}
      <div className="night-audit-table-card">
        {/* Card Header Row */}
        <div className="night-audit-table-header">
          <div className="night-audit-table-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8l3 3 5-5" />
              <path d="M14 7h6" />
              <path d="M14 11h6" />
            </svg>
          </div>
          <h2 className="night-audit-table-title">Audit Checklist & History</h2>
        </div>

        {/* Table Viewport */}
        <div className="night-audit-table-wrapper">
          <table className="night-audit-table">
            <thead>
              <tr>
                <th style={{ width: '16%' }}>Date</th>
                <th style={{ width: '18%' }}>Audit Status</th>
                <th style={{ width: '22%' }}>Started</th>
                <th style={{ width: '18%' }}>Completed</th>
                <th style={{ width: '14%' }}>Completed By</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {auditsList.map((audit) => {
                const isRunning = audit.status === 'running';

                return (
                  <tr key={audit.id}>
                    {/* 1. Date */}
                    <td>
                      <div className="night-audit-date-primary">{audit.date}</div>
                      {audit.isCurrent && (
                        <div className="night-audit-subtext">Current Audit</div>
                      )}
                    </td>

                    {/* 2. Audit Status */}
                    <td>
                      {isRunning ? (
                        <span className="night-audit-badge-running">
                          <span className="night-audit-dot-running" />
                          <span>{audit.statusText}</span>
                        </span>
                      ) : (
                        <span className="night-audit-badge-completed">
                          <CheckCircle2 size={13} strokeWidth={2.3} />
                          <span>{audit.statusText}</span>
                        </span>
                      )}
                    </td>

                    {/* 3. Started */}
                    <td>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>{audit.startedTime}</div>
                      <div className="night-audit-subtext">by {audit.startedBy}</div>
                    </td>

                    {/* 4. Completed */}
                    <td>
                      <span style={{ color: audit.completedTime === '—' ? '#94a3b8' : '#1e293b', fontWeight: 500 }}>
                        {audit.completedTime}
                      </span>
                    </td>

                    {/* 5. Completed By */}
                    <td>
                      <span style={{ color: audit.completedBy === '—' ? '#94a3b8' : '#1e293b', fontWeight: 500 }}>
                        {audit.completedBy}
                      </span>
                    </td>

                    {/* 6. Action */}
                    <td style={{ textAlign: 'right' }}>
                      {isRunning ? (
                        <button
                          type="button"
                          className="night-audit-btn-continue"
                          onClick={() => {
                            setViewMode('execution');
                            setExecutionStage(1);
                            setProcessedNoShows(false);
                            setPendingArrivals([
                              {
                                id: audit.date === '27 Oct 2026' ? 'res_8' : 'res_7',
                                resNo: audit.date === '27 Oct 2026' ? '#RES_8' : '#RES_7',
                                guest: 'Mr Krishna Suthar',
                                roomType: 'Delux Room',
                                resType: 'Confirmed',
                                source: 'WALKIN',
                                departure: audit.date === '27 Oct 2026' ? '28 Oct 2026' : '27 Oct 2026',
                                total: '2,625.00'
                              }
                            ]);
                            if (dueCheckoutsText === '1 Rooms') {
                              setRoomStatusList([
                                {
                                  id: 'rm_102',
                                  roomNumber: '102',
                                  resNo: '#RES_6',
                                  guest: 'Mr Krishna Suthar',
                                  arrival: '26 Oct 2026',
                                  departure: '27 Oct 2026',
                                  balance: '3,675.00',
                                  status: 'Due Out'
                                }
                              ]);
                            }
                          }}
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="night-audit-btn-details"
                          onClick={() => setSelectedAudit(audit)}
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Audit Drilldown Modal */}
      {selectedAudit && (
        <NightAuditDetailModal
          isOpen={!!selectedAudit}
          onClose={() => setSelectedAudit(null)}
          auditRecord={selectedAudit}
          property={property}
        />
      )}
    </div>
  );
}
