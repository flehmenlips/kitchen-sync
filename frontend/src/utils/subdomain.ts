/**
 * Subdomain utilities for restaurant-specific routing
 */

/**
 * Extract subdomain from current hostname
 * @returns subdomain or null if on main domain
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In development, check for subdomain in query params
    const params = new URLSearchParams(window.location.search);
    return params.get('restaurant') || null;
  }
  
  // Handle production domains
  const parts = hostname.split('.');
  
  // Check if we have a subdomain (e.g., coqauvin.kitchensync.restaurant)
  if (parts.length >= 3) {
    // First part is the subdomain
    return parts[0];
  }
  
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
 * Build a restaurant subdomain URL
 */
export function buildRestaurantUrl(slug: string): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${window.location.port}/customer?restaurant=${slug}`;
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