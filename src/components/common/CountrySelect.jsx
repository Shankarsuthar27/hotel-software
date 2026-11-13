import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Check } from 'lucide-react';
import './custom-picker.css';

export const COUNTRIES_LIST = [
  "Afghanistan",
  "Aland Islands",
  "Albania",
  "Algeria",
  "American Samoa",
  "Andorra",
  "Angola",
  "Anguilla",
  "Antarctica",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Bouvet Island",
  "Brazil",
  "British Indian Ocean Territory",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Cayman Islands",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Christmas Island",
  "Cocos (Keeling) Islands",
  "Colombia",
  "Comoros",
  "Congo",
  "Cook Islands",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Falkland Islands",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Gibraltar",
  "Greece",
  "Greenland",
  "Grenada",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guernsey",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Isle of Man",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jersey",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macao",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Montserrat",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Niue",
  "Norfolk Island",
  "North Korea",
  "North Macedonia",
  "Northern Mariana Islands",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Pitcairn",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Reunion",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Barthelemy",
  "Saint Helena",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Martin",
  "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Sint Maarten",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tokelau",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Turks and Caicos Islands",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Virgin Islands (British)",
  "Virgin Islands (U.S.)",
  "Wallis and Futuna",
  "Western Sahara",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];

export default function CountrySelect({
  value,
  onChange,
  placeholder = 'Select country',
  disabled = false,
  placement = 'auto'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [computedPlacement, setComputedPlacement] = useState('bottom');

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const activeItemRef = useRef(null);

  // Filter countries by search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return COUNTRIES_LIST;
    const term = searchTerm.toLowerCase().trim();
    return COUNTRIES_LIST.filter((c) => c.toLowerCase().includes(term));
  }, [searchTerm]);

  // Calculate top or bottom placement
  const calculatePlacement = () => {
    if (!containerRef.current) return;
    if (placement !== 'auto') {
      setComputedPlacement(placement);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 800;
    const popoverHeight = 280;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      setComputedPlacement('top');
    } else {
      setComputedPlacement('bottom');
    }
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      calculatePlacement();
      setSearchTerm('');
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        if (activeItemRef.current) {
          activeItemRef.current.scrollIntoView({ block: 'nearest' });
        }
      }, 50);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectCountry = (country) => {
    if (onChange) {
      onChange(country);
    }
    setIsOpen(false);
  };

  return (
    <div className="custom-picker-wrap" ref={containerRef}>
      {/* Trigger Button */}
      <div
        className={`custom-picker-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleOpen}
      >
        {value ? (
          <span className="custom-picker-value">{value}</span>
        ) : (
          <span className="custom-picker-placeholder">{placeholder}</span>
        )}
        {isOpen ? (
          <ChevronUp size={16} color="#64748b" style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0 }} />
        )}
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`custom-country-popover placement-${computedPlacement}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Input */}
          <div className="custom-country-search-wrap">
            <Search size={15} className="custom-country-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="custom-country-search-input"
              placeholder="Search Country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredCountries.length > 0) {
                  e.preventDefault();
                  handleSelectCountry(filteredCountries[0]);
                }
              }}
            />
          </div>

          {/* List of Countries */}
          <div className="custom-country-list">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = value?.toLowerCase() === c.toLowerCase();
                return (
                  <div
                    key={c}
                    ref={isSelected ? activeItemRef : null}
                    className={`custom-country-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectCountry(c)}
                  >
                    <span>{c}</span>
                    {isSelected && <Check size={14} color="#2563eb" strokeWidth={2.5} />}
                  </div>
                );
              })
            ) : (
              <div className="custom-country-empty">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

