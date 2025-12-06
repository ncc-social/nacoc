// Configuration for the application

// ROUTER_BASE is the URL prefix where the application is served (e.g., /ex-dashboard)
// It is distinct from the asset base URL (which might be /assets/nacoc/)
export const ROUTER_BASE = (typeof __ROUTER_BASE__ !== 'undefined')
    ? __ROUTER_BASE__
    : (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL);
