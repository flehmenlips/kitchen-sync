/**
 * Subdomain utilities for restaurant-specific routing
 */

/**
 * Extract subdomain from current hostname
 * @returns subdomain or null if on main domain
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  console.log('[Subdomain Detection] Hostname:', hostname);
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In development, check for subdomain in query params
    const params = new URLSearchParams(window.location.search);
    const subdomain = params.get('restaurant') || null;
    console.log('[Subdomain Detection] Dev mode subdomain:', subdomain);
    return subdomain;
  }
  
  // Handle production domains
  const parts = hostname.split('.');
  console.log('[Subdomain Detection] Hostname parts:', parts);
  
  // Check if we have a subdomain (e.g., coqauvin.kitchensync.restaurant)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Exclude main app subdomains
    if (subdomain === 'app' || subdomain === 'www' || subdomain === 'admin' || subdomain === 'platform-admin' || subdomain.startsWith('kitchen-sync-app')) {
      console.log('[Subdomain Detection] Main app subdomain, treating as main domain');
      return null;
    }
    
    // First part is the restaurant subdomain
    console.log('[Subdomain Detection] Found restaurant subdomain:', subdomain);
    return subdomain;
  }
  
  console.log('[Subdomain Detection] No subdomain found');
  return null;
}

/**
 * Check if current domain is a restaurant subdomain
 */
export function isRestaurantSubdomain(): boolean {
  return getSubdomain() !== null;
}

/**
 * Get the main app URL (without subdomain)
 */
export function getMainAppUrl(): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Handle localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${window.location.port}`;
  }
  
  // Remove subdomain if present
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    // Remove first part (subdomain)
    const mainDomain = parts.slice(1).join('.');
    return `${protocol}//${mainDomain}`;
  }
  
  return `${protocol}//${hostname}`;
}

/**
 * Build a restaurant subdomain URL with clean URLs (no /customer prefix)
 */
export function buildRestaurantUrl(slug: string): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In development, use clean URL with restaurant query parameter
    return `${protocol}//${hostname}:${window.location.port}/?restaurant=${slug}`;
  }
  
  // Handle production
  const parts = hostname.split('.');
  let baseDomain: string;
  
  if (parts.length >= 3) {
    // Already on a subdomain, replace it
    baseDomain = parts.slice(1).join('.');
  } else {
    // On main domain
    baseDomain = hostname;
  }
  
  return `${protocol}//${slug}.${baseDomain}`;
}

/**
 * Build a restaurant page URL with clean paths
 */
export function buildRestaurantPageUrl(slug: string, path: string = ''): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Remove leading slash from path for consistency
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In development, use clean URL structure with restaurant query parameter
    const port = window.location.port ? `:${window.location.port}` : '';
    const fullPath = cleanPath ? `/${cleanPath}` : '/';
    return `${protocol}//${hostname}${port}${fullPath}?restaurant=${slug}`;
  }
  
  // Handle production
  const parts = hostname.split('.');
  let baseDomain: string;
  
  if (parts.length >= 3) {
    // Already on a subdomain, replace it
    baseDomain = parts.slice(1).join('.');
  } else {
    // On main domain
    baseDomain = hostname;
  }
  
  // Build clean restaurant URL without /customer prefix
  const fullPath = cleanPath ? `/${cleanPath}` : '';
  return `${protocol}//${slug}.${baseDomain}${fullPath}`;
}

/**
 * Build conditional customer portal URLs based on subdomain context
 * - On restaurant subdomains: clean URLs like '/menu'
 * - On main domain: legacy URLs like '/customer/menu'
 */
export function buildCustomerUrl(path: string = ''): string {
  const subdomain = getSubdomain();
  const isRestaurantSubdomain = Boolean(subdomain);
  const hostname = window.location.hostname;
  
  // Remove leading slash from path for consistency
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (isRestaurantSubdomain) {
    // Restaurant subdomain: use clean URLs
    const basePath = cleanPath ? `/${cleanPath}` : '/';
    
    // In development mode (localhost), preserve the restaurant query parameter
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return basePath + `?restaurant=${subdomain}`;
    } else {
      // In production, just return the clean path (subdomain handles restaurant context)
      return basePath;
    }
  } else {
    // Main domain: use legacy /customer prefix
    return cleanPath ? `/customer/${cleanPath}` : '/customer';
  }
}

/**
 * Get restaurant slug from current context
 */
export function getCurrentRestaurantSlug(): string | null {
  // First check subdomain
  const subdomain = getSubdomain();
  if (subdomain) return subdomain;
  
  // Then check URL path (for backward compatibility)
  const pathMatch = window.location.pathname.match(/^\/restaurant\/([^\/]+)/);
  if (pathMatch) return pathMatch[1];
  
  return null;
} 