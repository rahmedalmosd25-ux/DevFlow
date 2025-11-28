'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { Event, eventApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil, Trash2, Users, Ticket, ChevronDown, ChevronUp } from "lucide-react";

interface UserEventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  deleting?: boolean;
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

export default function UserEventCard({ event, onDelete, deleting = false }: UserEventCardProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);

  useEffect(() => {
    // Fetch ticket count on mount
    fetchTicketCount();
  }, [event.id]);

  useEffect(() => {
    if (showAttendees && tickets.length === 0 && !ticketsLoading) {
      fetchEventTickets();
    }
  }, [showAttendees]);

  const fetchTicketCount = async () => {
    try {
      const response = await eventApi.getEventTickets(event.id);
      if (response.success && response.data?.tickets) {
        const count = response.data.tickets.length;
        setTicketCount(count);
        // If attendees are already shown, also set tickets
        if (showAttendees) {
          setTickets(response.data.tickets);
        }
      }
    } catch (err: any) {
      console.error('Error fetching ticket count:', err);
    }
  };

  const fetchEventTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await eventApi.getEventTickets(event.id);
      if (response.success && response.data?.tickets) {
        setTickets(response.data.tickets);
        setTicketCount(response.data.tickets.length);
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleDelete = () => {
    onDelete(event.id);
  };

  const bookedCount = tickets.length > 0 ? tickets.length : ticketCount;
  const remainingTickets = event.quantity - bookedCount;

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
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
            event.status === 'published' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            {event.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>

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
          <span className="text-xs text-gray-500">
            {event.quantity} spots
          </span>
        </div>

        {/* Ticket Stats */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Ticket className="w-4 h-4 text-orange-500" />
              <span className="font-semibold">Tickets:</span>
            </div>
            <div className="text-sm font-bold text-gray-900">
              {bookedCount} / {event.quantity} booked
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold">Remaining:</span>
            </div>
            <div className={`text-sm font-bold ${
              remainingTickets > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {remainingTickets} available
            </div>
          </div>
        </div>

        {/* View Attendees Button */}
        {bookedCount > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              setShowAttendees(!showAttendees);
              if (!showAttendees && tickets.length === 0) {
                fetchEventTickets();
              }
            }}
            className="w-full mb-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{showAttendees ? 'Hide' : 'View'} Attendees ({bookedCount})</span>
            {showAttendees ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Attendees List */}
        {showAttendees && (
          <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-white max-h-64 overflow-y-auto">
            {ticketsLoading ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Loading attendees...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">No attendees yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-2 bg-gray-50 rounded-md border border-gray-100"
                  >
                    <p className="font-semibold text-sm text-gray-900">{ticket.user.name}</p>
                    <p className="text-xs text-gray-600">{ticket.user.email}</p>
                    {ticket.user.phone && (
                      <p className="text-xs text-gray-500">{ticket.user.phone}</p>
                    )}
                    {ticket.checkIn && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Checked In
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/edit-event/${event.id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center justify-center gap-2"
              title="Edit event"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </Link>
          <Button 
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
            title="Delete event"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

