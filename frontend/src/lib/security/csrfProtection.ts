'use client';

/**
 * CSRF Protection utilities for the frontend
 */

interface CSRFConfig {
  tokenName: string;
  headerName: string;
  cookieName: string;
  enabled: boolean;
}

class CSRFProtection {
  private config: CSRFConfig = {
    tokenName: '_token',
    headerName: 'X-CSRF-TOKEN',
    cookieName: 'XSRF-TOKEN',
    enabled: true
  };

  private token: string | null = null;

  constructor(config?: Partial<CSRFConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeToken();
  }

  /**
   * Initialize CSRF token from meta tag or cookie
   */
  private initializeToken(): void {
    if (typeof window === 'undefined') return;

    // Try to get token from meta tag first
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) {
      this.token = metaToken;
      return;
    }

    // Fallback to cookie
    this.token = this.getTokenFromCookie();
  }

  /**
   * Get CSRF token from cookie
   */
  private getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.config.cookieName) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Generate a new CSRF token
   */
  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get current CSRF token
   */
  public getToken(): string {
    if (!this.config.enabled) return '';
    
    if (!this.token) {
      this.token = this.generateToken();
      this.setTokenCookie();
    }
    
    return this.token;
  }

  /**
   * Set CSRF token in cookie
   */
  private setTokenCookie(): void {
    if (typeof document === 'undefined' || !this.token) return;

    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

    document.cookie = `${this.config.cookieName}=${encodeURIComponent(this.token)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
  }

  /**
   * Add CSRF token to request headers
   */
  public addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    if (!this.config.enabled) return headers;

    const token = this.getToken();
    if (token) {
      headers[this.config.headerName] = token;
    }

    return headers;
  }

  /**
   * Add CSRF token to form data
   */
  public addToFormData(formData: FormData): FormData {
    if (!this.config.enabled) return formData;

    const token = this.getToken();
    if (token) {
      formData.append(this.config.tokenName, token);
    }

    return formData;
  }

  /**
   * Add CSRF token to request body
   */
  public addToBody(body: any): any {
    if (!this.config.enabled) return body;

    const token = this.getToken();
    if (!token) return body;

    if (body instanceof FormData) {
      return this.addToFormData(body);
    }

    if (typeof body === 'object' && body !== null) {
      return {
        ...body,
        [this.config.tokenName]: token
      };
    }

    return body;
  }

  /**
   * Validate CSRF token
   */
  public validateToken(receivedToken: string): boolean {
    if (!this.config.enabled) return true;
    
    const currentToken = this.getToken();
    return currentToken === receivedToken;
  }

  /**
   * Refresh CSRF token
   */
  public refreshToken(): string {
    this.token = this.generateToken();
    this.setTokenCookie();
    return this.token;
  }

  /**
   * Enable/disable CSRF protection
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Check if CSRF protection is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

// Export utilities
export { CSRFProtection, csrfProtection };

/**
 * Hook for using CSRF protection in React components
 */
export function useCSRF() {
  return {
    getToken: () => csrfProtection.getToken(),
    addToHeaders: (headers: Record<string, string>) => csrfProtection.addToHeaders(headers),
    addToBody: (body: any) => csrfProtection.addToBody(body),
    refreshToken: () => csrfProtection.refreshToken(),
    isEnabled: () => csrfProtection.isEnabled()
  };
}

/**
 * Fetch wrapper with CSRF protection
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = csrfProtection.addToHeaders(options.headers as Record<string, string> || {});
  
  let body = options.body;
  if (body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options?.method?.toUpperCase() || 'GET')) {
    body = csrfProtection.addToBody(body);
    if (typeof body === 'object' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }
  }

  return fetch(url, {
    ...options,
    headers,
    body
  });
}

export default csrfProtection;
