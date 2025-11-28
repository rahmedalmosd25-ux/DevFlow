export interface EventResponse {
  success: boolean;
  message: string;
  data?: {
    events?: Event[];
    event?: Event;
    count?: number;
  };
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dateTime: Date;
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

export interface CreateEventRequest {
  title: string;
  description?: string;
  dateTime: string; // ISO date string
  location: string;
  image?: string;
  category: 'Party' | 'Games' | 'Traveling' | 'Hiking' | 'Conference' | 'Festival';
  status?: 'drafted' | 'published';
  quantity: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  dateTime?: string; // ISO date string
  location?: string;
  image?: string;
  category?: 'Party' | 'Games' | 'Traveling' | 'Hiking' | 'Conference' | 'Festival';
  status?: 'drafted' | 'published';
  quantity?: number;
}

