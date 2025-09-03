const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(email: string, password: string, username: string, displayName?: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Profile methods
  async getProfile() {
    return this.request<any>('/profiles/me');
  }

  async updateProfile(profileData: any) {
    return this.request<any>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfilesForSwipe() {
    return this.request<any[]>('/profiles/swipe');
  }

  async getProfileById(userId: string) {
    return this.request<any>(`/profiles/${userId}`);
  }

  // Match methods
  async getMatches() {
    return this.request<any[]>('/matches');
  }

  async createSwipe(swipedUserId: string, isLike: boolean) {
    return this.request<{ isMatch: boolean }>('/matches/swipe', {
      method: 'POST',
      body: JSON.stringify({ swipedUserId, isLike }),
    });
  }

  // Message methods
  async getMessages(matchId: string) {
    return this.request<any[]>(`/messages/${matchId}`);
  }

  async sendMessage(matchId: string, content: string) {
    return this.request<any>(`/messages/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getMatchDetails(matchId: string) {
    return this.request<any>(`/messages/${matchId}/details`);
  }

  // Payment methods
  async createCheckout(productId: string, priceType: string) {
    return this.request<{ checkoutUrl: string; sessionId: string }>('/payments/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ productId, priceType }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);