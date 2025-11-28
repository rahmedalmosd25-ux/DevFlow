'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import { eventApi, ticketApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Ticket, Users } from "lucide-react";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [userHasTicket, setUserHasTicket] = useState(false);
  const [checkingUserTicket, setCheckingUserTicket] = useState(true);

  const bookedCount = tickets.length;
  const remainingTickets = event ? event.quantity - bookedCount : 0;
  const isEventCreator = user && event && event.userId === user.id;

  useEffect(() => {
    fetchEvent();
    fetchEventTickets();
    if (isAuthenticated) {
      checkUserTicket();
    } else {
      setCheckingUserTicket(false);
    }
  }, [eventId, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const response = await eventApi.getEventById(eventId);
        if (response.success && response.data?.event) {
          setEvent(response.data.event);
        } else {
          setError('Failed to load event');
        }
      } else {
        // For non-authenticated users, try to get from published events
        const response = await eventApi.getPublishedEvents();
        if (response.success && response.data?.events) {
          const foundEvent = response.data.events.find(e => e.id === eventId);
          if (foundEvent) {
            setEvent(foundEvent);
          } else {
            setError('Event not found');
          }
        } else {
          setError('Failed to load event');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await eventApi.getEventTickets(eventId);
      if (response.success && response.data?.tickets) {
        setTickets(response.data.tickets);
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const checkUserTicket = async () => {
    try {
      setCheckingUserTicket(true);
      const response = await ticketApi.getUserTickets();
      if (response.success && response.data?.tickets) {
        const hasTicket = response.data.tickets.some(
          (ticket) => ticket.eventId === eventId
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
      router.push("/login");
      return;
    }

    if (userHasTicket) {
      toast.info("You already have a ticket for this event", {
        description: "You can view your tickets in your profile.",
      });
      return;
    }

    try {
      setBooking(true);
      await ticketApi.bookTicket(eventId);
      toast.success("Ticket booked successfully!", {
        description: "Check your email for the ticket confirmation.",
      });
      // Refresh tickets list and user ticket status
      await Promise.all([fetchEventTickets(), checkUserTicket()]);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to book ticket";
      if (errorMessage.includes("already have a ticket")) {
        toast.info("You already have a ticket for this event", {
          description: "You can view your tickets in your profile.",
        });
        setUserHasTicket(true);
      } else {
        toast.error("Failed to book ticket", {
          description: errorMessage,
        });
      }
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-12 text-center">
          <p className="text-gray-600">Loading event...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
              {error || "Event not found"}
            </div>
            <Button 
              onClick={() => router.push("/events")}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Back to Events
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            ← Back
          </Button>

          {/* Event Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            {/* Image */}
            <div className="relative h-64 w-full overflow-hidden">
              {event.image ? (
                <Image 
                  src={event.image} 
                  alt={event.title} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{event.title.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(event.dateTime)}, {formatTime(event.dateTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{event.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{event.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available Spots</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {remainingTickets} / {event.quantity}
                  </p>
                </div>
              </div>

              {/* Ticket Stats for Event Creator */}
              {isEventCreator && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-purple-600" />
                    Ticket Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 mb-1">{bookedCount}</p>
                      <p className="text-sm text-gray-600">Booked</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold mb-1 ${
                        remainingTickets > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {remainingTickets}
                      </p>
                      <p className="text-sm text-gray-600">Remaining</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 mb-1">{event.quantity}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>
                </div>
              )}

              {event.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}

              {/* Book Ticket Button */}
              {isAuthenticated && event.status === 'published' && (
                <>
                  {userHasTicket ? (
                    <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm font-semibold text-green-700 flex items-center justify-center gap-2 mb-2">
                        <Ticket className="w-5 h-5" />
                        You already have a ticket for this event
                      </p>
                      <Link href="/profile" className="text-sm text-green-600 hover:text-green-800 underline">
                        View your tickets
                      </Link>
                    </div>
                  ) : (
                    <Button
                      onClick={handleBookTicket}
                      disabled={booking || tickets.length >= event.quantity || checkingUserTicket}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {booking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Booking...
                        </>
                      ) : checkingUserTicket ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Checking...
                        </>
                      ) : tickets.length >= event.quantity ? (
                        "Sold Out"
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 mr-2" />
                          Book Ticket
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}

              {!isAuthenticated && event.status === 'published' && tickets.length < event.quantity && (
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Login to Book Ticket
                </Button>
              )}
            </div>
          </div>

          {/* Attendees Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">
                Attendees ({tickets.length})
              </h2>
            </div>

            {ticketsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading attendees...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No tickets booked yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{ticket.user.name}</p>
                      <p className="text-sm text-gray-600">{ticket.user.email}</p>
                      {ticket.user.phone && (
                        <p className="text-xs text-gray-500">{ticket.user.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {ticket.checkIn ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Checked In
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          Not Checked In
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

