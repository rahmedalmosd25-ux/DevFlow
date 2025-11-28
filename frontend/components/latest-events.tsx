'use client';

import { useEffect, useState } from "react";
import EventCard from "./event-card";
import { eventApi, Event } from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LatestEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventApi.getPublishedEvents();
        if (response.success && response.data?.events) {
          // Get only the latest 6 events
          const latestEvents = response.data.events.slice(0, 6);
          setEvents(latestEvents);
        } else {
          setError('Failed to load events');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section className="bg-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Loading latest events...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="bg-white px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">No events available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Events</h2>
          <Link href="/events">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              View All Events
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

