// Ensure API_BASE_URL always ends with /api
const getApiBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE_URL = getApiBaseUrl();

export interface SignUpRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
    };
    token: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

// Get user from localStorage
export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Set user in localStorage
export const setUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

// Auth API functions
export const authApi = {
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
    }

    return response;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      await apiRequest<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if the API call fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      removeToken();
      removeUser();
    }

    return { success: true, message: 'Logged out successfully' };
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setUser(response.data.user);
    }

    return response;
  },
};

// Event types
export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dateTime: string;
  location: string;
  image: string | null;
  category: string;
  status: string;
  quantity: number;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EventResponse {
  success: boolean;
  message: string;
  data?: {
    events?: Event[];
    event?: Event;
    count?: number;
  };
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  image?: string;
  category: 'Party' | 'Games' | 'Traveling' | 'Hiking' | 'Conference' | 'Festival';
  status?: 'drafted' | 'published';
  quantity: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  dateTime?: string;
  location?: string;
  image?: string;
  category?: 'Party' | 'Games' | 'Traveling' | 'Hiking' | 'Conference' | 'Festival';
  status?: 'drafted' | 'published';
  quantity?: number;
}

// Event API functions
export const eventApi = {
  getPublishedEvents: async (): Promise<EventResponse> => {
    return apiRequest<EventResponse>('/events/published', {
      method: 'GET',
    });
  },

  getUserEvents: async (): Promise<EventResponse> => {
    return apiRequest<EventResponse>('/events/user', {
      method: 'GET',
    });
  },

  getEventById: async (id: string): Promise<EventResponse> => {
    return apiRequest<EventResponse>(`/events/${id}`, {
      method: 'GET',
    });
  },

  getEventTickets: async (eventId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      tickets: Array<{
        id: string;
        userId: string;
        eventId: string;
        checkIn: boolean;
        checkInAt: string | null;
        user: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
        };
      }>;
      count?: number;
    };
  }> => {
    // This endpoint doesn't require authentication, so we make a direct fetch
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  },

  createEvent: async (data: CreateEventRequest): Promise<EventResponse> => {
    return apiRequest<EventResponse>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: string, data: UpdateEventRequest): Promise<EventResponse> => {
    return apiRequest<EventResponse>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Upload API functions
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ success: boolean; message: string; data?: { imageUrl: string } }> => {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }

    return data;
  },
};

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  _count: {
    events: number;
    tickets: number;
  };
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data?: {
    users: AdminUser[];
    count?: number;
  };
}

export interface AdminEventsResponse {
  success: boolean;
  message: string;
  data?: {
    events: Event[];
    count?: number;
  };
}

// Admin API functions
export const adminApi = {
  getAllUsers: async (): Promise<AdminUsersResponse> => {
    return apiRequest<AdminUsersResponse>('/admin/users', {
      method: 'GET',
    });
  },

  getAllEvents: async (): Promise<AdminEventsResponse> => {
    return apiRequest<AdminEventsResponse>('/admin/events', {
      method: 'GET',
    });
  },
};

// Ticket types
export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  checkIn: boolean;
  checkInAt: string | null;
  event?: {
    id: string;
    title: string;
    dateTime: string;
    location: string;
    image: string | null;
    category: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TicketResponse {
  success: boolean;
  message: string;
  data?: {
    tickets?: Ticket[];
    ticket?: Ticket;
    count?: number;
  };
}

export interface QRCodeResponse {
  success: boolean;
  data?: {
    qrCode: string;
    ticket: {
      id: string;
      eventTitle: string;
      dateTime: string;
      location: string;
    };
  };
}

// Ticket API functions
export const ticketApi = {
  bookTicket: async (eventId: string): Promise<TicketResponse> => {
    return apiRequest<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  },

  getUserTickets: async (): Promise<TicketResponse> => {
    return apiRequest<TicketResponse>('/tickets/user', {
      method: 'GET',
    });
  },

  getTicketQRCode: async (ticketId: string): Promise<QRCodeResponse> => {
    return apiRequest<QRCodeResponse>(`/tickets/${ticketId}/qrcode`, {
      method: 'GET',
    });
  },

  downloadTicketPDF: async (ticketId: string): Promise<void> => {
    const token = getToken();
    const headers: Record<string, string> = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/pdf`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticketId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  cancelTicket: async (ticketId: string): Promise<TicketResponse> => {
    return apiRequest<TicketResponse>(`/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  },
};

