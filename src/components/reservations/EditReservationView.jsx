import React, { useState, useEffect, useMemo, useRef } from 'react';
import './edit-reservation.css';
import {
  ArrowLeft,
  Home,
  Plus,
  Crown,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  User,
  Smile,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  MoreVertical,
  PlusCircle,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Star,
  Upload,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Ban,
  Trash2,
  Pencil,
  X,
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import { pmsStore } from '../../services/pmsStore';
import { uploadGuestIdDocument } from '../../services/firebaseStorage';
import GuestCheckInModal from './GuestCheckInModal';
import GuestCheckOutModal from './GuestCheckOutModal';
import VoidPaymentModal from '../folios/VoidPaymentModal';
import AddPaymentModal from '../folios/AddPaymentModal';
import AddChargeModal from '../folios/AddChargeModal';
import CustomDatePicker from '../common/CustomDatePicker';
import CountrySelect from '../common/CountrySelect';
import SearchableSelect from '../common/SearchableSelect';
import CustomTimePickerModal from '../common/CustomTimePickerModal';
import { getStatesForCountry, getCitiesForState } from '../../data/geoData';

/**
 * EditReservationView Component
 * Rebuilt exactly according to OTAL PMS Front-Desk Lifecycle specifications
 */
export default function EditReservationView({
  reservation = {},
  property = {},
  rooms = [],
  roomTypes = [],
  onBack,
  onNavigate,
  onSave,
  onAssignRoom,
  onCheckIn,
  onCheckOut,
  onPostPendingCharges,
  onAddFolioCharge,
  onAddFolioPayment,
  onVoidPayment,
  onAddFolioTransaction,
  onSettleFolio
}) {
  const [activeTab, setActiveTab] = useState('guest'); // 'guest' | 'booking' | 'folio' | 'charges' | 'audit'

  // Sub-sidebar accordion state
  const [isRoomAccordionOpen, setIsRoomAccordionOpen] = useState(true);

  // Helper to extract clean guest form data without auto-filling fake or sample details
  const extractGuestForm = (res) => {
    const pg = res?.primaryGuest || {};
    let fName = pg.firstName || '';
    let lName = pg.lastName || '';
    if (!fName && pg.name) {
      const parts = pg.name.trim().split(' ');
      if (['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Mr', 'Mrs', 'Ms', 'Dr'].includes(parts[0])) {
        fName = parts[1] || '';
        lName = parts.slice(2).join(' ') || '';
      } else {
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      }
    }

    return {
      title: pg.title || 'Mr.',
      firstName: fName,
      lastName: lName,
      mobile: pg.phone || pg.mobile || '',
      countryCode: pg.countryCode || '+91',
      email: pg.email || '',
      birthDate: pg.birthDate || '',
      nationality: pg.nationality || '',
      gender: pg.gender || '',
      guestType: pg.guestType || 'Adult',
      isPrimary: pg.isPrimary !== undefined ? pg.isPrimary : true,
      isVIP: !!(res?.isVIP || pg.isVIP),
      address: pg.address || '',
      zip: pg.zip || '',
      country: pg.country || '',
      state: pg.state || '',
      city: pg.city || '',
      idNumber: pg.idNumber || '',
      idType: pg.idType || '',
      issuingCountry: pg.issuingCountry || '',
      issuingCity: pg.issuingCity || '',
      expiryDate: pg.expiryDate || '',
      idDocumentUrl: pg.idDocumentUrl || pg.idPhoto || '',
      idDocumentName: pg.idDocumentName || '',
      idStoragePath: pg.idStoragePath || ''
    };
  };

  // Editable Form State: Guest Details (loads only real data, without automatic fake filler values)
  const [guestForm, setGuestForm] = useState(() => extractGuestForm(reservation));

  // Sync form state whenever active reservation changes
  useEffect(() => {
    if (reservation?.id) {
      setGuestForm(extractGuestForm(reservation));
    }
  }, [reservation?.id, reservation?.bookingReference]);

  // Dynamic State & City options based on selected Country and State
  const stateOptions = useMemo(() => {
    return getStatesForCountry(guestForm.country);
  }, [guestForm.country]);

  const cityOptions = useMemo(() => {
    return getCitiesForState(guestForm.state);
  }, [guestForm.state]);

  // Guest List view toggle (Image 1 & 2)
  const [showGuestList, setShowGuestList] = useState(false);

  // Additional Guests list
  const [additionalGuests, setAdditionalGuests] = useState(() => {
    if (Array.isArray(reservation.additionalGuests) && reservation.additionalGuests.length > 0) {
      return reservation.additionalGuests;
    }
    return [];
  });

  // Arrival & Departure Time editing (Image 8)
  const [checkInTime, setCheckInTime] = useState(reservation.checkInTime || '12:30');
  const [checkOutTime, setCheckOutTime] = useState(reservation.checkOutTime || '11:00');
  const [editingTimeType, setEditingTimeType] = useState(null); // 'checkIn' | 'checkOut' | null

  const primaryNameDisplay = `${guestForm.firstName || ''} ${guestForm.lastName || ''}`.trim();

  const handlePrimaryNameInput = (val) => {
    const parts = val.trimStart().split(' ');
    setGuestForm((prev) => ({
      ...prev,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    }));
  };

  const handleAddGuestRow = () => {
    setAdditionalGuests((prev) => [
      ...prev,
      {
        id: `guest_${Date.now()}`,
        title: 'Mr.',
        name: '',
        mobile: '',
        email: '',
        idType: 'Aadhaar Card',
        idNumber: '',
        idDocumentUrl: ''
      }
    ]);
  };

  const handleUpdateAdditionalGuest = (index, field, value) => {
    setAdditionalGuests((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveAdditionalGuest = (index) => {
    if (editingSharerIndex === index) {
      setEditingSharerIndex(null);
    } else if (editingSharerIndex !== null && editingSharerIndex > index) {
      setEditingSharerIndex(editingSharerIndex - 1);
    }
    setAdditionalGuests((prev) => prev.filter((_, i) => i !== index));
  };

  // ID Upload States
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [lightboxPreview, setLightboxPreview] = useState(null); // { url, title, idNumber }
  const fileInputRef = useRef(null);

  const handleIdFileUpload = (file, guestIndex = 'primary') => {
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller photo or document.');
      return;
    }

    // 1. Read locally as Base64 DataURL for instant zero-lag rendering
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;
      const fileName = file.name || 'id_proof.jpg';

      if (guestIndex === 'primary') {
        setGuestForm((prev) => ({
          ...prev,
          idDocumentUrl: dataUrl,
          idDocumentName: fileName
        }));
        // Update store immediately with local dataURL fallback
        pmsStore.updateReservation(currentRes.id, {
          primaryGuest: {
            ...(currentRes.primaryGuest || {}),
            idDocumentUrl: dataUrl,
            idDocumentName: fileName
          }
        });
      } else {
        handleUpdateAdditionalGuest(guestIndex, 'idDocumentUrl', dataUrl);
        handleUpdateAdditionalGuest(guestIndex, 'idDocumentName', fileName);
      }

      // 2. Upload asynchronously to Firebase Cloud Storage
      try {
        setIsUploadingId(true);
        const res = await uploadGuestIdDocument(
          'prop_astha_01',
          currentRes.id || 'res_guest',
          file,
          guestIndex === 'primary' ? (guestForm.idType || 'kyc') : 'kyc'
        );

        if (res?.url) {
          if (guestIndex === 'primary') {
            setGuestForm((prev) => ({
              ...prev,
              idDocumentUrl: res.url,
              idDocumentName: fileName,
              idStoragePath: res.path
            }));
            pmsStore.updateReservation(currentRes.id, {
              primaryGuest: {
                ...(currentRes.primaryGuest || {}),
                idDocumentUrl: res.url,
                idDocumentName: fileName,
                idStoragePath: res.path
              }
            });
          } else {
            handleUpdateAdditionalGuest(guestIndex, 'idDocumentUrl', res.url);
            handleUpdateAdditionalGuest(guestIndex, 'idStoragePath', res.path);
          }
        }
      } catch (uploadErr) {
        console.warn('[Firebase Storage] Offline or upload notice (saved locally as DataURL):', uploadErr.message);
      } finally {
        setIsUploadingId(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveIdPhoto = (e, guestIndex = 'primary') => {
    e.stopPropagation();
    if (isLocked) return;
    if (window.confirm('Are you sure you want to remove the uploaded ID photo?')) {
      if (guestIndex === 'primary') {
        setGuestForm((prev) => ({
          ...prev,
          idDocumentUrl: '',
          idDocumentName: '',
          idStoragePath: ''
        }));
        pmsStore.updateReservation(currentRes.id, {
          primaryGuest: {
            ...(currentRes.primaryGuest || {}),
            idDocumentUrl: '',
            idDocumentName: '',
            idStoragePath: ''
          }
        });
      } else {
        handleUpdateAdditionalGuest(guestIndex, 'idDocumentUrl', '');
        handleUpdateAdditionalGuest(guestIndex, 'idDocumentName', '');
        handleUpdateAdditionalGuest(guestIndex, 'idStoragePath', '');
      }
    }
  };

  // Add & Edit Room Sharer State
  const [showAddSharerTooltip, setShowAddSharerTooltip] = useState(false);
  const [isAddingSharer, setIsAddingSharer] = useState(false);
  const [editingSharerIndex, setEditingSharerIndex] = useState(null);
  const [isUploadingSharerId, setIsUploadingSharerId] = useState(false);
  const addSharerRef = useRef(null);
  const sharerFileInputRef = useRef(null);

  const initialSharerState = {
    title: '',
    firstName: '',
    lastName: '',
    mobile: '',
    countryCode: '+91',
    email: '',
    birthDate: '',
    nationality: '',
    gender: '',
    guestType: '',
    isPrimary: false,
    isVIP: false,
    address: '',
    zip: '',
    country: '',
    state: '',
    city: '',
    idNumber: '',
    idType: '',
    issuingCountry: '',
    issuingCity: '',
    expiryDate: '',
    idDocumentUrl: '',
    idDocumentName: '',
    idStoragePath: ''
  };

  const [sharerForm, setSharerForm] = useState(initialSharerState);

  const sharerStateOptions = useMemo(() => {
    return getStatesForCountry(sharerForm.country);
  }, [sharerForm.country]);

  const sharerCityOptions = useMemo(() => {
    return getCitiesForState(sharerForm.state);
  }, [sharerForm.state]);

  // Click outside to close Add Sharer popover
  useEffect(() => {
    function handleClickOutsideSharer(e) {
      if (addSharerRef.current && !addSharerRef.current.contains(e.target)) {
        setShowAddSharerTooltip(false);
      }
    }
    if (showAddSharerTooltip) {
      document.addEventListener('mousedown', handleClickOutsideSharer);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSharer);
    };
  }, [showAddSharerTooltip]);

  const handleOpenAddSharer = () => {
    setShowAddSharerTooltip(false);
    setShowGuestList(false);
    setEditingSharerIndex(null);
    setSharerForm(initialSharerState);
    setIsAddingSharer(true);
  };

  const handleSelectSharerToEdit = (idx) => {
    setShowAddSharerTooltip(false);
    setShowGuestList(false);
    setIsAddingSharer(false);
    setEditingSharerIndex(idx);
    const target = additionalGuests[idx];
    if (target) {
      const rawName = target.name || '';
      const nameParts = rawName.split(' ').filter(Boolean);
      let derivedTitle = target.title || 'Mr.';
      let derivedFirst = target.firstName || '';
      let derivedLast = target.lastName || '';

      if (!derivedFirst && nameParts.length > 0) {
        if (['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Mr', 'Mrs', 'Ms', 'Dr'].includes(nameParts[0])) {
          derivedTitle = nameParts[0].endsWith('.') ? nameParts[0] : `${nameParts[0]}.`;
          derivedFirst = nameParts[1] || '';
          derivedLast = nameParts.slice(2).join(' ') || '';
        } else {
          derivedFirst = nameParts[0] || '';
          derivedLast = nameParts.slice(1).join(' ') || '';
        }
      }

      setSharerForm({
        ...initialSharerState,
        ...target,
        title: derivedTitle,
        firstName: derivedFirst,
        lastName: derivedLast,
        mobile: target.mobile || '',
        countryCode: target.countryCode || '+91',
        email: target.email || '',
        birthDate: target.birthDate || '',
        nationality: target.nationality || '',
        gender: target.gender || '',
        guestType: target.guestType || 'Adult',
        isPrimary: !!target.isPrimary,
        isVIP: !!target.isVIP,
        address: target.address || '',
        zip: target.zip || '',
        country: target.country || '',
        state: target.state || '',
        city: target.city || '',
        idNumber: target.idNumber || '',
        idType: target.idType || 'Aadhaar Card',
        issuingCountry: target.issuingCountry || '',
        issuingCity: target.issuingCity || '',
        expiryDate: target.expiryDate || '',
        idDocumentUrl: target.idDocumentUrl || '',
        idDocumentName: target.idDocumentName || '',
        idStoragePath: target.idStoragePath || ''
      });
    }
  };

  const handleSharerIdUpload = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller photo or document.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl) return;
      const fileName = file.name || 'id_proof.jpg';
      setSharerForm((prev) => ({
        ...prev,
        idDocumentUrl: dataUrl,
        idDocumentName: fileName
      }));

      try {
        setIsUploadingSharerId(true);
        const res = await uploadGuestIdDocument(
          'prop_astha_01',
          currentRes.id || 'res_guest',
          file,
          sharerForm.idType || 'kyc'
        );
        if (res?.url) {
          setSharerForm((prev) => ({
            ...prev,
            idDocumentUrl: res.url,
            idDocumentName: fileName,
            idStoragePath: res.path
          }));
        }
      } catch (err) {
        console.warn('Storage upload fallback to base64:', err.message);
      } finally {
        setIsUploadingSharerId(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSharerIdPhoto = (e) => {
    e.stopPropagation();
    setSharerForm((prev) => ({
      ...prev,
      idDocumentUrl: '',
      idDocumentName: '',
      idStoragePath: ''
    }));
  };

  const handleSaveSharer = () => {
    if (!sharerForm.firstName.trim()) {
      alert('Please enter First Name for the room sharer.');
      return;
    }

    const newSharer = {
      id: (editingSharerIndex !== null && additionalGuests[editingSharerIndex]?.id)
        ? additionalGuests[editingSharerIndex].id
        : `sharer_${Date.now()}`,
      title: sharerForm.title || 'Mr.',
      name: `${sharerForm.title ? sharerForm.title + ' ' : ''}${sharerForm.firstName} ${sharerForm.lastName}`.trim(),
      firstName: sharerForm.firstName.trim(),
      lastName: sharerForm.lastName.trim(),
      mobile: sharerForm.mobile.trim(),
      countryCode: sharerForm.countryCode || '+91',
      email: sharerForm.email.trim(),
      birthDate: sharerForm.birthDate,
      nationality: sharerForm.nationality,
      gender: sharerForm.gender,
      guestType: sharerForm.guestType,
      isPrimary: sharerForm.isPrimary,
      isVIP: sharerForm.isVIP,
      address: sharerForm.address,
      zip: sharerForm.zip,
      country: sharerForm.country,
      state: sharerForm.state,
      city: sharerForm.city,
      idNumber: sharerForm.idNumber,
      idType: sharerForm.idType || 'Aadhaar Card',
      issuingCountry: sharerForm.issuingCountry,
      issuingCity: sharerForm.issuingCity,
      expiryDate: sharerForm.expiryDate,
      idDocumentUrl: sharerForm.idDocumentUrl,
      idDocumentName: sharerForm.idDocumentName,
      idStoragePath: sharerForm.idStoragePath
    };

    if (sharerForm.isPrimary) {
      // Demote current primary guest to sharer
      const oldPrimarySharer = {
        id: `sharer_${Date.now()}_prev`,
        title: guestForm.title || 'Mr.',
        name: `${guestForm.title ? guestForm.title + ' ' : ''}${guestForm.firstName} ${guestForm.lastName}`.trim(),
        firstName: guestForm.firstName,
        lastName: guestForm.lastName,
        mobile: guestForm.mobile,
        countryCode: guestForm.countryCode,
        email: guestForm.email,
        birthDate: guestForm.birthDate,
        nationality: guestForm.nationality,
        gender: guestForm.gender,
        guestType: guestForm.guestType,
        isPrimary: false,
        isVIP: guestForm.isVIP,
        address: guestForm.address,
        zip: guestForm.zip,
        country: guestForm.country,
        state: guestForm.state,
        city: guestForm.city,
        idNumber: guestForm.idNumber,
        idType: guestForm.idType,
        issuingCountry: guestForm.issuingCountry,
        issuingCity: guestForm.issuingCity,
        expiryDate: guestForm.expiryDate,
        idDocumentUrl: guestForm.idDocumentUrl,
        idDocumentName: guestForm.idDocumentName,
        idStoragePath: guestForm.idStoragePath
      };

      setGuestForm({
        ...guestForm,
        title: newSharer.title,
        firstName: newSharer.firstName,
        lastName: newSharer.lastName,
        mobile: newSharer.mobile,
        countryCode: newSharer.countryCode,
        email: newSharer.email,
        birthDate: newSharer.birthDate,
        nationality: newSharer.nationality,
        gender: newSharer.gender,
        guestType: newSharer.guestType,
        isPrimary: true,
        isVIP: newSharer.isVIP,
        address: newSharer.address,
        zip: newSharer.zip,
        country: newSharer.country,
        state: newSharer.state,
        city: newSharer.city,
        idNumber: newSharer.idNumber,
        idType: newSharer.idType,
        issuingCountry: newSharer.issuingCountry,
        issuingCity: newSharer.issuingCity,
        expiryDate: newSharer.expiryDate,
        idDocumentUrl: newSharer.idDocumentUrl,
        idDocumentName: newSharer.idDocumentName,
        idStoragePath: newSharer.idStoragePath
      });

      let updatedGuests;
      if (editingSharerIndex !== null) {
        updatedGuests = additionalGuests.filter((_, i) => i !== editingSharerIndex);
        updatedGuests.push(oldPrimarySharer);
      } else {
        updatedGuests = [...additionalGuests, oldPrimarySharer];
      }
      setAdditionalGuests(updatedGuests);
      setIsAddingSharer(false);
      setEditingSharerIndex(null);

      pmsStore.updateReservation(currentRes.id, {
        primaryGuest: {
          ...(currentRes.primaryGuest || {}),
          title: newSharer.title,
          firstName: newSharer.firstName,
          lastName: newSharer.lastName,
          mobile: newSharer.mobile,
          countryCode: newSharer.countryCode,
          email: newSharer.email,
          birthDate: newSharer.birthDate,
          nationality: newSharer.nationality,
          gender: newSharer.gender,
          guestType: newSharer.guestType,
          isPrimary: true,
          isVIP: newSharer.isVIP,
          address: newSharer.address,
          zip: newSharer.zip,
          country: newSharer.country,
          state: newSharer.state,
          city: newSharer.city,
          idNumber: newSharer.idNumber,
          idType: newSharer.idType,
          issuingCountry: newSharer.issuingCountry,
          issuingCity: newSharer.issuingCity,
          expiryDate: newSharer.expiryDate,
          idDocumentUrl: newSharer.idDocumentUrl,
          idDocumentName: newSharer.idDocumentName,
          idStoragePath: newSharer.idStoragePath
        },
        additionalGuests: updatedGuests
      });

      if (onSave) {
        onSave({
          ...currentRes,
          primaryGuest: {
            ...(currentRes.primaryGuest || {}),
            title: newSharer.title,
            firstName: newSharer.firstName,
            lastName: newSharer.lastName,
            name: newSharer.name,
            mobile: newSharer.mobile,
            email: newSharer.email
          },
          additionalGuests: updatedGuests
        });
      }
      alert(`Primary guest updated to "${newSharer.name}"!`);
      return;
    }

    let updatedAdditionalGuests;
    if (editingSharerIndex !== null) {
      updatedAdditionalGuests = [...additionalGuests];
      updatedAdditionalGuests[editingSharerIndex] = {
        ...(additionalGuests[editingSharerIndex] || {}),
        ...newSharer
      };
    } else {
      updatedAdditionalGuests = [...additionalGuests, newSharer];
    }
    setAdditionalGuests(updatedAdditionalGuests);
    setIsAddingSharer(false);
    setEditingSharerIndex(null);

    // Sync to store & Firestore
    pmsStore.updateReservation(currentRes.id, {
      additionalGuests: updatedAdditionalGuests
    });
    if (onSave) {
      onSave({
        ...currentRes,
        additionalGuests: updatedAdditionalGuests
      });
    }
    alert(editingSharerIndex !== null
      ? `Room sharer "${newSharer.name}" updated successfully!`
      : `Room sharer "${newSharer.name}" added successfully!`
    );
  };

  // Editable Form State: Booking Details
  const [bookingForm, setBookingForm] = useState({
    billTo: reservation.billTo || 'Guest',
    company: reservation.company || '',
    guestGstin: reservation.primaryGuest?.gstin || '',
    marketSegment: reservation.marketSegment?.toLowerCase() || 'corporate',
    bookingSource: reservation.bookingSource === 'WALK_IN' ? 'walk-in' : (reservation.bookingSource?.toLowerCase() || 'walk-in'),
    specialRequests: reservation.specialRequests || '',
    applyToAllRooms: false
  });

  // Workflow & Folio Modal States
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [voidModalTx, setVoidModalTx] = useState(null);
  const [folioVersion, setFolioVersion] = useState(0);

  // Live reservation and folio from pmsStore
  const currentRes = (typeof pmsStore?.getReservation === 'function'
    ? pmsStore.getReservation(reservation?.id)
    : pmsStore?.getState?.()?.reservations?.find(r => r.id === reservation?.id)) || reservation || {};
  const currentFolio = (pmsStore?.getState?.()?.folios && pmsStore.getState().folios[currentRes.folioId]) || {
    folioNumber: `FOL_${currentRes.id ? currentRes.id.replace('res_', '') : '1'}`,
    status: (currentRes.balanceDue || 0) <= 0 ? 'SETTLED' : 'OPEN',
    totalDebits: currentRes.totalAmount || 0,
    totalCredits: currentRes.paidAmount || 0,
    balanceDue: currentRes.balanceDue !== undefined ? currentRes.balanceDue : ((currentRes.totalAmount || 0) - (currentRes.paidAmount || 0)),
    transactions: []
  };

  const folioTransactions = currentFolio.transactions || [];

  // Form State for Add Charge (Step 3.2: 6 categories + receipt # + amount + desc)
  const [newCharge, setNewCharge] = useState({
    category: 'Room (Room Rent / Accommodation)',
    receiptNumber: '',
    amount: '',
    description: ''
  });

  // Form State for Add Payment (Step 3.3: Folio + Type + Payment Method + Amount)
  const [newPayment, setNewPayment] = useState({
    folioId: currentFolio.folioNumber || currentRes.folioId || 'FOL_1',
    type: 'Settlement',
    paymentMethod: 'UPI',
    amount: currentFolio.balanceDue > 0 ? String(currentFolio.balanceDue) : '',
    reference: '',
    description: ''
  });

  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsBrowserFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsBrowserFullscreen(false)).catch(() => {});
    }
  };

  // Status & Calculations
  const statusNorm = (currentRes.status || '').toLowerCase().replace('-', '_').replace(' ', '_');
  const isInHouse = statusNorm === 'in_house';
  const isConfirmed = statusNorm === 'confirmed';
  const isCheckedOut = statusNorm === 'checked_out';
  const isCancelled = statusNorm === 'cancelled';
  const isNoShow = statusNorm === 'no_show';
  const isLocked = isCheckedOut || isCancelled || isNoShow;

  const totalCharges = Number(currentFolio.totalDebits !== undefined ? currentFolio.totalDebits : (currentRes.totalAmount || 0)).toFixed(2);
  const totalPaid = Number(currentFolio.totalCredits !== undefined ? currentFolio.totalCredits : (currentRes.paidAmount || 0)).toFixed(2);
  const outstanding = Number(
    currentFolio.balanceDue !== undefined ? currentFolio.balanceDue : (currentRes.balanceDue !== undefined ? currentRes.balanceDue : 0)
  ).toFixed(2);

  // Format date helper: "24/10/2026"
  const formatSlashedDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const arrivalText = formatSlashedDate(currentRes.checkInDate || '2026-10-24');
  const departureText = formatSlashedDate(currentRes.checkOutDate || '2026-10-26');
  const nightsCount = currentRes.nights || 1;
  const roomNum = currentRes.roomNumber || (currentRes.assignedRoomId ? currentRes.assignedRoomId.replace('rm_', '') : 'Unassigned');
  const roomName = currentRes.roomTypeName || 'Delux Room';

  // Sample Room Charges matching screenshot 4
  const roomChargesList = [
    {
      stay: arrivalText,
      room: roomNum,
      ratePlan: currentRes.ratePlan || 'test plan',
      pax: `${currentRes.adults || 1}/${currentRes.children || 0}`,
      charge: Number(currentRes.ratePerNight || 2500).toFixed(2),
      tax: Number((currentRes.ratePerNight || 2500) * 0.05).toFixed(2),
      netAmount: Number((currentRes.ratePerNight || 2500) * 1.05).toFixed(2)
    }
  ];

  // Live Audit Trail matching PMS operations
  const storeAudits = (pmsStore.getState().auditTrail || [])
    .filter(a =>
      a.reservationId === currentRes.id ||
      a.bookingReference === currentRes.bookingReference ||
      (a.details && (a.details.includes(currentRes.id) || a.details.includes(currentRes.bookingReference || '')))
    )
    .map(a => {
      let icon = 'description';
      let color = '#2563eb';
      if (a.action === 'CHECK_IN') {
        icon = 'person_check';
        color = '#9333ea';
      } else if (a.action === 'CHECK_OUT') {
        icon = 'logout';
        color = '#10b981';
      } else if (a.action === 'VOID_PAYMENT') {
        icon = 'block';
        color = '#ef4444';
      } else if (a.action === 'PAYMENT_ADDED') {
        icon = 'payments';
        color = '#059669';
      } else if (a.action === 'CHARGE_ADDED' || a.action === 'POST_PENDING_CHARGES') {
        icon = 'receipt_long';
        color = '#d97706';
      } else if (a.action === 'RESERVATION_CREATED') {
        icon = 'add_circle';
        color = '#16a34a';
      }

      const d = new Date(a.timestamp);
      const timeStr = !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '12:00:00 PM';

      return {
        id: a.id,
        color,
        icon,
        title: a.details?.split(':')[0] || a.action?.replace('_', ' ') || 'Audit Event',
        time: timeStr,
        author: a.userName || 'Astha India',
        renderBody: () => (
          <>
            <div>{a.details}</div>
            <div className="edit-res-affected-badge">
              Status: {currentRes.status} | Room: {roomNum}
            </div>
          </>
        )
      };
    });

  const auditTimeline = [
    ...storeAudits,
    {
      id: 'aud_initial',
      color: '#16a34a',
      icon: 'add_circle',
      title: 'Reservation Created',
      time: '12:07:35 PM',
      author: 'Astha India',
      renderBody: () => (
        <>
          <div>Booking Reference: {currentRes.bookingReference || '#RES_1'}</div>
          <div>Guest Name: {guestForm.firstName} {guestForm.lastName}</div>
          <div>Stay Dates: {currentRes.checkInDate} — {currentRes.checkOutDate}</div>
          <div>Nights: {nightsCount}</div>
          <div>Rooms: 1</div>
          <div>Total Amount: {totalCharges} INR</div>
          <div>Booking Source: {bookingForm.bookingSource}</div>
          <div className="edit-res-affected-badge">
            Affected dates: {currentRes.checkInDate}
          </div>
        </>
      )
    }
  ];

  const handleSaveAll = () => {
    if (isCancelled) {
      alert('This reservation has been cancelled. Cancelled reservations cannot be modified.');
      return;
    }
    if (isNoShow) {
      alert('This reservation has been marked as No-Show. No-Show reservations cannot be modified.');
      return;
    }
    if (isCheckedOut) {
      alert('This reservation is checked out. Customer, booking, and payment details cannot be changed.');
      return;
    }
    const updatedPayload = {
      ...currentRes,
      checkInTime,
      checkOutTime,
      primaryGuest: {
        ...currentRes.primaryGuest,
        ...guestForm,
        name: `${guestForm.title} ${guestForm.firstName} ${guestForm.lastName}`.trim()
      },
      additionalGuests,
      ...bookingForm
    };
    if (onSave) {
      onSave(updatedPayload);
    } else {
      pmsStore.updateReservation(currentRes.id, updatedPayload);
    }
    alert('Reservation changes saved successfully!');
  };

  // Step 3.1: Post Pending Charges
  const handlePostPendingCharges = () => {
    if (isCancelled || isNoShow) {
      alert(`Cannot post charges to a ${isNoShow ? 'no-show' : 'cancelled'} reservation.`);
      return;
    }
    if (isCheckedOut) {
      alert('Cannot post charges to a checked out reservation.');
      return;
    }
    if (onPostPendingCharges) {
      onPostPendingCharges(currentRes.id);
    } else {
      pmsStore.postPendingCharges(currentRes.id);
    }
    setFolioVersion(v => v + 1);
    alert('Success: Pending nightly charges posted onto guest folio.');
  };

  // Step 3.2: Add Charge
  const handleAddChargeSubmit = (e) => {
    e.preventDefault();
    if (isCancelled || isNoShow) {
      alert(`Cannot add charges to a ${isNoShow ? 'no-show' : 'cancelled'} reservation.`);
      return;
    }
    if (isCheckedOut) {
      alert('Cannot add charges to a checked out reservation.');
      return;
    }
    if (!newCharge.amount) return;
    const chargePayload = {
      category: newCharge.category,
      receiptNumber: newCharge.receiptNumber,
      amount: newCharge.amount,
      description: newCharge.description
    };
    if (onAddFolioCharge) {
      onAddFolioCharge(currentRes.id, chargePayload);
    } else {
      pmsStore.addFolioCharge(currentRes.id, chargePayload);
    }
    setShowAddChargeModal(false);
    setNewCharge({
      category: 'Room (Room Rent / Accommodation)',
      receiptNumber: '',
      amount: '',
      description: ''
    });
    setFolioVersion(v => v + 1);
  };

  // Step 3.3: Add Payment
  const handleAddPaymentSubmit = (e) => {
    e.preventDefault();
    if (isCancelled || isNoShow) {
      alert(`Cannot add payments to a ${isNoShow ? 'no-show' : 'cancelled'} reservation.`);
      return;
    }
    if (isCheckedOut) {
      alert('Cannot add payments to a checked out reservation.');
      return;
    }
    if (!newPayment.amount) return;
    const paymentPayload = {
      folioId: newPayment.folioId,
      type: newPayment.type,
      paymentMethod: newPayment.paymentMethod,
      amount: newPayment.amount,
      description: newPayment.description,
      reference: newPayment.reference
    };
    if (onAddFolioPayment) {
      onAddFolioPayment(currentRes.id, paymentPayload);
    } else {
      pmsStore.addFolioPayment(currentRes.id, paymentPayload);
    }
    setShowAddPaymentModal(false);
    setNewPayment({
      folioId: currentFolio.folioNumber || 'FOL_1',
      type: 'Settlement',
      paymentMethod: 'UPI',
      amount: '',
      reference: '',
      description: ''
    });
    setFolioVersion(v => v + 1);
  };

  // Step 3.4: Void Payment
  const handleConfirmVoidPayment = (txId, voidReason) => {
    if (isCancelled || isNoShow) {
      alert(`Cannot void payment on a ${isNoShow ? 'no-show' : 'cancelled'} reservation.`);
      return;
    }
    if (isCheckedOut) {
      alert('Cannot void payment on a checked out reservation.');
      return;
    }
    pmsStore.voidPayment(currentRes.id, txId, voidReason);
    if (onVoidPayment) onVoidPayment(currentRes.id, txId, voidReason);
    setVoidModalTx(null);
    setFolioVersion(v => v + 1);
  };

  return (
    <div className="edit-res-page">
      {/* 1. Breadcrumbs */}
      <div className="edit-res-breadcrumb">
        <Home size={14} />
        <span className="crumb-link" onClick={() => onNavigate ? onNavigate('dashboard') : onBack ? onBack() : null}>PMS</span>
        <span className="crumb-sep">&gt;</span>
        <span className="crumb-link crumb-active" onClick={() => onNavigate ? onNavigate('reservations') : onBack ? onBack() : null}>Reservations</span>
        <span className="crumb-sep">&gt;</span>
        <span>Edit Reservation</span>
      </div>

      {/* 2. Top Header Summary Card */}
      <div className="edit-res-header-card">
        <div className="edit-res-header-left">
          <button className="edit-res-back-btn" onClick={onBack} title="Back to Reservations">
            <ArrowLeft size={18} />
          </button>

          <div className="edit-res-bed-icon">
            <span className="material-symbols-outlined select-none" style={{ fontSize: '24px' }}>
              hotel
            </span>
          </div>

          <div className="edit-res-guest-title-col">
            <div className="edit-res-name-badge-row">
              <span className="edit-res-guest-name">
                {guestForm.title} {guestForm.firstName} {guestForm.lastName}
              </span>
              <span className={`edit-res-status-pill ${isInHouse ? 'in-house' : isConfirmed ? 'confirmed' : isCheckedOut ? 'checked-out' : isCancelled ? 'cancelled' : isNoShow ? 'no-show' : ''}`}>
                {isInHouse ? 'In House' : isConfirmed ? 'Confirmed' : isCheckedOut ? 'Checked Out' : isCancelled ? 'Cancelled' : isNoShow ? 'No Show' : reservation.status}
              </span>
            </div>

            <div className="edit-res-meta-subline">
              <span className="edit-res-pax-item">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>man</span>
                <span>{reservation.adults || 1}</span>
              </span>
              <span className="edit-res-pax-item">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>child_care</span>
                <span>{reservation.children || 2}</span>
              </span>
              <span>Res. No. {reservation.bookingReference ? reservation.bookingReference.replace('#', '') : 'RES_1'}</span>
            </div>
          </div>
        </div>

        {/* Right side stats & checkout action */}
        <div className="edit-res-header-right">
          <div className="edit-res-date-metric" style={{ position: 'relative' }}>
            <span className="metric-label">Arrival</span>
            <span className="metric-val">{arrivalText}</span>
            <div
              className="metric-time-edit"
              onClick={() => !isLocked && setEditingTimeType('checkIn')}
              style={{ cursor: isLocked ? 'default' : 'pointer' }}
              title={!isLocked ? 'Click to edit arrival time' : undefined}
            >
              <span>{checkInTime}</span>
              {!isLocked && <Pencil size={11} className="time-pencil-icon" />}
            </div>
            {editingTimeType === 'checkIn' && (
              <CustomTimePickerModal
                isOpen={true}
                initialTime={checkInTime}
                onClose={() => setEditingTimeType(null)}
                onSave={(newTime) => {
                  setCheckInTime(newTime);
                  setEditingTimeType(null);
                  pmsStore.updateReservation(currentRes.id, { checkInTime: newTime });
                  if (onSave) {
                    onSave({
                      ...currentRes,
                      checkInTime: newTime
                    });
                  }
                }}
              />
            )}
          </div>

          <div className="edit-res-date-metric" style={{ position: 'relative' }}>
            <span className="metric-label">Departure</span>
            <span className="metric-val">{departureText}</span>
            <div
              className="metric-time-edit"
              onClick={() => !isLocked && setEditingTimeType('checkOut')}
              style={{ cursor: isLocked ? 'default' : 'pointer' }}
              title={!isLocked ? 'Click to edit departure time' : undefined}
            >
              <span>{checkOutTime}</span>
              {!isLocked && <Pencil size={11} className="time-pencil-icon" />}
            </div>
            {editingTimeType === 'checkOut' && (
              <CustomTimePickerModal
                isOpen={true}
                initialTime={checkOutTime}
                onClose={() => setEditingTimeType(null)}
                onSave={(newTime) => {
                  setCheckOutTime(newTime);
                  setEditingTimeType(null);
                  pmsStore.updateReservation(currentRes.id, { checkOutTime: newTime });
                  if (onSave) {
                    onSave({
                      ...currentRes,
                      checkOutTime: newTime
                    });
                  }
                }}
              />
            )}
          </div>

          <div className="edit-res-date-metric">
            <span className="metric-label">Nights</span>
            <span className="metric-val">{nightsCount}</span>
          </div>

          <div className="edit-res-stat-box charges">
            <span className="box-label">Charges</span>
            <span className="box-amount">{totalCharges}</span>
          </div>

          <div className="edit-res-stat-box paid">
            <span className="box-label">Paid</span>
            <span className="box-amount">{totalPaid}</span>
          </div>

          <div className="edit-res-stat-box outstanding">
            <span className="box-label">Outstanding</span>
            <span className="box-amount">{outstanding}</span>
          </div>

          {isInHouse ? (
            <button
              className="edit-res-checkout-btn"
              onClick={() => setShowCheckOutModal(true)}
            >
              Check Out
            </button>
          ) : isConfirmed ? (
            <button
              className="edit-res-checkin-btn"
              onClick={() => setShowCheckInModal(true)}
            >
              Check In
            </button>
          ) : null}

          {/* Fullscreen Button */}
          <button
            className="edit-res-fs-btn"
            onClick={toggleBrowserFullscreen}
            title={isBrowserFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isBrowserFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Cancelled Locked Notice Banner */}
      {isCancelled && (
        <div className="edit-res-locked-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
          <div className="edit-res-locked-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Ban size={14} />
            <span>Reservation Cancelled</span>
          </div>
          <span>
            This reservation is cancelled. All customer personal details, stay parameters, room allocations, folio transactions, and payment records are locked and cannot be modified.
          </span>
        </div>
      )}

      {/* No-Show Locked Notice Banner */}
      {isNoShow && (
        <div className="edit-res-locked-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }}>
          <div className="edit-res-locked-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Ban size={14} />
            <span>Reservation No-Show</span>
          </div>
          <span>
            This reservation is marked as No-Show. All customer personal details, stay parameters, room allocations, folio transactions, and payment records are locked and cannot be modified.
          </span>
        </div>
      )}

      {/* Checked Out Locked Notice Banner */}
      {isCheckedOut && (
        <div className="edit-res-locked-banner">
          <div className="edit-res-locked-badge">
            <ShieldCheck size={14} />
            <span>Checked Out & Locked</span>
          </div>
          <span>
            This reservation is checked out and finalized. Customer personal details, booking parameters, folio charges, and payment records are preserved in read-only mode and cannot be modified.
          </span>
        </div>
      )}

      {/* 3. Horizontal Navigation Tabs */}
      <div className="edit-res-tabs-bar">
        {[
          { id: 'guest', label: 'Guest Details' },
          { id: 'booking', label: 'Booking Details' },
          { id: 'folio', label: 'Folio Operations' },
          { id: 'charges', label: 'Room Charges' },
          { id: 'audit', label: 'Audit Trail' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`edit-res-tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'guest') {
                setIsAddingSharer(false);
                setEditingSharerIndex(null);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Body 2-Column Split: Sub-sidebar + Content Area */}
      <div className="edit-res-body-layout">
        {/* Left Sub-Sidebar (Changes per tab) */}
        <div className="edit-res-sub-sidebar">
          {activeTab === 'guest' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Guest</span>
                <div className="edit-res-sidebar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isLocked && (
                    <div
                      className="add-sharer-popover-wrap"
                      ref={addSharerRef}
                      onMouseEnter={() => setShowAddSharerTooltip(true)}
                      onMouseLeave={() => setShowAddSharerTooltip(false)}
                    >
                      <button
                        type="button"
                        className="edit-res-add-btn-mini"
                        title="Add Sharer"
                        onClick={handleOpenAddSharer}
                      >
                        <Plus size={15} strokeWidth={2.5} />
                      </button>

                      {showAddSharerTooltip && (
                        <div
                          className="add-sharer-popover"
                          onClick={handleOpenAddSharer}
                          title="Add a room sharer"
                        >
                          <div className="add-sharer-popover-arrow" />
                          <span className="add-sharer-popover-text">Add Sharer</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="edit-res-toggle-pill-wrap"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => {
                      setIsAddingSharer(false);
                      setEditingSharerIndex(null);
                      setShowGuestList(!showGuestList);
                    }}
                  >
                    <div className={`edit-res-toggle-switch ${showGuestList ? 'on' : ''}`}>
                      <div className="edit-res-toggle-switch-thumb" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                      Guest List
                    </span>
                  </div>
                </div>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div
                  className="edit-res-room-header-row"
                  onClick={() => setIsRoomAccordionOpen(!isRoomAccordionOpen)}
                >
                  <div className="edit-res-room-header-left">
                    <Crown size={14} />
                    <span>{roomName}</span>
                  </div>
                  {isRoomAccordionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>

                {isRoomAccordionOpen && (
                  <>
                    <div
                      className={`edit-res-sidebar-item ${(!showGuestList && !isAddingSharer && editingSharerIndex === null) ? 'active' : ''}`}
                      onClick={() => {
                        setShowGuestList(false);
                        setIsAddingSharer(false);
                        setEditingSharerIndex(null);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>{guestForm.title} {guestForm.firstName} {guestForm.lastName}</span>
                      <ChevronRight size={13} color={(!showGuestList && !isAddingSharer && editingSharerIndex === null) ? "#2563eb" : "#94a3b8"} />
                    </div>
                    {additionalGuests.map((ag, idx) => {
                      const displayName = ag.name
                        ? (ag.title && !ag.name.startsWith(ag.title) ? `${ag.title} ${ag.name}` : ag.name)
                        : (ag.firstName ? `${ag.title ? ag.title + ' ' : ''}${ag.firstName} ${ag.lastName || ''}`.trim() : `Guest ${idx + 2}`);
                      const isSharerActive = !showGuestList && editingSharerIndex === idx;
                      return (
                        <div
                          key={ag.id || idx}
                          className={`edit-res-sidebar-item ${isSharerActive ? 'active' : ''}`}
                          onClick={() => handleSelectSharerToEdit(idx)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span>{displayName}</span>
                          <ChevronRight size={13} color={isSharerActive ? "#2563eb" : "#94a3b8"} />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'booking' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room</span>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-room-header-row">
                  <div className="edit-res-room-header-left">
                    <Crown size={14} />
                    <span>{roomName} — {roomNum}</span>
                  </div>
                  <ChevronUp size={14} />
                </div>

                <div className="edit-res-sidebar-item active">
                  <span>{guestForm.title} {guestForm.firstName} {guestForm.lastName}</span>
                  <ChevronRight size={13} color="#2563eb" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'folio' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room / Folio</span>
                {!isLocked && (
                  <button className="edit-res-add-btn-mini" title="New Folio">
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-room-header-row">
                  <div className="edit-res-room-header-left">
                    <Crown size={14} />
                    <span>{roomName} — {roomNum}</span>
                  </div>
                  <ChevronUp size={14} />
                </div>

                <div className="edit-res-sidebar-item active">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>FOL_1</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {guestForm.firstName} {guestForm.lastName}
                    </span>
                  </div>
                  <ChevronRight size={13} color="#2563eb" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'charges' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room</span>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-sidebar-item">
                  <span>Group Info</span>
                  <ChevronRight size={13} color="#94a3b8" />
                </div>
                <div className="edit-res-sidebar-item active">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Crown size={13} />
                    <span>{roomNum} - {roomName}</span>
                  </div>
                  <ChevronRight size={13} color="#2563eb" />
                </div>
              </div>

              <div className="edit-res-sidebar-totals-box">
                <div className="edit-res-sidebar-total-line" style={{ color: '#ef4444' }}>
                  <span>Charges</span>
                  <span>5,000.00</span>
                </div>
                <div className="edit-res-sidebar-total-line" style={{ color: '#0f172a' }}>
                  <span>Total</span>
                  <span>{totalCharges}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'audit' && (
            <>
              <div className="edit-res-sidebar-header">
                <span className="edit-res-sidebar-title">Room</span>
              </div>

              <div className="edit-res-sidebar-nav-card">
                <div className="edit-res-sidebar-item active">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={13} />
                    <span>All Activity</span>
                  </div>
                  <span className="edit-res-sidebar-counter">4</span>
                </div>
                <div className="edit-res-sidebar-item">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{roomName} — {roomNum}</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {guestForm.firstName} {guestForm.lastName}
                    </span>
                  </div>
                  <span className="edit-res-sidebar-counter">2</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Main Content Area */}
        <div key={activeTab} className="edit-res-main-content edit-tab-fade-enter">
          {/* TAB 1: GUEST DETAILS */}
          {activeTab === 'guest' && (
            (isAddingSharer || editingSharerIndex !== null) ? (
              <div className="add-sharer-view-container edit-tab-fade-enter">
                <div
                  className="add-sharer-back-header"
                  onClick={() => {
                    setIsAddingSharer(false);
                    setEditingSharerIndex(null);
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>{editingSharerIndex !== null ? 'Edit Room Sharer' : 'Add Room Sharer'}</span>
                </div>

                {/* Section 1: General Information */}
                <div className="edit-res-section-card">
                  <h3 className="edit-res-section-title">General Information</h3>

                  <div className="edit-res-form-grid-4">
                    <div className="edit-res-field">
                      <label>Title <span style={{ color: '#ef4444' }}>*</span></label>
                      <select
                        className="edit-res-select"
                        value={sharerForm.title}
                        onChange={(e) => setSharerForm({ ...sharerForm, title: e.target.value })}
                      >
                        <option value="">Select Title</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>

                    <div className="edit-res-field">
                      <label>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        className="edit-res-input"
                        placeholder="First Name"
                        value={sharerForm.firstName}
                        onChange={(e) => setSharerForm({ ...sharerForm, firstName: e.target.value })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        className="edit-res-input"
                        placeholder="Last Name"
                        value={sharerForm.lastName}
                        onChange={(e) => setSharerForm({ ...sharerForm, lastName: e.target.value })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>Mobile <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                        <select
                          className="edit-res-select"
                          value={sharerForm.countryCode}
                          onChange={(e) => setSharerForm({ ...sharerForm, countryCode: e.target.value })}
                        >
                          <option value="+91">Select code</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+971">+971 (AE)</option>
                          <option value="+61">+61 (AU)</option>
                        </select>
                        <input
                          type="tel"
                          className="edit-res-input"
                          placeholder="Enter phone number"
                          value={sharerForm.mobile}
                          onChange={(e) => setSharerForm({ ...sharerForm, mobile: e.target.value })}
                        />
                      </div>
                      {sharerForm.mobile && sharerForm.mobile.trim().length > 0 && (sharerForm.mobile.replace(/\D/g, '').length < 10 || sharerForm.mobile.replace(/\D/g, '').length > 15) && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                          Phone must be 10-15 digits
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="edit-res-form-grid-3">
                    <div className="edit-res-field">
                      <label>Email <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="email"
                        className="edit-res-input"
                        placeholder="Email"
                        value={sharerForm.email}
                        onChange={(e) => setSharerForm({ ...sharerForm, email: e.target.value })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>Birth Date</label>
                      <CustomDatePicker
                        value={sharerForm.birthDate}
                        placeholder="Select date"
                        minYear={1930}
                        maxYear={2026}
                        onChange={(val) => setSharerForm({ ...sharerForm, birthDate: val })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>Nationality</label>
                      <input
                        type="text"
                        className="edit-res-input"
                        placeholder="Nationality"
                        value={sharerForm.nationality}
                        onChange={(e) => setSharerForm({ ...sharerForm, nationality: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="edit-res-form-grid-4" style={{ alignItems: 'flex-end' }}>
                    <div className="edit-res-field">
                      <label>Gender</label>
                      <select
                        className="edit-res-select"
                        value={sharerForm.gender}
                        onChange={(e) => setSharerForm({ ...sharerForm, gender: e.target.value })}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="edit-res-field">
                      <label>Guest Type</label>
                      <select
                        className="edit-res-select"
                        value={sharerForm.guestType}
                        onChange={(e) => setSharerForm({ ...sharerForm, guestType: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="Adult">Adult</option>
                        <option value="Child">Child</option>
                      </select>
                    </div>

                    <div
                      className={`edit-res-switch-pill ${sharerForm.isPrimary ? 'primary-active' : ''}`}
                      onClick={() => setSharerForm({ ...sharerForm, isPrimary: !sharerForm.isPrimary })}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>Is Primary</span>
                      <input type="checkbox" checked={sharerForm.isPrimary} readOnly />
                      <User size={14} />
                    </div>

                    <div
                      className={`edit-res-switch-pill vip-pill ${sharerForm.isVIP ? 'vip-active' : ''}`}
                      onClick={() => setSharerForm({ ...sharerForm, isVIP: !sharerForm.isVIP })}
                      style={{ cursor: 'pointer' }}
                    >
                      <span>Is VIP</span>
                      <input type="checkbox" checked={sharerForm.isVIP} readOnly />
                      <Star size={14} />
                    </div>
                  </div>
                </div>

                {/* Section 2: Address Details */}
                <div className="edit-res-section-card">
                  <h3 className="edit-res-section-title">Address Details</h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <div className="edit-res-field">
                      <label>Address</label>
                      <input
                        type="text"
                        className="edit-res-input"
                        placeholder="Address"
                        value={sharerForm.address}
                        onChange={(e) => setSharerForm({ ...sharerForm, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="edit-res-form-grid-4">
                    <div className="edit-res-field">
                      <label>Zip</label>
                      <input
                        type="text"
                        className="edit-res-input"
                        placeholder="Zip"
                        value={sharerForm.zip}
                        onChange={(e) => setSharerForm({ ...sharerForm, zip: e.target.value })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>Country</label>
                      <CountrySelect
                        value={sharerForm.country}
                        placeholder="Select Country"
                        onChange={(val) => setSharerForm({ ...sharerForm, country: val, state: '', city: '' })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>State</label>
                      <SearchableSelect
                        value={sharerForm.state}
                        options={sharerStateOptions}
                        placeholder="Select State"
                        searchPlaceholder="Search State..."
                        allowCustom={true}
                        onChange={(val) => setSharerForm({ ...sharerForm, state: val, city: '' })}
                      />
                    </div>

                    <div className="edit-res-field">
                      <label>City</label>
                      <SearchableSelect
                        value={sharerForm.city}
                        options={sharerCityOptions}
                        placeholder="Select City"
                        searchPlaceholder="Search City..."
                        allowCustom={true}
                        onChange={(val) => setSharerForm({ ...sharerForm, city: val })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Identity Information */}
                <div className="edit-res-section-card">
                  <h3 className="edit-res-section-title">Identity Information</h3>
                  <p className="edit-res-section-subtitle">Official identification and travel documents</p>

                  <div className="edit-res-identity-layout">
                    {/* Left upload box */}
                    <div style={{ position: 'relative', width: '180px', minHeight: '145px', display: 'flex', flexDirection: 'column' }}>
                      {sharerForm.idDocumentUrl ? (
                        <div className="id-photo-preview-wrap">
                          {sharerForm.idDocumentUrl.startsWith('data:application/pdf') || sharerForm.idDocumentName?.endsWith('.pdf') ? (
                            <div
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ef4444', padding: '16px 8px', textAlign: 'center', cursor: 'pointer' }}
                              onClick={() => setLightboxPreview({
                                url: sharerForm.idDocumentUrl,
                                title: `${sharerForm.firstName} ${sharerForm.lastName} - ID Document`,
                                idNumber: sharerForm.idNumber
                              })}
                            >
                              <FileText size={38} color="#ef4444" />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155', wordBreak: 'break-all' }}>
                                {sharerForm.idDocumentName || 'ID_Document.pdf'}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={sharerForm.idDocumentUrl}
                              alt="ID Document Preview"
                              className="id-photo-preview-img"
                              onClick={() => setLightboxPreview({
                                url: sharerForm.idDocumentUrl,
                                title: `${sharerForm.firstName} ${sharerForm.lastName} - ID Document`,
                                idNumber: sharerForm.idNumber
                              })}
                              style={{ cursor: 'pointer' }}
                            />
                          )}

                          <div className="id-photo-overlay">
                            <button
                              type="button"
                              className="id-photo-btn"
                              title="Preview ID Fullscreen"
                              onClick={() => setLightboxPreview({
                                url: sharerForm.idDocumentUrl,
                                title: `${sharerForm.firstName} ${sharerForm.lastName} - ID Document`,
                                idNumber: sharerForm.idNumber
                              })}
                            >
                              <Eye size={15} color="#1e293b" />
                            </button>
                            <button
                              type="button"
                              className="id-photo-btn"
                              title="Change ID Photo"
                              onClick={() => sharerFileInputRef.current?.click()}
                            >
                              <Upload size={15} color="#2563eb" />
                            </button>
                            <button
                              type="button"
                              className="id-photo-btn delete"
                              title="Delete ID Photo"
                              onClick={handleRemoveSharerIdPhoto}
                            >
                              <Trash2 size={15} color="#ef4444" />
                            </button>
                          </div>

                          <div className="id-photo-badge">
                            <CheckCircle2 size={11} color="#10b981" />
                            <span>ID Uploaded</span>
                          </div>
                        </div>
                      ) : (
                        <label
                          className={`edit-res-upload-box ${isUploadingSharerId ? 'uploading' : ''}`}
                        >
                          {isUploadingSharerId ? (
                            <>
                              <Loader2 size={24} className="animate-spin" color="#2563eb" />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb' }}>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={22} color="#2563eb" />
                              <span style={{ fontSize: '13px', fontWeight: 600 }}>+ Upload ID</span>
                              <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 500 }}>JPG, PNG or PDF</span>
                            </>
                          )}
                          <input
                            ref={sharerFileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            style={{ display: 'none' }}
                            disabled={isUploadingSharerId}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSharerIdUpload(file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Right fields */}
                    <div>
                      <div className="edit-res-form-grid-2">
                        <div className="edit-res-field">
                          <label>ID Number</label>
                          <input
                            type="text"
                            className="edit-res-input"
                            placeholder="ID Number"
                            value={sharerForm.idNumber}
                            onChange={(e) => setSharerForm({ ...sharerForm, idNumber: e.target.value })}
                          />
                        </div>

                        <div className="edit-res-field">
                          <label>ID Type</label>
                          <select
                            className="edit-res-select"
                            value={sharerForm.idType}
                            onChange={(e) => setSharerForm({ ...sharerForm, idType: e.target.value })}
                          >
                            <option value="">-Select-</option>
                            <option value="Aadhaar Card">Aadhaar Card</option>
                            <option value="Passport">Passport</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Voter ID">Voter ID</option>
                          </select>
                        </div>
                      </div>

                      <div className="edit-res-form-grid-2">
                        <div className="edit-res-field">
                          <label>Issuing Country</label>
                          <CountrySelect
                            value={sharerForm.issuingCountry}
                            placeholder="Issuing Country"
                            onChange={(val) => setSharerForm({ ...sharerForm, issuingCountry: val })}
                          />
                        </div>

                        <div className="edit-res-field">
                          <label>Issuing City</label>
                          <SearchableSelect
                            value={sharerForm.issuingCity}
                            options={sharerCityOptions}
                            placeholder="Issuing City"
                            searchPlaceholder="Search City..."
                            allowCustom={true}
                            onChange={(val) => setSharerForm({ ...sharerForm, issuingCity: val })}
                          />
                        </div>
                      </div>

                      <div className="edit-res-form-grid-2">
                        <div className="edit-res-field">
                          <label>Expiry Date</label>
                          <CustomDatePicker
                            value={sharerForm.expiryDate}
                            placeholder="Select date"
                            minYear={2020}
                            maxYear={2045}
                            onChange={(val) => setSharerForm({ ...sharerForm, expiryDate: val })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Save Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingBottom: '2rem' }}>
                  <button
                    type="button"
                    className="edit-res-save-btn"
                    onClick={handleSaveSharer}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : showGuestList ? (
              <div className="edit-res-guest-list-card">
                <div className="edit-res-guest-list-header">
                  <h3 className="edit-res-guest-list-title">Guest List</h3>
                  <p className="edit-res-guest-list-subtitle">Basic details about the guests</p>
                </div>

                <div className="edit-res-guest-table-wrap">
                  {/* Table Column Headers */}
                  <div className="edit-res-guest-table-header">
                    <div className="col-guest-name">Guest Name</div>
                    <div className="col-mobile">Mobile</div>
                    <div className="col-email">Email</div>
                    <div className="col-actions">Actions</div>
                  </div>

                  {/* Primary Guest Row */}
                  <div className="edit-res-guest-table-row">
                    <div className="col-guest-name name-input-group">
                      <select
                        className="edit-res-select title-select"
                        value={guestForm.title}
                        disabled={isLocked}
                        onChange={(e) => setGuestForm({ ...guestForm, title: e.target.value })}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                      <input
                        type="text"
                        className="edit-res-input"
                        placeholder="Guest Name"
                        value={primaryNameDisplay}
                        disabled={isLocked}
                        onChange={(e) => handlePrimaryNameInput(e.target.value)}
                      />
                    </div>

                    <div className="col-mobile">
                      <input
                        type="tel"
                        className="edit-res-input"
                        placeholder="Mobile"
                        value={guestForm.mobile}
                        disabled={isLocked}
                        onChange={(e) => setGuestForm({ ...guestForm, mobile: e.target.value })}
                      />
                    </div>

                    <div className="col-email">
                      <input
                        type="email"
                        className="edit-res-input"
                        placeholder="Email"
                        value={guestForm.email}
                        disabled={isLocked}
                        onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                      />
                    </div>

                    <div className="col-actions">
                      {guestForm.idDocumentUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            className="edit-res-btn-uploaded-id"
                            onClick={() => setLightboxPreview({
                              url: guestForm.idDocumentUrl,
                              title: `${primaryNameDisplay || 'Primary Guest'} - ID Document`,
                              idNumber: guestForm.idNumber
                            })}
                            title="View Uploaded ID Document"
                          >
                            <CheckCircle2 size={13} color="#10B981" />
                            <span>ID Attached</span>
                            <Eye size={12} color="#059669" />
                          </button>
                          {!isLocked && (
                            <button
                              type="button"
                              className="edit-res-btn-icon-danger"
                              onClick={(e) => handleRemoveIdPhoto(e, 'primary')}
                              title="Delete ID Document"
                            >
                              <Trash2 size={13} color="#EF4444" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <label className={`edit-res-btn-upload-id ${isLocked ? 'disabled' : ''}`}>
                          <FileText size={15} color="#475569" />
                          <span>Upload ID</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            style={{ display: 'none' }}
                            disabled={isLocked}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleIdFileUpload(file, 'primary');
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}

                      <button
                        type="button"
                        className="edit-res-btn-add-guest"
                        disabled={isLocked}
                        onClick={handleAddGuestRow}
                        title="Add another guest"
                      >
                        <Plus size={15} color="#ffffff" strokeWidth={2.5} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Additional Guest Rows */}
                  {additionalGuests.map((ag, idx) => (
                    <div key={ag.id || idx} className="edit-res-guest-table-row">
                      <div className="col-guest-name name-input-group">
                        <select
                          className="edit-res-select title-select"
                          value={ag.title || 'Mr.'}
                          disabled={isLocked}
                          onChange={(e) => handleUpdateAdditionalGuest(idx, 'title', e.target.value)}
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Dr.">Dr.</option>
                        </select>
                        <input
                          type="text"
                          className="edit-res-input"
                          placeholder="Guest Name"
                          value={ag.name || ''}
                          disabled={isLocked}
                          onChange={(e) => handleUpdateAdditionalGuest(idx, 'name', e.target.value)}
                        >
                        </input>
                      </div>

                      <div className="col-mobile">
                        <input
                          type="tel"
                          className="edit-res-input"
                          placeholder="Mobile"
                          value={ag.mobile || ''}
                          disabled={isLocked}
                          onChange={(e) => handleUpdateAdditionalGuest(idx, 'mobile', e.target.value)}
                        />
                      </div>

                      <div className="col-email">
                        <input
                          type="email"
                          className="edit-res-input"
                          placeholder="Email"
                          value={ag.email || ''}
                          disabled={isLocked}
                          onChange={(e) => handleUpdateAdditionalGuest(idx, 'email', e.target.value)}
                        />
                      </div>

                      <div className="col-actions">
                        {ag.idDocumentUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="edit-res-btn-uploaded-id"
                              onClick={() => setLightboxPreview({
                                url: ag.idDocumentUrl,
                                title: `${ag.name || `Guest ${idx + 2}`} - ID Document`,
                                idNumber: ag.idNumber || ''
                              })}
                              title="View Uploaded ID Document"
                            >
                              <CheckCircle2 size={13} color="#10B981" />
                              <span>ID Attached</span>
                              <Eye size={12} color="#059669" />
                            </button>
                            {!isLocked && (
                              <button
                                type="button"
                                className="edit-res-btn-icon-danger"
                                onClick={(e) => handleRemoveIdPhoto(e, idx)}
                                title="Delete ID Document"
                              >
                                <Trash2 size={13} color="#EF4444" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <label className={`edit-res-btn-upload-id ${isLocked ? 'disabled' : ''}`}>
                            <FileText size={15} color="#475569" />
                            <span>Upload ID</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              style={{ display: 'none' }}
                              disabled={isLocked}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleIdFileUpload(file, idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}

                        {!isLocked && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="edit-res-btn-edit-guest"
                              title="Edit Room Sharer Details"
                              onClick={() => handleSelectSharerToEdit(idx)}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              className="edit-res-btn-remove-guest"
                              title="Remove guest"
                              onClick={() => handleRemoveAdditionalGuest(idx)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Right Save Button matching Image 2 */}
                <div className="edit-res-guest-list-footer">
                  <button
                    type="button"
                    className="edit-res-btn-save-bottom"
                    disabled={isLocked}
                    onClick={handleSaveAll}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Section 1: General Information */}
                <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">General Information</h3>

                <div className="edit-res-form-grid-4">
                  <div className="edit-res-field">
                    <label>Title <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={guestForm.title}
                      disabled={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, title: e.target.value })}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>First Name <span className="required-star">*</span></label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.firstName}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.lastName}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Mobile</label>
                    <div className={`edit-res-phone-input-wrap ${isLocked ? 'disabled' : ''}`}>
                      <div className="edit-res-country-code">
                        <span>{guestForm.countryCode}</span>
                        <ChevronDown size={12} />
                      </div>
                      <input
                        type="tel"
                        className="edit-res-phone-input"
                        value={guestForm.mobile}
                        disabled={isLocked}
                        readOnly={isLocked}
                        onChange={(e) => setGuestForm({ ...guestForm, mobile: e.target.value })}
                      />
                    </div>
                    {guestForm.mobile && guestForm.mobile.trim().length > 0 && (guestForm.mobile.replace(/\D/g, '').length < 10 || guestForm.mobile.replace(/\D/g, '').length > 15) && (
                      <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        Phone must be 10-15 digits
                      </div>
                    )}
                  </div>
                </div>

                <div className="edit-res-form-grid-3">
                  <div className="edit-res-field">
                    <label>Email</label>
                    <input
                      type="email"
                      className="edit-res-input"
                      value={guestForm.email}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Birth Date</label>
                    <CustomDatePicker
                      value={guestForm.birthDate}
                      disabled={isLocked}
                      placeholder="Select date"
                      onChange={(val) => setGuestForm({ ...guestForm, birthDate: val })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Nationality</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      placeholder="Nationality"
                      value={guestForm.nationality}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <div className="edit-res-form-grid-4" style={{ alignItems: 'flex-end' }}>
                  <div className="edit-res-field">
                    <label>Gender</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.gender}
                      disabled={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>Guest Type</label>
                    <select
                      className="edit-res-select"
                      value={guestForm.guestType}
                      disabled={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, guestType: e.target.value })}
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                    </select>
                  </div>

                  <div
                    className={`edit-res-switch-pill ${guestForm.isPrimary ? 'primary-active' : ''} ${isLocked ? 'disabled' : ''}`}
                    onClick={() => !isLocked && setGuestForm({ ...guestForm, isPrimary: !guestForm.isPrimary })}
                    style={isLocked ? { cursor: 'not-allowed', opacity: 0.75 } : {}}
                  >
                    <span>Is Primary</span>
                    <input type="checkbox" checked={guestForm.isPrimary} readOnly disabled={isLocked} />
                    <User size={14} />
                  </div>

                  <div
                    className={`edit-res-switch-pill vip-pill ${isLocked ? 'disabled' : ''}`}
                    onClick={() => !isLocked && setGuestForm({ ...guestForm, isVIP: !guestForm.isVIP })}
                    style={isLocked ? { cursor: 'not-allowed', opacity: 0.75 } : {}}
                  >
                    <span>Is VIP</span>
                    <input type="checkbox" checked={guestForm.isVIP} readOnly disabled={isLocked} />
                    <Star size={14} />
                  </div>
                </div>
              </div>

              {/* Section 2: Address Details */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Address Details</h3>

                <div style={{ marginBottom: '1rem' }}>
                  <div className="edit-res-field">
                    <label>Address</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.address}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="edit-res-form-grid-4">
                  <div className="edit-res-field">
                    <label>Zip</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      value={guestForm.zip}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setGuestForm({ ...guestForm, zip: e.target.value })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>Country</label>
                    <CountrySelect
                      value={guestForm.country}
                      disabled={isLocked}
                      placeholder="Select country"
                      onChange={(val) => setGuestForm({ ...guestForm, country: val })}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>State</label>
                    <SearchableSelect
                      value={guestForm.state}
                      options={stateOptions}
                      disabled={isLocked}
                      placeholder="Select State"
                      searchPlaceholder="Search State..."
                      allowCustom={true}
                      onChange={(val) => {
                        setGuestForm({ ...guestForm, state: val, city: '' });
                      }}
                    />
                  </div>

                  <div className="edit-res-field">
                    <label>City</label>
                    <SearchableSelect
                      value={guestForm.city}
                      options={cityOptions}
                      disabled={isLocked}
                      placeholder="Select City"
                      searchPlaceholder="Search City..."
                      allowCustom={true}
                      onChange={(val) => setGuestForm({ ...guestForm, city: val })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Identity Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Identity Information</h3>
                <p className="edit-res-section-subtitle">Official identification and travel documents</p>

                <div className="edit-res-identity-layout">
                  {/* Left upload box */}
                  <div style={{ position: 'relative', width: '180px', minHeight: '145px', display: 'flex', flexDirection: 'column' }}>
                    {guestForm.idDocumentUrl ? (
                      <div className="id-photo-preview-wrap">
                        {guestForm.idDocumentUrl.startsWith('data:application/pdf') || guestForm.idDocumentName?.endsWith('.pdf') ? (
                          <div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#EF4444', padding: '16px 8px', textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => setLightboxPreview({
                              url: guestForm.idDocumentUrl,
                              title: `${primaryNameDisplay || 'Primary Guest'} - ID Document`,
                              idNumber: guestForm.idNumber
                            })}
                          >
                            <FileText size={38} color="#EF4444" />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155', wordBreak: 'break-all' }}>
                              {guestForm.idDocumentName || 'ID_Document.pdf'}
                            </span>
                          </div>
                        ) : (
                          <img
                            src={guestForm.idDocumentUrl}
                            alt="ID Document Preview"
                            className="id-photo-preview-img"
                            onClick={() => setLightboxPreview({
                              url: guestForm.idDocumentUrl,
                              title: `${primaryNameDisplay || 'Primary Guest'} - ID Document`,
                              idNumber: guestForm.idNumber
                            })}
                            style={{ cursor: 'pointer' }}
                          />
                        )}

                        {/* Hover action overlay */}
                        <div className="id-photo-overlay">
                          <button
                            type="button"
                            className="id-photo-btn"
                            title="Preview ID Fullscreen"
                            onClick={() => setLightboxPreview({
                              url: guestForm.idDocumentUrl,
                              title: `${primaryNameDisplay || 'Primary Guest'} - ID Document`,
                              idNumber: guestForm.idNumber
                            })}
                          >
                            <Eye size={15} color="#1E293B" />
                          </button>

                          {!isLocked && (
                            <>
                              <button
                                type="button"
                                className="id-photo-btn"
                                title="Change ID Photo"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload size={15} color="#2563EB" />
                              </button>
                              <button
                                type="button"
                                className="id-photo-btn delete"
                                title="Delete ID Photo"
                                onClick={(e) => handleRemoveIdPhoto(e, 'primary')}
                              >
                                <Trash2 size={15} color="#EF4444" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* ID Uploaded Status Badge */}
                        <div className="id-photo-badge">
                          <CheckCircle2 size={11} color="#10B981" />
                          <span>ID Uploaded</span>
                        </div>
                      </div>
                    ) : (
                      <label
                        className={`edit-res-upload-box ${isLocked ? 'disabled' : ''} ${isUploadingId ? 'uploading' : ''}`}
                        style={isLocked ? { cursor: 'not-allowed', opacity: 0.65 } : {}}
                      >
                        {isUploadingId ? (
                          <>
                            <Loader2 size={24} className="animate-spin" color="#2563EB" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={22} color="#2563EB" />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>
                              {isLocked ? (isCancelled ? 'ID Upload Locked' : isNoShow ? 'ID Upload Locked' : 'ID Upload Locked') : '+ Upload ID Photo'}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500 }}>
                              JPG, PNG or PDF
                            </span>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          disabled={isLocked || isUploadingId}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleIdFileUpload(file, 'primary');
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Right fields */}
                  <div>
                    <div className="edit-res-form-grid-2">
                      <div className="edit-res-field">
                        <label>ID Number</label>
                        <input
                          type="text"
                          className="edit-res-input"
                          value={guestForm.idNumber}
                          disabled={isLocked}
                          readOnly={isLocked}
                          onChange={(e) => setGuestForm({ ...guestForm, idNumber: e.target.value })}
                        />
                      </div>

                      <div className="edit-res-field">
                        <label>ID Type</label>
                        <select
                          className="edit-res-select"
                          value={guestForm.idType}
                          disabled={isLocked}
                          onChange={(e) => setGuestForm({ ...guestForm, idType: e.target.value })}
                        >
                          <option value="Aadhaar Card">Aadhaar Card</option>
                          <option value="Passport">Passport</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Voter ID">Voter ID</option>
                        </select>
                      </div>
                    </div>

                    <div className="edit-res-form-grid-2">
                      <div className="edit-res-field">
                        <label>Issuing Country</label>
                        <CountrySelect
                          value={guestForm.issuingCountry}
                          disabled={isLocked}
                          placeholder="Select country"
                          onChange={(val) => setGuestForm({ ...guestForm, issuingCountry: val })}
                        />
                      </div>

                      <div className="edit-res-field">
                        <label>Issuing City</label>
                        <SearchableSelect
                          value={guestForm.issuingCity}
                          options={cityOptions}
                          disabled={isLocked}
                          placeholder="Select City"
                          searchPlaceholder="Search City..."
                          allowCustom={true}
                          onChange={(val) => setGuestForm({ ...guestForm, issuingCity: val })}
                        />
                      </div>
                    </div>

                    <div className="edit-res-form-grid-2">
                      <div className="edit-res-field">
                        <label>Expiry Date</label>
                        <CustomDatePicker
                          value={guestForm.expiryDate}
                          disabled={isLocked}
                          placeholder="Select date"
                          minYear={2020}
                          maxYear={2045}
                          onChange={(val) => setGuestForm({ ...guestForm, expiryDate: val })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="edit-res-cform-btn"
                  onClick={() => alert('C Form (Police Verification Inquiry) exported.')}
                >
                  <FileText size={15} />
                  <span>C Form (Police Inquiry)</span>
                </button>
              </div>

              {/* Bottom Save Action */}
              <div className="edit-res-bottom-save-bar">
                {isLocked ? (
                  <button
                    className="edit-res-save-btn disabled"
                    disabled
                    style={{ background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
                    title={isCancelled ? "Reservation is cancelled and locked" : isNoShow ? "Reservation is no-show and locked" : "Reservation is checked out and locked"}
                  >
                    {isCancelled ? 'Locked (Cancelled)' : isNoShow ? 'Locked (No-Show)' : 'Locked (Checked Out)'}
                  </button>
                ) : (
                  <button className="edit-res-save-btn" onClick={handleSaveAll}>
                    Save
                  </button>
                )}
              </div>
            </>
          ))}

          {/* TAB 2: BOOKING DETAILS */}
          {activeTab === 'booking' && (
            <>
              {/* Card 1: Billing Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Billing Information</h3>
                <p className="edit-res-section-subtitle">Details about payment and invoicing for this booking.</p>

                <div className="edit-res-form-grid-2">
                  <div className="edit-res-field">
                    <label>Bill To <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.billTo}
                      disabled={isLocked}
                      onChange={(e) => setBookingForm({ ...bookingForm, billTo: e.target.value })}
                    >
                      <option value="Guest">Guest</option>
                      <option value="Company">Company</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>Select Company</label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.company}
                      disabled={isLocked}
                      onChange={(e) => setBookingForm({ ...bookingForm, company: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="tcs">Tata Consultancy Services</option>
                      <option value="infosys">Infosys Limited</option>
                    </select>
                  </div>
                </div>

                <div className="edit-res-form-grid-2">
                  <div className="edit-res-field">
                    <label>Guest GSTIN</label>
                    <input
                      type="text"
                      className="edit-res-input"
                      placeholder="Enter Guest GSTIN"
                      value={bookingForm.guestGstin}
                      disabled={isLocked}
                      readOnly={isLocked}
                      onChange={(e) => setBookingForm({ ...bookingForm, guestGstin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Source Information */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Source Information</h3>
                <p className="edit-res-section-subtitle">Information about the booking source and marketing details.</p>

                <div className="edit-res-form-grid-2">
                  <div className="edit-res-field">
                    <label>Market Segments <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.marketSegment}
                      disabled={isLocked}
                      onChange={(e) => setBookingForm({ ...bookingForm, marketSegment: e.target.value })}
                    >
                      <option value="corporate">corporate</option>
                      <option value="fit">FIT</option>
                      <option value="leisure">Leisure</option>
                      <option value="group">Group</option>
                    </select>
                  </div>

                  <div className="edit-res-field">
                    <label>Booking Source <span className="required-star">*</span></label>
                    <select
                      className="edit-res-select"
                      value={bookingForm.bookingSource}
                      disabled={isLocked}
                      onChange={(e) => setBookingForm({ ...bookingForm, bookingSource: e.target.value })}
                    >
                      <option value="walk-in">walk-in</option>
                      <option value="ota">OTA</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 3: Special Requests */}
              <div className="edit-res-section-card">
                <h3 className="edit-res-section-title">Special Requests</h3>
                <p className="edit-res-section-subtitle">Special requests and guest preferences for this reservation.</p>

                <div className="edit-res-field">
                  <textarea
                    rows={4}
                    className="edit-res-textarea"
                    placeholder="Enter special requests (e.g. extra bed, late check-in)..."
                    value={bookingForm.specialRequests}
                    maxLength={100}
                    disabled={isLocked}
                    readOnly={isLocked}
                    onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    <span>Reservation-level request</span>
                    <span>{bookingForm.specialRequests.length}/100</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="edit-res-bottom-save-bar">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: isLocked ? '#94a3b8' : '#334155', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bookingForm.applyToAllRooms}
                    disabled={isLocked}
                    onChange={(e) => setBookingForm({ ...bookingForm, applyToAllRooms: e.target.checked })}
                  />
                  <span>Apply to all rooms</span>
                </label>

                {isLocked ? (
                  <button
                    className="edit-res-save-btn disabled"
                    disabled
                    style={{ background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }}
                    title={isCancelled ? "Reservation is cancelled and locked" : isNoShow ? "Reservation is no-show and locked" : "Reservation is checked out and locked"}
                  >
                    {isCancelled ? 'Locked (Cancelled)' : isNoShow ? 'Locked (No-Show)' : 'Locked (Checked Out)'}
                  </button>
                ) : (
                  <button className="edit-res-save-btn" onClick={handleSaveAll}>
                    Save Changes
                  </button>
                )}
              </div>
            </>
          )}

          {/* TAB 3: FOLIO OPERATIONS */}
          {activeTab === 'folio' && (
            <div className="edit-res-section-card">
              <div className="edit-res-folio-top-bar">
                <div className="edit-res-folio-stats">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Charges</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2563eb' }}>₹{totalCharges}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Paid</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#059669' }}>₹{totalPaid}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Outstanding</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#dc2626' }}>₹{outstanding}</span>
                  </div>
                </div>

                <div className="edit-res-folio-actions">
                  {isLocked ? (
                    <div className="edit-res-folio-locked-badge">
                      <ShieldCheck size={16} />
                      <span>{isCancelled ? 'Folio Cancelled & Locked (Read-Only)' : isNoShow ? 'Folio No-Show & Locked (Read-Only)' : 'Folio Closed & Finalized (Read-Only)'}</span>
                    </div>
                  ) : (
                    <>
                      {/* Step 3.2: Add Charge */}
                      <button className="btn-folio-add-charge" onClick={() => setShowAddChargeModal(true)}>
                        <Plus size={14} />
                        <span>Add Charge</span>
                      </button>

                      {/* Step 3.3: Add Payment */}
                      <button className="btn-folio-outline" onClick={() => setShowAddPaymentModal(true)}>
                        <CreditCard size={14} />
                        <span>Add Payment</span>
                      </button>

                      {/* Settle Folio Quick Action */}
                      <button
                        className="btn-folio-outline"
                        onClick={() => {
                          if (Number(outstanding) <= 0) {
                            alert('Folio is already fully settled.');
                            return;
                          }
                          pmsStore.addFolioPayment(currentRes.id, {
                            type: 'Settlement',
                            paymentMethod: 'CASH',
                            amount: outstanding,
                            description: 'Full Balance Settlement'
                          });
                          setFolioVersion(v => v + 1);
                          alert('Folio balance settled in full.');
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Settle Folio</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="edit-res-table-wrap">
                <table className="edit-res-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category / Particulars</th>
                      <th>Description</th>
                      <th>Receipt / Ref</th>
                      <th>Direction</th>
                      <th>Amount</th>
                      <th>Tax</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folioTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                          No transactions posted on this folio yet. Use "Add Charge" above.
                        </td>
                      </tr>
                    ) : (
                      folioTransactions.map((tx) => (
                        <tr key={tx.id} style={{ background: tx.isVoided ? '#fef2f2' : undefined }}>
                          <td>{tx.date}</td>
                          <td style={{ fontWeight: 600 }}>
                            {tx.category || tx.particulars}
                            {tx.isVoided && (
                              <span className="badge-voided">VOIDED</span>
                            )}
                          </td>
                          <td>
                            <div>{tx.description}</div>
                            {tx.isVoided && tx.voidReason && (
                              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontStyle: 'italic', marginTop: '2px' }}>
                                Void Reason: "{tx.voidReason}"
                              </div>
                            )}
                          </td>
                          <td style={{ color: '#64748b' }}>{tx.receiptNumber || tx.reference || '-'}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: tx.isVoided ? '#f1f5f9' : (tx.direction === 'Credit' ? '#ecfdf5' : '#f8fafc'),
                              color: tx.isVoided ? '#94a3b8' : (tx.direction === 'Credit' ? '#059669' : '#334155')
                            }}>
                              {tx.direction}
                            </span>
                          </td>
                          <td style={{
                            fontWeight: 700,
                            color: tx.isVoided ? '#94a3b8' : (tx.direction === 'Credit' ? '#059669' : '#0f172a'),
                            textDecoration: tx.isVoided ? 'line-through' : 'none'
                          }}>
                            ₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ color: '#64748b' }}>
                            {tx.tax ? `₹${Number(tx.tax).toFixed(2)}` : '-'}
                          </td>
                          <td>
                            {/* Step 3.4: Void Payment button */}
                            {isLocked ? (
                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>{isCancelled || isNoShow ? 'Locked' : 'Finalized'}</span>
                            ) : tx.direction === 'Credit' && !tx.isVoided ? (
                              <button
                                className="btn-void-tx"
                                onClick={() => setVoidModalTx(tx)}
                                title="Void this payment transaction"
                              >
                                <Ban size={12} />
                                <span>Void Payment</span>
                              </button>
                            ) : tx.isVoided ? (
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>Voided</span>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ROOM CHARGES */}
          {activeTab === 'charges' && (
            <div className="edit-res-section-card">
              {!isLocked && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
                  <button
                    className="btn-folio-outline"
                    style={{ color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff' }}
                    onClick={() => alert('Room tariff updated based on rate plan: ₹' + (currentRes.ratePerNight || 2500))}
                  >
                    Update Details
                  </button>
                </div>
              )}

              <div className="edit-res-table-wrap">
                <table className="edit-res-table">
                  <thead>
                    <tr>
                      <th>Stay</th>
                      <th>Room</th>
                      <th>Rate Plan</th>
                      <th>Pax (A/C)</th>
                      <th>Charge</th>
                      <th>Tax</th>
                      <th>Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomChargesList.map((rc, idx) => (
                      <tr key={idx}>
                        <td>{rc.stay}</td>
                        <td style={{ fontWeight: 600 }}>{rc.room}</td>
                        <td>{rc.ratePlan}</td>
                        <td>{rc.pax}</td>
                        <td>₹{rc.charge}</td>
                        <td>₹{rc.tax}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{rc.netAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="edit-res-section-card">
              <div className="edit-res-timeline-container">
                <div className="edit-res-timeline-date-badge">
                  Front-Desk Activity Log
                </div>

                {auditTimeline.map((item) => (
                  <div key={item.id} className="edit-res-timeline-card">
                    <div className="edit-res-timeline-node-circle" style={{ borderColor: item.color, color: item.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        {item.icon}
                      </span>
                    </div>

                    <div className="edit-res-timeline-header">
                      <div>
                        <div className="edit-res-timeline-title">{item.title}</div>
                        <div className="edit-res-timeline-time">{item.time}</div>
                      </div>
                      <div className="edit-res-timeline-author-badge">
                        <User size={12} />
                        <span>{item.author}</span>
                      </div>
                    </div>

                    <div className="edit-res-timeline-body">
                      {item.renderBody()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Charges Modal (Exact OTAL PMS Specification & Design) */}
      <AddChargeModal
        isOpen={showAddChargeModal}
        reservation={currentRes}
        folio={currentFolio}
        onClose={() => setShowAddChargeModal(false)}
        onConfirmCharge={(chargeData) => {
          const payload = {
            category: chargeData.category,
            receiptNumber: chargeData.receiptNumber,
            amount: chargeData.amount,
            description: chargeData.description
          };
          if (onAddFolioCharge) {
            onAddFolioCharge(currentRes.id, payload);
          } else {
            pmsStore.addFolioCharge(currentRes.id, payload);
          }
          setFolioVersion((v) => v + 1);
        }}
      />


      {/* Add Payment Modal (Exact OTAL PMS Specification & Design) */}
      <AddPaymentModal
        isOpen={showAddPaymentModal}
        reservation={currentRes}
        folio={currentFolio}
        onClose={() => setShowAddPaymentModal(false)}
        onConfirmPayment={(paymentData) => {
          const payload = {
            folioId: paymentData.folioId,
            type: paymentData.type,
            paymentMethod: paymentData.paymentMethod,
            amount: paymentData.amount,
            description: paymentData.description,
            reference: paymentData.receiptNumber || paymentData.reference
          };
          if (onAddFolioPayment) {
            onAddFolioPayment(currentRes.id, payload);
          } else {
            pmsStore.addFolioPayment(currentRes.id, payload);
          }
          setFolioVersion((v) => v + 1);
        }}
      />


      {/* Guest Check-In Details Modal (Step 2) */}
      <GuestCheckInModal
        isOpen={showCheckInModal}
        reservation={currentRes}
        rooms={rooms}
        onClose={() => setShowCheckInModal(false)}
        onAssignRoom={(resId, assignedRoomId) => {
          pmsStore.assignRoom(resId, assignedRoomId);
          setFolioVersion(v => v + 1);
          if (onAssignRoom) onAssignRoom(resId, assignedRoomId);
        }}
        onConfirmCheckIn={(resId, assignedRoomId) => {
          pmsStore.checkInReservation(resId, assignedRoomId);
          setShowCheckInModal(false);
          setFolioVersion(v => v + 1);
          if (onCheckIn) onCheckIn(resId, assignedRoomId);
        }}
      />

      {/* Guest Check-Out Details Modal (Step 4) */}
      <GuestCheckOutModal
        isOpen={showCheckOutModal}
        reservation={currentRes}
        onClose={() => setShowCheckOutModal(false)}
        onQuickSettle={(resId, method) => {
          pmsStore.addFolioPayment(resId, {
            type: 'Settlement',
            paymentMethod: method,
            amount: currentRes.balanceDue
          });
          setFolioVersion(v => v + 1);
        }}
        onConfirmCheckOut={(resId) => {
          pmsStore.checkOutReservation(resId);
          setShowCheckOutModal(false);
          setFolioVersion(v => v + 1);
          if (onCheckOut) onCheckOut(resId);
        }}
      />

      {/* Void Payment Modal (Step 3.4) */}
      <VoidPaymentModal
        isOpen={!!voidModalTx}
        transaction={voidModalTx}
        onClose={() => setVoidModalTx(null)}
        onConfirmVoid={handleConfirmVoidPayment}
      />

      {/* Lightbox Modal for ID Document Preview */}
      {lightboxPreview && (
        <div
          className="id-lightbox-overlay"
          onClick={() => setLightboxPreview(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="id-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="#2563EB" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>
                    {lightboxPreview.title || 'ID Document'}
                  </h4>
                  {lightboxPreview.idNumber && (
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      ID Number: {lightboxPreview.idNumber}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}
                title="Close"
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', minHeight: '320px', maxHeight: '65vh', overflow: 'auto' }}>
              {lightboxPreview.url.startsWith('data:application/pdf') || lightboxPreview.url.endsWith('.pdf') ? (
                <iframe
                  src={lightboxPreview.url}
                  title="PDF Document Preview"
                  style={{ width: '100%', height: '480px', border: 'none', backgroundColor: '#FFFFFF', borderRadius: '6px' }}
                />
              ) : (
                <img
                  src={lightboxPreview.url}
                  alt="Full ID Document"
                  style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <a
                href={lightboxPreview.url}
                download={lightboxPreview.title ? `${lightboxPreview.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg` : 'guest_id_document.jpg'}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <Download size={14} />
                <span>Open / Download</span>
              </a>

              <button
                type="button"
                onClick={() => setLightboxPreview(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

