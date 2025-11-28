'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Event, ticketApi, eventApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

interface EventCardProps {
  event: Event;
  onBooked?: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Party: 'bg-orange-500',
    Games: 'bg-cyan-500',
    Traveling: 'bg-blue-500',
    Hiking: 'bg-green-500',
    Conference: 'bg-purple-500',
    Festival: 'bg-pink-500',
  };
  return colors[category] || 'bg-gray-500';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function EventCard({ event, onBooked }: EventCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [ticketCount, setTicketCount] = useState(0);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [userHasTicket, setUserHasTicket] = useState(false);
  const [checkingUserTicket, setCheckingUserTicket] = useState(true);

  useEffect(() => {
    fetchTicketCount();
    if (isAuthenticated) {
      checkUserTicket();
    } else {
      setCheckingUserTicket(false);
    }
  }, [event.id, isAuthenticated]);

  const fetchTicketCount = async () => {
    try {
      setLoadingTickets(true);
      const response = await eventApi.getEventTickets(event.id);
      if (response.success && response.data?.tickets) {
        setTicketCount(response.data.tickets.length);
      }
    } catch (err: any) {
      console.error('Error fetching ticket count:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const checkUserTicket = async () => {
    try {
      setCheckingUserTicket(true);
      const response = await ticketApi.getUserTickets();
      if (response.success && response.data?.tickets) {
        const hasTicket = response.data.tickets.some(
          (ticket) => ticket.eventId === event.id
        );
        setUserHasTicket(hasTicket);
      }
    } catch (err: any) {
      console.error('Error checking user ticket:', err);
    } finally {
      setCheckingUserTicket(false);
  }
  };

  const handleBookTicket = async () => {
    if (!isAuthenticated) {
      setError("Please login to book a ticket");
      return;
    }

    if (userHasTicket) {
      setError("You already have a ticket for this event");
      return;
    }

    try {
      setBooking(true);
      setError("");
      await ticketApi.bookTicket(event.id);
      // Refresh ticket count and user ticket status after booking
      await Promise.all([fetchTicketCount(), checkUserTicket()]);
      if (onBooked) {
        onBooked();
      }
      toast.success("Ticket booked successfully!", {
        description: "Check your email for the ticket confirmation.",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to book ticket";
      setError(errorMessage);
      // If the error is about already having a ticket, update state
      if (errorMessage.includes("already have a ticket")) {
        setUserHasTicket(true);
      }
    } finally {
      setBooking(false);
    }
  };

  const remainingTickets = event.quantity - ticketCount;
  const isSoldOut = remainingTickets <= 0;
  const canBook = !userHasTicket && !isSoldOut && !loadingTickets && !checkingUserTicket;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {event.image ? (
          <Image 
            src={event.image} 
            alt={event.title} 
            fill 
            className="object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{event.title.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title - Clickable */}
        <Link href={`/events/${event.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-orange-500 cursor-pointer transition">
            {event.title}
          </h3>
        </Link>

        {/* Date and Location */}
        <p className="text-sm text-gray-600 font-medium mb-1">
          {formatDate(event.dateTime)}, {formatTime(event.dateTime)}
        </p>
        <p className="text-sm text-gray-600 mb-3">{event.location}</p>

        {/* Description */}
        {event.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{event.description}</p>
        )}

        {/* Category Badge and Quantity */}
        <div className="flex items-center justify-between mb-4">
          <span className={`${getCategoryColor(event.category)} text-white text-xs font-semibold px-3 py-1 rounded-md inline-block`}>
            {event.category}
          </span>
          {loadingTickets ? (
            <span className="text-xs text-gray-400">Loading...</span>
          ) : (
            <span className={`text-xs font-semibold ${
              isSoldOut ? 'text-red-600' : remainingTickets <= 5 ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {remainingTickets} / {event.quantity} remaining
            </span>
          )}
        </div>

        {/* User info if available */}
        {event.user && (
          <p className="text-xs text-gray-500 mb-4">By {event.user.name}</p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs">
            {error}
          </div>
        )}

        {/* Book Ticket Button */}
        {isAuthenticated && event.status === 'published' && (
          <>
            {userHasTicket ? (
              <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-sm font-semibold text-green-700 flex items-center justify-center gap-2">
                  <Ticket className="w-4 h-4" />
                  You already have a ticket for this event
                </p>
                <Link href="/profile" className="text-xs text-green-600 hover:text-green-800 underline mt-1 inline-block">
                  View your tickets
                </Link>
              </div>
            ) : (
              <Button
                onClick={handleBookTicket}
                disabled={booking || !canBook}
                className={`w-full flex items-center justify-center gap-2 ${
                  !canBook 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                {booking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : isSoldOut ? (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>Sold Out</span>
                  </>
                ) : checkingUserTicket ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>Book Ticket</span>
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {!isAuthenticated && event.status === 'published' && !isSoldOut && (
          <Link href="/login" className="block">
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2">
              <Ticket className="w-4 h-4" />
              <span>Login to Book</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
