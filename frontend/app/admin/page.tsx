"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { adminApi, AdminUser, Event } from "@/lib/api"
import UserEventCard from "@/components/user-event-card"
import { eventApi } from "@/lib/api"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (authLoading || !user) return;

    if (user.role !== 'admin') {
      router.push("/");
      return;
    }

    fetchData();
  }, [isAuthenticated, authLoading, user, router, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const response = await adminApi.getAllUsers();
        if (response.success && response.data?.users) {
          setUsers(response.data.users);
        } else {
          setError('Failed to load users');
        }
      } else {
        const response = await adminApi.getAllEvents();
        if (response.success && response.data?.events) {
          setEvents(response.data.events);
        } else {
          setError('Failed to load events');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      setDeletingId(eventId);
      const response = await eventApi.deleteEvent(eventId);
      if (response.success) {
        setEvents(events.filter(e => e.id !== eventId));
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and events</p>
        </div>

        {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
          <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users ({users.length})
          </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Events ({events.length})
              </button>
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
          </div>
        )}

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : activeTab === 'users' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets
                    </th>
                </tr>
              </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone || 'No phone'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user._count.events}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user._count.tickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-gray-600">All events in the system</p>
              </div>
              {events.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600">No events found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
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
        </div>
      </div>
    </main>
  )
}
