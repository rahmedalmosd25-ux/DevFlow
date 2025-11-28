"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { eventApi, Event, ticketApi, Ticket } from "@/lib/api"
import UserEventCard from "@/components/user-event-card"
import TicketCard from "@/components/ticket-card"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      fetchUserEvents();
      fetchUserTickets();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getUserEvents();
      if (response.success && response.data?.events) {
        setUserEvents(response.data.events);
      } else {
        setError('Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      console.error('Error fetching user events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await ticketApi.getUserTickets();
      if (response.success && response.data?.tickets) {
        setUserTickets(response.data.tickets);
      } else {
        setError('Failed to load tickets');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
      console.error('Error fetching user tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleTicketCancel = (ticketId: string) => {
    // Remove the cancelled ticket from the list
    setUserTickets(userTickets.filter(t => t.id !== ticketId));
  };

  const handleDelete = async (eventId: string) => {
    try {
      setDeletingId(eventId);
      const response = await eventApi.deleteEvent(eventId);
      if (response.success) {
        // Remove the event from the list
        setUserEvents(userEvents.filter(e => e.id !== eventId));
        toast.success('Event deleted successfully', {
          description: 'The event has been permanently removed.',
        });
      } else {
        const errorMsg = response.message || 'Failed to delete event';
        setError(errorMsg);
        toast.error('Failed to delete event', {
          description: errorMsg,
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete event';
      setError(errorMsg);
      toast.error('Failed to delete event', {
        description: errorMsg,
      });
      console.error('Error deleting event:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-12 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const publishedEvents = userEvents.filter(e => e.status === 'published');
  const draftedEvents = userEvents.filter(e => e.status === 'drafted');

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Profile Header */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-600">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-white">
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-900">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-lg opacity-90 mb-2">{user.email}</p>
              <p className="text-lg opacity-90 mb-2">
                {user.phone || "No phone number"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/edit-profile">
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{publishedEvents.length}</div>
            <p className="text-gray-700 font-medium">Published Events</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{draftedEvents.length}</div>
            <p className="text-gray-700 font-medium">Draft Events</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{userEvents.length}</div>
            <p className="text-gray-700 font-medium">Total Events</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Events ({userEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Tickets ({userTickets.length})
            </button>
          </nav>
        </div>

        {/* Your Events Tab */}
        {activeTab === 'events' && (
        <div>
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
            <Link href="/add-event">
              <Button className="bg-orange-500 hover:bg-orange-600">Add New Event</Button>
            </Link>
          </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading your events...</p>
              </div>
            ) : userEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-4">You haven't created any events yet.</p>
                <Link href="/add-event">
                  <Button className="bg-orange-500 hover:bg-orange-600">Create Your First Event</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map((event) => (
                  <UserEventCard 
                key={event.id}
                    event={event} 
                    onDelete={handleDelete}
                    deleting={deletingId === event.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Your Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Tickets</h2>
              <p className="text-gray-600">View and manage your event tickets</p>
                </div>

            {ticketsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading your tickets...</p>
                </div>
            ) : userTickets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-600 mb-4">You don't have any tickets yet.</p>
                <Link href="/events">
                  <Button className="bg-orange-500 hover:bg-orange-600">Browse Events</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onCancel={handleTicketCancel} />
            ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

