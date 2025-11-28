export interface TicketResponse {
  success: boolean;
  message: string;
  data?: {
    tickets?: Ticket[];
    ticket?: Ticket;
    count?: number;
  };
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  checkIn: boolean;
  checkInAt: Date | null;
  event?: {
    id: string;
    title: string;
    dateTime: Date;
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

export interface BookTicketRequest {
  eventId: string;
}

