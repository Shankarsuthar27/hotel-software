// Client-side HTML5 History Router for Hotel PMS
// Matches OTAL PMS Route Specifications: https://app.otalpms.com/...

import { useState, useEffect, useCallback } from 'react';

export const ROUTES = {
  DASHBOARD: '/dashboard',
  RESERVATIONS: '/reservations',
  RESERVATIONS_CREATE: '/reservations/create',
  RESERVATIONS_EDIT: (id) => `/reservations/${id}/edit`,
  CALENDAR: '/calendar',
  RATES: '/rates',
  HOUSEKEEPING: '/housekeeping',
  NIGHT_AUDIT: '/nightaudit',
  REPORTS: '/reports',
  GUESTS: '/guests',
  PERMISSIONS: '/permissions',
  PROPERTIES: '/properties',
  SETTINGS: '/settings'
};

/**
 * Parse the current browser URL into route type, params, and query params.
 */
export function parseRoute(pathname = window.location.pathname, search = window.location.search) {
  // Normalize pathname: remove trailing slashes (except root)
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  // Parse query string
  const searchParams = new URLSearchParams(search);
  const queryParams = {};
  for (const [key, value] of searchParams.entries()) {
    queryParams[key] = value;
  }

  // 1. Create Reservation: /reservations/create or /reservations/new
  if (cleanPath === '/reservations/create' || cleanPath === '/reservations/new') {
    return {
      type: 'RESERVATIONS_CREATE',
      tab: 'reservations',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 2. Edit Reservation: /reservations/:id/edit or /reservations/:id
  const editMatch = cleanPath.match(/^\/reservations\/([^/]+)(?:\/edit)?$/);
  if (editMatch && editMatch[1] && editMatch[1] !== 'create' && editMatch[1] !== 'new') {
    return {
      type: 'RESERVATIONS_EDIT',
      tab: 'reservations',
      pathname: cleanPath,
      search,
      queryParams,
      params: { id: editMatch[1] }
    };
  }

  // 3. Reservations List: /reservations
  if (cleanPath === '/reservations') {
    return {
      type: 'RESERVATIONS',
      tab: 'reservations',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 4. Calendar Tape Chart: /calendar or /tape-chart
  if (cleanPath === '/calendar' || cleanPath === '/tape-chart') {
    return {
      type: 'CALENDAR',
      tab: 'calendar',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 5. Rates & Inventory: /rates or /inventory
  if (cleanPath === '/rates' || cleanPath === '/inventory') {
    return {
      type: 'RATES',
      tab: 'rates',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 6. Housekeeping / Room View: /housekeeping or /rooms
  if (cleanPath === '/housekeeping' || cleanPath === '/rooms') {
    return {
      type: 'HOUSEKEEPING',
      tab: 'housekeeping',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 7. Night Audit: /nightaudit or /night-audit
  if (cleanPath === '/nightaudit' || cleanPath === '/night-audit') {
    return {
      type: 'NIGHT_AUDIT',
      tab: 'nightaudit',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 8. Reports: /reports
  if (cleanPath === '/reports') {
    return {
      type: 'REPORTS',
      tab: 'reports',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 9. Guests CRM: /guests or /crm
  if (cleanPath === '/guests' || cleanPath === '/crm') {
    return {
      type: 'GUESTS',
      tab: 'guests',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 10. Team Permissions: /permissions or /team or /users
  if (cleanPath === '/permissions' || cleanPath === '/team' || cleanPath === '/users') {
    return {
      type: 'PERMISSIONS',
      tab: 'permissions',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 11. Property Settings: /properties or /settings
  if (cleanPath === '/properties' || cleanPath === '/settings') {
    return {
      type: 'PROPERTIES',
      tab: 'properties',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // Default / Root / Dashboard: / or /dashboard
  return {
    type: 'DASHBOARD',
    tab: 'dashboard',
    pathname: cleanPath,
    search,
    queryParams,
    params: {}
  };
}

/**
 * Navigate to a specific path using HTML5 pushState/replaceState
 */
export function navigate(url, options = {}) {
  if (typeof window === 'undefined') return;

  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl === url && !options.force) {
    return;
  }

  if (options.replace) {
    window.history.replaceState(options.state || null, '', url);
  } else {
    window.history.pushState(options.state || null, '', url);
  }

  // Dispatch custom route change event for all listeners
  window.dispatchEvent(new CustomEvent('pms-route-change', {
    detail: { url, state: options.state }
  }));
}

/**
 * React Hook for routing
 */
export function useRouter() {
  const [route, setRoute] = useState(() => parseRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('pms-route-change', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('pms-route-change', handleRouteChange);
    };
  }, []);

  const goTo = useCallback((url, options) => {
    navigate(url, options);
  }, []);

  return {
    ...route,
    navigate: goTo,
    ROUTES
  };
}
