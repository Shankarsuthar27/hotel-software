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
  MY_TEAM: '/my-team',
  ACCEPT_INVITE: '/accept-invite',
  PERMISSIONS: '/permissions',
  PROPERTIES: '/properties',
  PROPERTIES_ALL: '/properties/all',
  PROPERTIES_MEAL_PLANS: '/properties/meal-plans',
  PROPERTIES_ROOMS: '/properties/rooms',
  PROPERTIES_RATE_PLANS: '/properties/rate-plans',
  PROPERTIES_BUSINESS_ACCOUNT: '/properties/business-account',
  PROPERTIES_MARKET_SEGMENT: '/properties/market-segment',
  PROPERTIES_TAX_SERVICES: '/properties/tax-services',
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

  // 10. Accept Invitation: /accept-invite
  if (cleanPath === '/accept-invite') {
    return {
      type: 'ACCEPT_INVITE',
      tab: 'accept-invite',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 11. My Team: /my-team or /team
  if (cleanPath === '/my-team' || cleanPath === '/team') {
    return {
      type: 'MY_TEAM',
      tab: 'myteam',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 12. Team Permissions: /permissions or /users
  if (cleanPath === '/permissions' || cleanPath === '/users') {
    return {
      type: 'PERMISSIONS',
      tab: 'permissions',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 13. Property Settings: /settings
  if (cleanPath === '/settings') {
    return {
      type: 'SETTINGS',
      tab: 'settings',
      pathname: cleanPath,
      search,
      queryParams,
      params: {}
    };
  }

  // 14. Properties and sub-routes: /properties/*
  if (cleanPath === '/properties' || cleanPath.startsWith('/properties/')) {
    let subtab = 'all';
    if (cleanPath === '/properties/meal-plans') subtab = 'meal-plans';
    else if (cleanPath === '/properties/rooms') subtab = 'rooms';
    else if (cleanPath === '/properties/rate-plans') subtab = 'rate-plans';
    else if (cleanPath === '/properties/business-account') subtab = 'business-account';
    else if (cleanPath === '/properties/market-segment') subtab = 'market-segment';
    else if (cleanPath === '/properties/tax-services') subtab = 'tax-services';
    else if (cleanPath === '/properties/all') subtab = 'all';

    return {
      type: 'PROPERTIES',
      tab: 'properties',
      subtab,
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
