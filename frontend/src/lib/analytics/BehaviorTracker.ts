import { logger } from '@/lib/logging/productionLogger';

export interface UserBehaviorEvent {
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'purchase' | 'search' | 'add_to_cart';
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  element?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface BehaviorPattern {
  userId?: string;
  sessionId: string;
  events: UserBehaviorEvent[];
  startTime: number;
  endTime: number;
  totalEvents: number;
  uniquePages: number;
  conversionEvents: number;
}

class BehaviorTracker {
  private events: UserBehaviorEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    this.isTracking = true;
    this.trackPageView();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.track({
        type: 'click',
        element: target.tagName.toLowerCase(),
        metadata: {
          className: target.className,
          id: target.id,
          text: target?.textContent?.slice(0, 100)
        }
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.track({
            type: 'scroll',
            value: scrollDepth,
            metadata: { depth: scrollDepth }
          });
        }
      }
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public track(event: Partial<UserBehaviorEvent>): void {
    if (!this.isTracking) return;

    const fullEvent: UserBehaviorEvent = {
      type: event.type || 'click',
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      ...event
    };

    this.events.push(fullEvent);
    this.sendToAnalytics(fullEvent);
  }

  public trackPageView(page?: string): void {
    this.track({
      type: 'page_view',
      page: page || (typeof window !== 'undefined' ? window.location.pathname : ''),
      metadata: {
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
      }
    });
  }

  public trackPurchase(orderId: string | number, items?: any[], metadata?: Record<string, any>): void {
    this.track({
      type: 'purchase',
      value: typeof orderId === 'string' ? 0 : orderId,
      metadata: { orderId, items, ...metadata }
    });
  }

  public trackAddToCart(productId: string, quantity: number, price?: number): void {
    this.track({
      type: 'add_to_cart',
      value: price || 0,
      metadata: { productId, quantity }
    });
  }

  public trackClick(element: string, metadata?: Record<string, any>): void {
    this.track({
      type: 'click',
      element,
      metadata
    });
  }

  public trackProductView(productId: string, metadata?: Record<string, any>): void {
    this.track({
      type: 'page_view',
      metadata: { productId, ...metadata }
    });
  }

  public trackRemoveFromCart(productId: string, quantity: number): void {
    this.track({
      type: 'click',
      metadata: { action: 'remove_from_cart', productId, quantity }
    });
  }

  public trackAddToWishlist(productId: string): void {
    this.track({
      type: 'click',
      metadata: { action: 'add_to_wishlist', productId }
    });
  }

  public trackCategoryView(categoryId: string, metadata?: Record<string, any>): void {
    this.track({
      type: 'page_view',
      metadata: { categoryId, ...metadata }
    });
  }

  public trackProducerView(producerId: string, metadata?: Record<string, any>): void {
    this.track({
      type: 'page_view',
      metadata: { producerId, ...metadata }
    });
  }

  public trackSearchClick(productId: string, query: string, position: number): void {
    this.track({
      type: 'click',
      metadata: { action: 'search_click', productId, query, position }
    });
  }

  public getSessionInfo(): BehaviorPattern {
    return this.getSessionData();
  }

  public trackSearch(query: string, results: number, metadata?: Record<string, any>): void {
    this.track({
      type: 'search',
      metadata: { query, results, ...metadata }
    });
  }

  private sendToAnalytics(event: UserBehaviorEvent): void {
    // In a real implementation, this would send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      logger.info('Analytics Event:', event);
    }

    // Example: Send to Google Analytics, Mixpanel, etc.
    // this.sendToGoogleAnalytics(event);
    // this.sendToMixpanel(event);
  }

  public getSessionData(): BehaviorPattern {
    const uniquePages = new Set(this.events.map(e => e.page)).size;
    const conversionEvents = this.events.filter(e => 
      ['purchase', 'form_submit', 'add_to_cart'].includes(e.type)
    ).length;

    return {
      userId: this.userId,
      sessionId: this.sessionId,
      events: [...this.events],
      startTime: this.events[0]?.timestamp || Date.now(),
      endTime: this.events[this.events.length - 1]?.timestamp || Date.now(),
      totalEvents: this.events.length,
      uniquePages,
      conversionEvents
    };
  }

  public clearSession(): void {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }

  public stopTracking(): void {
    this.isTracking = false;
  }

  public startTracking(): void {
    this.isTracking = true;
  }
}

// Export singleton instance
export const behaviorTracker = new BehaviorTracker();

export default BehaviorTracker;
