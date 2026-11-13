import React, { useState, useEffect, useRef } from 'react';
import './add-charge-modal.css';
import {
  X,
  PlusCircle,
  ChevronDown,
  Search
} from 'lucide-react';

const CHARGE_CATEGORIES = [
  'Room (Room Rent / Accommodation)',
  'Extra Bed (Extra Bed Charges)',
  'Extra Guest (Extra Guest Charges)',
  'Early Check-In (Early Check-In)',
  'Late Check-Out (Late Check-Out)',
  'Service (General Guest Services)',
  'Laundry (Laundry Services)',
  'Penalty (Damage / Policy Charges)',
  'Other (Misc Services)',
  'Restaurant (Restaurant / Dining)',
  'Food & Beverage (Dining / Room Service)',
  'Spa (Spa & Wellness)',
  'Minibar (Room Minibar Consumables)',
  'Banquet (Events & Function Hall)'
];

export default function AddChargeModal({
  isOpen,
  onClose,
  reservation = {},
  folio = {},
  onConfirmCharge
}) {
  if (!isOpen) return null;

  const guestTitle = reservation.primaryGuest?.title || '';
  const firstName = reservation.primaryGuest?.firstName || '';
  const lastName = reservation.primaryGuest?.lastName || '';
  const rawGuestName = reservation.primaryGuest?.name || `${guestTitle} ${firstName} ${lastName}`.trim() || reservation.guestName || 'mr shankar suthar';

  const guestFullNameLower = rawGuestName.toLowerCase();
  const folioNumber = folio.folioNumber || reservation.folioId || 'FOL_1';
  const roomNumber = reservation.roomNumber || (reservation.assignedRoomId ? reservation.assignedRoomId.replace('rm_', '') : '102');

  // Form State
  const [selectedFolio, setSelectedFolio] = useState(folioNumber);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(roomNumber);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const dropdownRef = useRef(null);

  // Close category dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolio(folioNumber);
      setSelectedRoomNumber(roomNumber);
      setReceiptNumber('');
      setSelectedCategory('');
      setIsCategoryDropdownOpen(false);
      setCategorySearch('');
      setAmount('');
      setDescription('');
    }
  }, [isOpen, folioNumber, roomNumber]);

  const filteredCategories = CHARGE_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert('Please select a charge category.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount greater than 0.00');
      return;
    }

    if (onConfirmCharge) {
      onConfirmCharge({
        folioId: selectedFolio,
        roomNumber: selectedRoomNumber,
        receiptNumber: receiptNumber.trim(),
        reference: receiptNumber.trim() || '-',
        category: selectedCategory,
        particulars: selectedCategory.split(' (')[0] || selectedCategory,
        amount: numAmount,
        description: description.trim() || selectedCategory
      });
    }

    onClose();
  };

  const isFormSubmittable = selectedCategory && parseFloat(amount) > 0;

  return (
    <div className="add-charge-backdrop" onClick={onClose}>
      <div className="add-charge-dialog" onClick={(e) => e.stopPropagation()}>
        {/* 1. Header */}
        <div className="add-charge-header">
          <div className="add-charge-header-left">
            <div className="add-charge-icon-bubble">
              {/* Money bag / pouch icon matching screenshot */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 7h7l1.5 2.5H7L8.5 7z" />
                <path d="M5 11.5c0-1.5 1-2.5 2.5-2.5h9c1.5 0 2.5 1 2.5 2.5v1c0 4.5-3 7.5-7 7.5s-7-3-7-7.5v-1z" />
                <circle cx="12" cy="14" r="1.8" />
              </svg>
            </div>
            <div className="add-charge-title-group">
              <h3 className="add-charge-title">Add Charges</h3>
              <p className="add-charge-subtitle">
                Adding to folio:{' '}
                <span className="add-charge-guest-highlight">{guestFullNameLower}</span>
              </p>
            </div>
          </div>

          <button className="add-charge-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* 2. Form */}
        <form onSubmit={handleSubmit} className="add-charge-form">
          {/* Field 1: Folio */}
          <div className="add-charge-field-group">
            <label className="add-charge-label">
              Folio<span className="add-charge-required">*</span>
            </label>
            <div className="add-charge-select-wrap">
              <select
                className="add-charge-select"
                value={selectedFolio}
                onChange={(e) => setSelectedFolio(e.target.value)}
              >
                <option value={folioNumber}>
                  {folioNumber} - {guestFullNameLower}
                </option>
              </select>
              <ChevronDown size={16} className="add-charge-chevron" />
            </div>
          </div>

          {/* Field 2: Room Number */}
          <div className="add-charge-field-group">
            <label className="add-charge-label">Room Number</label>
            <div className="add-charge-select-wrap">
              <select
                className="add-charge-select"
                value={selectedRoomNumber}
                onChange={(e) => setSelectedRoomNumber(e.target.value)}
              >
                <option value={selectedRoomNumber}>{selectedRoomNumber}</option>
              </select>
              <ChevronDown size={16} className="add-charge-chevron" />
            </div>
          </div>

          {/* Field 3: Rec/Vou # */}
          <div className="add-charge-field-group">
            <label className="add-charge-label">Rec/Vou #</label>
            <input
              type="text"
              className="add-charge-input"
              placeholder="Enter receipt/voucher number"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
            />
          </div>

          {/* Field 4: Category (Searchable Dropdown matching screenshots 2, 3, 4) */}
          <div className="add-charge-field-group" ref={dropdownRef}>
            <label className="add-charge-label">
              Category<span className="add-charge-required">*</span>
            </label>
            <div className="add-charge-select-wrap">
              <button
                type="button"
                className={`add-charge-category-trigger ${isCategoryDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                {selectedCategory ? (
                  <span className="selected-value">{selectedCategory}</span>
                ) : (
                  <span className="placeholder">Select category</span>
                )}
              </button>
              <ChevronDown
                size={16}
                className={`add-charge-chevron ${isCategoryDropdownOpen ? 'open' : ''}`}
              />

              {/* Expandable Searchable Dropdown List */}
              {isCategoryDropdownOpen && (
                <div className="add-charge-dropdown-menu">
                  <div className="add-charge-search-wrap">
                    <Search size={14} className="add-charge-search-icon" />
                    <input
                      type="text"
                      className="add-charge-search-input"
                      placeholder="Search category..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="add-charge-categories-list">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat, idx) => (
                        <div
                          key={idx}
                          className={`add-charge-category-item ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryDropdownOpen(false);
                            setCategorySearch('');
                          }}
                        >
                          {cat}
                        </div>
                      ))
                    ) : (
                      <div className="add-charge-empty">No category found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Field 5: Amount */}
          <div className="add-charge-field-group">
            <label className="add-charge-label">
              Amount<span className="add-charge-required">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="add-charge-input"
              placeholder="0.00"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Field 6: Description */}
          <div className="add-charge-field-group">
            <label className="add-charge-label">Description</label>
            <textarea
              rows={2}
              className="add-charge-textarea"
              placeholder="Enter additional details... (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 3. Footer Actions */}
          <div className="add-charge-footer">
            <button
              type="button"
              className="add-charge-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`add-charge-btn-submit ${isFormSubmittable ? 'active' : ''}`}
            >
              <PlusCircle size={16} strokeWidth={2.2} />
              <span>Add Charge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
